define([
    "backbone",
    "eventbus"
    ], function (Backbone, EventBus) {
    "use strict";
    return Backbone.Model.extend({
        /**
        *
        */
        defaults: {
            inUse: false,
            gazetteerURL: "",
            searchStreets: false,
            searchHouseNumbers: false,
            searchDistricts: false,
            onlyOneStreetName: "",
            searchStringRegExp: "",
            houseNumbers: []
        },
        /**
         * @description Initialisierung der Gazetteer Suche
         *
         * @param {String} gazetteerURL - A string containing the URL to which the request is sent
         * @param {boolean} searchHouseNumbers - sollen auch Hausnummern gesucht werden oder nur Straßen
         */
        initialize: function (gazetteerURL, searchStreets, searchHouseNumbers, searchDistricts) {
            this.set("gazetteerURL", gazetteerURL);
            this.set("searchStreets", searchStreets);
            this.set("searchHouseNumbers", searchHouseNumbers);
            this.set("searchDistricts", searchDistricts);
            EventBus.on("searchbar:search", this.search, this);
        },
        /**
        *
        */
        search: function (searchString) {
            if (this.get("inUse") === false) {
                this.set("inUse", true);

                if (this.get("searchStreets") === true) {
                    this.set("searchStringRegExp", new RegExp(searchString.replace(/ /g, ""), "i")); // Erst join dann als regulärer Ausdruck
                    this.set("onlyOneStreetName", "");
                    this.sendRequest("StoredQuery_ID=findeStrasse&strassenname=" + encodeURIComponent(searchString), this.getStreets, true);
                }
                if (this.get("searchDistricts") === true) {
                    this.sendRequest("StoredQuery_ID=findeStadtteil&stadtteilname=" + searchString, this.getDistricts, true);
                }
            }

        },
        /**
         * [getStreets description]
         * @param  {[type]} data [description]
         */
        getStreets: function (data) {
            var hits = $("wfs\\:member,member", data),
                coordinates,
                hitName;

            _.each(hits, function (hit) {
                coordinates = $(hit).find("gml\\:posList,posList")[0].textContent;
                hitName = $(hit).find("dog\\:strassenname, strassenname")[0].textContent;
                // "Hitlist-Objekte"
                EventBus.trigger("searchbar:pushHits", "hitList", {
                    name: hitName,
                    type: "Straße",
                    coordinate: coordinates,
                    glyphicon: "glyphicon-road",
                    id: hitName.replace(/ /g, "") + "Straße"
                });
            }, this);
            if (this.get("searchHouseNumbers") === true) {
                if (hits.length === 1) {
                    this.set("onlyOneStreetName", hitName);
                    this.sendRequest("StoredQuery_ID=HausnummernZuStrasse&strassenname=" + encodeURIComponent(hitName), this.getHouseNumbers, true);
                    this.searchInHouseNumbers();
                }
                else if (hits.length === 0) {
                    this.searchInHouseNumbers();
                }
            }
            this.set("inUse", false);
            EventBus.trigger("createRecommendedList");
        },
        /**
         * [getDistricts description]
         * @param  {[type]} data [description]
         * @return {[type]}      [description]
         */
        getDistricts: function (data) {
            var hits = $("wfs\\:member,member", data),
                coordinate,
                position,
                hitName;

            _.each(hits, function (hit) {
                position = $(hit).find("gml\\:pos,pos")[0].textContent.split(" ");
                coordinate = [parseFloat(position[0]), parseFloat(position[1])];
                hitName = $(hit).find("dog\\:kreisname_normalisiert, kreisname_normalisiert")[0].textContent;
                // "Hitlist-Objekte"
                EventBus.trigger("searchbar:pushHits", "hitList", {
                    name: hitName,
                    type: "Stadtteil",
                    coordinate: coordinate,
                    glyphicon: "glyphicon-map-marker",
                    id: hitName.replace(/ /g, "") + "Stadtteil"
                });
            }, this);
            this.set("inUse", false);
            EventBus.trigger("createRecommendedList");
        },
        searchInHouseNumbers: function () {
            var address;

            _.each(this.get("houseNumbers"), function (houseNumber) {
                address = houseNumber.name.replace(/ /g, "");

                // Prüft ob der Suchstring ein Teilstring vom B-Plan ist
                if (address.search(this.get("searchStringRegExp")) !== -1) {
                    EventBus.trigger("searchbar:pushHits", "hitList", houseNumber);
                }
            }, this);
        },
        /**
         * [getHouseNumbers description]
         * @param  {[type]} data [description]
         */
        getHouseNumbers: function (data) {
            var hits = $("wfs\\:member,member", data),
                number,
                affix,
                coordinate,
                position,
                name,
                addressJoin;

            _.each(hits, function (hit) {
                position = $(hit).find("gml\\:pos,pos")[0].textContent.split(" ");
                coordinate = [parseFloat(position[0]), parseFloat(position[1])];
                number = $(hit).find("dog\\:hausnummer,hausnummer")[0].textContent;
                if ($(hit).find("dog\\:hausnummernzusatz,hausnummernzusatz")[0] !== undefined) {
                    affix = $(hit).find("dog\\:hausnummernzusatz,hausnummernzusatz")[0].textContent;
                    name = this.get("onlyOneStreetName") + " " + number + affix;
                    addressJoin = this.get("onlyOneStreetName").replace(/ /g, "") + number + affix;
                }
                else {
                    name = this.get("onlyOneStreetName") + " " + number ;
                    addressJoin = this.get("onlyOneStreetName").replace(/ /g, "") + number;
                }

                // "Hitlist-Objekte"
                if (addressJoin.search(this.get("searchStringRegExp")) !== -1) {
                    var obj = {
                        name: name,
                        type: "Adresse",
                        coordinate: coordinate,
                        glyphicon: "glyphicon-map-marker",
                        id: addressJoin.replace(/ /g, "") + "Adresse"
                    };

                    EventBus.trigger("searchbar:pushHits", "houseNumbers", obj);
                    this.get("houseNumbers").push(obj);
                }
            }, this);
        },
        /**
         * @description Führt einen HTTP-GET-Request aus.
         *
         * @param {String} url - A string containing the URL to which the request is sent
         * @param {String} data - Data to be sent to the server
         * @param {function} successFunction - A function to be called if the request succeeds
         * @param {boolean} asyncBool - asynchroner oder synchroner Request
         */
        sendRequest: function (data, successFunction, asyncBool) {
            $.ajax({
                url: this.get("gazetteerURL"),
                data: data,
                context: this,
                async: asyncBool,
                type: "GET",
                success: successFunction,
                timeout: 6000,
                error: function () {
                    EventBus.trigger("alert", "Gazetteer-URL nicht erreichbar.");
                }
            });
        }
    });
});
