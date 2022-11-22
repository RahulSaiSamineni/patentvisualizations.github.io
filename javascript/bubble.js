function bubbleChart(class_name, data) {
    const width = 350; //250
    const height = 400; //250
  
    // location to centre the bubbles
    const centre = { x: width/4, y: height/4 };
  
    // strength to apply to the position forces
    const forceStrength = 0.03;
  
    // these will be set in createNodes and chart functions
    let svg_bubble = null;
    let bubbles = null;
    let labels = null;
    let nodes_org = [];
  
    // charge is dependent on size of the bubble, so bigger towards the middle
    function charge(d) {
      return Math.pow(d.radius, 2.0) * 0.01
    }
  
    nodes_org = createNodes(data);

    // create a force simulation and add forces to it
    const simulation = d3.forceSimulation(nodes_org)
      .force('charge', d3.forceManyBody().strength(charge))
      // .force('center', d3.forceCenter(centre.x, centre.y))
      .force('x', d3.forceX().strength(forceStrength).x(centre.x))
      .force('y', d3.forceY().strength(forceStrength).y(centre.y))
      .force('collision', d3.forceCollide().radius(d => d.radius + 1))
      .on("tick",ticked);
  
    // force simulation starts up automatically, which we don't want as there aren't any nodes yet
    simulation.stop();
    
  function call_reset_bubbles(){
  d3.select('#assignee_bargrouped').select("svg").remove();
  var e = document.getElementById("years");
  var value = e.value;
  let file_name = 'data/companies_bubble/companies_' + value + '.csv';
  d3.csv(file_name, function(error, data){
    display(data);
  });
}
  
    // set up colour scale
    const fillColour = d3.scaleOrdinal()
        .domain(["40","100", "175", "245", "315", "450","580","645","800","945","1100"])
        .range(["#ffffcc","#fff0a9","#fee087","#fec965","#feab4b","#fd893c","#fa5c2e","#ec3023","#d31121","#af0225","#800026"]);
  
    // data manipulation function takes raw data from csv and converts it into an array of node objects
    // each node will store data and visualisation values to draw a bubble
    // rawData is expected to be an array of data objects, read in d3.csv
    // function returns the new node array, with a node for each element in the rawData input
    function createNodes(rawData) {
      // use max size in the data as the max in the scale's domain
      // note we have to ensure that size is a number
      const maxSize = d3.max(rawData, d => +(d.patent_counts*1.5));
  
      // size bubbles based on area
      const radiusScale = d3.scaleSqrt()
        .domain([0, maxSize])
        .range([0, 60])
  
        
  
  
      // use map() to convert raw data into node data
      const myNodes = rawData.map(d => ({
        ...d,
        radius: radiusScale(+(d.patent_counts/2)),
        size: +d.patent_counts,
        x: Math.random() * 900,
        y: Math.random() * 800
      }))
  
      return myNodes;
    }
  
    d3.select(class_name).select("svg").remove();
    
  
    // create svg element inside provided selector
    svg_bubble = d3.select(class_name)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
    
    // -1- Create a tooltip div that is hidden by default:
      var tooltip = d3.select(class_name)
      .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip_bubble")
        .style("background-color", "black")
        .style("border-radius", "5px")
        .style("padding", "5px")
        .style("color", "white")
  
    // -2- Create 3 functions to show / update (when mouse move but stay on same circle) / hide the tooltip
    var showTooltip = function(d) {
      tooltip
        .transition()
        .duration(200)
      tooltip
        .style("opacity", 1)
        .style("position", 'absolute')
        .html("Organization: " + d.organization)
        .style("left", (d3.mouse(this)[0]+30) + "px")
        .style("top", (d3.mouse(this)[1]+30) + "px")
    }
    var moveTooltip = function(d) {
      tooltip
        .style("left", (d3.mouse(this)[0]+30) + "px")
        .style("top", (d3.mouse(this)[1]+30) + "px")
    }
    var hideTooltip = function(d) {
      tooltip
        // .transition()
        // .duration(200)
        .style("opacity", 0)
    }
    // bind nodes data to circle elements
    const elements = svg_bubble.selectAll('.bubble_org')
      .data(nodes_org, d => d.organization)
      .enter()
      .append('g')
  
    bubbles = elements
      .append('circle')
    //   .append('class', 'circle_org')
      .classed('bubble_org', true)
      .attr('r', d => d.radius)
      .attr('fill', d => fillColour(d.organization))
      .style('stroke-width', '1px')
      .style('stroke', 'black')
      .on("click", onclick_grouped_bar)
      .on("mouseover", showTooltip )
      .on("mousemove", moveTooltip )
      .on("mouseleave", hideTooltip )
      .call(d3.drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended));
    

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
        if (!d3.event.active) simulation.alphaTarget(0);
        // d.x = null, d.y = null;
    }
      
    // labels
    // labels = elements
    //   .append('text')
    //   .attr('dy', '.3em')
    //   .style('text-anchor', 'middle')
    //   .style('font-size', 5)
    //   .style("position", 'absolute')
    //   .text(d => d.organization)
  
    // set simulation's nodes to our newly created nodes array
    // simulation starts running automatically once nodes are set
    simulation.nodes(nodes_org)
      .on('tick', ticked)
      .restart();
    // }
    
    // callback function called after every tick of the force simulation
    // here we do the actual repositioning of the circles based on current x and y value of their bound node data
    // x and y values are modified by the force simulation
    function ticked() {
      bubbles
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
  
      // labels
      //   .attr('x', d => d.x)
      //   .attr('y', d => d.y)
    }
    
  
    // // return chart function from closure
    // return chart;
  }
  
  // new bubble chart instance
  // let myBubbleChart = bubbleChart();
  
  // function called once promise is resolved and data is loaded from csv
  // calls bubble chart function to display inside #vis div
function display(data) {
  bubbleChart('.bubble_org', data);
}

function update() {
  var select = document.getElementById('years');
  var option = select.options[select.selectedIndex];
  let x = option.value;
  let file_name = 'data/companies_bubble/companies_' + x + '.csv';
  d3.csv(file_name, function(error, data){
    display(data);
  });
}

d3.csv('/data/companies_bubble/companies_2018-2022.csv', function(error, data){
  display(data);
});

function onclick_grouped_bar(d){
  if(d3.selectAll(".selected_multi_groupedbar").data().length > 4) {
    alert("Only 5 Companies can be compared at once. Please use reset button for another selection.")
  } else {
    d3.select(this).classed("selected_multi_groupedbar", !d3.select(this).classed("selected_multi_groupedbar"));
    d3.selectAll(".bubble_org").style("stroke", "white");
    d3.selectAll(".selected_multi_groupedbar")
                .style('stroke', 'gray')
                .style('stroke-width', "3px");
    selected_data_keys = d3.selectAll(".selected_multi_groupedbar").data();
    keys_list = selected_data_keys.map(function(d){return d.organization;});
    // console.log("keys", keys_list)
    grouped_bar_method(keys_list);
  }
}
