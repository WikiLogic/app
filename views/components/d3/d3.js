"use strict";

export default {
    init: function () {

        if (document.getElementById('d3')) {
            console.log('d3 initted!');
            var width = 300,
                height = 500;

<<<<<<< HEAD
=======



            $.ajax( "http://localhost:3030/claim").done(function(res) {
                console.log("tada!", res);
            });


>>>>>>> 2c1b1c4b6141575717fd79192e45dc85ae71f195
            // The query
            // var query = {
            //     "statements": [{
            //         "statement": "MATCH p=(n)-->(m)<--(k),(n)--(k) RETURN p Limit 100",
            //         "resultDataContents": ["graph", "row"]
            //     }]
            // };

<<<<<<< HEAD
            function txUrl() {
                var url = ("http://localhost:7474").replace(/\/db\/data.*/, "");
                return url + "/db/data/transaction/commit";
            }

            var me = {
                executeQuery: function (query, params, cb) {
                    $.ajax(txUrl(), {
                        type: "POST",
                        data: JSON.stringify({
                            statements: [{
                                statement: query,
                                parameters: params || {},
                                resultDataContents: ["row", "graph"]
                            }]
                        }),
                        contentType: "application/json",
                        error: function (err) {
                            cb(err);
                        },
                        success: function (res) {
                            if (res.errors.length > 0) {
                                cb(res.errors);
                            }
                            else {
                                // var cols = res.results[0].columns;
                                // var rows = res.results[0].data.map(function (row) {
                                //     var r = {};
                                //     cols.forEach(function (col, index) {
                                //         r[col] = row.row[index];
                                //     });
                                //     return r;
                                //});
                                var nodes = [];
                                var rels = [];
                                var labels = [];
                                res.results[0].data.forEach(
                                    function (row) 
                                    {
                                        row.graph.nodes.forEach(
                                            function (n) 
                                            {
                                                var found = nodes.filter(function (m) { return m.id == n.id; }).length > 0;
                                                if (!found) 
                                                {
                                                    var nodee = n.properties || {};
                                                    nodee.id = n.id;
                                                    nodee.type = n.labels[0];
                                                    nodes.push(nodee);
                                                    if (labels.indexOf(nodee.type) == -1) labels.push(nodee.type);
                                                }
                                            });
                                        rels = rels.concat(row.graph.relationships.map(function (x) { return { source: x.startNode, target: x.endNode, caption: x.type } }));
                                    });
                                //cb(null, { table: rows, graph: { nodes: nodes, edges: rels }, labels: labels });

                                var graph = { nodes: nodes, edges: rels };
                                return graph;
                            }
                        }
                    });
                }
            };
=======
            // function txUrl() {
            //     var url = ("http://localhost:7474").replace(/\/db\/data.*/, "");
            //     return url + "/db/data/transaction/commit";
            // }
            // var me = {
            //     executeQuery: function (query, params, cb) {
            //         $.ajax(txUrl(), {
            //             type: "POST",
            //             data: JSON.stringify({
            //                 statements: [{
            //                     statement: query,
            //                     parameters: params || {},
            //                     resultDataContents: ["row", "graph"]
            //                 }]
            //             }),
            //             contentType: "application/json",
            //             error: function (err) {
            //                 cb(err);
            //             },
            //             success: function (res) {
            //                 if (res.errors.length > 0) {
            //                     cb(res.errors);
            //                 } else {
            //                     // var cols = res.results[0].columns;
            //                     // var rows = res.results[0].data.map(function (row) {
            //                     //     var r = {};
            //                     //     cols.forEach(function (col, index) {
            //                     //         r[col] = row.row[index];
            //                     //     });
            //                     //     return r;
            //                     // });
            //                     var nodes = [];
            //                     var rels = [];
            //                     var labels = [];
            //                     res.results[0].data.forEach(function (row) {
            //                         row.graph.nodes.forEach(function (n) {
            //                             var found = nodes.filter(function (m) { return m.id == n.id; }).length > 0;
            //                             if (!found) {
            //                                 var nodee = n.properties || {}; nodee.id = n.id; nodee.type = n.labels[0];
            //                                 nodes.push(nodee);
            //                                 if (labels.indexOf(nodee.type) == -1) labels.push(nodee.type);
            //                             }
            //                         });
            //                         rels = rels.concat(row.graph.relationships.map(function (x) { return { source: x.startNode, target: x.endNode, caption: x.type } }));
            //                     });
            //                     //cb(null, { table: rows, graph: { nodes: nodes, edges: rels }, labels: labels });

            //                     var graph = { nodes: nodes, edges: rels };
            //                     return graph;

            //                 }
            //             }
            //         });
            //     }
            // };
>>>>>>> 2c1b1c4b6141575717fd79192e45dc85ae71f195

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

            //var graph = me(); this would have to be me.executeQuery(); to run... the but above  "me = { ... }" just creates an object that has a property "executeQuery" which happens to be a function :)
            //also $.ajax is asyncronous so that would be sent off then the code below would run, then the request would come back and "return graph;" but by then everything has already finished
            // you'd have to wrap the stuff below in a function like, var buildGraph = function(){ all the stuff below }; then where you have "return graph;" above, swap it out for buildGraph(); 
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
        }
    }
}