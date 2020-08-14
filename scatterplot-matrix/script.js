/*
	D3.js (version 5) Scatterplot Matrix
	Author: Jake Zhong(www.jakezhong.com)
*/

const	margin = 200,
	padding = 20,
	size = 140;

const svg = d3.select(".svg-container svg");

const x = d3.scaleLinear()
	.range([padding / 2, size - padding / 2]);

const y = d3.scaleLinear()
	.range([size - padding / 2, padding / 2]);

const xAxis = d3.axisBottom()
	.scale(x)
	.ticks(6);

const yAxis = d3.axisLeft()
	.scale(y)
	.ticks(6);

const color = d3.scaleOrdinal(d3.schemeCategory10);

const dataset = d3.csv("data.csv");

dataset.then(function(data) {
	let domainByTrait = {},
		traits = d3.keys(data[0]).filter(function(d) { return d !== "tier_name"; }),
		n = traits.length;

	let legends = new Array();

	data.forEach(function(legend) {
		legends.push(legend['tier_name']);
	});


	let matrix = svg
			.append("g")
			.attr("class", "matrix")
			.attr("transform", "translate(" + padding + "," + padding / 2 + ")");

	traits.forEach(function(trait) {
		domainByTrait[trait] = d3.extent(data, function(d) {
			return Number(d[trait]);
		});
	});

	xAxis.tickSize(size * n);
	yAxis.tickSize(-size * n);
	
	matrix.selectAll(".x.axis")
		.data(traits)
		.enter().append("g")
		.attr("class", "x axis")
		.attr("transform", function(d, i) { return "translate(" + (n - i - 1) * size + ",0)"; })
		.each(function(d) {
			x.domain(domainByTrait[d]);
			d3.select(this).call(xAxis);
		});

	matrix.selectAll(".y.axis")
		.data(traits)
		.enter().append("g")
		.attr("class", "y axis")
		.attr("transform", function(d, i) { return "translate(0," + i * size + ")"; })
		.each(function(d) {
			y.domain(domainByTrait[d]);
			d3.select(this).call(yAxis);
		});


	let cell = matrix.selectAll(".cell")
		.data(cross(traits, traits))
		.enter().append("g")
		.attr("class", "cell")
		.attr("transform", function(d) { return "translate(" + (n - d.i - 1) * size + "," + d.j * size + ")"; })
		.each(plot);

	// Titles for the diagonal.
	cell.filter(function(d) { return d.i === d.j; }).append("text")
		.attr("x", padding)
		.attr("y", padding)
		.attr("dy", "1em")
		.text(function(d) { return d.x; });
	
		
	legend();

	// Function to draw the matrix
	function plot(p) {
		var cell = d3.select(this);

		x.domain(domainByTrait[p.x]);
		y.domain(domainByTrait[p.y]);

		cell.append("rect")
			.attr("class", "frame")
			.attr("x", padding / 2)
			.attr("y", padding / 2)
			.attr("width", size - padding)
			.attr("height", size - padding);

		cell.selectAll("circle")
			.data(data)
			.enter().append("circle")
			.attr("cx", function(d) { return x(d[p.x]); })
			.attr("cy", function(d) { return y(d[p.y]); })
			.attr("r", 4)
			.style("fill", function(d) { return color(d.tier_name); });

	}
	
	// Function to draw the legend
	function legend() {
		const legend_size = 12;
		// Add one dot in the legend for each name.
		const legend = svg
				.append("g")
				.attr("class", "legend");
		
		const rects = legend
				.append("g")
				.attr("class", "rects");
		
		const labels = legend
				.append("g")
				.attr("class", "rects");
		
		rects.selectAll("legend-rects")
			.data(data)
			.enter()
			.append("rect")
			.attr("x", 730)
			.attr("y", function(d,i){ return i * (legend_size+5)})
			.attr("width", legend_size)
			.attr("height", legend_size)
			.attr("class", "legend-rect")
			.style("fill", function(d) { return color(d.tier_name); });

		// Add one dot in the legend for each name.
		labels.selectAll("legend-labels")
			.data(data)
			.enter()
			.append("text")
			.attr("x", 730 + legend_size * 1.5)
			.attr("y", function(d,i){ return i * (legend_size+5) + (legend_size/2)})
			.text(function(d){ return d.tier_name; })
			.attr("text-anchor", "left")
			.style("alignment-baseline", "middle")
			.attr("class", "legend-label")
			.style("fill", function(d) { return color(d.tier_name); });
	}
	
	// Function to draw the cross line titles
	function cross(a, b) {
	  var c = [], n = a.length, m = b.length, i, j;
	  for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({x: a[i], i: i, y: b[j], j: j});
	  return c;
	}
});
