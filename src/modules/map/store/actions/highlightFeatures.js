import {Circle, Style, Fill, Stroke} from "ol/style.js";
import * as Color from 'ol/color';

/**
 * check how to highlight
 * @param {Object} state state object
 * @param {Object} highlightObject contains several parameters for feature highlighting
 * @returns {void}
 */
function highlightFeatures ({commit, dispatch}, highlightObject) {
    console.log("highlightFeatures");
    if (highlightObject.type === "highlightPolygons") {
        highlightPolygons(commit, dispatch, highlightObject);
    }
}
/**
 * highlights a polygon feature
 * @param {Function} commit commit function
 * @param {Function} dispatch commit function
 * @param {Object} highlightObject contains several parameters for feature highlighting
 * @fires VectorStyle#RadioRequestStyleListReturnModelById
 * @returns {void}
 */
function highlightPolygons (commit, dispatch, highlightObject) {
    console.log("highlightPolygons");
    if (highlightObject.features) {
        commit("setHighlightedFeatures", highlightObject.features);

        highlightObject.features.forEach(feature => {
            const newStyle = new Style({
                image: new Circle({
                    radius: 10,
                    fill: new Fill({
                        color: 'blue'
                    }),
                    stroke: new Stroke({
                        color: 'olive',
                        width: 1
                    })
                })
            });
            
            if (newStyle) {
                //console.log(newStyle);
                commit("setHighlightedFeaturesStyle", newStyle);

                //feature.setStyle(newStyle);
            }
        });
    }
}
/**
 * Get style via styleList
 * @param {Object} highlightObject contains several parameters for feature highlighting
 * @param {ol/feature} feature openlayers feature to highlight
 * @fires VectorStyle#RadioRequestStyleListReturnModelById
 * @returns {ol/style} ol style
 */
function styleObject (highlightObject, feature) {
    let styleModel = Radio.request("StyleList", "returnModelById", "2003"),
        style;

    //console.log(styleModel);
    if (styleModel) {
        style = styleModel.createStyle(feature, false);
        if (Array.isArray(style) && style.length > 0) {
            style = style[0];
        }
    }
    return style;
}

export {highlightFeatures};

