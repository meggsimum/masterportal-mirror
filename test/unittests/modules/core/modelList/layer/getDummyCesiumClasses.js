/**
 * @todo write jsdoc
 */
class BatchTable {
    /**
     * [constructor description]
     * @param   {[type]} properties [description]
     * @todo write jsdoc
     * @returns {void}
     */
    constructor (properties) {
        this.properties = properties;
        this.color = new Cesium.Color();
        this.show = true;
    }

    /**
     * [getPropertyNames description]
     * @todo write jsdoc
     * @returns {void}
     */
    getPropertyNames () {
        return Object.keys(this.properties);
    }

    /**
     * [getProperty description]
     * @param   {[type]} id   [description]
     * @param   {[type]} prop [description]
     * @todo write jsdoc
     * @returns {void}
     */
    getProperty (id, prop) {
        return this.properties[prop];
    }

    /**
     * [getShow description]
     * @todo write jsdoc
     * @returns {void}
     */
    getShow () {
        return this.show;
    }

    /**
     * [setShow description]
     * @param {[type]} id   [description]
     * @param {[type]} show [description]
     * @todo write jsdoc
     * @returns {void}
     */
    setShow (id, show) {
        this.show = show;
    }
}

/**
 * @todo write jsdoc
 */
class Cesium3DTileContent {
    /**
     * [constructor description]
     * @param   {[type]} feature [description]
     * @todo write jsdoc
     * @returns {void}
     */
    constructor (feature) {
        this.feature = feature;
        this.featuresLength = 1;
    }

    /**
     * [getFeature description]
     * @todo write jsdoc
     * @returns {void}
     */
    getFeature () {
        return this.feature;
    }
}

/**
 * @param {Object} properties -
 * @param {Object=} tileset -
 * @return {Cesium.Cesium3DTileFeature} -
 */
export function createDummyCesium3DTileFeature (properties = {}, tileset = {}) {
    const dummy = new Cesium.Cesium3DTileFeature(),
        content = {batchTable: new BatchTable(properties)};

    if (tileset) {
        content.tileset = tileset;
    }

    dummy._content = content;
    return dummy;
}

/**
 * @param {Object} properties -
 * @param {Object=} tileset -
 * @return {Cesium.Cesium3DTileFeature} -
 */
export function createDummyCesium3DTileContent (properties = {}, tileset = {}) {
    const feature = createDummyCesium3DTileFeature(properties, tileset),
        content = new Cesium3DTileContent(feature);

    return content;
}
