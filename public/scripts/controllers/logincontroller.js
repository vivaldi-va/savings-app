/**
 * Created by vivaldi on 24/02/14.
 */

angular.module('Savings.Controllers')
	.controller('LoginCtrl', function($scope, $log, $location, $userService) {
		$scope.submit = function() {
			$userService.login($scope.email, $scope.password)
				.then(
					function(success) {
						$log.info('Login:', "login success");
						$location.path('/timeline')
					},
					function(reason) {
						$log.warn('ERR', "Login:", reason);
					});
		};
	});