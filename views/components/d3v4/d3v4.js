"use strict";

import eventManager from '../js-helpers/eventManager.js';
import actions from '../js-helpers/actions.js';

var graph = {
    nodes: [],
    links: []
};
var updateGraph;

eventManager.subscribe(actions.API_REQUEST_BY_ID_RETURNED, function(data){
    //a single claim returns: claim:{}, subClaims:[{}], arguments:[{}], argLinks[] and subLinks[]
    //they're all a bit sparse, it's up to the front end to do with them what we will :)
    
    //First up - add in the claim that is of interest
    graph.nodes = [data.claim];

    //Now lets prepare the arguments by giving them some detail (the claims that they contain)
    //run through all the arguments, give them an array to hold references to their sub claims.
    data.arguments.forEach(function(argument){
        argument.subClaims = [];
        graph.nodes.push(argument);
    }); 

    //now run through a list of relationships between the arguments and their subclaims
    data.subLinks.forEach(function(subLink){ 
        //find the subClaim (the source) that is referenced in this relationship
        var subClaimToLink;
        data.subClaims.some(function(subClaim){
            if(subClaim.id == subLink.source) {
                subClaimToLink = subClaim;
                return true;
            }
        });

        //find the argument (the target) that is referenced in this relationship
        var argumentToFill;
        graph.nodes.some(function(argument){
            if (argument.id == subLink.target) {
                //put a refrence to the subClaim we just found into this argument
                argument.subClaims.push(subClaimToLink);
                return true;
            }
        });
    });


    //as the argumets are holding the details of their subClaims, the only links d3 need to worry about is between the main claim and it's arguments
    if (data.argLinks.length > 0){
        graph.links = data.argLinks;
    }

    console.log("graph", graph);
    $('d3v4').html(""); //clear graph
    updateGraph();
});

export default {
    init: function () {
        if (document.getElementById('d3v4')) {
            
            var simulation;

            var width = document.getElementById('d3v4').offsetWidth,
                height = width * 0.75;
            
            //create the svg & set it's width and height.
            var svg = d3.select("#d3v4").append("svg")
                .attr("width", width)
                .attr("height", height);

            //https://github.com/d3/d3-force
            //configure the force graph simulation
            simulation = d3.forceSimulation()
                .force("link", d3.forceLink().iterations(4).id(function(d) { return d.id; }))
                .force("charge", d3.forceManyBody().strength(-10) )
                .force("collide", d3.forceCollide().radius(100).iterations(2) )
                .force("center", d3.forceCenter(width / 2, height / 2) )
                //force x & y are forces into the center (I think)
                .force("x", d3.forceX())
                .force("y", d3.forceY());

            var link = svg.append("g")
                .attr("class", "links")
                .selectAll("line")
                .append("line");
            
            var nodes = svg.append("g")
                .attr("class", "nodes")
                .selectAll("g");
            
            updateGraph = function(){
                //normal js - find the width of the d3v4 element & set the height based on that.

                

                //=========================== creating the graph elements (claim nodes, argument nodes, links)
                // ------------------------- links (first so they go below the claim & arguments)

                link = link.data(graph.links);
                link.exit().remove();
                link = link.enter().append("line")
                    .attr("stroke", function(d) {
                        if (d.type == "OPPOSES") {  return 'red';  }
                        if (d.type == "SUPPORTS") { return 'green';  } 
                        return 'black'; 
                    }).merge(link);

                nodes = nodes.data(graph.nodes);
                nodes.exit().remove();

                //nodes.enter().merge(nodes);
                
                
                // ------------------------- claims (currently there's only one)
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

                    //building the internals of each argument
                    argumentNodes.append("g")
                        .attr("transform", "translate(-50,0)")
                            .append("switch")
                                .append("foreignObject")//needs a width and height
                                    .attr("width", 100)
                                    .attr("height", 100)
                                    .attr("class", "argument-node__foreign-object")
                                    .append("xhtml:div")
                                        .attr("class", "argument-node__body")
                                        .selectAll("div")
                                        .data(function(d){
                                            return d.subClaims;
                                        })
                                        .enter()
                                        .append("xhtml:div")
                                        .html(function(d){
                                            return d.body;
                                        })
                                        .on("click", function(event){
                                            console.log("sub claim clicked!", event);
                                        });

                    
                //=========================== start the force layout
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