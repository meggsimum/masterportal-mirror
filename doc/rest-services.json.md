>**[Return to the Masterportal documentation](doc.md)**.

# rest-services.json

This is the file referred to by the *config.js* as `restConf`. It is read on Masterportal start-up and kept in memory. Modules may then refer to the web service definitions in it.

The file defines all web services that do not belong to OGC services like WMS and WFS; that is, all services not requested for visually representing data. See our **[master restConf file](https://bitbucket.org/geowerkstatt-hamburg/masterportal-config-public/src/master/rest-services-internet.json)** for an example.

|Name|Required|Type|Default|Description|Example|
|----|--------|----|-------|-----------|-------|
|id|yes|String||Unique `rest-services.json` entry ID|`"1"`|
|name|yes|String||Service name|`"CSW Summary"`|
|typ|yes|String||Service type|`"CSW"`|
|url|yes|String||Service URL|`"http://metaver.de/trefferanzeige?docuuid="`|


## Usually defined services

1. Print services
2. Metadata sources (CSW HMDK)
3. BKG geocoding service
4. Gazetteer URL
5. WPS
6. Email Services
7. virtualcityPLANNER Service

In some scenarios different URLs are required, depending on whether requests are sent from an Intranet or the Internet. This can be solved by providing two files only differing in their service URLs. While filenames can be chosen freely, we suggest using these names:

* `rest-services-internet.json`
* `rest-services-intranet.json`

## `rest-services-internet.json` example file

```json
[
  {
    "id": "1",
    "name": "CSW HMDK Summary",
    "url": "http://metaver.de/csw?service=CSW&version=2.0.2&request=GetRecordById&typeNames=csw:Record&elementsetname=summary",
    "typ": "CSW"
  },
  {
    "id" : "2",
    "name" : "Metadata URL",
    "url" : "http://metaver.de/trefferanzeige?docuuid=",
    "typ" : "URL"
  }
]
```
## Print services

|Name|Required|Type|Default|Description|Example|
|----|--------|----|-------|-----------|-------|
|id|yes|String||Unique `rest-services.json` entry ID|`"1"`|
|name|yes|String||Service name|`"MapFishPrintService"`|
|typ|yes|String||Service type|`"Print"`|
|url|yes|String||Service URL|`"https://printbase.de/printfolder/"` or `"https://printbase.de/printfolder/print/"`|


```json
{
    "id" : "mapfish_internet",
    "name" : "MapFishPrintService",
    "typ": "Print",
    "url": "https://printbase.de/printfolder/"

}
```

## virtualcityPLANNER Service

|Name|Required|Type|Default|Description|Example|
|----|--------|----|-------|-----------|-------|
|id|yes|String||Unique `rest-services.json` entry ID|`"1"`|
|name|yes|String||Service name|`"virtualcityPLANNER 1"`|
|typ|yes|String||Service type|`"virtualcityPLANNER"`|
|url|yes|String||Service URL|`"https://devel.virtualcityplanner.de"`|
|scenarioId|yes|String||ScenarioId|`"BjtEA4zwBEiZeG2CX"`|
|projectId|yes|String||ProjectId|`"2wbbuKTSqojZMBooz"`|

```json
{
    "id" : "virtualcityPLANNER",
    "name" : "virtualcityPLANNER",
    "url": "https://devel.virtualcityplanner.de",
    "projectId": "2wbbuKTSqojZMBooz",
    "typ": "virtualcityPLANNER",
    "scenarioId": "BjtEA4zwBEiZeG2CX"
}
```
