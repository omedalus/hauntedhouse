/* global SingleSolutionCoverageGraph */
/* global _ */

var SingleSolutionCoverageGraph = null;


(function() {
  
  /// Creates a disconnected graph where each desired active node is connected
  /// to two other nodes, and there are no other connections in the entire graph.
  /// This ensures a unique minimal solution.
  /// For example, if you specify that the desired number of active nodes is 4,
  /// it will generate:
  /// 4 --- 0 --- 8
  /// 5 --- 1 --- 9
  /// 6 --- 2 --- 10
  /// 7 --- 3 --- 11
  /// But the actual node numbers will be scrambled.
  /// Except for Node 0, which is always part of the solution.
  var populateGraphBackbone = function(graph) {
    var desiredNumActiveNodes = graph.difficulty * 2;
    
    var scrambled = _.chain(desiredNumActiveNodes * 3).range().without(0).shuffle().value();
    scrambled.unshift(0);
    
    graph.numNodes = scrambled.length;
    var solution = new Array(graph.numNodes).fill(false);
    
    for (var i = 0; i < desiredNumActiveNodes; i++) {
      graph.addEdge(scrambled[i], scrambled[i + desiredNumActiveNodes]);
      graph.addEdge(scrambled[i], scrambled[i + 2 * desiredNumActiveNodes]);
      solution[scrambled[i]] = true;
    }
    
    graph.solution = solution;
    graph.solutionNumActiveNodes = desiredNumActiveNodes;
    return graph;
  };

  
  
  var addRandomEdgesBetweenIlluminatedNodes = function(graph) {
    // To preserve a max arity of 3, we need to remember that each
    // illuminated node is already connected to its two "ribs".
    // Besides its own two ribs, an illuminated node can only connect
    // to a max of one other illuminated node. It can't connect to
    // another rib because then the other illuminated node that was
    // lighting that rib becomes ambiguous with its other rib.
    // So, the illuminated nodes can only connect in a "spine".
  
    var illuminatedNodes = _.chain(graph.solution.length).
        range().
        filter(function(x) { 
          return graph.solution[x]; 
        }).
        shuffle().
        value();
        
    for (var i = 0; i < illuminatedNodes.length; i += 2) {
      var node1 = illuminatedNodes[i];
      var node2 = illuminatedNodes[i + 1];
      graph.addEdge(node1, node2);
    }
    
    return graph;
  };

  
  
  /// Must be run before the spine is connected.
  var addRandomEdgesBetweenSideNodes = function(graph) {
    var illuminatedNodes = _.chain(graph.solution.length).
        range().
        filter(function(x) { 
          return graph.solution[x]; 
        }).
        value();
  
    var ribsLeft = [];
    var ribsRight = [];
  
    _.each(illuminatedNodes, function(iNode) {
      var ribs = _.chain(graph.adjacencies[iNode]).keys().shuffle().value();
      ribsLeft.push(ribs[0]);
      ribsRight.push(ribs[1]);
    });
  
    _.each([ribsLeft, ribsRight], function(ribset) {
      ribset = _.shuffle(ribset);
      for (var iRib = 0; iRib < ribset.length; iRib++) {
        var iRibNext = (iRib + 1) % ribset.length;
        
        var rib = ribset[iRib];
        var ribNext = ribset[iRibNext];
        graph.addEdge(rib, ribNext);
      }
    });
    return graph;
  };
  
  
  
  SingleSolutionCoverageGraph = function(difficulty) {
    var self = this;

    self.difficulty = difficulty;
    self.numNodes = 0;
    self.edges = {};
    self.adjacencies = {};
    
    self.solution = null;
    self.solutionNumActiveNodes = 0;
    
    populateGraphBackbone(self);
    addRandomEdgesBetweenSideNodes(self);
    addRandomEdgesBetweenIlluminatedNodes(self);
  };



  var getEdgeKey = function(node1, node2) {
    if (node1 > node2) {
      return getEdgeKey(node2, node1);
    }
    var edgeKey = '' + node1 + '-' + node2;
    return edgeKey;
  };



  SingleSolutionCoverageGraph.prototype.hasEdge = function(node1, node2) {
    node1 = parseInt(node1, 10);
    node2 = parseInt(node2, 10);
    if (node1 > node2) {
      return this.hasEdge(node2, node1);
    }
    var edgeKey = getEdgeKey(node1, node2);
    return (edgeKey in this.edges);
  };



  var addAdjacency = function(graph, nodeFrom, nodeTo) {
    if (!(nodeFrom in graph.adjacencies)) {
      graph.adjacencies[nodeFrom] = {};
    }
    graph.adjacencies[nodeFrom][nodeTo] = true;
  };



  SingleSolutionCoverageGraph.prototype.addEdge = function(node1, node2) {
    node1 = parseInt(node1, 10);
    node2 = parseInt(node2, 10);
    if (node1 > node2) {
      return this.addEdge(node2, node1);
    }
    var edgeKey = getEdgeKey(node1, node2);
    this.edges[edgeKey] = [node1, node2];

    addAdjacency(this, node1, node2);    
    addAdjacency(this, node2, node1);    

    return edgeKey;
  };



  /// Returns true if every node is illuminated, either directly
  /// or by sharing an edge with a directly illuminated node.
  SingleSolutionCoverageGraph.prototype.testSolutionCandidate = function(solutionCandidate) {
    var self = this;
    var illuminatedNodes = _.clone(solutionCandidate);
    _.each(self.edges, function(edge, edgeKey) {
      var doesEdgeHavePrimaryIllumination =
          solutionCandidate[edge[0]] ||
          solutionCandidate[edge[1]];
          
      if (doesEdgeHavePrimaryIllumination) {
        illuminatedNodes[edge[0]] = true;
        illuminatedNodes[edge[1]] = true;
      }
    });
    
    return _.all(illuminatedNodes);
  };
  

  var createSolutionCandidate = function(numNodes) {
    var retval = new Array(numNodes).fill(false);
    // The first room is always lit.
    retval[0] = true;
    return retval;
  };
  
  
  var countActiveNodesInSolutionCandidate = function(solutionCandidate) {
    return _.filter(solutionCandidate).length;
  };
  
  
  /// Returns true if it has generated a new solution candidate,
  /// false if it has overflowed.
  var incrementSolutionCandidate = function(solutionCandidate) {
    // We start with 1 because the first room is always lit.
    for (var i = 1; i < solutionCandidate.length; i++) {
      if (!solutionCandidate[i]) {
        solutionCandidate[i] = true;
        return true;
      } else {
        solutionCandidate[i] = false;
      }
    }
    return false;
  };

  
  SingleSolutionCoverageGraph.prototype.findAllSolutions = function(maxActiveNodes) {
    var self = this;
    var retval = [];
  
    var solutionCandidate = null;
    while (true) {
      if (solutionCandidate == null) {
        solutionCandidate = createSolutionCandidate(self.numNodes);
      } else {
        var solutionsRemain = incrementSolutionCandidate(solutionCandidate);
        if (!solutionsRemain) {
          break;
        }
      }
      
      var numActiveNodes = countActiveNodesInSolutionCandidate(solutionCandidate);
      if (numActiveNodes > maxActiveNodes) {
        continue;
      }
      
      if (self.testSolutionCandidate(solutionCandidate)) {
        retval.push(_.clone(solutionCandidate));
      }
    }
    return retval;
  };
  


  /// Returns true if all nodes are reachable from node 0,
  /// false if there are unreachable nodes.
  SingleSolutionCoverageGraph.prototype.isGraphConnected = function(numNodes, edges) {
    // Not the most efficient implementation but it gets the job done.
    var nodesReached = new Array(numNodes).fill(false);
    nodesReached[0] = true;
    
    var numNodesReachableLast = _.filter(nodesReached).length;
    while (true) {
      _.each(edges, function(edge, edgeKey) {
        var isEdgeReachable = 
            nodesReached[edge[0]] ||
            nodesReached[edge[1]];
  
        if (isEdgeReachable) {
          nodesReached[edge[0]] = true;
          nodesReached[edge[1]] = true;
        }
      });
      
      var numNodesReachableNow = _.filter(nodesReached).length;
      if (numNodesReachableNow == numNodes) {
        return true;
      } else if (numNodesReachableNow <= numNodesReachableLast) {
        return false;
      } else {
        numNodesReachableLast = numNodesReachableNow;
      }
    }
  };

  
}());


