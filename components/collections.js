var fetch=fetch || {};
fetch.Stapes=fetch.Stapes || {}

fetch.Stapes.CollectionTile=Stapes.subclass({
	constructor: function($parent, manager, item) {
		this.item=item;
		this.manager=manager;
		this.$parent=$parent;
		var linkLength=40;

		item.modification_time=moment(item.modification_time).fromNow();
		
		var template=$("#collection-template").html();
		Mustache.parse(template);
		this.$el=$(Mustache.render(template, item));

		var self=this;
		this.$el.on("click", function() {
			var view=new fetch.Stapes.CollectionView(self.$parent, manager, self.item);
		});

		$parent.append(this.$el);	
	}
});

fetch.Stapes.CollectionItem=Stapes.subclass({
	constructor: function($parent, container, item) {
		this.item=item;
		if(this.item.title.length>100) {
			console.log("truncating title");
			this.item.display_title=this.item.title.substring(0, 100)+"..."
		} else {
			this.item.display_title=this.item.title;
		}
		var template=$("#collection-link-template").html();
		Mustache.parse(template);
		this.$el=$(Mustache.render(template, this.item));

		this.$actions=this.$el.find(".actions");
		this.$edit=this.$el.find(".edit");
		this.$delete=this.$el.find(".delete");
		this.$linkview=this.$el.find(".link-view");
		this.$linkedit=this.$el.find(".link-edit");
		this.$linktitle=this.$el.find('#link-title');
		this.$linksave=this.$el.find(".link-save");
		this.container=container;
		
		var self=this;
		this.$linkedit.hide();
		this.$actions.hide();
		this.$el.hover(function() { self.$actions.show(); }, function() { self.$actions.hide(); });

		this.$edit.on("click", function() {
			self.$linkview.hide();
			self.$linkedit.show();
		});

		this.$linksave.on("click", function() {
			var title=self.$linktitle.val();
			if(title!=undefined && title!="") {
				self.container.editItem(self.item.id, title);
				self.$linkview.find("a").html(title);
			}
			self.$linkview.show();
			self.$linkedit.hide();
		});

		this.$delete.on("click", function() {
			self.container.deleteItem(self.item.id);
			self.$el.remove();
		});
	
		$parent.append(this.$el);
	}
})

fetch.Stapes.CollectionView=Stapes.subclass({
	constructor: function($parent, manager, item) {
		this.manager=manager;
		this.set("loading", false);
		this.set("offset", 0);
		this.id=item.id;
		var template=$("#collection-details-template").html();
		Mustache.parse(template);
		this.$el=$(Mustache.render(template, item));
		this.$scroll=this.$el.find(".modal-body");
		this.$list=this.$el.find(".collection-link-container");
		this.$collectionview=this.$el.find(".collection-view");
		this.$collectionedit=this.$el.find(".collection-edit");
		this.$collectionactions=this.$el.find(".actions");
		this.$collectionname=this.$el.find('input[name="name"]');
		this.$collectionsave=this.$el.find(".collection-save");
		this.$edit=this.$el.find(".edit");
		this.$delete=this.$el.find(".delete");
		this.$status=new fetch.Stapes.StatusMessage(this.$el.find(".status"));
		console.log(this.$scroll);
	
		var self=this;
		this.$collectionedit.hide();

		this.$scroll.on("scroll", function() {
			if((self.$scroll.scrollTop()+self.$scroll.innerHeight())>=self.$scroll[0].scrollHeight) {
				self.loadCollectionItems();
			}
		});


		this.$edit.on("click", function() {
			self.$collectionview.hide();
			self.$collectionactions.hide();
			self.$collectionedit.show();
		});

		this.$collectionsave.on("click", function() {
			var name=self.$collectionname.val();
			if(name!=undefined && name!="") {
				self.editCollection(self.id, name);
			}
			self.$collectionview.show();
			self.$collectionactions.show();
			self.$collectionedit.hide();
		});

		this.$delete.on("click", function() {
			self.deleteCollection(self.id);
		});

		this.$el.on("hidden.bs.modal", function() {
			self.$el.remove();
		});
	
		$parent.append(this.$el);
		this.$el.modal('toggle');	

		this.loadCollectionItems();
	},
	refreshCollectionItems: function() {
		this.loadCollectionItems(true);	
	},
	loadCollectionItems: function(refresh) {
		var self=this;
		this.$status.working();
		var data = $.ajax({
			type: "GET",
			async: true,
			crossDomain: "true",
			url: fetch.conf.server + "/fetch/collections/"+this.id+"/items/",
			data: {
				limit: 20,
				offset: self.get("offset")
			},
			success: function(data) {
				if(refresh==true) {
					self.$list.empty();
					self.set("offset", 0);
				}
				if (!$.isEmptyObject(data.results)) {
					links=data.results;
					for(var i=0;i<links.length;i++) {
						var view=new fetch.Stapes.CollectionItem(self.$list, self, links[i]);
					}	
				} 
				self.set("loading", false);
				self.set("offset", self.get("offset")+20);
				self.$status.info("No links to show");
			},
			error: function(data) {
				self.emit("error", data);
				self.set("loading", false);
				self.$status.info("No links to show");
			}
		});
	},
	deleteCollection: function(item_id) {
		var self=this;
		var data = $.ajax({
			type: "DELETE",
			async: true,
			crossDomain: "true",
			url: fetch.conf.server + "/fetch/collections/"+this.id+"/",
			success: function(data) {
				self.$el.modal("toggle");
				self.manager.loadCollections();
			},
			error: function(data) {
			}
		});
	},
	editCollection: function(item_id, name) {
		var self=this;
		var data = $.ajax({
			type: "PATCH",
			async: true,
			crossDomain: "true",
			url: fetch.conf.server + "/fetch/collections/"+this.id+"/",
			data: {
				name: name
			},
			success: function(data) {
				self.$collectionview.html(name);
				self.manager.loadCollections();
			},
			error: function(data) {
			}
		});
	},
	deleteItem: function(item_id) {
		var self=this;
		var data = $.ajax({
			type: "DELETE",
			async: true,
			crossDomain: "true",
			url: fetch.conf.server + "/fetch/collections/"+this.id+"/items/"+item_id+"/",
			success: function(data) {
				self.manager.loadCollections();
			},
			error: function(data) {
			}
		});
	},
	editItem: function(item_id, title) {
		var self=this;
		var data = $.ajax({
			type: "PATCH",
			async: true,
			crossDomain: "true",
			url: fetch.conf.server + "/fetch/collections/"+this.id+"/items/"+item_id+"/",
			data: {
				title: title
			},
			success: function(data) {
			},
			error: function(data) {
			}
		});
	}
});

