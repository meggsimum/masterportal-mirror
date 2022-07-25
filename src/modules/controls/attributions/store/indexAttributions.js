/**
 * @typedef {Object} AttributionListItem
 * @property {String} name will be used as header
 * @property {String} text will be used as description
 * @property {String} type internally used to distinguish attribution source
 */

/**
 * Finds all models in the ModelList that have the layerAttribution parameter,
 * including children of group layers.
 * @param {Object[]} [modelList=[]] list with all models
 * @param {Object[]} [found=[]] already found models; used for recursion
 * @returns {Object[]} all models with configured layer attributions
 */
function getModelsWithLayerAttributionsFrom (modelList = [], found = []) {
    modelList.forEach(model => {
        if (model.has("layerAttribution") && model.get("layerAttribution") !== "nicht vorhanden") {
            found.push(model);
        }

        if (model.get("typ") === "GROUP") {
            getModelsWithLayerAttributionsFrom(model.get("layerSource"), found);
        }
    });

    return found;
}

/**
 * Retrieves the current layers visible in the map from the ModelList
 * and builds AttributionListItem objects from it.
 * @returns {AttributionListItem[]} ready-to-print attributions
 */
function generateLayerAttributions () {
    const activeModelsWithAttribution = getModelsWithLayerAttributionsFrom(
        Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true})
    );

    return activeModelsWithAttribution.map(model => ({
        name: model.get("name"),
        // if text is not a child node of layerAttribution, text is the node itself
        text: model.get("layerAttribution").text || model.get("layerAttribution"),
        type: "layer"
    }));
}

export default {
    namespaced: true,
    state: {
        /** @type {AttributionListItem[]} list of active attributions */
        attributionList: [],
        /** @type {?Boolean} whether the flyout is to be rendered */
        open: null
    },
    actions: {
        /**
         * Re-fetches all currently active layer attributions. Preserves attributions with type unequal to "layer".
         * @param {Object} params vuex action parameter object
         * @returns {void}
         */
        updateAttributions ({commit, getters}) {
            const nonLayerAttributions = getters.attributionList.filter(({type}) => type !== "layer");

            commit("setAttributions", [
                ...nonLayerAttributions,
                ...generateLayerAttributions()
            ]);
        },
        /**
         * Adds an attribution if no samey object is already present.
         * @param {Object} context action context
         * @param {AttributionListItem} item to be added
         * @returns {void}
         */
        addAttribution ({state, commit}, item) {
            const {attributionList} = state;

            // do not add objects considered identical
            if (!attributionList.some(
                ({name, text, type}) => name === item.name && text === item.text && type === item.type)
            ) {
                commit("setAttributions", [...attributionList, item]);
            }
        },
        /**
         * Remove item from attributionList if name, text, and type are equal.
         * @param {Object} context action context
         * @param {AttributionListItem} item to be removed
         * @returns {void}
         */
        removeAttribution ({state, commit}, item) {
            commit("setAttributions", state.attributionList.filter(
                ({name, text, type}) => name !== item.name || text !== item.text || type !== item.type
            ));
        }
    },
    mutations: {
        /**
         * Replaces current attribution array with a new one.
         * If list was cleared, attributions flyout is also closed.
         * @param {Object} state previous state
         * @param {AttributionListItem[]} attributionList new list
         * @returns {void}
         */
        setAttributions (state, attributionList) {
            if (attributionList.length === 0) {
                state.open = false;
            }
            state.attributionList = attributionList;
        },
        /**
         * Used to open/close the attributions flyout.
         * @param {Object} state previous state
         * @param {Boolean} open whether the flyout should be rendered
         * @returns {void}
         */
        setOpen (state, open) {
            state.open = open;
        }
    },
    getters: {
        /** @returns {AttributionListItem[]} currently active attributions */
        attributionList: ({attributionList}) => attributionList,
        /** @returns {?Boolean} whether the flyout is to be rendered */
        open: ({open}) => open,
        /** @returns {Boolean} whether attributions element is openable */
        openable: ({attributionList}) => attributionList.length > 0
    }
};
