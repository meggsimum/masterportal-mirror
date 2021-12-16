import Item from "../item";

const StaticLink = Item.extend({
    defaults: {
        // welcher Node-Type - folder/layer/item/staticLink
        type: "",
        // die ID der Parent-Node
        parentId: "",
        // Bootstrap Icon Class
        icon: "bi-globe",
        // Name (Überschrift) der Funktion
        name: "",
        // URL des Links
        url: "",
        // Trigger Event
        onClickTrigger: [{
            event: "",
            channel: "",
            data: ""
        }],
        inSubMenue: false
    },
    triggerRadioEvent: function () {
        this.get("onClickTrigger").forEach(trigger => {
            this.triggerEvent(trigger);
        });
    },
    triggerEvent: function (triggerParams) {
        const data = triggerParams.data;

        if (triggerParams.event !== "" && triggerParams.channel !== "") {
            Radio.trigger(triggerParams.channel, triggerParams.event, data);
        }
    },

    // setter for onClickTrigger
    setOnClickTrigger: function (value) {
        this.set("onClickTrigger", value);
    },
    getViewElementClasses: function () {
        let classes = "dropdown";

        if (this.get("parentId") === "root") {
            classes += " menu-style d-sm-none d-md-block";
        }
        else {
            classes += " submenu-style";
        }
        return classes;
    }

});

export default StaticLink;
