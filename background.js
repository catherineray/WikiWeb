chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
    var url = tabs[0].url
});


graph = []
function checkTabStatus(tabId, changeInfo, tab) 
{
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

chrome.tabs.onUpdated.addListener(checkTabStatus)


