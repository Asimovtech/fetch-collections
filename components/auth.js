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
		console.log("User id is "+userId);

		$.ajaxSetup({
			headers: { 'Authorization': userId }
		});
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
					type: "PUT",
					url: fetch.conf.server+"/fetch/passwords/",
					data: { 
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
			type: "POST",
			async: true,
			url: fetch.conf.server + "/fetch/sessions/",
			crossDomain: "true",
			data: {
				email: email,
				password: passhash.toString()
			},
			success: function(data) {
				userId = data.user_id;
				chrome.storage.sync.set({
					'userId': userId
				}, function() {
					//fetch.user.setUserId(userId);
				});
			}
		}).fail(function(data) {
			self.$status.error("login failed, "+JSON.parse(data.responseText).detail);
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
			url: fetch.conf.server + "/fetch/users/",
			crossDomain: "true",
			data: {
				email: email,
				password: passhash.toString()
			},
			success: function(data) {
				userId = data.user_id;
				chrome.storage.sync.set({
					'userId': userId
				}, function() {
					fetch.user.setUserId(userId);
				});
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
			type: "DELETE",
			async: false,
			url: fetch.conf.server + "/fetch/passwords/",
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

fetch.Stapes.EditProfile=Stapes.subclass({
	constructor: function($element) {
		this.$el=$element;
		this.$nickname=new fetch.Stapes.FormInput(this.$el.find(".nickname-group"), "nickname");
		this.$profilepic=new fetch.Stapes.FormInput(this.$el.find(".profile-pic-group"), "profile-pic");
		this.$status=new fetch.Stapes.StatusMessage(this.$el.find(".status"));
		this.$submit=this.$el.find("button");

		var self=this;
		this.$submit.on("click", function() {
			self.doEditProfile();
		});
	},
	doEditProfile: function() {
		this.$profilepic.reset();
		this.$nickname.reset();

		var nickname=this.$nickname.input().val();
		if(nickname==undefined || nickname=="") {
			this.$nickname.error();
			return;
		}

		var files=this.$profilepic.input()[0].files;
		if(files.length==0) {
			this.$profilepic.error();
			return;
		}
		
		var data=new FormData();
		data.append("nickname", nickname);
		var filename=files[0].name;
		var fileparts=filename.split(".");
		
		data.append("profilepic", files[0], fetch.user.get("userId")+"."+fileparts[fileparts.length-1]);

		this.$status.working();
		var self=this;
		$.ajax({
			url: fetch.conf.server + "/fetch/me/",
			type: 'PATCH',
			data: data,
			cache: false,
			dataType: 'json',
			processData: false, // Don't process the files
			contentType: false, // Set content type to false as jQuery will tell the server its a query string request
			success: function(data, textStatus, jqXHR)
			{
				self.$status.success("Profile Updated!");	
			},
			error: function(jqXHR, textStatus, errorThrown)
			{
				self.$status.error("Profile Update failed!");	
			}
		});
	}
});

