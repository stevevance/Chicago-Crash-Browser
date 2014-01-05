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
			<p>Crash data for Chicago in 2005-2012 where a bicyclist or pedestrian was the first point of impact by a driver's automobile, as collected by responding law enforcement and maintained by the Illinois Department of Transportation.</p>
			<p><a href='https://github.com/stevevance/Chicago-Crash-Browser'>Fork it on GitHub</a>. <a href='https://tinyletter.com/chicagocrashes'>Subscribe to mailing list to get updates</a> -<a href="mailto:steve@stevevance.net">Steven Vance</a>, <a href='http://twitter.com/stevevance'>@stevevance</a>. Hosted by <a href='http://www.smartchicagocollaborative.org/projects/hosted-web-space/'>Smart Chicago Collaborative</a>.</p>
		</div>
		<div id="status">Click on an intersection
		</div>
		<div id="counterTotals" style="display:none;">
			<h2>Totals</h2>
			<h3>Bike Crashes: <span id="counterBicyclist"></span></h3>
			<h4>Bike Injuries: <span id="totalBicyclistInjuries"></span></h4>
			<div id="counterBicyclistByYear"></div>
			<h3>Pedestrian Crashes: <span id="counterPedestrian"></span></h3>
			<h4>Pedestrian Injuries: <span id="totalPedestrianInjuries"></span></h4>
			<div id="counterPedestrianByYear"></div>
			<h3>Radius: <span id="radius"></span> feet</h3>
			<p>Try: <a href="javascript:getUrl(50);">50 ft</a>, <a href="javascript:getUrl(100);">100 ft</a>, <a href="javascript:getUrl(150);">150 ft</a>, <a href="javascript:getUrl(200);">200 ft</a></p>
			<p class="smaller">Important: These are counts of crashes with that collision type, not the count of how many people were involved. The actual number of crashes involving bicyclists or pedestrians may be higher if the bicyclist or pedestrian was the second or third point of impact.</p>
		</div>
		<div id="metadata" class="hidden">
			<h2>Metadata</h2>
			<p>For your selected location.</p>
			<p class="hidden"><img id="staticimage" src=""></p>
			<ul>
				<li><span id="permalink"></span></li>
				<li>Geographic coordinates: <span id="coords"></span></li>
				<li>Latitude: <span id="latitude"></span></li>
				<li>Longitude: <span id="longitude"></span></li>
			</ul>
		</div>
		
	</div>
</div>

<script>
var hashObject = $.deparam.fragment();
var get = hashObject.get;
var markerGroup = new L.MarkerClusterGroup({
				maxClusterRadius:20,
				spiderfyDistanceMultiplier:1.3
				});
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
//$("#staticimage").attr({src: "staticmap.php?center=" + lat + "," + lng + "&zoom=" + zoom+1 + "&size=200x200' />"});

		
/*
L.tileLayer('http://{s}.tile.cloudmade.com/851cc32e47324bb6bdf28181975a7218/997/256/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery &copy; <a href="http://cloudmade.com">CloudMade</a>',
    maxZoom: 18
}).addTo(map);
*/
// add an OpenStreetMap tile layer
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
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
    .setContent("Search within <a href='javascript:getUrl(50);'>50 ft</a>, <a href='javascript:getUrl(100);'>100 ft</a>, <b><a href='javascript:getUrl(150);'>150 ft</a></b>, <a href='javascript:getUrl(200);'>200 ft</a>")
    .openOn(map);
}

// given a JSON crashes row, return pop 
function getCrashDetails(feature) {
	return "Date: " + feature.month + "/" + feature.day + "/" + (parseInt(feature.year) + 2000) + "<br/>" +
	"Injuries: " + feature.totalInjuries + "<br/>" +
	"Uninjured: " + feature.noInjuries;

}

