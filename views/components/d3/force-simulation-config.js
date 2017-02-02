"use strict";

/* The magic number settings for the mysterious force layout.
 * https://github.com/d3/d3-force
 */

export default {
    default: function(d3, width, height){
        return d3.forceSimulation()
            .force("link", d3.forceLink().iterations(4).id(function(d) { return d.id; }))
            .force("charge", d3.forceManyBody().strength(-10) )
            .force("collide", d3.forceCollide().radius(100).iterations(2) )
            .force("center", d3.forceCenter(width / 2, height / 2) )
            //force x & y are forces into the center (I think)
            .force("x", d3.forceX())
            .force("y", d3.forceY());
    }
}