<html>
<head>
<title>Chicago Crash Browser</title>
<link rel="stylesheet" href="leaflet/leaflet.css" />
 <!--[if lte IE 8]>
     <link rel="stylesheet" href="leaflet/leaflet.ie.css" />
 <![endif]-->
<link rel="stylesheet" href="leaflet/MarkerCluster.css" />
<link rel="stylesheet" href="leaflet/MarkerCluster.Default.css" />
<link rel="stylesheet" href="leaflet/L.Control.Locate.css" />
<link rel="stylesheet" href="stylesheets/index.css" />
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js" ></script>
<script src="leaflet/leaflet-src.js"></script>
<script src="leaflet/leaflet.markercluster-src.js"></script>
<script src="leaflet/L.Control.Locate.js"></script>
<script src="leaflet/leaflet.permalink.js"></script>
<script src="js/jquery.ba-bbq.min.js"></script>
</head>
<body>
<div id="instructions"></div>
<div id="map"></div>
<div id="listContainer">
	<div id="list">
		<h1>Chicago Crash Browser</h1>
		<div class='smaller'>
		<p>Crash data for Chicago in 2005-2011 where a bicyclist or pedestrian was the first point of impact by a driver's automobile, as collected by responding law enforcement and maintained by the Illinois Department of Transportation.</p>
		<p>Search radius is 150 feet. Very beta right now; <a href='https://github.com/stevevance/Chicago-Crash-Browser'>fork it on GitHub</a>. <a href='https://tinyletter.com/chicagocrashes'>Subscribe to mailing list to get updates</a> -<a href="mailto:steve@stevevance.net">Steven Vance</a>, <a href='http://twitter.com/stevevance'>@stevevance</a>. <a href='http://www.smartchicagocollaborative.org/projects/hosted-web-space/'>Hosted by Smart Chicago Collaborative</a>.</p>
		</div>
		<div id="status">Click on an intersection
		</div>
		<div id="counterTotals" style="display:none;">
			<h2>Totals</h2>
			<p>Bike Crashes: <span id="counterBicyclist"></span></p>
			<div><div id="counterBicyclistByYear"></div></div>
			<p>Pedestrian Crashes: <span id="counterPedestrian"></span></p>
			 <div><div id="counterPedestrianByYear"></div></div>
			<p>These are counts of crashes with that collision type, not the count of how many people were involved. The actual number of crashes involving bicyclists or pedestrians may be higher if the bicyclist or pedestrian was the second or third point of impact.</p>
		</div>
		<div id="metadata" style="display:none;">
			<h2>Metadata</h2>
			<p>For your selected location.</p>
			<p><img id="staticimage" src=""></p>
			<ul>
			<li>Geographic coordinates: <span id="coords"></span></li>
			<li>Latitude: <span id="latitude"></span></li>
			<li>Longitude: <span id="longitude"></span></li>
			<li><span id="permalink"></span></li>
			</ul>
		</div>
		
	</div>
</div>

<script>
var hashObject = $.deparam.fragment();
var get = hashObject.get;
var markerGroup = new L.MarkerClusterGroup({
				maxClusterRadius:30,
				spiderfyDistanceMultiplier:1.3
				});
var distance = 150;
var lat,lng;
if(hashObject.lat != undefined) {
	lat = hashObject.lat;
} else {
	lat = 41.895924;
}
if(hashObject.lon != undefined) {
	lng = hashObject.lon;
} else {
	lng = -87.654921;
}
//console.log(hashObject);
//console.log(lat+","+lng);

var center = [lat,lng]; 
var map = L.map('map').setView(center, 16);
var circle;
var zoom = map.getZoom();

var year;
$("#staticimage").attr({src: "staticmap.php?center=" + lat + "," + lng + "&zoom=" + zoom+1 + "&size=200x200' />"});

		
/*
L.tileLayer('http://{s}.tile.cloudmade.com/851cc32e47324bb6bdf28181975a7218/997/256/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery &copy; <a href="http://cloudmade.com">CloudMade</a>',
    maxZoom: 18
}).addTo(map);
*/
// add an OpenStreetMap tile layer
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
map.addControl(new L.Control.Permalink({useLocation:true}));
map.addControl(new L.control.locate({debug:false}));



if(get == "yes") {
	getUrl();
}

map.on('click', openPopup);
//map.on('load',init);
//var popup = new L.Popup();
//getUrl();


/**
 * Return an Object sorted by it's Key; http://stackoverflow.com/questions/5467129/sort-javascript-object-by-key
 */
function sortObjectByKey(obj){
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
    jQuery.each(keys, function(i, key){
        sorted_obj[key] = obj[key];
    });

    return sorted_obj;
};

