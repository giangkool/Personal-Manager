angular.module('PM.Service', [])
    .factory('apiService', function ($http) {
        // var api_gateway_url = 'http://localhost:64029/Auth/hapit/';
        var api_gateway_url ='http://210.211.116.19:1111/Auth/hapit/';
        var parameter;
        var url;
        var contents = [];
        return {
            postLogin: function (username, password) {
                parameter = '&email=' + username + '&password=' + password;
                url = api_gateway_url + 'Login?';
                return $http.post(url + parameter);
            },
            postReset: function (username, password) {
                parameter = '&email=' + username + '&password=' + password;
                url = api_gateway_url + 'Reset?';
                return $http.post(url + parameter);
            },
            postForgot: function (username) {
                parameter = '&email=' + username;
                url = api_gateway_url + 'Forgot?';
                return $http.post(url + parameter);
            },
            postRegister: function (username, password, fullname, mobile) {
                parameter = '&email=' + username + '&password=' + password + '&fullname='+ fullname + '&mobile='+ mobile;
                url = api_gateway_url + 'Register?';
                return $http.post(url + parameter);
            },
            postChangePassword: function (username, password, newpassword) {
                parameter = '&email=' + username + '&password=' + password + '&newpassword='+ newpassword;
                url = api_gateway_url + 'Change?';
                return $http.post(url + parameter);
            }
        }
    })
    .factory('CheckinService', function ($http) {
        // var api_gateway_url = 'http://localhost:64029/Data/hapit/';
        var api_gateway_url ='http://210.211.116.19:1111/Data/hapit/';

        var parameter;
        var url;
        var contents = [];
        return{
            postCheck: function(username, check_day){
                parameter = '&Email=' + username + '&Check_day=' + check_day;
                url = api_gateway_url + 'Check?';
                return $http.post(url + parameter);
            },
             postCheckin: function (username, checkin_day, DAY, DDAY) {
                parameter = '&Email=' + username + '&Checkin_day=' + checkin_day + '&DAY='+ DAY + '&DDAY='+ DDAY;
                url = api_gateway_url + 'Checkin?';
                return $http.post(url + parameter);
            },
            postCheckout: function (username, checkout_day){
                parameter = '&Email=' + username + '&Checkout_day=' + checkout_day;
                url = api_gateway_url + 'Checkout?';
                return $http.post(url + parameter);
            },
            Get1week:function(username){
                 parameter = '&Email=' + username;
                url = api_gateway_url + 'Get1week?';
                return $http.get(url + parameter);
            },
            Getall:function(){
                 parameter ="";
                url = api_gateway_url + 'Getall?';
                return $http.get(url + parameter);
            },
            GetRequest:function(){
                 parameter ="";
                url = api_gateway_url + 'Request?';
                return $http.post(url + parameter);
            }
        }
    })
