import moment from "moment";

export const validIso8601Precisions = [
    "YYYY",
    "YYYY-MM",
    "YYYY-MM-DD",
    "YYYY-MM-DDTHH",
    "YYYY-MM-DDTHH:mm",
    "YYYY-MM-DDTHH:mm:ss",
    "YYYY-MM-DDTHH:mm:ss.SSS"
];

/**
 * Precision will be returned as format string.
 * @link https://datatracker.ietf.org/doc/html/rfc3339#section-5.6
 * @param {String} timestamp timestamp to detect precision of
 * @returns {String} format value for precision
 * @throws
 */
export default function detectIso8601Precision (timestamp) {
    const checkTimestamp = timestamp.endsWith("Z")
            ? timestamp.substring(0, timestamp.length - 1)
            : timestamp,
        format = validIso8601Precisions.find(
            precision => moment(checkTimestamp, precision, true).isValid()
        );

    if (!format) {
        throw new Error(`Given timestamp "${timestamp}" is not in ISO8601.`);
    }

    return format;
}
