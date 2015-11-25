var linkLength = 100;

document.addEventListener('DOMContentLoaded', function() {
	$(window).scroll(function() {
		if (!collated) {
			if ($(this).scrollTop() + $(this).innerHeight() >= document.body.scrollHeight) {
				if (userId == undefined)
					return;
				$('div#loadmoreajaxloader').show();
				if (doSearch == true) {
					searchLinks(userId)
				} else {
					populateList(userId, "");
				}
			}
		}
	});
});
