import sys
from datetime import datetime, timedelta

if len(sys.argv) != 3:
    raise Exception("Usage: python3 generateGpx.py activityTitle heartRate")

activityTitle = sys.argv[1];
hr = sys.argv[2];
startingTime = datetime(2016, 5, 3, 21, 0, 0)

def printTrkpt(heartRate, lon, time):
    print('   <trkpt lat="0.0" lon="' + '{0:.7f}'.format(lon) + '">')
    print('    <ele>0.0</ele>')
    print('    <time>' + time.isoformat() + 'Z</time>')
    print('    <extensions>')
    print('     <gpxtpx:TrackPointExtension>')
    print('      <gpxtpx:hr>' + heartRate + '</gpxtpx:hr>')
    print('     </gpxtpx:TrackPointExtension>')
    print('    </extensions>')
    print('   </trkpt>')

def main():
    print('<?xml version="1.0" encoding="UTF-8"?>')
    print('<gpx creator="StravaGPX" version="1.1" xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd http://www.garmin.com/xmlschemas/GpxExtensions/v3 http://www.garmin.com/xmlschemas/GpxExtensionsv3.xsd http://www.garmin.com/xmlschemas/TrackPointExtension/v1 http://www.garmin.com/xmlschemas/TrackPointExtensionv1.xsd" xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1" xmlns:gpxx="http://www.garmin.com/xmlschemas/GpxExtensions/v3">')
    print(' <metadata>')
    print('  <time>' + startingTime.isoformat() + 'Z</time>')
    print(' </metadata>')
    print(' <trk>')
    print('  <name>Template</name>')
    print('  <trkseg>')

    lon = 0.00005
    for i in range(18001):
        printTrkpt(hr, lon*i, startingTime + timedelta(0,i))

    print('  </trkseg>')
    print(' </trk>')
    print('</gpx>')

main();