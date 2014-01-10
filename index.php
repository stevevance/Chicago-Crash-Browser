<html>
<head>
<title>Chicago Crash Browser</title>
<link rel="stylesheet" href="bower_components/leaflet-dist/leaflet.css" />
 <!--[if lte IE 8]>
     <link rel="stylesheet" href="leaflet/leaflet.ie.css" />
 <![endif]-->
<link rel="stylesheet" href="bower_components/leaflet.markerclusterer/dist/MarkerCluster.css" />
<link rel="stylesheet" href="bower_components/leaflet.markerclusterer/dist/MarkerCluster.Default.css" />
<link rel="stylesheet" href="bower_components/leaflet-locatecontrol/src/L.Control.Locate.css" />
<link rel="stylesheet" href="stylesheets/index.css" />
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
			<h4>Total Injuries: <span id="totalBicyclistInjuries"></span></h4>
			<div id="counterBicyclistByYear"></div>
			<h3>Pedestrian Crashes: <span id="counterPedestrian"></span></h3>
			<h4>Total Injuries: <span id="totalPedestrianInjuries"></span></h4>
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

<script src="bower_components/jquery/jquery.min.js"></script>
<script src="bower_components/leaflet-dist/leaflet-src.js"></script>
<script src="bower_components/leaflet.markerclusterer/dist/leaflet.markercluster.js"></script>
<script src="bower_components/leaflet-locatecontrol/src/L.Control.Locate.js"></script>
<script src="bower_components/leaflet-plugins/control/Permalink.js"></script>
<script src="bower_components/purl/purl.js"></script>
<script src="js/crashbrowser.js"></script>
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
