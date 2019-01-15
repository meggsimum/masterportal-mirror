// https://geodienste.hamburg.de/HH_WFS_GAGES?service=WFS&request=GetFeature&version=2.0.0&StoredQuery_ID=findeStadtteil&stadtteilname=bar
export default `<?xml version='1.0' encoding='UTF-8'?>
<wfs:FeatureCollection xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/wfs/2.0 http://schemas.opengis.net/wfs/2.0/wfs.xsd http://www.opengis.net/gml/3.2 http://schemas.opengis.net/gml/3.2.1/gml.xsd http://www.adv-online.de/namespaces/adv/dog https://geodienste.hamburg.de/HH_WFS_GAGES?SERVICE=WFS&amp;VERSION=2.0.0&amp;REQUEST=DescribeFeatureType&amp;OUTPUTFORMAT=application%2Fgml%2Bxml%3B+version%3D3.2&amp;TYPENAME=dog:Kreise&amp;NAMESPACES=xmlns(dog,http%3A%2F%2Fwww.adv-online.de%2Fnamespaces%2Fadv%2Fdog)" xmlns:wfs="http://www.opengis.net/wfs/2.0" timeStamp="2018-12-17T12:45:55Z" xmlns:gml="http://www.opengis.net/gml/3.2" numberMatched="unknown" numberReturned="0">
<!--NOTE: numberReturned attribute should be 'unknown' as well, but this would not validate against the current version of the WFS 2.0 schema (change upcoming). See change request (CR 144): https://portal.opengeospatial.org/files?artifact_id=43925.-->
<wfs:member>
    <dog:Kreise xmlns:dog="http://www.adv-online.de/namespaces/adv/dog" gml:id="HH_KRS_91435">
    <iso19112:geographicIdentifier xmlns:iso19112="http://www.opengis.net/iso19112">Barmbek-Nord</iso19112:geographicIdentifier>
    <iso19112:geographicExtent xmlns:iso19112="http://www.opengis.net/iso19112">
        <gmd:EX_BoundingPolygon xmlns:gmd="http://www.isotc211.org/2005/gmd">
        <gmd:polygon>
            <gml:Polygon gml:id="HH_KRS_91435_ISO19112_GEOGRAPHICEXTENT" srsName="urn:ogc:def:crs:EPSG::25832">
            <gml:exterior>
                <gml:LinearRing>
                <gml:posList>568356.869 5937678.721 570782.596 5937678.721 570782.596 5940414.428 568356.869 5940414.428 568356.869 5937678.721</gml:posList>
                </gml:LinearRing>
            </gml:exterior>
            </gml:Polygon>
        </gmd:polygon>
        </gmd:EX_BoundingPolygon>
    </iso19112:geographicExtent>
    <iso19112:position xmlns:iso19112="http://www.opengis.net/iso19112">
        <!--Inlined geometry 'HH_KRS_91435_ISO19112_POSITION'-->
        <gml:Point gml:id="HH_KRS_91435_ISO19112_POSITION" srsName="urn:ogc:def:crs:EPSG::25832">
        <gml:pos>569569.732 5939046.574</gml:pos>
        </gml:Point>
    </iso19112:position>
    <iso19112:locationType xmlns:iso19112="http://www.opengis.net/iso19112" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://geodienste.hamburg.de/HH_WFS_GAGES?SERVICE=WFS&amp;VERSION=2.0.0&amp;REQUEST=GetFeature&amp;OUTPUTFORMAT=application%2Fgml%2Bxml%3B+version%3D3.2&amp;STOREDQUERY_ID=urn:ogc:def:query:OGC-WFS::GetFeatureById&amp;ID=HH_SILC_6#HH_SILC_6"/>
    <dog:land>02</dog:land>
    <dog:regierungsbezirk>4</dog:regierungsbezirk>
    <dog:kreis>10</dog:kreis>
    <dog:kreisschluessel>02;4;10</dog:kreisschluessel>
    <dog:kreisname_normalisiert>BARMBEKNORD</dog:kreisname_normalisiert>
    <dog:regierungsbezirksname_normalisiert>HAMBURGNORD</dog:regierungsbezirksname_normalisiert>
    <dog:bundeslandname>Hamburg</dog:bundeslandname>
    <dog:bundeslandname_normalisiert>HAMBURG</dog:bundeslandname_normalisiert>
    </dog:Kreise>
</wfs:member>
<wfs:member>
    <dog:Kreise xmlns:dog="http://www.adv-online.de/namespaces/adv/dog" gml:id="HH_KRS_91450">
    <iso19112:geographicIdentifier xmlns:iso19112="http://www.opengis.net/iso19112">Barmbek-Süd</iso19112:geographicIdentifier>
    <iso19112:geographicExtent xmlns:iso19112="http://www.opengis.net/iso19112">
        <gmd:EX_BoundingPolygon xmlns:gmd="http://www.isotc211.org/2005/gmd">
        <gmd:polygon>
            <gml:Polygon gml:id="HH_KRS_91450_ISO19112_GEOGRAPHICEXTENT" srsName="urn:ogc:def:crs:EPSG::25832">
            <gml:exterior>
                <gml:LinearRing>
                <gml:posList>567482.682 5936181.467 569976.333 5936181.467 569976.333 5937853.832 567482.682 5937853.832 567482.682 5936181.467</gml:posList>
                </gml:LinearRing>
            </gml:exterior>
            </gml:Polygon>
        </gmd:polygon>
        </gmd:EX_BoundingPolygon>
    </iso19112:geographicExtent>
    <iso19112:position xmlns:iso19112="http://www.opengis.net/iso19112">
        <!--Inlined geometry 'HH_KRS_91450_ISO19112_POSITION'-->
        <gml:Point gml:id="HH_KRS_91450_ISO19112_POSITION" srsName="urn:ogc:def:crs:EPSG::25832">
        <gml:pos>568729.508 5937017.649</gml:pos>
        </gml:Point>
    </iso19112:position>
    <iso19112:locationType xmlns:iso19112="http://www.opengis.net/iso19112" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://geodienste.hamburg.de/HH_WFS_GAGES?SERVICE=WFS&amp;VERSION=2.0.0&amp;REQUEST=GetFeature&amp;OUTPUTFORMAT=application%2Fgml%2Bxml%3B+version%3D3.2&amp;STOREDQUERY_ID=urn:ogc:def:query:OGC-WFS::GetFeatureById&amp;ID=HH_SILC_6#HH_SILC_6"/>
    <dog:land>02</dog:land>
    <dog:regierungsbezirk>4</dog:regierungsbezirk>
    <dog:kreis>08</dog:kreis>
    <dog:kreisschluessel>02;4;08</dog:kreisschluessel>
    <dog:kreisname_normalisiert>BARMBEKSUD</dog:kreisname_normalisiert>
    <dog:regierungsbezirksname_normalisiert>HAMBURGNORD</dog:regierungsbezirksname_normalisiert>
    <dog:bundeslandname>Hamburg</dog:bundeslandname>
    <dog:bundeslandname_normalisiert>HAMBURG</dog:bundeslandname_normalisiert>
    </dog:Kreise>
</wfs:member>
</wfs:FeatureCollection>`;
