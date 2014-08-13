/**
 * Created by vivaldi on 23/02/14.
 */

'use strict';
angular.module('Savings.Controllers')
	.controller('RegisterCtrl', function($scope, $location, $log, $userService) {

		$scope.registering		= false;
		$scope.registerSuccess	= false;



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
			} else if($scope.password !== $scope.passwordRepeat) {
				$scope.errors.password = "Passwords don't match";
				$scope.errors.has_errors = true;
			}


			if(!$scope.errors.has_errors) {
				$userService.register($scope.email, $scope.password, $scope.username)
					.then(
						function(success) {
							$scope.registerSuccess = true;

							mixpanel.identify(success._id);
							mixpanel.track("New account created", {
								"id": success._id
							});
							mixpanel.people.set({
								"$created": new Date(),
								"$last_login": new Date(),
								"$email": $scope.email,
								"$name": $scope.username
							});

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
		};
	});