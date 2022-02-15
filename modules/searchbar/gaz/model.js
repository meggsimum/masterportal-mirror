import "../model";
import store from "../../../src/app-store";

const GazetteerModel = Backbone.Model.extend({
    defaults: {
        namespace: "http://www.adv-online.de/namespaces/adv/dog",
        minChars: 3,
        gazetteerURL: "",
        searchStreets: false,
        searchHouseNumbers: false,
        searchDistricts: false,
        searchParcels: false,
        searchStreetKey: false,
        onlyOneStreetName: "",
        searchStringRegExp: "",
        houseNumbers: [],
        ajaxRequests: {},
        typeOfRequest: "",
        idCounter: 0
    },
    /**
     * @description Initialisierung der Gazetteer Suche
     * @param {Object} config - Das Konfigurationsobjekt für die Gazetteer-Suche.
     * @param {string} config.serviceId - ID aus rest-conf für URL des GAZ.
     * @param {boolean} [config.searchStreets=false] - Soll nach Straßennamen gesucht werden? Vorraussetzung für searchHouseNumbers.
     * @param {boolean} [config.searchHouseNumbers=false] - Sollen auch Hausnummern gesucht werden oder nur Straßen?
     * @param {boolean} [config.searchDistricts=false] - Soll nach Stadtteilen gesucht werden?
     * @param {boolean} [config.searchParcels=false] - Soll nach Flurstücken gesucht werden?
     * @param {integer} [config.minCharacters=3] - Mindestanzahl an Characters im Suchstring, bevor Suche initieert wird.
     * @returns {void}
     */
    initialize: function (config) {
        const gazService = Radio.request("RestReader", "getServiceById", config.serviceId);

        this.listenTo(Radio.channel("Searchbar"), {
            "search": this.search,
            "setPastedHouseNumber": this.setPastedHouseNumber
        });

        this.listenTo(Radio.channel("Gaz"), {
            "findStreets": this.findStreets,
            "findHouseNumbers": this.findHouseNumbers,
            "adressSearch": this.adressSearch,
            "streetsWithoutHouseNumberSearch": this.streetsWithoutHouseNumberSearch,
            "streetsSearch": this.streetsSearch
        });

        if (gazService && gazService.get("url")) {
            this.set("gazetteerURL", gazService.get("url"));
        }
        if (config.searchStreets) {
            this.set("searchStreets", config.searchStreets);
        }
        if (config.searchHouseNumbers) {
            this.set("searchHouseNumbers", config.searchHouseNumbers);
        }
        if (config.searchDistricts) {
            this.set("searchDistricts", config.searchDistricts);
        }
        if (config.searchParcels) {
            this.set("searchParcels", config.searchParcels);
        }
        if (config.searchStreetKey) {
            this.set("searchStreetKey", config.searchStreetKey);
        }
        if (config.minChars) {
            this.set("minChars", config.minChars);
        }
        if (config.namespace) {
            this.set("namespace", config.namespace);
        }
        if (store.state.urlParams && store.state.urlParams["Search/query"]) {
            this.directSearch(store.state.urlParams && store.state.urlParams["Search/query"]);
        }
    },

    /**
     * @returns {String} Namespace Prefix, e.g. "dog" for "http://www.adv-online.de/namespaces/adv/dog"
     */
    getNamespacePrefix: function () {
        return this.get("namespace").split("/").pop();
    },

    // für Copy/Paste bei Adressen
    setPastedHouseNumber: function (value) {
        this.set("pastedHouseNumber", value);
    },

    search: function (pattern) {
        let gemarkung,
            flurstuecksnummer,
            searchString = pattern;

        this.set("searchString", searchString);
        if (searchString.length >= this.get("minChars")) {
            if (this.get("searchStreets") === true) {
                searchString = searchString.replace(/[()]/g, "\\$&");
                this.set("searchStringRegExp", new RegExp(searchString.replace(/ /g, ""), "i")); // Erst join dann als regulärer Ausdruck
                this.set("onlyOneStreetName", "");
                this.setTypeOfRequest("searchStreets");

                searchString = searchString.replace(/\s*$/, "");

                this.sendRequest("StoredQuery_ID=findeStrasse&strassenname=" + encodeURIComponent(searchString), this.getStreets, this.get("typeOfRequest"));
            }
            if (this.get("searchDistricts") === true) {
                if (searchString.match(/^[a-z-.\s]+$/i) !== null) {
                    this.setTypeOfRequest("searchDistricts");
                    this.sendRequest("StoredQuery_ID=findeStadtteil&stadtteilname=" + searchString, this.getDistricts, this.get("typeOfRequest"));
                }
            }
            if (this.get("searchParcels") === true) {
                if (searchString.match(/^[0-9]{4}[\s|/][0-9]*$/) !== null) {
                    gemarkung = searchString.split(/[\s|/]/)[0];
                    flurstuecksnummer = searchString.split(/[\s|/]/)[1];
                    this.setTypeOfRequest("searchParcels1");
                    this.sendRequest("StoredQuery_ID=Flurstueck&gemarkung=" + gemarkung + "&flurstuecksnummer=" + flurstuecksnummer, this.getParcel, this.get("typeOfRequest"));
                }
                else if (searchString.match(/^[0-9]{5,}$/) !== null) {
                    gemarkung = searchString.slice(0, 4);
                    flurstuecksnummer = searchString.slice(4);
                    this.setTypeOfRequest("searchParcels2");
                    this.sendRequest("StoredQuery_ID=Flurstueck&gemarkung=" + gemarkung + "&flurstuecksnummer=" + flurstuecksnummer, this.getParcel, this.get("typeOfRequest"));
                }
            }
            if (this.get("searchStreetKey") === true) {
                if (searchString.match(/^[a-z]{1}[0-9]{1,5}$/i) !== null) {
                    this.setTypeOfRequest("searchStreetKey");
                    this.sendRequest("StoredQuery_ID=findeStrassenSchluessel&strassenschluessel=" + searchString, this.getStreetKey, this.get("typeOfRequest"));
                }
            }
        }
    },

    findStreets: function (searchString) {
        this.sendRequest("StoredQuery_ID=findeStrasse&strassenname=" + encodeURIComponent(searchString), this.parseStreets, true);
    },

    parseStreets: function (data) {
        const hits = $("wfs\\:member,member", data),
            streetNames = [],
            namespacePrefix = this.getNamespacePrefix();

        hits.each(function (i, hit) {
            streetNames.push($(hit).find(`${namespacePrefix}\\:strassenname, strassenname`)[0].textContent);
        }, this);

        Radio.trigger("Gaz", "streetNames", streetNames.sort());
        return streetNames.sort();
    },

    findHouseNumbers: function (street) {
        this.sendRequest("StoredQuery_ID=HausnummernZuStrasse&strassenname=" + encodeURIComponent(street), this.parseHousenumbers, true);
    },

    parseHousenumbers: function (data) {
        const hits = $("wfs\\:member,member", data),
            houseNumbers = [],
            namespacePrefix = this.getNamespacePrefix();
        let sortedHouseNumbers = null;

        hits.toArray().forEach(hit => {
            houseNumbers.push({
                position: $(hit).find("gml\\:pos,pos")[0].textContent,
                number: $(hit).find(`${namespacePrefix}\\:hausnummer,hausnummer`)[0].textContent,
                affix: $(hit).find(`${namespacePrefix}\\:hausnummernzusatz,hausnummernzusatz`)[0]
                    ? $(hit).find(`${namespacePrefix}\\:hausnummernzusatz,hausnummernzusatz`)[0].textContent
                    : ""
            });
        });
        sortedHouseNumbers = Radio.request("Util", "sort", "", houseNumbers, "number", "affix");

        Radio.trigger("Gaz", "houseNumbers", sortedHouseNumbers);
        return sortedHouseNumbers;
    },

    /**
    * @description Adresssuche mit Straße und Hausnummer und Zusatz. Wird nicht über die Searchbar getriggert.
    * @param {Object} adress - Adressobjekt zur Suche
    * @param {string} adress.streetname - Straßenname
    * @param {integer} adress.housenumber - Hausnummer
    * @param {string} [adress.affix] - Zusatz zur Hausnummer
    * @returns {void}
    */
    adressSearch: function (adress) {
        if (adress.affix && adress.affix !== "") {
            this.setTypeOfRequest("adress1");
            this.sendRequest("StoredQuery_ID=AdresseMitZusatz&strassenname=" + encodeURIComponent(adress.streetname) + "&hausnummer=" + encodeURIComponent(adress.housenumber) + "&zusatz=" + encodeURIComponent(adress.affix.toLowerCase()), this.triggerGetAdress, this.get("typeOfRequest"));
        }
        else {
            this.setTypeOfRequest("adress2");
            this.sendRequest("StoredQuery_ID=AdresseOhneZusatz&strassenname=" + encodeURIComponent(adress.streetname) + "&hausnummer=" + encodeURIComponent(adress.housenumber), this.triggerGetAdress, this.get("typeOfRequest"));
        }
    },

    /**
    * Search for streets without subsequent search for house numbers.
    * @param {Object} adress - Addressobject
    * @param {string} adress.streetname - Streetname
    * @returns {void}
    */
    streetsWithoutHouseNumberSearch: function (adress) {
        this.sendRequest("StoredQuery_ID=findeStrasse&strassenname=" + encodeURIComponent(adress.streetname), this.triggerGetStreetsWithoutHouseNumber, this.get("typeOfRequest"));
    },

    streetsSearch: function (adress) {
        this.setTypeOfRequest("searchHouseNumbers1");
        this.sendRequest("StoredQuery_ID=HausnummernZuStrasse&strassenname=" + encodeURIComponent(adress.name), this.triggerGetStreets, this.get("typeOfRequest"));
    },

    /**
    * @description Veränderte Suchabfolge bei initialer Suche, z.B. über Config.initialQuery
    * @param {string} pattern - Suchstring
    * @returns {void}
    */
    directSearch: function (pattern) {
        let searchString = pattern,
            splitInitString;

        this.set("searchString", searchString);
        // Suche nach Straße, Hausnummer
        if (searchString.search(",") !== -1) {
            splitInitString = searchString.split(",");
            this.set("onlyOneStreetName", splitInitString[0]);
            searchString = searchString.replace(/ /g, "");
            this.set("searchStringRegExp", new RegExp(searchString.replace(/,/g, ""), "i")); // Erst join dann als regulärer Ausdruck
            this.setTypeOfRequest("onlyOneStreetName1");
            this.sendRequest("StoredQuery_ID=HausnummernZuStrasse&strassenname=" + encodeURIComponent(this.get("onlyOneStreetName")), this.handleHouseNumbers, this.get("typeOfRequest"));
        }
        else {
            this.set("searchStringRegExp", new RegExp(searchString.replace(/ /g, ""), "i")); // Erst join dann als regulärer Ausdruck
            this.set("onlyOneStreetName", "");
            this.setTypeOfRequest("onlyOneStreetName2");
            this.sendRequest("StoredQuery_ID=findeStrasse&strassenname=" + encodeURIComponent(searchString), this.getStreets, this.get("typeOfRequest"));
        }
        // Suche nach Straßenschlüssel
        if (this.get("searchStreetKey") === true) {
            if (searchString.match(/^[a-z]{1}[0-9]{1,5}$/i) !== null) {
                this.setTypeOfRequest("searchStreetKey2");
                this.sendRequest("StoredQuery_ID=findeStrassenSchluessel&strassenschluessel=" + searchString, this.getStreetKey, this.get("typeOfRequest"));
            }
            else {
                Radio.trigger("Searchbar", "abortSearch", "gazetteer_streetKeys");
            }
        }
        else {
            Radio.trigger("Searchbar", "abortSearch", "gazetteer_streetKeys");
        }

        $("#searchInput").val(this.get("searchString"));
    },

    /**
    * @description Methode zur Weiterleitung der adressSearch
    * @param {xml} data - Response
    * @returns {void}
    */
    triggerGetAdress: function (data) {
        Radio.trigger("Gaz", "getAdress", data);
    },

    /**
    * Send street data via radio
    * @param {xml} data - Response
    * @returns {void}
    */
    triggerGetStreetsWithoutHouseNumber: function (data) {
        Radio.trigger("Gaz", "getStreetsWithoutHouseNumber", data);
    },

    /**
     * Trigger die gefundenen Hausnummern
     * @param  {xml} data Response
     * @returns {void}
     */
    triggerGetStreets: function (data) {
        this.createHouseNumbers(data);
        Radio.trigger("Gaz", "getStreets", this.get("houseNumbers"));
    },
    /**
     * [getStreets description]
     * @param  {String} data [description]
     * @returns {void}
     */
    getStreets: function (data) {
        const hits = $("wfs\\:member,member", data),
            hitNames = [],
            namespacePrefix = this.getNamespacePrefix();
        let posResult,
            position,
            hitName;

        hits.each(function (i, hit) {
        /*
           position example from WFS:
            <iso19112:position_strassenachse xmlns:iso19112="http://www.opengis.net/iso19112">
                <!--
                Inlined geometry 'HH_STR_10785800_ISO19112_POSITION_STRASSENACHSE'
                -->
                <gml:Point gml:id="HH_STR_10785800_ISO19112_POSITION_STRASSENACHSE" srsName="urn:ogc:def:crs:EPSG::25832">
                    <gml:pos>561260.027 5938772.298</gml:pos>
                </gml:Point>
            </iso19112:position_strassenachse>
            <iso19112:locationType xmlns:iso19112="http://www.opengis.net/iso19112" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="http://localhost:9001/dog_gages/services/wfs_gages?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&OUTPUTFORMAT=application%2Fgml%2Bxml%3B+version%3D3.2&STOREDQUERY_ID=urn:ogc:def:query:OGC-WFS::GetFeatureById&ID=HH_SILC_2#HH_SILC_2"/>
           */
            posResult = $(hit).find("gml\\:pos,pos");
            position = posResult.length > 1 ? posResult[1].textContent.split(" ") : posResult[0].textContent.split(" ");
            hitName = $(hit).find(`${namespacePrefix}\\:strassenname, strassenname`)[0].textContent;
            hitNames.push(hitName);
            // "Hitlist-Objekte"
            Radio.trigger("Searchbar", "pushHits", "hitList", {
                name: hitName,
                type: i18next.t("common:modules.searchbar.type.street"),
                coordinate: position,
                glyphicon: "glyphicon-road",
                id: hitName.replace(/ /g, "") + "Straße"
            });
        }, this);

        if (this.get("searchHouseNumbers") === true) {
            if (hits.length === 1) {
                this.set("onlyOneStreetName", hitName);
                this.setTypeOfRequest("searchHouseNumbers1");
                this.sendRequest("StoredQuery_ID=HausnummernZuStrasse&strassenname=" + encodeURIComponent(hitName), this.handleHouseNumbers, this.get("typeOfRequest"));
            }
            else if (hits.length === 0) {
                this.searchInHouseNumbers();
            }
            else {
                hitNames.forEach(function (value) {
                    if (value.toLowerCase() === this.get("searchString").toLowerCase()) {
                        this.set("onlyOneStreetName", value);
                        this.setTypeOfRequest("searchHouseNumbers2");
                        this.sendRequest("StoredQuery_ID=HausnummernZuStrasse&strassenname=" + encodeURIComponent(value), this.handleHouseNumbers, this.get("typeOfRequest"));
                    }
                }, this);
            }
        }
        Radio.trigger("Searchbar", "createRecommendedList", "gazetteer_streetsOrHouseNumbers");
    },

    /**
     * [getDistricts description]
     * @param  {String} data [description]
     * @return {void}
     */
    getDistricts: function (data) {
        const hits = $("wfs\\:member,member", data);
        let hitName,
            pos;

        hits.each(function (i, hit) {
            pos = $(hit).find("gml\\:pos,pos")[0].textContent.split(" ");
            hitName = $(hit).find("iso19112\\:geographicIdentifier , geographicIdentifier")[0].textContent;
            Radio.trigger("Searchbar", "pushHits", "hitList", {
                name: hitName,
                type: i18next.t("common:modules.searchbar.type.district"),
                coordinate: pos,
                glyphicon: "glyphicon-map-marker",
                id: hitName.replace(/ /g, "") + "Stadtteil"
            });
        }, this);
        Radio.trigger("Searchbar", "createRecommendedList");
    },

    searchInHouseNumbers: function () {
        let address, number;

        // Adressuche über Copy/Paste
        if (this.get("pastedHouseNumber") !== undefined) {
            this.get("houseNumbers").forEach(function (houseNumber) {
                address = houseNumber.name.replace(/ /g, "");
                number = houseNumber.adress.housenumber + houseNumber.adress.affix;

                if (number === this.get("pastedHouseNumber")) {
                    Radio.trigger("Searchbar", "pushHits", "hitList", houseNumber, "paste");
                }
            }, this);
            this.unset("pastedHouseNumber");
        }
        else {
            this.get("houseNumbers").forEach(function (houseNumber) {
                address = houseNumber.name.replace(/ /g, "");

                if (address.search(this.get("searchStringRegExp")) !== -1) {
                    Radio.trigger("Searchbar", "pushHits", "hitList", houseNumber);
                }
            }, this);
        }
    },

    handleHouseNumbers: function (data) {
        this.createHouseNumbers(data);
        this.searchInHouseNumbers();
        Radio.trigger("Searchbar", "createRecommendedList", "gazetteer_streetsOrHouseNumbers");
    },

    createHouseNumbers: function (data) {
        const streetname = this.get("onlyOneStreetName");

        this.setHouseNumbers(data, streetname);
    },

    getParcel: function (data) {
        const hits = $("wfs\\:member,member", data),
            namespacePrefix = this.getNamespacePrefix();
        let coordinate,
            position,
            geom,
            gemarkung,
            flurstueck;

        hits.each(function (i, hit) {
            position = $(hit).find("gml\\:pos,pos")[0].textContent.split(" ");
            gemarkung = $(hit).find(`${namespacePrefix}\\:gemarkung,gemarkung`)[0].textContent;
            flurstueck = $(hit).find(`${namespacePrefix}\\:flurstuecksnummer,flurstuecksnummer`)[0].textContent;
            coordinate = [parseFloat(position[0]), parseFloat(position[1])];
            geom = $(hit).find("gml\\:posList, posList")[0].textContent;
            // "Hitlist-Objekte"
            Radio.trigger("Searchbar", "pushHits", "hitList", {
                name: "Flurstück " + gemarkung + "/" + flurstueck,
                type: i18next.t("common:modules.searchbar.type.parcel"),
                coordinate: coordinate,
                glyphicon: "glyphicon-map-marker",
                geom: geom,
                id: "Parcel"
            });
        }, this);
        Radio.trigger("Searchbar", "createRecommendedList", "gazetter_parcel");
    },

    getStreetKey: function (data) {
        const hits = $("wfs\\:member,member", data),
            namespacePrefix = this.getNamespacePrefix();
        let coordinates,
            hitName;

        hits.each(function (i, hit) {
            if ($(hit).find("gml\\:posList,posList").length > 0 && $(hit).find(`${namespacePrefix}\\:strassenname, strassenname`).length > 0) {
                coordinates = $(hit).find("gml\\:posList,posList")[0].textContent.split(" ");
                hitName = $(hit).find(`${namespacePrefix}\\:strassenname, strassenname`)[0].textContent;
                // "Hitlist-Objekte"
                Radio.trigger("Searchbar", "pushHits", "hitList", {
                    name: hitName,
                    type: i18next.t("common:modules.searchbar.type.street"),
                    coordinate: coordinates,
                    glyphicon: "glyphicon-road",
                    id: hitName.replace(/ /g, "") + "Straße"
                });
            }
        }, this);
        Radio.trigger("Searchbar", "createRecommendedList", "gazetteer_streetKey");
    },
    /**
     * @description Führt einen HTTP-GET-Request aus.
     * @param {String} data - Data to be sent to the server
     * @param {function} successFunction - A function to be called if the request succeeds
     * @param {String} type - Typ des Requests
     * @returns {void}
     */
    sendRequest: function (data, successFunction, type) {
        const ajax = this.get("ajaxRequests");

        if (ajax[type] !== null && ajax[type] !== undefined) {
            ajax[type].abort();
            this.polishAjax(type);
        }
        this.ajaxSend(data, successFunction, type);
    },

    ajaxSend: function (data, successFunction, typeRequest) {
        this.get("ajaxRequests")[typeRequest] = $.ajax({
            url: this.get("gazetteerURL"),
            data: data,
            dataType: "xml",
            context: this,
            type: "GET",
            success: successFunction,
            timeout: 6000,
            typeRequest: typeRequest,
            error: function (err) {
                if (err.status !== 0) { // Bei abort keine Fehlermeldung
                    this.showError(err);
                }

                // Markiere den Algorithmus für das entsprechende Suchziel als erledigt
                if (typeRequest === "onlyOneStreetName2" || typeRequest === "onlyOneStreetName1") {
                    Radio.trigger("Searchbar", "abortSearch", "gazetteer_streetsOrHouseNumbers");
                }
                else if (typeRequest === "searchStreetKey2") {
                    Radio.trigger("Searchbar", "abortSearch", "gazetteer_streetKeys");
                }

            },
            complete: function () {
                this.polishAjax(typeRequest);
            }
        }, this);
    },

    /**
     * Triggert die Darstellung einer Fehlermeldung
     * @param {object} err Fehlerobjekt aus Ajax-Request
     * @returns {void}
     */
    showError: function (err) {
        const detail = err.statusText && err.statusText !== "" ? err.statusText : "";

        Radio.trigger("Alert", "alert", i18next.t("common:modules.searchbar.gaz.errorMsg") + " " + detail);
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
    * Setzt den jeweiligen Typ der gesendet wird
    * @param {string} value typeOfRequest
    * @returns {void}
    */
    setTypeOfRequest: function (value) {
        this.set("typeOfRequest", value);
    },

    /**
     * Setter für houseNumbers
     * @param  {xml} data       Antwort des Dienstes
     * @param  {string} streetname Straßenname
     * @returns {void}
     */
    setHouseNumbers: function (data, streetname) {
        const hits = $("wfs\\:member,member", data),
            houseNumbers = [],
            namespacePrefix = this.getNamespacePrefix(),
            that = this;
        let number,
            affix,
            coordinate,
            position,
            name,
            adress = {},
            obj = {};

        hits.each(function (i, hit) {
            position = $(hit).find("gml\\:pos,pos")[0].textContent.split(" ");
            coordinate = [parseFloat(position[0]), parseFloat(position[1])];
            number = $(hit).find(`${namespacePrefix}\\:hausnummer,hausnummer`)[0].textContent;
            if ($(hit).find(`${namespacePrefix}\\:hausnummernzusatz,hausnummernzusatz`)[0] !== undefined) {
                affix = $(hit).find(`${namespacePrefix}\\:hausnummernzusatz,hausnummernzusatz`)[0].textContent;
                name = streetname + " " + number + affix;
                adress = {
                    streetname: streetname,
                    housenumber: number,
                    affix: affix
                };
            }
            else {
                name = streetname + " " + number;
                adress = {
                    streetname: streetname,
                    housenumber: number,
                    affix: ""
                };
            }
            // "Hitlist-Objekte"
            obj = {
                name: name,
                type: i18next.t("common:modules.searchbar.type.address"),
                coordinate: coordinate,
                glyphicon: "glyphicon-map-marker",
                adress: adress,
                id: that.uniqueId("Adresse")
            };

            houseNumbers.push(obj);
        }, this);

        this.set("houseNumbers", houseNumbers);
    },
    /**
     * Returns a unique id, starts with the given prefix
     * @param {string} prefix prefix for the id
     * @returns {string} a unique id
     */
    uniqueId: function (prefix) {
        let counter = this.get("idCounter");
        const id = ++counter;

        this.setIdCounter(id);
        return prefix ? prefix + id : id;
    },
    /**
    * Sets the idCounter.
    * @param {string} value counter
    * @returns {void}
    */
    setIdCounter: function (value) {
        this.set("idCounter", value);
    }
});

export default GazetteerModel;
