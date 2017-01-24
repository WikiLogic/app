"use strict";

import eventManager from '../js-helpers/eventManager.js';
import actions from '../js-helpers/actions.js';

var graph = {
    nodes: [],
    links: []
};
var buildGraph;

eventManager.subscribe(actions.API_REQUEST_BY_ID_RETURNED, function(data){
    
    graph.nodes = data.subClaims.concat(data.arguments);
    graph.nodes.push(data.claim);

    graph.links = data.subLinks.concat(data.argLinks);

    graph.links.map(function(link){
        link.source = String(link._fromId);
        link.target = String(link._toId);
        return link;
    });
    console.log("graph", graph);
    buildGraph();
});

export default {
    init: function () {
        if (document.getElementById('d3v4')) {
            
            var simulation;

            buildGraph = function(){
                //normal js - find the width of the d3v4 element & set the height based on that.
                var width = document.getElementById('d3v4').offsetWidth,
                    height = width * 0.75;
                
                //create the svg & set it's width and height.
                var svg = d3.select("#d3v4").append("svg")
                    .attr("width", width)
                    .attr("height", height);

                //https://github.com/d3/d3-force
                simulation = d3.forceSimulation()
                    .force("link", d3.forceLink().iterations(4).id(function(d) { return d.id; }))
                    .force("charge", d3.forceManyBody().strength(-10) )
                    .force("collide", d3.forceCollide().radius(50).iterations(2) )
                    .force("center", d3.forceCenter(width / 2, height / 2) )
                    //force x & y are forces into the center (I think)
                    .force("x", d3.forceX())
                    .force("y", d3.forceY());

                

                //=========================== creating the graph elements
                var nodes = svg.append("g")
                    .attr("class", "nodes")
                    .selectAll("g")
                    .data(graph.nodes)
                    .enter();
                
                // ------------------------- claims
                //svg as a circle to avoid overlaps
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

                    claimNodes.append("circle")
                        .attr("r", 50);

                    claimNodes
                        .append("g")
                        .attr("class", "claim-node__body")
                        .attr("transform", "translate(-50,-50)")
                            .append("switch")
                                .append("foreignObject")//needs a width and height
                                    .attr("width", 100)
                                    .attr("height", 100)
                                    .attr("class", "claim-node__foreign-object")
                                    .append("xhtml:div")
                                        .attr("class", "claim-node__body-text")
                                        .html(function(d){
                                            return d.body;
                                        });
                // ------------------------- argument groups
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

                // ------------------------- links
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

                //=========================== creating the force layout
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

            };


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

            eventManager.fire(actions.CLAIM_REQUEST_BY_ID_SUBMITTED, '25'); //just to get us kicked off
        }
    }
}