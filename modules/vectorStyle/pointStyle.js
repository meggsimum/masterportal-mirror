import StyleModel from "./style.js";
import {Circle as CircleStyle, Fill, Stroke, Style, Icon} from "ol/style.js";
import {prepareValue, isObjectPath} from "../../src/utils/attributeMapper.js";

const PointStyleModel = StyleModel.extend(/** @lends PointStyleModel.prototype */{
    /**
     * @description Class to create ol.style/Style
     * @class PointStyleModel
     * @extends StyleModel
     * @memberof VectorStyle.Style
     * @constructs
     * @property {ol/feature} feature Feature to be styled.
     * @property {object} styles styling properties to overwrite defaults
     * @property {Boolean} isClustered Flag to show if feature is clustered.
     */
    defaults: {
        "feature": null,
        "isClustered": false,
        /**
         * @type {string}
         * @enum {"icon"|"circle"|"nominal"|"interval"}
         */
        "type": "circle",

        "imagePath": "",
        // für type icon
        "imageName": "blank.png",
        "imageWidth": 1,
        "imageHeight": 1,
        "imageScale": 1,
        "imageOffsetX": 0.5,
        "imageOffsetY": 0.5,
        "imageOffsetXUnit": "fraction",
        "imageOffsetYUnit": "fraction",
        // for type circle
        "circleRadius": 10,
        "circleFillColor": [0, 153, 255, 1],
        "circleStrokeColor": [0, 0, 0, 1],
        "circleStrokeWidth": 2,
        /**
         * @type {string}
         * @enum {"circle"|"icon"}
         */
        "clusterType": "circle",
        // for type circle
        "clusterCircleRadius": 15,
        "clusterCircleFillColor": [0, 154, 205, 1],
        "clusterCircleStrokeColor": [0, 0, 0, 0],
        "clusterCircleStrokeWidth": 2,
        // for type icon
        "clusterImageName": "blank.png",
        "clusterImageWidth": 1,
        "clusterImageHeight": 1,
        "clusterImageScale": 1,
        "clusterImageOffsetX": 0.5,
        "clusterImageOffsetY": 0.5,
        // Für scalingShape CIRCLESEGMENTS
        "circleSegmentsRadius": 10,
        "circleSegmentsStrokeWidth": 4,
        "circleSegmentsBackgroundColor": [255, 255, 255, 0],
        "scalingValueDefaultColor": [0, 0, 0, 1],
        "circleSegmentsGap": 10,
        // Für scalingShape CIRCLE_BAR
        "circleBarScalingFactor": 1,
        "circleBarRadius": 6,
        "circleBarLineStroke": 5,
        "circleBarCircleFillColor": [0, 0, 0, 1],
        "circleBarCircleStrokeColor": [0, 0, 0, 1],
        "circleBarCircleStrokeWidth": 1,
        "circleBarLineStrokeColor": [0, 0, 0, 1],
        "scalingAttribute": "",
        "rotation": 0
    },

    initialize: function (feature, styles, isClustered) {
        if (typeof Config === "object" && Config.wfsImgPath !== undefined) {
            this.setImagePath(Config.wfsImgPath);
        }
        else {
            console.warn("wfsImgPath at Config.js is not defined");
        }
        this.setFeature(feature);
        this.setIsClustered(isClustered);
        this.overwriteStyling(styles);
    },

    /**
    * This function returns a style for each feature.
    * @returns {ol/style} - The created style.
    */
    getStyle: function () {
        const type = this.get("type").toLowerCase(),
            isClustered = this.get("isClustered"),
            feature = this.get("feature");

        if (isClustered && feature.get("features")?.length > 1) {
            if (this.get("clusterType") === "circle") {
                return this.createCircleClusterStyle();
            }
            else if (this.get("clusterType") === "icon") {
                return this.createIconClusterStyle();
            }
        }

        if (type === "icon") {
            return this.createIconPointStyle();
        }
        else if (type === "circle") {
            return this.createCirclePointStyle();
        }
        else if (type === "nominal") {
            return this.createNominalPointStyle();
        }
        else if (type === "interval") {
            return this.createIntervalPointStyle();
        }

        return new Style();
    },

    /**
    * Creates simpleClusterStyle.
    * all clustered features get same image.
    * @returns {ol/style} - The created style.
    */
    createIconClusterStyle: function () {
        const src = this.get("imagePath") + this.get("clusterImageName"),
            isSVG = src.indexOf(".svg") > -1,
            width = this.get("clusterImageWidth"),
            height = this.get("clusterImageHeight"),
            scale = this.get("clusterImageScale"),
            offset = [parseFloat(this.get("clusterImageOffsetX")), parseFloat(this.get("clusterImageOffsetY"))];

        return new Style({
            image: new Icon({
                src: src,
                width: width,
                height: height,
                scale: scale,
                anchor: offset,
                imgSize: isSVG ? [width, height] : ""
            })
        });
    },

    /**
    * Creates circleClusterStyle.
    * all clustered features get same circle.
    * @returns {ol/style} - The created style.
    */
    createCircleClusterStyle: function () {
        const radius = parseFloat(this.get("clusterCircleRadius"), 10),
            fillcolor = this.returnColor(this.get("clusterCircleFillColor"), "rgb"),
            strokecolor = this.returnColor(this.get("clusterCircleStrokeColor"), "rgb"),
            strokewidth = parseFloat(this.get("clusterCircleStrokeWidth"), 10);

        return new Style({
            image: new CircleStyle({
                radius: radius,
                fill: new Fill({
                    color: fillcolor
                }),
                stroke: new Stroke({
                    color: strokecolor,
                    width: strokewidth
                })
            })
        });
    },

    /**
    * Returns the rotation value and its corresponding value according to style.json.
    * @param {Object} rotation - The rotation object from the style.json
    * @returns {number} - The rotation value in degrees or radiants.
    */
    getRotationValue: function (rotation) {
        if (typeof rotation === "object") {
            const {value, isDegree} = rotation;

            if (isObjectPath(value) && this.attributes.values_ !== undefined) {
                const rotationValueFromService = parseInt(prepareValue(this.attributes.values_, value), 10);

                return isDegree ? rotationValueFromService * Math.PI / 180 : rotationValueFromService;
            }
            return isDegree ? parseInt(value, 10) * Math.PI / 180 : parseInt(value, 10);
        }
        return 0;
    },

    /**
    * Creates pointStyle as icon.
    * all features get same image.
    * @returns {ol/style} - The created style.
    */
    createIconPointStyle: function () {
        const src = this.get("imagePath") + this.get("imageName"),
            isSVG = src.indexOf(".svg") > -1,
            width = this.get("imageWidth"),
            height = this.get("imageHeight"),
            scale = parseFloat(this.get("imageScale")),
            offset = [parseFloat(this.get("imageOffsetX")), parseFloat(this.get("imageOffsetY"))],
            offsetXUnit = this.get("imageOffsetXUnit"),
            offsetYUnit = this.get("imageOffsetYUnit"),
            rotation = this.getRotationValue(this.get("rotation"));

        return new Style({
            image: new Icon({
                src: src,
                width: width,
                height: height,
                scale: scale,
                anchor: offset,
                anchorXUnits: offsetXUnit,
                anchorYUnits: offsetYUnit,
                imgSize: isSVG ? [width, height] : "",
                rotation
            })
        });
    },

    /**
    * Creates circlePointStyle.
    * all features get same circle.
    * @returns {ol/style} - The created style.
    */
    createCirclePointStyle: function () {
        const radius = parseFloat(this.get("circleRadius"), 10),
            fillcolor = this.returnColor(this.get("circleFillColor"), "rgb"),
            strokecolor = this.returnColor(this.get("circleStrokeColor"), "rgb"),
            strokewidth = parseFloat(this.get("circleStrokeWidth"), 10);

        return new Style({
            image: new CircleStyle({
                radius: radius,
                fill: new Fill({
                    color: fillcolor
                }),
                stroke: new Stroke({
                    color: strokecolor,
                    width: strokewidth
                })
            })
        });
    },

    /**
     * create nominal scaled advanced style for pointFeatures
     * @return {ol.Style} style
     */
    createNominalPointStyle: function () {
        const feature = this.get("feature"),
            workingFeature = Array.isArray(feature.get("features")) ? feature.get("features")[0] : feature,
            styleScalingShape = this.get("scalingShape").toUpperCase(),
            imageName = this.get("imageName"),
            imageNameDefault = this.defaults.imageName;

        let svgPath,
            style,
            imageStyle;

        if (styleScalingShape === "CIRCLESEGMENTS") {
            svgPath = this.createNominalCircleSegments(workingFeature);
            style = this.createSVGStyle(svgPath);
        }

        // create style from svg and image
        if (imageName !== imageNameDefault) {
            imageStyle = this.createIconPointStyle();
            style = [style, imageStyle];
        }

        return style;
    },

    /**
     * create interval scaled advanced style for pointFeatures
     * @return {ol.Style} style
     */
    createIntervalPointStyle: function () {
        const feature = this.get("feature"),
            styleScalingShape = this.get("scalingShape").toUpperCase(),
            svgPath = styleScalingShape === "CIRCLE_BAR" ? this.createIntervalCircleBar(feature) : "";

        return this.createSVGStyle(svgPath);
    },

    /**
     * create Style for SVG
     * @param  {String} svgPath - contains the params to be draw
     * @return {ol.Style} style
     */
    createSVGStyle: function (svgPath) {
        const size = this.get("size");

        return new Style({
            image: new Icon({
                src: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgPath),
                imgSize: [size, size]
            })
        });
    },

    /**
    * Returns input color to destinated color.
    * possible values for dest are "rgb" and "hex".
    * color has to come as hex (e.g. "#ffffff" || "#fff") or as array (e.g [255,255,255,0]) or as String ("[255,255,255,0]")
    * @param {Number[]|String} color The color to return.
    * @param {String} dest Destination color type.
    * @returns {String|Number[]} - The converted color.
    */
    returnColor: function (color, dest) {
        let src,
            newColor = color,
            pArray = [];

        if (Array.isArray(newColor)) {
            src = "rgb";
        }
        else if (typeof newColor === "string" && newColor.indexOf("#") === 0) {
            src = "hex";
        }
        else if (typeof newColor === "string" && newColor.indexOf("#") === -1) {
            src = "rgb";

            pArray = newColor.replace("[", "").replace("]", "").replace(/ /g, "").split(",");
            newColor = [
                pArray[0], pArray[1], pArray[2], pArray[3]
            ];
        }

        if (src === "hex" && dest === "rgb") {
            newColor = this.hexToRgb(newColor);
        }
        else if (src === "rgb" && dest === "hex") {
            newColor = this.rgbToHex(newColor[0], newColor[1], newColor[2]);
        }

        newColor = dest === "rgb" ? this.normalizeRgbColor(newColor) : newColor;

        return newColor;
    },
    /**
     * Converts rgb to hex.
     * @param {Number} r Red value.
     * @param {Number} g Green Value.
     * @param {Number} b Blue value.
     * @returns {String} - Hex color string.
     */
    rgbToHex: function (r, g, b) {
        return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
    },

    /**
     * Converts number to hex string.
     * @param {Number} c Color value as number.
     * @returns {String} - Converted color number as hex string.
     */
    componentToHex: function (c) {
        const hex = c.toString(16);

        return hex.length === 1 ? "0" + hex : hex;
    },

    /**
     * Converts hex value to rgbarray.
     * @param {String} hex Color as hex string.
     * @returns {Number[]} - Color als rgb array.
     */
    hexToRgb: function (hex) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
            hexReplace = hex.replace(shorthandRegex, function (m, r, g, b) {
                return r + r + g + g + b + b;
            });
        let result;

        result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
        result = result.exec(hexReplace);

        return result ? [parseFloat(result[1], 16), parseFloat(result[2], 16), parseFloat(result[3], 16)] : null;
    },

    /**
     * Makes sure that one rgb color always consists of four values
     * @param {array} newColor Color in rgb
     * @return {array} normColor
     */
    normalizeRgbColor: function (newColor) {
        const defaultArray = [1, 1, 1, 1];

        return newColor.concat(defaultArray).slice(0, 4);
    },

    /**
     * Create a svg with colored circle segments by nominal scaling
     * @param  {ol.Feature} feature - feature to be draw
     * @return {String} svg with colored circle segments
     */
    createNominalCircleSegments: function (feature) {
        const circleSegmentsRadius = parseFloat(this.get("circleSegmentsRadius"), 10),
            circleSegmentsStrokeWidth = parseFloat(this.get("circleSegmentsStrokeWidth"), 10),
            circleSegBCArray = this.get("circleSegmentsBackgroundColor"),
            circleSegmentsFillOpacity = Array.isArray(circleSegBCArray) && circleSegBCArray[circleSegBCArray.length - 1],
            circleSegmentsBackgroundColor = this.returnColor(this.get("circleSegmentsBackgroundColor"), "hex"),
            scalingValueDefaultColor = this.returnColor(this.get("scalingValueDefaultColor"), "hex"),
            scalingValues = this.get("scalingValues"),
            scalingAttributesAsObject = this.getScalingAttributesAsObject(scalingValues),
            scalingAttribute = feature.get(this.get("scalingAttribute")),
            scalingObject = this.fillScalingAttributes(scalingAttributesAsObject, scalingAttribute),
            totalSegments = Object.values(scalingObject).reduce(function (memo, num) {
                return memo + num;
            }, 0),
            degreeSegment = totalSegments >= 0 ? 360 / totalSegments : 360,
            gap = parseFloat(this.get("circleSegmentsGap"), 10);
        let size = 10,
            startAngelDegree = 0,
            endAngelDegree = degreeSegment,
            svg,
            d,
            strokeColor,
            i,
            key,
            value;

        // calculate size
        if (((circleSegmentsRadius + circleSegmentsStrokeWidth) * 2) >= size) {
            size = size + ((circleSegmentsRadius + circleSegmentsStrokeWidth) * 2);
        }

        // is required for the display in the Internet Explorer,
        // because in addition to the SVG and the size must be specified
        this.setSize(size);

        svg = this.createSvgNominalCircleSegments(size, circleSegmentsRadius, circleSegmentsBackgroundColor, circleSegmentsStrokeWidth, circleSegmentsFillOpacity);

        for (key in scalingObject) {
            value = scalingObject[key];
            if (scalingValues !== undefined && (key !== "empty")) {
                strokeColor = this.returnColor(scalingValues[key], "hex");
            }
            else {
                strokeColor = scalingValueDefaultColor;
            }

            // create segments
            for (i = 0; i < value; i++) {

                d = this.calculateCircleSegment(startAngelDegree, endAngelDegree, circleSegmentsRadius, size, gap);

                svg = this.extendsSvgNominalCircleSegments(svg, circleSegmentsStrokeWidth, strokeColor, d);

                // set degree for next circular segment
                startAngelDegree = startAngelDegree + degreeSegment;
                endAngelDegree = endAngelDegree + degreeSegment;
            }
        }

        svg = svg + "</svg>";

        return svg;
    },

    /**
     * Fills the object with values
     * @param {object} scalingAttributesAsObject - object with possible attributes as keys and values = 0
     * @param {string} scalingAttribute - actual states from feature
     * @return {Object} scalingObject - contains the states
     */
    fillScalingAttributes: function (scalingAttributesAsObject, scalingAttribute) {
        const scalingObject = scalingAttributesAsObject === undefined || Object.keys(scalingAttributesAsObject).length === 0
            ? {empty: 0} : scalingAttributesAsObject;
        let states = scalingAttribute;

        if (states === undefined) {
            return scalingObject;
        }

        states = states.split(" | ");

        states.forEach(function (state) {
            if (Object.prototype.hasOwnProperty.call(scalingObject, state)) {
                scalingObject[state] = scalingObject[state] + 1;
            }
            else {
                scalingObject.empty = scalingObject.empty + 1;
            }
        });

        return scalingObject;
    },

    /**
     * Convert scalingAttributes to object
     * @param {object} scalingValues - contains attribute with color
     * @return {object} scalingAttribute with value 0
     */
    getScalingAttributesAsObject: function (scalingValues) {
        const obj = {};
        let key;

        if (scalingValues !== undefined) {
            for (key in scalingValues) {
                obj[key] = 0;
            }
        }

        obj.empty = 0;

        return obj;
    },

    /**
     * Create SVG for nominalscaled circle segments
     * @param  {number} size - size of the section to be drawn
     * @param  {number} circleSegmentsRadius - radius from circlesegment
     * @param  {String} circleSegmentsBackgroundColor - backgroundcolor from circlesegment
     * @param  {number} circleSegmentsStrokeWidth - strokewidth from circlesegment
     * @param  {String} circleSegmentsFillOpacity - opacity from circlesegment
     * @return {String} svg
     */
    createSvgNominalCircleSegments: function (size, circleSegmentsRadius, circleSegmentsBackgroundColor, circleSegmentsStrokeWidth, circleSegmentsFillOpacity) {
        const halfSize = size / 2;
        let svg = "<svg width='" + size + "'" +
                " height='" + size + "'" +
                " xmlns='http://www.w3.org/2000/svg'" +
                " xmlns:xlink='http://www.w3.org/1999/xlink'>";

        svg = svg + "<circle cx='" + halfSize + "'" +
            " cy='" + halfSize + "'" +
            " r='" + circleSegmentsRadius + "'" +
            " stroke='" + circleSegmentsBackgroundColor + "'" +
            " stroke-width='" + circleSegmentsStrokeWidth + "'" +
            " fill='" + circleSegmentsBackgroundColor + "'" +
            " fill-opacity='" + circleSegmentsFillOpacity + "'/>";

        return svg;
    },

    /**
     * Extends the SVG with given tags
     * @param  {String} svg - String with svg tags
     * @param  {number} circleSegmentsStrokeWidth strokewidth from circlesegment
     * @param  {String} strokeColor - strokecolor from circlesegment
     * @param  {String} d - circle segment
     * @return {String} extended svg
     */
    extendsSvgNominalCircleSegments: function (svg, circleSegmentsStrokeWidth, strokeColor, d) {
        return svg + "<path" +
            " fill='none'" +
            " stroke-width='" + circleSegmentsStrokeWidth + "'" +
            " stroke='" + strokeColor + "'" +
            " d='" + d + "'/>";
    },

    /**
     * Create circle segments
     * @param  {number} startAngelDegree - start with circle segment
     * @param  {number} endAngelDegree - finish with circle segment
     * @param  {number} circleRadius - radius from circle
     * @param  {number} size - size of the window to be draw
     * @param  {number} gap - gap between segments
     * @return {String} all circle segments
     */
    calculateCircleSegment: function (startAngelDegree, endAngelDegree, circleRadius, size, gap) {
        const rad = Math.PI / 180,
            xy = size / 2,
            isCircle = startAngelDegree === 0 && endAngelDegree === 360,
            endAngelDegreeActual = isCircle ? endAngelDegree / 2 : endAngelDegree,
            gapActual = isCircle ? 0 : gap,
            // convert angle from degree to radiant
            startAngleRad = (startAngelDegree + (gapActual / 2)) * rad,
            endAngleRad = (endAngelDegreeActual - (gapActual / 2)) * rad,
            xStart = xy + (Math.cos(startAngleRad) * circleRadius),
            yStart = xy - (Math.sin(startAngleRad) * circleRadius),
            xEnd = xy + (Math.cos(endAngleRad) * circleRadius),
            yEnd = xy - (Math.sin(endAngleRad) * circleRadius);

        if (isCircle) {
            return [
                "M", xStart, yStart,
                "A", circleRadius, circleRadius, 0, 0, 0, xEnd, yEnd,
                "A", circleRadius, circleRadius, 0, 0, 0, xStart, yStart
            ].join(" ");
        }

        return [
            "M", xStart, yStart,
            "A", circleRadius, circleRadius, 0, 0, 0, xEnd, yEnd
        ].join(" ");
    },

    /**
     * Create interval circle bar
     * @param  {ol.Feature} feature - contains features to draw
     * @return {String} svg
     */
    createIntervalCircleBar: function (feature) {
        const circleBarScalingFactor = parseFloat(this.get("circleBarScalingFactor")),
            circleBarRadius = parseFloat(this.get("circleBarRadius"), 10),
            circleBarLineStroke = parseFloat(this.get("circleBarLineStroke"), 10),
            circleBarCircleFillColor = this.returnColor(this.get("circleBarCircleFillColor"), "hex"),
            circleBarCircleStrokeColor = this.returnColor(this.get("circleBarCircleStrokeColor"), "hex"),
            circleBarCircleStrokeWidth = this.get("circleBarCircleStrokeWidth"),
            circleBarLineStrokeColor = this.returnColor(this.get("circleBarLineStrokeColor"), "hex"),
            featureProperties = feature.getProperties(),
            preparedField = this.prepareField(featureProperties, this.get("scalingAttribute")),
            scalingAttribute = preparedField === "undefined" ? undefined : preparedField,
            stateValue = scalingAttribute !== undefined && scalingAttribute.indexOf(" ") !== -1 ? scalingAttribute.split(" ")[0] : scalingAttribute,
            size = this.calculateSizeIntervalCircleBar(stateValue, circleBarScalingFactor, circleBarLineStroke, circleBarRadius),
            barLength = this.calculateLengthIntervalCircleBar(size, circleBarRadius, stateValue, circleBarScalingFactor);

        this.setSize(size);

        // create svg
        return this.createSvgIntervalCircleBar(size, barLength, circleBarCircleFillColor, circleBarCircleStrokeColor, circleBarCircleStrokeWidth, circleBarLineStrokeColor, circleBarLineStroke, circleBarRadius);
    },

    /**
     * Calculate size for intervalscaled circle bar
     * @param  {number} stateValue - value from feature
     * @param  {number} circleBarScalingFactor - factor is multiplied by the stateValue
     * @param  {number} circleBarLineStroke - stroke from bar
     * @param  {number} circleBarRadius - radius from point
     * @return {number} size - size of the section to be drawn
     */
    calculateSizeIntervalCircleBar: function (stateValue, circleBarScalingFactor, circleBarLineStroke, circleBarRadius) {
        let size = circleBarRadius * 2;

        if (((stateValue * circleBarScalingFactor) + circleBarLineStroke) >= size) {
            size = size + (stateValue * circleBarScalingFactor) + circleBarLineStroke;
        }

        return size;
    },

    /**
     * Calculate the length for the bar
     * @param  {number} size - size of the section to be drawn
     * @param  {number} circleBarRadius - radius from point
     * @param  {number} stateValue - value from feature
     * @param  {number} circleBarScalingFactor - factor is multiplied by the stateValue
     * @return {number} barLength
     */
    calculateLengthIntervalCircleBar: function (size, circleBarRadius, stateValue, circleBarScalingFactor) {
        let barLength;

        if (stateValue >= 0) {
            barLength = (size / 2) - circleBarRadius - (stateValue * circleBarScalingFactor);
        }
        else if (stateValue < 0) {
            barLength = (size / 2) + circleBarRadius - (stateValue * circleBarScalingFactor);
        }
        else {
            barLength = 0;
        }

        return barLength;
    },

    /**
     * Create SVG for intervalscaled circle bars
     * @param  {number} size - size of the section to be drawn
     * @param  {number} barLength - length from bar
     * @param  {String} circleBarCircleFillColor - fill color from circle
     * @param  {String} circleBarCircleStrokeColor - stroke color from circle
     * @param  {number} circleBarCircleStrokeWidth - stroke width from circle
     * @param  {String} circleBarLineStrokeColor - stroke color from bar
     * @param  {number} circleBarLineStroke - stroke from bar
     * @param  {number} circleBarRadius - radius from point
     * @return {String} svg
     */
    createSvgIntervalCircleBar: function (size, barLength, circleBarCircleFillColor, circleBarCircleStrokeColor, circleBarCircleStrokeWidth, circleBarLineStrokeColor, circleBarLineStroke, circleBarRadius) {
        let svg = "<svg width='" + size + "'" +
                " height='" + size + "'" +
                " xmlns='http://www.w3.org/2000/svg'" +
                " xmlns:xlink='http://www.w3.org/1999/xlink'>";

        // draw bar
        svg = svg + "<line x1='" + (size / 2) + "'" +
            " y1='" + (size / 2) + "'" +
            " x2='" + (size / 2) + "'" +
            " y2='" + barLength + "'" +
            " stroke='" + circleBarLineStrokeColor + "'" +
            " stroke-width='" + circleBarLineStroke + "' />";

        // draw circle
        svg = svg + "<circle cx='" + (size / 2) + "'" +
            " cy='" + (size / 2) + "'" +
            " r='" + circleBarRadius + "'" +
            " stroke='" + circleBarCircleStrokeColor + "'" +
            " stroke-width='" + circleBarCircleStrokeWidth + "'" +
            " fill='" + circleBarCircleFillColor + "' />";
        svg = svg + "</svg>";

        return svg;
    },

    /**
     * Setter for circleSegmentsBackgroundColor
     * @param {Number[]} value Color
     * @returns {void}
     */
    setCircleSegmentsBackgroundColor: function (value) {
        this.set("circleSegmentsBackgroundColor", value);
    },

    /**
     * Setter for size.
     * @param {*} size Size
     * @returns {void}
     */
    setSize: function (size) {
        this.set("size", size);
    },

    /**
     * Setter for imagePath.
     * @param {String} value Image path.
     * @returns {void}
     */
    setImagePath: function (value) {
        this.set("imagePath", value);
    }
});

export default PointStyleModel;
