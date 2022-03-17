>**[Zurück zur Dokumentation Masterportal](doc.md)**.

[TOC]

***

# config.json

Die *config.json* enthält die gesamte Konfiguration der Portal-Oberfläche. In ihr wird geregelt welche Elemente sich wo in der Menüleiste befinden, worauf die Karte zentriert werden soll und welche Layer geladen werden sollen. Hier geht es zu einem **[Beispiel](https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/dev/portal/basic/config.json)**.
Die config.json besteht aus der **[Portalconfig](#markdown-header-Portalconfig)** und der **[Themenconfig](#markdown-header-Themenconfig)**

```
{
   "Portalconfig": {},
   "Themenconfig": {}
}
```

***

## Portalconfig
Im Abschnitt *Portalconfig* können folgende Eigenschaften konfiguriert werden:
1. Titel & Logo (*portalTitle*)
2. Art der Themenauswahl (*treeType*)
3. Starteinstellungen der Kartenansicht (*mapView*)
4. Schaltflächen auf der Kartenansicht sowie mögliche Interaktionen (*controls*)
5. Menüeinträge sowie Vorhandenheit jeweiliger Tools und deren Reihenfolge (*menu*)
6. Typ und Eigenschaften des genutzten Suchdienstes (*searchBar*)
7. Löschbarkeit von Themen (*layersRemovable*)

Es existieren die im Folgenden aufgelisteten Konfigurationen:

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|portalTitle|nein|**[portalTitle](#markdown-header-portalconfigportaltitle)**||Der Titel und weitere Parameter die in der Menüleiste angezeigt werden können.|false|
|treeType|nein|enum["light","default","custom"]|"light"|Legt fest, welche Themenbaumart genutzt werden soll. Es existieren die Möglichkeiten *light* (einfache Auflistung), *default* (FHH-Atlas), *custom* (benutzerdefinierte Layerliste anhand json).|false|
|singleBaselayer|nein|Boolean|false|Legt fest, ob nur ein Baselayer gleichzeitig ausgewählt werden kann, nur bei dem treeType „custom“ verfügbar.|false|
|Baumtyp|nein|enum["light","default","custom"]|"light"|Deprecated in 3.0.0 Bitte Attribut "treeType" verwenden.|false|
|mapView|nein|**[mapView](#markdown-header-portalconfigmapview)**||Mit verschiedenen Parametern wird die Startansicht konfiguriert und der Hintergrund festgelegt, der erscheint wenn keine Karte geladen ist.|false|
|controls|nein|**[controls](#markdown-header-portalconfigcontrols)**||Mit den Controls kann festgelegt werden, welche Interaktionen in der Karte möglich sein sollen.|false|
|menu|nein|**[menu](#markdown-header-portalconfigmenu)**||Hier können die Menüeinträge und deren Anordnung konfiguriert werden. Die Reihenfolge der Werkzeuge ist identisch mit der Reihenfolge in der config.json (siehe **[Tools](#markdown-header-portalconfigmenutools)**).|false|
|searchBar|nein|**[searchBar](#markdown-header-portalconfigsearchbar)**||Über die Suchleiste können verschiedene Suchen gleichzeitig angefragt werden.|false|
|layersRemovable|nein|Boolean|false|Gibt an, ob der Layer gelöscht werden darf.|false|
|quickHelp|nein|**[quickHelp](#markdown-header-portalconfigquickHelp)**||Konfiguration neuer und Manipulation bestehender QuickHelp-Fenster.|false|

***

### Portalconfig.searchBar
Konfiguration der Searchbar

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|searchResultOrder|nein|String[]|["common:modules.searchbar.type.address", "common:modules.searchbar.type.street", "common:modules.searchbar.type.parcel", "common:modules.searchbar.type.location", "common:modules.searchbar.type.district", "common:modules.searchbar.type.topic", "common:modules.searchbar.type.subject"]|Konfiguration von Reihenfolge der Kategorien der angezeigten Suchergebnisse. Keys sollen aus der Übersetzungsdatei verwendet werden.|false|
|bkg|nein|**[bkg](#markdown-header-portalconfigsearchbarbkg)**||Konfiguration des BKG Suchdienstes.|false|
|gazetteer|nein|**[gazetteer](#markdown-header-portalconfigsearchbargazetteer)**||Konfiguration des Gazetteer Suchdienstes.|false|
|gdi|nein|**[gdi](#markdown-header-portalconfigsearchbargdi)**||Konfiguration des GDI (elastic) Suchdienstes. Deprecated in 3.0.0. Bitte **[elasticSearch](#markdown-header-portalconfigsearchbarelasticsearch)** verwenden.|false|
|elasticSearch|nein|**[elasticSearch](#markdown-header-portalconfigsearchbarelasticsearch)**||Konfiguration des ElasticSearch Suchdienstes.|false|
|osm|nein|**[osm](#markdown-header-portalconfigsearchbarosm)**||Konfiguration des OpenStreetMap (OSM) Suchdienstes.|false|
|komoot|nein|**[komoot](#markdown-header-portalconfigsearchbarkomoot)**||Konfiguration des Komoot Photon Suchdienstes.|false|
|locationFinder|nein|**[locationFinder](#markdown-header-portalconfigsearchbarlocationfinder)**||Konfiguration des LocationFinder-Suchdienstes.|false|
|placeholder|nein|String|"Suche"|Placeholder für das Freitextfeld.|false|
|recommendedListLength|nein|Integer|5|Anzahl der Einträge in der Vorschlagsliste.|false|
|quickHelp|nein|Boolean|false|Gibt an ob eine Schnellhilfe angeboten wird.|false|
|specialWFS|nein|**[specialWFS](#markdown-header-portalconfigsearchbarspecialwfs)**||Konfiguration des specialWFS Suchdienstes.|false|
|tree|nein|**[tree](#markdown-header-portalconfigsearchbartree)**||Konfiguration der Suche im Themenbaum.|false|
|visibleWFS|nein|**[visibleWFS](#markdown-header-portalconfigsearchbarvisiblewfs)**||Konfiguration der Suche über die sichtbaren WFS Layer.|false|
|visibleVector|nein|**[visibleVector](#markdown-header-portalconfigsearchbarvisiblevector)**||Konfiguration der Suche über die sichtbaren WFS Layer.|false|
|zoomLevel|nein|Integer||ZoomLevel, auf das die Searchbar maximal hineinzoomt.|false|
|sortByName|nein|Boolean|true|Legt fest ob die Ergebnisse einer Suche alphabetisch nach Namen sortiert werden sollen|false|
|selectRandomHits|nein|Boolean|true|Wenn `true` wird zufällig ausgewählt, welche Ergebnisse angezeigt werden sollen, wenn die Anzahl der Treffer `recomendedListLength` überschreitet. Wenn `false`, so wird die Liste an Treffern bei `recomendedListLength` abgeschnitten. Möglicherweise werden in diesem Fall trotz nur die Ergebnisse des Suchdienstes verwendet, welcher zuerst eine Liste mit Treffern zurück liefert.|false|

***

#### Portalconfig.searchBar.bkg

[type:Extent]: # (Datatypes.Extent)

Konfiguration des BKG Suchdienstes

**ACHTUNG: Backend notwendig!**

**Um die eigene UUID für den BKG nicht öffentlich zu machen, sollten die URLS (hier "bkg_geosearch" und "bkg_suggest") der restServices im Proxy abgefangen und umgeleitet werden.**
**Beispielhafte Proxy Einstellung**
```
ProxyPass /bkg_geosearch http://sg.geodatenzentrum.de/gdz_geokodierung__[UUID]/geosearch
<Location /bkg_geosearch>
  ProxyPassReverse http://sg.geodatenzentrum.de/gdz_geokodierung__[UUID]/geosearch
</Location>

ProxyPass /bkg_suggest http://sg.geodatenzentrum.de/gdz_geokodierung__[UUID]/suggest
<Location /bkg_suggest>
  ProxyPassReverse http://sg.geodatenzentrum.de/gdz_geokodierung__[UUID]/suggest
</Location>
```


|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|epsg|nein|String|"EPSG:25832"|EPSG-Code des zu verwendenden Koordinatensystems.|false|
|extent|nein|**[Extent](#markdown-header-datatypesextent)**|[454591, 5809000, 700000, 6075769]|Koordinaten-Ausdehnung innerhalb dieser der Suchalgorithmus suchen soll.|false|
|filter|nein|String|"filter=(typ:*)"|Filter string der an die BKG-Schnittstelle geschickt wird.|false|
|geosearchServiceId|ja|String||Id des Suchdienstes. Wird aufgelöst in der **[rest-services.json](rest-services.json.de.md)**.|false|
|minChars|nein|Integer|3|Deprecated in 3.0.0. Bitte "minCharacters" verwenden.|false|
|minCharacters|nein|Integer|3|Minimale Anzahl an Buchstaben, ab der die Suche losläuft.|false|
|score|nein|Number|0.6|Score der die Qualität der Suchergebnisse definiert.|false|
|suggestCount|nein|Integer|20|Anzahl der Vorschläge.|false|
|suggestServiceId|ja|String||Id des Vorschlagsdienstes. Wird aufgelöst in der **[rest-services.json](rest-services.json.de.md)**.|false|
|zoomToResult|nein|Boolean|false|Deprecated in 3.0.0. Bitte "zoomToResultOnHover" oder "zoomToResultOnClick" verwenden. Gibt an, ob auf das Feature beim Mousehover auf die Adresse gezoomt werden soll.|false|
|zoomToResultOnHover|nein|Boolean|false|Gibt an, ob auf das Feature beim Mousehover auf die Adresse gezoomt werden soll.|false|
|zoomToResultOnClick|nein|Boolean|true|Gibt an, ob auf das Feature beim Klick auf die Adresse gezoomt werden soll.|false|
|zoomLevel|nein|Number|7|Gibt an, auf welches ZoomLevel gezoomt werden soll.|false|

**Beispiel**
```
#!json
"bkg": {
    "minCharacters": 3,
    "suggestServiceId": "4",
    "geosearchServiceId": "5",
    "extent": [454591, 5809000, 700000, 6075769],
    "suggestCount": 10,
    "epsg": "EPSG:25832",
    "filter": "filter=(typ:*)",
    "score": 0.6,
    "zoomToResultOnHover": false,
    "zoomToResultOnClick": true,
    "zoomLevel": 10
}
```

***

#### Portalconfig.searchBar.osm ####
Suche bei OpenStreetMap über Stadt, Strasse und Hausnummer. Wird nur durch Klick auf die Lupe oder Enter ausgelöst, da die Anzahl der Abfragen der OSM-Suchmaschine limitiert ist.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|minChars|nein|Number|3|Mindestanzahl an Zeichen im Suchstring, bevor die Suche initiiert wird.|false|
|serviceId|ja|String||Gibt die ID für die URL in der **[rest-services.json](rest-services.json.de.md)** vor.|false|
|limit|nein|Number|50|Gibt die maximale Zahl der gewünschten, ungefilterten Ergebnisse an.|false|
|states|nein|string|""|Kann die Namen der Bundesländer enthalten. Trenner beliebig. Eventuell auch englische Ausprägungen eintragen, da die Daten frei im OpenSourceProjekt **[OpenStreetMap](https://www.openstreetmap.org)** erfasst werden können.|false|
|classes|nein|string|[]|Kann die Klassen, für die Ergebnisse erzielt werden sollen, enthalten.|false|

**Beispiel**

```
#!json

"osm": {
    "minChars": 3,
    "serviceId": "10",
    "limit": 60,
    "states": "Hamburg, Nordrhein-Westfalen, Niedersachsen, Rhineland-Palatinate Rheinland-Pfalz",
    "classes": "place,highway,building,shop,historic,leisure,city,county"
}
```

***

#### Portalconfig.searchBar.komoot ####
Suche bei **[Komoot Photon](https://photon.komoot.io/)**.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|minChars|nein|Number|3|Mindestanzahl an Zeichen im Suchstring, bevor die Suche initiiert wird.|false|
|serviceId|ja|String||Gibt die ID für die URL in der **[rest-services.json](https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/0d136a44a59dd3b64ec986c258763ac08603bf15/doc/rest-services.json.md)** vor.|false|
|limit|nein|Number|10|Gibt die maximale Zahl der gewünschten, ungefilterten Ergebnisse an.|false|
|lang|nein|string|"de"|Sprache für die Komoot Suche. Wirkt sich auf Sprachspezifische Ortsangaben (Zum Beispiel Ländernamen) aus.|false|
|lat|nein|Number||Breitengrad für den Suchmittelpunkt.|false|
|lon|nein|Number||Längengrad für den Suchmittelpunkt.|false|
|bbox|nein|string||Begrenzungsrechteck für die Suche.|false|
|osm_tag|nein|string||Filterung für OSM Tags (siehe https://github.com/komoot/photon#filter-results-by-tags-and-values).|false|
|searchOnEnter|nein|Boolean|false|Wenn `searchOnEnter` auf `true` gesetzt wird, so wird eine Surche nur durch einen Klick auf die Lupe bzw. durch Enter gestartet.|false|

**Beispiel**

```
#!json

"komoot": {
    "minChars": 3,
    "serviceId": "10",
    "limit": 20,
    "lang": "de",
    "lat": 52.5,
    "lon": 13.4,
    "bbox": "12.5,52.05,14.05,52.75",
}
```

***

#### Portalconfig.searchBar.locationFinder ####
Konfiguration zur Suche unter Verwendung eines ESRI CH LocationFinders.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|incrementalSearch|nein|Boolean|true|Gibt an ob eine Suchverfollständigung (Autocomplete) stattfinden soll. Wenn `incrementalSearch` auf `false` gesetzt wird, so wird eine Surche nur durch einen Klick auf die Lupe bzw. durch Enter gestartet. Dies ist sinvoll, wenn die Anzahl erlaubter Anfragen an den eingebundenen Dienst kontigentiert ist.|false|
|serviceId|ja|String||Gibt die ID für die URL in der **[rest-services.json](rest-services.json.de.md)** vor.|false|
|classes|nein|**[LocationFinderClass](#markdown-header-portalconfigsearchbarlocationfinderLocationFinderClass)**||Kann Klassen (mit Eigenschaften) enthalten die berücksichtigt werden sollen. Wenn hier nichts angegeben wird, so werden alle Klassen berücksichtigt.|false|
|useProxy|nein|Boolean|false|Deprecated im nächsten Major-Release, da von der GDI-DE empfohlen wird einen CORS-Header einzurichten. Gibt an, ob die URL des Dienstes über einen Proxy angefragt werden soll, dabei werden die Punkte in der URL durch Unterstriche ersetzt.|false|
|spatialReference|nein|String||Koordinatensystem, in dem das Ergebnis angefragt werden soll. Standardmäßig wird  hier der Wert von Portalconfig.mapView.epsg verwendet.|false|

##### Portalconfig.searchBar.locationFinder.LocationFinderClass #####

Definition von Klassen, welche als Ergebnis berücksichtigt werden sollen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|name|ja|String||Name der Klasse|false|
|icon|nein|String|"glyphicon-road"|Visualisierung der Klasse durch ein Glyphicon|false|
|zoom|nein|String|"center"|Legt fest wie auf einen ausgewählten Treffer gezoomt werden soll. Wenn `center` ausgewählt ist, so wird auf die Zentrumskoordinate (`cx` und `cy`) gezoomt und ein Marker angezeigt. Im Falle von `bbox` wird auf die durch den LocationFinder angegebene BoundingBox (`xmin`, `ymin`, `xmax` und `ymax`) gezoomt. Ein Marker wird in dem Fall nicht angezeigt.|false|
|zoomLevel|nein|Integer||Bei der Ausgabe der Suchergebnisse (dieses Typs) zu verwendende Zoomstufe|false|

**Beispiel**

```
#!json

"locationFinder": {
    "serviceId": "10",
    "classes": [
        {
			"name": "Haltestelle",
			"icon": "glyphicon-record"
		},
		{
			"name": "Adresse",
			"icon": "glyphicon-home",
			"zoomLevel": 5
		},
		{
			"name": "Straßenname",
			"zoom": "bbox"
		}
    ]
}
```

***

#### Portalconfig.searchBar.gazetteer

Konfiguration des Gazetteer Suchdienstes

**ACHTUNG: Backend notwendig!**

**Es wird eine Stored Query eines WFS mit vorgegebenen Parametern abgefragt.**

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|minChars|nein|Integer|3|Minimale Anzahl an Buchstaben, ab der die Suche losläuft.|false|
|searchAddress|nein|Boolean|false|Gibt an, ob nach Adressen gesucht werden soll. Wenn "searchAddress" nicht konfiguriert ist, wird aus Gründen der Abwärtskompatibilität das Attribut "searchAddress" auf "true" gesetzt, wenn "searchStreets" und "searchHouseNumbers" auf "true" gesetzt sind.|false|
|searchDistricts|nein|Boolean|false|Gibt an, ob nach Bezirken gesucht werden soll.|false|
|searchHouseNumbers|nein|Boolean|false|Gibt an, ob nach Straßen und Hausnummern gesucht werden soll. Bedingt **searchStreets**=true.|false|
|searchParcels|nein|Boolean|false|Gibt an, ob nach Flurstücken gesucht werden soll.|false|
|searchStreetKey|nein|Boolean|false|Gibt an, ob nach Straßenschlüsseln gesucht werden soll.|false|
|searchStreet|nein|Boolean|false|Gibt an, ob nach Straßen gesucht werden soll. Vorraussetzung für **searchHouseNumbers**.|false|
|serviceID|ja|String||Id des Suchdienstes. Wird aufgelöst in der **[rest-services.json](rest-services.json.de.md)**.|false|
|showGeographicIdentifier|nein|Boolean|false|Gibt an ob das Attribut `geographicIdentifier` zur Anzeige des Suchergebnisses verwendet werden soll.|false|

**Beispiel**
```
#!json
"gazetteer": {
    "minChars": 3,
    "serviceId": "6",
    "searchStreets": true,
    "searchHouseNumbers": true,
    "searchDistricts": true,
    "searchParcels": true,
    "searchStreetKey": true
}
```

***

#### Portalconfig.searchBar.gdi
Konfiguration des GDI Suchdienstes.
Deprecated in 3.0.0. Bitte **[elasticSearch](#markdown-header-portalconfigsearchbarelasticsearch)** verwenden.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|minChars|nein|Integer|3|Minimale Anzahl an Buchstaben, ab der die Suche losläuft.|false|
|serviceID|ja|String||Id des Suchdienstes. Wird aufgelöst in der **[rest-services.json](rest-services.json.de.md)**.|false|
|sortByName|nein|Boolean|false|Legt fest ob die Ergebnisse einer Suche alphabetisch nach Namen sortiert werden sollen|false|
|queryObject|ja|**[queryObject](#markdown-header-portalconfigsearchbargdiqueryobject)**||Query Objekt, das vom Elastic Search Model ausgelesen wird.|false|

**Beispiel**
```
#!json
"gdi": {
    "minChars": 3,
    "serviceId": "elastic",
    "sortByName": false,
    "queryObject": {
        "id": "query",
        "params": {
            "query_string": "%%searchString%%"
        }
}
```

***

#### Portalconfig.searchBar.gdi.queryObject
Todo

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|id|ja|String|""|Todo|false|
|params|ja|**[params](#markdown-header-portalconfigsearchbargdiqueryobjectparams)**||Parameter Object für ElasticSearch.|false|

***

#### Portalconfig.searchBar.gdi.queryObject.params
Todo

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|query_string|ja|String|"%%searchString%%"|Todo|false|

***

#### Portalconfig.searchBar.elasticSearch

Konfiguration des Elastic Search Suchdienstes

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|minChars|nein|Integer|3|Minimale Anzahl an Buchstaben, ab der die Suche losläuft.|false|
|serviceId|ja|String||Id des Suchdienstes. Wird aufgelöst in der **[rest-services.json](rest-services.json.de.md)**.|false|
|type|nein|enum["POST", "GET"]|"POST"|Art des Requests.|false|
|searchStringAttribute|nein|String|"searchString"|Attributname im payload für den searchString.|false|
|responseEntryPath|nein|String|""|Der Pfad in der response (JSON) zum Attribut, das die gefundenen Features enthält.|false|
|triggerEvent|nein|**[triggerEvent](#markdown-header-portalconfigsearchbarelasticsearchtriggerevent)**|{}|Radio event das ausgelöst werden soll durch Mouseover und Click.|false|
|hitMap|nein|**[hitMap](#markdown-header-portalconfigsearchbarelasticsearchhitmap)**||Mapping Objekt. Mappt die Attribute des Ergebnis Objektes auf den entsprechenden Key.|true|
|hitType|nein|String|"common:modules.searchbar.type.subject"|Typ des Suchergebnisses, wird in der Auswahlliste hinter dem Namen angezeigt. Nutzen Sie den Übersetzungskey aus der Übersetzungsdatei|false|
|hitGlyphicon|nein|String|"glyphicon-road"|CSS Glyphicon Klasse des Suchergebnisses. Wird vor dem Namen angezeigt.|false|
|useProxy|nein|Boolean|false|Flag die angibt ob die URL geproxied werden soll oder nicht.|false|

Als zusätzliches property kann `payload` hinzugefügt werden. Es muss nicht zwingend gesetzt sein, und passt zur Beschreibung von **[CustomObject](#markdown-header-datatypescustomobject)**. Per default wird es als leeres Objekt `{}` gesetzt. Das Objekt beschreibt die Payload, die mitgeschickt werden soll. Es muss das Attribut für den searchString vorhalten. Für weitere Infos zu den nutzbaren Attributen siehe **[Elasticsearch Guide](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-search.html)**. Dieses Objekt kann im Admintool nicht gepflegt werden, da dort **[CustomObject](#markdown-header-datatypescustomobject)** nicht definiert ist.

 **Beispiel**
```
#!json
"elasticSearch": {
    "minChars":3,
    "serviceId":"elastic",
    "type": "GET",
    "payload": {
        "id":"query",
        "params":{
            "query_string":""
        }
    },
    "searchStringAttribute": "query_string",
    "responseEntryPath": "hits.hits",
    "triggerEvent": {
        "channel": "Parser",
        "event": "addGdiLayer"
    },
    "hitMap": {
        "name": "_source.name",
        "id": "_source.id",
        "source": "_source"
    },
    "hitType": "common:modules.searchbar.type.subject",
    "hitGlyphicon": "glyphicon-list"
}
```


***
#### Portalconfig.searchBar.elasticSearch.hitMap

Mapping Objekt. Mappt die Attribute des Ergebnis Objektes auf den entsprechenden Key.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|name|ja|String/String[]|"name"|Attribut value wird auf attribut key gemappt. Notwendig um das Ergebnis anzuzeigen.|false|
|id|ja|String/String[]|"id"|Attribut value wird auf attribut key gemappt. Notwendig um das Ergebnis anzuzeigen.|false|
|coordinate|ja|String/String[]|"coordinate"|Attribut value wird auf attribut key gemappt. Notwendig um den mapMarker anzuzeigen.|false|

***

***
#### Portalconfig.searchBar.elasticSearch.triggerEvent

Radio event das ausgelöst werden soll durch Mouseover und Click. Definiert durch "channel" und "event".

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|channel|ja|String||Channel an den der hit beim mouseover und click in der recommendedList getriggered wird.|false|
|event|ja|String||Event das getriggered wird.|false|


***

#### Portalconfig.searchBar.specialWFS

Konfiguration der WFS-Suchfunktion "specialWFS": fragt Features eines WFS-Dienstes ab. Der Dienst muss hierfür WFS 2.0 Anfragen zulassen.

Beispielsweise würde bei der Eingabe "Kronenmatten" der Dienst
https://geoportal.freiburg.de/geoportal_freiburg_de/wfs/stpla_bplan/wfs_mapfile/geltungsbereiche
folgende Anfrage mit einer xml FeatureCollection beantworten. Die Features der Collection werden anschließend als Suchergebnisse vorgeschlagen.

```xml
<?xml version='1.0' encoding='UTF-8'?>
<wfs:GetFeature service='WFS' xmlns:wfs='http://www.opengis.net/wfs' xmlns:ogc='http://www.opengis.net/ogc' xmlns:gml='http://www.opengis.net/gml' traverseXlinkDepth='*' version='1.1.0'>
    <wfs:Query typeName='ms:geltungsbereiche'>
        <wfs:PropertyName>ms:planbez</wfs:PropertyName>
        <wfs:PropertyName>ms:msGeometry</wfs:PropertyName>
        <wfs:maxFeatures>20</wfs:maxFeatures>
        <ogc:Filter>
            <ogc:PropertyIsLike matchCase='false' wildCard='*' singleChar='#' escapeChar='!'>
                <ogc:PropertyName>ms:planbez</ogc:PropertyName>
                <ogc:Literal>*Kronenmatten*</ogc:Literal>
            </ogc:PropertyIsLike>
        </ogc:Filter>
    </wfs:Query>
</wfs:GetFeature>
```


Die WFS 2 query wird dabei dynamisch durch das Masterportal erstellt. Die Konfiguration einer stored query im WFS Dienst ist hierfür nicht erforderlich.



|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|minChars|nein|Integer|3|Minimale Anzahl an Buchstaben, ab der die Suche losläuft.|false|
|glyphicon|nein|String|"glyhicon-home"|Default glyphicon das in der Vorschlagsliste erscheint. Kann in der **[definition](#markdown-header-portalconfigsearchbarspecialwfsdefinition)** überschrieben werden.|false|
|maxFeatures|nein|Integer|20|Maximale Anzahl an gefundenen Features. Kann in der **[definition](#markdown-header-portalconfigsearchbarspecialwfsdefinition)** überschrieben werden.|false|
|timeout|nein|Integer|6000|Timeout in ms für die Dienste Anfrage.|false|
|definitions|nein|**[definition](#markdown-header-portalconfigsearchbarspecialwfsdefinition)**[]||Definition der speziellen WFS suchen.|false|

**Beispiel**
```
#!json
"specialWFS": {
    "minChars": 5,
    "timeout": 10000,
    "definitions": [
        {
            "url": "/geodienste_hamburg_de/MRH_WFS_Rotenburg",
            "typeName": "app:mrh_row_bplan",
            "propertyNames": ["app:name"],
            "name": "B-Plan",
            "namespaces": "xmlns:app='http://www.deegree.org/app'"
        },
        {
            "url": "/geodienste_hamburg_de/HH_WFS_Bebauungsplaene",
            "typeName": "app:prosin_imverfahren",
            "propertyNames": ["app:plan"],
            "geometryName": "app:the_geom",
            "name": "im Verfahren",
            "namespaces": "xmlns:app='http://www.deegree.org/app'"
        }
    ]
}
```

***

#### Portalconfig.searchBar.specialWFS.definition

Konfiguration einer Definition bei der SpecialWFS Suche

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|url|nein|String||URL des WFS. Je nach proxy-Konfiguration muss die relative url vom Server des Portals aus angegeben werden. |false|
|name|nein|String||Name der Kategorie. Erscheint in der Vorschlagsliste.|false|
|glyphicon|nein|String|"glyhicon-home"|CSS Klasse des Glyphicons das in der Vorschlagsliste erscheint.|false|
|typeName|nein|String||Der Name des abzufragenden Layers innerhalb des WFS.|false|
|propertyNames|nein|String[]||Array von Attributnamen. Diese Attribute werden durchsucht.|false|
|geometryName|nein|String|"app:geom"|Attributname der Geometrie wird benötigt um darauf zu zoomen.|false|
|maxFeatures|nein|Integer|20|Maximale Anzahl an gefundenen Features.|false|
|namespaces|nein|String||XML Namespaces zur Abfrage von propertyNames oder geometryName (*xmlns:wfs*, *xmlns:ogc* und *xmlns:gml* werden immer genutzt).|false|
|data|nein|String||Deprecated in 3.0.0 Filterparameter für den WFS request.|false|

**Beispiel**
```
#!json
{
    "url": "/geodienste_hamburg_de/HH_WFS_Bebauungsplaene",
    "typeName": "app:prosin_imverfahren",
    "propertyNames": ["app:plan"],
    "geometryName": "app:the_geom",
    "name": "im Verfahren"
}
```

***

#### Portalconfig.searchBar.tree
Alle Layer, die im Themenbaum des Portals sind, werden durchsucht.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|minChars|nein|Integer|3|Minimale Anzahl an Buchstaben, ab der die Suche losläuft.|false|

**Beispiel**
```
#!json
"tree": {
    "minChars": 5
}
```

***

#### Portalconfig.searchBar.visibleWFS
Konfiguration der Suche über die sichtbaren WFS. Deprecated in 3.0.0. Verwenden Sie **[visibleVector](#markdown-header-portalconfigsearchbarvisiblevector)**.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|minChars|nein|Integer|3|Minimale Anzahl an Buchstaben, ab der die Suche losläuft.|false|

**Beispiel**
```
#!json
"visibleWFS": {
    "minChars": 3
}
```

***

#### Portalconfig.searchBar.visibleVector
Konfiguration der Suche über die sichtbaren VectorLayer. Bei der Layerdefinition unter "Fachdaten" muss für jeden VectorLayer, der durchsucht werden soll das Attribut "searchField" gesetzt sein. Siehe **[searchField](#markdown-header-themenconfiglayervector)**

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|minChars|nein|Integer|3|Minimale Anzahl an Buchstaben, ab der die Suche losläuft.|false|
|layerTypes|nein|enum["WFS", "GeoJSON"]|["WFS"]|Vector Typen die verwendet werden sollen.|true|
|gfiOnClick|nein|Boolean|false|Öffnet das GetFeatureInfo (gfi) bei Klick auf das Suchergebnis.|false|

**Beispiel**
```
#!json
"visibleVector": {
    "minChars": 3,
    "layerTypes": ["WFS", "GeoJSON"]
}
```
***

### Portalconfig.controls

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|attributions|nein|**[attributions](#markdown-header-portalconfigcontrolsattributions)**|false|Zusätzliche Layerinformationen die im Portal angezeigt werden sollen|false|
|fullScreen|nein|Boolean|false|Ermöglicht dem User die Darstellung im Vollbildmodus (ohne Tabs und Adressleiste) per Klick auf den Button. Ein erneuter Klick auf den Button wechselt wieder in den normalen Modus.|false|
|mousePosition|nein|Boolean|false|Die Koordinaten des Mauszeigers werden angezeigt.|false|
|orientation|nein|**[orientation](#markdown-header-portalconfigcontrolsorientation)**||Orientation nutzt die geolocation des Browsers zur Standortbestimmung des Nutzers.|false|
|zoom|nein|Boolean|false|Legt fest, ob die Zoombuttons angezeigt werden sollen.|false|
|overviewmap|nein|**[overviewMap](#markdown-header-portalconfigcontrolsoverviewmap)**|false|Deprecated in 3.0.0. Bitte "overviewMap" verwenden.|false|
|overviewMap|nein|**[overviewMap](#markdown-header-portalconfigcontrolsoverviewmap)**|false|Übersichtskarte.|false|
|totalview|nein|**[totalView](#markdown-header-portalconfigcontrolstotalview)**|false|Deprecated in 3.0.0. bitte "totalView" verwenden.|false|
|totalView|nein|**[totalView](#markdown-header-portalconfigcontrolstotalview)**|false|Zeigt einen Button an, mit dem die Startansicht mit den initialen Einstellungen wiederhergestellt werden kann.|false|
|button3d|nein|Boolean|false|Legt fest, ob ein Button für die Umschaltung in den 3D Modus angezeigt werden soll.|false|
|orientation3d|nein|Boolean|false|Legt fest, ob im 3D Modus eine Navigationsrose angezeigt werden soll.|false|
|freeze|nein|Boolean|false|Legt fest, ob ein "Ansicht sperren" Button angezeigt werden soll. Im Style 'TABLE' erscheint dieser im Werkzeug-Fenster.|false|
|backforward|nein|**[backForward](#markdown-header-portalconfigcontrolsbackforward)**|false|Deprecated in 3.0.0. Bitte "backForward" verwenden.|false|
|backForward|nein|**[backForward](#markdown-header-portalconfigcontrolsbackforward)**|false|Zeigt Buttons zur Steuerung der letzten und nächsten Kartenansichten an.|false|

***

#### Portalconfig.controls.attributions

Das Attribut attributions kann vom Typ Boolean oder Object sein. Wenn es vom Typ Boolean ist, zeigt diese flag ob vorhandene Attributions angezeigt werden sollen oder nicht. Ist es vom Typ Object so gelten folgende Attribute:

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|isInitOpenDesktop|nein|Boolean|true|Legt fest, ob die Attributions (Desktop-Ansicht) initial ausgeklappt werden sollen.|false|
|isInitOpenMobile|nein|Boolean|false|Legt fest, ob die Attributions (Mobile-Ansicht) initial ausgeklappt werden sollen.|false|

**Beispiel als Boolean**
```
#!json
"attributions": true
```

**Beispiel als Object**
```
#!json
"attributions": {
    "isInitOpenDesktop": true,
    "isInitOpenMobile": false,
}
```

***

#### Portalconfig.controls.orientation

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|zoomMode|nein|enum["once", "always"]|"once"|Der Standort wird bestimmt und der Marker wird an- oder ausgeschaltet. Dafür ist es notwendig das Portal über **https** zu laden. Modi: *once* (Es wird einmalig auf den Standort gezoomt. ), *always* (Die Karte wird mit jedem Einschalten auf den Standort gezoomt.).|false|
|poiDistances|nein|Boolean/Integer[]|true|Bei poiDistances=true werden die Defaultwerte verwendet. Legt fest, ob "In meiner Nähe" geladen wird und zeigt eine Liste von Features in der Umgebung an. Bei Angabe eines Array werden die darin definierten Abstände in Metern angeboten. Bei Angabe von true werden diese Abstände angeboten: [500,1000,2000].|false|

**Beispiel mit poiDistances vom Typ Boolean**
```
#!json
"orientation": {
    "zoomMode": "once",
    "poiDistances": true
}
```

**Beispiel mit poiDistances vom Typ Integer[]**
```
#!json
"orientation": {
    "zoomMode": "once",
    "poiDistances": [500, 1000, 2000, 5000]
}
```

***

#### Portalconfig.controls.overviewMap

[type:LayerId]: # (Datatypes.LayerId)

Das Attribut overviewMap kann vom Typ Boolean oder Object sein. Wenn es vom Typ Boolean ist, zeigt es die Overviewmap mit den Defaulteinstellungen an. Ist es vom Typ Object, so gelten folgende Attribute

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|resolution|nein|Integer||deprecated in 3.0.0: Legt die Resolution fest, die in der Overviewmap verwendet werden soll. Falls nicht angegeben, passt sich der Kartenausschnitt per Zoom automatisch an.|
|baselayer|nein|LayerId||deprecated in 3.0.0, danach bitte layerId verwenden!: Über den Parameter baselayer kann ein anderer Layer für die Overviewmap verwendet werden. Hier muss eine Id aus der services.json angegeben werden die in der config.js des Portals, im Parameter layerConf steht.|
|layerId|nein|LayerId||Über den Parameter layerId kann ein anderer Layer für die Overviewmap verwendet werden. Hier muss eine Id aus der services.json angegeben werden die in der config.js des Portals, im Parameter layerConf steht.|
|isInitOpen|nein|Boolean|true|Legt fest, ob die OverviewMap beim Start dargestellt oder verborgen sein soll.|

**Beispiel overviewmap als Object:**
```
#!json
"overviewMap": {
    "resolution": 305.7487246381551,
    "layerId": "452",
    "isInitOpen": false
}
```

**Beispiel overviewmap als Boolean:**
```
#!json
"overviewMap": true
```

***

#### Portalconfig.controls.totalView

Das Attribut totalView kann vom Typ Boolean oder Object sein. Wenn es vom Typ Boolean ist, zeigt es den Butten an, der in den Defaulteinstellungen gesetzt ist. Ist es vom Typ Object, so gelten folgende Attribute

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|glyphicon|nein|String|"glyphicon-fast-backward"|Über den Parameter glyphicon kann ein anderes Glyphicon für das Zurückschalten zur Startansicht verwendet werden.|false|
|tableGlyphicon|nein|String|"glyphicon-home"|Über den Parameter tableGlyphicon kann bei einem TABLE Style ein anderes Glyphicon für das Zurückschalten zur Startansicht verwendet werden.|false|

**Beispiel totalView als Object:**
```
#!json
"totalView" : {
    "glyphicon": "glyphicon-step-forward",
    "tableGlyphicon": "glyphicon-step-forward"
},
```

**Beispiel totalView als Boolean:**
```
#!json
"totalView": true
```

***

#### Portalconfig.controls.backForward

Das Attribut backForward kann vom Typ Boolean oder Object sein. Wenn es vom Typ Boolean ist, zeigt es die Buttons zur Steuerung der letzten und nächsten Kartenansichten mit den Defaulteinsellungen an. Ist es vom Typ Object, so gelten folgende Attribute

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|glyphiconFor|nein|String||Über den Parameter glyphiconFor kann ein anderes Glyphicon für das Vorschalten der Kartenansicht verwendet werden.|false|
|glyphiconBack|nein|String||Über den Parameter glyphiconBack kann ein anderes Glyphicon für das Zurückschalten der Kartenansicht verwendet werden.|false|

**Beispiel backForward als Object:**
```
#!json
"backForward" : {
    "glyphiconFor": "glyphicon-fast-forward",
    "glyphiconBack": "glyphicon-fast-backward"
}
```

**Beispiel backForward als Boolean:**
```
#!json
"backForward": true
```

***

### Portalconfig.portalTitle
In der Menüleiste kann der Portalname und ein Bild angezeigt werden, sofern die Breite der Leiste ausreicht. Der Portaltitle ist mobil nicht verfügbar.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|title|nein|String|"Master"|Name des Portals.|false|
|logo|nein|String||URL zur externen Bilddatei. Wird kein logo gesetzt, so wird nur der Titel ohne Bild dargestellt.|false|
|link|nein|String|"https://geoinfo.hamburg.de"|URL der externen Seite, auf die verlinkt wird.|false|
|tooltip|nein|String||Deprecated in 3.0.0 Tooltip, der beim Hovern über das PortalLogo angezeigt wird.|false|
|toolTip|nein|String|"Landesbetrieb Geoinformation und Vermessung"|Tooltip, der beim Hovern über das PortalLogo angezeigt wird.|false|

**Beispiel portalTitle:**
```
#!json
"portalTitle": {
    "title": "Master",
    "logo": "https://geodienste.hamburg.de/lgv-config/img/hh-logo.png",
    "link": "https://geoinfo.hamburg.de",
    "toolTip": "Landesbetrieb Geoinformation und Vermessung"
}
```
***

### Portalconfig.mapView

[type:Extent]: # (Datatypes.Extent)
[type:Coordinate]: # (Datatypes.Coordinate)

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|backgroundImage|nein|String|"https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/dev/doc/config.json.md#markdown-header-portalconfigmapview"|Pfad zum alternativen Hintergrund angeben.|false|
|startCenter|nein|**[Coordinate](#markdown-header-datatypescoordinate)**|[565874, 5934140]|Die initiale Zentrumskoordinate.|false|
|extent|nein|**[Extent](#markdown-header-datatypesextent)**|[510000.0, 5850000.0, 625000.4, 6000000.0]|Der Map-Extent.|false|
|resolution|nein|Float|15.874991427504629|Die initiale Auflösung der Karte aus options. Vorzug vor zoomLevel.|false|
|startZoomLevel|nein|Integer||Der initiale ZoomLevel aus Options. Nachrangig zu resolution.|false|
|zoomLevel|nein|Integer||Deprecated in 3.0.0 Bitte "startZoomLevel" verwenden.|false|
|epsg|nein|String|"EPSG:25832"|Der EPSG-Code der Projektion der Karte. Der EPSG-Code muss als namedProjection definiert sein.|false|
|options|nein|[option](#markdown-header-portalconfigmapviewoption)[]|[{"resolution":66.14579761460263,"scale":250000,"zoomLevel":0}, {"resolution":26.458319045841044,"scale":100000,"zoomLevel":1}, {"resolution":15.874991427504629,"scale":60000,"zoomLevel":2}, {"resolution": 10.583327618336419,"scale":40000,"zoomLevel":3}, {"resolution":5.2916638091682096,"scale":20000,"zoomLevel":4}, {"resolution":2.6458319045841048,"scale":10000,"zoomLevel":5}, {"resolution":1.3229159522920524,"scale":5000,"zoomLevel":6}, {"resolution":0.6614579761460262,"scale":2500,"zoomLevel":7}, {"resolution":0.2645831904584105,"scale": 1000,"zoomLevel":8}, {"resolution":0.13229159522920521,"scale":500,"zoomLevel":9}]|Die initialen Maßstabsstufen und deren Auflösungen.|false|

**Beispiel:**
```
#!json
"mapView": {
    "backgroundImage": "https://geodienste.hamburg.de/lgv-config/img/backgroundCanvas.jpeg",
    "startCenter": [561210, 5932600],
    "options": [
        {
            "resolution": 611.4974492763076,
            "scale": 2311167,
            "zoomLevel": 0
        },
        {
            "resolution": 305.7487246381551,
            "scale": 1155583,
            "zoomLevel": 1
        },
        {
            "resolution": 152.87436231907702,
            "scale": 577791,
            "zoomLevel": 2
        },
        {
            "resolution": 76.43718115953851,
            "scale": 288896,
            "zoomLevel": 3
        },
        {
            "resolution": 38.21859057976939,
            "scale": 144448,
            "zoomLevel": 4
        },
        {
            "resolution": 19.109295289884642,
            "scale": 72223,
            "zoomLevel": 5
        },
        {
            "resolution": 9.554647644942321,
            "scale": 36112,
            "zoomLevel": 6
        },
        {
            "resolution": 4.7773238224711605,
            "scale": 18056,
            "zoomLevel": 7
        },
        {
            "resolution": 2.3886619112355802,
            "scale": 9028,
            "zoomLevel": 8
        },
        {
            "resolution": 1.1943309556178034,
            "scale": 4514,
            "zoomLevel": 9
        },
        {
            "resolution": 0.5971654778089017,
            "scale": 2257,
            "zoomLevel": 10
        }
    ],
    "extent": [510000.0, 5850000.0, 625000.4, 6000000.0],
    "resolution": 15.874991427504629,
    "zoomLevel": 1,
    "epsg": "EPSG:25832"
    }
```

***

#### Portalconfig.mapView.option

Eine option definiert eine Zoomstufe. Diese muss definiert werden über die Auflösung, die Maßstabszahl und das ZoomLevel. Je höher das ZoomLevel ist, desto kleiner ist die Scale und desto näher hat man gezoomt.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|resolution|ja|Number||Auflösung der definierten Zoomstufe.|false|
|scale|ja|Integer||Maßstabszahl der definierten Zoomstufe.|false|
|zoomLevel|ja|Integer||Zoomstufe der definierten Zoomstufe.|false|

**Beispiel einer mapview Option**
```
#!json
{
    "resolution": 611.4974492763076,
    "scale": 2311167,
    "zoomLevel": 0
}
```

***

### Portalconfig.quickHelp

Eine detailierte Anleitung zur Konfiguration des QuickHelp-Fensters siehe **[the QuickHelp documentation](quickHelp.md)** .

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|configs|ja|**[configs](#markdown-header-portalconfigquickhelpconfigs)**|{"search": true, "tree": true}|Die Konfiguration für bestehende und neue QuickHelp-Fenster.|false|

```json
{
    "Portalconfig": {
        "quickHelp": {
            "configs": {}
        }
    }
}
```

#### Portalconfig.quickHelp.configs

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|search|nein|**[search](#markdown-header-portalconfigquickhelpconfigssearch)**|true|Konfiguration des QuickHelp-Fensters der SearchBar.|false|
|tree|nein|**[tree](#markdown-header-portalconfigquickhelpconfigstree)**|true|Konfiguration des QuickHelp-Fensters des Themenbaums.|false|

```json
{
    "Portalconfig": {
        "quickHelp": {
            "configs": {
                "search": true,
                "tree": true
            }
        }
    }
}
```

##### Portalconfig.quickHelp.configs.search

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|title|nein|String|""|Der Titel/die Überschrift des QuickHelp-Fensters.|false|
|content|nein|**[section](#markdown-header-portalconfigquickhelpconfigssearchsection)**[]|[]|Der Titel/die Überschrift des QuickHelp-Fensters.|false|

```json
{
    "Portalconfig": {
        "quickHelp": {
            "configs": {
                "search": {
                    "title": "A new title for this QuickHelp window",
                    "content": []
                }
            }
        }
    }
}
```

##### Portalconfig.quickHelp.configs.search.section

Ein Abschnitt ist ein Objekt mit einem Titel und einer Liste von Absätzen.
Ein Abschnitt kann mit den Schlüsselwörtern "vorher", "nachher" und "ausblenden" manipuliert werden.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|title|nein|String|""|Der Titel/die Überschrift des Abschnitts.|false|
|list|nein|**[paragraph](#markdown-header-portalconfigquickhelpconfigssearchsectionparagraph)**[]|[]|Eine Reihe von Absätzen oder Bildern des QuickHelp-Abschnitts.|false|
|before|nein|String||Ein Abschnittsschlüssel, vor dem dieser neue Abschnitt angehängt werden soll.|false|
|after|nein|String||Ein Abschnittsschlüssel, hinter dem dieser neue Abschnitt angehängt werden soll.|false|
|hide|nein|String||Ein Abschnittsschlüssel, der dazu führt, dass ein bestehender Abschnitt, der mit dem Abschnittsschlüssel angesprochen wird, ausgeblendet/entfernt wird.|false|

```json
{
    "Portalconfig": {
        "quickHelp": {
            "configs": {
                "search": {
                    "title": "A new title for this QuickHelp window",
                    "content": [
                        {
                            "title": "Title of the new section",
                            "list": []
                        }
                    ]
                }
            }
        }
    }
}
```

##### Portalconfig.quickHelp.configs.search.section.paragraph

Ein Absatz im Sinne der QuickHelp-Konfiguration ist ein Objekt oder eine Zeichenfolge, die den Inhalt an dieser Stelle genau beschreibt.
Es gibt zwei Arten von Absatzelementen.


**Das Element Absatztext**

Kann auch als reiner Übersetzungsschlüssel (String) angelegt werden und wird dann in ein Absatzelement vom Typ "text/plain" umgewandelt.
Es kann auch reiner Text angegeben werden, der dann aber zwingend unter dem Textschlüssel des Objekts stehen muss (reiner Text ist als reiner String nicht möglich).


**Das Element Absatzbild**

Kann auch als einfacher Bildname (String) angegeben werden; in diesem Fall wird der in config.js konfigurierte imgPath automatisch als Basispfad hinzugefügt.
Configure als Objekt zur Angabe externer Bilder mit imgPath als URL und imgName als Name des Bildes.


|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|text|nein|String|""|Der Text als Übersetzungsschlüssel oder reiner Text.|false|
|type|nein|String|"text/plain"|Der Texttyp. Wenn "text/html" angegeben wird, wird der angegebene Text als HTML-Code wiedergegeben.|false|
|imgName|nein|String|""|Der Name des anzuzeigenden Bildes.|false|
|imgPath|nein|String|""|Der Pfad zum Bild, falls nicht angegeben, wird imgPath aus config.js übernommen.|false|

```json
{
    "Portalconfig": {
        "quickHelp": {
            "configs": {
                "search": {
                    "title": "A new title for this QuickHelp window",
                    "content": [
                        {
                            "title": "Title of the new section",
                            "list": [
                                {
                                    "text": "This is the first paragraph.",
                                    "type": "text/plain"
                                },
                                {
                                    "imgName": "allgemein.png",
                                    "imgPath": "https://geodienste.hamburg.de/lgv-config/img/"
                                },
                                {
                                    "text": "This is the second <i>paragraph</i> with html content.",
                                    "type": "text/html"
                                }
                            ]
                        },
                        {
                            "after": "generalInfo",
                            "title": "Title of a new section after generalInfo",
                            "list": [
                                {
                                    "text": "This is a paragraph.",
                                    "type": "text/plain"
                                }
                            ]
                        },
                        {"hide": "generalInfo"}
                    ]
                }
            }
        }
    }
}
```

#### Portalconfig.quickHelp.configs.tree

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|title|nein|String|""|Der Titel/die Überschrift des QuickHelp-Fensters.|false|
|content|nein|**[section](#markdown-header-portalconfigquickhelpconfigstreesection)**[]|[]|Der Titel/die Überschrift des QuickHelp-Fensters.|false|

```json
{
    "Portalconfig": {
        "quickHelp": {
            "configs": {
                "tree": {
                    "title": "A new title for this QuickHelp window",
                    "content": []
                }
            }
        }
    }
}
```

##### Portalconfig.quickHelp.configs.tree.section

Ein Abschnitt ist ein Objekt mit einem Titel und einer Liste von Absätzen.
Ein Abschnitt kann mit den Schlüsselwörtern "vorher", "nachher" und "ausblenden" manipuliert werden.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|title|nein|String|""|Der Titel/die Überschrift des Abschnitts.|false|
|list|nein|**[paragraph](#markdown-header-portalconfigquickhelpconfigstreesectionparagraph)**[]|[]|Eine Reihe von Absätzen oder Bildern des QuickHelp-Abschnitts.|false|
|before|nein|String||Ein Abschnittsschlüssel, vor dem dieser neue Abschnitt angehängt werden soll.|false|
|after|nein|String||Ein Abschnittsschlüssel, hinter dem dieser neue Abschnitt angehängt werden soll.|false|
|hide|nein|String||Ein Abschnittsschlüssel, der dazu führt, dass ein bestehender Abschnitt, der mit dem Abschnittsschlüssel angesprochen wird, ausgeblendet/entfernt wird.|false|

```json
{
    "Portalconfig": {
        "quickHelp": {
            "configs": {
                "tree": {
                    "title": "A new title for this QuickHelp window",
                    "content": [
                        {
                            "title": "Title of the new section",
                            "list": []
                        }
                    ]
                }
            }
        }
    }
}
```

##### Portalconfig.quickHelp.configs.tree.section.paragraph

Ein Absatz im Sinne der QuickHelp-Konfiguration ist ein Objekt oder eine Zeichenfolge, die den Inhalt an dieser Stelle genau beschreibt.
Es gibt zwei Arten von Absatzelementen.


**Das Element Absatztext**

Kann auch als reiner Übersetzungsschlüssel (String) angelegt werden und wird dann in ein Absatzelement vom Typ "text/plain" umgewandelt.
Es kann auch reiner Text angegeben werden, der dann aber zwingend unter dem Textschlüssel des Objekts stehen muss (reiner Text ist als reiner String nicht möglich).


**Das Element Absatzbild**

Kann auch als einfacher Bildname (String) angegeben werden; in diesem Fall wird der in config.js konfigurierte imgPath automatisch als Basispfad hinzugefügt.
Configure als Objekt zur Angabe externer Bilder mit imgPath als URL und imgName als Name des Bildes.


|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|text|nein|String|""|Der Text als Übersetzungsschlüssel oder reiner Text.|false|
|type|nein|String|"text/plain"|Der Texttyp. Wenn "text/html" angegeben wird, wird der angegebene Text als HTML-Code wiedergegeben.|false|
|imgName|nein|String|""|Der Name des anzuzeigenden Bildes.|false|
|imgPath|nein|String|""|Der Pfad zum Bild, falls nicht angegeben, wird imgPath aus config.js übernommen.|false|

```json
{
    "Portalconfig": {
        "quickHelp": {
            "configs": {
                "tree": {
                    "title": "A new title for this QuickHelp window",
                    "content": [
                        {
                            "title": "Title of the new section",
                            "list": [
                                {
                                    "text": "This is the first paragraph.",
                                    "type": "text/plain"
                                },
                                {
                                    "imgName": "allgemein.png",
                                    "imgPath": "https://geodienste.hamburg.de/lgv-config/img/"
                                },
                                {
                                    "text": "This is the second <i>paragraph</i> with html content.",
                                    "type": "text/html"
                                }
                            ]
                        },
                        {
                            "before": "generalInfo",
                            "title": "Title of a new section before generalInfo",
                            "list": [
                                {
                                    "text": "This is a paragraph.",
                                    "type": "text/plain"
                                }
                            ]
                        },
                        {"hide": "generalInfo"}
                    ]
                }
            }
        }
    }
}
```

***

### Portalconfig.menu
Hier können die Menüeinträge und deren Anordnung konfiguriert werden. Die Reihenfolge der Werkzeuge ergibt sich aus der Reihenfolge in der *Config.json*.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|ansichten|nein|**[ansichten](#markdown-header-portalconfigmenuansichten)**||Vorkonfigurierte Kartenansicht im 2D und 3D Modus|false|
|info|nein|**[info](#markdown-header-portalconfigmenuinfo)**||Ordner im Menü, der **[tools](#markdown-header-portalconfigmenutools)** oder **[staticlinks](#markdown-header-portalconfigmenustaticlinks)** darstellt.|false|
|tools|nein|**[tools](#markdown-header-portalconfigmenutools)**||Ordner im Menü, der Werkzeuge darstellt.|false|
|tree|nein|**[tree](#markdown-header-portalconfigmenutree)**||Darstellung und Position des Themenbaums.|false|

***

#### Portalconfig.menu.ansichten

Konfigurations-Optionen für Kartenansichten.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|name|ja|String||Name der KartenAnsichten im Menü.|false|
|glyphicon|nein|String|"glyphicon-list"|Glyphicon der Kartenanischten im Menü.|false|
|children|nein|**[children](#markdown-header-portalconfigmenuansichtenchildren)**|false|Konfigurationen beliebig vieler Kartenansichten.|false|

***

#### Portalconfig.menu.ansichten.children

Konfigurations-Optionen für Ansichten.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|view|nein|**[view](#markdown-header-portalconfigmenuansichtenchildrenview)**||Konfiguration einer einzelnen Kartenansicht.|false|

***

#### Portalconfig.menu.ansichten.children.view

Konfigurations-Optionen für eine Kartenansicht.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|name|ja|String||Name der Kartenansicht.|false|
|type|ja|String||Typ der Kartenansicht, muss immer "viewpoint" sein.|false|
|glyphicon|nein|String||Glyphicon der Kartenansicht im Menü.|false|
|center|nein|Number[]||Koordinate an der die Kartenansicht zentriert wird.|false|
|zoomLevel|nein|Number||Zoom level der Kartenansicht.|false|
|altitude|nein|Number||Höhe der Kamera in Metern. Wird nur für Kartenansichten im 3D Modus verwendet.|false|
|heading|nein|Number||Richtung der Kamera in Radiant. Wird nur für Kartenansichten im 3D Modus verwendet.|false|
|tilt|nein|Number||Neigung der Kamera in Radiant. Wird nur für Kartenansichten im 3D Modus verwendet.|false|

**Beispiel einer Kartenansicht für den 2D und 3D Modus**
```
#!json
"ansichten": {
    "name": "translate#common:menu.views.name",
    "glyphicon": "glyphicon-list",
    "children": {
        "view": {
            "name": "translate#common:menu.views.view01",
            "type": "viewpoint",
            "glyphicon": "glyphicon-screenshot",
            "center": [
                564028.7954571751,
                5934555.967867207
            ],
            "zoomLevel": 7.456437968949651,
            "altitude": 272.3469798217454,
            "heading": -0.30858728378862876,
            "tilt": 0.9321791580603296
        }
    }
}
```

***

#### Portalconfig.menu.legend

Konfigurations-Optionen der Legende.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|name|ja|String||Name der Legende.|false|
|glyphicon|nein|String|"glyphicon-book"|Glyphicon der Legende.|false|
|showCollapseAllButton|nein|Boolean|false|Option zum Ein- bzw. Ausblenden aller Legenden|false|
|showLegend|nein|Boolean|false|Option zum Anzeigen der Legende beim Start des Portals|false|

***

#### Portalconfig.menu.info
[inherits]: # (Portalconfig.menu.folder)

Dies ist ein Menüreiter, in dem typischerweise Links *("staticlinks")* zu Informationen angelegt werden. Es können aber auch Werkzeuge *("tools")* hinterlegt werden.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|children|nein|**[children](#markdown-header-portalconfigmenuinfochildren)**||Konfiguration der Kindelemente des Menüreiters.|false|

***

##### Portalconfig.menu.info.children

[type:staticlink]: # (Portalconfig.menu.staticlinks.staticlink)

Liste der Werkzeuge *("tools")* oder Links *("staticlinks")*, die im Menüreiter *"info"* erscheinen sollen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|staticlinks|nein|**[staticlink](#markdown-header-portalconfigmenustaticlinks)**[]||Konfigurationsobjekt zur Erstellung von Links im Menüreiter.|false|

***

#### Portalconfig.menu.tree
Hier können die Menüeinträge und deren Anordnung konfiguriert werden. Die Reihenfolge der Werkzeuge ergibt sich aus der Reihenfolge in der *Config.json*.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|name|ja|String||Name des Themenbaumes.|false|
|glyphicon|nein|String||CSS Klasse des glyphicons.|false|
|isInitOpen|nein|Boolean|false|Gibt an ob der Themenbaum initial geöffnet ist.|false|

***

#### Portalconfig.menu.folder

[type:tool]: # (Portalconfig.menu.tool)
[type:staticlinks]: # (Portalconfig.menu.staticlinks)

Ein Ordner-Object wird dadurch definiert, dass es neben "name" und "glyphicon" noch das attribut "children" besitzt.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|name|ja|String||Name des Ordners im Menu.|false|
|glyphicon|ja|String|"glyphicon-folder-open"|CSS Klasse des Glyphicons, das vor dem Ordnernamen im Menu angezeigt wird.|false|
|children|nein|**[tool](#markdown-header-portalconfigmenutool)**/**[staticlinks](#markdown-header-portalconfigmenustaticlinks)**||Kindelemente dieses Ordners.|false|

**Beispiel eines folders**
```
#!json
"tools":{
    "name": "Werkzeuge",
    "glyphicon": "glyphicon-wrench",
    "children": {
        {
            "name": "Legende",
            "glyphicon": "glyphicon-book"
        }
    }
}
```

***

### Portalconfig.menu.tools

[inherits]: # (Portalconfig.menu.folder)
[type:tool]: # (Portalconfig.menu.tool)

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|children|nein|**[children](#markdown-header-portalconfigmenutoolschildren)**||Konfiguration der Werkzeuge.|false|

***

#### Portalconfig.menu.tools.children

[type:tool]: # (Portalconfig.menu.tool)
[type:compareFeatures]: # (Portalconfig.menu.tool.compareFeatures)
[type:contact]: # (Portalconfig.menu.tool.contact)
[type:coordToolkit]: # (Portalconfig.menu.tool.coordToolkit)
[type:draw]: # (Portalconfig.menu.tool.draw)
[type:featureLister]: # (Portalconfig.menu.tool.featureLister)
[type:filter]: # (Portalconfig.menu.tool.filter)
[type:filterGeneral]: # (Portalconfig.menu.tool.filterGeneral)
[type:gfi]: # (Portalconfig.menu.tool.gfi)
[type:layerClusterToggler]: # (Portalconfig.menu.tool.layerClusterToggler)
[type:layerSlider]: # (Portalconfig.menu.tool.layerSlider)
[type:legend]: # (Portalconfig.menu.legend)
[type:measure]: # (Portalconfig.menu.tool.measure)
[type:parcelSearch]: # (Portalconfig.menu.tool.parcelSearch)
[type:print]: # (Portalconfig.menu.tool.print)
[type:routing]: # (Portalconfig.menu.tool.routing)
[type:saveSelection]: # (Portalconfig.menu.tool.saveSelection)
[type:searchByCoord]: # (Portalconfig.menu.tool.searchByCoord)
[type:shadow]: # (Portalconfig.menu.tool.shadow)
[type:styleWMS]: # (Portalconfig.menu.tool.styleWMS)
[type:supplyCoord]: # (Portalconfig.menu.tool.supplyCoord)
[type:resetTree]: # (Portalconfig.menu.tool.resetTree)
[type:virtualcity]: # (Portalconfig.menu.tool.virtualcity)
[type:wfsSearch]: # (Portalconfig.menu.tool.wfsSearch)
[type:wfst]: # (Portalconfig.menu.tool.wfst)

Liste aller konfigurierbaren Werkzeuge. Jedes Werkzeug erbt von **[tool](#markdown-header-portalconfigmenutool)** und kann/muss somit auch die dort angegebenen attribute konfiguiert bekommen.
Neben **Portalconfig.menu.tools** können auch die Pfade **Portalconfig.menu.info**, **Portalconfig.menu.simulation** oder **Portalconfig.menu.utilities** verwendet werden.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|addWMS|nein|**[tool](#markdown-header-portalconfigmenutool)**||Mit diesem Werkzeug lassen sich Layer eines WMS laden. Die Angabe erfolgt über eine URL. Es werden alle Layer des Dienstes geladen und sind im Themenbaum unter "Externe Fachdaten" verfügbar. Bisher ist die Verwendung des Werkzeugs nur in Kombination mit den Tehmenbäumen "custom" und "default" möglich.|true|
|compareFeatures|nein|**[compareFeatures](#markdown-header-portalconfigmenutoolcomparefeatures)**|| Bietet eine Vergleichsmöglichkeit von Vektor-Features. In der getFeatureInfo lassen sich Features über das Stern-Symbol auf die Vergleichliste setzen. Funktioniert in Verbindung mit dem GFI-Theme **Default**!|false|
|contact|nein|**[contact](#markdown-header-portalconfigmenutoolcontact)**||Das Kontaktformular bietet dem User eine Möglichkeit an das konfigurierte Postfach eine Nachricht zu senden. Es können beispielsweise Fehler oder Wünsche und Anregungen gemeldet werden.|false|
|coord|nein|**[tool](#markdown-header-portalconfigmenutool)**||Deprecated in 3.0.0 Bitte "supplyCoord" verwenden. Werkzeug um Koordinaten per Maus(-Klick) abzufragen. Per Click in die Karte werden die Koordinaten in der Anzeige eingefroren und können per Click auf die Anzeige direkt in die Zwischenablage kopiert werden.|false|
|coordToolkit|nein|**[tool](#markdown-header-portalconfigmenutool)**||Koordinatenabfrage: Werkzeug um Koordinaten per Maus(-Klick) abzufragen: Per Klick in die Karte werden die Koordinaten in der Anzeige eingefroren und können per Klick auf die Anzeige direkt in die Zwischenablage kopiert werden. Koordinatensuche: Über eine Eingabemaske können das Koordinatensystem und die Koordinaten eingegeben werden. Das Werkzeug zoomt dann auf die entsprechende Koordinate und setzt einen Marker darauf. Die Koordinatensysteme werden aus der config.js bezogen.|false|
|draw|nein|**[draw](#markdown-header-portalconfigmenutooldraw)**||Mithilfe des Zeichnen-Werkzeuges können Punkte, Linien, Polygone, Kreise, Doppelkreise und Texte gezeichnet werden. Farben und Transparenzen sind voreingestellt. Die Zeichnungen können in den Formaten: KML, GeoJSON oder GPX heruntergeladen werden.|false|
|extendedFilter|nein|**[tool](#markdown-header-portalconfigmenutool)**||Deprecated in 3.0.0 Bitte "filter" verwenden. Dynamisches Filtern von WFS Features. Über dieses Werkzeug können WFS features dynamisch gefiltert werden. Dies setzt jedoch eine Konfiguration der "extendedFilter" am WFS-Layer-Objekt voraus.|false|
|featureLister|nein|**[featureLister](#markdown-header-portalconfigmenutoolfeaturelister)**||Listet alle Features eines Vektorlayers auf.|false|
|fileImport|nein|**[tool](#markdown-header-portalconfigmenutool)**||Import von Dateien des Typs *.kml, *.geojson und *. gpx. Über dieses Werkzeug können solche Dateien importiert werden.|false|
|filter|nein|**[filter](#markdown-header-portalconfigmenutoolfilter)**||Filtermodul mit dem sich Vektordaten aus WFS filtern lassen.|false|
|filterGeneral|nein|**[filterGeneral](#markdown-header-portalconfigmenutoolfiltergeneral)**||Konfiguration eines fortgeschrittenen Filters für WFS Vektordaten.|false|
|gfi|nein|**[gfi](#markdown-header-portalconfigmenutoolgfi)**||Mit der GetFeatureInfo(gfi) lassen sich Informationen zu beliebigen Layern anzeigen. Dabei werden bei einem WMS die Daten über die GetFeatureInfo geladen. Bei Vektordaten (WFS, Sensor, GeoJSON usw.) werden die angezeigten Attribute aus den Daten selbst verwendet.|false|
|kmlimport|nein|**[tool](#markdown-header-portalconfigmenutool)**||Deprecated in 3.0.0 Bitte "fileImport" verwenden.|false|
|layerClusterToggler|nein|**[tool](#markdown-header-portalconfigtoollayerClusterToggler)**||_Mit diesem Werkzeug lassen sich Layer in Clustern gleichzeitig aktivieren/laden und deaktivieren_|false|
|layerSlider|nein|**[layerSlider](#markdown-header-portalconfigmenutoollayerslider)**||Mit dem Layerslider lassen sich beliebige Dienste in einer Reihenfolge abspielen. Zum Beispiel geeignet für Luftbilder aus verschiedenen Jahrgängen.|false|
|legend|nein|**[legend](#markdown-header-portalconfigmenulegend)**||In der Legende werden alle sichtbaren Layer dargestellt.|false|
|measure|nein|**[measure](#markdown-header-portalconfigmenutoolmeasure)**||Messwerkzeug um Flächen oder Strecken zu messen. Dabei kann zwischen den Einheiten m/km bzw m²/km² gewechselt werden.|false|
|parcelSearch|nein|**[parcelSearch](#markdown-header-portalconfigmenutoolparcelsearch)**||_Deprecated im nächsten Major-Release. Bitte nutzen Sie stattdessen `wfsSearch`._ Mit dieser Flurstückssuche lassen sich Flurstücke über Gemarkung, Flur (in Hamburg ohne Flur) und Flurstück suchen.|false|
|print|nein|**[print](#markdown-header-portalconfigmenutoolprint)**||Druckmodul mit dem die Karte als PDF exportiert werden kann.|false|
|saveSelection|nein|**[saveSelection](#markdown-header-portalconfigmenutoolsaveselection)**||Werkzeug mit dem sich die aktuellen Karteninhalte speichern lassen. Der Zustand der Karte wird als URL zum Abspeichern erzeugt. Dabei werden die Layer in deren Reihenfolge, Transparenz und Sichtbarkeit dargestellt. Zusätzlich wird die Zentrumskoordinate mit abgespeichert.|false|
|routing|nein|**[routing](#markdown-header-portalconfigmenutoolrouting)**||Routing Modul zur Erstellung von Routenplanungen und Erreichbarkeitsanalysen.|false|
|searchByCoord|nein|**[searchByCoord](#markdown-header-portalconfigmenutoolsearchbycoord)**||Deprecated in 3.0.0 Bitte "coordToolkit" verwenden. Koordinatensuche. Über eine Eingabemaske können das Koordinatensystem und die Koordinaten eingegeben werden. Das Werkzeug zoomt dann auf die entsprechende Koordinate und setzt einen Marker darauf.|false|
|selectFeatures|nein|**[tool](#markdown-header-portalconfigmenutool)**||Ermöglicht Auswahl von Features durch Ziehen einer Box und Einsehen derer GFI-Attribute.|false|
|shadow|nein|**[shadow](#markdown-header-portalconfigmenutoolshadow)**||Konfigurationsobjekt für die Schattenzeit im 3D-Modus.|false|
|styleWMS|nein|**[styleWMS](#markdown-header-portalconfigmenutoolstylewms)**||Klassifizierung von WMS Diensten. Dieses Tool findet Verwendung im Pendlerportal der MRH(Metropolregion Hamburg). Über eine Maske können Klassifizierungen definiert werden. An den GetMap-Request wird nun ein SLD-Body angehängt, der dem Server einen neuen Style zum Rendern definiert. Der WMS-Dienst liefert nun die Daten in den definierten Klassifizierungen und Farben.|true|
|styleVT|nein|**[tool](#markdown-header-portalconfigmenutool)**||Style-Auswahl zu VT-Diensten. Ermöglicht das Umschalten des Stylings eines Vector Tile Layers, wenn in der services.json mehrere Styles für ihn eingetragen sind.|false|
|supplyCoord|nein|**[tool](#markdown-header-portalconfigmenutool)**||Deprecated in 3.0.0 Bitte "coordToolkit" verwenden. Werkzeug um Koordinaten per Maus(-Klick) abzufragen. Per Klick in die Karte werden die Koordinaten in der Anzeige eingefroren und können per Klick auf die Anzeige direkt in die Zwischenablage kopiert werden.|false|
|resetTree|nein|**[tool](#markdown-header-portalconfigmenutool)**||Werkzeug um Themenbaum zurückzusetzen. Per Klick auf Werkzeugname im Menü unter Werkzeuge wird der Themenbaum zurückgesetzt.|false|
|virtualcity|nein|**[virtualcity](#markdown-header-portalconfigmenutoolvirtualcity)**||virtualcityPLANNER planning Viewer|false|
|wfsFeatureFilter|nein|**[tool](#markdown-header-portalconfigmenutool)**||Deprecated in 3.0.0 Bitte "filterGeneral" verwenden. Filtern von WFS Features. Über dieses Werkzeug können WFS features gefiltert werden. Dies setzt jedoch eine Konfiguration der "filterOptions" am WFS-Layer-Objekt voraus.|false|
|wfsSearch|nein|**[wfsSearch](#markdown-header-portalconfigmenutoolwfssearch)**||Ermöglicht es ein Formular zu erstellen, um einen WFS Layer abgekoppelt von der Suchleiste mittels Filter anzufragen. Es ist möglich entweder eine gespeicherte Anfrage (Stored Query, WFS@2.0.0) zu nutzen oder eine Anfrage mithilfe der konfigurierten Parameter zu definieren (WFS@1.1.0).|false|
|wfst|nein|**[wfst](#markdown-header-portalconfigmenutoolwfst)**||WFS-T Modul mit dem Features visualisiert, erstellt, aktualisiert und gelöscht werden können.|false|
|bufferAnalysis|nein|**[tool](#markdown-header-portalconfigmenutool)**||In der Buffer-Analyse muss ein Quell-Layer, ein Buffer-Radius und ein Ziel-Layer ausgewählt werden. Buffer-Radien werden um die Features des Quell-Layers dargestellt. Sobald ein Ziel-Layer gewählt wurde, werden nur die Features dieses Layers hervorgehoben, welche sich außerhalb der Buffer-Radien befinden. Auch eine invertierte Anzeige ist möglich. Bei dieser werden nur die Features des Ziel-Layers innerhalb der Radien hervorgehoben werden.|false|

***

#### Portalconfig.menu.tool

Über den Attribut-key des Werkzeuges wird definiert, welches Werkzeug mit welchen Eigenschaften geladen wird. Jedes Tool besitzt mindestens die unten aufgeführten Attribute. Welche Tools konfigurierbar sind, finden Sie unter **[tools](#markdown-header-portalconfigmenutools)**.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|active|nein|Boolean|false|Gibt an, ob ein Werkzeug beim starten des Portals geöffnet ist.|false|
|glyphicon|nein|String||CSS Klasse des Glyphicons, das vor dem Toolnamen im Menu angezeigt wird.|false|
|isVisibleInMenu|nein|Boolean|true|Flag, ob das Tool unter Werkzeuge angezeigt wird.|false|
|keepOpen|nein|Boolean|false|Flag, ob das Tool parallel zu anderen Tools geöffnet bleibt.|false|
|name|ja|String||Name des Werkzeuges im Menu.|false|
|onlyDesktop|nein|Boolean|false|Flag, ob das Werkzeug nur im Desktop Modus sichtbar sein soll.|false|
|renderToWindow|nein|Boolean|true|Flag, ob das Tool beim Anklicken im frei schwebenden Fenster dargestellt werden soll.|false|
|resizableWindow|nein|Boolean|false|Flag, ob das Tool-Fenster vergrößer-/verkleinerbar ist.|false|

**Beispiel eines Tools**
```
#!json
"legend":{
    "name": "Legende",
    "glyphicon": "glyphicon-book"
}
```

***

#### Portalconfig.menu.tool.gfi

[inherits]: # (Portalconfig.menu.tool)

Zeigt Informationen zu einem abgefragten Feature ab, indem GetFeatureInfo-Requests oder GetFeature-Requests oder geladene Vektordaten abgefragt werden.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|name|ja|String||Name des Werkzeuges im Menu.|false|
|centerMapToClickPoint|nein|Boolean|false|Wenn der Parameter auf true gesetzt wird, verschiebt sich die Karte beim Klick auf ein Feature so, dass das Feature im Mittelpunkt der sichtbaren Karte liegt. Dies ist nur bei der Verwendung des desktopTypes "Detached" relevant.|false|
|glyphicon|nein|String|"glyphicon-info-sign"|CSS Klasse des Glyphicons, das vor dem GFI im Menu angezeigt wird.|false|
|active|nein|Boolean|true|Gibt an, ob das GFI per default aktiviert ist.|false|
|desktopType|nein|String|"detached"|Gibt an welches Template für die GetFeatureInfo im Desktopmodus verwendet wird. Bei Attached wird das GFI direkt auf dem Punkt positioniert. Bei Detached wird ein Marker auf den geklickten Punkt gesetzt und das GFI wird rechts auf der Karte platziert.|false|
|centerMapMarkerPolygon|nein|Boolean|false|Angabe, ob für ein angeklicktes Feature die Koordinaten des Zentrums ermittelt werden sollen oder ob die Koordinaten der tatsächlich angeklickten Koordinate bestimmt werden.|false|
|highlightVectorRules|nein|**[highlightVectorRules](#markdown-header-portalconfigmenutoolgfihighlightvectorrules)**||Regeldefinitionen zum Überschreiben des Stylings von abgefragten Vektordaten.[highlightVectorRules](#markdown-header-portalconfigmenutoolgfihighlightvectorrules)|false|

**Beispiel einer GFI Konfiguration**
```
#!json
"gfi":{
    "name":"Informationen abfragen",
    "glyphicon":"glyphicon-info-sign",
    "active":true,
    "centerMapMarkerPolygon":true,
    "highlightVectorRules": {
        "fill": {
            "color": [215, 102, 41, 0.9]
        },
        "image": {
            "scale": 1.5
        },
        "stroke": {
            "width": 4
        },
        "text": {
            "scale": 2
        }
    }
}
```

**Beispiel einer GFI Konfiguration zur Informationsabfrage von Features**
```
#!json
"gfi":{
    "name":"Informationen abfragen",
    "glyphicon":"glyphicon-info-sign",
    "active":true,
    "centerMapMarkerPolygon":true
}
```

***

##### Portalconfig.menu.tool.gfi.highlightVectorRules

Liste der Einstellungen zum Überschreiben von Vektorstyles bei GFI Abfragen.
Hinweis: Das Highlighting funktioniert nur, wenn der Layer in der config.json über eine gültige StyleId verfügt!

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|fill|nein|**[fill](#markdown-header-portalconfigmenutoolgfihighlightvectorrulesfill)**||Mögliche Einstellung: color|false|
|image|nein|**[image](#markdown-header-portalconfigmenutoolgfihighlightvectorrulesimage)**||Mögliche Einstellung: scale|false|
|stroke|nein|**[stroke](#markdown-header-portalconfigmenutoolgfihighlightvectorrulesstroke)**||Mögliche Einstellung: width|false|
|text|nein|**[text](#markdown-header-portalconfigmenutoolgfihighlightvectorrulestext)**||Mögliche Einstellung: scale|false|

***

##### Portalconfig.menu.tool.gfi.highlightVectorRules.fill
|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|color|nein|Float[]|[255, 255, 255, 0.5]|Mögliche Einstellung: color (RGBA)|false|

```
#!json
"fill": { "color": [215, 102, 41, 0.9] }
```

***

##### Portalconfig.menu.tool.gfi.highlightVectorRules.image
|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|scale|nein|Float|1|Mögliche Einstellung: scale|false|

```
#!json
"image": { "scale": 1.5 }
```

***

##### Portalconfig.menu.tool.gfi.highlightVectorRules.stroke
|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|width|nein|Integer|1|Mögliche Einstellung: width|false|

```
#!json
"stroke": { "width": 4 }
```

***

##### Portalconfig.menu.tool.gfi.highlightVectorRules.text
|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|scale|nein|Float|1|Mögliche Einstellung: scale|false|

```
#!json
"text": { "scale": 2 }
```

***

#### Portalconfig.menu.tool.filter

[inherits]: # (Portalconfig.menu.tool)

Der Filter bietet eine Vielzahl von Möglichkeiten um Vektor-Daten filtern zu können.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|allowMultipleQueriesPerLayer|nein|Boolean|false|Regelt, ob beim selektieren nur der ausgewählte Layer gefiltert werden soll oder ob die Filtereinstellungen deselektierter Layer beibehalten werden sollen.|false|
|deactivateGFI|nein|Boolean|false|Wenn das Attribute auf true gesetzt wird ist bei geöffnetem Filter die GFI-Abfrage deaktiviert.|false|
|isGeneric|nein|Boolean|false|Zeigt an, ob sich der Filter dynamisch erzeugen lässt. Ist momentan noch nicht umgesetzt.|false|
|minScale|nein|Integer||Minimale Zoomstufe auf die der Filter bei der Darstellung der Ergebnisse heranzoomt.|false|
|liveZoomToFeatures|nein|Boolean|false|Gibt an, ob der Filter sofort nach der Filterung auf die Filterergebnisse zoomt.|false|
|predefinedQueries|nein|[predefinedQuery](#markdown-header-portalconfigmenutoolfilterpredefinedquery)[]||Definition der Filterabfragen.|false|
|saveToUrl|nein|Boolean|true|Speichert das aktuelle Filterergebnis in der URL ab. Dadurch kann das Filterergebnis als Lesezeichen abgelegt werden.|false|

**Beispiel**
```
#!json
"filter":{
    "name": "Filter",
    "glyphicon": "glyphicon-filter",
    "deactivateGFI": false,
    "isGeneric": false,
    "isInitOpen": false,
    "allowMultipleQueriesPerLayer": false,
    "predefinedQueries": [
        {
            "layerId": "8712",
            "isActive": false,
            "isSelected": false,
            "name": "Grundschulen",
            "predefinedRules": [
                {
                    "attrName": "kapitelbezeichnung",
                    "values": ["Grundschulen", "Langformschulen"]
                }
            ],
            "attributeWhiteList": ["bezirk", "stadtteil", "schulform", "ganztagsform", "anzahl_schueler", "schwerpunktschule", "bilingual"]
        },
        {
            "layerId": "8712",
            "isActive": false,
            "isSelected": false,
            "name": "Stadtteilschulen",
            "predefinedRules": [
                {
                    "attrName": "kapitelbezeichnung",
                    "values": ["Stadtteilschulen", "Langformschulen"]
                }
            ],
            "attributeWhiteList": ["bezirk", "stadtteil", "schulform", "ganztagsform", "anzahl_schueler", "schwerpunktschule", "fremdsprache", "fremdsprache_mit_klasse", "schulische_ausrichtung"]
        },
        {
            "layerId": "8712",
            "isActive": false,
            "isSelected": false,
            "name": "Gymnasien",
            "info": "Sie finden berufliche Gymnasien ab der Klassenstufe 11 bei den Beruflichen Schulen.",
            "predefinedRules": [
                {
                    "attrName": "kapitelbezeichnung",
                    "values": ["Gymnasien"]
                }
            ],
            "attributeWhiteList": ["bezirk", "stadtteil", "schulform", "ganztagsform", "anzahl_schueler", "fremdsprache", "fremdsprache_mit_klasse", "schulische_ausrichtung"]
        },
        {
            "layerId": "8712",
            "isActive": false,
            "isSelected": false,
            "name": "Sonderschulen",
            "predefinedRules": [
                {
                    "attrName": "kapitelbezeichnung",
                    "values": ["Sonderschulen"]
                }
            ],
            "attributeWhiteList": ["bezirk", "stadtteil", "ganztagsform", "foerderart", "abschluss"]
        },
        {
        "layerId": "1711",
        "isActive": true,
        "isSelected": true,
        "name": "Krankenhäuser",
        "predefinedRules": [],
        "attributeWhiteList": ["teilnahme_geburtsklinik", "teilnahme_notversorgung"]
        }
    ]
}
```

***

#### Portalconfig.menu.tool.filter.predefinedQuery
Objekt, das eine Filtereinstellung definiert.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|layerId|ja|String||Id des Layers. Muss auch in der Themenconfig konfiguriert sein.|false|
|isActive|nein|Boolean|false|Gibt an, ob diese Filtereinstellung initial durchgeführt werden soll.|false|
|isSelected|nein|Boolean|false|Gibt an, ob diese Filtereinstellung initial angezeigt werden soll.|false|
|searchInMapExtent|nein|Boolean|false|Gibt an, ob nur die Features im Kartenauschnitt gefiltert werden sollen.|false|
|info|nein|String||Kurzer Infotext, der über der Filtereinstellung erscheint.|false|
|predefinedRules|nein|**[predefinedRule](#markdown-header-portalconfigmenutoolfilterpredefinedquerypredefinedrule)**[]||Filterregel die die Daten vorfiltert.|true|
|attributeWhiteList|nein|String[]/**[attributeWhiteListObject](#markdown-header-portalconfigmenutoolfilterpredefinedqueryattributewhitelistobject)**[]||Whitelist an Attributen die verwendet werden sollen.|true|
|snippetType|nein|String||Datentyp des Attributes. Wenn nicht angegeben, wird der Datentyp automatisch ermittelt. Er kann in Ausnahmefällen auch manuell überschrieben werden. Beispielsweise mit "checkbox-classic". Dies wird im Projekt DIPAS auf der Touchtabl-Variante des Portals benötigt.|true|
|useProxy|nein|Boolean|false|Deprecated im nächsten Major-Release, da von der GDI-DE empfohlen wird einen CORS-Header einzurichten. Gibt an, ob die URL des Dienstes über einen Proxy angefragt werden soll, dabei werden die Punkte in der URL durch Unterstriche ersetzt.|false|

**Beispiel**
```
#!json
{
    "layerId": "8712",
    "isActive": false,
    "isSelected": false,
    "name": "Grundschulen",
    "predefinedRules": [
        {
            "attrName": "kapitelbezeichnung",
            "values": ["Grundschulen", "Langformschulen"]
        }
    ],
    "attributeWhiteList": ["bezirk", "stadtteil", "schulform", "ganztagsform", "anzahl_schueler", "schwerpunktschule", "bilingual"]
}
```

***

#### Portalconfig.menu.tool.filter.predefinedQuery.predefinedRule
Filterregel die die Daten immer vorfiltert.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|attrName|ja|String||Attributname nach dem vorgefiltert werden soll.|false|
|values|ja|String[]||Attributwerte für das Vorfiltern.|false|

**Beispiel**
```json
{
    "attrName": "kapitelbezeichnung",
    "values": ["Grundschulen", "Langformschulen"]
}
```
***

#### Portalconfig.menu.tool.filter.predefinedQuery.attributeWhiteListObject
Ein AttributeWhiteList Objekt kann entweder ein String sein, welcher den Attributnamen repräsentiert.
Er kann aber auch ein Objekt sein. Erfolgt der Eintrag als Objekt, so kann eine Umbennung der zu filternden Attribute vorgenommen werden. Der Schlüssel muss dabei der originale Attributname sein. Der zugehörige Wert ist der alternative Name.

Durch die Verwendung von AttributeWhiteList als Objekt ist es auch möglich, dass ein Slider für die Auswahl eines Start- und End-Zeitpunktes als Filter verwendet wird.
Vorraussetzung dafür ist, dass ein Start- und End-Zeit in einem bestimmten Format als Attribut existieren.
Des weiteren sollten in dem Object mit dem key "name" der Anfangszeitpunkt, mit dem key "attrNameUntil" der Entzeitpunkt und mit dem key "format" das Format der Attribute definiert werden.
Der letzte Schritt damit der Slider als Datumsfilter verwendet werden kann, ist der, dass man den key "type" als "date" definiert.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|name|ja|String||Attributname.|false|
|matchingMode|nein|enum["AND", "OR"]|"OR"|Logische Verknüpfung mehrerer Attributwerte (bei Mehrfachauswahl) innerhalb eines Attributes.|false|
|displayName|nein|String||Names des Filters.|true|
|attrNameUntil|nein|String||Names des Attributs, das als Endzeitpunkt für den Sliderfilter verwendet wird.|true|
|format|nein|String||Format des Datums.|true|
|type|nein|enum["integer", "searchInMapExtent", "date"]||Typ des Attributs.|true|

**Beispiel als String**
```
#!json
"Grundschulen"
```

**Beispiel als Objekt**
```
#!json
{
    "name": "Grundschulen",
    "matchingMode": "AND"
}
```

***

**Beispiel als Objekt für Filter mit Date-Slider**

```
#!json

"attributeWhiteList": [
  {
    "name": "baubeginn",
    "displayName": "Baustelle",
    "attrNameUntil": "bauende",
    "matchingMode": "OR",
    "format": "DD.MM.YYYY",
    "type": "date"
  }
```

***

#### Portalconfig.menu.tool.filterGeneral

[inherits]: # (Portalconfig.menu.tool)

Das Filterwerkzeug bietet eine Reihe von Optionen zum Filtern von Vektordaten.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|layerSelectorVisible|nein|Boolean|true|Verwenden des Auswahl-Selektors für die Layer. Auf `false` setzen um keine Selektion zu verwenden.|false|
|multiLayerSelector|nein|Boolean|true|Wenn layerSelectorVisible auf `true` gesetzt ist, kann hiermit das Verhalten zum Öffnen mehrerer Selektoren gleichzeitig eingestellt werden.|false|
|liveZoomToFeatures|nein|Boolean|true|Zoomen bei Filterung auf den Browser-Extent der die gefilterten Features umfasst.|false|
|minScale|nein|Integer|5000|Der minimale Zoom-Level an dem das Zoomen nach Filterung immer stoppt.|false|
|layers|nein|[filterLayer](#markdown-header-portalconfigmenutoolfiltergeneralfilterlayer)[]|[]|Konfiguration der zu filternden Layer. Wenn hier ein Array von Layer-Ids angegeben wird, versucht das System eine automatische Ermittlung der Layer- und seine Snippet-Einstellungen.|false|

**Beispiel**

Beispiel für die Konfiguration eines Filters mit einem einzigen Layer. Das Layer und seine Snippets werden automatisch eingestellt.

```json
{
    "filterGeneral":{
        "active": false,
        "name": "Filter",
        "glyphicon": "glyphicon-filter",
        "renderToWindow": false,
        "deactivateGFI": false,
        "layerSelectorVisible": false,
        "layers": [
            {
                "layerId": "8712"
            }
        ]
    }
}
```

***

#### Portalconfig.menu.tool.filterGeneral.filterLayer

Die Konfiguration eines Layers.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|layerId|nein|String||Die Layer-Id, muss identisch sein mit der unter `Themenconfig` konfigurierten Id des Layers.|false|
|title|nein|String||Der Titel der für den Auswahl-Selektor verwendet werden soll (nur bei layerSelectorVisible true). Kann ein Übersetzungs-Key sein. Wenn nicht eingestellt, dann wird die Layer-Id per default verwendet.|false|
|category|nein|String||Anstelle von `title` kann `category` als Titel konfiguriert werden. Hiermit kann der Selektor mehrdimensional gemacht werden. Ein Parameter `layers` als [filterLayer](#markdown-header-portalconfigmenutoolfiltergeneralfilterlayer)[] wird erwartet, der nach den hier beschriebenen Regeln funktioniert. Die Parameter `description` and `shortDescription` stehen wie beschrieben auch für die Kategorie-Ebene zur Verfügung (siehe Beispiele).|false|
|description|nein|String|""|Die detailierte Beschreibung eines Layers bei geöffnetem Auswahl-Selektor oder immer über dem Filter wenn layerSelectorVisible `false` ist. Kann ein Übersetzungs-Key sein.|false|
|shortDescription|nein|String|""|Eine kürzere Version der Beschreibung die bei Verwendung von Auswahl-Selektoren bei geschlossenen Selektoren angezeigt wird. Kann ein Übersetzungs-Key sein.|false|
|active|no|Boolean|false|Auf `true` setzen, damit der Filter mit diesem geöffneten Filter-Layer initial geöffnet wird - nur verfügbar, wenn layerSelectorVisible auf `true` steht. Steht multiLayerSelector auf `false` und mehr als ein Filter-Layer wird auf active `true` gestellt, dann wird nur das letzte dieser Layer initial geöffnet.|false|
|strategy|nein|String||Es gibt zwei Filter-Strategien: `passive` - Filtern nur nach Klick auf den Filter-Button. Und `active` - Filterung findet immer sofort statt, wenn die Einstellung irgendeines der Snippets verändert wird. Die passive Strategie ist der Default.|false|
|searchInMapExtent|nein|Boolean|false|Wenn auf `true` eingestellt, wird automatisch eine generische Checkbox erzeugt, mit der die Filterung auf den Browser-Extent beschränkt werden kann. Ist die Checkbox angehakt, ist das automatische Zoomen ausgeschaltet. Bitte unbedingt [loadingStrategy](#markdown-header-themenconfiglayervector) auf `all` setzen, da es sonst zu ungewollten Effekten kommt, wenn nach dem Filtern herausgezoomt wird.|false|
|searchInMapExtentInfo|nein|Boolean|true|Rechts von der Checkbox wird ein Info-Symbol angezeigt, bei Klick wird eine Standard-Beschreibung eingeblendet. Auf `false` stellen, wenn es nicht angezeigt werden soll. Kann auch als String mit einem eigenen Info-Text eingestellt werden oder als Übersetzungs-Key.|false|
|showHits|nein|Boolean|true|Die Treffer nach einer Filterung werden als Text angezeigt. Auf `false` stellen, um die Treffer nicht anzuzeigen.|false|
|snippetTags|nein|Boolean|true|Wenn gefiltert wurde, wird die Einstellung des Filters als Tags über dem Filter angezeigt. Auf `false` stellen, wenn dies vermieden werden soll.|false|
|labelFilterButton|nein|String|"common:modules.tools.filterGeneral.filterButton"|Bei passiver Strategie (`passive`): Der verwendetet Text vom Filter-Button. Kann auch ein Übersetzungs-Key sein.|false|
|paging|nein|Number|1000|Der Filter lädt Features Stück für Stück in die Map. Dies ermöglicht einen Ladebalken der die Usability bei großen Datenmengen verbessert. Das Paging ist die Stück-Größe. Bei zu gering eingestellter Größe wird das Filtern ausgebremst. Bei zu groß eingestellter Größe steigt die Verzögerung der Anzeige in der Karte. Der beste Wert kann nur von Fall zu Fall durch Ausprobieren ermittelt werden.|false|
|extern|nein|Boolean|false|Stellen Sie dieses Flag auf `true` um die Filterung serverseitig durchzuführen. Dies sollte für große Datenmengen in Betracht gezogen werden, die nicht in einem Stück in den Browser geladen werden können. Es ist dann außerdem ratsam das Layer-Flag **[isNeverVisibleInTree](#markdown-header-themenconfiglayer)** auf `true` zu stellen, um das Laden des gesamten Datensatzes durch User-Interaktion über den Themenbaum zu verhindern.|false|
|snippets|nein|[snippets](#markdown-header-portalconfigmenutoolfiltergeneralfilterlayersnippets)[]|[]|Konfiguration der sogenannten Snippets für das Filtern. Kann bei der minimalsten Variante ein Array von Attribut-Namen sein. Kann komplett weggelassen werden, wenn die automatische Snippet-Ermittlung verwendet werden soll.|false|

**Beispiel**

Dieses Beispiel konfiguriert ein Layer mit nur einem einzigen Snippet. Die Art des Snippets und seine Einstellungen werden automatisch ermittelt. Siehe [filterLayerSnippets](#markdown-header-portalconfigmenutoolfiltergeneralfilterlayersnippets) um mehr zur Konfiguration von Snippets zu erfahren.

```json
{
    "layerId": "8712",
    "title": "Schools",
    "strategy": "active",
    "searchInMapExtent": true,
    "showHits": true,
    "shortDescription": "School master data and pupil numbers of Hamburg schools",
    "description": "School master data and pupil numbers of Hamburg schools",
    "snippetTags": true,
    "paging": 100,
    "snippets": [
        {
            "attrName": "rebbz_homepage"
        }
    ]
}
```

**Beispiel**

Das folgende Beispiel zeigt wie der Parameter `category` anstelle von `title` gesetzt wird, um mit einem Parameter `layers` eine weitere Ebene in den Selektor einzubauen.

```json
{
    "category": "Schools and Hospitals",
    "shortDescription": "Numbers of Hamburg schools and hospitals",
    "description": "Numbers of Hamburg schools and hospitals",
    "layers": [
        {
            "layerId": "8712",
            "title": "Schools",
            "strategy": "active",
            "searchInMapExtent": true,
            "searchInMapExtentInfo": true,
            "showHits": true,
            "shortDescription": "School master data and pupil numbers of Hamburg schools",
            "description": "School master data and pupil numbers of Hamburg schools",
            "snippetTags": true,
            "paging": 100,
            "snippets": [
                {
                    "attrName": "rebbz_homepage"
                }
            ]
        },
        {
            "layerId": "8713",
            "title": "Hospitals",
            "snippetTags": true,
            "paging": 100,
            "snippets": [
                {
                    "attrName": "hospital_name"
                }
            ]
        }
    ]
}
```

***

#### Portalconfig.menu.tool.filterGeneral.filterLayer.snippets

Ein Objekt das ein einzelnes Snippet beschreibt.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|attrName|ja|String||Der Name des Attributes auf dem dieses Snippet filtern soll. Kann ein Array sein, wenn `Ranges` verwendet werden sollen. (Array-Option nur für `sliderRange` and `dateRange` - siehe Beispiele).|false|
|title|nein|String||Der Titel des Snippets. Kann ein Übersetzungs-Key sein. Wenn nicht eingestellt, wird attrName verwendet. Kann explizit auf `false` gesetzt werden um die Anzeige eines Titels zu unterbinden.|false|
|info|nein|String||Info-Text zu diesem Snippet oder ein Übersetzungs-Key. Wenn eingestellt, dann wird rechts vom Snippet ein Info-Symbol angezeigt, das bei Klick den Text darstellt. Kann auch einfach auf `true` gestellt werden, wenn ein Standard-Text ausreichend ist.|false|
|type|nein|String||Der Snippet-Typ: `checkbox`, `dropdown`, `text`, `slider`, `sliderRange`, `date`, `dateRange`. Wird automatisch ermittelt, wenn nicht angegeben - dabei wird der Datentyp als Grundlage genommen: boolean wird zu `checkbox`, string wird zu `dropdown`, number wird zu `sliderRange`, unbekannt wird zu `text`.|false|
|operator|nein|String||Der logische Operator wie der eingestellte Wert mit dem Wert in der Datenbank verglichen wird. Abhängig davon ob es Sinn macht können dies folgende Werte sein: `INTERSECTS`, `BETWEEN`, `EQ`, `IN`, `STARTSWITH`, `ENDSWITH`, `NE`, `GT`, `GE`, `LT`, `LE`. Wenn weggelassen, gilt der Default: boolean wird zu `EQ`, string wird zu `EQ`, number wird zu `BETWEEN`, unbekannt wird zu `EQ`.|false|
|visible|nein|Boolean|true|Das Snippet wird angezeigt. Auf `false` stellen um das Snippet zu verbergen: Dadurch können mithilfe von `prechecked` Werte im versteckten Snippet fest eingestellt werden, die dann bei jeder Filterung gelten.|false|
|prechecked|nein|String[]||Initial aktiv eingestellte Werte. Für `dropdown`, `sliderRange` und `dateRange` ist dies ein Array, für checkbox ein boolean, für slider eine number, für text ein string und für date ein string der über das `format` spezifiziert werden muss.|false|
|value|nein|String[]||Initial verwendete Werte zur Auswahl. Wenn nicht eingestellt, werden die Werte so möglich automatisch ermittelt (für `dropdown`, `slider(Range)` und `date(Range)`. Im Falle von `checkbox` wird hier die true/false-Übersetzung der Werte in der Datenbank gemacht - so die Werte in der Datenbank keine Boolean-Werte sind. (z.B. ["Ja", "Nein"] - siehe Beispiele).|false|
|format|nein|String|"YYYY-MM-DD"|Nur für Snippet-Typ `date` und `dateRange`: Das verwendete Format des Datums in der Datenbank. Wenn nicht angegeben wird ISO8601 angenommen.|false|
|minValue|nein|Number||Nur für Snippet-Typ `slider(Range)` und `date(Range)`: Der Minimal-Wert als number oder Datums-String. Weglassen um die automatische Ermittlung der Werte zu aktivieren.|false|
|maxValue|nein|Number||Nur für Snippet-Typ `slider(Range)` und `date(Range)`: Der Maximal-Wert als number oder Datums-String. Weglassen um die automatische Ermittlung der Werte zu aktivieren.|false|
|display|nein|String|"default"|Nur für Snippet-Typ `dropdown`: Wenn auf `list` eingestellt, wird anstelle einer Dropdown-Box eine Liste angezeigt.|false|
|autoInit|nein|Boolean|true|Nur für Snippet-Typ `dropdown`: Schaltet wenn auf `false` gestellt die automatischen Ermittlungen von Inhalts-, Min- und Max-Werten ab.|false|
|placeholder|nein|String|""|Nur für Snippet-Typ `dropdown`: Der Platzhalter bei Nicht-Einstellung der Dropdown. Kann ein Übersetzungs-Key sein.|false|
|multiselect|nein|Boolean|true|Nur für Snippet-Typ `dropdown`: Gleichzeitige Auswahl vieler Werte. Auf `false` stellen um auf Einzelauswahl umzustellen.|false|
|addSelectAll|nein|Boolean|false|Nur für Snippet-Typ `dropdown` mit `multiselect: true`: Ein zusätzlicher Eintrag zum Selektieren/Deselektieren aller Werte wird angeboten.|false|
|renderIcons|nein|String|"none"|Nur für Snippet-Typ `dropdown` mit `display: "list"`: Wenn auf den String `fromLegend` eingestellt, werden Icons aus der Legende bezogen und links neben den Werten angezeigt. Wird hier ein Objekt angegeben, werden die Key-Namen als Wert und der Value als Bild-Pfad verwendet: {attrName: imagePath} (siehe Beispiele).|false|

**Beispiel**

Beispiel für ein Text-Snippet. Eine Input-Box mit Platzhalter zur freien Filterung von einem Attribut.

```json
{
    "title": "Description of school",
    "attrName": "school_description",
    "type": "text",
    "operator": "IN",
    "placeholder": "Search in description"
}
```

**Beispiel**

Beispiel für ein Checkbox-Snippet. Eine Checkbox die - wenn gesetzt - nach "Oui" als true-Wert filtert. Die Checkbox ist per Default angehakt.

```json
{
    "title": "A l'option végétalienne ?",
    "attrName": "vegan_option",
    "type": "checkbox",
    "operator": "EQ",
    "value": ["Oui", "Non"],
    "prechecked": true
}
```

**Beispiel**

Beispiel für ein Dropdown-Snippet. Eine einfache Dropdown-Box die keine Mehrfachauswahl zulässt und einen Platzhalter hat.

```json
{
    "title": "District",
    "attrName": "city_district",
    "type": "dropdown",
    "multiselect": false,
    "placeholder": "Choose a district"
}
```

**Beispiel**

Beispiel für ein Dropdown-Snippet. Eine als Liste dargestellte Auswahl (nicht als Dropdown-Box) mit Mehrfachauswahl und Alle-Auswählen Option. Zusätzlich mit Icons, Info, festen Werten und voreingestellten Werten.

```json
{
    "title": "District",
    "attrName": "city_district",
    "info": "Some districts of London.",
    "type": "dropdown",
    "display": "list",
    "multiselect": true,
    "addSelectAll": true,
    "value": [
        "Whitehall and Westminster",
        "Piccadilly and St James's",
        "Soho and Trafalgar Square",
        "Covent Garden and Strand",
        "Bloomsbury and Fitzrovia"
    ],
    "prechecked": [
        "Piccadilly and St James's",
        "Soho and Trafalgar Square"
    ],
    "renderIcons": {
        "Whitehall and Westminster": "https://example.com/img/whitehall.png",
        "Piccadilly and St James's": "https://example.com/img/piccadilly.png",
        "Soho and Trafalgar Square": "https://example.com/img/soho.png",
        "Covent Garden and Strand": "https://example.com/img/covent.png",
        "Bloomsbury and Fitzrovia": "https://example.com/img/bloomsbury.png"
    },
    "placeholder": "Choose a district"
}
```

**Beispiel**

Beispiel für ein Slider-Snippet. Ein Slider für einen Einzelwert und Kleinergleich-Operator. Mit gesetztem minValue und maxValue, was die automatische Wertermittlung abschaltet.

```json
{
    "title": "First classes",
    "attrName": "number_of_first_classes",
    "type": "slider",
    "operator": "LE",
    "minValue": 1,
    "maxValue": 5
}
```

**Beispiel**

Beispiel für ein SliderRange-Snippet. Eine SliderRange die ihre Grenzwerte automatisch ermittelt (wegen fehlendem minValue und maxValue).

```json
{
    "title": "Angle d'inclinaison du toit du garage",
    "attrName": "angle",
    "type": "sliderRange",
    "operator": "BETWEEN"
}
```

**Beispiel**

Beispiel für ein SliderRange-Snippet. Ein SliderRange mit zwei attrName-Angaben für min und max. Mit gesetztem minValue und maxValue, was die automatische Wertermittlung abschaltet.

```json
{
    "title": "Angle d'inclinaison du toit du garage",
    "attrName": ["angle_minimal", "angle_maximal"],
    "type": "sliderRange",
    "operator": "BETWEEN",
    "minValue": 0,
    "maxValue": 90
}
```

**Beispiel**

Beispiel für ein Date-Snippet. Ein Datepicker zur Auswahl eines Einzeldatums. Mit gesetztem minValue und maxValue, was die automatische Wertermittlung abschaltet.

```json
{
    "title": "Birthday",
    "attrName": "birthday",
    "type": "date",
    "format": "YYYY-MM-DD",
    "minValue": "2000-01-01",
    "maxValue": "2022-12-31"
}
```

**Beispiel**

Beispiel für ein DateRange-Snippet. Mit zwei Attribut-Namen für Min- und Maxwerte. Bitte das spezielle Datums-Format beachten. Benutzt den INTERSECTS-Operator und die automatische Grenzermittlung.

```json
{
    "title": "Bauzeit der Autobahnen",
    "attrName": ["autobahn_baubeginn", "autobahn_bauende"],
    "type": "dateRange",
    "operator": "INTERSECTS",
    "format": "DD.MM.YY"
}
```

***

#### Portalconfig.menu.tool.compareFeatures

[inherits]: # (Portalconfig.menu.tool)

Hier können Vector Features miteinander verglichen werden.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|numberOfFeaturesToShow|nein|Integer|3|Anzahl der Features die maximal miteinander verglichen werden können.|false|
|numberOfAttributesToShow|nein|Integer|12|Anzahl der Attribute die angezeigt werden. Gibt es mehrere Attribute können diese über einen Button zusätzlich ein-/ bzw. ausgeblendet werden.|false|

**Beispiel**
```
#!json
"compareFeatures": {
    "name": "Vergleichsliste",
    "glyphicon": "glyphicon-th-list",
    "numberOfFeaturesToShow": 5,
    "numberOfAttributesToShow": 10
}
```

***

#### Portalconfig.menu.tool.parcelSearch

[inherits]: # (Portalconfig.menu.tool)
Flurstückssuche.

**ACHTUNG: Backend notwendig!**

**Je nach Konfiguration werden spezielle Stored Queries eines WFS mit vorgegebenen Parametern abgefragt.**

Beispiel: **https://geodienste.hamburg.de/HH_WFS_DOG?service=WFS&request=GetFeature&version=2.0.0&&StoredQuery_ID=Flurstueck&gemarkung=0601&flurstuecksnummer=00011**

>⚠️ Deprecated im nächsten Major-Release. Bitte verwenden Sie stattdessen **[wfsSearch](#markdown-header-portalconfigmenutoolwfssearch)**.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|serviceId|ja|String||Id des Dienstes der abgefragt werden soll. Wird in der rest-services.json abgelegt.|false|
|storedQueryId|ja|String||Id der stored query die verwendet werden soll.|true|
|configJSON|ja|String||Pfad zur Konfigurationsdatei, die die Gemarkungen enthält. **[Beispiel](https://geodienste.hamburg.de/lgv-config/gemarkungen_hh.json)**.|false|
|parcelDenominator|nein|Boolean|false|Flag, ob Flurnummern auch zur Suche verwendet werden sollen. Besonderheit Hamburg: Hamburg besitzt als Stadtstaat keine Fluren.|false|
|styleId|nein|String||Hier kann eine StyleId aus der style.json angegeben werden um den Standard-Style vom MapMarker zu überschreiben.|false|
|zoomLevel|nein|Number|7|Gibt an, auf welches ZoomLevel gezoomt werden soll.|false|

**Beispiel**
```
#!json
"parcelSearch": {
    "name": "Flurstückssuche",
    "glyphicon": "glyphicon-search",
    "serviceId": "6",
    "storedQueryID": "Flurstueck",
    "configJSON": "https://geodienste.hamburg.de/lgv-config/gemarkungen_hh.json",
    "parcelDenominator": false,
    "styleId": "flaecheninfo"
}
```

***

#### Portalconfig.menu.tool.saveSelection

[inherits]: # (Portalconfig.menu.tool)

Abspeicherung des aktuellen Karteninhalts.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|simpleMap|nein|Boolean|false|Fügt der Komponente eine SimpleMap-URL hinzu (ohne Menüleiste, Layerbau, Map Controls).|false|

***

#### Portalconfig.menu.tool.resetTree

[inherits]: # (Portalconfig.menu.tool)

Zurücksetzen des Themenbaums.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|resetTree|nein|Boolean|false|Werkzeug um Themenbaum zurückzusetzen. Per Klick auf Werkzeugname im Menü unter Werkzeuge wird der Themenbaum zurückgesetzt.|false|

**Beispiel**

```
#!json
"resetTree": {
    "name": "translate#additional:modules.tools.resetTree.title",
    "glyphicon": "glyphicon-repeat"
}
```

***

#### Portalconfig.menu.tool.searchByCoord

[inherits]: # (Portalconfig.menu.tool)
Koordinatensuche.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|zoomLevel|nein|Number|7|Gibt an, auf welches ZoomLevel gezoomt werden soll.|false|

**Beispiel**
```
#!json
"searchByCoord": {
    "name": "Flurstückssuche",
    "glyphicon": "glyphicon-record",
    "zoomLevel": 7
}
```

***

#### Portalconfig.menu.tool.print

[inherits]: # (Portalconfig.menu.tool)

Druckmodul. Konfigurierbar für 2 Druckdienste: den High Resolution PlotService oder MapfishPrint 3. Das Drucken von Vector Tile Layern wird nicht unterstützt, da die Druckdienste es nicht unterstützen; falls der User versucht die Anzeige zu so einem Layer zu drucken, wird ihm eine Hinweismeldung dazu angezeigt.

**ACHTUNG: Backend notwendig!**

**Es wird mit einem [Mapfish-Print3](https://mapfish.github.io/mapfish-print-doc) oder einem HighResolutionPlotService im Backend kommuniziert.**

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|mapfishServiceId|ja|String||_Deprecated in 3.0.0._ Id des Druckdienstes der verwendet werden soll. Wird in der rest-services.json abgelegt.|false|
|printServiceId|ja|String||Id des Druckdienstes der verwendet werden soll. Wird in der rest-services.json abgelegt.|false|
|printService|nein|String|"mapfish"|Flag welcher Druckdienst verwendet werden soll. Bei "plotservice" wird der High Resolution PlotService verwendet, wenn der Parameter nicht gesetzt wird, wird Mapfish 3 verwendet.|false|
|printAppCapabilities|nein|String|"capabilities.json"|Pfad unter welcher die Konfiguration des Druckdienstes zu finden ist.|false|
|currentLayoutName|nein|String|""|Legt fest, welches Layout als Standardwert beim Öffnen des Druckwerkzeuges ausgewählt sein soll. Zum Beispiel "A4 Hochformat". Wenn das angegebene Layout nicht vorhanden ist oder keins angegeben wurde, dann wird das erste Layout der Capabilities verwendet.|false|
|printAppId|nein|String|"master"|Id der print app des Druckdienstes. Dies gibt dem Druckdienst vor welche/s Template/s er zu verwenden hat.|false|
|filename|nein|String|"report"|Dateiname des Druckergebnisses.|false|
|title|nein|String|"PrintResult"|Titel des Dokuments. Erscheint als Kopfzeile.|false|
|version|nein|String||Flag welcher Druckdienst verwendet werden soll. Bei "HighResolutionPlotService" wird der High Resolution PlotService verwendet, wenn der Parameter nicht gesetzt wird, wird Mapfish 3 verwendet.|false|
|isLegendSelected|nein|Boolean|false|Gibt an, ob die Checkbox, zum Legende mitdrucken, aktiviert sein soll. Wird nur angezeigt wenn der Druckdienst (Mapfish Print 3) das Drucken der Legende unterstützt.|false|
|legendText|nein|String|"Mit Legende"|Beschreibender Text für die printLegend-Checkbox.|false|
|dpiForPdf|nein|Number|200|Auflösung der Karte im PDF.|false|
|capabilitiesFilter|nein|**[capabilitiesFilter](#markdown-header-portalconfigmenutoolprintcapabilitiesfilter)**||Filterung der Capabilities vom Druckdienst. Mögliche Parameter sind layouts und outputFormats.|false|
|defaultCapabilitiesFilter|nein|**[capabilitiesFilter](#markdown-header-portalconfigmenutoolprintcapabilitiesfilter)**||Ist für ein Attribut kein Filter in capabilitiesFilter gesetzt, wird der Wert aus diesem Objekt genommen.|false|
|useProxy|nein|Boolean|false|Deprecated im nächsten Major-Release, da von der GDI-DE empfohlen wird einen CORS-Header einzurichten. Gibt an, ob die URL des Dienstes über einen Proxy angefragt werden soll, dabei werden die Punkte in der URL durch Unterstriche ersetzt.|false|
|printMapMarker|nein|Boolean|false|Wenn dieses Feld auf true gesetzt ist, werden im Bildausschnitt sichtbare MapMarker mitgedruckt. Diese überdecken ggf. interessante Druckinformationen. Hinweis an Entwickler: Dieses Feature funktioniert im Dev-Mode nicht, da MapFish nicht auf Dateien unter localhost zugreifen kann, und der mapMarker im Build liegt.|false|

**Beispiel Konfiguration mit High Resolution PlotService**
```
#!json
"print": {
    "name": "Karte drucken",
    "glyphicon": "glyphicon-print",
    "printServiceId": "123456",
    "filename": "Ausdruck",
    "title": "Mein Titel",
    "printService": "plotservice",
    "printAppCapabilities": "info.json"
}
```

**Beispiel Konfiguration mit MapfishPrint3**
```
#!json
"print": {
    "name": "Karte drucken",
    "glyphicon": "glyphicon-print",
    "printServiceId": "mapfish_printservice_id",
    "printAppId": "mrh",
    "filename": "Ausdruck",
    "title": "Mein Titel"
}
```

### Portalconfig.menu.tool.print.capabilitiesFilter
Liste von Layouts und Formaten, welche die Antwort vom Druckdienst in der jeweiligen Kategorie filtert.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|layouts|nein|String[]||Liste von Layouts, welche in der Oberfläche angezeigt werden sollen.|false|
|outputFormats|nein|String[]||Liste von Formaten, welche in der Oberfläche angezeigt werden sollen.|false|

**Beispiel capabilitiesFilter:**
```
#!json
"capabilitiesFilter": {
    "layouts": ["A4 Hochformat", "A3 Hochformat"],
    "outputFormats": ["PDF"]
}
```

***

#### Portalconfig.menu.tool.draw

[inherits]: # (Portalconfig.menu.tool)

Modul für das Zeichnen von Features auf der Karte. Dies beinhaltet Punkte, welche auch als Symbole dargestellt werden können, (Doppel-)Kreise, Polygone, Polyline und Text.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|name|ja|String||Name des Werkzeugs im Menü.|false|
|iconList|nein|**[icon](#markdown-header-portalconfigmenutooldrawicon)**[]|[{"id": "iconPoint", "type": "simple_point", "value": "simple_point"}, {"id": "yellow pin", "type": "image", "scale": 0.5, "value": "https://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png"}]|Liste an Symbolen, aus welcher ein Nutzer die Auswahl für das Zeichnen eines farbigen Punktes oder eines Symbols hat. Es können wie im Beispiel eigene Bild-Dateien verwendet werden.|false|
|drawSymbolSettings|nein|**[drawSymbolSet](#markdown-header-portalconfigmenutooldrawdrawsymbolset)**|{"color": [55, 126, 184, 1], "opacity": 1}|Voreinstellung für das Zeichnen von Symbolen.|false|
|drawLineSettings|nein|**[drawLineSet](#markdown-header-portalconfigmenutooldrawdrawlineset)**|{"strokeWidth": 1, "opacityContour": 1, "colorContour": [0, 0, 0, 1]}|Voreinstellung für das Zeichnen von Linien.|false|
|drawCurveSettings|nein|**[drawCurveSet](#markdown-header-portalconfigmenutooldrawdrawcurveset)**|{"strokeWidth": 1, "opacityContour": 1, "colorContour": [0, 0, 0, 1]}|Voreinstellung für das Zeichnen von Freihand-Linien.|false|
|drawAreaSettings|nein|**[drawAreaSet](#markdown-header-portalconfigmenutooldrawdrawareaset)**|{"strokeWidth": 1, "color": [55, 126, 184, 1], "opacity": 1, "colorContour": [0, 0, 0, 1], "opacityContour": 1}|Voreinstellung für das Zeichnen von Flächen.|false|
|drawCircleSettings|nein|**[drawCircleSet](#markdown-header-portalconfigmenutooldrawdrawcircleset)**|{"circleMethod": "interactive", "unit": "m", "circleRadius": null, "strokeWidth": 1, "color": [55, 126, 184, 1], "opacity": 1, "colorContour": [0, 0, 0, 1], "opacityContour": 1, "tooltipStyle": {"fontSize": "16px", "paddingTop": "3px", "paddingLeft": "3px", "paddingRight": "3px", "backgroundColor": "rgba(255, 255, 255, .9)"}}|Voreinstellung für das Zeichnen von Kreisen.|false|
|drawDoubleCircleSettings|nein|**[drawDoubleCircleSet](#markdown-header-portalconfigmenutooldrawdrawdoublecircleset)**|{"circleMethod": "defined", "unit": "m", "circleRadius": 0, "circleOuterRadius": 0, "strokeWidth": 1, "color": [55, 126, 184, 1], "opacity": 1, "colorContour": [0, 0, 0, 1], "outerColorContour": [0, 0, 0, 1], "opacityContour": 1}|Voreinstellung für das Zeichnen von Doppel-Kreisen.|false|
|writeTextSettings|nein|**[writeTextSet](#markdown-header-portalconfigmenutooldrawwritetextset)**|{"text": "", "fontSize": 10, "font": "Arial", "color": [55, 126, 184, 1], "opacity": 1}|Voreinstellung für das Schreiben von Texten.|false|
|download|nein|**[download](#markdown-header-portalconfigmenutooldrawdownload)**|{"preSelectedFormat": "KML"}|Einstellungen für das Herunterladen der Zeichnung.|false|

**Beispiel**

```
#!json
"draw": {
    "name": "Zeichnen / Schreiben",
    "glyphicon": "glyphicon-pencil",
    "iconList": [
        {
            "id": "iconPoint",
            "type": "simple_point",
            "value": "simple_point"
        },
        {
            "id": "iconMeadow",
            "type": "image",
            "scale": 0.8,
            "value": "wiese.png"
        },
        {
            "id": "gelber Pin",
            "type": "image",
            "scale": 0.5,
            "value": "https://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png"
        }
    ],
    "drawDoubleCircleSettings": {
        "circleRadius": 1500,
        "circleOuterRadius": 3000,
        "strokeWidth": 3,
        "color": [55, 126, 184, 0],
        "opacity": 0,
        "colorContour": [228, 26, 28, 1],
        "opacityContour": 1,
        "tooltipStyle": {
            "fontSize": "14px",
            "paddingTop": "3px",
            "paddingLeft": "3px",
            "paddingRight": "3px",
            "backgroundColor": "rgba(255, 255, 255, .9)"
        }
    }
}
```

***

#### Portalconfig.menu.tool.draw.icon

Punkt Objekt, bestehend aus der Beschriftung, dem Typ und dem Wert.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|id|ja|String||Die Beschriftung des Symbols, welche im Auswahlmenü dargestellt wird. Diese muss in der Sprachdatei (meistens `common`) angelegt werden unter dem Punkt `modules.tools.draw.iconList`, wobei der darauffolgende Parameter standardmäßig mit `icon` beginnen und eine repräsentative Beschreibung darstellen sollte. Wird dieser Schlüssel in der Übersetzungesdatei nicht gefunden, dann wird die `id` in der Oberfläche angezeigt.|false|
|caption|nein|String||Deprecated in 3.0.0 Die Beschriftung des Symbols, welche im Auswahlmenü dargestellt wird. Ggü. der id muss hier nicht die id aus der Sprachdatei sondern der gesamte Pfad (`modules.tools.draw.iconList` + id) angegeben werden.|false|
|type|ja|enum["image", "simple_point"]||Typ des zu zeichnenden Objektes.Bei `image` wird ein Bild gezeichnet, welches dem PNG-Bild oder der svg-Datei des Pfades aus `value` entspricht. Diese Bilder werden standardmäßig im Verzeichnis `/img/tools/draw/` abgelegt und sollten eine Seitenlänge von 96px für eine korrekte Skalierung aufweisen, alternativ kann ein scale-Faktor angegeben werden. Bei `simple_point` wird ein normaler Punkt gezeichnet.|false|
|scale|nein|number||Skalierungsfaktor|false|
|value|ja|String||Wert, des zu zeichnenden Objektes. Wenn ohne Pfad oder Url, dann wird der Eintrag aus der config.js - `wfsImgPath` als Dateiort angenommen.|false|

**Beispiele**

```
#!json
    {
        "id": "iconPoint",
        "type": "simple_point",
        "value": "simple_point"
    },
    {
        "id": "iconMeadow",
        "type": "image",
        "scale": 0.8,
        "value": "wiese.png"
    },
    {
        "id": "gelber Pin",
        "type": "image",
        "scale": 0.5,
        "value": "https://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png"
    },
```

***


#### Portalconfig.menu.tool.draw.drawSymbolSet

Objekt zum Ändern des konfigurierten Default-Wertes des Punkt-Symbols im Zeichen-Tool.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|color|ja|Number[]|[55, 126, 184, 1]|Die voreingestellte Farbe des Symbols als RGB color array mit Alpha-Kanal, wenn es sich um einen Punkt handelt.|false|
|opacity|ja|Number|1|Die voreingestellte Transparenz des Symbols in einer Range [0..1], wenn es sich um einen Punkt handelt.|false|


**Beispiel**

```
#!json
    {
        color: [55, 126, 184, 1],
        opacity: 1
    }
```

***

#### Portalconfig.menu.tool.draw.drawLineSet

Objekt zum Ändern des konfigurierten Default-Wertes für eine Linie im Zeichen-Tool.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|strokeWidth|ja|Number|1|Die voreingestellte Strichstärke (Dicke) der Linie in Pixel.|false|
|colorContour|ja|Number[]|[0, 0, 0, 1]|Die voreingestellte Farbe der Linie als RGB color array mit Alpha-Kanal.|false|
|opacityContour|ja|Number|1|Die voreingestellte Transparenz der Linie in einer Range [0..1].|false|

**Beispiel**

```
#!json
    {
        strokeWidth: 1,
        opacityContour: 1,
        colorContour: [0, 0, 0, 1]
    }
```

***

#### Portalconfig.menu.tool.draw.drawCurveSet

Objekt zum Ändern des konfigurierten Default-Wertes für eine Freihandlinie im Zeichen-Tool.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|strokeWidth|ja|Number|1|Die voreingestellte Strichstärke (Dicke) der Freihandlinie in Pixel.|false|
|colorContour|ja|Number[]|[0, 0, 0, 1]|Die voreingestellte Farbe der Freihandlinie als RGB color array mit Alpha-Kanal.|false|
|opacityContour|ja|Number|1|Die voreingestellte Transparenz der Freihandlinie in einer Range [0..1].|false|

**Beispiel**

```
#!json
    {
        strokeWidth: 1,
        opacityContour: 1,
        colorContour: [0, 0, 0, 1]
    }
```

***

#### Portalconfig.menu.tool.draw.drawAreaSet

Objekt zum Ändern des konfigurierten Default-Wertes für eine Fläche im Zeichen-Tool.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|strokeWidth|ja|Number|1|Die voreingestellte Strichstärke (Dicke) des Randes der Fläche in Pixel.|false|
|color|ja|Number[]|[55, 126, 184, 1]|Die voreingestellte Farbe der Fläche als RGB color array mit Alpha-Kanal.|false|
|opacity|ja|Number|1|Die voreingestellte Transparenz der Fläche in einer Range [0..1].|false|
|colorContour|ja|Number[]|[0, 0, 0, 1]|Die voreingestellte Rand-Farbe der Fläche als RGB color array mit Alpha-Kanal.|false|
|opacityContour|ja|Number|1|Die voreingestellte Transparenz der Rand-Farbe der Fläche in einer Range [0..1].|false|

**Beispiel**

```
#!json
    {
        strokeWidth: 1,
        color: [55, 126, 184, 1],
        opacity: 1,
        colorContour: [0, 0, 0, 1],
        opacityContour: 1
    }
```

***

#### Portalconfig.menu.tool.draw.drawCircleSet

Objekt zum Ändern des konfigurierten Default-Wertes für einen Kreis im Zeichen-Tool.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|circleMethod|ja|String|"interactive"|Die voreingestellte Methode wie der Kreis gezogen werden soll. "interactive": Freihand, "defined": mit Angabe fixer Werte|false|
|unit|ja|String|"m"|Die voreingestellte Maßeinheit mit der der Durchmesser des Kreises unter der circleMethod "defined" berechnet werden soll.|false|
|circleRadius|ja|Number|0|Der voreingestellte Durchmesser des Kreises bezogen auf die Unit unter der circleMethod "defined".|false|
|strokeWidth|ja|Number|1|Die voreingestellte Strichstärke (Dicke) des Randes des Kreises in Pixel.|false|
|color|ja|Number[]|[55, 126, 184, 1]|Die voreingestellte Farbe des Kreises als RGB color array mit Alpha-Kanal.|false|
|opacity|ja|Number|1|Die voreingestellte Transparenz des Kreises in einer Range [0..1].|false|
|colorContour|ja|Number[]|[0, 0, 0, 1]|Die voreingestellte Rand-Farbe des Kreises als RGB color array mit Alpha-Kanal.|false|
|opacityContour|ja|Number|1|Die voreingestellte Transparenz der Rand-Farbe des Kreises in einer Range [0..1].|false|
|tooltipStyle|nein|String|{}|Die voreingestellte Style des Tooltips|false|

**Beispiel**

```
#!json
    {
        circleMethod: "interactive",
        unit: "m",
        circleRadius: 0,
        strokeWidth: 1,
        color: [55, 126, 184, 1],
        opacity: 1,
        colorContour: [0, 0, 0, 1],
        opacityContour: 1
    }
```

***

#### Portalconfig.menu.tool.draw.drawDoubleCircleSet

Objekt zum Ändern des konfigurierten Default-Wertes für einen Doppelkreis im Zeichen-Tool.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|circleMethod|ja|String|"defined"|Die voreingestellte Methode wie der Doppelkreis gezogen werden soll. "interactive": Freihand, "defined": mit Angabe fixer Werte|false|
|unit|ja|String|"m"|Die voreingestellte Maßeinheit mit der der Durchmesser des Doppelkreises unter der circleMethod "defined" berechnet werden soll.|false|
|circleRadius|ja|Number|0|Der voreingestellte Durchmesser des inneren Ringes des Doppelkreises bezogen auf die Unit unter der circleMethod "defined".|false|
|circleOuterRadius|ja|Number|0|Der voreingestellte Durchmesser des äußeren Ringes des Doppelkreises bezogen auf die Unit unter der circleMethod "defined".|false|
|strokeWidth|ja|Number|1|Die voreingestellte Strichstärke (Dicke) des Randes des Doppelkreises in Pixel.|false|
|color|ja|Number[]|[55, 126, 184, 1]|Die voreingestellte Farbe des Doppelkreises als RGB color array mit Alpha-Kanal.|false|
|opacity|ja|Number|1|Die voreingestellte Transparenz des Doppelkreises in einer Range [0..1].|false|
|colorContour|ja|Number[]|[0, 0, 0, 1]|Die voreingestellte innere Ring-Farbe des Doppelkreises als RGB color array mit Alpha-Kanal.|false|
|outerColorContour|ja|Number[]|[0, 0, 0, 1]|Die voreingestellte äußere Ring-Farbe des Doppelkreises als RGB color array mit Alpha-Kanal.|false|
|opacityContour|ja|Number|1|Die voreingestellte Transparenz der Rand-Farbe des Doppelkreises in einer Range [0..1].|false|

**Beispiel**

```
#!json
    {
        circleMethod: "defined",
        unit: "m",
        circleRadius: 0,
        circleOuterRadius: 0,
        strokeWidth: 1,
        color: [55, 126, 184, 1],
        opacity: 1,
        colorContour: [0, 0, 0, 1],
        opacityContour: 1
    }
```

***

#### Portalconfig.menu.tool.draw.writeTextSet

Objekt zum Ändern des konfigurierten Default-Wertes für einen Text im Zeichen-Tool.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|text|ja|String|""|Der voreingestellte Text.|false|
|fontSize|ja|Number|10|Die voreingestellte Schriftgröße.|false|
|font|ja|String|"Arial"|Die voreingestellte Schriftart (beschränkt auf "Arial", "Calibri" oder "Times New Roman").|false|
|color|ja|Number[]|[55, 126, 184, 1]|Die voreingestellte Farbe der Fläche als RGB color array mit Alpha-Kanal.|false|
|opacity|ja|Number|1|Die voreingestellte Transparenz der Fläche in einer Range [0..1].|false|

**Beispiel**

```
#!json
    {
        text: "",
        fontSize: 10,
        font: "Arial",
        color: [55, 126, 184, 1],
        opacity: 1
    }
```

***

#### Portalconfig.menu.tool.draw.download

Objekt zum Ändern des voreingestellten Formats beim Herunterladen einer Zeichnung. Das ist eins von "KML", "GPX", "GEOJSON".

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|--------|----|-------|-----------|------|
|preSelectedFormat|nein|String|"KML"|Die voreingestellte pre-selected form.|false|

**Example**

```json
{
    "preSelectedFormat": "KML"
}
```

***

#### Portalconfig.menu.tool.featureLister

[inherits]: # (Portalconfig.menu.tool)

Modul, das Vektor Features darstellt. Durch Hovern über ein Feature in der Liste wird auf der Karte das Feature hervorgehoben.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|maxFeatures|nein|Integer|20|Anzahl der zu zeigenden Features. Über einen Button können weitere Features in dieser Anzahl zugeladen werden.|false|
|highlightVectorRulesPolygon|nein|**[highlightVectorRulesPolygon](#markdown-header-portalconfigmenutoolfeaturelisterhighlightvectorrulespolygon)**||Angabe der Füllfarbe und der Umriss-Farbe und -Strichstärke für das Hervorheben der Polygon-Features.|false|
|highlightVectorRulesPointLine|nein|**[highlightVectorRulesPointLine](#markdown-header-portalconfigmenutoolfeaturelisterhighlightvectorrulespointline)**||Angabe der Umriss-Farbe und -Strichstärke für das Hervorheben von Linien und Skalierungsfaktor für das Hervorheben von Punkten.|false|

**Beispiel**

```json
"featureLister": {
    "name": "Liste",
    "glyphicon": "glyphicon-menu-hamburger",
    "maxFeatures": 10,
    "highlightVectorRulesPolygon": {
        "fill": {
            "color": [255, 0, 255, 0.9]
        },
        "stroke": {
            "width": 4,
            "color": [0, 0, 204, 0.9]
        }
    },
    "highlightVectorRulesPointLine": {
        "stroke": {
            "width": 8,
            "color": [255, 0, 255, 0.9]
        },
        "image": {
            "scale": 2
        }
    }
}
```
***

##### Portalconfig.menu.tool.featureLister.highlightVectorRulesPolygon

Angabe der Umriss-Farbe und -Strichstärke für das Hervorheben von Linien und Skalierungsfaktor für das Hervorheben von Punkten.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|fill|nein|**[fill](#markdown-header-portalconfigmenutoolfeaturelisterhighlightvectorrulespolygonfill)**||Mögliche Einstellung: color|false|
|stroke|nein|**[stroke](#markdown-header-portalconfigmenutoolfeaturelisterhighlightvectorrulespolygonstroke)**||Mögliche Einstellung: width|false|

***

##### Portalconfig.menu.tool.featureLister.highlightVectorRulesPolygon.fill
|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|color|nein|Float[]|[255, 255, 255, 0.5]|Mögliche Einstellung: color (RGBA)|false|

```json
"fill": { "color": [215, 102, 41, 0.9] }
```

***

##### Portalconfig.menu.tool.featureLister.highlightVectorRulesPolygon.stroke
|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|width|nein|Integer|1|Mögliche Einstellung: width|false|
|color|nein|Float[]|[255, 255, 255, 0.5]|Mögliche Einstellung: color (RGBA)|false|

```json
"stroke": { "width": 4 , "color": [255, 0, 255, 0.9]}
```

***


##### Portalconfig.menu.tool.featureLister.highlightVectorRulesPointLine

Angabe der Umriss-Farbe und -Strichstärke für das Hervorheben von Linien und Skalierungsfaktor für das Hervorheben von Punkten.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|stroke|nein|**[stroke](#markdown-header-portalconfigmenutoolfeaturelisterhighlightvectorrulespointlinestroke)**||Mögliche Einstellung: width|false|
|image|nein|**[image](#markdown-header-portalconfigmenutoolfeaturelisterhighlightvectorrulespointlineimage)**||Mögliche Einstellung: scale|false|

***

##### Portalconfig.menu.tool.featureLister.highlightVectorRulesPointLine.stroke
|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|width|nein|Integer|1|Mögliche Einstellung: width|false|
|color|nein|Float[]|[255, 255, 255, 0.5]|Mögliche Einstellung: color (RGBA)|false|

```json
"stroke": { "width": 4 , "color": [255, 0, 255, 0.9]}
```

***

##### Portalconfig.menu.tool.featureLister.highlightVectorRulesPointLine.image
|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|scale|nein|Integer|1.5|Mögliche Einstellung: scale|false|

```json
"image": { "scale": 2}
```

***

##### Portalconfig.menu.tool.gfi.highlightVectorRules.text
|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|scale|nein|Float|1|Mögliche Einstellung: scale|false|

```json
"text": { "scale": 2 }
```

***

#### Portalconfig.menu.tool.measure

[inherits]: # (Portalconfig.menu.tool)

Mit dem Messwerkzeug können Strecken und Flächen gemessen werden. Dabei werden auch die Messungenauigkeiten mit angegeben.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|earthRadius|nein|Number|6378137|Erdradius in Metern. Bitte beachten Sie, dass der Erdradius in Abhängigkeit zum Bezugsellipsoiden gewählt werden sollte. Für ETRS89 (EPSG:25832) ist dies beispielsweise GRS80.|false|
|measurementAccuracy|nein|String|"meter"|Gibt an, wie genau das Messergebnis für m und m² angezeigt wird. Die möglichen Optionen sind "decimeter" für eine Nachkommastelle. "meter" für keine Nachkommastelle. Und "dynamic" für eine Nachkommastelle bei Ergebnissen kleiner als 10m / 10m² und keine Nachkommastelle für Ergebnisse größer oder gleich 10m / 10m².|false|

**Beispiel**

```
#!json
"measure": {
    "name": "translate#common:menu.tools.measure",
    "earthRadius": 6378137,
    "measurementAccuracy": "dynamic"
},
```

#### Portalconfig.menu.tool.contact

[inherits]: # (Portalconfig.menu.tool)

Werkzeug, wodurch der Nutzer/die Nutzerin mit einem definierten Postfach Kontakt aufnehmen kann.

**ACHTUNG: Backend notwendig!**

**Das Contact kommuniziert mit einem SMTP-Server und ruft dort die sendmail.php auf.**

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|serviceId|ja|String||Id des E-Mail-Dienstes der verwendet werden soll. Wird aus der **[rest-services.json](rest-services.json.md)** bezogen.|false|
|serviceID|nein|String||_Deprecated im nächsten Major Release. Bitte nutzen Sie stattdessen **serviceId**._ Id des E-Mail-Dienstes der verwendet werden soll. Wird aus der **[rest-services.json](rest-services.json.md)** bezogen.|false|
|from|ja|**[email](#markdown-header-portalconfigmenutoolcontactemail)**[]||Absender der E-Mail. Bitte den **[Hinweis zur E-Mail-Sicherheit](#markdown-header-hinweis-zur-e-mail-sicherheit)** beachten.|false|
|to|ja|**[email](#markdown-header-portalconfigmenutoolcontactemail)**[]||Adressat der E-Mail. Bitte den **[Hinweis zur E-Mail-Sicherheit](#markdown-header-hinweis-zur-e-mail-sicherheit)** beachten.|false|
|closeAfterSend|nein|Boolean|false|Flag, ob das Kontaktfenster nach erfolgreichem Versenden einer Nachricht geschlossen werden soll.|false|
|contactInfo|nein|String||Weitere Informationen, welche oberhalb des Kontaktformulars angezeigt werden würden.|false|
|deleteAfterSend|nein|Boolean|false|Flag, ob der Inhalt des Kontaktfensters nach erfolgreichem Versenden der Nachricht gelöscht werden soll.|false|
|includeSystemInfo|nein|Boolean|false|Flag, ob Systeminformationen des Absenders mitgeschickt werden sollen.|false|
|locationOfCustomerService|nein|String|"de"|Land, in welchem sich der Kundensupport befindet. Wird verwendet für das Datum innerhalb der ticketId.|false|
|maxLines|nein|Number|5|Anzahl der Zeilen (Höhe) des Textbereiches des Formulars.|false|
|showPrivacyPolicy|nein|Boolean|false|Flag, ob eine Checkbox angezeigt werden soll, um der Datenschutzerklärung zuzustimmen.|false|
|privacyPolicyLink|nein|String|"https://www.masterportal.org/datenschutz.html"|Link zur Datenschutzerklärung. Sollte gesetzt werden, wenn `showPrivacyPolicy` true ist.|false|
|subject|nein|String||Der Betreff, welcher für die E-Mail verwendet wird.|false|
|withTicketNo|nein|Boolean|true|Flag, ob bei erfolgreichem Versand der Anfrage eine Ticketnummer zurückgegeben werden soll.|false|

**Beispiel**

```json
{
    "contact": {
        "name": "common:menu.contact",
        "glyphicon": "glyphicon-envelope",
        "serviceId": "123",
        "from": [
            {
                "email": "lgvgeoportal-hilfe@gv.hamburg.de",
                "name": "LGVGeoportalHilfe"
            }
        ],
        "to": [
            {
                "email": "lgvgeoportal-hilfe@gv.hamburg.de",
                "name": "LGVGeoportalHilfe"
            }
        ],
        "includeSystemInfo": true,
        "closeAfterSend": true,
        "deleteAfterSend": true,
        "withTicketNo": false
    }
}
```

>Hinweis zur E-Mail-Sicherheit

Von der ungeprüften Übernahme von *Sender (FROM)*, *Empfänger (TO)*, *Kopie (CC)* und *Blindkopie (BCC)* durch den SMTP-Server wird hiermit aus Sicherheitsgründen **ausdrücklich abgeraten**.
Vor der ungeprüften Übernahme durch den SMTP-Server der Kunden-Email als *Antwort an* (REPLY-TO) wird gewarnt.

Wir empfehlen dringend *FROM* und *TO* am SMTP-Server manuell fest einzustellen, ohne eine Möglichkeit zur externen Konfiguration anzubieten.

>Aus Sicherheitsgründen darf der vom Masterportal an den SMTP-Server geschickte *Sender (FROM)* und der *Empfänger (TO)* nicht ungeprüft vom SMTP-Server als FROM und TO für die Email verwendet werden. Ansonsten entsteht eine Lücke über die Schad-Mails mit manipuliertem FROM und TO über den SMTP-Server versendet werden. Sollte dennoch eine Konfiguration im Masterportal gewünscht sein (siehe Beispiel oben), können die Parameter *from* und *to* unter dem Vorbehalt verwendet werden, dass *from* und *to* am SMTP-Server gegen eine **Whitelist** mit erlaubten Email-Adressen geprüft und das Versenden einer Email im Falle der Angabe inkorrekter Email-Adressen unterbunden wird.

Wir empfehlen auf das automatische Setzen in *CC* (bzw. *BCC*) der Email-Adresse des Kunden zu verzichten.

>Aus Sicherheitsgründen darf der Kunde nicht automatisch als *Kopie (CC)* oder *Blindkopie (BCC)* der Email gesetzt werden. Ein solcher Automatismus wird missbraucht um durch Angabe einer Fremd-Email-Adresse Schad-Mails über den SMTP-Server zu versenden.

Wir empfehlen dringend *CC* und *BCC* am SMTP-Server manuell zu nullen.

>Es darf keine Möglichkeit geben *Kopie (CC)* oder *Blindkopie (BCC)* über das Masterportal einzustellen. Ein solches Feature wird zum Versenden von Schad-Mails über den SMTP-Server missbraucht.

Wir warnen vor der automatischen Einstellung der Kunden-Mail als *REPLY-TO*.

>Die ungeprüfte Übernahme von Daten in den Email-Header ist je nach Sicherheitsstand (bzw. Alter) des SMTP-Servers mit dem Risiko verbunden, dass im einfachsten Fall durch Injektion von *Carriage Return* und *Line Feed* in z.B. *REPLY-TO* aus der Email-Header-Zeile ausgebrochen und der Email-Header selbst manipuliert wird (Beispiel: "test@example.com\r\nBCC:target1@example.com,target2@example.com,(...),target(n)@example.com"). In einem abstrakteren Fall sind auch UTF-Attacken denkbar, bei der eigentlich harmlose UTF-16- oder UTF-32-Zeichen durch Interpretation als ANSI oder UTF-8 zu Verhaltensänderungen des Email-Headers mit einem ähnlichen Ergebnis führen.

***

#### Portalconfig.menu.tool.contact.email

E-Mail Objekt bestehend aus der E-Mail und dem Anzeigenamen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|email|nein|String||Email.|false|
|name|nein|String||Anzeigename.|false|

**Beispiel**

```json
{
    "email": "lgvgeoportal-hilfe@gv.hamburg.de",
    "name":"LGVGeoportalHilfe"
}
```

***

#### Portalconfig.menu.tool.layerClusterToggler

[inherits]: # (Portalconfig.menu.tool)

Werkzeug zum gleichzeitigen Aktivieren/Deaktivieren von Layer Clustern.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|--------|----|-------|-----------|------|
|name|ja|String|"additional:addons.menu.tools.layerClusterToggler.name"|Der Name des Tools.|false|
|glyphicon|ja|String|"glyphicon-education"|Verwendetes Glyphicon im Werkzeug-Menü.|false|
|clusterList|ja|**[clusterList](#markdown-header-portalconfigmenutoollayerClusterTogglerclusterList)**[]|[]|Array der Layer-IDs (als Strings oder als Objekte).|false|

**Beispiel**

```json
{
    "layerClusterToggler": {
        "name": "translate#additional:addons.menu.tools.layerClusterToggler.name",
        "glyphicon": "glyphicon-education",
        "clusterList": ["8712", "21067"]
    }
}
```

***

#### Portalconfig.menu.tool.layerClusterToggler.clusterList

[inherits]: # (Portalconfig.menu.tool)

Die Liste der Layer-IDs die im Cluster aktiviert/deaktiviert werden sollen.
Dies können die Layer-IDs als Strings sein, oder als Objekt wenn die Suffix-Technik für ein Layer verwendet wird.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|--------|----|-------|-----------|------|
|layerId|ja|String||Id des Dienstes, der im Portal angezeigt werden soll. ACHTUNG: Diese LayerId muss auch in der Themenconfig konfiguriert sein.|false|
|suffix|ja|String||Suffix des Layers. Dieser Suffix muss auch in der Themenconfig konfiguriert sein.|false|

**Example**

```json
{
    "layerClusterToggler": {
        "name": "translate#additional:addons.menu.tools.layerClusterToggler.name",
        "glyphicon": "glyphicon-education",
        "clusterList": [
            "8712",
            "8713",
            {
                "layerId": "21067",
                "suffix": "90012"
            },
            {
                "layerId": "21067",
                "suffix": "90013"
            },
            {
                "layerId": "21067",
                "suffix": "90014"
            },
            {
                "layerId": "21067",
                "suffix": "90015"
            }
        ]
    }
}
```

***

#### Portalconfig.menu.tool.layerSlider

[inherits]: # (Portalconfig.menu.tool)

Der Layerslider ist ein Werkzeug um verschiedene Layer in der Anwendung hintereinander an bzw. auszuschalten. Dadurch kann z.B. eine Zeitreihe verschiedener Zustände animiert werden.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|title|nein|String|"common:modules.tools.layerSlider.title"|Titel der im Werkzeug vorkommt.|false|
|timeInterval|nein|Integer|2000|Zeitintervall in ms bis der nächste Layer angeschaltet wird.|false|
|layerIds|ja|**[layerId](#markdown-header-portalconfigmenutoollayersliderlayerid)**[]|[]|Array von Objekten aus denen die Layerinformationen herangezogen werden.|false|
|sliderType|nein|enum["player","handle"]|"player"|Typ des Layer sliders. Entweder als "player" mit Start/Pause/Stop-Buttons oder als "handle" mit einem Hebel. Bei "handle" wird die Transparenz der Layer zusätzlich mit angepasst.|false|

**Beispiel**
```
#!json
"layerSlider": {
    "name": "Zeitreihe",
    "glyphicon": "glyphicon-film",
    "title": "Simulation von Beispiel-WMS",
    "sliderType": "player",
    "timeInterval": 2000,
    "layerIds": [
        {
            "title": "Dienst 1",
            "layerId": "123"
        },
        {
            "title": "Dienst 2",
            "layerId": "456"
        },
        {
            "title": "Dienst 3",
            "layerId": "789"
        }
    ]
}
```

***

#### Portalconfig.menu.tool.layerSlider.layerId

Definiert einen Layer für den Layerslider.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|title|ja|String||Name des Diestes, wie er im Portal angezeigt werden soll.|false|
|layerId|ja|String||Id des Diestes, der im Portal angezeigt werden soll. ACHTUNG: Diese LayerId muss auch in der Themenconfig konfiguriert sein!|false|

**Beispiel**
```
#!json
{
    "title": "Dienst 1",
    "layerId": "123"
}
```

***

#### Portalconfig.menu.tool.virtualcity

[inherits]: # (Portalconfig.menu.tool)

Das virtualcity Tool bietet die Möglichkeit die Planungen von einem virtualcityPLANNER Dienst im Masterportal anzuzeigen.
Die Planungen müssen im virtualcityPLANNER auf öffentlich gesetzt sein, dann können sie über dieses Tool angezeigt werden.


|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|serviceId|ja|String||Id des services. Wird aufgelöst in der **[rest-services.json](rest-services.json.de.md)**.|
|useProxy|nein|Boolean|false|Deprecated im nächsten Major-Release, da von der GDI-DE empfohlen wird einen CORS-Header einzurichten. Gibt an, ob die URL des Dienstes über einen Proxy angefragt werden soll, dabei werden die Punkte in der URL durch Unterstriche ersetzt.|false|

**Beispiel**
```
#!json
{
  "title": "virtualcityPLANNER",
  "serviceId": "1"
}
```


#### Portalconfig.menu.tool.shadow

[inherits]: # (Portalconfig.menu.tool)

Das ShadowTool bietet eine Oberfläche zur Definition einer Zeitangabe. Über Slider und Datepicker können Zeitangaben in einem 30-Minuten Raster angegeben werden. Die ausgewählte Zeitangabe dient dem Rendern der Schatten aller 3D-Objekte im 3D-Modus, indem der Sonnenstand simuliert wird. Durch Ziehen des Sliders oder Auswahl eines neuen Datums wird unmittelbar ein neuer Sonnenstand simuliert. Per default startet das Tool mit der aktuellen Zeitangabe, die über Parameter überschrieben werden kann.


|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|shadowTime|nein|**[shadowTime](#markdown-header-portalconfigmenutoolshadowshadowtime)**||Default-Zeitangabe, mit der das ShadowTool startet. Erkennt "month", "day", "hour", "minute"|
|isShadowEnabled|nein|Boolean|false|Default Shadow-Wert. True um unmittelbar Shadow einzuschalten. False zum manuellen Bestätigen.|


**Beispiel**
```
#!json
{
    "shadowTime": {
        "month": "6",
        "day": "20",
        "hour": "13",
        "minute": "0"
    },
    "isShadowEnabled": true
}
```

***

#### Portalconfig.menu.tool.shadow.shadowTime

Todo

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|month|nein|String||month|
|day|nein|String||day|
|hour|nein|String||hour|
|minute|nein|String||minute|

**Beispiel**
```
#!json
{
    "month": "6",
    "day": "20",
    "hour": "13",
    "minute": "0"
}
```

***

#### Portalconfig.menu.tool.styleWMS

[inherits]: # (Portalconfig.menu.tool)

Klassifizierung von WMS Diensten. Dieses Tool findet Verwendung im Pendlerportal der MRH(Metropolregion Hamburg). Über eine Maske können Klassifizierungen definiert werden. An den GetMap-Request wird nun ein SLD-Body angehängt, der dem Server einen neuen Style zum Rendern definiert. Der WMS-Dienst liefert nun die Daten in den definierten Klassifizierungen und Farben.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|useProxy|nein|Boolean|false|Deprecated im nächsten Major-Release, da von der GDI-DE empfohlen wird einen CORS-Header einzurichten. Gibt an, ob die URL des Dienstes über einen Proxy angefragt werden soll, dabei werden die Punkte in der URL durch Unterstriche ersetzt.|false|

***

#### Portalconfig.menu.tool.wfsSearch

[inherits]: # (Portalconfig.menu.tool)

Ermöglicht es ein Formular zu erstellen, um einen WFS Layer abgekoppelt von der Suchleiste mittels Filter anzufragen.
Wenn ein WFS@2.0.0 verwendet werden soll, wird erwartet, dass eine gespeicherte Anfrage (Stored Query) verwendet wird. Wenn ein WFS@1.1.0 verwendet werden soll, wird erwartet, dass der Aufbau der Anfrage mittels der Konfiguration dieses Werkzeugs grundlegend vorgegeben wird.

Es können mehrere Formulare (**[SearchInstances](#markdown-header-portalconfigmenutoolwfssearchsearchinstance)**) definiert werden, welche durch ein Dropdown Menü im Werkzeug ausgewählt werden können.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|instances|ja|**[searchInstance](#markdown-header-portalconfigmenutoolwfssearchsearchinstance)**[]||Array an `searchInstances`, welche jeweils ein Formular darstellen.|false|
|zoomLevel|nein|Number|5|Gibt an, auf welches ZoomLevel gezoomt werden soll. Sollte das Feature nicht in die Zoomstufe passen, wird automatisch eine passende Zoomstufe gewählt.|false|
|resultsPerPage|nein|Number|0|In der Suchergebnisliste werden höchstens so viele Ergebnisse zugleich angezeigt. Wird diese Anzahl überschritten, bietet die Ergebnisliste eine nächste Ergebnisseite an. 0 bedeutet alle auf einer Seite zugleich anzuzeigen.|false|

**Beispiel**

```json
{
    "wfsSearch": {
        "instances": [
            {
                "requestConfig": {
                    "layerId": "1234"
                },
                "selectSource": "https://geoportal-hamburg.de/lgv-config/gemarkungen_hh.json",
                "literals": [
                    {
                        "clause": {
                            "type": "and",
                            "literals": [
                                {
                                    "field": {
                                        "type": "equal",
                                        "fieldName": "gemarkung",
                                        "inputLabel": "Gemarkung",
                                        "options": ""
                                    }
                                },
                                {
                                    "field": {
                                        "type": "equal",
                                        "fieldName": "flur",
                                        "inputLabel": "Flur",
                                        "options": "flur"
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        ]
    }
}
```

***

#### Portalconfig.menu.tool.wfsSearch.searchInstance

Eine Instanz der WFS Suche, welche durch ein Dropdown Menü im Werkzeug ausgewählt werden kann.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|literals|ja|**[literal](#markdown-header-portalconfigmenutoolwfssearchsearchinstanceliteral)**[]||Array an `literals`.|true|
|requestConfig|ja|**[requestConfig](#markdown-header-portalconfigmenutoolwfssearchsearchinstancerequestconfig)**||Ein Objekt, welches hauptsächlich die Id des WFS-Dienstes (`layerId` oder `restLayerId`), welcher angefragt werden soll, beinhaltet. Wenn ein WFS@2.0.0 verwendet werden soll, muss die id der gespeicherten Anfrage (Stored Query, `storedQueryId`) angegeben werden. Zudem können weitere Einstellungen hinsichtlich der Anfragen hier hinzugefügt werden.|false|
|selectSource|nein|String||Optionale Url, unter welcher eine JSON-Datei mit den verschiedenen Optionen für den Input gespeichert ist. Für eine Beispiel siehe **[https://geoportal-hamburg.de/lgv-config/gemarkungen_hh.json]**.|false|
|suggestions|nein|**[suggestions](#markdown-header-portalconfigmenutoolwfssearchsearchinstancesuggestions)**||Wenn gegeben, dann wird der Service angefragt, wenn ein Nutzer etwas in ein Eingabefeld eingibt, um einen Vorschlag für die weitere Eingabe zu geben.|false|
|title|ja|String||Der Titel der Suche, welcher in einem Dropdown im Werkzeug dargestellt wird. Kann ein Übersetzungsschlüssel sein.|false|
|userHelp|nein|String||Informationstext hinsichtlich des Suchformulars, welches oberhalb des Formulars für den Nutzer angezeigt werden soll. Wenn der Parameter nicht gegeben ist, dann wird die Struktur aus der Konfiguration abgeleitet. Kann ein Übersetzungsschlüssel sein. Falls der Wert explizit auf `hide` gesetzt wurde, dann wird keine Beschreibung der Struktur des Formulars angezeigt.|false|
|resultDialogTitle|nein|String||Überschrift der Ergebnisliste. Wenn dies nicht konfiguriert ist, wird der Name `WFS Suche` angezeigt. Kann ein Übersetzungsschlüssel sein.|false|
|resultList|ja|**[resultList](#markdown-header-portalconfigmenutoolwfssearchsearchinstanceresultlist)**||Einstellungen für die Ausgabe der gefundenen Feature in der Ergebnisliste.|true|

**Beispiel**

```json
{
    "requestConfig": {
        "layerId": "1234"
    },
    "resultList": {
        "schulname": "Schulname",
        "abschluss": "Abschluss"
    },
    "selectSource": "https://geoportal-hamburg.de/lgv-config/gemarkungen_hh.json",
    "title": "Flurstücksuche",
    "literals": [
        {
            "clause": {
                "type": "and",
                "literals": [
                    {
                        "field": {
                            "type": "equal",
                            "fieldName": "gemarkung",
                            "inputLabel": "Gemarkung",
                            "options": ""
                        }
                    },
                    {
                        "field": {
                            "type": "equal",
                            "fieldName": "flur",
                            "inputLabel": "Flur",
                            "options": "flur"
                        }
                    }
                ]
            }
        }
    ]
}
```

***

#### Portalconfig.menu.tool.wfsSearch.searchInstance.literal

Ein Literal (`literal`) kann entweder eine Klausel (`clause`) als Parameter besitzen oder ein Feld (`field`). Falls beide gesetzt sind, dann wird der `clause`-Teil ignoriert.
Zu beachten ist jedoch, dass ein Feld innerhalb einer Klausel verpackt sein muss (wie in den meisten Beispielen zu sehen).

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|clause|ja|**[clause](#markdown-header-portalconfigmenutoolwfssearchsearchinstanceliteralclause)**||Definiert die Art und Weise wie mehrere `literals` miteinander angefragt werden sollen. Kann als Gruppe von `literals` angesehen werden.|true|
|field|nein|**[field](#markdown-header-portalconfigmenutoolwfssearchsearchinstanceliteralfield)**||Repräsentation eines Auswahlfeldes für einen Servicewert für den Nutzer.|true|

**Beispiele**

```json
{
    "clause": {
        "type": "and",
        "literals": [
            {
                "field": {
                    "type": "equal",
                    "fieldName": "gemarkung",
                    "inputLabel": "Gemarkung",
                    "options": ""
                }
            },
            {
                "field": {
                    "type": "equal",
                    "fieldName": "flur",
                    "inputLabel": "Flur",
                    "options": "flur"
                }
            }
        ]
    }
}
```

```json
{
    "field": {
        "type": "equal",
        "fieldName": "rivers",
        "inputLabel": "Flüsse",
        "options": [
            {
                "id": "0",
                "displayName": "Elbe"
            },
            {
                "id": "1",
                "displayName": "Moselle"
            },
            {
                "id": "2",
                "displayName": "Rhine"
            }
        ]
    }
}
```

***

#### Portalconfig.menu.tool.wfsSearch.searchInstance.literal.clause

[type:literal]: # (Portalconfig.menu.tool.wfsSearch.searchInstance.literal)

Eine Klausel (`clause`) definiert die Art und Weise wie verschiedene `literals` miteinander anzufragen sind.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|literals|ja|**[literal](#markdown-header-portalconfigmenutoolwfssearchsearchinstanceliteral)**[]||Array an `literals`.|true|
|type|ja|enum["and", "or"]||Die Art und Weise wie die `literals` dieser `clause` angefragt werden sollen.|false|

**Beispiel**

```json
{
    "clause": {
        "type": "and",
        "literals": [
            {
                "field": {
                    "type": "equal",
                    "fieldName": "gemarkung",
                    "inputLabel": "Gemarkung",
                    "options": ""
                }
            },
            {
                "field": {
                    "type": "equal",
                    "fieldName": "flur",
                    "inputLabel": "Flur",
                    "options": "flur"
                }
            }
        ]
    }
}
```

***

#### Portalconfig.menu.tool.wfsSearch.searchInstance.literal.field

Ein `field` repräsentiert ein Auswahlfeld für einen Wert des Services.

Es ist möglich ein Feld für mehrere Suchparameter des Dienstes zu verwenden. Um dies zu ermöglichen, muss für jeden Parameter ein Array verwendet werden, wobei jedes Element zu einem einzelnen Wert des Dienstes gehört.
Eine Konfiguration wie

```json
{
    "field": {
        "type": ["equal", "like"],
        "fieldName": ["flst", "gmkr"],
        "inputLabel": ["Flurstück", "Gemarkungsnummer"]
    }
}
```

würde ein einzelnes `field` erstellen, in welchen der Nutzer sich entscheiden kann, ob er das Eingabefeld nutzen möchte, um nach einem `Flurstück` oder nach einer `Gemarkungsnummer` zu suchen, indem er den Wert in einem Dropdown Menü auswählt.

Falls der Parameter `options` gesetzt wurde, wird ein `select`-Feld, andernfalls ein normaler Text Input verwendet.
Falls `options` ein String ist, ist es wichtig, dass die Reihenfolge der Felder mit der Ordnung der Objekte der externen Quelle (`selectSource`) übereinstimmt.
Man nehme an, dass die Quelle wie folgt aussieht:

```json
{
    "one": {
        "foo": {
            "id": "foo_one",
            "bar": ["f1_bar_one", "f1_bar_two"]
        }
    },
    "two": {
        "foo": {
            "id": "foo_two",
            "bar": ["f2_bar_one", "f2_bar_two"]
        }
    }
}
```

In diesem Fall sollte die Reihenfolge in der Konfiguration wie folgt aussehen:

```json
{
    "clause": {
        "type": "and",
        "literals": [
            {
                "field": {
                    "type": "equal",
                    "fieldName": "objects",
                    "inputLabel": "Objekte",
                    "options": ""
                }
            },
            {
                "field": {
                    "type": "equal",
                    "fieldName": "foo",
                    "inputLabel": "Foo",
                    "options": "foo"
                }
            },
            {
                "field": {
                    "type": "equal",
                    "fieldName": "bar",
                    "inputLabel": "Bar",
                    "options": "foo.bar"
                }
            }
        ]
    }
}
```

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|defaultValue|nein|String/String[]||Wenn das Feld nicht `required` ist wird dieser Wert beim Senden verwendet.|false|
|fieldName|ja|String/String[]||Die Id des WFS Service Parameters für den Vergleich.|false|
|inputLabel|ja|String/String[]||Label des UI Elementes. Kann ein Übersetzungsschlüssel sein.|false|
|inputPlaceholder|nein|String/String[]||Platzhalter für das UI Element. Sollte Beispieldaten enthalten. Kann ein Übersetzungsschlüssel sein.|false|
|inputTitle|nein|String/String[]||Wert, welcher beim Hovern über das UI Element angezeigt wird. Kann ein Übersetzungsschlüssel sein.|false|
|required|nein|Boolean/Boolean[]|false|Legt fest, ob das Feld ausgefüllt werden muss.|false|
|options|nein|String/**[option](#markdown-header-portalconfigmenutoolwfssearchsearchinstanceliteralfieldoption)**[]/String[]||Falls `options` ein Array (egal ob an Strings oder **[options](#markdown-header-portalconfigmenutoolwfssearchsearchinstanceliteralfieldoption)**) ist werden die gegeben Werte für die Auswahl verwendet. Diese Optionen können entweder eine **[option](#markdown-header-portalconfigmenutoolwfssearchsearchinstanceliteralfieldoption)** oder einfache Werte (`String` / `Number`) sein. Im zweiten Fall werden die einfachen Werte sowohl für die Id als auch den `displayName` verwendet.  <br /> Falls `options` ein String ist, existieren verschiedene Möglichkeiten: <ul><li>Falls der String leer ist, werden die Schlüssel der **[selectSource](#markdown-header-portalconfigmenutoolwfssearchsearchinstance)** verwendet.</li><li>Falls der String nicht leer ist, wird angenommen, dass ein anderes Feld mit `options=""` existiert; andernfalls wird das Feld deaktiviert. Es wird zudem angenommen, dass der String ein Array in **[selectSource](#markdown-header-portalconfigmenutoolwfssearchsearchinstance)** mit weiteren Optionen repräsentiert.</li></ul> **Zu beachten**: Der Parameter `options` kann auch als multidimensionales Array **[option](#markdown-header-portalconfigmenutoolwfssearchsearchinstanceliteralfieldoption)**[][] angegeben werden, welches allerdings nicht für Masterportal Admin parametrisiert werden kann. Dies findet Anwendung, wenn ein **[option](#markdown-header-portalconfigmenutoolwfssearchsearchinstanceliteralfieldoption)**[] verwendet werden soll, jedoch mehrere Parameter in einem `field` hinterlegt werden sollen.|true|
|type|nein|enum["equal", "like"]/enum["equal", "like"][]||Wird für die Verwendung mit einem WFS@1.1.0 vorausgesetzt. Der `type` legt fest, wie das Feld mit dem Wert des Dienstes verglichen werden soll.|false|
|usesId|nein|Boolean/Boolean[]|false|Nur relevant, wenn der Parameter `options` gesetzt und ein leerer String (Rootelement) ist. Legt fest, ob der Schlüssel des Objektes aus der externen Quelle als Wert für die Query verwendet werden soll oder ob das Objekt eine Id gesetzt hat, welche stattdessen Anwendung finden soll.|false|

**Beispiel**

```json
{
    "field": {
        "type": "equal",
        "fieldName": "rivers",
        "inputLabel": "Flüsse",
        "options": [
            {
                "displayName": "Elbe",
                "fieldValue": "0"
            },
            {
                "displayName": "Mosel",
                "fieldValue": "1"
            },
            {
                "displayName": "Rhein",
                "fieldValue": "2"
            }
        ]
    }
}
```

***

#### Portalconfig.menu.tool.wfsSearch.searchInstance.literal.field.option

Eine auswählbare Option für einen anzufragenden Parameter.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|displayName|nein|String||Anzuzeigender Wert für die Option. Kann ein Übersetzungsschlüssel sein. Wenn der Wert wird nicht gesetzt ist, wird die `id` angezeigt.|false|
|fieldValue|ja|String||Wert, welcher an den Dienst gesendet werden soll.|false|

**Beispiel**

```json
{
    "fieldValue": "elbe",
    "displayName": "Elbe"
}
```

***

#### Portalconfig.menu.tool.wfsSearch.searchInstance.resultList

Einstellungen für die Ausgabe der gefundenen Feature in der Ergebnisliste.

Mit der Angabe von `showAll` werden alle Attribute der gefundenen Feature in ihrer Ursprungsform dargestellt.

Bei Verwendung eines Objektes können die darzustellenden Attribute festgelegt werden.
Ein Schlüssel des Objektes muss eines der Attribute des Features wiedergeben, während durch den entsprechenden Wert die textliche Ausgabe dieses Attributes festgelegt wird.

**Beispiele**:

```json
{
    "resultList": "showAll"
}
```

```json
{
    "resultList": {
        "schulname": "Schulname",
        "abschluss": "Abschluss"
    }
}
```

***

#### Portalconfig.menu.tool.wfsSearch.searchInstance.requestConfig

Informationen über den WFS-Dienst, welcher angefragt werden soll.
Es muss entweder `layerId` oder `restLayerId` definiert sein. Wenn `layerId` verwendet wird, dann muss zusätzlich der Layer in der **[config.json](config.json.de.md)** konfiguriert werden.
Falls beide Parameter gesetzt wurden, dann wird `restLayerId` verwendet.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|gazetteer|nein|**[gazetteer](#markdown-header-portalconfigmenutoolwfssearchsearchinstancerequestconfiggazetteer)**||Legt fest, ob der verwendete WFS-Dienst ein WFS-G ist, welcher anders geparsed werden muss.|false|
|layerId|nein|String||Id des WFS Dienstes, welcher angefragt werden soll. Informationen werden aus der **[services.json](services.json.de.md)** bezogen.|false|
|likeFilter|nein|**[likeFilter](#markdown-header-portalconfigmenutoolwfssearchsearchinstancerequestconfiglikefilter)**|{"wildCard": "*", "singleChar": "#", "escape": "!"}|Die Konfiguration des Services hinsichtlich des like Filters.|true|
|maxFeatures|nein|Number/String|8|Maximale Anzahl an Features, welche der Dienst zurückgeben soll. Alternativ kann auch der String `showAll` übergeben werden, um alle Ergebnisse anzuzeigen.|false|
|restLayerId|nein|String||Id des WFS Dienstes, welcher angefragt werden soll. Informationen werden aus der **[rest-services.json](rest-services.json.de.md)** bezogen.|false|
|storedQueryId|nein|String||Die Id der gespeicherten Anfrage (Stored Query) des WFS Dienstes, welche für die Anfrage verwendet werden soll. Es wird angenommen, dass ein WFS@2.0.0 verwendet wird, falls dieses Feld gesetzt wurde.|false|

**Beispiel**

```json
{
    "requestConfig": {
        "restLayerId": "1234",
        "storedQueryId": "Flurstuecke"
    }
}
```

***

#### Portalconfig.menu.tool.wfsSearch.searchInstance.requestConfig.likeFilter

Innerhalb eines Filters für einen WFS-Dienst können Werte mit einem `equal` oder einem `like` verglichen werden.
Wenn der Vergleich mit einem `like` durchgeführt werden soll, dann werden weitere Eigenschaften benötigt. Diese können sowohl im Wert, als auch in der Eigenschaftsdefinition variieren.
Es wird für die Dokumentation angenommen, dass die Eigenschaften `wildCard`, `singleChar` und `escape` heißen; Variationen wie `wildCard`, `single` und `escape` sind jedoch auch möglich und müssen dem Dienst entsprechend für den Filter angegeben werden.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|wildCard|ja|String|"*"|Der Wildcardwert für den like Filter.|true|
|singleChar|ja|String|"#"|Der Wert für einen einzelnen Charakter für den like Filter.|true|
|escape|ja|String|"!"|Der Escape-Wert für den like Filter.|true|

***

#### Portalconfig.menu.tool.wfsSearch.searchInstance.requestConfig.gazetteer

Parameter, welche exklusiv für die Verwendung eines WFS-G (Gazetteer) benötigt werden.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|namespaces|ja|String/String[]||Die Namespaces des Dienstes.|false|
|memberSuffix|ja|enum["member","featureMember"]||Der Suffix des Featuretypen.|false|

**Beispiel**

```json
{
    "gazetteer": {
        "namespaces": [
            "http://www.adv-online.de/namespaces/adv/dog",
            "http://geodienste.hamburg.de/dog_gages/services/wfs_dog?SERVICE=WFS&VERSION=2.0.0&REQUEST=DescribeFeatureType&OUTPUTFORMAT=application/gml+xml;+version=3.2&TYPENAME=dog:Flurstueckskoordinaten&NAMESPACES=xmlns(dog,http://www.adv-online.de/namespaces/adv/dog)"
        ],
        "memberSuffix": "memberSuffix"
    }
}
```

***

#### Portalconfig.menu.tool.wfsSearch.searchInstance.suggestions

Konfiguration für die Vorschläge von Nutzereingaben.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|featureType|nein|String||Wenn gegeben wird die Anfrage mit diesem featureType statt dem aus der Definition des Services. Nur verwendbar, wenn der Dienst in der **[services.json](services.json.de.md)** definiert wurde.|false|
|length|nein|Number|3|Die Anfrage wird dann getriggered, wenn die Inputlänge mindestens so lang ist wie der Wert dieses Parameters.|false|

***

#### Portalconfig.menu.tool.wfst

[inherits]: # (Portalconfig.menu.tool)

Das WFS-T Tool bietet die Möglichkeit Features aus Web Feature Services (WFS) in der Oberfläche sowohl zu visualisieren (Get Feature), zu aktualisieren (update) und zu löschen (delete), als auch die Möglichkeit neue Features hizuzufügen (insert).
Zur Vorbereitung muss ein WFS-T Service bereitgestellt werden (siehe services.json.de.md).

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|name|ja|String||Name dieses Tools, wie er im Portal angezeigt werden soll.|
|layerIds|ja|String[]||Array von Layer IDs.|false|
|toggleLayer|nein|Boolean|false|Flag ob die Features eines Layers beim Hinzufügen eines neuen Features sichtbar bleiben.|
|layerSelect|nein|String|"aktueller Layer:"|Möglichkeit die Beschriftung der Layer Auswahl zu konfigurieren.|
|pointButton|nein|[Button](#markdown-header-portalconfigmenutoolwfstbutton)[]|false|Möglichkeit zu konfigurieren, für welchen Layer die Funktion zum Erfassen eines Punktes zur Verfügung steht und welche Beschriftung der Button haben soll.|
|lineButton|nein|[Button](#markdown-header-portalconfigmenutoolwfstbutton)[]|false|Möglichkeit zu konfigurieren, für welchen Layer die Funktion zum Erfassen einer Linie zur Verfügung steht und welche Beschriftung der Button haben soll.|
|areaButton|nein|[Button](#markdown-header-portalconfigmenutoolwfstbutton)[]|false|Möglichkeit zu konfigurieren, für welchen Layer die Funktion zum Erfassen einer Fläche zur Verfügung steht und welche Beschriftung der Button haben soll.|
|edit|nein|[EditDelete](#markdown-header-portalconfigmenutoolwfsteditdelete)|false|Möglichkeit zu konfigurieren, ob der edit Button angezeigt wird und mit wekcher Beschriftung er angezeigt wird.|
|delete|nein|[EditDelete](#markdown-header-portalconfigmenutoolwfsteditdelete)|false|Möglichkeit zu konfigurieren, ob der delete Button angezeigt wird und mit welcher Beschriftung er angezeigt wird.|
|useProxy|nein|Boolean|false|Deprecated im nächsten Major-Release, da von der GDI-DE empfohlen wird einen CORS-Header einzurichten. Gibt an, ob die URL des Dienstes über einen Proxy angefragt werden soll, dabei werden die Punkte in der URL durch Unterstriche ersetzt.|false|

**Beispiel**
```
#!json
{
    "wfst": {
        "name": "WFS-T Tool",
        "glyphicon": "glyphicon-globe",
        "layerIds": ["1234", "5678"],
        "toggleLayer": true,
        "layerSelect": "TestLayer",
        "pointButton": [
            {
                "layerId":"1234",
                "caption": "Punkt-Test",
                "show": true
            },
            {
                "layerId": "5678",
                "show": true
            }
        ],
        "lineButton": false,
        "areaButton": [
            {
                "layerId": "4389",
                "show": false
            }
        ],
        "edit": "Bearbeiten",
        "delete": true
    }
}
```
#### Portalconfig.menu.tool.wfst.Button
Das Attribut pointButton/lineButton/areaButton kann vom Typ Boolean oder Object sein. Wenn es vom Typ Boolean ist, zeigt diese flag ob die Funktion zum Erfassen einer Geometrie für alle Layer zur Verfügung stehen soll. Ist es vom Typ Object so gelten folgende Attribute:

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|layerId|ja|String||Der Layer für den die Konfiguration vorgenommen werden soll|false|
|show|ja|Boolean|true|Flag ob der Button zur Verfügung stehen soll.|false|
|caption|nein|String|"Erfassen"|Beschriftung des Buttons. Der Default-Wert wird im Admintool genutzt. Falls hier kein Wert gegeben wird, benutzt das Masterportal je nach Umstand "Punkt erfassen", "Linie erfassen", oder "Fläche erfassen".|false|


**Beispiel als Boolean**

```json
{
    "pointButton": true
}
```

**Beispiel als Object**

```json
{
    "layerId": "1234",
    "show": true,
    "caption": "Punkt-Test"
}
```

```json
{
    "layerId": "5678",
    "show": true
}
```

```json
{
    "layerId": "5489",
    "show": false
}
```

***

#### Portalconfig.menu.tool.wfst.EditDelete
Das Attribut edit / delete kann vom Typ Boolean oder String sein. Wenn es vom Typ Boolean ist, zeigt diese flag ob der Editier-/ Lösch-Button zur Verfügung stehen soll. Ist es vom Typ String so wird der Button mit der dort angegebenen Beschriftung angezeigt.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|edit|ja|Boolean|true|Flag ob der Editier-Button angezeigt werden soll|false|
|edit|ja|String|"Geometrie bearbeiten"|Beschriftung des Editier-Buttons|false|
|delete|ja|Boolean|true|Flag ob der Lösch-Button angezeigt werden soll|false|
|delete|ja|String|"Geometrie löschen"|Beschriftung des lösch-Buttons|false|

**Beispiel als Boolean**
```
#!json
"edit": true
```

**Beispiel als String**
```
#!json
"edit": "Editieren"
```


***

#### Portalconfig.menu.tool.coordToolkit

[inherits]: # (Portalconfig.menu.tool)
Koordinaten-Werkzeug. Um zusätzlich zu den 2 dimensionalen Koordinaten die Höhe über NHN anzuzeigen muß eine 'heightLayerId' eines WMS-Dienstes angegeben werden, der die Höhe liefert. Es wird das Format XML erwartet und das Attribut für die Höhen wird unter dem Wert des Parameters 'heightElementName' erwartet.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|heightLayerId|nein|String||Koordinatenabfrage: Id des WMS-Layers der die Höhe im XML-Format liefert. Wenn nicht definiert, dann wird keine Höhe angezeigt.|false|
|heightElementName|nein|String||Koordinatenabfrage: Der Element-Name unter dem die Höhe in dem XML gesucht wird|false|
|heightValueWater|nein|String||Koordinatenabfrage: Der Wert im unter "heightElementName" definierten Element, der für eine nicht gemessene Höhe im Wasser-Bereich vom WMS geliefert wird, es wird der internationalisierte Text "Gewässerfläche, keine Höhen vorhanden" unter dem Schlüssel "common:modules.tools.coordToolkit.noHeightWater" in der Oberfläche angezeigt. Wenn dieses Attribut nicht angegeben wird, dann wird der Text, den das WMS liefert angezeigt.|false|
|heightValueBuilding|nein|String||Koordinatenabfrage: Der Wert im unter "heightElementName" definierten Element, der für eine nicht gemessene Höhe im Gebäude-Bereich vom WMS geliefert wird, es wird der internationalisierte Text "Gebäudefläche, keine Höhen vorhanden" unter dem Schlüssel "common:modules.tools.coordToolkit.noHeightBuilding" in der Oberfläche angezeigt. Wenn dieses Attribut nicht angegeben wird, dann wird der Text, den das WMS liefert angezeigt.|false|
|zoomLevel|nein|Number|7|Koordinatensuche: Gibt an, auf welches ZoomLevel gezoomt werden soll.|false|
|showCopyButtons|nein|Boolean|true|Schalter um die Buttons zum Kopieren der Koordinaten anzuzeigen oder auszublenden.|false|
|delimiter|nein|String|"Pipe-Symbol"|Trenner der Koordinaten beim Kopieren des Koordinatenpaares|false|


**Beispiel**
```
#!json
 "coordToolkit": {
            "name": "translate#common:menu.tools.coordToolkit",
            "glyphicon": "glyphicon-globe",
            "zoomLevel": 5,
            "heightLayerId" : "19173",
            "heightElementName": "value_0",
            "heightValueWater": "-20",
            "heightValueBuilding": "200",
            "delimiter": "-",
            "showCopyButtons": true
          }
```

***

#### Portalconfig.menu.tool.routing

[inherits]: # (Portalconfig.menu.tool)

Routing-Werkzeug. Ermöglicht Nutzern das Planen von Routen zwischen mehreren Punkten mit verschiedenen Optionen. Zusätzlich gibt es noch die Funktion zur Erstellung einer Erreichbarkeitsanalyse. Beide Funktionen sind mit einer Stapelverarbeitung verfügbar, zur Abfrage mehrere Routen und Analysen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|activeRoutingToolOption|nein|String|"DIRECTIONS"|Gibt an welches Tool geöffnet werden soll.|false|
|routingToolOptions|nein|String[]|[ ]|Gibt an welche Tools bereitgestellt werden soll. Möglich sind aktuell "DIRECTIONS" und "ISOCHRONES"|false|
|download|nein|**[download](#markdown-header-portalconfigmenutoolroutingdownload)**||Downloadoptionen|false|
|geosearch|nein|**[geosearch](#markdown-header-portalconfigmenutoolroutinggeosearch)**||Geosucheoptionen|false|
|geosearchReverse|nein|**[geosearchReverse](#markdown-header-portalconfigmenutoolroutinggeosearchreverse)**||Geosuchereverseoptionen|false|
|directionsSettings|nein|**[directionsSettings](#markdown-header-portalconfigmenutoolroutingdirectionssettings)**||Routenplanungoptionen|false|
|isochronesSettings|nein|**[isochronesSettings](#markdown-header-portalconfigmenutoolroutingisochronessettings)**||Erreichbarkeitsanalysenoptionen|false|


**Beispiel**
```
#!json
{
    "routing": {
        "name": "translate#common:menu.tools.routing",
        "glyphicon": "glyphicon-road",
        "activeRoutingToolOption": "DIRECTIONS",
        "routingToolOptions": ["DIRECTIONS", "ISOCHRONES"],
        "download": {
            "filename": "",
            "format": "GEOJSON"
        },
        "geosearch": {
            "minChars": 3,
            "limit": 10,
            "type": "BKG",
            "serviceId": "bkg_geosearch"
        },
        "geosearchReverse": {
            "distance": 1000,
            "filter": "",
            "type": "BKG",
            "serviceId": "bkg_suggest"
        },
        "directionsSettings": {
            "type": "ORS",
            "serviceId": "bkg_ors",
            "speedProfile": "CAR",
            "preference": "RECOMMENDED",
            "styleRoute": {
                "fillColor": [255, 44, 0],
                "width": 6,
                "highlightColor": [255, 255, 255],
                "highlightWidth": 9,
                "partHighlightColor": [255, 255, 255],
                "partHighlightWidth": 3
            },
            "styleWaypoint": {
                "lineColor": [255, 127, 0],
                "lineWidth": 4,
                "fillColor": [255, 127, 0],
                "textFillColor": "#000",
                "textLineColor": "#fff",
                "textLineWidth": 3,
                "opacity": 0.3,
                "radius": 8
            },
            "styleAvoidAreas": {
                "lineColor": [0, 127, 255],
                "lineWidth": 2,
                "fillColor": [0, 127, 255],
                "opacity": 0.3,
                "pointRadius": 8,
                "pointLineWidth": 4
            },
            "batchProcessing": {
                "enabled": false,
                "active": false,
                "limit": 1000,
                "maximumConcurrentRequests": 3
            }
        },
        "isochronesSettings": {
            "type": "ORS",
            "serviceId": "bkg_ors",
            "speedProfile": "CAR",
            "isochronesMethodOption": "TIME",
            "distanceValue": 30,
            "minDistance": 1,
            "maxDistance": 400,
            "timeValue": 30,
            "minTime": 1,
            "maxTime": 180,
            "intervalValue": 15,
            "minInterval": 3,
            "maxInterval": 30,
            "styleCenter": {
                "lineColor": [255, 127, 0],
                "lineWidth": 4,
                "fillColor": [255, 127, 0],
                "opacity": 0.3,
                "radius": 8
            },
            "styleIsochrones": {
                "lineWidth": 2,
                "opacity": 0.65,
                "startColor": [66, 245, 78],
                "endColor": [245, 66, 66]
            },
            "batchProcessing": {
                "enabled": false,
                "active": false,
                "limit": 1000,
                "maximumConcurrentRequests": 3
            }
        }
    }
}
```

***

#### Portalconfig.menu.tool.routing.download

Routing-Werkzeug Download Optionen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|fileName|nein|String||Default Dateiname für den Download.|false|
|format|nein|String|"GEOJSON"|Welches Format default ausgewählt ist. Aktuell möglich sind "GEOJSON", "KML" und "GPX".|false|

**Beispiel**
```
#!json
{
    "download": {
        "filename": "",
        "format": "GEOJSON"
    }
}
```

***

#### Portalconfig.menu.tool.routing.geosearch

Routing-Werkzeug Geosuche Optionen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|minChars|nein|Number|3|Minimum an Zeichen für die Anfrage bei dem externen Service.|false|
|limit|nein|Number|10|Maximale Anzahl an Zeichen für die Suche.|false|
|type|ja|String||Welcher Typ für die Geosuche verwendet werden soll. Aktuell möglich sind "BKG" und "NOMINATIM".|false|
|serviceId|ja|String||Welcher Service für die Geosuche verwendet werden soll.|false|

**Beispiel**
```
#!json
{
    "geosearch": {
        "minChars": 3,
        "limit": 10,
        "type": "BKG",
        "serviceId": "bkg_geosearch"
    }
}
```

***

#### Portalconfig.menu.tool.routing.geosearchReverse

Routing-Werkzeug Geosuche Reverse Optionen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|distance|nein|Number|1000|Distanz zum Suchen in Meter für die Anfrage bei dem externen Service.|false|
|filter|nein|String||Zusätzliche Filter für die Suche werden an die Anfrage angehangen.|false|
|type|ja|String||Welcher Typ für die Geosuche verwendet werden soll. Aktuell möglich sind "BKG" und "NOMINATIM".|false|
|serviceId|ja|String||Welcher Service für die Geosuche verwendet werden soll.|false|

**Beispiel**
```
#!json
{
    "geosearchReverse": {
        "distance": 1000,
        "filter": "",
        "type": "BKG",
        "serviceId": "bkg_suggest"
    }
}
```

***

#### Portalconfig.menu.tool.routing.directionsSettings

Routing-Werkzeug Routenplanung Optionen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|type|ja|String||Welche Art der externe Service zur Abfrage ist. Aktuell möglich ist "ORS".|false|
|serviceId|ja|String||Welcher Service für die Abfrage verwendet werden soll.|false|
|speedProfile|nein|String|"CAR"|Welches Geschwindigkeitsprofil verwendet werden soll.|false|
|preference|nein|String|"RECOMMENDED"|Welche Art der Routenplanung verwendet werden soll.|false|
|styleRoute|nein|**[styleRoute](#markdown-header-portalconfigmenutoolroutingdirectionssettingsstyleroute)**||Stylerouteoptionen|false|
|styleWaypoint|nein|**[styleWaypoint](#markdown-header-portalconfigmenutoolroutingdirectionssettingsstylewaypoint)**||Stylewaypointoptionen|false|
|styleAvoidAreas|nein|**[styleAvoidAreas](#markdown-header-portalconfigmenutoolroutingdirectionssettingsstyleavoidareas)**||Styleavoidareasoptionen|false|
|batchProcessing|nein|**[batchProcessing](#markdown-header-portalconfigmenutoolroutingdirectionssettingsbatchprocessing)**||Batchprocessingoptionen|false|

**Beispiel**
```
#!json
{
    "directionsSettings": {
        "type": "ORS",
        "serviceId": "bkg_ors",
        "speedProfile": "CAR",
        "preference": "RECOMMENDED",
        "styleRoute": {
            "fillColor": [255, 44, 0],
            "width": 6,
            "highlightColor": [255, 255, 255],
            "highlightWidth": 9,
            "partHighlightColor": [255, 255, 255],
            "partHighlightWidth": 3
        },
        "styleWaypoint": {
            "lineColor": [255, 127, 0],
            "lineWidth": 4,
            "fillColor": [255, 127, 0],
            "textFillColor": "#000",
            "textLineColor": "#fff",
            "textLineWidth": 3,
            "opacity": 0.3,
            "radius": 8
        },
        "styleAvoidAreas": {
            "lineColor": [0, 127, 255],
            "lineWidth": 2,
            "fillColor": [0, 127, 255],
            "opacity": 0.3,
            "pointRadius": 8,
            "pointLineWidth": 4
        },
        "batchProcessing": {
            "enabled": false,
            "active": false,
            "limit": 1000,
            "maximumConcurrentRequests": 3
        }
    }
}
```

***

#### Portalconfig.menu.tool.routing.directionsSettings.styleRoute

Routing-Werkzeug Routenplanung Routen Style Optionen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|fillColor|nein|Number[]|[255, 44, 0]|Welche Farbe zum Füllen verwendet werden soll.|false|
|width|nein|Number|6|Wie breit die Route dargestellt werden soll.|false|
|highlightColor|nein|Number[]|[255, 255, 255]|Welche Farbe zum Highlighten verwendet werden soll.|false|
|highlightWidth|nein|Number|9|Wie breit das Highlighting dargestellt werden soll.|false|
|partHighlightColor|nein|Number[]|[255, 255, 255]|Welche Farbe zum highlighten verwendet werden soll, wenn nur ein Teil der Route gehighlightet wird.|false|
|highlightWidth|nein|Number|9|Wie breit das Highlighting dargestellt werden soll, wenn nur ein Teil der Route gehighlightet wird.|false|

**Beispiel**
```
#!json
{
    "styleRoute": {
        "fillColor": [255, 44, 0],
        "width": 6,
        "highlightColor": [255, 255, 255],
        "highlightWidth": 9,
        "partHighlightColor": [255, 255, 255],
        "partHighlightWidth": 3
    }
}
```

***

#### Portalconfig.menu.tool.routing.directionsSettings.styleWaypoint

Routing-Werkzeug Routenplanung Wegpunkt Style Optionen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|lineColor|nein|Number[]|[255, 127, 0]|Welche Farbe zum Umranden verwendet werden soll.|false|
|lineWidth|nein|Number|4|Wie breit die Umrandung dargestellt werden soll.|false|
|fillColor|nein|Number[]|[255, 127, 0]|Welche Farbe zum Füllen verwendet werden soll.|false|
|textFillColor|nein|String|"#000"|Welche Farbe für den Text verwendet werden soll.|false|
|textLineColor|nein|String|"#fff"|Welche Farbe für das Highlighten des Textes verwendet werden soll.|false|
|textLineWidth|nein|Number|3|Wie groß der Text dargestellt werden soll.|false|
|opacity|nein|Number|0.3|Wie stark die Füllfarbe dargestellt werden soll.|false|
|radius|nein|Number|8|Wie groß der Wegpunkt dargestellt werden soll.|false|

**Beispiel**
```
#!json
{
    "styleWaypoint": {
        "lineColor": [255, 127, 0],
        "lineWidth": 4,
        "fillColor": [255, 127, 0],
        "textFillColor": "#000",
        "textLineColor": "#fff",
        "textLineWidth": 3,
        "opacity": 0.3,
        "radius": 8
    }
}
```

***

#### Portalconfig.menu.tool.routing.directionsSettings.styleAvoidAreas

Routing-Werkzeug Routenplanung Sperrflächen Style Optionen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|lineColor|nein|Number[]|[0, 127, 255]|Welche Farbe zum Umranden verwendet werden soll.|false|
|lineWidth|nein|Number|2|Wie breit die Umrandung dargestellt werden soll.|false|
|fillColor|nein|Number[]|[0, 127, 255]|Welche Farbe zum Füllen verwendet werden soll.|false|
|opacity|nein|Number|0.3|Wie stark die Füllfarbe dargestellt werden soll.|false|
|pointRadius|nein|Number|8|Wie groß die Eckpunkte dargestellt werden sollen.|false|
|pointLineWidth|nein|Number|4|Wie groß die Umrandung der Eckpunkte dargestellt werden sollen.|false|

**Beispiel**
```
#!json
{
    "styleAvoidAreas": {
        "lineColor": [0, 127, 255],
        "lineWidth": 2,
        "fillColor": [0, 127, 255],
        "opacity": 0.3,
        "pointRadius": 8,
        "pointLineWidth": 4
    }
}
```

***

#### Portalconfig.menu.tool.routing.directionsSettings.batchProcessing

Routing-Werkzeug Routenplanung Stapelverarbeitung Optionen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|enabled|nein|Boolean|false|Ob die Stapelverarbeitung bereitgestellt werden soll.|false|
|active|nein|Boolean|false|Ob die Stapelverarbeitung aktiv sein soll.|false|
|limit|nein|Number|1000|Die maximale Anzahl an Zeilen in einer CSV die verarbeitet werden sollen/dürfen.|false|
|maximumConcurrentRequests|nein|Number|3|Die maximale Anzahl an Aufrufen die an externe Services parallel gemacht werden dürfen. Zu viele schränken die parallele Arbeit mit der Karte ein. Zu Wenige verlangsamt die Stapelverarbeitung. Maximal können in den Browsern 6 Requests gleichzeitig gemacht werden.|false|

**Beispiel**
```
#!json
{
    "batchProcessing": {
        "enabled": false,
        "active": false,
        "limit": 1000,
        "maximumConcurrentRequests": 3
    }
}
```

***

#### Portalconfig.menu.tool.routing.isochronesSettings

Routing-Werkzeug Erreichbarkeitsanalysen Optionen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|type|ja|String||Welche Art der externe Service zur Abfrage ist. Aktuell möglich ist "ORS".|false|
|serviceId|ja|String||Welcher Service für die Abfrage verwendet werden soll.|false|
|speedProfile|nein|String|"CAR"|Welches Geschwindigkeitsprofil verwendet werden soll.|false|
|isochronesMethodOption|nein|String|"TIME"|Welche Methode für den Abruf verwendet werden soll.|false|
|distanceValue|nein|Number|30|Welcher Distanzwert in km für den Slider verwendet werden soll.|false|
|minDistance|nein|Number|1|Welche minimale Distanz in km für den Slider verwendet werden soll.|false|
|maxDistance|nein|Number|400|Welche maximale Distanz in km für den Slider verwendet werden soll.|false|
|timeValue|nein|Number|30|Welcher Zeitwert in min für den Slider verwendet werden soll.|false|
|minTime|nein|Number|1|Welche minimale Zeit in min für den Slider verwendet werden soll.|false|
|maxTime|nein|Number|180|Welche maximale Zeit in min für den Slider verwendet werden soll.|false|
|intervalValue|nein|Number|15|Welcher Intervallwert in km/min für den Slider verwendet werden soll.|false|
|minInterval|nein|Number|1|Welches minimale Intervall in km/min für den Slider verwendet werden soll.|false|
|maxInterval|nein|Number|30|Welches maximale Intervall in km/min für den Slider verwendet werden soll.|false|
|styleCenter|nein|**[styleCenter](#markdown-header-portalconfigmenutoolroutingisochronessettingsstylecenter)**||Stylecenteroptionen|false|
|styleIsochrones|nein|**[styleIsochrones](#markdown-header-portalconfigmenutoolroutingisochronessettingsstyleisochrones)**||Styleisochronesoptionen|false|
|batchProcessing|nein|**[batchProcessing](#markdown-header-portalconfigmenutoolroutingisochronessettingsbatchprocessing)**||Batchprocessingoptionen|false|


**Beispiel**
```
#!json
{
    "isochronesSettings": {
        "type": "ORS",
        "serviceId": "bkg_ors",
        "speedProfile": "CAR",
        "isochronesMethodOption": "TIME",
        "distanceValue": 30,
        "minDistance": 1,
        "maxDistance": 400,
        "timeValue": 30,
        "minTime": 1,
        "maxTime": 180,
        "intervalValue": 15,
        "minInterval": 3,
        "maxInterval": 30,
        "styleCenter": {
            "lineColor": [255, 127, 0],
            "lineWidth": 4,
            "fillColor": [255, 127, 0],
            "opacity": 0.3,
            "radius": 8
        },
        "styleIsochrones": {
            "lineWidth": 2,
            "opacity": 0.65,
            "startColor": [66, 245, 78],
            "endColor": [245, 66, 66]
        },
        "batchProcessing": {
            "enabled": false,
            "active": false,
            "limit": 1000,
            "maximumConcurrentRequests": 3
        }
    }
}
```

***

#### Portalconfig.menu.tool.routing.isochronesSettings.styleCenter

Routing-Werkzeug Erreichbarkeitsanalysen Center Style Optionen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|lineColor|nein|Number[]|[255, 127, 0]|Welche Farbe für die Umrandung verwendet werden soll.|false|
|lineWidth|nein|Number|4|Wie breit die Umrandung des Punktes dargestellt werden soll.|false|
|fillColor|nein|Number[]|[255, 127, 0]|Welche Farbe zum Füllen verwendet werden soll.|false|
|opacity|nein|Number|0.3|Wie stark die Füllfarbe dargestellt werden soll.|false|
|radius|nein|Number|8|Wie groß der Wegpunkt dargestellt werden soll.|false|

**Beispiel**
```
#!json
{
    "styleCenter": {
        "lineColor": [255, 127, 0],
        "lineWidth": 4,
        "fillColor": [255, 127, 0],
        "opacity": 0.3,
        "radius": 8
    }
}
```

***

#### Portalconfig.menu.tool.routing.isochronesSettings.styleIsochrones

Routing-Werkzeug Erreichbarkeitsanalysen Isochrone Style Optionen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|lineWidth|nein|Number|2|Wie breit die Umrandung der Polygone dargestellt werden soll.|false|
|opacity|nein|Number|0.65|Wie stark die Füllfarbe dargestellt werden soll.|false|
|startColor|nein|Number[]|[66, 245, 78]|Ab welcher Farbe zum Füllen interpoliert werden soll.|false|
|endColor|nein|Number[]|[245, 66, 66]|Bis zu welcher Farbe zum Füllen interpoliert werden soll.|false|

**Beispiel**
```
#!json
{
    "styleIsochrones": {
        "lineWidth": 2,
        "opacity": 0.65,
        "startColor": [66, 245, 78],
        "endColor": [245, 66, 66]
    }
}
```

***

#### Portalconfig.menu.tool.routing.isochronesSettings.batchProcessing

Routing-Werkzeug Erreichbarkeitsanalysen Stapelverarbeitung Optionen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|enabled|nein|Boolean|false|Ob die Stapelverarbeitung bereitgestellt werden soll.|false|
|active|nein|Boolean|false|Ob die Stapelverarbeitung aktiv sein soll.|false|
|limit|nein|Number|1000|Die maximale Anzahl an Zeilen in einer CSV die verarbeitet werden sollen/dürfen.|false|
|maximumConcurrentRequests|nein|Number|3|Die maximale Anzahl an Aufrufen die an externe Services parallel gemacht werden dürfen. Zu viele schränken die parallele Arbeit mit der Karte ein. Zu Wenige verlangsamt die Stapelverarbeitung. Maximal können in Browsern 6 Requests gleichzeitig gemacht werden.|false|

**Beispiel**
```
#!json
{
    "batchProcessing": {
        "enabled": false,
        "active": false,
        "limit": 1000,
        "maximumConcurrentRequests": 3
    }
}
```

***

### Portalconfig.menu.staticlinks
Das Array staticlink beinhaltet Objekte die entweder als Link zu einer anderen Webresource dienen oder als Trigger eines zu definierenden Events.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|staticlinks|nein|**[staticlink](#markdown-header-portalconfigmenustaticlinksstaticlink)**[]||Array von Statischen links.|false|


**Beispiel als onClickTrigger**
```
#!json
"staticlinks": [
    {
        "name": "Alert",
        "glyphicon": "glyphicon-globe",
        "onClickTrigger": [
            {
                "channel": "Alert",
                "event": "alert",
                "data": "Hello World!"
            }
        ]
    }
]
```

***

#### Portalconfig.menu.staticlinks.staticlink
Ein Staticlink-Objekt enthält folgende Attribute.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|name|ja|String||Name des staticLink-Objekts im Menü.|false|
|glyphicon|nein|String|"glyphicon-globe"|CSS Klasse des Glyphicons, das vor dem staticLink-Objekt im Menü angezeigt wird.|false|
|url|nein|String||URL welche in einem neuen Tab angezeigt werden soll.|false|
|onClickTrigger|nein|**[onClickTrigger](#markdown-header-portalconfigmenustaticlinksstaticlinkonclicktrigger)**[]||Array von OnClickTrigger events.|false|

**Beispiel als url**
```
#!json
{
    "name": "Hamburg",
    "glyphicon": "glyphicon-globe",
    "url": "http://www.hamburg.de"
}
```

**Beispiel als onClickTrigger**
```
#!json
{
    "name": "Alert",
    "glyphicon": "glyphicon-globe",
    "onClickTrigger": [
        {
            "channel": "Alert",
            "event": "alert",
            "data": "Hello World!"
        }
    ]
}
```

***

#### Portalconfig.menu.staticlinks.staticlink.onClickTrigger
Über einen onClickTrigger wird ein Event getriggert und eventuell Daten mitgeschickt.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|channel|ja|String||Name des Radio channels.|false|
|event|ja|String||Event des Radio channels das getriggered werden soll.|false|
|data|nein|String/Boolean/Number||Daten die mitgeschickt werden sollen.|false|

**Beispiel**
```
#!json
{
    "channel": "Alert",
    "event": "alert",
    "data": "Hello World!"
}
```

***

## Themenconfig
Die Themenconfig definiert, welche Inhalte an welcher Stelle im Themenbaum vorkommen. Je nach Konfiguration des treeType können auch Ordner Strukturen in den [Fachdaten](#markdown-header-themenconfigfachdaten) angegeben werden.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|Hintergrundkarten|ja|**[Hintergrundkarten](#markdown-header-themenconfighintergrundkarten)**||Definition der Hintergrundkarten.|false|
|Fachdaten|nein|**[Fachdaten](#markdown-header-themenconfigfachdaten)**||Definition der Fachdaten.|false|
|Fachdaten_3D|nein|**[Fachdaten_3D](#markdown-header-themenconfigfachdaten_3d)**||Definition der Fachdaten für den 3D-Modus.|false|
|Fachdaten_Zeit|nein|**[Fachdaten_Zeit](#markdown-header-themenconfigfachdaten_zeit)**||Definition der WMS-T Layer in einem eigenen Ordner.|false|

**Beispiel**

```json
{
    "Themenconfig": {
        "Hintergrundkarten": {},
        "Fachdaten": {},
        "Fachdaten_3D": {},
        "Fachdaten_Zeit": {}
    }
}
```

***

### Themenconfig.Hintergrundkarten

[type:Layer]: # (Themenconfig.Layer)
[type:GroupLayer]: # (Themenconfig.GroupLayer)
[type:Ordner]: # (Themenconfig.Ordner)

Hier werden die Hintergrundkarten definiert

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|name|nein|String|"Hintergrundkarten"| Name der Schaltfläche für Hintergrundkarten im custom tree und default tree.|false|
|Layer|ja|**[Layer](#markdown-header-themenconfiglayer)**/**[GroupLayer](#markdown-header-themenconfiggrouplayer)**[]||Definition der Layer.|false|
|Ordner|nein|**[Ordner](#markdown-header-themenconfigordner)**[]||Definition der Ordner.|false|

**Beispiel**
```
#!json
"Hintergrundkarten": {
    "name": "Meine Hintergrundkarten",
    "Layer": [
        {
            "id": "123"
        }
    ]
},
```

***

### Themenconfig.Fachdaten

[type:Layer]: # (Themenconfig.Layer)
[type:GroupLayer]: # (Themenconfig.GroupLayer)
[type:Ordner]: # (Themenconfig.Ordner)

Hier werden die Fachdaten definiert

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|name|nein|String|"Fachdaten"| Name der Schaltfläche für Fachdaten im custom tree und default tree.|false|
|Layer|ja|**[Layer](#markdown-header-themenconfiglayer)**/**[GroupLayer](#markdown-header-themenconfiggrouplayer)**[]||Definition der Layer.|false|
|Ordner|nein|**[Ordner](#markdown-header-themenconfigordner)**[]||Definition der Ordner.|false|

**Beispiel**
```
#!json
"Fachdaten": {
    "name": "Meine Fachdaten",
    "Layer": [
        {
            "id": "123"
        }
    ]
},
```

***

### Themenconfig.Fachdaten_3D

[type:Layer]: # (Themenconfig.Layer)

Hier werden die 3D-Daten für die 3D-Ansicht definiert. Im custom tree und default tree. Wird nur im 3D-Modus eingeblendet.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|name|nein|String|"3D Daten"| Name der Schaltfläche für 3D-Daten.|false|
|Layer|ja|**[Layer](#markdown-header-themenconfiglayer)**[]||Definition der 3DLayer.|false|

**Beispiel**
```
#!json
"Fachdaten_3D":
    {
      "name": "Meine Fachdaten 3D",
      "Layer":
        [
        {
          "id": "12883"
        }
       ]
    }
```

***

### Themenconfig.Fachdaten_Zeit

[type:Layer]: # (Themenconfig.Layer)

Definition für WMS-T Layer für den `treeType` `custom` und `default`. Die Layer können auch unter **[Fachdaten](#markdown-header-themenconfigfachdaten)** definiert werden.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|name|nein|String|"common:tree.subjectDataTime"|Name der Schaltfläche für WMS-T Layer.|false|
|Layer|ja|**[Layer](#markdown-header-themenconfiglayer)**[]||WMS-T layer Definition.|false|

**Beispiel**

```json
{
    "Fachdaten_Zeit": {
        "name": "Meine Zeitreihen",
        "Layer": [
            {
              "id": "my_wms_time"
            }
        ]
    }
}
```

***

### Themenconfig.Ordner

[type:Layer]: # (Themenconfig.Layer)
[type:GroupLayer]: # (Themenconfig.GroupLayer)
[type:Ordner]: # (Themenconfig.Ordner)

Hier werden die Ordner definiert. Ordner können auch verschachtelt konfiguriert werden. Ordner können unterhalb der Fachdaten und der Hintergrundkarten konfiguriert werden.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|Titel|ja|String||Titel des Ordners.|false|
|Layer|ja|**[Layer](#markdown-header-themenconfiglayer)**/**[GroupLayer](#markdown-header-themenconfiggrouplayer)**[]||Definition der Layer.|false|
|Ordner|nein|**[Ordner](#markdown-header-themenconfigordner)**[]||Definition der Ordner.|false|
|isFolderSelectable|nein|Boolean|false|Legt fest, ob alle Layer eines Ordners auf einmal über einen Haken aktiviert bzw. deaktiviert werden dürfen. Funktioniert nur, wenn treeType="custom" konfiguriert ist. Ist dieser Wert nicht gesetzt wird die globale Einstellung im `config.js` Parameter `tree.isFolderSelectable` verwendet. |false|
|invertLayerOrder|nein|Boolean|false|Legt fest, ob bei Klick auf den Ordner die Reihenfolge, in der die Layer der Map hinzugefügt werden, umgekehrt werden soll.|false|

**Beispiel Fachdaten-Ordner mit einem Layer**
```
#!json
"Fachdaten": {
    "Ordner": [
        {
            "Titel": "Mein Ordner",
            "Layer": [
                {
                    "id": "123"
                }
            ]
        }
    ]
}
```
**Beispiel Hintergrundkarten-Ordner mit 2 Layern**

```json
{
    "Hintergrundkarten": {
        "Ordner": [{
            "Titel": "Karten",
            "isFolderSelectable": false,
            "Layer": [
                {
                    "name": "Luftbild",
                    "id": "123",
                    "visibility": true
                },
                {
                    "name": "Stadtplan",
                    "id": "456"
                }
            ]
        }]
    }
}
```
**Beispiel Hintergrundkarten-Ordner, daneben sind Layer konfiguriert**

```json
{
    "Hintergrundkarten":{
        "Ordner": [{
            "Titel": "Karten",
            "isFolderSelectable": false,
            "Layer": [
                {
                    "name": "Luftbild",
                    "id": "123",
                    "visibility": true
                },
                {
                    "name": "Stadtplan",
                    "id": "456"
                }
            ]
        }],
        "Layer": [{
            "name": "alte Karte",
            "id": "789"
        },
            ...
        ]
    }
}
```

**Beispiel Fachdaten-Ordner mit einem Unterordner in dem ein Layer konfiguriert ist**

```
#!json
"Fachdaten": {
    "Ordner": [
        {
            "Titel": "Mein erster Ordner",
            "isFolderSelectable": true,
            "Ordner": [
                {
                    "Titel": "Mein zweiter Ordner",
                    "Layer": [
                        {
                            "id": "123"
                        }
                    ]
                }
            ]
        }
    ]
}
```

**Beispiel Fachdaten-Ordner mit einem Unterordner. Auf der Ebene des Unterordners ist auch nochmal ein Layer definiert**
```
#!json
"Fachdaten": {
    "Ordner": [
        {
            "Titel": "Mein erster Ordner",
            "Ordner": [
                {
                    "Titel": "Mein zweiter Ordner",
                    "Layer": [
                        {
                            "id": "123"
                        }
                    ]
                }
            ],
            "Layer": [
                {
                    "id": "456"
                }
            ]
        }
    ]
}
```

**Beispiel Fachdaten-Ordner mit invertierter Layer-Reihenfolge**

In diesem Beispiel wird der Layer mit der Id 123 vor dem Layer 456 der Map hinzugefügt. Das führt dazu, dass Layer 123 unter Layer 456 dargestellt wird.

```json
{
    "Fachdaten": {
        "Ordner": [
            {
                "Titel": "Mein Ordner",
                "invertLayerOrder": true,
                "Layer": [
                    {
                        "id": "123"
                    },
                    {
                        "id": "456"
                    }
                ]
            }
        ]
    }
}
```

***

### Themenconfig.GroupLayer

[type:Layer]: # (Themenconfig.Layer)
[type:Extent]: # (Datatypes.Extent)

Hier werden die GruppenLayer definiert. Layer können auf viele verschiedene Arten konfiguriert werden. Ein Großteil der Attribute ist in der **[services.json](services.json.de.md)** definiert, kann jedoch hier am Layer überschrieben werden.
Neben diesen Attributen gibt es auch Typ-spezifische Attribute für **[WMS](#markdown-header-themenconfiglayerwms)** und **[Vector](#markdown-header-themenconfiglayervector)**.


|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|id|ja|String/String[]||Id des Layers. In der **[services.json](services.json.de.md)** werden die ids aufgelöst und die notwendigen Informationen herangezogen.|false|
|children|nein|**[Layer](#markdown-header-themenconfiglayer)**[]||Wird dieses Attribut verwendet, so wird ein Gruppenlayer erzeugt, der beliebig viele Layer beinhaltet. In diesem Fall ist eine einzigartige Id manuell zu wählen.|false|
|name|nein|String||Name des Layers.|false|
|transparency|nein|Integer|0|Transparenz des Layers.|false|
|visibility|nein|Boolean|false|Sichtbarkeit des Layers.|false|
|supported|nein|String[]|["2D", "3D"]|Gibt die Modi an, in denen der Layer verwendet werden kann.|false|
|layerAttribution|nein|String||Wert aus **[services.json](services.json.de.md)**. HTML String. Dieser wird angezeigt sobald der Layer aktiv ist.|false|
|legendURL|nein|String||Wert aus **[services.json](services.json.de.md)**. URL die verwendet wird, um die Legende anzufragen. Deprecated, bitte "legend" verwenden.|false|
|legend|nein|Boolean/String||Wert aus **[services.json](services.json.de.md)**. URL die verwendet wird, um die Legende anzufragen. Boolean-Wert um dynamisch die Legende aus dem WMS request oder dem styling zu generieren. String-Wert als Pfad auf Bild oder PDF-Datei.|false|
|maxScale|nein|String||Wert aus **[services.json](services.json.de.md)**. Maximaler Maßstab bei dem der Layer angezeigt werden soll.|false|
|minScale|nein|String||Wert aus **[services.json](services.json.de.md)**. Minimaler Maßstab bei dem der Layer angezeigt werden soll.|false|
|autoRefresh|nein|Integer||Automatischer Reload des Layers. Angabe in ms. Minimum ist 500.|false|
|isNeverVisibleInTree|nein|Boolean|false|Anzeige, ob der Layer niemals im Themenbaum sichtbar ist.|false|
|urlIsVisible|nein|Boolean|true|Anzeige, ob die URL in der Layerinformation angezeigt werden soll.|false|

**Beispiel**
```
#!json
{
    "id": "myId",
    "name": "myGroupLayer",
    "children": [
        {
            "id": "123",
            "name": "myLayer_1"
        },
        {
            "id": "456",
            "name": "myLayer_2"
        }
    ]
}
```

***

### Themenconfig.Layer

[type:Extent]: # (Datatypes.Extent)
[type:Entity3D]: # (Themenconfig.Layer.Entity3D)
[type:WMS]: # (Themenconfig.Layer.WMS)

Hier werden die Layer definiert. Layer können auf viele verschiedene Arten konfiguriert werden. Ein Großteil der Attribute ist in der **[services.json](services.json.de.md)** definiert, kann jedoch hier am Layer überschrieben werden.
Neben diesen Attributen gibt es auch Typ-spezifische Attribute für **[WMS](#markdown-header-themenconfiglayerwms)** und **[Vector](#markdown-header-themenconfiglayervector)**.


|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|id|ja|String/String[]||Id des Layers. In der **[services.json](services.json.de.md)** werden die ids aufgelöst und die notwendigen Informationen herangezogen. ACHTUNG: Hierbei ist wichtig, dass die angegebenen ids dieselbe URL ansprechen, also den selben Dienst benutzen. Bei Konfiguration eines Arrays von Ids ist die Angabe der minScale und maxScale in der services.json für jeden Layer notwendig.|false|
|name|nein|String||Name des Layers.|false|
|entities|ja|**[Entity3D](#markdown-header-themenconfiglayerentity3d)**[]||Modelle, die angezeigt werden sollen |false|
|transparency|nein|Integer|0|Transparenz des Layers.|false|
|visibility|nein|Boolean|false|Sichtbarkeit des Layers.|false|
|supported|nein|String[]|["2D", "3D"]|Gibt die Modi an, in denen der Layer verwendet werden kann.|false|
|layerAttribution|nein|String||Wert aus **[services.json](services.json.de.md)**. HTML String. Dieser wird angezeigt, sobald der Layer aktiv ist.|false|
|legendURL|nein|String||Wert aus **[services.json](services.json.de.md)**. URL die verwendet wird, um die Legende anzufragen. Deprecated, bitte "legend" verwenden.|false|
|legend|nein|Boolean/String||Wert aus **[services.json](services.json.de.md)**. URL die verwendet wird, um die Legende anzufragen. Boolean-Wert um dynamisch die Legende aus dem WMS request oder dem styling zu generieren. String-Wert als Pfad auf Bild oder PDF-Datei.|false|
|maxScale|nein|String||Wert aus **[services.json](services.json.de.md)**. Maximaler Maßstab bei dem der Layer angezeigt werden soll.|false|
|minScale|nein|String||Wert aus **[services.json](services.json.de.md)**. Minimaler Maßstab bei dem der Layer angezeigt werden soll.|false|
|autoRefresh|nein|Integer||Automatischer Reload des Layers. Angabe in ms. Minimum ist 500.|false|
|isNeverVisibleInTree|nein|Boolean|false|Anzeige, ob der Layer niemals im Themenbaum sichtbar ist.|false|
|urlIsVisible|nein|Boolean|true|Anzeige, ob die URL in der Layerinformation angezeigt werden soll.|false|

**Beispiel mit einer Id**
```
#!json
{
    "id": "123"
}
```

**Beispiel mit einem Array von Ids**
```
#!json
{
    "id": ["123", "456", "789"],
    "name": "mein testlayer"
}
```

***

#### Themenconfig.Layer.WMS

[inherits]: # (Themenconfig.Layer)

Hier werden WMS typische Attribute aufgelistet.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|name|nein|String/String[]||Name des Layers. Falls das Attribute **styles** konfiguriert wird, muss dieses Attribute als Tpy String[] konfiguriert werden.|false|
|attributesToStyle|nein|String[]||Array von Attributen nach denen der WMS gestylt werden kann. Wird benötigt vom Werkzeug "styleWMS" in **[tools](#markdown-header-portalconfigmenutools)**.|false|
|extent|nein|**[Extent](#markdown-header-datatypesextent)**|[454591, 5809000, 700000, 6075769]|Nur für den 3D Modus relevant. Ausdehnung des Layers. Wenn nicht angegeben, wird er Extent der MapView verwendet.|false|
|featureCount|nein|Integer|1|Anzahl der Features, die bei einer GetFeatureInfo-Abfrage zurückgegeben werden sollen.|false|
|geomType|nein|String||Geometrietyp der Daten hinter dem WMS. Momentan wird nur "Polygon" unterstützt. Wird benötigt vom Werkzeug "styleWMS" in **[tools](#markdown-header-portalconfigmenutools)**.|false|
|styleable|nein|Boolean||Zeigt an, ob der Layer vom Werkzeug "styleWMS" verwendet werden kann. Wird benötigt vom Werkzeug "styleWMS" in **[tools](#markdown-header-portalconfigmenutools)**.|true|
|gfiAsNewWindow|nein|**[gfiAsNewWindow](#markdown-header-themenconfiglayerwmsgfiAsNewWindow)**|null|Wird nur berücksichtigt wenn infoFormat text/html ist.|true|
|styles|nein|String[]||Werden styles angegeben, so werden diese mit an den WMS geschickt. Der Server interpretiert diese Styles und liefert die Daten entsprechend zurück.|true|

**Beispiel**
```
#!json
{
    "id": "123456",
    "name": "MyWMSLayerName",
    "transparency": 0,
    "visibility": true,
    "supported": ["2D"],
    "extent": [454591, 5809000, 700000, 6075769],
    "layerAttribution": "MyBoldAttribution for layer 123456",
    "legend": "https://myServer/myService/legend.pdf",
    "maxScale": "100000",
    "minScale": "1000",
    "autoRefresh": "10000",
    "isNeverVisibleInTree": false,
    "attributesToStyle": ["MyFirstAttr"],
    "featureCount": 2,
    "geomType": "geometry",
    "gfiAsNewWindow": {
        "name": "_blank",
        "specs": "width=800,height=700"
    },
    "styleable": true,
    "styles": ["firstStyle", "secondStyle"]
}
```

***

#### Themenconfig.Layer.WMS.gfiAsNewWindow

Der Parameter *gfiAsNewWindow* wird nur berücksichtigt wenn infoFormat text/html ist.

Mit dem Parameter *gfiAsNewWindow* lassen sich html-Inhalte Ihres WMS-Service einfach in einem eigenen Fenster oder Browser-Tab öffnen, anstatt in einem iFrame im GFI.
Um html-Inhalte in einem einfachen Standard-Fenster des Browsers zu öffnen, geben Sie für *gfiAsNewWindow* anstatt *null* ein leeres Objekt an.

Sie können nun das Verhalten des Öffnens durch den Parameter *name* beeinflussen:

**Hinweis zur SSL-Verschlüsselung**

Ist *gfiAsNewWindow* nicht bereits eingestellt, wird *gfiAsNewWindow* automatisch gesetzt (mit Standard-Einstellungen), wenn die aufzurufende Url nicht SSL-verschlüsselt ist (https).

Nicht SSL-verschlüsselter Inhalt kann im Masterportal aufgrund der *no mixed content*-policy moderner Browser nicht in einem iFrame dargestellt werden.

Bitte beachten Sie, dass automatische Weiterleitungen (z.B. per Javascript) im iFrame auf eine unsichere http-Verbindung (kein SSL) nicht automatisch erkannt und vom Browser ggf. unterbunden werden.

Stellen Sie in einem solchen Fall *gfiAsNewWindow* wie oben beschrieben manuell ein.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|name|ja|enum["_blank_","_self_"]|"_blank"|Bei `"_blank"` öffnet sich ein neues Browser-Fenster oder ein neuer Browser-Tab (browserabhängig) mit dem html-Inhalt. Die Erscheinung des Fensters lässt sich mithilfe des Parameters *specs* beeinflussen. Bei `"_self"` öffnet sich der html-Inhalt im aktuellen Browser-Fenster.  |true|
|specs|nein|String||Beliebig viele der folgenden Einstellungen lassen sich durch durch Komma-Separation (z.B. {"specs": "width=800,height=700"}) kombinieren. Weitere Einstellungsmöglichkeiten entnehmen Sie bitte den einschlägigen Informationen zum Thema "javascript + window.open": [https://www.w3schools.com/jsref/met_win_open.asp](https://www.w3schools.com/jsref/met_win_open.asp) (deutsch), [https://javascript.info/popup-windows](https://javascript.info/popup-windows) (englisch), [https://developer.mozilla.org/en-US/docs/Web/API/Window/open](https://developer.mozilla.org/en-US/docs/Web/API/Window/open) (englisch)|true|

Beispiel:
```
#!json
{
    "id": "123456",
    // (...)
    "gfiAsNewWindow": {
        "name": "_blank",
        "specs": "toolbar=yes,scrollbars=yes,resizable=yes,top=0,left=500,width=800,height=700"
    },
    // (...)
}
```

***

#### Themenconfig.Layer.Tileset

[inherits]: # (Themenconfig.Layer)

Hier werden Tileset typische Attribute aufgelistet.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|hiddenFeatures|nein|String[]|[]|Liste mit IDs, die in der Ebene versteckt werden sollen|
|**[cesium3DTilesetOptions](https://cesiumjs.org/Cesium/Build/Documentation/Cesium3DTileset.html)**|nein|**[cesium3DTilesetOption](#markdown-header-themenconfiglayertilesetcesium3dtilesetoption)**||Cesium 3D Tileset Options, werden direkt an das Cesium Tileset Objekt durchgereicht. maximumScreenSpaceError ist z.B. für die Sichtweite relevant.|

**Beispiel**
```
#!json
{
    "id": "123456",
    "name": "TilesetLayerName",
    "visibility": true,
    "hiddenFeatures": ["id1", "id2"],
    "cesium3DTilesetOptions" : {
        maximumScreenSpaceError : 6
    },
}
```

***

#### Themenconfig.Layer.Tileset.cesium3DTilesetOption

Todo

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|maximumScreenSpaceError|nein|Number||Todo|

**Beispiel**
```
#!json
"cesium3DTilesetOptions" : {
    maximumScreenSpaceError : 6
}
```

***


#### Themenconfig.Layer.Terrain

[inherits]: # (Themenconfig.Layer)

Hier werden Terrain typische Attribute aufgelistet.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|**[cesiumTerrainProviderOptions](https://cesiumjs.org/Cesium/Build/Documentation/CesiumTerrainProvider.html)**|nein|**[cesiumTerrainProviderOption](#markdown-header-themenconfiglayerterraincesiumterrainprovideroption)**[]||Cesium TerrainProvider Options, werden direkt an den Cesium TerrainProvider durchgereicht. requestVertexNormals ist z.B. für das Shading auf der Oberfläche relevant.|

[cesiumTerrainProviderOptions]: https://cesiumjs.org/Cesium/Build/Documentation/CesiumTerrainProvider.html

**Beispiel**
```
#!json
{
    "id": "123456",
    "name": "TerrainLayerName",
    "visibility": true,
    "cesiumTerrainProviderOptions": {
        "requestVertexNormals" : true
    },
}
```

***

#### Themenconfig.Layer.Terrain.cesiumTerrainProviderOption

Todo

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|requestVertexNormals|nein|Boolean||Todo|

```
#!json
"cesiumTerrainProviderOptions": {
    "requestVertexNormals" : true
}
```

***

#### Themenconfig.Layer.Entity3D

Hier werden Entities3D typische Attribute aufgelistet.

|Name|Verpflichtend|Typ|default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|url|ja|String|""|URL zu dem Modell. Beispiel: `"https://hamburg.virtualcitymap.de/gltf/4AQfNWNDHHFQzfBm.glb"`|false|
|attributes|nein|**[Attribute](#markdown-header-themenconfiglayerentities3dattribute)**||Attribute für das Modell. Beispiel: `{"name": "test"}`|false|
|latitude|ja|Number||Breitengrad des Modell-Origins in Grad. Beispiel: `53.541831`|false|
|longitude|ja|Number||Längengrad des Modell-Origins in Grad. Beispiel: `9.917963`|false|
|height|nein|Number|0|Höhe des Modell-Origins. Beispiel: `10`|false|
|heading|nein|Number|0|Rotation des Modells in Grad. Beispiel: `0`|false|
|pitch|nein|Number|0|Neigung des Modells in Grad. Beispiel: `0`|false|
|roll|nein|Number|0|Roll des Modells in Grad. Beispiel: `0`|false|
|scale|nein|Number|1|Skalierung des Modells. Beispiel: `1`|false|
|allowPicking|nein|Boolean|true|Ob das Modell angeklickt werden darf (GFI). Beispiel: `true`|false|
|show|nein|Boolean|true|Ob das Modell angezeigt werden soll (sollte true sein). Beispiel: `true`|false|


**Beispiel**
```
#!json
{
    "id": "123456",
    "name": "EntitiesLayerName",
    "visibility": true,
    "entities": [
       {
         "url": "https://hamburg.virtualcitymap.de/gltf/4AQfNWNDHHFQzfBm.glb",
         "attributes": {
           "name": "Fernsehturm.kmz"
         },
         "latitude": 53.541831,
         "longitude": 9.917963,
         "height": 10,
         "heading": -1.2502079000000208,
         "pitch": 0,
         "roll": 0,
         "scale": 5,
         "allowPicking": true,
         "show": true
       }
     ]
}
```

***

#### Themenconfig.Layer.Entity3D.Attribute

|Name|Verpflichtend|Typ|default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|name|nein|String|""|Todo|false|

**Beispiel**
```
#!json
{
   "name": "Fernsehturm.kmz"
}
```

***

#### Themenconfig.Layer.StaticImage

[inherits]: # (Themenconfig.Layer)
[type:Extent]: # (Datatypes.Extent)

Mit StaticImage lassen sich Bilder als Layer laden und georeferenziert auf der Karte darstellen. Es werden die Formate jpeg und png unterstützt.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|id|ja|String||Es muss eine eindeutige ID vergeben werden.|false|
|typ|ja|String|"StaticImage"|Setzt den Layertypen auf StaticImage, welcher statische Bilder als Layer darstellen kann.|false|
|url|ja|String|"https://meinedomain.de/bild.png"|Link zu dem anzuzeigenden Bild.|false|
|name|ja|String|"Static Image Name"|Setzt den Namen des Layers für den Layerbaum.|false|
|extent|ja|**[Extent](#markdown-header-datatypesextent)**|[560.00, 5950.00, 560.00, 5945.00]|Gibt die Georeferenzierung des Bildes an. Als Koordinatenpaar werden im EPSG25832 Format die Koordinate für die Bildecke oben links und unten rechts erwartet.|false|


**Beispiel**
```
#!json
{
    "id": "12345",
    "typ": "StaticImage",
    "url": "https://www.w3.org/Graphics/PNG/alphatest.png",
    "name": "Testing PNG File",
    "visibility": true,
    "extent": [560296.72, 5932154.22, 562496.72, 5933454.22]
}
```

***
#### Themenconfig.Layer.Vector

[inherits]: # (Themenconfig.Layer)

Hier werden Vector typische Attribute aufgelistet. Vector Layer sind WFS, GeoJSON (nur in EPSG:4326), [SensorLayer](sensorThings.de.md), und Vector Tile Layer.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|clusterDistance|nein|Integer||Pixelradius. Innerhalb dieses Radius werden alle Features zu einem Feature "geclustered".|false|
|extendedFilter|nein|Boolean||Gibt an, ob dieser Layer vom Werkzeug "extendedFilter" in **[tools](#markdown-header-portalconfigmenutools)** verwendet werden kann.|false|
|filterOptions|nein|**[filterOption](#markdown-header-themenconfiglayervectorfilteroption)**[]||Filteroptionen die vom Werkzeug "wfsFeatureFilter" in **[tools](#markdown-header-portalconfigmenutools)** benötigt werden.|false|
|mouseHoverField|nein|String/String[]||Attributname oder Array von Attributnamen, die angezeigt werden sollen, sobald der User mit der Maus über ein Feature hovert.|false|
|nearbyTitle|nein|String/String[]||Attributname oder Array von Attributnamen die bei der Umkreissuche in der Ergebnisliste als Titel angezeigt werden sollen.|false|
|searchField|nein|String||Attributname nach dem die Searchbar diesen Layer durchsucht.|false|
|additionalInfoField|nein|String|"name"|Attributname des Features für die Hitlist in der Searchbar. Ist das Attribut nicht vorhanden, wird der Layername angegeben.|false|
|styleId|nein|String||Id die den Style definiert. Id wird in der **[style.json](style.json.de.md)** aufgelöst.|false|
|styleGeometryType|nein|String/String[]||Geometrietypen für einen WFS-Style, falls nur bestimmte Geometrien eines Layers angezeigt werden sollen **[siehe dazu](style.json.md#markdown-header-abbildungsvorschriften)**.|false|
|hitTolerance|nein|String||Clicktoleranz bei der ein Treffer für die GetFeatureInfo-Abfrage ausgelöst wird.|false|
|vtStyles|nein|**[vtStyle](#markdown-header-themenconfiglayervectorvtstyle)**[]||Auswählbare externe Style-Definition (nur für Vector Tile Layer)|false|
|useMpFonts|nein|Boolean|true|Nur für *Vector Tile Layer*. Schalter um die Schriftarten/Fontstacks aus externen Style-Definitionen durch die Standard-Schriftart des Masterportals zu ersetzen, um sicherzustellen dass alle Labels dargestellt werden können. Wenn auf false gesetzt, müssen die benötigten fonts ggf. separat z.B. via '<link rel=stylesheet ...>' in index.html eingebunden werden.|false|
|loadingStrategy|nein|String|"bbox"|Ladestrategie zum Laden der Features. Mögliche Werte sind "bbox" oder "all". **[siehe dazu](https://openlayers.org/en/latest/apidoc/module-ol_loadingstrategy.html)**.|false|

**Beispiel**
```
#!json
{
    "id": "123456",
    "name": "MyVectorLayerName",
    "transparency": 0,
    "visibility": true,
    "supported": ["2D"],
    "extent": [454591, 5809000, 700000, 6075769],
    "layerAttribution": "MyBoldAttribution for layer 123456",
    "legend": "https://myServer/myService/legend.pdf",
    "maxScale": "100000",
    "minScale": "1000",
    "autoRefresh": "10000",
    "isNeverVisibleInTree": false,
    "clusterDistance": 60,
    "extendedFilter": true,
    "loadingStrategy": "all",
    "filterOptions": [
        {
            "fieldName": "myFirstAttributeToFilter",
            "filterName": "Filter_1",
            "filterString": ["*", "value1", "value2"],
            "filterType": "combo"
        },
        {
            "fieldName": "mySecondAttributeToFilter",
            "filterName": "Filter_2",
            "filterString": ["*", "value3", "value4"],
            "filterType": "combo"
        }
    ],
    "mouseHoverField": "name",
    "nearbyTitle": "name",
    "searchField": "name",
    "styleId": "123456",
    "hitTolerance": 50
},
{
    "id" : "11111",
    "name" : "lokale GeoJSON",
    "url" : "portal/master/test.json",
    "typ" : "GeoJSON",
    "gfiAttributes" : "showAll",
    "layerAttribution" : "nicht vorhanden",
    "legend" : true
}
```

***

#### Themenconfig.Layer.Vector.filterOption
Filteroption die vom Werkzeug "wfsFeatureFilter" in **[tools](#markdown-header-portalconfigmenutools)** benötigt wird.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|fieldName|ja|String||Attributname nach dem zu filtern ist.|false|
|filterName|ja|String||Name des Filters im Werkzeug.|false|
|filterString|ja|String[]||Array von Attributwerten nach denen gefiltert werden kann. Bei "*" werden alle Wertausprägungen angezeigt.|false|
|filterType|ja|String||Typ des Filters. Momentan wird nur "combo" unterstützt.|false|

**Beispiel**
```
#!json
{
    "fieldName": "myFirstAttributeToFilter",
    "filterName": "Filter_1",
    "filterString": ["*", "value1", "value2"],
    "filterType": "combo"
}
```

#### Themenconfig.Layer.Vector.vtStyle
Style-Definition; nur für Vector Tile Layer.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|id|ja|String||serviceübergreifend eindeutige ID|false|
|name|ja|String||Anzeigename, z.B. für das Auswahltool|false|
|url|ja|String||URL, von der der Style bezogen werden kann. Die verlinkte JSON muss zur [Mapbox Style Specification](https://docs.mapbox.com/mapbox-gl-js/style-spec/) passen.|false|
|defaultStyle|nein|String||Falls hier `true` gesetzt ist, wird der Style initial ausgewählt, unabhängig von seinem Index; wenn das Feld nirgends auf `true` gesetzt ist, wird der erste Style benutzt|false|

**Beispiel**
```
#!json
{
    "id": "EINDEUTIGE_ID",
    "name": "Rote Linien",
    "url": "https://example.com/asdf/styles/root.json",
    "defaultStyle": true
}
```

***

# Datatypes
In diesem Kapitel werden die erwarteten Datentypen definiert.

## Datatypes.Coordinate

Eine Koordinate besteht aus einem Array bestehend aus zwei Zahlen. Die erste repräsentiert den Rechtswert, die zweite den Hochwert.

**Beispiel Koordinate bestehend aus Ganzzahlen(Integer)**
```
#!json
[561210, 5932600]
```

**Beispiel Koordinate bestehend aus Gleitkommazahlen(Float)**
```
#!json
[561210.1458, 5932600.12358]
```

***

## Datatypes.Extent

Ein Extent besteht aus einem Array bestehend aus vier Zahlen. Ein Extent beschreibt einen rechteckigen Gültigkeitsbereich. Dabei wird ein Rechteck aufgespannt, das durch die "linke untere" und die "rechte obere" Ecke definiert wird. Das Schema lautet [Rechtswert-Links-Unten, Hochwert-Links-Unten, Rechtswert-Rechts-Oben, Hochwert-Rechts-Oben] oder [minx, miny, maxx, maxy].

**Beispiel Extent**
```
#!json
[510000.0, 5850000.0, 625000.4, 6000000.0]
```

***

## Datatypes.CustomObject

Ein Objekt mit den benötigten Inhalten.
Parameter können je nach Konfiguration, Verwendung und Backend-Komponenten unterschiedlich sein.

***

## Datatypes.LayerId

Ein String, der auf eine Layer Id aus der services-internet.json verweist. Im Beispiel wird mit der Id "1711" auf den Layer "Krankenhäuser" in der services-internet.json der Stadt Hamburg verwiesen.

**Beispiel LayerId**
```json
"1711"
```

***
