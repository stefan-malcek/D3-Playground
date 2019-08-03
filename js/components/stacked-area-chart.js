class StackedAreaChart {
  margin = { left: 80, right: 100, top: 50, bottom: 40 };
  width = 800 - this.margin.left - this.margin.right;
  height = 450 - this.margin.top - this.margin.bottom;

  x = d3.scaleTime()
    .range([0, this.width]);
  y = d3.scaleLinear()
    .range([this.height, 0]);
  color = d3.scaleOrdinal(d3.schemeSet3);
  stack = d3.stack();

  t = () => d3.transition().duration(750);

  constructor(_parentElement) {
    this.container = _parentElement;

    this.init();
  };

  area = d3.area()
    .x(d => this.x(parseTime(d.data.date)))
    .y0(d => this.y(d[0]))
    .y1(d => this.y(d[1]));

  init() {
    const svg = d3.select(this.container)
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom);

    this.g = svg.append('g')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    this.xAxis = this.g.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', `translate(0, ${this.height})`);
    this.xAxisCall = d3.axisBottom().ticks(4);

    this.yAxis = this.g.append('g')
      .attr('class', 'axis axis--y');
    this.yAxisCall = d3.axisLeft();

    this.color.domain(teams.map(d => d.key));
    this.stack.keys(teams.map(d => d.key));

    this.legend = svg.append('g')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top / 2})`);

    const offset = this.width / teams.length;
    const legendRow = this.legend.selectAll('.stack-area-legend-row')
      .data(teams)
      .enter()
      .append('g')
      .attr('class', 'stack-area-legend-row')
      .attr('transform', (d, i) => `translate(${i * offset + offset / 1.5}, 0)`);

    legendRow.append('rect')
      .attr('width', 10)
      .attr('height', 10)
      .attr('fill', d => this.color(d.key))
      .on("mouseover", this.highlight)
      .on("mouseleave", this.noHighlight);

    legendRow.append('text')
      .attr('x', -10)
      .attr('y', 10)
      .attr('text-anchor', 'end')
      .text(d => capitalize(d.key))
      .on("mouseover", this.highlight)
      .on("mouseleave", this.noHighlight);

    this.format();
  }

  format() {
    this.property = $('#var-select').val();

    this.x.domain(d3.extent(data, d => d.date));

    this.data = d3.nest()
      .key(d => formatTime(d.date))
      .entries(data)
      .map(d => {
        return d.values.reduce((accum, i) => {
          accum.date = d.key;
          accum[i.team] += i[this.property];
          return accum;
        }, teams.reduce((o, i) => (o[i.key] = 0, o), {}))
      });

    this.y.domain([0, d3.max(this.data.map(i => i.midwest + i.northeast + i.south + i.west))]);

    this.update();
  }

  update() {
    var layers = this.g.selectAll('.layer')
      .data(this.stack(this.data));

    layers.enter()
      .append('g')
      .attr('class', 'layer')
      .append('path')
      .attr('class', d => `area ${d.key}`)
      .style('fill', d => this.color(d.key))
      .attr('d', d => this.area(d));


    layers.select('.area')
      .transition(this.t())
      .attr('d', d => this.area(d));

    this.xAxisCall.scale(this.x);
    this.xAxis.transition(this.t()).call(this.xAxisCall);

    this.yAxisCall.scale(this.y);
    this.yAxis.transition(this.t()).call(this.yAxisCall);
  }

  highlight(d) {
    d3.selectAll(".area")
      .style("opacity", .1)

    d3.select("." + d.key)
      .style("opacity", 1)
  }

  noHighlight(d) {
    d3.selectAll(".area")
      .style("opacity", 1)
  }
}