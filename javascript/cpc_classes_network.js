
function cpc_classes_network(){
    d3.csv("data/firm.csv",function(error,data) {
        createNetwork(data)
    });
    var cpc_class_name = {};
    d3.csv("data/cpc_class_names.csv", function(error, cpc_classes_data) {
        for(let i = 0 ; i < cpc_classes_data.length; i++){
            cpc_class_name[cpc_classes_data[i].cpc_class] = cpc_classes_data[i].cpc_class_name;
        }
    });
// }
    
function createNetwork(edgelist) {
  var nodeHash = {};
  var nodes = [];
  var edges = [];

  edgelist.forEach(function (edge) {
    if (!nodeHash[edge.source]) {
      nodeHash[edge.source] = {id: edge.source, label: edge.source};
      nodes.push(nodeHash[edge.source]);
    }
    if (!nodeHash[edge.target]) {
      nodeHash[edge.target] = {id: edge.target, label: edge.target};
      nodes.push(nodeHash[edge.target]);
    }
    if (edge.weight >= 5) {
      edges.push({source: nodeHash[edge.source], target: nodeHash[edge.target], weight: edge.weight});
    }
  });
  createForceNetwork(nodes, edges);
}

function createForceNetwork(nodes, edges) {

    // var offsetHeight = document.getElementById('networkMap_id').offsetHeight
    // console.log("offsetHeight:", offsetHeight)
    // var offsetWidth = document.getElementById('networkMap_id').offsetWidth
    // console.log("offsetWidth:", offsetWidth)

    var width = 400,
        height = 350;
    //create a network from an edgelist 
    // .id(function(d) { return d.id; })
    var simulation = d3.forceSimulation(nodes)
                    .force("link", d3.forceLink().distance(70))
                    .force("charge", d3.forceManyBody())
                    // .force('centerX', d3.forceX(width / 2))
                    // .force('centerY', d3.forceY(height / 2));
                    .force("center", d3.forceCenter(width / 2, height / 2))
                    .force("collide", d3.forceCollide(14));
                    // .force("collide", d3.forceCollide().radius(d => d.r + 1));
                    // .restart();
                    // .force("x", d3.forceX())
                    // .force("y", d3.forceY());

    simulation.nodes(nodes)
              .on("tick", updateNetwork);

    simulation.force("link")
              .links(edges);
    
    // var svg = d3.select("svg");
    var svg = d3.select("#cpc_classes_network_graph")
                .append("svg")
                .attr("width", width)
                .attr("height", height)


    // svg.selectAll('g').remove();

    svg.append("g")
        .selectAll("line")
        .data(edges)
        .enter()
        .append("line")
        .style("stroke-width", "1px")
        .style("stroke", "#fc9272");
        
    
    var nodeEnter = svg.selectAll("g.node")
                        .data(nodes)
                        .enter()
                        .append("g")
                        .attr("class", "node")
                        .on("click", nodeClick)
                        .on("dblclick", nodeDoubleClick)
                        .on("mouseover", nodeOver)
                        .on("mousemove", nodeMove)
                        .on("mouseout", nodeOut)
                        .call(d3.drag()
                                .on("start", dragstarted)
                                .on("drag", dragged)
                                .on("end", dragended));

    nodeEnter.append("circle")
            // .attr("cx", 10)
            // .attr("cy", 40)
            .attr("r", 14)
            .style("fill", "#fee0d2")
            .style("stroke", "#de2d26")
            .style("stroke-width", "1px")
    
    // nodeEnter.append("text")
    //         .style("text-anchor", "middle")
    //         .attr("y", 2)
    //         .style("stroke-width", "1px")
    //         .style("stroke-opacity", 0.75)
    //         .style("stroke", "white")
    //         .style("font-size", "8px")
    //         .text(function (d) {return d.id})
    //         .style("pointer-events", "none")

    nodeEnter.append("text")
            .style("text-anchor", "middle")
            .attr("y", 2)
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .text(function (d) {return d.id})
            .style("pointer-events", "none")

    var tooltip_network = d3.select("#cpc_classes_network_graph")
    .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip_bubble")
        .style("background-color", "black")
        .style("border-radius", "5px")
        .style("padding", "5px")
        .style("color", "white")
        
    // simulation.restart();

    function nodeMove(d){
        tooltip_network
            .style("left", (d3.mouse(this)[0]+30) + "px")
            .style("top", (d3.mouse(this)[1]+30) + "px")
    }

    function nodeClick(d) {
        generate_onlick_heatMap(d);
        // d.fixed = true;
    }

    function nodeDoubleClick(d) {
        
        // d.fixed = false;
    }

    function nodeOver(d) {
        
        // simulation.stop();
        tooltip_network
            .transition()
            .duration(200)
            tooltip_network
            .style("opacity", 1)
            .style("position", 'absolute')
            .html("CPC Class: " + d.label + "<br>" + "Name: " + cpc_class_name[d.label])
            .style("left", (d3.mouse(this)[0]+30) + "px")
            .style("top", (d3.mouse(this)[1]+30) + "px")
            highlightEgoNetwork(d);
    }

    function nodeOut() {
        simulation.restart();
        tooltip_network
            // .transition()
            // .duration(200)
            .style("opacity", 0)
        d3.selectAll("g.node > circle")
        .style("fill", "#fee0d2")
        .style("stroke", "#de2d26")
        .style("stroke-width", "1px");

        d3.selectAll("line")
        .style("stroke", "#fc9272")
        .style("stroke-width", "1px");
    }

    function highlightEgoNetwork(d) {
        var egoIDs = [];
        var filteredEdges = edges.filter(function (p) {return p.source == d || p.target == d});

        filteredEdges
        .forEach(function (p) {
        if (p.source == d) {
            egoIDs.push(p.target.id)
        }
        else {
            egoIDs.push(p.source.id)
        }
        });

        d3.selectAll("line").filter(function (p) {return filteredEdges.indexOf(p) > -1})
        .style("stroke", "#9ebcda")
        .style("stroke-width", "3px");

        d3.selectAll("circle").filter(function (p) {return egoIDs.indexOf(p.id) > -1})
        .style("fill", "#e0ecf4")
        .style("stroke", "#8856a7")
        .style("stroke-width", "2px");
    }


    // var new 
    function dragstarted(d) {
        // d3.select(this).raise().classed("active", true);
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.x = d3.event.x, d.y = d3.event.y;
    }
    
    function dragged(d) {
        d.x = d3.event.x;
        d.y = d3.event.y;
    }
    
    function dragended(d) {
        // if (!d3.event.active) simulation.alphaTarget(0);
        // d.x = null, d.y = null;
    }

    function updateNetwork() {
        svg.selectAll("line")
        .attr("x1", function (d) {return d.source.x})
        .attr("y1", function (d) {return d.source.y})
        .attr("x2", function (d) {return d.target.x})
        .attr("y2", function (d) {return d.target.y});

        svg.selectAll("g.node")
        .attr("transform", function (d) {return "translate(" + d.x + "," + d.y + ")"});

        svg.selectAll("g.node")
        .attr("r", function (d) {return d.weight})
        // .style("fill", "#CC9999")
        //     .style("stroke", "red")
        //     .style("stroke-width", "1px");

    }

}
}


cpc_classes_network()