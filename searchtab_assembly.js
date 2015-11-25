$(document).ready(function() {
	fetch.analytics=new fetch.Stapes.Analytics();
	fetch.activity=new fetch.Stapes.Activity($("#loadmoreajaxloader"));
	fetch.user=new fetch.Stapes.User();
	fetch.auth=new fetch.Stapes.Authentication($("#authentication-panel"), $("#extension-main-content"));
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



