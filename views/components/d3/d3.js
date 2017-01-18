"use strict";

export default {
    init: function () {

        if (document.getElementById('d3')) {
            console.log('d3 initted!');

            //=============================== declaring all the variables!
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

            function tick() {
                link.attr("x1", function (d) { return d.source.x; })
                    .attr("y1", function (d) { return d.source.y; })
                    .attr("x2", function (d) { return d.target.x; })
                    .attr("y2", function (d) { return d.target.y; });

                node.attr("cx", function (d) { return d.x; })
                    .attr("cy", function (d) { return d.y; });
            }

            var buildGraph = function (res) {

                // var graph =
                //     {
                //         "nodes": [
                //             { "x": 100, "y": 250, "fixed": true },
                //             { "x": 200, "y": 200, "fixed": true },
                //             { "x": 200, "y": 300, "fixed": true },
                //             { "x": 300, "y": 250, "fixed": true }
                //         ],
                //         "links": [
                //             { "source": 0, "target": 1 },
                //             { "source": 0, "target": 2 },
                //             { "source": 1, "target": 3 },
                //             { "source": 2, "target": 3 }
                //         ]
                //     };

                // var nodes = [];
                // var links = [];

                // res.data.forEach(function (result) {
                //     result.node.id = result.node._id;
                //     nodes.push(result.node);

                //     result.link.source = String(result.link._fromId);
                //     result.link.target = String(result.link._toId);
                //     links.push(result.link);
                // })

                // graph.nodes = nodes;
                // graph.links = links;



                var nodes = [];
                var links = [];

                // res.data.forEach(function (dataContainer) {
                for (var i = 0; i < res.data.length; i++) {
                    var dataContainer = res.data[i];
                    //cehck for duplciates
                    var found = false;
                    //nodes.filter(function (m) {console.log(m); return m._id == dataContainer.node._id; }).length > 0;

                    if (!found) {
                        var newNode = dataContainer.node.properties || {};

                        console.log(dataContainer.node);

                        newNode._id = dataContainer.node._id;
                        newNode.type = dataContainer.node._id;
                        newNode.x = 0 + i * 100;
                        newNode.y = 0 + i * 100;
                        newNode.fixed = true;
                        //newNode.text = dataContainer.node.body;
                        console.log(newNode);

                        nodes.push(newNode);

                        dataContainer.link.source = String(dataContainer.link._fromId);
                        dataContainer.link.target = String(dataContainer.link._toId);
                        links.push(dataContainer.link);
                    }
                };

                var graph = { nodes: nodes, links: links };

                /* From my understanding, this force instance is how you call the d3 library and tell it to turn your info into the setup asked for 
                in our case we want the layout called 'force'*/
                force
                    .nodes(graph.nodes)
                    .links(graph.links)
                    .start();

                link = link.data(graph.links)
                    .enter().append("line")
                    .attr("linkDistance", 900)
                    .attr("class", "link");

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
                    .text(function (d) { return d.body; });

            }

            //=============================== declaring all the variables! END!

            //=============================== Get the data!
            //done is called once the ajax call has heard back from the server so by putting buildGraph inside, it only runs when the call returns
            $.ajax("http://localhost:3030/all").done(function (res) {
                buildGraph(res);
            });

        }
    }
}
