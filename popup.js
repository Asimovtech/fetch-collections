var fetch=fetch || {}

fetch.Stapes.PopupManager=Stapes.subclass({
	constructor: function($element) {
		this.set("page", 0);
		this.set("all_loaded", false);
		this.$el=$element;
		this.$scroll=this.$el.find("#top-links-view");
		this.$list=this.$scroll.find("#page-list");
		this.$search=this.$el.find("[name=search-query]");
		this.$submit=this.$el.find(".search-button");

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
				self.setPageLoader(new fetch.Stapes.SearchPage(search_query));	
			}
		});

		this.$submit.on("click", function() {
			var search_query=self.$search.val();
			self.setPageLoader(new fetch.Stapes.SearchPage(search_query));	
		});

		this.setPageLoader(new fetch.Stapes.FrontPage());
	},
	setPageLoader: function(loader) {
		this.page_loader=loader;
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
			console.log("all loaded");
			this.$list.append($('<div id="empty-result"><center>No posts to show.</center></div'));	
			this.set("all_loaded", true);
			return;
		}
		for(var i=0;i<items.length;i++) {
			var cell=new fetch.Stapes.SearchResult(this.$list, items[i]);
			if(!this.page_loader.get("expand_links"))
				cell.hideExpandLinks();
			var self=this;
			cell.on("expand_links", function(item) {
				self.setPageLoader(new fetch.Stapes.DomainPage(item));
			});
		}
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
	}
});

fetch.Stapes.Authentication=Stapes.subclass({
	constructor: function($element) {
		
	}
});

$(document).ready(function() {
	fetch.activity=new fetch.Stapes.Activity($("#loadmoreajaxloader"));
	fetch.user=new fetch.Stapes.User();
	$('#register-signin-panel').hide();
	$('#extension-main-content').show();
	fetch.user.on("user", function() {
		fetch.popup=new fetch.Stapes.PopupManager($("#extension-main-content"));
	});
	fetch.togglefetch=new fetch.Stapes.ToggleFetch($("#toggle-fetch-btn"));
	fetch.settings=new fetch.Stapes.Settings($("#settings"), "");
	fetch.support=new fetch.Stapes.Settings($("#support"), "#contact");
});

// Load Google Analytics
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-69577643-1']);
_gaq.push(['_trackPageview']);

(function() {
	var ga = document.createElement('script');
	ga.type = 'text/javascript';
	ga.async = true;
	ga.src = 'https://ssl.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0];
	s.parentNode.insertBefore(ga, s);
})();

var i = 0;
var count = 1;
var userId;
var doSearch = false;
var baseUrls = {};
var loadedBaseUrls = {};
var collated = false;
var settingsWindowId = -1;
var ladingNewPage = false;
var linkLength = 40;

function isEmail(email) {
	var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	return regex.test(email);
}

