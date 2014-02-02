'use strict';

var rabbitModule = angular.module('RabbitModule', ['ngRoute']);

rabbitModule.factory('socket', function ($rootScope) {
	var socket = io.connect('http://localhost');
	return {
		on: function (eventName, callback) {
			socket.on(eventName, function () {
				var args = arguments;
				$rootScope.$apply(function () {
					callback.apply(socket, args);
				});
			});
		},
		emit: function (eventName, data, callback) {
			socket.emit(eventName, data, function () {
				var args = arguments;
				$rootScope.$apply(function () {
					if (callback) {
						callback.apply(socket, args);
					}
				});
			});
		}
	};
});

rabbitModule.config(['$routeProvider',
	function ($routeProvider) {
		$routeProvider.when('/', {
			controller: 'RabbitController',
			templateUrl: 'views/index.html'
		}).otherwise({
			redirectTo: '/'
		});
}]);

rabbitModule.controller('RabbitController', ['$rootScope', '$scope', 'socket',
		function ($rootScope, $scope, socket) {

		var stocks = ["IBM", "SDR"];
		$scope.stocks = stocks;
		$scope.prices = stocks.map(function (stock) {
			return {
				ticker: stock,
				value: Math.random() * 1000
			};
		});

		socket.on('init', function (data) {
			console.log("init");
		});

		socket.on('tick', function (data) {
			console.log(data.ticker);
			$("td[data-ticker='" + data.ticker + "']").text(data.value);
			$scope.data = data;
		});

		}]);

// var socket = io.connect();
// socket.on('news', function(data) {
// console.log(data);
// console.log('%s, %d', data.ticker, data.value);
// $("td[data-ticker='" + data.ticker + "']").text(data.value);
// });