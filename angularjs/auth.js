pm
  .controller('LoginCtrl', function ($rootScope, $scope, $localStorage, $timeout, md5, $http, apiService, ngDialog, cfpLoadingBar, Notifi) {
        window.localStorage.clear(true);
      
        var json = 'https://api.ipify.org?format=json';
        $http.get(json).then(function (result) {
            svip = result.data.ip;
            svip = svip.slice(0, 9);
            $scope.yourip = svip;
        }, function (e) {
        });

// <-- function login -->
        $scope.login = function (data) {
            cfpLoadingBar.start();
            if (data == undefined) {
                $scope.alert = "Username and Password can not be blank";
                Notifi._alert_error($scope.alert);
                cfpLoadingBar.complete();
            }
            else {
                if (data.username && data.password) {
                    rsapassword = md5.createHash(data.password);
                    apiService.postLogin(data.username, rsapassword, $scope.yourip).then(function (response) {
                        $scope.result = response.data;
                        if ($scope.result._error_code == "00") {
                            if ($scope.result.Connect == "OK") {
                                window.localStorage.setItem('ip', true);
                            }
                            window.localStorage.setItem('auth', JSON.stringify(response.data));
                            window.location.href = '#/home';
                            window.location.reload(true);
                        }
                        else {
                            $scope.alert = "Username or Password incorrect";
                            Notifi._alert_error($scope.alert);
                        }
                        cfpLoadingBar.complete();
                    });
                }
                else {
                    $scope.alert = "Username and Password can not be blank";
                    Notifi._alert_error($scope.alert);
                    cfpLoadingBar.complete();
                }
            }
        }

// <-- function forgot password -->

        $scope.forgot = function (data) {
            cfpLoadingBar.start();
            if (data == undefined) {
                $scope.alert = "Username can not be blank"
                Notifi._alert_error($scope.alert);
                cfpLoadingBar.complete();
            } else {
                if (data.username) {
                    apiService.postForgot(data.username).then(function (response) {
                        if (response.data._error_code == "00") {
                            $scope.alert_success = "The request send success";
                            Notifi._alert_success($scope.alert_success);
                        }
                        else {
                            $scope.alert = response.data._error_messenger;
                            Notifi._alert_error($scope.alert);
                        }
                        cfpLoadingBar.complete();
                    });
                } else {
                    $scope.alert = "Username can not be blank"
                    Notifi._alert_error($scope.alert);
                    cfpLoadingBar.complete();
                }
            }
        }
    });
