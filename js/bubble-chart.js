var margin = { left: 80, right: 20, top: 50, bottom: 100 };
var width = 1200 - margin.left - margin.right;
var height = 800 - margin.top - margin.bottom;

var index = 0;
var interval;
var formattedData;

var g = d3.select('#chart-area')
	.append('svg')
	.attr('width', width + margin.left + margin.right)
	.attr('height', height + margin.top + margin.bottom)
	.append('g')
	.attr('transform', `translate(${margin.left}, ${margin.top})`);

var tip = d3.tip().attr('class', 'd3-tip')
	.html(d => {
		var text = `<strong>Country:</strong> <span style="color:#778899">${d.country}</span><br>`;
		text += `<strong>Continent:</strong> <span style="color:#778899;text-transform:capitalize">${d.continent}</span><br>`;
		text += `<strong>Life Expectancy:</strong> <span style="color:#778899">${d3.format('.2f')(d.life_exp)}</span><br>`;
		text += `<strong>GPD Per Capita:</strong> <span style="color:#778899">${d3.format('$,.0f')(d.income)}</span><br>`;
		text += `<strong>Population:</strong> <span style="color:#778899">${d3.format(',.0f')(d.population)}</span><br>`;
		return text;
	});

g.call(tip);

var x = d3.scaleLog()
	.domain([142, 150000])
	.range([0, width])
	.base(10);
var y = d3.scaleLinear()
	.domain([0, 90])
	.range([height, 0]);
var r = d3.scaleLinear()
	.range([25 * Math.PI, 2500 * Math.PI])
	.domain([2000, 1400000000]);
var color = d3.scaleOrdinal(d3.schemeCategory10);

var xAxisCall = d3.axisBottom(x)
	.tickValues([400, 4000, 40000])
	.tickFormat(d3.format("$"));
g.append('g')
	.attr('class', 'x axis')
	.attr('transform', `translate(0, ${height})`)
	.call(xAxisCall);

var yAxisCall = d3.axisLeft(y);
g.append('g')
	.attr('class', ' y axis')
	.call(yAxisCall);

g.append('text')
	.attr('class', 'x axis-label')
	.attr('x', width / 2)
	.attr('y', height + 50)
	.attr('font-size', '20px')
	.attr('text-anchor', 'middle')
	.text("GDP Per Capita ($)");

g.append('text')
	.attr('class', 'y axis-label')
	.attr('x', -height / 2)
	.attr('y', - 40)
	.attr('transform', 'rotate(-90)')
	.attr('font-size', '20px')
	.attr('text-anchor', 'middle')
	.text("Life Expectancy (Years)")

var yearLabel = g.append('text')
	.attr('x', width)
	.attr('y', height - 10)
	.attr('font-size', '40px')
	.attr('text-anchor', 'end')
	.attr("opacity", "0.4");

var legend = g.append('g')
	.attr('transform', `translate(${width - 10}, ${height - 125})`);

var continents = ['europe', 'asia', 'americas', 'africa'];
continents.forEach((c, i) => {
	var legendRow = legend.append('g')
		.attr('transform', `translate(0, ${i * 20})`);

	legendRow.append('rect')
		.attr('width', 10)
		.attr('height', 10)
		.attr('fill', color(c));

	legendRow.append('text')
		.attr('x', -10)
		.attr('y', 10)
		.attr('text-anchor', 'end')
		.style('text-transform', 'capitalize')
		.text(c);
});

d3.json('data/bubble-chart.json').then(function (data) {
	formattedData = data.map(d => {
		return {
			year: d.year,
			countries: d.countries.filter(c => { return c.income && c.life_exp; })
		};
	});

	update(formattedData[0]);
	// d3.interval(_ => {
	// 	update(formattedData[index]);
	// 	index = (index + 1) % data.length;
	// }, 100);
});

$('#play-button').on('click', function () {
	var button = $(this);
	if (button.text() == 'Play') {
		button.text('Pause');
		interval = setInterval(step, 100);
	} else {
		button.text('Play');
		clearInterval(interval);
	}
});

$('#reset-button').on('click', function () {
	index = 0;
	update(formattedData[index]);
});

$('#continent-select').on('change', function () {
	update(formattedData[index]);
});

$('#date-slider').slider({
	min: 1800,
	max: 2014,
	step: 1,
	slide: (event, ui) => {
		index = ui.value - 1800;
		update(formattedData[index]);
	}
});

function step() {
	index = (index + 1) % formattedData.length;
	update(formattedData[index]);
};

function update(data) {
	var t = d3.transition().duration(100);

	var continent = $('#continent-select').val();
	var countries = data.countries.filter(d => {
		return continent == 'all' ? true : d.continent == continent;
	})

	var circles = g.selectAll('circle')
		.data(countries, d => { return d.country; });

	circles.exit()
		.attr("class", "exit")
		.remove();

	circles.enter().append('circle')
		.attr("class", "enter")
		.attr('fill', d => { return color(d.continent); })
		.on('mouseover', tip.show)
		.on('mouseout', tip.hide)
		.merge(circles)
		.transition(t)
		.attr('cx', d => { return x(d.income); })
		.attr('cy', d => { return y(d.life_exp); })
		.attr('r', d => { return Math.sqrt(r(d.population) / Math.PI); });

	yearLabel.text(data.year);
	$('#year').text(+(index + 1800));
	$('#date-slider').slider('value', +(index + 1800));
}