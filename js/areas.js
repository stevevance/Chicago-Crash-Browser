/* global define, L */
'use strict';

define(['jquery', 'lodash'], function ($, _) {
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