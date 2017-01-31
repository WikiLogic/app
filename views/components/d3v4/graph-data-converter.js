"use strict";

/* This file / module is responsible for taking the data from the API
 * and converting it into a structure that's ready for D3.
 */
var api_data_looks_like_this = {
    claim: { id: 1, body: "blah", state: false, type: "claim"  },
    arguments: [ { id: 1, state: true, type: "argument" }],
    argLinks: [ { id: 1, type: "OPPOSES", source: 1, target: 2 } ],
    subClaims: [ { id: 1, body: "blah", state: true, type: "claim" } ],
    subLinks: [ { id: 1, type: "USED_IN", source: 1, target: 2 } ]
};

var graph_data_looks_like_this = {
    nodes: [ //these are the nodes that will be drawn by the d3 force graph
        { id: 1, type: "claim", body: "blah", state: false },
        { id: 1, type: "argument", body: "blah", state: false } 
    ],
    links: [ { id: 0, source: 1, target: 2, type:"TYPE" } ] //these are the links between nodes on the force graph

};


export default {
    convertDataFromIdApi: function(graph, data){
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

        return graph;
    }
}