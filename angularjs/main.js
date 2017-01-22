/**
 * AngularJS Tutorial 1
 * @author Nick Kaye <nick.c.kaye@gmail.com>
 */

/**
 * Main AngularJS Web Application
 */
angular.module('PM', ['ngRoute','PM.controller','ngAnimate','chieffancypants.loadingBar'])
.config(['$routeProvider', function ($routeProvider) {
  $routeProvider
    // Home
    .when("/home", {templateUrl: "template/home.html", controller: "PMCtrl"})
    // Login
    .when("/login", {templateUrl: "template/Login.html", controller: "LoginCtrl"})
    // Pages
    // .when("/word", {templateUrl: "partials/word.html", controller:"WordCtrl"})
    
    .otherwise({ redirectTo: '/login' });
}])
.config(function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = true;
  })


