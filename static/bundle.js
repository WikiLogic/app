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

var graphDataConverter = {
    convertDataFromIdApi: function (graph, data) {

        //1. Add the main claim to the graph data.
        graph = addClaimToGraph(graph, data.claim);

        //2. Add the arguments to the graph data.
        data.arguments.forEach(function (argument) {
            graph = addArgumentToGraph(graph, argument);
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

        return graph;
    }
};

function addClaimToGraph(graph, claim) {
    //check if the claim is already in the graph as a node, we don't want any duplicates!
    var graphHasClaim = graph.nodes.some(function (node) {
        return node.id == claim.id;
    });

    if (graphHasClaim) {
        //"fails" sliently, but I'm not sure if you'd really consider this a fail 
        return graph;
    } else {
        graph.nodes.push(claim);
        return graph;
    }
}

function addArgumentToGraph(graph, argument) {
    var graphHasArgument = graph.nodes.some(function (node) {
        return node.id == argument.id;
    });

    if (graphHasArgument) {
        return graph;
    } else {
        argument.subClaims = []; //an array for this argument to hold a reference to it's sub claim objects
        graph.nodes.push(argument);
        return graph;
    }
}

/* The magic number settings for the mysterious force layout.
 * https://github.com/d3/d3-force
 */

var forceSimulationConfig = {
    default: function (d3, width, height) {
        return d3.forceSimulation().force("link", d3.forceLink().iterations(4).id(function (d) {
            return d.id;
        })).force("charge", d3.forceManyBody().strength(-10)).force("collide", d3.forceCollide().radius(100).iterations(2)).force("center", d3.forceCenter(width / 2, height / 2))
        //force x & y are forces into the center (I think)
        .force("x", d3.forceX()).force("y", d3.forceY());
    }
};

var d3graph = function () {
    if (document.getElementById('d3')) {

        var graph = {
            nodes: [],
            links: []
        };
        var updateGraph;

        eventManager.subscribe(actions.API_REQUEST_BY_ID_RETURNED, function (data) {
            graph = graphDataConverter.convertDataFromIdApi(graph, data);

            updateGraph();
        });

        var width = document.getElementById('d3').offsetWidth,
            height = width * 0.75;

        //create the svg & set it's width and height.
        var svg = d3.select("#d3").append("svg").attr("width", width).attr("height", height);

        //https://github.com/d3/d3-force
        //configure the force graph simulation
        var simulation = forceSimulationConfig.default(d3, width, height);

        var link = svg.append("g").attr("class", "links").selectAll("line");

        var node = svg.append("g").attr("class", "nodes").selectAll("g");

        updateGraph = function () {

            //=========================== creating the graph elements (claim nodes, argument nodes, links)
            // ------------------------- links (first so they go below the claim & arguments)

            //link is already set up as a selection of link elements
            link = link.data(graph.links); //this binds the link element selection to the new data coming in
            link.exit().remove(); //removes any extra elements in the array (if there are more elements than there are in the data coming through)
            link = link.enter().append("g").attr("class", function (d) {
                if (d.type == "OPPOSES") {
                    return 'link link--opposes';
                }
                if (d.type == "SUPPORTS") {
                    return 'link link--supports';
                }
                return 'black';
            }).merge(link); //returns the selection of links merged with the new data

            link.append("line") //now we create the links
            .attr("stroke", function (d) {
                if (d.type == "OPPOSES") {
                    return 'red';
                }
                if (d.type == "SUPPORTS") {
                    return 'green';
                }
                return 'black';
            });

            link.append("text").html(function (d) {
                return d.type;
            });

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
            });

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
            var argument = node.filter(function (d) {
                return d.type == "argument";
            }).selectAll("g").data(function (node) {
                return [node];
            });

            argument = argument.enter().append("g").attr("class", "argument-node").attr("transform", "translate(-80,0)").append("switch").append("foreignObject") //needs a width and height
            .attr("width", 160).attr("height", 100).attr("class", "argument-node__foreign-object");

            //make the sub claim selection
            var argumentSubClaim = argument.selectAll("div").data(function (d) {
                return d.subClaims;
            }); //bind it to the sub claims of an argument

            argumentSubClaim.enter().append("xhtml:div") //create the selection
            .attr("class", "argument-node__sub-claim").html(function (d) {
                return d.body;
            }).on("click", function (event) {
                console.log("sub claim clicked!", event);
                eventManager.fire(actions.CLAIM_REQUEST_BY_ID_SUBMITTED, event.id);
            });

            //=========================== start the force layout
            simulation.nodes(graph.nodes).on("tick", ticked);

            simulation.force("link").links(graph.links);

            function ticked() {
                link.selectAll("line").attr("x1", function (d) {
                    return d.source.x;
                }).attr("y1", function (d) {
                    return d.source.y;
                }).attr("x2", function (d) {
                    return d.target.x;
                }).attr("y2", function (d) {
                    return d.target.y;
                });

                link.selectAll("text").attr("x", function (d) {
                    return d.target.x - (d.target.x - d.source.x) / 2;
                }).attr("y", function (d) {
                    return d.target.y - (d.target.y - d.source.y) / 2;
                });
                node.attr("transform", function (d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });

                //make a relationship array for clones (claims that are in an argument & have their own node).
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

        eventManager.fire(actions.CLAIM_REQUEST_BY_ID_SUBMITTED, '234'); //just to get us kicked off
    }
};

var graphDataConverter$1 = {
    convertDataFromIdApi: function (graph, data) {

        //1. Add the main claim to the graph data.
        graph = addClaimToGraph$1(graph, data.claim);

        //2.1 Add the down arguments to the graph data.
        data.arguments.forEach(function (argument) {
            graph = addArgumentToGraph$1(graph, argument);
        });

        //3. add the relationships between the claims and their arguments (if they haven't already been established).
        if (data.argLinks.length > 0) {
            data.argLinks.forEach(function (newLink) {
                graph = addLinkToGraph(graph, newLink);
            });
        }

        //4. give the arguments references to their sub claim objects: subLinks == subclaim(source) -> argument(target)
        data.subLinks.forEach(function (subLink) {
            console.group("Adding subLink to graph");
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
            console.groupEnd();
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
        forEachArgSubClaimInGraph(graph, function (subClaim, argNode) {

            //check if the sub claim exists as an individual claim node in the graph
            if (isClaimInGraph(graph, subClaim)) {
                console.log("This sub claim has been cloned into a REAL CLAIM!!");

                //link it (there's a check for duplicate links in this function)
                graph = addLinkToGraph(graph, {
                    type: "USED_IN",
                    source: subClaim.id,
                    target: argNode.id
                });
            }
        });

        return graph;
    }
};

function forEachArgSubClaimInGraph(graph, runThis) {
    //run through all the nodes
    graph.nodes.forEach(function (argNode) {
        //but only do stuff for the argument noeds
        if (argNode.type == "argument") {
            //loop through the sub claims in this argument
            argNode.subClaims.forEach(function (subClaim) {
                //and pass the function the sub claim... and the argument node for good measure
                runThis(subClaim, argNode);
            });
        }
    });
}

function isClaimInGraph(graph, claim) {

    return graph.nodes.some(function (node) {
        if (node.type == "claim" && node.id == claim.id) {
            return true;
        }
    });
}

function addClaimToGraph$1(graph, claim) {
    //check if the claim is already in the graph as a node, we don't want any duplicates!
    var graphHasClaim = graph.nodes.some(function (node) {
        return node.id == claim.id;
    });

    if (graphHasClaim) {
        //"fails" sliently, but I'm not sure if you'd really consider this a fail 
        return graph;
    } else {
        graph.nodes.push(claim);
        return graph;
    }
}

function addArgumentToGraph$1(graph, argument) {
    var graphHasArgument = graph.nodes.some(function (node) {
        return node.id == argument.id;
    });

    if (graphHasArgument) {
        return graph;
    } else {
        argument.subClaims = []; //an array for this argument to hold a reference to it's sub claim objects
        graph.nodes.push(argument);
        return graph;
    }
}

function addLinkToGraph(graph, newLink) {
    //if there are no links, it cannot be a duplicate
    if (graph.links.length == 0) {
        graph.links.push(newLink);
        return graph;
    }

    //check if if newLink is already in the graph (using source and target)
    var graphAlreadyHasLink = false; //innocent until proven guilty
    graphAlreadyHasLink = graph.links.some(function (existingLink) {

        if (existingLink.source.id == newLink.source) {
            //oh oh - half way to a match!
            if (existingLink.target.id == newLink.target) {
                return true;
            }
        }
        return false;
    });

    //now do the appropriate thing :)
    if (graphAlreadyHasLink) {
        return graph;
    } else {
        graph.links.push(newLink);
        return graph;
    }
}

/* The magic number settings for the mysterious force layout.
 * https://github.com/d3/d3-force
 * .force: adds a force of the given name, here's a refrence of the forces we can use: https://github.com/d3/d3/blob/master/API.md#forces-d3-force 
 */

var forceSimulationConfig$1 = {
    default: function (d3, width, height) {
        return d3.forceSimulation()

        //Link: creates a force between linked nodes    
        //.forceLink() 
        .force("link", d3.forceLink().id(d => {
            return d.id;
        }).distance(d => {
            return 20;
        }).strength(link => {
            //strength between 0 and 1, any more and it gets unstable
            return 2;
        }))

        //Charge: simluates the forces between nodes. Negative charge pushes away, positive attracts 
        .force("charge", d3.forceManyBody().strength(1000))

        //Collide: stops nodes overlapping
        //.iterations - the more we add the less likley an overlap but the more computation required
        .force("collide", d3.forceCollide().radius(100).iterations(2))

        //Center: sets the center point to be the average of all nodes - does not affect the positioning of nodes relative to each other
        //.force("center", d3.forceCenter(width / 2, height / 2) )

        //ForceX & ForceY: creates a new force on all nodes towards the specified coords. Strength between 0 and 1
        .force("x", d3.forceX(width / 2).strength(0.8)).force("y", d3.forceY(height / 2).strength(0.8))

        //friction: slows the rate of travel from a node's original position

        //alphaDecay: reduces the strength of all forces on each tick (default is 0.0228...)
        .alphaDecay(0.2);
    }
};

var d3v4graph = function () {
    if (document.getElementById('d3v4')) {

        var graph = {
            nodes: [],
            links: []
        };

        var updateGraph;

        eventManager.subscribe(actions.API_REQUEST_BY_ID_RETURNED, function (data) {
            graph = graphDataConverter$1.convertDataFromIdApi(graph, data);
            updateGraph();
            simulation.alpha(0.5).alphaDecay(0.2);
            simulation.restart(); //restarts the simulation so any new nodes don't get stuck
        });

        var width = document.getElementById('d3v4').offsetWidth,
            height = width * 0.75;

        //create the svg & set it's width and height.
        var svg = d3.select("#d3v4").append("svg").attr("width", width).attr("height", height).attr("class", "chart");

        //create a rect for the chart background
        svg.append("rect").attr("width", width).attr("height", height).attr("class", "chart__bg-rect");

        var chart = svg.append("g") //this is the group that gets dragged and scaled
        .attr("class", "chart__drag-g");

        var zoom = d3.zoom().scaleExtent([0.1, 40]).translateExtent([[-1000, -1000], [width + 1000, height + 1000]]).on("zoom", function () {
            //scale the chart
            chart.attr("transform", d3.event.transform);
        });
        //listen to mouse scrolling (pinch?) on the chart group & scale it
        svg.call(zoom);

        //https://github.com/d3/d3-force
        //configure the force graph simulation
        var simulation = forceSimulationConfig$1.default(d3, width, height);

        var link = chart.append("g").attr("class", "chart__links-g").selectAll("line");

        var node = chart.append("g").attr("class", "chart__nodes-g").selectAll("g");

        updateGraph = function () {

            //=========================== creating the graph elements (claim nodes, argument nodes, links)
            // ------------------------- links (first so they go below the claim & arguments)

            //link is already set up as a selection of link elements
            link = link.data(graph.links); //this binds the link element selection to the new data coming in
            link.exit().remove(); //removes any extra elements in the array (if there are more elements than there are in the data coming through)
            link = link.enter().append("g").attr("class", function (d) {
                if (d.type == "OPPOSES") {
                    return 'chart__link chart__link--opposes';
                }
                if (d.type == "SUPPORTS") {
                    return 'chart__link chart__link--supports';
                }
                return 'black';
            }).merge(link); //returns the selection of links merged with the new data

            //make the lines to show the links
            link.selectAll("line").data(function (link) {
                console.log('link', link);return [link];
            }).enter().append("line") //now we create the links
            .attr("stroke", function (d) {
                if (d.type == "OPPOSES") {
                    return 'red';
                }
                if (d.type == "SUPPORTS") {
                    return 'green';
                }
                return 'black';
            });

            //background text to occlude the line
            var linkText = link.selectAll("text").data(function (link) {
                return [link];
            }).enter();

            linkText.append("text").attr("class", "chart__link-text-bg").html(function (d) {
                return d.type;
            });

            //add text to show the type of relationship
            linkText.append("text").attr("class", "chart__link-text").html(function (d) {
                return d.type;
            });

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
            });

            //wrap it
            claim = claim.enter().append("g").attr("class", "chart__claim");

            //build the circle
            claim.append("circle").attr("r", 50);

            //add the text
            claim.append("g").attr("class", "chart__claim-body-g").attr("transform", "translate(-50,-50)").append("switch").append("foreignObject") //needs a width and height
            .attr("width", 100).attr("height", 100).append("xhtml:div").attr("class", "chart__claim-text").html(function (d) {
                return d.body;
            });

            //the argument nodes selection
            var argument = node.filter(function (d) {
                return d.type == "argument";
            }).selectAll("g").data(function (node) {
                return [node];
            });

            argument = argument.enter().append("g").attr("class", "chart__argument").attr("transform", "translate(-80,0)").append("switch").append("foreignObject") //needs a width and height
            .attr("width", 160).attr("height", 100);

            //build the sub claims
            var subClaim = argument.selectAll("div").data(function (d) {
                return d.subClaims;
            }); //bind it to the sub claims of an argument

            subClaim = subClaim.enter().append("xhtml:div") //create the selection
            .attr("class", "chart__sub-claim");

            subClaim.append("xhtml:div").attr("class", "chart__sub-claim-text").html(function (d) {
                return d.body;
            });

            subClaim.append("xhtml:div").attr("class", "chart__sub-claim-button").html("+").on("click", function (event) {
                eventManager.fire(actions.CLAIM_REQUEST_BY_ID_SUBMITTED, event.id);
            }).on("mousedown", function () {
                d3.event.stopPropagation();
            });

            //=========================== start the force layout
            simulation.nodes(graph.nodes).on("tick", ticked);

            simulation.force("link").links(graph.links);

            function ticked() {
                link.selectAll("line").attr("x1", function (d) {
                    return d.source.x;
                }).attr("y1", function (d) {
                    return d.source.y;
                }).attr("x2", function (d) {
                    return d.target.x;
                }).attr("y2", function (d) {
                    return d.target.y;
                });

                link.selectAll("text").attr("x", function (d) {
                    return d.target.x - (d.target.x - d.source.x) / 2;
                }).attr("y", function (d) {
                    return d.target.y - (d.target.y - d.source.y) / 2;
                });
                node.attr("transform", function (d) {
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

        eventManager.fire(actions.CLAIM_REQUEST_BY_ID_SUBMITTED, '35'); //just to get us kicked off
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

/* Listens out for text search results returning.
 * Displays the list of results.
 * Fires an event on click.
 */

eventManager.subscribe(actions.API_SEARCH_RETURNED, function (results) {
    var resultsMarkup = ``;

    results.claims.forEach(function (claim) {
        //for now, random number between 1 and 100 for the status
        var status = Math.floor(Math.random() * 100 + 1);
        resultsMarkup += `
            <div class="search-result js-search-result" data-claimid="${ claim.id }">
                <div class="search-result__body">
                ${ claim.body }
                </div>
                <div class="search-result__status-wrap">
                    <div class="search-result__status-bar search-result__status-bar--${ status }"></div>
                </div>
            </div>
        `;
    });

    $('.js-search-results-list').html(resultsMarkup);

    //set up event listeners
    $('.js-search-result').off('click');
    $('.js-search-result').on('click', function (e) {
        var thisClaimId = $(this).data('claimid');
        console.log("result clicked!", thisClaimId);
        eventManager.fire(actions.CLAIM_REQUEST_BY_ID_SUBMITTED, thisClaimId);
    });
});

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
    d3graph();
    d3v4graph();
    search.init();
};
