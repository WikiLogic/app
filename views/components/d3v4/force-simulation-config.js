"use strict";

/* The magic number settings for the mysterious force layout.
 * https://github.com/d3/d3-force
 * .force: adds a force of the given name, here's a refrence of the forces we can use: https://github.com/d3/d3/blob/master/API.md#forces-d3-force 
 */

export default {
    default: function(d3, width, height){
        return d3.forceSimulation()
            
            //Link: creates a force between linked nodes    
                //.forceLink() 
            .force("link", d3.forceLink().id(function(d) { return d.id; }))
            
            //Charge: simluates the forces between nodes. Negative charge pushes away, positive attracts 
            .force("charge", d3.forceManyBody().strength(1000) )
            
            //Collide: stops nodes overlapping
                //.iterations - the more we add the less likley an overlap but the more computation required
            .force("collide", d3.forceCollide().radius(100).iterations(2) )

            //Center: sets the center point to be the average of all nodes - does not affect the positioning of nodes relative to each other
            //.force("center", d3.forceCenter(width / 2, height / 2) )

            //ForceX & ForceY: creates a new force on all nodes towards the specified coords. Strength between 0 and 1
            .force("x", d3.forceX(width / 2).strength(0.8))
            .force("y", d3.forceY(height / 2).strength(0.8))
            
            //friction: slows the rate of travel from a node's original position
            
            //alphaDecay: reduces the strength of all forces on each tick (default is 0.0228...)
            .alphaDecay(0.2);
            //.force("alpha", d3.alphaDecay());
    }
}