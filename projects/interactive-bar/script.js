/*
	D3.js (version 5) interactive bar chart
	Author: Jake Zhong(www.jakezhong.com)
*/

/*
	Declare and initialize global vars
*/
let dataset = d3.csv("data.csv");
let neighborhoods_set = d3.map();
let neighborhoods = [];
let records = [];
let color;
let legends = new Array();
let legend_size = 12;

/*
	Initialize dataset
	1. neighborhoods_set: a map to store all neighborhoods' name without duplication
	2. neighborhoods: an array to store all neighborhoods' data
	3. records: an array to store each record and its data
*/
dataset.then(function(data) {
	// Go throug the data and store each neighborhood and its data
	data.forEach(function(neighborhood) {
		let name = neighborhood.neighborhoods_analysis_boundaries;
		let record = {call_type_group: neighborhood.call_type_group, number_of_records: neighborhood.number_of_records};
		let total = parseInt(neighborhood.number_of_records);

		if (neighborhoods_set.has(name)) {
			neighborhoods_set.get(name).records.push(record);
			neighborhoods_set.get(name).total += total;
		} else {
			neighborhoods_set.set(name, {name: name, records: [record], total: total});
		}
	});

	// Convert the map to be a new array
	neighborhoods_set.each(function(neighborhood) {
		neighborhoods.push(neighborhood);
	});

	// Break down each neighborhood into smaller record and store them in a new array
	records = neighborhoods.map(function(e) {
		let neighborhood = e;
		let records = neighborhood.records;
		let start = 0;
		let number = [];

		records.forEach(function(record) {
			let key = record.call_type_group;
			let end = start + parseInt(record.number_of_records);
			const result = [];

			result[0] = parseInt(start);
			result[1] = end;
			result["data"] = neighborhood;
			result["key"] = key;

			start = end;
			number.push(result);
		});

		return number;
	});

	// Convert matrix into one-dimension array
	records = records.flat();

	// Initialize the legend's array
	records[0].forEach(function(legend) {
		legends.push(legend['key']);
	});

	// Color object for color scheme
	color = d3.scaleOrdinal()
	  .domain([records[0].keys])
	  .range(["red", "steelblue", "green", "orange"]);

	init_bar();
});

