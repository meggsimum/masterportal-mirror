/** -------------------- StyleWMS -------------------- */

/**
 * @event StyleWMS#RadioTriggerStyleWMSOpenStyleWMS
 * @param {Object} model Layer model to be styled
 * @description Opens the Tool and sets the layer model. Event is triggered by clicking on the glyphicon in the layer tree.
 * @example Radio.trigger("StyleWMS", "openStyleWMS", model)
 */

/**
 * @event StyleWMS#changeModel
 * @description Triggered when layer model to style changes
 */

/**
 * @event StyleWMS#changeIsActive
 * @description Triggered when stylewms model gets activated
 */

/**
 * @event StyleWMS#changeAttributeName
 * @description Triggered when attributeName changes
 */

/**
 * @event StyleWMS#changeNumberOfClasses
 * @description Triggered when numberOfClasses changes
 */

/**
 * @event StyleWMS#changeSetSld
 * @description Triggered when setSLD changes
 */

/**
 * @event StyleWms#sync
 * @description Triggered when setSLD changes
 */

/** -------------------- StyleVT -------------------- */

/**
 * @event StyleVT#RadioTriggerStyleVTOpenStyleVT
 * @param {Object} model Layer model to be styled
 * @description Opens the Tool and sets the layer model. Event is triggered by clicking on the glyphicon in the layer tree.
 * @example Radio.trigger("StyleVT", "open", model)
 */

/**
 * @event StyleVT#changeIsActive
 * @description Triggered when stylevt model gets (de-)activated
 */

/**
 * @event StyleVT#changeModel
 * @description Triggered when selected layer model is changed
 */

/**
 * @event StyleVT#changeCurrentLng
 * @description Triggered when current language is changed
 */

/**
 * @event StyleVT#changeVectorTileLayerList
 * @description Triggered when available layer set is changed
 */

/** -------------------- SIDEBAR -------------------- */

/**
 * @event Sidebar#changeIsVisible
 * @param {Backbone/Model} model The model whose attribute hat changed.
 * @param {Boolean} value The attribute value that has changed.
 * @description Triggered when Model attribute "isVisible" has changed.
 */

/**
 * @event Sidebar#changeIsMobile
 * @param {Backbone/Model} model The model whose attribute hat changed.
 * @param {Boolean} value The attribute value that has changed.
 * @description Triggered when Model attribute "isMobile" has changed.
 */

/**
 * @event Sidebar#addContent
 * @param {DOM} element The dom element that has to be added to the sidebar.
 * @description Triggered by Model when new content is available.
 */

 /**
 * @event Sidebar#setWidth
 * @param {String} width Width of sidebar.
 * @description Triggered by Model when sidebar is toggled.
 */

/**
 * @event Sidebar#RadioTriggerSidebarToggle
 * @param {Boolean} isVisible Flag if sidebar is now visible or not.
 * @param {String} [width="30%"] The width of the sidebar.
 * @description Triggered by ToolModel that renders in sidebar.
 * @example Radio.trigger("Sidebar", "toggle", isVisible, width)
 */
/**
 * @event Sidebar#RadioTriggerSidebarAppend
 * @param {HTML} element The Element that has to be rendered in sidebar.
 * @description Triggered by ToolModel that renders in sidebar.
 * @example Radio.trigger("Sidebar", "append", element)
 */

/** -------------------- ALERTING -------------------- */

/**
 * @event Alerting#changePosition
 * @param {Backbone/Model} model The model whose attribute hat changed.
 * @param {Boolean} value The attribute value that has changed.
 * @description Triggered when Model attribute position has changed.
 */

/**
 * @event Alerting#render
 * @description Triggered when View has to render.
 * @example this.trigger("render")
 */

/**
 * @event Alerting#RadioTriggerAlertAlert
 * @param {String/Object} alert The alert object or string needed to create the alert.
 * @example Radio.trigger("Alert", "alert", alert)
 */

/**
 * @event Alerting#RadioTriggerAlertAlertRemove
 * @example Radio.trigger("Alert", "alert:remove")
 */

/**
 * @event Alerting#RadioTriggerAlertClosed
 * @param {String} id The id of the alert that has been closed.
 * @example Radio.trigger("Alert", "closed", id)
 */

/**
 * @event Alerting#RadioTriggerAlertConfirmed
 * @param {String} id The id of the alert that has been confirmed.
 * @example Radio.trigger("Alert", "confirmed", id)
 */


/** -------------------- LEGEND COMPONENT-------------------- */

/**
 * @event LegendComponent#RadioTriggerLegendComponentUpdateLegend
 * @example Radio.trigger("LegendComponent", "updateLegend")
 */


/** -------------------- PARSER -------------------- */

/**
 * @event Core.ConfigLoader#RadioTriggerRemoveItem
 * @example Radio.trigger("Parser", "removeItem")
 * @description Event that removes an item from the layertree
 */

/**
 * @event Core.ConfigLoader#RadioRequestParserGetItemsByAttributes
 * @param {object} attributes The Object that contains the attributes
 * @returns {Item[]} - Layer/Tool/Folder/control
 * @example Radio.request("Parser", "getItemsByAttributes", attributes)
 */
/**
 * @event Core.ConfigLoader#RadioRequestParserGetItemByAttributes
 * @param {object} attributes The Object that contains the attributes
 * @returns {Item[]} - Layer/Tool/Folder/control
 * @example Radio.request("Parser", "getItemByAttributes", attributes)
 */
/**
 * @event Core.ConfigLoader#RadioRequestParserGetTreeType
 * @returns {string} tree type from config.js file
 * @example Radio.request("Parser", "getTreeType")
 */
/**
 * @event Core.ConfigLoader#RadioRequestParserGetCategory
 * @returns {*} todo
 * @example Radio.request("Parser", "getCategory")
 */
/**
 * @event Core.ConfigLoader#RadioRequestParserGetCategories
 * @returns {*} todo
 * @example Radio.request("Parser", "getCategories")
 */

/**
 * @event Core.ConfigLoader#RadioRequestParserSetCategory
 * @returns {*} todo
 * @example Radio.request("Parser", "setCategory")
 */

/**
 * @event Core.ConfigLoader#RadioRequestParserGetPortalConfig
 * @returns {*} todo
 * @example Radio.request("Parser", "getPortalConfig")
 */

/**
 * @event Core.ConfigLoader#RadioRequestParserGetItemsByMetaID
 * @param {*} metaID - todo
 * @returns {*} todo
 * @example Radio.request("Parser", "getItemsByMetaID", metaID)
 */

/**
 * @event Core.ConfigLoader#RadioRequestParserGetSnippetInfos
 * @returns {*} todo
 * @example Radio.request("Parser", "getSnippetInfos")
 */

/**
 * @event Core.ConfigLoader#RadioRequestParserGetInitVisibBaselayer
 * @returns {*} todo
 * @example Radio.request("Parser", "getInitVisibBaselayer")
 */

/**
 * @event Core.ConfigLoader#RadioTriggerParsersetCategory
 * @param {*} value -todo
 * @example Radio.trigger("Parser", "setCategory", value)
 */

/**
 * @event Core.ConfigLoader#RadioTriggerParserAddItem
 * @param {Object} obj - Item
 * @example Radio.trigger("Parser", "addItem", obj)
 */
/**
 * @event Core.ConfigLoader#RadioTriggerParserAddItemAtTop
 * @param {Object} obj - Item
 * @example Radio.trigger("Parser", "addItemAtTop", obj)
 */

/**
 * @event Core.ConfigLoader#RadioTriggerParserAddItems
 * @param {array} objs Array of related objects, e.g. categories in Themenbaum
 * @param {object} attr Layerobject
 * @example Radio.trigger("Parser", "addItems", objs, attr)
 */

