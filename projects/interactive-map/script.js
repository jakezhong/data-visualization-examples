/*
	D3.js (version 5) Non-Proportional Symbol Map visualizing data from the "SF 311 dataset.
	Author: Jake Zhong(www.jakezhong.com)
*/

// Initialize API urls
const urls = {
	basemap: "https://data.sfgov.org/resource/6ia5-2f8k.geojson",
	streets: "https://data.sfgov.org/resource/3psu-pn9h.geojson?$limit=2000",
	cases: "https://data.sfgov.org/resource/vw6y-z8j6.json"
};

// calculate date range
const end = d3.timeDay.floor(d3.timeDay.offset(new Date(), -1));
const start = d3.timeDay.floor(d3.timeDay.offset(end, -7));
const format = d3.timeFormat("%Y-%m-%dT%H:%M:%S");

// Some query for API wrangling
urls.cases += "?$where=starts_with(service_name, 'Parking Enforcement')";
urls.cases += " AND requested_datetime between '2020-02-01T00:00:00'";
urls.cases += " and '2020-02-29T23:59:59'";
urls.cases += " AND point IS NOT NULL";
// output url before encoding

// encode special characters
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI
urls.cases = encodeURI(urls.cases);

// Create a svg object
const svg = d3
	.select(".svg-container")
	.select("svg")
	.attr("x", 0);

let width = 960, height = 500;

let neighborhoods_set = d3.map();

let neighborhoods = [];

let color_range = [];

var colorScale;

// Initialize g objects
const g = {
  basemap: svg.select("g#basemap"),
  streets: svg.select("g#streets"),
  outline: svg.select("g#outline"),
  cases: svg.select("g#cases"),
  tooltip: svg.select("g#tooltip"),
  details: svg.select("g#details"),
  legend: svg.select("g#legend")
};

// setup tooltip (shows neighborhood name)
const tip = g
			.tooltip
			.append("foreignObject")
			.attr("class", "neighborhood-tooltip")
			.attr("text-anchor", "end")
			.attr("dx", -5)
			.attr("dy", -5)
			.attr("width", 200)
			.attr("height", 60)
			.style("visibility", "hidden");

// add details widget
// https://bl.ocks.org/mbostock/1424037
const details = g.details
				.append("foreignObject")
				.attr("id", "details")
				.attr("width", width)
				.attr("height", height)
				.attr("x", 0)
				.attr("y", 0);

const body = details
			.append("xhtml:body")
			.style("text-align", "left")
			.style("background", "none")
			.html("<p>N/A</p>")
			.style("visibility", "hidden");

// setup projection
// https://github.com/d3/d3-geo#geoConicEqualArea
const projection = d3.geoConicEqualArea();
projection.parallels([37.692514, 37.840699]);
projection.rotate([122, 0]);

// setup path generator (note it is a GEO path, not a normal path)
const path = d3.geoPath().projection(projection);

d3.json(urls.basemap).then(function(json) {
	// makes sure to adjust projection to fit all of our regions
	projection.fitSize([width, height], json);

	d3.json(urls.streets).then(drawStreets);

	d3.json(urls.cases).then(function(json) {
		fillNeighborhood(json);
		d3.json(urls.basemap).then(drawBasemap);
		// draw the land and neighborhood outlines
		drawCases(json);
		drawLegend();
	});

	// now that projection has been set trigger loading the other files
	// note that the actual order these files are loaded may differ
});

// Start to draw the base map
function drawBasemap(json) {
  const basemap = g.basemap
					.selectAll("path.land")
					.data(json.features)
					.enter()
					.append("path")
					.attr("d", path)
					.attr("class", "land")
					.attr("transform", "translate(0," + 100 + ")")
					.attr("fill", function(d) {
					  if (neighborhoods_set.get(d.properties.name)) {
						  d.number = neighborhoods_set.get(d.properties.name).number;
					  } else {
						  d.number = 0;
					  }
					  return colorScale(d.number);
					});

  const outline = g.outline
  					.selectAll("path.neighborhood")
					.data(json.features)
					.enter()
					.append("path")
					.attr("d", path)
					.attr("class", "neighborhood")
					.attr("transform", "translate(0," + 100 + ")")
					.each(function(d) {
					// save selection in data for interactivity
					// saves search time finding the right outline later
					d.properties.outline = this;
					});

  // add highlight
  basemap
	  .on("mouseover.highlight", function(d) {
		d3.select(d.properties.outline).raise();
		d3.select(d.properties.outline).classed("active", true);
	  })
	  .on("mouseout.highlight", function(d) {
		d3.select(d.properties.outline).classed("active", false);
	  });

  // add tooltip
  basemap
	  .on("mouseover.tooltip", function(d) {
		let html = d.properties.name;
			html += "<br># of cases: " + d.number;

		tip.html(html);
		tip.style("visibility", "visible");
	  })
	  .on("mousemove.tooltip", function(d) {
		const coords = d3.mouse(g.basemap.node());
		tip.attr("x", coords[0] - 100);
		tip.attr("y", coords[1] - 65);
	  })
	  .on("mouseout.tooltip", function(d) {
		tip.style("visibility", "hidden");
	  });
}

