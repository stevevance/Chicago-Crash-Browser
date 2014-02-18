/* jshint undef: true, unused: false */
/* global L,$ */

'use strict';

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
    }
}());

// Group CrashBrowser functionality in a convenient object.
var CrashBrowser = (function() {
    var markerGroup;

    var lat;
    var lng;

    var center;
    var map;
    var circle;

    var year;

    var openPopup = function(e) {
            lat = e.latlng.lat;
            lng = e.latlng.lng;

            L.popup()
                .setLatLng([lat, lng])
                .setContent('Search within <a href="javascript:CrashBrowser.getUrl(50);">50 ft</a>, <a href="javascript:CrashBrowser.getUrl(100);">100 ft</a>, <b><a href="javascript:CrashBrowser.getUrl(150);">150 ft</a></b>, <a href="javascript:CrashBrowser.getUrl(200);">200 ft</a>')
                .openOn(map);
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

    var getUrl = function(distance) {
      var counterPedestrian = 0;
      var counterBicyclist = 0;
      var counterPedestrianByYear = {};
      var counterBicyclistByYear = {};
      if(distance === undefined || distance === null) {
            distance = 150;
      }

      //var boundsString = map.getBounds().toBBoxString();
      var bounds = map.getBounds();
      var boundsPadded = bounds.pad(10);


      var southwest = boundsPadded.getSouthWest();
      var south = southwest.lat;
      var west = southwest.lng;
      var northeast = boundsPadded.getNorthEast();
      var north = northeast.lat;
      var east = northeast.lng;

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

        var url = 'http://chicagocrashes.org/api.php?lat='+lat+'&lng='+lng+'&north='+north+'&south='+south+'&east='+east+'&west='+west+'&distance='+distance;
        // console.log(url);

        counterPedestrian = 0;
        counterPedestrianByYear = {};
        var counterPedInjuriesByYear = {};
        var counterPedNoInjByYear = {};

        counterBicyclist = 0;
        counterBicyclistByYear = {};
        var counterBikeInjuriesByYear = {};
        var counterBikeNoInjByYear = {};

        $.getJSON(url, function(data) {
            // remove some layers first
            $('#results').hide();
            if(typeof circle !='undefined') {
                map.removeLayer(circle);
                markerGroup.clearLayers();
            }
            map.setView([lat,lng], 18);
            // console.log(data);
            //console.log("JSON: Getting the URL");

            var counter = 0;
            if(data.crashes.length > 0) {
                var totalBicyclistInjuries = 0;
                var totalPedestrianInjuries = 0;

                $.each(data.crashes, function(i, feature) {
                    map.closePopup();
                    //console.log("JSON: Iterating through the crashes...");
                    //console.log(counter);
                    //console.log(feature["casenumber"]);
                    //console.log("Latitude should be " + feature.latitude);

                    //var marker = new L.Marker([feature[11],feature[12]]);
                    counter++;
                    year = feature.year*1+2000;
                    var marker = null;
                    var details = null;

                    if(feature.collType == '1') {
                        // pedestrian
                        //marker.setIcon(new icon_pedestrian());

                        marker = new L.Marker(
                            [feature.latitude,feature.longitude],
                            {icon: pedestrianIcon}
                        );

                        details = getCrashDetails(feature);
                        marker.bindPopup(details).openPopup();

                        markerGroup.addLayer(marker);
                        counterPedestrian++;
                        // count the year here
                        if(counterPedestrianByYear[year]) {
                            counterPedestrianByYear[year]++;
                        } else {
                            counterPedestrianByYear[year] = 1;
                        }

                        totalPedestrianInjuries += parseInt(feature.totalInjuries);
                        if(counterPedInjuriesByYear[year]) {
                            counterPedInjuriesByYear[year] += parseInt(feature.totalInjuries);
                        } else {
                            counterPedInjuriesByYear[year] = parseInt(feature.totalInjuries);
                        }

                        if(counterPedNoInjByYear[year]) {
                            counterPedNoInjByYear[year] += parseInt(feature.noInjuries);
                        } else {
                            counterPedNoInjByYear[year] = parseInt(feature.noInjuries);
                        }

                    }
                    if(feature.collType == '2'){
                        // bicyclist
                        //marker.setIcon(new icon_bicycle());
                        marker = new L.Marker(
                            [feature.latitude,feature.longitude],
                            {icon: bikeIcon}
                        );

                        details = getCrashDetails(feature);
                        marker.bindPopup(details).openPopup();

                        markerGroup.addLayer(marker);
                        counterBicyclist++;
                        // count the year here
                        if(counterBicyclistByYear[year]) {
                            counterBicyclistByYear[year]++;
                        } else {
                            counterBicyclistByYear[year] = 1;
                        }

                        totalBicyclistInjuries += parseInt(feature.totalInjuries);
                        if(counterBikeInjuriesByYear[year]) {
                            counterBikeInjuriesByYear[year] += parseInt(feature.totalInjuries);
                        } else {
                            counterBikeInjuriesByYear[year] = parseInt(feature.totalInjuries);
                        }

                        if(counterBikeNoInjByYear[year]) {
                            counterBikeNoInjByYear[year] += parseInt(feature.noInjuries);
                        } else {
                            counterBikeNoInjByYear[year] = parseInt(feature.noInjuries);
                        }
                    }
                });
                map.addLayer(markerGroup);

                // add circle
                // this is in linear distance and it probably won't match the spheroid distance of the RADIANS database query
                var circleOptions = {
                    color: 'red',
                    fillColor: '#f03',
                    fillOpacity: 0.3,
                    stroke: false,
                    clickable:false
                };

                var meters = distance/3.2808399;
                circle = new L.Circle([lat,lng], meters, circleOptions);
                map.addLayer(circle);

                map.fitBounds(markerGroup.getBounds());

                var bikeOutputObj = {type: 'bicycle',
                                 crashes: counterBicyclist,
                                 totalInjuries: totalBicyclistInjuries,
                                 crashYearArr: counterBicyclistByYear,
                                 injuryYearArr: counterBikeInjuriesByYear,
                                 noinjuryYearArr: counterBikeNoInjByYear
                                };

                var pedOutputObj = { type: 'pedestrian',
                                 crashes: counterPedestrian,
                                 totalInjuries: totalPedestrianInjuries,
                                 crashYearArr: counterPedestrianByYear,
                                 injuryYearArr: counterPedInjuriesByYear,
                                 noinjuryYearArr: counterPedNoInjByYear
                                };

                var metaDataObj = {lat: lat,
                               lng: lng,
                               distance: distance
                                };

                outputCrashDataText(bikeOutputObj, pedOutputObj, metaDataObj);
                outputCrashDataGraph(bikeOutputObj, pedOutputObj, metaDataObj);

            } else {
                $('#status').html('No crashes found within ' + distance + ' feet of this location');
            }
      }).fail(function(){
            $('#status').html('Something went wrong while retrieving data. Please try again later and alert Steven.');
        map.closePopup();
      });

    };

    var outputCrashDataText = function(bikeOutputObj, pedOutputObj, metaDataObj) {
        $('#results').show();
        $('#counterBicyclist').html(bikeOutputObj.crashes);
        $('#counterPedestrian').html(pedOutputObj.crashes);
        $('#counterBicyclistByYear').html('');
        $('#counterPedestrianByYear').html('');
        $('#totalBicyclistInjuries').html(bikeOutputObj.totalInjuries);
        $('#totalPedestrianInjuries').html(pedOutputObj.totalInjuries);

        $('#radius').html(metaDataObj.distance);

        var counterBicyclistByYear = Utility.sortObjectByKey(bikeOutputObj.crashYearArr);
        $.each(counterBicyclistByYear, function(key, value){
         $('#counterBicyclistByYear').append('<div>' + key + ': ' + Utility.crashOrCrashes(value) + ' with ' +
             Utility.personOrPeople(bikeOutputObj.injuryYearArr[key]) + ' injured & ' +
             Utility.personOrPeople(bikeOutputObj.noinjuryYearArr[key]) + ' uninjured</div>');
        });

        var counterPedestrianByYear = Utility.sortObjectByKey(pedOutputObj.crashYearArr);
        $.each(counterPedestrianByYear, function(key, value){
         $('#counterPedestrianByYear').append('<div>' + key + ': ' + Utility.crashOrCrashes(value) + ' with ' +
             Utility.personOrPeople(pedOutputObj.injuryYearArr[key]) + ' injured & ' +
             Utility.personOrPeople(pedOutputObj.noinjuryYearArr[key]) + ' uninjured</div>');
        }); // end each

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
                        data: [pedOutputObj.totalInjuries]
                    },
                    {
                        name: 'Bicycle',
                        color: '#36a095',
                        data: [bikeOutputObj.totalInjuries]
                    }
                ]
        });

        //
        // Output the yearly breakdown. Preferably as an array of objects.
        //

        var annualBreakdownObj = {};

        $.each(pedOutputObj.injuryYearArr, function(year, injuries) {
            var annualBreakdownDetailObj = {bikeInjuries: 0, pedInjuries: injuries};
            annualBreakdownObj[year] = annualBreakdownDetailObj;
        });

        $.each(bikeOutputObj.injuryYearArr, function(year, injuries) {
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

        // console.log(annualBreakdownObj);

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
        this.resizeGraphs();
    };

    var showText = function() {
        $('#graphButton').removeClass('active');
        $('#textButton').addClass('active');
        $('#counterTotals').show();
        $('#graphs').hide();
        this.resizeGraphs();
    };

    var init = function() {
        markerGroup = new L.MarkerClusterGroup({
                maxClusterRadius:20,
                spiderfyDistanceMultiplier:1.3
                });
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

        map.on('click', openPopup);

        var get = $.url().param('get');
        if(get == 'yes') {
            getUrl();
        }
    };

    init();

    return {
        openPopup: openPopup,
        getCrashDetails: getCrashDetails,
        getUrl: getUrl,
        outputCrashDataText: outputCrashDataText,
        outputCrashDataGraph: outputCrashDataGraph,
        resizeGraphs: resizeGraphs,
        showGraph: showGraph,
        showText: showText
    };
}());

$(document).ready(function() {
    $('#graphButton').click(function() {
        CrashBrowser.showGraph();
        $.cookie('display', 'graph');
    });

    $('#textButton').click(function() {
        CrashBrowser.showText();
        $.cookie('display', 'text');
    });

    if ($.cookie('display') == 'graph') {
        CrashBrowser.showGraph();
    }

    if ($.cookie('display') == 'text') {
        CrashBrowser.showText();
    }
});
