function generateMapStates() {
    var width = 550;
    var height = 520;
    var class1 = '#ef8a62' //H01
    var class2 = '#e5f5e0' //A61
    var class3 = '#a1d99b' //H04
    var class4 = '#31a354' //G06
var projection = d3.geoAlbersUsa()
    .translate([width / 2, height / 2]) 
    .scale([700]); 
var toggle = 0
    toggle = 0
    var path = d3.geoPath()
        .projection(projection); 
    // Patents data that is being to plot on the graph
    states_data = "data/map1_data.csv"
    d3.selectAll("svg.map").remove()
    
    var svg = d3.select("#map")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height)

    var viewByClasses = document.getElementById('map_cpc_classes');
    var valueAge = viewByClasses.options[viewByClasses.selectedIndex].value;
    d3.csv(states_data, function(data) {
        var dataArray = [];
        var maxVal = 0
        for (var d = 0; d < data.length; d++) {
            if ((valueAge == -1 || (valueAge == 1 && data[d].cpc_class == 'A61') || valueAge == data[d].cpc_class)) {
                dataArray.push(data[d])
            }
        }
        // State total count
        var groupedData = dataArray.reduce((acc, it) => {
            acc[it.state] = acc[it.state] + +it.patent_counts || +it.patent_counts;
            return acc;
        }, {});
        
        // Grouped the data by class - H01
        var groupedDataClass1 = dataArray
            .filter(x => x.cpc_class == 'H01')
            .reduce((acc, it) => {
                acc[it.state] = acc[it.state] + +it.patent_counts || +it.patent_counts;
                return acc;
            }, {});

        // Grouped the data by class - A61
        var groupedDataClass2 = dataArray
            .filter(x => x.cpc_class == 'A61')
            .reduce((acc, it) => {
                acc[it.state] = acc[it.state] + +it.patent_counts || +it.patent_counts;
                return acc;
            }, {});
        
        // Grouped the data by class - H04
            var groupedDataClass3 = dataArray
            .filter(x => x.cpc_class == 'H04')
            .reduce((acc, it) => {
                acc[it.state] = acc[it.state] + +it.patent_counts || +it.patent_counts;
                return acc;
            }, {});
        
        // Grouped the data by class - G06
        var groupedDataClass4 = dataArray
        .filter(x => x.cpc_class == 'G06')
        .reduce((acc, it) => {
            acc[it.state] = acc[it.state] + +it.patent_counts || +it.patent_counts;
            return acc;
        }, {});

        var minVal = 0
        d3.json("data/us-states.json", function(json) {
            Object.keys(groupedData).forEach(function(key) {
                var dataState = key;
                var dataValue = groupedData[key];
                maxVal = Math.max(maxVal, dataValue);
                for (var j = 0; j < json.features.length; j++) {
                    var jsonState = json.features[j].properties.name;
                    if (dataState == jsonState) {
                        json.features[j].properties.value = dataValue;
                        break;
                    }
                }
            })
            d3.functor = function functor(v) {
                return typeof v === "function" ? v : function() {
                    return v;
                };
            };
            var tip = d3.tip()
                .attr("class", "d3-tip")
                .offset([-40, 0])
                .html(function(d) {
                    var x = +d.properties.value;
                    return
                    +"<div id='tipDiv'></div><br>"
                });
            svg.call(tip);
            var ramp = d3.scaleSequential(d3.interpolateOrRd).domain([minVal, maxVal/4])

            var div = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0)
            svg.selectAll("path")



            .data(json.features)
                .enter()
                .append("path")
                .attr("d", path)
                .attr("transform", "translate(0,-100)")
                .style("stroke", "black")
                .style("stroke-width", "1")
                .style("fill", function(d) {
                    return ramp(d.properties.value === undefined ? 0 : d.properties.value)
                })
            .on("mouseover", function(d) {
                d3.selectAll("#tipDiv").remove()
                val = d.properties.value
                if (!val) {
                    val = 0
                }
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div.html("Total no of patents in " + d.properties.name + " are: " + val
                )
                .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
                tip.show(d);
                var state = d.properties.name;
                var dataset = [
                    groupedDataClass1[state] || 0,
                    groupedDataClass2[state] || 0,
                    groupedDataClass3[state] || 0,
                    groupedDataClass4[state] || 0
                ];
                var barHeight = 25;
                var tipSVG =
                    div
                    .append("svg")
                    .attr("width", 150)
                    .attr("height", barHeight * 5);
                var x = d3.scaleLinear()
                    .domain([0, d3.max(dataset)])
                    .range([0, 150]);
                var bar = tipSVG.selectAll("g")
                    .data(dataset)
                    .enter().append("g")
                    .attr("transform", function(d, i) {
                        return "translate(0," + i * barHeight + ")";
                    });
                bar.append("rect")
                    .attr("width", 50)
                    .transition()
                    .duration(1000)
                    .attr("width", x)
                    .attr("height", barHeight - 1)
                    .attr("fill", function(d, i) {
                        switch (i) {
                            case 0:
                                return class1
                            case 1:
                                return class2
                            case 2:
                                return class3
                            case 3:
                                return class4
                        }
                    });
                bar.append("text")
                    .attr("x", 2)
                    .attr("y", barHeight / 2)
                    .attr("dy", ".35em")
                    .attr("fill", function(d) {
                        if (d === d3.max(dataset)) {
                            return "black";
                        } else {
                            return "black";
                        }
                    })
                    .style("font-size", "12px")
                    .text(function(d, i) {
                        switch (i) {
                            case 0:
                                return "H01: " + d
                            case 1:
                                return "A61: " + d
                            case 2:
                                return "H04: " + d
                            case 3:
                                return "G06: " + d
                        }
                    });
            })
            .on("mouseout", function(d) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
            axisScale = d3.scaleLinear()
                .domain(ramp.domain())
                .range([margin.left, width - margin.right])
            
            axisBottom = g => g
                .attr("class", `x-axis`)
                .attr("transform", `translate(-10,340)`)
                .call(d3.axisBottom(axisScale)
                    .ticks(width / 80)
                    .tickSize(10)
                    .tickSizeOuter(0))
            
            const linearGradient = svg.append("linearGradient")
                .attr("id", "linear-gradient");    

            linearGradient.selectAll("stop")
                .data(ramp.ticks().map((t, i, n) => ({ offset: `${100*i/n.length}%`, color: ramp(t) })))
                .enter().append("stop")
                .attr("offset", d => d.offset)
                .attr("stop-color", d => d.color);

            svg.append('g')
                .attr("transform", `translate(-10,330)`)
                .append("rect")
                .attr('transform', `translate(${margin.left}, 0)`)
                .attr("width", width - margin.right - margin.left)
                .attr("height", 10)
                .style("fill", "url(#linear-gradient)");
            
            svg.append('g')
                .call(axisBottom);
        });
    });



    
}


// Calling the map generate fucntion to display the map
generateMapStates()


