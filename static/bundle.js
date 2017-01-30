'use strict';

/* Controlling the workspace layout!
 *
 */

var some_data = {
    "nodes": [{ "id": 1 }, { "id": 2 }, { "id": 3 }],
    "edges": [{
        "source": 1,
        "target": 2
    }, {
        "source": 1,
        "target": 3
    }]
};

var alchemy$1 = {
    init: function () {
        if (typeof alchemy != 'undefined') {
            alchemy.begin({ "dataSource": some_data });
            console.log('Alchemy initted!');
        }
    }
};

var d3graph = {
                init: function () {

                                if (document.getElementById('d3')) {
                                                console.log('d3 initted!');

                                                //=============================== declaring all the variables!
                                                var width = 1200,
                                                    height = 1200;

                                                var claimRad = 100;
                                                var claimInArgPadding = 5;

                                                var force = d3.layout.force().size([width, height]).on("tick", tick);

                                                var svg = d3.select("#d3").append("svg").attr("width", width).attr("height", height);

                                                var link = svg.selectAll(".link"),
                                                    node = svg.selectAll(".node");

                                                function tick() {
                                                                link.attr("x1", function (d) {
                                                                                return d.source.x;
                                                                }).attr("y1", function (d) {
                                                                                return d.source.y;
                                                                }).attr("x2", function (d) {
                                                                                return d.target.x;
                                                                }).attr("y2", function (d) {
                                                                                return d.target.y;
                                                                });

                                                                node.attr("cx", function (d) {
                                                                                return d.x;
                                                                }).attr("cy", function (d) {
                                                                                return d.y;
                                                                });
                                                }

                                                var buildGraph = function (res) {

                                                                var nodes = [];
                                                                var links = [];

                                                                var argGroupInfo = res[0].argGroup;
                                                                var argGroupNode = argGroupInfo.properties;

                                                                var claimCount = res.length;
                                                                var sqrRoot = Math.sqrt(claimCount);

                                                                var numbOfColumns = Math.floor(sqrRoot);
                                                                if (claimCount == 2 || claimCount == 3) numbOfColumns = 2; //the rule doesnt work for 2 and 3 and im too dumb to know why yet.
                                                                var numbOfRows = Math.ceil(claimCount / numbOfColumns);

                                                                argGroupNode.claimRad = (claimRad + claimInArgPadding) * numbOfRows + claimRad;

                                                                argGroupNode.x = 400;
                                                                argGroupNode.y = 400;
                                                                argGroupNode.fixed = true;
                                                                nodes.push(argGroupNode);

                                                                for (var i = 0; i < res.length; i++) {

                                                                                var dataContainer = res[i];

                                                                                //check for duplicates
                                                                                var found = nodes.filter(function (m) {
                                                                                                return m._id == dataContainer.claim._id;
                                                                                }).length > 0;

                                                                                if (!found) {
                                                                                                var newNode = dataContainer.claim.properties || {};

                                                                                                //set location to arg group xy then take halfargRad so we are not starting at centre and add half node so we account for nodes centre
                                                                                                var insideCircleX = argGroupNode.x - argGroupNode.claimRad / 2 + claimRad / 2;
                                                                                                var insideCircleY = argGroupNode.y - argGroupNode.claimRad / 2 + claimRad / 2;
                                                                                                var distanceBetweenNodes = claimRad * 2 + claimInArgPadding;
                                                                                                newNode.x = insideCircleX + i / numbOfColumns % 1 * numbOfRows * distanceBetweenNodes;
                                                                                                newNode.y = insideCircleY + Math.floor(i / numbOfRows) * distanceBetweenNodes;

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
                                                                }

                                                                //argGroupNode.x -= (numbOfRows * claimRad)/2;
                                                                //argGroupNode.y 


                                                                // links.forEach(function (link) {
                                                                //     link.source = nodes.findIndex(function (m) { return m._id == link._fromId });
                                                                //     link.target = nodes.findIndex(function (m) { return m._id == link._toId });

                                                                //});

                                                                var graph = { nodes: nodes, links: links };

                                                                /* From my understanding, this force instance is how you call the d3 library and tell it to turn your info into the setup asked for 
                                                                in our case we want the layout called 'force'*/
                                                                force.nodes(graph.nodes).links(graph.links).start();

                                                                link = link.data(graph.links).enter().append("line").attr("class", "link");

                                                                var gnodes = svg.selectAll('g.gnode').data(graph.nodes).enter().append('g').classed('gnode', true);

                                                                // Add one circle in each group
                                                                node = gnodes.append("circle").attr("class", "node").attr("r", function (d) {
                                                                                return d.claimRad;
                                                                });

                                                                // Append the labels to each group
                                                                var labels = gnodes.append("text").attr("dx", function (d) {
                                                                                return d.x - d.claimRad;
                                                                }).attr("dy", function (d) {
                                                                                return d.y;
                                                                }).attr("wrap", "hard").text(function (d) {
                                                                                return d.body;
                                                                });
                                                };

                                                //=============================== declaring all the variables! END!

                                                //=============================== Get the data!
                                                //done is called once the ajax call has heard back from the server so by putting buildGraph inside, it only runs when the call returns
                                                $.ajax("http://localhost:3030/claims/random").done(function (res) {
                                                                buildGraph(res);
                                                });
                                }
                }
};

/* The Event Manager
    * each type of event that is subscribed to becomes an array by the same name
    * That array holds all the functions that have subscribed to the event
    * So when the event fires, those functions will be run
    * When firing an event, you can also pass in data that will be accessible to the subscribers
    * Try not to mutate that data, you never know who else might be expecting it.
    */

var eventSubscribers = {};

var addSubscriber = function (event, subscriber) {
    if (eventSubscribers[event]) {
        eventSubscribers[event].push(subscriber);
    } else {
        eventSubscribers[event] = [subscriber];
    }
    return eventSubscribers[event].length - 1;
};

var eventManager = {
    subscribe: function (event, subscriber) {
        /* Takes the name of an event to subscribe to
            * and a function to run when that event is fired.
            * An index number is returned. This will be needed if 
            * the subscriber is ever to be removed. (or we could implement some other kind of id system?)
            */
        if (event instanceof Array) {
            for (var e = 0; e < event.length; e++) {
                addSubscriber(event[e], subscriber);
            }
        } else {
            addSubscriber(event, subscriber);
        }
    },

    unsubscribe: function (event, index) {
        eventSubscribers[event].splice(index, 1);
    },

    fire: function (event, data) {
        //console.log('EVENT:', event, data);
        setTimeout(function () {
            console.group('EVENT', event, data);
            if (eventSubscribers[event]) {
                for (var s = 0; s < eventSubscribers[event].length; s++) {
                    //s for subscriber
                    try {
                        eventSubscribers[event][s](data);
                    } catch (err) {
                        console.error('err: ', err);
                    }
                }
            }
            console.groupEnd();
        }, 0);
    }
};

/* All the actions (events) that can be fired
 * Inspired by http://redux.js.org/docs/recipes/ReducingBoilerplate.html
 * Build errors are better than run time errors
 */

var actions = {
    USER_SEARCH_SUBMITTED: "USER_SEARCH_SUBMITTED",
    API_SEARCH_SUBMITTED: "API_SEARCH_SUBMITTED",
    API_SEARCH_RETURNED: "API_SEARCH_RETURNED",
    API_SEARCH_ERRORED: "API_SEARCH_ERRORED",
    CLAIM_REQUEST_BY_ID_SUBMITTED: "CLAIM_REQUEST_BY_ID_SUBMITTED",
    API_REQUEST_BY_ID_SUBMITTED: "API_REQUEST_BY_ID_SUBMITTED",
    API_REQUEST_BY_ID_RETURNED: "API_REQUEST_BY_ID_RETURNED",
    API_REQUEST_BY_ID_ERRORED: "API_REQUEST_BY_ID_ERRORED"
};

var graph = {
    nodes: [],
    links: []
};
var updateGraph;

eventManager.subscribe(actions.API_REQUEST_BY_ID_RETURNED, function (data) {
    //a single claim returns: claim:{}, subClaims:[{}], arguments:[{}], argLinks[] and subLinks[]
    //they're all a bit sparse, it's up to the front end to do with them what we will :)

    //1. Add the claim to the graph data (if it's not already in).
    var graphHasClaim = graph.nodes.some(function (node) {
        return node.id == data.claim.id;
    });

    if (!graphHasClaim) {
        graph.nodes.push(data.claim);
    }

    //2. Add the arguments to the graph data (if they aren't already in).
    data.arguments.forEach(function (argument) {

        var graphHasArgument = graph.nodes.some(function (node) {
            return node.id == argument.id;
        });

        if (!graphHasArgument) {
            argument.subClaims = []; //an array for this argument to hold a reference to it's sub claim objects
            graph.nodes.push(argument);
        }
    });

    //3. add the relationships between the claims and their arguments (if they haven't already been established).
    if (data.argLinks.length > 0) {
        //TODO check for duplicates... ?
        data.argLinks.forEach(function (newLink) {
            //check if if newLink is already in the graph
            var graphAlreadyHasLink = graph.links.some(function (existingLink) {
                return existingLink.id == newLink.id;
            });

            if (!graphAlreadyHasLink) {
                graph.links.push(newLink);
            }
        });
    }

    //4. give the arguments references to their sub claim objects: subLinks == subclaim(source) -> argument(target)
    data.subLinks.forEach(function (subLink) {
        //find the argument
        var thisArgument = graph.nodes.find(function (node) {
            return node.id == subLink.target;
        });

        //check if it already has the sub claim
        var subClaimIsLinked = thisArgument.subClaims.some(function (node) {
            return node.id == subLink.source;
        });

        if (!subClaimIsLinked) {
            //find the subClaim (the source) that is referenced in this relationship
            var subClaimToLink = data.subClaims.find(function (subClaim) {
                return subClaim.id == subLink.source;
            });

            thisArgument.subClaims.push(subClaimToLink);
        }
    });

    console.log("graph before", graph);
    updateGraph();
    console.log("graph after", graph);
});

var d3v4graph = {
    init: function () {
        if (document.getElementById('d3v4')) {

            var simulation;

            var width = document.getElementById('d3v4').offsetWidth,
                height = width * 0.75;

            //create the svg & set it's width and height.
            var svg = d3.select("#d3v4").append("svg").attr("width", width).attr("height", height);

            //https://github.com/d3/d3-force
            //configure the force graph simulation
            simulation = d3.forceSimulation().force("link", d3.forceLink().iterations(4).id(function (d) {
                return d.id;
            })).force("charge", d3.forceManyBody().strength(-10)).force("collide", d3.forceCollide().radius(100).iterations(2)).force("center", d3.forceCenter(width / 2, height / 2))
            //force x & y are forces into the center (I think)
            .force("x", d3.forceX()).force("y", d3.forceY());

            var link = svg.append("g").attr("class", "links").selectAll("line");

            var node = svg.append("g").attr("class", "nodes").selectAll("g");

            updateGraph = function () {

                //=========================== creating the graph elements (claim nodes, argument nodes, links)
                // ------------------------- links (first so they go below the claim & arguments)

                //link is already set up as a selection of link elements
                link = link.data(graph.links); //this binds the link element selection to the new data coming in
                link.exit().remove(); //removes any extra elements in the array (if there are more elements than there are in the data coming through)
                link = link.enter().append("line") //now we create the links
                .attr("stroke", function (d) {
                    if (d.type == "OPPOSES") {
                        return 'red';
                    }
                    if (d.type == "SUPPORTS") {
                        return 'green';
                    }
                    return 'black';
                }).merge(link); //returns the selection of links merged with the new data

                //node is already set up as a selection of g elements within the nodes group
                node = node.data(graph.nodes); //this binds them to the new data
                node.exit().remove(); //remove any extra node elements (beyond the length of the data coming in)
                node = node.enter().append("g") //this created the individual node wrapper group
                .merge(node); //returns the selection of nodes merged with the new data

                node.call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended));

                //the claim nodes selection
                //var claimNodes = node.filter(function(d){ return (d.type == "claim"); });

                //claim node selection
                var claim = node.filter(function (d) {
                    return d.type == "claim";
                }).selectAll("g").data(function (node) {
                    return [node];
                }); //this is working

                //wrap it
                claim = claim.enter().append("g").attr("class", "claim-node");

                //build the circle
                claim.append("circle").attr("r", 50);

                //add the text
                claim.append("g").attr("class", "claim-node__body").attr("transform", "translate(-50,-50)").append("switch").append("foreignObject") //needs a width and height
                .attr("width", 100).attr("height", 100).attr("class", "claim-node__foreign-object").append("xhtml:div").attr("class", "claim-node__body-text").html(function (d) {
                    return d.body;
                });

                //the argument nodes selection
                // var argNode = node.filter(function(d){ return (d.type == "argument"); });

                // //build the argument node structure
                // argNode.append("g")
                //         .attr("transform", "translate(-50,0)")
                //             .append("switch")
                //                 .append("foreignObject")//needs a width and height
                //                     .attr("width", 100)
                //                     .attr("height", 100)
                //                     .attr("class", "argument-node__foreign-object");
                // .append("xhtml:div")
                //     .attr("class", "argument-node__body");
                //     .selectAll("div")
                //     .data(function(d){
                //         return d.subClaims;
                //     });

                //the argument's sub claim selection
                //var subclaim = argNode.selectAll("div");
                // argNode.exit().remove();

                // argNode = argNode.enter()
                //     .append("xhtml:div")
                //     .html(function(d){
                //         return d.body;
                //     })
                //     .on("click", function(event){
                //         console.log("sub claim clicked!", event);
                //     })
                //     .merge(argNode);


                //=========================== start the force layout
                simulation.nodes(graph.nodes).on("tick", ticked);

                simulation.force("link").links(graph.links);

                function ticked() {
                    link.attr("x1", function (d) {
                        return d.source.x;
                    }).attr("y1", function (d) {
                        return d.source.y;
                    }).attr("x2", function (d) {
                        return d.target.x;
                    }).attr("y2", function (d) {
                        return d.target.y;
                    });
                    node.attr("transform", function (d) {
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
};

/* Listens to any input with the class .js-search-input
 * On enter, it fires of the relevant ..._SUBMITTED event (normal search / ID search / ...?)
 */

var search = {
    init: function () {
        $('input.js-search-input').on('keypress', function (e) {
            if (e.keyCode == 13) {
                //get the input value
                var term = $('.js-search-input').val();

                if (isNaN(term)) {
                    eventManager.fire(actions.USER_SEARCH_SUBMITTED, term);
                } else {
                    //if the term is just numbers, it's probably an id search
                    eventManager.fire(actions.CLAIM_REQUEST_BY_ID_SUBMITTED, term);
                }
            }
        });
    }
};

/* This is where we talk to the WikiLogic API
 *
 */

eventManager.subscribe(actions.USER_SEARCH_SUBMITTED, function (term) {

    //tell the world we're submitting a search (for spinners and the like)
    eventManager.fire(actions.API_SEARCH_SUBMITTED, term);

    $.ajax("http://localhost:3030/claims?search=" + term).done(function (res) {
        eventManager.fire(actions.API_SEARCH_RETURNED, res.data);
    }).error(function (err) {
        eventManager.fire(actions.API_SEARCH_ERRORED, err);
        console.error('search error', err);
    });
});

eventManager.subscribe(actions.CLAIM_REQUEST_BY_ID_SUBMITTED, function (claimid) {

    //tell the world we're submitting a search (for spinners and the like)
    eventManager.fire(actions.API_REQUEST_BY_ID_SUBMITTED, claimid);

    $.ajax("http://localhost:3030/claims/" + claimid).done(function (res) {
        if (!res.data.hasOwnProperty('claim')) {
            eventManager.fire(actions.API_REQUEST_BY_ID_ERRORED, '404');
            return;
        }
        eventManager.fire(actions.API_REQUEST_BY_ID_RETURNED, res.data);
    }).error(function (err) {
        eventManager.fire(actions.API_REQUEST_BY_ID_ERRORED, err);
        console.error('search error', err);
    });
});

//rollup -> babel -> browser :)

//import * as $ from '../node_modules/jquery/dist/jquery.js';
//import $ from '../node_modules/jquery/dist/jquery.slim.js';

//UI

//Yep, only one onload listener, but we only need one
window.onload = function () {
    alchemy$1.init();
    d3graph.init();
    d3v4graph.init();
    search.init();
};
