var timer = 0;
var pageActiveTimeout = 30;
var curUrl = "";
var curPageTitle = "";
var pageActive = true;
var curFavIconUrl = "";
var pauseFetch = false;

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.status == "active") {
			pageActive = true;
			pageActiveTimeout = 30;
		}
		if (request.message == "toggle") {
			pauseFetch = !pauseFetch;
		}
		if (request.message == "queryState") {
			sendResponse({
				state: pauseFetch
			});
		}
	});

function createUserId() {
	return;
	var randomId = uuid.v4();
	chrome.storage.sync.set({
		'userId': randomId
	}, function() {});
	return randomId;
}

function updateUserTimer(curUrl, pageTitle, timer, favIconUrl) {
	var userId = "";
	chrome.storage.sync.get('userId', function(items) {
		userId = items.userId;
		if (userId == undefined || userId == "") {
			return;
			userId = createUserId();

		}
		updateTimer(curUrl, pageTitle, timer, userId, favIconUrl);
	});

}

function getPopupDetail() {

	var userId = "";
	var date = new Date();
	var dateDiff = 0;
	chrome.storage.sync.get('popupDate', function(items) {
		if (items.popupDate == undefined || items.popupDate == "") {
			chrome.storage.sync.set({
				'popupDate': date.getDate()
			}, function() {
				chrome.storage.sync.get('userId', function(items) {
					userId = items.userId;
					if (userId == undefined || userId == "") {
						return;
						userId = createUserId();

					}
					getPopUpLink(userId);
				});

			});

		} else {
			dateDiff = date.getDate() - items.popupDate;
			if (dateDiff != 0) {
				chrome.storage.sync.get('userId', function(items) {
					userId = items.userId;
					if (userId == undefined || userId == "") {
						return;
						userId = createUserId();
					}
					getPopUpLink(userId);
				});
			}
		}

	});

	chrome.storage.sync.set({
		'popupDate': date.getDate()
	}, function() {});

}



function getPopUpLink(userId) {
	var getUrl = fetch.conf.server + "/fetch/v2/notify";

	var data = $.ajax({
		type: "GET",
		async: false,
		data: {
			"user": userId
		},
		crossDomain: "true",
		url: getUrl
	})

	var jsonData = $.parseJSON(data.responseText);
	var list = jsonData.lPageItems;
	var notificationOptions = {};
	$.each(list, function(index, item) {
		var timeSpent = item.duration;
		var minutes = Math.floor(timeSpent / 60);
		var seconds = timeSpent % 60;

		notificationOptions.title = "Hey There";
		notificationOptions.type = "basic";
		notificationOptions.iconUrl = "icon.png";
		notificationOptions.message = "You spent " + minutes + "mins " + seconds + "secs" + "  viewing \"" + item.pageTitle + "\"";
		notificationOptions.buttons = [{
			title: "Share"
		}, {
			title: "Tweet"
		}];
		createNotification(notificationOptions, item.pageId);
	});


}

function createNotification(options, url) {
	chrome.notifications.create('', options, function() {});

	chrome.notifications.onClicked.addListener(function(notificationId) {
		chrome.tabs.create({
			url: url
		});
	});
	chrome.notifications.onButtonClicked.addListener(function(notificationId, button) {
		if (button == 1) {
			window.open(
				'https://www.twitter.com/share?url=' + encodeURIComponent(url),
				'facebook-share-dialog',
				'width=626,height=436,top=200,left=450');


		} else if (button == 0) {
			window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url),
				'facebook-share-dialog',
				'width=626,height=436,top=200,left=450');
		}
	});

}

function getCurTab() {
	var url = "";

	chrome.tabs.query({
		active: true,
		currentWindow: true
	}, function(tabs) {

		var tab = tabs[0];
		url = tab.url;

		console.assert(typeof url == 'string', 'tab.url should be a string');
	});
	return url;
}

function updateTimer(curUrl, pageTitle, timer, uniqueId, favIconUrl) {
	curUrl = curUrl.replace(/'/g, "\\\'");
	pageTitle = pageTitle.replace(/'/g, "\\\'");
	favIconUrl = favIconUrl.replace(/'/g, "\\\'");

	var page={
		url: curUrl,
		title: pageTitle,
		icon_url: favIconUrl,
		cumulative_time: timer
	}

	var pagelist=[page]
	var obj=JSON.stringify({pages: pagelist});
	var data = $.ajax({
		type: "POST",
		async: true,
		crossDomain: "true",
		headers: {"Authorization": uniqueId},
		url: fetch.conf.server + "/fetch/history/",
		contentType: "application/json",
		dataType: 'json',
		data: obj,
	});
}

$(document).ready(function() {
	fetch.analytics=new fetch.Stapes.Analytics();
	fetch.user=new fetch.Stapes.User();
	fetch.user.on("user", function() {
		fetch.bookmarksync=new fetch.Stapes.BookmarksSyncManager();
		fetch.collectionmenu=new fetch.Stapes.CollectionContextMenu();
	});

	setInterval(function() {

		if (pauseFetch == false) {

			chrome.tabs.query({
				active: true,
				currentWindow: true
			}, function(tabs) {
				var tab = tabs[0];
				if(tab==undefined)
					return;
				var url="";
				if("url" in tab) {
					url=tab.url;
				} else {
					console.log("No url, aborting tab update")
					return;
				}

				var pageTitle = "";
				if("title" in tab)
					pageTitle=tab.title
				var favIconUrl = encodeURIComponent(url);

				chrome.tabs.sendMessage(tabs[0].id, {
					greeting: "poll"
				}, function(response) {
					if(response==undefined)
						return;
					pageTitle = response.pageTitle;


					console.assert(typeof url == 'string', 'tab.url should be a string');
					console.assert(typeof pageTitle == 'string', 'tab.title should be a string');
					if (curUrl != url) {
						updateUserTimer(url, pageTitle, timer, favIconUrl);
						curUrl = url;
						curPageTitle = pageTitle;
						curFavIconUrl = favIconUrl;
						timer = 0;
					} else {
						if (pageActive == true) {
							timer = timer + 1;
							if (timer==15) {
								updateUserTimer(curUrl, curPageTitle, timer, curFavIconUrl);
								timer = 0;
							}

							pageActiveTimeout--;
							if (pageActiveTimeout == 0) {
								pageActive = false;
								updateUserTimer(curUrl, curPageTitle, timer, curFavIconUrl);
								timer = 0;
							}
						}
					}
				});
			});
		}
	}, 1000);
});
