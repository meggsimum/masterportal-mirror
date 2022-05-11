import axios from "axios";
import EntitiesLayer from "../../../src/core/layers/entities";
import TileSetLayer from "../../../src/core/layers/tileset";
import {parseFlightOptions} from "./flight";
import StaticImageLayer from "../../core/modelList/layer/staticImage";
import store from "../../../src/app-store";

/**
 * ATTENTION! This tool is not tested and may not work anymore, since tileset-layer was refactored (Issue BG-1843).
 * Last Version with backbone tileset-layer is masterportal v2.18.0.
 */
const Planning = Backbone.Model.extend(/** @lends Planning.prototype */ {
    defaults: Object.assign({}, Backbone.Model.defaults, {
        id: null,
        url: null,
        hiddenObjects: [],
        planningObjects: [],
        viewpoints: [],
        flights: []
    }),

    /**
     * @class Planning
     * @extends Backbone.Model
     * @description Planning Instance of the virtualcitysystems PlanningService, a container for 3d models, vector layer and viewpoints
     * @memberof Tools.VirtualCity
     * @constructs
     * @property {string} id - id of the planning
     * @property {string} url - url of the virtualcitysystems planning service
     * @property {Array} hiddenObjects - list of ids to hide in the base datasets
     * @property {Array} planningObjects - list of planningObjects
     * @property {Array} viewpoints - list of planning viewpoints
     * @property {Array} flights - list of planning flights
     * @listens Core#RadioTriggerMapChange
     * @fires Core#RadioRequestMapIsMap3d
     * @fires Core#RadioTriggerMapSetCameraParameter
     */
    initialize () {
        this.readyPromise = null;
        this.entitiesLayer = null;
        this.defaultViewpoint = null;
        this.planningTilesetInstances = [];
        this.staticImageLayers = [];
        this.flightInstances = [];
    },

    /**
     * initializes the Planning, fetches the data from the server and creates all the layer elements
     * @return {Promise} Promise which resolves when the planning is loaded.
     * @listens Core#RadioTriggerMapChange
     */
    initializePlanning: function () {
        if (!this.readyPromise) {
            const promises = [];

            this.entitiesLayer = new EntitiesLayer({});
            this.entitiesLayer.initialize();
            this.entitiesLayer.prepareLayerObject();
            this.get("planningObjects").forEach((planningObjectData)=> {
                if (planningObjectData.status === "ready" && planningObjectData.visibility === true) {
                    if (planningObjectData.type === "gltf") {
                        const entityOptions = planningObjectData.modelMeta;

                        this.entitiesLayer.addEntityFromOptions(Object.assign(entityOptions, {
                            url: `${this.get("url")}${planningObjectData.url}`
                        }));
                    }
                    else if (planningObjectData.type === "image") {
                        const imageLayer = new StaticImageLayer({
                            url: `${this.get("url")}${planningObjectData.url}`,
                            extent: planningObjectData.imageMeta.extent
                        });

                        imageLayer.initialize();
                        imageLayer.prepareLayerObject();
                        this.staticImageLayers.push(imageLayer);
                        Radio.trigger("Map", "addLayerOnTop", imageLayer.get("layer"));
                    }
                    else if (planningObjectData.type === "featureStore") {
                        promises.push(axios.get(`${this.get("url")}/planning/feature-store/get-layer?planningId=${this.get("id")}&planningObjectId=${planningObjectData._id}`)
                            .then((response) => {
                                const data = response.data;

                                if (data.staticRepresentation && data.staticRepresentation.threeDim) {
                                    const tileset = new TileSetLayer({
                                        url: `${this.get("url")}/${data.staticRepresentation.threeDim}`
                                    });

                                    tileset.initialize();
                                    tileset.prepareLayerObject();
                                    tileset.setVectorStyle(data.vcsMeta.style || {});
                                    this.planningTilesetInstances.push(tileset);
                                }
                            })
                            .catch((err) => {
                                console.error(err);
                            }));
                    }
                }
            });
            this.listenTo(Radio.channel("Map"), {
                "change": (map) => {
                    if (map === "3D") {
                        this.deactivate();
                    }
                }
            });

            this.get("viewpoints").forEach((vp)=>{
                if (vp.default === true) {
                    this.defaultViewpoint = vp;
                }
            });

            this.get("flights").forEach((flightOption)=>{
                const flightInstance = parseFlightOptions(flightOption);

                if (flightInstance.isValid()) {
                    this.flightInstances.push(flightInstance);
                }
            });
            this.readyPromise = Promise.all(promises);
        }
        return this.readyPromise;
    },

    /**
     * activates the planning project and jumps to the default Viewpoint
     * @returns {Promise} promise which returns when the planning has been loaded and activated
     * @fires Core#RadioRequestMapIsMap3d
     * @fires Core#RadioTriggerMapSetCameraParameter
     */
    activate () {
        if (!Radio.request("Map", "isMap3d")) {
            store.dispatch("Maps/activateMap3D");
        }
        return this.initializePlanning().then(() => {
            if (this.defaultViewpoint) {
                Radio.trigger("Map", "setCameraParameter", this.defaultViewpoint);
            }
            this.entitiesLayer.setVisible(true);
            this.entitiesLayer.set("isSelected", true, {silent: true});
            this.entitiesLayer.toggleLayerOnMap();
            this.setHiddenObjects();
            this.planningTilesetInstances.forEach((layer)=> {
                layer.setVisible(true);
                layer.set("isSelected", true, {silent: true});
                layer.toggleLayerOnMap();
            });
            this.staticImageLayers.forEach((layer)=> {
                layer.setVisible(true);
            });
        });
    },
    /**
     * deactivates the planning project
     * @returns {Promise} promise which returns when the planning has been loaded and deactivated
     */
    deactivate () {
        return this.initializePlanning().then(() => {
            this.entitiesLayer.setVisible(false);
            this.entitiesLayer.set("isSelected", false, {silent: true});
            this.clearHiddenObjects();
            this.planningTilesetInstances.forEach((layer)=> {
                layer.set("isSelected", false, {silent: true});
                layer.setVisible(false);
            });
            this.staticImageLayers.forEach((layer)=> {
                layer.setVisible(false);
            });
        });
    },
    /**
     * goto the specific viewpoint
     * @param {string} viewpointId viewpointId
     * @returns {void} -
     * @fires Core#RadioTriggerMapSetCameraParameter
     */
    gotoViewpoint (viewpointId) {
        if (this.get("viewpoints")[viewpointId]) {
            Radio.trigger("Map", "setCameraParameter", this.get("viewpoints")[viewpointId]);
        }
    },

    /**
     * sets the ids of the hiddenObjects on the existing compatible layers
     * @fires ModelList#RadioRequestModelListGetModelsByAttributes
     * @returns {void} -
     */
    setHiddenObjects () {
        const layers = Radio.request("ModelList", "getModelsByAttributes", {type: "layer", typ: "TileSet3D"});

        layers.forEach((layer) =>{
            layer.hideObjects(this.get("hiddenObjects"));
        });
    },

    /**
     * clears the ids of the hiddenObjects on the existing compatible layers
     * @fires ModelList#RadioRequestModelListGetModelsByAttributes
     * @returns {void} -
     */
    clearHiddenObjects () {
        const layers = Radio.request("ModelList", "getModelsByAttributes", {type: "layer", typ: "TileSet3D"});

        layers.forEach((layer) =>{
            layer.showObjects(this.get("hiddenObjects"));
        });
    },

    /**
     * returns the viewpoint Objects of this planning
     * @returns {Array<Object>} list of viewpoint objects
     */
    getViewpoints () {
        return this.get("viewpoints");
    },

    /**
     * returns the flightInstances of this planning
     * @returns {Array<FlightInstance>} list of flightInstances
     */
    getFlights () {
        return this.flightInstances;
    }
});


export default Planning;