/**
 * @event Core.ConfigLoader#RadioTriggerParserAddFolder
 * @param {*} name - todo
 * @param {*} id - todo
 * @param {*} parentId - todo
 * @param {*} level - todo
 * @param {*} isExpanded - todo
 * @example Radio.trigger("Parser", "addFolder", name, id, parentId, level, isExpanded)
 */

/**
 * @event Core.ConfigLoader#RadioTriggerParserAddLayer
 * @param {*} name - todo
 * @param {*} id - todo
 * @param {*} parentId - todo
 * @param {*} level - todo
 * @param {*} layers - todo
 * @param {*} url - todo
 * @param {*} version - todo
 * @param {object} [optionalParameters] Object of optional parameters to be set for the Layer. Empty object required if no opional parameters set.
 * @param {boolean} [optionalParameters.transparent = true] Whether the given layer is transparent.
 * @param {boolean} [optionalParameters.isSelected = false] Whether the given layer is selected .
 * @param {(boolean/object)} [optionalParameters.time = false] If set to `true` or and Object, the configured Layer is expected to be a WMS-T.
 * @returns {void}
 * @example Radio.trigger("Parser", "addLayer", name, id, parentId, level, layers, url, version, transparent, isSelected, time)
 */

/**
 * @event Core.ConfigLoader#RadioTriggerParserAddGDILayer
 * @param {Object} values - includes {name, id, parentId, level, layers, url, version, gfiAttributes, datasets, isJustAdded}
 * @example Radio.trigger("Parser", "addGDILayer", values)
 */

 /**
 * @event Core.ConfigLoader#RadioTriggerParserAddGeoJSONLayer
 * @param {String} layerName - The name of the layer (can be selected alphanumerically)
 * @param {String} layerId - The Id of the layers (can be selected alphanumerically, but should be unique)
 * @param {String} geojson - A valid GeoJson. If no crs is defined in the Json, EPSG:4326 is assumed..
 * @example Radio.trigger("Parser", "addGeoJSONLayer", name, id, geojson)
 */

/**
 * @event Core.ConfigLoader#RadioTriggerParseraddVectorLayer
 * @param {String} layerName - The name of the layer (can be selected alphanumerically)
 * @param {String} layerId - The Id of the layers (can be selected alphanumerically, but should be unique)
 * @param {ol.Feature[]} features - all features generated from the imported file
 * @param {String} [parentId] Id for the correct position of the layer in the layertree.
 * @param {String} [styleId] Id for the styling of the features; should correspond to a style from the style.json.
 * @param {(String | Object)} [gfiAttributes="ignore"] Attributes to be shown when clicking on the feature using the GFI tool.
 * @example Radio.trigger("Parser", "addVectorLayer", name, id, features, parentId, styleId, gfiAttributes)
 */

/**
 * @event Core.ConfigLoader#RadioTriggerParserRemoveItem
 * @description Event that removes an item from the layertree
 * @param {String} id - id from item that be removed
 * @example Radio.trigger("Parser", "removeItem", id)
 */

/**
 * @event Core.ConfigLoader#ChangeCategory
 * @description todo
 */


/** --------------------CONTACT -------------------- */

/**
 * @event ContactModel#changeIsActive
 * @description Is fired when attribute isActive changes
 */

/**
 * @event ContactModel#changeInvalid
 * @description Is fired when attribute isActive changes
 */


/** -------------------- REST READER -------------------- */

/**
 * @event RestReader#RadioRequestRestReaderGetServiceById
 * @param {String} id Id of RestService
 * @example Radio.trigger("RestReader", "getServiceById", id)
 * @description Event that returns the config.json of the portal
 */

/** -------------------- LAYER -------------------- */

/**
 * @event Layer#changeIsSelected
 * @param {Backbone.Model} model The model whose attribute hat changed.
 * @param {Boolean} value The attribute value that has changed.
 * @description Fired if attribute isSelected has changed
 */

/**
 * @event Layer#changeIsVisibleInMap
 * @param {Backbone.Model} model The model whose attribute hat changed.
 * @param {Boolean} value The attribute value that has changed.
 * @description Fired if attribute isVisibleInMap has changed
 */

/**
 * @event Layer#changeTransparency
 * @param {Backbone.Model} model The model whose attribute hat changed.
 * @param {Boolean} value The attribute value that has changed.
 * @description Fired if attribute transparency has changed
 */

/**
 * @event Layer#changeIsSettingVisible
 * @param {Backbone.Model} model The model whose attribute hat changed.
 * @param {Boolean} value The attribute value that has changed.
 * @description Fired if attribute isSettingVisible has changed
 */

/**
 * @event Layer#changeIsVisibleInTree
 * @param {Backbone.Model} model The model whose attribute hat changed.
 * @param {Boolean} value The attribute value that has changed.
 * @description Fired if attribute isVisibleInTree has changed
 */

/**
 * @event Layer#changeIsOutOfRange
 * @param {Backbone.Model} model The model whose attribute hat changed.
 * @param {Boolean} value The attribute value that has changed.
 * @description Fired if attribute isOutOfRange has changed
 */

/**
 * @event Layer#RadioTriggerLayerSetLayerInfoChecked
 * @param {Boolean} value Flag that signs that the layer informations has been checked.
 * @example Radio.trigger("Layer", "setLayerInfoChecked", value)
 */

/**
 * @event Layer#RadioTriggerVectorLayerFeaturesLoaded
 * @param {String} id Id of vector layer.
 * @param {ol/Feature[]} features Features that have been loaded.
 * @example Radio.trigger("VectorLayer", "featuresLoaded", id, features)
 */

 /**
 * @event Layer#RadioTriggerVectorLayerFeatureUpdated
 * @param {String} id Id of vector layer.
 * @param {ol/Feature[]} features Features that have been loaded.
 * @example Radio.trigger("VectorLayer", "featureUpdated", id, features)
 */

/**
 * @event Layer#RadioTriggerVectorLayerResetFeatures
 * @description Triggers an event with the features that are shown. Used for updates in heatmap after filter.
 * @param {String} id Id of vector layer.
 * @param {ol/Feature[]} features Features that are visible.
 * @example Radio.trigger("VectorLayer", "resetFeatures", id, features)
 */

 /**
 * @event Layer#RadioRequestVectorLayerGetFeatures
 * @param {String} id Id of vector layer.
 * @example Radio.request("VectorLayer", "getFeatures", id)
 */

/** -------------------- MAP VIEW -------------------- */

/**
 * @event Core#RadioTriggerMapViewChangedOptions
 * @param {Object} options Options of mapview status
 * @description Event that gets fired when the map view options have changed. The options are scale, center, zoomLevel
 * @example Radio.trigger("MapView", "changedOptions", options)
 */

/**
 * @event Core#RadioRequestMapViewGetOptions
 * @description Event that gets the map view options. The options are scale, center, zoomLevel
 * @example Radio.Request("MapView", "getOptions")
 */

/**
 * @event Core#RadioRequestMapViewGetCenter
 * @description Event that gets the center of the map view
 * @example Radio.Request("MapView", "getCenter")
 */

/**
 * @event Core#RadioRequestMapViewGetResolutionByScale
 * @param {String} scale Options of mapview status
 * @description Event that gets the resolution depending on the map scale
 * @example Radio.trigger("MapView", "getResolutionByScale", scale)
 */

/**
 * @event Core#RadioRequestMapViewGetProjection
 * @description Event that returns the map projection
 * @returns {object} Projection of type ol/proj
 * @example Radio.request("MapView", "getProjection");
 */

/**
 * @event Core#RadioTriggerMapViewSetScale
 * @description Event that sets the scale of the map view
 * @example Radio.trigger("MapView", "setScale", model)
 */

