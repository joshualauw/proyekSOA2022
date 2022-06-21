const { nFormatter } = require("../helpers/functions");
const db = require("../helpers/db");

const getPeriod = (query) => {
    if (!query.period || query.period == "daily") {
        return {
            name: "TIME_SERIES_DAILY",
            key: "Time Series (Daily)",
            range: 5,
        };
    } else if (query.period == "weekly") {
        return {
            name: "TIME_SERIES_WEEKLY",
            key: "Weekly Time Series",
            range: 3,
        };
    } else if (query.period == "monthly") {
        return {
            name: "TIME_SERIES_MONTHLY",
            key: "Monthly Time Series",
            range: 2,
        };
    } else {
        return null;
    }
};

const getTimeSeriesData = (data, range) => {
    const timeSeriesData = Object.values(data);
    const first_price = parseFloat(parseFloat(timeSeriesData[range]["1. open"]).toFixed(3));
    const last_price = parseFloat(parseFloat(timeSeriesData[0]["4. close"]).toFixed(3));

    let avg_volume = 0;
    for (let i = 0; i < range; i++) {
        avg_volume += parseFloat(timeSeriesData[i]["5. volume"]);
    }
    avg_volume = nFormatter(avg_volume / range);

    let avg_high = 0;
    for (let i = 0; i < range; i++) {
        avg_high += parseFloat(timeSeriesData[i]["2. high"]);
    }
    avg_high = parseFloat((avg_high / range).toFixed(2));

    let avg_low = 0;
    for (let i = 0; i < range; i++) {
        avg_low += parseFloat(timeSeriesData[i]["3. low"]);
    }
    avg_low = parseFloat((avg_low / range).toFixed(2));

    const change = (last_price - first_price).toFixed(3);
    const change_percent = ((change * 100) / first_price).toFixed(2);
    return {
        first_price,
        last_price,
        change,
        change_percent,
        avg_volume,
        avg_high,
        avg_low,
    };
};

module.exports = {
    getPeriod,
    getTimeSeriesData,
};
