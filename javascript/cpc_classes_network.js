
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
}
    
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
  
}