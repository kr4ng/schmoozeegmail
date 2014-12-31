'use strict';

window.addEventListener("load", function() {
  var app = angular.module('Schmoozee', []);

  var html = document.querySelector('html');
  html.setAttribute('ng-app', '');
  html.setAttribute('ng-csp', '');

  var viewport = document.querySelector('body');  
  viewport.setAttribute('ng-controller', 'MainController');
  app.controller("MainController", ['$http', '$scope', 'pollingServicePost', 'pollingService', function($http, $scope, pollingServicePost, pollingService) {
  
  //initialize controller variables, and start polling
  $scope.data = {ptweets:[],ctweets:[],local:[],sports:[],company:[]};
  $scope.ssId;
  
  //start polling for SSID - really not a poll, just pinging the server once
  pollingServicePost.startPolling('schmoozeessid', 'https://schmoozee.herokuapp.com/canvaslocal2', 1000, function(response){
    $scope.ssId = response.data;
    console.log($scope.ssId);
    if ($scope.ssId){
      pollingServicePost.stopPolling('schmoozeessid');
      //stop polling
      //start polling
      pollingService.startPolling('schmoozeedatum', 'https://schmoozee.herokuapp.com/canvaslocal2/update', $scope.ssId, 1000, function(response){
        $scope.data = response.data;
        if ($scope.data.done == true){
          pollingService.stopPolling('schmoozeedatum');
          console.log($scope.data);
        }
      });     
    }
  });
  //stop polling
  }]);

  var myDirective = document.createElement('div');
  myDirective.setAttribute('schmoozee-sidetab', '');
  viewport.appendChild(myDirective);

  app.directive('schmoozeeSidetab', ['$sce', function($sce) {
    return {
      restrict: 'EA', 
      replace: true,
      link: function(scope, el, attr) {
        scope.data = scope.data;
      },
      templateUrl: $sce.trustAsResourceUrl(chrome.extension.getURL('templates/schmoozee.html'))
    };
  }]);

  app.factory('pollingServicePost', ['$http', function($http){
        var defaultPollingTime = 10000;
        var polls = {};

        return {
            startPolling: function(name, url, pollingTime, callback) {
                // Check to make sure poller doesn't already exist
                if (!polls[name]) {
                    var poller = function() {
                        $http.post(url).then(callback);
                    }
                    poller();
                    polls[name] = setInterval(poller, pollingTime || defaultPollingTime);
                }
            },

            stopPolling: function(name) {
                clearInterval(polls[name]);
                delete polls[name];
            }
        }
  }]);

  app.factory('pollingService', ['$http', function($http){
        var defaultPollingTime = 10000;
        var polls = {};

        return {
            startPolling: function(name, url, ssId, pollingTime, callback) {
                // Check to make sure poller doesn't already exist
                if (!polls[name]) {
                    var poller = function() {
                        $http.post(url, { ssId:ssId }).then(callback);
                    }
                    poller();
                    polls[name] = setInterval(poller, pollingTime || defaultPollingTime);
                }
            },

            stopPolling: function(name) {
                clearInterval(polls[name]);
                delete polls[name];
            }
        }
  }]);

  angular.bootstrap(html, ['Schmoozee'], []);
});