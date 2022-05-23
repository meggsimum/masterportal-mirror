import SnippetDropdownModel from "../dropdown/model";
import Overlay from "ol/Overlay.js";
import {GeoJSON} from "ol/format.js";
import {fromCircle} from "ol/geom/Polygon.js";
import {Draw} from "ol/interaction.js";
import {createBox} from "ol/interaction/Draw.js";
import {Circle} from "ol/geom.js";

const GraphicalSelectModel = SnippetDropdownModel.extend(/** @lends GraphicalSelectModel.prototype */{
    defaults: {
        isOpen: false,
        name: "Geometrie",
        type: "string",
        displayName: "Geometrie auswählen",
        snippetType: "graphicalSelect",
        isMultiple: false,
        drawInteraction: undefined,
        circleOverlay: new Overlay({
            offset: [15, 0],
            positioning: "center-left"
        }),
        tooltipOverlay: new Overlay({
            offset: [15, 20],
            positioning: "top-left"
        }),
        snippetDropdownModel: {},
        currentValue: "",
        selectedAreaGeoJson: undefined,
        // translations
        geographicValues: {},
        tooltipMessage: "",
        tooltipMessagePolygon: ""
    },
    /**
     * @class GraphicalSelectModel
     * @extends SnippetDropdownModel
     * @memberof Snippets.GraphicalSelect
     * @description creates a dropdown to select an area in a map by square, circle or polygon. Create it like this: new GraphicalSelectModel({id: "idOfTheCaller"}).
     * The id is used to react only on events of the caller, not on all components, that use a graphicalSelectModel.
     * @constructs
     * @property {Boolean} isOpen=false dropdown is open or closed
     * @property {String} name="Geometrie" name of the dropdown
     * @property {String} type="string" type of the dropdown values
     * @property {String} displayName="Geometrie auswählen" label of the dropdown
     * @property {String} snippetType="graphicalSelect" type of the dropdown values
     * @property {Boolean} isMultiple=false dropdown multiple
     * @property {Object} drawInteraction=undefined the interaction to draw a square, circle or polygon
     * @property {ol.overlay} circleOverlay=new Overlay({offset: [15, 0], positioning: "center-left"}) circle overlay (tooltip) - shows the radius
     * @property {ol.overlay} tooltipOverlay=new Overlay({offset: [15, 20], positioning: "top-left"}) todo
     * @property {Object} snippetDropdownModel={} contains the model of the underlying dropdown
     * @property {Object} geographicValues={"Rechteck aufziehen": "Box", "Kreis aufziehen": "Circle", "Fläche zeichnen": "Polygon"} possible values
     * @property {String} currentValue="" contains the current geographic value for "Box",  "Circle" or "Polygon"
     * @property {String} tooltipMessage="Klicken zum Starten und Beenden" Meassage for tooltip
     * @property {String} tooltipMessagePolygon="Klicken um Stützpunkt hinzuzufügen" Meassage for tooltip
     * @property {ol.geojson} selectedAreaGeoJson={} the selected area as GeoJSON
     * @fires Core#RadioRequestMapCreateLayerIfNotExists
     * @fires Core#RadioTriggerMapAddOverlay
     * @fires Core#RadioTriggerMapRemoveOverlay
     * @fires Core#RadioTriggerMapRegisterListener
     * @fires Snippets.GraphicalSelect#setStatus
     * @fires Snippets.GraphicalSelect#resetView
     * @fires Snippets.GraphicalSelect#resetGeographicSelection
     * @fires Snippets.GraphicalSelect#featureToGeoJson
     * @listens Snippets.Dropdown#ValuesChanged
     * @listens Snippets.Checkbox#ValuesChanged
     */
    initialize: function () {
        this.superInitialize();
        this.changeLang(i18next.language);
        const channel = Radio.channel("GraphicalSelect");

        channel.on({
            "setStatus": this.setStatus,
            "resetView": this.resetView,
            "resetGeographicSelection": this.resetGeographicSelection
        }, this);
        channel.reply({
            "featureToGeoJson": function (feature) {
                return this.featureToGeoJson(feature);
            }
        }, this);
        this.listenTo(this, {
            "change:selectedAreaGeoJson": function () {
                channel.trigger("onDrawEnd", this.get("selectedAreaGeoJson"), this.id);
            }
        });
        this.createDomOverlay("circle-overlay", this.get("circleOverlay"));
        this.createDomOverlay("tooltip-overlay", this.get("tooltipOverlay"));
        this.setDropDownSnippet(new SnippetDropdownModel({
            name: this.get("name"),
            type: this.get("type"),
            displayName: this.get("displayName"),
            values: Object.keys(this.get("geographicValues")),
            snippetType: this.get("snippetType"),
            isMultiple: this.get("isMultiple"),
            preselectedValues: Object.keys(this.get("geographicValues"))[0]
        }));
        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.changeLang
        });
    },
    /**
     * change language - sets default values for the language
     * @param {String} lng the language changed to
     * @returns {Void}  -
     */
    changeLang: function () {
        const geographicValues = {},
            model = this.get("snippetDropdownModel"),
            selectBySquare = i18next.t("common:snippets.graphicalSelect.selectBySquare"),
            selectByCircle = i18next.t("common:snippets.graphicalSelect.selectByCircle"),
            selectByPolygon = i18next.t("common:snippets.graphicalSelect.selectByPolygon");

        geographicValues[selectBySquare] = "Box";
        geographicValues[selectByCircle] = "Circle";
        geographicValues[selectByPolygon] = "Polygon";
        this.set({
            displayName: i18next.t("common:snippets.graphicalSelect.displayName"),
            selectBySquare: selectBySquare,
            selectByCircle: selectByCircle,
            selectByPolygon: selectByPolygon,
            tooltipMessage: i18next.t("common:snippets.graphicalSelect.tooltipMessage"),
            tooltipMessagePolygon: i18next.t("common:snippets.graphicalSelect.tooltipMessagePolygon"),
            geographicValues: geographicValues
        });
        if (model.replaceValueModels) {
            model.replaceValueModels(Object.keys(geographicValues), Object.keys(geographicValues)[0]);
        }
    },
    /**
      * Handles (de-)activation of this Tool
      * @param {String} id of the caller
      * @param {boolean} value flag if tool is active
      * @fires Core#RadioTriggerMapRemoveOverlay
      * @returns {void}
      */
    setStatus: function (id, value) {
        let selectedValues;
        // prevent calls from not active callers

        if (id !== this.id) {
            return;
        }
        if (value) {
            selectedValues = this.get("snippetDropdownModel").getSelectedValues();
            this.createDrawInteraction(id, selectedValues.values[0] || Object.keys(this.get("geographicValues"))[0]);
        }
        else {
            if (typeof this.get("drawInteraction") === "object") {
                this.get("drawInteraction").setActive(false);
            }
            mapCollection.getMap("2D").removeOverlay(this.get("circleOverlay"));
            mapCollection.getMap("2D").removeOverlay(this.get("tooltipOverlay"));
        }
    },

    /**
      * Sets the selection of the dropdown to the default value
      * @param {String} id of the caller
      * @returns {void}
      */
    resetGeographicSelection: function (id) {
        // prevent calls from not active callers
        if (id !== this.id) {
            return;
        }
        this.get("snippetDropdownModel").updateSelectedValues(Object.keys(this.get("geographicValues"))[0]);
    },

    /**
     * Creates a draw interaction and adds it to the map.
     * @param {String} id of the caller
     * @param {String} drawType - drawing type (Box | Circle | Polygon)
     * @fires Core#RadioRequestMapCreateLayerIfNotExists
     * @fires Core#RadioTriggerMapAddOverlay
     * @fires Core#RadioTriggerMapRegisterListener
     * @fires Core#RadioTriggerMapAddInteraction
     * @returns {void}
     */
    createDrawInteraction: function (id, drawType) {
        this.resetView(id);
        const that = this,
            value = this.get("geographicValues")[drawType],
            layer = Radio.request("Map", "createLayerIfNotExists", "ewt_draw_layer"),
            createBoxFunc = createBox(),
            drawInteraction = new Draw({
                // destination for drawn features
                source: layer.getSource(),
                // drawing type
                // a circle with four points is internnaly used as Box, since type "Box" does not exist
                type: value === "Box" ? "Circle" : value,
                // is called when a geometry"s coordinates are updated
                geometryFunction: value === "Polygon" ? undefined : function (coordinates, opt_geom) {
                    if (value === "Box") {
                        return createBoxFunc(coordinates, opt_geom);
                    }
                    // value === "Circle"
                    return that.snapRadiusToInterval(coordinates, opt_geom);
                }
            });

        this.setCurrentValue(value);
        this.toggleOverlay(value, this.get("circleOverlay"));
        Radio.trigger("Map", "addOverlay", this.get("tooltipOverlay"));

        this.setDrawInteractionListener(drawInteraction, layer);
        this.setDrawInteraction(drawInteraction);
        Radio.trigger("Map", "registerListener", "pointermove", this.showTooltipOverlay.bind(this), this);
        Radio.trigger("Map", "addInteraction", drawInteraction);
    },
    /**
     * If drawtype == "Circle" set the radius to the circle-geometry
     * @param {*} coordinates array of coordinates to get the radius from
     * @param {*} opt_geom optional existing geometry
     * @returns {*} the optional existing geometry or a circle geometry
     */
    snapRadiusToInterval: function (coordinates, opt_geom) {
        let radius = Math.sqrt(Math.pow(coordinates[1][0] - coordinates[0][0], 2) + Math.pow(coordinates[1][1] - coordinates[0][1], 2));

        radius = this.precisionRound(radius, -1);
        const geometry = opt_geom || new Circle(coordinates[0]);

        geometry.setRadius(radius);

        this.showOverlayOnSketch(radius, coordinates[1]);
        return geometry;
    },

    /**
     * Sets listeners for draw interaction events. On "drawend" the selected area is stored as geoJSON in the model-property "selectedAreaGeoJson".
     * @param {ol.interaction.Draw} interaction - Interaction for drawing feature geometries.
     * @param {ol.layer.Vector} layer - Vector data that is rendered client-side
     * @returns {void}
     */
    setDrawInteractionListener: function (interaction, layer) {
        const that = this;

        interaction.on("drawstart", function () {
            // remove alert of "more than X tiles"
            Radio.trigger("Alert", "alert:remove");
            layer.getSource().clear();
        }, this);

        interaction.on("drawend", function (evt) {
            const geoJson = that.featureToGeoJson(evt.feature);

            that.setSelectedAreaGeoJson(geoJson);
        }, this);

        interaction.on("change:active", function (evt) {
            if (evt.oldValue) {
                layer.getSource().clear();
                Radio.trigger("Map", "removeInteraction", evt.target);
            }
        });
    },
    /**
    * Converts a feature to a geojson.
    * If the feature geometry is a circle, it is converted to a polygon.
    * @param {ol.Feature} feature - drawn feature
    * @returns {object} GeoJSON
    */
    featureToGeoJson: function (feature) {
        const reader = new GeoJSON(),
            geometry = feature.getGeometry();

        if (geometry.getType() === "Circle") {
            feature.setGeometry(fromCircle(geometry));
        }
        return reader.writeGeometryObject(feature.getGeometry());
    },

    /**
     * Used to hide Geometry and Textoverlays if request was unsuccessful for any reason
     * @param {String} id of the caller
     * @fires Core#RadioRequestMapCreateLayerIfNotExists
     * @fires Core#RadioTriggerMapRemoveOverlay
     * @returns {void}
     */
    resetView: function (id) {
        // prevent calls from not active callers
        if (id !== this.id) {
            return;
        }
        const layer = Radio.request("Map", "createLayerIfNotExists", "ewt_draw_layer");

        if (layer) {
            layer.getSource().clear();
            mapCollection.getMap("2D").removeOverlay(this.get("circleOverlay"));
            mapCollection.getMap("2D").removeOverlay(this.get("tooltipOverlay"));
            Radio.trigger("Map", "removeInteraction", this.get("drawInteraction"));
        }
    },

    /**
     * Calculates the circle radius and places the circle overlay on geometry change.
     * @param {number} radius - circle radius
     * @param {number[]} coords - point coordinate
     * @returns {void}
     */
    showOverlayOnSketch: function (radius, coords) {
        const circleOverlay = this.get("circleOverlay");

        circleOverlay.getElement().innerHTML = this.roundRadius(radius);
        circleOverlay.setPosition(coords);
    },

    /**
     * Shows tooltips at position of the event.
     * @param {*} evt of the pointermove
     * @returns {void}
     */
    showTooltipOverlay: function (evt) {
        const coords = evt.coordinate,
            tooltipOverlay = this.get("tooltipOverlay"),
            currentValue = this.get("currentValue");

        if (currentValue === "Polygon") {
            tooltipOverlay.getElement().innerHTML = this.get("tooltipMessagePolygon");
        }
        else {
            tooltipOverlay.getElement().innerHTML = this.get("tooltipMessage");
        }
        tooltipOverlay.setPosition(coords);
    },

    /**
     * Rounds the given number with the given precision.
     * @param {Number} number to round
     * @param {Number} precision exponent
     * @returns {Number} the rounded number
     */
    precisionRound: function (number, precision) {
        const factor = Math.pow(10, precision);

        return Math.round(number * factor) / factor;
    },


    /**
     * Adds or removes the circle overlay from the map.
     * @param {String} type - geometry type
     * @param {ol.Overlay} overlay - circleOverlay
     * @fires Core#RadioTriggerMapAddOverlay
     * @fires Core#RadioTriggerMapRemoveOverlay
     * @returns {void}
     */
    toggleOverlay: function (type, overlay) {
        if (type === "Circle") {
            Radio.trigger("Map", "addOverlay", overlay);
        }
        else {
            mapCollection.getMap("2D").removeOverlay(overlay);
        }
    },

    /**
     * Rounds the circle radius.
     * @param {number} radius - circle radius
     * @return {String} the rounded radius
     */
    roundRadius: function (radius) {
        if (radius > 500) {
            return (Math.round(radius / 1000 * 100) / 100) + " km";
        }
        return (Math.round(radius * 10) / 10) + " m";
    },

    /**
     * Creates a div element for the circle overlay
     * and adds it to the overlay.
     * @param {String} id - id of the div to create
     * @param {ol.Overlay} overlay - circleOverlay
     * @returns {void}
     */
    createDomOverlay: function (id, overlay) {
        const element = document.createElement("div");

        element.setAttribute("id", id);
        overlay.setElement(element);
    },
    /**
     * Sets  the current geographic value for "Box",  "Circle" or "Polygon"
     * @param {String} value the current geographic value
     * @returns {void}
     */
    setCurrentValue: function (value) {
        this.set("currentValue", value);
    },
    /**
     * Sets the model of the underlying dropdown
     * @param {*} value model
     * @returns {void}
     */
    setDropDownSnippet: function (value) {
        this.set("snippetDropdownModel", value);
    },
    /**
     * Sets the drawInteraction - the interaction to draw a square, circle or polygon
     * @param {*} value interavtion to draw
     * @returns {void}
     */
    setDrawInteraction: function (value) {
        this.set("drawInteraction", value);
    },
    /**
    * Sets the selected area as GeoJSON
    * @param {*} value selected area as GeoJSON
    * @returns {void}
    */
    setSelectedAreaGeoJson: function (value) {
        this.set("selectedAreaGeoJson", value);
    }

});

export default GraphicalSelectModel;
