var fetch=fetch || {};
fetch.Stapes=fetch.Stapes || {}

fetch.Stapes.BlockedSites=Stapes.subclass({
	constructor: function($tabselect, tab, $element) {
		this.$ts=$tabselect;
		this.tab=tab;
		this.$el=$element;
		this.$taginput=new fetch.Stapes.FormInput(this.$el.find(".blocked-sites-group"), "blocked-sites");
		this.$status=new fetch.Stapes.StatusMessage(this.$el.find(".status"));
		this.$submit=this.$el.find('button');
		var user=fetch.user.get("userId");

		var self=this;
		// LOAD BLOCKED SITES INTO TAG INPUT
		$.ajax({
			type: "POST",
			url: serverUrl+"fetch/v2/blacklist/",
			data: { 
				user: user,
			},
			success: function(data) {
				var sites=JSON.parse(data);

				self.$taginput.input().textext({
					plugins : 'tags prompt',
					prompt : 'Click to add',
					tags : {
						items : sites,
						enabled: true
					}
				}).bind('isTagAllowed', function(e, data) {
					self.$status.reset();
					if(data.tag=="") {
						data.result=true;
						return;
					}
					if(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/.test(data.tag)) {
						data.result = true;
					} else {
						self.$status.error("oops, bad domain, enter the complete domain name, e.g. news.google.com");
						data.result = false;
					}
				});
			},
			error: function(xhr, statusText, error) {
				this.$status.error("Couldn't retrieve blacklist, "+xhr.responseText);
			}
		});

		// TEXTEXT HACK ON TAB CHANGE
		this.$ts.on("shown.bs.tab", function(e) {
			var target = $(e.target).attr("data-target") // activated tab
			if(target==self.tab) {
				self.$taginput.input().textext()[0].tags().onEnterKeyPress();
				self.$taginput.input().blur();
			}
		});
	
		// UPDATE
		this.$submit.on('click', function() {
			var tags=JSON.parse(self.$taginput.input().textext()[0].hiddenInput().val());
			var tagString="";
			for(var i=0;i<tags.length;i++) {
				tagString=tagString+tags[i]+","
			}
			self.$status.working();
			$.ajax({
				type: "PUT",
				url: serverUrl+"fetch/v2/blacklist/",
				data: { 
					user: user,
					sites: tagString
				},
				success: function(data) {
					self.$status.success(data);
				},
				error: function(xhr, statusText, error) {
					self.$status.error("Couldn't update blacklist, "+xhr.responseText);
				}
			});		
		});
	}
});


