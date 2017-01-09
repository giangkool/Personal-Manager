angular.module('PM.controller', ['ngRoute', 'ngStorage', 'angular-md5', 'PM.Service', 'ngDialog'])
    .filter('unsafe', function($sce) { return $sce.trustAsHtml; })
    .controller('PMCtrl', function ($rootScope, $scope, $localStorage, $timeout, $interval, $filter, CheckinService, apiService, md5, ngDialog, cfpLoadingBar) {
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

        if(ip == "true"){
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

        // check email in array
        Array.prototype.contains = function ( needle ) {
        for (i in this) {
            if (this[i].Email == needle) return true;
        }
        return false;
        }

        // update isread user
        $scope._detail_new_feed = function(idx){
            var title_newfeed;
            var content_newfeed;
            var array_user = [];
            var tmp_user;
            var list_user;
            
            console.log("xba");
            for(i =0; i<$scope.resultNewFeed.length; i++){
                if(idx == i){
                    title_newfeed = $scope.resultNewFeed[i].Title;
                    content_newfeed = $scope.resultNewFeed[i].Content;
                    list_user = $scope.resultNewFeed[i].List_user;
                      
                      if (list_user){
                           if (list_user.contains($scope.Auth.Email) == false) {
                               array_user = list_user;
                               array_user.push({
                                   Email: $scope.Auth.Email,
                                   Isread: "1"
                               });
                               tmp_user = JSON.stringify(array_user);
                               $scope.NumberFeed = $scope.NumberFeed - 1;
                           } else {
                               tmp_user = JSON.stringify(list_user);
                           }
                       } else {
                           array_user.push({
                               Email: $scope.Auth.Email,
                               Isread: "1"
                           });
                           tmp_user = JSON.stringify(array_user);
                           $scope.NumberFeed =$scope.NumberFeed - 1;
                       }

                }
            }
                ngDialog.open({
                    template: '<h4 style="color:#D4921D">'+title_newfeed+'</h4><hr style="margin-top:10px; margin-bottom:10px"/><p>'+content_newfeed+'</p>',
                    plain: true,
                    showClose: false,
                });
            
            CheckinService.SaveUserIsread($scope.Auth.Email, title_newfeed, tmp_user).then(function(response){
                if(response.data._error_code == "00"){
                     getallnewfeed();
                }
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
            // window.location.reload(true);
            window.location.href = '#/login';
        }


        // auto load whem page load
        CheckinService.postCheck($scope.Auth.Email, checkin_day).then(function (response) {
            cfpLoadingBar.start();
            if(response.data.Change_pass == "0")
            {
                $scope.alert = "Please change your password when you fist login";
                $scope._alert_error();
            }
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
                cfpLoadingBar.complete();
            }else{
                 $scope.show = true;
                 $scope.myDynamicClass = 'hshow';
                 cfpLoadingBar.complete();
            }
        });

        getrequest();
        getallnewfeed();

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

        function getallnewfeed() {
            CheckinService.GetAllNewFeed($scope.Auth.Email).then(function (response) {
                $scope.resultNewFeed = response.data;
                $scope.NumberFeed = 0;
                $scope.All_Isread = true;
                console.log(response.data);
                for (i = 0; i < $scope.resultNewFeed.length; i++) {
                    if($scope.resultNewFeed[i].Isread == "0")
                    {
                         $scope.NumberFeed = $scope.NumberFeed + 1 ;
                         $scope.All_Isread = false;
                    }
                }
            });
        }


        
        // check in & check out
        $scope.checkin = function () {
            cfpLoadingBar.start();
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
                    cfpLoadingBar.complete();
                });
        }

        $scope.checkout = function () {
            cfpLoadingBar.start();
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
                    cfpLoadingBar.complete();
           });
        }


        //Create Notification
        $scope.checkboxModel = {
            value : false,
            value2 : true
        };

        $scope.CreateNewFeed = function(data){
            cfpLoadingBar.start();
            if($scope.checkboxModel.value == true){
                var imporfeed = "1";
            }
            else{
                var imporfeed = "0";
            }
      
                if (data == undefined) {
                    $scope.alert = "Title and Content can not be blank";
                    $scope._alert_error();
                    cfpLoadingBar.complete();
                }else{
                    if (data.title && data.content) {

                        var content_feed =  $('#New_feed_content').val();
                        content_feed = content_feed.replace(/\r?\n/g, '<br/>');
                        less_content = content_feed;
                        if(less_content.length > 100) less_content = less_content.substring(0,100);
                        
                        CheckinService.PostNewFeed($scope.Auth.Email, data.title, less_content, content_feed, imporfeed).then(function (response) {
                            if (response.data._error_code == "00") {
                                $scope.alert_success = response.data._error_messenger
                                $scope._alert_success();
                                getallnewfeed();
                                data.title = null;
                                data.content = null;
                                $scope.checkboxModel.value =false;
                            }
                            else {
                                $scope.alert = response.data._error_messenger
                                $scope._alert_error();
                            }
                            cfpLoadingBar.complete();
                        });
                    } else {
                        $scope.alert = "Title and Content can not be blank";
                        $scope._alert_error();
                        cfpLoadingBar.complete();
                    }
                }
        }


        // get data
        $scope.Getweek = function(){
            cfpLoadingBar.start();
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
                cfpLoadingBar.complete();
            });
        }


        //Auth
        $scope.reset = function (index) {
            cfpLoadingBar.start();
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
                        cfpLoadingBar.complete();
                    });
                }
            }
        }

        $scope.Changepass = function (data) {
            cfpLoadingBar.start();
            if (data == undefined) {
                $scope.alert = "Password and New Password can not be blank";
                $scope._alert_error();
                cfpLoadingBar.complete();
            }
            else {
                if (data.password && data.newpassword) {
                    rsapassword = md5.createHash(data.password);
                    rsanewpassword = md5.createHash(data.newpassword);
                    apiService.postChangePassword($scope.Auth.Email, rsapassword, rsanewpassword).then(function (response) {
                        // $timeout(function () {
                            if (response.data._error_code == "00") {
                                $scope.alert_success = response.data._error_messenger;
                                $scope._alert_success();
                                $timeout(function () {
                                    window.location.reload(true);
                                }, 1300);
                                data.password = null;
                                data.newpassword = null;
                            }
                            else {
                                $scope.alert = response.data._error_messenger;
                                $scope._alert_error();
                            }
                        // }, 700);
                        cfpLoadingBar.complete();
                    });
                }
                else {
                    $scope.alert = "Password and New Password can not be blank";
                    $scope._alert_error();
                    cfpLoadingBar.complete();
                }
            }
        }
        
        $scope.register = function (data){
            cfpLoadingBar.start();
            if (data == undefined) {
                $scope.alert = "Input can not be blank !";
                $scope._alert_error();
                cfpLoadingBar.complete();
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
                        cfpLoadingBar.complete();
                    });
                } else {
                     $scope.alert = "Input can not be blank !";
                     $scope._alert_error();
                     cfpLoadingBar.complete();
                }
            }
        }


        //ExportData
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


        
    })
    .controller('LoginCtrl', function ($rootScope, $scope, $localStorage, $timeout, md5, $http, apiService, ngDialog, cfpLoadingBar) {
        window.localStorage.clear(true);
        var json = 'http://ipv4.myexternalip.com/json';
        $http.get(json).then(function (result) {
            svip = result.data.ip;
            svip = svip.slice(0, 9);
            $scope.yourip = svip;
        }, function (e) {
            // alert("error");
        });


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
            cfpLoadingBar.start();
            if (data == undefined) {
               $scope.alert = "Username and Password can not be blank";
               $scope._alert_error();
               cfpLoadingBar.complete();
            }
            else {
                if (data.username && data.password) {
                    rsapassword = md5.createHash(data.password);
                    apiService.postLogin(data.username, rsapassword, $scope.yourip).then(function (response) {
                        // $timeout(function () {
                            $scope.result = response.data;
                            if ($scope.result._error_code == "00") {
                                if($scope.result.Connect == "OK")
                                {
                                     window.localStorage.setItem('ip', true);
                                }
                                window.localStorage.setItem('auth', JSON.stringify(response.data));
                                window.location.href = '#/home';
                            }
                            else {
                                $scope.alert = "Username or Password incorrect, Please try again";
                                $scope._alert_error();
                            }
                            cfpLoadingBar.complete();
                        // }, 700);
                    });
                }
                else {
                     $scope.alert = "Username and Password can not be blank";
                     $scope._alert_error();
                     cfpLoadingBar.complete();
                }
            }
        }

        //show alert
        $scope.forgot = function (data) {
            cfpLoadingBar.start();
            if(data == undefined){
                $scope.alert = "Username can not be blank"
                $scope._alert_error();
                cfpLoadingBar.complete();
            }else{
                if(data.username)
                {
                    apiService.postForgot(data.username).then(function (response) {
                        // $timeout(function () {
                            if (response.data._error_code == "00") {
                                $scope.alert_success = "The request send success !<br/> Please check your email for details";
                                $scope._alert_success();
                            }
                            else {
                                $scope.alert = response.data._error_messenger;
                                $scope._alert_error();
                            }
                            cfpLoadingBar.complete();
                        // }, 700);
                    });

                }else{
                    $scope.alert = "Username can not be blank"
                    $scope._alert_error();
                    cfpLoadingBar.complete();
                }
            }
        }
    })

