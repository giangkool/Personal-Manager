angular.module('PM.Service', [])
    .factory('apiService', function ($http) {
        var api_gateway_url = 'http://localhost:64029/Auth/hapit/';
        // var api_gateway_url ='http://210.211.116.19:1111/Auth/hapit/';
        var parameter;
        var url;
        var contents = [];
        return {
            postLogin: function (username, password, yourip) {
                parameter = '&passcode=' + username + '&password=' + password + '&ip=' +yourip;
                url = api_gateway_url + 'Login?';
                return $http.post(url + parameter);
            },
            postReset: function (username, password) {
                parameter = '&email=' + username + '&password=' + password;
                url = api_gateway_url + 'Reset?';
                return $http.post(url + parameter);
            },
            postNextpasscode: function(){
                parameter ='';
                url = api_gateway_url + 'Nextpasscode?';
                return $http.post(url + parameter); 
            },
            postForgot: function (username) {
                parameter = '&passcode=' + username;
                url = api_gateway_url + 'Forgot?';
                return $http.post(url + parameter);
            },
            postRegister: function (username, password, fullname, mobile, role_name, role_id, passcode) {
                parameter = '&email=' + username + '&password=' + password + '&fullname='+ fullname + '&mobile='+ mobile + '&role_name=' + role_name + '&role_id='+role_id+'&passcode='+passcode;
                url = api_gateway_url + 'Register?';
                return $http.post(url + parameter);
            },
            postChangePassword: function (username, password, newpassword) {
                parameter = '&email=' + username + '&password=' + password + '&newpassword='+ newpassword;
                url = api_gateway_url + 'Change?';
                return $http.post(url + parameter);
            },
            postPermission: function(Email, title, type, content, fromdayleave, todayleave){
                parameter = '&email=' + Email + '&title=' + title + '&type='+ type +'&content='+ content+'&fromdayleave='+fromdayleave+'&todayleave='+todayleave;
                url = api_gateway_url + 'Permission?';
                return $http.post(url + parameter);
            },
            AllowPermission: function(Email, _id, checkin_day){
                parameter = '&email=' + Email + '&id='+ _id +'&Checkin_day=' + checkin_day;
                url = api_gateway_url + 'AllowPermission?';
                return $http.post(url + parameter);
            },
            AllPermission: function(){
                parameter ="";
                url = api_gateway_url + 'AllPermission?';
                return $http.post(url + parameter);
            },
            GetListUser: function(){
                parameter ="";
                url = api_gateway_url + 'ListUser?';
                return $http.get(url + parameter);
            },
            PostUpdateProfile: function(passcode, name, email, mobile, role_name, role_id){
                parameter ="&passcode=" +passcode+ '&name=' +name+ '&email=' +email+ '&mobile=' +mobile+ '&role_name=' +role_name+ '&role_id=' +role_id;
                url = api_gateway_url + 'UpdateProfileById?';
                return $http.post(url + parameter);
            },
            PostDelete: function(passcode){
                parameter ="&passcode=" +passcode;
                url = api_gateway_url + 'Delete?';
                return $http.post(url + parameter);
            },
            SendMailById: function(Auth, email, fullname, title, less_content, content){
                parameter ="&auth=" + Auth + "&email=" + email + "&fullname=" + fullname + "&title=" + title + "&less_content=" + less_content + "&content=" + content;
                url = api_gateway_url + 'SendById?';
                return $http.post(url + parameter);
            }
        }
    })
    .factory('CheckinService', function ($http) {
        var api_gateway_url = 'http://localhost:64029/Data/hapit/';
        // var api_gateway_url ='http://210.211.116.19:1111/Data/hapit/';

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
            },
            PostNewFeed: function(Email, title, less_content, content, group_id, group_name){
                parameter ="&email=" + Email + "&title="+ title+'&less_content='+less_content+'&content='+content+'&group_id='+group_id+'&group_name='+group_name;
                url = api_gateway_url + 'CreateNewFeed?';
                return $http.post(url + parameter);
            },
            GetAllNewFeed: function(email){
                parameter ="&email="+email;
                url = api_gateway_url + 'GetListNew?';
                return $http.get(url + parameter);
            },
            SaveUserIsread: function(Email, title, list_user){
                parameter ="&email="+Email+"&title="+title+'&list_user='+list_user;
                url = api_gateway_url + 'SaveUserIsRead?';
                return $http.post(url + parameter);
            }
        }
    })
