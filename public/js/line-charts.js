var lineCharts = [];
var parseTime = d3.timeParse("%d/%m/%Y");
var formatTime = d3.timeFormat("%d/%m/%Y");

// Event listeners
$("#coin-select").on("change", function () { update(); });
$("#var-select").on("change", function () { update(); });

// Add jQuery UI slider
$("#date-slider").slider({
    range: true,
    max: parseTime("31/10/2017").getTime(),
    min: parseTime("12/5/2013").getTime(),
    step: 86400000, // One day
    values: [parseTime("12/5/2013").getTime(), parseTime("31/10/2017").getTime()],
    slide: function (event, ui) {
        $("#dateLabel1").text(formatTime(new Date(ui.values[0])));
        $("#dateLabel2").text(formatTime(new Date(ui.values[1])));
        update();
    }
});

d3.json("data/coins.json").then(function (data) {
    // Data cleaning
    var formattedData = {};
    for (var coin in data) {
        formattedData[coin] = data[coin].filter(function (d) { return d['price_usd']; });
        formattedData[coin].forEach(function (d) {
            d['price_usd'] = +d['price_usd'];
            d['24h_vol'] = +d['24h_vol'];
            d['market_cap'] = +d['market_cap'];
            d['date'] = parseTime(d['date']);
        });
    }

    let i = 1;
    for (var coin in formattedData) {
        lineCharts.push(new LineChart(`#chart-area${i}`, formattedData[coin], coin));
        i++;
    }
});

function update() {
    lineCharts.forEach(chart => {
        chart.wrangleData();
    });
}