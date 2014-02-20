/* jshint undef: true, unused: false */
/* global L,Q,$,$$ */

'use strict';

/*
  Utility functions that can be used anywhere in the code.
*/
var Utility = (function() {
    /**
     * Return an Object sorted by it's Key; http://stackoverflow.com/questions/5467129/sort-javascript-object-by-key
     */
    var sortObjectByKey = function(obj){
        var keys = [];
        var sorted_obj = {};

        for(var key in obj){
            if(obj.hasOwnProperty(key)){
                keys.push(key);
            }
        }

        // sort keys
        keys.sort();

        // create new array based on Sorted Keys
        $.each(keys, function(i, key){
            sorted_obj[key] = obj[key];
        });

        return sorted_obj;
    };

    var personOrPeople = function(quantity) {
        var s;
        if(quantity == 1) {
            s = quantity + ' person';
        } else if(quantity > 1) {
            s = quantity + ' people';
        }
        return s;
    };

    var crashOrCrashes = function(quantity) {
        var s;
        if(quantity == 1) {
            s = quantity + ' crash';
        } else if(quantity > 1) {
            s = quantity + ' crashes';
        }
        return s;
    };

    return {
        sortObjectByKey: sortObjectByKey,
        personOrPeople: personOrPeople,
        crashOrCrashes: crashOrCrashes
    };
}());

/*
  Functions that are more for displaying results are here.
*/
var mapDisplay = (function() {
    var lat;
    var lng;
    var map;
    var center;
    var circle;
    var dist;
    var markerGroup;

    var init = function() {
        lat = $.url().param('lat') || 41.895924;
        lng = $.url().param('lon') || -87.654921;
        center = [lat, lng];

        map = L.map('map').setView(center, 16);
        map.addControl(new L.Control.Permalink({useLocation:true}));
        map.addControl(new L.control.locate({debug:false}));
        // add an OpenStreetMap tile layer
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(map);

        map.on('click', setCoords);

        markerGroup = new L.MarkerClusterGroup({
            maxClusterRadius:20,
            spiderfyDistanceMultiplier:1.3
        });

    };

    var setCoords = function(e) {
        lat = e.latlng.lat;
        lng = e.latlng.lng;

        showCrashes();
    };

    var showCrashes = function() {
        dist = $('input:radio[name="searchRadius"]:checked').val();
        crashBrowser.fetchCrashData();
    };

    // given a JSON crashes row, return popup
    var getCrashDetails = function(feature) {
        var type = null;
        if(feature.collType == 1) {
            type = 'Pedestrian Crash';
        } else if(feature.collType == 2) {
            type = 'Bicycle Crash';
        }

        return '<p>' + type + '</p><p>Date: ' + feature.month + '/' + feature.day + '/' + (parseInt(feature.year) + 2000) + '<br/>' +
        'Injuries: ' + feature.totalInjuries + '<br/>' +
        'Uninjured: ' + feature.noInjuries + '</p>';
    };

    var clearCircle = function() {
        $('#results').hide();
        if(typeof circle !='undefined') {
            map.removeLayer(circle);
            markerGroup.clearLayers();
        }
        map.setView([lat,lng], 18);
        map.closePopup();
    };

    var addCircle = function() {
        // this is in linear distance and it probably won't match the spheroid distance of the RADIANS database query
        var circleOptions = {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.3,
            stroke: false,
            clickable:false
        };

        var meters = dist/3.2808399;
        circle = new L.Circle([lat,lng], meters, circleOptions);
        map.addLayer(circle);

        if (crashBrowser.hasCrashes()) {
            map.fitBounds(markerGroup.getBounds());
        }
    };

    var getAPIUrl = function() {
        //var boundsString = map.getBounds().toBBoxString();
        var bounds = map.getBounds();
        var boundsPadded = bounds.pad(10);

        var southwest = boundsPadded.getSouthWest();
        var south = southwest.lat;
        var west = southwest.lng;
        var northeast = boundsPadded.getNorthEast();
        var north = northeast.lat;
        var east = northeast.lng;

        $('#status').html('Looking through the database...');

        bounds = map.getBounds();
        //console.log(bounds);
        boundsPadded = bounds.pad(10);
        southwest = boundsPadded.getSouthWest();
        south = southwest.lat;
        west = southwest.lng;
        northeast = boundsPadded.getNorthEast();
        north = northeast.lat;
        east = northeast.lng;

        return 'http://chicagocrashes.org/api.php?lat='+lat+'&lng='+lng+'&north='+north+'&south='+south+'&east='+east+'&west='+west+'&distance='+dist;
    };

   var createFeatureMarker = function(feature) {
        var marker = null;
        var details = null;
        var iconValue = null;

        if (feature.collType == 1) {
            iconValue = mapDisplay.pedestrianIcon;
        } else {
            iconValue = mapDisplay.bikeIcon;
        }

        marker = new L.Marker(
            [feature.latitude,feature.longitude],
            {icon: iconValue}
        );

        details = getCrashDetails(feature);

        marker.bindPopup(details);

        return marker;
    };

    var closePopup = function() {
        map.closePopup();
    };

    var addFeatureToMap = function(feature) {
        markerGroup.addLayer(createFeatureMarker(feature));
    };

    var finalizeMarkerGroup = function() {
        map.addLayer(markerGroup);
    };

    var bikeIcon = L.icon({
        iconUrl: 'images/icon_bike.png',
        shadowUrl: 'images/icon_shadow.png',
        iconSize: [32, 37],
        iconAnchor: [16, 38],
        shadowSize: [51, 37],
        shadowAnchor: [25, 38],
        popupAnchor: [0, -38],
    });

    var pedestrianIcon = L.icon({
        iconUrl: 'images/icon_pedestrian.png',
        shadowUrl: 'images/icon_shadow.png',
        iconSize: [32, 37],
        iconAnchor: [16, 38],
        shadowSize: [51, 37],
        shadowAnchor: [25, 38],
        popupAnchor: [0, -38],
    });

    var getMetaData = function() {
        return {
            lat: lat,
            lng: lng,
            dist: dist
        };
    };

    init();

    return {
        bikeIcon: bikeIcon,
        pedestrianIcon: pedestrianIcon,
        getAPIUrl: getAPIUrl,
        showCrashes: showCrashes,
        clearCircle: clearCircle,
        addCircle: addCircle,
        closePopup: closePopup,
        finalizeMarkerGroup: finalizeMarkerGroup,
        addFeatureToMap: addFeatureToMap,
        getMetaData: getMetaData
        };
}());


