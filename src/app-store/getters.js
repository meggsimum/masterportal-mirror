export default {
    masterPortalVersionNumber: state => state?.masterPortalVersionNumber,
    mobile: state => state.mobile,
    dpi: state => state.dpi,
    idCounter: state => state?.idCounter,
    // configJS destructuring
    footerConfig: state => state?.configJs?.footer || null,
    loaderText: state => state?.configJs?.loaderText || "",
    scaleLineConfig: state => state?.configJs?.scaleLine || null,
    uiStyle: state => (state?.urlParams?.uiStyle || state?.configJs?.uiStyle || "DEFAULT")?.toUpperCase(),
    // gfiWindow is deprecated in the next major-release
    gfiWindow: state => state?.configJs.gfiWindow,
    ignoredKeys: state => state?.configJs.ignoredKeys || [],
    // metadata is deprecated in the next major-relase, because it is only used for proxyUrl
    metadata: state => state?.configJs.metadata || {},
    metaDataCatalogueId: state => state?.configJs?.metaDataCatalogueId || "",
    // proxyHost is deprecated in the next major-release
    proxyHost: state => state?.configJs?.proxyHost || "",
    // configJSON desctructuring
    portalTitle: state => state?.configJson?.Portalconfig?.portalTitle?.title || null,
    controlsConfig: state => state?.configJson?.Portalconfig?.controls || null,
    legendConfig: state => state?.configJson?.Portalconfig?.menu.legend || null,
    menuConfig: state => state?.configJson?.Portalconfig?.menu || null,
    portalConfig: state => state?.configJson?.Portalconfig || null,
    imagePath: state => state?.configJs.wfsImgPath || null,

    /**
     * Returns the treeType from config.json. If not defined treeType 'light' is returned.
     * @param {Object} state the store state
     * @returns {String} treeType 'light', 'default' or 'custom'
     */
    treeType: (state) => {
        if (state?.configJson?.Portalconfig?.treeType) {
            return state.configJson.Portalconfig.treeType;
        }
        return "light";
    },

    /**
     * recursively read out the menu config for tools
     * Is used to determine whether a component should be loaded
     * Does not assign Config Attributes to the module
     * @param {Object} state the store state
     * @param {Object} getters the store getters
     * @param {Object} [module=state?.configJson?.Portalconfig?.menu] the nested object used for recursion
     * @returns {Object} all tools as key: value pairs
     */
    toolsConfig: (state, getters) => (module = state?.configJson?.Portalconfig?.menu) => {
        let tools = {};

        for (const key in module) {
            let tool;

            if (module[key].type === "tool") {
                tool = {[key]: module[key]};
            }
            else if (module[key].children) {
                tool = getters.toolsConfig(module[key].children);
            }
            tools = {
                ...tools,
                ...tool
            };
        }

        return tools;
    },

    /**
     * recursively returns one tool's config by ID
     * @param {Object} state the store state
     * @param {Object} getters the store getters
     * @param {Object} [module=state?.configJson?.Portalconfig?.menu] the nested object used for recursion
     * @returns {Object} the tool config object
     */
    toolConfig: (state, getters) => (id, module = state?.configJson?.Portalconfig?.menu) => {
        let tool = module?.[id];

        for (const key in module) {
            if (tool) {
                return tool;
            }
            else if (module[key].children) {
                tool = getters.toolConfig(id, module[key].children);
            }
        }
        return tool;
    },

    /**
     * Returns a rest service from restConf by ID
     * @param {Object} state the store state
     * @returns {Object} the rest service config object
     */
    getRestServiceById: state => id => state?.restConf?.find(service => service.id === id)
};

