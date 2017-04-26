# Crash Data

This is a list of links to the motor vehicle crash data used to power the [Chicago Crash Browser](http://chicagocrashes.org) created by [Steven Vance](http://stevevance.net). The data was provided by the Illinois Department of Transportation's Division of Traffic Safety. 

Some datasets have data for crashes within the City of Chicago and others have crashes for the entire State of Illinois.

## IDOT Disclaimer
> The Division of Traffic Safety requires the following statement be placed on any work product that incorporates or references our data. 
DISCLAIMER: The motor vehicle crash data referenced herein was provided by the Illinois Department of Transportation. The author is responsible for any data analyses and conclusions drawn.

IDOT will not provide access to its [Safety Portal](https://webapps.dot.illinois.gov/SafetyPortal/) unless you work for a government agency. When I requested access to it in December 2015, [Ken Martin](mailto:Ken.Martin@illinois.gov) from IDOT responded: "The IDOT Safety Portal was designed under the provisions of the Illinois Vehicle Code to provide access to crash data and our SR1050 crash reports for federal, state, and local governmental agencies involved in highway safety research and studies. We will not be able to grant your request."

The Safety Portal replaced the Safety Data Mart in 2016, which had maps and crash data open to anyone. 

## Notes / Getting Help
* Be careful comparing data 2005-2008 and 2009 to present because the reporting threshold changed. In the former period, the data will contain crashes that had no injuries and property damage of at least $500. In the latter period, the data will contain crashes that had no injuries but property damage of at least $1,500. If there was an injury, the data will contain that crash regardless of the property damage estimate. 
* Beware that fields were added and removed for the 2013 & 2014 datasets (and likely future datasets). Until I write about the differences please compare the data dictionaries. 
* Note that some years have crash data for the City of Chicago limits and others for the whole state of Illinois.
* If you need help understanding this data – it's dense – you can [contact Steven on Twitter](http://twitter.com/stevevance). 

## Data Dictionary

### Applicable to 2006-2012
*   Crash table: [XLSX spreadsheet](http://s3.amazonaws.com/chicagocrashes/data_dictionary/2001-present crash file layout 10-13-09.xlsx) - [DOCument with notes](http://s3.amazonaws.com/chicagocrashes/data_dictionary/2004-present crash codes 10-13-09.docx)
*   Vehicle table: [XLSX spreadsheet](http://s3.amazonaws.com/chicagocrashes/data_dictionary/2001-present vehicle file layout 10-13-09.xlsx) - [DOCument with notes](http://s3.amazonaws.com/chicagocrashes/data_dictionary/2004-present vehicle codes 10-13-09.docx)
*   Person table: [XLSX spreadsheet](http://s3.amazonaws.com/chicagocrashes/data_dictionary/2001-present person file layout 10-13-09.xlsx) - [DOCument with notes](http://s3.amazonaws.com/chicagocrashes/data_dictionary/2004-present person codes 10-13-09.docx)

### Applicable to 2013-2014
* Crash: [DOCument with notes](http://s3.amazonaws.com/chicagocrashes/data_dictionary/Illinois Traffic Crash Data Extract Metadata 112014-Crash.docx)
* Vehicle: [DOCument with notes](http://s3.amazonaws.com/chicagocrashes/data_dictionary/Illinois Traffic Crash Data Extract Metadata 112014-Person.docx)
* Person: [DOCument with notes](http://s3.amazonaws.com/chicagocrashes/data_dictionary/Illinois Traffic Crash Data Extract Metadata 112014-Vehicle.docx)

## Data Links

The data is zipped CSV files. Most of these don't have the field names. You can add those using the field name files at the bottom. 

* [Summaries of each Illinois municipality on IDOT's website](https://apps.dot.illinois.gov/eplan/desenv/crash/City%20Summaries/)
* [Other crash data from IDOT](http://www.idot.illinois.gov/transportation-system/safety/Illinois-Roadway-Crash-Data)

### 2005 - City of Chicago

*   [Crash](http://s3.amazonaws.com/chicagocrashes/crashdata/chicago_2005/2005_CrashExtract.txt.zip)
*   [Vehicle](http://s3.amazonaws.com/chicagocrashes/crashdata/chicago_2005/2005_VehicleExtract.txt.zip)
*   [Person](http://s3.amazonaws.com/chicagocrashes/crashdata/chicago_2005/2005_PersonExtract.txt.zip)

### 2006 - City of Chicago

*   [Crash](http://s3.amazonaws.com/chicagocrashes/crashdata/chicago_2006/2006_CrashExtract.txt.zip)
*   [Vehicle](http://s3.amazonaws.com/chicagocrashes/crashdata/chicago_2006/2006_VehicleExtract.txt.zip)
*   [Person](http://s3.amazonaws.com/chicagocrashes/crashdata/chicago_2006/2006_PersonExtract.txt.zip)

### 2007 - City of Chicago

*   [Crash](http://s3.amazonaws.com/chicagocrashes/crashdata/chicago_2007/2007_CrashExtract.txt.zip)
*   [Vehicle](http://s3.amazonaws.com/chicagocrashes/crashdata/chicago_2007/2007_VehicleExtract.txt.zip)
*   [Person](http://s3.amazonaws.com/chicagocrashes/crashdata/chicago_2007/2007_PersonExtract.txt.zip)

### 2008 - City of Chicago

*   [Crash](http://s3.amazonaws.com/chicagocrashes/crashdata/chicago_2008/2008_CrashExtract.txt.zip)
*   [Vehicle](http://s3.amazonaws.com/chicagocrashes/crashdata/chicago_2008/2008_VehicleExtract.txt.zip)
*   [Person](http://s3.amazonaws.com/chicagocrashes/crashdata/chicago_2008/2008_PersonExtract.txt.zip)

### 2009 - State of Illinois

*   [All three tables](http://chicagocrashes.s3.amazonaws.com/crashdata/illinois_2009/StatewideExtract2009.zip)

### 2010 - State of Illinois

*   [Crash](http://s3.amazonaws.com/chicagocrashes/crashdata/illinois_2010/2010_CrashExtract.txt.zip)
*   [Vehicle](http://s3.amazonaws.com/chicagocrashes/crashdata/illinois_2010/2010_VehicleExtract.txt.zip)
*   [Person](http://s3.amazonaws.com/chicagocrashes/crashdata/illinois_2010/2010_PersonExtract.txt.zip)

### 2011 - State of Illinois

*   [Crash](http://s3.amazonaws.com/chicagocrashes/crashdata/illinois_2011/2011_CrashExtract.txt.zip)
*   [Vehicle](http://s3.amazonaws.com/chicagocrashes/crashdata/illinois_2011/2011_VehicleExtract.txt.zip)
*   [Person](http://s3.amazonaws.com/chicagocrashes/crashdata/illinois_2011/2011_PersonExtract.txt.zip)

### 2012 - State of Illinois

*   [All three tables](http://chicagocrashes.s3.amazonaws.com/crashdata/illinois_2012/StatewideExtract2012.zip) 

### 2013 - State of Illinois (note changes in Data Dictionary above)
*   [All three tables](http://s3.amazonaws.com/chicagocrashes/crashdata/illinois_2013/StatewideExtract2013.zip) (80 MB)
*   [Crash](http://s3.amazonaws.com/chicagocrashes/crashdata/illinois_2013/2013_CrashExtract.txt.zip) (36 MB)
*   [Vehicle](http://s3.amazonaws.com/chicagocrashes/crashdata/illinois_2013/2013_VehicleExtract.txt.zip) (23 MB)
*   [Person](http://s3.amazonaws.com/chicagocrashes/crashdata/illinois_2013/2013_PersonExtract.txt.zip) (14 MB)

### 2014 - State of Illinois (note changes in Data Dictionary above)
*   [All three tables](http://s3.amazonaws.com/chicagocrashes/crashdata/illinois_2014/StatewideExtract2014.zip) (83 MB)
*   [Crash](http://s3.amazonaws.com/chicagocrashes/crashdata/illinois_2014/2014_IllinoisCrashExtract.txt.zip) (37 MB)
*   [Vehicle](http://s3.amazonaws.com/chicagocrashes/crashdata/illinois_2014/2014_IllinoisVehicleExtract.txt.zip) (24 MB)
*   [Person](http://s3.amazonaws.com/chicagocrashes/crashdata/illinois_2014/2014_IllinoisPersonExtract.txt.zip) (15 MB)

### 2015 - City of Chicago
Data was posted on April 16, 2017. I thought I asked for the whole state, but maybe I didn't. I'll try to get those later. 
* [All three tables](http://chicagocrashes.s3.amazonaws.com/crashdata/chicago_2015/2015_ChicagoAllThreeTables.zip) (20 MB)
* [Crash](http://chicagocrashes.s3.amazonaws.com/crashdata/chicago_2015/2015_ChicagoCrashExtract.txt.zip) (9 MB)
* [Vehicle](http://chicagocrashes.s3.amazonaws.com/crashdata/chicago_2015/2015_ChicagoVehicleExtract.txt.zip) (7 MB)
* [Person](http://chicagocrashes.s3.amazonaws.com/crashdata/chicago_2015/2015_ChicagoPersonExtract.txt.zip) (4 MB)
* [Summary report](http://chicagocrashes.s3.amazonaws.com/crashdata/chicago_2015/Chicago%202015%20City%20Summary.pdf)
* [Dooring report](http://chicagocrashes.s3.amazonaws.com/crashdata/chicago_2015/Chicago%20Dooring%20Report%202015.pdf) - dooring crashes aren't included in the crash table

### Field Names for 2006-2012
Append these to the top of the CSV data. 
*   [Crash](http://chicagocrashes.s3.amazonaws.com/field_names/crash_field_names_2006-2012.csv)
*   [Vehicle](http://chicagocrashes.s3.amazonaws.com/field_names/person_field_names_2006_2012.csv)
*   [Person](http://chicagocrashes.s3.amazonaws.com/field_names/vehicle_field_names_2006_2012.csv)

### Field Names for 2013-2015
* [Crash 2013-2015](http://chicagocrashes.s3.amazonaws.com/field_names/crash_field_names_2013-2015.csv)
* Vehicle - not prepared
* Person - not prepared
