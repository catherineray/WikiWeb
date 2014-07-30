'use strict';

angular.module('wikiweb', ['angularMoment', 'xeditable'])

.filter('truncate', function () {
  return function (text, length, end) {
    if (isNaN(length))
      length = 10;

    if (end === undefined)
      end = "...";

    if (text.length <= length || text.length - end.length <= length) {
      return text;
    }
    else {
      return String(text).substring(0, length-end.length) + end;
    }
  };
})

.filter('orderTimestamp', function(){
  return function(input) {
    if (!angular.isObject(input)) return input;

    var array = [];
    for(var objectKey in input) {
      array.push(input[objectKey]);
    }

    array.sort(function(a, b){
      a = parseInt(a.doc.timestamp);
      b = parseInt(b.doc.timestamp);
      return b - a;
    });
    return array;
  }
})

.directive('webViz', function() {
  return {
    restrict: 'E',
    scope: {
      pages: '=',
      links: '='
    },
    link: function(scope, element, attrs) {
      console.log('scope', scope.pages, scope.links);
      console.log(element);

      var color = d3.scale.category10();

      color = d3.scale.linear()
        .domain([scope.pages[0].timestamp, scope.pages[scope.pages.length - 1].timestamp])
        .range(['#4fc3f7', '#e84e40']);

      var width = 600;
      var height = 300;

      var force = d3.layout.force()
        .charge(-120)
        .linkDistance(30)
        .size([width, height]);

      var svg = d3.select(element[0]).append('svg')
        .attr('width', width)
        .attr('height', height);

      force
        .nodes(scope.pages)
        .links(scope.links)
        .start();

      var link = svg.selectAll('.link')
          .data(scope.links)
        .enter().append('line')
          .attr('class', 'link')
          .style('stroke-width', function(d) { return Math.sqrt(d.value); });

      var node = svg.selectAll('.node')
          .data(scope.pages)
        .enter().append('circle')
          .attr('class', 'node')
          .attr('r', 10)
          .style('fill', function(d) { return color(d.timestamp); })
          .call(force.drag);

      node.append('title')
        .text(function(d) { return d.timestamp; });

      node.on('mouseover', function(d) {
        scope.$parent.currTitle = decodeURIComponent(escape(d.name || d.id));
        scope.$parent.currLink = 'http://en.wikipedia.org/wiki/' + d.id;
        console.log(d.timestamp);
        scope.$apply();
      });

      force.on('tick', function() {
        link.attr('x1', function(d) { return d.source.x; })
          .attr('y1', function(d) { return d.source.y; })
          .attr('x2', function(d) { return d.target.x; })
          .attr('y2', function(d) { return d.target.y; });

        node.attr('cx', function(d) { return d.x; })
          .attr('cy', function(d) { return d.y; });
      });
    }
  };
})

.controller('MainCtrl', ['$scope', '$filter', function($scope, $filter) {
  var db = new PouchDB('wikiweb');

  $scope.sessions = [];
  $scope.orderedSessions = [];

  $scope.db = db;

  db.allDocs({include_docs: true}, function(err, response) {
    if (err) {
      throw err;
    }

    console.log(response.rows);

    $scope.sessions = response.rows.filter(function(row) {
      console.log(row);
      if (row.doc.pages && row.doc.pages.length > 0) {
        return row;
      }
    });

    $scope.orderedSessions = $filter('orderTimestamp')($scope.sessions);

    $scope.$apply();
  });

  $scope.delete = function(idx) {
    var doc = angular.copy($scope.sessions[idx].doc);

    console.log(doc);

    $scope.sessions.splice(idx, 1);
    $scope.orderedSessions.splice(idx, 1);

    db.remove(doc._id, doc._rev, function(err, response) {
      if (err) throw err;

      console.log(response);
    });
  };
}])

.controller('PaperCtrl', ['$scope', '$timeout', function($scope, $timeout) {
  var db = $scope.$parent.db;

  $scope.currLink = '';
  $scope.currTitle = '';

  $scope.dropToggle = false;

  $scope.toggleDropdown = function() {
    $scope.dropToggle = !$scope.dropToggle;
  };

  $scope.log = function() {
    $scope.toggleDropdown();
  };

  $scope.reopen = function() {
    var urls = $scope.sesh.doc.pages.map(function(page) {
      return 'http://en.wikipedia.org/wiki/' + page.id;
    });

    chrome.windows.create({url: urls});

    $scope.toggleDropdown();
  };

  $scope.save = function(data) {
    var doc = angular.copy($scope.sesh.doc);

    doc.name = data;

    db.put(doc).then(function(response) {
    }, function(err) {
      throw err;
    });
  };
}]);