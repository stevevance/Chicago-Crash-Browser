/* jshint undef: true, unused: false */
/* global Rhaboo,require,define */
'use strict';

require('rhaboo');

require('jquery-ui/ui/core');
require('jquery-ui/ui/widget');
require('jquery-ui/ui/position');
require('jquery-ui/ui/menu');
require('jquery-ui/ui/autocomplete');
require('jquery-cookie/jquery.cookie');

require('select2');

require('leaflet-dist/leaflet-src');
require('leaflet.markerclusterer');
require('leaflet-locatecontrol/src/L.Control.Locate');
require('leaflet-plugins/control/Permalink');
require('leaflet.draw');
require('bootstrap');
require('highcharts/highcharts');

define(['util', 'crashes', 'map', 'summary', 'areas', 'jquery'], function (Utility, crashes, map, summary, areas, $) {
    var store = Rhaboo.persistent('crashBrowser');
    var addresses = [];

    /*
    *   Communicates with the OpenStreetMap API to get coordinates for a given (Chicago!) address.
    *   Since this calls an external service, this needs to return a jQuery promise.
    */
    var fetchCoordsForAddress = function() {
        var dfd = $.Deferred();

        if ($('#address').val()) {
            $.getJSON('http://nominatim.openstreetmap.org/search', {
                street: $('#address').val(),
                city: 'Chicago',
                state: 'IL',
                format: 'json'
            }, function(data) {
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
        if (addresses.length > 0) {
            return addresses;
        } else {
            return ['121 N. LaSalle Blvd'];
        }
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
            map.setCoordinates(data[0].lat, data[0].lon);
            $('body').trigger('search');
        }, function() {
            var badIdx = addresses.indexOf(searchAddress);
            if (badIdx !== -1) {
                addresses.splice(badIdx, 1);
                store.write('addresses', addresses);
            }
            addressError();
            map.closePopup();
        });
    };

    var addressError = function() {
        $('#status').html('Could not locate this address. Please try again later, or use a valid Chicago address!');
    };

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
                summary.showGraph();
            }

            if ($.cookie('display') == 'text') {
                $('#outputText').prop('checked', true).parent().addClass('active');
                summary.showText();
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
            setAddresses(store.addresses);
        }

        $('body').on('search', function (event, opts) {
            if (!opts) {
                opts = { areaType: 'circle' };
            }
            map.clearAreas();
            crashes
                .getCrashes(opts)
                .done(function () {
                    if (opts.areaType === 'polygon') {
                        map.addPoly();
                    } else {
                        map.addCircle();
                    }
                    map.finalizeMarkerGroup();
                })
                .fail(function () {
                    $('#status').html('Something went wrong while retrieving data. Please try again later and alert Steven.');
                    map.closePopup();
                });
        });

        $('input[name="searchRadius"]:radio').change(function() {
            var searchRadiusValue = $('input[name="searchRadius"]:checked').val();
            $('#searchRadiusButtons label input').removeClass('active');
            $.cookie('searchRadius', searchRadiusValue);
            $('body').trigger('search');
        });

        $('input[name="outputType"]:radio').change(function() {
            var outputTypeCheckedValue = $('input[name="outputType"]:checked').val();
            $('#displaySelection label input').removeClass('active');
            $('input[name="outputType"]:checked').addClass('active');
            $.cookie('display', outputTypeCheckedValue);
            if (outputTypeCheckedValue == 'graph') {
                summary.showGraph();
            } else if (outputTypeCheckedValue == 'text') {
                summary.showText();
            }
        });

        $('button[name="goButton"]').click(function() {
            saveAddressAndShowCrashes();
        });

        /*
        *   For when someone submits the form using the <enter> key in an input field.
        */
        $('#configForm').submit(function(evt) {
            evt.preventDefault();
            saveAddressAndShowCrashes();
        });

        $('#address').autocomplete({
            source: getAddresses(),
            minLength: 0
        });

        $('#address').focus(function () {
            $('#address').autocomplete('search', '');
        });

        var get = Utility.getParam('get');
        if(get === 'yes') {
            $('body').trigger('search');
        }

        $('.btn').button();

        areas.initDropdown();

    };

    $(document).ready(init);
});