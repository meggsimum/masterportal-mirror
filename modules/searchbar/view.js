import SearchbarTemplate from "text-loader!./template.html";
import TemplateTable from "text-loader!./templateTable.html";
import SearchbarRecommendedListTemplate from "text-loader!./templateRecommendedList.html";
import SearchbarHitListTemplate from "text-loader!./templateHitList.html";
import GAZModel from "./gaz/model";
import SpecialWFSModel from "./specialWFS/model";
import VisibleVectorModel from "./visibleVector/model";
import BKGModel from "./bkg/model";
import TreeModel from "./tree/model";
import OSMModel from "./osm/model";
import LocationFinderModel from "./locationFinder/model";
import GdiModel from "./gdi/model";
import ElasticSearchModel from "./elasticSearch/model";
import KomootModel from "./komoot/model";
import Searchbar from "./model";
import "./RadioBridge.js";
import store from "../../src/app-store/index";
import {getWKTGeom} from "../../src/utils/getWKTGeom";

/**
 * @member SearchbarTemplate
 * @description Template for searchbar
 * @memberof Searchbar
 */
/**
 * @member TemplateTable
 * @description Template for table
 * @memberof Searchbar
 */
/**
 * @member SearchbarRecommendedListTemplate
 * @description Template for recommendedList
 * @memberof Searchbar
 */
/**
 * @member SearchbarHitListTemplate
 * @description Template for finalHitList
 * @memberof Searchbar
 */
