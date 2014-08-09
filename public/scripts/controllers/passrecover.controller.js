/**
 * Created by Vivaldi on 07/08/14.
 */

angular.module('Savings.Controllers')
	.controller('RecoverCtrl', function($scope, $routeParams, $log, $userService) {

		$scope.errors		= null;
		$scope.token		= $routeParams.token || null;
		$scope.formActive	= false;
		$scope.formSuccess	= false;

		// check if the token is in route params
		// if so, means we want to reset the password
		// so make sure the token is valid first
		if($scope.token) {
			$userService.validateRecoverRequest($scope.token)
				.then(
					function() {
						$scope.formActive = true;
					},
					function() {
						$scope.errors = {"token": "Nonexistent or expired token used"};
					});

		} else {
			// if there's no token, it's just a plain old recovery request
			// so do whatever
			$scope.formActive = true;
		}

		$scope.submitRequest = function(email) {

			$scope.errors = null;
			$log.debug('Submit recovery request', $scope.email, email);
			if(email.length) {
				$userService.requestRecovery(email)
					.then(function() {
						$scope.formSuccess = true;
					});
			} else {
				$scope.errors = {"email": "Email address is missing"};
			}
		};

		$scope.submitReset = function(password1, password2) {

			$scope.errors = null;
			$log.debug('Submit password reset');
			if(password1 !== password2) {
				$scope.errors = {"password": "passwords don't match"};
			} else {
				$userService.recover($scope.token, password1)
					.then(function() {
						$scope.formSuccess = true;
					});
			}
		};


	});