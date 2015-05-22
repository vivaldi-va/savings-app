/**
 * Created by vivaldi on 07/03/2015.
 */

var React = require('react');
var FinanceActions = require('../../actions/FinanceActions');
var FinanceItem = require('./FinanceItem.react.js');


var FinanceColumn = React.createClass({
	openFinance: function(finance) {

	},

	newFinance: function(type) {

	},

	render: function() {



		return (
			<div className={"box finances__Column finances__Column-" + this.props.type}>
				<div className="finances__ColumnTop">
					<div className="finances__ColumnHeader">
						<div className="finances__ColumnType">{this.props.type}</div>
						<button className="button button-clear"><i className="fa fa-plus"></i> add income</button>
					</div>

					<div className="finances__ColumnInfo">
						<div className="finances__ColumnCount">
							{this.props.finances.length}
							<span className="text-sub">
								{function() {
								"use strict";
									if(this.props.finances.length > 1) {
										return "items";
									} else {
										return "item";
									}
								}.call(this)}
							</span>
						</div>
						<div className="finances__ColumnTotal"></div>
					</div>
				</div>

				<div className="finances__ColumnItemWrapper">
				{this.props.finances.map(function(finance) {
					return (
						<FinanceItem finance={finance} />
					)
				})}
				</div>
			</div>
		);
	}
});

module.exports = FinanceColumn;