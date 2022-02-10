/**
 * SensorThingsMqttConnector is a software layer to standardize the handling of mqtt v3.1, v3.1.1 and v5.0 for SensorThingsApi.
 * <pre>
 * This software layer should run with MQTT.js.
 * MQTT.js: https://www.npmjs.com/package/mqtt
 *
 * This software layer works for mqtt 3.1, 3.1.1 and 5.0
 * mqtt v3.1:   http://public.dhe.ibm.com/software/dw/webservices/ws-mqtt/mqtt-v3r1.html
 * mqtt v3.1.1: https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/mqtt-v3.1.1.html
 * mqtt v5.0:   https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html
 *
 * For v3.1 and v3.1.1 this layer simulates Retained Messages using the SensorThingsApi via http.
 * SensorThingsAPI: https://docs.opengeospatial.org/is/15-078r6/15-078r6.html
 * </pre>
 * @export
 */
export class SensorThingsMqttConnector {
    /**
     * constructor of SensorThingsMqttConnector
     * @constructor
     * @returns {void}
     */
    constructor () {
        /** private */
        this.options = {
            host: "https://localhost",
            port: "",
            path: "/mqtt",
            protocol: "wss",
            mqttVersion: "3.1.1",
            rhPath: "",
            context: this
        };

        this.mqttLibObject = null;
        this.mqttClient = null;
        this.httpClient = null;
        this.handlers = {};
    }

    /**
     * connector of SensorThingsMqtt
     * @post connected via mqtt with the host
     * @constructor
     * @returns {Boolean} true if a connection was made, false on error
     */
    connect () {
        if (typeof this.mqttLibObject?.connect === "function") {
            this.mqttClient = this.mqttLibObject.connect(this.options);
            return true;
        }
        return false;
    }

    /**
     * sets the options
     * @post connected via mqtt with the host
     * @param {Object} options the mqtt options
     * @param {String} options.mqttUrl the url to connect via mqtt (e.g. wss://example.com/mqtt)
     * @param {String} [options.host="https://localhost"] the server to connect to
     * @param {String} [options.port=""] the port to connect to
     * @param {String} [options.path="/mqtt"] the path on the server to connect to
     * @param {String} [options.protocol="wss"] the websocket protocol to use
     * @param {String} [options.mqttVersion="3.1.1"] the mqtt version to use (3.1, 3.1.1 or 5.0) if any other is given, latest is used
     * @param {String} [options.rhPath=""] for mqttVersion 3.1 and 3.1.1 to simulate retained handling based on SensorThingsApi (e.g. https://example.com/), hint: the path given via topic will be put onto this url to call the SensorThingsApi via http
     * @param {Object} [options.context=this] the scope to call everything in
     * @returns {void}
     */
    setOptions (options) {
        this.options = Object.assign(this.options, options);
        if (this.isV31()) {
            // "If you are connecting to a broker that supports only MQTT 3.1 (not 3.1.1 compliant), you should pass these additional options:"
            this.options.protocolId = "MQIsdp";
            this.options.protocolVersion = 3;
            // "This is confirmed on RabbitMQ 3.2.4, and on Mosquitto < 1.3. Mosquitto version 1.3 and 1.4 works fine without those."
            // see https://www.npmjs.com/package/mqtt
        }

        if (!this.options?.hostname) {
            this.options.hostname = this.options.host;
        }
    }

    /**
     * sets the mqtt connector - this should be npm mqtt
     * @param {mqtt} mqttLibObject the mqtt lib object (see MQTT.js, https://www.npmjs.com/package/mqtt)
     * @returns {void}
     */
    setMqttLibObject (mqttLibObject) {
        this.mqttLibObject = mqttLibObject;
    }

    /**
     * sets the http client to use for simulation of retained handling
     * @param {SensorThingsHttp} httpClient an instance of SensorThingsHttp
     * @returns {void}
     */
    setHttpClient (httpClient) {
        this.httpClient = httpClient;
    }

