/**
 * Created by Vivaldi on 07/08/14.
 */
'use strict';
angular.module('Savings.Controllers')
	.controller('VerifyCtrl', function($scope, $routeParams, $location, $log, $userService) {

		$scope.message = "";
		$scope.success = false;


		if(!$routeParams.token) {
			$scope.message = "Invalid token";
		}

		$userService.verify($routeParams.token)
			.then(function() {
				$scope.success = true;
				$scope.message = "Email address verified successfully";
			},
			function(err) {
				switch(err) {
					case 'ERR_BAD_TOKEN':
						$scope.message = "Error: token is invalid.";
						break;
				}
			});


	});