/**
 * @event Core#RadioTriggerMapViewSetCenter
 * @description Event that sets the center of the map view
 * @example Radio.trigger("MapView", "setCenter", model)
 */

/**
 * @event Core#RadioTriggerMapViewSetZoomLevelUp
 * @description Event that sets the zoom-level one counter up
 * @example Radio.trigger("MapView", "setZoomLevelUp");
 */

/**
 * @event Core#RadioTriggerMapViewSetZoomLevelDown
 * @description Event that sets the zoom-level one counter down
 * @example Radio.trigger("MapView", "setZoomLevelDown");
 */

/**
 * @event Core#RadioTriggerMapViewResetView
 * @description Resets the map view
 * @example Radio.trigger("MapView", "resetVIew");
 */

/**
 * @event Core#RadioRequestMapViewGetResolutions
 * @returns {object[]} - Returns the resolutions of the map
 * @example Radio.trigger("MapView", "getResolutions");
 */

/**
 * @event Core#RadioTriggerMapViewToggleBackground
 * @description todo
 */

/**
 * @event Core#RadioRequestMapViewGetCurrentExtent
 * @description todo
 */

/**
 * @event Core#RadioRequestMapViewGetProjection
 * @description todo
 */

/**
 * @event Core#RadioRequestMapViewGetScales
 * @description Event gets the scale
 */

/**
 * @event Core#RadioRequestMapViewGetZoomLevel
 * @description Event gets the zoom-level
 */

/**
 * @event Core#RadioTriggerMapViewChangedCenter
 * @description todo
 */

/**
 * @event Core#RadioTriggerMapViewChangedZoomLevel
 * @description todo
 */

/** -------------------- OBLIQUE MAP-------------------- */

/**
 * @event Core#RadioTriggerObliqueMapRegisterLayer
 * @param {ObliqueLayer} layer ObliqueLayer.
 * @example Radio.trigger("ObliqueMap", "registerLayer", layer)
 */

/**
 * @event Core#RadioRequestObliqueMapIsActive
 * @returns {Boolean} - Flag if ObliqueMap is active.
 * @example Radio.request("ObliqueMap", "isActive")
 */

/**
 * @event Core#RadioTriggerObliqueMapIsActivated
 * @returns {Boolean} - Flag if ObliqueMap is activated.
 * @example Radio.Trigger("ObliqueMap", "isActivated")
 */

/**
 * @event Core#RadioTriggerObliqueMapActivateLayer
 * @param {ObliqueLayer} layer ObliqueLayer.
 * @example Radio.trigger("ObliqueMap", "activateLayer", layer)
 */

/**
 * @event Core#RadioTriggerObliqueMapDeactivate
 * @param {Boolean} - Flag if ObliqueMap is Deactivated
 * @example Radio.trigger("ObliqueMap", "deactivate")
 */

/**
 * @event Core#RadioTriggerObliqueMapActivate
 * @param {Boolean} - Flag if ObliqueMap is activated
 * @example Radio.trigger("ObliqueMap", "activate")
 */
/** -------------------- MODEL LIST -------------------- */

/**
 * @event Core.ModelList#RadioRequestModelListGetCollection
 * @description Returns itself
 * @example Radio.request("ModelList", "getCollection")
 */

/**
 * @event Core.ModelList#RadioRequestModelListGetModelsByAttributes
 * @param {Object} attributes Attributes used to find models to be returned
 * @description Returns the models that match the given attributes in an array, if none found the array is empty
 * @example Radio.request("ModelList", "getModelsByAttributes", attributes)
 */

/**
 * @event Core.ModelList#RadioRequestModelListGetModelByAttributes
 * @param {Object} attributes Attributes used to find model to be returned
 * @description Returns the first model that matches the given attributes. If model cannot be found, the function look for a group layer model containing the attributes
 * @example Radio.request("ModelList", "getModelByAttributes", attributes)
 */

/**
 * @event Core.ModelList#RadioTriggerModelListSetModelAttributesById
 * @description See {@link List#setModelAttributesById}
 * @example Radio.trigger("ModelList", "setModelAttributesById", id, attrs)
 */

/**
 * @event Core.ModelList#RadioTriggerModelListShowAllFeatures
 * @description See {@link List#showAllFeatures}
 * @example Radio.trigger("ModelList", "showAllFeatures", id)
 */

/**
 * @event Core.ModelList#RadioTriggerModelListHideAllFeatures
 * @description See {@link List#hideAllFeatures}
 * @example Radio.trigger("ModelList", "hideAllFeatures", id)
 */

/**
 * @event Core.ModelList#RadioTriggerModelListShowFeaturesById
 * @description See {@link List#showFeaturesById}
 * @example Radio.trigger("ModelList", "showFeaturesById", id, featureIds)
 */

/**
 * @event Core.ModelList#RadioTriggerModelListRemoveModelsByParentId
 * @description See {@link List#removeModelsByParentId}
 * @example Radio.trigger("ModelList", "removeModelsByParentId", parentId)
 */

/**
 * @event Core.ModelList#RadioTriggerModelListRemoveModelsById
 * @description See {@link List#removeModelsById}
 * @example Radio.trigger("ModelList", "removeModelsByParentId", id)
 */

/**
 * @event Core.ModelList#RadioTriggerModelListAddInitiallyNeededModels
 * @description See {@link List#addInitiallyNeededModels}
 * @example Radio.trigger("ModelList", "addInitiallyNeededModels")
 */

/**
 * @event Core.ModelList#RadioTriggerModelListAddModelsByAttributes
 * @description See {@link List#addModelsByAttributes}
 * @example Radio.trigger("ModelList", "addModelsByAttributes", attrs)
 */

/**
 * @event Core.ModelList#RadioTriggerModelListAddModelByAttributes
 * @description See {@link List#getModelsByAttributes}
 * @example Radio.trigger("ModelList", "getModelsByAttributes", attrs)
 */

/**
 * @event Core.ModelList#RadioTriggerModelListReplaceModelById
 * @description See {@link List#replaceModelById}
 * @example Radio.trigger("ModelList", "replaceModelById", id, model)
 */

/**
 * @event Core.ModelList#RadioTriggerModelListSetIsSelectedOnChildLayers
 * @description See {@link List#setIsSelectedOnChildLayers}
 * @example Radio.trigger("ModelList", "setIsSelectedOnChildLayers", model)
 */

/**
 * @event Core.ModelList#RadioTriggerModelListSetIsSelectedOnParent
 * @description See {@link List#setIsSelectedOnParent}
 * @example Radio.trigger("ModelList", "setIsSelectedOnParent", model)
 */

/**
 * @event Core.ModelList#RadioTriggerModelListShowModelInTree
 * @description See {@link List#showModelInTree}
 * @example Radio.trigger("ModelList", "showModelInTree", modelId)
 */

/**
 * @event Core.ModelList#RadioTriggerModelListCloseAllExpandedFolder
 * @description See {@link List#closeAllExpandedFolder}
 * @example Radio.trigger("ModelList", "closeAllExpandedFolder")
 */

/**
 * @event Core.ModelList#RadioTriggerModelListSetAllDescendantsInvisible
 * @description See {@link List#setAllDescendantsInvisible}
 * @example Radio.trigger("ModelList", "setAllDescendantsInvisible", parentId, isMobile)
 */

/**
 * @event Core.ModelList#RadioTriggerModelListRenderTree
 * @example Radio.trigger("ModelList", "renderTree")
 */

/**
 * @event Core.ModelList#RenderTree
 * @description Triggers "renderTree"
 * @example this.trigger("renderTree")
 */

/**
 * @event Core.ModelList#RadioTriggerModelListToggleWfsCluster
 * @description See {@link List#toggleWfsCluster}
 * @example Radio.trigger("ModelList", "toggleWfsCluster", value)
 */

