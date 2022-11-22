
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

function call_reset_bubbles(){
  d3.select('#assignee_bargrouped').select("svg").remove();
  var e = document.getElementById("years");
  var value = e.value;
  let file_name = 'data/companies_bubble/companies_' + value + '.csv';
  d3.csv(file_name, function(error, data){
    display(data);
  });
}

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

function grouped_bar_method(keys){

    // var keys = ;
    // console.log("logoing", d3.select('#assignee_bargrouped'))
    d3.select('#assignee_bargrouped').select("svg").remove();

    var divTooltip_grouped_bar = d3.select("div.tooltip_grouped_bar")

    // selecting a svg and appending a group tag to it also setting up 
    // margins, width and height for inner drawing space
    
        // svg_bar = d3.select("svg.group_bar"),

    var svg_bar =  d3.select("#assignee_bargrouped")
        .append("svg")
        .attr("class",'group_bar')
        .attr("width", 570)
        .attr("height", 400);

    var margin_grouped_bar = {
      top: 20,
      right: 20,
      bottom: 30,
      left: 40
    },
    width_grouped_bar = +svg_bar.attr("width") - margin_grouped_bar.left - margin_grouped_bar.right,
    height_grouped_bar = +svg_bar.attr("height") - margin_grouped_bar.top - margin_grouped_bar.bottom;


    var g_grouped_bar = svg_bar.append("g").attr("transform", "translate(" + margin_grouped_bar.left + "," + margin_grouped_bar.top + ")");

    // because the plot is grouped by months and then by weekdays it has two scales for the x axis
    // creating x0 scale which is grouped by months
    var x0 = d3.scaleBand()
        .rangeRound([0, width_grouped_bar])
        .paddingInner(0.1);

    // creating x1 scale which is grouped by days of week
    var x1 = d3.scaleBand()
        .padding(0.08);

    // creating a linear scale for y axis
    var y_grouped_bar = d3.scaleLinear()
        .rangeRound([height_grouped_bar, 0]);

    // creating an ordinal scale for color that is going to represent different days of week
    var z = d3.scaleOrdinal()
    .range(['#d53e4f', '#f46d43', '#abdda4', '#66c2a5', '#3288bd']);

    // reading csv data
    d3.csv("/data/companies_withyear_2018-2022.csv", function(d, i, columns) {
        for (var i = 1, n = columns.length; i < n; ++i)
            d[columns[i]] = +d[columns[i]];
        
        return d;
    }, function(error, data) {
        if (error) throw error;
        // creating var keys containing array of names of days
        // var keys = data.columns.slice(1)
        // console.log("keys", keys)
        // setting up domain for x0 as a list of all the names of months
        x0.domain(data.map(function(d) {
            //console.log(d.Month);
            return d.year;
        }));
        // setting up domain for x1 as a list of all the names of days

        x1.domain(keys).rangeRound([0, x0.bandwidth()]);
        // setting up domain for y which will be from 0 to max day of week for any month
        y_grouped_bar.domain([0, d3.max(data, function(d) {
            return d3.max(keys, function(key) {
                return d[key];
            });
        })]).nice()
        // binding data to svg group elements
        g_grouped_bar.append("g")
            .selectAll("g")
            .data(data)
            .enter()
            .append("g")
            .attr("transform", function(d) {
                //console.log(x0(d.Month));
                return "translate(" + x0(d.year) + ",0)";
            })
            .attr("class", "days")
            // binding days of week data to rectangles
            .selectAll("rect")
            .data(function(d) {
                return keys.map(function(key) {
                    //console.log({ key: key, value: d[key] });
                    return {
                        key: key,
                        value: d[key]
                    };
                });
            })
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", function(d) {
                //console.log(x1(d.key));
                return x1(d.key);
            })
            .attr("width", x1.bandwidth())
            .attr("fill", function(d) {
                //console.log(z(d.key));
                return z(d.key);
            })
            // setting up y coordinates and height position to 0 for transition
            .attr("y", function(d) {
                return y_grouped_bar(0);
            })
            .attr("height", function(d) {
                return height_grouped_bar - y_grouped_bar(0);
            })
            // setting up tooltip and interactivity
            .on("mouseover", function(d) {
                divTooltip_grouped_bar.style("left", d3.event.pageX + 10 + "px")
                divTooltip_grouped_bar.style("top", d3.event.pageY - 25 + "px")
                divTooltip_grouped_bar.style("display", "inline-block")
                divTooltip_grouped_bar.style("opacity", "0.9");
                var x = d3.event.pageX,
                    y = d3.event.pageY;
                var elements = document.querySelectorAll(":hover");
                var l = elements.length - 1;
                var elementData = elements[l].__data__;
                //console.log(elementData)
                divTooltip_grouped_bar.html(elementData.key + "<br>" +"Patent Count: " +elementData.value);
                d3.select(this)
                    .attr("fill", "#F8786B")
                    //.style("opacity", "0.7")
                    .style("stroke", "Black")
                    .style("stroke-width", "1.8px")
                    .style("stroke-opacity", "1");

            })
            .on("mouseout", function(d) {
                divTooltip_grouped_bar.style("display", "none")
                d3.select(this).transition().duration(250)
                    .attr("fill", z(d.key))
                    //.style("opacity", "1")
                    .style("stroke-opacity", "0");
            })
            // setting up transition, delay and duration
            .transition()
            .delay(function(d) {
                return Math.random() * 250;
            })
            .duration(1000)
            // setting up normal values for y and height
            .attr("y", function(d) {
                return y_grouped_bar(d.value);
            })
            .attr("height", function(d) {
                return height_grouped_bar - y_grouped_bar(d.value);
            });

        // setting up x axis    
        g_grouped_bar.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height_grouped_bar + ")")
            // setting up x axis opacity to 0 before transition
            .style("opacity", "0")
            .call(d3.axisBottom(x0))
            .append("text")
            .attr("x", 200)
            .attr("y", 12)
            .attr("dy", "0.90em")
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(360)")
            .style("font-weight","700")
            .text("Years");


        // setting up transiton for x axis
        g_grouped_bar.select(".x")
            .transition()
            .duration(500)
            .delay(800)
            // setting up full opacity after transition 
            .style("opacity", "1")
            
            
            

        // setting up y axis    
        g_grouped_bar.append("g")
            .attr("class", "y axis")
            // setting up y axis opacity to 0 before transition
            .style("opacity", "0")
            .call(d3.axisLeft(y_grouped_bar).ticks(null, "s"))
            .append("text")
            .attr("x", 2)
            .attr("y", -40)
            .attr("dy", "0.90em")
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .style("font-weight","700")
            .text("Patent Counts");
        // setting up y axis transition    
        g_grouped_bar.select(".y")
            .transition()
            .duration(300)
            .delay(600)
            // setting up full opacity after transition
            .style("opacity", "1")

        // setting a legend and binding legend data to group    
        var legend_grouped_bar = g_grouped_bar.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(keys.slice())
            .enter()
            .append("g")
            .attr("transform", function(d, i) {
                return "translate(0," + i * 13 + ")";
            })
            // setting up opacity to 0 before transition
            .style("opacity", "0");

        // setting up rectangles for the legend    
        legend_grouped_bar.append("rect")
            .attr("x", width_grouped_bar - 19)
            .attr("y", -22)
            .attr("width", 12)
            .attr("height", 12)
            .attr("fill", z);
        // setting up legend text    
        legend_grouped_bar.append("text")
            .attr("x", width_grouped_bar - 24)
            .attr("y", -15)
            .attr("dy", "0.32em")
            .text(function(d) {
                // console.log(d);
                return d;
            });
        // setting transition delay and duration for all individual elements for the legend    
        legend_grouped_bar.transition()
            .duration(300)
            .delay(function(d, i) {
                return 600 + 100 * i;
            })
            // setting up opacity back to full
            .style("opacity", "1");

    });
}

