/* global define, $ */
'use strict';

define(['util', 'map', 'summary'], function (Utility, map, s) {
  var summary;

  /*
  *   Notifies the crashBrowser module to fetch updated crash data for
  *   the current latitude and longitude in the map.
  *
  *   @param opts Options hash that modifies the behavior of this method
  *          areaType: 'polygon' or 'circle'
  *          layer: If polygon, the layer that was created
  */
  function getCrashes(opts) {
      $('#results').hide();
      $('#metadata-link').hide();
      var fn;
      if (!opts || opts.areaType === 'circle') {
          fn = fetchCrashDataByCircle;
      } else {
          fn = fetchCrashDataByPoly;
      }
      return fn();
  }

  /*
  *   Communicates with the backend API to get crash data for the distance provided.
  */
  var fetchCrashDataByCircle = function() {
      return fetchCrashes({url: map.getAPIUrl()});
  };

  var fetchCrashDataByPoly = function () {
      return fetchCrashes({url: map.getAPIUrlForPoly()});
  };

  var fetchRawCrashData = function fetchRawCrashData(options) {
    return $.getJSON(options.url);
  };

  var fetchCrashes = function fetchCrashes(options) {
    return fetchRawCrashData(options)
      .done(function (data) {
        generateSummaries(data.crashes);
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
  *   Helper function to determine easily if the app has any crashes.
  */
  function hasCrashes() {
    return summary.bicycle || summary.pedestrian;
  }

  /*
  *   Creates summaryObjects.bicycle and summaryObjects.pedestrian based on features
  *   loaded from the API.
  */
  var generateSummaries = function(crashes) {
    summary = {};

    if(crashes.length > 0) {
      $.each(crashes, function(i, feature) {
        var s;
        map.addFeatureToMap(feature);

        switch (feature.collType) {
          case Utility.CollisionEnum.PEDESTRIAN:
            if ('pedestrian' in summary) {
                s = summary.pedestrian;
            } else {
                s = new SummaryObject();
            }
            s.addFeatureToSummary(feature);
            summary.pedestrian = s;
          break;
          case Utility.CollisionEnum.BICYCLIST:
            if ('bicycle' in summary) {
                s = summary.bicycle;
            } else {
                s = new SummaryObject();
            }
            s.addFeatureToSummary(feature);
            summary.bicycle = s;
          break;
        }
      });
      var metaDataObj = map.getMetaData();

      s.outputCrashDataText(summary.bicycle, summary.pedestrian);
      s.outputCrashDataGraph(summary.bicycle, summary.pedestrian);
      s.populateMetaData(metaDataObj);

    } else {
        $('#status').html('No crashes found within ' + Utility.getDistance() + ' feet of this location');
    }
    return summary;
  };

  return {
    getCrashes: getCrashes,
    hasCrashes: hasCrashes
  };
});