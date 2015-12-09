var _gaq = _gaq || [];
var fetch=fetch || {}
fetch.Stapes=fetch.Stapes || {}

fetch.Stapes.Config=Stapes.subclass({
	constructor: function(mode) {
		this.mode=mode;
		if(mode=="debug") {
			console.log("-- DEBUG MODE --");
			this.server = "http://52.32.10.180";
			this.analytics=false;
			this.debug=true;
		} else {
			this.server = "https://getfetch.net";
			this.analytics=true;
			this.debug=false;
		}
	}
});

//// GLOBAL CONFIG
fetch.conf=new fetch.Stapes.Config("release");
//// 

fetch.Stapes.Analytics=Stapes.subclass({
	constructor: function() {
		// Load Google Analytics
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
	},
	pushEvent: function(category, label) {
		if(fetch.conf.mode=="debug")
			console.log("Tracking Event: "+category+", "+label);
		if(fetch.conf.analytics)
			_gaq.push(['_trackEvent', category, label]);
	},
});


