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


    
    })
}

