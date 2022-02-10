/**
 * Returns an array which contains values at hour position.
 * @param  {Number} position One hour.
 * @param  {Object[]} [dataPerHour=[]] Data for every day, according to targetresult.
 * @returns {Object[]} The data per hour.
 */
export function arrayPerHour (position, dataPerHour = []) {
    const perHour = [];

    dataPerHour.forEach(day => {
        const positionData = parseFloat(day[position], 10);

        if (positionData !== undefined && !isNaN(positionData)) {
            perHour.push(positionData);
        }
    });

    return perHour;
}

/**
 * Calculates the arithemtic Meaning for the given datas.
 * @param  {Object[]} [dataPerHour=[]] Data for every day, according to targetresult.
 * @returns {Object[]} the day means.
 */
export function calculateArithmeticMean (dataPerHour = []) {
    const dayMeans = [];

    for (let i = 0; i < 24; i++) {
        let result = 0,
            perHour = arrayPerHour(i, dataPerHour);

        if (perHour.length === 0) {
            dayMeans.push({
                hour: i,
                result: 0
            });
            continue;
        }

        perHour = perHour.filter(value => value !== undefined);
        result = perHour.reduce((memo, value) => memo + value) / perHour.length;
        if (isNaN(result)) {
            result = 0;
        }

        dayMeans.push({
            hour: i,
            result: Math.round(result * 1000) / 1000
        });
    }

    return dayMeans;
}

export default {arrayPerHour, calculateArithmeticMean};
