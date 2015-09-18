var i = 0;
var count = 1;
var userId;
var doSearch = false;
var serverUrl = "http://52.26.203.91:80/";
/*var serverUrl = "http://localhost:9082/";*/
var baseUrls = {};
var loadedBaseUrls = {};
var collated = false;



function getUsersPages(baseUrl) {

  chrome.storage.sync.get('userId', function(items) {
    userId = items.userId;
    populateList(userId, baseUrl);

  });
}



function deleteLink(user, page, option) {
  var removeUrl = serverUrl + "fetch/" + option + "/page/";
  /*var removeUrl = "http://localhost:9082/TimerWidget/api/" + option + "/page/";*/
  var data = $.ajax({
    type: "PUT",
    async: true,
    crossDomain: "true",
    data: {
      user_id: userId,
      base_url: page
    },
    url: removeUrl

  });
}



function deleteAllLinks(user) {
  var removeUrl = serverUrl + "fetch/user/" + userId + "/clear/";
  /*var removeUrl = "http://localhost:9082/TimerWidget/api/remove/page/all";*/
  var data = $.ajax({
    type: "PUT",
    async: true,
    crossDomain: "true",
    data: {
      user_id: userId
    },
    url: removeUrl
  });
}

function searchLinks(userId) {
  $('.typeahead').typeahead('close');
  $('div#empty-result').hide();
  $('div#loadmoreajaxloader').show();
  baseUrl = "";
  doSearch = true;
  var searchText = $('#search-text-input').val();
  var getUrl = serverUrl + "fetch/user/" + userId + "/search/" + searchText + "/page/" + i++;
  /*var getUrl = "http://localhost:9082/TimerWidget/api/view/userId/" + userId + "/search/" + searchText + "/page/" + i++;*/
  var data = $.ajax({
    type: "GET",
    async: true,
    crossDomain: "true",
    url: getUrl,
    success: function(data) {
      if (data) {
        data = $.parseJSON(data);
        if (!$.isEmptyObject(data.lPageItems)) {
          createListView(data, baseUrl);
        } else {

          $('div#empty-result').show();
        }

      } else {

        $('div#empty-result').show();
      }
      $('div#loadmoreajaxloader').hide();
    }

  });


  var jsonData = $.parseJSON(data.responseText);
  console.log(jsonData);
  createListView(jsonData)
}



function populateList(userId, baseUrl) {

  $('div#empty-result').hide();
  $('div#loadmoreajaxloader').show();
  var getUrl = "";
  if (baseUrl == "") {
    getUrl = serverUrl + "fetch/user/" + userId + "/page/" + i++;
  } else {
    getUrl = serverUrl + "fetch/user/" + userId + "/base/" + baseUrl;
  }
  var data = $.ajax({
    type: "GET",
    async: true,
    crossDomain: "true",
    url: getUrl,
    success: function(data) {
      if (data) {
        data = $.parseJSON(data);
        if (!$.isEmptyObject(data.lPageItems)) {
          createListView(data, baseUrl);
        } else {

          $('div#empty-result').show();
        }


      } else {

        $('div#empty-result').show();
      }
      $('div#loadmoreajaxloader').hide();
    }

  });

}

