// draw one shape at a time: https://github.com/Leaflet/Leaflet.draw/issues/315#issuecomment-53932180

var editableLayers;

function startDrawing() {
	var osmEditor = { displayName: "OSM",
	            url: "http://www.openstreetmap.org",
	            buildUrl: function (map) { return this.url + "#map=" + [ map.getZoom(), map.getCenter().wrap().lat, map.getCenter().wrap().lng ].join('/'); }
				}
	var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
		osmAttrib = '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		mapboxUrl = 'https://{s}.tiles.mapbox.com/v3/foursquare.m3elv7vi/{z}/{x}/{y}.png',
		mapboxAttrib = '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors, MapBox',
		mapbox = L.tileLayer(mapboxUrl, {
					maxZoom: 18, 
					attribution: mapboxAttrib,
					detectRetina:true,
					maxZoom: 20,
					maxNativeZoom: 19})
		osm = L.tileLayer(osmUrl, {maxZoom: 18, attribution: osmAttrib}),
		map = new L.Map('map', {
					layers: [mapbox],
					center: new L.LatLng(41.8819, -87.6278),
					zoom: 15
					}
				);
	L.control.locate({metric: false, onLocationError: null, icon: 'fa fa-crosshairs'}).addTo(map);
	
	// ESRI geocoder: create the geocoding control and add it to the map
	var searchControl = new L.esri.Controls.Geosearch({forStorage:false}).addTo(map);
	// create an empty layer group to store the results and add it to the map
	var results = new L.LayerGroup().addTo(map);
	// listen for the results event and add every result to the map
	searchControl.on("results", function(data){
		results.clearLayers();
		for (var i = data.results.length - 1; i >= 0; i--) {
			var markerResult = L.marker(data.results[i].latlng);
			results.addLayer(markerResult);
			markerResult.bindPopup("Your search:<br /><b>" + data.results[i].text + "</b><p><a href='address.php?address=" + data.results[i].address + "'>Get an Address Snapshot</a></p>").openPopup();
		};
	});
				
	/*
	var map = L.map('map',{
		center:[41.8819, -87.6278],
		editInOSMControlOptions: {editors: ['id', 'josm', osmEditor]}
	});
	*/
	//map = new L.Map('map', { enter: new L.LatLng(-37.7772, 175.2756), zoom: 15 });
	/*
	var mapbox = L.tileLayer('https://{s}.tiles.mapbox.com/v3/foursquare.m3elv7vi/{z}/{x}/{y}.png', {
				attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
				detectRetina:true
			}).addTo(map);
	*/
	editableLayers = new L.FeatureGroup();
	map.addLayer(editableLayers);
	
	// Initialise the draw control and pass it the FeatureGroup of editable layers
	var drawControlFull = new L.Control.Draw({
	    edit: {
	        featureGroup: editableLayers
	    },
	    draw: {
	        polyline: {
	        	metric: false
	        },
	        polygon: {
		        showArea: true
	        },
	        rectangle: {
		        showArea: true
	        },
			circle: false,
			marker: false,
	    }
	});
	
	var drawControlEh = new L.Control.Draw({
				draw: {
					featureGroup: editableLayers,
					position: 'topleft',
					polygon: {
						allowIntersection: false,
						drawError: {
							color: '#b00b00',
							timeout: 1000
						},
						shapeOptions: {
							color: '#bada55'
						},
						showArea: true,
						metric: false,
						repeatMode: true
					},
					polyline: false,
					circle: false,
					marker: false
					/*
	circle: {
						allowIntersection: false,
						shapeOptions: {
							color: '#662d91'
						},
						metric: false,
						repeatMode: true
					}
	*/
				},
				edit: false
			});
	var drawControlEditOnly = new L.Control.Draw({
	    edit: {
	        featureGroup: editableLayers
	    },
	    draw: false
	});
	map.addControl(drawControlFull);
	
	/*
map.on('draw:created', function (e) {
		console.log("something was created; hiding draw control");
	    var type = e.layerType,
	        layer = e.layer;
	
		//$("[class^=leaflet-draw-draw]").hide();
		//$("#save_shape").removeClass("hidden");
		//drawControl.removeFrom(map);
	
	    if (type === 'marker') {
	        layer.bindPopup('A popup!');
	    }
	
	    editableLayers.addLayer(layer);
	    getGeoJson(true, 0);
	});
*/
	
	map.on("draw:created", function (e) {
	    var layer = e.layer, type = e.layerType;
	    layer.addTo(editableLayers);
	    drawControlFull.removeFrom(map);
	    drawControlEditOnly.addTo(map)
	    
	    getGeoJson(true, 0, type); // custom
	});
	
	map.on("draw:deleted", function(e) {
	    drawControlEditOnly.removeFrom(map);
	    drawControlFull.addTo(map);
	    
	    //getGeoJson(true, 1); // custom
	});
	
	map.on('draw:edited', function (e) {
		//$("#save_shape").removeClass("hidden");
		getGeoJson(true, 1);
	});
	
	/*
map.on('draw:deletestop', function(e) {
		console.log("something was deleted; showing draw control");
		var type = e.layerType,
	        layer = e.layer;
	        
		//$("[class^=leaflet-draw-draw]").show();
		//$("#save_shape").addClass("hidden");
		//drawControl.addTo(map);
		
		getGeoJson(false, 0);
	});
*/
	
	/*
map.on('draw:edited', function (e) {
		//$("#save_shape").removeClass("hidden");
		getGeoJson(true, 1);
	});
*/
}

