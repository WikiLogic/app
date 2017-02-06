"use strict";

/* This file / module is responsible for taking the data from the API
 * and converting it into a structure that's ready for D3.
 */
var api_data_looks_like_this = {
    usedInSiblings: [ { id: 1, body: "blah", state: 50, type: "claim" } ],
    usedInArgs: [ { id: 1, state: 50, type: "argument" } ], //any arguments that the focus claim is used in
    usedInLinks: [ { id: 1, type: "USED_IN", souce: 1, target: 2 } ], //any used in links that the claim is a part of
    claim: { id: 1, body: "blah", state: 50, type: "claim"  }, //the claim who's id was requested from the API
    arguments: [ { id: 1, state: 50, type: "argument" }], //all it's arguments
    argLinks: [ { id: 1, type: "OPPOSES", source: 1, target: 2 } ], //the links between the main claim and the arguments
    subClaims: [ { id: 1, body: "blah", state: 50, type: "claim" } ], //the claims that are included in all the arguments
    subLinks: [ { id: 1, type: "USED_IN", source: 1, target: 2 } ] //the links between the arguments and the claims that make them up
};

var graph_data_looks_like_this = {
    nodes: [ //these are the nodes that will be drawn by the d3 force graph
        { id: 1, type: "claim", body: "blah", state: 50 },
        { id: 1, type: "argument", body: "blah", state: 50 } 
    ],
    links: [ { id: 0, source: 1, target: 2, type:"TYPE" } ], //these are the links between nodes on the force graph
    clone_links: [ { source: 1, target: 2 } ] //for now, source is the claim node, target is the argument node that it's in
};



export default {
    convertDataFromIdApi: function(graph, data){

        //1. Add the main claim to the graph data.
        graph = addClaimToGraph(graph, data.claim);

        //2.1 Add the down arguments to the graph data.
        data.arguments.forEach(function(argument){
            graph = addArgumentToGraph(graph, argument);
        }); 

        //3. add the relationships between the claims and their arguments (if they haven't already been established).
        if (data.argLinks.length > 0){
            data.argLinks.forEach(function(newLink){
                console.group("Adding argLink to graph");
                graph = addLinkToGraph(graph, newLink);
                console.groupEnd();

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
        
        
        //5 Add the up arguments to the graph data. (the ones the main claim is used in)
        // data.usedInArgs.forEach(function(argument){
        //     graph = addArgumentToGraph(graph, argument);
        // }); 

        // //6 add the relationships between the main claim and those arguments
        //  if (data.usedInLinks.length > 0){
        //     //TODO check for duplicates... ?
        //     data.usedInLinks.forEach(function(newLink){
        //         //check if if newLink is already in the graph
        //         var graphAlreadyHasLink = graph.links.some(function(existingLink){
        //             return (existingLink.id == newLink.id);
        //         });

        //         if (!graphAlreadyHasLink) {
        //             graph.links.push(newLink);
        //         }
        //     });
        // }

        //7. Now that all is said and done. Check if any of the claims we just added exist in any argument groups already there
        //loop through all the arguments & their sub claims
        forEachArgSubClaimInGraph(graph, function(subClaim, argNode){

            //check if the sub claim exists as an individual claim node in the graph
            if (isClaimInGraph(graph, subClaim)) {
                console.log("This sub claim has been cloned into a REAL CLAIM!!");

                //link it
                graph = addLinkToGraph(graph, {
                    type: "USED_IN",
                    source: subClaim.id,
                    target: argNode.id
                });
            }
        });

        return graph;
    }
}

function forEachArgSubClaimInGraph(graph, runThis){
    //run through all the nodes
    graph.nodes.forEach(function(argNode){
        //but only do stuff for the argument noeds
        if (argNode.type == "argument") {
            //loop through the sub claims in this argument
            argNode.subClaims.forEach(function(subClaim){
                //and pass the function the sub claim... and the argument node for good measure
                runThis(subClaim, argNode);
            });
        }
    });
}

function isClaimInGraph(graph, claim){
    return graph.nodes.some(function(node){
        if (node.type == "claim" && node.id == claim.id) {
            return true;
        }
    });
}


function addClaimToGraph(graph, claim){
    //check if the claim is already in the graph as a node, we don't want any duplicates!
    var graphHasClaim = graph.nodes.some(function(node){
        return (node.id == claim.id);
    });

    if (graphHasClaim) {
        //"fails" sliently, but I'm not sure if you'd really consider this a fail 
        return graph;
    } else {
        graph.nodes.push(claim);
        return graph;
    };
}

function addArgumentToGraph(graph, argument){
    var graphHasArgument = graph.nodes.some(function(node){
        return (node.id == argument.id);
    });

    if (graphHasArgument) {
        return graph;
    } else {
        argument.subClaims = []; //an array for this argument to hold a reference to it's sub claim objects
        graph.nodes.push(argument);
        return graph;
    }
}

function addLinkToGraph(graph, newLink){
    //if there are no links, it's probably not a duplicate :P
    if (graph.links.length == 0) {
        graph.links.push(newLink);
        return graph;
    }
    
    //check if if newLink is already in the graph (using source and target)
    var graphAlreadyHasLink = false; //innocent until proven guilty
    graphAlreadyHasLink = graph.links.some(function(existingLink){
        if (existingLink.source == newLink.source) {
            //oh oh - half way to a match!
            if (existingLink.target == newLink.target) {
                return false; //that's a match, return false for the "some" to set the graphAlreadyHasLink to true
            }
        }
        return true;
    });

    //now do the appropriate thing :)
    if (!graphAlreadyHasLink) {
        return graph;
    } else {
        graph.links.push(newLink);
        return graph;
    }
}   