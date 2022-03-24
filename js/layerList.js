import {initializeLayerList} from "masterportalapi/src/rawLayerList";
import {loadApp} from "./app";

/**
 * Holt sich die Layer Konfigurationen (layer list)
 * @param {string} layerConfUrl - services.json url
 * @returns {void}
 */
export function fetch (layerConfUrl) {
    initializeLayerList(layerConfUrl,
        (layerList, error) => {
            if (error) {
                Radio.trigger("Alert", "alert", {
                    text: "<strong>Die Datei '" + layerConfUrl + "' konnte nicht geladen werden!</strong>",
                    kategorie: "alert-warning"
                });
            }
            else {
                modifyLayerList(layerList);
            }
        });
}

/**
 * Bearbeitet die Objekte aus der services.json entsprechend der config.js
 * @param  {Object[]} layerList - Objekte aus der services.json
 * @return {void}
 */
function modifyLayerList (layerList) {
    let rawLayerArray = layerList;

    // Es gibt Layer in einem Dienst, die für unterschiedliche Portale unterschiedliche Daten/GFIs liefern --> z.B. Hochwasserrisikomanagement
    // Da alle Layer demselben Metadatensatz zugordnet sind, werden sie über die Id gelöscht
    if (Config.tree !== undefined) {
        if (Object.prototype.hasOwnProperty.call(Config.tree, "layerIDsToIgnore")) {
            rawLayerArray = deleteLayersByIds(rawLayerArray, Config.tree.layerIDsToIgnore);
        }
        // Alle Layer eines Metadatensatzes die nicht dargestellt werden sollen --> z.B. MRH Fachdaten im FHH-Atlas
        if (Object.prototype.hasOwnProperty.call(Config.tree, "metaIDsToIgnore")) {
            rawLayerArray = deleteLayersByMetaIds(rawLayerArray, Config.tree.metaIDsToIgnore);
        }
        // Alle Layer eines Metadatensatzes die gruppiert dargestellt werden sollen --> z.B. Bauschutzbereich § 12 LuftVG Hamburg im FHH-Atlas
        if (Object.prototype.hasOwnProperty.call(Config.tree, "metaIDsToMerge")) {
            rawLayerArray = mergeLayersByMetaIds(rawLayerArray, Config.tree.metaIDsToMerge);
        }
        // Die HVV Layer bekommen Ihre Styles zugeordnet
        // Pro Style wird eine neuer Layer erzeugt
        if (Object.prototype.hasOwnProperty.call(Config.tree, "layerIDsToStyle")) {
            setStyleForHVVLayer(rawLayerArray);
            rawLayerArray = cloneByStyle(rawLayerArray);
        }
    }

    // Update layer list
    initializeLayerList(rawLayerArray,
        () => {
            // Abwarten bis die layer list geladen ist, dann die app laden
            loadApp();
        });
}

/**
 * Entfernt Objekte aus der response, die mit einer der übergebenen Ids übereinstimmen
 * @param  {Object[]} response - Objekte aus der services.json
 * @param  {string[]} ids - Ids von Objekten die entfernt werden
 * @return {Object[]} response - Objekte aus der services.json
 */
export function deleteLayersByIds (response, ids) {
    if (ids !== undefined) {
        return response.filter(element => ids.includes(element.id) === false);
    }
    return response;
}

/**
 * Entfernt Objekte aus der response, die mit einer der übergebenen Metadaten-Ids übereinstimmen
 * @param  {Object[]} response - Objekte aus der services.json
 * @param  {string[]} metaIds - Metadaten-Ids von Objekten die entfernt werden
 * @return {Object[]} response - Objekte aus der services.json
 */
export function deleteLayersByMetaIds (response, metaIds) {
    if (metaIds !== undefined) {
        return response.filter(function (element) {
            return element.datasets.length === 0 || metaIds.includes(element.datasets[0].md_id) === false;
        });
    }
    return response;
}

/**
 * Gruppiert Objekte aus der response, die mit einer der übergebenen Metadaten-Ids übereinstimmen
 * @param {Object[]} response - Objekte aus der services.json
 * @param  {string[]} metaIds - Metadaten-Ids von Objekten die gruppiert werden
 * @return {Object[]} response - Objekte aus der services.json
 */
