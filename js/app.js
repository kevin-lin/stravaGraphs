Chart.defaults.global.responsive = false;
var heartRateZones = [0,0,0,0,0];

var ctx = document.getElementById("myChart");
var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ["Z1", "Z2", "Z3", "Z4", "Z5"],
        datasets: [{
            label: 'Time in each zone',
            backgroundColor: ["#E7D9DA", "#E5C1C1", "#D9A7A8", "#FB0017", "#B40312"],
            data: heartRateZones
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
            data: heartRateZones
        }]
    }
});

function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    };
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}
function updateCharts(activity_id){
    return function(){
        httpGetAsync('/api/heartrate/zones/' + activity_id, function(response){
            var hrZones = JSON.parse(response);
            myChart.data.datasets[0].data = hrZones;
            myDonut.data.datasets[0].data = hrZones;
            myChart.update();
            myDonut.update();
        });
    };
}

var sideBarActivities = document.getElementsByClassName('activity');
for(var i = 0; i < sideBarActivities.length; i += 1){
    var sideBarActivity = sideBarActivities[i];
    sideBarActivity.onclick = updateCharts(sideBarActivity.getAttribute('activity_id'));
}