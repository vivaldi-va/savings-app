/**
 * Created by vivaldi on 04/03/14.
 */

angular.module('Savings.Controllers')
	.controller('UserMenuCtrl', function($scope, $rootScope) {
		$scope.dropdown = false;
		console.log($rootScope.user);
		$scope.currency = $rootScope.user.currency;

		$scope.toggleDropdown = function() {
			$scope.dropdown = !$scope.dropdown;
		};

	});