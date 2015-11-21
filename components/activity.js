var activity=React.createClass({
	render: function() {
		return (
			<div id="loadmoreajaxloader" style="display:{this.props.visible};">
				<center>
					<i class="fa fa-refresh fa-spin fa-lg"></i>
				</center>
			</div>);
	}
});
