var fetch=fetch || {}

$(document).ready(function() {
	fetch.analytics=new fetch.Stapes.Analytics();
	fetch.currenttab=new fetch.Stapes.HashTab();
	fetch.user=new fetch.Stapes.User();
	fetch.support=new fetch.Stapes.Support($("#support-form"));
	fetch.paidfeature=new fetch.Stapes.PaidFeature($("#paid-feature-form"));
	fetch.user.on("user", function() {
		fetch.blockedsites=new fetch.Stapes.BlockedSites($('a[data-toggle="tab"]'),
			"#blocked-websites", $("#blocked-sites-form"));
	});
	fetch.changepassword=new fetch.Stapes.ChangePassword($("#change-password-form"));
	fetch.clearhistory=new fetch.Stapes.ClearHistory($("#clear-history-form"));
});

