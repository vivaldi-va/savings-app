/**
 * Created by vivaldi on 27/12/13.
 */

angular.module('Savings.Services')
	.factory('$financeService', function($http, $q, $log) {

		function _createFinance(data) {
			var dfd = $q.defer();

			$http({
				url: 'api/finances',
				method: 'post',
				data: data
			})
				.success(function(status) {
					$log.info("DEBUG: create finance ", status);
					if(status.error) dfd.reject(status);
					else dfd.resolve(status);
				})
				.error(function(reason) {
					dfd.reject(reason);
				});
			return dfd.promise;
		}

		function _getFinances() {
			var dfd = $q.defer();

			$http({
				url: '/api/finances',
				method: 'get'
			})
				.success(function(data) {
					$log.warn('DEBUG: finances data ', data);
					if(data.error) dfd.reject(data.error);
					if(data.success) dfd.resolve(data.data);
				})
				.error(function(reason) {
					$log.warn('ERROR: ' + reason);
					dfd.reject(reason);
				});

			return dfd.promise;
		}

		function _modifyFinance(item) {
			var dfd = $q.defer();

			$http({
				url: '/api/finances/' + item.id,
				method: 'put',
				data: item
			})
				.success(function(status) {
					$log.info('DEBUG: finance item modified');
					if(!status.success) dfd.reject(status.error);
					if(status.success) dfd.resolve(status.message);
				})
				.error(
					function(reason) {
						$log.warn('ERROR: finance item modification failed ', reason);
						dfd.reject(reason);
					}
				);

			return dfd.promise;
		}
		function _disableFinance(id) {
			var dfd = $q.defer();

			$http({
				url: '/api/finances/' + id,
				method: 'delete'
			})
				.success(function(status) {
					$log.info('DEBUG: finance item disabled');
					if(!status.success) dfd.reject(status.error);
					if(status.success) dfd.resolve(status.message);
				})
				.error(
					function(reason) {
						$log.warn('ERROR: finance item failed to be disabled ', reason);
						dfd.reject(reason);
					}
				);

			return dfd.promise;
		}

		return {
			createFinance: _createFinance,
			getFinances: _getFinances(),
			modifyFinance: _modifyFinance,
			disableFinance: _disableFinance
		}
	});
