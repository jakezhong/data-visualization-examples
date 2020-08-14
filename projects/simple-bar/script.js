/*
	Simple D3.js (version 5) Bar Chart
	Author: Jake Zhong(www.jakezhong.com)
*/

// Create a svg as container with 200 white space
var svg = d3.select(".svg-container svg"),
	margin = 200,
	width = svg.attr("width") - margin,
	height = svg.attr("height") - margin;

// Append the title
svg.append("text")
   .attr("transform", "translate(100,0)")
   .attr("x", 50)
   .attr("y", 50)
   .text("Sum of Passenger Count for each GEO Region");

// Initialize the x and y scale
var xScale = d3.scaleBand().range([0, width]).padding(0.4),
	yScale = d3.scaleLinear().range([height, 0]);

var g = svg.append("g")
		   .attr("transform", "translate(" + 100 + "," + 100 + ")");

var dataset = d3.csv("data.csv");

dataset.then(function(data) {
	// Initialize the x and y domains based on the data
	xScale.domain(data.map(function(d) { return d.geo_region; }));
	yScale.domain([0, d3.max(data, function(d) { return d.passenger_count/1000000; })]);
	
	// Create the X-Axis
	g.append("g")
	 .attr("transform", "translate(0," + height + ")")
	 .call(d3.axisBottom(xScale))
	 .append("text")
	 .attr("y", height - 250)
	 .attr("x", width - 100)
	 .attr("text-anchor", "end")
	 .attr("stroke", "black")
	 .text("GEO Region");

	// Create the Y-Axis
	g.append("g")
	 .call(d3.axisLeft(yScale).tickFormat(function(d){
		 return d + "M";
	 })
	 .ticks(10))
	 .append("text")
	 .attr("transform", "rotate(-90)")
	 .attr("y", 6)
	 .attr("dy", "-5.1em")
	 .attr("text-anchor", "end")
	 .attr("stroke", "black")
	 .text("Passenger Count");

	// Create bars
	g.selectAll(".bar")
	 .data(data)
	 .enter().append("rect")
	 .attr("class", "bar")
	 .attr("x", function(d) { return xScale(d.geo_region); })
	 .attr("y", function(d) { return yScale(d.passenger_count/1000000); })
	 .attr("width", xScale.bandwidth())
	 .attr("height", function(d) { return height - yScale(d.passenger_count/1000000); });
});