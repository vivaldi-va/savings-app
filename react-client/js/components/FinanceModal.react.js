/**
 * Created by Zaccary on 24/05/2015.
 */

var React = require('react');

var FinanceModal = React.createClass({
	propTypes: {
		onSubmit: React.PropTypes.func,
		type: React.PropTypes.number,
		finance: React.PropTypes.object,
		open: React.PropTypes.bool
	},
	getDefaultProps: function() {
		"use strict";
		return {
			onSubmit: function() {},
			finance: null,
			type: 0,
			open: false
		};
	},
	render: function() {
		"use strict";
		if(!this.props.open) {
			return null;
		}

		var title;
		var label = this.props.type === 0 ? (<span className="label label-green">income</span>) : (<span className="label label-orange">expense</span>);

		if(!this.props.finance) {
			title = (<span>Add new {label}</span>);
		}

		return (
			<div className="modal__Wrapper">
				<div className="modal">
					<div className="modal__Header">
						{title}
					</div>
					<div className="modal__Body">
						<form action="" className="form">
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
								<select id="finance-modal-interval" ref="interval" type="text" className="input">
									<option value={24}>daily</option>
									<option value={24*7}>weekly</option>
									<option value={24*7*2}>bi-weekly</option>
									<option value={24*7*4}>monthly</option>
									<option value={24*7*4*6}>every 6 months</option>
									<option value={24*7*4*12}>yearly</option>
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
					<div className="modal__Footer"></div>
				</div>
			</div>
		)
	}
});

module.exports = FinanceModal;