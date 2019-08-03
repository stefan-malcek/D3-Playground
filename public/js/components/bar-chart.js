class BarChart {
  margin = { left: 60, right: 50, top: 50, bottom: 30 };
  width = 350 - this.margin.left - this.margin.right;
  height = 160 - this.margin.top - this.margin.bottom;

  x = d3.scaleBand()
    .rangeRound([0, this.width])
    .paddingInner([0.5])
    .paddingOuter([0.3]);

  y = d3.scaleLinear()
    .rangeRound([this.height, 0]);

  color = d3.scaleOrdinal()
    .range(['#9C9EDE', '#393B79', '#5254A3', '#6B6ECF']);

  t = () => d3.transition().duration(750);

  constructor(_parentElement, _property, _title) {
    this.container = _parentElement;
    this.property = _property;
    this.title = _title;

    this.init();
  };

  init() {
    const svg = d3.select(this.container)
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom);

    this.g = svg.append('g')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    this.x.domain(categories.map(d => d.key));
    this.g.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', `translate(0, ${this.height})`)
      .call(d3.axisBottom(this.x)
        .tickFormat(d => capitalize(d)));

    this.yAxis = this.g.append('g')
      .attr('class', 'axis axis--y');
    this.yAxisCall = d3.axisLeft()
      .ticks(5);

    this.g.append('text')
      .attr('y', -15)
      .attr('x', -15)
      .attr('font-size', '12px')
      .attr('text-anchor', 'start')
      .text(this.title);

    this.format();
  }

  format() {
    this.data = d3.nest()
      .key(d => d.category)
      .entries(data)
      .map(({ key, values }) => {
        return {
          key,
          value: values.reduce((avg, i) => avg + i[this.property], 0) / values.length
        };
      });

    this.y.domain([0, d3.max(this.data, d => d.value)]);

    this.update();
  }

  update() {
    this.yAxisCall.scale(this.y);
    this.yAxis.transition(this.t()).call(this.yAxisCall);

    const bars = this.g.selectAll('.bar')
      .data(this.data);
    bars.enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => this.x(d.key))
      .attr('y', d => this.y(d.value))
      .attr('width', this.x.bandwidth())
      .attr('fill', d => this.color(d.key))
      .attr('height', d => this.height - this.y(d.value))
      .merge(bars)
      .transition(this.t())
      .attr('y', d => this.y(d.value))
      .attr('height', d => this.height - this.y(d.value));
  }
}