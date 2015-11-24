var fetch=fetch || {};
fetch.Stapes=fetch.Stapes || {}

fetch.Stapes.User=Stapes.subclass({
	constructor: function() {
		var self=this;
		chrome.storage.sync.get('userId', function(items) {
			userId = items.userId;
			self.set("userId", userId);
			self.emit("user", userId);
		});
	}
});

fetch.Stapes.ChangePassword=Stapes.subclass({
	constructor: function($element) {
		this.$el=$element;
		this.$oldpassword=new fetch.Stapes.FormInput(this.$el.find(".old-password-group"), "old-password");
		this.$newpassword=new fetch.Stapes.FormInput(this.$el.find(".new-password-group"), "new-password");
		this.$confirmpassword=new fetch.Stapes.FormInput(this.$el.find(".confirm-password-group"), "confirm-password");
		this.$status=new fetch.Stapes.StatusMessage(this.$el.find(".status"));
		this.$submit=this.$el.find('button');

		var self=this;
		this.$submit.on("click", function() {
			var user=fetch.user.get("userId");
			self.$oldpassword.reset();
			self.$newpassword.reset();
			self.$confirmpassword.reset();
			self.$status.reset();

			var oldpassword=self.$oldpassword.input().val();
			var newpassword=self.$newpassword.input().val();
			var confirmpassword=self.$confirmpassword.input().val();

			if(oldpassword.length<6) {
				self.$oldpassword.error();
				return;
			}
			if(newpassword.length<6) {
				self.$newpassword.error();
				return;
			}
			if(confirmpassword.length<6) {
				self.$confirmpassword.error();
				return;
			}

			if(newpassword!=confirmpassword) {
				self.$newpassword.error();
				self.$confirmpassword.error();
				self.$status.error("Passwords don't match");
				return;
			} else {
				var oldpasshash=CryptoJS.MD5(oldpassword).toString();
				var newpasshash=CryptoJS.MD5(newpassword).toString();
				self.$status.working();
				$.ajax({
					type: "POST",
					url: serverUrl+"fetch/v2/password/",
					data: { 
						user: user,
						oldpassword: oldpasshash,
						newpassword: newpasshash
					},
					success: function() {
						self.$status.success("Password updated!");
					},
					error: function(xhr, statusText, error) {
						self.$status.error(JSON.parse(xhr.responseText));
					}
				});		
			}
		});
	}
});
