'use strict';
document.addEventListener("DOMContentLoaded", function(){
  // Initialize a loading screen - and replace contentdiv with SchmoozeeOuterContainer
  //Schmoozee Outer Container is the main content div.
  var contactimagediv = document.getElementById('bodyTable');
  var allpagedivs = contactimagediv.getElementsByTagName('div');
  var contentdiv = allpagedivs[62];
  contentdiv.innerHTML = "<div id='SchmoozeeOuterContainer' style='height:50px'><img style='height:50px' src='' /></div>";
  contentdiv.getElementsByTagName('img')[0].src = chrome.extension.getURL("images/loadingschmoozee.gif");

  //var contactimagediv = document.getElementById('contactHeaderRow');
  //var divs = contactimagediv.getElementsByTagName('div');
  //console.log(divs);
  //var socialRow = divs[2];
  //socialRow.innerHTML = "";
  //socialRow.parentNode.removeChild(socialRow);
  //divs[0].getElementsByTagName('img')[0].src = chrome.extension.getURL("images/macstyle1.gif");
  // Other JS that needs to run immediately goes here.
});

window.addEventListener("load", function() {
  // Start the rest of the app
  // Things in here are put here so as to not ruin SFDC performance
  // Declare Globals
  var app = angular.module('Schmoozee', []);
  var bodydiv = document.getElementById('SchmoozeeOuterContainer');
  var myDirective = document.createElement('div');

  //lay the groundwork for the angular controller and directives
  bodydiv.setAttribute('ng-app', '');
  bodydiv.setAttribute('ng-csp','');
  bodydiv.setAttribute('social-me','');
  bodydiv.setAttribute('ng-controller', 'MainController as MCtrl');
  myDirective.setAttribute('schmoozee-area', '');
  bodydiv.appendChild(myDirective);
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
  $scope.profileUrl = 'https://linkedin.com'
  this.tab = 0;

  console.log(bodydiv);
  //$scope.imageUrl = "https://media.licdn.com/media/p/7/005/0ae/1ad/2dc5c21.jpg";
  //var contactimagediv = document.getElementById('contactHeaderRow');
  //var divs = contactimagediv.getElementsByTagName('div');
  //divs[0].getElementsByTagName('img')[0].src = $scope.imageUrl;

  var nameDiv = document.getElementById('con2_ileinner');
  var name = nameDiv.innerHTML;
  $scope.name = name;
  var titleDiv = document.getElementById('con5_ileinner');
  var title = titleDiv.innerHTML;
  var accountDiv = document.getElementById('con4_ileinner').getElementsByTagName('a')[0];
  var account = accountDiv.innerHTML;
  var payload = {"name":name, "account":account, "title":title};
  console.log(payload);

  //start polling for SSID - really not a poll, just pinging the server once
  pollingService.startPolling('schmoozeessid','https://api.schmoozee.io/chromeplugin', payload, 10000, function(response){
    $scope.data = response.data;
    //pollingService.stopPolling('schmoozeessid');
    console.log('lol');
    console.log($scope.data);   
    console.log($scope.data.linkedindata.linkedinImageUrl);
    $scope.profileUrl = 'https://www.linkedin.com/profile/view?id=' + $scope.data.linkedindata.linkedinID
    //var slogo = document.getElementById('slogo');
    //slogo.getElementsByTagName('img')[0].src = $scope.data.linkedindata.linkedinImageUrl;
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

  //"https://media.licdn.com/media/p/7/005/0ae/1ad/2dc5c21.jpg"
  //controller and link aren't doing a whole lot right now.
  app.directive('schmoozeeArea', ['$sce', "$interval", function($sce, $interval) {
    return {
      restrict: 'EA', 
      replace: true,
      controller: 'MainController as Mctrl',
      link: function(scope, el, attr, isTab, setTab) {
        $('#SchmoozeeOuterContainer > img').remove();
        $('#SchmoozeeOuterContainer').css({'height':'75px'});
        $('.scontainer').css({'display':''});
        console.log(scope.data);
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
            console.log('i am in socialMe');
            //$('.scontainer').css({'display':''});
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

  angular.bootstrap(bodydiv, ['Schmoozee'], []);
});