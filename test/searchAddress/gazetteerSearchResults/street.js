// https://geodienste.hamburg.de/HH_WFS_GAGES?service=WFS&request=GetFeature&version=2.0.0&StoredQuery_ID=findeStrasse&strassenname=bargkoppelweg
export default `<?xml version='1.0' encoding='UTF-8'?>
<wfs:FeatureCollection xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/wfs/2.0 http://schemas.opengis.net/wfs/2.0/wfs.xsd http://www.opengis.net/gml/3.2 http://schemas.opengis.net/gml/3.2.1/gml.xsd http://www.adv-online.de/namespaces/adv/dog https://geodienste.hamburg.de/HH_WFS_GAGES?SERVICE=WFS&amp;VERSION=2.0.0&amp;REQUEST=DescribeFeatureType&amp;OUTPUTFORMAT=application%2Fgml%2Bxml%3B+version%3D3.2&amp;TYPENAME=dog:Strassen&amp;NAMESPACES=xmlns(dog,http%3A%2F%2Fwww.adv-online.de%2Fnamespaces%2Fadv%2Fdog)" xmlns:wfs="http://www.opengis.net/wfs/2.0" timeStamp="2018-12-17T12:48:49Z" xmlns:gml="http://www.opengis.net/gml/3.2" numberMatched="unknown" numberReturned="0">
<!--NOTE: numberReturned attribute should be 'unknown' as well, but this would not validate against the current version of the WFS 2.0 schema (change upcoming). See change request (CR 144): https://portal.opengeospatial.org/files?artifact_id=43925.-->
<wfs:member>
    <dog:Strassen xmlns:dog="http://www.adv-online.de/namespaces/adv/dog" gml:id="HH_STR_7610147">
    <iso19112:geographicIdentifier xmlns:iso19112="http://www.opengis.net/iso19112">Bargkoppelweg (OT Rahlstedt) , Hamburg  (22145)</iso19112:geographicIdentifier>
    <iso19112:geographicExtent xmlns:iso19112="http://www.opengis.net/iso19112">
        <gmd:EX_BoundingPolygon xmlns:gmd="http://www.isotc211.org/2005/gmd">
        <gmd:polygon>
            <gml:Polygon gml:id="HH_STR_7610147_ISO19112_GEOGRAPHICEXTENT" srsName="urn:ogc:def:crs:EPSG::25832">
            <gml:exterior>
                <gml:LinearRing>
                <gml:posList>576020.921 5941871.589 576777.652 5941871.589 576777.652 5942463.286 576020.921 5942463.286 576020.921 5941871.589</gml:posList>
                </gml:LinearRing>
            </gml:exterior>
            </gml:Polygon>
        </gmd:polygon>
        </gmd:EX_BoundingPolygon>
    </iso19112:geographicExtent>
    <iso19112:position xmlns:iso19112="http://www.opengis.net/iso19112">
        <!--Inlined geometry 'HH_STR_7610147_ISO19112_POSITION'-->
        <gml:Point gml:id="HH_STR_7610147_ISO19112_POSITION" srsName="urn:ogc:def:crs:EPSG::25832">
        <gml:pos>576399.286 5942167.438</gml:pos>
        </gml:Point>
    </iso19112:position>
    <iso19112:position_strassenachse xmlns:iso19112="http://www.opengis.net/iso19112">
        <!--Inlined geometry 'HH_STR_7610147_ISO19112_POSITION_STRASSENACHSE'-->
        <gml:Point gml:id="HH_STR_7610147_ISO19112_POSITION_STRASSENACHSE" srsName="urn:ogc:def:crs:EPSG::25832">
        <gml:pos>576096.393 5941919.653</gml:pos>
        </gml:Point>
    </iso19112:position_strassenachse>
    <iso19112:locationType xmlns:iso19112="http://www.opengis.net/iso19112" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://geodienste.hamburg.de/HH_WFS_GAGES?SERVICE=WFS&amp;VERSION=2.0.0&amp;REQUEST=GetFeature&amp;OUTPUTFORMAT=application%2Fgml%2Bxml%3B+version%3D3.2&amp;STOREDQUERY_ID=urn:ogc:def:query:OGC-WFS::GetFeatureById&amp;ID=HH_SILC_2#HH_SILC_2"/>
    <dog:land>02</dog:land>
    <dog:strassenschluessel>02;5;18;526;0526;B0610</dog:strassenschluessel>
    <dog:strassenname>Bargkoppelweg</dog:strassenname>
    <dog:ortsteilname>OT 0526</dog:ortsteilname>
    <dog:ortsteilname_normalisiert>OT0526</dog:ortsteilname_normalisiert>
    <dog:gemeindename_normalisiert>OT0526</dog:gemeindename_normalisiert>
    <dog:postOrtsteil>Rahlstedt</dog:postOrtsteil>
    <dog:postOrtsteil_normalisiert>RAHLSTEDT</dog:postOrtsteil_normalisiert>
    <dog:ortsnamePost>Hamburg</dog:ortsnamePost>
    <dog:ortsnamePost_normalisiert>HAMBURG</dog:ortsnamePost_normalisiert>
    </dog:Strassen>
</wfs:member>
</wfs:FeatureCollection>`;
