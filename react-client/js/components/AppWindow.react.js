/**
 * Created by Zaccary on 23/05/2015.
 */

var React = require('react');
var Router = require('react-router');
var RouteHandler = Router.RouteHandler;
var AuthUtil = require('../utils/AuthUtil');

var AppWindow = React.createClass({
	getInitialState: function() {
		"use strict";
		return {
			loading: true
		}
	},
	componentWillMount: function() {
		"use strict";
		var _this = this;
		AuthUtil.checkSession(function(err, result) {
			if(err || !result) {
				console.error(err);
				location.replace('/login');
			} else {
				_this.setState({loading:false});
			}
		});
	},
	render: function() {
		"use strict";
		var view;
		if(this.state.loading) {
			view = (
				<div><span>loading...</span></div>
			);
		} else {
			view = (<RouteHandler {...this.props} />);
		}
		return (
			<div className="window">
				{view}
			</div>
		)
	}
});

module.exports = AppWindow;