/**
 * @event Core.ModelList#RadioTriggerModelListToggleDefaultTool
 * @description See {@link List#toggleDefaultTool}
 * @example Radio.trigger("ModelList", "toggleDefaultTool")
 */

/**
* @event Core.ModelList#RadioTriggerModelListRefreshLightTree
* @description Refreshes the light tree.
* @example Radio.trigger("ModelList", "refreshLightTree")
*/

/**
 * @event Core.ModelList#RadioTriggerModelListUpdateVisibleInMapList
 * @description Triggered when one item has a change in the attribute isVisibleInMap
 */

/**
 * @event Core.ModelList#ChangeIsExpanded
 * @description Triggered when one item has a change in the attribute isExpaned
 */

/**
 * @event Core.ModelList#ChangeIsSelected
 * @description Triggered when one item has a change in the attribute IsSelected
 */

/**
 * @event Core.ModelList#ChangeTransparency
 * @description Triggered when one item has a change in the attribute transparency
 */

/**
 * @event Core.ModelList#ChangeSelectionIDX
 * @description Triggered when one item has a change in the attribute selectionIDX
 */

/**
 * @event Core.ModelList#UpdateSelection
 * @description Triggered when selection was updated
 * @example this.trigger("updateSelection", model)
 */

/**
 * @event Core.ModelList#UpdateLightTree
 * @description Triggered when light tree was updated
 * @example this.trigger("updateLightTree")
 */

/**
 * @event Core.ModelList#ChangeSelectedList
 * @description Triggered when selected list has changed
 */

/**
 * @event Core.ModelList#TraverseTree
 * @description Used for mobile
 * @example this.trigger("traverseTree")
 */

/**
 * @event Core.ModelList#RadioTriggerModelListUpdateVisibleInMapList
 * @example Radio.trigger("ModelList", "updateVisibleInMapList")
 */

/**
 * @event Core.ModelList#RadioTriggerModelListUpdatedSelectedLayerList
 * @example Radio.trigger("ModelList", "updatedSelectedLayerList")
 */

/**
 * @event Core.ModelList#UpdateOverlayerView
 * @example this.trigger("updateOverlayerView", id)
 */


/** -------------------- CONTROLS.ATTRIBUTIONS ----------------- */

/**
 * @event Controls.Attributions#RadioTriggerAttributionsRenderAttributions
 * @description Triggers rerender of attributions module
 * @example this.trigger("Attributions", "renderAttributions");
 */

/**
 * @event Controls.Attributions#RadioTriggerAttributionsRenderAttributions
 * @description Triggers rerender of attributions module
 * @example this.trigger("Attributions", "renderAttributions");
 */

/**
 * @event Controls.Attributions#RadioTriggerAttributionsCreateAttribution
 * @description todo
 * @example this.trigger("Attributions", "createAttribution");
 */
/**
 * @event Controls.Attributions#RadioTriggerAttributionsRemoveAttribution
 * @description todo
 * @example this.trigger("Attributions", "removeAttribution");
 */

/**
 * @event Controls.Attributions#changeIsContentVisible
 * @description Event for a changing property
 */

/**
 * @event Controls.Attributions#changeAttributionList
 * @description Event for a changing property
 */

/**
 * @event Controls.Attributions#changeIsVisibleInMap
 * @description Event for a changing property
 */

/**
 * @event Controls.Attributions#renderAttributions
 * @description Event for a changing property
 */

/** -------------------- SEARCHBAR -------------------- */

/**
 * @event Searchbar#renderRecommendedList
 * @description is triggered by SearchbarModel
 */

/**
 * @event Searchbar#RadioTriggerSearchbarDeleteSearchString
 * @description is triggered by SearchbarModel
 * @example Radio.trigger("Searchbar", "deleteSearchString");
 */

/**
 * @event Searchbar#RadioTriggerSearchbarSetFocus
 * @description is triggered by SearchbarModel
 * @example Radio.trigger("Searchbar", "setFocus");
 */

/**
 * @event Searchbar#RadioTriggerViewZoomHitSelected
 * @description is triggered by HitSelected
 * @example Radio.trigger("ViewZoom", "hitSelected");
 */

/**
 * @event Searchbar#RadioTriggerSearchbarSearchAll
 * @description trigger searchString to Searchbar
 * @param {String} searchString contains the string to search
 * @example Radio.trigger("Searchbar", "searchAll", searchString);
 */

/**
 * @event Searchbar#RadioTriggerSearchbarSearch
 * @description trigger searchString to Searchbar
 * @param {String} searchString contains the string to search
 * @example Radio.trigger("Searchbar", "search", searchString);
 */

/**
 * @event Searchbar#RadioTriggerSearchbarPushHits
 * @description trigger transfer of search hits as a list
 * @param {String} sListname Name of list
 * @param {Object[]} aHitListArray an array of object{id, name, type} with optional values: coordinate, glyphicon, geom, adress, locationFinder, metaName, osm, marker, geometryType
 * @example Radio.trigger("Searchbar", "pushHits", "hitList", aHitListArray);
 */

/**
 * @event Searchbar#RadioTriggerSearchbarCreateRecommendedList
 * @description todo
 * @param {String} todo todo
 * @example Radio.trigger("Searchbar", "createRecommendedList", "visibleVector");
 */

/**
 * @event Searchbar#RadioTriggerSearchbarRemoveHits
 * @description todo
 * @param {String} todo todo
 * @example Radio.trigger("Searchbar", "createRecommendedList", "visibleVector");
 */

/**
 * @event Searchbar#RadioTriggerSearchbarHit
 * @description triggers the hit
 * @param {String} hit contains the hit
 * @example Radio.trigger("Searchbar", "hit", hit);
 */

/**
 * @event Searchbar#RadioTriggerSearchbarAbortSearch
 * @description todo
 */


/** -------------------- MENU -------------------- */

/**
 * @event Menu#RadioTriggerTableMenuHideMenuElementSearchbar
 * @description is triggered by TableMenu
 * @example Radio.trigger("TableMenu", "hideMenuElementSearchbar")
 */

/**
 * @event Menu#RadioTriggerMenuLoaderReady
 * @description is triggered by MenuLoader
 * @param {String} parentElementId id from parent
 * @example Radio.trigger("MenuLoader", "ready", parentElementId)
 */

/**
 * @event Menu#RadioTriggerTableMenuDeactivateCloseClickFrame
 * @description foobar
 * @example Radio.trigger("TableMenu", "deactivateCloseClickFrame");
 */

/** -------------------- FOLDER VIEW TREE -------------------- */
/**
 * @event FolderViewTree#changeIsSelected
 * @description todo
 */

/**
 * @event FolderViewTree#isVisibleInTree
 * @description todo
 */

/**
 * @event FolderViewTree#changeIsSelected
 * @description todo
 */

/**
 * @event FolderViewTree#changeIsExpanded
 * @description todo
 */

/**
 * @event FolderViewTree#toggleIsExpanded
 * @description todo
 */

/**
 * @event FolderViewTree#toggleIsSelected
 * @description todo
 */

/** -------------------- MENU.DESKTOP.FOLDER -------------------- */

/**
 * @event Menu.Desktop.Folder#changeIsExpanded
 * @description todo
 */

/**
 * @event Menu.Desktop.Folder#isVisibleInTree
 * @description todo
 */

/**
 * @event Menu.Desktop.Folder#toggleIsExpanded
 * @description todo
 */

/**
 * @event Menu.Desktop.Folder#setSelection
 * @description todo
 */

/**
 * @event Menu.Desktop.Folder#toggleBackground
 * @description todo
 */

/**
 * @event Menu.Desktop.Folder#unfixTree
 * @description todo
 */

/**
 * @event Menu.Desktop.Folder#fixTree
 * @description todo
 */


