var colorRange = ['rgba(255, 133, 26, .8)', 'rgba(255, 146, 51, .8)',
    'rgba(255, 160, 77, .8)', 'rgba(255, 173, 102, .8)',
    'rgba(255, 187, 128, .8)', 'rgba(255, 201, 153, .8)',
    'rgba(255, 215, 179, .8)',
    'rgba(255, 229, 204, .8)', 'rgba(255, 242, 230, .8)',
    'rgba(255, 255, 255, 0.8)'
];
var pieColor = [
    'rgba(255, 102, 0, .8)',
    'rgba(255, 117, 26, .8)',
    'rgba(255, 133, 51, .8)',
    'rgba(255, 166, 77, .8)',
    'rgba(255, 153, 102, .8)',
    'rgba(255, 136, 77, .8)',
    'rgba(255, 179, 102, .8)',
    'rgba(255, 102, 102, .8)',
    'rgba(255, 212, 128, .8)',
    'rgba(255, 170, 128, 0.8)'
];
var app = angular.module('myApp', []);

function buildMetadata(sample) {
    // @TODO: Complete the following function that builds the metadata panel
    var url = `/metadata/${sample}`;
    // Use `d3.json` to fetch the metadata for a sample
    d3.json(url).then(function(data) {
        // Use d3 to select the panel with id of `#sample-metadata`
        //var metaBox = d3.select('#sample-metadata');
        var metaBox = d3.select('.navbar-nav');
        // Use `.html("") to clear any existing metadata
        metaBox.html('');
        // Use `Object.entries` to add each key and value pair to the panel
        var list = Object.entries(data);
        // Hint: Inside the loop, you will need to use d3 to append new
        // tags for each key-value in the metadata.
        for (var i = 0; i < list.length; i++) {
            var line = metaBox.append('li').attr('class', 'nav-item').append('div').attr('class', 'nav-link');
            line.append('label').text(list[i][0]);
            line.append('strong').text(list[i][1]);
        }

        // BONUS: Build the Gauge Chart
        buildGauge(data.WFREQ);
    });

}

function buildGauge(data) {
    var level = data;
    // Trig to calc meter point
    var degrees = 180 - level * 20,
        radius = 0.5;
    var radians = degrees * Math.PI / 180;
    var x = radius * Math.cos(radians);
    var y = radius * Math.sin(radians);
    // Path: may have to change to create a better triangle
    var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
        pathX = String(x),
        space = ' ',
        pathY = String(y),
        pathEnd = ' Z';
    var path = mainPath.concat(pathX, space, pathY, pathEnd);

    var data = [{
            type: 'scatter',
            x: [0],
            y: [0],
            marker: { size: 18, color: '850000' },
            showlegend: false,
            name: 'Weekly Washing Frequency',
            text: level,
            hoverinfo: 'text+name'
        },
        {
            values: [50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50],
            rotation: 90,
            text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
            textinfo: 'text',
            textposition: 'inside',
            marker: {
                colors: colorRange
            },
            labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
            hoverinfo: 'label',
            hole: .5,
            type: 'pie',
            showlegend: false
        }
    ];

    var layout = {
        shapes: [{
            type: 'path',
            path: path,
            fillcolor: '850000',
            line: {
                color: '850000'
            }
        }],
        height: 500,
        width: 500,
        xaxis: {
            zeroline: false,
            showticklabels: false,
            showgrid: false,
            range: [-1, 1]
        },
        yaxis: {
            zeroline: false,
            showticklabels: false,
            showgrid: false,
            range: [-1, 1]
        }
    };

    Plotly.newPlot('gauge', data, layout);
}

function buildCharts(sample) {
    var url = `/samples/${sample}`;
    // @TODO: Use `d3.json` to fetch the sample data for the plots
    d3.json(url).then(function(data) {
        // @TODO: Build a Pie Chart
        var pieData = [{
            values: data.sample_values.slice(0, 10),
            labels: data.otu_ids.slice(0, 10),
            marker: {
                colors: pieColor
            },
            sort: true,
            hovertext: data.otu_labels.slice(0, 10),
            //hoverinfo: 'label+percent+hovertext',
            type: 'pie'
        }];
        var pieLayout = {
            hovermode: 'closest',
            xaxis: { zeroline: false, hoverformat: '.2f', title: 'Rounded: 2 values after the decimal point on hover' },
            yaxis: { zeroline: false, hoverformat: '.2r', title: 'Rounded: 2 significant values on hover' }
        };
        Plotly.newPlot('pie', pieData, pieLayout);
        // @TODO: Build a Bubble Chart using the sample data
        var bubbleData = [{
            x: data.otu_ids,
            y: data.sample_values,
            mode: 'markers',
            hovertext: data.otu_labels,
            marker: {
                size: data.sample_values,
                color: data.otu_ids
            }
        }];

        var bubbleLayout = {
            autosize: true
        }

        Plotly.newPlot('bubble', bubbleData, bubbleLayout);
    });
    // HINT: You will need to use slice() to grab the top 10 sample_values,
    // otu_ids, and labels (10 each).
}

function init() {
    // Grab a reference to the dropdown select element
    //var selector = d3.select("#selDataset");
    app.controller('dataCtrl', function($scope, $http) {
        $scope.samples = {};
        $http.get("/names").then(function(response) {
            $scope.samples = {
                type: 'select',
                name: response.data[0],
                value: response.data[0],
                list: response.data
            }
            const firstSample = response.data[0];
            buildCharts(firstSample);
            buildMetadata(firstSample);
        });
        // init dropdown data
        $scope.$watch('samples.value', function() {
            buildCharts($scope.samples.value);
            buildMetadata($scope.samples.value);
        });
        //
    });

};

function optionChanged(newSample) {
    // Fetch new data each time a new sample is selected
    buildCharts(newSample);
    buildMetadata(newSample);
}

// Initialize the dashboard
init();

// adding sticky bar 
var sticky = $('#tool-bar').offset().top;
$(window).scroll(function() {
    if ($(window).scrollTop() >= sticky) {
        $('#tool-bar').addClass("sticky");
    } else {
        $('#tool-bar').removeClass('sticky');
    }
});