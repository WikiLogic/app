var width = 600,
    height = 500;

var force = d3.layout.force()
    .size([width, height])
    .on("tick", tick);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .on("click", explicitlyPosition);

var link = svg.selectAll(".link"),
    node = svg.selectAll(".node");

function tick() {
  link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  node.attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });
}

//not used but needed??
function explicitlyPosition() {}

var graph = {
  "nodes": [
    {"x": 100, "y": 250, "fixed": true},
    {"x": 200, "y": 200, "fixed": true},
    {"x": 200, "y": 300, "fixed": true},
    {"x": 300, "y": 250, "fixed": true}
  ],
  "links": [
    {"source":  0, "target":  1},
    {"source":  0, "target":  2},
    {"source":  1, "target":  3},
    {"source":  2, "target":  3}
  ]
};


    force
    .nodes(graph.nodes)
    .links(graph.links)
    .start();

link = link.data(graph.links)
    .enter().append("line")
    .attr("class", "link");

node = node.data(graph.nodes)
    .enter().append("circle")
    .attr("class", "node")
    .attr("r", 12);
    //.call(force.drag());