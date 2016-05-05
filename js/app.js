angular.module('myApp', [
    'ngRoute'
])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider.otherwise({redirectTo: '/index.html'});
}])

.controller('indexController', ['$scope', '$http', function($scope, $http) {
    $scope.title = "Title";
    $scope.data = {};
    $http.get('http://localhost:8080/api/heartrate').success(function(data) {
        $scope.data = data;
    });
}]);