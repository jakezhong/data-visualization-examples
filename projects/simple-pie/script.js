/*
	Simple D3.js (version 5) Pie Chart
	Author: Jake Zhong(www.jakezhong.com)
*/

// Create a svg as container, set the radius to the min between width and height
var svg = d3.select(".svg-container svg"),
	width = svg.attr("width"),
	height = svg.attr("height"),
	radius = Math.min(width, height) / 2;

// Append the title
svg.append("g")
   .attr("transform", "translate(" + (width / 2 - 205) + "," + 20 + ")")
   .append("text")
   .text("Boarding Area and sum of Passenger Count")
   .attr("class", "title")
   .style("font-size", 34)
   .style("font-weight", "bold");;

// Append a circle
var g = svg.append("g")
		   .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

// Define the color range
var color = d3.scaleOrdinal(['#1f77b4','#ff7f0e','#2ca02c','#d62728','#8c564b','#ffd94a','#9467bd']);

var pie = d3.pie().value(function(d) { 
	return d.passenger_count; 
});

var path = d3.arc()
			 .outerRadius(radius - 50)
			 .innerRadius(0);

var label = d3.arc()
			  .outerRadius(radius)
			  .innerRadius(radius - 80);

var dataset = d3.csv("data.csv");

dataset.then(function(data) {
	var arc = g.selectAll(".arc")
			   .data(pie(data))
			   .enter().append("g")
			   .attr("class", "arc");

	arc.append("path")
	   .attr("d", path)
	   .attr("fill", function(d) { return color(d.data.boarding_area); });

	console.log(arc)

	arc.append("text")
	   .attr("transform", function(d) { 
				return "translate(" + label.centroid(d) + ")"; 
		})
	   .text(function(d) { return d.data.boarding_area; });
});