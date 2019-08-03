class DonutChart {
    margin = { left: 40, right: 100, top: 40, bottom: 10 };
    width = 350 - this.margin.left - this.margin.right;
    height = 150 - this.margin.top - this.margin.bottom;
    radius = Math.min(this.width, this.height) / 2;

    pie = d3.pie()
        .value(d => d.value)
        .sort(null);

    arc = d3.arc()
        .padAngle(0.03)
        .innerRadius(this.radius - 15)
        .outerRadius(this.radius);

    color = d3.scaleOrdinal()
        .range(['#3182BD', '#6AAED6', '#9ECAE2']);

    constructor(_parentElement) {
        this.container = _parentElement;

        this.init();
    };

    init() {
        const svg = d3.select(this.container)
            .append('svg')
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom);

        this.g = svg.append('g')
            .attr('transform', `translate(${this.margin.left + (this.width / 2)}, ${this.margin.top + (this.height / 2)})`);

        this.g.append('text')
            .attr('y', -60)
            .attr('x', -100)
            .attr('font-size', '12px')
            .attr('text-anchor', 'start')
            .text('Company size');

        this.g.append('text')
            .datum(this.data)
            .attr('x', 0)
            .attr('y', this.radius / 10)
            .attr('class', 'text-tooltip')
            .style('text-anchor', 'middle')
            .attr('font-weight', 'bold')
            .style('font-size', `${this.radius / 2.5}px`);

        this.legend = svg.append('g')
            .attr('transform', `translate(${this.width + this.margin.right - 30}, ${this.height - 30})`);

        const legendRow = this.legend.selectAll('.donut-legend-row')
            .data(companySizes)
            .enter()
            .append('g')
            .attr('class', 'donut-legend-row')
            .attr('transform', (d, i) => `translate(0, ${i * 20})`);

        legendRow.append('rect')
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', d => this.color(d.key))
            .on('mouseover', d => this.highlight(d.key))
            .on('mouseout', d => this.noHighlight(d.key));

        legendRow.append('text')
            .attr('x', -10)
            .attr('y', 10)
            .attr('text-anchor', 'end')
            .text(d => capitalize(d.key))
            .on('mouseover', d => this.highlight(d.key))
            .on('mouseout', d => this.noHighlight(d.key));

        this.format();
    }

    format() {
        this.data = d3.nest()
            .key(d => d.company_size)
            .entries(data)
            .map(({ key, values }) => { return { key, value: values.length }; });

        this.update();
    }

    update() {
        const path = this.g.selectAll('path')
            .data(this.pie(this.data));

        path.enter()
            .append('path')
            .attr('fill', d => this.color(d.data.key))
            .attr('d', d => this.arc(d))
            .each(function (d) { this._current = d; })
            .on('mouseover', d => this.highlight(d.data.key))
            .on('mouseout', d => this.noHighlight(d.data.key));

        path.transition()
            .duration(750)
            .attrTween('d', arcTween)

        const that = this;
        function arcTween(d) {
            var i = d3.interpolate(this._current, d);
            this._current = i(0);
            return t => that.arc(i(t));
        }
    }


    highlight(key) {
        const sizeData = this.data.find(d => d.key === key);

        this.g.select('text.text-tooltip')
            .attr('fill', this.color(key))
            .text(`${sizeData.value}`);

        this.g.selectAll('path')
            .attr('fill-opacity', i => i.data.key === key ? 1 : 0.3);
    }

    noHighlight(d) {
        this.g.select('text.text-tooltip')
            .text('');

        this.g.selectAll('path')
            .attr('fill-opacity', 1);
    }
}