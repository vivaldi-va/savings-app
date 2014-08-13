/**
 * Created by Vivaldi on 13/08/14.
 */

angular.module('Savings.Services')
	.factory('AssistanceService', function($rootScope) {
		function _startAssistance() {
			var assist = new Anno([
				{
					"target": "#newIncomeButton",
					"position": "right",
					"content": "To start using PennyJar, you'll need to add some 'finances'. " +
						"These can be either income sources..."
				},
				{
					target: "#newExpenseButton",
					position: "left",
					content: "Or expenditures. They will be saved and shown in their respective columns."
				},
				{
					target: "#timeline-scroll",
					position: "left",
					arrowPosition: "center-left",
					content: "Once added, they will appear on the time-line, according to the date they are " +
						"due, or expected"
				}
			]);

			assist.show();
		}

		return {
			start: _startAssistance
		}
	});