/*
	D3.js (version 5) interactive multi-components graph, including map, bar and line charts, based on real estate data from Zillow
	Author: Jake Zhong(www.jakezhong.com)
*/

// Declare cities in the bay area
let bayareaCitiesList = ["Albany", "American Canyon", "Antioch", "Atherton", "Belmont", "Belvedere", "Benicia", "Berkeley", "Brentwood", "Brisbane", "Burlingame", "Calistoga", "Campbell", "Clayton", "Cloverdale", "Colma", "Concord", "Corte Madera", "Cotati", "Cupertino", "Daly City", "Danville", "Dixon", "Dublin", "East Palo Alto", "El Cerrito", "Emeryville", "Fairfax", "Foster City", "Fremont", "Gilroy", "Half Moon Bay", "Hayward", "Healdsburg", "Hercules", "Hillsborough", "Lafayette", "Larkspur", "Livermore", "Los Altos", "Los Altos Hills", "Los Gatos", "Martinez", "Menlo Park", "Mill Valley", "Millbrae", "Milpitas", "Monte Sereno", "Moraga", "Morgan Hill", "Mountain View", "Napa", "Newark", "Novato", "Oakland", "Oakley", "Orinda", "Pacifica", "Palo Alto", "Petaluma", "Piedmont", "Pinole", "Pittsburg", "Pleasant Hill", "Pleasanton", "Portola Valley", "Redwood City", "Richmond", "Rio Vista", "Rohnert Park", "Ross", "St. Helena", "San Anselmo", "San Carlos", "San Francisco", "San Jose", "San Leandro", "San Mateo", "San Pablo", "San Rafael", "San Ramon", "Santa Clara", "Santa Rosa", "Saratoga", "Sausalito", "Sebastopol", "Sonoma", "Suisun City", "Sunnyvale", "Tiburon", "Union City", "Vacaville", "Vallejo", "Walnut Creek", "Windsor", "Woodside", "Yountville"];

let records = {};

// Declare years we will use
let count = {
	"2015": 0,
	"2016": 0,
	"2017": 0,
	"2018": 0,
	"2019": 0,
	"2020": 0,
	"total": 0,
	"yearMaximun": 0,
	"yearMinimun": Number.MAX_VALUE,
	"yearMaximunCity": "",
	"yearMaximunYear": "",
	"yearMinimunCity": "",
	"yearMinimunYear": "",
	"totalMaximun": 0,
	"totalMinimun": Number.MAX_VALUE,
	"average": 0
}

// Declare price we will use
let price = {
	"2015": 0,
	"2016": 0,
	"2017": 0,
	"2018": 0,
	"2019": 0,
	"2020": 0,
	"total": 0,
	"yearMaximun": 0,
	"yearMinimun": Number.MAX_VALUE,
	"yearMaximunCity": "",
	"yearMaximunYear": "",
	"yearMinimunCity": "",
	"yearMinimunYear": "",
	"totalMaximun": 0,
	"totalMinimun": Number.MAX_VALUE
}

let data = [];

bayareaCitiesList.forEach(function(elem, index) {
	let record = {
		"id": -1,
		"name": "",
		"latitude": "",
		"longitude": "",
		"2015-count": 0,
		"2016-count": 0,
		"2017-count": 0,
		"2018-count": 0,
		"2019-count": 0,
		"2020-count": 0,
		"2015-2020-count": 0,
		"2015-price": 0,
		"2016-price": 0,
		"2017-price": 0,
		"2018-price": 0,
		"2019-price": 0,
		"2020-price": 0,
		"2015-2020-price": 0
	};

	record["name"] = elem;
	record["id"] = index;
	records[elem] = record;
});

let colorMain = "#3a92ff";
let colorBlack = "rgb(0, 0, 0)";
let colorWhite = "rgb(255, 255, 255)";
let colorPrimary = "rgb(32, 206, 0)";
let colorSecondary = "rgb(0, 114, 212)";
let colorGray = "rgb(147, 147, 147)";

// Load the sale count from the data and save them as year-month
function loadSaleCount() {
	d3.csv("data/Sale_Counts_Seas_Adj_City.csv").then(function(data) {
		if (data == undefined) {
			console.log("Failed to load file");

			return;
		}

		data.forEach(function(d) {
			let sum = 0;

			if (records[d.RegionName] != undefined) {
				for (let i = 2015; i < 2021; i++) {
					if (i === 2020) {
						records[d.RegionName][i+"-count"] = parseInt((~~parseInt(d[i+"-01"]) + ~~parseInt(d[i+"-02"]) + ~~parseInt(d[i+"-03"])) / 3);

						break;
					}
					records[d.RegionName][i+"-count"] = parseInt((~~parseInt(d[i+"-01"]) + ~~parseInt(d[i+"-02"]) + ~~parseInt(d[i+"-03"]) + ~~parseInt(d[i+"-04"]) + ~~parseInt(d[i+"-05"]) + ~~parseInt(d[i+"-06"]) + ~~parseInt(d[i+"-07"]) + ~~parseInt(d[i+"-08"]) + ~~parseInt(d[i+"-09"]) + ~~parseInt(d[i+"-10"]) + ~~parseInt(d[i+"-11"]) + ~~parseInt(d[i+"-12"])));
				}


				for (let i = 2015; i < 2021; i++) {
					sum += records[d.RegionName][i+"-count"];

					count[i] += records[d.RegionName][i+"-count"];

					if (count.yearMaximun < records[d.RegionName][i+"-count"]) {
						count.yearMaximun = records[d.RegionName][i+"-count"];
						count.yearMaximunCity = records[d.RegionName]["name"];
						count.yearMaximunYear = i;
					} else if(count.yearMinimun > records[d.RegionName][i+"-count"] && records[d.RegionName][i+"-count"] != 0) {
						count.yearMinimun = records[d.RegionName][i+"-count"];
						count.yearMinimunCity = records[d.RegionName]["name"];
						count.yearMinimunYear = i;
					}
				}

				records[d.RegionName]["2015-2020-count"] = sum;

				if (count.totalMaximun < sum) {
					count.totalMaximun = sum;
				} else if(count.totalMinimun > sum) {
					count.totalMinimun = sum;
				}

				count.total += sum;
			}
		});

		count.average = ~~parseInt(count.total / bayareaCitiesList.length);

		loadAllHomes();
		loadCities();
	});
};

