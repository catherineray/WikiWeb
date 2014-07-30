'use strict';

// Wikipedia UI Modification

/*
var list = document.querySelector('#p-namespaces ul');

if (list) {
  var el = document.createElement('li');

  el.innerHTML = '<li><span><a>Remove from Session</a></span></li>';

  list.appendChild(el);
}
*/

var title = /([A-Z]).+/.exec(window.location.pathname)[0];
var name = document.querySelector('#firstHeading').innerText;

var page = {
  id: title,
  name: name
};

chrome.runtime.sendMessage({page: page});

// more efficient link tracking
// single event listener
document.body.onclick = function(e){
  e = e || event;
  var from = findParent('a',e.target || e.srcElement);
  
  if (from && from.pathname !== window.location.pathname){
    /* it's a link, actions here */
    chrome.runtime.sendMessage({page: page, target: from.href});
  }
}

// find first parent with tagName [tagname]
function findParent(tagname,el){
  if ((el.nodeName || el.tagName).toLowerCase()===tagname.toLowerCase()){
    return el;
  }
  while (el = el.parentNode){
    if ((el.nodeName || el.tagName).toLowerCase()===tagname.toLowerCase()){
      return el;
    }
  }
  return null;
}
