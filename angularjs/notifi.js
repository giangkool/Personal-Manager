pm
    .factory('Notifi', function (ngDialog) {
        return {
            _alert_error: function (alert) {
                ngDialog.open({
                    template: '<div><h3 style="margin-bottom:15px; color:#CD1F20; display: table-cell;">Warning! <h6 style="color:#DAB053; display: table-cell; padding-left:7px">' + alert + '</h6></h3></div>',
                    plain: true,
                    showClose: false,
                });
            },
            _alert_success : function (alert_success) {
                ngDialog.open({
                    template: '<div><h3 style="margin-bottom:15px; color:#0D6F40; display: table-cell;">Success! <h6 style="color:#7BC98B; display: table-cell; padding-left:7px">' + alert_success + '</h6></h3></div>',
                    plain: true,
                    showClose: false,
                });
            },
            _alert_check : function (alert_success) {
                ngDialog.open({
                    template: '<center><h3 style="color:#1B5E20">' + alert_success + ' <i class="fa fa-smile-o" aria-hidden="true"></i></h3></center>',
                    plain: true,
                    showClose: false,
                });
            }
        }
    })
