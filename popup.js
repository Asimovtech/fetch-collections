function getCurrentTabUrl(callback) {
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {

    var tab = tabs[0];
    var url = tab.url;
    console.assert(typeof url == 'string', 'tab.url should be a string');
    callback(url);
  });
}

function getUsersPages() {

  chrome.storage.sync.get('userId', function(items) {
    userId = items.userId;

    populateList(userId);
  });
}


function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
}



function deleteLink(user, page, option) {
  var removeUrl = "http://52.26.155.37:9080/TimerWidget/api/" + option + "/page/";
  /*var removeUrl = "http://localhost:9082/TimerWidget/api/" + option + "/page/";*/
  var data = $.ajax({
    type: "PUT",
    async: true,
    crossDomain: "true",
    data: {
      userId: userId,
      pageId: page
    },
    url: removeUrl

  });
}



function deleteAllLinks(user) {
  var removeUrl = "http://52.26.155.37:9080/TimerWidget/api/remove/page/all";
  /*var removeUrl = "http://localhost:9082/TimerWidget/api/remove/page/all";*/
  var data = $.ajax({
    type: "PUT",
    async: true,
    crossDomain: "true",
    data: {
      userId: userId
    },
    url: removeUrl
  });
}

function searchLinks(userId) {
  var searchText = $('#search-text-input').val();
  var getUrl = "http://52.26.155.37:9080/TimerWidget/api/view/userId/" + userId + "/search/" + searchText;
  /*var getUrl = "http://localhost:9082/TimerWidget/api/view/userId/" + userId + "/search/"+searchText;*/
  var data = $.ajax({
    type: "GET",
    async: false,
    crossDomain: "true",
    url: getUrl

  });


  var jsonData = $.parseJSON(data.responseText);
  console.log(jsonData);
  createListView(jsonData)
}



function populateList(userId) {
  var getUrl = "http://52.26.155.37:9080/TimerWidget/api/view/userId/" + userId + "/trending"
    /*var getUrl = "http://localhost:9082/TimerWidget/api/view/userId/" + userId + "/trending"*/
  var data = $.ajax({
    type: "GET",
    async: false,
    crossDomain: "true",
    url: getUrl

  });


  var jsonData = $.parseJSON(data.responseText);
  console.log(jsonData);
  createListView(jsonData)
}

function createListView(jsonData) {

  var count = 1;
  var list = jsonData.lPageItems;
  $.each(list, function(index, item) {
    console.log(item.pageId);
    var timeSpent = item.duration;
    var minutes = Math.floor(timeSpent / 60);
    var seconds = timeSpent % 60;


    var section = $().add("<div id = section-" + count + "></div>").addClass("col-xs-12").addClass("del");
    var link = $().add("<div id = link-" + count + "><span class=\'time\'>" + minutes + "m " + seconds + "s" + " </span><a href=\'" + item.pageId + "\'>  " + item.pageTitle + "</a></div>").addClass("col-xs-8");
    var delButton = $().add("<button type=\'button\' id=\'delete-link" + count + "\''>Delete</button>").addClass('btn').addClass('btn-danger').addClass('col-xs-1');
    var fbshare = $().add("<button id=\'fb-share-btn-" + count + "\' type=\'button\' class=\'btn btn-primary col-xs-1\'>Share</button>")
    var tweet = $().add("<button id=\'tweet-btn-" + count + "\' type=\'button\' class=\'btn btn-primary col-xs-1\'>Tweet</button>")
    var blackList = $().add("<button id=\'blacklist-btn-" + count + "\' type=\'button\' class=\'btn btn-default black-list col-xs-1\'>Block</button>")
      //var btngroup = $().add("<div id=\'button-group"+count+"\' class=\'btn-group col-xs-3\' role=\'group\' aria-label=\'btn group\'></div>")

    $('#page-list').append(section[0]);
    //$('#section-' + count).append(btngroup[0]);
    $('#section-' + count).append(delButton[0]);
    $('#section-' + count).append(blackList[0]);
    $('#section-' + count).append(fbshare[0]);
    $('#section-' + count).append(tweet[0]);

    $('#section-' + count).append(link[0]);
    $('#section-' + count).append(link[1]);
    $('#section-' + count).append(link[2]);

    $('#blacklist-btn-' + count).on('click', function() {
      var option = 'blacklist';
      deleteLink(userId, item.pageId, option);
      $('#page-list').empty();
      getUsersPages();
    });

    $('#delete-link' + count).on('click', function() {
      var option = 'remove';
      deleteLink(userId, item.pageId, option);
      $('#page-list').empty();
      getUsersPages();
    });



/*    $('#fb-share-btn-' + count).on('click', function() {
      window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(item.pageId),
        'facebook-share-dialog',
        'width=626,height=436,top=200,left=450');
    });
*/

    $('#fb-share-btn-' + count).on('click', function() {
      window.open('http://www.facebook.com/sharer.php?s=100&p[url]='+ encodeURIComponent(item.pageId)+'&p[title]=Whatsup NIGGA&p[summary]=assnigga');
    });




    $('#tweet-btn-' + count).on('click', function() {
      window.open(
        'https://www.twitter.com/share?url=' + encodeURIComponent(item.pageId),
        'facebook-share-dialog',
        'width=626,height=436,top=200,left=450');
    });

    count++;
  });
  $('a').on('click', function(event) {
    console.log("CLICK");
    chrome.tabs.create({
      url: event.currentTarget.href
    });

  });

}

var userId = "";

document.addEventListener('DOMContentLoaded', function() {

  $('#delete-link-all').on('click', function() {
    deleteAllLinks(userId);
    $('#page-list').empty();
  });

  $('button#search-btn').on('click', function() {
    $('#page-list').empty();
    searchLinks(userId);

  });

  $('#view-heading').on('click', function() {
    $('#page-list').empty();
    getUsersPages();

  });

  $('#search-text-input').on('keypress', function(e) {
    if (e.which == '13') {
      $('#page-list').empty();
      searchLinks(userId);
    }
  });


  getUsersPages();

});