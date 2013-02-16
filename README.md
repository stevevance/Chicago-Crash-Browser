Chicago-Crash-Browser
=====================

[Demo](http://gridchicago.com/crashes/index.php#lat=41.857719&lon=-87.661216&get=yes&zoom=18) - will load the intersection of 18th Street and Blue Island Avenue. 

Crash data for Chicago in 2005-2011 where a bicyclist or pedestrian was the first point of impact by a driver's automobile, as collected by responding law enforcement and maintained by the Illinois Department of Transportation.

##History
* First Chicago bike crash map created in February 2011
* Derek Eder created an enhanced version a bit later
* Lots of press for the Chicago bike crash map
* Attempted to create a public browser later in 2011, to get more details about the crashes, especially after I obtained additional years of data

##Goal
Provide an easy to use alternative for citizens and elected representatives to discover the number of bicycle and pedestrian crashes for any point in the city. Provide an open alternative to the State of Illinois's own Safety Data Mart.  

The Chicago Crash Browser will, in addition to simple browsing, have a storytelling component to go beyond pure figures of crash frequencies at an intersection. 

##Enhancements
Desired enhancements include:
* Speeding up the PostGIS tables
* Joining the "CrashExtract" table with the "PersonExtract" table so the full number of bicyclists and pedestrians are counted in the figures returned to the user for their point search.
* Usability enhancements that tell the user the database is running their search; show how much time a search has taken; reverse geocodes the searched coordinates
* Style changes
* Update the API to return details like the number of rows returned and the time it took for the PostgreSQL server to run the query

##Data Structure
One table is currently used, called "CrashExtract". It's called this because the crash data is an extract from the entire database, extracted by year and city. Whenever the whole state was provided to me, I stripped out all cities except Chicago ("City Code" != 1051).

[CrashExtract data dictionary](datadictionary/2004-present_crash_datadictionary_10-13-09.docx)

##API
The API returns JSON and has the following parameters:
* distance (in feet). This is capped at 1,000 feet. 
* north, south, east, west (to create a bounding box inserted as a WHERE statement to reduce the dataset search time)
* lat (latitude)
* lng (longitude)

The coordinates are converted to EPSG:3436 (Illinois StatePlane West feet) to be able to search distance in feet (this may not be the best method). This is the data's original projection although the records' coordinates (provided by the data author) are the actual fields used.