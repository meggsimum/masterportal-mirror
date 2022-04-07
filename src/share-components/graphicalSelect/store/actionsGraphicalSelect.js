import {GeoJSON} from "ol/format.js";
import {fromCircle} from "ol/geom/Polygon.js";

const actions = {
    /**
     * Sets listeners for draw interaction events. On "drawend" the selected area is stored as geoJSON in the model-property "selectedAreaGeoJson".
     * @param {Object} dispatch commit vuex element
     * @param {Object} payload vuex element
     * @param {Object} payload.interaction Interaction for drawing feature geometries
     * @param {Object} payload.layer Vector data that is rendered client-side
     * @param {Object} payload.vm vue instance
     * @todo Replace Radio.trigger after refactoring
     * @returns {void}
     */
    setDrawInteractionListener: async function ({dispatch, commit}, payload) {
        payload.interaction.on("drawstart", function () {
            // remove possible alerts
            dispatch("Alerting/cleanup", "", {root: true});
            payload.layer.getSource().clear();
        });

        payload.interaction.on("drawend", async function (evt) {
            const geoJson = await dispatch("featureToGeoJson", evt.feature);

            commit("setSelectedAreaGeoJson", geoJson);
            payload.vm.$parent.$parent.$emit("onDrawEnd", geoJson);
        });

    },

    /**
    * Converts a feature to a geojson.
    * If the feature geometry is a circle, it is converted to a polygon.
    * @param {Object} context commit vuex element
    * @param {ol.Feature} feature drawn feature
    * @returns {Object} GeoJSON
    */
    featureToGeoJson: async function (context, feature) {
        const reader = new GeoJSON(),
            geometry = feature.getGeometry();

        if (geometry.getType() === "Circle") {
            feature.setGeometry(fromCircle(geometry));
        }

        return reader.writeGeometryObject(feature.getGeometry());
    },

    /**
     * Shows tooltips at position of the event.
     * @param {Object} state vuex element
     * @param {Object} rootState vuex element
     * @returns {void}
     */
    showTooltipOverlay: function ({state, rootState}) {
        const coords = rootState.Maps.mouseCoordinate,
            tooltipOverlay = state.tooltipOverlay,
            currentValue = state.currentValue;

        if (currentValue === "Polygon") {
            tooltipOverlay.element.innerHTML = i18next.t(state.tooltipMessagePolygon);
        }
        else {
            tooltipOverlay.element.innerHTML = i18next.t(state.tooltipMessage);
        }
        tooltipOverlay.setPosition(coords);
    },

    /**
     * Adds or removes the circle overlay from the map.
     * @param {Object} context vuex element
     * @param {Object} payload vuex element
     * @param {String} payload.type geometry type
     * @param {Object} payload.overlayCircle circleOverlay
     * @param {Object} payload.overlayTool toolOverlay
     * @todo Replace if removeOverlay, addOverlay is available in vue
     * @fires Core#RadioTriggerMapAddOverlay
     * @fires Core#RadioTriggerMapRemoveOverlay
     * @returns {void}
     */
    toggleOverlay: function (context, payload) {
        if (payload.type === "Circle") {
            Radio.trigger("Map", "addOverlay", payload.overlayCircle);
            Radio.trigger("Map", "addOverlay", payload.overlayTool);
        }
        else {
            Radio.trigger("Map", "removeOverlay", payload.overlayCircle);
            Radio.trigger("Map", "addOverlay", payload.overlayTool);
        }
    },

    /**
     * Creates a div element for the circle overlay
     * and adds it to the overlay.
     * @param {Object} context vuex element
     * @param {Object} payload vuex element
     * @param {String} payload.id id of the div to create
     * @param {Object} payload.overlay circleOverlay
     * @returns {void}
     */
    createDomOverlay: function (context, payload) {
        const element = document.createElement("div");

        element.id = payload.id;
        payload.overlay.element = element;
    }
};

export default actions;
