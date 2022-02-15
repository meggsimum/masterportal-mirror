import Layer from "./model";
import Collection from "vcs-oblique/src/vcs/oblique/collection";
import {get} from "ol/proj.js";
import getProxyUrl from "../../../../src/utils/getProxyUrl";

const ObliqueLayer = Layer.extend(/** @lends  ObliqueLayer.prototype*/{
    defaults: Object.assign({}, Layer.prototype.defaults, {
        supported: ["none"],
        showSettings: false,
        isVisibleInTree: false,
        selectionIDX: -1,
        useProxy: false
    }),
    /**
     * @class ObliqueLayer
     * @extends Layer
     * @memberof Core.ModelList.Layer
     * @constructs
     * @property {String[]} supported=["none"] Shows that this layer is not supported in "2D" and "3D".
     * @property {Boolean} showSettings=false Flag that for this layer the layerinformation can not be displayed.
     * @property {Boolean} isVisibleInTree=false Flag that shows that layer is not visible in layertree.
     * @property {Boolean} useProxy=false Attribute to request the URL via a reverse proxy.
     * @fires ObliqueMap#RadioTriggerObliqueMapRegisterLayer
     * @fires ObliqueMap#RadioRequestObliqueMapIsActive
     * @fires ObliqueMap#RadioTriggerObliqueMapActivateLayer
     * @listens Layer#RadioTriggerLayerUpdateLayerInfo
     * @listens Layer#RadioTriggerLayerSetLayerInfoChecked
     * @listens Layer#changeIsVisibleInMap
     */
    initialize: function () {
        this.listenTo(Radio.channel("Layer"), {
            "updateLayerInfo": function (name) {
                if (this.get("name") === name && this.get("layerInfoChecked") === true) {
                    this.showLayerInformation();
                }
            },
            "setLayerInfoChecked": function (layerInfoChecked) {
                this.setLayerInfoChecked(layerInfoChecked);
            }
        });

        this.listenTo(this, {
            "change:isVisibleInMap": function () {
                this.toggleAttributionsInterval();
            }
        });
        // set default value for resolution
        this.set("resolution", this.get("resolution") || 10);
    },

    /**
     * Returns the oblique Collection as a promise.
     * If meta data is not loaded yet, it gets loaded.
     * @returns {Promise} - Oblique Collection
     */
    getObliqueCollection: function () {
        /**
         * @deprecated in the next major-release!
         * useProxy
         * getProxyUrl()
         */
        const url = this.get("useProxy") ? getProxyUrl(this.get("url")) : this.get("url");
        let projection = "",
            proj = "",
            obliqueCollection = "",
            hideLevels = "",
            minZoom = "";

        if (this.has("obliqueCollection")) {
            return Promise.resolve(this.get("obliqueCollection"));
        }
        hideLevels = this.get("hideLevels") || 0;
        minZoom = this.get("minZoom") || 0;
        projection = Radio.request("MapView", "getProjection");
        proj = get(projection);
        obliqueCollection = new Collection({
            terrainProvider: null,
            projection: proj,
            hideLevels: hideLevels,
            minZoom: minZoom
        });
        return obliqueCollection.loadData(url).then(function () {
            this.setObliqueCollection(obliqueCollection);
            return obliqueCollection;
        }.bind(this));
    },


    /**
     * @description Setter for attribute "obliqueCollection".
     * @param {oblique/Collection} obliqueCollection The oblique collection.
     * @returns {void}
     */
    setObliqueCollection: function (obliqueCollection) {
        this.set("obliqueCollection", obliqueCollection);
    },

    /**
     * Activates the layer in the oblique map.
     * @fires ObliqueMap#RadioRequestObliqueMapIsActive
     * @fires ObliqueMap#RadioTriggerObliqueMapActivateLayer
     * @returns {void}
     */
    activateLayerOnMap: function () {
        if (Radio.request("ObliqueMap", "isActive") === true) {
            if (this.get("isVisibleInMap") === true) {
                Radio.trigger("ObliqueMap", "activateLayer", this);
            }
        }
    },

    /**
     * Called from obliqueMap, if another oblique layer gets activated.
     * @returns {void}
     */
    deactivateLayer: function () {
        this.set("isVisibleInMap", false);
        this.set("isSelected", false);
    },

    /**
     * Setter for attribute "isVisibleInMap".
     * If layer is set visible, the function activateLayerOnMap() is called.
     * @param {boolean} value -
     * @returns {void}
     */
    setIsVisibleInMap: function (value) {
        if (value) {
            this.set("isVisibleInMap", value);
            this.activateLayerOnMap();
        }
    }
});

export default ObliqueLayer;
