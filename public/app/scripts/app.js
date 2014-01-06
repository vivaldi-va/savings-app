'use strict';
angular.module('Savings.Config', []);
angular.module('Savings.Services', []);
angular.module('Savings.Controllers', []);
angular.module('Savings.Filters', []);

angular.module('Savings', [
		'ngRoute',
		'Savings.Config',
		'Savings.Services',
		'Savings.Controllers',
		'Savings.Filters'
	]);