function getGeoJson(saveToDb, wasItEdited, type) {
	console.log("getGeoJson: started");
	var output = JSON.stringify(editableLayers.toGeoJSON());
	$("#map_output").html(output);
	console.log(output);
	
	disArray(output, "map_output");
	
	if(saveToDb === true) {
		submitGeoJson(output, wasItEdited, type);
	}
}

function submitGeoJson(featureCollection, wasItEdited, type) {
	console.log("submitGeoJson running");
	var baseUrl = "php/boundaries.api.php"; // this is relative to the containing file, places.php
	$("#results .status").show().html("Searching in here...");
	$("#results .replaceme").hide();
	
	var json = disArray(featureCollection,false);
	
	$.post( baseUrl, { json: json, edited: wasItEdited, type: type } )
		.done(function( data ) {
			console.log( "submitGeoJson: Data Loaded: " + data );
			$("#results ul").append(data);
			$("#results .status").hide();
		})
		.fail(function(data) {
			console.log("submitGeoJson: Data didn't load");
		});
}

function disArray(featureCollection, div) {
	console.log("disArray running");
	//console.log(featureCollection);
	
	var fc = JSON.parse(featureCollection);
	//console.log(fc);
	var r ="";
	
	$.each(fc.features, function(i, v) {
		console.log(v.geometry);
		
		if(div != false) {
			$("#" + div).append("<p>" + JSON.stringify(v.geometry) + "</p>");
		}
		r += JSON.stringify(v.geometry); // return all
		r = JSON.stringify(v.geometry); // return the most recently drawn shape
	});
	
	return r;
}

function showNameForm() {
	$("#save_temp_shape").removeClass("hidden"); // show the form
	
	$( "#save_temp_shape" ).submit(function( event ) {
		var gid = $("input[name='gid']").val();
		var email = $("input[name='email']").val();
		var shape_name = $("input[name='shape_name']").val();
		var make_private = $("input[name='make_private']").is(':checked') ? 1 : 0;
		event.preventDefault();
		savePermanently(gid, email, shape_name, make_private);
	});
}

function savePermanently(gid, email, shape_name, make_private) {
	var baseUrl = "php/boundaries.api.php"; // this is relative to the containing file, places.php
	
	$.post( baseUrl, { gid: gid, username: email, shape_name: shape_name, private: make_private } )
		.done(function( data ) {
			console.log( "savePermanently: Data Loaded: " + data );
			$("#save_temp_shape").addClass("hidden"); // hide the form
			$(".placeHeading").html(shape_name);
			$("#temporary_explainer").html("<span class='label label-success'>Saved!</span> Your Place was saved permanently with the name \""+shape_name+"\" - <a href='account.php'>My Places</a>");
			//$("#results ul").append(data);
		})
		.fail(function(data) {
			console.log("savePermanently: Data didn't load" + data);
		});
}