/**
 * The Radio Channel GFI is no longer available in the "new" Gfi (src/modules/tools/gfi).
 * This file is used for communication between this module and the new Gfi.
 * It can be deleted, if this module has been refactored.
 */
import store from "../../src/app-store";
import {createGfiFeature} from "../../src/api/gfi/getWmsFeaturesByMimeType";

Radio.channel("VisibleVector").on({
    "gfiOnClick": function (hit) {
        const foundLayer = Radio.request("ModelList", "getModelByAttributes", {id: hit.layer_id}),
            layer = {
                get: (key) => {
                    if (key === "name") {
                        return hit.name;
                    }
                    else if (key === "gfiTheme") {
                        return foundLayer.get("gfiTheme");
                    }
                    else if (key === "gfiAttributes") {
                        return hit.gfiAttributes;
                    }
                    else if (key === "id") {
                        return hit.layer_id;
                    }
                    return null;
                }
            },
            feature = createGfiFeature(
                layer,
                null, // for url
                hit.feature
            );

        store.commit("Maps/setClickCoordinate", [hit.coordinate[0], hit.coordinate[1]]);
        store.commit("Tools/Gfi/setGfiFeatures", [feature]);
    }
});

Radio.channel("GFI").on({
    "setIsVisible": function (isVisible) {
        if (!isVisible) {
            store.commit("Tools/Gfi/setGfiFeatures", null);
        }
    }
});
