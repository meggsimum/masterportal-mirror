/**
 * Checks if a string has passages followed by a semicolon and makes those passages bold.
 * @param {string} value The string that should be checked for text passages followed by a semicolon
 * @example Title text; After the function ran, the text in front of and including the semicolon ("Title text") should be bold.
 * @returns {string} The modified string where everything before the semicolon gets displayed bold.
 */
export default function toBold (value) {
    const oldProfiles = value;
    let newProfiles = "";

    oldProfiles.replaceAll("|", "<br>");

    newProfiles = oldProfiles.split("|").map(substring => substring.split(";")).map(([first, last]) => [`<b>${first}</b>`, last].join("; ")).join("<br>");

    return newProfiles;
}
