/* global define, L */
'use strict';

define(['jquery', 'lodash', 'map'], function ($, _, map) {
  var areas;

  function initDropdown() {
    $.ajax('api/areas.json')
      .then(function (response) {
        areas = response;
        data = [{
          id: '',
          text: 'None'
        }, {
          text: 'Neighborhood',
          children: getAreas('neighborhood')
        }, {
          text: 'Community Area',
          children: getAreas('communityarea')
        }, {
          text: 'Ward',
          children: getAreas('ward')
        }];

        $('#areaSelector').select2({
          data: data
        });

        $('#areaSelector').on('select2:select', function (e) {
          $.ajax('map.php', {
              data: {
                method: 'boundary',
                place: e.params.data.id
              }
            }).then(function (geoJsonRaw) {
              map.clearAreas();
              map.setPoly(L.GeoJSON.geometryToLayer(geoJsonRaw.features[0]));
              $('body').trigger('search', {
                areaType: 'polygon'
              });
            });
        });
      })
      .fail(function (err) {
        console.error(err);
      });
  }

  function getAreas(area) {
    return _.sortBy(_.map(_.filter(areas, {type: area}), function (area) {
      return {
        id: area.slug,
        text: area.name
      }
    }), 'text');
  }

  return {
    initDropdown: initDropdown
  };

});