// draw one shape at a time: https://github.com/Leaflet/Leaflet.draw/issues/315#issuecomment-53932180

var editableLayers;

function startDrawing() {
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