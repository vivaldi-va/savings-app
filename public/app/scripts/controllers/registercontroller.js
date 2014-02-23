/**
 * Created by vivaldi on 23/02/14.
 */


angular.module('Savings.Controllers')
	.controller('RegisterCtrl', function($scope, $userService) {
		$scope.submit = function() {
			$userService.register($scope.email, $scope.password, $scope.username)
				.then(
					function(success) {

					}
				);
		}
	});