/**
 * The Radio Channel GFI is no longer available in the "new" Gfi (src/modules/tools/gfi).
 * This file is used for communication between this module and the new Gfi.
 * It can be deleted, if this module has been refactored.
 */
import store from "../../../src/app-store";

Radio.channel("GFI").reply({
    "getVisibleTheme": function () {
        const feature = store.getters["Tools/Gfi/currentFeature"];

        if (feature !== null) {
            const layerList = store.getters["Map/layerList"],
                layerOfFeature = layerList.find(layer => {
                    return layer.get("name") === feature.getTitle();
                }),
                source = layerOfFeature.getSource(),
                olFeature = source.getFeatureById(feature.getId());

            return {
                id: layerOfFeature.get("id"),
                feature: olFeature,
                get (val) {
                    return this[val];
                }
            };
        }
        return undefined;
    }
});

Radio.channel("GFI").on({
    "setIsVisible": function (isVisible) {
        if (!isVisible) {
            store.commit("Maps/setGfiFeatures", null);
        }
    }
});
