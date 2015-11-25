var fetch=fetch || {};
fetch.Stapes=fetch.Stapes || {}

fetch.Stapes.Support=Stapes.subclass({
	constructor: function($element) {
		this.$el=$element;
		this.$text=new fetch.Stapes.FormInput(this.$el.find(".text-group"), "text");
		this.$status=new fetch.Stapes.StatusMessage(this.$el.find(".status"));
		this.$submit=this.$el.find('button');

		var self=this;
		this.$submit.on('click', function() {
			var user=fetch.user.get("userId");
			var text=self.$text.input().val();
			if(text==undefined || text=="") {
				self.$text.error();
				return;
			}
			self.$text.reset();
			self.$status.working();
			$.ajax({
				type: "POST",
				url: fetch.conf.server+"/fetch/supportrequest/",
				data: { 
					user: userId,
					requestinfo: text
				},
				success: function(data) {
					self.$status.success("Thanks! We'll get back to you via mail");
				},
				error: function(data) {
					self.$status.error("Something went wrong, please try again");
				}
			});		
		});
	}
});

fetch.Stapes.PaidFeature=Stapes.subclass({
	constructor: function($element) {
		this.$el=$element;
		this.$text=new fetch.Stapes.FormInput(this.$el.find(".text-group"), "text");
		this.$status=new fetch.Stapes.StatusMessage(this.$el.find(".status"));
		this.$submit=this.$el.find('button');

		var self=this;
		this.$submit.on('click', function() {
			var user=fetch.user.get("userId");
			var text=self.$text.input().val();
			if(text==undefined || text=="") {
				self.$text.error();
				return;
			}
			self.$text.reset();
			self.$status.working();
			$.ajax({
				type: "POST",
				url: fetch.conf.server+"/fetch/paidfeature/",
				data: { 
					user: userId,
					feature: text
				},
				success: function(data) {
					self.$status.success("Thanks! We'll get back to you via mail");
				},
				error: function(data) {
					self.$status.error("Something went wrong, please try again");
				}
			});		
		});
	}
});

