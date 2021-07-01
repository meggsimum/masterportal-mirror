import defaults from "../defaults";
import abstractAPI from "../../abstraction/api.js";

/**
 * Returns the layers to be initialized as soon as services are known.
 * @param {object} config - configuration object
 * @returns {object[]} array of layer initialization objects
 * @ignore
 */
export default function (config) {
    // user specified what to do => use that
    if (config.controls && typeof config.controls === "object") {
        if (config.controls.hasOwnProperty("button3d") && config.controls.button3d === true) {
            const switch3D = document.createElement("input"),
                map2D = window.mpapi.map,
                settings3D = {
                    "map2D": window.mpapi.map
                },
                map3D = abstractAPI.map.createMap(settings3D, "3D"),
                setEnabled = function () {
                    if (window.mpapi.map === map3D) {
                        window.mpapi.map.setEnabled(false);
                            window.mpapi.map = map2D;
                        }else{
                             window.mpapi.map = map3D;
                            window.mpapi.map.setEnabled(true);
                        }
                };

            switch3D.value = "Switch 2D/3D";
            switch3D.type = "button";
            switch3D.id = "map-enable";
            document.getElementById("controls").appendChild(switch3D);
            document.getElementById("enable").addEventListener("click", setEnabled);
            document.getElementById("map-enable").addEventListener("click", setEnabled);
            }
    }

 /*    // user didn't specify, layerConf is lgv services => use default for lgv services
    if (typeof config.layerConf === "undefined" || config.layerConf === defaults.layerConf) {
        return defaults.layers;
    }

    // user didn't specify, layerConf is not known => don't set anything initially
    return []; */
}
