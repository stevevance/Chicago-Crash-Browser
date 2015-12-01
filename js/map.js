/* global define, L */
'use strict';

define(['util', 'jquery'], function (Utility, $) {
    var lat;
    var lng;
    var map;
    var center;
    var circle;
    var poly;
    var markerGroup;
    var isDrawing = false;

    var shapeOptions = {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.3,
        stroke: false,
        clickable:false
    };

    var init = function() {
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

        map = L.map('map').setView(center, 18);
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
        var satelliteMQ = L.tileLayer('http://oatile{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
            detectRetina:true,
            maxZoom: 20,
            maxNativeZoom: 19,
            subdomains: '1234'
        });
        var satellite = L.tileLayer('https://api.tiles.mapbox.com/v4/mapbox.streets-satellite/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoic3RldmV2YW5jZSIsImEiOiJqRVdYSnFjIn0.cmW3_zqwZpvcwPYc_C2SPQ', {
            attribution: '<a href="http://mapbox.com">Mapbox</a>',
            detectRetina:true,
            maxZoom: 20,
            maxNativeZoom: 19,
            unloadInvisibleTiles: true,
            updateWhenIdle: true,
            reuseTiles: true
        });


        // Add the tile layers to an object
        var baseMaps = {'Streets': streets, 'Building Names': buildings, "Satellite": satellite};
        satellite.addTo(map); // load "satellite" by default

        // Create an empty object to which we might add data layers that can be toggled
        var otherLayers =  {};

        // create a layer control that turns on/off layers
        L.control.layers(baseMaps, otherLayers, {collapsed: false, autoZIndex:false}).addTo(map);

        map.on('click', function(e) {
            $('#address').val('');
            if (!isDrawing) {
                setCoordinates(e.latlng.lat, e.latlng.lng);
                $('body').trigger('search', {
                    areaType: 'circle'
                });
            }
        });

        map.on('draw:drawstart', function() {
            isDrawing = true;
            clearAreas();
        });

        map.on('draw:drawstop', function() {
            isDrawing = false;
        });

        map.on('draw:created', function(e) {
            poly = e.layer;
            $('body').trigger('search', {
                areaType: 'polygon'
            });
        });

        markerGroup = new L.MarkerClusterGroup({
            maxClusterRadius:15,
            spiderfyDistanceMultiplier:1.3
        });
    };

    /*
    *   Let's consistently allow access s lat/lng pair with a setter.
    */
    var setCoordinates = function(newLat, newLng) {
        lat = newLat;
        lng = newLng;
    };

    /*
    *   Takes a feature row from the API and outputs basic information
    *   for the crash in a Leaflet popup window
    */
    var getCrashDetails = function(feature) {
        var type = null;
        if(feature.collType == Utility.CollisionEnum.PEDESTRIAN) {
            type = 'Pedestrian Crash';
        } else if(feature.collType == Utility.CollisionEnum.BICYCLIST) {
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
        markerGroup.clearLayers();
        if (typeof circle !== 'undefined') {
            map.removeLayer(circle);
        }
        if (typeof poly !== 'undefined') {
            map.removeLayer(poly);
        }
        map.closePopup();
    };

    /**
    *   Adds circle to the map and fits the amp boundaries to the marker group, if applicable
    */
    var addCircle = function() {
        // this is in linear distance and it probably won't match the spheroid distance of the RADIANS database query
        var meters = Utility.getDistance() / 3.2808399;
        circle = new  L.Circle([lat,lng], meters, shapeOptions);
        map.addLayer(circle);
        if (markerGroup.getLayers().length > 0) {
            map.fitBounds(markerGroup.getBounds());
        } else {
            map.fitBounds(circle);
        }
    };

    /**
    *   Adds a polygon to the map and fits the map boundaries to the marker group, if possible
    */
    var addPoly = function() {
        map.addLayer(poly);
        if (markerGroup.getLayers().length > 0) {
            map.fitBounds(markerGroup.getBounds());
        } else {
            map.fitBounds(poly);
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

        return '/api2.php?lat='+lat+'&lng='+lng+'&distance='+Utility.getDistance();

    };

    /**
    *   Returns the API url for the current map view if searching by polygon
    */
    var getAPIUrlForPoly = function () {
        $('#status').html('Looking through the database...');

        var coords = '';
        poly.getLatLngs().forEach(function (coord) {
            coords += coord.lng + ' ' + coord.lat + ',';
        });
        // Append last point
        var lastPoint = poly.getLatLngs()[0];
        coords += lastPoint.lng + ' ' + lastPoint.lat;

        return '/api2.php?coords=' + coords;
    };

    /**
    *   Based on the individual crash data passed in, creates a map marker,
    *   with details bound to it in a popup.
    */
   var createFeatureMarker = function(feature) {
        var marker = null;
        var details = null;
        var iconValue = null;

        if (feature.collType == Utility.CollisionEnum.PEDESTRIAN) {
            iconValue = pedestrianIcon;
        } else if (feature.collType == Utility.CollisionEnum.BICYCLIST) {
            iconValue = bikeIcon;
        } else {
            iconValue = otherIcon;
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

    var otherIcon = L.icon({
        iconUrl: 'images/icon_carcrash.png',
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
            dist: Utility.getDistance()
        };
    };

    init();

    return {
        getAPIUrl: getAPIUrl,
        getAPIUrlForPoly: getAPIUrlForPoly,
        clearAreas: clearAreas,
        addCircle: addCircle,
        addPoly: addPoly,
        closePopup: map.closePopup,
        finalizeMarkerGroup: finalizeMarkerGroup,
        addFeatureToMap: addFeatureToMap,
        getMetaData: getMetaData,
        setCoordinates: setCoordinates
    };
});