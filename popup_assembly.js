$(document).ready(function() {
	fetch.analytics=new fetch.Stapes.Analytics();
	fetch.activity=new fetch.Stapes.Activity($("#loadmoreajaxloader"));
	fetch.user=new fetch.Stapes.User();
	fetch.auth=new fetch.Stapes.Authentication($("#authentication-panel"), $("#extension-main-content"));
	fetch.user.on("user", function() {
		fetch.popup=new fetch.Stapes.PopupManager($("#extension-main-content"));
		fetch.popup.loadFrontPage();
	});
	fetch.togglefetch=new fetch.Stapes.ToggleFetch($("#toggle-fetch-btn"));
	fetch.settings=new fetch.Stapes.Settings($("#settings"), "");
	fetch.support=new fetch.Stapes.Settings($("#support"), "#contact");
});

