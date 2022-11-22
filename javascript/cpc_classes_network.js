
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

    }
}