document.addEventListener('DOMContentLoaded', function() {
	chrome.runtime.sendMessage({
		message: "queryState"
	}, function(response) {
		if (response.state == true) {
			$('#toggle-fetch-btn').text("Resume Fetch");
		} else {
			$('#toggle-fetch-btn').text("Pause Fetch");
		}
	});

	$("#fetch-signin-btn").on('click', function() {
		var email = $('#signin-inputEmail').val();
		var password = $('#signin-inputPassword').val();
		var validPassword = true;
		var validEmail = true;
		if (!isEmail(email) || email == "") {
			$('#signin-inputEmail').parent().addClass('has-error');
			return false;
		}

		if (password.length < 6) {
			$('#signin-inputPassword').parent().addClass('has-error');
			return false;
		}

		passhash = CryptoJS.MD5(password);
		var data = $.ajax({
			type: "PUT",
			async: true,
			url: serverUrl + "fetch/v2/login/",
			crossDomain: "true",
			data: {
				email: email,
				password: passhash.toString()
			},

			success: function(data) {
				if (data) {
					data = $.parseJSON(data);
					userId = data['userId'];
					chrome.storage.sync.set({
						'userId': userId
					}, function() {});
					$('#register-signin-panel').hide();
					$('#extension-main-content').show();
					getUsersPages("");
				} else {
					return false;
				}


			}
		}).fail(function(data) {
			$('#resetpassworderrors').addClass('text-danger');
			$('#resetpassworderrors').html("Login failed, " + JSON.parse(data.responseText));
			return false;
		});


	});

	$("#fetch-signup-btn").on('click', function() {
		var email = $('#signin-inputEmail').val();
		var password = $('#signin-inputPassword').val();
		var confirmPassword = $('#signup-confirmInputPassword').val();
		if (!isEmail(email)) {
			$('#signin-inputEmail').parent().addClass('has-error');
			return false;
		}
		if (password.length < 6) {
			$('#signin-inputPassword').parent().addClass('has-error');
			return false;
		}
		if (password != confirmPassword) {
			$('#signup-confirmInputPassword').parent().addClass('has-error');
			$('#signin-inputPassword').parent().addClass('has-error');
			return false;
		}
		passhash = CryptoJS.MD5(password);
		var data = $.ajax({
			type: "POST",
			async: false,
			url: serverUrl + "fetch/v2/register/",
			crossDomain: "true",
			data: {
				email: email,
				password: passhash.toString()
			},

			success: function(data) {
				if (data) {
					data = $.parseJSON(data);
					userId = data['userId'];
					chrome.storage.sync.set({
						'userId': userId
					}, function() {});
					$('#register-signin-panel').hide();
					$('#extension-main-content').show();
					getUsersPages("");
				}

			}

		}).fail(function(data) {
			$('#resetpassworderrors').addClass('text-danger');
			$('#resetpassworderrors').html("Sign up failed, " + JSON.parse(data.responseText));
			return false;
		});
	});


	$('#resetpasswordlink').click(function() {
		$('.signupgroup').hide();
		$('.signingroup').hide();
		$('.resetpasswordgroup').show();
	});

	$('#reset-password-btn').click(function() {
		var email = $('#signin-inputEmail').val();
		if (!isEmail(email)) {
			$('#signin-inputEmail').parent().addClass('has-error');
			return false;
		}
		var data = $.ajax({
			type: "POST",
			async: false,
			url: serverUrl + "fetch/v2/forgotpassword/",
			crossDomain: "true",
			data: {
				email: email,
			},
			success: function(data) {
				$('#resetpassworderrors').addClass('text-success');
				$('#resetpassworderrors').html(data);
			},
			error: function(data) {
				$('#resetpassworderrors').addClass('text-danger');
				$('#resetpassworderrors').html("Unable to reset password");
			}
		});
	});


	$("#logout-btn").on('click', function() {

		chrome.storage.sync.set({
			'userId': ""
		}, function() {});

		$('#extension-main-content').hide();
		/*$("#mytabs").remove();
		var tabs = "<ul id='mytabs' class='nav nav-tabs' role='tablist'>  <li id='fetch-signin' role='presentation' class='active'><a role='tab' data-toggle='tab'  aria-expanded='false'>Signin</a></li>  <li id='fetch-register' role='presentation' class=''>    <a role='tab' data-toggle='tab'  aria-expanded='true'>Signup</a></li>  </ul>"
		$("#register-signin-panel").prepend(tabs);
		  $('#mytabs li#fetch-register').click(function(e) {
		e.preventDefault()
		$("#fetch-register-form").show()*/
		$('#register-signin-panel').show();
		//$("#fetch-signin-form").hide()
	})

	/*
	  $('#mytabs li#fetch-signin').click(function(e) {
	    e.preventDefault()
	    $("#fetch-register-form").hide()
	    $("#fetch-signin-form").show()
	  })
	    $('#register-signin-panel').show();

	    return false;

	  });


	  $('#mytabs li#fetch-register').click(function(e) {
	    e.preventDefault()
	    $("#fetch-register-form").show()
	    $("#fetch-signin-form").hide()
	  })

	  $('#mytabs li#fetch-signin').click(function(e) {
	    e.preventDefault()
	    $("#fetch-register-form").hide()
	    $("#fetch-signin-form").show()
	  })
	*/

/*
	$("#supportrequestlink").click(function(e) {
		var myleft = (screen.width / 2) - (550 / 2);
		var mytop = (screen.height / 2) - (300 / 2);
		chrome.windows.create({
			url: "settings.html#contact",
			type: "panel",
			width: 550,
			height: 300,
			"left": myleft,
			"top": mytop
		})
	});
*/

	$('#newuser').change(function(e) {
		if ($('#newuser').is(":checked")) {
			$('.resetpasswordgroup').hide();
			$('.signingroup').hide();
			$('.signupgroup').show();
		} else {
			$('.resetpasswordgroup').hide();
			$('.signupgroup').hide();
			$('.signingroup').show();
		}
	});

	$(".snapshot-btn").on('click', function(event) {
		console.log("Yo!");
		_gaq.push(['_trackEvent', event.currentTarget.href, 'snapshot-opened']);
	});

	$(".text-btn").on('click', function(event) {
		console.log("Yo!");
		_gaq.push(['_trackEvent', event.currentTarget.href, 'text-version-opened']);
	});



	$('.resetpasswordgroup').hide();
	$('.signupgroup').hide();
	$('.signingroup').show();
});
