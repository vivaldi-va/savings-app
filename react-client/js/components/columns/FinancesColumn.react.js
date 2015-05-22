/**
 * Created by vivaldi on 07/03/2015.
 */

var React = require('react');
var SavingsFinanceActions = require('../../actions/SavingsFinanceActions');
var SavingsFinanceItem = require('./FinanceItem.react.js');


var SavingsFinanceColumn = React.createClass({
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

				<div className="financeColumn__ItemWrapper">
				{this.props.finances.map(function(finance) {
					return (
						<SavingsFinanceItem finance={finance} />
					)
				})}
				</div>
			</div>
		);
	}
});

module.exports = SavingsFinanceColumn;