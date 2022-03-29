import LayerView from "@modules/menu/desktop/layer/viewLight.js";
import {expect} from "chai";

describe("menu/desktop/layer/viewLight", function () {
    let fakeModel,
        CustomLayerView;

    before(function () {

        fakeModel = {
            getIsOutOfRange: function () {
                return 42;
            },

            children: [{datasets: false}],
            isSettingVisible: false,
            isVisibleInMap: false,
            isStyleable: false,
            showSettings: true,
            supported: ["2D"],
            isRemovable: false,
            isSecured: false,
            domId: 0,

            setIsSettingVisible: function (value) {
                this.isSettingVisible = value;
            },

            setIsStyleable: function (value) {
                this.isStyleable = value;
            },
            set: function () {
                // dummy function
            },
            toggleIsSelected: function () {
                this.isVisibleInMap = true;
            },
            get: function (key) {
                switch (key) {
                    case "removeTopicText":
                        return "removeTopicText";
                    case "changeClassDivisionText":
                        return "changeClassDivisionText";
                    case "infosAndLegendText":
                        return "infosAndLegendText";
                    case "settingsText":
                        return "settingsText";
                    case "transparencyText":
                        return "transparencyText";
                    case "increaseTransparencyText":
                        return "increaseTransparencyText";
                    case "reduceTransparencyText":
                        return "reduceTransparencyText";
                    case "levelUpText":
                        return "levelUpText";
                    case "levelDownText":
                        return "levelDownText";
                    case "isOutOfRange":
                        return false;
                    default:
                        return this[key] || null;
                }
            },

            has: function () {
                return true;
            },

            toJSON: function () {
                return {
                    styleable: this.isStyleable,
                    supported: this.supported,
                    isSettingVisible: this.isSettingVisible,
                    showSettings: this.showSettings,
                    transparency: 42,
                    isVisibleInMap: this.isVisibleInMap,
                    isRemovable: false,
                    isSecured: false,
                    removeTopicText: "removeTopicText",
                    changeClassDivisionText: "changeClassDivisionText",
                    infosAndLegendText: "infosAndLegendText",
                    settingsText: "settingsText",
                    transparencyText: "transparencyText",
                    increaseTransparencyText: "increaseTransparencyText",
                    reduceTransparencyText: "reduceTransparencyText",
                    levelUpText: "levelUpText",
                    levelDownText: "levelDownText",
                    showTopicText: "showTopicText",
                    domId: 0
                };
            }
        };

        CustomLayerView = LayerView.extend({
            doGetParentObject: function () {
                return $("<div></div>");
            }
        });
        i18next.init({
            lng: "cimode",
            debug: false

        });
    });

    describe("The style-icon", function () {
        it("should be visible for stylable layers", function () {

            fakeModel.setIsStyleable(true);
            fakeModel.setIsSettingVisible(true);

            const layerView = new CustomLayerView({model: fakeModel});

            expect(layerView.$el.find(".glyphicon-tint").length).to.be.equal(1);

            layerView.rerender();

            expect(layerView.$el.find(".glyphicon-tint").length).to.be.equal(1);
        });
        it("should be hidden for other not styleable layers", function () {

            fakeModel.setIsStyleable(false);
            fakeModel.setIsSettingVisible(true);

            const layerView = new CustomLayerView({model: fakeModel});

            expect(layerView.$el.find(".glyphicon-tint").length).to.be.equal(0);

            layerView.rerender();

            expect(layerView.$el.find(".glyphicon-tint").length).to.be.equal(0);
        });
    });
    describe("the layer checkbox", function () {
        it("should react to key events", function () {

            const layerView = new CustomLayerView({model: fakeModel}),
                keyEvent = new $.Event("keydown", {which: 13});

            expect(layerView.$el.find("span.glyphicon-check").length).to.be.equal(0);

            layerView.$el.find("a.layer-item").trigger(keyEvent);

            layerView.rerender();

            expect(layerView.$el.find("span.glyphicon-check").length).to.be.equal(1);
        });
    });
});
