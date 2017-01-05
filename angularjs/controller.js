angular.module('PM.controller', ['ngRoute', 'ngStorage', 'angular-md5', 'PM.Service', 'ngDialog'])
    .controller('PMCtrl', function ($rootScope, $scope, $localStorage, $timeout, $interval, $filter, CheckinService, apiService, md5, ngDialog) {
        var auth = window.localStorage.getItem('auth');
        var ip = window.localStorage.getItem('ip');
        $scope.Auth = JSON.parse(auth);
        var date = new Date();
        var checkin_day = $filter('date')(new Date(), 'dd/MM/yyyy');
        var DAY = $filter('date')(new Date(), 'yyyyMMdd');
        var DDAY = $filter('date')(new Date(), 'EEEE');

        if(!auth){
             window.location.href = '#/login';
            return;
        }

        if(ip == "true")
        {
            $scope.ip = true;
        }

        //alert
        $scope._alert_error = function () {
                ngDialog.open({
                    template: '<center><h3 style="color:red">'+$scope.alert+'</h3></center>',
                    plain: true,
                    showClose: false,
                });
            };
        
        $scope._alert_success = function () {
                ngDialog.open({
                    template: '<center><h3 style="color:#1B5E20">'+$scope.alert_success+'</h3></center>',
                    plain: true,
                    showClose: false,
                });
            };

        $scope._alert_check = function(){
            ngDialog.open({
                    template: '<center><h3 style="color:#1B5E20">'+$scope.alert_success+' <i class="fa fa-smile-o" aria-hidden="true"></i></h3></center>',
                    plain: true,
                    showClose: false,
                });
        };
            

        //create clock
        var tick = function () {
            $scope.clock = Date.now();
        }
        tick();
        $interval(tick, 1000);


        $scope.logout = function () {
           localStorage.clear(true);
            window.location.reload(true);
            window.location.href = '#/login';
        }

        CheckinService.postCheck($scope.Auth.Email, checkin_day).then(function (response) {
            if(ip == "true"){
                if (response.data._error_code == "00") {
                    $scope.show = false;
                }
                if (response.data._error_code == "02") {
                    $scope.show = true;
                }
                else if (response.data._error_code == "03") {
                    $scope.show = true;
                    $scope.myDynamicClass = 'hshow';
                }
            }else{
                 $scope.show = true;
                 $scope.myDynamicClass = 'hshow';
            }
        });

        getrequest();

        CheckinService.Getall().then(function (response) {
                if (response.data) {
                    $scope.full_all = response.data;
                }
            })

        function getrequest() {
            CheckinService.GetRequest().then(function (response) {
                if (response.data.Number >= 0) {
                    $scope.Number = response.data.Number;
                    $scope.Email = response.data.Email;
                }
            });
        }

        $scope.checkin = function () {
            CheckinService.postCheckin($scope.Auth.Email, checkin_day , DAY, DDAY).then(function (response) {
                    if (response.data._error_code == "00") {
                        $scope.show = true;
                        $scope.alert_success ="Have a nice day <br/>"+'<span style="color:#FEA82B">'+$scope.Auth.Fullname+'</span>';
                        $scope._alert_check();
                    }
                    else{
                        $scope.alert = response.data._error_messenger;
                        $scope._alert_error();
                    }
                });
        }

        $scope.checkout = function () {
            CheckinService.postCheckout($scope.Auth.Email, checkin_day).then(function (response){
               if (response.data._error_code == "00") {
                        $scope.myDynamicClass = 'hshow';
                        $scope.alert_success ="Good bye see you again <br/>"+'<span style="color:#FEA82B">'+$scope.Auth.Fullname+'</span>';
                        $scope._alert_check();
                    }
                    else{
                        $scope.alert = response.data._error_messenger;
                        $scope._alert_error();
                    }
           });
        }

        $scope.Getweek = function(){
            CheckinService.Get1week($scope.Auth.Email).then(function (response) {
                if (response.data) {
                    $scope.full_list_time = response.data;
                    var tmp = [];
                    if ($scope.full_list_time.length >= 5) {
                        for (var i = 0; i < 5; i++) {
                            tmp.push(response.data[i]);
                        }
                        $scope.list_time = tmp;
                    }
                    else {
                        $scope.list_time = response.data;
                    }
                }
            });
        }

        $scope.reset = function (index) {
            for (var i = 0; i < $scope.Email.length; i++) {
                if (index == i) {
                    rsapassword = md5.createHash("123456");
                    apiService.postReset($scope.Email[i].Email, rsapassword).then(function (response) {
                        if (response.data._error_code == "00") {
                            getrequest();
                            $scope.alert_success = response.data._error_messenger;
                            $scope._alert_success();
                        }
                        else {
                            $scope.alert = response.data._error_messenger;
                            $scope._alert_error();
                            data.email = null;
                        }
                    });
                }
            }
        }

        $scope.register = function (data){
            if (data == undefined) {
                $scope.alert = "Input can not be blank !";
                $scope._alert_error();
            }
            else {
                if (data.email && data.password && data.fullname && data.mobile) {
                    rsapassword = md5.createHash(data.password);
                    apiService.postRegister(data.email, rsapassword, data.fullname, data.mobile).then(function (response) {
                        if(response.data._error_code == "00"){
                            $scope.alert_success = response.data._error_messenger
                            $scope._alert_success();
                            data.email = null;
                            data.password = null;
                            data.fullname = null;
                            data.mobile = null;
                        }
                        else{
                             $scope.alert = response.data._error_messenger
                             $scope._alert_error();
                        }
                    });
                } else {
                    $scope.alert = response.data._error_messenger
                    $scope._alert_error();
                }
            }
        }

        $scope.exportData = function () {
        var blob = new Blob([document.getElementById('exportable').innerHTML], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
        });
        saveAs(blob, $scope.Auth.Email+".xls");
        };

        $scope.getalldata = function () {
            var blob = new Blob([document.getElementById('Exportable').innerHTML], {
                        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
                    });
                    saveAs(blob, "Report All User.xls");
        }


        $scope.Changepass = function (data) {
            if (data == undefined) {
                $scope.alert = "Password and New Password can not be blank";
                $scope._alert_error();
            }
            else {
                if (data.password && data.newpassword) {
                    rsapassword = md5.createHash(data.password);
                    rsanewpassword = md5.createHash(data.newpassword);
                    apiService.postChangePassword($scope.Auth.Email, rsapassword, rsanewpassword).then(function (response) {
                        if(response.data._error_code == "00"){
                            $scope.alert_success = response.data._error_messenger;
                            $scope._alert_success();
                            $timeout(function () {
                                window.location.reload(true);
                            }, 1300);
                            data.password = null;
                            data.newpassword = null;
                        }
                        else{
                            $scope.alert = response.data._error_messenger;
                            $scope._alert_error();
                        }
                    });
                }
                else {
                    $scope.alert = "Password and New Password can not be blank";
                    $scope._alert_error();
                }
            }
        }
    })
    .controller('LoginCtrl', function ($rootScope, $scope, $localStorage, $timeout, md5, $http, apiService, ngDialog) {
        window.localStorage.clear(true);
       
       $.get("http://ipinfo.io", function(response) {
  console.log(response);
}, "jsonp");

        // var json = 'http://ipv4.myexternalip.com/json';
        // $http.get(json).then(function (result) {
        //     svip = result.data.ip;
        //     svip = svip.slice(0, 9);
        //     myip = "27.74.76.";
        //     result = angular.equals(svip, myip);
        //     if(result)
        //     {
        //         window.localStorage.setItem('ip', result);
        //     }
        //     else{
        //          window.localStorage.setItem('ip', result);
        //     }
        // }, function (e) {
        //     // alert("error");
        // });

        //alert
        $scope._alert_error = function () {
                ngDialog.open({
                    template: '<center><h3 style="color:red">'+$scope.alert+'</h3></center>',
                    plain: true,
                    showClose: false,
                });
            };
        
        $scope._alert_success = function () {
                ngDialog.open({
                    template: '<center><h3 style="color:#1B5E20">'+$scope.alert_success+'</h3></center>',
                    plain: true,
                    showClose: false,
                });
            };
        

        $scope.login = function (data) {
            if (data == undefined) {
               $scope.alert = "Username and Password can not be blank";
               $scope._alert_error();
            }
            else {
                if (data.username && data.password) {
                    rsapassword = md5.createHash(data.password);
                    apiService.postLogin(data.username, rsapassword).then(function (response) {
                        $scope.result = response.data;
                        if ($scope.result._error_code == "00") {
                            window.localStorage.setItem('auth', JSON.stringify(response.data));
                            window.location.href = '#/home';
                        }
                        else {
                           $scope.alert = "Username or Password incorrect, Please try again";
                            $scope._alert_error();
                        }

                    });
                }
                else {
                     $scope.alert = "Username and Password can not be blank";
                     $scope._alert_error();
                }
            }
        }

        //show alert
        $scope.forgot = function (data) {
            if(data == undefined){
                $scope.alert = "Username can not be blank"
                $scope._alert_error();
            }else{
                if(data.username)
                {
                     apiService.postForgot(data.username).then(function (response) {
                         if(response.data._error_code == "00"){
                             $scope.alert_success = "The request send success, please try again with the default password after 5 minutes";
                             $scope._alert_success();
                         }
                         else{
                             $scope.alert = response.data._error_messenger;
                             $scope._alert_error();
                         }
                     });

                }else{
                    $scope.alert = "Username can not be blank"
                    $scope._alert_error();
                }
            }
        }
    })

