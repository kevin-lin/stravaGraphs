angular.module('myApp', [
    'ngRoute'
])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider.otherwise({redirectTo: '/index.html'});
}])

.controller('indexController', ['$scope', function($scope) {
    $scope.title = "Title";
}]);