import _ from "underscore";
import defaults from "../defaults";

/**
 * Sets the configured background image to the div the map is to be rendered in.
 * @param {object} config - user configuration
 * @param {string} config.target - id of map div
 * @param {string} [config.backgroundImage] - image URL to set; "" means none, undefined means default
 * @returns {undefined}
 */
export default function setBackgroundImage (config) {
    var backgroundImage = config.backgroundImage,
        div,
        urlString;

    // keep "" as explicit none
    if (!_.isString(backgroundImage)) {
        backgroundImage = defaults.backgroundImage;
    }

    div = document.getElementById(config.target || defaults.target);

    if (div) {
        urlString = "url(" + backgroundImage + ")";
        div.style.backgroundImage = urlString;
    }
}
