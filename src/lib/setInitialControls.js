import abstractAPI from "../../abstraction/api.js";

/**
 * Loads the specified JS and calls the given callback after the file has loaded. Modifies the DOM for loading.
 * @param {String} fileName - The URL to Load
 * @param {Function} callback - the Function to call after loading has completed
 * @returns {undefined}
 */
 var load3DScript = function(fileName, callback) {
    let head = document.getElementsByTagName('head')[0];
    let script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = fileName;

    script.onload = callback;
    script.onreadystatechange = function() {
        if (this.readyState == 'complete') {
            callback();
        }
    };
    head.appendChild(script);
};

/**
 * Returns map controls according to config.controls given in the config.json.
 * @param {object} config - configuration object
 * @returns {undefined}
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
                // eslint-disable-next-line func-style
                setEnabled = function () {
                    if (window.mpapi.map.mapMode === "3D") {
                        window.mpapi.map.setEnabled(false);
                        window.mpapi.map = map2D;
                        switch3D.value = "3D";
                    }
                    else {
                        load3DScript("https://lib.virtualcitymap.de/v3.6.x/lib/Cesium/Cesium.js", function Loaded3DCallback () {
                            const map3D = abstractAPI.map.createMap(settings3D, "3D");

                            window.mpapi.map = map3D;
                            window.mpapi.map.setEnabled(true);
                            switch3D.value = "2D";
                        });
                    }
                };

            switch3D.value = "3D";
            switch3D.type = "button";
            switch3D.id = "map-enable";
            document.getElementById("controls").appendChild(switch3D);
            document.getElementById("enable").addEventListener("click", setEnabled);
            document.getElementById("map-enable").addEventListener("click", setEnabled);
        }
    }
}
