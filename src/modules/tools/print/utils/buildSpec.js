import {Circle as CircleStyle, Icon} from "ol/style.js";
import {Point} from "ol/geom.js";
import {fromCircle} from "ol/geom/Polygon.js";
import Feature from "ol/Feature.js";
import {GeoJSON} from "ol/format.js";
import {Group, Image, Tile, Vector} from "ol/layer.js";
import store from "../../../../app-store/index";
import isObject from "../../../../utils/isObject";
import differenceJS from "../../../../utils/differenceJS";
import sortBy from "../../../../utils/sortBy";
import uniqueId from "../../../../utils/uniqueId";
import findWhereJs from "../../../../utils/findWhereJs";
import Geometry from "ol/geom/Geometry";
import {convertColor} from "../../../../utils/convertColor";

const BuildSpecModel = {
    defaults: {
        uniqueIdList: [],
        visibleLayerIds: null,
        layout: null,
        attributes: {
            map: null,
            title: "",
            showLegend: false,
            legend: "",
            showGfi: false,
            gfi: null,
            scale: null
        }
    },

    /**
     * Fetches the metadata object and checks if object is from own request.
     * If so it removes the unique id from the unique id list.
     * @param {Object} cswObj Object from csw parser.
     * @returns {void}
     */
    fetchedMetaData: function (cswObj) {
        if (this.isOwnMetaRequest(this.defaults.uniqueIdList, cswObj.uniqueId)) {
            this.removeUniqueIdFromList(this.defaults.uniqueIdList, cswObj.uniqueId);
            this.updateMetaData(cswObj.layerName, cswObj.parsedData);
            if (this.defaults.uniqueIdList.length === 0) {
                const printJob = {
                    index: cswObj.index,
                    payload: encodeURIComponent(JSON.stringify(this.defaults)),
                    getResponse: cswObj.getResponse
                };

                store.dispatch("Tools/Print/createPrintJob", printJob);
            }
        }
    },

    setAttributes: function (attr) {
        this.defaults.attributes = attr.attributes;
        this.defaults.layout = attr.layout;
        this.defaults.outputFilename = attr.outputFilename;
        this.defaults.outputFormat = attr.outputFormat;
    },

    /**
     * Checks if csw request belongs to this model.
     * @param {String[]} uniqueIdList List of all metaRequest-ids belonging to this model.
     * @param {String} uniqId Response unique-id from Cswparser.
     * @returns {Boolean} - Flag if csw response is from own metaRequest.
     */
    isOwnMetaRequest: function (uniqueIdList, uniqId) {
        return Array.isArray(uniqueIdList) && uniqueIdList.indexOf(uniqId) !== -1;
    },

    /**
     * Removes the uniqueId from the uniqueIdList, because the request returned something.
     * @param {String[]} uniqueIdList List of all metaRequest-ids belonging to this model.
     * @param {String} uniqId Response unique-id from Cswparser.
     * @returns {void}
     */
    removeUniqueIdFromList: function (uniqueIdList, uniqId) {
        this.setUniqueIdList(differenceJS(uniqueIdList, [uniqId]));
    },

    /**
     * Updates the metadata from the metadata response.
     * @param {String} layerName name of layer.
     * @param {Object} parsedData parsedCswData.
     * @returns {void}
     */
    updateMetaData: function (layerName, parsedData) {
        const layers = this.defaults.attributes.legend && this.defaults.attributes.legend.layers ? this.defaults.attributes.legend.layers : undefined,
            layer = findWhereJs(layers, {layerName: layerName});

        if (layer !== undefined) {
            layer.metaDate = parsedData?.date ? parsedData.date : "n.N.";
            layer.metaOwner = parsedData?.orgaOwner ? parsedData.orgaOwner : "n.N.";
            layer.metaAddress = parsedData?.address ? this.parseAddressToString(parsedData.address) : "n.N.";
            layer.metaEmail = parsedData?.email ? parsedData.email : "n.N.";
            layer.metaTel = parsedData?.tel ? parsedData.tel : "n.N.";
            layer.metaUrl = parsedData?.url ? parsedData.url : "n.N.";
        }
    },

    /**
     * Parses the address object to a string.
     * @param {Object} addressObj Address Object
     * @param {String} addressObj.street Street name.
     * @param {String} addressObj.housenr House number.
     * @param {String} addressObj.postalCode Postal Code.
     * @param {String} addressObj.city City.
     * @returns {String} - The parsed String.
     */
    parseAddressToString: function (addressObj) {
        let street,
            streetFilled = false,
            housenr,
            postalCode,
            postalCodeFilled = false,
            city,
            addressString = "";

        if (typeof addressObj === "object") {
            street = addressObj.street;
            streetFilled = this.isFilled(street);
            housenr = addressObj.housenr;
            postalCode = addressObj.postalCode;
            postalCodeFilled = this.isFilled(postalCode);
            city = addressObj.city;
        }
        if (streetFilled) {
            addressString += street;
        }
        if (this.isFilled(housenr)) {
            if (streetFilled) {
                addressString += " ";
            }
            addressString += housenr;
        }
        if (addressString !== "") {
            // newline between housenr and postalCode
            addressString += "\n ";
        }
        if (postalCodeFilled) {
            addressString += postalCode;
        }
        if (this.isFilled(city)) {
            if (postalCodeFilled) {
                addressString += " ";
            }
            addressString += city;
        }
        if (addressString.trim() === "") {
            // n.N. if addressString is empty
            addressString += "n.N.";
        }
        return addressString;
    },

    /**
     * Returns true, if the given string is not empty or undefined
     * @param {string} string to check
     * @returns {boolean} true, if string has content
     */
    isFilled: function (string) {
        return string !== undefined && string.trim() !== "";
    },


    /**
     * Defines the layers attribute of the map spec
     * @param {ol.layer.Layer[]} layerList All visible layers on the map.
     * @returns {void}
     */
    buildLayers: function (layerList) {
        const layers = [],
            attributes = this.defaults.attributes,
            currentResolution = Radio.request("MapView", "getOptions")?.resolution,
            visibleLayerIds = [];

        if (Array.isArray(layerList)) {
            layerList.forEach(layer => {
                const printLayers = [];

                if (layer instanceof Group) {
                    layer.getLayers().getArray().forEach(childLayer => {
                        printLayers.push(this.buildLayerType(childLayer, currentResolution));
                        visibleLayerIds.push(childLayer.get("id"));
                    });
                }
                else {
                    printLayers.push(this.buildLayerType(layer, currentResolution));
                }
                printLayers.forEach(printLayer => {
                    if (typeof printLayer !== "undefined") {
                        if (layer?.get("id") !== undefined) {
                            visibleLayerIds.push(layer?.get("id"));
                        }
                        layers.push(printLayer);
                    }

                });
            });
        }
        this.setVisibleLayerIds(visibleLayerIds);
        attributes.map.layers = layers.reverse();
    },

    /**
     * Sorts the features of the draw layer by z-index and returns the vector object for mapfish-print-3
     * @param {ol.layer}  layer   ol.Layer with features.
     * @param {ol.extent} extent  Extent uses to filter the feature by extent.
     * @returns {Object|undefined} - VectorObject for mapfish print.
     */
    getDrawLayerInfo: function (layer, extent) {
        const featuresInExtent = layer.getSource().getFeaturesInExtent(extent),
            features = sortBy(featuresInExtent, function (feature) {
                if (feature.getStyle() && typeof feature.getStyle === "function" && typeof feature.getStyle().getZIndex === "function") {
                    return feature.getStyle().getZIndex();
                }
                return 0;
            }),
            visibleFeatures = features.filter(feature => feature.get("isVisible"));

        if (visibleFeatures.length > 0) {
            return this.buildVector(layer, visibleFeatures);
        }

        return undefined;
    },

    /**
     * Returns information about the layer depending on the layer type.
     *
     * @param  {ol.layer} layer ol.Layer with features
     * @param {Number} currentResolution Current map resolution
     * @returns {Object} - LayerObject for MapFish print.
     */
    buildLayerType: function (layer, currentResolution) {
        const extent = Radio.request("MapView", "getCurrentExtent"),
            layerMinRes = typeof layer?.get === "function" ? layer.get("minResolution") : false,
            layerMaxRes = typeof layer?.get === "function" ? layer.get("maxResolution") : false,
            isInScaleRange = this.isInScaleRange(layerMinRes, layerMaxRes, currentResolution);
        let features = [],
            returnLayer;

        if (isInScaleRange) {
            const source = layer.getSource();

            if (layer instanceof Image) {
                returnLayer = this.buildImageWms(layer);
            }
            else if (layer instanceof Tile) {
                // The source of a TileWMS has a params object while the source of a WMTS has a layer object
                if (source?.getParams) {
                    returnLayer = this.buildTileWms(layer);
                }
                else if (source?.getLayer) {
                    returnLayer = this.buildWmts(layer, source);
                }
            }
            else if (typeof layer?.get === "function" && layer.get("name") === "import_draw_layer") {
                returnLayer = this.getDrawLayerInfo(layer, extent);
            }
            else if (layer instanceof Vector) {
                features = source.getFeaturesInExtent(extent);

                if (features.length > 0) {
                    returnLayer = this.buildVector(layer, features);
                }
            }
        }

        return returnLayer;
    },

    /**
     * Checks if layer is in the visible resolution range.
     * @param {Number} layerMinRes Maximum resolution of layer.
     * @param {Number} layerMaxRes Minimum resolution of layer.
     * @param {Number} currentResolution Current map resolution.
     * @returns {Boolean} - Flag if layer is in visible resolution.
     */
    isInScaleRange: function (layerMinRes, layerMaxRes, currentResolution) {
        let isInScale = false;

        if (layerMinRes <= currentResolution && layerMaxRes >= currentResolution) {
            isInScale = true;
        }

        return isInScale;
    },

    /**
     * Builds the information needed for MapFish to print the given WMTS Layer.
     *
     * @param {ol.layer.Tile} layer The WMTS Layer.
     * @param {ol.source.WMTS} source The source of the WMTS Layer.
     * @returns {Object} Information about the WMTS Layer.
     */
    buildWmts: (layer, source) => {
        const matrices = [],
            tileGrid = source.getTileGrid(),
            matrixIds = tileGrid.getMatrixIds(),
            {origin_, origins_, tileSize_, tileSizes_} = tileGrid;
        let baseURL = source.getUrls()[0];

        for (let i = 0; i < matrixIds.length; i++) {
            // The parameters "matrixSizes" and "scales" are not standard for a WMTS source and are added in the process of parsing the information of the layer
            matrices.push({
                identifier: matrixIds[i],
                matrixSize: source.matrixSizes[i],
                topLeftCorner: origin_ ? origin_ : origins_[i],
                scaleDenominator: source.scales[i],
                tileSize: tileSize_ ? [tileSize_, tileSize_] : [tileSizes_[i], tileSizes_[i]]
            });
        }

        if (baseURL.includes("{Style}")) {
            // As described in the MapFish Documentation (https://mapfish.github.io/mapfish-print-doc/javadoc/org/mapfish/print/map/tiled/wmts/WMTSLayerParam.html#baseURL) the parameter "style" seemingly needs to be written small.
            baseURL = baseURL.replace(/{Style}/g, "{style}");
        }

        return {
            baseURL,
            opacity: layer.getOpacity(),
            type: "WMTS",
            layer: source.getLayer(),
            style: source.getStyle(),
            imageFormat: source.getFormat(),
            matrixSet: source.getMatrixSet(),
            matrices,
            requestEncoding: source.getRequestEncoding()
        };
    },

    /**
     * returns tile wms layer information
     * @param {ol.layer.Tile} layer tile layer with tile wms source
     * @returns {Object} - wms layer spec
     */
    buildTileWms: function (layer) {
        const source = layer.getSource(),
            mapObject = {
                baseURL: source.getUrls()[0],
                opacity: layer.getOpacity(),
                type: "WMS",
                layers: source.getParams().LAYERS.split(","),
                styles: source.getParams().STYLES ? source.getParams().STYLES.split(",") : undefined,
                imageFormat: source.getParams().FORMAT,
                customParams: {
                    "TRANSPARENT": source.getParams().TRANSPARENT,
                    "DPI": store.state.Tools.Print.dpiForPdf
                }
            };

        if (Object.prototype.hasOwnProperty.call(source.getParams(), "SLD_BODY") && source.getParams().SLD_BODY !== undefined) {
            mapObject.customParams.SLD_BODY = source.getParams().SLD_BODY;
            mapObject.styles = ["style"];
        }
        return mapObject;
    },

    /**
     * Returns image wms layer information
     * @param {ol.layer.Image} layer - image layer with image wms source
     * @returns {Object} - wms layer spec
     */
    buildImageWms: function (layer) {
        const source = layer.getSource(),
            mapObject = {
                baseURL: source.getUrl(),
                opacity: layer.getOpacity(),
                type: "WMS",
                layers: source.getParams().LAYERS.split(","),
                styles: source.getParams().STYLES ? source.getParams().STYLES.split(",") : undefined,
                imageFormat: source.getParams().FORMAT,
                customParams: {
                    "TRANSPARENT": source.getParams().TRANSPARENT,
                    "DPI": store.state.Tools.Print.dpiForPdf
                }
            };

        return mapObject;
    },

    /**
     * returns vector layer information
     * @param {ol.layer.Vector} layer vector layer with vector source
     * @param {ol.feature[]} features vectorfeatures
     * @returns {object} - geojson layer spec
     */
    buildVector: function (layer, features) {
        const geojsonList = [];

        return {
            type: "geojson",
            style: this.buildStyle(layer, features, geojsonList),
            geojson: geojsonList
        };
    },

    /**
     * Generates the style for mapfish print.
     * @param {ol.layer} layer ol-Layer with features.
     * @param {ol.feature[]} features Array of features.
     * @param {Object[]} geojsonList Array of geojsons.
     * @returns {Object} - style for mapfish print.
     */
    buildStyle: function (layer, features, geojsonList) {
        const mapfishStyleObject = {
            "version": "2"
        };

        features.reverse().forEach(feature => {
            const styles = this.getFeatureStyle(feature, layer),
                styleAttributes = this.getStyleAttributes(layer, feature);

            let clonedFeature,
                stylingRules,
                stylingRulesSplit,
                styleObject,
                geometryType,
                styleGeometryFunction;

            styles.forEach((style, index) => {
                if (style !== null) {
                    clonedFeature = feature.clone();
                    styleAttributes.forEach(attribute => {
                        clonedFeature.set(attribute, (clonedFeature.get("features") ? clonedFeature.get("features")[0] : clonedFeature).get(attribute) + "_" + String(index));
                    });
                    geometryType = feature.getGeometry().getType();

                    // if style has geometryFunction, take geometry from style Function
                    styleGeometryFunction = style.getGeometryFunction();
                    if (styleGeometryFunction !== null && styleGeometryFunction !== undefined) {
                        clonedFeature.setGeometry(styleGeometryFunction(clonedFeature));
                        geometryType = styleGeometryFunction(clonedFeature).getType();
                    }
                    stylingRules = this.getStylingRules(layer, clonedFeature, styleAttributes, style)
                        .replaceAll(",", " AND ");
                    stylingRulesSplit = stylingRules
                        .replaceAll("[", "")
                        .replaceAll("]", "")
                        .replaceAll("*", "")
                        .split(" AND ")
                        .map(rule => rule.split("="));

                    if (Array.isArray(stylingRulesSplit) && stylingRulesSplit.length) {
                        this.unsetStringPropertiesOfFeature(clonedFeature,
                            stylingRulesSplit.reduce((accumulator, current) => Array.isArray(current) && current.length
                                ? [...accumulator, current[0]]
                                : accumulator,
                            [])
                        );
                    }
                    this.addFeatureToGeoJsonList(clonedFeature, geojsonList);

                    // do nothing if we already have a style object for this CQL rule
                    if (Object.prototype.hasOwnProperty.call(mapfishStyleObject, stylingRules)) {
                        return;
                    }

                    styleObject = {
                        symbolizers: []
                    };
                    if (geometryType === "Point" || geometryType === "MultiPoint") {
                        if (style.getImage() !== null || style.getText() !== null) {
                            styleObject.symbolizers.push(this.buildPointStyle(style, layer));
                        }
                    }
                    else if (geometryType === "Polygon" || geometryType === "MultiPolygon") {
                        styleObject.symbolizers.push(this.buildPolygonStyle(style, layer));
                    }
                    else if (geometryType === "Circle") {
                        styleObject.symbolizers.push(this.buildPolygonStyle(style, layer));
                    }
                    else if (geometryType === "LineString" || geometryType === "MultiLineString") {
                        styleObject.symbolizers.push(this.buildLineStringStyle(style, layer));
                    }
                    // label styling
                    if (style.getText() !== null && style.getText() !== undefined) {
                        styleObject.symbolizers.push(this.buildTextStyle(style.getText()));
                    }

                    mapfishStyleObject[stylingRules] = styleObject;
                }
            });
        });
        return mapfishStyleObject;
    },

    /**
     * Unsets all properties of type string of the given feature.
     * @param {ol.Feature} feature to unset properties of type string at
     * @param {string} notToUnset key not to unset
     * @returns {void}
     */
    unsetStringPropertiesOfFeature: function (feature, notToUnset) {
        Object.keys(feature.getProperties()).forEach(key => {
            const prop = feature.getProperties()[key];

            if (!notToUnset.includes(key) && typeof prop === "string") {
                feature.unset(key, {silent: true});
            }
        });
    },

    /**
     * Generates the point Style
     * @param {ol.style} style Style of layer.
     * @param {ol.layer} layer Ol-layer.
     * @returns {Object} - Point Style for mapfish print.
     */
    buildPointStyle: function (style, layer) {
        if (style.getImage() instanceof CircleStyle) {
            return this.buildPointStyleCircle(style.getImage());
        }
        else if (style.getImage() instanceof Icon && style.getImage().getScale() > 0) {
            return this.buildPointStyleIcon(style.getImage(), layer);
        }
        return this.buildTextStyle(style.getText());
    },

    /**
     * Generates the point Style for circle style
     * @param {ol.style} style Style of layer.
     * @returns {Object} - Circle Style for mapfish print.
     */
    buildPointStyleCircle: function (style) {
        const fillStyle = style.getFill(),
            strokeStyle = style.getStroke(),
            obj = {
                type: "point",
                pointRadius: style.getRadius()
            };

        if (fillStyle !== null) {
            this.buildFillStyle(fillStyle, obj);
            this.buildStrokeStyle(fillStyle, obj);
        }
        if (strokeStyle !== null) {
            this.buildStrokeStyle(strokeStyle, obj);
        }
        return obj;
    },

    /**
     * Generates the point Style for icons
     * @param {ol.style} style Style of layer.
     * @param {ol.layer} layer Ol-layer.
     * @returns {Object} - Icon Style for mapfish print.
     */
    buildPointStyleIcon: function (style, layer) {
        return {
            type: "point",
            graphicWidth: style.getSize()[0] ? style.getSize()[0] * style.getScale() : 60,
            graphicHeight: style.getSize()[1] ? style.getSize()[1] * style.getScale() : 60,
            externalGraphic: this.buildGraphicPath(style.getSrc()),
            graphicOpacity: layer.getOpacity()
        };
    },

    /**
     * derives the url of the image from the server the app is running on
     * if the app is running on localhost the images from test.geoportal-hamburg.de are used
     * @param {object} src the image source
     * @return {String} path or url to image directory
     */
    buildGraphicPath: function (src) {
        const origin = window.location.origin;
        let url = Config.wfsImgPath + this.getImageName(src);

        if (src.indexOf("http") === 0 && src.indexOf("localhost") === -1) {
            url = src;
        }
        else if (src.charAt(0) === "/") {
            url = origin + src;
        }
        else if (origin.indexOf("localhost") === -1) {
            // backwards-compatibility:
            url = origin + "/lgv-config/img/" + this.getImageName(src);
        }
        else if (src.indexOf("data:image/svg+xml;charset=utf-8") === 0) {
            url = src;
        }
        return url;
    },

    /**
     * Generates the text Style
     * @param {ol.style} style Style of layer.
     * @see https://openlayers.org/en/latest/apidoc/module-ol_style_Text.html
     * @returns {Object} - Text Style for mapfish print.
     */
    buildTextStyle: function (style) {
        // use openlayers kml default font, if not set
        const font = style.getFont() ? style.getFont() : "bold 16px Helvetica",
            size = this.getFontSize(font),
            isFontSizeInFont = size !== null,
            textScale = style.getScale() ? style.getScale() : 1,
            fontSize = isFontSizeInFont ? size : 10 * textScale,
            fontFamily = isFontSizeInFont ? this.getFontFamily(font, fontSize) : font,
            fontColor = style.getFill().getColor(),
            stroke = style.getStroke() ? style.getStroke() : undefined;

        return {
            type: "text",
            label: style.getText() !== undefined ? style.getText() : "",
            fontColor: convertColor(fontColor, "hex"),
            fontOpacity: fontColor[0] !== "#" ? fontColor[3] : 1,
            labelOutlineColor: stroke ? convertColor(stroke.getColor(), "hex") : undefined,
            labelOutlineWidth: stroke ? stroke.getWidth() : undefined,
            labelXOffset: style.getOffsetX(),
            labelYOffset: -style.getOffsetY(),
            fontSize: fontSize,
            fontFamily: fontFamily,
            labelAlign: this.getLabelAlign(style)
        };
    },

    /**
     * Inspects the given fontDef for family.
     * @param {String} fontDef the defined font
     * @param {String} fontSize the size incuding in the font
     * @returns {String} the font-family or an empty String if not contained
     */
    getFontFamily: function (fontDef, fontSize) {
        const index = fontDef ? fontDef.indexOf(" ", fontDef.indexOf(fontSize)) : -1;

        if (index > -1) {
            return fontDef.substring(index + 1);
        }
        return "";
    },
    /**
     * Inspects the given fontDef for numbers (=size).
     * @param {String} fontDef the defined font
     * @returns {String} the font-size or null if not contained
     */
    getFontSize: function (fontDef) {
        const size = fontDef ? fontDef.match(/\d/g) : null;

        if (Array.isArray(size) && size.length > 0) {
            return size.join("");
        }
        return null;
    },

    /**
     * gets the indicator of how to align the text with respect to the geometry.
     * this property must have 2 characters, the x-align and the y-align.
     * @param {ol.style} style Style of layer.
     * @returns {String} - placement indicator
     */
    getLabelAlign: function (style) {
        const textAlign = style.getTextAlign();

        if (textAlign === "left") {
            // left bottom
            return "lb";
        }
        else if (textAlign === "right") {
            // right bottom
            return "rb";
        }
        else if (textAlign === "center") {
            // center middle
            return "cm";
        }
        // center bottom
        return "cb";
    },

    /**
     * Generates the polygon Style
     * @param {ol.style} style Style of layer.
     * @param {ol.layer} layer Ol-layer.
     * @returns {Object} - Polygon Style for mapfish print.
     */
    buildPolygonStyle: function (style, layer) {
        const fillStyle = style.getFill(),
            strokeStyle = style.getStroke(),
            obj = {
                type: "polygon",
                fillOpacity: layer.getOpacity(),
                strokeOpacity: layer.getOpacity()
            };

        if (fillStyle !== null) {
            this.buildFillStyle(fillStyle, obj);
        }
        if (strokeStyle !== null) {
            this.buildStrokeStyle(strokeStyle, obj);
        }
        return obj;
    },


    /**
     * Generates the LineString Style
     * @param {ol.style} style Style of layer.
     * @param {ol.layer} layer Ol-layer.
     * @returns {Object} - LineString Style for mapfish print.
     */
    buildLineStringStyle: function (style, layer) {
        const strokeStyle = style.getStroke(),
            obj = {
                type: "line",
                strokeOpacity: layer.getOpacity()
            };

        if (strokeStyle !== null) {
            this.buildStrokeStyle(strokeStyle, obj);
        }
        return obj;
    },


    /**
     * Generates the Fill Style
     * @param {ol.style} style Style of layer.
     * @param {Object} obj current style object .
     * @returns {Object} - Fill Style for mapfish print.
     */
    buildFillStyle: function (style, obj) {
        let fillColor = style.getColor();

        if (typeof fillColor === "string") {
            fillColor = this.colorStringToRgbArray(fillColor);
        }

        obj.fillColor = convertColor(fillColor, "hex");
        obj.fillOpacity = fillColor[3];

        return obj;
    },

    /**
     * Checks if colorString starts with "rgb" then calls a parsing function.
     * @param {String} colorString rgb or rgba string
     * @returns {Number[] | String} - parsed rgb-string as number array
     */
    colorStringToRgbArray: function (colorString) {
        const parsedString = colorString;
        let parsedArray;

        if (parsedString.match(/^(rgb)/)) {
            parsedArray = this.rgbStringToRgbArray(parsedString);
        }
        return parsedArray;
    },

    /**
     * Parses a given rgb- or rgba-string to an numbers array.
     * @param {String} colorString rgb or rgba string
     * @returns {Number[]} - parsed rgb-string as number array
     */
    rgbStringToRgbArray: function (colorString) {
        const indexOpenBracket = colorString.indexOf("(") + 1,
            indexCloseBracket = colorString.indexOf(")"),
            length = indexCloseBracket - indexOpenBracket,
            valuesString = colorString.substr(indexOpenBracket, length),
            rgbaStringArray = valuesString.split(","),
            rgbaArray = [];

        rgbaStringArray.forEach(function (colorValue) {
            colorValue.trim();
            rgbaArray.push(parseFloat(colorValue));
        });

        return rgbaArray;
    },

    /**
     * Generates the Stroke Style
     * @param {ol.style} style Style of layer.
     * @param {Object} obj Style object for mapfish print.
     * @returns {Object} - LineString Style for mapfish print.
     */
    buildStrokeStyle: function (style, obj) {
        const strokeColor = style.getColor();

        obj.strokeColor = convertColor(strokeColor, "hex");
        if (Array.isArray(strokeColor) && strokeColor[3] !== undefined) {
            obj.strokeOpacity = strokeColor[3];
        }
        if (typeof style.getWidth === "function" && style.getWidth() !== undefined) {
            obj.strokeWidth = style.getWidth();
        }
        return obj;
    },

    /**
     * Returns the image name of the src url.
     * @param {String} imageSrc Url of image source
     * @returns {String} - Image name.
     */
    getImageName: function (imageSrc) {
        const start = imageSrc.lastIndexOf("/");

        return imageSrc.indexOf("/") !== -1 ? imageSrc.substr(start + 1) : "/" + imageSrc;
    },

    /**
     * adds the feature to the geojson list
     * @param {ol.Feature} feature - the feature can be clustered
     * @param {GeoJSON[]} geojsonList -
     * @returns {void}
     */
    addFeatureToGeoJsonList: function (feature, geojsonList) {
        let convertedFeature;

        if (feature.get("features") && feature.get("features").length === 1) {
            feature.get("features").forEach((clusteredFeature) => {
                convertedFeature = this.convertFeatureToGeoJson(clusteredFeature);

                if (convertedFeature) {
                    geojsonList.push(convertedFeature);
                }
            });
        }
        else {
            convertedFeature = this.convertFeatureToGeoJson(feature);

            if (convertedFeature) {
                geojsonList.push(convertedFeature);
            }
        }
    },

    /**
     * converts an openlayers feature to a GeoJSON feature object
     * @param {ol.Feature} feature - the feature to convert
     * @returns {object} GeoJSON object
     */
    convertFeatureToGeoJson: function (feature) {
        const clonedFeature = feature.clone(),
            geojsonFormat = new GeoJSON();
        let convertedFeature;

        // remove all object properties except geometry. Otherwise mapfish runs into an error
        Object.keys(clonedFeature.getProperties()).forEach(property => {
            if (isObject(clonedFeature.get(property)) && !(clonedFeature.get(property) instanceof Geometry)) {
                clonedFeature.unset(property);
            }
        });
        // take over id from feature because the feature id is not set in the clone.
        clonedFeature.setId(feature.getId() || feature.ol_uid);
        // circle is not suppported by geojson
        if (clonedFeature.getGeometry().getType() === "Circle") {
            clonedFeature.setGeometry(fromCircle(clonedFeature.getGeometry()));
        }

        // Removing "Datastreams" attribute because it might overload the server as happened for some sensors.
        clonedFeature.unset("Datastreams", {silent: true});

        convertedFeature = geojsonFormat.writeFeatureObject(clonedFeature);
        if (clonedFeature.getGeometry().getCoordinates().length === 0) {
            convertedFeature = undefined;
        }
        // if its a cluster remove property features
        if (convertedFeature.properties && Object.prototype.hasOwnProperty.call(convertedFeature.properties, "features")) {
            delete convertedFeature.properties.features;
        }
        return convertedFeature;
    },

    /**
     * @param {ol.Feature} feature -
     * @param {ol.layer.Vector} layer -
     * @returns {ol.style.Style[]} returns or an array of styles
     */
    getFeatureStyle: function (feature, layer) {
        let styles;

        if (feature.getStyleFunction() !== undefined) {
            try {
                styles = feature.getStyleFunction().call(feature);
            }
            catch (e) {
                styles = feature.getStyleFunction().call(this, feature);
            }
        }
        else {
            styles = layer.getStyleFunction().call(layer, feature);
        }

        return !Array.isArray(styles) ? [styles] : styles;
    },

    /**
     * Returns the rules for styling of a feature
     *
     * @param {ol.Feature} layer -
     * @param {ol.Feature} feature -
     * @param {String[]} styleAttributes The attribute by whose value the feature is styled.
     * @param {ol.style.Style} style style
     * @param {Number} styleIndex The style index.
     * @returns {string} an ECQL Expression
     */
    getStylingRules: function (layer, feature, styleAttributes, style, styleIndex) {
        const layerModel = Radio.request("ModelList", "getModelByAttributes", {id: layer.get("id")}),
            styleAttr = feature.get("styleId") ? "styleId" : styleAttributes;
        let styleModel;

        if (styleAttr.length === 1 && styleAttr[0] === "") {
            if (feature.get("features") && feature.get("features").length === 1) {
                const singleFeature = new Feature({
                    properties: feature.get("features")[0].getProperties(),
                    geometry: feature.get("features")[0].getGeometry()
                });

                feature.get("features")[0] = singleFeature;
                if (style.getImage().getSrc().indexOf("data:image/svg+xml;charset=utf-8") === 0) {
                    singleFeature.setId("first_svg_" + singleFeature.ol_uid);
                }
                else {
                    singleFeature.setId("second_png_" + singleFeature.ol_uid);
                }
                singleFeature.set(singleFeature.getId(), String(feature.get("features").length));
                return "[" + singleFeature.getId() + "='" + String(feature.get("features").length) + "']";

            }
            if (feature.get("features") !== undefined) {
                if (style !== undefined && style.getText().getText() !== undefined) {
                    feature.set("sensorClusterStyle", feature.get("features")[0].ol_uid + "_" + String(style.getText().getText()));
                    return "[sensorClusterStyle='" + feature.get("features")[0].ol_uid + "_" + String(style.getText().getText()) + "']";
                }
            }
            if (this.getFeatureStyle(feature, layer).length > 1) {
                if (style.getImage().getSrc().indexOf("data:image/svg+xml;charset=utf-8") === 0) {
                    feature.setId("first_svg_" + feature.ol_uid);
                }
                else {
                    feature.setId("second_png_" + feature.ol_uid);
                }
                Object.keys(feature.getProperties()).forEach(property => {
                    if (property === "") {
                        feature.unset(property);
                    }
                });
                feature.set(feature.getId(), String(styleIndex));
                return "[" + feature.getId() + "='" + String(styleIndex) + "']";
            }
            return "*";
        }
        // cluster feature with geometry style
        if (feature.get("features") !== undefined) {
            if ((style !== undefined && style.getText().getText() !== undefined) || feature.get("features").length > 1) {
                const value = feature.get("features")[0].get(styleAttr[0])
                    + "_"
                    + style !== undefined && style.getText().getText() !== undefined ? style.getText().getText() : "cluster";

                feature.set(styleAttr[0], value);
                return `[${styleAttr[0]}='${value}']`;

            }

            // Current feature is not clustered but a single feature in a clustered layer
            return styleAttr.reduce((acc, curr) => {
                const value = feature.get("features")[0].get(curr);

                feature.set(curr, value);
                return acc + `${curr}='${value}',`;
            }, "[").slice(0, -1) + "]";
        }
        // feature with geometry style and label style
        if (typeof layerModel?.get === "function" && Radio.request("StyleList", "returnModelById", layerModel.get("styleId")) !== undefined) {
            styleModel = Radio.request("StyleList", "returnModelById", layerModel.get("styleId"));

            if (styleModel.get("labelField") && styleModel.get("labelField").length > 0) {
                const labelField = styleModel.get("labelField");

                return styleAttr.reduce((acc, curr) => acc + `${curr}='${feature.get(curr)}' AND ${labelField}='${feature.get(labelField)}',`, "[").slice(0, -1)
                    + "]";
            }
        }
        // feature with geometry style
        if (styleAttr instanceof Array) {
            return styleAttr.reduce((acc, curr) => acc + `${curr}='${feature.get(curr)}',`, "[").slice(0, -1)
            + "]";
        }

        return "[" + styleAttr + "='" + feature.get(styleAttr) + "']";
    },

    /**
     * @param {ol.Layer} layer -
     * @param {ol.feature} feature - the feature of current layer
     * @returns {String[]} the attributes by whose value the feature is styled
     */
    getStyleAttributes: function (layer, feature) {
        const layerId = layer.get("id");
        let layerModel = Radio.request("ModelList", "getModelByAttributes", {id: layerId}),
            styleFields = ["styleId"];

        if (typeof layerModel?.get === "function") {
            const styleList = Radio.request("StyleList", "returnModelById", layerModel.get("styleId"));

            layerModel = this.getChildModelIfGroupLayer(layerModel, layerId);

            if (layerModel.get("styleId")) {
                const featureRules = styleList.getRulesForFeature(feature);

                styleFields = featureRules?.[0]?.conditions ? Object.keys(featureRules[0].conditions.properties) : [""];
            }
            else {
                styleFields = [styleList.get("styleField")];
            }
        }

        return styleFields;
    },

    /**
     * Checks if model is a Group Model.
     * If so, then the child model corresponding to layerId is returned.
     * Otherwise the model is returned
     * @param  {Backbone.Model} model Layer model from ModelList
     * @param  {String} layerId Id of layer model to return
     * @return {Backbone.Model} found layer model
     */
    getChildModelIfGroupLayer: function (model, layerId) {
        let layerModel = model;

        if (layerModel.get("typ") === "GROUP") {
            layerModel = layerModel.get("layerSource").filter(childLayer => {
                return childLayer.get("id") === layerId;
            })[0];
        }
        return layerModel;
    },
    /**
     * Gets legend from legend vue store and builds legend object for mapfish print
     * The legend is only print if the related layer is visible.
     * @param {Boolean} isLegendSelected flag if legend has to be printed
     * @param {Boolean} isMetaDataAvailable flag to print metadata
     * @param {Function} getResponse the function that calls the axios request
     * @param {Number} index The print index.
     * @param {Object} legends the available legends
     * @return {void}
     */
    buildLegend: function (isLegendSelected, isMetaDataAvailable, getResponse, index) {
        const legendObject = {},
            metaDataLayerList = [],
            legends = store.state.Legend.legends;

        if (isLegendSelected && legends.length > 0) {
            legendObject.layers = [];
            legends.forEach(legendObj => {
                if (Radio.request("ModelList", "getModelByAttributes", {id: legendObj.id}).get("children")?.length > 0) {
                    legendObj.id = Radio.request("ModelList", "getModelByAttributes", {id: legendObj.id}).get("children")[0].id;
                }

                if (this.defaults.visibleLayerIds.includes(legendObj.id)) {
                    const legendContainsPdf = this.legendContainsPdf(legendObj.legend);

                    if (isMetaDataAvailable) {
                        metaDataLayerList.push(legendObj.name);
                    }
                    if (legendContainsPdf) {
                        Radio.trigger("Alert", "alert", {
                            kategorie: "alert-info",
                            text: "<b>The layer \"" + legendObj.name + "\" contains a pre-defined Legend. " +
                                "This legens cannot be added to the print.</b><br>" +
                                "You can download the pre-defined legend from the download menu seperately."
                        });
                    }
                    else {
                        legendObject.layers.push({
                            layerName: legendObj.name,
                            values: this.prepareLegendAttributes(legendObj.legend)
                        });
                    }
                }
            });
        }
        this.setShowLegend(isLegendSelected);
        this.setLegend(legendObject);
        if (isMetaDataAvailable && metaDataLayerList.length > 0) {
            metaDataLayerList.forEach((layerName) => {
                this.getMetaData(layerName, getResponse, index);
            });
        }
        else {
            const printJob = {
                index,
                payload: encodeURIComponent(JSON.stringify(this.defaults)),
                getResponse: getResponse
            };

            store.dispatch("Tools/Print/createPrintJob", printJob);
        }
    },

    legendContainsPdf: function (legend) {
        return legend.some(legendPart => {
            let isPdf = false;

            if (typeof legendPart === "object" && !Array.isArray(legendPart.graphic)) {
                isPdf = legendPart.graphic.endsWith(".pdf");
            }
            else if (typeof legendPart === "object" && Array.isArray(legendPart.graphic)) {
                return isPdf;
            }
            else {
                isPdf = legendPart.endsWith(".pdf");
            }
            return isPdf;
        });
    },

    /**
     * Requests the metadata for given layer name
     * @param {String} layerName name of current layer
     * @param {Function} getResponse the function to start axios request
     * @param {Number} index The print index
     * @fires CswParser#RadioTriggerCswParserGetMetaData
     * @returns {void}
     */
    getMetaData: function (layerName, getResponse, index) {
        const layer = Radio.request("ModelList", "getModelByAttributes", {name: layerName}),
            metaId = layer.get("datasets") && layer.get("datasets")[0] ? layer.get("datasets")[0].md_id : null,
            uniqueIdRes = uniqueId(),
            cswObj = {};

        if (metaId !== null) {
            this.defaults.uniqueIdList.push(uniqueIdRes);
            cswObj.layerName = layerName;
            cswObj.metaId = metaId;
            cswObj.keyList = ["date", "orgaOwner", "address", "email", "tel", "url"];
            cswObj.uniqueId = uniqueIdRes;
            cswObj.layer = layer;
            cswObj.getResponse = getResponse;
            cswObj.index = index;

            store.dispatch("Tools/Print/getMetaDataForPrint", cswObj);
        }
    },

    /**
     * Prepares Attributes for legend in mapfish-print template
     * @param {Object} legend Legend of layer.
     * @returns {Object[]} - prepared legend attributes.
     */
    prepareLegendAttributes: function (legend) {
        const valuesArray = [];

        legend.forEach(legendPart => {
            const legendObj = {
                    legendType: "",
                    geometryType: "",
                    imageUrl: "",
                    color: "",
                    label: legendPart.name
                },
                graphic = typeof legendPart === "object" ? legendPart.graphic : legendPart;

            if (Array.isArray(graphic)) {
                graphic.forEach(graphicPart => {
                    if (graphicPart.indexOf("svg") !== -1) {
                        legendObj.svg = decodeURIComponent(graphicPart).split("data:image/svg+xml;charset=utf-8,")[1];
                    }
                    else {
                        legendObj.imageUrl = graphicPart;
                    }
                });
                legendObj.legendType = "svgAndPng";
            }
            else if (graphic.indexOf("data:image/svg+xml;charset=utf-8,<svg") !== -1) {
                legendObj.svg = decodeURIComponent(graphic).split("data:image/svg+xml;charset=utf-8,")[1];
                legendObj.legendType = "svg";
            }
            else if (graphic.toUpperCase().includes("GETLEGENDGRAPHIC")) {
                legendObj.legendType = "wmsGetLegendGraphic";
                legendObj.imageUrl = graphic;
            }
            else if (graphic.indexOf("<svg") !== -1) {
                legendObj.color = this.getFillColorFromSVG(graphic);
                legendObj.legendType = "geometry";
                legendObj.geometryType = "polygon";
            }
            else {
                legendObj.legendType = "wfsImage";
                legendObj.imageUrl = graphic;
            }
            if (typeof legendObj.color !== "undefined") {
                valuesArray.push(legendObj);
            }
        });
        return [].concat(...valuesArray);
    },

    /**
     * Returns Fill color from SVG as hex.
     * @param {String} svgString String of SVG.
     * @returns {String} - Fill color from SVG.
     */
    getFillColorFromSVG: function (svgString) {
        if (svgString.split(/fill:(.+)/)[1]) {
            return svgString.split(/fill:(.+)/)[1].split(/;(.+)/)[0];
        }
        return undefined;
    },

    /**
     * gets array with [GfiContent, layername, coordinates] of actual gfi
     * empty array if gfi is not active.
     * coordinates not needed, yet.
     * @param {boolean} isGfiSelected flag if gfi has to be printed
     * @param  {Array} gfiArray array
     * @return {void}
     */
    buildGfi: function (isGfiSelected, gfiArray) {
        const gfiObject = {};
        let gfiAttributes,
            layerName;

        if (isGfiSelected) {
            if (gfiArray.length > 0) {
                gfiObject.layers = [];
                gfiAttributes = gfiArray[0];
                layerName = gfiArray[1];

                gfiObject.layers.push({
                    layerName: layerName,
                    values: this.prepareGfiAttributes(gfiAttributes)
                });

            }
            this.addGfiFeature(this.defaults.attributes.map.layers, gfiArray[2]);
        }
        this.setShowGfi(isGfiSelected);
        this.setGfi(gfiObject);
    },

    /**
     * @param {Object[]} layers - layers attribute of the map spec
     * @param {number[]} coordinates - the coordinates of the gfi
     * @returns {void}
     */
    addGfiFeature: function (layers, coordinates) {
        const geojsonFormat = new GeoJSON(),
            gfiFeature = new Feature({
                geometry: new Point(coordinates),
                name: "GFI Point"
            });

        layers.splice(0, 0, {
            type: "geojson",
            geojson: [geojsonFormat.writeFeatureObject(gfiFeature)],
            style: {
                version: "2",
                "[name='GFI Point']": {
                    symbolizers: [{
                        fillOpacity: 0,
                        pointRadius: 18,
                        strokeColor: "#e10019",
                        strokeWidth: 3,
                        type: "point"
                    },
                    {
                        fillColor: "#e10019",
                        pointRadius: 4,
                        strokeOpacity: 0,
                        type: "point"
                    }]
                }
            }
        });
    },

    /**
     * parses gfiAttributes object with key value pairs into array[objects] with attributes key and value
     * @param  {Object} gfiAttributes gfi Mapping attributes
     * @return {Object[]} parsed array[objects] with key- and value attributes
     */
    prepareGfiAttributes: function (gfiAttributes) {
        const valuesArray = [];
        let key;

        for (key in gfiAttributes) {
            valuesArray.push({
                key: key,
                value: gfiAttributes[key]
            });
        }

        return valuesArray;
    },

    /**
     * Creates the scale string.
     * @param {String} scale Scale of map.
     * @returns {void}
     */
    buildScale: function (scale) {
        const scaleText = "1:" + scale;

        this.setScale(scaleText);
    },

    /**
     * Setter for Metadata
     * @param {String} value Value
     * @returns {void}
     */
    setMetadata: function (value) {
        this.defaults.attributes.metadata = value;
    },

    /**
     * Setter for showLegend
     * @param {Boolean} value Value
     * @returns {void}
     */
    setShowLegend: function (value) {
        this.defaults.attributes.showLegend = value;
    },

    /**
     * Setter for Legend
     * @param {String} value Value
     * @returns {void}
     */
    setLegend: function (value) {
        this.defaults.attributes.legend = value;
    },

    /**
     * Setter for showGfi
     * @param {Boolean} value Value
     * @returns {void}
     */
    setShowGfi: function (value) {
        this.defaults.attributes.showGfi = value;
    },

    /**
     * Setter for gfi
     * @param {String} value Value
     * @returns {void}
     */
    setGfi: function (value) {
        this.defaults.attributes.gfi = value;
    },

    /**
     * Setter for scale
     * @param {String} value Value
     * @returns {void}
     */
    setScale: function (value) {
        this.defaults.attributes.scale = value;
    },

    /**
     * Setter for uniqueIdList
     * @param {String} value Value
     * @returns {void}
     */
    setUniqueIdList: function (value) {
        this.defaults.uniqueIdList = value;
    },

    /**
     * Setter for visibleLayerIds
     * @param {String} value visibleLayerIds
     * @returns {void}
     */
    setVisibleLayerIds: function (value) {
        this.defaults.visibleLayerIds = value;
    }
};

export default BuildSpecModel;