/** -------------------- UTIL -------------------- */

/**
 * @event Core#RadioTriggerUtilIsViewMobileChanged
 * @description is triggered by Util if mobil is changed
 * @param {boolean} isViewMobile flag if current view is in mobile mode
 * @example Radio.trigger("Util", "isViewMobileChangend", isViewMobile)
 */

/**
 * @event Core#RadioTriggerIsViewMobileChanged
 * @description todod
 * @example Radio.request("Util", "isViewMobileChanged", this.get("isViewMobile"));
 */

/**
 * @event Core#RadioRequestUtilIsViewMobile
 * @description checks if device is mobile
 * @returns {Boolean} device is mobile
 * @example Radio.request("Util", "isViewMobile");
 */

/**
 * @event Core#RadioRequestUtilGetIgnoredKeys
 * @description returns the ignoredKeys
 * @returns {string[]} ignoredKeys
 * @example Radio.request("Util", "getIgnoredKeys");
 */

/**
 * @event Core#RadioTriggerUtilShowLoader
 * @example Radio.trigger("Util", "showLoader")
 * @description Shows loading gif
 */

/**
 * @event Core#RadioTriggerUtilHideLoader
 * @example Radio.trigger("Util", "hideLoader")
 * @description Shows loading gif
 */

/**
 * @event Core#RadioRequestUtilGetUiStyle
 * @description returns the ignoredKeys
 * @returns {string} - Style of the ui. Possible values are "DEFAULT" or "TABLE"
 * @example Radio.request("Util", "getUiStyle");
 */

/**
 * @event Core#RadioRequestUtilIsAny
 * @description returns if the device type is mobile
 * @returns {string} - Mobile Device. Possible values are "true", "false" or "null"
 * @example Radio.request("Util", "isAny");
 */

/**
 * @event Core#RadioRequestUtilIsApple
 * @description returns if the device type is an iphone, ipod or ipad
 * @returns {string} - Apple Device. Possible values are "true", "false" or "null"
 * @example Radio.request("Util", "isApple");
 */

/**
 * @event Core#RadioRequestUtilIsAndroid
 * @description returns if the device type is android
 * @returns {string} - Android Device. Possible values are "true", "false" or "null"
 * @example Radio.request("Util", "isAndroid");
 */

/**
 * @event Core#RadioRequestUtilIsOpera
 * @description returns if the browser type is opera
 * @returns {string} - Opera Device. Possible values are "true", "false" or "null"
 * @example Radio.request("Util", "isOpera");
 */

/**
 * @event Core#RadioRequestUtilIsOpera
 * @description returns if the browser type is opera
 * @returns {string} - Opera Device. Possible values are "true", "false" or "null"
 * @example Radio.request("Util", "isOpera");
 */

/**
 * @event Core#RadioRequestUtilIsOpera
 * @description returns if the browser type is opera
 * @returns {string} - Opera Browser. Possible values are "true", "false" or "null"
 * @example Radio.request("Util", "isOpera");
 */

/**
 * @event Core#RadioRequestUtilIsWindows
 * @description returns if the browser type is Windows
 * @returns {string} - Opera Browser. Possible values are "true", "false" or "null"
 * @example Radio.request("Util", "isWindows");
 */

/**
 * @event Core#RadioRequestUtilIsChrome
 * @description returns if the browser type is chrome
 * @returns {string} - Chrome Browser. Possible values are "true", "false" or "null"
 * @example Radio.request("Util", "isChrome");
 */

/**
 * @event Core#RadioRequestUtilIsInternetExplorer
 * @description returns if the browser type is Internet Explorer
 * @returns {string} - Internet Explorer Browser. Possible values are "true", "false" or "null"
 * @example Radio.request("Util", "isInternetExplorer");
 */

/**
 * @event Core#RadioRequestUtilSort
 * @description Sorting alorithm that distinguishes between array[objects] and other arrays.
 * @param {String} type Type of sort algorithm Currently .
 * @param {String[] | Object[]} values Values to be sorted.
 * @param {String} first Name of first Attribute to be sorted.
 * @param {String} second Name of second Attribute to be sorted. Only if type!== "address".
 * @returns {string[] | Object[]} - Sorted Array
 * @example Radio.request("Util", "sort", type, values, first, second);
 */


/**
 * @event Core#RadioRequestUtilGetMasterPortalVersionNumber
 * @description returns the masterportal version number
 * @returns {String} - masterportal version number
 * @example Radio.request("Util", "getMasterPortalVersionNumber");
 */

/**
 * @event Core#RadioRequestUtilSortBy
 * @description This sort function sorts arrays, objects and strings. This is a replacement for underscores sortBy
 * @param {(Array|Object|String)} [list=undefined] the array, object or string to sort
 * @param {(String|Number|Function)} [iteratee=undefined] may be a function (value, key, list) returning a number to sort by or the name of the key to sort objects with
 * @param {Object} [context=undefined] the context to be used for iteratee, if iteratee is a function
 * @returns {Array}  a new list as array
 * @example Radio.request("Util", "sortBy", [3, 2, 1], (num) => num, this);
 */

/**
 * @event Core#RadioRequestUtilUniqueId
 * @description Generate a globally-unique id for client-side models or DOM elements that need one.
 * @param {String} [prefix=""] prefix for the id
 * @returns {String}  a globally-unique id
 * @example Radio.request("Util", "uniqueId", prefix);
 */

/**
 * @event Core#RadioRequestUtilDifferenceJs
 * @description Looks through each value in the array a, returning an array of all the values that are not present in the array b
 * @param {array} a - elements to check
 * @param {array} b - elements to check
 * @returns {array} - returns diffrence between array a and b
 * @example Radio.request("Util", "DifferenceJs", array-a, array-b);
 */

/**
 * @event Core#RadioRequestUtilSetUiStyle
 * @description sets the ui style
 * @example Radio.request("Util", "setUiStyle");
 */

/**
 * @event Core#RadioRequestUtilPick
 * @description Return a copy of the object, filtered to only have values for the whitelisted keys (or array of valid keys).
 * @example Radio.request("Util", "pick");
 */

/**
 * @event Core#RadioRequestUtilOmit
 * @description Returns a copy of the object, filtered to omit the keys specified (or array of blacklisted keys).
 * @example Radio.request("Util", "omit");
 */

/**
 * @event Core#RadioTriggerUtilRefreshTree
 * @description Calls the treeType specific function to rerender the tree.
 * @example Radio.trigger("Util", "refreshTree")
 */

/**
 * @event Core#changeIsViewMobile
 * @description todo
 */

/** -------------------- GFILIST -------------------- */

/**
 * @event gfiList#RadioTriggerRedraw
 * @description request feature infos for each model
 * @example Radio.trigger("gfiList", "redraw", );
 */

/** -------------------- WINDOW -------------------- */

/**
 * @event Window#RadioTriggerWindowCollapseWin
 * @description is triggered by tool
 * @param {Backbone.Model} model toolModel that is shown in toolwindow
 * @example Radio.trigger("Window", "collapseWin", model);
 */

/**
 * @event Window#RadioTriggerWindowShowTool
 * @description todo
 */

/**
 * @event Window#RadioTriggerWindowSetIsVisible
 * @description controls whether the window should be opened or closed
 */

/** -------------------- WINDOWVIEW -------------------- */

/**
 * @event WindowView#RadioTriggerWindowHide
 * @description is triggered by tool
 * @example Radio.trigger("WindowView", "hide");
 */

 /**
 * @event WindowView#changeIsVisible
 * @description Triggered when the visibility of the Window changes
 */

 /**
 * @event WindowView#changeWinType
 * @description Triggered when the WinType of the Window changes
 */


/** -------------------- TITLE -------------------- */

