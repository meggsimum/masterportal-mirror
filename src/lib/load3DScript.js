/**
 * Loads the specified JS and calls the given callback after the file has loaded. Modifies the DOM for loading.
 * @param {String} fileName - The URL to Load
 * @param {Function} callback - the Function to call after loading has completed
 * @returns {undefined}
 */
export function load3DScript (fileName, callback) {
    const head = document.getElementsByTagName("head")[0],
        script = document.createElement("script");

    script.type = "text/javascript";
    script.src = fileName;

    script.onload = callback;
    script.onreadystatechange = function () {
        if (this.readyState === "complete") {
            return callback();
        }
        return null;
    };
    head.appendChild(script);
}
