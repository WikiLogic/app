"use strict";

import eventManager from '../js-helpers/eventManager.js';
import actions from '../js-helpers/actions.js';
import graphDataConverter from './graph-data-converter.js';
import forceSimulationConfig from './force-simulation-config.js';

export default function () {
    if (document.getElementById('d3')) {

        var graph = {
            nodes: [],
            links: []
        };
        var updateGraph;
        var processClaim;
        var processArgument;

        eventManager.subscribe(actions.API_REQUEST_BY_ID_RETURNED, function (data) {
            graph = graphDataConverter.convertDataFromIdApi(graph, data);

            updateGraph();
        });

        var width = document.getElementById('d3').offsetWidth,
            height = width * 0.75;

        //create the svg & set it's width and height.
        var svg = d3.select("#d3").append("svg")
            .attr("width", width)
            .attr("height", height);

        //https://github.com/d3/d3-force
        //configure the force graph simulation
        var simulation = forceSimulationConfig.default(d3, width, height);

        var link = svg.append("g")
            .attr("class", "links")
            .selectAll("line");

        var nodes = svg.append("g")
            .attr("class", "nodes")
            .selectAll("g");

        processClaim = function (nodes) {
            //claim node selection
            var claims = nodes
                .filter(function (d) { return (d.type == "claim"); })
                .selectAll("g")
                .data(function (node) { return [node]; });

            //wrap it
            claims = claims.enter()
                .append("g")
                .attr("class", "claim-node");

            //build the circle
            claims.append("circle")
                .attr("r", 50);

            //add the text
            claims.append("g")
                .attr("class", "claim-node__body")
                .attr("transform", "translate(-50,-50)")
                .append("switch")
                .append("foreignObject")//needs a width and height
                .attr("width", 100)
                .attr("height", 100)
                .attr("class", "claim-node__foreign-object")
                .append("xhtml:div")
                .attr("class", "claim-node__body-text")
                .html(function (d) {
                    return d.body;
                });
        }

        processArgument = function (graphNodes, nodes) {
            var claimRad = 50;
            var claimInArgPadding = 5;

            var argumentss = nodes
                .filter(function (d) { return (d.type == "argument"); })
                .selectAll("g")
                .data(function (node) { return [node]; });

            var argumentNodes = graphNodes.filter(function (d) { return (d.type == "argument"); });

            //process argumetn groups
            argumentNodes.forEach(function (argGroupNode) {

                var claimCount = argGroupNode.subClaims.length;
                var sqrRoot = Math.sqrt(claimCount);

                var numbOfColumns = Math.floor(sqrRoot);
                if (claimCount == 2 || claimCount == 3) numbOfColumns = 2;//the rule doesnt work for 2 and 3 and im too dumb to know why yet.
                var numbOfRows = Math.ceil(claimCount / numbOfColumns);

                argGroupNode.claimRad = ((claimRad + claimInArgPadding) * numbOfRows) + claimRad;
                console.log(argGroupNode.claimRad);
                argGroupNode.x = 100;
                argGroupNode.y = 100;
                argGroupNode.fixed = true;

                //prcoess sub claims
                for (var i = 0; i < claimCount; i++) {

                    var dataContainer = argGroupNode.subClaims[i];
                    //console.log(dataContainer);
                    //check for duplicates
                    // var found = nodes.filter(function (m) { return m._id == dataContainer.claim._id; }).length > 0;

                    // if (!found) {
                    var newNode = dataContainer;//.claim.properties || {};

                    //set location to arg group xy then take halfargRad so we are not starting at centre and add half node so we account for nodes centre
                    var insideCircleX = argGroupNode.x - (argGroupNode.claimRad / 2) + (claimRad / 2);
                    var insideCircleY = argGroupNode.y - (argGroupNode.claimRad / 2) + (claimRad / 2);
                    var distanceBetweenNodes = (claimRad * 2) + claimInArgPadding;
                    newNode.x = insideCircleX + ((((i / numbOfColumns) % 1) * numbOfRows) * distanceBetweenNodes);
                    newNode.y = insideCircleY + (Math.floor((i / numbOfRows)) * distanceBetweenNodes);

                    // newNode._id = dataContainer.claim._id;
                    // newNode.type = dataContainer.claim._id;
                    newNode.fixed = true;
                    newNode.index = i;
                    newNode.claimRad = claimRad;

                    //nodes.push(newNode);
                    //}
                };
                //    nodes = argGroupNode.subClaims.data(graph.nodes); //this binds them to the new data

                //             nodes.exit().remove(); //remove any extra node elements (beyond the length of the data coming in)
                //             nodes = nodes.enter()
                //                 .append("g") //this created the individual node wrapper group
                //                 .merge(nodes);

                //processClaim(nodes);
            });



            //wrap it
            argumentss = argumentss.enter()
                .append("g")
                .attr("class", "claim-node");

            //build the circle
            argumentss.append("circle")
                .attr("r", function (d) { return d.claimRad; });

            //add the text
            argumentss.append("g")
                .attr("class", "claim-node__body")
                .attr("transform", "translate(-50,-50)")
                .append("switch")
                .append("foreignObject")//needs a width and height
                .attr("width", 100)
                .attr("height", 100)
                .attr("class", "claim-node__foreign-object")
                .append("xhtml:div")
                .attr("class", "claim-node__body-text")
                .html(function (d) {
                    return d.body;
                });
        }

        updateGraph = function () {

            //=========================== creating the graph elements (claim nodes, argument nodes, links)
            // ------------------------- links (first so they go below the claim & arguments)

            //link is already set up as a selection of link elements
            link = link.data(graph.links); //this binds the link element selection to the new data coming in
            link.exit().remove(); //removes any extra elements in the array (if there are more elements than there are in the data coming through)
            link = link.enter()
                .append("g")
                .attr("class", function (d) {
                    if (d.type == "OPPOSES") { return 'link link--opposes'; }
                    if (d.type == "SUPPORTS") { return 'link link--supports'; }
                    return 'white';
                })
                .merge(link); //returns the selection of links merged with the new data

            link.append("line") //now we create the links
                .attr("stroke", function (d) {
                    if (d.type == "OPPOSES") { return 'red'; }
                    if (d.type == "SUPPORTS") { return 'green'; }
                    return 'white';
                })

            link.append("text")
                .html(function (d) { return d.type; });

            //node is already set up as a selection of g elements within the nodes group
            nodes = nodes.data(graph.nodes); //this binds them to the new data

            nodes.exit().remove(); //remove any extra node elements (beyond the length of the data coming in)
            nodes = nodes.enter()
                .append("g") //this created the individual node wrapper group
                .merge(nodes); //returns the selection of nodes merged with the new data


            processClaim(nodes);

            processArgument(graph.nodes, nodes);

            //the argument nodes selection
            // var argumentss = nodes
            //     .filter(function (d) { return (d.type == "argument"); })
            //     .selectAll("g")
            //     .data(function (node) {
            //         return [node];
            //     });

            // argumentss = argumentss.enter()
            //     .append("g")
            //     .attr("class", "argument-node")
            //     .attr("transform", "translate(-180,0)")
            //     .append("switch")
            //     .append("foreignObject")//needs a width and height
            //     .attr("width", 160)
            //     .attr("height", 100)
            //     .attr("class", "argument-node__foreign-object");


            // //make the sub claim selection
            // var argumentSubClaim = argumentss.selectAll("div")
            //     .data(function (d) { return d.subClaims; }); //bind it to the sub claims of an argument

            // console.log(argumentss);
            // //processClaim(argumentSubClaim);

            // argumentSubClaim.enter()
            //     .append("xhtml:div") //create the selection
            //     .attr("class", "argument-node__sub-claim")
            //     .html(function (d) {
            //         return d.body;
            //     })
            //     .on("click", function (event) {
            //         console.log("sub claim clicked!", event);
            //         eventManager.fire(actions.CLAIM_REQUEST_BY_ID_SUBMITTED, event.id);
            //     });


            //=========================== start the force layout
            simulation
                .nodes(graph.nodes)
                .on("tick", ticked);

            simulation.force("link")
                .links(graph.links);

            function ticked() {
                link.selectAll("line")
                    .attr("x1", function (d) { return d.source.x; })
                    .attr("y1", function (d) { return d.source.y; })
                    .attr("x2", function (d) { return d.target.x; })
                    .attr("y2", function (d) { return d.target.y; });

                link.selectAll("text")
                    .attr("x", function (d) { return d.target.x - ((d.target.x - d.source.x) / 2) })
                    .attr("y", function (d) { return d.target.y - ((d.target.y - d.source.y) / 2) });

                nodes.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });

                //make a relationship array for clones (claims that are in an argument & have their own node).
            }
        };

        eventManager.fire(actions.CLAIM_REQUEST_BY_ID_SUBMITTED, '234'); //just to get us kicked off
    }
}