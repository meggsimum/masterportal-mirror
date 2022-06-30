/**
 * A function to look for an exception of a wfs xml response.
 * @param {Object} responseXML The xml response to parse through.
 * @returns {Error} The found error or undefined if nothing was found.
 */
export default function getWfsError (responseXML) {
    if (!responseXML?.childElementCount) {
        return new Error("The wfs response from the server is empty.");
    }
    let child = responseXML;

    while (typeof child === "object" && child !== null) {
        if (typeof child.getAttribute === "function" && child.getAttribute("exceptionCode")) {
            return new Error(typeof child?.textContent === "string" ? child.textContent.trim() : "unknown wfs error");
        }
        child = child.firstElementChild;
    }
    return undefined;
}
