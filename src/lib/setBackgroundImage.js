import defaults from "../defaults";

/**
 * Sets the configured background image to the div the map is to be rendered in.
 * @param {object} [config={}] - user configuration
 * @param {string} [config.target] - id of map div
 * @param {string} [config.backgroundImage] - image URL to set; "" means none, undefined means default
 * @returns {undefined}
 */
export default function setBackgroundImage ({backgroundImage, target} = {}) {
    const div = document.getElementById(target || defaults.target);

    if (div) {
        const urlString = `url(${
            // keep "" as explicit none
            typeof backgroundImage === "string" ? backgroundImage : defaults.backgroundImage
        })`;

        div.style.backgroundImage = urlString;
    }
}
