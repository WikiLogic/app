"use strict";

export default {
    init: function () {

        if (document.getElementById('d3')) {
            console.log('d3 initted!');

            //=============================== declaring all the variables!
            var width = 1200,
                height = 1200;

            var claimRad = 100;
            var claimInArgPadding = 5;

            var force = d3.layout.force()
                .size([width, height])
                .on("tick", tick);

            var svg = d3.select("#d3").append("svg")
                .attr("width", width)
                .attr("height", height);

            var link = svg.selectAll(".link"),
                node = svg.selectAll(".node");

            function tick() {
                link.attr("x1", function (d) { return d.source.x; })
                    .attr("y1", function (d) { return d.source.y; })
                    .attr("x2", function (d) { return d.target.x; })
                    .attr("y2", function (d) { return d.target.y; });

                node.attr("cx", function (d) { return d.x; })
                    .attr("cy", function (d) { return d.y; });
            }

            var buildGraph = function (res) {

                var nodes = [];
                var links = [];


                var argGroupInfo = res[0].argGroup;
                var argGroupNode = argGroupInfo.properties;

                var claimCount = res.length;
                var sqrRoot = Math.sqrt(claimCount);

                var numbOfColumns = Math.floor(sqrRoot); 
                if(claimCount == 2 || claimCount == 3)numbOfColumns = 2;//the rule doesnt work for 2 and 3 and im too dumb to know why yet.
                var numbOfRows = Math.ceil(claimCount/numbOfColumns);
            
                argGroupNode.claimRad = ((claimRad + claimInArgPadding) * numbOfRows) + claimRad;

                argGroupNode.x = 400;
                argGroupNode.y = 400;
                argGroupNode.fixed = true;
                nodes.push(argGroupNode);

                for (var i = 0; i < res.length; i++) {

                    var dataContainer = res[i];

                    //check for duplicates
                    var found = nodes.filter(function (m) { return m._id == dataContainer.claim._id; }).length > 0;

                    if (!found) {
                        var newNode = dataContainer.claim.properties || {};

//set location to arg group xy then take halfargRad so we are not starting at centre and add half node so we account for nodes centre
                        var insideCircleX = argGroupNode.x- (argGroupNode.claimRad / 2) + (claimRad/2);
                        var insideCircleY = argGroupNode.y - (argGroupNode.claimRad / 2) + (claimRad/2);
                        var distanceBetweenNodes = (claimRad * 2) + claimInArgPadding;
                        newNode.x = insideCircleX + ((((i / numbOfColumns) % 1) * numbOfRows) * distanceBetweenNodes);
                        newNode.y = insideCircleY + (Math.floor((i / numbOfRows)) * distanceBetweenNodes);

                        newNode._id = dataContainer.claim._id;
                        newNode.type = dataContainer.claim._id;
                        newNode.fixed = true;
                        newNode.index = i;
                        newNode.claimRad = claimRad;

                        nodes.push(newNode);

                        // links need to convert from id to index. We add any valid link for now and later we can sort id to index conversion
                        // if (dataContainer.evidence != null )
                        // {
                        //     var foundLink = links.filter(function (m) { return m._id == dataContainer.evidence._id; }).length > 0;
                        //     if (!foundLink) {
                        //     console.log(dataContainer.evidence);
                        //         //links.push(dataContainer.evidence);
                        //     }
                        // }
                    }
                };

                //argGroupNode.x -= (numbOfRows * claimRad)/2;
                //argGroupNode.y 


                // links.forEach(function (link) {
                //     link.source = nodes.findIndex(function (m) { return m._id == link._fromId });
                //     link.target = nodes.findIndex(function (m) { return m._id == link._toId });

                //});

                var graph = { nodes: nodes, links: links };

                /* From my understanding, this force instance is how you call the d3 library and tell it to turn your info into the setup asked for 
                in our case we want the layout called 'force'*/
                force
                    .nodes(graph.nodes)
                    .links(graph.links)
                    .start();

                link = link.data(graph.links)
                    .enter().append("line")
                    .attr("class", "link");

                var gnodes = svg.selectAll('g.gnode')
                    .data(graph.nodes)
                    .enter()
                    .append('g')
                    .classed('gnode', true);

                // Add one circle in each group
                node = gnodes.append("circle")
                    .attr("class", "node")
                    .attr("r", function (d) { return d.claimRad; });

                // Append the labels to each group
                var labels = gnodes.append("text")
                    .attr("dx", function (d) { return d.x - d.claimRad; })
                    .attr("dy", function (d) { return d.y; })
                    .attr("wrap","hard")
                    .text(function (d) { return d.body; });

            }

            //=============================== declaring all the variables! END!

            //=============================== Get the data!
            //done is called once the ajax call has heard back from the server so by putting buildGraph inside, it only runs when the call returns
            $.ajax("http://localhost:3030/claims/random").done(function (res) {
                buildGraph(res);
            });
        }
    }
}
