/**
 * Created by vivaldi on 24/02/14.
 */

angular.module('Savings.Controllers')
	.controller('LoginCtrl', function($scope, $rootScope, $log, $location, $userService, $timeout, $cookies) {


		$scope.errors = false;

		/**
		 * if the browser auto-inserts form values, add them to relevant scope
		 */
		(function() {
			var emailVal	= angular.element(document.getElementById('email')).val();
			var passVal		= angular.element(document.getElementById('password')).val();
			if(emailVal) {
				$scope.email = emailVal;
			}

			if(passVal) {
				$scope.password = passVal;
			}
		})();


		$scope.submit = function() {
			$scope.errors = false;
			$userService.login($scope.email, $scope.password)
				.then(
					function(success) {
						$log.info('Login:', "login success", success);
						mixpanel.track("Logged in", {
							"id": success._id
						});
						mixpanel.identify(success._id);

						$timeout(function(){
							$log.debug("Should have a token by now", $rootScope.token, $cookies.saToken);
							location.reload();
						});
					},
					function(reason) {
						$log.warn('ERR', "Login:", reason);
						$scope.errors = reason;
					});
		};
	});
