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
    
    //1. Add the claim to the graph data (if it's not already in).
    var graphHasClaim = graph.nodes.some(function(node){
        return (node.id == data.claim.id);
    });

    if (!graphHasClaim) {
        console.log("NEW CLAIM!");
        graph.nodes.push(data.claim);
    };

    //2. Add the arguments to the graph data (if they aren't already in).
    data.arguments.forEach(function(argument){
        
        var graphHasArgument = graph.nodes.some(function(node){
            return (node.id == argument.id);
        });

        if (!graphHasArgument) {
            console.log("NEW ARG");
            argument.subClaims = []; //an array for this argument to hold a reference to it's sub claim objects
            graph.nodes.push(argument);
        }

    }); 

    //3. add the relationships between the claims and their arguments (if they haven't already been established).
    if (data.argLinks.length > 0){
        //TODO check for duplicates... ?
        graph.links = graph.links.concat(data.argLinks);
    }

    //4. give the arguments references to their sub claim objects: subLinks == subclaim(source) -> argument(target)
    data.subLinks.forEach(function(subLink){ 
        //find the argument
        var thisArgument = graph.nodes.find(function(node){
            return (node.id == subLink.target);
        });

        //check if it already has the sub claim
        var subClaimIsLinked = thisArgument.subClaims.some(function(node){
            console.log("- ", node.id, subLink.source);
            return (node.id == subLink.source)
        });

        if (!subClaimIsLinked) {
            //find the subClaim (the source) that is referenced in this relationship
            var subClaimToLink = data.subClaims.find(function(subClaim){
                return (subClaim.id == subLink.source);
            });

            console.log('NEW SUB CLAIM', subClaimToLink);
            thisArgument.subClaims.push(subClaimToLink);
        }
    });



    console.log("graph before", graph);
    updateGraph();
    console.log("graph after", graph);
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
            
            var node = svg.append("g")
                .attr("class", "nodes")
                .selectAll("g");
            
            updateGraph = function(){

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

                node = node.data(graph.nodes);
                node.exit().remove();
                node = node.enter()
                    .append("g")
                    .call(d3.drag()
                        .on("start", dragstarted)
                        .on("drag", dragged)
                        .on("end", dragended))
                    .merge(node);
                
                //the claim nodes
                node.filter(function(d){ return (d.type == "claim"); })
                    .append("circle")
                    .attr("class", "claim-node")
                    .attr("r", 50);
                //and their content
                node.filter(function(d){ return (d.type == "claim"); })
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
                //the argument nodes
                var argNode = node.filter(function(d){ return (d.type == "argument"); })
                    .append("g")
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
                                        });
                                        argNode.exit().remove();
                                        argNode = argNode.enter()
                                        .append("xhtml:div")
                                        .html(function(d){
                                            return d.body;
                                        })
                                        .on("click", function(event){
                                            console.log("sub claim clicked!", event);
                                        })
                                        .merge(argNode);


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
                    node
                        .attr("transform", function(d) { 
                            return "translate(" + d.x + "," + d.y + ")"; 
                        });
                    // claimNodes
                    //     .attr("transform", function(d) { 
                    //         return "translate(" + d.x + "," + d.y + ")"; 
                    //     });

                    // argumentNodes
                    //     .attr("transform", function(d) { 
                    //         return "translate(" + d.x + "," + d.y + ")"; 
                    //     });
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