/**
 * Created by Zaccary on 31/05/2015.
 */


var React = require('react');
var DatePicker = require('react-date-picker');
var Moment = require('Moment');
var ClickOutside = require('react-onclickoutside');
var ClassNames = require('classnames');
var Tether = require('tether');

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
	componentDidMount: function() {
		"use strict";
		console.log('componentDidMount');
		var tether = new Tether({
			element: this.refs.picker.getDOMNode(),
			target: this.refs.dateinput.getDOMNode(),
			attachment: 'top left',
			targetAttachment: 'bottom left',
			constraints: [
				{
					to: 'window',
					attachment: 'together',
					pin: true
				}
			]
		});

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

		var pickerClassNames = ClassNames('datePicker', 'ignore-react-onclickoutside', {'datePicker-active': this.state.open});

		return (
			<div >
				<input
					ref="dateinput"
					value={Moment(this.props.date).format('DD/MM/YYYY')}
					type="text"
					className="input"
					onFocus={this.handleFocusDatepicker}
					/>

				<div onClick={this.handleClickPicker}>
					<DatePicker
						ref="picker"
						className={pickerClassNames}
						dateFormat="DD/MM/YYYY"
						date={this.state.date}
						onChange={this.props.onSelect}
						onClick={this.handleClickPicker}
						/>
				</div>
			</div>
		)


	}
});

module.exports = DatepickerComponent;