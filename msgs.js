activeMessage = function (trigger_event) {
    chrome.runtime.sendMessage({
        status: "active",
        action: trigger_event
    }, function (response) {
        console.log(response.farewell);
    });
}



var cur_x = 0,
    cur_y = 0;

$(document).click(function () {
    activeMessage("click");
    console.log("click");
});

$(document).mousemove(function (event) {
    if (cur_x != event.pageX && cur_y != event.pageY) {
        cur_x = event.pageX;
        cur_y = event.pageY;
        activeMessage("mouse_move");
    }
});


$(document).keypress(function () {
    activeMessage("key_press");
    console.log("key_press");
});

$(document).scroll(function () {
    activeMessage("scroll");
    console.log("scroll");
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.greeting == "poll"){
        var title = $('title').text();
    }
      sendResponse({pageTitle: title});
  });