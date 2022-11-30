// set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 460 - margin.left - margin.right,
    height = 320 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#line_chart")
  .append("svg")
    .attr("class", "line_chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

//Read the data

d3.csv("data/trend.csv", function(data) {

    // List of groups (here I have one group per column)
    var allGroup = ['design', 'plant', 'reissue', 'statutory invention registration', 'utility']
    // d3.map(data, function(d){return(d.name)}).keys()

    var allState = d3.map(data, function(d){return(d.state)}).keys()

    // add the options to the button
    d3.select("#selectButton")
      .selectAll('myOptions')
      .data(allGroup)
      .enter()
      .append('option')
      .text(function (d) { return d; }) // text showed in the menu
      .attr("value", function (d) { return d; }) // corresponding value returned by the button


    d3.select("#states")
      .selectAll('stateOptions')
      .data(allState)
      .enter()
      .append('option')
      .text(function (d) { return d; }) // text showed in the menu
      .attr("value", function (d) { return d; })

    // document.getElementById("states").value = allState[0]

    // document.getElementById("selectButton").value = allGroup[0]

    // A color scale: one color for each group
    var myColor = d3.scaleOrdinal()
      .domain(allGroup)
      .range(d3.schemeCategory10);

    // Add X axis --> it is a date format


    var x = d3.scaleTime()
              .range([ 0, width ]);
    
    var xAxis =  d3.axisBottom().scale(x).tickSizeOuter(0).tickFormat(d3.format("d"));

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class","myXaxis")

    // Add Y axis
    var y = d3.scaleLinear()
      .range([ height, 0 ]);
    var yAxis = d3.axisLeft().scale(y).tickSizeOuter(0);
    
    svg.append("g")
        .attr("class","myYaxis")

    // Initialize line with first group of the list
    

    // A function that update the chart
    function update(selectedGroup, selectedStateOption) {

      // Create new data with the selection?
      var dataFilter = data.filter(function(d){return d.name==selectedGroup})

      var dataArray = {}
      var dataResultset = []
      for(let i = 0; i < data.length; i++) {
        if(data[i].name === selectedGroup && data[i].state === selectedStateOption){
          const year_in = parseInt(data[i].year)
          if(!(year_in in dataArray)){
            dataArray[year_in] = {'count': 0};
          }
          dataArray[year_in]['count'] += parseInt(data[i].n);
        }
      }

      for(let year in dataArray) {
        const tempObj = {
          'year': parseInt(year),
          'count': dataArray[year]['count']
        };
    
        dataResultset.push(tempObj);
      }

      console.log("dataResultset", dataResultset)
      if(dataResultset.length <= 1) {
        alert("No data for " + selectedStateOption + " in " + selectedGroup);
      }

      x.domain(d3.extent(dataResultset, function(d) { return d.year; }));

      svg.selectAll(".myXaxis").transition()
          .duration(300)
          .call(xAxis);

      y.domain([0, d3.max(dataResultset, function(d) { return d.count; })])
      
      svg.selectAll(".myYaxis")
          .transition()
          .duration(300)
          .call(yAxis);

      d3.selectAll(".line_path").remove();

      var line = svg
                  .append('g')
                  .attr("class","line_path")
                  .append("path")
                    .datum(dataResultset)
                    .attr("d", d3.line()
                      .x(function(d) { return x(d.year) })
                      .y(function(d) { return y(d.count) })
                    )
                    .attr("stroke", function(d){ return myColor(selectedGroup) })
                    .style("stroke-width", 4)
                    .style("fill", "none");
    }

    // When the button is changed, run the updateChart function
    d3.select("#selectButton").on("change", function(d) {
        // recover the option that has been chosen
        var selectedOption = d3.select(this).property("value")
        var selectedStateOption = document.getElementById("states").value
        if(selectedOption !== 'Select' && selectedStateOption !== 'Select'){
          update(selectedOption, selectedStateOption)
        }
    })


    d3.select("#states").on("change", function(d) {
      // recover the option that has been chosen
      var selectedStateOption = d3.select(this).property("value")
      var selectedOption = null;
      if(document.getElementById('cpc_classes').checked){
        selectedOption = document.getElementById("dropdown").value
      } else {
        selectedOption = document.getElementById("selectButton").value
      }
      if(selectedOption !== 'Select' && selectedStateOption !== 'Select'){
        update(selectedOption, selectedStateOption)
      }
      
    })

   d3.select("#dropdown").on("change", function(d) {
    // recover the option that has been chosen
    var selectedOption = d3.select(this).property("value")
    var selectedStateOption = document.getElementById("states").value
    if(selectedOption !== 'Select' && selectedStateOption !== 'Select'){
      update(selectedOption, selectedStateOption)
    }
  })
   

})