    /**
     * setter for events
     * @post for mqtt v3.1 and v3.1.1 only if eventName equals 'message' the internal this.messageHandler is set to handler to simulate retained handling on subscriptions
     * @param {String} eventName the name of the mqtt event (see https://www.npmjs.com/package/mqtt for more details)
     * @param {Function} handler the event handler as function(*)
     * @param {Function} [onerror] the error handler to use
     * @returns {void}
     */
    on (eventName, handler, onerror) {
        if (typeof this.mqttClient?.on !== "function") {
            if (typeof onerror === "function") {
                onerror("sensorThingsMqtt.js, on: the mqttClient is not ready to react to events. Set mqttClient and connect before adding events.");
            }
            return;
        }
        else if (typeof handler !== "function") {
            if (typeof onerror === "function") {
                onerror("sensorThingsMqtt.js, on: the given event handler must be a function");
            }
            return;
        }
        else if (eventName === "disconnect" && (this.isV31() || this.isV311())) {
            if (typeof onerror === "function") {
                onerror("sensorThingsMqtt.js, on(disconnect): this event is only supported for mqtt 5.0 or higher");
            }
            return;
        }

        if (!Object.prototype.hasOwnProperty.call(this.handlers, eventName)) {
            this.handlers[eventName] = [];
            this.mqttClient.on(eventName, (...args) => {
                this.callHandlers(this.handlers[eventName], eventName, ...args);
            });
        }

        this.handlers[eventName].push(handler);
    }

    /**
     * calls the event handlers for the given event with the given arguments
     * @param {Function[]} handlers an array of functions to call
     * @param {String} eventName the name of the mqtt event (see https://www.npmjs.com/package/mqtt for more details)
     * @returns {void}
     */
    callHandlers (handlers, eventName, ...args) {
        if (!Array.isArray(handlers)) {
            return;
        }
        handlers.forEach(handler => {
            if (typeof handler !== "function") {
                return;
            }
            if (eventName === "message") {
                this.callMessageHandler(handler, this.options.context, ...args);
            }
            else {
                handler.apply(this.options.context, args);
            }
        });
    }

    /**
     * calls a handler for the message event
     * @param {Function} handler the handler to call
     * @param {Object} context the context to call in (e.g. this.options.context)
     * @param {String} topic the topic received by the event
     * @param {Object} message the message received by the event
     * @param {Object} packet meta data received by the event
     * @returns {void}
     */
    callMessageHandler (handler, context, topic, message, packet) {
        let jsonMessage = "",
            jsonPacket = "";

        try {
            jsonMessage = JSON.parse(message);
        }
        catch (e) {
            // fallback
            jsonMessage = message.toString();
        }

        try {
            jsonPacket = JSON.parse(packet);
        }
        catch (e) {
            // fallback
            jsonPacket = packet;
        }

        handler.call(context, topic, jsonMessage, jsonPacket);
    }

    /**
     * subscribe to a topic
     * @param {String} topic the SensorThings topic to subscribe on
     * @param {Object} [options] the options for this subscription
     * @param {Number} [options.qos=0] quality of service subscription level (see: https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901234)
     * @param {Number} [options.rh=2] "This option specifies whether retained messages are sent when the subscription is established." (see: https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901169)
     * @param {Function} [onsuccess] a function(topic, qos) to call if the subscription is granted with topic and qos is the granted QoS level on it
     * @param {Function} [onerror] as function(error) - "a subscription error or an error that occurs when client is disconnecting" (see: https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901169)
     * @returns {void}
     */
    subscribe (topic, options, onsuccess, onerror) {
        if (typeof this.mqttClient?.subscribe !== "function") {
            if (typeof onerror === "function") {
                onerror("sensorThingsMqtt.js, subscribe: the mqttClient is not ready to subscribe. Set mqttClient and connect before adding subscriptions.");
            }
            return;
        }
        const subscriptionOptions = Object.assign({
            qos: 0,
            rh: 2
        }, options);

        this.mqttClient.subscribe(topic, subscriptionOptions, (err, granted) => {
            if (err) {
                if (typeof onerror === "function") {
                    onerror(err);
                }
                return;
            }

            if (
                typeof onsuccess === "function" && Array.isArray(granted) && granted.length
            ) {
                onsuccess(granted[0]?.topic, granted[0]?.qos);
            }

            if (subscriptionOptions.rh !== 2 && (this.isV31() || this.isV311())) {
                // simulate retained handling
                this.simulateRetainedHandling(this.options.rhPath, topic, this.handlers.message, onerror);
            }
        });
    }