function getUrl(distance) {
  var counterPedestrian = 0;
  var counterBicyclist = 0;
  var counterPedestrianByYear = {};
  var counterBicyclistByYear = {};
  if(distance == undefined || distance == null) {
	  var distance = 150;
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
	
	var url = "http://chicagocrashes.org/api.php?lat="+lat+"&lng="+lng+"&north="+north+"&south="+south+"&east="+east+"&west="+west+"&distance="+distance;
	console.log(url);
	
	counterPedestrian = 0;
	counterPedestrianByYear = {};
	counterPedInjuriesByYear = {};
	counterPedFatalByYear = {};
	counterPedNoInjByYear = {};
	
	counterBicyclist = 0;
	counterBicyclistByYear = {};
	counterBikeInjuriesByYear = {};
	counterBikeFatalByYear = {};
	counterBikeNoInjByYear = {};
	
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
		if(data.crashes.length > 0) {
			totalInjuries = 0;
			totalBicyclistInjuries = 0;
			totalPedestrianInjuries = 0;

			$.each(data.crashes, function(i, feature) {
				map.closePopup();
				//console.log("JSON: Iterating through the crashes...");
				//console.log(counter);
				//console.log(feature["casenumber"]);
				//console.log("Latitude should be " + feature.latitude);
				
				//var marker = new L.Marker([feature[11],feature[12]]);
				counter++;
				year = feature.year*1+2000;
				
				if(feature.collType == "1") {
					// pedestrian
					//marker.setIcon(new icon_pedestrian());

			        var marker = new L.Marker(
			        	[feature.latitude,feature.longitude], 
			        	{icon: pedestrianIcon}
		        	);
					
					var details = getCrashDetails(feature);
			        marker.bindPopup(details).openPopup();

			        markerGroup.addLayer(marker);
					counterPedestrian++;
					// count the year here
					if(counterPedestrianByYear[year]) {
						counterPedestrianByYear[year]++;
					} else {
						counterPedestrianByYear[year] = 1;
					};
					
					totalPedestrianInjuries += parseInt(feature.totalInjuries);
					if(counterPedInjuriesByYear[year]) {
						counterPedInjuriesByYear[year] += parseInt(feature.totalInjuries);
					} else {
						counterPedInjuriesByYear[year] = parseInt(feature.totalInjuries);
					};
					
					if(counterPedNoInjByYear[year]) {
						counterPedNoInjByYear[year] += parseInt(feature.noInjuries);
					} else {
						counterPedNoInjByYear[year] = parseInt(feature.noInjuries);
					};
	
				}
				if(feature.collType == "2"){
					// bicyclist
					//marker.setIcon(new icon_bicycle());
			        var marker = new L.Marker(
			        	[feature.latitude,feature.longitude], 
			        	{icon: bikeIcon}
		        	);

					var details = getCrashDetails(feature);
			        marker.bindPopup(details).openPopup();

			        markerGroup.addLayer(marker);
					counterBicyclist++;
					// count the year here
					if(counterBicyclistByYear[year]) {
						counterBicyclistByYear[year]++;
					} else {
						counterBicyclistByYear[year] = 1;
					};
					
					totalBicyclistInjuries += parseInt(feature.totalInjuries);
					if(counterBikeInjuriesByYear[year]) {
						counterBikeInjuriesByYear[year] += parseInt(feature.totalInjuries);
					} else {
						counterBikeInjuriesByYear[year] = parseInt(feature.totalInjuries);
					};
					
					if(counterBikeNoInjByYear[year]) {
						counterBikeNoInjByYear[year] += parseInt(feature.noInjuries);
					} else {
						counterBikeNoInjByYear[year] = parseInt(feature.noInjuries);
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
				stroke: false,
				clickable:false
			};
			
			var meters = distance/3.2808399;
			circle = new L.Circle([lat,lng], meters, circleOptions);
			map.addLayer(circle);
			
			map.fitBounds(markerGroup.getBounds());
			
			$("#counterTotals").slideDown();
			$("#counterBicyclist").html(counterBicyclist);
			$("#counterPedestrian").html(counterPedestrian);
			$("#counterBicyclistByYear").html('');
			$("#counterPedestrianByYear").html('');
			$("#totalBicyclistInjuries").html(totalBicyclistInjuries);
			$("#totalPedestrianInjuries").html(totalPedestrianInjuries);
			
			$("#radius").html(distance);
			
			counterBicyclistByYear = sortObjectByKey(counterBicyclistByYear);
			$.each(counterBicyclistByYear, function(key, value){
				$("#counterBicyclistByYear").append("<div>" + key + ": " + crashOrCrashes(value) + " with " + personOrPeople(counterBikeInjuriesByYear[key]) + " injured & " + personOrPeople(counterBikeNoInjByYear[key]) + " uninjured</div>")
			})
			counterPedestrianByYear = sortObjectByKey(counterPedestrianByYear);
			$.each(counterPedestrianByYear, function(key, value){
				$("#counterPedestrianByYear").append("<div>" + key + ": " + crashOrCrashes(value) + " with " + personOrPeople(counterPedInjuriesByYear[key]) + " injured & " + personOrPeople(counterPedNoInjByYear[key]) + " uninjured</div>")
			}) // end each 
			
					
			$("#metadata").slideDown();
			$("#coords").html(lat+", "+lng);
			$("#latitude").html(lat);
			$("#longitude").html(lng);
			$("#permalink").html("<a href='#lat="+lat+"&lon="+lng+"&get=yes'>Permalink</a>");
			$("#status").html("");
		} else {
			$("#status").html("No crashes found within " + distance + " feet of this location");
		}	
  }).fail(function(){
		$("#status").html("Something went wrong while retrieving data. Please try again later and alert Steven.");
    map.closePopup();
  });
	
}

function personOrPeople(quantity) {
	var s;
	if(quantity == 1) {
		s = quantity + " person";
	} else if(quantity > 1) {
		s = quantity + " people";
	}
	return s;
}

function crashOrCrashes(quantity) {
	var s;
	if(quantity == 1) {
		s = quantity + " crash";
	} else if(quantity > 1) {
		s = quantity + " crashes";
	}
	return s;
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
