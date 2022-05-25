/**
     * Filters external layers (property 'isExternal') and sorts the list.
     * If featureViaURL is contained in Config, these ids are removed from list.
     * Returns a list with reduced models, containing 'transparency', 'isVisibleInMap' and 'id'.
     *
     * @param {?ModelList} layerList List of layers.
     * @returns {Array} a list with reduced models
     */
export default function filterAndReduceLayerList (layerList) {
    const reducedLayerList = [],
        {featureViaURL} = Config,
        getIds = [];

    if (!Array.isArray(layerList)) {
        return reducedLayerList;
    }
    let filteredLayerList = layerList.filter(model => !model.get("isExternal"));

    filteredLayerList = Radio.request("Util", "sortBy", filteredLayerList, model => model.get("selectionIDX"));

    // The layer defined by the featureViaUrl module are excluded, as they are only given if the needed Url parameter is given.
    if (featureViaURL !== undefined) {
        featureViaURL.layers.forEach(layer => {
            getIds.push(layer.id);
        });
    }
    filteredLayerList = filteredLayerList?.filter(el => !getIds.includes(el.id));
    filteredLayerList?.forEach(layerModel => {
        reducedLayerList.push(Object.freeze({
            transparency: layerModel.get("transparency"),
            isVisibleInMap: layerModel.get("isVisibleInMap"),
            id: layerModel.get("id")
        }));
    });
    return reducedLayerList;
}
