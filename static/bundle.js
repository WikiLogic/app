"use strict";var some_data={nodes:[{id:1},{id:2},{id:3}],edges:[{source:1,target:2},{source:1,target:3}]},alchemy$1={init:function(){"undefined"!=typeof alchemy&&(alchemy.begin({dataSource:some_data}),console.log("Alchemy initted!"))}},d3graph={init:function(){function t(){o.attr("x1",function(t){return t.source.x}).attr("y1",function(t){return t.source.y}).attr("x2",function(t){return t.target.x}).attr("y2",function(t){return t.target.y}),c.attr("cx",function(t){return t.x}).attr("cy",function(t){return t.y})}function e(){c.each(function(t){t.px=Math.random()*n,t.py=Math.random()*r}),a.resume()}if(d3){var n=600,r=500,a=d3.layout.force().size([n,r]).on("tick",t),i=d3.select("#d3").append("svg").attr("width",n).attr("height",r).on("click",e),o=i.selectAll(".link"),c=i.selectAll(".node"),d={nodes:[{x:100,y:250,fixed:!0},{x:200,y:200,fixed:!0},{x:200,y:300,fixed:!0},{x:300,y:250,fixed:!0}],links:[{source:0,target:1},{source:0,target:2},{source:1,target:3},{source:2,target:3}]};a.nodes(d.nodes).links(d.links).start(),o=o.data(d.links).enter().append("line").attr("class","link"),c=c.data(d.nodes).enter().append("circle").attr("class","node").attr("r",12).call(a.drag()),console.log("D3 initted!")}}};window.onload=function(){alchemy$1.init(),d3graph.init()};
