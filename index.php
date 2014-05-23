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
<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css">
<link rel="stylesheet" href="stylesheets/index.css" />
<!-- <script src="//code.jquery.com/jquery-2.1.0.min.js"></script> -->
<script src="bower_components/jquery/jquery.min.js"></script>
<script src="bower_components/jquery-cookie/jquery.cookie.js"></script>
<script src="http://code.highcharts.com/stock/highstock.js"></script>
<script src="http://code.highcharts.com/stock/modules/exporting.js"></script>
<script src="//netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min.js"></script>
<script type="text/javascript">
if (typeof jQuery == 'undefined') {
    document.write(unescape("%3Cscript src='/bower_components/jquery/jquery.min.js' type='text/javascript'%3E%3C/script%3E"));
}
</script>
</head>
<body>
<div id="body">
	<div id="instructions"></div>
	<div id="map"></div>
	<div id="listContainer">
		<div id="list">
			<h1>Chicago Crash Browser</h1>
			<form name="config" id="configForm">
				<div id="searchRadiusSelector">
					<div class="configSet">
						<div class="configLabel">Search radius:</div>
						<div class="btn-group" data-toggle="buttons" id="searchRadiusButtons">
							<label class="btn btn-primary">
								<input type="radio" name="searchRadius" value="50">50'</input>
							</label>
							<label class="btn btn-primary">
								<input type="radio" name="searchRadius" value="100">100'</input>
							</label>
							<label class="btn btn-primary">
								<input type="radio" name="searchRadius" value="150">150'</input>
							</label>
							<label class="btn btn-primary">
								<input type="radio" name="searchRadius" value="200">200'</input>
							</label>
						</div>
					</div>
					<div class="configSet">
						<div class="configLabel">Output type:</div>
						<div class="btn-group" data-toggle="buttons" id="displaySelection">
							<label class="btn btn-primary">
								<input type="radio" name="outputType" value="graph" id="outputGraph">Graph</input>
							</label>
							<label class="btn btn-primary">
								<input type="radio" name="outputType" value="text" id="outputText">Text</input>
							</label>
						</div>
					</div>
				</div>
				<div class="configSet">
					<div class="configLabel"><a href="#" data-toggle="modal" data-target="#address-modal">Chicago Address:</a></div>
					<div class="input-group">
						<input class="form-control" type="text" name="address" id="address" placeholder="121 N. LaSalle Street"/>
						<span class="input-group-btn">
							<button class="btn btn-default" type="button" name="goButton">Go</button>
						</span>
					</div>
				</div>
			</form>
			<div id="status"></div>
			<div id="results" style="display: none;">
				<div id="graphs">
					<div id="summaryGraph" style="height: 200px;"></div>
					<div id="breakdownGraph"></div>
				</div>
				<div id="counterTotals" style="display:none;">
					<h3>Bike Crashes: <span id="counterBicyclist"></span></h3>
					<h4>Total Injuries: <span id="totalBicyclistInjuries"></span></h4>
					<div id="counterBicyclistByYear"></div>
					<h3>Pedestrian Crashes: <span id="counterPedestrian"></span></h3>
					<h4>Total Injuries: <span id="totalPedestrianInjuries"></span></h4>
					<div id="counterPedestrianByYear"></div>
					<h3>Radius: <span id="radius"></span> feet</h3>
					<p class="smaller">Important: These are counts of crashes with that collision type, not the count of how many people were involved. The actual number of crashes involving bicyclists or pedestrians may be higher if the bicyclist or pedestrian was the second or third point of impact.</p>
				</div>
			</div>
		</div>
	</div>

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
</div>

<div id="about" class="modal fade bs-example-modal-sm" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true">
	<div class="modal-dialog modal-sm">
		<div class="modal-content" id="about-modal">
			<div class="modal-header">
				<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
				<strong>About</strong>
			</div>
			<div class="modal-body">
				<p>Crash data for Chicago in 2005-2012 where a bicyclist or pedestrian was the first point of impact by a driver's automobile, as collected by responding law enforcement and maintained by the Illinois Department of Transportation.</p>
				<p><a href='https://github.com/stevevance/Chicago-Crash-Browser'>Fork it on GitHub</a>. <a href='https://tinyletter.com/chicagocrashes'>Subscribe to mailing list to get updates</a> -<a href="mailto:steve@stevevance.net">Steven Vance</a>, <a href='http://twitter.com/stevevance'>@stevevance</a>. Hosted by <a href='http://www.smartchicagocollaborative.org/projects/hosted-web-space/'>Smart Chicago Collaborative</a>.</p>
			</div>
		</div>
	</div>
</div>

<div id="address-modal" class="modal fade bs-example-modal-sm" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true">
	<div class="modal-dialog modal-sm">
		<div class="modal-content" id="address-modal-content">
			<div class="modal-header">
				<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
				<strong>Chicago Address Search</strong>
			</div>
			<div class="modal-body">
				<p>Enter a valid Chicago address, and the map will recenter at that address. This feature is still in BETA at this time; some addresses may not work quite right, some of the time.</p>
			</div>
		</div>
	</div>
</div>

<div id="metadata" class="modal fade bs-example-modal-sm" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true">
	<div class="modal-dialog modal-sm">
		<div class="modal-content" id="metadata-modal">
			<div class="modal-header">
				<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
				<strong>Metadata</strong>
			</div>
			<div class="modal-body">
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
</div>


<div id="footer">
	<a href="#" data-toggle="modal" data-target="#about">About</a>
	<span id="metadata-link" style="display: none;">&mdash;&#160;<a href="#" data-toggle="modal" data-target="#metadata">Metadata</a></span>
</div>
</body>
</html>
