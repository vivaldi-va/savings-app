/**
 * Created by vivaldi on 04/03/14.
 */

angular.module('Savings.Controllers')
	.controller('UserMenuCtrl', function($scope, $rootScope, $location, $userService) {
		$scope.dropdown = false;
		console.log($rootScope.user);

		$scope.toggleDropdown = function() {
			$scope.dropdown = !$scope.dropdown;
		};

		$scope.logout = function() {
			$userService.logout();
			$rootScope.logged_in = false;
			$location.path('/login');
		};

	});