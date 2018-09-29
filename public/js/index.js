var traffic_history = {};
var ctx = document.getElementById("myChart").getContext('2d');
var fontSize = 20;
var units = ['B', 'KB', 'MB'];
var socket = io();
socket.emit('join', 'traffic');

var myChart = new Chart(ctx, {
    type: 'line',
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
    traffic = JSON.parse(traffic);
    updateHistory(traffic);
    var unitPow = findMaxUnit();
    console.log(units[unitPow]);
    console.log(formatTrafficHistory(unitPow));
});

function popChart(chart, traffic) {
    return;
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
            traffic_history[host.ip].pop();
        }

        total += host.bytes;
    });

    if(!traffic_history['Total']) { traffic_history['Total'] = []; }

    traffic_history['Total'].push(total);
    if(traffic_history['Total'].length > 12) { traffic_history['Total'].pop; }
}

function findMaxUnit() {
    var max = 0;

    traffic_history['Total'].forEach((bytes) => {
        if(bytes > max) { max = bytes; }
    })

    return max == 0 ? 0 : Math.floor(Math.log(max) / Math.log(1024));
}