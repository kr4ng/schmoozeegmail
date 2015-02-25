'use strict';
document.addEventListener("DOMContentLoaded", function(){
  console.log('this is the first part of the code');
  var contactimagediv = document.getElementById('contactHeaderRow');
  console.log(chrome.extension.getURL("images/macstyle1.gif"));
  var divs = contactimagediv.getElementsByTagName('div');
  divs[0].getElementsByTagName('img')[0].src = chrome.extension.getURL("images/macstyle1.gif");
});

window.addEventListener("load", function() {
  console.log('this is the second part of the code');
  var app = angular.module('Schmoozee', []);

  var html = document.querySelector('html');
  html.setAttribute('ng-app', '');
  html.setAttribute('ng-csp', '');

  //var contactimagediv = document.getElementById('contactHeaderRow');
  //console.log('steven',contactimagediv);

  //var divs = contactimagediv.getElementsByTagName('div');
  //divs[0].getElementsByTagName('img')[0].src = "https://media.licdn.com/media/p/7/005/0ae/1ad/2dc5c21.jpg";
  //divs[0] is what we need
  //for (var i = 0; i < divs.length; i += 1) {
  //  divArray.push(divs[i].innerHTML);
  //}

  var viewport = document.querySelector('body');  
  viewport.setAttribute('ng-controller', 'MainController as MCtrl');
  app.controller("MainController", ['$http', '$scope', 'pollingServicePost', 'pollingService', function($http, $scope, pollingServicePost, pollingService) {
  
  //initialize controller variables, and start polling
  $scope.data = {ptweets:[],ctweets:[],local:[],sports:[],company:[]};
  $scope.ssId;
  this.tab = 0;

  //$scope.imageUrl = "https://media.licdn.com/media/p/7/005/0ae/1ad/2dc5c21.jpg";
  //var contactimagediv = document.getElementById('contactHeaderRow');
  //var divs = contactimagediv.getElementsByTagName('div');
  //divs[0].getElementsByTagName('img')[0].src = $scope.imageUrl;

  var nameDiv = document.getElementById('con2_ileinner');
  var name = nameDiv.innerHTML;
  var accountDiv = document.getElementById('con4_ileinner').getElementsByTagName('a')[0];
  var account = accountDiv.innerHTML;
  var payload = {"name":name, "account":account};

  //start polling for SSID - really not a poll, just pinging the server once
  pollingService.startPolling('schmoozeessid', payload,'https://schmoozee.herokuapp.com/chromeplugin', 10000, function(response){
    $scope.imageUrl = response.data;
    pollingService.stopPolling('schmoozeessid');   
  });
  //not doing a whole lot right now
  //stop polling
  this.isTab = function(value){
    return (this.tab == value)
  };

  this.setTab = function(value){
    console.log(value);
  };

  }]);

  var myDirective = document.createElement('div');
  myDirective.setAttribute('schmoozee-sidetab', '');
  viewport.appendChild(myDirective);
  //"https://media.licdn.com/media/p/7/005/0ae/1ad/2dc5c21.jpg"
  //controller and link aren't doing a whole lot right now.
  app.directive('schmoozeeSidetab', ['$sce', function($sce) {
    return {
      restrict: 'EA', 
      replace: true,
      controller: 'MainController as Mctrl',
      link: function(scope, el, attr, isTab, setTab) {
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
            startPolling: function(name, url, payload, pollingTime, callback) {
                // Check to make sure poller doesn't already exist
                if (!polls[name]) {
                    var poller = function() {
                        $http.post(url, payload).then(callback);
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