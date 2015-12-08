var fetch=fetch || {};
fetch.Stapes=fetch.Stapes || {}

fetch.Stapes.Activity=Stapes.subclass({
	constructor: function($element) {
		this.$el=$element;
		this.hide();
	},
	show: function() {
		this.$el.show();
	},
	hide: function() {
		this.$el.hide();
	}
});

fetch.Stapes.StatusMessage=Stapes.subclass({
	constructor: function($element) {
		this.$activity=new fetch.Stapes.Activity($element.find(".fa-spin"));
		this.$status=$element.find("label");
		this.reset();
	},
	reset: function() {
		this.$status.removeClass("text-danger");
		this.$status.removeClass("text-success");
		this.$status.html("");
		this.$activity.hide();
	},
	working: function(message) {
		this.reset();
		this.$activity.show();
		if(message!=undefined)
			this.$status.html(message);
	},
	error: function(message) {
		this.$status.addClass("text-danger");
		this.$status.html(message);
		this.$activity.hide();
	},
	success: function(message) {
		this.$status.addClass("text-success");
		this.$status.html(message);
		this.$activity.hide();
	},
});

fetch.Stapes.FormInput=Stapes.subclass({
	constructor: function($element, name) {
		this.$group=$element;
		this.$input=this.$group.find("[name="+name+"]");
		this.reset();
	},	
	reset: function() {
		this.$group.removeClass("has-error");
		this.$group.removeClass("has-success");
	},
	error: function() {
		this.$group.addClass("has-error");
	},
	input: function() {
		return this.$input;
	}
});

fetch.Stapes.HashTab=Stapes.subclass({
	constructor: function() {
		$('a[data-target="' + window.location.hash + '"]').trigger('click');
	}
});

fetch.Stapes.AppMenu=Stapes.subclass({
	constructor: function($menu) {
		this.$menu=$menu;

		var self=this;
		chrome.management.getAll(function(apps) {
			for(var i=0;i<apps.length;i++) {
				var app=apps[i];
				if(app.icons!=undefined && app.appLaunchUrl!=undefined) {
					self.$menu.append('<li><a href="'+app.appLaunchUrl+'"><img src="'+app.icons[0].url+'" width=16"></img> '+app.name+'</a></li>');
				}
			}
		});
	}	
});

fetch.Stapes.TimeBackground=Stapes.subclass({
	constructor: function($bg) {
		this.$bg=$bg;	

		this.setBackground();
		setInterval(this.setBackground, 1000*1800);  // Schedule every half hour
	},
	setBackground: function() {
		var d=new Date();
		var h=d.getHours();
		if(h>=6 && h<11)
			this.$bg.find("img").attr("src", "images/morning.jpg");	
		if(h>=11 && h<16)
			this.$bg.find("img").attr("src", "images/afternoon.jpg");	
		if(h>=16 && h<20)
			this.$bg.find("img").attr("src", "images/evening.jpg");	
		if(h>=20 || (h>=0 && h<6))
			this.$bg.find("img").attr("src", "images/night.jpg");	
	}
});

fetch.Stapes.RedirectSearchBar=Stapes.subclass({
	constructor: function($element) {
		this.$el=$element;
		this.$search=this.$el.find("[name=search-query]");
		this.$submit=this.$el.find(".search-button");

		var self=this;
		this.$search.on("keypress", function(e) {
			if(e.which=='13') {
				var search_query=self.$search.val();
				window.location="/searchtab.html?q="+search_query
				fetch.analytics.pushEvent("searched", search_query);
			}
		});

		this.$submit.on("click", function() {
			var search_query=self.$search.val();
			window.location="/searchtab.html?q="+search_query
			fetch.analytics.pushEvent("searched", search_query);
		});
	}
});

fetch.Stapes.RealTimeInfo=Stapes.subclass({
	constructor: function($element) {
		this.$el=$element;
		this.$time=this.$el.find(".current-time");
		this.$location=this.$el.find(".location");
		this.$weather=this.$el.find(".weather");
		var self=this;
		this.updateTime();
		setInterval(function() {
			self.updateTime();
		}, 30*1000); // 30 second updates	
		this.startWeatherUpdates();
	},
	updateTime: function() {
		var d=new Date();
		var h=d.getHours()%12;
		var m=d.getMinutes();
		if(m<10)
			m="0"+m;
		var ampm=d.getHours()<12 ? "am" : "pm";
		this.$time.html(h+":"+m+" "+ampm);	
	},
	startWeatherUpdates: function() {
		var self=this;	
		$.ajax({
			url: "http://ipinfo.io/json",
			success: function(info) {
				self.location=info.city+", "+info.region+", "+info.country;
				self.$location.html(info.city);
				self.updateWeather();
				setInterval(function() {
					self.updateWeather();
				}, 7*60*1000); // 30 second updates	
			}
		});
	},
	updateWeather: function() {
		var self=this;
		$.simpleWeather({"location":this.location, unit:'c',
			success: function(weather) {
				self.$weather.html(weather.temp+'&#8451; <img src="'+weather.image+'" height="70"/>');
			}
		});
	}
});
