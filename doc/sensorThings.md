>**[Return to the Masterportal documentation](doc.md)**.

[TOC]

# Sensor Layer

This document describes the technical details of the Masterportal's sensor layer based on the *SensorThingsAPI*.

## Definition of terms

### OGC SensorThingsAPI

The OGC's (Open Geospatial Consortium) SensorThingsAPI "provides an open standard-based and geospatial-enabled framework to interconnect the Internet of Things devices, data, and applications over the Web." ([source](https://docs.opengeospatial.org/is/15-078r6/15-078r6.html#6)) The framework provides a data model describing the connection between the "Broker" (Server), a network of "Publishers" (Sensors), and "Clients" (in this case, the Masterportal application).

For more information on the open standard-based *SensorThingsAPI*, visit:

 - [https://docs.opengeospatial.org/is/15-078r6/15-078r6.html#1](https://docs.opengeospatial.org/is/15-078r6/15-078r6.html#1)
 - [http://developers.sensorup.com/docs/](http://developers.sensorup.com/docs/)
 - [https://gost1.docs.apiary.io/#reference/0/things](https://gost1.docs.apiary.io/#reference/0/things)

For a quick overview of the data model, see [The Sensing Entities](http://docs.opengeospatial.org/is/15-078r6/15-078r6.html#24).

### FROST Server

The FROST Server is an open source SensorThings Server developed by the Fraunhofer Institut. It is "a Server implementation of the OGC SensorThings API." ([source](https://github.com/FraunhoferIOSB/FROST-Server)) It acts as the Broker, establishing a link between Publishers (sensors) and the Client (Masterportal, browser). Calls to the FROST Server can be in pure *http* to use its REST API, or you may establish a bidirectional link via *mqtt* or *CoAP*.

### The REST API - HTTP

To subscribe to required IDs of Things, use a HTTP REST call to fetch all required IDs.

>⚠️ `expand`, `filter`, and so on as URL query parameters are usable with HTTP REST calls only. With mqtt, you may subscribe to a plain path, and URL queries ("?" and beyond) will be ignored.

Basic examples for data calls via REST API:

- [Overview](https://iot.hamburg.de/)
- [All things of the SensorThingsAPI](https://iot.hamburg.de/v1.0/Things)
- [One thing of the SensorThingsAPI](https://iot.hamburg.de/v1.0/Things(26))
- [One data stream](https://iot.hamburg.de/v1.0/Datastreams(74))
- [All data streams of one thing](https://iot.hamburg.de/v1.0/Things(26)/Datastreams)
- [All observations of a data stream](https://iot.hamburg.de/v1.0/Datastreams(74)/Observations)

The FROST Server implements a REST API that allows you to `expand` and `filter` the query based on a query language comparable to SQL. To join tables, use the `$expand` tag as URL query parameter, and separate multiple joins with a comma.

- [One Thing with its Location](https://iot.hamburg.de/v1.0/Things(26)?$expand=Locations)
- [One Thing with its Location and Observations](https://iot.hamburg.de/v1.0/Things(26)?$expand=Locations,Datastreams/Observations) (note that observations are in relation to data streams, not things)

To filter things without knowing their identifier, use `$filter` as URL query parameter.

- [Find a Thing by its name with `$filter=name eq '...'`](https://iot.hamburg.de/v1.0/Things?$filter=name%20eq%20%27StadtRad-Station%20Grandweg%20/%20Veilchenweg%27)

To order things, use `$orderby`. This can e.g. be used to retrieve the latest Observation by ordering Observations descending by date and adding `$top=1` to fetch the first element only.

- [Order the Observations and pick the first one using `$orderby=phenomenonTime desc&$top=1`](https://iot.hamburg.de/v1.0/Datastreams(74)/Observations?$orderby=phenomenonTime%20desc&$top=1)

You may also use nested statements:

 - [`?$expand=Datastreams($expand=Observations),Locations`](http://iot.hamburg.de/v1.0/Things(614)?$expand=Datastreams($expand=Observations),Locations)

To retrieve Things within an extent, use a `POLYGON`:

 - [Retrieve things within a polygon](https://iot.hamburg.de/v1.0/Things?$filter=startswith(Things/name,%27StadtRad-Station%27)%20and%20st_within(Locations/location,geography%27POLYGON%20((10.0270%2053.5695,10.0370%2053.5695,10.0370%2053.5795,10.0270%2053.5795,10.0270%2053.5695))%27)&$expand=Locations)

URL in detail:

- https://iot.hamburg.de/v1.0/Things?
- $filter=
  - startswith(Things/name,'StadtRad-Station')
  - and st_within(
    - Locations/location,geograph'POLYGON ((
      - 10.0270 53.5695,
      - 10.0370 53.5695,
      - 10.0370 53.5795,
      - 10.0270 53.5795,
      - 10.0270 53.5695
    - ))'
  - )
- &$expand=Locations

You will only receive Things located within the given polygon. Use this to increase network request speed by only retrieving and subscribing to Things in the user's current view.

### The REST API - mqtt

mqtt is a protocol developed for the *Internet of Things* to keep an open connection to servers and communicate with pull (commands from client to server) and push (messages from server to client) requests, using an established connection that does not close in the meantime.

In the browser, this might e.g. be implemented by using socket.io.

If you use npm, refer to the mqtt package instead.

The Client uses the mqtt protocol to subscribe to a Topic. A Topic is a plain path to something, e.g. `v1.0/Datastreams(74)/Observations`. Note that the host is given to mqtt during the connect operation, and is omitted during further interaction.

After subscribing to a Topic (e.g. `v1.0/Datastreams(74)/Observations`), the server will push every new message (in this case, a new Observation in Datastream 74), using the opened mqtt connection, to the Client.

As mqtt may only subscribe and unsubscribe Topics, you have to use HTTP requests (as shown above) to assemble the parts of your Topic. All entities of the SensorThingsAPI can be requested as Topic.

As mentioned before, you can only subscribe to plain REST URLs. Everything in the query part will be ignored:

- positive mqtt example: `mqtt://iot.hamburg.de/v1.0/Datastreams(74)/Observations`
- negative mqtt example: ` mqtt://iot.hamburg.de/v1.0/Datastreams(74)?$expand=Observations`

Currently used mqtt versions:

 - [mqtt v3.1](http://public.dhe.ibm.com/software/dw/webservices/ws-mqtt/mqtt-v3r1.html)
 - [mqtt v3.1.1](https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/mqtt-v3.1.1.html)
 - [mqtt v5.0](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html)

## SensorThingsHttp

The SensorThingsAPI provides automatic splitting of server responses to chunks to avoid overly large payloads. This allows displaying the progress of SensorThingsAPI calls for improved user experience. See [Automatic Split](#markdown-header-automatic-split) for details.

The request can be minimized further by limiting it to the extent currently visible in the browser. See [Automatic call in Extent](#markdown-header-automatic-call-in-extent) for details.

The Masterportal implements a software layer called `SensorThingsHttp` that provides the both split and extent handling.

>⚠️ Please mind that automatic progress and "call in extent" are only available if your server side implementation of the SensorThingsAPI (e.g. the FROST Server) provides - *and has set to active!* - the skip and geography functions.

### Automatic split

Your server configuration should activate the automatic splitting of responses. When activated, responses too large for a single response will contain a follow-up link ("@iot.nextLink") to the next data chunk. The total number of chunks is included as "@iot.count" value.

Using the `SensorThingsHttp.get()` function, the `SensorThingsHttp` layer handles "@iot.nextLink" (see [The "@iot.nextLink" Value](#markdown-header-the-iotnextlink-value)) and "@iot.count" (see [The "@iot.count" Value](#markdown-header-the-iotcount-value)) for you.

Here is a basic implementation of `SensorThingsHttp`, using basic events of the Masterportal, to show its functionality:

```js
import {SensorThingsHttp} from "@src/utils/sensorThingsHttp";

const http = new SensorThingsHttp(),
    url = "https://iot.hamburg.de/v1.0/Things";
http.get(url, function (response) {
    // onsuccess
    // do something with the complete response
}, function () {
    // onstart
    Radio.trigger("Util", "showLoader");
}, function () {
    // oncomplete (always called finally)
    Radio.trigger("Util", "hideLoader");
}, function (error) {
    // onerror
    console.warn(error);
}, function (progress) {
    // onprogress
    // the progress (percentage = Math.round(progress * 100)) to update your progress bar with
});

```

Please note that the `http.get` call in itself is asynchronous. All parameters of `SensorThingsHttp.get()`, except for `url`, are optional. At least a function for `onsuccess` should be provided anyway, or the response is lost.

### Configuration

SensorThingsHttp can be configured with two parameters via constructor.

|name|mandatory|type|default|description|example|
|----|-------------|---|-------|------------|--------|
|removeIotLinks|No|Boolean|false|removes all "@iot.navigationLink" and "@iot.selfLink" from the response to reduce the size of the result|`const http = new SensorThingsHttp({removeIotLinks: true});`|
|httpClient|No|Function|null|can be used to change the default http handler (in our case axios), e.g. for testing|`const http = new SensorThingsHttp({httpClient: (url, onsuccess, onerror) => {}});`|

### The "@iot.nextLink" value

If you don't want to use `SensorThingsHttp` to automatically split the data, here are some hints regarding your implementation.

If a call's response contains too many datasets, the server splits the result into chunks, indicated by a "@iot.nextLink" for the follow-up chunk. You can follow through all "@iot.nextLink" URLs, gathering the responses until the end of data is received. If no follow-up link ("@iot.nextLink") exists, all chunks have been retrieved.

#### Example

The following URL will fetch 100 datasets, and the response will include an "@iot.nextLink" to the next chunk: [All Things](https://iot.hamburg.de/v1.0/Things)

```json
{
  "@iot.nextLink" : "https://iot.hamburg.de/v1.0/Things?$skip=100",
  "value" : [{
      "...": "..."
  }]
}
```

Calling the nextLink ([https://iot.hamburg.de/v1.0/Things?$skip=100](https://iot.hamburg.de/v1.0/Things?$skip=100)) provides you with the next chunk of data and another follow-up link ("@iot.nextLink") and so on, until the last dataset is reached.

### @iot.nextLink structures

If you don't want to use `SensorThingsHttp` to automatically follow @iot.nextLinks, please mind the following hint.

Complex calls to the SensorThingsAPI may result in many chunks. The FROST Server is capable to split any delivered array - also in sub-structures - and provide them with an @iot.nextLink. These links hold the split array's key as prefix; e.g. Observations@iot.nextLink, or Datastreams@iot.nextLink.

#### Example

- URL: [https://udh-hh-iot-qs.germanynortheast.cloudapp.microsoftazure.de/v1.0/Things?$expand=Datastreams($top=2;$expand=Observations($top=2))](https://udh-hh-iot-qs.germanynortheast.cloudapp.microsoftazure.de/v1.0/Things?$expand=Datastreams($top=2;$expand=Observations($top=2)))
- Response: Many Things, with lots of Datastreams and Observations.
- Hint: In this example, we use `$top=2` to enforce splitting with [prefix]@iot.nextLink on any expanded sublevel.

```json
{
    "@iot.nextLink" : "https://udh-hh-iot-qs.germanynortheast.cloudapp.microsoftazure.de/v1.0/Things?$skip=100&$expand=Datastreams%28%24top%3D2%3B%24expand%3DObservations%28%24top%3D2%29%29",
    "value" : [ {
        "Datastreams" : [ {
            "Observations" : [...],
            "Observations@iot.nextLink" : "https://udh-hh-iot-qs.germanynortheast.cloudapp.microsoftazure.de/v1.0/Datastreams(13976)/Observations?$top=2&$skip=2",
        }, {
            "Observations" : [...],
            "Observations@iot.nextLink" : "https://udh-hh-iot-qs.germanynortheast.cloudapp.microsoftazure.de/v1.0/Datastreams(13978)/Observations?$top=2&$skip=2",
        } ],
        "Datastreams@iot.nextLink" : "https://udh-hh-iot-qs.germanynortheast.cloudapp.microsoftazure.de/v1.0/Things(5432)/Datastreams?$top=2&$skip=2&$expand=Observations%28%24top%3D2%29",
    }]
}
```

On following the [Datastreams@iot.nextLink](https://udh-hh-iot-qs.germanynortheast.cloudapp.microsoftazure.de/v1.0/Things(5432)/Datastreams?$top=2&$skip=2&$expand=Observations%28%24top%3D2%29), a structure describing further Datastreams is returned:

```json
{
    "@iot.nextLink" : "https://udh-hh-iot-qs.germanynortheast.cloudapp.microsoftazure.de/v1.0/Things(5432)/Datastreams?$top=2&$skip=4&$expand=Observations%28%24top%3D2%29",
    "value" : [ {
        "Observations" : [...],
        "Observations@iot.nextLink" : "https://udh-hh-iot-qs.germanynortheast.cloudapp.microsoftazure.de/v1.0/Datastreams(13980)/Observations?$top=2&$skip=2",
    }]
}
```

Keep in mind that a single Thing has neither an @iot.nextLink, nor a "value" key. E.g. [this link](https://udh-hh-iot-qs.germanynortheast.cloudapp.microsoftazure.de/v1.0/Things(5432)?$expand=Datastreams($top=2)) returns such a feature. Still, this case contains [prefix]@iot.nextLinks to follow in nested structures.

### @iot.nextLink and depth barriers

The end of @iot.nextLink follow-ups is marked by the absence of a next @iot.nextLink to follow.

However: If you limit the response using `$top=X` (with X being the number of entities to load), an @iot.nextLink may exist.
Following these links will lead to a cascade of server calls - for example, `$top=1` on a request that would return 1000 entities would start 1000 server calls, slowing down the system immensely.

[Example call for this scenario](https://udh-hh-iot-qs.germanynortheast.cloudapp.microsoftazure.de/v1.0/Datastreams(13980)/Observations?$top=1)
```json
{
  "@iot.nextLink" : "https://udh-hh-iot-qs.germanynortheast.cloudapp.microsoftazure.de/v1.0/Datastreams(13980)/Observations?$top=1&$skip=1",
  "value" : [ {...} ]
}
```

Unfortunately, you may not simply ignore @iot.nextLinks if you find a `$top=X` in the @iot.nextLink, as the X in `$top=X` may exceed "the service-driven pagination limitation", and multiple requests are required to actually retrieve X entities:

> "In addition, if the $top value exceeds the service-driven pagination limitation (...), the $top query option SHALL be discarded and the server-side pagination limitation SHALL be imposed." ([source](https://docs.opengeospatial.org/is/15-078r6/15-078r6.html#51))

An @iot.nextLink search for `$top=X` or `%24top=X` in combination with `$skip=Y` or `%24skip=Y` will do the trick, as any `$top=X` not related to the root structure is url encoded with "%3D" instead of "=".

Example: [https://udh-hh-iot-qs.germanynortheast.cloudapp.microsoftazure.de/v1.0/Things(5432)/Datastreams?%24top=2&%24skip=2&%24expand=Observations%28%24top%3D2%29](https://udh-hh-iot-qs.germanynortheast.cloudapp.microsoftazure.de/v1.0/Things(5432)/Datastreams?%24top=2&%24skip=2&%24expand=Observations%28%24top%3D2%29)

- Regex for `$top=X`: `/[\$|%24]top=([0-9]+)/`
- Regex for `$skip=X`: `/[\$|%24]skip=([0-9]+)/`

Use this pseudo-code as guideline for your additional depth barrier:

```pseudo
// pseudo code, some nextLink is given
int topX = fetchTopFromNextLink(nextLink);
int skipX = fetchSkipFromNextLink(nextLink);

if (topX > 0 && topX <= skipX) {
    // do not follow (depth barrier reached)
}
```

### The "@iot.count" Value

The number of expected chunks can be requested by adding `$count=true` to the call, which will fill the value for "@iot.count" in the response.

This total number in combination with the current skip value can be used to calculate the loading progress of the application, which may then be shown to the user by a loading bar or other UI elements.

#### Example

To get the total number of datasets to expect from a call, simply add `$count=true` to any *SensorThingsAPI* URL: [https://iot.hamburg.de/v1.0/Things?$count=true](https://iot.hamburg.de/v1.0/Things?$count=true)

```json
{
  "@iot.count" : 4723,
  "@iot.nextLink" : "https://iot.hamburg.de/v1.0/Things?$skip=100&$count=true",
  "value" : [ {
      "...": "..."
  }]
}
```

Combining the absolute number ("@iot.count") and the value of the current `$skip` parameter gives you the progress with `1 / @iot.count * skip`.

### Automatic use of extent

You may want your server implementation of the *SensorThingsAPI* (e.g. the FROST Server) to return data only within a given extent (e.g. a polygon). The FROST Server provides you with this functionality. To use this feature, the `SensorThingsHttp` layer provides a method `SensorThingsHttp.getInExtent()` to retrieve data only within the given extent.

Using `SensorThingsHttp.getInExtent()`, you may also use the splitting progress explained [above](#markdown-header-automatic-split). The `SensorThingsHttp` layer creates the correct URL query parameter `st_within(Locations/location,geography'POLYGON ((...))')` (see [The use of POLYGON](#the_use_of_polygon)) for you.

The extent needs to be described including its source projection and target projection. The following extent options are mandatory for the use of `SensorThingsHttp.getInExtent()`:

|name|mandatory|type|default|description|example|
|----|---------|----|-------|-----------|-------|
|extent|yes|Number[]|-|the extent of your current view|[556925.7670922858, 5925584.829527992, 573934.2329077142, 5942355.170472008]|
|sourceProjection|yes|String|-|the extent's projection|"EPSG:25832"|
|targetProjection|yes|String|-|projection expected by the *SensorThingsAPI* server|"EPSG:4326"|

See this basic implementation of `SensorThingsHttp` to receive data within the browser's current view extent only, using Masterportal events to show its functionality, as an example:

```js
import {SensorThingsHttp} from "@src/utils/sensorThingsHttp";

const http = new SensorThingsHttp(),
    extent = Radio.request("MapView", "getCurrentExtent"),
    projection = Radio.request("MapView", "getProjection").getCode(),
    epsg = this.get("epsg"),
    url = "https://iot.hamburg.de/v1.0/Things";

http.getInExtent(url, {
    extent: extent,
    sourceProjection: projection,
    targetProjection: epsg
}, function (response) {
    // on success
    // do something with the response

}, function () {
    // on start (always called)
    Radio.trigger("Util", "showLoader");

}, function () {
    // on complete (always called)
    Radio.trigger("Util", "hideLoader");

}, function (error) {
    // on error
    console.warn(error);

}, function (progress) {
    // on wait
    // the progress to update your progress bar with
    // to get the percentage use Math.round(progress * 100)
});

```

When using `SensorThingsHttp.getInExtent()`, the `url` and `extent` parameters are mandatory. To retrieve the response you need to set the third parameter as an on success function. The others are optional.

An optional eighth parameter `httpClient` exists that can be used to replace the default HTTP handler, which is `axios`. This optional `httpClient`, if used, must be a function with parameters `url`, `onsuccess`, and `onerror`.

### The use of `POLYGON`

If you don't want to use `SensorThingsHttp` software layer to access sensors in the current map view, consider these hints for your convenience.

To receive data only in a specified extent, the *SensorThingsAPI* provides certain geospatial functions using `POINT` or `POLYGON` structures. See [the documentation](https://docs.opengeospatial.org/is/15-078r6/15-078r6.html#56) for more details. You may set your extent by using such a `POLYGON`, using the Location of Things to filter them by,

Basic example:

[https://iot.hamburg.de/v1.0/Things?$filter=st_within(Locations/location,geography%27POLYGON%20((10.0270%2053.5695,10.0370%2053.5695,10.0370%2053.5795,10.0270%2053.5795,10.0270%2053.5695))%27)&$expand=Locations](https://iot.hamburg.de/v1.0/Things?$filter=st_within(Locations/location,geography%27POLYGON%20((10.0270%2053.5695,10.0370%2053.5695,10.0370%2053.5795,10.0270%2053.5795,10.0270%2053.5695))%27)&$expand=Locations)

>⚠️ Convert your projection to the projection used by the *SensorThingsAPI*. If the server uses "EPSG:4326", but your Masterportal is set to "EPSG:25832", you must use OpenLayers (or `masterportalAPI/src/crs`, exporting a `transform` function) to convert the coordinates.

Example to transform a Location from your current projection into "EPSG:4326":

```js
import {transform} from "@masterportal/masterportalapi/src/crs";

const extent = Radio.request("MapView", "getCurrentExtent"),
    projection = Radio.request("MapView", "getProjection").getCode(),
    epsg = "EPSG:4326",
    topLeftCorner = transform(projection, epsg, {x: extent[0], y: extent[1]}),
    bottomRightCorner = transform(projection, epsg, {x: extent[2], y: extent[3]});

```

This way you will get the top left and bottom right corner of the view. To draw yourself a `POLYGON` to be used with *SensorThingsAPI* from that, the rectangle needs to be constructed as follows:

```js
const extent = Radio.request("MapView", "getCurrentExtent"),
    polygon = [
        {x: extent[0], y: extent[1]},
        {x: extent[2], y: extent[1]},
        {x: extent[2], y: extent[3]},
        {x: extent[0], y: extent[3]},
        {x: extent[0], y: extent[1]}
    ];

```

## SensorThingsMqtt

The Masterportal SensorThings software layer is capable of handling mqtt subscriptions for `mqtt 3.1`, `mqtt 3.1.1`, and `mqtt 5.0`. The mqtt version running on the server to be used has to be known and used in `SensorThingsMqtt`'s constructor.

This is a basic example for `mqtt 5.0`:

```js
import {SensorThingsMqtt} from "./sensorThingsMqtt";

const mqtt = new SensorThingsMqtt({
        mqttUrl: "wss://iot.hamburg.de/mqtt",
        mqttVersion: "5.0",
        context: this
    });

mqtt.on("message", (topic, message, packet) => {
    // handler
    console.log("received message:", topic, message, packet);
}, error => {
    // onerror
    console.warn(error);
});

mqtt.subscribe("v1.0/Datastreams(1234)/Observations", {
    rh: 0
}, () => {
    // onsuccess
    console.log("success");
}, error => {
    // onerror
    console.warn(error);
});
```

This is a basic example for `mqtt 3.1` and `3.1.1`:

```js
import {SensorThingsMqtt} from "./sensorThingsMqtt";

const mqtt = new SensorThingsMqtt({
        mqttUrl: "wss://iot.hamburg.de/mqtt",
        mqttVersion: "3.1.1", // "3.1" respective
        rhPath: "https://iot.hamburg.de",
        context: this
    });

mqtt.on("message", (topic, message, packet) => {
    // handler
    console.log("received message:", topic, message, packet);
}, error => {
    // onerror
    console.warn(error);
});

mqtt.subscribe("v1.0/Datastreams(1234)/Observations", {
    rh: 0
}, () => {
    // onsuccess
    console.log("success");
}, error => {
    // onerror
    console.warn(error);
});
```

Please note that Messages are not received when using "subscribe", but will come in via an `on(message)` event.

The `on(message)` event's messages must be redirected to your processes with help of the supplied topics.

### Configuration - Constructor

The software layer `SensorThingsMqtt` is a class to be configured at construction time. Creating a new instance, the connection to the mqtt Server is established once per instance in the background.

|name|mandatory|type|default|description|example|
|----|---------|----|-------|-----------|-------|
|mqttUrl|yes|String|""|The url to your mqtt server.|"wss://iot.hamburg.de/mqtt"|
|mqttVersion|no|String|"3.1.1"|The mqtt version your server runs on.|"3.1", "3.1.1", "5.0"|
|rhPath|no|String|""|For 3.1 and 3.1.1 only, you need to set the basic http path to your *SensorThingsAPI* to simulate Retained Handling.|"https://iot.hamburg.de"|
|context|no|JavaScript Scope|The scope to run the events in.|If you set the context to `this`, you can use `this` in your event functions to reach your current module.|this|

#### mqttUrl

mqttUrl is the URL to connect to the mqtt service. The URL may use any of the protocols 'mqtt', 'mqtts', 'tcp', 'tls', 'ws', or 'wss'. See the [mqtt package documentation](https://www.npmjs.com/package/mqtt) for additional details.

#### mqttVersion

The mqttVersion will trigger different behavior of the `SensorThingsMqtt` software layer.

- "3.1": the internal protocolId is "MQIsdp" (3.1.1 and 5.0 use "MQTT"); the internal protocolVersion is 3 (3.1.1 and 5.0 use protocolVersion 4); simulation of Retained Handling will be activated if you provide a rhPath
- "3.1.1": simulation of Retained Handling will be activated if you provide a rhPath
- "5.0": no simulation of Retained Handling necessary (you must not provide a rhPath!), the event `on("disconnect")` is provided as feature for 5.0

#### rhPath

The rhPath is used to simulate Retained Handling on mqtt versions 3.1 and 3.1.1, and has to be set to protocol plus domain. To figure out your rhPath, think of it as the missing prefix for a Topic.

E.g., if you accessed your *SensorThingsAPI* via "https://iot.hamburg.de/v1.0/Things(1234)/Datastreams", you'd subscribe to a Topic via mqtt with "v1.0/Things(1234)/Datastreams". The rhPath is the leftover URL part missing to actually receive data via http. In this case, "https://iot.hamburg.de" is the rhPath.

Be aware that your http path might differ from your mqtt path depending on the protocol to be used; e.g. "wss://iot.hamburg.de/mqtt" could be an rhPath to subscribe to "v1.0/Things(1234)/Datastreams".

Examples:
 - *SensorThingsAPI*: "https://iot.hamburg.de/v1.0/Things(1234)/Datastreams"
 - mqttUrl: "wss://iot.hamburg.de/mqtt"
 - Topic: "v1.0/Things(1234)/Datastreams"
 - rhPath: "https://iot.hamburg.de"

### Configuration - Subscribe

After construction, you can subscribe using the instance of `SensorThingsMqtt`.

|name|mandatory|type|default|description|example|
|----|---------|----|-------|-----------|-------|
|qos|no|Number|0|Quality of service subscription level, [see documentation](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901169).|0, 1, or 2|
|rh|no|Number|2|"This option specifies whether retained messages are sent on subscription." ([source](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901169))|0, 1, or 2|

#### rh

Retained Handling (rh) between Client and Server is only available for mqtt 5.0, since previous version to not support this feature.

However, for 3.1 and 3.1.1, `SensorThingsMqtt` may simulate Retained Messages by bypassing mqtt with http, internally using `SensorThingsHttp` to receive the latest sensor message.

The Retained Handling can be configured as rh := 0, 1, or 2.

- rh := 0; On subscription, you'll receive one old message (the latest message) from the Sensor immediately by message event.
- rh := 1; On subscription, you'll receive one old message (the latest message), but only if it's the first process in the application to subscribe to this topic.
- rh := 2; On subscription, you will not receive any latest message of the Sensor, but "fresh" messages in the future.

### Retained Handling

An important option for mqtt subscriptions is the so-called "Retained Handling" (rh).

A "Retained Message" is a Sensor message sent in the past, but stored by the server to send immediately after subscription.

```js
import {SensorThingsMqtt} from "./sensorThingsMqtt";

const mqtt = new SensorThingsMqtt({
        mqttUrl: "wss://iot.hamburg.de/mqtt",
        mqttVersion: "5.0",
        context: this
    });

mqtt.on("message", (topic, message, packet) => {
    if (packet.retain === 1) {
        console.log("this is a retained message");
    }
    else {
        console.log("this is a new message");
    }
});

mqtt.subscribe("v1.0/Datastreams(1234)/Observations", {rh: 0});
```

As this might be an unwanted behavior, Retained Handling is inactive by default, that is, rh is set to 2 by default.

```js
import {SensorThingsMqtt} from "./sensorThingsMqtt";

const mqtt = new SensorThingsMqtt({
        mqttUrl: "wss://iot.hamburg.de/mqtt",
        mqttVersion: "5.0",
        context: this
    });

mqtt.on("message", (topic, message, packet) => {
    if (packet.retain === 1) {
        console.log("this will never happen");
    }
    else {
        console.log("this is a new message");
    }
});

mqtt.subscribe("v1.0/Datastreams(1234)/Observations");
```

To identify whether a message is a Retained Message, check the `packet.retain` flag included.

```js
import {SensorThingsMqtt} from "./sensorThingsMqtt";

const mqtt = new SensorThingsMqtt({
        mqttUrl: "wss://iot.hamburg.de/mqtt",
        mqttVersion: "5.0",
        context: this
    });

mqtt.on("message", (topic, message, packet) => {
    if (topic === "v1.0/Datastreams(1234)/Observations" && packet.retain === 1) {
        console.log("this is for the second subscription only");
    }
    else if (topic === "v1.0/Datastreams(1234)/Observations") {
        console.log("this is for the first and second subscription");
    }
    else if (topic === "v1.0/Things(4321)/Datastreams") {
        console.log("this is for the third subscription, retain flag is", packet.retain);
    }
});

// first subscription
mqtt.subscribe("v1.0/Datastreams(1234)/Observations", {rh: 2});

// second subscription
mqtt.subscribe("v1.0/Datastreams(1234)/Observations", {rh: 0});

// third subscription
mqtt.subscribe("v1.0/Things(4321)/Datastreams", {rh: 0});
```

### Closing a mqtt connection

To close a mqtt connection, execute `end` on the `SensorThingsMqtt` instance.

```js
import {SensorThingsMqtt} from "./sensorThingsMqtt";

const mqtt = new SensorThingsMqtt({
        mqttUrl: "wss://iot.hamburg.de/mqtt",
        mqttVersion: "5.0",
        context: this
    });

mqtt.end(false, {}, () => {
    console.log("finished");
});
```

For more information on the `end` function parameters, visit [the end function documentation of mqtt](https://www.npmjs.com/package/mqtt#end); this called is passed through to the mqtt package without further effects.
