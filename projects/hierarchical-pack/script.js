/*
	D3.js (version 5) Hierarchical Pack
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

	// Draw pack
	drawPack(data);
});

// Initialize the pack with data
function pack(data) {
	// Draw svg
	let width = 960;
	let height = 960;

	let pack = d3
		.pack()
		.size([width, height])
		.padding(3)
		(d3.hierarchy(data)
		.sum(d => d.number)
		.sort((a, b) => b.number - a.number));

	return pack;

}

// Start to draw the pack
function drawPack(data) {
	// Draw svg
	let width = 960;
	let height = 960;

	const svg = d3
				.select(".svg-container")
				.select("svg#pack-container")
				.attr("x", 0)
				.attr("width", width)
				.attr("height", height);

	color = d3
			.scaleLinear()
			.domain([0, 1, 2])
			.range(["#142e57", "#ff4040"])
			.interpolate(d3.interpolateHcl)

	// Draw g
	const g = {
		pack: svg.select("g#pack"),
		tooltip: svg.select("g#tooltip-pack"),
		details: svg.select("g#details-pack"),
		legend: svg.select("g#legend-pack")
	};

	const tip = g
				.tooltip
				.append("foreignObject")
				.attr("class", "pack-tooltip")
				.attr("text-anchor", "end")
				.attr("dx", 0)
				.attr("dy", 0)
				.attr("width", 250)
				.attr("height", 250)
				.style("visibility", "hidden");

	const root = pack(data);
	let focus = root, view;

	svg
	.attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`)
	.style("display", "block")
	.style("background", color(0))
	.style("cursor", "pointer")
	.on("click", () => zoom(root));

	const node = g
				.pack
				.append("g")
				.selectAll("circle")
				.data(root.descendants().slice(1))
				.join("circle")
				.attr("fill", d => d.children ? color(d.depth) : "#ffffb2")
				.attr("pointer-events", d => !d.children ? "none" : null)
				.on("mouseover", function(d) {
					d3.select(this).attr("stroke", "#fff");

					console.log(d);
					let html = "<table>";
					html += "<tr><th>" + d.data.name + "</th><th>" + d.data.number + "</th></tr>";
					if (d.children.length > 0) {
						d.children.forEach(function(el) {
							html += "<tr><td>" + el.data.name + "</td><td>" + el.data.number + "</td></tr>";
						});
					}
					html += "</table>";
					tip.html(html);
					tip.style("visibility", "visible");
					tip.attr("x", function() {
						let newX = d.x - 605;

						if (newX < -480) {
							return -480;
						} else if (newX > 230) {
							return 230;
						} else {
							return newX;
						}
					});
					tip.attr("y", function() {
						let newY = d.y - 605;

						if (newY < -480) {
							return -480;
						} else if (newY > 230) {
							return 230;
						} else {
							return newY;
						}
					});
				})
				.on("mouseout", function() {
					d3.select(this).attr("stroke", null);
					tip.style("visibility", "hidden");
				})
				.on("click", d => focus !== d && (zoom(d), d3.event.stopPropagation()));

	const label = g
					.pack
					.append("g")
					.style("font", "10px sans-serif")
					.attr("pointer-events", "none")
					.attr("text-anchor", "middle")
					.selectAll("text")
					.data(root.descendants())
					.join("text")
					.style("fill-opacity", d => d.parent === root ? 1 : 0)
					.style("display", d => d.parent === root ? "inline" : "none")
					.text(d => d.data.name);

	zoomTo([root.x, root.y, root.r * 2]);

	// Zooming on the pack
	function zoomTo(v) {
		const k = width / v[2];

		view = v;

		label.attr("transform", function(d) {

			return `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`
		});
		node.attr("transform", function(d) {

			return `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`;
		});
		node.attr("r", function(d) {

			return d.r * k;
		});
	}

	function zoom(d) {
		const focus0 = focus;

		focus = d;

		const transition = svg.transition()
			.duration(d3.event.altKey ? 7500 : 750)
			.tween("zoom", d => {
				const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
				return t => zoomTo(i(t));
			});

		label
			.filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
			.transition(transition)
			.style("fill-opacity", d => d.parent === focus ? 1 : 0)
			.on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
			.on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
	}

	drawPackLegend(svg);

	return svg.node();
}

// Draw the legend
function drawPackLegend(svg) {
	let legend_size = 12;
	// Initialize color scale
	let titles = ["Fire Department", "Neighborhood", "Call Type"];
	let color = d3
				.scaleOrdinal()
				.domain(titles)
				.range(["#142e57", "#ff4040", "#ffffb2"]);

	// Add one dot in the legend for each name.

	svg
	.append("rect")
	.attr("x", -460)
	.attr("y", -460)
	.attr("width", 140)
	.attr("height", 66)
	.style("fill", "#999");

	svg
	.selectAll("legend-rects")
	.data(titles)
	.enter()
	.append("rect")
	.attr("x", -450)
	.attr("y", function(d,i){ return i * (legend_size+5) - 450})
	.attr("width", legend_size)
	.attr("height", legend_size)
	.attr("class", "legend-rect")
	.style("fill", function(d) {
		return color(d);
	});

	// Add one dot in the legend for each name.
	svg
	.selectAll("legend-labels")
	.data(titles)
	.enter()
	.append("text")
	.attr("x", legend_size * 1.5 - 450)
	.attr("y", function(d,i){ return i * (legend_size+5) + (legend_size/2) - 450})
	.text(function(d){ return d; })
	.attr("text-anchor", "left")
	.style("alignment-baseline", "middle")
	.attr("class", "legend-label")
	.style("fill", function(d) { return color(d); });

}