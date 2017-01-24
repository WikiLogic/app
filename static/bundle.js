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
            var width = 300,
                height = 500;

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

                for (var i = 0; i < res.data.length; i++) {

                    var dataContainer = res.data[i];
                    console.log(res.data[i]);

                    //check for duplicates
                    var found = nodes.filter(function (m) {
                        return m._id == dataContainer.argGroup._id;
                    }).length > 0;

                    if (!found) {
                        var newNode = dataContainer.argGroup.properties || {};

                        console.log(dataContainer.evidence);

                        newNode._id = dataContainer.argGroup._id;
                        newNode.type = dataContainer.argGroup._id;
                        newNode.x = 0 + i * 100;
                        newNode.y = 0 + i * 100;
                        newNode.fixed = true;
                        newNode.index = i;

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
                node = gnodes.append("circle").attr("class", "node").attr("r", 50);

                // Append the labels to each group
                var labels = gnodes.append("text").attr("dx", function (d) {
                    return d.x;
                }).attr("dy", function (d) {
                    return d.y;
                }).text(function (d) {
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
var buildGraph;

eventManager.subscribe(actions.API_REQUEST_BY_ID_RETURNED, function (data) {

    graph.nodes = data.subClaims.concat(data.arguments);
    graph.nodes.push(data.claim);

    graph.links = data.subLinks.concat(data.argLinks);

    graph.links.map(function (link) {
        link.source = String(link._fromId);
        link.target = String(link._toId);
        return link;
    });
    console.log("graph", graph);
    buildGraph();
});

var d3v4graph = {
    init: function () {
        if (document.getElementById('d3v4')) {

            var simulation;

            buildGraph = function () {
                //normal js - find the width of the d3v4 element & set the height based on that.
                var width = document.getElementById('d3v4').offsetWidth,
                    height = width * 0.75;

                //create the svg & set it's width and height.
                var svg = d3.select("#d3v4").append("svg").attr("width", width).attr("height", height);

                //https://github.com/d3/d3-force
                simulation = d3.forceSimulation().force("link", d3.forceLink().iterations(4).id(function (d) {
                    return d.id;
                })).force("charge", d3.forceManyBody().strength(-10)).force("collide", d3.forceCollide().radius(50).iterations(2)).force("center", d3.forceCenter(width / 2, height / 2))
                //force x & y are forces into the center (I think)
                .force("x", d3.forceX()).force("y", d3.forceY());

                //=========================== creating the graph elements
                var nodes = svg.append("g").attr("class", "nodes").selectAll("g").data(graph.nodes).enter();

                // ------------------------- claims
                //svg as a circle to avoid overlaps
                var claimNodes = nodes.filter(function (d) {
                    if (d.type == "claim") {
                        return true;
                    } else {
                        return false;
                    }
                }).append("g").attr("class", "claim-node").call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended));

                claimNodes.append("circle").attr("r", 50);

                claimNodes.append("g").attr("class", "claim-node__body").attr("transform", "translate(-50,-50)").append("switch").append("foreignObject") //needs a width and height
                .attr("width", 100).attr("height", 100).attr("class", "claim-node__foreign-object").append("xhtml:div").attr("class", "claim-node__body-text").html(function (d) {
                    return d.body;
                });
                // ------------------------- argument groups
                var argumentNodes = nodes.filter(function (d) {
                    if (d.type == "argument") {
                        return true;
                    } else {
                        return false;
                    }
                }).append("g").attr("class", "argument-node").call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended));

                argumentNodes.append("circle").attr("r", 5);

                // ------------------------- links
                var link = svg.append("g").attr("class", "links").selectAll("line").data(graph.links).enter().append("line").attr("stroke", function (d) {
                    if (d.type == "OPPOSES") {
                        return 'red';
                    }
                    if (d.type == "SUPPORTS") {
                        return 'green';
                    }
                    return 'black';
                });

                //=========================== creating the force layout
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

                    claimNodes.attr("transform", function (d) {
                        return "translate(" + d.x + "," + d.y + ")";
                    });

                    argumentNodes.attr("transform", function (d) {
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
};

/* Listens to any input with the class .js-search-input
 * On enter, it fires the USER_SEARCH_SUBMITTED event along with the search term
 */

var search = {
    init: function () {
        $('input.js-search-input').on('keypress', function (e) {
            if (e.keyCode == 13) {
                //get the input value
                var term = $('.js-search-input').val();
                //fire!
                eventManager.fire(actions.USER_SEARCH_SUBMITTED, term);
                //It's out of our hands now :) 
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
