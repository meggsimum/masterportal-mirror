import listViewMain from "./listViewMain";
import DesktopLayerViewLight from "./layer/viewLight";
import Dropdown from "bootstrap/js/dist/dropdown";


const LightMenu = listViewMain.extend(/** @lends LightMenu.prototype */{
    /**
     * @class LightMenu
     * @extends ListViewMain
     * @memberof Menu.Desktop
     * @constructs
     * @fires ModelList#RadioRequestModelListGetCollection
     * @fires ModelList#UpdateLightTree
     * @fires Autostart#RadioTriggerAutostartInitializedModul
     * @listens Autostart#RadioTriggerAutostartStartModul
     */
    initialize: function () {
        this.collection = Radio.request("ModelList", "getCollection");
        Radio.on("Autostart", "startModul", this.startModul, this);
        this.listenTo(this.collection, {
            "updateLightTree": function () {
                this.render();
            }
        });
        this.renderMain();
        this.render();
        Radio.trigger("Autostart", "initializedModule", "tree");
    },
    /**
     * Renders the data to DOM.
     * @return {void}
     */
    render: function () {
        let models = this.collection.where({type: "layer"});

        $("#tree").html("");

        models = Radio.request("Util", "sortBy", models, (model) => model.get("selectionIDX"), this);

        this.addViews(models);
        $("ul#tree.light").css("max-height", $("#map").height() - 160);
    },
    /**
     * Add Views
     * @param {*} models to do
     * @return {void}
     */
    addViews: function (models) {
        models.forEach(model => {
            if (!model.get("isNeverVisibleInTree")) {
                new DesktopLayerViewLight({model: model});
            }
        });
    },
    /**
     * Start Modul
     * @param {*} modulId to do
     * @return {void}
     */
    startModul: function (modulId) {
        const modul = this.collection.find(function (model) {
            return model.get("id").toLowerCase() === modulId;
        });

        if (modul.get("type") === "tool") {
            modul.setIsActive(true);
        }
        else {
            // Upgrade to BT5, use JS method instead of class addition
            const dropdown = Dropdown.getOrCreateInstance($("#" + modulId).parent().children(".dropdown-toggle").get(0));

            dropdown.show();
        }
    }
});

export default LightMenu;
