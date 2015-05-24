/**
 * Created by vivaldi on 07/03/2015.
 */

var React = require('react');
var Classnames = require('classnames');
var Numeral = require('numeral');
var FinanceActions = require('../../actions/FinanceActions');
var FinanceItem = require('./FinanceItem.react.js');


var FinanceColumn = React.createClass({
	openModal: function(finance) {
		"use strict";
		finance = finance || null;
		FinanceActions.openModal(this.props.type, finance);
	},

	newFinance: function() {
		"use strict";
		FinanceActions.openModal(this.props.type);
	},

	render: function() {

		var type = this.props.type === 0 ? 'income' : 'expense';
		var totalClass = Classnames('finances__ColumnTotalValue', {'finances__ColumnTotalValue-income': this.props.type===0, 'finances__ColumnTotalValue-expense': this.props.type===1});
		return (
			<div className={"box finances__Column finances__Column-" + type}>
				<div className="finances__ColumnTop">
					<div className="finances__ColumnHeader">
						<div className="finances__ColumnType">{type}</div>
						<button className="button button-clear" onClick={this.newFinance}>
							<i className="fa fa-plus"></i> add {type}
						</button>
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
						<div className="finances__ColumnTotal">
							<span className={totalClass}>{Numeral(this.props.total).format('$0,0.00')}</span>
							<span className="text-sub">/month</span>
						</div>
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