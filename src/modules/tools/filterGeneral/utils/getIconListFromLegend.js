import {convertColor} from "../../../../utils/convertColor.js";

/**
 * Returns a list of image paths from the Legend
 * @param {Object[]} legendInfoList an array list of legend information
 * @param {Object} styleModel the style model
 * @returns {Object} an object with the label of the legendInfo (value of the attrName) as key and the path of the icon as value
 */
function getIconListFromLegend (legendInfoList, styleModel) {
    const result = {};

    legendInfoList.forEach(legendInfo => {
        // always show icon if configured, independend of geometry type
        if (legendInfo.styleObject.get("type") === "icon") {
            result[legendInfo.label] = legendInfo.styleObject.get("imagePath") + legendInfo.styleObject.get("imageName");
        }
        else if (legendInfo.geometryType) {
            if (legendInfo.geometryType === "Point") {
                result[legendInfo.label] = createCircleSVG(styleModel);
            }
            else if (legendInfo.geometryType === "LineString") {
                result[legendInfo.label] = createLineSVG(legendInfo.styleObject);
            }
            else if (legendInfo.geometryType === "Polygon") {
                result[legendInfo.label] = createPolygonSVG(legendInfo.styleObject);
            }
        }
    });

    return result;
}

/**
 * Returns style Model
 * @param {String} layerId layerId to get the legend data
 * @returns {Object} the style model
 */
function getStyleModel (layerId) {
    const layerModel = Radio.request("ModelList", "getModelByAttributes", {id: layerId});
    let styleId,
        styleModel;

    if (layerModel) {
        styleId = layerModel.get("styleId");
        if (styleId) {
            styleModel = Radio.request("StyleList", "returnModelById", styleId);
        }
    }

    return styleModel;
}

/**
 * Creates an SVG for a polygon
 * @param   {vectorStyle} style feature styles
 * @returns {string} svg
 */
function createPolygonSVG (style) {
    let svg = "";
    const fillColor = style.get("polygonFillColor") ? convertColor(style.get("polygonFillColor"), "rgbString") : "black",
        strokeColor = style.get("polygonStrokeColor") ? convertColor(style.get("polygonStrokeColor"), "rgbString") : "black",
        strokeWidth = style.get("polygonStrokeWidth"),
        fillOpacity = style.get("polygonFillColor")[3] || 0,
        strokeOpacity = style.get("polygonStrokeColor")[3] || 0;

    svg += "<svg height='25' width='25'>";
    svg += "<polygon points='5,5 20,5 20,20 5,20' style='fill:";
    svg += fillColor;
    svg += ";fill-opacity:";
    svg += fillOpacity;
    svg += ";stroke:";
    svg += strokeColor;
    svg += ";stroke-opacity:";
    svg += strokeOpacity;
    svg += ";stroke-width:";
    svg += strokeWidth;
    svg += ";'/>";
    svg += "</svg>";

    return svg;
}

/**
 * Creates an SVG for a circle
 * @param   {vectorStyle} style feature styles
 * @returns {string} svg
 */
function createCircleSVG (style) {
    let svg = "";
    const circleStrokeColor = style.get("circleStrokeColor") ? convertColor(style.get("circleStrokeColor"), "rgbString") : "black",
        circleStrokeOpacity = Array.isArray(style.get("circleStrokeColor")) && style.get("circleStrokeColor").length > 3 ? style.get("circleStrokeColor")[3] : 0,
        circleStrokeWidth = style.get("circleStrokeWidth") ? style.get("circleStrokeWidth") : "auto",
        circleFillColor = style.get("circleFillColor") ? convertColor(style.get("circleFillColor"), "rgbString") : "black",
        circleFillOpacity = Array.isArray(style.get("circleFillColor")) && style.get("circleFillColor").length > 3 ? style.get("circleFillColor")[3] : 0;

    svg += "<svg height='25' width='25'>";
    svg += "<circle cx='12.5' cy='12.5' r='10' stroke='";
    svg += circleStrokeColor;
    svg += "' stroke-opacity='";
    svg += circleStrokeOpacity;
    svg += "' stroke-width='";
    svg += circleStrokeWidth;
    svg += "' fill='";
    svg += circleFillColor;
    svg += "' fill-opacity='";
    svg += circleFillOpacity;
    svg += "'/>";
    svg += "</svg>";

    return svg;
}

/**
 * Creates an SVG for a line
 * @param   {vectorStyle} style feature styles
 * @returns {string} svg
 */
function createLineSVG (style) {
    let svg = "";
    const strokeColor = style.get("lineStrokeColor") ? convertColor(style.get("lineStrokeColor"), "rgbString") : "black",
        strokeWidth = style.get("lineStrokeWidth"),
        strokeOpacity = style.get("lineStrokeColor")[3] || 0,
        strokeDash = style.get("lineStrokeDash") ? style.get("lineStrokeDash").join(" ") : undefined;

    svg += "<svg height='25' width='25'>";
    svg += "<path d='M 05 20 L 20 05' stroke='";
    svg += strokeColor;
    svg += "' stroke-opacity='";
    svg += strokeOpacity;
    svg += "' stroke-width='";
    svg += strokeWidth;
    if (strokeDash) {
        svg += "' stroke-dasharray='";
        svg += strokeDash;
    }
    svg += "' fill='none'/>";
    svg += "</svg>";

    return svg;
}

export {getStyleModel, getIconListFromLegend};
