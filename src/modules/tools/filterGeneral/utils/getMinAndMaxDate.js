import moment from "moment";

/**
 * Returns the param of the given params that is lesser than the other.
 * @param {String} firstDate the first date to check
 * @param {String} secondDate the second date to check
 * @param {String} format the format firstDate and secondDate are in
 * @returns {String} the lesser date or the current date if no valid arguments are given
 */
function getMinDate (firstDate, secondDate, format) {
    const firstMoment = moment(firstDate, format),
        secondMoment = moment(secondDate, format);

    if (!firstMoment.isValid() && !secondMoment.isValid()) {
        return moment().format(format);
    }
    else if (!firstMoment.isValid()) {
        return secondDate;
    }
    else if (!secondMoment.isValid()) {
        return firstDate;
    }

    if (firstMoment.isSameOrAfter(secondMoment)) {
        return secondDate;
    }
    return firstDate;
}
/**
 * Returns the param of the given params that is greater than the other.
 * @param {String} firstDate the first date to check
 * @param {String} secondDate the second date to check
 * @param {String} format the format firstDate and secondDate are in
 * @returns {String} the greater date or the current date if no valid arguments are given
 */
function getMaxDate (firstDate, secondDate, format) {
    const firstMoment = moment(firstDate, format),
        secondMoment = moment(secondDate, format);

    if (!firstMoment.isValid() && !secondMoment.isValid()) {
        return moment().format(format);
    }
    else if (!firstMoment.isValid()) {
        return secondDate;
    }
    else if (!secondMoment.isValid()) {
        return firstDate;
    }

    if (firstMoment.isSameOrAfter(secondMoment)) {
        return firstDate;
    }
    return secondDate;
}

export {getMinDate, getMaxDate};
