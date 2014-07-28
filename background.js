chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
    var url = tabs[0].url
});


graph = []
function checkTabStatus(tabId, changeInfo, tab) 
{
	console.log("make sure the train is fine")
	if (changeInfo.url!=undefined) 
	{
		chrome.tabs.query
		({currentWindow: true, active: true}, function(tabs)
		{
    		var title = tabs[0].title
    		var url = changeInfo.url
    		graph.push
    		({
				"title" : title, 
				"url" : url, 
				"timestamp" : Date.now()
			})
    	})

		console.log(graph)
	}
}


function storeStuff(graph) {
	var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance 
	xmlhttp.open("POST", "https://wikiweb.firebaseio.com/.json");
	xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	xmlhttp.setRequestHeader("Access-Control-Allow-Origin", "*");
	xmlhttp.send(JSON.stringify({data : graph, timestamp : Date.now(), name : graphName}));
}

chrome.extension.onRequest.addListener(
	function(request, sender, sendResponse) {
		//init that shit
		if (request.greeting == "start") {
			console.log(request)
			graphName = request.name
			chrome.tabs.onUpdated.addListener(checkTabStatus)
			sendResponse({farewell: "tschuss"});
		}
		if (request.greeting == "stop") {
			chrome.tabs.onUpdated.removeListener(checkTabStatus)
			storeStuff(graph)
		}
	});