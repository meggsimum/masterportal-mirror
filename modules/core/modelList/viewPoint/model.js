import Item from ".././item";

const Viewpoint = Item.extend({
    defaults: {
        // true wenn die Node sichtbar
        isVisible: false,
        // true wenn die Node zur ersten Ebene gehört
        isRoot: false,
        // welcher Node-Type - folder/layer/item
        type: "",
        // die ID der Parent-Node
        parentId: "",
        // Bootstrap Icon Class
        icon: "",
        // Email Adresse
        email: undefined,
        // Name (Überschrift) der Funktion
        name: "",
        // true wenn das Tool aktiviert ist
        isActive: false
    },
    activateViewpoint: function () {
        if (Radio.request("Map", "getMapMode") === "3D") {
            Radio.trigger("MapView", "setCenter", this.get("center"), this.get("zoomLevel"));
            Radio.trigger("Map", "setCameraParameter", {tilt: this.get("tilt"), heading: this.get("heading"), altitude: this.get("altitude")});
        }
        else {
            Radio.trigger("MapView", "setCenter", this.get("center"), this.get("zoomLevel"));
        }

    }
});

export default Viewpoint;

