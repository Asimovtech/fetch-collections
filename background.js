var timer = 0;
var pageActiveTimeout = 30;
var curUrl = "";
var curPageTitle = "";
var pageActive = true;
var popupTimer = 120;



chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.status == "active") {
            pageActive = true;
            pageActiveTimeout = 30;
            if (popupTimer == 0) {
                getPopupDetail();
            }
            popupTimer = 120;
        }
    });

function createUserId() {
    var randomId = uuid.v4();

    chrome.storage.sync.set({
        'userId': randomId
    }, function() {
        console.log('user created');
    });
    return randomId;
}

function updateUserTimer(curUrl, pageTitle, timer) {
    var userId = "";
    chrome.storage.sync.get('userId', function(items) {
        userId = items.userId;
        if (userId == undefined || userId == "") {
            userId = createUserId();
        }
        updateTimer(curUrl, pageTitle, timer, userId);
    });

}

function getPopupDetail() {

    var userId = "";
    chrome.storage.sync.get('userId', function(items) {
        userId = items.userId;
        if (userId == undefined || userId == "") {
            userId = createUserId();
        }
        getPopUpLink(userId);
    });


}

function getPopUpLink(userId) {
    var getUrl = "http://52.26.155.37:9080/TimerWidget/api/view/userId/" + userId + "/notify";
    /*var getUrl = "http://localhost:9082/TimerWidget/api/view/userId/" + userId + "/notify";*/
    var data = $.ajax({
        type: "GET",
        async: false,
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
        notificationOptions.message = "You spent "+ minutes + "mins " + seconds + "secs" + "  viewing \"" + item.pageTitle+"\"";
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

    function updateTimer(curUrl, pageTitle, timer, uniqueId) {
        console.log("update trigerred");
        $.ajax({
            type: "POST",
            crossDomain: "true",
            data: {
                url: curUrl,
                title: pageTitle,
                time: timer,
                userId: uniqueId
            },

            url: "http://52.26.155.37:9080/TimerWidget/api/update/timerId/duration"
            /*url: "http://localhost:9082/TimerWidget/api/update/timerId/duration"*/

        }).done(function(msg) {
            console.log("Timer Updated");

        });
    }

    $(document).ready(function() {



        setInterval(function() {
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, function(tabs) {
                var tab = tabs[0];
                var url = tab.url;
                var pageTitle = tab.title;

                console.assert(typeof url == 'string', 'tab.url should be a string');
                console.assert(typeof pageTitle == 'string', 'tab.title should be a string');
                if (curUrl != url) {
                    updateUserTimer(curUrl, curPageTitle, timer);
                    curUrl = url;
                    curPageTitle = pageTitle;
                    timer = 0;
                } else {
                    if (pageActive == true) {
                        timer = timer + 3;
                    }
                    console.log("active time" + timer);
                }
            });
        }, 3000);

    setInterval(function() {
        console.log("popup " + popupTimer);
        if (pageActive == false) {

            return;
        } else {

         
            console.log(pageActiveTimeout);
            if (pageActiveTimeout == 0) {
                pageActive = false;
                updateUserTimer(curUrl, curPageTitle, timer);
                timer = 0;
            }
        }
        if (popupTimer != 0) {
            popupTimer -= 1
        }

    }, 1000);


    });