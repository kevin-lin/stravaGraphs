Chart.defaults.global.responsive = false;

angular.module('myApp', [
    'ngRoute'
])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider.otherwise({redirectTo: '/index.html'});
}])

.controller('indexController', ['$scope', '$http', function($scope, $http) {
    $scope.title = "Title";
    $scope.data = 0;
    $http.get('http://localhost:8080/api/heartrate/zones').success(function(data) {
        $scope.data = data;
        var arr = [];
        arr.push(data.z1);
        arr.push(data.z2);
        arr.push(data.z3);
        arr.push(data.z4);
        arr.push(data.z5);
        var ctx = document.getElementById("myChart");
        var myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ["Z1", "Z2", "Z3", "Z4", "Z5"],
                datasets: [{
                    label: 'Time in each zone',
                    backgroundColor: ["#E7D9DA", "#E5C1C1", "#D9A7A8", "#FB0017", "#B40312"],
                    data: arr
                }]
            },
            options: {
                stacked: true,
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero:true
                        }
                    }]
                }
            }
        });
        var ctx2 = document.getElementById("myDonut");
        var myDonut= new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: ["Z1", "Z2", "Z3", "Z4", "Z5"],
                datasets: [{
                    label: 'Time in each zone',
                    backgroundColor: ["#E7D9DA", "#E5C1C1", "#D9A7A8", "#FB0017", "#B40312"],
                    data: arr
                }]
            }
        });
    });
    $http.get('http://localhost:8080/api/heartrate/sufferscore').success(function(data) {
        $scope.sufferscore = data;
    });
}]);

