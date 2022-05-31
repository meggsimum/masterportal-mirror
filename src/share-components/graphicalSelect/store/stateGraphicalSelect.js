import Overlay from "ol/Overlay.js";
/**
     * @typedef {object} stateGraphicalSelect
     * @description creates a dropdown to select an area in a map by square, circle or polygon. Create it like this: new GraphicalSelectModel({id: "idOfTheCaller"}).
     * The id is used to react only on events of the caller, not on all components, that use a graphicalSelectModel.
     * @property {Boolean} active=false dropdown is open or closed
     * @property {String} name="Geometrie" name of the dropdown
     * @property {String} type="string" type of the dropdown values
     * @property {String} displayName="Geometrie auswählen" label of the dropdown
     * @property {String} snippetType="graphicalSelect" type of the dropdown values
     * @property {Boolean} isMultiple=false dropdown multiple
     * @property {Object} drawInteraction=undefined the interaction to draw a square, circle or polygon
     * @property {ol.overlay} circleOverlay=new Overlay({offset: [15, 0], positioning: "center-left"}) circle overlay (tooltip) - shows the radius
     * @property {ol.overlay} tooltipOverlay=new Overlay({offset: [15, 20], positioning: "top-left"}) todo
     * @property {Object} selectionElements=["Dropdown"] available gui selection elements
     * @property {Object} geographicValues={"Rechteck aufziehen": "Box", "Kreis aufziehen": "Circle", "Fläche zeichnen": "Polygon"} possible values
     * @property {String} currentValue="" contains the current geographic value for "Box",  "Circle" or "Polygon"
     * @property {String} tooltipMessage="Klicken zum Starten und Beenden" Meassage for tooltip
     * @property {String} tooltipMessagePolygon="Klicken um Stützpunkt hinzuzufügen" Message for tooltip
     * @property {ol.geojson} selectedAreaGeoJson={} the selected area as GeoJSON
     * @property {String} defaultSelection="" initiliazed value of the dropdown selection
     */
const state = {
    active: false,
    name: "Geometrie",
    type: "string",
    displayName: "common:snippets.graphicalSelect.displayName",
    snippetType: "graphicalSelect",
    isMultiple: false,
    drawInteraction: undefined,
    circleOverlay: new Overlay({
        id: "circle-overlay",
        element: document.createElement("div"),
        offset: [15, 0],
        positioning: "center-left"
    }),
    tooltipOverlay: new Overlay({
        id: "tooltip-overlay",
        element: document.createElement("div"),
        offset: [15, 20],
        positioning: "top-left"
    }),
    selectionElements: ["Dropdown"],
    geographicValues: ["Box", "Circle", "Polygon"],
    currentValue: "",
    tooltipMessage: "common:snippets.graphicalSelect.tooltipMessage",
    tooltipMessagePolygon: "common:snippets.graphicalSelect.tooltipMessagePolygon",
    selectedAreaGeoJson: undefined,
    defaultSelection: ""
};

export default state;
