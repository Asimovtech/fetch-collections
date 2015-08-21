var i = 0;
var count = 1;
var userId;
var doSearch = false;
/*var serverUrl = "http://52.26.203.91:80/";*/
var serverUrl = "http://localhost:9082/";


function getUsersPages() {

  chrome.storage.sync.get('userId', function(items) {
    userId = items.userId;
    populateList(userId);

  });
}


function deleteLink(user, page, option) {
  var removeUrl = serverUrl + "TimerWidget/api/" + option + "/page/";
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
  var removeUrl = serverUrl + "/TimerWidget/api/remove/page/all";
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
  doSearch = true;
  var searchText = $('#search-text-input').val();
  var getUrl = serverUrl + "TimerWidget/api/view/userId/" + userId + "/search/" + searchText + "/page/" + i++;
  /*var getUrl = "http://localhost:9082/TimerWidget/api/view/userId/" + userId + "/search/" + searchText + "/page/" + i++;*/
  var data = $.ajax({
    type: "GET",
    async: true,
    crossDomain: "true",
    url: getUrl,
    success: function(data) {
      if (data) {
        //var jsonData = $.parseJSON(data);
        createListView($.parseJSON(data));
        $('div#loadmoreajaxloader').hide();
      } else {
        $('div#loadmoreajaxloader').html('<center>No more posts to show.</center>');
      }
    }

  });


  var jsonData = $.parseJSON(data.responseText);
  console.log(jsonData);
  createListView(jsonData)
}



function populateList(userId) {
  $('div#loadmoreajaxloader').show();
  var getUrl = serverUrl + "TimerWidget/api/view/userId/" + userId + "/trending/" + i++;
  /*var getUrl = "http://localhost:9082/TimerWidget/api/view/userId/" + userId + "/trending/" + i++;*/
  var data = $.ajax({
    type: "GET",
    async: true,
    crossDomain: "true",
    url: getUrl,
    success: function(data) {
      if (data) {
        //var jsonData = $.parseJSON(data);
        createListView($.parseJSON(data));
        $('div#loadmoreajaxloader').hide();

      } else {
        $('div#loadmoreajaxloader').html('<center>No more posts to show.</center>');
      }
    }

  });


  /*var jsonData = $.parseJSON(data.responseText);
  console.log(jsonData);
  createListView(jsonData)*/
}

function createListView(jsonData) {


  var list = jsonData.lPageItems;
  $.each(list, function(index, item) {
    console.log(item.pageId);
    var timeSpent = item.duration;
    var minutes = Math.floor(timeSpent / 60);
    var seconds = timeSpent % 60;


    var section = $().add("<div id = section-" + count + "></div>").addClass("col-xs-12").addClass("del").addClass("list-item");
    var link = $().add("<div id = link-" + count + "><span class=\'time\'>" + minutes + "m " + seconds + "s" + " </span><a href=\'" + item.pageId + "\'>  " + item.pageTitle + "</a></div>").addClass("col-xs-9");
/*    var delButton = $().add("<button type=\'button\' id=\'delete-link" + count + "\''>Delete</button>").addClass('btn').addClass('btn-danger').addClass('col-xs-1');*/
    var favIcon = $().add("<div id=\'favicon-btn-" + count + "\'  class=\'col-xs-1\'><img class=\'favicon-btn\'' src=\'" + item.iconUrl + "\'' /></div>")
    var fbshare = $().add("<a id=\'fb-share-btn-" + count + "\'  class=\'btn azm-social azm-size-32 azm-circle azm-gradient azm-facebook \'><i class=\'fa fa-facebook\''></i></a>")
    var tweet = $().add("<a id=\'tweet-btn-" + count + "\'  class=\'btn azm-social azm-size-32 azm-circle azm-gradient azm-twitter\'><i class=\'fa fa-twitter\''></i></a>")
/*    var blackList = $().add("<button id=\'blacklist-btn-" + count + "\' type=\'button\' class=\'btn btn-default black-list col-xs-1\'>Block</button>")*/


    $('#page-list').append(section[0]);

  /*  $('#section-' + count).append(delButton[0]);*/
/*    $('#section-' + count).append(blackList[0]);*/
    $('#section-' + count).append(favIcon[0]);
    $('#section-' + count).append(fbshare[0]);
    $('#section-' + count).append(tweet[0]);

    $('#section-' + count).append(link[0]);
    $('#section-' + count).append(link[1]);
    $('#section-' + count).append(link[2]);

    $('#blacklist-btn-' + count).on('click', function() {
      i = 0;
      var option = 'blacklist';
      deleteLink(userId, item.pageId, option);
      $('#page-list').empty();
      getUsersPages();
    });

    $('#delete-link' + count).on('click', function() {
      i = 0;
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
      window.open('http://www.facebook.com/sharer.php?s=100&p[url]=' + encodeURIComponent(item.pageId) + '&p[title]=Whatsup NIGGA&p[summary]=assnigga');
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
    i = 0;
    count = 1;
    $('#page-list').empty();
  });

  $('button#search-btn').on('click', function() {
    $('#page-list').empty();
    count = 1;
    i = 0;
    searchLinks(userId);

  });

  $('#view-heading').on('click', function() {
    $('#page-list').empty();
    i = 0;
    count = 1;
    getUsersPages();

  });

  $('#search-text-input').on('keypress', function(e) {
    if (e.which == '13') {
      $('#page-list').empty();
      i = 0;
      count = 1;
      searchLinks(userId);
    }
  });


  $('#toggle-fetch-btn').on('click', function() {
    chrome.runtime.sendMessage({
      message: "toggle"
    }, function(response) {
      if($('#toggle-fetch-btn').text()=="Pause Fetch"){
        $('#toggle-fetch-btn').text("Resume Fetch");
      }
      else if($('#toggle-fetch-btn').text()=="Resume Fetch"){
        $('#toggle-fetch-btn').text("Pause Fetch");
      }
    });
  });


  getUsersPages();

  $("#top-links-view").scroll(function() {

    if ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {

      $('div#loadmoreajaxloader').show();
      if (doSearch == true) {
        searchLinks(userId)
      } else {
        populateList(userId);
      }

    }
  });

  $("#toggler-panel").hover(
    function() {
      console.log("enter");

      $(".theme-options").stop(true, true).delay(250).slideDown(); /*.css("display","block");*/
    },
    function() {
      $(".toggler").css("background-color", "#C0C0C0");
      $(".theme-options").stop(true, true).delay(100).slideUp();
      console.log("exit");
    }
  );


});