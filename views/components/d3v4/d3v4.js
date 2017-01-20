"use strict";

import eventManager from '../js-helpers/eventManager.js';
import actions from '../js-helpers/actions.js';

eventManager.subscribe(actions.API_SEARCH_RETURNED, function(data){
    console.log('data', data);

});

var graph = {
  "nodes": [
    {"id": "claimOriginal", "type": "claim", "fx": 500, "fy": 100, "text": "Prisoners should get rehabilitation." },
    {"id": "argForRehab", "type": "argument" },
    {"id": "claimRehabIsCheap", "type": "claim", "text": "The cost of rehabilitation is less than the cost of prison." },
    {"id": "claimCheapIsGood", "type": "claim", "text": "The lowest cost option is best." },
    {"id": "binaryClaim", "type": "claim", "text": "There is only a choice between prison or rehab." },
    {"id": "argAgainstBinary", "type": "argument"},
    {"id": "claimExecutionIsPossible", "type": "claim", "text": "It is possible to execute prisoners." },
    {"id": "claimReleaseIsPossible", "type": "claim", "text": "It is possible to release prisoners." },
    {"id": "argAgainstPossibleRelease", "type": "argument"},
    {"id": "claimCannotRelease", "type": "claim", "text": "Releasing prisoners is not an option for society." },
    {"id": "argAgainstNoRelease", "type": "argument"},
    {"id": "claimUnacceptable", "type": "claim", "text": "Commiting crimes is unacceptable in society." },
    {"id": "claimHighChanec", "type": "claim", "text": "There is a high chance a criminal will commit a crime again if nothing changes in their situation." },
    {"id": "claimModified", "type": "claim", "text": "Prisoners should get rehabilitation for the good of society." },
    {"id": "argAgainstModifiedRehab", "type": "argument"},
    {"id": "expandedBinaryClaim", "type": "claim", "text": "There is only a choice between prison or rehab when considering whats best for society." },
    {"id": "argAgainstNewBinary", "type": "argument"},
    {"id": "expandedBinaryClaim", "type": "claim"},
    {"id": "claimExecutionImmoral", "type": "claim", "text": "Executing prisoners is immoral." },
    {"id": "claimFlatEarth", "type": "claim", "text": "The Earth is flat." },
    {"id": "claimSphericalEarth", "type": "claim", "text": "The Earth is spherical." },
    {"id": "claimConicalEarth", "type": "claim", "text": "The Earth is a cone." },
    {"id": "earthExclusive", "type": "mutualExclusiveGroup"},
    {"id": "claimNorthNegative", "type": "claim", "text": "The North Pole has a negative charge." },
    {"id": "claimNorthPositive", "type": "claim", "text": "The North Pole has a positive charge." }
  ],
  "links": [
    {"source": "argForRehab", "target": "claimOriginal", "type": "SUPPORTS"},
    {"source": "claimRehabIsCheap", "target": "argForRehab", "type": "USED_IN"},
    {"source": "claimCheapIsGood", "target": "argForRehab", "type": "USED_IN"},
    {"source": "binaryClaim", "target": "argForRehab", "type": "USED_IN"},
    {"source": "argAgainstBinary", "target": "binaryClaim", "type": "OPPOSES"},
    {"source": "argAgainstBinary", "target": "binaryClaim", "type": "OPPOSES"},
    {"source": "claimExecutionIsPossible", "target": "argAgainstBinary", "type": "USED_IN"},
    {"source": "claimReleaseIsPossible", "target": "argAgainstBinary", "type": "USED_IN"},
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
    {"source": "claimCannotRelease", "target": "argAgainstNewBinary", "type": "USED_IN"},
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
            
            var simulation;
            var buildGraph = function(){
                //normal js - find the width of the d3v4 element & set the height based on that.
                var width = document.getElementById('d3v4').offsetWidth,
                    height = width * 0.75;
                
                //create the svg & set it's width and height.
                var svg = d3.select("#d3v4").append("svg")
                    .attr("width", width)
                    .attr("height", height);

                //https://github.com/d3/d3-force
                simulation = d3.forceSimulation()
                    .force("link", d3
                        .forceLink()
                        .id(function(d) { 
                            return d.id; 
                    }))
                    .force("charge", d3.forceManyBody().distanceMin(600))
                    .force("center", d3.forceCenter(width / 2, height / 2));
                        /*
                        .distance(function(d) {
                            if ( d.type == "USED_IN") { return 10; }
                            return 100;
                        })
                        .strength(function(d){
                            if ( d.type == "USED_IN") { return 0.5; }
                            return 0.1;
                        }))*/

                // d3.json(graph, function(error, graph) {
                //     if (error) throw error;
                var link = svg.append("g")
                    .attr("class", "links")
                    .selectAll("line")
                    .data(graph.links)
                    .enter().append("line")
                    .attr("stroke", function(d) {
                        if (d.type == "OPPOSES") {  return 'red';  }
                        if (d.type == "SUPPORTS") { return 'green';  } 
                        return 'black'; 
                    });

                //=========================== creating the claim nodes
                var nodes = svg.append("g")
                    .attr("class", "nodes")
                    .selectAll("g")
                    .data(graph.nodes)
                    .enter();
                
                var claimNodes = nodes
                    .filter(function(d){
                        if (d.type == "claim") {
                            return true;
                        } else {
                            return false;
                        }
                    })
                    .append("g")
                    .attr("class", "claim-node")
                    .call(d3.drag()
                        .on("start", dragstarted)
                        .on("drag", dragged)
                        .on("end", dragended));

                    claimNodes.append("switch")
                        .append("foreignObject")//needs a width and height
                            .attr("width", 200)
                            .attr("height", 50)
                            .attr("class", "claim-node__foreign-object")
                            .append("xhtml:div")
                                .attr("class", "claim-node__title")
                                .html(function(d){
                                    console.log('claim node');
                                    return d.body;
                                });
                var argumentNodes = nodes
                    .filter(function(d){
                        if (d.type == "argument") {
                            return true;
                        } else {
                            return false;
                        }
                    })
                    .append("g")
                    .attr("class", "argument-node")
                    .call(d3.drag()
                        .on("start", dragstarted)
                        .on("drag", dragged)
                        .on("end", dragended));

                    argumentNodes.append("circle")
                        .attr("r", 5);
                /* fallback to text to support old ie - future thing
                node.append("text")
                    .text(function(d) { 
                        if (d.type == "claim") { return d.text; }
                        return d.id; 
                    })
                */
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

                    claimNodes
                        .attr("transform", function(d) { 
                            return "translate(" + d.x + "," + d.y + ")"; 
                        });

                    argumentNodes
                        .attr("transform", function(d) { 
                            return "translate(" + d.x + "," + d.y + ")"; 
                        });
                }
            //});
            };

            $.ajax( "http://localhost:3030/claims?search=prison").done(function(res) {
                
                graph = res.data;
                console.log('graph', graph);
                buildGraph();

            });


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