var crashBrowserDisplay = (function() {
    var outputCrashDataText = function(bikeOutputObj, pedOutputObj, metaDataObj) {
        $('#results').show();

        if (bikeOutputObj !== undefined) {
            $('#counterBicyclist').html(bikeOutputObj.crashes);
            $('#counterBicyclistByYear').html('');
            $('#totalBicyclistInjuries').html(bikeOutputObj.totalInjuries);

            var counterBicyclistByYear = Utility.sortObjectByKey(bikeOutputObj.crashesByYear);
            $.each(counterBicyclistByYear, function(key, value){
             $('#counterBicyclistByYear').append('<div>' + key + ': ' + Utility.crashOrCrashes(value) + ' with ' +
                 Utility.personOrPeople(bikeOutputObj.injuriesByYear[key]) + ' injured & ' +
                 Utility.personOrPeople(bikeOutputObj.noInjuriesByYear[key]) + ' uninjured</div>');
            });
        }

        if (pedOutputObj !== undefined) {
            $('#counterPedestrian').html(pedOutputObj.crashes);
            $('#counterPedestrianByYear').html('');
            $('#totalPedestrianInjuries').html(pedOutputObj.totalInjuries);

            var counterPedestrianByYear = Utility.sortObjectByKey(pedOutputObj.crashesByYear);
            $.each(counterPedestrianByYear, function(key, value){
             $('#counterPedestrianByYear').append('<div>' + key + ': ' + Utility.crashOrCrashes(value) + ' with ' +
                 Utility.personOrPeople(pedOutputObj.injuriesByYear[key]) + ' injured & ' +
                 Utility.personOrPeople(pedOutputObj.noInjuriesByYear[key]) + ' uninjured</div>');
            }); // end each
        }

        $('#radius').html(metaDataObj.dist);
        $('#metadata').slideDown();
        $('#coords').html(metaDataObj.lat+', '+metaDataObj.lng);
        $('#latitude').html(metaDataObj.lat);
        $('#longitude').html(metaDataObj.lng);
        $('#permalink').html('<a href="#lat='+metaDataObj.lat+'&lon='+metaDataObj.lng+'&get=yes">Permalink</a>');
        $('#status').html('');
    };

    /*
        Output our crash data in two separate graphs
    */
    var outputCrashDataGraph = function(bikeOutputObj, pedOutputObj) {
        //
        // Output the summary graph (# of total pedestrian injuries, # of total bicycle injuries, total as encap if possible)
        //
        $('#summaryGraph').highcharts({
            chart: {
                type: 'bar'
            },
            title: {
                text: 'Injury summary (2005-2012)'
            },
            xAxis: {
                categories: ['Injuries']
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Number of Injuries'
                },
                stackLabels: {
                    enabled: true,
                    style: {
                        fontWeight: 'bold'
                    }
                }
            },
            legend: {
                reversed: true
            },
            plotOptions: {
                series: {
                    stacking: 'normal',
                    dataLabels: {
                        enabled: true,
                        color: 'white',
                        fontWeight: 'bold'
                    }
                }
            },
            tooltip: {
                formatter: function() {
                    return '<b>'+ this.x +'</b><br/>'+
                        this.series.name +': '+ this.y +'<br/>'+
                        'Total: '+ this.point.stackTotal;
                }
            },
            series:
                [
                    {
                        name: 'Pedestrian',
                        color: '#fdae68',
                        data: [pedOutputObj === undefined ? "" : pedOutputObj.totalInjuries]
                    },
                    {
                        name: 'Bicycle',
                        color: '#36a095',
                        data: [bikeOutputObj === undefined ? "" : bikeOutputObj.totalInjuries]
                    }
                ]
        });

        var annualBreakdownObj = {};

        if (pedOutputObj !== undefined) {
            pedOutputObj.injuriesByYear.forEach(function(injuries, year) {
                var annualBreakdownDetailObj = {bikeInjuries: 0, pedInjuries: injuries};
                annualBreakdownObj[year] = annualBreakdownDetailObj;
            });
        }

        if (bikeOutputObj !== undefined) {
            bikeOutputObj.injuriesByYear.forEach(function(injuries, year) {
                var annualBreakdownDetailObj;
                if (annualBreakdownObj[year] instanceof Object) {
                    annualBreakdownDetailObj = annualBreakdownObj[year];
                    annualBreakdownDetailObj.bikeInjuries = injuries;
                    annualBreakdownObj[year] = annualBreakdownDetailObj;
                } else {
                annualBreakdownDetailObj = {bikeInjuries: injuries, pedInjuries: 0};
                annualBreakdownObj[year] = annualBreakdownDetailObj;
                }
            });
        }

        var pedInjuryArr = [];
        var bikeInjuryArr = [];
        $.each(annualBreakdownObj, function(index, injuryObject) {
            pedInjuryArr.push(injuryObject.pedInjuries);
            bikeInjuryArr.push(injuryObject.bikeInjuries);
        });

        $('#breakdownGraph').highcharts({
            chart: {
                type: 'bar'
            },
            title: {
                text: 'Annual Breakdown'
            },
            xAxis: {
                categories: Object.keys(annualBreakdownObj)
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Number of Injuries'
                },
                stackLabels: {
                    enabled: true,
                    style: {
                        fontWeight: 'bold'
                    }
                }
            },
            legend: {
                reversed: true
            },
            plotOptions: {
                series: {
                    stacking: 'normal',
                    dataLabels: {
                        formatter: function() {
                            if (this.y === 0) {
                                return '';
                            } else {
                                return this.y;
                            }
                        },
                        enabled: true,
                        color: 'white',
                        fontWeight: 'bold'
                    }
                }
            },
            tooltip: {
                formatter: function() {
                    return '<b>'+ this.x +'</b><br/>'+
                        this.series.name +': '+ this.y +'<br/>'+
                        'Total: '+ this.point.stackTotal;
                }
            },
             series:
                [{
                    name: 'Pedestrian',
                    color: '#fdae68',
                    data: pedInjuryArr
                },
                {
                    name: 'Bicycle',
                    color: '#36a095',
                    data: bikeInjuryArr
                }]
        });

    };

    var resizeGraphs = function() {
        $('#summaryGraph').width($('#list').width()-5);
        $('#breakdownGraph').width($('#list').width()-5);
    };

    var showGraph = function() {
        $('#graphButton').addClass('active');
        $('#textButton').removeClass('active');
        $('#counterTotals').hide();
        $('#graphs').show();
        resizeGraphs();
    };

    var showText = function() {
        $('#graphButton').removeClass('active');
        $('#textButton').addClass('active');
        $('#counterTotals').show();
        $('#graphs').hide();
        resizeGraphs();
    };

    return {
        outputCrashDataGraph: outputCrashDataGraph,
        outputCrashDataText: outputCrashDataText,
        showGraph: showGraph,
        showText: showText
    };

})();

