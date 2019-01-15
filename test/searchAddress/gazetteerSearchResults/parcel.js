// https://geodienste.hamburg.de/HH_WFS_GAGES?service=WFS&request=GetFeature&version=2.0.0&StoredQuery_ID=Flurstueck&gemarkung=0147&flurstuecksnummer=12561
export default `<?xml version='1.0' encoding='UTF-8'?>
<wfs:FeatureCollection xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/wfs/2.0 http://schemas.opengis.net/wfs/2.0/wfs.xsd http://www.opengis.net/gml/3.2 http://schemas.opengis.net/gml/3.2.1/gml.xsd http://www.adv-online.de/namespaces/adv/dog https://geodienste.hamburg.de/HH_WFS_GAGES?SERVICE=WFS&amp;VERSION=2.0.0&amp;REQUEST=DescribeFeatureType&amp;OUTPUTFORMAT=application%2Fgml%2Bxml%3B+version%3D3.2&amp;TYPENAME=dog:Flurstueckskoordinaten&amp;NAMESPACES=xmlns(dog,http%3A%2F%2Fwww.adv-online.de%2Fnamespaces%2Fadv%2Fdog)" xmlns:wfs="http://www.opengis.net/wfs/2.0" timeStamp="2018-12-17T14:30:50Z" xmlns:gml="http://www.opengis.net/gml/3.2" numberMatched="unknown" numberReturned="0">
<!--NOTE: numberReturned attribute should be 'unknown' as well, but this would not validate against the current version of the WFS 2.0 schema (change upcoming). See change request (CR 144): https://portal.opengeospatial.org/files?artifact_id=43925.-->
<wfs:member>
    <dog:Flurstueckskoordinaten xmlns:dog="http://www.adv-online.de/namespaces/adv/dog" gml:id="HH_FLURSTUECK_227875032">
    <iso19112:geographicIdentifier xmlns:iso19112="http://www.opengis.net/iso19112">02;0147;;12561;;</iso19112:geographicIdentifier>
    <iso19112:geographicExtent xmlns:iso19112="http://www.opengis.net/iso19112">
        <gmd:EX_BoundingPolygon xmlns:gmd="http://www.isotc211.org/2005/gmd">
        <gmd:polygon>
            <gml:Polygon gml:id="HH_FLURSTUECK_227875032_ISO19112_GEOGRAPHICEXTENT" srsName="urn:ogc:def:crs:EPSG::25832">
            <gml:exterior>
                <gml:LinearRing>
                <gml:posList>566458.579 5928101.330 566458.579 5928151.330 566508.579 5928151.330 566508.579 5928101.330 566458.579 5928101.330</gml:posList>
                </gml:LinearRing>
            </gml:exterior>
            </gml:Polygon>
        </gmd:polygon>
        </gmd:EX_BoundingPolygon>
    </iso19112:geographicExtent>
    <iso19112:position xmlns:iso19112="http://www.opengis.net/iso19112">
        <!--Inlined geometry 'HH_FLURSTUECK_227875032_ISO19112_POSITION'-->
        <gml:Point gml:id="HH_FLURSTUECK_227875032_ISO19112_POSITION" srsName="urn:ogc:def:crs:EPSG::25832">
        <gml:pos>566483.579 5928126.330</gml:pos>
        </gml:Point>
    </iso19112:position>
    <iso19112:gazetteer xmlns:iso19112="http://www.opengis.net/iso19112" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://geodienste.hamburg.de/HH_WFS_GAGES?SERVICE=WFS&amp;VERSION=2.0.0&amp;REQUEST=GetFeature&amp;OUTPUTFORMAT=application%2Fgml%2Bxml%3B+version%3D3.2&amp;STOREDQUERY_ID=urn:ogc:def:query:OGC-WFS::GetFeatureById&amp;ID=HH_SIGA_2#HH_SIGA_2"/>
    <iso19112:locationType xmlns:iso19112="http://www.opengis.net/iso19112" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://geodienste.hamburg.de/HH_WFS_GAGES?SERVICE=WFS&amp;VERSION=2.0.0&amp;REQUEST=GetFeature&amp;OUTPUTFORMAT=application%2Fgml%2Bxml%3B+version%3D3.2&amp;STOREDQUERY_ID=urn:ogc:def:query:OGC-WFS::GetFeatureById&amp;ID=HH_SILC_9#HH_SILC_9"/>
    <iso19112:parent xmlns:iso19112="http://www.opengis.net/iso19112">02;0147</iso19112:parent>
    <dog:land>02</dog:land>
    <dog:gemarkung>0147</dog:gemarkung>
    <dog:flurstuecksnummer>12561</dog:flurstuecksnummer>
    <dog:flurstueck_lang>12561</dog:flurstueck_lang>
    <dog:flurstuecksflaeche>25</dog:flurstuecksflaeche>
    <dog:status>0</dog:status>
    <dog:regierungsbezirk>1</dog:regierungsbezirk>
    <dog:kreis>16</dog:kreis>
    <dog:gemeinde>137</dog:gemeinde>
    <dog:verwaltungsart>Flurstueck</dog:verwaltungsart>
    <dog:gemeindename>Wilhelmsburg</dog:gemeindename>
    <dog:kreisname>Wilhelmsburg</dog:kreisname>
    </dog:Flurstueckskoordinaten>
</wfs:member>
</wfs:FeatureCollection>`;
