// https://geodienste.hamburg.de/HH_WFS_GAGES?service=WFS&request=GetFeature&version=2.0.0&StoredQuery_ID=AdresseMitZusatz&strassenname=pflugacker&hausnummer=13&zusatz=b
export const adresseMitZusatz = `<?xml version='1.0' encoding='UTF-8'?>
<wfs:FeatureCollection xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/wfs/2.0 http://schemas.opengis.net/wfs/2.0/wfs.xsd http://www.opengis.net/gml/3.2 http://schemas.opengis.net/gml/3.2.1/gml.xsd http://www.hamburg.de/namespaces/gages https://geodienste.hamburg.de/HH_WFS_GAGES?SERVICE=WFS&amp;VERSION=2.0.0&amp;REQUEST=DescribeFeatureType&amp;OUTPUTFORMAT=application%2Fgml%2Bxml%3B+version%3D3.2&amp;TYPENAME=gages:Hauskoordinaten&amp;NAMESPACES=xmlns(gages,http%3A%2F%2Fwww.hamburg.de%2Fnamespaces%2Fgages)" xmlns:wfs="http://www.opengis.net/wfs/2.0" timeStamp="2018-12-17T12:57:18Z" xmlns:gml="http://www.opengis.net/gml/3.2" numberMatched="unknown" numberReturned="0">
<!--NOTE: numberReturned attribute should be 'unknown' as well, but this would not validate against the current version of the WFS 2.0 schema (change upcoming). See change request (CR 144): https://portal.opengeospatial.org/files?artifact_id=43925.-->
<wfs:member>
    <gages:Hauskoordinaten xmlns:gages="http://www.hamburg.de/namespaces/gages" gml:id="HH_H_256179889">
    <iso19112:geographicIdentifier xmlns:iso19112="http://www.opengis.net/iso19112">Pflugacker 13b, 22523  Hamburg(OT Eidelstedt)</iso19112:geographicIdentifier>
    <iso19112:geographicExtent xmlns:iso19112="http://www.opengis.net/iso19112">
        <gmd:EX_BoundingPolygon xmlns:gmd="http://www.isotc211.org/2005/gmd">
        <gmd:polygon>
            <gml:Polygon gml:id="HH_H_256179889_ISO19112_GEOGRAPHICEXTENT" srsName="urn:ogc:def:crs:EPSG::25832">
            <gml:exterior>
                <gml:LinearRing>
                <gml:posList>559553.353 5941019.732 559553.353 5941069.732 559603.353 5941069.732 559603.353 5941019.732 559553.353 5941019.732</gml:posList>
                </gml:LinearRing>
            </gml:exterior>
            </gml:Polygon>
        </gmd:polygon>
        </gmd:EX_BoundingPolygon>
    </iso19112:geographicExtent>
    <iso19112:position xmlns:iso19112="http://www.opengis.net/iso19112">
        <!--Inlined geometry 'HH_H_256179889_ISO19112_POSITION'-->
        <gml:Point gml:id="HH_H_256179889_ISO19112_POSITION" srsName="urn:ogc:def:crs:EPSG::25832">
        <gml:pos>559578.353 5941044.732</gml:pos>
        </gml:Point>
    </iso19112:position>
    <iso19112:gazetteer xmlns:iso19112="http://www.opengis.net/iso19112" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://geodienste.hamburg.de/HH_WFS_GAGES?SERVICE=WFS&amp;VERSION=2.0.0&amp;REQUEST=GetFeature&amp;OUTPUTFORMAT=application%2Fgml%2Bxml%3B+version%3D3.2&amp;STOREDQUERY_ID=urn:ogc:def:query:OGC-WFS::GetFeatureById&amp;ID=HH_SIGA_2#HH_SIGA_2"/>
    <iso19112:locationType xmlns:iso19112="http://www.opengis.net/iso19112" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://geodienste.hamburg.de/HH_WFS_GAGES?SERVICE=WFS&amp;VERSION=2.0.0&amp;REQUEST=GetFeature&amp;OUTPUTFORMAT=application%2Fgml%2Bxml%3B+version%3D3.2&amp;STOREDQUERY_ID=urn:ogc:def:query:OGC-WFS::GetFeatureById&amp;ID=HH_SILC_1#HH_SILC_1"/>
    <iso19112:parent xmlns:iso19112="http://www.opengis.net/iso19112">Pflugacker (OT Eidelstedt) , Hamburg  (22523)</iso19112:parent>
    <dog:qualitaet xmlns:dog="http://www.adv-online.de/namespaces/adv/dog">A</dog:qualitaet>
    <dog:datensatznummer xmlns:dog="http://www.adv-online.de/namespaces/adv/dog">75348</dog:datensatznummer>
    <dog:land xmlns:dog="http://www.adv-online.de/namespaces/adv/dog">02</dog:land>
    <dog:regierungsbezirk xmlns:dog="http://www.adv-online.de/namespaces/adv/dog">3</dog:regierungsbezirk>
    <dog:kreis xmlns:dog="http://www.adv-online.de/namespaces/adv/dog">08</dog:kreis>
    <dog:gemeinde xmlns:dog="http://www.adv-online.de/namespaces/adv/dog">320</dog:gemeinde>
    <dog:ortsteil xmlns:dog="http://www.adv-online.de/namespaces/adv/dog">0320</dog:ortsteil>
    <dog:ortsteil_kurz xmlns:dog="http://www.adv-online.de/namespaces/adv/dog">320</dog:ortsteil_kurz>
    <dog:strasse xmlns:dog="http://www.adv-online.de/namespaces/adv/dog">P1080</dog:strasse>
    <dog:strasse_kurz xmlns:dog="http://www.adv-online.de/namespaces/adv/dog">P108</dog:strasse_kurz>
    <dog:hausnummer xmlns:dog="http://www.adv-online.de/namespaces/adv/dog">13</dog:hausnummer>
    <dog:hausnummernzusatz xmlns:dog="http://www.adv-online.de/namespaces/adv/dog">b</dog:hausnummernzusatz>
    <dog:hausschluessel xmlns:dog="http://www.adv-online.de/namespaces/adv/dog">02;3;08;320;0320;P1080;13;b</dog:hausschluessel>
    <dog:strassenname xmlns:dog="http://www.adv-online.de/namespaces/adv/dog">Pflugacker</dog:strassenname>
    <dog:strassenname_normalisiert xmlns:dog="http://www.adv-online.de/namespaces/adv/dog">PFLUGACKER</dog:strassenname_normalisiert>
    <dog:strassenname_soundex xmlns:dog="http://www.adv-online.de/namespaces/adv/dog">P142</dog:strassenname_soundex>
    <dog:ortsteilname xmlns:dog="http://www.adv-online.de/namespaces/adv/dog">Eidelstedt,OT 0320</dog:ortsteilname>
    <dog:ortsteilname_normalisiert xmlns:dog="http://www.adv-online.de/namespaces/adv/dog">OT0320</dog:ortsteilname_normalisiert>
    <dog:postleitzahl xmlns:dog="http://www.adv-online.de/namespaces/adv/dog">22523</dog:postleitzahl>
    <dog:postOrtsteil xmlns:dog="http://www.adv-online.de/namespaces/adv/dog">Eidelstedt</dog:postOrtsteil>
    <dog:postOrtsteil_normalisiert xmlns:dog="http://www.adv-online.de/namespaces/adv/dog">EIDELSTEDT</dog:postOrtsteil_normalisiert>
    <dog:ortsnamePost xmlns:dog="http://www.adv-online.de/namespaces/adv/dog">Hamburg</dog:ortsnamePost>
    <dog:ortsnamePost_normalisiert xmlns:dog="http://www.adv-online.de/namespaces/adv/dog">HAMBURG</dog:ortsnamePost_normalisiert>
    <gages:amtsgericht>G2</gages:amtsgericht>
    <gages:baubloecke>320053</gages:baubloecke>
    <gages:statistischesgebiet>42003</gages:statistischesgebiet>
    <gages:bezirke>Eimsbüttel</gages:bezirke>
    <gages:bezirkenr>3</gages:bezirkenr>
    <gages:finanzamt>Hamburg-Eimsbüttel</gages:finanzamt>
    <gages:finanzamtnr>2245</gages:finanzamtnr>
    <gages:grundbuchbezirk>305</gages:grundbuchbezirk>
    <gages:polizeikommissariat>27</gages:polizeikommissariat>
    <gages:wahlbezirk>32013</gages:wahlbezirk>
    <gages:wahl_datum>24.09.2017</gages:wahl_datum>
    <gages:wahlkreisbt>20</gages:wahlkreisbt>
    <gages:wahl_datum_bt>24.09.2017</gages:wahl_datum_bt>
    <gages:wahlkreisbu>6</gages:wahlkreisbu>
    <gages:wahl_datum_bu>15.02.2015</gages:wahl_datum_bu>
    <gages:wahlkreis_bv>7</gages:wahlkreis_bv>
    <gages:wahl_datum_bv>26.05.2019</gages:wahl_datum_bv>
    <gages:bplan_festgestellt>Eidelstedt2</gages:bplan_festgestellt>
    <gages:status>B</gages:status>
    <gages:satzzustand3>3</gages:satzzustand3>
    <gages:vonDatum3>24.04.1987</gages:vonDatum3>
    <gages:bisDatum3>31.12.2999</gages:bisDatum3>
    <gages:wsg_layername>geplante Schutzzone III</gages:wsg_layername>
    <gages:wsg_gebietsname>Eidelstedt/Stellingen (geplant)</gages:wsg_gebietsname>
    <gages:alkis_flurstuecksnummer>6791</gages:alkis_flurstuecksnummer>
    <gages:alkis_gemarkung>0305</gages:alkis_gemarkung>
    <gages:hpaokz>320</gages:hpaokz>
    <gages:grundschulnr>5271</gages:grundschulnr>
    <gages:grundschule>Max-Traeger-Schule</gages:grundschule>
    <gages:statischer_index>mittel</gages:statischer_index>
    <gages:dynamischer_index>0</gages:dynamischer_index>
    <gages:jobcenter>Eidelstedt</gages:jobcenter>
    <gages:jobcenter_algii_uexxv>Eidelstedt</gages:jobcenter_algii_uexxv>
    <gages:amtsgericht_name>Amtsgericht Hamburg-Altona</gages:amtsgericht_name>
    </gages:Hauskoordinaten>
</wfs:member>
</wfs:FeatureCollection>`,
    // https://geodienste.hamburg.de/HH_WFS_GAGES?service=WFS&request=GetFeature&version=2.0.0&StoredQuery_ID=AdresseOhneZusatz&strassenname=bargkoppelweg&hausnummer=1
    adresseOhneZusatz = `<?xml version='1.0' encoding='UTF-8'?>
<wfs:FeatureCollection xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/wfs/2.0 http://schemas.opengis.net/wfs/2.0/wfs.xsd http://www.opengis.net/gml/3.2 http://schemas.opengis.net/gml/3.2.1/gml.xsd http://www.hamburg.de/namespaces/gages https://geodienste.hamburg.de/HH_WFS_GAGES?SERVICE=WFS&amp;VERSION=2.0.0&amp;REQUEST=DescribeFeatureType&amp;OUTPUTFORMAT=application%2Fgml%2Bxml%3B+version%3D3.2&amp;TYPENAME=gages:Hauskoordinaten&amp;NAMESPACES=xmlns(gages,http%3A%2F%2Fwww.hamburg.de%2Fnamespaces%2Fgages)" xmlns:wfs="http://www.opengis.net/wfs/2.0" timeStamp="2018-12-17T12:55:32Z" xmlns:gml="http://www.opengis.net/gml/3.2" numberMatched="unknown" numberReturned="0">
<!--NOTE: numberReturned attribute should be 'unknown' as well, but this would not validate against the current version of the WFS 2.0 schema (change upcoming). See change request (CR 144): https://portal.opengeospatial.org/files?artifact_id=43925.-->
<wfs:member>
    <gages:Hauskoordinaten xmlns:gages="http://www.hamburg.de/namespaces/gages" gml:id="HH_H_256027156">
    <iso19112:geographicIdentifier xmlns:iso19112="http://www.opengis.net/iso19112">Bargkoppelweg 1, 22145  Hamburg(OT Rahlstedt)</iso19112:geographicIdentifier>
    <iso19112:geographicExtent xmlns:iso19112="http://www.opengis.net/iso19112">
        <gmd:EX_BoundingPolygon xmlns:gmd="http://www.isotc211.org/2005/gmd">
        <gmd:polygon>
            <gml:Polygon gml:id="HH_H_256027156_ISO19112_GEOGRAPHICEXTENT" srsName="urn:ogc:def:crs:EPSG::25832">
            <gml:exterior>
                <gml:LinearRing>
                <gml:posList>576046.966 5941895.455 576046.966 5941945.455 576096.966 5941945.455 576096.966 5941895.455 576046.966 5941895.455</gml:posList>
                </gml:LinearRing>
            </gml:exterior>
            </gml:Polygon>
        </gmd:polygon>
        </gmd:EX_BoundingPolygon>
    </iso19112:geographicExtent>
    <iso19112:position xmlns:iso19112="http://www.opengis.net/iso19112">
        <!--Inlined geometry 'HH_H_256027156_ISO19112_POSITION'-->
        <gml:Point gml:id="HH_H_256027156_ISO19112_POSITION" srsName="urn:ogc:def:crs:EPSG::25832">
        <gml:pos>576071.966 5941920.455</gml:pos>
        </gml:Point>
    </iso19112:position>
    <iso19112:gazetteer xmlns:iso19112="http://www.opengis.net/iso19112" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://geodienste.hamburg.de/HH_WFS_GAGES?SERVICE=WFS&amp;VERSION=2.0.0&amp;REQUEST=GetFeature&amp;OUTPUTFORMAT=application%2Fgml%2Bxml%3B+version%3D3.2&amp;STOREDQUERY_ID=urn:ogc:def:query:OGC-WFS::GetFeatureById&amp;ID=HH_SIGA_2#HH_SIGA_2"/>
    <iso19112:locationType xmlns:iso19112="http://www.opengis.net/iso19112" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://geodienste.hamburg.de/HH_WFS_GAGES?SERVICE=WFS&amp;VERSION=2.0.0&amp;REQUEST=GetFeature&amp;OUTPUTFORMAT=application%2Fgml%2Bxml%3B+version%3D3.2&amp;STOREDQUERY_ID=urn:ogc:def:query:OGC-WFS::GetFeatureById&amp;ID=HH_SILC_1#HH_SILC_1"/>
    <iso19112:parent xmlns:iso19112="http://www.opengis.net/iso19112">Bargkoppelweg (OT Rahlstedt) , Hamburg  (22145)</iso19112:parent>
    <dog:qualitaet xmlns:dog="http://www.adv-online.de/namespaces/adv/dog">A</dog:qualitaet>
    <dog:datensatznummer xmlns:dog="http://www.adv-online.de/namespaces/adv/dog">147135</dog:datensatznummer>
    <dog:land xmlns:dog="http://www.adv-online.de/namespaces/adv/dog">02</dog:land>
    <dog:regierungsbezirk xmlns:dog="http://www.adv-online.de/namespaces/adv/dog">5</dog:regierungsbezirk>
    <dog:kreis xmlns:dog="http://www.adv-online.de/namespaces/adv/dog">18</dog:kreis>
    <dog:gemeinde xmlns:dog="http://www.adv-online.de/namespaces/adv/dog">526</dog:gemeinde>
    <dog:ortsteil xmlns:dog="http://www.adv-online.de/namespaces/adv/dog">0526</dog:ortsteil>
    <dog:ortsteil_kurz xmlns:dog="http://www.adv-online.de/namespaces/adv/dog">526</dog:ortsteil_kurz>
    <dog:strasse xmlns:dog="http://www.adv-online.de/namespaces/adv/dog">B0610</dog:strasse>
    <dog:strasse_kurz xmlns:dog="http://www.adv-online.de/namespaces/adv/dog">B061</dog:strasse_kurz>
    <dog:hausnummer xmlns:dog="http://www.adv-online.de/namespaces/adv/dog">1</dog:hausnummer>
    <dog:hausschluessel xmlns:dog="http://www.adv-online.de/namespaces/adv/dog">02;5;18;526;0526;B0610;1</dog:hausschluessel>
    <dog:strassenname xmlns:dog="http://www.adv-online.de/namespaces/adv/dog">Bargkoppelweg</dog:strassenname>
    <dog:strassenname_normalisiert xmlns:dog="http://www.adv-online.de/namespaces/adv/dog">BARGKOPELWEG</dog:strassenname_normalisiert>
    <dog:strassenname_soundex xmlns:dog="http://www.adv-online.de/namespaces/adv/dog">B622</dog:strassenname_soundex>
    <dog:ortsteilname xmlns:dog="http://www.adv-online.de/namespaces/adv/dog">Rahlstedt,OT 0526</dog:ortsteilname>
    <dog:ortsteilname_normalisiert xmlns:dog="http://www.adv-online.de/namespaces/adv/dog">OT0526</dog:ortsteilname_normalisiert>
    <dog:postleitzahl xmlns:dog="http://www.adv-online.de/namespaces/adv/dog">22145</dog:postleitzahl>
    <dog:postOrtsteil xmlns:dog="http://www.adv-online.de/namespaces/adv/dog">Rahlstedt</dog:postOrtsteil>
    <dog:postOrtsteil_normalisiert xmlns:dog="http://www.adv-online.de/namespaces/adv/dog">RAHLSTEDT</dog:postOrtsteil_normalisiert>
    <dog:ortsnamePost xmlns:dog="http://www.adv-online.de/namespaces/adv/dog">Hamburg</dog:ortsnamePost>
    <dog:ortsnamePost_normalisiert xmlns:dog="http://www.adv-online.de/namespaces/adv/dog">HAMBURG</dog:ortsnamePost_normalisiert>
    <gages:amtsgericht>G4</gages:amtsgericht>
    <gages:baubloecke>526069</gages:baubloecke>
    <gages:statistischesgebiet>74012</gages:statistischesgebiet>
    <gages:bezirke>Wandsbek</gages:bezirke>
    <gages:bezirkenr>5</gages:bezirkenr>
    <gages:finanzamt>Hamburg-Ost</gages:finanzamt>
    <gages:finanzamtnr>2244</gages:finanzamtnr>
    <gages:grundbuchbezirk>542</gages:grundbuchbezirk>
    <gages:polizeikommissariat>38</gages:polizeikommissariat>
    <gages:wahlbezirk>52623</gages:wahlbezirk>
    <gages:wahl_datum>24.09.2017</gages:wahl_datum>
    <gages:wahlkreisbt>22</gages:wahlkreisbt>
    <gages:wahl_datum_bt>24.09.2017</gages:wahl_datum_bt>
    <gages:wahlkreisbu>14</gages:wahlkreisbu>
    <gages:wahl_datum_bu>15.02.2015</gages:wahl_datum_bu>
    <gages:wahlkreis_bv>8</gages:wahlkreis_bv>
    <gages:wahl_datum_bv>26.05.2019</gages:wahl_datum_bv>
    <gages:bplan_festgestellt>Rahlstedt112</gages:bplan_festgestellt>
    <gages:status>B</gages:status>
    <gages:satzzustand3>3</gages:satzzustand3>
    <gages:vonDatum3>27.03.1987</gages:vonDatum3>
    <gages:bisDatum3>31.12.2999</gages:bisDatum3>
    <gages:alkis_flurstuecksnummer>743</gages:alkis_flurstuecksnummer>
    <gages:alkis_gemarkung>0542</gages:alkis_gemarkung>
    <gages:hpaokz>526</gages:hpaokz>
    <gages:grundschulnr>5252</gages:grundschulnr>
    <gages:grundschule>Grundschule Nydamer Weg</gages:grundschule>
    <gages:statischer_index>mittel</gages:statischer_index>
    <gages:dynamischer_index>0</gages:dynamischer_index>
    <gages:jobcenter>Alstertal-Rahlstedt</gages:jobcenter>
    <gages:jobcenter_algii_uexxv>Alstertal-Rahlstedt</gages:jobcenter_algii_uexxv>
    <gages:amtsgericht_name>Amtsgericht Hamburg-Wandsbek</gages:amtsgericht_name>
    </gages:Hauskoordinaten>
</wfs:member>
</wfs:FeatureCollection>`;
