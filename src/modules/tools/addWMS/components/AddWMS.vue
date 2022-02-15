<script>
import {mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersAddWMS";
import getComponent from "../../../../utils/getComponent";
import ToolTemplate from "../../ToolTemplate.vue";
import mutations from "../store/mutationsAddWMS";
import {WMSCapabilities} from "ol/format.js";
import {intersects} from "ol/extent";
import {transform as transformCoord, getProjection} from "masterportalAPI/src/crs";
import axios from "axios";

export default {
    name: "AddWMS",
    components: {
        ToolTemplate
    },
    data: function () {
        return {
            treeTyp: Radio.request("Parser", "getTreeType"),
            uniqueId: 100,
            invalidUrl: false,
            wmsUrl: "",
            version: ""
        };
    },
    computed: {
        ...mapGetters("Tools/AddWMS", Object.keys(getters)),

        placeholder () {
            return i18next.t("common:modules.tools.addWMS.placeholder");
        },

        textLoadLayer () {
            return i18next.t("common:modules.tools.addWMS.textLoadLayer");
        },

        errorEmptyUrl () {
            return i18next.t("common:modules.tools.addWMS.errorEmptyUrl");
        },

        errorHttpUrl () {
            return i18next.t("common:modules.tools.addWMS.errorHttpsMessage");
        },

        errorIfInExtent () {
            return i18next.t("common:modules.tools.addWMS.ifInExtent");
        },

        completeMessage () {
            return i18next.t("common:modules.tools.addWMS.completeMessage");
        }
    },
    watch: {
        /**
         * Listens to the active property change.
         * @param {Boolean} isActive Value deciding whether the tool gets activated or deactivated.
         * @returns {void}
         */
        active (isActive) {
            if (isActive) {
                this.setFocusToFirstControl();
            }
        }
    },
    created () {
        this.$on("close", this.close);

        if (!["custom", "default"].includes(this.treeTyp)) {
            console.error("The addWMS tool is currently only supported for the custom and default theme trees!");
            this.close();
        }
    },
    methods: {
        ...mapMutations("Tools/AddWMS", Object.keys(mutations)),

        /**
         * Sets the focus to the first control
         * @returns {void}
         */
        setFocusToFirstControl () {
            this.$nextTick(() => {
                if (this.$refs.wmsUrl) {
                    this.$refs.wmsUrl.focus();
                }
            });
        },
        /**
         * Closes this tool window by setting active to false
         * @returns {void}
         */
        close () {
            this.setActive(false);
            // The value "isActive" of the Backbone model is also set to false to change the CSS class in the menu (menu/desktop/tool/view.toggleIsActiveClass)
            const model = getComponent(this.id);

            if (model) {
                model.set("isActive", false);
            }
        },

        /**
         * Send via Enter key.
         * @param {Event} event - Key event.
         * @returns {void}
         */
        keydown: function (event) {
            const code = event.keyCode;

            if (code === 13) {
                this.importLayers();
            }
        },

        /**
         * Importing the external wms layers
         * @fires Core#RadioTriggerUtilShowLoader
         * @fires Core#RadioTriggerUtilHideLoader
         * @fires Core.ModelList#RadioTriggerModelListRenderTree
         * @fires Core.ConfigLoader#RadioTriggerParserAddFolder
         * @returns {void}
         */
        importLayers: function () {
            const url = this.$el.querySelector("#wmsUrl").value.trim();

            this.invalidUrl = false;
            if (url === "") {
                this.invalidUrl = true;
                return;
            }
            else if (url.includes("http:")) {
                this.$store.dispatch("Alerting/addSingleAlert", this.errorHttpUrl);
                return;
            }
            Radio.trigger("Util", "showLoader");
            axios({
                timeout: 4000,
                url: url + "?request=GetCapabilities&service=WMS"
            })
                .then(response => response.data)
                .then((data) => {
                    Radio.trigger("Util", "hideLoader");
                    try {
                        const parser = new WMSCapabilities(),
                            uniqId = this.getAddWmsUniqueId(),
                            capability = parser.read(data),
                            version = capability?.version,
                            checkVersion = this.isVersionEnabled(version),
                            currentExtent = Radio.request("Parser", "getPortalConfig")?.mapView?.extent;

                        let checkExtent = this.getIfInExtent(capability, currentExtent),
                            finalCapability = capability;

                        if (!checkVersion) {
                            const reversedData = this.getReversedData(data);

                            finalCapability = parser.read(reversedData);
                            checkExtent = this.getIfInExtent(finalCapability, currentExtent);
                        }

                        if (!checkExtent) {
                            this.$store.dispatch("Alerting/addSingleAlert", this.errorIfInExtent);
                            return;
                        }

                        this.version = version;
                        this.wmsUrl = url;

                        if (Radio.request("Parser", "getItemByAttributes", {id: "ExternalLayer"}) === undefined) {
                            Radio.trigger("Parser", "addFolder", "Externe Fachdaten", "ExternalLayer", "tree", 0);
                            Radio.trigger("ModelList", "renderTree");
                            $("#Overlayer").parent().after($("#ExternalLayer").parent());
                        }
                        Radio.trigger("Parser", "addFolder", finalCapability.Service.Title, uniqId, "ExternalLayer", 0);
                        finalCapability.Capability.Layer.Layer.forEach(layer => {
                            this.parseLayer(layer, uniqId, 1);
                        });
                        Radio.trigger("ModelList", "closeAllExpandedFolder");

                        this.$store.dispatch("Alerting/addSingleAlert", this.completeMessage);

                    }
                    catch (e) {
                        this.displayErrorMessage();
                    }
                }, () => {
                    Radio.trigger("Util", "hideLoader");
                    this.displayErrorMessage();
                });
        },

        /**
         * Send via Enter key.
         * @param {Event} e - Key event.
         * @returns {void}
         */
        inputUrl: function (e) {
            const code = e.keyCode;

            this.invalidUrl = false;
            if (code === 13) {
                this.importLayers();
            }
        },

        /**
         * Display error message for wms which have misspelling or no CORS-Header.
         * @returns {void}
         */
        displayErrorMessage: function () {
            this.$store.dispatch("Alerting/addSingleAlert", i18next.t("common:modules.tools.addWMS.errorMessage"));
        },

        /**
         * Appending folders and layers to the menu based on the given layer object
         * @info recursive function
         * @param {Object} object the ol layer to hang into the menu as new folder or new layer
         * @param {String} parentId the id of the parent object in the menu
         * @param {Number} level the depth of the recursion
         * @fires Core.ConfigLoader#RadioTriggerParserAddFolder
         * @fires Core.ConfigLoader#RadioTriggerParserAddLayer
         * @return {void}
         */
        parseLayer: function (object, parentId, level) {
            if (Object.prototype.hasOwnProperty.call(object, "Layer")) {
                object.Layer.forEach(layer => {
                    this.parseLayer(layer, this.getParsedTitle(object.Title), level + 1);
                });
                Radio.trigger("Parser", "addFolder", object.Title, this.getParsedTitle(object.Title), parentId, level, false, false, object.invertLayerOrder);
            }
            else {
                Radio.trigger("Parser", "addLayer", object.Title, this.getParsedTitle(object.Title), parentId, level, object.Name, this.wmsUrl, this.version, {});
            }
        },

        /**
         * Getter if the version is enabled and above 1.3.0
         * @param {String} version the version of current external wms layer
         * @returns {Boolean} true or false
         */
        isVersionEnabled: function (version) {
            if (typeof version !== "string") {
                return false;
            }

            const parsedVersion = version.split(".");

            if (parseInt(parsedVersion[0], 10) < 1) {
                return false;
            }
            else if (parsedVersion.length >= 2 && parseInt(parsedVersion[0], 10) === 1 && parseInt(parsedVersion[1], 10) < 3) {
                return false;
            }

            return true;
        },

        /**
         * Getter if the imported wms layer in the extent of current map
         * @param {Object} capability the response of the imported wms layer in parsed format
         * @param {Number[]} currentExtent the extent of current map view
         * @returns {Boolean} true or false
         */
        getIfInExtent: function (capability, currentExtent) {
            const layer = capability?.Capability?.Layer?.BoundingBox?.filter(bbox => {
                return bbox?.crs && bbox?.crs.includes("EPSG") && getProjection(bbox?.crs) !== undefined && Array.isArray(bbox?.extent) && bbox?.extent.length === 4;
            });
            let layerExtent;

            // If there is no extent defined or the extent is not right defined, it will import the external wms layer(s).
            if (!Array.isArray(currentExtent) || currentExtent.length !== 4) {
                return true;
            }

            if (Array.isArray(layer) && layer.length) {
                let firstLayerExtent = [],
                    secondLayerExtent = [];

                layer.forEach(singleLayer => {
                    if (singleLayer.crs === "EPSG:25832") {
                        firstLayerExtent = [singleLayer.extent[0], singleLayer.extent[1]];
                        secondLayerExtent = [singleLayer.extent[2], singleLayer.extent[3]];
                    }
                });

                if (!firstLayerExtent.length && !secondLayerExtent.length) {
                    firstLayerExtent = transformCoord(layer[0].crs, "EPSG:25832", [layer[0].extent[0], layer[0].extent[1]]);
                    secondLayerExtent = transformCoord(layer[0].crs, "EPSG:25832", [layer[0].extent[2], layer[0].extent[3]]);
                }

                layerExtent = [firstLayerExtent[0], firstLayerExtent[1], secondLayerExtent[0], secondLayerExtent[1]];

                return intersects(currentExtent, layerExtent);
            }

            return true;
        },

        /**
         * Getter for reversed data of old wms version
         * @param {Object} data the response of the imported wms layer
         * @returns {xml} reversedData - The reversed data of the response of the imported wms layer
         */
        getReversedData: function (data) {
            let reversedData = new XMLSerializer().serializeToString(data);

            reversedData = reversedData.replace(/<SRS>/g, "<CRS>").replace(/<\/SRS>/g, "</CRS>").replace(/SRS=/g, "CRS=");
            reversedData = new DOMParser().parseFromString(reversedData, "text/xml");

            return reversedData;
        },

        /**
         * Getter for addWMS UniqueId.
         * Counts the uniqueId 1 up.
         * @returns {String} uniqueId - The unique id for addWMS.
         */
        getAddWmsUniqueId: function () {
            const uniqueId = this.uniqueId;

            this.uniqueId = uniqueId + 1;
            return "external_" + uniqueId;
        },

        /**
         * Getter for parsed title without space and slash
         * It will be used as id later in template
         * @param {String} title - the title of current layer
         * @returns {String} parsedTitle - The parsed title
         */
        getParsedTitle: function (title) {
            return String(title).replace(/\s+/g, "-").replace(/\//g, "-");
        }
    }
};
</script>

<template>
    <ToolTemplate
        :title="$t(name)"
        :icon="glyphicon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivate-gfi="deactivateGFI"
    >
        <template #toolBody>
            <div
                v-if="active"
                id="add-wms"
                class="addWMS win-body"
            >
                <div
                    v-if="invalidUrl"
                    class="addwms_error"
                >
                    {{ errorEmptyUrl }}
                </div>
                <input
                    id="wmsUrl"
                    ref="wmsUrl"
                    aria-label="WMS-Url"
                    type="text"
                    class="form-control wmsUrlsChanged"
                    :placeholder="placeholder"
                    @keydown.enter="inputUrl"
                >
                <button
                    id="addWMSButton"
                    type="button"
                    class="btn btn-primary"
                    @click="importLayers"
                >
                    <span
                        class=""
                        aria-hidden="true"
                    >{{ textLoadLayer }}</span>
                    <span
                        class="glyphicon glyphicon-ok"
                        aria-hidden="true"
                    />
                </button>
            </div>
        </template>
    </ToolTemplate>
</template>

<style lang="scss" scoped>
    @import "~variables";
    .addWMS {
        min-width: 400px;
    }
    .WMS_example_text {
        margin-top: 10px;
        color: #777;
    }
    #addWMSButton {
        margin-top: 15px;
        width: 50%;
    }
    .addwms_error {
        font-size: 16px;
        color: #d42132;
        margin-bottom: 10px;
    }
</style>