// Load all home price from the data and save them as year-month
function loadAllHomes() {
	d3.csv("data/City_Zhvi_AllHomes.csv").then(function(data) {
		if (data == undefined) {
			console.log("Failed to load file");

			return;
		}
		data.forEach(function(d) {
			if (records[d.RegionName] != undefined) {
				let sum = 0, average;
				if (records[d.RegionName]["2015-2020-count"] !== 0) {
					for (let i = 2015; i < 2021; i++) {
						if (i === 2020) {
							records[d.RegionName][i+"-price"] = parseInt((~~parseInt(d[i+"-01"]) + ~~parseInt(d[i+"-02"]) + ~~parseInt(d[i+"-03"])) / 3);

							break;
						}

						let total = (~~parseInt(d[i+"-01"]) + ~~parseInt(d[i+"-02"]) + ~~parseInt(d[i+"-03"]) + ~~parseInt(d[i+"-04"]) + ~~parseInt(d[i+"-05"]) + ~~parseInt(d[i+"-06"]) + ~~parseInt(d[i+"-07"]) + ~~parseInt(d[i+"-08"]) + ~~parseInt(d[i+"-09"]) + ~~parseInt(d[i+"-10"]) + ~~parseInt(d[i+"-11"]) + ~~parseInt(d[i+"-12"]));

						records[d.RegionName][i+"-price"] = parseInt(total / 12);

						price.total += total;
					}

					for (let i = 2015; i < 2021; i++) {
						sum += records[d.RegionName][i+"-price"];

						price[i] = records[d.RegionName][i+"-price"];

						if (price.yearMaximun < records[d.RegionName][i+"-price"]) {
							price.yearMaximun = records[d.RegionName][i+"-price"];
							price.yearMaximunCity = records[d.RegionName]["name"];
							price.yearMaximunYear = i;
						} else if(price.yearMinimun > records[d.RegionName][i+"-price"]) {
							price.yearMinimun = records[d.RegionName][i+"-price"];
							price.yearMinimunCity = records[d.RegionName]["name"];
							price.yearMinimunYear = i;
						}
					}

					average = parseInt(sum / 6);

					records[d.RegionName]["2015-2020-price"] = average;

					if (price.totalMaximun < average) {
						price.totalMaximun = average;
					} else if(price.totalMinimun > average) {
						price.totalMinimun = average;
					}
				}
			}
		});
		
		price.average = ~~parseInt(price.total / bayareaCitiesList.length);

		draw();
	});
};

// Load cities from the data and save them as coordinates
function loadCities() {
	d3.csv("data/City_Coordinates.csv").then(function(data) {
		if (data == undefined) {
			console.log("Failed to load file");

			return;
		}
		data.forEach(function(d) {
			if (records[d.RegionName] != undefined) {
				records[d.RegionName]["latitude"] = d.Latitude != "" ? d.Latitude : 0;
				records[d.RegionName]["longitude"] = d.Longitude != "" ? d.Longitude : 0;
			}
		});
	});

	// Convert the records object to an array
	data = Object.keys(records).map(function(key) { 
		return records[key]; 
	});
}

