import Map from "ol/Map.js";
import {unByKey as unlistenByKey} from "ol/Observable.js";
import {defaults as olDefaultInteractions} from "ol/interaction.js";
import {ViewDirection, viewDirectionNames} from "vcs-oblique/src/vcs/oblique/viewDirection";
import {transformFromImage} from "vcs-oblique/src/vcs/oblique/helpers";
import LoaderOverlay from "../../src/utils/loaderOverlay";
import store from "../../src/app-store";

/**
 * Creates an oblique map on activate and handles deactivation. Handles interactions, click-events and the activation of oblique layer.
 */
const ObliqueMap = Backbone.Model.extend({
    defaults: {
        active: false
    },
    initialize: function () {
        const channel = Radio.channel("ObliqueMap"),
            obliqueLayers = Radio.request("ModelList", "getModelsByAttributes", {typ: "Oblique"});

        this.pausedInteractions = [];

        channel.reply({
            "isActive": function () {
                return this.get("active");
            },
            "getOLMap": function () {
                return this.get("map");
            },
            "getCurrentImage": this.getCurrentImage,
            "getCurrentDirection": function () {
                return this.currentDirection;
            }
        }, this);

        channel.on({
            "activate": this.activate,
            "deactivate": this.deactivate,
            "registerLayer": this.registerLayer,
            "activateLayer": this.activateNewLayer,
            "changeDirection": this.changeDirection,
            "setCenter": this.setCenter
        }, this);
        /**
         * Contains all layers of layer-type "oblique", but only the first one is used and displayed.
         */
        this.layers = [];
        /**
         * The direction of vcs-oblique that handles rendering of images.
         * @type {vcs.oblique.Direction | null}
         */
        this.currentDirection = null;

        /**
         * Is a vcs.oblique.collection.js that contains projection, directions and image meta data.
         * The collection loads oblique image meta data from the layers url.
         * @type {vcs.oblique.Collection | null}
         */
        this.currentCollection = null;

        /**
         * Contains the currently visible layer of layer-type "oblique".
         */
        this.currentLayer = null;

        /**
         * What is this used for? Is always true.
         * @type {boolean}
         */
        this.switchOnEdge = true;

        /**
         * Contains reaction to add interactions. Is used on activate and deactivate.
         */
        this.listenerKeys = [];

        this.listenTo(Radio.channel("MapView"), {
            "changedCenter": function (coordinate, resolution) {
                if (this.get("active")) {
                    this.setCenter(coordinate, resolution);
                }
            }
        });
        obliqueLayers.forEach(layer => {
            this.registerLayer(layer);
        });
    },
    /**
     * Returns true, if the oblique map is active.
     * @returns {boolean} true, if active.
     */
    isActive: function () {
        return this.get("active");
    },
    /**
     * Returns the current image of the current direction.
     * @returns {vcs.oblique.Image} the current image
     */
    getCurrentImage: function () {
        return this.currentDirection && this.currentDirection.currentImage;
    },
    /**
     * Is called if an oblique-layer is activated on map. Calls this.activateLayer.
     * @param {Object} layer of type "oblique" to activate
     * @returns {Promise} that activates the layer
     */
    activateNewLayer: function (layer) {
        if (this.currentDirection && this.isActive()) {
            return this.getCenter().then(function (center) {
                const resolution = this.currentDirection.currentView.view.getResolution();

                return this.activateLayer(layer, center.coords, resolution);
            }.bind(this));
        }
        return Promise.reject(new Error("there is no currentDirection"));
    },

    /**
     * Triggers rotation of compass in modules\controls\orientation3d\view.js if viewDirection of new image is not equals to current viewDirection.
     * @param {vcs.oblique.Image} currentImage to get the viewDirection from
     * @returns {void}
     */
    triggerRotationOfCompass: function (currentImage) {
        Radio.trigger("ObliqueMap", "newImage", currentImage);
    },
    /**
     * Deactivates open tree on topic search if the obliqueMap is activated.
     * @fires Core#RadioTriggerObliqueMapIsActivated
     * @returns {void}
     */
    deactivateOpenTreeOnTopicSearch: function () {
        Radio.trigger("ObliqueMap", "isActivated", false);
    },
    /**
     * Activates open tree on topic search if the obliqueMap is deactivated.
     * @fires Core#RadioTriggerObliqueMapIsActivated
     * @returns {void}
     */
    activateOpenTreeOnTopicSearch: function () {
        Radio.trigger("ObliqueMap", "isActivated", true);
    },
    /**
     * Is called on activate this oblique map and triggers loading of image meta data.
     * Sets current direction to north, centers to given coordinates and loads dedicated image.
     * @param {Object} layer of type "oblique" to activate
     * @param {Array} coordinate to center on
     * @param {Number} resolution to set at map
     * @returns {Promise} that triggers loading of image meta data, setting the current image and centers the map
     */
    activateLayer: function (layer, coordinate, resolution) {
        if (this.currentLayer) {
            this.currentLayer.deactivateLayer();
            if (this.currentDirection) {
                this.currentDirection.deactivate();
            }
            this.currentCollection = null;
            this.currentDirection = null;
        }
        this.currentLayer = layer;
        // layer.getObliqueCollection() can be found in modules\core\modelList\layer\oblique.js
        // is a vcs-oblique\src\vcs\oblique\collection.js that contains projection, directions and image meta data
        // The collection loads oblique image meta data (json-file with image descriptions) from the layers url
        return layer.getObliqueCollection().then(function (collection) {
            let direction = collection.directions[ViewDirection.NORTH];

            this.currentCollection = collection;
            if (!direction) {
                const key = Object.keys(collection.directions)[0];

                direction = collection.directions[key];
            }
            if (direction) {
                this.currentDirection = direction;
                return direction.activate(this.get("map"), coordinate, resolution).then(function () {
                    this.triggerRotationOfCompass(direction.currentImage);
                    this.setCenter(coordinate, resolution);
                }.bind(this));
            }
            return Promise.reject(new Error("there is no direction"));
        }.bind(this));
    },
    /**
     * Is called from each ObliqueLayer, that is created. Layer is added to internal list of layers.
     * @param {Object} layer the layer of type "oblique"
     * @returns {void}
     */
    registerLayer: function (layer) {
        this.layers.push(layer);
    },
    /**
     * Deactivates the oblique map if it is active by setting the target-container to visibility hidden.
     * Shows the 2D-map with the current resolution and centers it. Handles and restores interactions.
     * Sets the tool gfi active.
     * @fires Core#RadioTriggerMapViewSetCenter
     * @fires Core#RadioTriggerMapBeforeChange
     * @fires Core#RadioTriggerMapViewSetResolution
     * @fires Core#RadioTriggerMapChange
     * @return {void}
     */
    deactivate: function () {
        const gfi = Radio.request("ModelList", "getModelByAttributes", {id: "gfi"});
        let map2D = "";

        gfi.setIsActive(true);
        map2D = Radio.request("Map", "getMap");

        if (this.isActive() && this.currentCollection && this.currentDirection?.currentImage) {
            Radio.trigger("Map", "beforeChange", "2D");
            store.commit("Map/setMapMode", "2D");
            this.deactivateOpenTreeOnTopicSearch();
            this.getCenter().then(function (center) {
                const resolutionFactor = this.currentLayer.get("resolution"),
                    resolution = this.currentDirection.currentView.view.getResolution() / resolutionFactor;

                this.container.style.visibility = "hidden";
                this.set("active", false);
                map2D.getViewport().querySelector(".ol-overlaycontainer").classList.remove("olcs-hideoverlay");
                map2D.getViewport().querySelector(".ol-overlaycontainer-stopevent").classList.remove("olcs-hideoverlay");
                this.restore2DMapInteractions(map2D);
                Radio.trigger("MapView", "setCenter", [center.coords[0], center.coords[1]]);
                Radio.trigger("MapView", "setResolution", resolution);
                Radio.trigger("Map", "change", "2D");
            }.bind(this));
        }
    },

    /**
     * Is called from modules\controls\orientation3d\view.js if clicked on a celestial direction.
     * Loads new image then.
     * @param {String} directionName name of the direction
     * @returns {void}
     */
    changeDirection: function (directionName) {
        const direction = viewDirectionNames[directionName];
        let newDirection = {};

        if (!direction || direction === this.currentDirection.direction) {
            return;
        }
        newDirection = this.currentCollection.directions[direction];

        if (newDirection) {
            this.getCenter().then(function (center) {
                const resolution = this.currentDirection.currentView.view.getResolution();

                this.currentDirection.deactivate();
                this.currentDirection = newDirection;
                newDirection.activate(this.get("map"), center.coords, resolution).then(function () {
                    this.triggerRotationOfCompass(newDirection.currentImage);
                }.bind(this));
            }.bind(this));
        }
    },
    /**
     * Sets the center of the oblique-map-view to the given coordinate and triggers loading of the image.
     * @param {ol.Coordinate} coordinate to center on
     * @param {Number} resolution - optional, if not given, the resolution of the oblique-map is used
     * @return {Promise} sets the view and triggers
     */
    setCenter: function (coordinate, resolution) {
        if (this.currentDirection) {
            const oldImageID = this.currentDirection.currentImage.id,
                resolutionFactor = this.currentLayer.get("resolution");
            let useResolution = resolution ? resolution * resolutionFactor : this.get("map").getView().getResolution();

            useResolution = this.get("map").getView().getConstrainedResolution(useResolution);

            return this.currentDirection.setView(coordinate, useResolution).then(function () {
                if (this.currentDirection.currentImage) {
                    if (this.currentDirection.currentImage.id !== oldImageID) {
                        this.triggerRotationOfCompass(this.currentDirection.currentImage);
                    }
                }
            }.bind(this));
        }
        return Promise.reject(new Error("there is no currentDirection"));
    },

    /**
     * Returns the center coordiantes of the current view.
     * @returns {Promise<{coords: ol.Coordinate, estimate: (boolean|undefined)}>} coordinates in current projection
     */
    getCenter: function () {
        let center;

        if (this.currentCollection && this.currentDirection && this.currentDirection.currentImage) {
            center = this.get("map").getView().getCenter();
            return transformFromImage(this.currentDirection.currentImage, center, {
                dataProjection: this.get("projection")
            });
        }
        return Promise.reject(new Error("there is no currentImage"));
    },

    /**
     * Sets the current active tool to false.
     * @returns {void}
     */
    setActiveToolToFalse: function () {
        const activeTool = Radio.request("ModelList", "getModelByAttributes", {type: "tool", isActive: true});

        if (activeTool !== undefined) {
            activeTool.set("isActive", false);
        }
    },

    /**
     * Creates a DIV-Element and inserts it before the overlaycontainer of the 2D-map.
     * @param {ol.Map} map2D  the 2D-map
     * @returns {Object} the created container
     */
    createAndInsertTargetContainer: function (map2D) {
        const fillArea = "position:absolute;top:0;left:0;width:100%;height:100%;",
            oc = map2D.getViewport().querySelector(".ol-overlaycontainer"),
            container = document.createElement("DIV"),
            containerAttribute = document.createAttribute("style");

        containerAttribute.value = fillArea + "visibility:hidden;";
        container.setAttributeNode(containerAttribute);
        if (oc && oc.parentNode) {
            oc.parentNode.insertBefore(container, oc);
        }
        return container;
    },

    /**
     * Adds all interactions of the 2D-map to list of pausedInteractions.
     * @param {ol.Map} map2D  the 2D-map
     * @returns {Collection} interactions of the 2D-map
     */
    getInteractionsToPause: function (map2D) {
        const interactions = map2D.getInteractions();

        interactions.forEach((el) => {
            this.pausedInteractions.push(el);
        });
        return interactions;
    },
    /**
     * Clears the interactions and adds new ones, if added to 2D-map.
     * @param {Collection} interactions of the 2D-map
     * @returns {void}
     */
    rememberAdded2DMapInteractions: function (interactions) {
        interactions.clear();
        this.listenerKeys.push(interactions.on("add", function (event) {
            this.pausedInteractions.push(event.element);
            interactions.clear();
        }.bind(this), this));
    },
    /**
     * Restores the paused interactions of the 2D-map and unlistens to oblique-map-interactions.
     * @param {ol.Map} map2D  the 2D-map
     * @returns {void}
     */
    restore2DMapInteractions: function (map2D) {
        unlistenByKey(this.listenerKeys);
        const interactions = map2D.getInteractions();

        this.pausedInteractions.forEach((interaction) => {
            interactions.push(interaction);
        });
        this.pausedInteractions.length = 0;
        this.listenerKeys.length = 0;
    },
    /**
     * Returns true, if this map was already activated.
     * @returns {boolean} true, if oblique-map was already activated before
     */
    obliqueMapWasAlreadyActive: function () {
        return this.currentLayer && this.currentCollection && this.currentDirection;
    },
    /**
     * Load first Layer which is active on startup or otherwise just take the first layer.
     * @returns {Object} the layer, if found
     */
    getFirstVisibleLayer: function () {
        let layer = null;

        for (let i = 0; i < this.layers.length; i++) {
            if (this.layers[i].get("isVisibleInMap")) {
                layer = this.layers[i];
                break;
            }
        }
        if (!layer && this.layers.length > 0) {
            layer = this.layers[0];
        }
        return layer;
    },

    /**
     * Creates and activates the oblique map or only activates if was already shown. Remembers interactions of 2D-map to restore.
     * Binds the postRenderHandler to load images on panning. Activates the oblique layer and centers oblique-map.
     * @fires Core#RadioTriggerMapChange
     * @fires Core#RadioTriggerMapBeforeChange
     * @return {void}
     */
    activate: function () {
        let map2D, interactions;

        if (!this.isActive()) {
            Radio.trigger("Map", "beforeChange", "Oblique");
            this.activateOpenTreeOnTopicSearch();
            const center = Radio.request("MapView", "getCenter"),
                resolution = Radio.request("MapView", "getOptions").resolution;

            this.setActiveToolToFalse();
            map2D = Radio.request("Map", "getMap");
            store.commit("Map/setMapMode", "Oblique");

            if (!this.container) {
                this.container = this.createAndInsertTargetContainer(map2D);

                this.set("map", new Map({
                    logo: null,
                    target: this.container,
                    controls: [],
                    interactions: olDefaultInteractions({altShiftDragRotate: false, pinchRotate: false})
                }));
                this.get("map").on("postrender", this.postRenderHandler.bind(this), this);
                this.get("map").on("click", this.reactToClickEvent.bind(this), this);
            }
            interactions = this.getInteractionsToPause(map2D);

            if (this.obliqueMapWasAlreadyActive()) {
                this.rememberAdded2DMapInteractions(interactions);
                map2D.getViewport().querySelector(".ol-overlaycontainer").classList.add("olcs-hideoverlay");
                map2D.getViewport().querySelector(".ol-overlaycontainer-stopevent").classList.add("olcs-hideoverlay");
                this.set("active", true);
                this.container.style.visibility = "visible";
                this.setCenter(center, resolution).then(function () {
                    Radio.trigger("Map", "change", "Oblique");
                });
            }
            else {
                LoaderOverlay.show(80000);
                const layer = this.getFirstVisibleLayer();

                if (layer) {
                    this.rememberAdded2DMapInteractions(interactions);
                    map2D.getViewport().querySelector(".ol-overlaycontainer").classList.add("olcs-hideoverlay");
                    map2D.getViewport().querySelector(".ol-overlaycontainer-stopevent").classList.add("olcs-hideoverlay");
                    this.set("active", true);
                    this.container.style.visibility = "visible";
                    this.activateLayer(layer, center, resolution).then(function () {
                        layer.set("isVisibleInMap", true);
                        layer.set("isSelected", true);
                        // here the switching off of all not-oblique layers is triggered
                        Radio.trigger("Map", "change", "Oblique");
                        LoaderOverlay.hide();
                    });
                }
                // no oblique layer, obliqueMap is not loaded.
            }

        }
    },
    /**
     * The postRenderHandler of vcs.oblique.direction.js. Loads new image, if currentImage does not match the coordinates.
     * @returns {void}
     */
    postRenderHandler: function () {
        if (this.currentDirection && this.switchOnEdge) {
            const coord = this.get("map").getView().getCenter(),
                currentImage = this.currentDirection.currentImage;

            if (currentImage.averageHeight === null) {
                return;
            }
            this.currentDirection.postRenderHandler(coord);
        }
    },
    /**
     * Provides transformed coordinates for tools, that use coordinates e.g. getCoord.
     * @param {Object} event the click-event
     * @returns {void}
     */
    reactToClickEvent: function (event) {
        if (this.currentDirection && this.currentDirection.currentImage) {
            transformFromImage(this.currentDirection.currentImage, event.coordinate, {
                dataProjection: this.get("projection")
            }).then(function (coords) {
                Radio.trigger("ObliqueMap", "clicked", coords.coords);
            });
        }
    }
});

export default ObliqueMap;
