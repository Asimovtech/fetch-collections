//var serverUrl = "http://52.32.10.180:80/";
var serverUrl = "https://getfetch.net/";

$('#changepasswordbtn').on('click', function() {
	$('#oldpasswordgroup').removeClass('has-error');	
	$('#newpassword1group').removeClass('has-error');	
	$('#newpassword2group').removeClass('has-error');	
	$('#changepassworderrors').removeClass('text-danger');	
	$('#changepassworderrors').removeClass('text-success');	
	$('#changepassworderrors').html("");

	chrome.storage.sync.get('userId', function(items) {
		userId = items.userId;
		oldpassword=$('#oldpassword').val();
		newpassword1=$('#newpassword1').val();
		newpassword2=$('#newpassword2').val();

		if(oldpassword.length<6) {
			$('#oldpasswordgroup').addClass('has-error');
			$('#oldpassword').attr("placeholder", "Atleast 6 characters");
			return;
		}
		if(newpassword1.length<6) {
			$('#newpassword1group').addClass('has-error');
			$('#newpassword1').attr("placeholder", "Atleast 6 characters");
			return;
		}
		if(newpassword2.length<6) {
			$('#newpassword2group').addClass('has-error');
			$('#newpassword2').attr("placeholder", "Atleast 6 characters");
			return;
		}


		if(newpassword1!=newpassword2) {
			$('#newpassword1group').addClass('has-error');	
			$('#newpassword2group').addClass('has-error');	
			$('#changepassworderrors').addClass('text-danger');	
			$('#changepassworderrors').html("Passwords don't match");
		} else {
    		oldpasshash=CryptoJS.MD5(oldpassword);
    		newpasshash=CryptoJS.MD5(newpassword1);
			$.ajax({
				type: "POST",
				url: serverUrl+"fetch/v2/password/",
				data: { 
					user: userId,
					oldpassword: oldpasshash.toString(),
					newpassword: newpasshash.toString()
				},
				success: function() {
					$('#changepassworderrors').addClass('text-success');	
					$('#changepassworderrors').html("Password updated!");
				},
				error: function(xhr, statusText, error) {
					$('#changepassworderrors').addClass('text-danger');	
					$('#changepassworderrors').html(JSON.parse(xhr.responseText));
				}
			});		
		}
	});
	return false;
});

$(document).ready(function (e) {
	$('a[data-target="' + window.location.hash + '"]').trigger('click');
	
	chrome.storage.sync.get('userId', function(items) {
		userId = items.userId;
		$.ajax({
			type: "POST",
			url: serverUrl+"fetch/v2/blacklist/",
			data: { 
				user: userId,
			},
			success: function(data) {
				var sites=JSON.parse(data);
				console.log(sites);
				$('#blocked-sites').textext({
					plugins : 'tags prompt',
					prompt : 'Click to add',
					tags : {
						items : sites,
						enabled: true
					}
				}).bind('isTagAllowed', function(e, data) {
					if(data.tag=="") {
						data.result=false;
						return;
					}
					if(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/.test(data.tag)) {
						data.result = true;
					} else {
						$('#blocksiteserrors').addClass('text-danger').show();
						$('#blocksiteserrors').html("oops, bad domain, enter the complete domain name, e.g. news.google.com").delay(5000).fadeOut('slow');
						data.result = false;
					}
				});
			},
			error: function(xhr, statusText, error) {
				$('#blocksiteserrors').addClass('text-danger');
				$('#blocksiteserrors').html("Couldn't retrieve blacklist, "+xhr.responseText);
			}
		});		
	});
});

$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
	var target = $(e.target).attr("data-target") // activated tab
	if(target=="#blocked-websites") {
		$('#blocked-sites').textext()[0].tags().onEnterKeyPress();
		$('#blocked-sites').blur();
	}
});

$('#blocksitesbtn').on('click', function() {
	var tags=JSON.parse($('#blocked-sites').textext()[0].hiddenInput().val());
	var tagString=""
	for(var i=0;i<tags.length;i++) {
		tagString=tagString+tags[i]+","
	}
	chrome.storage.sync.get('userId', function(items) {
		userId = items.userId;
		$.ajax({
			type: "PUT",
			url: serverUrl+"fetch/v2/blacklist/",
			data: { 
				user: userId,
				sites: tagString
			},
			success: function(data) {
				$('#blocksiteserrors').addClass('text-success');
				$('#blocksiteserrors').html(data);
			},
			error: function(xhr, statusText, error) {
				$('#blocksiteserrors').addClass('text-danger');
				$('#blocksiteserrors').html("Couldn't update blacklist, "+xhr.responseText);
			}
		});		
	});
});

$('#clearhistorybtn').on('click', function() {
	$('#contractgroup').removeClass("has-error");
	$('#clearhistoryerrors').removeClass('text-danger');
	$('#clearhistoryerrors').removeClass('text-success');
	$('#clearhistoryerrors').html("");

	period=$("input:radio[name=duration]:checked").val();
	accepted=$("input:checkbox[name=acceptcontract]:checked").val();
	console.log("accepted is "+accepted);
	if(accepted!="accepted") {
		$('#contractgroup').addClass("has-error");
		return;
	} 
	
	chrome.storage.sync.get('userId', function(items) {
		userId = items.userId;
		$.ajax({
			type: "PUT",
			url: serverUrl+"fetch/v2/clear/",
			data: { 
				user: userId,
				period: period
			},
			success: function(data) {
				$('#clearhistoryerrors').addClass('text-success');
				$('#clearhistoryerrors').html(data);
				$('#contract').attr("checked", false);
			},
			error: function(xhr, statusText, error) {
				$('#clearhistoryerrors').addClass('text-danger');
				$('#clearhistoryerrors').html("Couldn't clear history, "+xhr.responseText);
				$('#contract').attr("checked", false);
			}
		});		
	});
});

$('#paidfeaturebtn').on('click', function() {
	chrome.storage.sync.get('userId', function(items) {
		userId = items.userId;
		feature=$('#paidfeaturetext').val();
		if(feature==undefined || feature=="")
			return;
		$.ajax({
			type: "POST",
			url: serverUrl+"fetch/paidfeature/",
			data: { 
				user: userId,
				feature: feature
			},
			success: function(data) {
				$('#paidfeatureerrors').addClass('text-success');
				$('#paidfeatureerrors').html("Thanks! We'll get back to you via mail!");
			}
		});		
	});
});

$('#supportrequestbtn').on('click', function() {
	chrome.storage.sync.get('userId', function(items) {
		userId = items.userId;
		request=$('#supportrequesttext').val();
		if(request==undefined || request=="")
			return;
		$.ajax({
			type: "POST",
			url: serverUrl+"fetch/supportrequest/",
			data: { 
				user: userId,
				requestinfo: request
			},
			success: function(data) {
				$('#supportrequesterrors').addClass('text-success');
				$('#supportrequesterrors').html("Thanks! We'll get back to you via mail!");
			},
			error: function(data) {
				$('#supportrequesterrors').addClass('text-danger');
				$('#supportrequesterrors').html("Thanks! We'll get back to you via mail!");
			}
		});		
	});
});
