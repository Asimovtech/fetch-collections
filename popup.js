// Load Google Analytics
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-69577643-1']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

var i = 0;
var count = 1;
var userId;
var doSearch = false;
var baseUrls = {};
var loadedBaseUrls = {};
var collated = false;
var settingsWindowId=-1;

// Login the user if userId is present
/*
chrome.storage.sync.get("userId", function(items) {
    console.log("UPDATED once more! checking if user exists");
    if (userId == undefined || userId == "") {
        console.log("user info not found");
	return;
    }    
    
    console.log("user found");
    $('#register-signin-panel').hide();
    $('#extension-main-content').show();
    getUsersPages("");
});


*/

function isEmail(email) {
  var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  return regex.test(email);
}

function getUsersPages(baseUrl) {
  _gaq.push(['_trackEvent', "front-page", 'viewed']);
  chrome.storage.sync.get('userId', function(items) {
    userId = items.userId;
    if (userId == undefined || userId == "") {
      $('#register-signin-panel').show();
      $('#extension-main-content').hide();
      return false;
    } else {
      $('#register-signin-panel').hide();
      $('#extension-main-content').show();
      populateList(userId, baseUrl);
    }



  });
}



function blacklistLink(user, page) {
  var removeUrl = serverUrl + "fetch/v2/blacklist/";
  var data = $.ajax({
    type: "PUT",
    async: true,
    crossDomain: "true",
    data: {
      user: userId,
      sites: page,
      append: true
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
  _gaq.push(['_trackEvent', searchText, 'searched']);
  var getUrl = serverUrl + "fetch/v2/sphinxsearch/"; 
  var data = $.ajax({
    type: "POST",
    async: true,
    crossDomain: "true",
    data: {
       user: userId,
       query: searchText,
       page: i++
    },
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

  /*
    var jsonData = $.parseJSON(data.responseText);
    console.log(jsonData);
    createListView(jsonData)*/
}



function populateList(userId, baseUrl) {

  $('div#empty-result').hide();
  $('div#loadmoreajaxloader').show();
  var getUrl = "";
  if (baseUrl == "") {
    getUrl = serverUrl + "fetch/v2/frontpage/"
  } else {
    getUrl = serverUrl + "fetch/v2/domainlist/"
  }
  var data = $.ajax({
    type: "POST",
    async: true,
    crossDomain: "true",
    url: getUrl,
    data: {
       user: userId,
       domain: baseUrl,
       page: i++
    },
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
    var link = $().add(" <div><div class=\'col-xs-4\'><span class=\"clickable\" style=\"vertical-align: middle\" id=\'collapse-links\' ><i class=\'fa fa-chevron-left fa-2\'></i></span>&nbsp;&nbsp;&nbsp;<img class=\'favicon-btn\'' src=\'" + favIconUrl + "\'' /><a href=\' http://" + baseUrl + "\'>  " + baseUrl + "</a></div> <button id=\'blacklist-btn\' type=\'button\' class=\'btn btn-default black-list col-xs-5\'>Don't run on this domain</button></div>");
    var section = $().add("<div id = \'top-section\'></div>").addClass("row").addClass("del").addClass("list-item");

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
      blacklistLink(userId, baseUrl);
      $('#page-list').empty();
      getUsersPages("");
    });

  }
  $.each(list, function(index, item) {

    if (!doSearch && loadedBaseUrls[item.baseUrl] && (baseUrl == "" || baseUrl == undefined)) {
      return true;
    }
    loadedBaseUrls[item.baseUrl] = true;
    var timeSpent = item.duration;
    var minutes = Math.floor(timeSpent / 60);
    var seconds = timeSpent % 60;
    var pageTitle = item.pageTitle;
    if (pageTitle.length >= 40) {
      pageTitle = pageTitle.substr(0, 40);
      pageTitle = pageTitle.concat('...');
    }

    var section = $().add("<div id = section-" + count + "></div>").addClass("row").addClass("list-item");
    var link = $().add('<div id = link-'+count+'>'
		+'<div class="time-container col-xs-3"><span class="time">'+minutes+'m '+seconds+'s</div>'
		// +'</span></span>'
		+'<div style="position:relative;left:-20px" class="col-xs-9">'
			+'<span id="favicon-btn-'+count+'" class="favIcon-container"><img class="favicon-btn" src="'+item.iconUrl+'"/></span>'
			+'<span class="link-text"><a target="_blank" href="'+item.pageId+'" id="openlink-'+count+'">'+pageTitle+'</a><span>'
		+"</div></div>").addClass("col-xs-10");
    /*    var delButton = $().add("<button type=\'button\' id=\'delete-link" + count + "\''>Delete</button>").addClass('btn').addClass('btn-danger').addClass('col-xs-1');*/
    var favIcon = $().add("<div id=\'favicon-btn-" + count + "\'  class=\'favIcon-container\'><img class=\'favicon-btn\'' src=\'" + item.iconUrl + "\'' /></div>")
    var fbshare = $().add("<a target=\"blank\" href=\""+serverUrl+"fetch/s/"+item.id+"\" id=\'snapshot-btn-" + count + "\'><img src=\"icons/snapshot.png\"/> </a>")
    var tweet = $().add("<a target=\"blank\" href=\""+serverUrl+"fetch/t/"+item.id+"\" id=\'text-btn-" + count + "\'><img src=\"icons/text.png\"/> &nbsp;</a>")

    var expand = $().add("<span id=\'expand-links-" + count + "\' style=\"display: inline-block ; vertical-align: middle ; margin-top: 10px\" class=\'clickable expand-links\'> <i class=\'fa fa-chevron-right fa-2\'></i></span>");

    /*    var blackList = $().add("<button id=\'blacklist-btn-" + count + "\' type=\'button\' class=\'btn btn-default black-list col-xs-1\'>Block</button>")*/

    baseUrls["expand-links-" + count] = item.baseUrl;

    $('#page-list').append(section[0]);

    /*  $('#section-' + count).append(delButton[0]);*/
    /*    $('#section-' + count).append(blackList[0]);*/
    //$('#section-' + count).append(favIcon[0]);
    $('#section-' + count).append(fbshare[0]);
    $('#section-' + count).append(tweet[0]);
    if (baseUrl == "" && baseUrl != undefined && !doSearch) {
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
      blacklistLink(userId, item.pageId);
      $('#page-list').empty();
      getUsersPages("");
    });

    /*$('#delete-link' + count).on('click', function() {
       i = 0;
       var option = 'remove';
       deleteLink(userId, item.pageId, option);
       $('#page-list').empty();
       getUsersPages("");
    });*/
    $('#expand-links-' + count).on('click', function() {
      i = 0;
      loadedBaseUrls = {};
      collated = true;
      $('#page-list').empty();
      //  $('#page-list').css("display", "none");
      getUsersPages(baseUrls[this.id]);

    });

	$('#openlink-'+count).on('click', function(event) {
      _gaq.push(['_trackEvent', event.currentTarget.href, 'url-opened']);
    });

	$('#snapshot-btn-'+count).on('click', function(event) {
      _gaq.push(['_trackEvent', event.currentTarget.href, 'snapshot-opened']);
    });

	$('#text-btn-'+count).on('click', function(event) {
      _gaq.push(['_trackEvent', event.currentTarget.href, 'text-version-opened']);
    });

    count++;
  });

  

}



document.addEventListener('DOMContentLoaded', function() {

  var autoComplete;

  getUsersPages("");

  chrome.storage.sync.get('userId', function(items) {
    userId = items.userId;

/*    autoComplete = new Bloodhound({
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
    }); */
  });

  $('.typeahead').bind('typeahead:cursorchange', function(ev, suggestion) {
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

  $("#settings").on('click', function() {
     var myleft = (screen.width/2)-(550/2);
     var mytop = (screen.height/2)-(300/2); 

     chrome.windows.create({url: "settings.html", type: "panel", width: 550, height: 300, "left": myleft, "top": mytop})
  });


  $("#fetch-signin-btn").on('click', function() {
    var email = $('#signin-inputEmail').val();
    var password = $('#signin-inputPassword').val();
    var validPassword = true;
    var validEmail = true;
    if (!isEmail(email) || email == "") {
      $('#signin-inputEmail').parent().addClass('has-error');
      return false;
    }

    if (password.length < 6) {
      $('#signin-inputPassword').parent().addClass('has-error');
      return false;
    }

    passhash=CryptoJS.MD5(password);
    var data = $.ajax({
      type: "PUT",
      async: true,
      url: serverUrl + "fetch/v2/login/",
      crossDomain: "true",
      data: {
        email: email,
        password: passhash.toString()
      },

      success: function(data) {
        if (data) {
          data = $.parseJSON(data);
          userId = data['userId'];
          chrome.storage.sync.set({
            'userId': userId
          }, function() {});
          $('#register-signin-panel').hide();
          $('#extension-main-content').show();
          getUsersPages("");
        } else {
          return false;
        }


      }
    }).fail(function(data) {
	  $('#resetpassworderrors').addClass('text-danger');
      $('#resetpassworderrors').html("Login failed, "+JSON.parse(data.responseText));
      return false;
    });


  });

  $("#fetch-signup-btn").on('click', function() {
    var email = $('#signin-inputEmail').val();
    var password = $('#signin-inputPassword').val();
    var confirmPassword = $('#signup-confirmInputPassword').val();
    if (!isEmail(email)) {
      $('#signin-inputEmail').parent().addClass('has-error');
      return false;
    }
    if (password.length < 6) {
      $('#signin-inputPassword').parent().addClass('has-error');
      return false;
    }
    if (password != confirmPassword) {
      $('#signup-confirmInputPassword').parent().addClass('has-error');
      $('#signin-inputPassword').parent().addClass('has-error');
      return false;
    }
    passhash=CryptoJS.MD5(password);
    var data = $.ajax({
      type: "POST",
      async: false,
      url: serverUrl + "fetch/v2/register/",
      crossDomain: "true",
      data: {
        email: email,
        password: passhash.toString()
      },

      success: function(data) {
        if (data) {
          data = $.parseJSON(data);
          userId = data['userId'];
          chrome.storage.sync.set({
            'userId': userId
          }, function() {});
          $('#register-signin-panel').hide();
          $('#extension-main-content').show();
          getUsersPages("");
        }

      }

    }).fail(function(data) {
	  $('#resetpassworderrors').addClass('text-danger');
      $('#resetpassworderrors').html("Sign up failed, "+JSON.parse(data.responseText));
      return false;
    });
  });


  $('#resetpasswordlink').click(function() {
    $('.signupgroup').hide();
    $('.signingroup').hide();
    $('.resetpasswordgroup').show();
  });

  $('#reset-password-btn').click(function() {
    var email = $('#signin-inputEmail').val();
    if (!isEmail(email)) {
      $('#signin-inputEmail').parent().addClass('has-error');
      return false;
    }
    var data = $.ajax({
      type: "POST",
      async: false,
      url: serverUrl + "fetch/v2/forgotpassword/",
      crossDomain: "true",
      data: {
        email: email,
      },
      success: function(data) {
		$('#resetpassworderrors').addClass('text-success');
        $('#resetpassworderrors').html(data);
      },
      error: function(data) {
		$('#resetpassworderrors').addClass('text-danger');
        $('#resetpassworderrors').html("Unable to reset password");
      }
    });
  });


  $("#logout-btn").on('click', function() {

    chrome.storage.sync.set({
      'userId': ""
    }, function() {});

    $('#extension-main-content').hide();
    /*$("#mytabs").remove();
    var tabs = "<ul id='mytabs' class='nav nav-tabs' role='tablist'>  <li id='fetch-signin' role='presentation' class='active'><a role='tab' data-toggle='tab'  aria-expanded='false'>Signin</a></li>  <li id='fetch-register' role='presentation' class=''>    <a role='tab' data-toggle='tab'  aria-expanded='true'>Signup</a></li>  </ul>"
    $("#register-signin-panel").prepend(tabs);
      $('#mytabs li#fetch-register').click(function(e) {
    e.preventDefault()
    $("#fetch-register-form").show()*/
	$('#register-signin-panel').show();
    //$("#fetch-signin-form").hide()
  })

/*
  $('#mytabs li#fetch-signin').click(function(e) {
    e.preventDefault()
    $("#fetch-register-form").hide()
    $("#fetch-signin-form").show()
  })
    $('#register-signin-panel').show();

    return false;

  });


  $('#mytabs li#fetch-register').click(function(e) {
    e.preventDefault()
    $("#fetch-register-form").show()
    $("#fetch-signin-form").hide()
  })

  $('#mytabs li#fetch-signin').click(function(e) {
    e.preventDefault()
    $("#fetch-register-form").hide()
    $("#fetch-signin-form").show()
  })
*/

  $("#supportrequestlink").click(function(e) {
    var myleft = (screen.width/2)-(550/2);
    var mytop = (screen.height/2)-(300/2); 
    chrome.windows.create({url: "settings.html#contact", type: "panel", width: 550, height: 300, "left": myleft, "top": mytop})
  });

  $('#newuser').change(function(e) {
    if($('#newuser').is(":checked")) {
      $('.resetpasswordgroup').hide();
      $('.signingroup').hide();
      $('.signupgroup').show();
    } else {
      $('.resetpasswordgroup').hide();
      $('.signupgroup').hide();
      $('.signingroup').show();
    }   
  });


  $('.resetpasswordgroup').hide();
  $('.signupgroup').hide();
  $('.signingroup').show();
});


