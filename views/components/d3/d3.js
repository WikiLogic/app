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

                var nodes = [];
                var links = [];

                for (var i = 0; i < res.data.length; i++) {

                    var dataContainer = res.data[i];
                    console.log(res.data[i]);

                    //check for duplicates
                    var found = nodes.filter(function (m) { return m._id == dataContainer.argGroup._id; }).length > 0;

                    if (!found) {
                        var newNode = dataContainer.argGroup.properties || {};

                        console.log(dataContainer.evidence);

                        newNode._id = dataContainer.argGroup._id;
                        newNode.type = dataContainer.argGroup._id;
                        newNode.x = 0 + i * 100;
                        newNode.y = 0 + i * 100;
                        newNode.fixed = true;
                        newNode.index = i;

                        nodes.push(newNode);

                       // links need to convert from id to index. We add any valid link for now and later we can sort id to index conversion
                        // if (dataContainer.evidence != null )
                        // {
                        //     var foundLink = links.filter(function (m) { return m._id == dataContainer.evidence._id; }).length > 0;
                        //     if (!foundLink) {
                        //     console.log(dataContainer.evidence);
                        //         //links.push(dataContainer.evidence);
                        //     }
                        // }
                    }
                };

                // links.forEach(function (link) {
                //     link.source = nodes.findIndex(function (m) { return m._id == link._fromId });
                //     link.target = nodes.findIndex(function (m) { return m._id == link._toId });

                //});

                var graph = { nodes: nodes, links: links };

                /* From my understanding, this force instance is how you call the d3 library and tell it to turn your info into the setup asked for 
                in our case we want the layout called 'force'*/
                force
                    .nodes(graph.nodes)
                    .links(graph.links)
                    .start();

                link = link.data(graph.links)
                    .enter().append("line")
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
            $.ajax("http://localhost:3030/claims/random").done(function (res) {
                buildGraph(res);
            });
        }
    }
}
