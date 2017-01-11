"use strict";

var graph = {
  "nodes": [
    {"id": "claimOriginal", "type": "claim", "fx": 100, "fy": 100 },
    {"id": "argForRehab", "type": "argument" },
    {"id": "claimRehabIsCheap", "type": "claim" },
    {"id": "claimCheapIsGood", "type": "claim" },
    {"id": "binaryClaim", "type": "claim"},
    {"id": "argAgainstBinary", "type": "argument"},
    {"id": "claimExecutionIsPossible", "type": "claim"},
    {"id": "claimReleaseIsPossible", "type": "claim"},
    {"id": "argAgainstPossibleRelease", "type": "argument"},
    {"id": "claimCannotRelease", "type": "claim"},
    {"id": "argAgainstNoRelease", "type": "argument"},
    {"id": "claimUnacceptable", "type": "claim"},
    {"id": "claimHighChanec", "type": "claim"},
    {"id": "claimModified", "type": "claim"},
    {"id": "argAgainstModifiedRehab", "type": "argument"},
    {"id": "expandedBinaryClaim", "type": "claim"},
    {"id": "argAgainstNewBinary", "type": "argument"},
    {"id": "expandedBinaryClaim", "type": "claim"},
    {"id": "claimCantRelease", "type": "claim"},
    {"id": "claimExecutionImmoral", "type": "claim"},
    {"id": "claimFlatEarth", "type": "claim"},
    {"id": "claimSphericalEarth", "type": "claim"},
    {"id": "claimConicalEarth", "type": "claim"},
    {"id": "earthExclusive", "type": "mutualExclusiveGroup"},
    {"id": "claimNorthNegative", "type": "claim"},
    {"id": "claimNorthPositive", "type": "claim"}
  ],
  "links": [
    {"source": "argForRehab", "target": "claimOriginal", "type": "SUPPORTS"},
    {"source": "claimRehabIsCheap", "target": "argForRehab", "type": "USED_IN"},
    {"source": "claimCheapIsGood", "target": "argForRehab", "type": "USED_IN"},
    {"source": "binaryClaim", "target": "argForRehab", "type": "USED_IN"},
    {"source": "argAgainstBinary", "target": "binaryClaim", "type": "OPPOSES"},
    {"source": "argAgainstBinary", "target": "binaryClaim", "type": "OPPOSES"},
    {"source": "claimExecutionIsPossible", "target": "binaryClaim", "type": "USED_IN"},
    {"source": "claimReleaseIsPossible", "target": "binaryClaim", "type": "USED_IN"},
    {"source": "argAgainstPossibleRelease", "target": "claimReleaseIsPossible", "type": "OPPOSES"},
    {"source": "claimCannotRelease", "target": "argAgainstPossibleRelease", "type": "USED_IN"},
    {"source": "argAgainstNoRelease", "target": "claimCannotRelease", "type": "OPPOSES"},
    {"source": "claimUnacceptable", "target": "argAgainstNoRelease", "type": "USED_IN"},
    {"source": "claimHighChanec", "target": "argAgainstNoRelease", "type": "USED_IN"},
    {"source": "argAgainstModifiedRehab", "target": "claimModified", "type": "OPPOSES"},
    {"source": "claimRehabIsCheap", "target": "argAgainstModifiedRehab", "type": "USED_IN"},
    {"source": "claimCheapIsGood", "target": "argAgainstModifiedRehab", "type": "USED_IN"},
    {"source": "expandedBinaryClaim", "target": "argAgainstModifiedRehab", "type": "USED_IN"},
    {"source": "argAgainstNewBinary", "target": "expandedBinaryClaim", "type": "OPPOSES"},
    {"source": "claimCantRelease", "target": "argAgainstNewBinary", "type": "USED_IN"},
    {"source": "claimExecutionImmoral", "target": "argAgainstNewBinary", "type": "USED_IN"},
    {"source": "claimFlatEarth", "target": "earthExclusive", "type": "MUTUAL_EXCLUSION_LINK"},
    {"source": "claimSphericalEarth", "target": "earthExclusive", "type": "MUTUAL_EXCLUSION_LINK"},
    {"source": "claimConicalEarth", "target": "earthExclusive", "type": "MUTUAL_EXCLUSION_LINK"},
    {"source": "claimNorthNegative", "target": "claimNorthPositive", "type": "MUTUALLY_EXCLUDES"}
  ]
};


export default {
    init: function () {
        if (document.getElementById('d3v4')) {
            
            //normal js - find the width of the d3v4 element & set the height based on that.
            var width = document.getElementById('d3v4').offsetWidth,
                height = width * 0.75;
            
            //create the svg & set it's width and height.
            var svg = d3.select("#d3v4").append("svg")
                .attr("width", width)
                .attr("height", height);

            //https://github.com/d3/d3-force
            var simulation = d3.forceSimulation()
                .force("link", d3.forceLink().id(function(d) { return d.id; }))
                .force("charge", d3.forceManyBody())
                .force("center", d3.forceCenter(width / 2, height / 2));

            // d3.json(graph, function(error, graph) {
            //     if (error) throw error;

                var link = svg.append("g")
                    .attr("class", "links")
                    .selectAll("line")
                    .data(graph.links)
                    .enter().append("line")
                    .attr("stroke", function(d) {
                        console.log('d', d);
                        if (d.type == "OPPOSES") {
                            return 'red';
                        }

                        if (d.type == "SUPPORTS") {
                            return 'green';
                        } 

                        return 'black'; 
                    });

                var node = svg.append("g")
                    .attr("class", "nodes")
                    .selectAll("circle")
                    .data(graph.nodes)
                    .enter().append("g")
                    .attr("class", "node")
                    .call(d3.drag()
                        .on("start", dragstarted)
                        .on("drag", dragged)
                        .on("end", dragended));

                node.append("text")
                    .text(function(d) { return d.id; })
                    .attr("class", "node__title");

                simulation
                    .nodes(graph.nodes)
                    .on("tick", ticked);

                simulation.force("link")
                    .links(graph.links);

                function ticked() {
                    link
                        .attr("x1", function(d) { return d.source.x; })
                        .attr("y1", function(d) { return d.source.y; })
                        .attr("x2", function(d) { return d.target.x; })
                        .attr("y2", function(d) { return d.target.y; });

                    node
                        .attr("transform", function(d) { 
                            return "translate(" + d.x + "," + d.y + ")"; 
                        });
                }
            //});

            function dragstarted(d) {
                if (!d3.event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            }

            function dragged(d) {
                d.fx = d3.event.x;
                d.fy = d3.event.y;
            }

            function dragended(d) {
                if (!d3.event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            }
        }
    }
}