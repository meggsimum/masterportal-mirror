// https://geodienste.hamburg.de/HH_WFS_GAGES?service=WFS&request=GetFeature&version=2.0.0&StoredQuery_ID=findeStrassenSchluessel&strassenschluessel=A1270
export default `<?xml version='1.0' encoding='UTF-8'?>
<wfs:FeatureCollection xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/wfs/2.0 http://schemas.opengis.net/wfs/2.0/wfs.xsd http://www.opengis.net/gml/3.2 http://schemas.opengis.net/gml/3.2.1/gml.xsd http://www.adv-online.de/namespaces/adv/dog https://geodienste.hamburg.de/HH_WFS_GAGES?SERVICE=WFS&amp;VERSION=2.0.0&amp;REQUEST=DescribeFeatureType&amp;OUTPUTFORMAT=application%2Fgml%2Bxml%3B+version%3D3.2&amp;TYPENAME=dog:Strassen&amp;NAMESPACES=xmlns(dog,http%3A%2F%2Fwww.adv-online.de%2Fnamespaces%2Fadv%2Fdog)" xmlns:wfs="http://www.opengis.net/wfs/2.0" timeStamp="2018-12-17T13:04:04Z" xmlns:gml="http://www.opengis.net/gml/3.2" numberMatched="unknown" numberReturned="0">
<!--NOTE: numberReturned attribute should be 'unknown' as well, but this would not validate against the current version of the WFS 2.0 schema (change upcoming). See change request (CR 144): https://portal.opengeospatial.org/files?artifact_id=43925.-->
<wfs:member>
    <dog:Strassen xmlns:dog="http://www.adv-online.de/namespaces/adv/dog" gml:id="HH_STR_7612101">
    <iso19112:geographicIdentifier xmlns:iso19112="http://www.opengis.net/iso19112">Alte Marsch (OT Neugraben-Fischbek) , Hamburg  (21149)</iso19112:geographicIdentifier>
    <iso19112:geographicExtent xmlns:iso19112="http://www.opengis.net/iso19112">
        <gmd:EX_BoundingPolygon xmlns:gmd="http://www.isotc211.org/2005/gmd">
        <gmd:polygon>
            <gml:Polygon gml:id="HH_STR_7612101_ISO19112_GEOGRAPHICEXTENT" srsName="urn:ogc:def:crs:EPSG::25832">
            <gml:exterior>
                <gml:LinearRing>
                <gml:posList>555024.929 5925215.300 555158.132 5925215.300 555158.132 5925409.413 555024.929 5925409.413 555024.929 5925215.300</gml:posList>
                </gml:LinearRing>
            </gml:exterior>
            </gml:Polygon>
        </gmd:polygon>
        </gmd:EX_BoundingPolygon>
    </iso19112:geographicExtent>
    <iso19112:position xmlns:iso19112="http://www.opengis.net/iso19112">
        <!--Inlined geometry 'HH_STR_7612101_ISO19112_POSITION'-->
        <gml:Point gml:id="HH_STR_7612101_ISO19112_POSITION" srsName="urn:ogc:def:crs:EPSG::25832">
        <gml:pos>555091.531 5925312.357</gml:pos>
        </gml:Point>
    </iso19112:position>
    <iso19112:position_strassenachse xmlns:iso19112="http://www.opengis.net/iso19112">
        <!--Inlined geometry 'HH_STR_7612101_ISO19112_POSITION_STRASSENACHSE'-->
        <gml:Point gml:id="HH_STR_7612101_ISO19112_POSITION_STRASSENACHSE" srsName="urn:ogc:def:crs:EPSG::25832">
        <gml:pos>555108.287 5925298.269</gml:pos>
        </gml:Point>
    </iso19112:position_strassenachse>
    <iso19112:gazetteer xmlns:iso19112="http://www.opengis.net/iso19112" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://geodienste.hamburg.de/HH_WFS_GAGES?SERVICE=WFS&amp;VERSION=2.0.0&amp;REQUEST=GetFeature&amp;OUTPUTFORMAT=application%2Fgml%2Bxml%3B+version%3D3.2&amp;STOREDQUERY_ID=urn:ogc:def:query:OGC-WFS::GetFeatureById&amp;ID=HH_SIGA_2#HH_SIGA_2"/>
    <iso19112:locationType xmlns:iso19112="http://www.opengis.net/iso19112" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://geodienste.hamburg.de/HH_WFS_GAGES?SERVICE=WFS&amp;VERSION=2.0.0&amp;REQUEST=GetFeature&amp;OUTPUTFORMAT=application%2Fgml%2Bxml%3B+version%3D3.2&amp;STOREDQUERY_ID=urn:ogc:def:query:OGC-WFS::GetFeatureById&amp;ID=HH_SILC_2#HH_SILC_2"/>
    <dog:land>02</dog:land>
    <dog:strassenschluessel>02;7;14;715;0715;A1270</dog:strassenschluessel>
    <dog:strassenname>Alte Marsch</dog:strassenname>
    <dog:strassenname_normalisiert>ALTEMARSCH</dog:strassenname_normalisiert>
    <dog:strassenname_soundex>A435</dog:strassenname_soundex>
    <dog:ortsteilname>OT 0715</dog:ortsteilname>
    <dog:ortsteilname_normalisiert>OT0715</dog:ortsteilname_normalisiert>
    <dog:gemeindename_normalisiert>OT0715</dog:gemeindename_normalisiert>
    <dog:postleitzahl>21149</dog:postleitzahl>
    <dog:postOrtsteil>Neugraben-Fischbek</dog:postOrtsteil>
    <dog:postOrtsteil_normalisiert>NEUGRABENFISCHBEK</dog:postOrtsteil_normalisiert>
    <dog:postleitzahl>21149</dog:postleitzahl>
    <dog:ortsnamePost>Hamburg</dog:ortsnamePost>
    <dog:ortsnamePost_normalisiert>HAMBURG</dog:ortsnamePost_normalisiert>
    </dog:Strassen>
</wfs:member>
</wfs:FeatureCollection>`;
