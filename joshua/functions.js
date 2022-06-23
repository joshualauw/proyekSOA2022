const range = 3; //specify how much average from data

const periods = [
    {
        name: "TIME_SERIES_DAILY",
        key: "Time Series (Daily)",
    },
    {
        name: "TIME_SERIES_WEEKLY",
        key: "Weekly Time Series",
    },
    {
        name: "TIME_SERIES_MONTHLY",
        key: "Monthly Time Series",
    },
];

const getPeriod = (query) => {
    if (!query.period || query.period == "daily") return periods[0];
    else if (query.period == "weekly") return periods[1];
    else if (query.period == "monthly") return periods[2];
};

const getAvg = (data, key) => {
    let sum = 0;
    for (let i = 0; i <= range; i++) sum += parseFloat(data[i][key]) ?? 0;
    return sum / range;
};

const getChange = (data, open, close) => {
    const change = (data[range][open] - data[0][close] ?? 0).toFixed(3);
    return change > 0 ? `+${change}` : change;
};

module.exports = {
    getPeriod,
    getAvg,
    getChange,
};
