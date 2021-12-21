import {Select, Modify, Draw} from "ol/interaction.js";
import WfstTemplate from "text-loader!./template.html";
import Collection from "ol/Collection.js";
import store from "../../../src/app-store/index";
import "bootstrap-datepicker";
import "bootstrap-datepicker/dist/locales/bootstrap-datepicker.de.min";

/**
 * @member Template
 * @description Template used to create the wfst tool
 * @memberof Tools.Wfst
 */
const WfstView = Backbone.View.extend(/** @lends WfstView.prototype */{
    events: {
        "click .record-button": "handleActiveButton",
        "change #wfstSelectLayer": "setCurrentLayer",
        "keyup .form-control-sm": "validate",
        "change .form-control-sm": "validate",
        "click .form-check-input": "validate",
        "click .info-icon": "toggleInfoText",
        "keydown .info-icon": "toggleInfoText"
    },

    /**
     * @class WfstView
     * @extends Backbone.View
     * @memberof Tools.Wfst
     * @constructs
     * @listens Tools.Wfst#ChangeIsActive
     * @listens Tools.Wfst#ChangeActiveButton
     * @listens Tools.Wfst#ChangeCurrentLayerId
     * @listens Tools.Wfst#ChangeShowAttrTable
     * @listens Tools.Wfst#ChangeActiveLayers
     * @listens Tools.Wfst#ChangeButtonTitleConfig
     * @listens Tools.Wfst#ChangeButtonConfig
     * @listens Tools.Wfst#ChangeSuccessfullTransaction
     * @listens Tools.Wfst#ChangeInteraction
     * @listens Alerting#RadioTriggerAlertConfirmed
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires Core#RadioTriggerMapAddInteraction
     * @fires Core#RadioTriggerMapRemoveInteraction
     * @fires Core#RadioRequestMapCreateLayerIfNotExists
     * @fires Core.ModelList#RadioRequestModelListGetModelsByAttributes
     * @fires Core#RadioTriggerMapRegisterListener
     */
    initialize: function () {
        const ids = this.model.get("layerIds"),
            incorrectIds = this.model.getIncorrectConfiguredLayerIds(ids);

        this.model.setIncorrectConfigLayers(incorrectIds);

        this.listenTo(this.model, {
            "change:isActive": function () {
                if (this.model.get("isActive") === true) {
                    this.model.updateAvailableLayers();
                }
                this.render();
            },
            "change:activeButton": this.render,
            "change:currentLayerId": this.render,
            "change:showAttrTable": this.render,
            "change:activeLayers": this.changeActiveLayers,
            "change:buttonTitleConfig": this.render,
            "change:buttonConfig": this.render,
            "change:successfullTransaction": this.handleSuccessfullTransaction,
            "change:interaction": function () {
                Radio.trigger("Map", "addInteraction", this.model.get("interaction"));
            }
        });
    },
    template: _.template(WfstTemplate),

    /**
     * Renders the tool wfst
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires Core#RadioTriggerMapRemoveInteraction
     * @return {Backbone.View} - WfstView
     */
    render: function () {
        const isActive = this.model.get("isActive"),
            initialAlertCases = this.model.get("initialAlertCases"),
            ids = this.model.get("layerIds"),
            missingLayers = this.model.checkForMissingLayers(ids),
            activeLayers = this.model.get("activeLayers"),
            activeButton = this.model.get("activeButton");
        let alertCases,
            message,
            incorrectConfigLayers = this.model.get("incorrectConfigLayers");

        // checks if configured layers for the wfst module are not in the modelList yet (e.g. saved services)
        if (missingLayers.length > 0) {
            incorrectConfigLayers = this.model.getIncorrectConfiguredLayerIds(ids);
            this.model.setIncorrectConfigLayers(incorrectConfigLayers);
        }

        this.model.checkActiveLayers(activeLayers, incorrectConfigLayers);
        if (isActive) {
            if (activeButton === "wfst-module-recordButton-save" || activeButton === "wfst-module-recordButton-discard" || activeButton === "wfst-module-recordButton-cancel") {
                this.unregisterCursorGlyph();
            }
            // If there are any errors preventing the use of the tool
            // then do not open the tool and display a corresponding alert message
            if (!initialAlertCases.length) {
                this.setElement($(".win-body")[0]);
                this.$el.html(this.template(this.model.toJSON()));
            }
            else {
                initialAlertCases.forEach(function (alert) {
                    message = this.model.getAlertMessage(alert);
                    store.dispatch("Alerting/addSingleAlert", {
                        category: "Fehler",
                        displayClass: "error",
                        content: message,
                        mustBeConfirmed: true
                    });
                }, this);
            }
            // If there are any errors that prevent the tool from working properly
            // then open the tool but disply a corresponding alert message
            alertCases = this.model.get("alertCases");
            if (alertCases.length) {
                alertCases.forEach(function (alert) {
                    message = this.model.getAlertMessage(alert);
                    store.dispatch("Alerting/addSingleAlert", {
                        category: "Warnung",
                        displayClass: "warning",
                        content: message,
                        mustBeConfirmed: false
                    });
                }, this);
            }
            this.delegateEvents();
        }
        else {
            this.reloadLayer();
            if (this.model.get("interaction") !== undefined) {
                Radio.trigger("Map", "removeInteraction", this.model.get("interaction"));
                this.model.get("interaction").removeEventListener("select");
            }
            if (this.model.get("editInteraction") !== undefined) {
                Radio.trigger("Map", "removeInteraction", this.model.get("editInteraction"));
            }
            this.model.setShowAttrTable(false);
            this.model.setShowCancel(false);
            this.undelegateEvents();
            this.unregisterCursorGlyph();
            if (this.model.get("toggleLayer")) {
                this.hideFeatures(false);
            }
        }
        this.$el.find("#wfstSelectLayer").trigger("focus");
        return this;
    },

    /**
     * Handles what happens if the current active layer in the module has changed
     * @param {Object} event - the event when the selected layer changes
     * @returns {void}
     */
    setCurrentLayer: function (event) {
        this.model.updateActiveLayer(event.target.value);
        this.render();
    },

    /**
     * Handles the actions for activating a button
     * @param {Object} event - the event when a button is activated
     * @returns {void}
     */
    handleActiveButton: function (event) {
        const activeButtonId = $(event.currentTarget).attr("id"),
            activeButton = this.getActiveButton(activeButtonId);

        this.showAttrTable(activeButton);
        this.model.setActiveButton(activeButtonId);
        this.inactiveButtons(activeButtonId);
        this.handleInteractions(activeButton);

        if (activeButton === "point" || activeButton === "line" || activeButton === "area") {
            $("#" + activeButtonId)[0].classList.add("record-active");
            if ($("#cursorGlyph") !== null) {
                this.registerListener(event.currentTarget);
            }
        }
    },

    /**
     * Determines the name of the butten that was activated
     * @param {String} buttonId - the id of the currently active button
     * @return {String} - Name of the active button
     */
    getActiveButton: function (buttonId) {
        const buttonPrefix = "wfst-module-recordButton-";
        let activeButton;

        if (typeof buttonId === "string" && buttonId.indexOf(buttonPrefix) === 0) {
            activeButton = buttonId.substring(buttonPrefix.length);
        }
        else {
            activeButton = null;
        }
        return activeButton;
    },

    /**
     * Handles what happens if a wfst layer is deselected in the layer tree
     * @returns {void}
     */
    changeActiveLayers: function () {
        const activeButton = this.model.get("activeButton"),
            activeLayers = this.model.get("activeLayers");
        let select,
            key,
            option,
            selectParent,
            newSelect;

        if (this.model.get("isActive")) {
            // case 1: active layer is deselcetd
            if (this.model.get("isDeselectedLayer")) {
                this.model.setActiveButton("");
                this.discardChanges();
                this.model.setIsDeselectedLayer(false);
                this.render();

            }
            // case 2: a different layer than the currently active layer is deselected in the layer tree
            else if (activeButton !== "") {
                // remove select
                select = document.getElementById("wfstSelectLayer");
                selectParent = select.parentNode;
                selectParent.removeChild(select);
                // create new select
                newSelect = document.createElement("select");
                newSelect.classList.add("form-control", "form-control-sm");
                newSelect.setAttribute("id", "wfstSelectLayer");

                // add options to select
                for (key in activeLayers) {
                    option = document.createElement("option");
                    option.text = activeLayers[key];
                    option.value = key;
                    if (this.model.get("currentLayerId") === key) {
                        option.selected = true;
                    }
                    newSelect.add(option);
                }

                selectParent.appendChild(newSelect);
                if (this.model.get("showAttrTable")) {
                    this.toggleObj(newSelect, true);
                }
            }
            else {
                this.render();
            }
        }
    },

    /**
     * Handles the expanding of the attribute table
     * @param {String} activeButton - name of the active button
     * @fires Alerting#RadioTriggerAlertAlert
     * @returns {void}
     */
    showAttrTable: function (activeButton) {
        const wfstFields = this.model.get("wfstFields");
        let message;

        if (activeButton === "point" || activeButton === "line" || activeButton === "area") {
            if (Array.isArray(wfstFields) && wfstFields.length) {
                this.model.setShowAttrTable(true);
            }
            // if the wfstFields are incorrect trigger a warning
            else {
                message = this.model.getAlertMessage("wfstFields");
                store.dispatch("Alerting/addSingleAlert", {
                    category: "Warnung",
                    displayClass: "warning",
                    content: message,
                    mustBeConfirmed: false
                });
                console.error("Please check if the DescribeFeatureType Request was successful.");
            }
        }
        // show cancel button for edit and delete mode
        else if (activeButton === "edit" || activeButton === "delete") {
            this.model.setShowCancel(true);
            this.render();
        }
    },

    /**
     * Disables all buttons that can not be selected while another button is active or enables the buttons
     * @param {String} activeButtonId - the id of the selected button
     * @param {Boolean} deactivateButton - Button to be deactivatet
     * @returns {void}
     */
    inactiveButtons: function (activeButtonId, deactivateButton) {
        const objects = {
                buttonPoint: {
                    element: $("#wfst-module-recordButton-point")[0],
                    buttonPointDisable: false
                },
                buttonLine: {
                    element: $("#wfst-module-recordButton-line")[0],
                    buttonLineDisable: false
                },
                buttonArea: {
                    element: $("#wfst-module-recordButton-area")[0],
                    buttonAreaDisable: false
                },
                buttonEdit: {
                    element: $("#wfst-module-recordButton-edit")[0],
                    buttonEditDisable: false
                },
                buttonDel: {
                    element: $("#wfst-module-recordButton-delete")[0],
                    buttonDeleteDisable: false
                },
                layerSelect: {
                    element: $("#wfstSelectLayer")[0],
                    layerSelectDisable: false
                }
            },
            activeButton = activeButtonId,
            buttonSave = $("#wfst-module-recordButton-save")[0],
            buttonDiscard = $("#wfst-module-recordButton-discard")[0],
            deactivateAll = "deactivate-all";

        if (typeof objects.buttonPoint.element === "object" && objects.buttonPoint.element !== null && activeButton === objects.buttonPoint.element.id) {
            Object.keys(objects).forEach(key => this.toggleObj(objects[key].element, objects[key].buttonPointDisable === undefined ? true : objects[key].buttonPointDisable));
        }
        if (typeof objects.buttonLine.element === "object" && objects.buttonLine.element !== null && activeButton === objects.buttonLine.element.id) {
            Object.keys(objects).forEach(key => this.toggleObj(objects[key].element, objects[key].buttonLineDisable === undefined ? true : objects[key].buttonLineDisable));
        }
        if (typeof objects.buttonArea.element === "object" && objects.buttonArea.element !== null && activeButton === objects.buttonArea.element.id) {
            Object.keys(objects).forEach(key => this.toggleObj(objects[key].element, objects[key].buttonAreaDisable === undefined ? true : objects[key].buttonAreaDisable));
        }
        if (typeof objects.buttonEdit.element === "object" && objects.buttonEdit.element !== null && activeButton === objects.buttonEdit.element.id) {
            Object.keys(objects).forEach(key => this.toggleObj(objects[key].element, objects[key].buttonEditDisable === undefined ? true : objects[key].buttonEditDisable));
        }
        if (typeof objects.buttonDel.element === "object" && objects.buttonDel.element !== null && activeButton === objects.buttonDel.element.id) {
            Object.keys(objects).forEach(key => this.toggleObj(objects[key].element, objects[key].buttonDeleteDisable === undefined ? true : objects[key].buttonDeleteDisable));
        }
        if (typeof objects.layerSelect.element === "object" && objects.layerSelect.element !== null && activeButton === objects.layerSelect.element.id) {
            Object.keys(objects).forEach(key => this.toggleObj(objects[key].element, objects[key].layerSelectDisable === undefined ? true : objects[key].layerSelectDisable));
        }
        if (typeof buttonSave === "object" && buttonSave !== null && typeof buttonDiscard === "object" && buttonDiscard !== null) {
            if (activeButton === buttonSave.id || activeButton === buttonDiscard.id) {
                Object.keys(objects).forEach(key => this.toggleObj(objects[key].element, false));
            }
        }
        if (typeof deactivateButton === "string" && deactivateButton === objects.buttonDel.element.id) {
            Object.keys(objects).forEach(key => this.toggleObj(objects[key].element, false));
            $("#" + deactivateButton)[0].classList.remove("record-active");
            this.unregisterCursorGlyph();
        }
        if (activeButton === deactivateAll) {
            Object.keys(objects).forEach(key => this.toggleObj(objects[key].element, true));
        }
    },

    /**
     * Toggles the enabled state of a button
     * @param {Object} button - the button, which state is to changed
     * @param {Boolean} add - flag if the button should be enabled or disabled
     * @returns {void}
     */
    toggleObj: function (button, add) {
        if (typeof button === "object" && button !== null) {
            $("#" + button.id).prop("disabled", add);
        }
    },

    /**
     * Handles what happens after successfully conducting the transaction
     * @returns {void}
     */
    handleSuccessfullTransaction: function () {
        if (this.model.get("successfullTransaction") === "success") {
            if (this.model.get("toggleLayer")) {
                this.hideFeatures(false);
            }
            this.discardChanges();
            this.reloadLayer();
        }
        else if (this.model.get("successfullTransaction") === "noSuccess") {
            this.inactiveButtons("deactivate-all");
        }
        this.model.setSuccessfullTransaction(false);
        if (this.model.get("activeButton") === "wfst-module-recordButton-delete") {
            this.inactiveButtons(null, "wfst-module-recordButton-delete");
        }
    },

    /**
     * Handles the corresponding interaction for each button
     * @param {String} activeButton - name of the active button
     * @returns {void}
     */
    handleInteractions: function (activeButton) {
        switch (activeButton) {
            case "point":
                this.setDrawInteraction("Point");
                break;
            case "line":
                this.setDrawInteraction("LineString");
                break;
            case "area":
                this.setDrawInteraction("Polygon");
                break;
            case "edit":
                this.setEditInteraction();
                break;
            case "delete":
                this.setDeleteInteraction();
                break;
            case "save":
                this.model.prepareSaving();
                break;
            case "discard":
                this.discardChanges();
                break;
            case "cancel":
                this.cancel();
                break;
            default:
                break;
        }
    },

    /**
     * Handles the actions on the map to add a new geometry
     * @param {String} geometryType - Point, Line or Polygon
     * @fires Core#RadioRequestMapCreateLayerIfNotExists
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires Core#RadioTriggerMapAddInteraction
     * @fires Core#RadioTriggerMapRemoveInteraction
     * @returns {void}
     */
    setDrawInteraction: function (geometryType) {
        const that = this,
            vectorLayer = Radio.request("Map", "createLayerIfNotExists", "wfst_Layer"),
            geometry = this.model.get("geometryName");
        let message,
            properties = this.model.get("featureProperties"),
            draw = "";

        if (this.model.get("toggleLayer")) {
            this.hideFeatures(true);
        }
        this.model.setVectorLayer(vectorLayer);
        this.model.setInteractions(new Draw({
            source: vectorLayer.getSource(),
            type: geometryType,
            style: this.model.get("styles"),
            geometryName: geometry
        }));

        this.model.setCurrentFeature(null);
        draw = this.model.get("interaction");
        this.model.handleMissingFeatureProperties(draw, geometry, properties, "draw");
        properties = draw.getProperties();
        this.model.setFeatureProperties(properties);
        this.model.setCurrentFeature(draw);
        // happens when drawing a geometry is finished
        this.model.get("interaction").on("drawend", function (event) {
            that.model.get("source").clear();
            that.model.handleMissingFeatureProperties(event.feature, geometry, properties, "drawProperties");
            that.model.setFeatureProperties(event.feature.getProperties());
            that.model.setCurrentFeature(event.feature);
            if (that.model.getCurrentLayer().get("isOutOfRange")) {
                message = that.model.getAlertMessage("isOutOfRange");
                store.dispatch("Alerting/addSingleAlert", {
                    category: "Info",
                    displayClass: "info",
                    content: message,
                    mustBeConfirmed: false
                });
            }
            Radio.trigger("Map", "removeInteraction", that.model.get("interaction"));
            that.model.setInteractions(new Modify({
                features: new Collection([event.feature])
            }));
            Radio.trigger("Map", "addInteraction", that.model.get("interaction"));
        }, this);
    },

    /**
     * Sets the interaction for editing an exisiting geometry
     * @fires Core.ModelList#RadioRequestModelListGetModelsByAttributes
     * @fires Core#RadioTriggerMapAddInteraction
     * @fires Core#RadioTriggerMapRemoveInteraction
     * @fires Alerting#RadioTriggerAlertAlert
     * @returns {void}
     */
    setEditInteraction: function () {
        const that = this,
            editButton = $("#wfst-module-recordButton-edit")[0],
            wfsLayers = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, typ: "WFS"}),
            geometry = this.model.get("geometryName"),
            properties = this.model.get("featureProperties"),
            wfstFields = this.model.get("wfstFields");
        let currentLayerId,
            featureLayerId,
            message,
            feature;

        if (!editButton.classList.contains("record-active")) {
            editButton.classList.add("record-active");
            this.registerListener(editButton);

            Radio.trigger("Map", "addInteraction", this.model.get("editInteraction"));
            // happens when a geometry is selected for editing
            this.model.get("editInteraction").getFeatures().on("add", function (event) {
                currentLayerId = that.model.get("currentLayerId");
                featureLayerId = that.model.inheritModelListAttributes(event.element.getId(), wfsLayers);

                // checks whether the selected feature belongs to the current layer. If not, create a warning message
                if (featureLayerId !== undefined && currentLayerId !== featureLayerId) {
                    that.model.setShowAttrTable(false);
                    message = that.model.getAlertMessage("editNotActiveLayer");
                    store.dispatch("Alerting/addSingleAlert", {
                        category: "Warnung",
                        displayClass: "warning",
                        content: message,
                        mustBeConfirmed: false
                    });
                }
                // checks whether the selected feature belongs to the current layer
                else if (currentLayerId === featureLayerId) {
                    that.model.setShowAttrTable(false);
                    that.model.setInteractions(new Modify({
                        features: event.target
                    }));
                    feature = that.model.handleMissingFeatureProperties(event.element, geometry, properties);
                    feature = that.model.handleDecimalSeperator(event.element.getProperties(), "display", wfstFields);
                    that.model.setFeatureProperties(feature);
                    that.model.setShowAttrTable(true);
                }
                else if (featureLayerId !== undefined) {
                    delete event.element;
                }
                that.model.setCurrentFeature(event.element);
                $("#wfst-module-recordButton-edit")[0].classList.add("record-active");
                that.inactiveButtons("wfst-module-recordButton-edit");
            }, this);
        }
    },

    /**
     * Handles the actions on the map that must be carried out to delete a geometry
     * @fires Core.ModelList#RadioRequestModelListGetModelsByAttributes
     * @fires Core#RadioTriggerMapAddInteraction
     * @fires Alerting#RadioTriggerAlertAlert
     * @returns {void}
     */
    setDeleteInteraction: function () {
        const deleteButton = $("#wfst-module-recordButton-delete")[0],
            that = this,
            wfsLayers = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, typ: "WFS"});
        let currentLayerId,
            featureLayerId,
            message,
            confirmActionSettings;

        if (!deleteButton.classList.contains("record-active")) {
            deleteButton.classList.add("record-active");
            this.registerListener(deleteButton);

            this.model.setInteractions(new Select());
            // happens when a geometry is selected for deleting
            this.model.get("interaction").on("select", function (event) {
                currentLayerId = that.model.get("currentLayerId");
                featureLayerId = that.model.inheritModelListAttributes(event.selected[0].getId(), wfsLayers);

                confirmActionSettings = {
                    actionConfirmedCallback: that.confirmCallback.bind(that),
                    actionDeniedCallback: that.denyCallback.bind(that),
                    confirmCaption: "Löschen",
                    textContent: "Sind Sie sich sicher, dass Sie diese Geometrie löschen möchten?",
                    headline: "Achtung"
                };
                // checks whether the selected feature belongs to the current layer
                if (currentLayerId === featureLayerId) {
                    if (event.selected.length) {
                        store.dispatch("ConfirmAction/addSingleAction", confirmActionSettings);
                        that.model.setCurrentFeature(event.selected[0]);
                    }
                }
                // if not, create a warning message
                else {
                    message = that.model.getAlertMessage("editNotActiveLayer");
                    store.dispatch("Alerting/addSingleAlert", {
                        category: "Warnung",
                        displayClass: "warning",
                        content: message,
                        mustBeConfirmed: false
                    });
                }
            }, this);
            this.putGlyphToCursor("bi-trash");
        }
    },

    /**
     * Handles the actions on the map that must be carried out to discard the current action and any changes it has created
     * @fires Core#RadioTriggerMapRemoveInteraction
     * @fires Alerting#RadioTriggerAlertAlert
     * @returns {void}
     */
    discardChanges: function () {
        let message;

        this.model.setShowCancel(false);
        if (this.model.get("currentFeature") !== null) {
            if (this.model.get("toggleLayer")) {
                this.hideFeatures(false);
            }
            this.model.get("editInteraction").getFeatures().remove(this.model.get("currentFeature"));
            Radio.trigger("Map", "removeInteraction", this.model.get("editInteraction"));
            this.model.setCurrentFeature(null);
            this.model.setFeatureProperties({});
            this.reloadLayer();
            this.model.setShowAttrTable(false);
            // triggers a success message if discarding was successfull
            if (this.model.get("activeButton") === "wfst-module-recordButton-discard") {
                message = this.model.getAlertMessage("SuccessfullDiscard");
                store.dispatch("Alerting/addSingleAlert", {
                    category: "Info",
                    displayClass: "info",
                    content: message,
                    mustBeConfirmed: false
                });
            }
        }
        // triggers a error message if discarding was not successfull
        else if (this.model.get("activeButton") === "wfst-module-recordButton-discard") {
            message = this.model.getAlertMessage("failedDiscard");
            store.dispatch("Alerting/addSingleAlert", {
                category: "Fehler",
                displayClass: "error",
                content: message,
                mustBeConfirmed: true
            });
            console.error("The discard could not be applied to a feature.");
        }
        Radio.trigger("Map", "removeInteraction", this.model.get("interaction"));
        Radio.trigger("Map", "removeInteraction", this.model.get("editInteraction"));
        this.model.set("editInteraction", new Select());
        this.unregisterCursorGlyph();
        this.render();
    },

    /**
     * Handles the actions of the cancel button
     * @fires Core#RadioTriggerMapRemoveInteraction
     * @returns {void}
     */
    cancel: function () {
        if (this.model.get("activeButton") === "wfst-module-recordButton-cancel") {
            this.model.setShowCancel(false);
            Radio.trigger("Map", "removeInteraction", this.model.get("interaction"));
            Radio.trigger("Map", "removeInteraction", this.model.get("editInteraction"));
            this.model.set("editInteraction", new Select());
            this.unregisterCursorGlyph();
            this.render();
        }
    },

    /**
     * Triggers the delete function
     * @returns {void}
     */
    confirmCallback: function () {
        const feature = this.model.get("interaction").getFeatures().item(0);

        this.model.delete(feature);
    },

    /**
     * Handles what happens when deleting a feature was canceld
     * @returns {void}
     */
    denyCallback: function () {
        this.model.get("interaction").getFeatures().remove(this.model.get("currentFeature"));
    },

    /**
     * Handles the toggeling of a layer, while adding a new feature
     * @param {Boolean} isHidden - flag whether the layer should be hidden or shown again
     * @returns {void}
     */
    hideFeatures: function (isHidden) {
        const currentLayer = this.model.getCurrentLayer();

        if (isHidden) {
            currentLayer.setIsVisibleInMap(false);
        }
        else {
            currentLayer.setIsVisibleInMap(true);
        }
    },

    /**
     * Reloads the current active layer
     * @fires Core.ModelList#RadioRequestModelListGetModelsByAttributes
     * @returns {void}
     */
    reloadLayer: function () {
        const wfsLayer = Radio.request("ModelList", "getModelsByAttributes", {id: this.model.get("currentLayerId")}),
            vectorLayer = this.model.get("vectorLayer");

        if (wfsLayer.length === 1) {
            wfsLayer[0].updateSource();
            if (typeof vectorLayer === "object" && vectorLayer !== null && vectorLayer.getSource() !== null) {
                vectorLayer.getSource().clear();
            }
        }
    },

    /**
     * Adds a listener for the mouse pointer icon to the map
     * @param {String} button - Name of the clicked button
     * @fires Core#RadioTriggerMapRegisterListener
     * @returns {void}
     */
    registerListener: function (button) {
        const icon = button.getAttribute("icon");

        $("#map").after("<span id='cursorGlyph' class='bootstrap-icon'><i class='" + icon + "'></i></span>");
        this.listener = Radio.request("Map", "registerListener", "pointermove", this.renderIcon.bind(this));
    },

    /**
     * Renders the icon at the mouse pointer
     * @param {Object} event - MapBrowserPointerEvent
     * @returns {void}
     */
    renderIcon: function (event) {
        const element = $("#cursorGlyph")[0];

        $(element).css("left", event.originalEvent.offsetX + 5);
        $(element).css("top", event.originalEvent.offsetY + 50 - 15); // absolute offset plus height of menubar (50)
    },

    /**
     * Unregisters the listeners for the mouse pointer icon from the map
     * @returns {void}
     */
    unregisterCursorGlyph: function () {
        $("#cursorGlyph").remove();
        $("#map").removeClass("no-cursor");
        $("#map").addClass("cursor-default");
        this.listener = undefined;
    },

    /**
     * Creates an HTML element,
     * puts the glyph icon there and sticks it to the cursor
     * @param {string} icon - of the mouse
     * @returns {void}
     */
    putGlyphToCursor: function (icon) {
        if (icon.indexOf("trash") !== -1) {
            $("#map").removeClass("no-cursor");
            $("#map").addClass("cursor-default");
        }

        $("#cursorGlyph").removeClass();
        $("#cursorGlyph").addClass(icon);
    },

    /**
     * Validator for checking the inputs for data types in the input fields
     * @param {Object} event - Event in input fields
     * @fires Alerting#RadioTriggerAlertAlert
     * @returns {void}
     */
    validate: function (event) {
        const wfstFields = this.model.get("wfstFields"),
            id = event.currentTarget.id,
            value = event.currentTarget.value,
            type = this.model.getFieldType(id, wfstFields);
        let message,
            featureProperties = "",
            featureAttributes;

        this.handleMandatoryStyle(value, id);
        // if the decimal seperator of the input is not correct
        if (type === "decimal") {
            if (!(/^(\d+(,\d*|)|)$/).test(value)) {
                $("#" + id)[0].setAttribute("style", "border: 1px solid red");
                message = this.model.getAlertMessage("decimalError");
                if (Object.entries(document.getElementById("warning-text " + id).innerHTML).length <= 0) {
                    document.getElementById("warning-text " + id).innerHTML = message;
                }
            }
            else {
                $("#" + id)[0].setAttribute("style", "box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075)");
                $("#" + id)[0].setAttribute("style", "transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s");
                document.getElementById("warning-text " + id).innerHTML = "";
            }
        }
        // if the input is not a number
        if (type === "integer") {
            if ((/\D/g).test(value)) {
                $("#" + id)[0].setAttribute("style", "border: 1px solid red");
                message = this.model.getAlertMessage("integerError");
                if (Object.entries(document.getElementById("warning-text " + id).innerHTML).length <= 0) {
                    document.getElementById("warning-text " + id).innerHTML = message;
                }
            }
            else {
                $("#" + id)[0].setAttribute("style", "box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075)");
                $("#" + id)[0].setAttribute("style", "transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s");
                document.getElementById("warning-text " + id).innerHTML = "";
            }
        }
        // if the input is not a number
        if (type === "int") {
            if ((/\D/g).test(value)) {
                $("#" + id)[0].setAttribute("style", "border: 1px solid red");
                message = this.model.getAlertMessage("integerError");
                if (Object.entries(document.getElementById("warning-text " + id).innerHTML).length <= 0) {
                    document.getElementById("warning-text " + id).innerHTML = message;
                }
            }
            else {
                $("#" + id)[0].setAttribute("style", "box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075)");
                $("#" + id)[0].setAttribute("style", "transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s");
                document.getElementById("warning-text " + id).innerHTML = "";
            }
        }

        featureProperties = this.model.get("featureProperties");
        if (event.currentTarget.type === "checkbox") {
            featureAttributes = this.model.handleFeatureAttributes(featureProperties, id, event.currentTarget.checked);
            this.model.setFeatureProperties(featureAttributes);
        }
        else {
            featureAttributes = this.model.handleFeatureAttributes(featureProperties, id, value);
            this.model.setFeatureProperties(featureAttributes);
        }
    },


    /**
     * toggles the info text under the layer select
     * @param {Event} event - the dom event
     * @returns {void}
     */
    toggleInfoText: function (event) {
        if (event.type === "click" || event.which === 32 || event.which === 13) {
            const infoButton = this.model.get("showInfoText");

            if (!infoButton) {
                this.model.setShowInfoText(true);
                this.$el.find(".info-sign").css("opacity", "1");
                this.$el.find("#wfst-module-infoText").show();
            }
            else {
                this.model.setShowInfoText(false);
                this.$el.find(".info-sign").css("opacity", "0.8");
                this.$el.find("#wfst-module-infoText").hide();
            }
        }
    },

    /**
     * Handles the styling of mandatory fields while entering data
     * @param {String} value - input value
     * @param {String} id - id of the input field
     * @returns {void}
     */
    handleMandatoryStyle: function (value, id) {
        const wfstFields = this.model.get("wfstFields");

        wfstFields.forEach(function (field) {
            if (field.field === id) {
                if (field.mandatory === true && value.length > 0) {
                    $("#" + id)[0].classList.remove("mandatory");
                }
                else if (field.mandatory === true && value.length === 0) {
                    $("#" + id)[0].classList.add("mandatory");
                }
            }
        });
    }
});

export default WfstView;
