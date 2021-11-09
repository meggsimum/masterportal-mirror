import { PluggableMap } from 'ol'
import { WFS } from 'ol/format.js'
import { bbox } from 'ol/loadingstrategy.js'
import VectorLayer from 'ol/layer/Vector.js'
import VectorSource from 'ol/source/Vector.js'
import Cluster from 'ol/source/Cluster.js'

import { getLayerWhere } from 'masterportalAPI/src/rawLayerList'
import style from 'masterportalAPI/src/layer/geojson/style'

const originalAddLayer = PluggableMap.prototype.addLayer

/**
 * Creates a layer for a WFS. Since it is, after parsing, the same kind of layer as in the geojson-module, you can use the
 * methods for geojson regarding feature showing/hiding/styling for WFS layers, too.
 * @param {object} rawLayer rawLayer as specified in services.json
 * @param {object} [param={}] parameter object
 * @param {ol.Style} [param.layerStyle] optional style; if not given, default styling (modifiable by geojson.setCustomStyles) is used
 * @param {ol.Map} [map] map the features are to be projected on
 * @param {number} [params.distance] if set, adds clustering to layer with this distance value
 * @param {ol.loadingstrategy} [params.loadingstrategy]
 * @returns {ol.layer.Vector} Layer with id and source specified in rawLayer
 * @alias "wfs.createLayer"
 * @memberof module:core/masterportalAPI
 */
export function createLayer( rawLayer, { layerStyle, map, distance, loadingStrategy = bbox, proxyUrl = '' } = {} ) {
  const { id, name, url, version, featureType } = rawLayer
  const code = map.getView().getProjection().getCode()

  if (version !== '1.1.0') {
    console.warn(
      `Die benutzte Version ${version} für den WFS ${id} wird nicht unterstützt.`
    )
  }

  try {
    let source = new VectorSource({
      format: new WFS(),
      url: (extent) => {
        const bboxParam =
          loadingStrategy === bbox ? `&bbox=${extent.join(',')},${code}` : ''

        const urlLiteral = `${url}?service=WFS&version=${version}&request=GetFeature&typename=${featureType}&srsname=${code}${bboxParam}`
        return proxyUrl
          ? proxyUrl + encodeURIComponent(urlLiteral)
          : encodeURI(urlLiteral)
      },
      strategy: loadingStrategy,
    })

    // if clustering is needed, shovel another source between source and layer that handles it
    if (typeof distance === 'number' && distance > 0) {
      const clusterSource = new Cluster({
        distance: distance,
        source: source,
        // exclude invisible features from clustering
        geometryFunction: (feature) =>
          feature.style && feature.style.visibility === 'hidden'
            ? null
            : feature.getGeometry(),
      })
      source = clusterSource
    }

    return new VectorLayer({ id, name, source, style: layerStyle || style })
  } catch (e) {
    console.error(`Creating WFS layer ${id} failed. Created layer is empty.`)
    console.error(e)
    return new VectorLayer({ id, name })
  }
}

PluggableMap.prototype.addLayer = function (...parameters) {
  let layer
  const incomingParameters = { ...parameters }
  const layerId = parameters[0]

  // if parameter is id, create and add layer with masterportalAPI mechanisms
  if (typeof layerId === 'string') {
    const rawLayer = getLayerWhere({ id: layerId })

    if (!rawLayer) {
      console.error(
        "Layer with id '" + layerId + "' not found. No layer added to map."
      )
      return null
    }

    if (rawLayer.typ === 'WFS') {
      layer = createLayer(rawLayer, {
        ...incomingParameters,
        map: this,
      })
      const incomingLayer = incomingParameters[1]

      layer.setVisible(
        typeof incomingLayer.visibility === 'boolean'
          ? incomingLayer.visibility
          : true
      )
      layer.setOpacity(
        typeof incomingLayer.transparency === 'number'
          ? (100 - incomingLayer.transparency) / 100
          : 1
      )
      originalAddLayer.call(this, layer)
      return layer
    }
  }
  return originalAddLayer.call(this, ...parameters)
}
