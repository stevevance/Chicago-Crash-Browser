/* jshint undef: true, unused: false */
/* global L,Q,$,$$,console,Rhaboo,document */

'use strict';

/*
*   Collision type enumerations. The variable type matters, because
*   switch statements use === for comparisons.
*/
var CollisionEnum = Object.freeze({
    PEDESTRIAN: 1,
    BICYCLIST: 2
});

var store = Rhaboo.persistent('crashBrowser');

/*
*   Utility functions that can be used anywhere in the code.
*/
var Utility = (function() {
    /**
     *  Return an Object sorted by it's Key; http://stackoverflow.com/questions/5467129/sort-javascript-object-by-key
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

    /*
    *   Returns plural forms of common words.
    */
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
*   Methods that interact with the map layers
*/
var mapDisplay = (function() {
    var lat;
    var lng;
    var map;
    var center;
    var circle;
    var poly;
    var dist;
    var markerGroup;
    var self;
    var latlngs;
    var isDrawing = false;

    var shapeOptions = {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.3,
        stroke: false,
        clickable:false
    };

    var init = function() {
        self = this;
        var initLat = $.url().fparam('lat') || 41.895924;
        var initLng = $.url().fparam('lon') || -87.654921;
        setCoordinates(initLat, initLng);
        center = [lat, lng];

        var drawOptions = {
            draw: {
                circle: false,
                polyline: false,
                marker: false
            }
        };

        var drawControl = new L.Control.Draw(drawOptions);

        map = L.map('map').setView(center, 16);
        map.addControl(new L.Control.Permalink({useLocation:true}));
        map.addControl(new L.control.locate({debug:false}));
        map.addControl(drawControl);

        /* TILE LAYERS */
		var streets = L.tileLayer('https://{s}.tiles.mapbox.com/v3/foursquare.m3elv7vi/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
			detectRetina:true,
			maxZoom: 20,
			maxNativeZoom: 19
		});
		var buildings = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
			detectRetina:true,
			maxZoom: 20,
			maxNativeZoom: 19
		});

		// Add the tile layers to an object
		var baseMaps = {'Streets': streets, 'Building Names': buildings};
		streets.addTo(map); // load "streets" (Foursquare) by default

		// Create an empty object to which we might add data layers that can be toggled
		var otherLayers =  {};

		// create a layer control that turns on/off layers
		var control = L.control.layers(baseMaps, otherLayers, {collapsed: false, autoZIndex:false}).addTo(map);

        map.on('click', function(e) {
            $('#address').val('');
            if (!mapDisplay.isDrawing) {
                setCoordinates(e.latlng.lat, e.latlng.lng);
                showCrashes({ 'areaType': 'circle' });
            }
        });

        map.on('draw:drawstart', function() {
            mapDisplay.isDrawing = true;
            mapDisplay.clearAreas();
        });

        map.on('draw:drawstop', function() {
            mapDisplay.isDrawing = false;
        });

        map.on('draw:created', function(e) {
            poly = e.layer;
            showCrashes({
                areaType: 'polygon'
            });
        });

        markerGroup = new L.MarkerClusterGroup({
            maxClusterRadius:15,
            spiderfyDistanceMultiplier:1.3
        });

    };

    /*
    *   Let's consistently allow access mapDisplay's lat/lng pair with a setter.
    */
    var setCoordinates = function(newLat, newLng) {
        lat = newLat;
        lng = newLng;
    };

    /*
    *   Notifies the crashBrowser module to fetch updated crash data for
    *   the current latitude and longitude in the map.
    *
    *   @param opts Options hash that modifies the behavior of this method
    *          areaType: 'polygon' or 'circle'
    *          layer: If polygon, the layer that was created
    */
    var showCrashes = function(opts) {
        $('#results').hide();
        $('#metadata-link').hide();
        dist = $('input[name="searchRadius"]:checked').val();
        if (!opts || opts.areaType === 'circle') {
            crashBrowser.fetchCrashDataByCircle();
        } else {
            crashBrowser.fetchCrashDataByPoly();
        }
    };

    /*
    *   Takes a feature row from the API and outputs basic information
    *   for the crash in a Leaflet popup window
    */
    var getCrashDetails = function(feature) {
        var type = null;
        if(feature.collType == CollisionEnum.PEDESTRIAN) {
            type = 'Pedestrian Crash';
        } else if(feature.collType == CollisionEnum.BICYCLIST) {
            type = 'Bicycle Crash';
        }

        return '<p><strong>' + type + '</strong></p><p>Case Number: ' + feature.casenumber + '<br/>Date: ' + feature.month + '/' + feature.day + '/' + (parseInt(feature.year) + 2000) + '<br/>' +
        'Injuries: ' + feature.totalInjuries + '<br/>' +
        'Fatalities: ' + feature.totalKilled + '<br/>' +
        'Uninjured: ' + feature.noInjuries + '</p>';
    };

    /*
    *   Removes marker group and circle from the map.
    */
    var clearAreas = function() {
        $('#results').hide();
        if(typeof circle !== 'undefined') {
            map.removeLayer(circle);
            markerGroup.clearLayers();
        }
        if(typeof poly !== 'undefined') {
            map.removeLayer(poly);
            markerGroup.clearLayers();
        }
        map.closePopup();
    };

    /**
    *   Adds circle to the map and fits the amp boundaries to the marker group, if applicable
    */
    var addCircle = function() {
        // this is in linear distance and it probably won't match the spheroid distance of the RADIANS database query
        var meters = dist/3.2808399;
        circle = new  L.Circle([lat,lng], meters, shapeOptions);
        map.addLayer(circle);

        if (crashBrowser.hasCrashes()) {
            map.fitBounds(markerGroup.getBounds());
        }
    };

    /**
    *   Adds a polygon to the map and fits the map boundaries to the marker group, if possible
    */
    var addPoly = function() {
        map.addLayer(poly);

        if (crashBrowser.hasCrashes()) {
            map.fitBounds(markerGroup.getBounds());
        }
    };

    /**
    *   Returns the API url for the current map view.
    */
    var getAPIUrl = function() {
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

    /**
    *   Returns the API url for the current map view if searching by polygon
    */
    var getAPIUrlForPoly = function () {
        $('#status').html('Looking through the database...');

        var coords = '';
        poly.getLatLngs().forEach(function (coord, index, collection) {
            coords += coord.lng + ' ' + coord.lat + ',';
        });
        // Append last point
        var lastPoint = poly.getLatLngs()[0];
        coords += lastPoint.lng + ' ' + lastPoint.lat;

        return 'http://chicagocrashes.org/api2.php?coords=' + coords;
    };

    /**
    *   Based on the individual crash data passed in, creates a map marker,
    *   with details bound to it in a popup.
    */
   var createFeatureMarker = function(feature) {
        var marker = null;
        var details = null;
        var iconValue = null;

        if (feature.collType == CollisionEnum.PEDESTRIAN) {
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

    /**
    *   Helper function that wraps the feature creation and adds it to the map.
    */
    var addFeatureToMap = function(feature) {
        markerGroup.addLayer(createFeatureMarker(feature));
    };

    /**
    *   Called after adding all of the features to the map; actually adds the
    *   markerGroup to the map.
    */
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

    /**
    *   Returns a map metadata object.
    */
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
        getAPIUrlForPoly: getAPIUrlForPoly,
        showCrashes: showCrashes,
        clearAreas: clearAreas,
        addCircle: addCircle,
        addPoly: addPoly,
        closePopup: map.closePopup,
        finalizeMarkerGroup: finalizeMarkerGroup,
        addFeatureToMap: addFeatureToMap,
        getMetaData: getMetaData,
        setCoordinates: setCoordinates,
        isDrawing: isDrawing
        };
}());

/*
*   Methods used to control the display of CrashBrowser summary information
*/
var summaryDisplay = (function() {

    /**
    *   Issue #28: Since some crashes may not have any injuries, we need a helper function
    *   that catches this condition and returns 0 instead.
    */
    var injuryFigure = function(injuries) {
        if (injuries === undefined) {
            return 0;
        } else {
            return injuries;
        }
    };

    /**
    *   Outputs the textual representation of crashes located in a given distance.
    */
    var outputCrashDataText = function(bikeOutputObj, pedOutputObj) {
        $('#results').show();

        if (bikeOutputObj !== undefined) {
            $('#counterBicyclist').html(bikeOutputObj.crashes);
            $('#counterBicyclistByYear').html('');
            $('#totalBicyclistInjuries').html(bikeOutputObj.totalInjuries);

            var counterBicyclistByYear = Utility.sortObjectByKey(bikeOutputObj.crashesByYear);
            $.each(counterBicyclistByYear, function(key, value){
             $('#counterBicyclistByYear').append('<div>' + key + ': ' + Utility.crashOrCrashes(value) + ' with ' +
                 injuryFigure(Utility.personOrPeople(bikeOutputObj.injuriesByYear[key])) + ' injured & ' +
                 injuryFigure(Utility.personOrPeople(bikeOutputObj.noInjuriesByYear[key])) + ' uninjured</div>');
            });
        }

        if (pedOutputObj !== undefined) {
            $('#counterPedestrian').html(pedOutputObj.crashes);
            $('#counterPedestrianByYear').html('');
            $('#totalPedestrianInjuries').html(pedOutputObj.totalInjuries);

            var counterPedestrianByYear = Utility.sortObjectByKey(pedOutputObj.crashesByYear);
            $.each(counterPedestrianByYear, function(key, value){
             $('#counterPedestrianByYear').append('<div>' + key + ': ' + Utility.crashOrCrashes(value) + ' with ' +
                 injuryFigure(Utility.personOrPeople(pedOutputObj.injuriesByYear[key])) + ' injured & ' +
                 injuryFigure(Utility.personOrPeople(pedOutputObj.noInjuriesByYear[key])) + ' uninjured</div>');
            }); // end each
        }

        $('#status').html('');
    };

    /*
    *   Output our crash data in two separate graphs.
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
                categories: ['Injuries', 'Fatalities']
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
                        data: [pedOutputObj === undefined ? '' : pedOutputObj.totalInjuries,
                                pedOutputObj === undefined ? '' : pedOutputObj.totalKilled]
                    },
                    {
                        name: 'Bicycle',
                        color: '#36a095',
                        data: [bikeOutputObj === undefined ? '' : bikeOutputObj.totalInjuries,
                                bikeOutputObj === undefined ? '' : bikeOutputObj.totalKilled]
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

    /*
    *   After showing graphs in the sidebar, resize to fit within viewport.
    */
    var resizeGraphs = function() {
        $('#summaryGraph').width($('#list').width()-15);
        $('#breakdownGraph').width($('#list').width()-15);
    };

    /*
    *   Toggles showing the graph.
    */
    var showGraph = function() {
        $('#counterTotals').hide();
        $('#graphs').show();
        resizeGraphs();
    };

    /**
    *   Toggles showing text.
    */
    var showText = function() {
        $('#counterTotals').show();
        $('#graphs').hide();
        resizeGraphs();
    };

    var populateMetaData = function(metaDataObj) {
        $('#radius').html(metaDataObj.dist);
        $('#coords').html(metaDataObj.lat+', '+metaDataObj.lng);
        $('#latitude').html(metaDataObj.lat);
        $('#longitude').html(metaDataObj.lng);
        $('#permalink').html('<a href="#lat='+metaDataObj.lat+'&lon='+metaDataObj.lng+'&get=yes">Permalink</a>');
        $('#metadata-link').show();
    };

    return {
        outputCrashDataGraph: outputCrashDataGraph,
        outputCrashDataText: outputCrashDataText,
        populateMetaData: populateMetaData,
        showGraph: showGraph,
        showText: showText
    };

})();

/*
    Main module; handles the general behavior of the application, delegating as needed.
*/
var crashBrowser = (function() {
    var init = function() {};
    var addresses = [];

    /*
    *   Communicates with the OpenStreetMap API to get coordinates for a given (Chicago!) address.
    *   Since this calls an external service, this needs to return a jQuery promise.
    */
    var fetchCoordsForAddress = function() {
        var dfd = $.Deferred();

        if ($('#address').val()) {
            $.getJSON('http://nominatim.openstreetmap.org/search?street=' + $('#address').val() + '&city=Chicago&state=IL&format=json', function(data) {
                if (data.length > 0 && !!data[0].lat && !!data[0].lon) {
                    dfd.resolve(data);
                } else {
                    dfd.reject();
                }
            }).fail(function() {
                dfd.reject();
            });
        }
        return dfd.promise();
    };

    var setAddresses = function setAddresses(addrs) {
        addresses = addrs;
    };

    var getAddresses = function getAddresses() {
        return addresses;
    };

    var saveAddressAndShowCrashes = function() {
        var searchAddress = $('#address').val();
        $.when( fetchCoordsForAddress() ).then(
        function(data) {
            if (addresses.indexOf(searchAddress) === -1) {
                addresses.push(searchAddress);
                if (addresses.length > 15) {
                    addresses.shift();
                }
                store.write('addresses', addresses);
            }
            mapDisplay.setCoordinates(data[0].lat, data[0].lon);
            mapDisplay.showCrashes();
        }, function() {
            var badIdx = addresses.indexOf(searchAddress);
            if (badIdx !== -1) {
                addresses.splice(badIdx, 1);
                store.write('addresses', addresses);
            }
            addressError();
            mapDisplay.closePopup();
        });
    };

    var addressError = function() {
        $('#status').html('Could not locate this address. Please try again later, or use a valid Chicago address!');
    };

    /*
    *   Communicates with the backend API to get crash data for the distance provided.
    */
    var fetchCrashDataByCircle = function() {
        var url = mapDisplay.getAPIUrl();
        $.getJSON(url, function(data) {
            mapDisplay.clearAreas();
            generateSummaries(data.crashes);
            mapDisplay.addCircle();
        }).fail(function(){
            $('#status').html('Something went wrong while retrieving data. Please try again later and alert Steven.');
            mapDisplay.closePopup();
        });

    };

    var fetchCrashDataByPoly = function () {
        var url = mapDisplay.getAPIUrlForPoly();
        $.getJSON(url, function(data) {
            mapDisplay.clearAreas();
            generateSummaries(data.crashes);
            mapDisplay.addPoly();
        }).fail(function () {
            $('#status').html('Something went wrong while retrieving data. Please try again later and alert Steven.');
            mapDisplay.closePopup();
        });
    };

    /*
    *   Returns an array of summary objects for the data provided, i.e.
    *
    *   [{
    *       type: 'ped',
    *       crashes: 2,
    *       crashesByYear: [2011 => 1, 2012 => 2],
    *       injuriesByYear: [2011 => 2, 2012 => 5],
    *       noInjuriesByYear: [2011 => 3, 2012 => 7],
    *       killedByYear: [2011 => 4, 2012 => 8]
    *   },
    *   {
    *       type: 'bike',
    *       ...
    *   }]
    */

    var summaryObjects;

    var SummaryObject = function() {
        this.crashes = 0;
        this.totalInjuries = 0;
        this.totalKilled = 0;
        this.crashesByYear = [];
        this.injuriesByYear = [];
        this.noInjuriesByYear = [];
        this.killedByYear = [];

        /*
        *   Helper function that updates a SummaryObject based on the feature read.
        */
        this.addFeatureToSummary = function addFeatureToSummary(feature) {
            this.crashes++;
            var year = feature.year*1+2000;

            if(this.crashesByYear[year] === undefined) {
                this.crashesByYear[year] = 1;
            } else {
                this.crashesByYear[year]++;
            }

            this.totalInjuries += parseInt(feature.totalInjuries);
            if(this.injuriesByYear[year]) {
                this.injuriesByYear[year] += parseInt(feature.totalInjuries);
            } else {
                this.injuriesByYear[year] = parseInt(feature.totalInjuries);
            }

            if(this.noInjuriesByYear[year]) {
                this.noInjuriesByYear[year] += parseInt(feature.noInjuries);
            } else {
                this.noInjuriesByYear[year] = parseInt(feature.noInjuries);
            }

            this.totalKilled += parseInt(feature.totalKilled);
            if(this.killedByYear[year]) {
                this.killedByYear[year] += parseInt(feature.totalKilled);
            } else {
                this.killedByYear[year] = parseInt(feature.totalKilled);
            }
        };
    };

    /*
    *   Creates summaryObjects.bicycle and summaryObjects.pedestrian based on features
    *   loaded from the API.
    */
    var generateSummaries = function(crashes) {
        summaryObjects = {};

        if(crashes.length > 0) {
            $.each(crashes, function(i, feature) {
                var s;
                mapDisplay.addFeatureToMap(feature);

                switch (feature.collType) {
                    case CollisionEnum.PEDESTRIAN:
                        if ('pedestrian' in summaryObjects) {
                            s = summaryObjects.pedestrian;
                        } else {
                            s = new SummaryObject();
                        }
                        s.addFeatureToSummary(feature);
                        summaryObjects.pedestrian = s;
                    break;
                    case CollisionEnum.BICYCLIST:
                        if ('bicycle' in summaryObjects) {
                            s = summaryObjects.bicycle;
                        } else {
                            s = new SummaryObject();
                        }
                        s.addFeatureToSummary(feature);
                        summaryObjects.bicycle = s;
                    break;
                }
            });
            mapDisplay.finalizeMarkerGroup();

            var metaDataObj = mapDisplay.getMetaData();

            summaryDisplay.outputCrashDataText(summaryObjects.bicycle, summaryObjects.pedestrian);
            summaryDisplay.outputCrashDataGraph(summaryObjects.bicycle, summaryObjects.pedestrian);
            summaryDisplay.populateMetaData(metaDataObj);

        } else {
            $('#status').html('No crashes found within ' + mapDisplay.getMetaData().dist + ' feet of this location');
        }
    };

    /*
    *   Helper function to determine easily if the app has any crashes.
    */
    var hasCrashes = function() {
        return summaryObjects.bicycle || summaryObjects.pedestrian;
    };

    init();

    return {
        fetchCoordsForAddress: fetchCoordsForAddress,
        fetchCrashDataByCircle: fetchCrashDataByCircle,
        fetchCrashDataByPoly: fetchCrashDataByPoly,
        hasCrashes: hasCrashes,
        saveAddressAndShowCrashes: saveAddressAndShowCrashes,
        setAddresses: setAddresses,
        getAddresses: getAddresses
    };
}());

/*
*   Set initial conditions
*/
var init = function() {
    // When there isn't a display cookie, default to graph.
    if ($.cookie('display') === undefined) {
        $('#outputGraph').prop('checked', true).parent().addClass('active');
        $.cookie('display', 'graph');
    } else {

        if ($.cookie('display') == 'graph') {
            $('#outputGraph').prop('checked', true).parent().addClass('active');
            summaryDisplay.showGraph();
        }

        if ($.cookie('display') == 'text') {
            $('#outputText').prop('checked', true).parent().addClass('active');
            summaryDisplay.showText();
        }
    }

    // When there isn't a searchRadius cookie, default to 150.
    if ($.cookie('searchRadius') === undefined) {
        $('input[name="searchRadius"][value="150"]').prop('checked', true).parent().addClass('active');
        $.cookie('searchRadius', '150');
    } else {
        var searchRadius = $.cookie('searchRadius');
        $('input[name="searchRadius"][value="' + searchRadius + '"]').prop('checked', true).parent().addClass('active');
    }

    // Load stored addresses
    if (store.addresses) {
        crashBrowser.setAddresses(store.addresses);
    }
};

/*
*  Assign module methods to various events.
*/
$(document).ready(function() {
    init();

    $('input[name="searchRadius"]:radio').change(function() {
        var searchRadiusValue = $('input[name="searchRadius"]:checked').val();
        $('#searchRadiusButtons label input').removeClass('active');
        $.cookie('searchRadius', searchRadiusValue);
        mapDisplay.showCrashes();
    });

    $('input[name="outputType"]:radio').change(function() {
        var outputTypeCheckedValue = $('input[name="outputType"]:checked').val();
        $('#displaySelection label input').removeClass('active');
        $('input[name="outputType"]:checked').addClass('active');
        $.cookie('display', outputTypeCheckedValue);
        if (outputTypeCheckedValue == 'graph') {
            summaryDisplay.showGraph();
        } else if (outputTypeCheckedValue == 'text') {
            summaryDisplay.showText();
        }
    });

    $('button[name="goButton"]').click(function() {
        crashBrowser.saveAddressAndShowCrashes();
    });

    /*
    *   For when someone submits the form using the <enter> key in an input field.
    */
    $('#configForm').submit(function(evt) {
        evt.preventDefault();
        crashBrowser.saveAddressAndShowCrashes();
    });

    if (crashBrowser.getAddresses().length > 0) {
        $('#address').autocomplete({
            source: crashBrowser.getAddresses(),
            minLength: 0
        });
    }

    $('#address').focus(function () {
        $('#address').autocomplete('search', '');
    });

    var get = $.url().fparam('get');
    if(get == 'yes') {
        mapDisplay.showCrashes();
    }

    $('.btn').button();
});
