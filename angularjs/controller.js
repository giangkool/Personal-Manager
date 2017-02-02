var pm = angular.module('PM.controller', ['ngRoute', 'ngStorage', 'angular-md5', 'PM.Service', 'ngDialog','ngAnimate','angular-notification-icons','ngTagsInput', 'ngCookies'])
    .filter('unsafe', function($sce) { return $sce.trustAsHtml; })
    .controller('PMCtrl',  function ($rootScope, $scope, $http, $localStorage, $timeout, $interval, $filter, CheckinService, apiService, Notifi, md5, ngDialog, cfpLoadingBar, $cookies) {
        var auth = window.localStorage.getItem('auth');
        var ip = window.localStorage.getItem('ip');
        $scope.Auth = JSON.parse(auth);
        var date = new Date();
        var checkin_day = $filter('date')(new Date(), 'dd/MM/yyyy');
        var daychangebg = $filter('date')(new Date(), 'EEEE');
        
//<-- function load when login -->
        // change background daily day
        // if(daychangebg == "Monday" || daychangebg == "Wednesday" || daychangebg == "Friday" || daychangebg == "Sunday"){
        //     document.getElementById('view').style.backgroundImage="url(../img/weekbg/img2.jpg)";
        // }
        // else{
        //     document.getElementById('view').style.backgroundImage="url(../img/weekbg/img.jpg)";
        // }

        if(!auth){
             window.location.href = '#/login';
            return;
        };

        if(ip == "true"){
            $scope.ip = true;
        };


        $scope.logout = function () {
            localStorage.clear(true);
            // window.location.reload(true);
            window.location.href = '#/login';
        }


//<-- auto load when page load -->

        date.setTime(date.getTime() + (1000));
        $cookies.put("15", auth, {
            expires: date
        });

        setTimeout(function () {
            if (!$cookies.get('15')) {
                window.location.href = '#/login';
            }
        }, 900000);

        CheckinService.postCheck($scope.Auth.Email, checkin_day).then(function (response) {
            cfpLoadingBar.start();
            if (response.data.Change_pass == "0") {
                $scope.alert = "Please change your password when you fist login";
                Notifi._alert_error($scope.alert);
            }
            if (ip == "true") {
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
            } else {
                $scope.show = true;
                $scope.myDynamicClass = 'hshow';
                cfpLoadingBar.complete();
            }
        });

        apiService.postNextpasscode().then(function(response){
            if (response.data) {
                $scope.next_passcode = response.data;
            }
        });

         CheckinService.Getall().then(function (response) {
            if (response.data) {
                $scope.work = response.data[0].list_work;
                $scope.leave = response.data[0].list_leave;
            }
        });

        getpermossion();
        getrequest();
        getallnewfeed();


// <-- function  Notification -->

        function getrequest() {
            CheckinService.GetRequest().then(function (response) {
                if (response.data.Auth.length > 0) {
                    $scope.Number_forgot = response.data.Auth.length;
                    $scope.Auth_forgot = response.data.Auth;
                }
                else {
                    $scope.Number_forgot = 0;
                }
            });
        }

          function getpermossion() {
            apiService.AllPermission().then(function (response) {
                if (response.data.Auth.length > 0) {
                    $scope.Number_Per = response.data.Auth.length;
                    $scope.Auth_Per = response.data.Auth;
                }
                else {
                    $scope.Number_Per = 0;
                }
            });
        }

        function getallnewfeed() {
            CheckinService.GetAllNewFeed($scope.Auth.Email).then(function (response) {
                $scope.resultNewFeed = response.data;
                $scope.NumberFeed = 0;
                var role = 0;
                var arr = [];
                if($scope.Auth.Role == "dev"){
                    role = 3;
                }
                if($scope.Auth.Role == "ba"){
                    role = 2;
                }

                // $scope.All_Isread = true;
                for (i = 0; i < $scope.resultNewFeed.length; i++) {
                    if ($scope.resultNewFeed[i].Role == 1 || $scope.resultNewFeed[i].Role == role || $scope.resultNewFeed[i].Auth == $scope.Auth.Email) {
                        arr.push($scope.resultNewFeed[i]);
                        if ($scope.resultNewFeed[i].Isread == "0") {
                            $scope.NumberFeed = $scope.NumberFeed + 1;
                            //  $scope.All_Isread = false;
                        }
                    }
                }
                $scope.listnewforauth = arr;
            });
        }

        $scope.Getweek = function () {
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

        $scope.checkboxModel = {
            value : false,
            value2 : true
        };

        $scope.group_user = [
            {Name:'Select an group'},
            {Name:'All User', value: 1},
            {Name:'Business Analyst', value: 2},
            {Name:'Developers', value: 3}
        ];
        $scope.selected_user = $scope.group_user[0];
        $scope.CreateNewFeed = function(data){
            cfpLoadingBar.start();
                if (data == undefined) {
                    $scope.alert = "Title and Content can not be blank";
                    Notifi._alert_error($scope.alert);
                    cfpLoadingBar.complete();
                }else{
                    if ($scope.selected_user.Name != $scope.group_user[0].Name && data.title && data.content) {
                        var content_feed =  $('#New_feed_content').val();
                        content_feed = content_feed.replace(/\r?\n/g, '<br/>');
                        less_content = content_feed;

                        if(less_content.length > 100) less_content = less_content.substring(0,100);
                        
                        CheckinService.PostNewFeed($scope.Auth.Email, data.title, less_content, content_feed, $scope.selected_user.value, $scope.selected_user.Name).then(function (response) {
                            if (response.data._error_code == "00") {
                                $scope.alert_success = response.data._error_messenger
                                Notifi._alert_success($scope.alert_success);
                                getallnewfeed();
                                data.title = null;
                                data.content = null;
                                $scope.selected_user = $scope.group_user[0];
                            }
                            else {
                                $scope.alert = response.data._error_messenger
                                Notifi._alert_error($scope.alert);
                            }
                            cfpLoadingBar.complete();
                        });
                    } else {
                        $scope.alert = "Title and Content can not be blank";
                        Notifi._alert_error($scope.alert);
                        cfpLoadingBar.complete();
                    }
                }
        }

        $scope._detail_new_feed = function(idx){
            var title_newfeed;
            var content_newfeed;
            var auth_newfeed;
            var array_user = [];
            var tmp_user;
            var list_user;
            var decrypted
            for(i =0; i<$scope.listnewforauth.length; i++){
                if(idx == i){
                    title_newfeed = $scope.listnewforauth[i].Title;
                    content_newfeed = $scope.listnewforauth[i].Content;
                    auth_newfeed = $scope.listnewforauth[i].Name;
                    list_user = $scope.listnewforauth[i].List_user;
                }
            }
                ngDialog.open({
                    template: '<div style="padding:5px; padding-top:0"><h4 style="color: #4A69A3;">'+title_newfeed+'</h4><hr style="margin-top:10px; margin-bottom:10px"/><p>'+content_newfeed+'</p><hr><span style="float:right; margin-top:-10px; color:#9B9C9C; font-weight:100; font-size:15px">by <a style="color: #4A69A3">'+auth_newfeed+'</a></span></div>',
                    plain: true,
                    showClose: true,
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

// <-- function Auth -->

        $scope.reset = function (index) {
            cfpLoadingBar.start();
            for (var i = 0; i < $scope.Auth_forgot.length; i++) {
                if (index == i) {
                    rsapassword = md5.createHash("123456");
                    apiService.postReset($scope.Auth_forgot[i].Email, rsapassword).then(function (response) {
                        if (response.data._error_code == "00") {
                            getrequest();
                            $scope.alert_success = response.data._error_messenger;
                            Notifi._alert_success($scope.alert_success);
                        }
                        else {
                            $scope.alert = response.data._error_messenger;
                            Notifi._alert_error($scope.alert);
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
                Notifi._alert_error($scope.alert);
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
                                Notifi._alert_success($scope.alert_success);
                                $timeout(function () {
                                    window.location.reload(true);
                                }, 1300);
                                data.password = null;
                                data.newpassword = null;
                            }
                            else {
                                $scope.alert = response.data._error_messenger;
                                Notifi._alert_error($scope.alert);
                            }
                        // }, 700);
                        cfpLoadingBar.complete();
                    });
                }
                else {
                    $scope.alert = "Password and New Password can not be blank";
                    Notifi._alert_error($scope.alert);
                    cfpLoadingBar.complete();
                }
            }
        }
        
        $scope.role_user = [
            {Name:'Select an role'},
            {Name:'Administrator', Value: 1},
            {Name:'Business Analyst', Value: 2},
            {Name:'Developers', Value: 3}
        ];
        $scope.selected_role = $scope.role_user[0];
        $scope.register = function (data){
            cfpLoadingBar.start();
            // if($scope.checkboxModel.value == true){
            //     var imporfeed = "admin";
            // }
            // else{
            //     var imporfeed = "customer";
            // }
            if (data == undefined) {
                $scope.alert = "Input can not be blank";
                Notifi._alert_error($scope.alert);
                cfpLoadingBar.complete();
            }
            else {
                if ($scope.selected_role.Name != $scope.role_user[0].Name && data.email && data.password && data.fullname && data.mobile) {
                    rsapassword = md5.createHash(data.password);
                    apiService.postRegister(data.email, rsapassword, data.fullname, data.mobile, $scope.selected_role.Name, $scope.selected_role.Value, $scope.next_passcode).then(function (response) {
                        if(response.data._error_code == "00"){
                            $scope.alert_success = response.data._error_messenger
                            Notifi._alert_success($scope.alert_success);
                            data.email = null;
                            data.password = null;
                            data.fullname = null;
                            data.mobile = null;
                            $scope.selected_role = $scope.role_user[0];
                        }
                        else{
                             $scope.alert = response.data._error_messenger
                             Notifi._alert_error($scope.alert);
                        }
                        cfpLoadingBar.complete();
                    });
                } else {
                     $scope.alert = "Input can not be blank";
                     Notifi._alert_error($scope.alert);
                     cfpLoadingBar.complete();
                }
            }
        }

        $scope.GetListUser = function(){
            apiService.GetListUser().then(function(response){
                if(response.data)
                {
                    $scope.ListUser = response.data;
                }
            });
        }

        $scope.selected_update_role = $scope.role_user[0];
        $scope.UpdateProfile = function (idx) {
            $scope.edit = true;
            for (i = 0; i < $scope.ListUser.length; i++) {
                if (idx == i) {
                    $scope.profile_detail = $scope.ListUser[i];
                }
            }
            $scope.edit_profile = function (data) {
                ngDialog.openConfirm({
                    template:
                    '<div class="ngdialog-message">' +
                    '  <h3 class="confirmation-title">Are you sure update user ?</h3><br/>' +
                    '    <div class="ngdialog-buttons">' +
                    '      <button type="button" class="ngdialog-button green darken-4" style="color:#fff" ng-click="confirm(confirmValue)">Okay</button>' +
                    '      <button type="button" class="ngdialog-button grey darken-4" style="color:#fff" ng-click="closeThisDialog()">Cancel</button>' +
                    '    </div>' +
                    '</div>',
                    plain: true,
                    showClose: false,
                }).then(function (confirm) {

                    cfpLoadingBar.start();
                    var new_role_name;
                    var new_role_value;
                    var new_name;
                    var new_email;
                    var new_mobile;

                    if ($scope.selected_update_role.Name != $scope.role_user[0].Name) {
                        new_role_name = $scope.selected_update_role.Name;
                        new_role_value = $scope.selected_update_role.Value;
                    } else {
                        for (i = 0; i < $scope.role_user.length; i++) {
                            if ($scope.profile_detail.Role_name == $scope.role_user[i].Name) {
                                new_role_name = $scope.role_user[i].Name;
                                new_role_value = $scope.role_user[i].Value;
                            }
                        }
                    }
                    if (data == undefined) {
                        apiService.PostUpdateProfile($scope.profile_detail.Passcode, $scope.profile_detail.Name, $scope.profile_detail.Email, $scope.profile_detail.Mobile, new_role_name, new_role_value).then(function (response) {
                            if (response.data._error_code == "00") {
                                $scope.alert_success = response.data._error_messenger
                                Notifi._alert_success($scope.alert_success);
                                $scope.GetListUser();
                                 $scope.selected_update_role = $scope.role_user[0];
                            }
                            else {
                                $scope.alert = response.data._error_messenger
                                Notifi._alert_error($scope.alert);
                            }
                            cfpLoadingBar.complete();
                        });
                    } else {
                        if (data.name != undefined) {
                            new_name = data.name
                        } else {
                            new_name = $scope.profile_detail.Name;
                        }

                        if (data.email != undefined) {
                            new_email = data.email;
                        } else {
                            new_email = $scope.profile_detail.Email;
                        }

                        if (data.mobile != undefined) {
                            new_mobile = data.mobile
                        } else {
                            new_mobile = $scope.profile_detail.Mobile;
                        }

                        apiService.PostUpdateProfile($scope.profile_detail.Passcode, new_name, new_email, new_mobile, new_role_name, new_role_value).then(function (response) {
                            if (response.data._error_code == "00") {
                                $scope.alert_success = response.data._error_messenger
                                Notifi._alert_success($scope.alert_success);
                                $scope.GetListUser();
                                $scope.selected_update_role = $scope.role_user[0];
                            }
                            else {
                                $scope.alert = response.data._error_messenger
                                Notifi._alert_error($scope.alert);
                            }
                            cfpLoadingBar.complete();
                        });
                    }
                }, function (reject) {
                });
            };
        }

        $scope.SendEmail = function(idx){
            $scope.sendmail = true;
            for (i = 0; i < $scope.ListUser.length; i++) {
                if (idx == i) {
                    $scope.profile_detail = $scope.ListUser[i];
                }
            }
            $scope.send_email = function (data) {
                cfpLoadingBar.start();
                if (data == undefined) {
                    $scope.alert = "Input can not be blank";
                    Notifi._alert_error($scope.alert);
                    cfpLoadingBar.complete();
                }
                else {
                    if (data.title && data.content) {
                        var content_email = $('#Email_content').val();
                        content_email = content_email.replace(/\r?\n/g, '<br/>');
                        less_content = content_email;
                        if (less_content.length > 100) less_content = less_content.substring(0, 100);

                        apiService.SendMailById($scope.Auth.Email, $scope.profile_detail.Email, $scope.profile_detail.Name, data.title, less_content, content_email).then(function (response) {
                            if (response.data._error_code == "00") {
                                $scope.alert_success = response.data._error_messenger
                                Notifi._alert_success($scope.alert_success);
                                getallnewfeed();
                                data.title = null;
                                data.content = null;
                            }
                            else {
                                $scope.alert = response.data._error_messenger
                                Notifi._alert_error($scope.alert);
                            }
                            cfpLoadingBar.complete();
                        });
                    } else {
                        $scope.alert = "Title and Content can not be blank";
                        Notifi._alert_error($scope.alert);
                        cfpLoadingBar.complete();
                    }
                }
            }
        }

        $scope.CancelSend = function(){
            $scope.GetListUser();
            $scope.sendmail = false;
        }

        $scope.DeleteUser = function (idx) {
            ngDialog.openConfirm({
                    template:
                    '<div class="ngdialog-message">' +
                    '  <h3 class="confirmation-title">Are you sure delete user ?</h3><br/>' +
                    '    <div class="ngdialog-buttons" style="padding:0">' +
                    '      <button type="button" class="ngdialog-button green darken-4" style="color:#fff" ng-click="confirm(confirmValue)">Okay</button>' +
                    '      <button type="button" class="ngdialog-button grey darken-4" style="color:#fff" ng-click="closeThisDialog()">Cancel</button>' +
                    '    </div>' +
                    '</div>',
                    plain: true,
                    showClose: false,
                }).then(function (confirm) {
                    
                    cfpLoadingBar.start();
                    for (i = 0; i < $scope.ListUser.length; i++) {
                        if (idx == i) {
                            $scope.profile_detail = $scope.ListUser[i];
                        }
                    }
                    apiService.PostDelete($scope.profile_detail.Passcode).then(function (response) {
                        if (response.data._error_code == "00") {
                            $scope.alert_success = response.data._error_messenger
                            Notifi._alert_success($scope.alert_success);
                            $scope.GetListUser();
                        } else {
                            $scope.alert = response.data._error_messenger
                            Notifi._alert_error($scope.alert);
                        }
                        cfpLoadingBar.complete();
                    });

                }, function(reject) {
                });


               
        }

        $scope.CancelUpdate = function(){
            $scope.GetListUser();
            $scope.edit = false;
        }
        

//<-- function check in & check out -->
        $scope.checkin = function () {
            cfpLoadingBar.start();
            CheckinService.postCheckin($scope.Auth.Email, checkin_day , DAY, DDAY).then(function (response) {
                    // if (response.data._error_code == "00") {
                    //     $scope.alert_success ="Have a nice day <br/>"+'<span style="color:#FEA82B">'+$scope.Auth.Fullname+'</span>';
                    //     Notifi._alert_check($scope.alert_success);
                    // }
                    // else{
                    //     $scope.alert = response.data._error_messenger;
                    //     Notifi._alert_error($scope.alert);
                    // }
                    cfpLoadingBar.complete();
                });
            setTimeout(function () {
                $scope.show = true;
                window.location.reload(true)
            }, 500);

        }

        $scope.checkout = function () {
            cfpLoadingBar.start();
            CheckinService.postCheckout($scope.Auth.Email, checkin_day).then(function (response){
            //    if (response.data._error_code == "00") {
            //             $scope.myDynamicClass = 'hshow';
            //             $scope.alert_success ="Good bye see you again <br/>"+'<span style="color:#FEA82B">'+$scope.Auth.Fullname+'</span>';
            //             Notifi._alert_check($scope.alert_success);
            //         }
            //         else{
            //             $scope.alert = response.data._error_messenger;
            //             Notifi._alert_error($scope.alert);
            //         }
                    cfpLoadingBar.complete();
           });
        }



//<-- function Request to server -->      

        $scope.request_form = [
            {Name:'Select an Request'},
            {Name:'Request for Leave', Value: 1},
            {Name:'Request for CheckIn', Value: 2}
        ];
        // Initialization
        jQuery('#datetimepicker').datetimepicker({
            timepicker:false,
            format:'d/m/Y'
        });
        jQuery('#datetimepicker2').datetimepicker({
            timepicker:false,
            format:'d/m/Y'
        });
        $scope.selected_requestForm = $scope.request_form[0];
        $scope.Permission = function(data){
           var fromdayleave = $('#datetimepicker').val();
           var todayleave = $('#datetimepicker2').val();
            cfpLoadingBar.start();
             if (data == undefined) {
                $scope.alert = "Input can not be blank";
                Notifi._alert_error($scope.alert);
                cfpLoadingBar.complete();
            }
            else {
                 if ($scope.selected_requestForm.Name != $scope.request_form[0].Name && data.content && fromdayleave && todayleave) {
                     apiService.postPermission($scope.Auth.Email, $scope.selected_requestForm.Name, $scope.selected_requestForm.Value, data.content, fromdayleave, todayleave).then(function (response) {
                         if(response.data._error_code =="00"){
                             $scope.alert_success = response.data._error_messenger
                             Notifi._alert_success($scope.alert_success);
                             $scope.selected_requestForm = $scope.request_form[0];
                             data.content = null;
                         } else{
                             $scope.alert = response.data._error_messenger
                             Notifi._alert_error($scope.alert);
                        }
                         cfpLoadingBar.complete();
                     });
                 }else{
                     $scope.alert = "Input can not be blank";
                     Notifi._alert_error($scope.alert);
                     cfpLoadingBar.complete();
                 }
            }
        }

        $scope._detail_per = function(idx){
             for (var i = 0; i < $scope.Auth_Per.length; i++) {
                 if(idx == i){
                      ngDialog.open({
                        template: '<div style="padding:5px"><h4 style="color:#D4921D;">'+$scope.Auth_Per[i].Title+'</h4><hr style="margin-top:10px; margin-bottom:10px"/><p>'+$scope.Auth_Per[i].Reasons_For_Leave+'</p><hr/><h6>Ngày Cần Duyệt : <b style="font-weight:600">'+$scope.Auth_Per[i].Leave_day+' - '+$scope.Auth_Per[i].To_Day_Leave+'</b></h6><hr/><h6>Tổng số ngày: '+$scope.Auth_Per[i].Total_Day_leave+'</h6></div>',
                        plain: true,
                        showClose: true,
                    });
                 }
             }
        }

        $scope.allowRequest = function(index){
            cfpLoadingBar.start();
            for (var i = 0; i < $scope.Auth_Per.length; i++) {
                if (index == i) {
                    apiService.AllowPermission($scope.Auth_Per[i].Email, $scope.Auth_Per[i]._id, $scope.Auth_Per[i].Leave_day).then(function (response) {
                        if (response.data._error_code == "00") {
                            getpermossion();
                            $scope.alert_success = response.data._error_messenger;
                            Notifi._alert_success($scope.alert_success);
                        }
                        else {
                            $scope.alert = response.data._error_messenger;
                            Notifi._alert_error($scope.alert);
                        }
                        cfpLoadingBar.complete();
                    });
                }
            }
        }


//<-- System Function -->

        // get daytime
        
        var DAY = $filter('date')(new Date(), 'yyyyMMdd');
        var DDAY = $filter('date')(new Date(), 'EEEE');
        // var Hour = $filter('date')(new Date(), 'HHmmss');
        // if(Hour < 120000){
        //     $scope.sayhello = "Good morning";
        // }
        // if( 180000 > Hour && Hour > 120000 ){
        //      $scope.sayhello = "Good afternoon";
        // }
        // if(Hour > 180000){
        //     $scope.sayhello = "Good night";
        // }

        // create clock
        var tick = function () {
            $scope.clock = Date.now();
        }
        tick();
        $interval(tick, 1000);

        // check email in array
        Array.prototype.contains = function ( needle ) {
        for (i in this) {
            if (this[i].Email == needle) return true;
        }
        return false;
        }

        //ExportData to excel
        $scope.Userexport = function () {
             alasql('SELECT * INTO XLS("'+$scope.Auth.Email+'.xls",?) FROM ?',[Userexport, $scope.full_list_time]);
        };

        $scope.Export_work = function () {
            alasql('SELECT * INTO XLS("Report Work.xls",?) FROM ?',[report_work, $scope.work]);
        };

        $scope.Export_leave = function () {
            alasql('SELECT * INTO XLS("Report Leave.xls",?) FROM ?',[report_leave, $scope.leave]);
        };

        var report_work = {
            sheetid: 'Report Work All User',
            headers: true,
            column: {
                style: 'font-size:18px; color:#000'
            },
            columns: [
                { columnid: 'EMAIL', width: '200px' },
                { columnid: 'NAME', title: 'Full Name', width: '200px' },
                { columnid: 'DAY', width: '100px' },
                { columnid: 'CHECKIN_DAY', title: 'Check In Day', width: '150px' },
                { columnid: 'CHECKIN_TIME', title: 'Check In Time', width: '150px' },
                { columnid: 'CHECKOUT_TIME', title: 'Check Out Time', width: '150px' }
            ]
        };

        var report_leave = {
            sheetid: 'Report Leave All User',
            headers: true,
            column: {
                style: 'font-size:18px; color:#000'
            },
            columns: [
                { columnid: 'EMAIL', width: '200px' },
                { columnid: 'NAME', title: 'Full Name', width: '200px' },
                { columnid: 'REASON', width: '250px'},
                { columnid: 'FROM_DAY', title: 'From Day Leave', width: '150px' },
                { columnid: 'TO_DAY', title: 'To Day Leave', width: '150px' },
                { columnid: 'TOTAL', title: 'Total Day', width: '150px' }
            ]
        };

        var Userexport = {
            sheetid: 'Report For' + $scope.Auth.Email,
            headers: true,
            column: {
                style: 'font-size:18px; color:#000'
            },
            columns: [
                { columnid: 'EMAIL', width: '200px' },
                { columnid: 'NAME', title: 'Full Name', width: '200px' },
                { columnid: 'DAY', width: '100px' },
                { columnid: 'CHECKIN_DAY', title: 'Check In Day', width: '150px' },
                { columnid: 'CHECKIN_TIME', title: 'Check In Time', width: '150px' },
                { columnid: 'CHECKOUT_TIME', title: 'Check Out Time', width: '150px' }
            ]
        };
    });
  