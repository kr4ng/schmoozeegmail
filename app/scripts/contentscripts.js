'use strict';
document.addEventListener("DOMContentLoaded", function(){
  // Initialize a loading screen - somewhat placeholderish right now
  var contactimagediv = document.getElementById('bodyTable');
  var stevedivs = contactimagediv.getElementsByTagName('div');
  //stevedivs[62].innerHTML = "<div id='SchmoozeeOuterContainer' style='height:100px'><img src='' /></div>";
  //stevedivs[62].getElementsByTagName('img')[0].src = chrome.extension.getURL("images/loadingschmoozee.gif");

  var contactimagediv = document.getElementById('contactHeaderRow');
  var divs = contactimagediv.getElementsByTagName('div');
  console.log(divs);
  var socialRow = divs[2];
  socialRow.innerHTML = "";
  //socialRow.parentNode.removeChild(socialRow);
  divs[0].getElementsByTagName('img')[0].src = chrome.extension.getURL("images/macstyle1.gif");

  // Other JS that needs to run immediately goes here.
});

window.addEventListener("load", function() {
  // Start the rest of the app
  // Things in here are put here so as to not ruin SFDC performance
  var app = angular.module('Schmoozee', []);

  var bodydiv = document.getElementById('bodyCell')
  var divos = bodydiv.getElementsByTagName('div');
  var html = divos[1]

  html.setAttribute('ng-app', '');
  html.setAttribute('ng-csp','');
  html.setAttribute('social-me','');
  html.setAttribute('ng-controller', 'MainController as MCtrl');

  var contactimagediv = document.getElementById('contactHeaderRow');
  var myDirective = document.createElement('div');
  myDirective.setAttribute('schmoozee-area', '');
  contactimagediv.appendChild(myDirective);
  //var html = document.querySelector('html');
  //html.setAttribute('ng-app', '');
  //html.setAttribute('ng-csp', '');

  //var contactimagediv = document.getElementById('contactHeaderRow');
  //console.log('steven',contactimagediv);

  //var divs = contactimagediv.getElementsByTagName('div');
  //divs[0].getElementsByTagName('img')[0].src = "https://media.licdn.com/media/p/7/005/0ae/1ad/2dc5c21.jpg";
  //divs[0] is what we need
  //for (var i = 0; i < divs.length; i += 1) {
  //  divArray.push(divs[i].innerHTML);
  //}

  //var viewport = document.querySelector('body');  
  //viewport.setAttribute('ng-controller', 'MainController as MCtrl');
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
  pollingService.startPolling('schmoozeessid','https://schmoozee.herokuapp.com/chromeplugin', payload, 10000, function(response){
    $scope.imageUrl = response.data;
    pollingService.stopPolling('schmoozeessid');
    console.log($scope.imageUrl);   
    var contactimagediv = document.getElementById('contactHeaderRow');
    var divs = contactimagediv.getElementsByTagName('div');
    divs[0].getElementsByTagName('img')[0].src = $scope.imageUrl;
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

  //"https://media.licdn.com/media/p/7/005/0ae/1ad/2dc5c21.jpg"
  //controller and link aren't doing a whole lot right now.
  app.directive('schmoozeeArea', ['$sce', function($sce) {
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

  //i am going to work on a jquery fucking thing with this directive.
  app.directive("socialMe", ["$interval", function($interval) {
      return {
          restrict: "A",
          link: function(scope, elem, attrs) {
            //$('.content').remove();
          }
      }
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