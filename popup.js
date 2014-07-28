function start (){
    chrome.extension.sendRequest({greeting: "start", name: document.getElementById("topos").value}, function(response) {
    console.log(response);
    });
}

function stop (){
    chrome.extension.sendRequest({greeting: "stop"}, function(response) {
    console.log(response);
    });
}

document.addEventListener('DOMContentLoaded', function() {

    var e = document.getElementById("start")
    e.addEventListener("click", start, false)

    var s = document.getElementById("stop")
    s.addEventListener("click", stop, false)


});