// initialize a neighborhood list and store its case number
function fillNeighborhood(json) {
	json.forEach(function(neighborhood) {
		let name = neighborhood.neighborhoods_sffind_boundaries;
		if (neighborhoods_set.has(name)) {
			neighborhoods_set.get(name).number += 1;
		} else {
			neighborhoods_set.set(name, {name: name, number: 1});
		}
	});

	neighborhoods_set.each(function(e) {
		neighborhoods.push([e.name, e.number]);
	});

	color_max = d3.max(neighborhoods.map(function(d) {
		return d[1];
	}));

	color_max = Math.ceil(color_max/100)*100;

	for (let i = 1; i < 6; i++) {
		color_range.push(i * color_max/5);
	}

	colorScale = d3.scaleThreshold()
	.domain(color_range)
	.range(["#fff1de", "#fdd5a4", "#f88457", "#e55037", "#8e0000"]);
}

// Start the draw streets on the map
function drawStreets(json) {
  // only show active streets
  const streets = json.features.filter(function(d) {
	return d.properties.active;
  });
	
  g.streets
	.selectAll("path.street")
	.data(streets)
	.enter()
	.append("path")
	.attr("d", path)
	.attr("transform", "translate(0," + 100 + ")")
	.attr("class", "street");
}

// Start to draw case dots on the map
function drawCases(json) {
	// loop through and add projected (x, y) coordinates
	// (just makes our d3 code a bit more simple later)
	json.forEach(function(d) {
		const latitude = parseFloat(d.lat);
		const longitude = parseFloat(d.long);
		const pixels = projection([longitude, latitude]);

		d.x = pixels[0];
		d.y = pixels[1];
	});

  	const symbols = g.cases
  					.selectAll("circle")
					.data(json)
					.enter()
					.append("circle")
					.attr("cx", d => d.x)
					.attr("cy", d => d.y)
					.attr("r", 5)
					.style("stroke", 1)
					.attr("class", "symbol")
					.attr("transform", "translate(0," + 100 + ")")
					.attr("fill", function(d) {
					  if (d.status_description != "Closed") {
						return "red";
					  }
					  return;
					});
	
	// Display the tooltip on hover
	symbols.on("mouseover", function(d) {
		d3.select(this).raise();
		d3.select(this).classed("active", true);

		// use template literal for the detail table
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
		let formatDate = d3.timeFormat("%B %d, %Y");

		const html = `
		  <table class="info-table" border="0" cellspacing="0" cellpadding="2">
		  <tbody>
			<tr>
			  <th>Service Name:</th>
			  <td>${d.service_name}</td>
			</tr>
			<tr>
			  <th>Date:</th>
			  <td>${formatDate(new Date(d.requested_datetime))}</td>
			</tr>
			<tr>
			  <th>Neighborhood:</th>
			  <td>${d.neighborhoods_sffind_boundaries}</td>
			</tr>
			<tr>
			  <th>Vehicle Details:</th>
			  <td>${d.service_details}</td>
			</tr>
			<tr>
			  <th>Status:</th>
			  <td>${d.status_description}</td>
			</tr>
			<tr>
			  <th>Description:</th>
			  <td>${d.status_notes}</td>
			</tr>
		  </tbody>
		  </table>
		`;

		body.html(html);
		details.style("visibility", "visible");
	});
	
	// Hide the tooltip when mouse is out
	symbols.on("mouseout", function(d) {
		d3.select(this).classed("active", false);
		details.style("visibility", "hidden");
	});
}

// Start to draw the legend
function drawLegend() {
	let legend_height = 20;
	let legend_width = 40;

	const legend = g.legend
		.attr("x", 0)
		.attr("y", 0);

	let background = legend
		.append("rect")
		.attr("width", 300)
		.attr("height", 90)
		.attr("x", 645)
		.attr("y", 0)
		.style("fill", "#fff");

	// Add one dot in the legend for each name.
	let legend_title = legend
		.append("text")
		.attr("transform", "translate(100,0)")
		.text("Total Cases")
		.attr("x", 650)
		.attr("y", 30)
		.style("fill", "#000")
		.attr("class", "legend-title");

	let legend_rect = legend.selectAll("legend-rects")
		.data(colorScale.range())
		.enter()
		.append("rect")
		.attr("x", function(d,i){ return 690 + i * legend_width })
		.attr("y", 50)
		.attr("width", legend_width)
		.attr("height", legend_height)
		.attr("class", "legend-rect")
		.style("fill", function(d) {
			return d;
		});

	// Legend labels
	legend
	.append("text")
	.attr("x", 675)
	.attr("y", 45)
	.text("0")
	.attr("text-anchor", "left")
	.style("alignment-baseline", "middle")
	.attr("class", "legend-label")
	.style("fill", "#000");

	legend
	.append("text")
	.attr("x", 895)
	.attr("y", 45)
	.text("100")
	.attr("text-anchor", "left")
	.style("alignment-baseline", "middle")
	.attr("class", "legend-label")
	.style("fill", "#000");
}

// Zooming for the bars
const extent = [0, [width, height]];

svg.call(
	d3.zoom()
	.scaleExtent([1, 4])
	.extent([[0, 0], [width, height]])
	.on("zoom", zoomed)
)

function zoomed() {
	g.basemap.selectAll("path.land").attr('transform', d3.event.transform);
	g.outline.selectAll("path.neighborhood").attr('transform', d3.event.transform);
	g.streets.selectAll("path.street").attr('transform', d3.event.transform);
	
	g.cases
	.selectAll("circle")
	.attr('transform', d3.event.transform)
	.attr("r", 5/d3.event.transform.k)
	.style("stroke-width", 1/d3.event.transform.k);
}