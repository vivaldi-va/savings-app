/**
 * Created by Zaccary on 31/05/2015.
 */


var React = require('react');
var DatePicker = require('react-date-picker');
var Moment = require('Moment');
var ClickOutside = require('react-onclickoutside');

var DatepickerComponent = React.createClass({
	mixins: [ClickOutside],
	propTypes: {
		onSelect: React.PropTypes.func,
		pickerState: React.PropTypes.bool,
		date: React.PropTypes.object
	},
	getDefaultProps: function() {
		"use strict";
		return {
			onSelect: function() {},
			pickerState: false,
			date: new Date()
		};
	},
	getInitialState: function() {
		"use strict";
		return {
			open: false
		};
	},
	handleClickOutside: function(e) {
		"use strict";
		this.setState({
			open: false
		});
	},
	handleFocusDatepicker: function(e) {
		"use strict";
		this.setState({
			open: true
		});
	},
	render: function() {
		"use strict";

		return (
			<div>
				<input
					value={Moment(this.props.date).format('DD/MM/YYYY')}
					type="text"
					className="input"
					onFocus={this.handleFocusDatepicker}
					/>

				{function() {
					if(this.state.open) {
						return (
							<div onClick={this.handleClickDatepicker}>
								<DatePicker
									className="datePicker"
									dateFormat="DD/MM/YYYY"
									date={this.state.date}
									onChange={this.props.onSelect}
									/>
							</div>
						);
					}
				}.call(this)}
			</div>
		)


	}
});

module.exports = DatepickerComponent;