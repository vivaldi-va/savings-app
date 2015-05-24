/**
 * Created by Zaccary on 24/05/2015.
 */

var React = require('react');
var FinanceActions = require('../actions/FinanceActions');

var FinanceModal = React.createClass({
	propTypes: {
		onSubmit: React.PropTypes.func
	},
	getDefaultProps: function() {
		"use strict";
		return {
			onSubmit: function() {},
		};
	},
	getInitialState: function() {
		"use strict";
		return {
			interval: 24
		};
	},
	handleInterval: function(e) {
		"use strict";
		console.log('handleInterval', e.target.value);
		this.setState({
			interval: e.target.value
		});
	},
	handleCloseModal: function(e) {
		"use strict";
		e.preventDefault();
		FinanceActions.closeModal();
	},
	handleCreateFinance: function(e) {
		"use strict";
		e.preventDefault();
		var name = this.refs.name.getDOMNode().value;
		var amount = this.refs.amount.getDOMNode().value;
		var interval = this.state.interval;
		var date = new Date(this.refs.date.getDOMNode().value);

		FinanceActions.addFinance({
			name: name,
			amount: amount,
			interval: interval,
			duedate: date,
			type: this.props.modal.type
		});
	},
	render: function() {
		"use strict";
		if(!this.props.modal) {
			return null;
		}

		console.log('modal type ', this.props.modal.type);

		var title;
		var label = this.props.modal.type === 0 ? (<span className="label label-green">income</span>) : (<span className="label label-orange">expense</span>);


		if(!this.props.modal.finance) {
			title = (<span>Add new {label}</span>);
		}

		return (
			<div className="modal__Wrapper">
				<div className="modal">
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
									<option value={24*31*4}>monthly</option>
									<option value={24*31*6}>every 6 months</option>
									<option value={24*31*12}>yearly</option>
								</select>
							</div>
							<div className="form__InputGroup">
								<label htmlFor="finance-modal-date" className="form__InputLabel">start date</label>
								<input id="finance-modal-date" ref="date" type="text" className="input"/>
							</div>
							<div className="form__InputGroup">
								<label htmlFor="finance-modal-description" className="form__InputLabel">description</label>
								<textarea id="finance-modal-description" ref="description" type="text" className="input"></textarea>
							</div>
						</form>
					</div>
					<div className="modal__Footer">
						<div className="modal__FooterButtonGroup">
							<button type="button" className="modal__FooterButton modal__FooterButton-default" onClick={this.handleCloseModal}><i className="fa fa-remove"></i></button>
						</div>
						<div className="modal__FooterButtonGroup">
							<button className="modal__FooterButton modal__FooterButton-green" onClick={this.handleCreateFinance}>Add finance</button>
						</div>
					</div>
				</div>
			</div>
		)
	}
});

module.exports = FinanceModal;