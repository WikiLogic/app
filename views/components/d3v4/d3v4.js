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
        graph.nodes.push(data.claim);
    };

    //2. Add the arguments to the graph data (if they aren't already in).
    data.arguments.forEach(function(argument){
        
        var graphHasArgument = graph.nodes.some(function(node){
            return (node.id == argument.id);
        });

        if (!graphHasArgument) {
            argument.subClaims = []; //an array for this argument to hold a reference to it's sub claim objects
            graph.nodes.push(argument);
        }

    }); 

    //3. add the relationships between the claims and their arguments (if they haven't already been established).
    if (data.argLinks.length > 0){
        //TODO check for duplicates... ?
        data.argLinks.forEach(function(newLink){
            //check if if newLink is already in the graph
            var graphAlreadyHasLink = graph.links.some(function(existingLink){
                return (existingLink.id == newLink.id);
            });

            if (!graphAlreadyHasLink) {
                graph.links.push(newLink);
            }
        });
    }

    //4. give the arguments references to their sub claim objects: subLinks == subclaim(source) -> argument(target)
    data.subLinks.forEach(function(subLink){ 
        //find the argument
        var thisArgument = graph.nodes.find(function(node){
            return (node.id == subLink.target);
        });

        //check if it already has the sub claim
        var subClaimIsLinked = thisArgument.subClaims.some(function(node){
            return (node.id == subLink.source)
        });

        if (!subClaimIsLinked) {
            //find the subClaim (the source) that is referenced in this relationship
            var subClaimToLink = data.subClaims.find(function(subClaim){
                return (subClaim.id == subLink.source);
            });

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
                .selectAll("line");
            
            var node = svg.append("g")
                .attr("class", "nodes")
                .selectAll("g");
            
            updateGraph = function(){

                //=========================== creating the graph elements (claim nodes, argument nodes, links)
                // ------------------------- links (first so they go below the claim & arguments)

                //link is already set up as a selection of link elements
                link = link.data(graph.links); //this binds the link element selection to the new data coming in
                link.exit().remove(); //removes any extra elements in the array (if there are more elements than there are in the data coming through)
                link = link.enter()
                    .append("g")
                    .attr("class", function(d) {
                        if (d.type == "OPPOSES") {  return 'link link--opposes';  }
                        if (d.type == "SUPPORTS") { return 'link link--supports';  } 
                        return 'black'; 
                    })
                    .merge(link); //returns the selection of links merged with the new data

                link.append("line") //now we create the links
                    .attr("stroke", function(d) {
                        if (d.type == "OPPOSES") {  return 'red';  }
                        if (d.type == "SUPPORTS") { return 'green';  } 
                        return 'black'; 
                    })

                link.append("text")
                    .html(function(d){ return d.type; });

                //node is already set up as a selection of g elements within the nodes group
                node = node.data(graph.nodes); //this binds them to the new data
                node.exit().remove(); //remove any extra node elements (beyond the length of the data coming in)
                node = node.enter()
                    .append("g") //this created the individual node wrapper group
                    .merge(node); //returns the selection of nodes merged with the new data

                node.call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended));

                //the claim nodes selection
                //var claimNodes = node.filter(function(d){ return (d.type == "claim"); });
                
                //claim node selection
                var claim = node
                    .filter(function(d){ return (d.type == "claim"); })
                    .selectAll("g")
                    .data(function(node){ return [node]; });

                //wrap it
                claim = claim.enter()
                    .append("g")
                      .attr("class", "claim-node");

                //build the circle
                claim.append("circle")
                    .attr("r", 50);

                //add the text
                claim.append("g")
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

                //the argument nodes selection
                var argument = node
                    .filter(function(d){ return (d.type == "argument"); })
                    .selectAll("g")
                    .data(function(node){ return [node]; });

                argument = argument.enter()
                    .append("g")
                        .attr("class", "argument-node")
                        .attr("transform", "translate(-80,0)")
                            .append("switch")
                                .append("foreignObject")//needs a width and height
                                    .attr("width", 160)
                                    .attr("height", 100)
                                    .attr("class", "argument-node__foreign-object");

                //make the sub claim selection
                var argumentSubClaim = argument.selectAll("div")
                    .data(function(d){ return d.subClaims; }); //bind it to the sub claims of an argument

                argumentSubClaim.enter()
                    .append("xhtml:div") //create the selection
                        .attr("class", "argument-node__sub-claim")
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
                    link.selectAll("line")
                        .attr("x1", function(d) { return d.source.x; })
                        .attr("y1", function(d) { return d.source.y; })
                        .attr("x2", function(d) { return d.target.x; })
                        .attr("y2", function(d) { return d.target.y; });

                    link.selectAll("text")
                        .attr("x", function(d) { return d.target.x - ( (d.target.x - d.source.x) / 2) })
                        .attr("y", function(d) { return d.target.y - ( (d.target.y - d.source.y) / 2) });
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