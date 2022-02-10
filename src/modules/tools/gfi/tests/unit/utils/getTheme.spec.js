import getTheme from "../../../utils/getTheme";
import DefaultTheme from "../../../components/themes/default/components/DefaultTheme.vue";
import SensorTheme from "../../../components/themes/sensor/components/SensorTheme.vue";

import {expect} from "chai";

describe("src/modules/tools/gfi/utils/getTheme.js", () => {
    const components = {DefaultTheme, SensorTheme};

    describe("getTheme", () => {
        it("return the theme contained in addons", function () {
            const themeFromFeature = "schulinfo",
                addonThemes = ["Trinkwasser", "Schulinfo"];

            expect(getTheme(themeFromFeature, components, addonThemes)).to.be.equals("Schulinfo");
        });
        it("return Default-theme, because the theme is not contained in addons", function () {
            const themeFromFeature = "schulinfo",
                addonThemes = ["Trinkwasser", "SchulinfoXXX"];

            expect(getTheme(themeFromFeature, components, addonThemes)).to.be.equals("DefaultTheme");
        });
        it("return Sensor-theme, because the theme is configured and available", function () {
            const themeFromFeature = "Sensor",
                addonThemes = ["Trinkwasser", "SchulinfoTheme"];

            expect(getTheme(themeFromFeature, components, addonThemes)).to.be.equals("SensorTheme");
        });
        it("return Default-theme, if theme from feature is not defined", function () {
            const themeFromFeature = undefined,
                addonThemes = ["Trinkwasser", "Schulinfo"];

            expect(getTheme(themeFromFeature, components, addonThemes)).to.be.equals("DefaultTheme");
        });
        it("return Default-theme, if theme from feature is null", function () {
            const themeFromFeature = null,
                addonThemes = ["Trinkwasser", "Schulinfo"];

            expect(getTheme(themeFromFeature, components, addonThemes)).to.be.equals("DefaultTheme");
        });

    });

});