/*
	Create the bar chart
	1. bars: container for all the bars
	2. bar: one column of the bar
	3. block: one call type in one column of the bar
*/
function init_bar() {
	let svg = d3.select(".svg-container svg"),
		margin = 200,
		width = svg.attr("width") - margin,
		height = svg.attr("height") - margin;

	svg
	   .append("text")
	   .attr("transform", "translate(100,0)")
	   .attr("x", -100)
	   .attr("y", 20)
	   .text("Sum of Number of Emergencies for each Neighborhoods")
	   .style("font-size", 34)
	   .style("font-weight", "bold");

	let g = svg
			.append("g")
		   	.attr("transform", "translate(" + 192 + "," + 140 + ")");

	// Initialize scale
	let xScale = d3.scaleLinear()
				.range([0, width])
				.domain([0, d3.max(neighborhoods.map(function(d) {
					return d.total;
				}))]);

	let	yScale = d3.scaleBand()
				.range([0, height])
				.padding(0.2)
				.domain(neighborhoods.map(function(d) { 
					return d.name;
				}));

	// Create axises
	let xAxis = g.append("g")
				 .attr("transform", "translate(0," + height + ")")
				 .call(d3.axisBottom(xScale).tickFormat(function(d){
					 return d/1000 + "K";
				 })
				 .ticks(10))
				 .attr("class", "x-axis")
				 .append("text")
				 .attr("class", "label")
				 .attr("y", 45)
				 .attr("x", width)
				 .attr("text-anchor", "end")
				 .attr("stroke", "#2d3666")
				 .text("Number of Emergencies");

	let yAxis = g.append("g")
				 .call(d3.axisLeft(yScale))
				 .attr("class", "y-axis")
				 .append("text")
				 .attr("transform", "rotate(-90)")
				 .attr("y", 60)
				 .attr("dy", "-16em")
				 .attr("text-anchor", "end")
				 .attr("stroke", "#2d3666")
				 .attr("class", "label")
				 .text("Neighborhoods - Analysis Boundaries");

	// Create the bars' container
	let bars = g.append("g")
				 .attr("class", "bars")
				 .attr("x", 0)
				 .attr("y", 200);

	// Create each bar:
	// Column is the number
	// Row is the neighborhood
	let bar = bars
				.selectAll(".bar")
				 .data(neighborhoods)
				 .enter()
				 .append("rect")
				 .attr("class", "bar")
				 .attr("x", 0)
				 .attr("y", function(d) {
					return yScale(d.name);
				 })
				 .attr("width", function(d) {
					return xScale(d.total);
				 })
				 .attr("height", yScale.bandwidth());

	/*
		Call type group blocks:
		Fill in with different colors by call types
	*/
	let block = bars
				.selectAll(".block")
				 .data(records)
				 .enter()
				 .append("rect")
				 .attr("class", function(d) {
					 let key = d.key.toLowerCase().replace(/[&\/\\#, +()$~%.'":*?<>{}]/g, '_');
					 let data = d.data.name.toLowerCase().replace(/[&\/\\#, +()$~%.'":*?<>{}]/g, '_');
					 return "block " + key + " " + data;
				 })
				 .attr("fill", function(d) {
					return color(d.key);
				 })
				 .attr("x", function(d) {
					return xScale(d[0]);
				 })
				 .attr("y", function(d, i) {
					return yScale(d.data.name);
				 })
				 .attr("width", function(d) {
					return xScale(d[1]) - xScale(d[0]);
				 })
				 .attr("height", yScale.bandwidth());

	// Add one dot in the legend for each name.
	let legent_title = svg
						.append("text")
					   	.attr("transform", "translate(100,0)")
					   	.attr("x", 690)
					   	.attr("y", 10)
					   	.text("Call Type Group")
						.attr("class", "legend-title");

	let legend_rect = svg
						.selectAll("legend-rects")
						.data(records[0].data.records)
						.enter()
						.append("rect")
						.attr("x", 790)
						.attr("y", function(d,i){ return i * (legend_size + 5) + 22})
						.attr("width", legend_size)
						.attr("height", legend_size)
						.attr("class", "legend-rect")
						.style("fill", function(d) {
							return color(d.call_type_group);
						});

	// Add one dot in the legend for each name.
	let legend_label = svg
						.selectAll("legend-labels")
						.data(records[0].data.records)
						.enter()
						.append("text")
						.attr("x", 790 + legend_size * 1.5)
						.attr("y", function(d,i){ return i * (legend_size+5) + (legend_size/2) + 22})
						.text(function(d){ return d.call_type_group; })
						.attr("text-anchor", "left")
						.style("alignment-baseline", "middle")
						.attr("class", "legend-label")
						.style("fill", "#000");

	/*
		Interactivities
	*/
	var tooltip = d3.select("body").append("div").attr("class", "toolTip");

	// Mouse over to highlight the current call type among one neighborhood
	block
		.on("mouseover", function(d) {
			bars
			.selectAll("." + d.data.name.toLowerCase().replace(/[&\/\\#, +()$~%.'":*?<>{}]/g, '_'))
			.transition()
			.style("opacity", 0.5);

			d3.select(this)
			  .raise() // bring to front
			  .transition()
			  .style("opacity", 1);

			tooltip
			  .style("left", d3.event.pageX + "px")
			  .style("top", d3.event.pageY + "px")
			  .style("display", "inline-block")
			  .style("color", function() {
					return color(d.key);
				})
			  .html(function() {
				let str = "";
				str += "Neighborhood: " + d.data.name + "<br>";
				str += "Call type: " + d.key + "<br>";
				str += "# of emergencies: " + (d[1] - d[0]) + "<br>";
				str += "Ratio among this neighborhood: " + ((d[1] - d[0]) / d.data.total * 100).toFixed(1) + "%" + "<br>";

				return str;
			   });
		}).on("mouseout", function(d) {
			bars
			.selectAll(".block")
			.transition()
			.style("opacity", 1);

			bars
			.selectAll(".block")
			.transition()
			.style("opacity", 1)
			.attr("stroke-width", "0");

			tooltip.style("display", "none");
		});

	// Click to highlight the current call type among all neighborhoods
	block
		.on("click", function(d) {
			bars
				.selectAll(".block")
				.transition()
				.style("opacity", 0.5);

			bars
				.selectAll("." + d.key.toLowerCase().replace(/[&\/\\#, +()$~%.'":*?<>{}]/g, '_'))
				.transition()
				.style("opacity", 1);

			d3.select(this)
				.raise() // bring to front
				.transition()
				.attr("stroke", "#f00")
				.attr("stroke-width", "3");

			tooltip
				.style("left", d3.event.pageX + "px")
				.style("top", d3.event.pageY + "px")
				.style("display", "inline-block")
				.style("color", function() {
					return color(d.key);
				})
				.html((function() {
					let str = "";
					let total = (function (){
						let sum = 0;
						
						records.forEach(function(record) {
							if (record.key == d.key) {
								sum += record[1] - record[0];
							}
						});

						return sum;
					})();

					str += "Neighborhood: " + d.data.name + "<br>";
					str += "Call type: " + d.key + "<br>";
					str += "# of emergencies: " + (d[1] - d[0]) + "<br>";
					str += "Ratio among all neighborhoods: " + ((d[1] - d[0]) / total * 100).toFixed(1) + "%" + "<br>";

					return str;
				})());
		});

	// Zooming for the bars
	const extent = [[margin, margin], [width - margin, height - margin]];

	svg.call(
		d3
		.zoom()
		.scaleExtent([1, 4])
		.extent([[0, 0], [width, height]])
		.on("zoom", zoomed)
	);

	function zoomed() {
		yScale.range([0, height].map(function(d) {
			return d3.event.transform.applyY(d);
		}));

		g.lower();

		svg
		.selectAll(".x-axis")
		.raise();

		svg
		.selectAll(".y-axis")
		.call(d3.axisLeft(yScale));

		svg
		.selectAll(".bar")
		.attr("y", function(d) {
			return yScale(d.name);
		})
		.attr("height", yScale.bandwidth());

		svg
		.selectAll(".block")
		.attr("y", function(d, i) {
			return yScale(d.data.name);
		})
		.attr("height", yScale.bandwidth());
	}
}