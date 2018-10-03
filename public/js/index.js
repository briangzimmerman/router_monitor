var traffic_history = {};
var ctx = document.getElementById("myChart").getContext('2d');
var fontSize = 20;
var units = ['B', 'KB', 'MB'];
var socket = io();
socket.emit('join', 'traffic');

var trafficChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [60, 55, 50, 45, 40, 35, 30, 25, 20, 15, 10, 5, 0]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                    fontSize: fontSize
                }
            }],
            xAxes: [{
                ticks: {
                    fontSize: fontSize
                }
            }]
        },
        legend: {
            labels: {
                fontSize: fontSize
            }
        }
    }
});

socket.on('traffic_update', (traffic) => {
    // traffic = JSON.parse(traffic);
    console.log(traffic);
    updateHistory(traffic);
    var unitPow = findMaxUnit();
    popChart(trafficChart, formatTrafficHistory(unitPow));
});

function popChart(chart, traffic) {
    var hosts = Object.keys(traffic).sort();
    console.log(hosts);
    chart.data.datasets = [];
    hosts.forEach((host) => {
        chart.data.datasets.push({
            label: host,
            data: reverse(traffic[host])
        });
    });
    chart.update();
}

function formatTrafficHistory(unitPow) {
    var formattedTraffic = {};

    Object.keys(traffic_history).forEach((key) => {
        formattedTraffic[key] = traffic_history[key].map((bytes) => {
            return (bytes / Math.pow(1024, unitPow)).toFixed(2);
        });
    })

    return formattedTraffic;
}

function updateHistory(traffic) {
    var total = 0;

    traffic.forEach((host) => {
        if(!traffic_history[host.ip]) { traffic_history[host.ip] = []; }

        traffic_history[host.ip].push(host.bytes);

        if(traffic_history[host.ip].length > 12) {
            traffic_history[host.ip].shift();
        }

        total += host.bytes;
    });

    if(!traffic_history['Total']) { traffic_history['Total'] = []; }

    traffic_history['Total'].push(total);
    if(traffic_history['Total'].length > 12) { traffic_history['Total'].shift(); }
}

function findMaxUnit() {
    var max = 0;

    traffic_history['Total'].forEach((bytes) => {
        if(bytes > max) { max = bytes; }
    })

    return max == 0 ? 0 : Math.floor(Math.log(max) / Math.log(1024));
}

function reverse(arr) {
    
    var reversed = []
    
    for (var i = arr.length - 1; i >= 0; i--) {
        reversed.push(arr[i])
    }

    return reversed;
}