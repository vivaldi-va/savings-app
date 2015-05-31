/**
 * Created by Zaccary on 24/05/2015.
 */

var React = require('react');
var DatePicker = require('react-date-picker');
var Moment = require('moment');
var ClassNames = require('classnames');
var FinanceActions = require('../actions/FinanceActions');

var FinanceAPI = require('../utils/FinanceAPI');
var TimelineStore = require('../stores/TimelineStore');

var DatepickerComponent	=require('./DatepickerComponent.react.js');
var FinanceModal = React.createClass({
	propTypes: {
		onSubmit: React.PropTypes.func
	},
	getDefaultProps: function() {
		"use strict";
		return {
			onSubmit: function() {}
		};
	},
	getInitialState: function() {
		"use strict";
		return {
			interval: 24,
			view: 'finance',
			duedate: new Date(),
			disabledate: new Date()
		};
	},
	componentDidMount: function() {
		"use strict";
		if(this.props.modal.finance) {
			this.refs.name.getDOMNode().value = this.props.modal.finance.name;
			this.refs.amount.getDOMNode().value = this.props.modal.finance.amount;
			this.refs.interval.getDOMNode().value = this.props.modal.finance.interval;
			this.refs.description.getDOMNode().value = this.props.modal.finance.description;
			this.setState({
				duedate: new Date(this.props.modal.finance.duedate)
			});
		}

		console.log('loading finance', this.refs.interval.getDOMNode().value);
	},
	handleInterval: function(e) {
		"use strict";
		console.log('handleInterval', e.target.value);
		console.log(this.refs.interval.getDOMNode().value);
		this.setState({
			interval: e.target.value
		});
	},
	handleCloseModal: function(e) {
		"use strict";
		e.preventDefault();
		FinanceActions.closeModal();
	},
	handleDueDateChange: function(dateString, moment) {
		"use strict";
		console.log('changed date to %s', dateString);
		this.setState({
			duedate: moment.toDate()
		});
	},
	handleDisableDateChange: function(dateString, moment) {
		"use strict";
		console.log('changed disable date to %s', dateString);
		this.setState({
			disabledate: moment.toDate()
		});
	},
	handleCreateFinance: function(e) {
		"use strict";
		e.preventDefault();
		var name = this.refs.name.getDOMNode().value;
		var amount = this.refs.amount.getDOMNode().value;
		var interval = this.refs.interval.getDOMNode().value;
		var date = this.state.duedate;

		var newFinance = {
			name: name,
			amount: amount,
			interval: interval,
			duedate: date,
			type: this.props.modal.type
		};

		//FinanceActions.addFinance(newFinance);

		FinanceAPI.emit('FINANCE_ADD', newFinance);
		FinanceActions.closeModal();

	},
	handleUpdateFinance: function(e) {
		"use strict";
		e.preventDefault();
		var name = this.refs.name.getDOMNode().value;
		var amount = this.refs.amount.getDOMNode().value;
		var interval = this.refs.interval.getDOMNode().value;
		var date = this.state.duedate;

		var updatedFinance = {
			_id: this.props.modal.finance._id,
			name: name,
			amount: amount,
			interval: interval,
			duedate: date
		};

		for(var key in this.props.modal.finance) {
			if(this.props.modal.finance.hasOwnProperty(key)) {

				if(!updatedFinance[key]) {
					updatedFinance[key] = this.props.modal.finance[key];
				}
				//updatedFinance[key] ;
			}
		}

		// remove relevant timeline items before
		// updating with new items.
		TimelineStore.cleanUpdatedTimeline(updatedFinance._id, updatedFinance.type, function() {
			FinanceAPI.emit('FINANCE_UPDATE', updatedFinance);
			FinanceActions.closeModal();
		});


	},
	handleDisableFinance: function(e) {
		"use strict";

		e.preventDefault();
		var finance = this.props.modal.finance;
		var disableDate;
		var disable;

		if(this.state.view === 'disable') {
			disable = !this.refs.remove.getDOMNode().checked;
			disableDate = new Date(this.refs.disabledate.getDOMNode().value) || new Date();
		}

		TimelineStore.cleanUpdatedTimeline(finance._id, finance.type, function() {
			FinanceAPI.emit('FINANCE_REMOVE', {_id: finance._id, disabled: disable, disable_date: disableDate});
			FinanceActions.closeModal();
		});
	},

	setViewFinance: function(e) {
		"use strict";
		this.setState({
			view: 'finance'
		});
	},
	setViewDisable: function(e) {
		"use strict";
		this.setState({
			view: 'disable'
		});
	},
	openDatepicker: function() {
		"use strict";
		this.setState({
			datepickeropen: true
		});
	},
	closeDatepicker: function() {
		"use strict";
		this.setState({
			datepickeropen: false
		});

	},
	handleClickDatepicker: function(e) {
		"use strict";
		e.stopPropagation();
	},
	render: function() {
		"use strict";
		if(!this.props.modal) {
			return null;
		}

		var title;
		var submitButton;
		var leftButtons;
		var label;

		if(!this.props.modal.finance) {
			label = this.props.modal.type === 0 ?
				(<span className="label label-green">income</span>) :
				(<span className="label label-orange">expense</span>);

			title = (<span>Add new {label}</span>);
			submitButton = (<button className="modal__FooterButton modal__FooterButton-blue" onClick={this.handleCreateFinance}>Add finance</button>)
			leftButtons = (
				<div className="modal__FooterButtonGroup">
					<button type="button" className="modal__FooterButton modal__FooterButton-default" onClick={this.handleCloseModal}><i className="fa fa-remove"></i></button>
				</div>
			);
		} else {
			label = this.props.modal.type === 0 ?
				(<span className="label label-green">{this.props.modal.finance.name}</span>) :
				(<span className="label label-orange">{this.props.modal.finance.name}</span>);

			title = (<span>Update {label}</span>);
			submitButton = (<button className="modal__FooterButton modal__FooterButton-blue" onClick={this.handleUpdateFinance}>Save</button>);
			leftButtons = (
			<div className="modal__FooterButtonGroup">
				<button type="button" className="modal__FooterButton modal__FooterButton-default" onClick={this.handleCloseModal}><i className="fa fa-remove"></i></button>
				<button type="button" className="modal__FooterButton modal__FooterButton-default" onClick={this.setViewDisable}><i className="fa fa-trash"></i></button>
			</div>
			);
		}


		var financeView = (
			<div className="modal" onClick={this.closeDatepicker}>
				<div className="modal__Header">
					{title}
				</div>
				<div className="modal__Body">
					<form className="form">
						<div className="form__InputGroup">
							<label htmlFor="finance-modal-name" className="form__InputLabel">name</label>
							<input id="finance-modal-name" ref="name" type="text" className="input" />
						</div>
						<div className="form__InputGroup">
							<label htmlFor="finance-modal-amount" className="form__InputLabel">amount</label>
							<input id="finance-modal-amount" ref="amount" type="text" className="input"/>
						</div>
						<div className="form__InputGroup">
							<label htmlFor="finance-modal-interval" className="form__InputLabel">interval</label>
							<select id="finance-modal-interval" ref="interval" onChange={this.handleInterval} type="text" className="input">
								<option value={24}>daily</option>
								<option value={24*7}>weekly</option>
								<option value={24*7*2}>bi-weekly</option>
								<option value={24*31}>monthly</option>
								<option value={24*31*6}>every 6 months</option>
								<option value={24*31*12}>yearly</option>
							</select>
						</div>
						<div className="form__InputGroup">
							<label htmlFor="finance-modal-date" className="form__InputLabel">start date</label>

							<DatepickerComponent
								date={this.state.duedate}
								onSelect={this.handleDueDateChange}
								/>
						</div>
						<div className="form__InputGroup">
							<label htmlFor="finance-modal-description" className="form__InputLabel">description</label>
							<textarea id="finance-modal-description" ref="description" type="text" className="input" value=""></textarea>
						</div>
					</form>
				</div>
				<div className="modal__Footer">
					{leftButtons}
					<div className="modal__FooterButtonGroup">
						{submitButton}
					</div>
				</div>
			</div>
		);

		var disableView = (
			<div className="modal">
				<div className="modal__Header">
					disable finance {label}
				</div>
				<div className="modal__Body">
					<form className="form">
						<div className="form__InputGroup">
							<label htmlFor="finance-modal-disable-date" className="form__InputLabel">disable from</label>
							<DatepickerComponent
								date={this.state.disabledate}
								onSelect={this.handleDisableDateChange}
								/>
						</div>
						<div className="form__InputGroup">
							<label htmlFor="finance-modal-remove" className="form__InputLabel">remove from timeline
								<input id="finance-modal-remove" ref="remove" type="checkbox"  />
							</label>
						</div>
					</form>
				</div>
				<div className="modal__Footer">
					<button type="button" className="modal__FooterButton modal__FooterButton-default" onClick={this.setViewFinance}><i className="fa fa-chevron-left"></i></button>
					<div className="modal__FooterButtonGroup">
						<button type="button" className="modal__FooterButton modal__FooterButton-red" onClick={this.handleDisableFinance}>disable finance</button>
					</div>
				</div>
			</div>
		);

		return (
			<div className="modal__Wrapper">
				{function() {
					switch(this.state.view) {
						case 'finance':
							return financeView;
							break;
						case 'disable':
							return disableView;
							break;
						default:
							return financeView;
					}
				}.call(this)}
			</div>
		)
	}
});

module.exports = FinanceModal;