export function mergeLayersByMetaIds (response, metaIds) {
    let rawLayerArray = response,
        objectsById;

    if (Array.isArray(metaIds)) {
        metaIds.forEach(function (metaID) {
            let newObject = {},
                entry;

            objectsById = rawLayerArray.filter(function (layer) {
                return layer.typ === "WMS" && layer.datasets.length > 0 && layer.datasets[0].md_id === metaID;
            });
            // Das erste Objekt wird kopiert
            if (objectsById !== undefined && objectsById.length > 0) {
                newObject = Object.assign(newObject, objectsById[0]);
                // Das kopierte Objekt bekommt den gleichen Namen wie der Metadatensatz
                newObject.name = objectsById[0].datasets[0].md_name;
                // Das Attribut layers wird gruppiert und am kopierten Objekt gesetzt

                for (entry of objectsById) {
                    if (entry.gfiAttributes !== "ignore") {
                        newObject.gfiAttributes = entry.gfiAttributes;
                        break;
                    }
                }
                newObject.layers = pluck(objectsById, "layers").toString();
                // Das Attribut maxScale wird gruppiert und der höchste Wert am kopierten Objekt gesetzt
                newObject.maxScale = Math.max(...pluck(objectsById, "maxScale").map(Number));
                // Das Attribut minScale wird gruppiert und der niedrigste Wert am kopierten Objekt gesetzt
                newObject.minScale = Math.min(...pluck(objectsById, "minScale").map(Number));
                // Entfernt alle zu "gruppierenden" Objekte aus der response
                rawLayerArray = rawLayerArray.filter(x => !objectsById.includes(x));
                // Fügt das kopierte (gruppierte) Objekt der response hinzu
                rawLayerArray.push(newObject);
            }
        });
    }

    return rawLayerArray;
}

/**
 * Function to retrieve all entries which are stored under the defined key.
 * @param {array} array - Array
 * @param {string} key - Key
 * @return {Object[]} - Return all entries which are stored under the defined key as an object.
 */
function pluck (array, key) {
    return array.map(i => i[key]);
}

/**
 * Returns the first value that matches all of the key-value pairs listed in properties.
 * Source: https://stackoverflow.com/questions/37301790/es6-equivalent-of-underscore-findwhere
 * @param {Object} list - where to search for the key-value pairs.
 * @param {Object} properties - the key-value pair, which should be detected.
 * @return {Object} - Returns an object the key-value pair
 */
function findKeyValuePair (list, properties) {
    return list.find(item => Object.keys(properties).every(key => item[key] === properties[key]));
}

/**
 * Holt sich die HVV-Objekte aus der services.json
 * Fügt den Objekten konfigurierte Attribute aus der config.js über die Id hinzu
 * @param {Object[]} response - Objekte aus der services.json
 * @return {undefined}
 */
function setStyleForHVVLayer (response) {
    const styleLayerIDs = pluck(Config.tree.layerIDsToStyle, "id"),
        layersByID = response.filter(layer => {
            return styleLayerIDs.includes(layer.id);
        });

    layersByID.forEach(function (layer) {
        const styleLayer = findKeyValuePair(Config.tree.layerIDsToStyle, {"id": layer.id}),
            layerExtended = Object.assign(layer, styleLayer);

        return layerExtended;
    });
}

/**
 * Aus Objekten mit mehreren Styles, wird pro Style ein neues Objekt erzeugt
 * Das "alte" Objekt wird aus der response entfernt
 * @param {Object[]} response - Objekte aus der services.json
 * @return {Object[]} response - Objekte aus der services.json
 */
export function cloneByStyle (response) {
    let rawLayerArray = response;
    const objectsByStyle = response.filter(model => typeof model.styles === "object" && model.typ === "WMS");

    // Iteriert über die Objekte
    objectsByStyle.forEach(function (obj) {
        // Iteriert über die Styles
        obj.styles.forEach(function (style, index) {
            // Objekt wird kopiert
            const cloneObj = Object.assign({}, obj);

            // Die Attribute name, Id, etc. werden für das kopierte Objekt gesetzt
            cloneObj.style = style;
            cloneObj.legendURL = obj.legendURL[index];
            cloneObj.name = obj.name[index];
            cloneObj.id = obj.id + obj.styles[index];
            cloneObj.styles = obj.styles[index];
            // Objekt wird der Response hinzugefügt
            response.splice(response.indexOf(obj), 0, cloneObj);
        });
        // Das ursprüngliche Objekt wird gelöscht
        rawLayerArray = response.filter(value => value.id !== obj.id);
    });

    return rawLayerArray;
}
