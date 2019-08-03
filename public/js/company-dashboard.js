
var teams = [
    { key: 'northeast' },
    { key: 'west' },
    { key: 'south' },
    { key: 'midwest' }
];
var categories = [
    { key: 'electronics' },
    { key: 'furniture' },
    { key: 'appliances' },
    { key: 'materials' }
];

var companySizes = [
    { key: 'small' },
    { key: 'medium' },
    { key: 'large' }
];

var mainChart, companySize, unitsSold, revenue, callDuration, timeline;
var data = [];
var allData = [];

var parseTime = d3.timeParse("%d/%m/%Y");
var formatTime = d3.timeFormat("%d/%m/%Y");

d3.json("data/calls.json").then(function (calls) {

    console.log(calls);
    allData = calls.map(({ date, ...rest }) => {
        return { ...rest, date: stringToDate(date, "dd/MM/yyyy", "/") };
    })
    data = allData;
    console.log(data);
    mainChart = new StackedAreaChart('#stacked-area');
    companySize = new DonutChart('#company-size');
    unitsSold = new BarChart('#units-sold', 'units_sold', 'Units Sold per call');
    revenue = new BarChart('#revenue', 'call_revenue', 'Average call revenue (USD)');
    callDuration = new BarChart('#call-duration', 'call_duration', 'Average call duration (seconds)');
    timeline = new Timeline("#timeline");
})

$("#var-select").on("change", function () {
    mainChart.format();
    timeline.wrangleData();
})

function brushed() {
    var selection = d3.event.selection || timeline.x.range();
    var newValues = selection.map(timeline.x.invert);

    data = allData.filter(d => d.date >= newValues[0] && d.date <= newValues[1]);

    $("#dateLabel1").text(formatTime(newValues[0]));
    $("#dateLabel2").text(formatTime(newValues[1]));

    mainChart.format();
    companySize.format();
    unitsSold.format();
    revenue.format();
    callDuration.format();
}

function capitalize(value) {
    return `${value[0].toUpperCase()}${value.slice(1)}`;
}

function stringToDate(_date, _format, _delimiter) {
    var formatLowerCase = _format.toLowerCase();
    var formatItems = formatLowerCase.split(_delimiter);
    var dateItems = _date.split(_delimiter);
    var monthIndex = formatItems.indexOf("mm");
    var dayIndex = formatItems.indexOf("dd");
    var yearIndex = formatItems.indexOf("yyyy");
    var month = parseInt(dateItems[monthIndex]);
    month -= 1;
    var formatedDate = new Date(dateItems[yearIndex], month, dateItems[dayIndex]);
    return formatedDate;
}