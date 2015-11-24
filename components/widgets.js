var fetch=fetch || {};
fetch.Stapes=fetch.Stapes || {}

fetch.Stapes.Activity=Stapes.subclass({
	constructor: function($element) {
		this.$el=$element;
		this.hide();
	},
	show: function() {
		this.$el.show();
	},
	hide: function() {
		this.$el.hide();
	}
});

fetch.Stapes.StatusMessage=Stapes.subclass({
	constructor: function($element) {
		this.$activity=new fetch.Stapes.Activity($element.find(".fa-spin"));
		this.$status=$element.find("label");
		this.reset();
	},
	reset: function() {
		this.$status.removeClass("text-danger");
		this.$status.removeClass("text-success");
		this.$status.html("");
		this.$activity.hide();
	},
	working: function(message) {
		this.reset();
		this.$activity.show();
		if(message!=undefined)
			this.$status.html(message);
	},
	error: function(message) {
		this.$status.addClass("text-danger");
		this.$status.html(message);
		this.$activity.hide();
	},
	success: function(message) {
		this.$status.addClass("text-success");
		this.$status.html(message);
		this.$activity.hide();
	},
});

fetch.Stapes.FormInput=Stapes.subclass({
	constructor: function($element, name) {
		this.$group=$element;
		this.$input=this.$group.find("[name="+name+"]");
		this.reset();
	},	
	reset: function() {
		this.$group.removeClass("has-error");
		this.$group.removeClass("has-success");
	},
	error: function() {
		this.$group.addClass("has-error");
	},
	input: function() {
		return this.$input;
	}
});

fetch.Stapes.HashTab=Stapes.subclass({
	constructor: function() {
		$('a[data-target="' + window.location.hash + '"]').trigger('click');
	}
});
