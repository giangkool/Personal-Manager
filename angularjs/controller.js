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
                    template:'<div><h3 style="margin-bottom:15px; color:#CD1F20; display: table-cell;">Warning! <h6 style="color:#DAB053; display: table-cell; padding-left:7px">'+$scope.alert+'</h6></h3></div>',
                    plain: true,
                    showClose: false,
                });
            };
        
        $scope._alert_success = function () {
                ngDialog.open({
                    template:'<div><h3 style="margin-bottom:15px; color:#0D6F40; display: table-cell;">Success! <h6 style="color:#7BC98B; display: table-cell; padding-left:7px">'+$scope.alert_success+'</h6></h3></div>',
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
            var auth_newfeed;
            var array_user = [];
            var tmp_user;
            var list_user;
            for(i =0; i<$scope.resultNewFeed.length; i++){
                if(idx == i){
                    title_newfeed = $scope.resultNewFeed[i].Title;
                    content_newfeed = $scope.resultNewFeed[i].Content;
                    auth_newfeed = $scope.resultNewFeed[i].Name;
                    list_user = $scope.resultNewFeed[i].List_user;
                }
            }
                ngDialog.open({
                    template: '<div style="padding:5px"><h4 style="color:#D4921D;">'+title_newfeed+'</h4><hr style="margin-top:10px; margin-bottom:10px"/><p>'+content_newfeed+'</p><span style="float:right; margin-top:-10px; color:#9B9C9C; font-weight:100">by <a style="color:#2DB7E9">'+auth_newfeed+'</a></span></div>',
                    plain: true,
                    showClose: false,
                });
            
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

        getpermossion();
        getrequest();
        getallnewfeed();

        CheckinService.Getall().then(function (response) {
                if (response.data) {
                    $scope.full_all = response.data;
                }
            });



        function getrequest() {
            CheckinService.GetRequest().then(function (response) {
                if (response.data.Email.length > 0) {
                    $scope.Number_forgot = response.data.Email.length;
                    $scope.Email_forgot = response.data.Email;
                }
                 else{
                         $scope.Number_forgot = 0;
                    }
            }); 

                
        }
        function getpermossion(){
            apiService.AllPermission().then(function (response) {
                    if (response.data.Email.length > 0) {
                        $scope.Number_Per = response.data.Email.length;
                        $scope.Email_Per = response.data.Email;
                    }
                    else{
                         $scope.Number_Per = 0;
                    }
                });
        }

        function getallnewfeed() {
            CheckinService.GetAllNewFeed($scope.Auth.Email).then(function (response) {
                $scope.resultNewFeed = response.data;
                $scope.NumberFeed = 0;
                $scope.All_Isread = true;
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
        $scope.allow = function(index){
            cfpLoadingBar.start();
            for (var i = 0; i < $scope.Email_Per.length; i++) {
                if (index == i) {
                    apiService.AllowPermission($scope.Email_Per[i].Email).then(function (response) {
                        if (response.data._error_code == "00") {
                            getpermossion();
                            $scope.alert_success = response.data._error_messenger;
                            $scope._alert_success();
                        }
                        else {
                            $scope.alert = response.data._error_messenger;
                            $scope._alert_error();
                        }
                        cfpLoadingBar.complete();
                    });
                }
            }
        }

        $scope.reset = function (index) {
            cfpLoadingBar.start();
            for (var i = 0; i < $scope.Email_forgot.length; i++) {
                if (index == i) {
                    rsapassword = md5.createHash("123456");
                    apiService.postReset($scope.Email_forgot[i].Email, rsapassword).then(function (response) {
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
            if($scope.checkboxModel.value == true){
                var imporfeed = "admin";
            }
            else{
                var imporfeed = "customer";
            }
            if (data == undefined) {
                $scope.alert = "Input can not be blank";
                $scope._alert_error();
                cfpLoadingBar.complete();
            }
            else {
                if (data.email && data.password && data.fullname && data.mobile) {
                    rsapassword = md5.createHash(data.password);
                    apiService.postRegister(data.email, rsapassword, data.fullname, data.mobile, imporfeed).then(function (response) {
                        if(response.data._error_code == "00"){
                            $scope.alert_success = response.data._error_messenger
                            $scope._alert_success();
                            data.email = null;
                            data.password = null;
                            data.fullname = null;
                            data.mobile = null;
                            $scope.checkboxModel.value =false;
                        }
                        else{
                             $scope.alert = response.data._error_messenger
                             $scope._alert_error();
                        }
                        cfpLoadingBar.complete();
                    });
                } else {
                     $scope.alert = "Input can not be blank";
                     $scope._alert_error();
                     cfpLoadingBar.complete();
                }
            }
        }

        $scope.Permission = function(data){
            cfpLoadingBar.start();
             if (data == undefined) {
                $scope.alert = "Input can not be blank";
                $scope._alert_error();
                cfpLoadingBar.complete();
            }
            else {
                 if (data.title && data.content && data.fromdayleave && data.todayleave) {
                     apiService.postPermission($scope.Auth.Email, data.title, data.content, data.fromdayleave, data.todayleave).then(function (response) {
                         if(response.data._error_code =="00"){
                             $scope.alert_success = response.data._error_messenger
                             $scope._alert_success();
                             data.title = null;
                             data.content = null;
                             data.fromdayleave = null;
                             data.todayleave = null;
                         } else{
                             $scope.alert = response.data._error_messenger
                             $scope._alert_error();
                        }
                         cfpLoadingBar.complete();
                     });
                 }else{
                     $scope.alert = "Input can not be blank";
                     $scope._alert_error();
                     cfpLoadingBar.complete();
                 }
            }
        }

        //ExportData
        $scope.Userexport = function () {
             alasql('SELECT * INTO XLS("'+$scope.Auth.Email+'.xls",?) FROM ?',[Userexport, $scope.list_time]);
        };

        $scope.Alluserexport = function () {
            alasql('SELECT * INTO XLS("All User.xls",?) FROM ?',[Alluserexport, $scope.full_all]);
        };

        var Alluserexport = {
        sheetid: 'Report All User',
        headers: true, 
        column: {
          style:'font-size:18px; color:#000'
        },
        columns: [
          {columnid:'EMAIL', width:'200px'},
          {columnid:'NAME', title: 'Full Name', width:'200px'},
          {columnid:'DAY', width:'100px'},
          {columnid:'CHECKIN_DAY', title: 'Check In Day', width:'150px'},
          {columnid:'CHECKIN_TIME', title: 'Check In Time', width:'150px'},
          {columnid:'CHECKOUT_TIME', title: 'Check Out Time', width:'150px'},
        ]
    };

    var Userexport = {
        sheetid: 'Report For'+$scope.Auth.Email,
        headers: true, 
        column: {
          style:'font-size:18px; color:#000'
        },
        columns: [
          {columnid:'EMAIL', width:'200px'},
          {columnid:'NAME', title: 'Full Name', width:'200px'},
          {columnid:'DAY', width:'100px'},
          {columnid:'CHECKIN_DAY', title: 'Check In Day', width:'150px'},
          {columnid:'CHECKIN_TIME', title: 'Check In Time', width:'150px'},
          {columnid:'CHECKOUT_TIME', title: 'Check Out Time', width:'150px'},
        ]
    };


        
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
                    template:'<div><h3 style="margin-bottom:15px; color:#CD1F20; display: table-cell;">Warning! <h6 style="color:#DAB053; display: table-cell; padding-left:7px">'+$scope.alert+'</h6></h3></div>',
                    plain: true,
                    showClose: false,
                });
            };
        
        $scope._alert_success = function () {
                ngDialog.open({
                    template:'<div><h3 style="margin-bottom:15px; color:#0D6F40; display: table-cell;">Success! <h6 style="color:#7BC98B; display: table-cell; padding-left:7px">'+$scope.alert_success+'</h6></h3></div>',
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
                                $scope.alert_success = "The request send success";
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