/**
 * @event Title#RadioTriggerTitleSetSize
 * @description is triggered when title has to be resized
 * @example Radio.trigger("Title", "setSize");
 */

/** -------------------- GFIVIEW -------------------- */

/**
 * @event gfiView#RadioTriggerRender
 * @description Triggered when GFI has to render.
 * @example Radio.trigger("gfiView", "render");
 */

/** -------------------- MOUSEHOVER -------------------- */

/**
 * @event MouseHover#RadioTriggerMouseHoverHide
 * @description hides the mouse hover div
 * @example Radio.trigger("MouseHover", "hide");
 */

/**
 * @event MouseHover#render
 * @description Triggered when View has to render the popup.
 * @example this.trigger("render")
 */

/**
 * @event MouseHover#destroy
 * @description Triggered when the popup needs to be closed.
 * @example this.trigger("destroy")
 */

/** -------------------- STYLELIST -------------------- */

/**
 * @event VectorStyle#RadioRequestStyleListReturnModelById
 * @description filters styles by id
 * @returns {function} Styling-Function
 * @example Radio.request("StyleList", "returnModelById", "1711");
 */

/** -------------------- REMOTEINTERFACE -------------------- */

/**
 * @event RemoteInterface#RadioTriggerRemoteInterfacePostMessage
 * @description Triggers a PostMessage to the RemoteInterface
 * @example Radio.trigger("RemoteInterface", "postMessage", {"allFeatures": JSON.stringify("..."), "layerId": 1711});
 */


/** -------------------- CONTROLS -------------------- */

/**
 * @event Controls#RadioRequestControlsViewAddRowTr
 * @description Creates an HTML-Element at the end of the top-right section of the controls and returns the element
 * @param {String} id Id of element to be returned
 * @param {Boolean} showMobile Flag if Control should be shown in mobile mode
 * @example Radio.request("ControlsView", "addRowTR", id, showMobile);
 */

/**
 * @event Controls#RadioRequestControlsViewAddRowBr
 * @description Creates an HTML-Element at the end of the bottom-right section of the controls and returns the element
 * @param {String} id Id of element to be returned
 * @param {Boolean} showMobile Flag if Control should be shown in mobile mode
 * @example Radio.request("ControlsView", "addRowBR", id, showMobile);
 */

/**
 * @event Controls#RadioRequestControlsViewAddRowBl
 * @description Creates an HTML-Element at the end of the bottom-left section of the controls and returns the element
 * @param {String} id Id of element to be returned
 * @example Radio.request("ControlsView", "addRowBL", id);
 */

/** -------------------- RAWLAYERLIST -------------------- */

/**
 * @event Core#RadioRequestRawLayerListGetLayerWhere
 * @param {String} params Object of Params.
 * @example Radio.request("RawLayerList", "getLayerWhere", params);
 */

/**
 * @event Core#RadioRequestRawLayerListGetLayerAttributesWhere
 * @description Returns the object of the layer that matches the given params.
 * @param {Object} params Object of Params.
 * @returns {Object} - Layer attributes.
 * @example Radio.request("RawLayerList", "getLayerAttributesWhere", params);
 */

/**
 * @event Core#RadioRequestRawLayerListGetLayerAttributesList
 * @description Returns the rawlayerList as json.
 * @returns {RawLayerList} - The rawLayerlist.
 * @example Radio.request("RawLayerList", "getLayerAttributesList");


 /** -------------------- CswParser -------------------- */

/**
 * @event CswParser#RadioTriggerCswParserGetMetaData
 * @param {Object} cswObj Object of CSW request information.
 * @example Radio.trigger("CswParser", "getMetaData", cswObj);
 */

/**
 * @event CswParser#RadioTriggerCswParserFetchedMetaData
 * @param {Object} cswObj Object of CSW request information.
 * @example Radio.trigger("CswParser", "fetchedMetaData", cswObj);
 */

/** -------------------- SelectFeatures -------------------- */

/**
 * @event Tools.SelectFeatures#changeIsActive
 * @description Triggered when isActive changes
 */

/**
 * @event Tools.SelectFeatures#updatedSelection
 * @description Triggered when selection changes
 */

/** -------------------- FeatureLister -------------------- */

/**
 * @event FeatureLister#RadioTriggerToggle
 * @description Toggles the feature lister
 * @example Radio.trigger("FeatureLister", "toggle");
 */

/**
 * @event FeatureLister#RadioTriggerSwitchTabToListe
 * @description switches the tab to the tab 'list'
 * @param {Event} evt Object of Event which has been fired
 * @example Radio.trigger("FeatureLister", "switchTabToListe", evt);
 */

/**
 * @event FeatureLister#RadioTriggerSwitchTabToTheme
 * @description switches the tab to the tab 'theme'
 * @example Radio.trigger("FeatureLister", "switchTabToTheme");
 */

/**
 * @event FeatureLister#RadioTriggerSwitchTabToDetails
 * @description switches the tab to the tab 'details'
 * @param {Event} evt Object of Event which has been fired
 * @example Radio.trigger("FeatureLister", "switchTabToDetails", evt);
 */

/**
 * @event FeatureLister#RadioTriggerNewTheme
 * @description highlight layer on click and set it as current
 * @param {Event} evt Object of Event which has been fired
 * @example Radio.trigger("FeatureLister", "newTheme", evt);
 */

/**
 * @event FeatureLister#RadioTriggerHoverTr
 * @description show marker when hover on list entry in table
 * @param {Event} evt Object of Event which has been fired
 * @example Radio.trigger("FeatureLister", "hoverTr", evt);
 */

/**
 * @event FeatureLister#RadioTriggerSelectTr
 * @description sets the selected layer als active after click on table entry
 * @param {Event} evt Object of Event which has been fired
 * @example Radio.trigger("FeatureLister", "selectTr", evt);
 */

/**
 * @event FeatureLister#RadioTriggerMoreFeatures
 * @description reads more features and displays them
 * @example Radio.trigger("FeatureLister", "moreFeatures");
 */

/**
 * @event FeatureLister#RadioTriggerOrderList
 * @description sorts the selected column
 * @param {Event} evt Object of Event which has been fired
 * @example Radio.trigger("FeatureLister", "orderList", evt);
 */

/**
 * @event FeatureLister#changeIsActive
 * @description Triggered when isActive changes
 */

/**
 * @event FeatureLister#changeLayerList
 * @description Triggered when layerList changes
 */

/**
 * @event FeatureLister#changeLayer
 * @description Triggered when layer changes
 */

/**
 * @event FeatureLister#changeFeatureProps
 * @description Triggered when featureProps changes
 */

/**
 * @event FeatureLister#changeLayerId
 * @description Triggered when layerId changes
 */

/**
 * @event FeatureLister#changeFeatureId
 * @description Triggered when featureId changes
 */

/**
 * @event FeatureLister#RadioTriggerGfiHit
 * @description highlightes given features from gfi hits
 * @param {Event} evt Object of Event which has been fired
 * @example Radio.trigger("FeatureLister", "gfiHit", evt);
 */

/**
 * @event FeatureLister#RadioTriggerGfiClose
 * @description un-highlightes given features from gfi close
 * @example Radio.trigger("FeatureLister", "gfiClose");
 */


/** -------------------- Formular -------------------- */

/**
 * @event Formular#RadioTriggerKeyUp
 * @description Reacts on a key up event in the formular
 */

/**
 * @event Formular#RadioTriggerClick
 * @description Reacts on a click event in the formular
 */

/**
 * @event Formular#RadioTriggerFocusOut
 * @description Reacts on a focus out event in the formular
 */

/**
 * @event Formular#changeIsActive
 * @description Triggered when isActive changes
 */

/**
 * @event Formular#render
 * @param {GrenznachweisModel} model Model which holds the attributes to render
 * @param {Boolean} value Empty the formular or render it
 * @description Renders the formular
 */