/*
    Main module; delegates most of the functionality to mapDisplay at the moment.
*/
var crashBrowser = (function() {
    var init = function() {
        var get = $.url().param('get');
        if(get == 'yes') {
            fetchCrashData();
        }
    };

    var fetchCrashData = function() {
        var url = mapDisplay.getAPIUrl();
        $.getJSON(url, function(data) {
            mapDisplay.clearCircle();
            generateSummaries(data.crashes);
            mapDisplay.addCircle();
        }).fail(function(){
            $('#status').html('Something went wrong while retrieving data. Please try again later and alert Steven.');
            mapDisplay.closePopup();
        });

    };

    /*
        Returns an array of summary objects for the data provided, i.e.

        [{
            type: 'ped',
            crashes: 2,
            crashesByYear: [2011 => 1, 2012 => 2],
            injuriesByYear: [2011 => 2, 2012 => 5],
            noInjuriesByYear: [2011 => 3, 2012 => 7]
        },
        {
            type: 'bike',
            ...
        }]
    */

    var summaryObjects = [];

    var SummaryObject = function() {
        this.crashes = 0;
        this.totalInjuries = 0;
        this.crashesByYear = [];
        this.injuriesByYear = [];
        this.noInjuriesByYear = [];
    };

    /*
      Helper function that updates a SummaryObject based on the feature read.
    */
    var addFeatureToSummary = function(feature, s) {
        s.crashes++;
        var year = feature.year*1+2000;

        if(s.crashesByYear[year] === undefined) {
            s.crashesByYear[year] = 1;
        } else {
            s.crashesByYear[year]++;
        }

        s.totalInjuries += parseInt(feature.totalInjuries);
        if(s.injuriesByYear[year]) {
            s.injuriesByYear[year] += parseInt(feature.totalInjuries);
        } else {
            s.injuriesByYear[year] = parseInt(feature.totalInjuries);
        }

        if(s.noInjuriesByYear[year]) {
            s.noInjuriesByYear[year] += parseInt(feature.noInjuries);
        } else {
            s.noInjuriesByYear[year] = parseInt(feature.noInjuries);
        }
    };

    /*
      Creates summaryObjects.bicycle and summaryObjects.pedestrian based on
    */
    var generateSummaries = function(crashes) {
        summaryObjects = [];

        if(crashes.length > 0) {
            $.each(crashes, function(i, feature) {
                var s;
                mapDisplay.addFeatureToMap(feature);

                switch (feature.collType) {
                    case '1':
                        if (summaryObjects.pedestrian === undefined) {
                            s = new SummaryObject();
                        } else {
                            s = summaryObjects.pedestrian;
                        }
                        addFeatureToSummary(feature, s);
                        summaryObjects.pedestrian = s;
                    break;
                    case '2':
                        if (summaryObjects.bicycle === undefined) {
                            s = new SummaryObject();
                        } else {
                            s = summaryObjects.bicycle;
                        }
                        addFeatureToSummary(feature, s);
                        summaryObjects.bicycle = s;
                    break;
                }
            });
            mapDisplay.finalizeMarkerGroup();

            var metaDataObj = mapDisplay.getMetaData();

            crashBrowserDisplay.outputCrashDataText(summaryObjects.bicycle, summaryObjects.pedestrian, mapDisplay.getMetaData);
            crashBrowserDisplay.outputCrashDataGraph(summaryObjects.bicycle, summaryObjects.pedestrian, mapDisplay.getMetaData);

        } else {
            $('#status').html('No crashes found within ' + mapDisplay.getMetaData().dist + ' feet of this location');
        }
    };

    var hasCrashes = function() {
        return summaryObjects.length > 0;
    };

    init();

    return {
        fetchCrashData: fetchCrashData,
        hasCrashes: hasCrashes
    };
}());

/*
  Assign module methods to various events.
*/
$(document).ready(function() {
    $('#graphButton').click(function() {
        crashBrowserDisplay.showGraph();
        $.cookie('display', 'graph');
    });

    $('#textButton').click(function() {
        crashBrowserDisplay.showText();
        $.cookie('display', 'text');
    });

    if ($.cookie('display') == 'graph') {
        crashBrowserDisplay.showGraph();
    }

    if ($.cookie('display') == 'text') {
        crashBrowserDisplay.showText();
    }

    $('input:radio[name="searchRadius"]').click(function() {
        mapDisplay.showCrashes();
    });
});