// Start to draw the graph
function draw() {
	const container = d3.select(".svg-container");

	let containerWidth = 680, containerHeight = 600;

	const g = {
		usMap: container.select("g#us-map"),
		legend: container.select("g#legend"),
		states: container.select("g#states"),
		counties: container.select("g#counties"),
		cities: container.select("g#cities"),
		details: container.select("g#detail-panel")
	};

	let colorDomain = [];

	var colorScale;

	let color_max = d3.max(data.map(function(d) {
		return d["2015-2020-count"];
	}));

	let color_min = d3.min(data.map(function(d) {
		return d["2015-2020-count"];
	}));


	color_max = Math.ceil((color_max - color_min)/100)*100;

	for (let i = 1; i < 5; i++) {
		colorDomain.push(Math.ceil(color_min/100)*100 + i * Math.ceil(color_max/4));
	}

	colorScale = d3.scaleThreshold()
		.domain(colorDomain)
		.range(["#fc7b48", "#e84a2f", "#aa230b", "#6d0707"]);

	let sizeDomain = [];

	var sizeScale;

	let size_max = d3.max(data.map(function(d) {
		return d["2015-2020-price"];
	}));

	let size_min = d3.min(data.map(function(d) {
		return d["2015-2020-price"] == 0 ? Number.MAX_VALUE : d["2015-2020-price"];
	}));

	size_max = Math.ceil((size_max - size_min)/100)*100;

	for (let i = 0; i < 5; i++) {
		sizeDomain.push(Math.ceil(size_min/100)*100 + i * Math.ceil(size_max/4));
	}

	const details = g.details
		.append("foreignObject")
		.attr("id", "details")
		.attr("width", containerWidth)
		.attr("height", containerHeight)
		.attr("x", 0)
		.attr("y", 0);

	const body = details.append("xhtml:div")
		.attr("class", "detail-info")
		.html("<p>N/A</p>");

	details.style("visibility", "hidden");

	// Start to draw the map
	function drawMap() {
		d3.json("data/counties-albers-10m.json").then(drawElements);

		let width = 680, height = 600;

		// Declare and initialize all graph elements
		const map = d3
			.select("svg#map")
			.attr("x", 0)
			.attr("width", width)
			.attr("height", height)
			.attr("viewBox", "0 0 "+width+" "+height);

		let basemap = map.select("g#basemap");

		g.usMap.style("transform", "translate(0, -1800px) scale(8)");

		// Zooming for the bars
		const extent = [0, [width, height]];

		basemap.call(d3.zoom()
			.scaleExtent([1, 4])
			.extent([[0, 0], [width, height]])
			.on("zoom", zoomed));

		function zoomed() {
			basemap.attr('transform', d3.event.transform);
		}

		// Start to draw elements on the map
		function drawElements(json) {
			// D3 Projection
			let projection = d3.geoAlbersUsa().scale(1300).translate([487.5, 305]);     // scale things down so see entire US

			// Define path generator
			let path = d3.geoPath();  // tell path generator to use albersUsa projection

			g.states.append("g")
				.attr("class", "states")
				.selectAll("path")
				.data(topojson.feature(json, json.objects.states).features)
				.enter().append("path")
				.attr("d", path)
				.attr("class", "state");


			g.states.append("path")
				.datum(topojson.mesh(json, json.objects.states, function(a, b) { return a !== b; }))
				.attr("class", "state-borders")
				.attr("d", path);


			g.counties.append("g")
				.attr("class", "counties")
				.selectAll("path")
				.data(topojson.feature(json, json.objects.counties).features)
				.enter().append("path")
				.attr("d", path);

			g.counties.append("path")
				.attr("class", "county-borders")
				.attr("d", path(topojson.mesh(json, json.objects.counties, function(a, b) { return a !== b; })));

			g.cities.selectAll("circle")
				.data(data)
				.enter()
				.append("circle")
				.attr("class", "city")
				.attr("id", function(d) {
					if (d.id != -1) {
						return "city-" + d.id;
					}

					return "";
				})
				.attr("cx", function(d) {
					if (projection([d.longitude, d.latitude]) == undefined) return;
					return projection([d.longitude, d.latitude])[0];
				})
				.attr("cy", function(d) {
					if (projection([d.longitude, d.latitude]) == undefined) return;
					return projection([d.longitude, d.latitude])[1];
				})
				.attr("r", function(d) {
					return 0.2 + (d["2015-2020-price"] / price.totalMaximun) * 2;
				})
				.attr("fill", function(d) {
					return colorScale(d["2015-2020-count"]);
				})
				.style("stroke", "#fff")
				.style("stroke-width", 0.1)
				.style("cursor", "pointer");

			g.cities.selectAll("circle").on("mouseover", function(d) {
				d3.select(this).raise();
				d3.select(this).style("fill", colorMain);

				d3.select("#bar-price-" + d.id)
					.style("fill", colorMain);
				d3.select("#bar-count-" + d.id)
					.style("fill", colorMain);

				showDetail(d);

			});

			g.cities.selectAll("circle").on("mouseout", function(d) {
				d3.select(this)
					.style("fill", function(d) {
						return colorScale(d["2015-2020-count"]);
					});
				d3.select("#bar-price-" + d.id)
					.style("fill", function(d) {
						return colorScale(d["2015-2020-count"]);
					});
				d3.select("#bar-count-" + d.id)
					.style("fill", function(d) {
						return colorScale(d["2015-2020-count"]);
					});

				hideDetail();
			});

			g.cities.selectAll("circle").on("click", function(d) {
				d3.select(this).raise();
				g.cities.selectAll("circle").classed("active", false);
				d3.select(this).classed("active", true);
				
				openPanelDetail(d.name);
			});
		}

		// Start to draw the legend
		function drawLegend() {
			let legend_width = 200;
			let legend_height = 300;

			let color_width = 40;
			let color_height = 18;

			let size_radius = 3;

			g.legend
				.attr("width", legend_width)
				.attr("height", legend_height)
				.attr("transform", "translate(" + (width - legend_width) + ", 0)");

			let background = g.legend
				.append("rect")
				.attr("width", legend_width)
				.attr("height", legend_height)
				.style("fill", "#fff");

			// Add one dot in the legend for each name.
			let colorLegend = g.legend
								.append("g")
								.attr("width", legend_width);

			let colorLegendTitle = colorLegend
				.append("text")
				.attr("transform", "translate(0,0)")
				.attr("x", 15)
				.attr("y", 30)
				.text("Count of Home Sales")
				.style("fill", "#000")
				.attr("class", "legend-title")
				.style("font-size", 12);

			let legendRect = colorLegend.selectAll("legend-rects")
				.data(colorScale.range())
				.enter()
				.append("rect")
				.attr("x", function(d,i){ return i * color_width + 20})
				.attr("y", 70)
				.attr("width", color_width)
				.attr("height", color_height)
				.attr("class", "legend-rect")
				.style("fill", function(d) {
					return d;
				});

			// Legend labels
			let colorLegendStart = colorLegend
				.append("text")
				.attr("text-anchor", "left")
				.attr("class", "color-legend-label")
				.attr("x", 15)
				.attr("y", 55)
				.text("0")
				.style("fill", "#000")
				.style("font-size", 10)
				.style("alignment-baseline", "middle");

			let colorLegendEnd = colorLegend
				.append("text")
				.attr("x", legend_width - 36)
				.attr("y", 55)
				.attr("text-anchor", "left")
				.attr("class", "color-legend-label")
				.text(function() {
					if (colorDomain[colorDomain.length - 1] >= 1000000) {
						return (colorDomain[colorDomain.length - 1] / 1000000).toFixed(2) + "M";
					} else if (colorDomain[colorDomain.length - 1] >= 1000) {
						return (colorDomain[colorDomain.length - 1] / 1000).toFixed(2) + "K";
					}

					return colorDomain[colorDomain.length - 1].toFixed(2);
				})
				.style("fill", "#000")
				.style("font-size", 10)
				.style("alignment-baseline", "middle");

			// Add one dot in the legend for each name.
			let sizeLegend = g.legend
								.append("g")
								.attr("transform", "translate(0, 135)")
								.attr("width", legend_width);

			let sizeLegendLabel = sizeLegend
				.append("text")
				.attr("class", "legend-title")
				.attr("x", 15)
				.text("Average Price")
				.style("font-size", 12)
				.style("fill", "#000");

			let topSpace = 0;

			let legendCircle = sizeLegend
				.selectAll("legend-circles")
				.data(sizeDomain)
				.enter()
				.append("circle")
				.attr("width", legend_width)
				.attr("height", legend_height)
				.attr("cx", 30)
				.attr("cy",function(d){
					topSpace += 2 * (size_radius + 10 * d / sizeDomain[sizeDomain.length - 1]) + 5;
					return topSpace + 15;
				})
				.attr("class", "legend-circle")
				.attr("r", function(d) {
					return size_radius + 10 * d / sizeDomain[sizeDomain.length - 1];
				})
				.style("fill", colorGray);

			// Legend labels

			topSpace = 0;
			let legendCircleLabel = sizeLegend
				.selectAll("size-legend-label")
				.data(sizeDomain)
				.enter()
				.append("text")
				.attr("x", 60)
				.attr("y",function(d){
					topSpace += 2 * (size_radius + 10 * d / sizeDomain[sizeDomain.length - 1]) + 5;
					return topSpace + 15;
				})
				.attr("text-anchor", "left")
				.style("alignment-baseline", "middle")
				.attr("class", "size-legend-label")
				.text(function(d) {
					if (d >= 1000000) {
						return (d / 1000000).toFixed(2) + "M";
					} else if (d >= 1000) {
						return (d / 1000).toFixed(2) + "K";
					}

					return d.toFixed(2);
				})
				.style("fill", "#000")
				.style("font-size", 10);
		}

		drawLegend();
	}

	// Draw the right side panel
	function drawPanel() {

		let svgWidth = 350;

		let panel = d3.select("#panel");
		let detail = d3.select("div.details");

		// Start to draw the bar chare of all home price
		function drawBarPrice() {
			let svgHeight = 1000;

			var margin = {top: 0, right: 20, bottom: 50, left: 110}
			  , width = svgWidth - margin.left - margin.right // Use the window's width 
			  , height = svgHeight - margin.top - margin.bottom;

			let xScale = d3.scaleBand().range([0, width]).padding(0.4);
			let yScale = d3.scaleLinear().range([height, 0]);

			let svg = d3.select("svg#bar-price")
							.attr("width", svgWidth)
							.attr("height", svgHeight)
							.attr("viewBox", "0 0 " + svgWidth + " " + svgHeight);

			var g = svg.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			let priceData = data.sort(comparePrice);

			xScale = d3.scaleLinear()
					.domain([0, price.totalMaximun])
					.range([0, width]);

			yScale = d3.scaleBand()
					.domain(priceData.map(function(d) { 
						return d.name;
					}))
					.range([0, height])
					.padding(0.2);

			let xAxis = g.append("g")
				.attr("transform", "translate(0," + height + ")")
				.call(d3.axisBottom(xScale).tickFormat(function(d){
					if (d >= 1000000) {
						return d / 1000000 + "M";
					} else if (d >= 1000) {
						return d / 1000 + "K";
					} else if (d < 1000) {
						return d;
					}
				})
				.ticks(10))
				.attr("class", "x-axis")
				.append("text")
				.attr("class", "label")
				.attr("y", 40)
				.attr("x", width)
				.attr("text-anchor", "end")
				.attr("stroke", "#2d3666")
				.text("Average Home Price");

			let yAxis = g.append("g")
				.call(d3.axisLeft(yScale))
				.attr("class", "y-axis")
				.append("text")
				.attr("transform", "rotate(-90)")
				.attr("y", -100)
				.attr("text-anchor", "end")
				.attr("stroke", "#2d3666")
				.attr("class", "label")
				.text("City Names");

			// Create the bars' container
			let bars = g.append("g")
				.attr("class", "bars-price")
				.attr("x", 0)
				.attr("y", 200);

			let bar = bars.selectAll(".bar-price")
				.data(priceData)
				.enter()
				.append("rect")
				.attr("class", "bar-price")
				.attr("id", function(d) {
					if (d.id != -1) {
						return "bar-price-" + d.id;
					}

					return "";
				})
				.attr("x", 0)
				.attr("y", function(d) {
					return yScale(d.name);
				})
				.attr("width", function(d) {
					return xScale(d["2015-2020-price"]);
				})
				.attr("height", yScale.bandwidth())
				.attr("fill", function(d) {
					return colorScale(d["2015-2020-count"]);
				})
				.style("cursor", "pointer");

			bars.selectAll(".bar-price").on("mouseover", function(d) {
				d3.select(this).style("fill", colorMain);

				d3.select("#city-" + d.id).raise();
				d3.select("#city-" + d.id).style("fill", colorMain);

				showDetail(d);
			});

			bars.selectAll(".bar-price").on("mouseout", function(d) {
				d3.select(this)
					.style("fill", function(d) {
						return colorScale(d["2015-2020-count"]);
					});

				d3.select("#city-" + d.id)
					.style("fill", function(d) {
						return colorScale(d["2015-2020-count"]);
					});

				hideDetail();
			});

			bars.selectAll(".bar-price").on("click", function(d) {
				d3.select("#city-" + d.id).raise();
				d3.selectAll("circle").classed("active", false);
				d3.select("#city-" + d.id).classed("active", true);
				
				openPanelDetail(d.name);
			});
		}

		// Start to draw the bar chart of sales count
		function drawBarCount() {
			let svgHeight = 1000;

			var margin = {top: 0, right: 0, bottom: 50, left: 110}
			  , width = svgWidth - margin.left - margin.right // Use the window's width 
			  , height = svgHeight - margin.top - margin.bottom;

			let xScale = d3.scaleBand().range([0, width]).padding(0.4);
			let yScale = d3.scaleLinear().range([height, 0]);

			let svg = d3.select("svg#bar-count")
							.attr("width", svgWidth)
							.attr("height", svgHeight)
							.attr("viewBox", "0 0 " + svgWidth + " " + svgHeight);

			var g = svg.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			let countData = data.sort(compareCount);

			xScale = d3.scaleLinear()
					.domain([0, count.totalMaximun])
					.range([0, width]);

			yScale = d3.scaleBand()
					.domain(countData.map(function(d) { 
						return d.name;
					}))
					.range([0, height])
					.padding(0.2);

			let xAxis = g.append("g")
				.attr("transform", "translate(0," + height + ")")
				.call(d3.axisBottom(xScale).tickFormat(function(d){
					if (d >= 1000000) {
						return d / 1000000 + "M";
					} else if (d >= 1000) {
						return d / 1000 + "K";
					} else if (d < 1000) {
						return d;
					}
				})
				.ticks(10))
				.attr("class", "x-axis")
				.append("text")
				.attr("class", "label")
				.attr("y", 40)
				.attr("x", width)
				.attr("text-anchor", "end")
				.attr("stroke", "#2d3666")
				.text("Count of Home Sales");

			let yAxis = g.append("g")
				.call(d3.axisLeft(yScale))
				.attr("class", "y-axis")
				.append("text")
				.attr("transform", "rotate(-90)")
				.attr("y", -100)
				.attr("text-anchor", "end")
				.attr("stroke", "#2d3666")
				.attr("class", "label")
				.text("City Names");

			let bars = g.append("g")
				.attr("class", "bars-count")
				.attr("x", 0)
				.attr("y", 0);

			let bar = bars.selectAll(".bar-count")
				.data(countData)
				.enter()
				.append("rect")
				.attr("class", "bar-count")
				.attr("id", function(d) {
					if (d.id != -1) {
						return "bar-count-" + d.id;
					}

					return "";
				})
				.attr("x", 0)
				.attr("y", function(d) {
					return yScale(d.name);
				})
				.attr("width", function(d) {
					return xScale(d["2015-2020-count"]);
				})
				.attr("height", yScale.bandwidth())
				.style("fill", function(d) {
					return colorScale(d["2015-2020-count"]);
				})
				.style("cursor", "pointer");

			bars.selectAll(".bar-count").on("mouseover", function(d) {
				d3.select(this).style("fill", colorMain);

				d3.select("#city-" + d.id).raise();
				d3.select("#city-" + d.id).style("fill", colorMain);

				showDetail(d);
			});

			bars.selectAll(".bar-count").on("mouseout", function(d) {
				d3.select(this).style("fill", function(d) {
						return colorScale(d["2015-2020-count"]);
					});

				d3.select("#city-" + d.id)
					.style("fill", function(d) {
						return colorScale(d["2015-2020-count"]);
					});

				hideDetail();
			});

			bars.selectAll(".bar-count").on("click", function(d) {
				d3.select("#city-" + d.id).raise();
				d3.selectAll("circle").classed("active", false);
				d3.select("#city-" + d.id).classed("active", true);
				
				openPanelDetail(d.name);
			});

			d3.select("div.bar-count").style("display", "none");
		}

		// Start to draw the line chart of all home price
		function drawLinePrice() {
			let svgHeight = 500;

			var margin = {top: 10, right: 20, bottom: 50, left: 60}
			  , width = svgWidth - margin.left - margin.right // Use the window's width 
			  , height = svgHeight - margin.top - margin.bottom;

			let svg = d3.select("svg#line-price")
							.attr("width", svgWidth)
							.attr("height", svgHeight)
							.attr("viewBox", "0 0 " + svgWidth + " " + svgHeight);

			var g = svg.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			let values = [];

			for (let i = 2015; i < 2021; i++) {
				values.push({
					date: i,
					value: price[i]
				});
			}

			let xScale = d3.scaleBand().range([0, width]);

			xScale.domain(values.map(function(d) {
				return d["date"];
			}));

			let yScale = d3.scaleLinear().range([height, 0]);

			yScale.domain([d3.min(values, function(d) { return d.value; }), d3.max(values, function(d) { return d.value; })]);

			var line = d3.line()
				.x(function(d) { return xScale(d.date); }) // set the x values for the line generator
				.y(function(d) { return yScale(d.value); }) // set the y values for the line generator

			let xAxis = g.append("g")
				.attr("transform", "translate(0," + height + ")")
				.call(d3.axisBottom(xScale))
				.attr("class", "x-axis")
				.append("text")
				.attr("class", "label")
				.attr("y", 40)
				.attr("x", width)
				.attr("text-anchor", "end")
				.attr("stroke", "#2d3666")
				.text("Year");

			let yAxis = g.append("g")
				.call(d3.axisLeft(yScale).tickFormat(function(d){
					if (d >= 1000000) {
						return d / 1000000 + "M";
					} else if (d >= 1000) {
						return d / 1000 + "K";
					} else if (d < 1000) {
						return d;
					}
				})
				.ticks(10))
				.attr("class", "y-axis")
				.append("text")
				.attr("transform", "rotate(-90)")
				.attr("y", -50)
				.attr("text-anchor", "end")
				.attr("stroke", "#2d3666")
				.attr("class", "label")
				.text("Average Home Price");

			g.append("path")
				.datum(values) // 10. Binds data to the line 
				.attr("class", "line") // Assign a class for styling 
				.attr('fill', 'none')
				.attr('stroke', colorMain)
				.attr('stroke-width', 1.5)
				.attr('d', line);

			d3.select("div.line-price").style("display", "none");
		}

		// Start to draw the line chart of sales count
		function drawLineCount() {
			let svgHeight = 500;

			var margin = {top: 10, right: 20, bottom: 50, left: 60}
			  , width = svgWidth - margin.left - margin.right // Use the window's width 
			  , height = svgHeight - margin.top - margin.bottom;

			let svg = d3.select("svg#line-count")
							.attr("width", svgWidth)
							.attr("height", svgHeight)
							.attr("viewBox", "0 0 " + svgWidth + " " + svgHeight);

			var g = svg.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			let values = [];

			for (let i = 2015; i < 2020; i++) {
				values.push({
					date: i,
					value: count[i]
				});
			}

			let xScale = d3.scaleBand().range([0, width]);

			xScale.domain(values.map(function(d) {
				return d["date"];
			}));

			let yScale = d3.scaleLinear().range([height, 0]);

			yScale.domain([d3.min(values, function(d) { return d.value; }), d3.max(values, function(d) { return d.value; })]);

			var line = d3.line()
				.x(function(d) { return xScale(d.date); }) // set the x values for the line generator
				.y(function(d) { return yScale(d.value); }) // set the y values for the line generator

			let xAxis = g.append("g")
				.attr("transform", "translate(0," + height + ")")
				.call(d3.axisBottom(xScale))
				.attr("class", "x-axis")
				.append("text")
				.attr("class", "label")
				.attr("y", 40)
				.attr("x", width)
				.attr("text-anchor", "end")
				.attr("stroke", "#2d3666")
				.text("Year");

			let yAxis = g.append("g")
				.call(d3.axisLeft(yScale).tickFormat(function(d){
					if (d >= 1000000) {
						return d / 1000000 + "M";
					} else if (d >= 1000) {
						return d / 1000 + "K";
					} else if (d < 1000) {
						return d;
					}
				})
				.ticks(10))
				.attr("class", "y-axis")
				.append("text")
				.attr("transform", "rotate(-90)")
				.attr("y", -50)
				.attr("text-anchor", "end")
				.attr("stroke", "#2d3666")
				.attr("class", "label")
				.text("Count of Home Sales");

			g.append("path")
				.datum(values) // 10. Binds data to the line 
				.attr("class", "line") // Assign a class for styling 
				.attr('fill', 'none')
				.attr('stroke', colorMain)
				.attr('stroke-width', 1.5)
				.attr('d', line);

			d3.select("div.line-count").style("display", "none");
		}

		// CompareTo function of sales count
		function compareCount(a, b) {
			const countA = a["2015-2020-count"];
			const countB = b["2015-2020-count"];

			let comparison = 0;
			if (countA < countB) {
				comparison = 1;
			} else if (countA > countB) {
				comparison = -1;
			}

			return comparison;
		}

		//COmpareTo function of all home price
		function comparePrice(a, b) {
			const priceA = a["2015-2020-price"];
			const priceB = b["2015-2020-price"];

			let comparison = 0;
			if (priceA < priceB) {
				comparison = 1;
			} else if (priceA > priceB) {
				comparison = -1;
			}

			return comparison;
		}

		drawBarPrice();
		drawBarCount();
		drawLinePrice();
		drawLineCount();
	}

	// Show the detail panel on hover
	function showDetail(d) {
		let price = d["2015-2020-price"];
		
		if (price != undefined) {
			if (price >= 1000000) {
				price = (price / 1000000).toFixed(2) + "M";
			} else if (price >= 1000) {
				price = (price / 1000).toFixed(2) + "K";
			}
		}
		

		let count = d["2015-2020-count"];
		
		if (count) {
			if (count >= 1000000) {
				count = (count / 1000000).toFixed(2) + "M";
			} else if (count >= 1000) {
				count = (count / 1000).toFixed(2) + "K";
			}
		}

		const html = `
			<table class="info-table" border="0" cellspacing="0" cellpadding="2">
			<tbody>
			<tr>
			<th>City Name</th>
			<td>${d.name}</td>
			</tr>
			<tr>
			<th>2015 - 2020 Average Price</th>
			<td>${price}</td>
			</tr>
			<tr>
			<th>2015 - 2020 Count of Home Sales</th>
			<td>${count}</td>
			</tr>
			<tr>
			</tr>
			</tbody>
			</table>
		`;
		body.html(html);
		details.style("visibility", "visible");
	}

	function hideDetail() {
		details.style("visibility", "hidden");
	}

	drawMap();
	drawPanel();
}

