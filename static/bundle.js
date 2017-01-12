"use strict";var some_data={nodes:[{id:1},{id:2},{id:3}],edges:[{source:1,target:2},{source:1,target:3}]},alchemy$1={init:function(){"undefined"!=typeof alchemy&&(alchemy.begin({dataSource:some_data}),console.log("Alchemy initted!"))}},d3graph={init:function(){function e(){n.attr("x1",function(e){return e.source.x}).attr("y1",function(e){return e.source.y}).attr("x2",function(e){return e.target.x}).attr("y2",function(e){return e.target.y}),o.attr("cx",function(e){return e.x}).attr("cy",function(e){return e.y})}if(document.getElementById("d3")){console.log("d3 initted!");var t=300,a=500,i=d3.layout.force().size([t,a]).on("tick",e),r=d3.select("#d3").append("svg").attr("width",t).attr("height",a),n=r.selectAll(".link"),o=r.selectAll(".node"),c={nodes:[{x:100,y:250,fixed:!0},{x:200,y:200,fixed:!0},{x:200,y:300,fixed:!0},{x:300,y:250,fixed:!0}],links:[{source:0,target:1},{source:0,target:2},{source:1,target:3},{source:2,target:3}]};i.nodes(c.nodes).links(c.links).start(),n=n.data(c.links).enter().append("line").attr("linkDistance",900).attr("class","link");var s=r.selectAll("g.gnode").data(c.nodes).enter().append("g").classed("gnode",!0);o=s.append("circle").attr("class","node").attr("r",50);s.append("text").attr("dx",function(e){return e.x}).attr("dy",function(e){return e.y}).text(function(e){return"data"+e.data})}}},graph={nodes:[{id:"claimOriginal",type:"claim",fx:100,fy:100,text:"Prisoners should get rehabilitation."},{id:"argForRehab",type:"argument"},{id:"claimRehabIsCheap",type:"claim",text:"The cost of rehabilitation is less than the cost of prison."},{id:"claimCheapIsGood",type:"claim",text:"The lowest cost option is best."},{id:"binaryClaim",type:"claim",text:"There is only a choice between prison or rehab."},{id:"argAgainstBinary",type:"argument"},{id:"claimExecutionIsPossible",type:"claim",text:"It is possible to execute prisoners."},{id:"claimReleaseIsPossible",type:"claim",text:"It is possible to release prisoners."},{id:"argAgainstPossibleRelease",type:"argument"},{id:"claimCannotRelease",type:"claim",text:"Releasing prisoners is not an option for society."},{id:"argAgainstNoRelease",type:"argument"},{id:"claimUnacceptable",type:"claim",text:"Commiting crimes is unacceptable in society."},{id:"claimHighChanec",type:"claim",text:"There is a high chance a criminal will commit a crime again if nothing changes in their situation."},{id:"claimModified",type:"claim",text:"Prisoners should get rehabilitation for the good of society."},{id:"argAgainstModifiedRehab",type:"argument"},{id:"expandedBinaryClaim",type:"claim",text:"There is only a choice between prison or rehab when considering whats best for society."},{id:"argAgainstNewBinary",type:"argument"},{id:"expandedBinaryClaim",type:"claim"},{id:"claimExecutionImmoral",type:"claim",text:"Executing prisoners is immoral."},{id:"claimFlatEarth",type:"claim",text:"The Earth is flat."},{id:"claimSphericalEarth",type:"claim",text:"The Earth is spherical."},{id:"claimConicalEarth",type:"claim",text:"The Earth is a cone."},{id:"earthExclusive",type:"mutualExclusiveGroup"},{id:"claimNorthNegative",type:"claim",text:"The North Pole has a negative charge."},{id:"claimNorthPositive",type:"claim",text:"The North Pole has a positive charge."}],links:[{source:"argForRehab",target:"claimOriginal",type:"SUPPORTS"},{source:"claimRehabIsCheap",target:"argForRehab",type:"USED_IN"},{source:"claimCheapIsGood",target:"argForRehab",type:"USED_IN"},{source:"binaryClaim",target:"argForRehab",type:"USED_IN"},{source:"argAgainstBinary",target:"binaryClaim",type:"OPPOSES"},{source:"argAgainstBinary",target:"binaryClaim",type:"OPPOSES"},{source:"claimExecutionIsPossible",target:"argAgainstBinary",type:"USED_IN"},{source:"claimReleaseIsPossible",target:"argAgainstBinary",type:"USED_IN"},{source:"argAgainstPossibleRelease",target:"claimReleaseIsPossible",type:"OPPOSES"},{source:"claimCannotRelease",target:"argAgainstPossibleRelease",type:"USED_IN"},{source:"argAgainstNoRelease",target:"claimCannotRelease",type:"OPPOSES"},{source:"claimUnacceptable",target:"argAgainstNoRelease",type:"USED_IN"},{source:"claimHighChanec",target:"argAgainstNoRelease",type:"USED_IN"},{source:"argAgainstModifiedRehab",target:"claimModified",type:"OPPOSES"},{source:"claimRehabIsCheap",target:"argAgainstModifiedRehab",type:"USED_IN"},{source:"claimCheapIsGood",target:"argAgainstModifiedRehab",type:"USED_IN"},{source:"expandedBinaryClaim",target:"argAgainstModifiedRehab",type:"USED_IN"},{source:"argAgainstNewBinary",target:"expandedBinaryClaim",type:"OPPOSES"},{source:"claimCannotRelease",target:"argAgainstNewBinary",type:"USED_IN"},{source:"claimExecutionImmoral",target:"argAgainstNewBinary",type:"USED_IN"},{source:"claimFlatEarth",target:"earthExclusive",type:"MUTUAL_EXCLUSION_LINK"},{source:"claimSphericalEarth",target:"earthExclusive",type:"MUTUAL_EXCLUSION_LINK"},{source:"claimConicalEarth",target:"earthExclusive",type:"MUTUAL_EXCLUSION_LINK"},{source:"claimNorthNegative",target:"claimNorthPositive",type:"MUTUALLY_EXCLUDES"}]},d3v4graph={init:function(){function e(){s.attr("x1",function(e){return e.source.x}).attr("y1",function(e){return e.source.y}).attr("x2",function(e){return e.target.x}).attr("y2",function(e){return e.target.y}),l.attr("transform",function(e){return"translate("+e.x+","+e.y+")"})}function t(e){d3.event.active||c.alphaTarget(.3).restart(),e.fx=e.x,e.fy=e.y}function a(e){e.fx=d3.event.x,e.fy=d3.event.y}function i(e){d3.event.active||c.alphaTarget(0),e.fx=null,e.fy=null}if(document.getElementById("d3v4")){var r=document.getElementById("d3v4").offsetWidth,n=.75*r,o=d3.select("#d3v4").append("svg").attr("width",r).attr("height",n),c=d3.forceSimulation().force("link",d3.forceLink().id(function(e){return e.id}).distance(function(e){return"USED_IN"==e.type?10:100}).strength(function(e){return"USED_IN"==e.type?1:.1})).force("charge",d3.forceManyBody()).force("center",d3.forceCenter(r/2,n/2)),s=o.append("g").attr("class","links").selectAll("line").data(graph.links).enter().append("line").attr("stroke",function(e){return"OPPOSES"==e.type?"red":"SUPPORTS"==e.type?"green":"black"}),l=o.append("g").attr("class","nodes").selectAll("circle").data(graph.nodes).enter().append("g").attr("class",function(e){return"claim"==e.type?"claim-node":"argument"==e.type?"argument-node":void 0}).call(d3.drag().on("start",t).on("drag",a).on("end",i));l.append("switch").append("foreignObject").attr("width",200).attr("height",100).attr("class",function(e){return"claim"==e.type?"claim-node__title":"argument-node__title"}).append("xhtml:p").html(function(e){return"claim"==e.type?e.text:e.id}),c.nodes(graph.nodes).on("tick",e),c.force("link").links(graph.links)}}};window.onload=function(){alchemy$1.init(),d3graph.init(),d3v4graph.init()};