    /**
     * unsubscribes from the server
     * @param {String} topic the topic to unsubscribe from
     * @param {Object} [options] options of unsubscribe (see https://www.npmjs.com/package/mqtt)
     * @param {Function} [onsuccess] called if unsubscribe was successfull
     * @param {Function} [onerror] called if an error occurs
     * @returns {void}
     */
    unsubscribe (topic, options, onsuccess, onerror) {
        if (typeof this.mqttClient?.unsubscribe !== "function") {
            if (typeof onerror === "function") {
                onerror("sensorThingsMqtt.js, unsubscribe: the mqttClient is not ready to unsubscribe. Set mqttClient and connect before unsubscribe.");
            }
            return;
        }

        this.mqttClient.unsubscribe(topic, options, err => {
            if (err) {
                if (typeof onerror === "function") {
                    onerror(err);
                    return;
                }
            }
            if (typeof onsuccess === "function") {
                onsuccess();
            }
        });
    }

    /**
     * closes the connection to the server
     * @post subscribe and unsubscribe will call errors if used on a closed connection
     * @param {String} [force=false] "passing it to true will close the client right away, without waiting for the in-flight messages to be acked." (see https://www.npmjs.com/package/mqtt)
     * @param {Object} [options=null] options of end (see https://www.npmjs.com/package/mqtt)
     * @param {Function} [onfinish=null] will be called when the client is closed
     * @param {Function} [onerror=null] called if an error occurs
     * @returns {void}
     */
    end (force = false, options = null, onfinish = null, onerror = null) {
        if (typeof this.mqttClient?.end !== "function") {
            if (typeof onerror === "function") {
                onerror("sensorThingsMqtt.js, end: the mqttClient is not ready to end. Set mqttClient and connect before ending the connection.");
            }
            return;
        }

        this.mqttClient.end(force, options, onfinish);
    }

    /**
     * simulation of retained messages via http (no version checks here)
     * @param {String} rhPath the root path to use calling SensorThingsApi via http (e.g. https://example.com)
     * @param {String} topic the topic to simulate (e.g. v1.0/Things(614))
     * @param {Function[]} messageHandlers a list of handlers, each as function(topic, message, packet), to receive the (simulated) retained message with
     * @param {Function} [onerror] as function(error) - "a subscription error or an error that occurs when client is disconnecting" (see: https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901169)
     * @returns {void}
     */
    simulateRetainedHandling (rhPath, topic, messageHandlers, onerror) {
        if (!Array.isArray(messageHandlers) || !messageHandlers.length) {
            return;
        }
        else if (typeof this.httpClient?.get !== "function") {
            if (typeof onerror === "function") {
                onerror("sensorThingsMqtt.js, simulateRetainedHandling: to siumlate retained messages a httpClient must be set.");
            }
            return;
        }
        else if (typeof rhPath !== "string") {
            if (typeof onerror === "function") {
                onerror("sensorThingsMqtt.js, simulateRetainedHandling: To use simulateRetainedHandling the rhPath must be given with the options.");
            }
            return;
        }
        else if (typeof topic !== "string") {
            if (typeof onerror === "function") {
                onerror("sensorThingsMqtt.js, simulateRetainedHandling: A retained message can't be simulated without a topic.");
            }
            return;
        }

        const lastTerm = topic.substring(topic.lastIndexOf("/")).toLocaleLowerCase();
        let url = rhPath.substr(-1) === "/" ? rhPath : rhPath + "/";

        url += topic;
        if (lastTerm.indexOf("observations") !== -1) {
            url += "?%24orderby=phenomenonTime%20desc&%24top=1";
        }

        this.httpClient.get(url, response => {
            // onsuccess
            messageHandlers.forEach(handler => {
                if (typeof handler === "function" && Array.isArray(response) && response.length) {
                    handler(topic, response[0], {
                        cmd: "simulate",
                        dup: false,
                        qos: 0,
                        retain: true,
                        topic: topic,
                        payload: response[0]
                    });
                }
            });
        }, null, null, onerror);
    }


    /**
     * checks if the used mqtt version is 3.1
     * @returns {Boolean}  true if version is 3.1
     */
    isV31 () {
        return this.options.mqttVersion === "3.1";
    }
    /**
     * checks if the used mqtt version is 3.1.1
     * @returns {Boolean}  true if version is 3.1.1
     */
    isV311 () {
        return this.options.mqttVersion === "3.1.1";
    }
    /**
     * checks if the used mqtt version is 3.1
     * @returns {Boolean}  true if version is 3.1
     */
    isV50 () {
        return this.options.mqttVersion === "5.0";
    }
}
