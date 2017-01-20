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
            $.ajax("http://localhost:3030/all").done(function (res) {
                buildGraph(res);
            });
        }
    }
};

var graph = {
    "nodes": [{ "id": "claimOriginal", "type": "claim", "fx": 500, "fy": 100, "text": "Prisoners should get rehabilitation." }, { "id": "argForRehab", "type": "argument" }, { "id": "claimRehabIsCheap", "type": "claim", "text": "The cost of rehabilitation is less than the cost of prison." }, { "id": "claimCheapIsGood", "type": "claim", "text": "The lowest cost option is best." }, { "id": "binaryClaim", "type": "claim", "text": "There is only a choice between prison or rehab." }, { "id": "argAgainstBinary", "type": "argument" }, { "id": "claimExecutionIsPossible", "type": "claim", "text": "It is possible to execute prisoners." }, { "id": "claimReleaseIsPossible", "type": "claim", "text": "It is possible to release prisoners." }, { "id": "argAgainstPossibleRelease", "type": "argument" }, { "id": "claimCannotRelease", "type": "claim", "text": "Releasing prisoners is not an option for society." }, { "id": "argAgainstNoRelease", "type": "argument" }, { "id": "claimUnacceptable", "type": "claim", "text": "Commiting crimes is unacceptable in society." }, { "id": "claimHighChanec", "type": "claim", "text": "There is a high chance a criminal will commit a crime again if nothing changes in their situation." }, { "id": "claimModified", "type": "claim", "text": "Prisoners should get rehabilitation for the good of society." }, { "id": "argAgainstModifiedRehab", "type": "argument" }, { "id": "expandedBinaryClaim", "type": "claim", "text": "There is only a choice between prison or rehab when considering whats best for society." }, { "id": "argAgainstNewBinary", "type": "argument" }, { "id": "expandedBinaryClaim", "type": "claim" }, { "id": "claimExecutionImmoral", "type": "claim", "text": "Executing prisoners is immoral." }, { "id": "claimFlatEarth", "type": "claim", "text": "The Earth is flat." }, { "id": "claimSphericalEarth", "type": "claim", "text": "The Earth is spherical." }, { "id": "claimConicalEarth", "type": "claim", "text": "The Earth is a cone." }, { "id": "earthExclusive", "type": "mutualExclusiveGroup" }, { "id": "claimNorthNegative", "type": "claim", "text": "The North Pole has a negative charge." }, { "id": "claimNorthPositive", "type": "claim", "text": "The North Pole has a positive charge." }],
    "links": [{ "source": "argForRehab", "target": "claimOriginal", "type": "SUPPORTS" }, { "source": "claimRehabIsCheap", "target": "argForRehab", "type": "USED_IN" }, { "source": "claimCheapIsGood", "target": "argForRehab", "type": "USED_IN" }, { "source": "binaryClaim", "target": "argForRehab", "type": "USED_IN" }, { "source": "argAgainstBinary", "target": "binaryClaim", "type": "OPPOSES" }, { "source": "argAgainstBinary", "target": "binaryClaim", "type": "OPPOSES" }, { "source": "claimExecutionIsPossible", "target": "argAgainstBinary", "type": "USED_IN" }, { "source": "claimReleaseIsPossible", "target": "argAgainstBinary", "type": "USED_IN" }, { "source": "argAgainstPossibleRelease", "target": "claimReleaseIsPossible", "type": "OPPOSES" }, { "source": "claimCannotRelease", "target": "argAgainstPossibleRelease", "type": "USED_IN" }, { "source": "argAgainstNoRelease", "target": "claimCannotRelease", "type": "OPPOSES" }, { "source": "claimUnacceptable", "target": "argAgainstNoRelease", "type": "USED_IN" }, { "source": "claimHighChanec", "target": "argAgainstNoRelease", "type": "USED_IN" }, { "source": "argAgainstModifiedRehab", "target": "claimModified", "type": "OPPOSES" }, { "source": "claimRehabIsCheap", "target": "argAgainstModifiedRehab", "type": "USED_IN" }, { "source": "claimCheapIsGood", "target": "argAgainstModifiedRehab", "type": "USED_IN" }, { "source": "expandedBinaryClaim", "target": "argAgainstModifiedRehab", "type": "USED_IN" }, { "source": "argAgainstNewBinary", "target": "expandedBinaryClaim", "type": "OPPOSES" }, { "source": "claimCannotRelease", "target": "argAgainstNewBinary", "type": "USED_IN" }, { "source": "claimExecutionImmoral", "target": "argAgainstNewBinary", "type": "USED_IN" }, { "source": "claimFlatEarth", "target": "earthExclusive", "type": "MUTUAL_EXCLUSION_LINK" }, { "source": "claimSphericalEarth", "target": "earthExclusive", "type": "MUTUAL_EXCLUSION_LINK" }, { "source": "claimConicalEarth", "target": "earthExclusive", "type": "MUTUAL_EXCLUSION_LINK" }, { "source": "claimNorthNegative", "target": "claimNorthPositive", "type": "MUTUALLY_EXCLUDES" }]
};

