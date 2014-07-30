'use strict';

var background = chrome.extension.getBackgroundPage();

var current = document.querySelector('.popup--current');
var record = document.querySelector('.popup--record');
var recording = false;

function listenInput(el) {
  var input = el.querySelector('input');

  input.addEventListener('keyup', function(e) {
    background.session.name = input.value;
  }, false);
}

if (!background.session) {
  record.innerText = 'Record';
} else {
  record.innerText = 'Stop';
  current.innerHTML = '<input type="text" placeholder="Empty" value="' + (background.session.name || "") + '">';
  listenInput(current);
  recording = true;
}

record.addEventListener('click', function() {
  if (recording) {
    chrome.runtime.sendMessage({record: 'stop'});
    current.innerHTML = '<em>Empty</em>';
    record.innerText = 'Record';
  } else {
    chrome.runtime.sendMessage({record: 'start'});
    record.innerText = 'Stop';
    current.innerHTML = '<input type="text" placeholder="Empty" value="">';
    listenInput(current);
  }

  recording = !recording;
});

var view = document.querySelector('.popup--view');

view.addEventListener('click', function() {
  chrome.tabs.create({url: 'wikiweb.html'});
});

var sessionList = document.querySelector('.session-list');
