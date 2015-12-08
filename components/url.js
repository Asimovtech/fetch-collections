var fetch=fetch || {}

fetch.Stapes.Url=Stapes.subclass({
	constructor: function() {
		this.parse();
	},
	parse: function() {
		var self=this;
		location.search.substr(1).split("&").forEach(function (item) {
			var tmp = item.split("=");
			var key=tmp[0]
			var value=decodeURIComponent(tmp[1]);
			console.log("URL parameter: "+key+": "+value);
			self.set(key,value);
		});
	}
});
