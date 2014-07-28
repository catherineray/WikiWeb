function process () {
	var xmlhttp = new XMLHttpRequest(); 
	xmlhttp.open("GET","https://wikiweb.firebaseio.com/.json",false);
	xmlhttp.send();
	var data = JSON.parse(xmlhttp.responseText)
	// console.log(data)

	graph = {name: "wikipedia", children:[]}

	for (var key in data) {
		var value = data[key]
		var output = {}
		output.name  = value.name
		output.children = []
		for(var i in value.data) {
			output.children.push({name:value.data[i].title, size:value.data[i].timestamp})
		}

		graph.children.push(output)
	}

	return graph;
}