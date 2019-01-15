// https://geodienste.hamburg.de/HH_WFS_GAGES?service=WFS&request=GetFeature&version=2.0.0&StoredQuery_ID=HausnummernZuStrasse&strassenname=Pflugacker
export default `<?xml version='1.0' encoding='UTF-8'?>
<wfs:FeatureCollection xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/wfs/2.0 http://schemas.opengis.net/wfs/2.0/wfs.xsd http://www.opengis.net/gml/3.2 http://schemas.opengis.net/gml/3.2.1/gml.xsd http://www.hamburg.de/namespaces/gages https://geodienste.hamburg.de/HH_WFS_GAGES?SERVICE=WFS&amp;VERSION=2.0.0&amp;REQUEST=DescribeFeatureType&amp;OUTPUTFORMAT=application%2Fgml%2Bxml%3B+version%3D3.2&amp;TYPENAME=gages:Hauskoordinaten&amp;NAMESPACES=xmlns(gages,http%3A%2F%2Fwww.hamburg.de%2Fnamespaces%2Fgages)" xmlns:wfs="http://www.opengis.net/wfs/2.0" timeStamp="2018-12-17T13:00:52Z" xmlns:gml="http://www.opengis.net/gml/3.2" numberMatched="unknown" numberReturned="0">
<!--NOTE: numberReturned attribute should be 'unknown' as well, but this would not validate against the current version of the WFS 2.0 schema (change upcoming). See change request (CR 144): https://portal.opengeospatial.org/files?artifact_id=43925.-->
<wfs:member>
    <gages:Hauskoordinaten xmlns:gages="http://www.hamburg.de/namespaces/gages" gml:id="HH_H_256224167">
    <iso19112:geographicIdentifier xmlns:iso19112="http://www.opengis.net/iso19112">Pflugacker 11a, 22523  Hamburg(OT Eidelstedt)</iso19112:geographicIdentifier>
    <iso19112:geographicExtent xmlns:iso19112="http://www.opengis.net/iso19112">
        <gmd:EX_BoundingPolygon xmlns:gmd="http://www.isotc211.org/2005/gmd">
        <gmd:polygon>
            <gml:Polygon gml:id="HH_H_256224167_ISO19112_GEOGRAPHICEXTENT" srsName="urn:ogc:def:crs:EPSG::25832">
            <gml:exterior>
                <gml:LinearRing>
                <gml:posList>559562.466 5940928.639 559562.466 5940978.639 559612.466 5940978.639 559612.466 5940928.639 559562.466 5940928.639</gml:posList>
                </gml:LinearRing>
            </gml:exterior>
            </gml:Polygon>
        </gmd:polygon>
        </gmd:EX_BoundingPolygon>
    </iso19112:geographicExtent>
    <iso19112:position xmlns:iso19112="http://www.opengis.net/iso19112">
        <!--Inlined geometry 'HH_H_256224167_ISO19112_POSITION'-->
        <gml:Point gml:id="HH_H_256224167_ISO19112_POSITION" srsName="urn:ogc:def:crs:EPSG::25832">
        <gml:pos>559587.466 5940953.639</gml:pos>
        </gml:Point>
    </iso19112:position>
    <iso19112:locationType xmlns:iso19112="http://www.opengis.net/iso19112" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://geodienste.hamburg.de/HH_WFS_GAGES?SERVICE=WFS&amp;VERSION=2.0.0&amp;REQUEST=GetFeature&amp;OUTPUTFORMAT=application%2Fgml%2Bxml%3B+version%3D3.2&amp;STOREDQUERY_ID=urn:ogc:def:query:OGC-WFS::GetFeatureById&amp;ID=HH_SILC_1#HH_SILC_1"/>
    <dog:hausnummer xmlns:dog="http://www.adv-online.de/namespaces/adv/dog">11</dog:hausnummer>
    <dog:hausnummernzusatz xmlns:dog="http://www.adv-online.de/namespaces/adv/dog">a</dog:hausnummernzusatz>
    </gages:Hauskoordinaten>
</wfs:member>
</wfs:FeatureCollection>`;
