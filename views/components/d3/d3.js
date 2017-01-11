"use strict";



export default {
    init: function () {
        
        if (document.getElementById('d3')) {
            console.log('d3 initted!');
            var width = 300,
                height = 500;

            var force = d3.layout.force()
                .size([width, height])
                .on("tick", tick);

            var svg = d3.select("#d3").append("svg")
                .attr("width", width)
                .attr("height", height);

            var link = svg.selectAll(".link"),
                node = svg.selectAll(".node");

            //             node.append("text")
            //   .attr("dx", 12)
            //   .attr("dy", ".35em")
            //   .text(function(d) { return 'gg' });

            function tick() {
                link.attr("x1", function (d) { return d.source.x; })
                    .attr("y1", function (d) { return d.source.y; })
                    .attr("x2", function (d) { return d.target.x; })
                    .attr("y2", function (d) { return d.target.y; });

                node.attr("cx", function (d) { return d.x; })
                    .attr("cy", function (d) { return d.y; });
            }

            var graph = {
                "nodes": [
                    { "x": 100, "y": 250, "fixed": true },
                    { "x": 200, "y": 200, "fixed": true },
                    { "x": 200, "y": 300, "fixed": true },
                    { "x": 300, "y": 250, "fixed": true }
                ],
                "links": [
                    { "source": 0, "target": 1 },
                    { "source": 0, "target": 2 },
                    { "source": 1, "target": 3 },
                    { "source": 2, "target": 3 }
                ]
            };


            /*
            From my understanding, this force instance is how you call the d3 library and tell it to turn your info into the setup asked for 
            in our case we want the layout called 'force'
            */
            force
                .nodes(graph.nodes)
                .links(graph.links)
                .start();

            link = link.data(graph.links)
                .enter().append("line")
                .attr("linkDistance", 900)
                .attr("class", "link");



            // node = node.data(graph.nodes)
            //     .enter().append("circle")
            //     .attr("class", "node")
            //     .attr("r", 12);

            var gnodes = svg.selectAll('g.gnode')
                .data(graph.nodes)
                .enter()
                .append('g')
                .classed('gnode', true);

            // Add one circle in each group
            node = gnodes.append("circle")
                .attr("class", "node")
                .attr("r", 50);

            // Append the labels to each group
            var labels = gnodes.append("text")
                .attr("dx", function (d) { return d.x; })
                .attr("dy", function (d) { return d.y; })
                .text(function (d) { return 'data' + d.data; });


            //.call(force.drag());
        }
    }
}