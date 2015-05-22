/**
 * Created by Zaccary on 18/05/2015.
 */


var React = require('react');
var Router = require('react-router');
var Link = Router.Link;
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;
var DefaultRoute = Router.DefaultRoute;
var Redirect = Router.Redirect;

var SavingsApp = require('./components/SavingsApp.react');

var routes = (
	<Route name="app" path="/" handler={SavingsApp}>
		<Route name="timeline" path="/timeline" />
		<Redirect from="/timeline" to="app"/>
	</Route>
);

Router.run(routes, function (Handler, state) {
	var params = state.params;
	React.render(<Handler params={params} path={state.path}/>, document.body);
});