/**
 * @event Formular#invalid
 * @param {GrenznachweisModel} model Model which holds the attributes to render
 * @param {Boolean} value Empty the formular or render it
 * @description Renders the formular
 */


/** ------------------------ Filter ----------------------------- */

/**
 * @event Tools.Filter#RadioTriggerFilterEnable
 * @description Enables the filter funtionality in the map
 * @example Radio.trigger("Filter", "enable")
 */

/**
 * @event Tools.Filter#RadioTriggerFilterDisable
 * @description Diables the filter funtionality in the map
 * @example Radio.trigger("Filter", "disable")
 *
 */

/**
 * @event Tools.Filter#RadioTriggerFilterResetFilter
 * @description todo
 * @param {*} feature todo
 * @example Radio.trigger("Filter", "resetFilter", feature);
 *
 */


/** -------------------- HighlightFeature -------------------- */

/**
 * @event HighlightFeature#RadioTriggerHighlightfeatureHighlightFeature
 * @param {String} featureToAdd String with comma seperated information about the feature to add "layerId, featureId"
 * @description Hightlights a specific feature
 */

/**
 * @event HighlightFeature#RadioTriggerHighlightfeatureHighlightPolygon
 * @param {ol.Feature} feature the feature to be highlighted
 * @description Hightlights a specific polygon
 */


/**
 * @event Core#RadioTriggerParametricURLReady
 * @description todo
 */

/** -------------------- Autostart -------------------- */

/**
 * @event Core#RadioTriggerAutostartInitializedModul
 * @description To do
 */

/**
 * @event Core#RadioTriggerAutostartStartModul
 * @description Start the List View Modul
 */

/** -------------------- Tools.Filter.Query -------------------- */

/**
 * @event Tools.Filter.Query#renderSnippets
 * @description render the snippets
 */

/**
 * @event Tools.Filter.Query#changeIsSelected
 * @description trigger if isSelected is changend
 */

/**
 * @event Tools.Filter.Query#changeFeatureIds
 * @description trigger if featureIds is changend
 */

/**
 * @event Tools.Filter.Query#changeIsLayerVisible
 * @description trigger if isLayerVisible is changend
 */

/**
 * @event Tools.Filter.Query#valuesChanged
 * @description todo
 */

/**
 * @event Tools.Filter.Query#SnippetCollectionHideAllInfoText
 * @description todo
 */

/** -------------------- Snippets -------------------- */

/**
 * @event Snippets.Dropdown#ValuesChanged
 * @description todo
 */

/**
 * @event Snippets.Checkbox#ValuesChanged
 * @description todo
 */

/**
  * @event Snippets.GraphicalSelect#setStatus
  * @param {boolean} value - active or not
  * @description Sets the state at GraphicalSelect - handles (de-)activation of this Tool
  * @example Radio.trigger("GraphicalSelect", "setStatus", value);
  */
/**
  * @event Snippets.GraphicalSelect#resetView
  * @description Resets the GraphicalSelect
  * @example Radio.trigger("GraphicalSelect", "resetView");
  */
/**
  * @event Snippets.GraphicalSelect#resetGeographicSelection
  * @description Sets the selection of the dropdown to the default value
  * @example Radio.trigger("GraphicalSelect", "resetGeographicSelection");
  */
/**
  * @event Snippets.GraphicalSelect#featureToGeoJson
  * @param {ol.Feature} feature to transfor to geoJson
  * @return {GeoJSON} the converted feature
  * @description It converts a feature to a geojson. If the feature geometry is a circle, it is converted to a polygon.
  * @example Radio.trigger("GraphicalSelect", "featureToGeoJson", feature);
  */

 /**
 * @event Snippets#ValuesChanged
 * @description Triggered when a snippet changed its values
 * @param {object}
 */

/** -------------------- TOOLS.WFST -------------------- */

/**
 * @event Tools.Wfst#RadioTrigerWfstTransact
 * @description performs a wfs transaction
 * @param {String/Object} layerId The id of the layer on which the transaction is to be performed.
 * @param {String/Object} featureId The id of the affected feature.
 * @param {String/Object} mode The transaction mode insert|update|delete.
 * @param {String/Object} attributes The feature attributes.
 * @example Radio.trigger("wfst", "transact", layerId, featureId, mode, attributes)
 */

/**
 * @event Tools.Wfst#ChangeIsActive
 * @description Fired when param isActive changes.
 */

/**
 * @event Tools.Wfst#ChangeActiveButton
 * @description Triggered when a button ist clicked.
 */

/**
 * @event Tools.Wfst#ChangeCurrentLayerId
 * @description Triggered when the current active layer has changed.
 */

/**
 * @event Tools.Wfst#ChangeShowAttrTable
 * @description Triggered when the status of the attribute table has changed.
 */

/**
 * @event Tools.Wfst#ChangeActiveLayers
 * @description Triggered when the list of active layers has changed.
 */

/**
 * @event Tools.Wfst#ChangeButtonTitleConfig
 * @description Triggered when the buttons and their captions were updatet.
 */

/**
 * @event Tools.Wfst#ChangeButtonConfig
 * @description Triggered when the configuration for the feature generating buttons has changed.
 */

/**
 * @event Tools.Wfst#ChangeSuccessfullTransaction
 * @description Triggered when a transaction was successfull.
 */

/**
 * @event Tools.Wfst#ChangeInteraction
 * @description Triggered when an interaction was added or has changed.
 */

/** -------------------- CORE.MODELLIST.TOOL -------------------- */

/**
 * @event Core.ModelList.Tool#RadioRequestToolGetSupportedOnlyIn3d
 * @description Delivers an array with toll which supported only in 3d-Mode
 */

/**
 * @event Core.ModelList.Tool#RadioRequestToolGetSupportedIn3d
 * @description Delivers an array with toll which supported in 3d-Mode
/** -------------------- TOOLS.VIRTUALCITY -------------------- */

/**
 * @event VirtualCity#RadioRequestVirtualCityActivatePlanning
 * @description activates a Planning identified by the planningId
 */

/**
 * @event VirtualCity#RadioRequestVirtualCityDeactivatePlanning
 * @description deactivates a Planning identified by the planningId
 */

/**
 * @event VirtualCity#RadioRequestVirtualCityGetViewpointsForPlanning
 * @description returns view points by the given planningId
 */

/**
 * @event VirtualCity#RadioRequestVirtualCityGetFlightsForPlanning
 * @description returns the flights for the given planningId
 */

/**
 * @event VirtualCity#RadioRequestVirtualCityGotoViewPoint
 * @description activates a Viewpoint identified by the given ID
 */

/** -------------------- CORE.MODELLIST.TOOL -------------------- */
/**
 * @event Core.ModelList.Tool#RadioRequestToolGetSupportedOnlyInOblique
 * @description Delivers an array with toll which supported only in Oblique-Mode
 */

/**
 * @event Core.ModelList.Tool#RadioRequestToolGetCollection
 * @description Delivers an array with configured tools
 */

/**
 * @event Core.ModelList.Tool#changeIsActive
 * @description Fired when param isActive changes
 */
/** -------------------- VirtualCity.FlightPlayer -------------------- */

/**
 * @event FlightPlayer#RadioRequestFlightPlayerStop
 * @description stops the active Flight
 */

/**
 * @event FlightPlayer#RadioRequestFlightPlayerPlay
 * @description starts playing the given flight
 */

/**
 * @event FlightPlayer#RadioRequestFlightPlayerGetValues
 * @description returns the state values of the flightplayer
 */

/**
 * @event FlightPlayer#RadioTriggerFlightPlayerStateChange
 * @param {string} state "play" or "stop"
 * @param {FlightInstance} flightInstance
 * @description fires if the flightplayer state changes. If the player starts playing or stop is called
 */