fetch.Stapes.CollectionManager=Stapes.subclass({
	constructor: function($element, collectioncreator) {
		this.$el=$element;
		this.$collectionlist=this.$el.find(".collection-container");
		this.collectioncreator=collectioncreator;
		this.set("loading", false);

		var self=this;
		this.collectioncreator.on("refresh", function() {
			self.loadCollections();
		});

		chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
			if(request.message=="collection.item.added") {
				self.loadCollections();
			}
		});
		
		this.loadCollections();
	},
	loadCollections: function() {
		if(this.get("loading"))
			return;
		this.set("loading", true);
		

		var self=this;
		var data = $.ajax({
			type: "GET",
			async: true,
			crossDomain: "true",
			url: fetch.conf.server + "/fetch/collections/",
			success: function(data) {
				chrome.runtime.sendMessage({
					message: "collection.update"
				});
				self.$el.find(".collection").remove();
				if (!$.isEmptyObject(data)) {
					collections=data;
					for(var i=0;i<collections.length;i++) {
						var view=new fetch.Stapes.CollectionTile(self.$collectionlist, self, collections[i]);
					}	
				} 

				self.set("loading", false);
			},
			error: function(data) {
				this.emit("error", data);
				this.set("loading", false);
			}
		});
	},	
	header: function($parent) {
		return undefined;
	}
});

fetch.Stapes.CollectionCreator=Stapes.subclass({
	constructor: function($element) {
		this.$el=$element;
		this.$name=this.$el.find('input[name="name"]');
		this.$status=new fetch.Stapes.StatusMessage(this.$el.find(".status"));
		this.collectionColor=undefined;
		
		var self=this;
		this.$el.find(".badge").on("click", function(e) {
			self.$el.find(".badge i").parent().html("&nbsp;");
			$(this).html('<i class="fa fa-check"></i>');
			self.collectionColor=self.rgb2hex($(this).css("background-color"));
		});

		this.$el.find(".create").on("click", function(e) {
			name=self.$name.val();
			if(name==undefined || name=="") {
				self.$status.error("Please enter a name for the collection");
				return;
			}	
			if(self.collectionColor==undefined) {
				self.$status.error("Please choose a color for the collection");
				return;
			}

			self.createCollection(name, self.collectionColor);
		});

		this.$el.find(".close").on("click", function() {
			self.$status.reset();
		});
	},
	rgb2hex: function(rgb) {
    	rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    	function hex(x) {
        	return ("0" + parseInt(x).toString(16)).slice(-2);
    	}
    	return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
	},
	createCollection: function(name, color) {
		fetch.activity.show();
		var self=this;
		var data = $.ajax({
			type: "POST",
			async: true,
			crossDomain: "true",
			url: fetch.conf.server + "/fetch/collections/",
			data: {
				name: name,
				color: color
			},
			success: function(data) {
				self.emit("refresh");
				self.$el.modal("toggle");
			},
			error: function(data) {
				self.$status.error(data);
				fetch.activity.hide();
			}
		});
	}
});

fetch.Stapes.CollectionContextMenu=Stapes.subclass({
	constructor: function() {
		this.initializeMenus();
		
		var self=this;
		chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
			if(request.message=="collection.update") {
				self.initializeMenus();
			}
		});
	},
	initializeMenus: function() {
		var self=this;
		var data = $.ajax({
			type: "GET",
			async: true,
			crossDomain: "true",
			url: fetch.conf.server + "/fetch/collections/",
			success: function(data) {
				if (!$.isEmptyObject(data)) {
					self.update(data);
				} 
			}
		});
	},
	update: function(collections) {
		chrome.contextMenus.removeAll();
		var self=this;
		for(var i=0;i<collections.length;i++) {
			chrome.contextMenus.create({
				id: "collection."+collections[i].id,
				title: "Add this page to "+collections[i].name,
				onclick: function(info, tab) {
					self.handleContextMenuClick(info, tab);
				}
			});
		}
	},
	handleContextMenuClick: function(info, tab) {
		collectioninfo=info.menuItemId.split(".");
		id=collectioninfo[1];
		console.log("menu item id: "+id);
		
		
		if(tab!=undefined) {
			if(tab.url!=undefined && tab.title!=undefined) {
				console.log("url: "+tab.url, "title: "+tab.title);
				this.addPageToCollection(id, tab.url, tab.title);
			}
		}
	},
	addPageToCollection: function(id, url, title) {
		var data = $.ajax({
			type: "POST",
			async: true,
			crossDomain: "true",
			url: fetch.conf.server + "/fetch/collections/"+id+"/items/",
			data: {
				url: url,
				title: title
			},
			success: function(data) {
				chrome.runtime.sendMessage({
					message: "collection.item.added"
				});
			},
			error: function(data) {
				console.log("Something went wrong");
			}
		});

	}
});
