/**
 * Created by vivaldi on 23/02/14.
 */


angular.module('Savings.Controllers')
	.controller('RegisterCtrl', function($scope, $location, $log, $userService) {

		$scope.registering = false;



		$scope.submit = function() {
			$scope.registering = true;
			$scope.errors = {
				"has_errors": false,
				"email": false,
				"password": false,
				"username": false
			};

			if(!$scope.email) {
				$scope.errors.email = "Email is missing";
				$scope.errors.has_errors = true;
			}
			if(!$scope.username) {
				$scope.errors.username = "Username is missing";
				$scope.errors.has_errors = true;
			}
			if(!$scope.password || !$scope.passwordRepeat) {
				$scope.errors.password = "One or more passwords are missing";
				$scope.errors.has_errors = true;
			}
			if(!($scope.password === $scope.passwordRepeat)) {
				$scope.errors.password = "Passwords don't match";
				$scope.errors.has_errors = true;
			}


			if(!$scope.errors.has_errors) {
				$userService.register($scope.email, $scope.password, $scope.username)
					.then(
						function(success) {

							$userService.login($scope.email, $scope.password)
								.then(
									function(loginSuccess) {
										$scope.registering = false;
										$location.path('/timeline');
									},
									function(err) {
										$log.warn('ERR', "login failed after registration", err);
									});
						},
						function(err) {
							$scope.registering = false;
							$log.warn('ERR', "registration failed", err);
						});

			}
		}
	});