/** -------------------- CRS -------------------- */

/**
 * @event RemoteInterface#RadioRequestCRSGetProjection
 * @param {string} name - projection name as written in [0] position of namedProjections
 * @description Returns the proj4 projection definition for a registered name.
 */

/**
 * @event RemoteInterface#RadioRequestCRSGetProjections
 * @param {ol.Map} map - map to project to
 * @param {(string|object)} sourceProjection - projection name or projection of point
 * @param {number[]} point - point to project
 * @description Returns all known projections.
 */

/**
 * @event RemoteInterface#RadioRequestCRSTransformToMapProjection
 * @param {ol.Map} map - map to project to
 * @param {(string|object)} sourceProjection - projection name or projection of point
 * @param {number[]} point - point to project
 * @description Projects a point to the given map.
 */

/**
 * @event RemoteInterface#RadioRequestCRSTransformFromMapProjection
 * @param {ol.Map} map - map to project from, and point must be in map's projection
 * @param {(string|object)} targetProjection - projection name or projection to project to
 * @param {number[]} point - point to project
 * @description Projects a point from the given map.
 */

/**
 * @event RemoteInterface#RadioRequestCRSTransform
 * @param {(string|object)} sourceProjection - projection name or projection of point
 * @param {(string|object)} targetProjection - projection name or projection to project point to
 * @param {number[]} point - point to project
 * @description Transforms a given point from a source to a target projection.
 */

/**
 * @event RemoteInterface#RadioRequestRawLayerListGetLayerWhere
 * @param {object} searchAttributes - key/value-pairs to be searched for, e.g. { typ: "WMS" } to get the first WMS
 * @description Returns the first entry in layerList matching the given searchAttributes.
 */

/**
 * @event RemoteInterface#RadioRequestRawLayerListGetLayerAttributesWhere
 * @description Returns the first entry in layerList matching the given searchAttributes.
 * @param {object} searchAttributes - key/value-pairs to be searched for, e.g. { typ: "WMS" } to get the first WMS
 */

/**
 * @event RemoteInterface#RadioRequestRawLayerListGetLayerListWhere
 * @description Returns an array of all models that match the given attributes.
 * @param  {Object} searchAttributes key/value-pairs to be searched for, e.g. { typ: "WMS" } to get the first WMS
 */

/**
 * @event RemoteInterface#RadioRequestRawLayerListGetLayerList
 * @description Returns complete layerList as initialized.
 */

/**
 * @event RemoteInterface#RadioRequestRawLayerListGetDisplayNamesOfFeatureAttributes
 * @description Returns display names map for a layer, or display name for a specific attribute.
 * @param {string} layerId - if of layer to fetch display names for
 * @param {string} [featureAttribute] - if given, only one entry of map is returned
 */

/** -------------------- ADDON -------------------- */

/**
 * @event Addon#RadioRequestAddonGetMarkerPosition
 * @description todo
 */

 /** -------------------- ADDONS -------------------- */
 /**
 * @event Addons#initialized
 * @description Is fired after addons are inizialized if addons are configured, e.g. the language files are loaded
 */


/** -------------------- TOOLS.DRAW -------------------- */

/**
 * @event Tools.Draw#RadioRequestDrawGetLayer
 * @description Returns the draw layer
 * @example Radio.request("Draw", "getLayer");
 * @returns {ol/Layer} - The draw layer.
 */

/**
 * @event Tools.Draw#RadioRequestDrawDownloadWithoutGUI
 * @description Returns download features without using the download gui.
 * @param {Object} obj Params for download without gui.
 * @param {String} obj.geomType Geometry type of features.
 * @param {Boolean} obj.transformWGS Flag if features should be transformed.
 * @example Radio.request("Draw", "downloadWithoutGUI", obj);
 * @returns {String} - The Features as string.
 */

 /**
 * @event Tools.Draw#RadioTriggerDrawInitWithoutGUI
 * @description Initializes the Draw tool to perform download without the download gui.
 * @param {Object} obj Params for init without gui.
 * @param {String} obj.drawType Draw type of features. Possible values are "Point", "LineString", "Polygon", "Circle".
 * @param {String} obj.color="55, 126, 184" Color as rgb string.
 * @param {Number} obj.opacity=1.0 Opacity.
 * @param {Number} obj.maxFeatures maximum of Features.
 * @param {String} obj.initialJSON Features to be Drawn on the layer.
 * @param {Boolean} obj.transformWGS Flag if features should be transformed.
 * @param {Boolean} obj.zoomToExtent Flag if map should be zoomed to extent.
 * @example Radio.trigger("Draw", "initWithoutGUI", obj);
 */

/**
 * @event Tools.Draw#RadioTriggerDeleteAllFeatures
 * @description Deletes all drawn features.
 * @example Radio.trigger("Draw", "deleteAllFeatures");
 */

/**
 * @event Tools.Draw#RadioTriggerCancelDrawWithoutGUI
 * @description Deletes all drawn features.
 * @param {String} cursor Cursor.
 * @example Radio.trigger("Draw", "cancelDrawWithoutGUI", cursor);
 */

/**
 * @event Tools.Draw#RadioTriggerDownloadViaRemoteInterface
 * @description Deletes all drawn features.
 * @param {String} geomType Type of geometry.
 * @example Radio.trigger("Draw", "downloadViaRemoteInterface", geomType);
 */


/** -------------------- TOOLS.DOWNLOAD -------------------- */

/**
 * @event Tools.Download#RadioTriggerDownloadStart
 * @description Triggers the download tool to start.
 * @param {Object} obj Configuration to start the download module.
 * @param {String[]} obj.formats Formats to be supported.
 * @param {ol/Feature[]} obj.features Features to be downloaded.
 * @example Radio.trigger("Download", "start", obj);
 */

 /**
 * @event Tools.Download#changeIsActive
 * @description Triggered when the model attribute "isActive" changes.
 */

/** -------------------- i18next -------------------- */

/**
 * @event i18next#RadioTriggerLanguageChanged
 * @description Triggers if the languages has changed
 * @param {String} lng the new language to use
 * @example Radio.trigger("i18next", "languageChanged", lng);
 */

/** -------------------- ZOOMTOGEOMETRY -------------------- */

/**
 * @event ZoomToGeometry#RadioTriggerZoomToGeometryZoomToGeometry
 * @description Zooms the map to a geometry from wfs.
 */

 /**
 * @event ZoomToGeometry#RadioTriggerZoomToGeometrySetIsRender
 * @description Todo
 */

 /** -------------------- TOOLS.PARCELSEARCH -------------------- */

/**
 * @event Tools.ParcelSearch#RadioRequestParcelSearchParcelFound
 * @description Todo
 */
/**
 * @event Tools.ParcelSearch#RadioRequestParcelSearchCreateReport
 * @description Todo
 */

  /** -------------------- TOOLS.GFI -------------------- */

/**
 * @event Tools.GFI#RadioRequestGFIGetRequestedParcelId
 * @description Todo
 */

/** -------------------- CONTROLS.ORIENTATION ----------------- */

/**
 * @event Controls.Orientaion#RadioTriggerGeolocationRemoveOverlay
 * @description Todo
 * @example Radio.trigger("geolocation", "removeOverlay");
 */

/** -------------------- CONTROLS.ORIENTATION.POI ----------------- */

/**
 * @event Controls.Orientation.Poi#RadioTriggerPOIShowPOIModal
 * @description Trigger show POI modal.
 * @example Radio.trigger("POI", "showPOIModal");
 */

/**
 * @event Controls.Orientation.Poi#RadioTriggerPOIHidePOIModal
 * @description Trigger hide POI modal.
 * @example Radio.trigger("POI", "hidePOIModal");
 */
