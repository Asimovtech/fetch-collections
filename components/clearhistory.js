var fetch=fetch || {};
fetch.Stapes=fetch.Stapes || {}

fetch.Stapes.ClearHistory=Stapes.subclass({
	constructor: function($element) {
		this.$el=$element;
		this.$duration=this.$el.find("[name=duration]");
		this.$contract=new fetch.Stapes.FormInput(this.$el.find(".accept-contract-group"), "accept-contract");
		this.$status=new fetch.Stapes.StatusMessage(this.$el.find(".status"));
		this.$submit=this.$el.find('button');
		this.set("duration", "0");

		var self=this;
		this.$duration.on("click", function() {
			self.set("duration", $(this).val());
		});

		this.$submit.on("click", function() {
			var user=fetch.user.get("userId");
			self.$contract.reset();
			self.$status.reset();

			period=self.get("duration");
			accepted=self.$contract.input().is(":checked");
			console.log("period is "+period+", accepted is "+accepted);

			if(accepted!=true) {
				self.$contract.error();
				return;
			} 
			
			self.$status.working("clearing history, this may take several minutes");
			$.ajax({
				type: "PUT",
				url: fetch.conf.server+"/fetch/v2/clear/",
				data: { 
					user: user,
					period: period
				},
				success: function(data) {
					self.$status.success(data);
					self.$contract.input().attr("checked", false);
				},
				error: function(xhr, statusText, error) {
					self.$status.error("Couldn't clear history, "+xhr.responseText);
					self.$contract.input().attr("checked", false);
				}
			});		
		});
	}
});