const SearchbarView = Backbone.View.extend(/** @lends SearchbarView.prototype */{
    events: {
        "paste input": "controlEvent",
        "keyup input": "controlEvent",
        "contextmenu input": "controlEvent",
        "focusin input": "toggleStyleForRemoveIcon",
        "focusout input": "toggleStyleForRemoveIcon",
        "click .form-control-feedback": "deleteSearchString",
        "click .btn-search": "searchAll",
        "click .list-group-item.hit": "hitSelected",
        "click .list-group-item.results": "renderHitList",
        "mouseenter .list-group-item.hit": "showMarker",
        "mouseleave .list-group-item.hit": "hideMarker",
        "click .list-group-item.type": "clickListGroupItem",
        "click .btn-search-question": "clickBtnQuestion",
        "keydown": "navigateList",
        "click": "clickHandler"
    },

    /**
     * @class SearchbarView
     * @extends Backbone.View
     * @memberof Searchbar
     * @constructs
     * @param {Object} config config
     * @listens Searchbar#renderRecommendedList
     * @listens Menu#RadioTriggerTableMenuHideMenuElementSearchbar
     * @listens Searchbar#RadioTriggerSearchbarDeleteSearchString
     * @listens Searchbar#RadioTriggerSearchbarSetFocus
     * @listens Menu#RadioTriggerMenuLoaderReady
     * @listens Core#RadioTriggerUtilIsViewMobileChanged
     * @listens Searchbar#RadioTriggerViewZoomHitSelected
     * @fires Title#RadioTriggerTitleSetSize
     * @fires Searchbar#RadioTriggerSearchbarSearchAll
     * @fires GFI#RadioTriggerGFISetIsVisible
     * @fires Searchbar#RadioTriggerSearchbarHit
     */
    initialize: function (config) {
        this.model = new Searchbar(config);

        if (config.renderToDOM) {
            this.setElement(config.renderToDOM);
            this.render();
        }

        this.className = "navbar-form col-xs-9";

        this.listenTo(this.model, {
            "renderRecommendedList": this.renderRecommendedList,
            "change:placeholder change:buttonSearchTitle change:showAllResultsText": this.initialRender
        });

        this.listenTo(Radio.channel("TableMenu"), {
            "hideMenuElementSearchbar": this.hideMenu
        });

        this.listenTo(Radio.channel("Searchbar"), {
            "deleteSearchString": this.deleteSearchString,
            "setFocus": this.setFocus
        });

        this.listenTo(Radio.channel("MenuLoader"), {
            "ready": this.menuLoaderReady
        });

        this.model.setQuickHelp(store.getters["QuickHelp/isSet"]);

        this.initialRender();

        this.listenTo(Radio.channel("Util"), {
            "isViewMobileChanged": this.viewMobileChanged
        });

        this.listenTo(Radio.channel("ViewZoom"), {
            "hitSelected": this.hitSelected
        });

        if (navigator.appVersion.indexOf("MSIE 9.") !== -1) {
            this.$("#searchInput").val(this.model.get("placeholder"));
        }
        this.$("#searchInput").blur();
        // Manage search algorithms for initial search.
        this.model.setInitialSearchTasks(config);

        // On-demand loading of the search algorithms.
        if (Object.prototype.hasOwnProperty.call(config, "gazetteer")) {
            new GAZModel(config.gazetteer);
        }
        if (Object.prototype.hasOwnProperty.call(config, "specialWFS")) {
            new SpecialWFSModel(config.specialWFS);
        }
        if (Object.prototype.hasOwnProperty.call(config, "visibleVector")) {
            new VisibleVectorModel(config.visibleVector);
        }
        else if (Object.prototype.hasOwnProperty.call(config, "visibleWFS")) {
            // Deprecated in new stable
            new VisibleVectorModel(config.visibleWFS);
        }
        if (Object.prototype.hasOwnProperty.call(config, "bkg")) {
            new BKGModel(config.bkg);
        }
        if (Object.prototype.hasOwnProperty.call(config, "tree")) {
            new TreeModel(config.tree);
        }
        if (Object.prototype.hasOwnProperty.call(config, "osm")) {
            new OSMModel(config.osm);
        }
        if (Object.prototype.hasOwnProperty.call(config, "locationFinder")) {
            new LocationFinderModel(config.locationFinder);
        }
        if (Object.prototype.hasOwnProperty.call(config, "gdi")) {
            new GdiModel(config.gdi);
        }
        if (Object.prototype.hasOwnProperty.call(config, "elasticSearch")) {
            new ElasticSearchModel(config.elasticSearch);
        }
        if (Object.prototype.hasOwnProperty.call(config, "komoot")) {
            new KomootModel(config.komoot);
        }

        this.model.setHitIsClick(false);

        // Hack for flexible search bar
        $(window).on("resize", this.onresizeCallback.bind(this));
    },
    id: "searchbar", // is ignored, with renderToDOM
    className: "navbar-form col-xs-9", // is ignored, with renderToDOM
    searchbarKeyNavSelector: "#searchInputUL",
    template: _.template(SearchbarTemplate),
    templateTable: _.template(TemplateTable),
    templateRecommendedList: _.template(SearchbarRecommendedListTemplate),
    templateHitList: _.template(SearchbarHitListTemplate),
    /**
     * todo
     * @returns {*} todo
     */
    render: function () {
        const attr = this.model.toJSON(),
            menuStyle = Radio.request("Util", "getUiStyle");

        if (menuStyle !== "TABLE") {
            this.$el.html(this.template(attr));
            if (window.innerWidth < 768) {
                $(".navbar-toggle").before(this.$el); // prior of toggleButton
            }
            else {
                $(".navbar-collapse").append(this.$el); // right in the menubar
            }
            if (this.model.get("searchString").length !== 0) {
                $("#searchInput:focus").css("border-right-width", "0");
            }
            this.delegateEvents(this.events);
        }
        else {
            this.$el.html(this.templateTable(attr));
            $("#table-nav-main").prepend(this.$el);
        }
        return this;
    },

    /**
     * Callback for window onresize event
     * @returns {void}
     */
    onresizeCallback: function () {
        this.setSearchInputWidth();
        $(".dropdown-menu-search").css({
            "max-height": window.innerHeight - 100 // 100 fix value for navbar &co.
        });
        if (Radio.request("Util", "getUiStyle") !== "TABLE") {
            $(".dropdown-menu-search").css({
                "overflow": "auto"
            });
        }
    },

    /**
     * todo
     * @returns {*} todo
     */
    initialRender: function () {
        this.render();
        if (this.model.get("initSearchString") !== undefined) {
            this.renderRecommendedList();
            this.$("#searchInput").val(this.model.get("initSearchString"));
        }
        this.setSearchInputWidth();
    },

    /**
     * Handling of click event on a ListGroupItem
     * @param   {event} e Event
     * @returns {void}
     */
    clickListGroupItem: function (e) {
        // fix for Firefox
        const event = e || window.event;
        let target = $(event.target);

        if (target.hasClass("badge")) {
            target = target.parent();
        }
        this.collapseHits(target);
    },

    /**
     * Handling of click event on button quickHelp. Toggles the QuickHelpWindow
     * @returns {void}
     */
    clickBtnQuestion: function () {
        if (!store.getters["QuickHelp/active"]) {
            store.commit("QuickHelp/setQuickHelpKey", "search");
            store.commit("QuickHelp/setActive", true);
        }
        else {
            store.commit("QuickHelp/setActive", false);
        }
    },

    /**
     * Toggles the color of the question/help button, dependent on an open/closed QuickHelp window.
     * @returns {void}
     */
    toggleBtnQuestionColor: function () {
        if (store.getters["QuickHelp/active"]) {
            this.$("span.glyphicon-question-sign").addClass("quickhelp-is-shown");
        }
        else {
            this.$("span.glyphicon-question-sign").removeClass("quickhelp-is-shown");
        }
    },

    /**
     * Handling of click event
     * @returns {void}
     */
    clickHandler: function () {
        this.clearSelection();
        $("#searchInput").trigger("focus");
    },

    /**
     * Sets the width of search input via JS
     * @returns {void}
     */
    setSearchInputWidth: function () {
        if ($("#searchInput").closest(".collapse.navbar-collapse").length > 0 && window.innerWidth >= 768) {
            this.$("#searchInput").width(window.innerWidth - $(".desktop").width() - 160);
            Radio.trigger("Title", "setSize");
        }
    },

    /**
     * Handling of menuLoader:ready
     * @param   {String} parentElementId parentElementId
     * @returns {void}
     */
    menuLoaderReady: function (parentElementId) {
        this.render(parentElementId);
        if (this.model.get("initSearchString") !== undefined) {
            if (this.model.get("isInitialRecommendedListCreated") === true) {
                this.renderRecommendedList();
                this.$("#searchInput").val(this.model.get("initSearchString"));
            }
        }
        this.setSearchInputWidth();
    },

    /**
     * Handling of isViewMobileChanged
     * @returns {void}
     */
    viewMobileChanged: function () {
        this.render();
    },

    /**
    * @description Methode, um den Searchstring über den Radio zu steuern ohne Event auszulösen
    * @param {string} searchstring - Der einzufügende Searchstring
    * @returns {void}
    */
    setSearchbarString: function (searchstring) {
        this.$("#searchInput").val(searchstring);
    },

    /**
    * @description Verbirgt die Menubar
    * @returns {void}
    */
    hideMenu: function () {
        this.$(".dropdown-menu-search").hide();
    },

    /**
     * Calculates the height of the dropdown div. Default 100 should allways fit roughly.
     * @returns {integer} div height
     */
    getDropdownHeight: function () {
        if (document.getElementById("masterportal-container")) {
            return document.getElementById("masterportal-container").offsetHeight - 130;
        }
        return 100;
    },

    /**
     * todo
     * @returns {*} todo
     */
    renderRecommendedList: function () {
        const attr = this.model.toJSON(),
            height = this.getDropdownHeight(),
            width = this.$("#searchForm").width();

        attr.uiStyle = Radio.request("Util", "getUiStyle");

        // If the topic tree is open on the table, it should be closed when the search is initialized.
        if ($("#table-nav-layers-panel").length > 0) {
            $("#table-nav-layers-panel").collapse("hide");
            Radio.trigger("TableMenu", "deactivateCloseClickFrame");
        }
        // sz, does not want to work in a local environment, so first use the template as variable
        // $("ul.dropdown-menu-search").html(_.template(SearchbarRecommendedListTemplate, attr));

        this.prepareAttrStrings(attr.finalHitList);
        this.$("ul.dropdown-menu-search").html(this.templateRecommendedList(attr));
        this.$("ul.dropdown-menu-search").css("max-height", height);
        this.$("ul.dropdown-menu-search").css("width", width);
        this.$("ul.dropdown-menu-search").css("max-width", width);

        // With only one hit in the recommendedList, the marker is set directly
        // and in case of a Tree-Search the menu folds out.
        if (this.model.get("initSearchString") !== undefined && this.model.get("finalHitList").length === 1) {
            this.hitSelected();
        }
        this.$("#searchInput + span").show();
    },

    /**
     * Preparing the attributes text
     * @param {*} finalHitList the final hitList of searching results
     * @returns {void}
     */
    prepareAttrStrings: function (finalHitList) {
        // keps hit.names from overflowing
        finalHitList.forEach(function (hit) {
            if (hit.additionalInfo !== undefined) {
                if (hit.name.length + hit.additionalInfo.length > 50) {
                    hit.shortName = this.model.shortenString(hit.name, 30);
                    hit.additionalInfo = this.model.shortenString(hit.additionalInfo, 20);
                }
            }
        }, this);
    },

    /**
     * Trigger searching via all registered services. Update searchString to enable patterns with less then three chars.
     * @returns {void}
     */
    searchAll: function () {
        this.model.setSearchString($("#searchInput").val());
        Radio.trigger("Searchbar", "searchAll", this.model.get("searchString"));
    },

    /**
     * todo
     * @returns {*} todo
     */
    renderHitList: function () {
        let attr;

        if (this.model.get("finalHitList").length === 1) {
            this.hitSelected(); // first and only entry in list
        }
        else {
            attr = this.model.toJSON();
            attr.uiStyle = Radio.request("Util", "getUiStyle");
            // sz, does not want to work in a local environment, so first use the template as variable
            // $("ul.dropdown-menu-search").html(_.template(SearchbarHitListTemplate, attr));
        }

        if (attr?.typeList) {
            this.$("ul.dropdown-menu-search").html(this.templateHitList(attr));
        }
    },

    /**
     * Set focus in searchInput
     * @returns {void}
     */
    setFocus: function () {
        this.$("#searchInput").focus();
    },

    /**
     * Proposal was selected.
     * @param  {evt} evt Event
     * @return {void}
     */
    hitSelected: function (evt) {
        let hit,
            hitID,
            pick,
            isElement = false;
        const modelHitList = this.model.get("finalHitList");

        // distingiush hit
        if (evt && Object.prototype.hasOwnProperty.call(evt, "cid")) { // in this case, evt = model
            pick = Radio.request("Util", "pick", modelHitList, [0]);

            hit = Object.values(pick)[0];
        }
        else if (evt && Object.prototype.hasOwnProperty.call(evt, "currentTarget") === true && evt.currentTarget.id) {
            hitID = evt.currentTarget.id;
            hit = Radio.request("Util", "findWhereJs", this.model.get("finalHitList"), {"id": hitID});

        }
        else if (evt?.id) {
            hit = Radio.request("Util", "findWhereJs", this.model.get("finalHitList"), {"id": evt.id});
            isElement = true;
        }
        else if (modelHitList.length > 1) {
            return;
        }
        else {
            hit = modelHitList[0];
        }
        // 1. Write text in Searchbar
        this.setSearchbarString(hit?.name);
        // 2. hide searchmenuü
        this.hideMenu();
        // 3. Hide the GFI
        Radio.trigger("GFI", "setIsVisible", false);
        // 4. Zoom if necessary on the result otherwise special handling
        if (hit?.triggerEvent) {
            this.model.setHitIsClick(true);
            Radio.trigger(hit.triggerEvent.channel, hit.triggerEvent.event, hit, true, evt?.handleObj?.type);

            if (hit?.coordinate) {
                this.setMarkerZoom(hit);
            }
        }
        else if (hit?.coordinate) {
            this.setMarkerZoom(hit);
        }
        else {
            const isMobile = Radio.request("Util", "isViewMobile");

            // desktop - topics tree is expanded
            if (hit && isMobile === false) {
                this.zoomToDesktopTopicTree(hit.id, hit.name);
            }
            // mobil
            else if (hit) {
                // adds the model to list, if not contained
                Radio.trigger("ModelList", "addModelsByAttributes", {id: hit.id});
                Radio.trigger("ModelList", "setModelAttributesById", hit.id, {isSelected: true});
            }
            // triggers selection of checkbox in tree
            Radio.trigger("ModelList", "refreshLightTree");
        }
        // 5. Triggere hit by the radio
        // is needed for IDA and sgv-online, ...
        Radio.trigger("Searchbar", "hit", hit);
        // 6. finishes event
        if (evt && !isElement) {
            evt.preventDefault();
            evt.stopImmediatePropagation();
        }
    },

    /**
     * checks for the coordinates being strings anjd converts them to float in this case
     * @param {Array} point coordinates Array
     * @returns {Array} converted coordinates
     */
    sanitizePoint: function (point) {
        const sanitizedPoint = point;

        if (typeof point[0] === "string" && typeof point[1] === "string") {
            sanitizedPoint[0] = parseFloat(point[0]);
            sanitizedPoint[1] = parseFloat(point[1]);
        }
        return sanitizedPoint;

    },

    /**
     * Switches the map mode depending on the type of the selected layer and opens the topic tree in 2D and 3D mode.
     * @param {String} hitId The hit id.
     * @param {String} hitName The hit name.
     * @returns {void}
     */
    zoomToDesktopTopicTree: function (hitId, hitName) {
        const layerTyp = Radio.request("Parser", "getItemByAttributes", {id: hitId})?.typ?.toUpperCase(),
            mapMode = Radio.request("Map", "getMapMode");

        if (layerTyp === "OBLIQUE" && mapMode !== "OBLIQUE") {
            this.switchToObliqueMapMode(hitName);

        }
        else if ((layerTyp === "TILESET3D" || layerTyp === "TERRAIN3D") && mapMode !== "3D") {
            this.switchTo3dMapMode(hitId, hitName);
        }
        else {
            Radio.trigger("ModelList", "showModelInTree", hitId);
        }
    },

    /**
     * The map switches to Oblique mode when this is confirmed.
     * @param {String} hitName The hit name.
     * @returns {void}
     */
    switchToObliqueMapMode: function (hitName) {
        store.dispatch("ConfirmAction/addSingleAction", {
            actionConfirmedCallback: () => Radio.trigger("Map", "mapChangeToOblique"),
            confirmCaption: "common:button.confirm",
            textContent: i18next.t("common:modules.searchbar.tree.chooseObliqueLayer", {hitName})
        });
    },

    /**
     * The map switches to 3D mode when this is confirmed.
     * A timeout is necessary to expand the topic tree.
     * This is smoothed out with the migration to Vue.
     * @param {String} hitId The hit id.
     * @param {String} hitName The hit name.
     * @returns {void}
     */
    switchTo3dMapMode: function (hitId, hitName) {
        store.dispatch("ConfirmAction/addSingleAction", {
            actionConfirmedCallback: () => {
                Radio.trigger("Map", "mapChangeTo3d");
                setTimeout(() => {
                    Radio.trigger("ModelList", "showModelInTree", hitId);
                }, 300);
            },
            confirmCaption: "common:button.confirm",
            textContent: i18next.t("common:modules.searchbar.tree.choose3dLayer", {hitName})
        });
    },

    /**
     * sets a Marker and triggers the zooming
     * @param {Object} hit search result
     * @returns {void}
     */
    setMarkerZoom: function (hit) {
        let extent = [],
            zoomLevel;

        if (hit.zoomLevel) {
            zoomLevel = hit.zoomLevel;
        }
        else if (this.model.get("zoomLevel")) {
            zoomLevel = this.model.get("zoomLevel");
        }
        else {
            const resolutions = Radio.request("MapView", "getResolutions");

            zoomLevel = resolutions.indexOf(0.2645831904584105) === -1 ? resolutions.length : resolutions.indexOf(0.2645831904584105);
        }

        if (hit.coordinate.length === 2) {
            store.dispatch("MapMarker/removePolygonMarker");
            hit.coordinate = this.sanitizePoint(hit.coordinate);
            store.dispatch("MapMarker/placingPointMarker", hit.coordinate);
            Radio.trigger("MapView", "setCenter", hit.coordinate, zoomLevel);
        }
        else {
            store.dispatch("MapMarker/removePolygonMarker");
            store.dispatch("MapMarker/removePointMarker");
            store.dispatch("MapMarker/placingPolygonMarker", getWKTGeom(hit));
            extent = store.getters["MapMarker/markerPolygon"].getSource().getExtent();
            Radio.trigger("Map", "zoomToExtent", extent, {maxZoom: zoomLevel});
        }
    },
    /**
     * todo
     * @param {*} e todo
     * @returns {*} todo
     */
    navigateList: function (e) {
        let selected = {},
            firstListElement = {};
            // fix for Firefox
        const event = e || window.event;

        if (event.keyCode === 38 || event.keyCode === 40 || event.keyCode === 13) {
            selected = this.getSelectedElement();
            firstListElement = this.getFirstElement();
        }

        if (selected.length === 0) {
            firstListElement.addClass("selected");
        }
        else {
            // uparrow
            if (event.keyCode === 38) {
                this.prevElement(selected);
            }
            // down arrow
            if (event.keyCode === 40) {
                this.nextElement(selected);
            }
            if (event.keyCode === 13 && this.model.get("finalHitList").length > 1) {
                if (this.isFolderElement(selected)) {
                    this.collapseHits(selected);
                }
                else {
                    selected.click();
                }
            }
        }
    },

    /**
     * todo
     * @param {*} element todo
     * @returns {*} todo
     */
    getSelectedElement: function () {
        return this.$el.find(this.searchbarKeyNavSelector + " .selected");
    },

    /**
     * todo
     * @param {*} element todo
     * @returns {*} todo
     */
    clearSelection: function () {
        this.getSelectedElement().removeClass("selected");
    },

    /**
     * todo
     * @param {*} element todo
     * @returns {*} todo
     */
    isLastElement: function (element) {
        return element.is(":last-child");
    },

    /**
     * todo
     * @param {*} element todo
     * @returns {*} todo
     */
    isFirstElement: function (element) {
        return element.is(":first-child");
    },

    /**
     * todo
     * @param {*} element todo
     * @returns {*} todo
     */
    isChildElement: function (element) {
        return element.parent().prev().hasClass("type");
    },

    /**
     * todo
     * @param {*} selected todo
     * @returns {*} todo
     */
    getFirstChildElement: function (selected) {
        return selected.next().children().first();
    },

    /**
     * todo
     * @param {*} element todo
     * @returns {*} todo
     */
    isFolderElement: function (element) {
        return element.hasClass("type");
    },

    /**
     * todo
     * @param {*} li todo
     * @returns {*} todo
     */
    scrollToNext: function (li) {
        const parent = li.parent(),
            pos = parent.scrollTop(),
            scrollHeight = pos + li.outerHeight(true);

        parent.scrollTop(scrollHeight);
    },

    /**
     * todo
     * @param {*} li todo
     * @returns {*} todo
     */
    scrollToPrev: function (li) {
        const parent = li.parent(),
            pos = parent.scrollTop(),
            scrollHeight = pos - li.outerHeight(true);

        parent.scrollTop(scrollHeight);
    },

    /**
     * todo
     * @param {*} element todo
     * @returns {*} todo
     */
    resetScroll: function (element) {
        element.scrollTop(0);
    },

    /**
     * todo
     * @param {*} selected todo
     * @returns {*} todo
     */
    nextElement: function (selected) {
        let next = {};

        selected.removeClass("selected");

        if (this.isFolderElement(selected) && selected.hasClass("open")) {
            next = this.getFirstChildElement(selected);
            this.resetScroll(selected.nextAll("div:first"));
        }
        else if (this.isLastElement(selected)) {
            if (this.isChildElement(selected)) {
                if (this.isLastElement(selected.parent())) {
                    this.getFirstElement().addClass("selected");
                    return;
                }
                next = this.getNextElement(selected.parent());
                this.scrollToNext(selected);
            }
            else {
                this.getFirstElement().addClass("selected");
                return;
            }
        }
        else {
            next = this.getNextElement(selected);
            this.scrollToNext(selected);
        }
        next.addClass("selected");
    },

    /**
     * todo
     * @param {*} selected todo
     * @returns {*} todo
     */
    getNextElement: function (selected) {
        return selected.nextAll("li:first");
    },

    /**
     * todo
     * @param {*} selected todo
     * @returns {*} todo
     */
    prevElement: function (selected) {
        let prev = {};

        selected.removeClass("selected");

        if (this.isFirstElement(selected)) {
            if (this.isChildElement(selected)) {
                // child
                prev = selected.parent().prevAll("li:first");
                this.resetScroll(selected.parent());
            }
            else {
                // Folder
                return;
            }
        }
        else {
            prev = selected.prevAll("li:first");
            if (this.isFolderElement(selected)) {
                this.resetScroll(selected.prevAll("div:first"));
            }
            else {
                this.scrollToPrev(selected);
            }
        }
        prev.addClass("selected");
    },

    /**
     * todo
     * @returns {*} todo
     */
    getFirstElement: function () {
        return this.$el.find(this.searchbarKeyNavSelector + " li").first();
    },

    /**
     * todo
     * @returns {*} todo
     */
    getLastElement: function () {
        return this.$el.find(this.searchbarKeyNavSelector + " li").last();
    },

    /**
     * controls the input sequence of events,
     * so that the paste works with shortcut and with contextmenu
     * because with ctrl + c comes 1 paste and 2 keyup events,
     * but with right-click and paste comes 1 contextmenu and 1 paste event
     * @param {event} evt - a keyup, paste or contextmenu event
     * @returns {void}
     */
    controlEvent: function (evt) {
        let count = this.model.get("tempCounter");

        if (evt.type === "contextmenu") {
            this.model.setTempCounter(0);
        }
        else if (evt.type === "paste") {
            this.handlePasteEvent(evt, count);
        }
        else if (evt.type === "keyup") {
            if (count < 2) {
                this.model.setTempCounter(++count);
            }
            else {
                clearTimeout(this.model.get("timeoutReference"));
                this.model.set("timeoutReference", setTimeout(() => {
                    this.setSearchString(evt);
                }, 200));
            }
        }
        else {
            this.setSearchString(evt);
        }
    },

    /**
     * handle paste event
     * @param {event} evt - a keyup, paste or contextmenu event
     * @param {number} count - temporary counter to control input events
     * @returns {void}
     */
    handlePasteEvent: function (evt, count) {
        if (count === undefined) {
            this.model.setTempCounter(0);
        }
        else {
            this.model.setTempCounter(undefined);
        }
        this.setSearchString(evt);
    },

    /**
     * todo
     * @param {*} evt todo
     * @returns {*} todo
     */
    setSearchString: function (evt) {
        if (evt.target.value.length === 0) {
            // reset search, if last letter is deleted
            this.deleteSearchString();
        }
        else {
            if (evt.type === "paste") {
                this.model.setSearchString(evt.target.value, evt.type);
            }
            else if (evt.keyCode !== 37 && evt.keyCode !== 38 && evt.keyCode !== 39 && evt.keyCode !== 40 && !(this.getSelectedElement("#searchInputUL").length > 0 && this.getSelectedElement("#searchInputUL").hasClass("type"))) {
                if (evt.key === "Enter" || evt.keyCode === 13) {
                    if (this.model.get("finalHitList").length === 1) {
                        this.hitSelected($(".list-group-item.hit")[0]); // first and only entry in list
                    }
                    else {
                        this.renderHitList();
                        this.searchAll();
                    }
                }
                else {
                    this.model.setSearchString(evt.target.value); // evt.target.value = value from the searchmask
                }
            }
            else if (evt.keyCode === 38 || evt.keyCode === 40) {
                this.positionOfCursorToEnd();
            }

            // the "x-button" in the searchbar
            if (evt.target.value.length > 0) {
                this.$("#searchInput + span").show();
            }
            else {
                this.$("#searchInput + span").hide();
            }
        }
    },

    /**
     * puts the cursor at the end of the text when the arrow key up or down is up,
     * if navigate through results
     * @returns {void}
     */
    positionOfCursorToEnd: function () {
        const selectedElement = this.$(".list-group-item.selected"),
            lastSelectedItem = this.model.get("searchFieldisSelected");

        if (lastSelectedItem !== undefined || (lastSelectedItem !== undefined && this.$(".list-group-item").length !== 0)) {
            this.focusOnEnd(this.$("#searchInput"));
        }

        this.model.setSearchFieldisSelected(selectedElement);
    },

    /**
     * todo
     * @param {*} target todo
     * @returns {*} todo
     */
    collapseHits: function (target) {
        this.$(".list-group-item.type + div").hide("slow"); // closes all tabs
        if (target.next().css("display") === "block") {
            target.next().hide("slow");
            target.removeClass("open");
        }
        else {
            target.next().show("slow");
            target.addClass("open");
            target.siblings().removeClass("open");
        }
    },

    /**
     * todo
     * @param {*} evt todo
     * @returns {*} todo
     */
    toggleStyleForRemoveIcon: function (evt) {
        if (evt.type === "focusin") {
            if (navigator.appVersion.indexOf("MSIE 9.") !== -1) {
                if (this.$("#searchInput").attr("value") === this.model.get("placeholder")) {
                    this.$("#searchInput").val("");
                }
            }
            this.$(".btn-deleteSearch").css("border-color", "#66afe9");
        }
        else if (evt.type === "focusout") {
            if (navigator.appVersion.indexOf("MSIE 9.") !== -1) {
                if (this.$("#searchInput").attr("value") === "") {
                    this.$("#searchInput").val(this.model.get("placeholder"));
                }
            }
            this.$(".btn-deleteSearch").css("border-color", "#cccccc");
        }
    },

    /**
     * Unsets the search to initial state: Clearing up the text input field, hiding the menu and hiding all map marker.
     * @returns {void}
     */
    deleteSearchString: function () {
        this.model.set("searchString", "");
        this.setSearchbarString("");
        this.hideMarker();
        store.dispatch("MapMarker/removePointMarker");
        store.dispatch("MapMarker/removePolygonMarker");
        this.hideMenu();
        this.$("#searchInputUL").html("");
    },

    /**
     * Handler for mouseenter event on hit.
     * @param {$.Event} evt Event
     * @returns {void}
     */
    showMarker: function (evt) {
        const isEvent = evt instanceof $.Event,
            hitId = isEvent ? evt.currentTarget.id : null,
            hit = isEvent ? this.model.get("finalHitList").find(obj => obj.id === hitId) : null,
            hitName = isEvent ? hit.name : "undefined";

        // with gdi-search no action on mousehover or on GFI onClick
        if (hit && hit?.triggerEvent && hit.type !== i18next.t("common:modules.searchbar.type.subject") && hit.type !== i18next.t("common:modules.searchbar.type.general") && hit.triggerEvent.event !== "gfiOnClick") {
            Radio.trigger(hit.triggerEvent.channel, hit.triggerEvent.event, hit, true, evt.handleObj.type);
            return;
        }
        else if (hit && hit?.coordinate) {
            store.dispatch("MapMarker/removePolygonMarker");
            store.dispatch("MapMarker/removePointMarker");

            if (hit.coordinate.length === 2) {
                hit.coordinate = this.sanitizePoint(hit.coordinate);
                store.dispatch("MapMarker/placingPointMarker", hit.coordinate);
            }
            else {
                store.dispatch("MapMarker/placingPolygonMarker", getWKTGeom(hit));
            }
            return;
        }
        else if (hit && hit?.type && (hit.type === i18next.t("common:modules.searchbar.type.topic") || hit.type === i18next.t("common:modules.searchbar.type.subject") || hit.type === i18next.t("common:modules.searchbar.type.general"))) {
            return;
        }

        console.warn("Error: Could not set MapMarker for " + hitName);
    },

    /**
     * Hides all map markers.
     * @param {event} evt mouse leave event
     * @returns {void}
     */
    hideMarker: function (evt) {
        let hitId,
            hit;

        if (evt !== undefined) {
            hitId = evt.currentTarget.id;
            hit = Radio.request("Util", "findWhereJs", this.model.get("finalHitList"), {"id": hitId});
        }

        if (hit && Object.prototype.hasOwnProperty.call(hit, "triggerEvent")) {
            if (hit.type !== i18next.t("common:modules.searchbar.type.subject") && hit.type !== i18next.t("common:modules.searchbar.type.general") && hit.triggerEvent.event !== "gfiOnClick" && !this.model.get("hitIsClick")) {
                Radio.trigger(hit.triggerEvent.channel, hit.triggerEvent.event, hit, false);
            }
        }
        else if (this.$(".dropdown-menu-search").css("display") === "block") {
            store.dispatch("MapMarker/removePointMarker");
        }
    },

    /**
    * Places the cursor at the end of the string
    * @param {Element} element - the DOM-element
    * @returns {void}
    */
    focusOnEnd: function (element) {
        const strLength = element.val().length * 2;

        element.focus();
        element[0].setSelectionRange(strLength, strLength);
    }
});

export default SearchbarView;
