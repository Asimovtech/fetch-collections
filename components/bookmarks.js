fetch.Stapes.BookmarksSyncManager=Stapes.subclass({
	constructor: function() {
		this.syncOld=false;
		this.enabled=false;

		var self=this;
		chrome.storage.local.get("bookmarksSync", function(items) {
			if(items.bookmarksSync==undefined) {	
				if(fetch.conf.debug)
					console.log("Bookmarks sync not enabled, listening for settings changes");

				self.enabled=false;
				self.syncOld=true;
				chrome.storage.onChanged.addListener(function(items, area) {
					if(area=="local" && items.bookmarksSync!=undefined && items.bookmarksSync.newValue==true) {
						if(fetch.conf.debug)
							console.log("Detected sync enable, enabling bookmarks sync");

						self.enabled=true;
						if(self.syncOld)
							self.syncOldBookmarks();
						self.syncNewBookmarks();
					}
				});
			} else {
				console.log("Enabling bookmarks sync");
				self.enabled=true;
				self.syncNewBookmarks();
			}
		});
	},
	processNode: function(node) {
		var self=this;
		if(node.children) {
			node.children.forEach(function(child) { self.processNode(child); });
		}

		if(node.url) 
			this.synclist.push(node);
	},
	bulkUpdate: function(pagelist) {
		console.log("page list contains "+pagelist.length+" objects");
		var user=fetch.user.get("userId");
		var obj=JSON.stringify({user:user, service: "BOOKMARKS", pages: pagelist});
		var data = $.ajax({
			type: "POST",
			async: true,
			crossDomain: "true",
			url: fetch.conf.server + "/fetch/v2/bulkupdate/",
			contentType: "application/json",
			dataType: 'json',
			data: obj,
			success: function(data) {
				var obj=JSON.parse(data);
				console.log(obj.task);
				chrome.storage.local.set({"bookmarksSyncTask":obj.task});
				chrome.runtime.sendMessage({task: obj.task});
			},
			error: function(data) {
				console.log("error "+data);
			}
		});
	},
	syncOldBookmarks: function() {
		this.synclist=[];	
		var self=this;
		chrome.bookmarks.getTree(function(itemTree){
    		itemTree.forEach(function(item) {
        		self.processNode(item);
    		});

			fetch.analytics.pushEvent("bookmarks-import", self.synclist.length);
			self.bulkUpdate(self.synclist);
		});
	},
	syncNewBookmarks: function() {
		var self=this;

		chrome.bookmarks.onCreated.addListener(function(id, bookmark) {
			if(bookmark.url) {
				if(fetch.conf.debug)
					console.log("Adding bookmark to Fetch: "+bookmark.title);
				var list=[];
				list.push(bookmark);
				self.bulkUpdate(list);		
			}
		});	

		chrome.bookmarks.onChanged.addListener(function(id, changeInfo) {
			chrome.bookmarks.get(id, function(results) {	
				if(results.length==0)
					return;
				bookmark=results[0];
				if(bookmark.url) {
					if(fetch.conf.debug)
						console.log("Updating Bookmark: "+bookmark.title);
					var list=[];
					list.push(bookmark);
					self.bulkUpdate(list);		
				}
			});
		});
	},
});

fetch.Stapes.BookmarksOptInHeader=Stapes.subclass({
	constructor: function($parent) {
		this.$header=$('<div><center>Click start to make all bookmarks on this browser searchable <button class="btn btn-success">Start</button></center></div>');
	
		self=this;
		this.$header.find("button").on("click", function() {
			chrome.storage.local.set({"bookmarksSync": true}, function(items) {
				if(fetch.conf.debug) {
					if(chrome.runtime.lastError==undefined) {
						self.$header.hide();
						console.log("bookmark sync enabled");
					} else {
						console.log("Couldn't set bookmarks sync");
					}	
				}
			});
		});

		$parent.append(this.$header);		

		chrome.runtime.onMessage.addListener(function(message) {
			if(message.task!=undefined)
				var header=new fetch.Stapes.BookmarksProgressHeader($parent, message.task);
		});
	},
});

fetch.Stapes.BookmarksProgressHeader=Stapes.subclass({
	constructor: function($parent, task) {
		this.task=task;
		var template=$("#bookmark-progress-header").html();
		Mustache.parse(template);
		this.$header=$(Mustache.render(template, {}));
		this.updateStatus();
		var self=this;
		this.statusTimer=setInterval(function() {
			self.updateStatus();
		}, 3000); // 1 minute per update

		$parent.prepend(this.$header);		
	},
	updateStatus: function() {
		var self=this;
		$.ajax({
			type: "POST",
			async: true,
			crossDomain: "true",
			url: fetch.conf.server + "/fetch/v2/taskstatus/",
			data: {
				task: this.task,
			},
			success: function(data) {
				data=JSON.parse(data);
				if(data.state=="SUCCESS") {
					self.$header.hide();
					clearInterval(self.statusTimer);
					chrome.storage.local.remove("bookmarksSyncTask");
				} 
				if(data.state=="PROGRESS") {
					var pending=data.total-data.current;
					var secs=pending*3;
					var timeinfo="";
					if(secs<60)
						timeinfo=secs+" seconds"
					else
						timeinfo=Math.ceil(secs/60.0)+" minutes"
					self.$header.find(".message").html("Your bookmarks will be imported in approximately <strong>"+timeinfo+"</strong>");
					var percentage=Math.ceil(data.current/data.total*100.0);
					self.$header.find(".progress-bar").css("width", percentage+"%");
					self.$header.find(".progress-bar").attr("aria-valuenow", percentage);
					self.$header.find(".progress-bar").html(percentage+"%");
				}
			},
			error: function(data) {
				console.log("error "+data);
			}
		});
	}
});

fetch.Stapes.BookmarksPage=Stapes.subclass({
	constructor: function(search_query) {
		this.set("loading", false);
		this.set("expand_links", false);
		this.set("search_query", search_query);
	},
	syncOldBookmarks: function() {
	},
	syncNewBookmarks: function() {
	},
	loadPage: function(page) {
		if(this.get("loading"))
			return;
		this.set("loading", true);
		var user=fetch.user.get("userId");

		fetch.activity.show();
		var self=this;
		var data = $.ajax({
			type: "POST",
			async: true,
			crossDomain: "true",
			url: fetch.conf.server + "/fetch/v2/sphinxsearch/",
			data: {
				user: user,
				query: self.get("search_query"),
				page: page,
				service: "BOOKMARKS"
			},
			success: function(data) {
				if (data) {
					data = $.parseJSON(data);
					if (!$.isEmptyObject(data.lPageItems)) {
						self.emit("items", data.lPageItems);
					} else {
						self.emit("items", []);
					}
				} else {
					self.emit("items", []);
				}
				self.set("loading", false);
				fetch.activity.hide();
			},
			error: function(data) {
				this.emit("error", data);
				this.set("loading", false);
				fetch.activity.hide();
			}
		});
	},	
	header: function($parent) {
		chrome.storage.local.get("bookmarksSync", function(items) {
			if(items.bookmarksSync==undefined) {
				return new fetch.Stapes.BookmarksOptInHeader($parent);
			}
		});
		chrome.storage.local.get("bookmarksSyncTask", function(items) {
			if(items.bookmarksSyncTask!=undefined) {
				return new fetch.Stapes.BookmarksProgressHeader($parent, items.bookmarksSyncTask);
			}
		});
	}
});


