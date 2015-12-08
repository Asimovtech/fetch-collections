$(document).ready(function() {
	fetch.analytics=new fetch.Stapes.Analytics();
	fetch.activity=new fetch.Stapes.Activity($("#loadmoreajaxloader"));
	fetch.user=new fetch.Stapes.User();
	fetch.auth=new fetch.Stapes.Authentication($("#authentication-panel"), $("#extension-main-content"));
	fetch.url=new fetch.Stapes.Url();
	fetch.chromeapps=new fetch.Stapes.AppMenu($('#app-list'));
	fetch.user.on("user", function() {
		fetch.popup=new fetch.Stapes.SearchTabManager($("#extension-main-content"));
	});
	fetch.togglefetch=new fetch.Stapes.ToggleFetch($("#toggle-fetch-btn"));
	fetch.recentsearches=new fetch.Stapes.RecentSearches($("#recent-searches"));
	fetch.settings=new fetch.Stapes.Settings($("#settings"), "");
	fetch.support=new fetch.Stapes.Settings($("#support"), "#contact");
});

