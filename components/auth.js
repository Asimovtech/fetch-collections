var fetch=fetch || {};
fetch.Stapes=fetch.Stapes || {}

fetch.Stapes.User=Stapes.subclass({
	constructor: function() {
		var self=this;
		chrome.storage.sync.get('userId', function(items) {
			self.setUserId(items.userId);
		});

		chrome.storage.onChanged.addListener(function(changes, areaName) {
			if(areaName=="sync" && changes.userId!=undefined && changes.userId.newValue!=undefined)
				self.setUserId(changes.userId.newValue);
		});
	},
	setUserId: function(userId) {
		if(userId==undefined || userId=="") {
			this.emit("no_user");
			return;
		}

		this.set("userId", userId);
		this.emit("user", userId);
	},
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
					url: fetch.conf.server+"/fetch/v2/password/",
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

fetch.Stapes.Signin=Stapes.subclass({
	constructor: function($element) {
		this.$el=$element;
		this.$email=new fetch.Stapes.FormInput(this.$el.find(".email-group"), "email");
		this.$password=new fetch.Stapes.FormInput(this.$el.find(".password-group"), "password");
		this.$status=new fetch.Stapes.StatusMessage(this.$el.find(".status"));
		this.$submit=this.$el.find(".signin-button");

		var self=this;
		this.$submit.on("click", function() {
			self.doSignIn();
		});
	},
	isEmail: function isEmail(email) {
		var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
		return regex.test(email);
	},
	reset: function() {
		this.$email.reset();
		this.$password.reset();
		this.$status.reset();
	},
	doSignIn: function() {
		this.reset();

		var email=this.$email.input().val();
		var password=this.$password.input().val();

		if(!this.isEmail(email) || email=="") {
			this.$email.error();
			return;
		}

		if(password.length<6) {
			this.$password.error();
			return;
		}

		var self=this;
		passhash = CryptoJS.MD5(password);
		this.$status.working();
		var data = $.ajax({
			type: "PUT",
			async: true,
			url: fetch.conf.server + "/fetch/v2/login/",
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
					}, function() {
						//fetch.user.setUserId(userId);
					});
				} else {
					return false;
				}
			}
		}).fail(function(data) {
			self.$status.error("login failed, "+JSON.parse(data.responseText));
			return false;
		});
	}
});

fetch.Stapes.Signup=Stapes.subclass({
	constructor: function($element) {
		this.$el=$element;
		this.$email=new fetch.Stapes.FormInput(this.$el.find(".email-group"), "email");
		this.$password=new fetch.Stapes.FormInput(this.$el.find(".password-group"), "password");
		this.$confirmpassword=new fetch.Stapes.FormInput(this.$el.find(".confirm-password-group"), "confirm-password");
		this.$status=new fetch.Stapes.StatusMessage(this.$el.find(".status"));
		this.$submit=this.$el.find(".signup-button");

		var self=this;
		this.$submit.on("click", function() {
			self.doSignUp();
		});
	},
	isEmail: function isEmail(email) {
		var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
		return regex.test(email);
	},
	reset: function() {
		this.$email.reset();
		this.$password.reset();
		this.$confirmpassword.reset();
		this.$status.reset();
	},
	doSignUp: function() {
		this.reset();

		var email=this.$email.input().val();
		var password=this.$password.input().val();
		var confirmpassword=this.$confirmpassword.input().val();

		if(!this.isEmail(email) || email=="") {
			this.$email.error();
			return;
		}

		if(password.length<6) {
			this.$password.error();
			return;
		}

		if (password != confirmpassword) {
			this.$password.error();
			this.$confirmpassword.error();
			this.$status.error("Passwords don't match!");
			return;
		}

		var self=this;
		this.$status.working();
		passhash = CryptoJS.MD5(password);
		var data = $.ajax({
			type: "POST",
			async: true,
			url: fetch.conf.server + "/fetch/v2/register/",
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
					}, function() {
						fetch.user.setUserId(userId);
					});
				} else {
					return false;
				}
			}
		}).fail(function(data) {
			self.$status.error("signup failed, "+JSON.parse(data.responseText));
			return false;
		});
	}
});

fetch.Stapes.ResetPassword=Stapes.subclass({
	constructor: function($element) {
		this.$el=$element;
		this.$email=new fetch.Stapes.FormInput(this.$el.find(".email-group"), "email");
		this.$status=new fetch.Stapes.StatusMessage(this.$el.find(".status"));
		this.$submit=this.$el.find(".reset-password-button");

		var self=this;
		this.$submit.on("click", function() {
			self.doResetPassword();
		});
	},
	isEmail: function isEmail(email) {
		var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
		return regex.test(email);
	},
	reset: function() {
		this.$email.reset();
		this.$status.reset();
	},
	doResetPassword: function() {
		this.reset();		

		var email=this.$email.input().val();

		if(!this.isEmail(email) || email=="") {
			this.$email.error();
			return;
		}

		var self=this;
		this.$status.working();
		var data = $.ajax({
			type: "POST",
			async: false,
			url: fetch.conf.server + "/fetch/v2/forgotpassword/",
			crossDomain: "true",
			data: {
				email: email,
			},
			success: function(data) {
				self.$status.success(data);	
			},
			error: function(data) {
				self.$status.error("Unable to reset password");
			}
		});
	}
});
