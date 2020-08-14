/*
	D3.js (version 5) Hierarchical Tree
	Author: Jake Zhong(www.jakezhong.com)
*/

const url = "https://data.sfgov.org/resource/nuek-vuh3.json";

// Data wrangling
let data = {
	"name": "Fire Department",
	"number": 0,
	"children": []
};

let callTypes = [];

let colorScale;

// Data loading and wrangling
d3.json(url).then(function(json) {
	json.forEach(function(d) {

		data.number = data.number + 1;

		if (callTypes.indexOf(d.call_type) < 0) {
			callTypes.push(d.call_type);
		}

		let neighborhoods = data.children.map(function(neighborhood) {
			return neighborhood.name;
		});

		let indexN = neighborhoods.indexOf(d.neighborhoods_analysis_boundaries);

		if (indexN > -1) {

			data.children[indexN].number = data.children[indexN].number + 1;

			let types = data.children[indexN].children.map(function(type) {
				return type.name;
			});

			let indexT = types.indexOf(d.call_type);

			if (indexT > -1) {
				data.children[indexN].children[indexT].number = data.children[indexN].children[indexT].number + 1;
			} else {
				let newType = {
					"name": d.call_type,
					"number": 1
				}

				data.children[indexN].children.push(newType);
			}
		} else {
			let newType = {
				"name": d.call_type,
				"number": 1
			}

			let newNeighborhood = {
				"name": d.neighborhoods_analysis_boundaries,
				"number": 1,
				"children": [newType]
			}

			data.children.push(newNeighborhood);
		}
	});

	// Draw tree
	drawTree(data);
});

// Initialize the tree with data
function tree(data) {
	// Draw svg
	let width = 960;
	let height = 1600;
	const root = d3.hierarchy(data);

	root.dx = 10;
	root.dy = width / (root.height + 1);

	return d3.tree().nodeSize([root.dx, root.dy])(root);
}

// Start to draw the tree
function drawTree(data) {
	// Draw svg
	let width = 960;
	let height = 1600;

	const svg = d3
				.select(".svg-container")
				.select("svg#tree-container")
				.attr("x", 0)
				.attr("width", width)
				.attr("height", height)
				.style("padding-top", 20)
				.style("padding-bottom", 20);

	// Initialize color scale
	colorScale = d3
				.scaleOrdinal()
				.domain(callTypes)
				.range(["#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a","#a6cee3","#b15928"]);

	// Draw g
	const g = {
		tree: svg.select("g#tree"),
		tooltip: svg.select("g#tooltip"),
		details: svg.select("g#details"),
		legend: svg.select("g#legend")
	};

	// setup tooltip (shows neighborhood name)
	const tip = g
				.tooltip
				.append("foreignObject")
				.attr("class", "tree-tooltip")
				.attr("text-anchor", "end")
				.attr("dx", 0)
				.attr("dy", 0)
				.attr("width", 250)
				.attr("height", 60)
				.style("visibility", "hidden");

	// Draw tree
	const root = tree(data);

	let x0 = Infinity;
	let x1 = -x0;

	root.each(d => {
		if (d.x > x1) x1 = d.x;
		if (d.x < x0) x0 = d.x;
	});

	svg.attr("viewBox", [0, 0, width, x1 - x0 + root.dx * 2]);
	
	g
	.tree
	.attr("font-family", "sans-serif")
	.attr("font-size", 10)
	.attr("transform", `translate(${root.dy / 4},${root.dx - x0})`);

	const link = g
				.tree
				.append("g")
				.attr("fill", "none")
				.attr("stroke", "#fff")
				.attr("stroke-opacity", 0.4)
				.attr("stroke-width", 1.5)
				.selectAll("path")
				.data(root.links())
				.join("path")
				.attr("d", d3.linkHorizontal()
				.x(d => d.y)
				.y(d => d.x));

	const node = g
				.tree
				.append("g")
				.attr("stroke-linejoin", "round")
				.attr("stroke-width", 3)
				.selectAll("g")
				.data(root.descendants())
				.join("g")
				.attr("transform", d => `translate(${d.y},${d.x})`);

	node.append("circle")
		.attr("fill", function(d) {
			if (callTypes.indexOf(d.data.name) > -1) {
				return colorScale(d.data.name);
			} else {
				return d.children ? "#fff" : "#999";
			}
		})
		.attr("r", 3);

	node.append("text")
		.attr("dy", "0.31em")
		.attr("x", d => d.children ? -10 : 10)
		.attr("text-anchor", d => d.children ? "end" : "start")
		.text(d => d.data.name)
		.style("fill", function(d) {
			if (callTypes.indexOf(d.data.name) > -1) {
				return colorScale(d.data.name);
			}

			return "#fff";
		});

	// add tooltip
	node
	.on("mouseover", function(d) {
		let html = d.data.name;
		html += "<br># of calls: " + d.data.number;

		tip.html(html);
		tip.style("visibility", "visible");
		tip.attr("x", d.y);
		tip.attr("y", function() {
			let newY = d.x + 750;

			if (newY < 0) {
				return 0;
			} else {
				return newY;
			}
		});
		tip.style("color", function() {
			if (callTypes.indexOf(d.data.name) > -1) {
				return colorScale(d.data.name);
			}
		});
	})
	.on("mouseout", function(d) {
		tip.style("visibility", "hidden");
	});

	drawTreeLegend(svg);

	return g.tree.node();
}

// Start to draw the legend
function drawTreeLegend(svg) {
	let legend_size = 12;
	let legend = svg.select("g#legend");
	
	// Add one dot in the legend for each name.
	
	legend
	.selectAll("legend-rects")
	.data(callTypes)
	.enter()
	.append("rect")
	.attr("x", 0)
	.attr("y", function(d,i){ return i * (legend_size+5) + 30; })
	.attr("width", legend_size)
	.attr("height", legend_size)
	.attr("class", "legend-rect")
	.style("fill", function(d) { return colorScale(d); });

	// Add one dot in the legend for each name.
	legend
	.selectAll("legend-labels")
	.data(callTypes)
	.enter()
	.append("text")
	.attr("x", legend_size * 1.5)
	.attr("y", function(d,i){ return i * (legend_size+5) + (legend_size/2) + 30; })
	.text(function(d){ return d; })
	.attr("text-anchor", "left")
	.style("alignment-baseline", "middle")
	.attr("class", "legend-label")
	.style("fill", function(d) { return colorScale(d); });
}