function createListView(jsonData, baseUrl) {


  var list = jsonData.lPageItems;

  if (baseUrl != "" && baseUrl != undefined) {
    var favIconUrl = list[0].iconUrl;
    var link = $().add(" <div class=\'col-xs-10\'> <div id=\'favicon-btn\'  class=\'col-xs-1\'><span style=\'position:relative; top:10px !important\' id=\'collapse-links\' > <i class=\'fa fa-chevron-left fa-2\'></i></span></div><div class=\'col-xs-6 \'> <img class=\'favicon-btn\'' src=\'" + favIconUrl + "\'' /><a href=\' http://" + baseUrl + "\'>  " + baseUrl + "</a></div> <button id=\'blacklist-btn\' type=\'button\' class=\'btn btn-default black-list col-xs-5\'>Don't run on this domain</button></div>");
    var section = $().add("<div id = \'top-section\'></div>").addClass("col-xs-12").addClass("del").addClass("list-item");

    $('#page-list').append(section[0]);

    $('#top-section').append(link[0]);



    $('#collapse-links').on('click', function() {
      i = 0;
      loadedBaseUrls = {};

      collated = false;
      $('#page-list').empty();
      getUsersPages("");
    });

    $('#blacklist-btn').on('click', function() {
      i = 0;
      var option = 'blacklist';
      deleteLink(userId, baseUrl, option);
      $('#page-list').empty();
      getUsersPages("");
    });

  }
  $.each(list, function(index, item) {

    if (!doSearch && loadedBaseUrls[item.baseUrl] && (baseUrl == "" || baseUrl == undefined)) {
      return true;
    }
    loadedBaseUrls[item.baseUrl] = true;
    console.log(item.pageId);
    var timeSpent = item.duration;
    var minutes = Math.floor(timeSpent / 60);
    var seconds = timeSpent % 60;
    var pageTitle = item.pageTitle;
    if (pageTitle.length >= 45) {
      pageTitle = pageTitle.substr(0, 35);
      pageTitle = pageTitle.concat('...');
    }

    var section = $().add("<div id = section-" + count + "></div>").addClass("col-xs-12").addClass("list-item");
    var link = $().add("<div id = link-" + count + "><span class=\'time-container col-xs-3\'><span class=\'time\'>" + minutes + "<span class=\'time-mins\'>m </span>" + seconds + "<span class=\'time-mins\'>s </span>" + " </span></span><div style='position:relative;left:-20px' class=\'col-xs-9\'><span id=\'favicon-btn-" + count + "\' class=\'favIcon-container\'  ><img class=\'favicon-btn\'' src=\'" + item.iconUrl + "\'' /></span><span class=\'link-text\'><a href=\'" + item.pageId + "\'>  " + pageTitle + "</a><span></div></div>").addClass("col-xs-10");
    /*    var delButton = $().add("<button type=\'button\' id=\'delete-link" + count + "\''>Delete</button>").addClass('btn').addClass('btn-danger').addClass('col-xs-1');*/
    var favIcon = $().add("<div id=\'favicon-btn-" + count + "\'  class=\'favIcon-container\'><img class=\'favicon-btn\'' src=\'" + item.iconUrl + "\'' /></div>")
    var fbshare = $().add("<a id=\'fb-share-btn-" + count + "\'  class=\'btn azm-social azm-size-32 azm-circle azm-gradient azm-facebook \'><i class=\'fa fa-facebook\''></i></a>")
    var tweet = $().add("<a id=\'tweet-btn-" + count + "\'  class=\'btn azm-social azm-size-32 azm-circle azm-gradient azm-twitter\'><i class=\'fa fa-twitter\''></i></a>")
    var expand = $().add("<span id=\'expand-links-" + count + "\' class=\'expand-links\'> <i class=\'fa fa-chevron-right fa-2\'></i></span>");
    /*    var blackList = $().add("<button id=\'blacklist-btn-" + count + "\' type=\'button\' class=\'btn btn-default black-list col-xs-1\'>Block</button>")*/

    baseUrls["expand-links-" + count] = item.baseUrl;

    $('#page-list').append(section[0]);

    /*  $('#section-' + count).append(delButton[0]);*/
    /*    $('#section-' + count).append(blackList[0]);*/
    //$('#section-' + count).append(favIcon[0]);
    $('#section-' + count).append(fbshare[0]);
    $('#section-' + count).append(tweet[0]);
    if (baseUrl == "" && baseUrl != undefined) {
      $('#section-' + count).append(expand[0]);
    } else if (baseUrl != "" && baseUrl != undefined) {
      $('#section-' + count).css("position", "relative");
      $('#section-' + count).css("left", "35px");
      $('#section-' + count).css("width", "615px");
    }
    $('#section-' + count).append(link[0]);
    $('#section-' + count).append(link[1]);
    $('#section-' + count).append(link[2]);

    $('#blacklist-btn-' + count).on('click', function() {
      i = 0;
      var option = 'blacklist';
      deleteLink(userId, item.pageId, option);
      $('#page-list').empty();
      getUsersPages("");
    });

    /*    $('#delete-link' + count).on('click', function() {
          i = 0;
          var option = 'remove';
          deleteLink(userId, item.pageId, option);
          $('#page-list').empty();
          getUsersPages("");
        });
    */
    $('#expand-links-' + count).on('click', function() {
      i = 0;
      loadedBaseUrls = {};
      collated = true;
      console.log("expand");
      $('#page-list').empty();
      //  $('#page-list').css("display", "none");
      getUsersPages(baseUrls[this.id]);

    });


    $('#fb-share-btn-' + count).on('click', function() {

      //      fbShareUrl = "https://www.facebook.com/dialog/feed?%20app_id=603739439768329%20&display=popup&caption=Spent&link=https%3A%2F%2Fdevelopers.facebook.com%2Fdocs%2F&redirect_uri=https://developers.facebook.com/tools/explorer";
      //fbShareUrl = "https://www.facebook.com/dialog/feed?%20app_id=145634995501895%20&display=popup&caption=Spent%20"+minutes+"minutes%20"+seconds+"seconds%20reading%20"+ item.pageTitle+"&link="+encodeURIComponent(item.pageId)+"&redirect_uri="+encodeURIComponent(item.pageId);
      window.open('http://www.facebook.com/sharer.php?s=100&p[url]=' + encodeURIComponent(item.pageId) + '&p[title]=Whatsup NIGGA&p[summary]=assnigga');
      /*  window.open(fbShareUrl)*/
    });



    $('#tweet-btn-' + count).on('click', function() {
      window.open(
        'https://www.twitter.com/intent/tweet?text=' + encodeURIComponent("Spent " + minutes + " mins " + seconds + " secs on ") +
        '&hashtags=fetchExtension' +
        '&url=' + encodeURIComponent(item.pageId) +
        '&width=326,height=236,top=200,left=450');
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



document.addEventListener('DOMContentLoaded', function() {

  var autoComplete;

  getUsersPages("");

  chrome.storage.sync.get('userId', function(items) {
    userId = items.userId;



    autoComplete = new Bloodhound({
      limit: 5,
      datumTokenizer: function(datum) {
        return Bloodhound.tokenizers.whitespace(datum.value);
      },
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      remote: {
        url: serverUrl + 'fetch/user/' + userId + '/suggest/%QUERY',
        wildcard: '%QUERY',
        filter: function(suggestions) {
          suggestions = $.parseJSON(suggestions);
          var a = $.map(suggestions.lPageItems, function(item) {
            return {
              value: item.pageTitle
            };
          });
          console.log(a);
          return a;
        }
      }
    });


    autoComplete.initialize();


    $('.typeahead').typeahead(null, {
      displayKey: 'value',
      source: autoComplete.ttAdapter()
    });
  });

  $('.typeahead').bind('typeahead:cursorchange', function(ev, suggestion) {
    console.log('Selection: ' + suggestion.value);
  });

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

  $('.typeahead').bind('typeahead:select', function(ev, suggestion) {
    console.log('Selection: ' + suggestion.value);
    $('#page-list').empty();
    i = 0;
    count = 1;
    searchLinks(userId);
  });

  $('#view-heading').on('click', function() {
    $('#page-list').empty();
    i = 0;
    count = 1;
    getUsersPages("");

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
    }, function(response) {});

    if ($('#toggle-fetch-btn').text() == "Pause Fetch") {
      $('#toggle-fetch-btn').text("Resume Fetch");
    } else if ($('#toggle-fetch-btn').text() == "Resume Fetch") {
      $('#toggle-fetch-btn').text("Pause Fetch");
    }

  });

  chrome.runtime.sendMessage({
    message: "queryState"
  }, function(response) {
    if (response.state == true) {
      $('#toggle-fetch-btn').text("Resume Fetch");
    } else {
      $('#toggle-fetch-btn').text("Pause Fetch");
    }
  });



  $("#top-links-view").scroll(function() {
    $('div#empty-result').hide();
    if (!collated) {

      if ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {

        $('div#loadmoreajaxloader').show();
        if (doSearch == true) {
          searchLinks(userId)
        } else {
          populateList(userId, "");
        }

      }
    }
  });

  $("#toggler-panel").hover(
    function() {
      console.log("enter");
      $(".toggler").css("background-color", "#C0C0C0");
      $(".theme-options").stop(true, true).delay(250).slideDown(); /*.css("display","block");*/
    },
    function() {
      $(".toggler").css("background-color", "#FFF");
      $(".theme-options").stop(true, true).delay(100).slideUp();
      console.log("exit");
    }
  );

  $("#signin-btn").on('click', function() {


    chrome.identity.getAuthToken({
      'interactive': true
    }, function(token) {
      console.log(token)

    });
    chrome.identity.getProfileUserInfo(function callback(obj) {
      console.log(obj.email);
      new_userId = CryptoJS.MD5(obj.email).toString()

      $.ajax({
        type: "POST",
        crossDomain: "true",
        data: {
          user_id: userId,
          new_id: new_userId
        },
        url: serverUrl + "fetch/update/userdetails/"
      }).done(function(msg) {
        console.log("Details Updated");
        chrome.storage.sync.set({
          'userId': userId
        }, function() {
          console.log('user created');
          $('#page-list').empty();
          i = 0;
          loadedBaseUrls = {};
          count = 1;
          getUsersPages("");


        });
      });

      userId = new_userId;
    });

  })
});