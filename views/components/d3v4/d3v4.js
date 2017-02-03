"use strict";

import eventManager from '../js-helpers/eventManager.js';
import actions from '../js-helpers/actions.js';
import graphDataConverter from './graph-data-converter.js';
import forceSimulationConfig from './force-simulation-config.js';

export default function () {
    if (document.getElementById('d3v4')) {

        var graph = {
            nodes: [],
            links: []
        };
        var updateGraph;

        eventManager.subscribe(actions.API_REQUEST_BY_ID_RETURNED, function(data){
            graph = graphDataConverter.convertDataFromIdApi(graph, data);
            updateGraph();
            simulation.alpha(0.5).alphaDecay(0.2);
            simulation.restart(); //restarts the simulation so any new nodes don't get stuck
        });

        
        var width = document.getElementById('d3v4').offsetWidth,
            height = width * 0.75;

        //create the svg & set it's width and height.
        var svg = d3.select("#d3v4").append("svg")
            .attr("width", width)
            .attr("height", height);
        var chart = svg.append("g");//this is the group that willhost the graph :)
            
        var zoom = d3.zoom()
            .scaleExtent([0.1, 40])
            .translateExtent([[-1000, -1000], [width + 1000, height + 1000]])
            .on("zoom", function(){
                //scale the chart
                chart.attr("transform", d3.event.transform);
            });
        //listen to mouse scrolling (pinch?) on the chart group & scale it
        svg.call(zoom);

        //https://github.com/d3/d3-force
        //configure the force graph simulation
        var simulation = forceSimulationConfig.default(d3, width, height);


        var link = chart.append("g")
            .attr("class", "links")
            .selectAll("line");
        
        var node = chart.append("g")
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
                        eventManager.fire(actions.CLAIM_REQUEST_BY_ID_SUBMITTED, event.id);
                    })
                    .on("mousedown", function(){
                        d3.event.stopPropagation(); 
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
                    
                //make a relationship array for clones (claims that are in an argument & have their own node).
            }

        };


        function dragstarted(d) {
            if (!d3.event.active) simulation.alphaTarget(0.008).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragended(d) {
            if (!d3.event.active) simulation.alphaTarget(0);
            //fix this node
            //d.fx = null;
            //d.fy = null;
        }

        eventManager.fire(actions.CLAIM_REQUEST_BY_ID_SUBMITTED, '25'); //just to get us kicked off
    }
}