// Draw the detail panel on click
function drawDetail(city) {
	let svgWidth = 350;

	// Draw the detail bar chart of average home price
	function detailBar1() {
		let svgHeight = 70;

		var margin = {top: 5, right: 20, bottom: 0, left: 20}
		  , width = svgWidth - margin.left - margin.right // Use the window's width 
		  , height = svgHeight - margin.top - margin.bottom;

		let xScale = d3.scaleBand().range([0, width]).padding(0.4);
		let yScale = d3.scaleLinear().range([height, 0]);

		let svg = d3.select("svg#detail-1-bar-1")
						.attr("width", svgWidth)
						.attr("height", svgHeight)
						.attr("viewBox", "0 0 " + svgWidth + " " + svgHeight);

		var g = svg.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		let priceData = [records[city]["2015-2020-price"]];

		xScale = d3.scaleLinear()
				.domain([0, price.totalMaximun])
				.range([0, width]);

		yScale = d3.scaleBand()
				.domain(city)
				.range([0, height])
				.padding(0.2);

		let xAxis = g.append("g")
			.attr("transform", "translate(0," + 45 + ")")
			.call(d3.axisBottom(xScale).tickFormat(function(d){
				if (d >= 1000000) {
					return d / 1000000 + "M";
				} else if (d >= 1000) {
					return d / 1000 + "K";
				} else if (d < 1000) {
					return d;
				}
			})
			.ticks(10))
			.attr("class", "x-axis")
			.append("text")
			.attr("class", "label")
			.attr("x", 150)
			.attr("y", -40)
			.attr("text-anchor", "end")
			.attr("stroke", "#2d3666")
			.text("Average Home Price (2015-2020)");

		// Create the bars' container
		let bar = g.selectAll(".bar-price")
			.data(priceData)
			.enter()
			.append("rect")
			.attr("class", "bar-price")
			.attr("x", 0)
			.attr("y", 20)
			.attr("width", function(d) {
				return xScale(d);
			})
			.attr("height", 25)
			.style("fill", colorMain);
	}

	// Draw the detail bar chart of sales count
	function detailBar2() {
		let svgHeight = 70;

		var margin = {top: 5, right: 20, bottom: 0, left: 20}
		  , width = svgWidth - margin.left - margin.right // Use the window's width 
		  , height = svgHeight - margin.top - margin.bottom;

		let xScale = d3.scaleBand().range([0, width]).padding(0.4);
		let yScale = d3.scaleLinear().range([height, 0]);

		let svg = d3.select("svg#detail-1-bar-2")
						.attr("width", svgWidth)
						.attr("height", svgHeight)
						.attr("viewBox", "0 0 " + svgWidth + " " + svgHeight);

		var g = svg.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		let countData = [records[city]["2015-2020-count"]];

		xScale = d3.scaleLinear()
				.domain([0, count.totalMaximun])
				.range([0, width]);

		yScale = d3.scaleBand()
				.domain(city)
				.range([0, height])
				.padding(0.2);

		let xAxis = g.append("g")
			.attr("transform", "translate(0," + 45 + ")")
			.call(d3.axisBottom(xScale))
			.attr("class", "x-axis")
			.append("text")
			.attr("class", "label")
			.attr("x", 152)
			.attr("y", -40)
			.attr("text-anchor", "end")
			.attr("stroke", "#2d3666")
			.text("Count of Home Sales (2015-2020)");

		// Create the bars' container
		let bar = g.selectAll(".bar-count")
			.data(countData)
			.enter()
			.append("rect")
			.attr("class", "bar-count")
			.attr("x", 0)
			.attr("y", 20)
			.attr("width", function(d) {
				return xScale(d);
			})
			.attr("height", 25)
			.style("fill", colorMain);
	}

	// Draw the detail line chart of average home price trend
	function detailLine1() {
		let svgHeight = 220;

		var margin = {top: 25, right: 20, bottom: 50, left: 60}
		  , width = svgWidth - margin.left - margin.right // Use the window's width 
		  , height = svgHeight - margin.top - margin.bottom;

		let svg = d3.select("svg#detail-1-line-1")
						.attr("width", svgWidth)
						.attr("height", svgHeight)
						.attr("viewBox", "0 0 " + svgWidth + " " + svgHeight);

		var g = svg.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		let values = [];

		for (let i = 2015; i < 2021; i++) {
			let value = {
				date: i,
				price: records[city][i + "-price"]
			}

			values.push(value);
		}

		let xScale = d3.scaleBand().range([0, width]);

		xScale.domain(values.map(function(d) {
			return d["date"];
		}));

		let yScale = d3.scaleLinear().range([height, 0]);

		yScale.domain([d3.min(values, function(d) { return d.price; }), d3.max(values, function(d) { return d.price; })]);


		var line = d3.line()
			.x(function(d) { return xScale(d.date); }) // set the x values for the line generator
			.y(function(d) { return yScale(d.price); }) // set the y values for the line generator

		let xAxis = g.append("g")
			.attr("transform", "translate(0," + height + ")")
			.call(d3.axisBottom(xScale))
			.attr("class", "x-axis")
			.append("text")
			.attr("class", "label")
			.attr("y", 40)
			.attr("x", width)
			.attr("text-anchor", "end")
			.attr("stroke", "#2d3666")
			.text("Year");

		let yAxis = g.append("g")
			.call(d3.axisLeft(yScale).tickFormat(function(d){
				if (d >= 1000000) {
					return d / 1000000 + "M";
				} else if (d >= 1000) {
					return d / 1000 + "K";
				} else if (d < 1000) {
					return d;
				}
			})
			.ticks(10))
			.attr("class", "y-axis")
			.append("text")
			.attr("x", 70)
			.attr("y", -15)
			.attr("text-anchor", "end")
			.attr("stroke", "#2d3666")
			.attr("class", "label")
			.text("Average Home Price Trend");

		g.append("path")
			.datum(values) // 10. Binds data to the line 
			.attr("class", "line") // Assign a class for styling 
			.attr('fill', 'none')
			.attr('stroke', colorMain)
			.attr('stroke-width', 1.5)
			.attr('d', line);
	}

	// Draw the detail line chart of sales count trend
	function detailLine2() {
		let svgHeight = 220;

		var margin = {top: 25, right: 20, bottom: 50, left: 60}
		  , width = svgWidth - margin.left - margin.right // Use the window's width 
		  , height = svgHeight - margin.top - margin.bottom;

		let svg = d3.select("svg#detail-1-line-2")
						.attr("width", svgWidth)
						.attr("height", svgHeight)
						.attr("viewBox", "0 0 " + svgWidth + " " + svgHeight);

		var g = svg.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		let values = [];

		for (let i = 2015; i < 2020; i++) {
			let value = {
				date: i,
				count: records[city][i + "-count"]
			}

			values.push(value);
		}

		let xScale = d3.scaleBand().range([0, width]);

		xScale.domain(values.map(function(d) {
			return d["date"];
		}));

		let yScale = d3.scaleLinear().range([height, 0]);

		yScale.domain([d3.min(values, function(d) { return d.count; }), d3.max(values, function(d) { return d.count; })]);


		var line = d3.line()
			.x(function(d) { return xScale(d.date); }) // set the x values for the line generator
			.y(function(d) { return yScale(d.count); }) // set the y values for the line generator

		let xAxis = g.append("g")
			.attr("transform", "translate(0," + height + ")")
			.call(d3.axisBottom(xScale))
			.attr("class", "x-axis")
			.append("text")
			.attr("class", "label")
			.attr("y", 40)
			.attr("x", width)
			.attr("text-anchor", "end")
			.attr("stroke", "#2d3666")
			.text("Year");

		let yAxis = g.append("g")
			.call(d3.axisLeft(yScale))
			.attr("class", "y-axis")
			.append("text")
			.attr("x", 70)
			.attr("y", -15)
			.attr("text-anchor", "end")
			.attr("stroke", "#2d3666")
			.attr("class", "label")
			.text("Count of Home Sales Trend");

		g.append("path")
			.datum(values) // 10. Binds data to the line 
			.attr("class", "line") // Assign a class for styling 
			.attr('fill', 'none')
			.attr('stroke', colorMain)
			.attr('stroke-width', 1.5)
			.attr('d', line);
	}

	detailBar1();
	detailBar2();
	detailLine1();
	detailLine2();
}