var d3v4graph = {
    init: function () {
        if (document.getElementById('d3v4')) {

            var simulation;
            var buildGraph = function () {
                //normal js - find the width of the d3v4 element & set the height based on that.
                var width = document.getElementById('d3v4').offsetWidth,
                    height = width * 0.75;

                //create the svg & set it's width and height.
                var svg = d3.select("#d3v4").append("svg").attr("width", width).attr("height", height);

                //https://github.com/d3/d3-force
                simulation = d3.forceSimulation().force("link", d3.forceLink().id(function (d) {
                    return d.id;
                })).force("charge", d3.forceManyBody().distanceMin(600)).force("center", d3.forceCenter(width / 2, height / 2));
                /*
                .distance(function(d) {
                    if ( d.type == "USED_IN") { return 10; }
                    return 100;
                })
                .strength(function(d){
                    if ( d.type == "USED_IN") { return 0.5; }
                    return 0.1;
                }))*/

                // d3.json(graph, function(error, graph) {
                //     if (error) throw error;
                var link = svg.append("g").attr("class", "links").selectAll("line").data(graph.links).enter().append("line").attr("stroke", function (d) {
                    if (d.type == "OPPOSES") {
                        return 'red';
                    }
                    if (d.type == "SUPPORTS") {
                        return 'green';
                    }
                    return 'black';
                });

                var node = svg.append("g").attr("class", "nodes").selectAll("circle").data(graph.nodes).enter().append("g").attr("class", function (d) {
                    return d.type + "-node";
                }).call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended));

                node.append("switch").append("foreignObject") //needs a width and height
                .attr("width", 200).attr("height", 100).attr("class", function (d) {
                    return d.type + "-node__foreign-object";
                }).append("xhtml:div").attr("class", function (d) {
                    return d.type + "-node__title";
                }).html(function (d) {
                    if (d.type == "claim") {
                        return d.text;
                    }
                    return d.id;
                });
                /* fallback to text to support old ie - future thing
                node.append("text")
                    .text(function(d) { 
                        if (d.type == "claim") { return d.text; }
                        return d.id; 
                    })
                */
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
                }
                //});
            };

            $.ajax("http://localhost:3030/claims/Prisoners").done(function (res) {

                console.log('contains search', res);

                var nodes = [];
                var links = [];

                //format the raw data to be as we need it
                res.data.forEach(function (result, index) {
                    //=========== format the node
                    var node = {
                        id: String(index),
                        text: result.node.properties.body
                    };
                    if (result.node.labels.length > 0) {
                        node.type = result.node.labels[0].toLowerCase();
                    }
                    nodes.push(node);

                    //----------- format the link
                    links.push({
                        source: String(result.link._fromId),
                        target: String(result.link._toId),
                        type: result.link.type
                    });
                });

                graph.nodes = nodes;
                graph.links = links;

                //but for now, I'll just pass you're mock data
                buildGraph();
                console.log('graph', graph);
            });

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
            if (eventSubscribers[event]) {
                console.log('EVENT', event, data);
                for (var s = 0; s < eventSubscribers[event].length; s++) {
                    //s for subscriber
                    try {
                        eventSubscribers[event][s](data);
                    } catch (err) {
                        console.error('err: ', err);
                    }
                }
            }
        }, 0);
    }
};

var search = {
    init: function () {
        $('.js-search-input').on('keypress', function (e) {
            console.log('search typing!', e);
            if (e.keyCode == 13) {
                //get the input value, sent it to the API
                var term = $('.js-search-input').val();
                console.log("term", term);
                $.ajax("http://localhost:3030/claims/" + term).done(function (res) {
                    if (res.data.matches.length > 0) {
                        console.log('claims found', res.data.matches);
                        eventManager.fire('SEARCH_RESULTS', res.data.matches);
                    } else {
                        console.warn('no results returned');
                    }
                }).error(function (err) {
                    console.error('search error', err);
                });
            }
        });
    }
};

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
