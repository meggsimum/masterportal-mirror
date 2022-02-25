import "../model";
import store from "../../../src/app-store";

const SpecialWFSModel = Backbone.Model.extend({
    defaults: {
        minChars: 3,
        glyphicon: "glyphicon-home",
        geometryName: "app:geom",
        maxFeatures: 20,
        timeout: 6000,
        definitions: [],
        ajaxRequests: {},
        defaultNamespaces: "xmlns:wfs='http://www.opengis.net/wfs' xmlns:ogc='http://www.opengis.net/ogc' xmlns:gml='http://www.opengis.net/gml'"
    },

    /**
     * @description Initialisierung der wfsFeature Suche.
     * @param {Objekt} config - Das Konfigurationsarray für die specialWFS-Suche
     * @param {integer} [config.minChars=3] - Mindestanzahl an Characters, bevor eine Suche initiiert wird.
     * @param {integer} [config.timeout=6000] - Timeout der Ajax-Requests im Millisekunden.
     * @param {Object[]} config.definitions - Definitionen der SpecialWFS.
     * @param {Object} config.definitions[].definition - Parameter eines WFS
     * @param {string} config.definitions[].definition.url - URL des WFS
     * @param {string} config.definitions[].definition.data - Query string des WFS-Request deprecated
     * @param {string} config.definitions[].definition.name - MetaName der Kategorie für Vorschlagssuche
     * @param {string} config.definitions[].definition.typeName - Layername des WFS Dienstes
     * @param {string} [config.definitions[].definition.geometryName="app:geom"] - Name des Attributs mit Geometrie
     * @param {integer} [config.definitions[].definition.maxFeatures="20"] - Anzahl der vom Dienst maximal zurückgegebenen Features
     * @param {string_} [config.definitions[].definition.glyphicon="glyphicon-home"] - Name des Glyphicon für Vorschlagssuche
     * @param {strings[]} config.definitions[].definition.propertyNames - Name der Attribute die zur Suche ausgewertet werden
     * @returns {void}
     */
    initialize: function (config) {
        if (config.minChars) {
            this.setMinChars(config.minChars);
        }
        if (config.timeout) {
            this.setTimeout(config.timeout);
        }
        if (config.maxFeatures) {
            this.setMaxFeatures(config.maxFeatures);
        }
        if (config.definitions) {
            this.setDefinitions(config.definitions);
        }

        // set Listener
        this.listenTo(Radio.channel("Searchbar"), {
            "search": this.search
        });

        // initial search
        if (store.state.urlParams && store.state.urlParams["Search/query"]) {
            this.search(store.state.urlParams && store.state.urlParams["Search/query"]);
        }
    },

    /*
    * setter for definitions
    * @param {object[]} value definitions aus config.json
    * @returns {void}
    */
    setDefinitions: function (values) {
        const definitions = [];

        values.forEach(function (value) {
            let definition = value;

            // @deprecated since 3.0.0
            if (value?.data) {
                definition = Object.assign(value, this.getDataParameters(value));
            }

            if (!definition?.typeName || !definition?.propertyNames) {
                console.error("SpecialWFS (setDefinitions): parameters missing - definition of specialWFS is ignored.");
                return undefined;
            }

            definitions.push(definition);
            return undefined;
        }, this);

        this.set("definitions", definitions);
    },

    /**
     * Extrahiert die Parameter für POST-Request und gibt diese zurück.
     * @deprecated Parameterübergabe zukünftig in Objekt. Aktuell auch noch aus string. Ablösung mit 3.0.0
     * @param   {string}    value   Konfiguration aus config.json
     * @returns {object}            aufbereitetes Objekt zur WFS Abfrage
     */
    getDataParameters: function (value) {
        const parameters = {};

        value.data.split("&").forEach(function (keyValue) {
            parameters[keyValue.split("=")[0].toUpperCase()] = decodeURIComponent(keyValue.split("=")[1]);
        });

        if (!parameters?.TYPENAMES || !parameters?.PROPERTYNAME) {
            console.error("SpecialWFS (getDataParameters): parameters missing - definition of specialWFS is ignored.");
            return undefined;
        }

        return {
            propertyNames: parameters.PROPERTYNAME.split(","),
            typeName: parameters.TYPENAMES,
            geometryName: value.geometryName ? value.geometryName : "app:geom"
        };
    },

    /**
     * Erstellt XML für einen WFS 1.1.0 POST Request
     * @param   {Object} definition    Definition aus Konfiguration
     * @param   {string} searchString  Suchstring
     * @returns {string}               XML String
     */
    getWFS110Xml: function (definition, searchString) {
        const typeName = definition.typeName,
            propertyNames = definition.propertyNames,
            geometryName = definition.geometryName ? definition.geometryName : this.get("geometryName"),
            maxFeatures = definition.maxFeatures ? definition.maxFeatures : this.get("maxFeatures"),
            namespaces = definition.namespaces ? this.get("defaultNamespaces") + " " + definition.namespaces : this.get("defaultNamespaces");
        let data, propertyName;

        data = "<?xml version='1.0' encoding='UTF-8'?><wfs:GetFeature service='WFS' ";
        data += namespaces + " traverseXlinkDepth='*' version='1.1.0'>";
        data += "<wfs:Query typeName='" + typeName + "'>";
        for (propertyName of propertyNames) {
            data += "<wfs:PropertyName>" + propertyName + "</wfs:PropertyName>";
        }
        data += "<wfs:PropertyName>" + geometryName + "</wfs:PropertyName>";
        data += "<wfs:maxFeatures>" + maxFeatures + "</wfs:maxFeatures>";
        data += "<ogc:Filter>";
        if (propertyNames.length > 1) {
            data += "<ogc:Or>";
        }
        for (propertyName of propertyNames) {
            data += "<ogc:PropertyIsLike matchCase='false' wildCard='*' singleChar='#' escapeChar='!'><ogc:PropertyName>" + propertyName + "</ogc:PropertyName><ogc:Literal>*" + searchString + "*</ogc:Literal></ogc:PropertyIsLike>";
        }
        if (propertyNames.length > 1) {
            data += "</ogc:Or>";
        }
        data += "</ogc:Filter></wfs:Query></wfs:GetFeature>";

        return data;
    },

    /**
     * Initiiert die WFS-Suche
     * @listens Radio.channel("Searchbar")~search
     * @param   {string} searchString Searchstring aus der Suchleiste
     * @returns {void}
     */
    search: function (searchString) {
        const definitions = this.get("definitions");
        let data;

        if (searchString.length >= this.get("minChars")) {
            definitions.forEach(def => {
                // translate if necessary
                if (typeof def.i18nextTranslate === "function") {
                    def.i18nextTranslate(function (key, value) {
                        def[key] = value;
                    });
                }

                data = this.getWFS110Xml(def, searchString);
                def.url = this.manipulateUrlForProxy(def.url);
                def.searchString = searchString;
                this.sendRequest(def, data);
            });
        }
    },

    /**
     * @description replaces all "." with "_" in given URL
     * @param {String} url The URL to manipulate
     * @returns {string} the manipulated URL
     */
    manipulateUrlForProxy: function (url) {
        return url.replace(/\./g, "_");
    },

    /**
     * @description Executes a special WFS request at a time
     * @param {String} def Params of WFS
     * @param {String} data Data to be sent to the server
     * @returns {void}
     */
    sendRequest: function (def, data) {
        const ajax = this.get("ajaxRequests");

        if (ajax[def.name] !== null && ajax[def.name] !== undefined) {
            ajax[def.name].abort();
            this.polishAjax(def.name);
        }
        this.ajaxSend(def, data);
    },

    /**
     * Verschickt einen POST-Request
     * @param   {Object} def      Definition eines specialWFS
     * @param   {string} postdata POST-Data-String
     * @returns {void}
     */
    ajaxSend: function (def, postdata) {
        this.get("ajaxRequests")[def.name] = $.ajax({
            url: def.url,
            data: postdata,
            context: this,
            async: true,
            type: "POST",
            success: function (data) {
                this.fillHitList(data, def);
            },
            timeout: this.get("timeout"),
            contentType: "text/xml",
            def: def,
            error: function (err) {
                if (err.status !== 0) { // Bei abort keine Fehlermeldung
                    this.showError(err);
                }
                Radio.trigger("Searchbar", "abortSearch", "specialWFS");
            },
            complete: function () {
                this.polishAjax(def.name);
            }
        }, this);
    },

    /**
     * @summary Liest das Response-XML des WFS 1.1.0 ein und triggert das Füllen der hitList
     * @description Diese Funktion setzt vorraus, dass die Features im root-Element des response-XML als direkte Child-Elemente gelistet sind.         * @description Der textContent jedes Elements eines Features wird für die Bezeichnung verwendet.
     * @param  {xml} data Response des requests
     * @param {Object} definition Definition aus Konfiguration
     * @returns {void}
     */
    fillHitList: function (data, definition) {
        const type = definition.name,
            typeName = definition.typeName,
            propertyNames = definition.propertyNames,
            geometryName = definition.geometryName ? definition.geometryName : this.get("geometryName"),
            glyphicon = definition.glyphicon ? definition.glyphicon : this.get("glyphicon"),
            elements = data.getElementsByTagNameNS("*", typeName.split(":")[1]),
            multiGeometries = ["MULTIPOLYGON"];

        for (const element of elements) {
            propertyNames.forEach(propertyName => {
                if (element.getElementsByTagName(propertyName).length > 0 && element.getElementsByTagName(geometryName).length > 0) {
                    if (element.getElementsByTagName(propertyName)[0].textContent.toUpperCase().includes(definition.searchString.toUpperCase())) {
                        const elementGeometryName = element.getElementsByTagNameNS("*", geometryName.split(":")[1])[0],
                            elementGeometryFirstChild = elementGeometryName.firstElementChild,
                            firstChildNameUpperCase = elementGeometryFirstChild.localName.toUpperCase(),
                            identifier = element.getElementsByTagName(propertyName)[0].textContent;
                        let geometry;

                        if (multiGeometries.includes(firstChildNameUpperCase)) {
                            const memberName = elementGeometryFirstChild.firstElementChild.localName,
                                geometryMembers = elementGeometryName.getElementsByTagNameNS("*", memberName),
                                coordinates = this.getInteriorAndExteriorPolygonMembers(geometryMembers);

                            geometry = coordinates[0];
                        }
                        else {
                            const geometryString = element.getElementsByTagName(geometryName)[0].textContent;

                            geometry = geometryString.trim().split(" ");
                        }
                        this.pushHitListObjects(type, identifier, firstChildNameUpperCase, geometry, glyphicon);
                    }
                }
                else {
                    console.error("Missing properties in specialWFS-Response. Ignoring Feature...");
                }
            });
        }
        if (elements.length) {
            Radio.trigger("Searchbar", "createRecommendedList", "specialWFS");
        }
    },

    /**
    * Trigger function pushHits in Searchbar and send result objects for hit list.
    * @param {string} type - Type name.
    * @param {string} identifier - Name frmom target result.
    * @param {string} firstChildNameUpperCase - Geometrie type.
    * @param {string[]} geometry - The coordinates from exterior geometry.
    * @param {string} glyphicon - The glyphicon for hit.
    * @returns {void}
    */
    pushHitListObjects: function (type, identifier, firstChildNameUpperCase, geometry, glyphicon) {
        Radio.trigger("Searchbar", "pushHits", "hitList", {
            id: Radio.request("Util", "uniqueId", type.toString()),
            name: identifier.trim(),
            geometryType: firstChildNameUpperCase,
            type: type,
            coordinate: geometry,
            glyphicon: glyphicon
        });
    },

    /**
     * Function to extract the coordinates of every polygon and polygons with interior polygons / holes
     * @param   {Object} polygonMembers members of the polygon
     * @returns {Array[]} returns the coordinates of every polygon
     */
    getInteriorAndExteriorPolygonMembers: function (polygonMembers) {
        const lengthIndex = polygonMembers.length,
            coordinateArray = [];

        for (let i = 0; i < lengthIndex; i++) {
            const coords = [],
                polygonsWithInteriors = [],
                interiorCoords = [];
            let posListPolygonMembers, exterior, interior, exteriorCoord;

            posListPolygonMembers = polygonMembers[i].getElementsByTagNameNS("*", "posList");

            // polygon with interior polygons
            // make sure that the exterior coordinates are always at the first posiion in the array
            if (posListPolygonMembers.length > 1) {
                posListPolygonMembers = [];
                exterior = polygonMembers[i].getElementsByTagNameNS("*", "exterior");
                exteriorCoord = exterior[0].getElementsByTagNameNS("*", "posList")[0].textContent;
                polygonsWithInteriors.push(Object.values(exteriorCoord.replace(/\s\s+/g, " ").split(" ")));

                interior = polygonMembers[i].getElementsByTagNameNS("*", "interior");
                for (const key in Object.keys(interior)) {
                    interiorCoords.push(interior[key].getElementsByTagNameNS("*", "posList")[0].textContent);
                }
                interiorCoords.forEach(coord => polygonsWithInteriors.push(Object.values(coord.replace(/\s\s+/g, " ").split(" "))));
                coordinateArray.push(polygonsWithInteriors);
            }
            else {
                for (const key in Object.keys(posListPolygonMembers)) {
                    coords.push(posListPolygonMembers[key].textContent);
                }
                coords.forEach(coordArray => coordinateArray.push(Object.values(coordArray.replace(/\s\s+/g, " ").split(" "))));
            }
        }
        return [coordinateArray];
    },

    /**
     * removes the namespace from propertynames in array
     * @param {String[]} propertyNames array with property names
     * @returns {String[]} propertynamesWithoutNamespace
     */
    removeNameSpaceFromArray: function (propertyNames) {
        const propertynamesWithoutNamespace = [];

        propertyNames.forEach(function (propertyname) {
            propertynamesWithoutNamespace.push(propertyname.split(":")[1]);
        });

        return propertynamesWithoutNamespace;
    },

    /**
     * Logs error in console
     * @param {object} err error object from ajax request
     * @returns {void}
     */
    showError: function (err) {
        const detail = err.statusText && err.statusText !== "" ? err.statusText : "";

        console.error("Service unavailable. " + detail);
    },

    /**
     * Löscht die Information des erfolgreichen oder abgebrochenen Ajax-Requests wieder aus dem Objekt der laufenden Ajax-Requests
     * @param {string} type Bezeichnung des Typs
     * @returns {void}
     */
    polishAjax: function (type) {
        const ajax = this.get("ajaxRequests"),
            cleanedAjax = Radio.request("Util", "omit", ajax, Array.isArray(type) ? type : [type]);

        this.set("ajaxRequests", cleanedAjax);
    },

    /**
     * Setter for minChars
     * @param {number} value - Amount of minChars.
     * @returns {void}
     */
    setMinChars: function (value) {
        this.set("minChars", value);
    },

    /**
     * Setter for timeout
     * @param {number} value - time.
     * @returns {void}
     */
    setTimeout: function (value) {
        this.set("timeout", value);
    },

    /**
    * setter for maxFeatures
    * @param {integer} value - maxFeatures
    * @returns {void}
    */
    setMaxFeatures: function (value) {
        this.set("maxFeatures", value);
    }
});

export default SpecialWFSModel;
