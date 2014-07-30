'use strict';

chrome.runtime.onInstalled.addListener(function (details) {
  console.log('previousVersion', details.previousVersion);
});

chrome.browserAction.setBadgeBackgroundColor({color: [49, 103, 156, 150]});
chrome.browserAction.setBadgeText({text: ''});

var db = new PouchDB('wikiweb');

db.allDocs({include_docs: true}, function(err, response) {
  if (err) {
    throw err;
  }

  console.log(response);
});

var pages = [];
var links = [];

function captureClick(source, target) {
  var title = /([A-Z]).+/.exec(target)[0];
  var tId;

  // find if target is already in `pages`
  for (var i = 0; i < pages.length; i++) {
    if (pages[i].id === title) {
      tId = i;
      break;
    }
  };

  if (!tId) {
    tId = pages.push({
      id: title
    });
    tId--;
  }

  // find source page in array to link
  for (var i = 0; i < pages.length; i++) {
    if (pages[i].id === source.id) {
      links.push({source: i, target: tId, value: 1});
      break;
    }
  };
}

var session;

function recordAction(msg, request) {
  if (msg === 'start') {
    session = {
      timestamp: Date.now()
    };

    db.post(session, function(err, response) {
      if (err) throw err;

      session._id = response.id;
      session._rev = response.rev;
    });
  } else if (msg === 'stop') {
    if (pages.length === 0) {
      db.remove(session, function(err, response) {
        if (err) throw err;

        session = null;
      });
    } else {
      session.pages = pages;
      session.links = links;

      db.put(session, function(err, response) {
        if (err) throw err;

        session = null;
      });
    }

    // reset environment
    session = null;
    pages = [];
    links = [];

    chrome.browserAction.setBadgeText({text: ''});
  }
}

// capture navigation
chrome.runtime.onMessage.addListener(function(request, sender, respond) {
  // record actions
  if (request.record) {
    return recordAction(request.record);
  }

  if (request.seshname && session) {
    session.name = request.seshname;
    return;
  }

  // new link between pages
  if (request.target) {
    captureClick(request.page, request.target);
  } else {
    var source = request.page;
    var pId;

    source.timestamp = Date.now();

    for (var i = 0; i < pages.length; i++) {
      if (pages[i].id === source.id) {
        if (!pages[i].value) {
          pages[i].value = 0;
        }

        pages[i].name = source.name;
        pages[i].timestamp = source.timestamp;

        pId = i;
        pages[i].value++;
        break;
      }
    };

    if (pId === undefined) {
      pages.push(source);
    }

    chrome.browserAction.setBadgeText({text: ''+ pages.length});
  }
});
