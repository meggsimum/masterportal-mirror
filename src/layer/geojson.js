import {Vector as VectorLayer} from "ol/layer.js";
import {Vector as VectorSource} from "ol/source.js";
import GeoJSON from "ol/format/GeoJSON.js";

export function createLayer (rawLayer) {
    return new VectorLayer({
        source: new VectorSource({
            format: new GeoJSON(),
            url: rawLayer.url
            // TODO: user may desire to just throw in his GeoJSON here; allow that, too
            // features: (new GeoJSON()).readFeatures(geojson)
        })
    });
}
