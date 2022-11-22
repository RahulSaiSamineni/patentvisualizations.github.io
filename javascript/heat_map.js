function generate_onlick_heatMap(nodeclicked_d){
    // set the dimensions and margins of the graph
    var margin_heatmap = {top: 80, right: 25, bottom: 30, left: 40},
    width_heatmap = 450 - margin_heatmap.left - margin_heatmap.right,
    height_heatmap = 450 - margin_heatmap.top - margin_heatmap.bottom;

    d3.select('#dataviz_heatmap').select('svg').remove();

    // append the svg object to the body of the page
    var svg_heatMap = d3.select("#dataviz_heatmap")
            .append("svg")
            .attr("class",'heat_map')
            .attr("width", width_heatmap + margin_heatmap.left)
            .attr("height", height_heatmap + margin_heatmap.top + margin_heatmap.bottom)
            .append("g")
            .attr("transform",
                        "translate(" + margin_heatmap.left + "," + margin_heatmap.top + ")");

    //Read the data
    d3.csv("data/cpc_class_counts_yearwise.csv", function(data) {

    cpc_class_selected = nodeclicked_d.label;
    data_selected = [];

    for(let i = 0; i < data.length; i++) {
        temp_dict = {}
        if(data[i].node1 === cpc_class_selected) {
            temp_dict['paried_node'] = data[i].node2;
            temp_dict['year'] = data[i].year;
            temp_dict['patent_counts'] = data[i].patent_counts;
            data_selected.push(temp_dict);
        }
        if(data[i].node2 === cpc_class_selected) {
            temp_dict['paried_node'] = data[i].node1;
            temp_dict['year'] = data[i].year;
            temp_dict['patent_counts'] = data[i].patent_counts;
            data_selected.push(temp_dict);
        }
    }

    var myGroups = d3.map(data_selected, function(d){return d.year;}).keys()
    myGroups.sort()
    var myVars = d3.map(data_selected, function(d){return d.paried_node;}).keys()
    // myVars.sort()

    // Build X scales and axis:
    var xScale_Heatmap = d3.scaleBand()
        .range([ 0, width_heatmap ])
        .domain(myGroups)
        .padding(0.05);
    
        svg_heatMap.append("g")
        .style("font-size", 12)
        .style("font-weight", 'bold')
        .attr("transform", "translate(0," + height_heatmap + ")")
        .call(d3.axisBottom(xScale_Heatmap).tickSize(0))
        .select(".domain").remove()
    
    // Build Y scales and axis:
    var yScale_Heatmap = d3.scaleBand()
        .range([ height_heatmap, 0 ])
        .domain(myVars)
        .padding(0.05);

    svg_heatMap.append("g")
        .style("font-size", 9)
        .style("font-weight", 'bold')
        .call(d3.axisLeft(yScale_Heatmap).tickSize(0))
        .select(".domain").remove()

    
    function split(array, n) {
        let [...arr]  = array;
        var res = [];
        while (arr.length) {
        res.push(arr.splice(0, n));
        }
        return res;
    }

    // Build color scale
    color_range_values = data_selected.map(function(d){return parseInt(d.patent_counts);});
    split_color_range_values = split(color_range_values, color_range_values.length / 9);
    console.log("split_color_range_values:", split_color_range_values)
    // var myColor = d3.scaleLinear()
    //     .domain([0, d3.max(color_range)])
    //     .range(['white', 'red'])
    var myColor = null;
    if(split_color_range_values.lenght > 9){
        myColor = d3.scaleOrdinal()
                .domain([
                    Math.max.apply(Math, split_color_range_values[9]),
                    Math.max.apply(Math, split_color_range_values[7]),
                    Math.max.apply(Math, split_color_range_values[6]),
                    Math.max.apply(Math, split_color_range_values[5]),
                    Math.max.apply(Math, split_color_range_values[4]),
                    Math.max.apply(Math, split_color_range_values[3]),
                    Math.max.apply(Math, split_color_range_values[2]),
                    Math.max.apply(Math, split_color_range_values[1]),
                    Math.max.apply(Math, split_color_range_values[0]),
                ])
                .range(['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15', '#67000d']);
    } else {
        myColor = d3.scaleOrdinal()
                .domain([
                    Math.max.apply(Math, split_color_range_values[8]),
                    Math.max.apply(Math, split_color_range_values[7]),
                    Math.max.apply(Math, split_color_range_values[6]),
                    Math.max.apply(Math, split_color_range_values[5]),
                    Math.max.apply(Math, split_color_range_values[4]),
                    Math.max.apply(Math, split_color_range_values[3]),
                    Math.max.apply(Math, split_color_range_values[2]),
                    Math.max.apply(Math, split_color_range_values[1]),
                    Math.max.apply(Math, split_color_range_values[0]),
                ])
                .range(['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15', '#67000d']);
    }

    var tooltip = d3.select("#dataviz_heatmap")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip_heatmap")
        .style("background-color", "black")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")

    // Three function that change the tooltip when user hover / move / leave a cell
    var mouseover = function(d) {
        tooltip
            .style("opacity", 1)
        d3.select(this)
            .style("stroke", "black")
            .style("stroke-width", 2)
            .style("opacity", 1)
    }
    var mousemove = function(d) {
        tooltip
        .html(cpc_class_selected + " <--> " + d.paried_node + " : " + d.patent_counts)
        .style('color', 'white')
        .style('position', 'absolute')
        .style("left", (d3.mouse(this)[0]+70) + "px")
        .style("top", (d3.mouse(this)[1]) + "px")
    }
    var mouseleave = function(d) {
        tooltip
        .style("opacity", 0)
        d3.select(this)
        .style("stroke", "none")
        .style("opacity", 0.8)
    }

    
    })
}
