var traffic_history = {};
var ctx = document.getElementById("myChart").getContext('2d');
var fontSize = 20;
var units = ['B', 'KB', 'MB'];
var colors = [
    '#001f3f',
    '#0074D9',
    '#7FDBFF',
    '#39CCCC',
    '#3D9970',
    '#2ECC40',
    '#01FF70',
    '#FFDC00',
    '#FF851B',
    '#FF4136',
    '#85144b',
    '#F012BE',
    '#B10DC9',
    '#AAAAAA',
    '#DDDDDD'
];
var socket = io();
socket.emit('join', 'traffic');

var trafficChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [55, 50, 45, 40, 35, 30, 25, 20, 15, 10, 5, 0]
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
    popChart(trafficChart, formatTrafficHistory(unitPow), unitPow);
});

function popChart(chart, traffic, unitPow) {
    var hosts = Object.keys(traffic).sort();
    console.log(hosts);
    chart.data.datasets = [];
    hosts.forEach((host, index) => {
        chart.data.datasets.push({
            label: host,
            data: traffic[host],
            backgroundColor: colors[index % colors.length]
        });
    });
    chart.options.scales.yAxes[0].scaleLabel = {
        display: true,
        labelString: units[unitPow] + 'ps',
        fontSize: fontSize
    }
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
        if(!traffic_history[host.ip]) { traffic_history[host.ip] = [0,0,0,0,0,0,0,0,0,0,0,0]; }

        traffic_history[host.ip].push(host.bytes);

        if(traffic_history[host.ip].length > 12) {
            traffic_history[host.ip].shift();
        }

        total += host.bytes;
    });

    if(!traffic_history['Total']) { traffic_history['Total'] = [0,0,0,0,0,0,0,0,0,0,0,0]; }

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