// Clean the detail panel on close
function cleanDetail() {
	d3.selectAll("svg#detail-1-bar-1 > *").remove();
	d3.selectAll("svg#detail-1-bar-2 > *").remove();
	d3.selectAll("svg#detail-1-line-1 > *").remove();
	d3.selectAll("svg#detail-1-line-2 > *").remove();
}

// Switch the main panel and detail panel
function openPanelDetail(city) {
	d3.select("div.details").style("display", "block");
	d3.select("div.general").style("display", "none");

	cleanDetail();
	drawDetail(city);
}

// Switch the main panel and detail panel
function closePanelDetail() {
	d3.select("div.details").style("display", "none");
	d3.select("div.general").style("display", "block");
}

// Switch the main panel and detail panel
function togglePanelModule() {
	let barPrice = d3.select("div.bar-price");
	let barCount = d3.select("div.bar-count");
	let linePrice = d3.select("div.line-price");
	let lineCount = d3.select("div.line-count");

	let trigger = d3.select("div#panel-trigger select").on("change", function() {
		let val = d3.event.target.value;
		barPrice.style("display", "none");
		barCount.style("display", "none");
		linePrice.style("display", "none");
		lineCount.style("display", "none");

		d3.select("div"+val).style("display", "block");
	});
}

// Switch the main panel and detail panel
function toggleDetailModule() {
	d3.select("button#panel-close").on("click", function() {
		d3.selectAll("circle").classed("active", false);
		
		cleanDetail();
		closePanelDetail();
	})
}

// Main function calls
loadSaleCount();
togglePanelModule();
toggleDetailModule();