function openPopup(e) {
	lat = e.latlng.lat;
	lng = e.latlng.lng;
	//console.log(lat+", "+lng);
	
	var popup = L.popup()
    .setLatLng([lat, lng])
    //.setContent("<a href='#lat="+lat+"&lon="+lng+"&get=yes'>Search here</a>")
    .setContent("<a href='javascript:getUrl();'>Search here</a>")
    .openOn(map);
}

function getUrl() {
  var counterPedestrian = 0;
  var counterBicyclist = 0;
  var counterPedestrianByYear = {};
  var counterBicyclistByYear = {};

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
    shadowUrl: 'images/icon_shadow.png'
  });

  var pedestrianIcon = L.icon({
    iconUrl: 'images/icon_pedestrian.png',
    shadowUrl: 'images/icon_shadow.png'
  });


	$("#status").html("Looking through the database...");
	
	bounds = map.getBounds();
	//console.log(bounds);
	boundsPadded = bounds.pad(10);
	southwest = boundsPadded.getSouthWest();
	south = southwest.lat;
	west = southwest.lng;
	northeast = boundsPadded.getNorthEast();
	north = northeast.lat;
	east = northeast.lng;
	
	var url = "api.php?lat="+lat+"&lng="+lng+"&north="+north+"&south="+south+"&east="+east+"&west="+west+"&distance="+distance;
	console.log(url);
	counterBicyclist = 0;
	counterPedestrian = 0;
	counterPedestrianByYear = {};
	counterBicyclistByYear = {};
	
	$.getJSON(url, function(data) {
		// remove some layers first
		if(typeof circle !='undefined') {
			map.removeLayer(circle);
			markerGroup.clearLayers();
			//map.removeLayer(markerGroup);
			
		}
		var markers = [];
		map.setView([lat,lng], 18);
		console.log(data);
		//console.log("JSON: Getting the URL");
		
		var counter = 0;
		$.each(data.data, function(i, feature) {
			console.log("JSON: Iterating...");
			//console.log(counter);
			//console.log(feature["casenumber"]);
			
			//var marker = new L.Marker([feature[11],feature[12]]);
			counter++;
			year = feature["year"]*1+2000;
			
			if(feature["collType"] == "1") {
				// pedestrian
				//marker.setIcon(new icon_pedestrian());
        var marker = new L.Marker([feature["Crash latitude"],feature["Crash longitude"]], {icon: pedestrianIcon});
        markerGroup.addLayer(marker);
				counterPedestrian++;
				// count the year here
				if(counterPedestrianByYear[year]) {
					counterPedestrianByYear[year]++;
				} else {
					counterPedestrianByYear[year] = 1;
				};
			}
			if(feature["collType"] == "2"){
				// bicyclist
				//marker.setIcon(new icon_bicycle());
        var marker = new L.Marker([feature["Crash latitude"],feature["Crash longitude"]], {icon: bikeIcon});
        markerGroup.addLayer(marker);
				counterBicyclist++;
				// count the year here
				if(counterBicyclistByYear[year]) {
					counterBicyclistByYear[year]++;
				} else {
					counterBicyclistByYear[year] = 1;
				};
			}
		});
		map.addLayer(markerGroup);
		
		// add circle
		// this is in linear distance and it probably won't match the spheroid distance of the RADIANS database query
		circleOptions = {
			color: 'red', 
			fillColor: '#f03', 
			fillOpacity: 0.3,
			stroke: false
		};
		
		var meters = distance/3.2808399;
		circle = new L.Circle([lat,lng], meters, circleOptions);
		map.addLayer(circle);
		
		$("#counterTotals").slideDown();
		$("#counterBicyclist").html(counterBicyclist);
		$("#counterPedestrian").html(counterPedestrian);
		$("#counterBicyclistByYear").html('');
		$("#counterPedestrianByYear").html('');
		
		counterBicyclistByYear = sortObjectByKey(counterBicyclistByYear);
		$.each(counterBicyclistByYear, function(key, value){
			$("#counterBicyclistByYear").append("<div>" + key + ": " + value + "</div>")
		})
		counterPedestrianByYear = sortObjectByKey(counterPedestrianByYear);
		$.each(counterPedestrianByYear, function(key, value){
			$("#counterPedestrianByYear").append("<div>" + key + ": " + value + "</div>")
		})
		
		$("#metadata").slideDown();
		$("#coords").html(lat+", "+lng);
		$("#latitude").html(lat);
		$("#longitude").html(lng);
		$("#permalink").html("<a href='#lat="+lat+"&lon="+lng+"&get=yes'>Permalink</a>");
		$("#status").html("");
    map.closePopup();
	
  }).fail(function(){
		$("#status").html("Something went wrong while retrieving data. Please try again later and alert Steven.");
    map.closePopup();
  });
	
}
</script>
<script type="text/javascript">

  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-38676032-1']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();
</script>
</body>
</html>
