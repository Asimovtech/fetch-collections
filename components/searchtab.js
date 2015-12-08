var fetch=fetch || {}

fetch.Stapes.SearchTabManager=Stapes.subclass({
	constructor: function($element) {
		this.items=[];
		this.set("page", 0);
		this.set("all_loaded", false);
		this.$el=$element;
		this.$scroll=this.$el.find("#top-links-view");
		this.$list=this.$scroll.find("#page-list");
		this.$search=this.$el.find("[name=search-query]");
		this.$submit=this.$el.find(".search-button");
		this.$servicetab=this.$el.find("#service-tab");
		this.currenttab="browser-history";


		var self=this;
		this.$scroll.on("scroll", function() {
			if((self.$scroll.scrollTop()+self.$scroll.innerHeight())>=self.$scroll[0].scrollHeight) {
				if(!self.get("all_loaded")) {
					self.set("page", self.get("page")+1);
					self.page_loader.loadPage(self.get("page"));
				}
			}
		});

		this.$search.on("keypress", function(e) {
			if(e.which=='13') {
				var search_query=self.$search.val();
				self.search(search_query);
				fetch.analytics.pushEvent("searched", search_query);
			}
		});

		this.$submit.on("click", function() {
			var search_query=self.$search.val();
			self.search(search_query);
			fetch.analytics.pushEvent("searched", search_query);
		});

		this.$servicetab.find("a[data-toggle=tab]").on("click", function(e) {
			var target=$(e.target).attr("data-target");
			var search_query=self.$search.val();
			self.currenttab=target;
			self.search(search_query);
		});

		if(fetch.url.get("q")!=null) {
			var search_query=fetch.url.get("q");
			this.$search.val(search_query);
			self.search(search_query);
		}			
	},
	search: function(search_query) {
		fetch.recentsearches.addSearch(search_query);
		if(this.currenttab=="browser-history")
				this.setPageLoader(new fetch.Stapes.SearchPage(search_query));
		if(this.currenttab=="bookmarks")
				this.setPageLoader(new fetch.Stapes.BookmarksPage(search_query));
	},
	loadFrontPage: function() {
		this.setPageLoader(new fetch.Stapes.FrontPage());
	},
	setPageLoader: function(loader) {
		this.page_loader=loader;
		this.items=[];
		this.set("page",0);
		this.set("all_loaded", false);
		
		this.$list.empty();
		this.page_loader=loader;
		
		var header=this.page_loader.header(this.$list);
		var self=this;
		if(header!=undefined) {
			header.on("nav_back", function() {
				self.setPageLoader(new fetch.Stapes.FrontPage());
			});
		}

		this.page_loader.loadPage(this.get("page"));	

		var self=this;
		this.page_loader.on("items", function(items) {
			self.appendItems(items);			
		});

		this.page_loader.loadPage(this.get("page"));
	},
	appendItems: function(items) {
		if(items.length==0) {
			this.$list.append($('<div id="empty-result"><center>No posts to show.</center></div'));	
			this.set("all_loaded", true);
			return;
		}
		for(var i=0;i<items.length;i++) {
			items[i].count=this.items.length+i;
			var cell=new fetch.Stapes.SearchResult(this.$list, items[i]);
			if(!this.page_loader.get("expand_links"))
				cell.hideExpandLinks();
			var self=this;
			cell.on("expand_links", function(item) {
				self.setPageLoader(new fetch.Stapes.DomainPage(item));
			});
		}
		this.items=this.items.concat(items);
	}
});

fetch.Stapes.Settings=Stapes.subclass({
	constructor: function($element, tab) {
		this.$el=$element;
		
		var self=this;
		this.$el.on('click', function() {
			var myleft = (screen.width / 2) - (550 / 2);
			var mytop = (screen.height / 2) - (300 / 2);

			chrome.windows.create({
				url: "settings.html"+tab,
				type: "panel",
				width: 550,
				height: 300,
				"left": myleft,
				"top": mytop
			});
		});
	}
});

fetch.Stapes.ToggleFetch=Stapes.subclass({
	constructor: function($element) {
		this.$el=$element;
		
		var self=this;

		this.$el.on('click', function() {
			chrome.runtime.sendMessage({
				message: "toggle"
			}, function(response) {});

			if (self.$el.text() == "Pause Fetch") {
				self.$el.text("Resume Fetch");
			} else if (self.$el.text() == "Resume Fetch") {
				self.$el.text("Pause Fetch");
			}
		});

		chrome.runtime.sendMessage({
			message: "queryState"
		}, function(response) {
			if (response.state == true) {
				self.$el.text("Resume Fetch");
			} else {
				self.$el.text("Pause Fetch");
			}
		});
	}
});

fetch.Stapes.Authentication=Stapes.subclass({
	constructor: function($authpanel, $mainpanel) {
		this.$el=$authpanel;
		this.$mainpage=$mainpanel;
		this.$logout=$mainpanel.find(".logout");
		this.$signin_elements=this.$el.find(".signin-group");
		this.$signup_elements=this.$el.find(".signup-group");
		this.$resetpassword_elements=this.$el.find(".reset-password-group");
		this.$newuser=this.$el.find("[name=new-user]")
		this.$resetpassword=this.$el.find(".reset-password-link");
		this.signinHandler=new fetch.Stapes.Signin(this.$el);
		this.signupHandler=new fetch.Stapes.Signup(this.$el);
		this.resetPasswordHandler=new fetch.Stapes.ResetPassword(this.$el);

		var self=this;
		fetch.user.on("user", function() {	
			self.$el.hide();
			self.$mainpage.show();	
		});	

		fetch.user.on("no_user", function() {
			self.$el.show();
			self.$mainpage.hide();	
		});

		this.$newuser.on("change", function() {
			if(self.$newuser.is(":checked")) {
				self.showSignUp();
			} else {
				self.showSignIn();
			}
		});

		this.$resetpassword.on("click", function() {
			self.showResetPassword();
		});

		this.$logout.on("click", function() {
			chrome.storage.sync.set({
				'userId': ""
			}, function() {});
			fetch.user.setUserId("");
		});

		
		this.showSignIn();
	}, 
	showSignIn: function() {
		this.$signup_elements.hide();
		this.$resetpassword_elements.hide();
		this.$signin_elements.show();
		this.signinHandler.reset();
	},
	showSignUp: function() {
		this.$resetpassword_elements.hide();
		this.$signin_elements.hide();
		this.$signup_elements.show();
		this.signupHandler.reset();
	},

	showResetPassword: function() {
		this.$signin_elements.hide();
		this.$signup_elements.hide();
		this.$resetpassword_elements.show();
		this.resetPasswordHandler.reset();
	}

});

