import * as mqtt from "precompiled-mqtt";
import {SensorThingsHttp} from "./sensorThingsHttp";
import {SensorThingsMqttConnector} from "./sensorThingsMqttConnector";

/**
 * Multiton of SensorThingsMqttConnector to reuse connections with the same options. SensorThingsMqtt morphes into the reused SensorThingsMqttConnector on construction.
 * <pre>
 * This software layer uses SensorThingsMqttConnector.
 *
 * To import SensorThingsMqtt:  import {SensorThingsMqtt} from "./sensorThingsMqtt";
 * create a new object:         const mqtt = new SensorThingsMqtt(opts);
 * subscribe to a topic:        mqtt.subscribe(topic, {rh: 2}, onsuccess, onerror);
 *
 * Be aware: The object received on construction is an instance of SensorThingsMqttConnector.
 *  </pre>
 * @export
 */
export class SensorThingsMqtt {
    /**
     * constructor of SensorThingsMqtt
     * @post connects via mqtt with the given host
     * @param {Object} options the mqtt options
     * @param {String} [options.host="https://localhost"] the server to connect to
     * @param {String} [options.port=""] the port to connect to
     * @param {String} [options.path="/mqtt"] the path on the server to connect to
     * @param {String} [options.protocol="wss"] the websocket protocol to use
     * @param {String} [options.mqttVersion="3.1.1"] the mqtt version to use (3.1, 3.1.1 or 5.0) if any other is given, latest is used
     * @param {String} [options.rhPath=""] for mqttVersion 3.1 and 3.1.1 to simulate retained handling based on SensorThingsApi (e.g. https://example.com/), hint: the path given via topic will be put onto this url to call the SensorThingsApi via http
     * @param {Object} [options.context=this] the scope to call everything in
     * @constructor
     * @returns {SensorThingsMqttConnector}  the reused instance of SensorThingsMqttConnector
     */
    constructor (options = null) {
        const optionsKey = JSON.stringify({
            host: this.options?.host,
            port: this.options?.port,
            path: this.options?.path,
            protocol: this.options?.protocol,
            mqttVersion: this.options?.mqttVersion,
            rhPath: this.options?.rhPath
        });
        let connector = null;

        if (typeof SensorThingsMqtt.instances !== "object" || SensorThingsMqtt.instances === null) {
            SensorThingsMqtt.instances = {};
        }
        if (Object.prototype.hasOwnProperty.call(SensorThingsMqtt.instances, optionsKey)) {
            return SensorThingsMqtt.instances[optionsKey];
        }

        connector = new SensorThingsMqttConnector();
        connector.setOptions(options);
        connector.setMqttLibObject(mqtt);
        connector.setHttpClient(new SensorThingsHttp());

        if (connector.connect()) {
            SensorThingsMqtt.instances[optionsKey] = connector;
        }

        return connector;
    }
}
