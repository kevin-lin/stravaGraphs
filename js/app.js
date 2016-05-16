Chart.defaults.global.responsive = false;

var arr = [];
arr.push(heartRateZones.z1);
arr.push(heartRateZones.z2);
arr.push(heartRateZones.z3);
arr.push(heartRateZones.z4);
arr.push(heartRateZones.z5);
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
