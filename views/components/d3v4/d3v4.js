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
            .attr("height", height)
            .attr("class", "chart");
            
        //create a rect for the chart background
        svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("class", "chart__bg-rect");

        var chart = svg.append("g") //this is the group that gets dragged and scaled
            .attr("class", "chart__drag-g");
            
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
            .attr("class", "chart__links-g")
            .selectAll("line");
        
        var node = chart.append("g")
            .attr("class", "chart__nodes-g")
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
                    if (d.type == "OPPOSES") {  return 'chart__link chart__link--opposes';  }
                    if (d.type == "SUPPORTS") { return 'chart__link chart__link--supports';  } 
                    return 'black'; 
                })
                .merge(link); //returns the selection of links merged with the new data

            //make the lines to show the links
            link.selectAll("line")
                .data(function(link){ console.log('link', link); return [link]; })
                .enter()
                .append("line") //now we create the links
                .attr("stroke", function(d) {
                    if (d.type == "OPPOSES") {  return 'red';  }
                    if (d.type == "SUPPORTS") { return 'green';  } 
                    return 'black'; 
                })

            //background text to occlude the line
            var linkText = link.selectAll("text")
                .data(function(link){ return [link]; })
                .enter();

            linkText.append("text")
                .attr("class", "chart__link-text-bg")
                .html(function(d){ return d.type; });

            //add text to show the type of relationship
            linkText.append("text")
                .attr("class", "chart__link-text")
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
                    .attr("class", "chart__claim");

            //make the buttons - quarter arcs
            var arcButton = function(start, end){
                return d3.arc()
                    .innerRadius(50)
                    .outerRadius(70)
                    .startAngle(start * (Math.PI / 180))
                    .endAngle(end * (Math.PI / 180));
            }
                
            //Up button
            claim.append("path")
                .attr("d", arcButton(-45, 45))
                .on("click", function(event){
                    eventManager.fire(actions.NODE_UP_CLICKED, event.id);
                });
            //right button
            claim.append("path")
                .attr("d", arcButton(45, 135))
                .on("click", function(event){
                    eventManager.fire(actions.NODE_RIGHT_CLICKED, event.id);
                });
            //left button
            claim.append("path")
                .attr("d", arcButton(-135, -45))
                .on("click", function(event){
                    eventManager.fire(actions.NODE_LEFT_CLICKED, event.id);
                });
            //down button
            claim.append("path")
                .attr("d", arcButton(135, 225))
                .on("click", function(event){
                    eventManager.fire(actions.NODE_DOWN_CLICKED, event.id);
                });

            //build the circle
            //claim.append("circle")
            //    .attr("r", 50);

            //add the text
            claim.append("g")
                .attr("class", "chart__claim-body-g")
                    .attr("transform", "translate(-50,-50)")
                        .append("switch")
                            .append("foreignObject")//needs a width and height
                                .attr("width", 100)
                                .attr("height", 100)
                                .append("xhtml:div")
                                    .attr("class", "chart__claim-text")
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
                    .attr("class", "chart__argument")
                    .attr("transform", "translate(-80,0)")
                        .append("switch")
                            .append("foreignObject")//needs a width and height
                                .attr("width", 160)
                                .attr("height", 100);

            //build the sub claims
            var subClaim = argument.selectAll("div")
                .data(function(d){ return d.subClaims; }); //bind it to the sub claims of an argument

            subClaim = subClaim.enter()
                .append("xhtml:div") //create the selection
                .attr("class", "chart__sub-claim");
            
            subClaim.append("xhtml:div")
                .attr("class", "chart__sub-claim-text")
                .html(function(d){
                    return d.body;
                });

            subClaim.append("xhtml:div")
                .attr("class", "chart__sub-claim-button")
                .html("+")
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
            if (!d3.event.active) simulation.alphaTarget(0.01).restart();
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

        eventManager.fire(actions.CLAIM_REQUEST_BY_ID_SUBMITTED, '62'); //just to get us kicked off
    }
}