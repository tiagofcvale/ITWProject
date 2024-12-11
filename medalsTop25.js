// ViewModel KnockOut
var vm = function () {
    console.log('ViewModel initiated...');
    var self = this;

    //--- Variáveis locais
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/api/Medals/Top25');
    self.displayName = 'Top 25 Athletes';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    
    self.Athletes = ko.observableArray([]);

    self.activate = function () {
        console.log('CALL: getTop25Athletes...');
        var composedUri = self.baseUri();
        ajaxHelper(composedUri, 'GET')
            .done(function (data) {
                console.log('Dados recebidos:', data);
                hideLoading();
                self.Athletes(data); 
            });
    };

    function ajaxHelper(uri, method, data) {
        self.error(''); 
        return $.ajax({
            type: method,
            url: uri,
            dataType: 'json',
            contentType: 'application/json',
            data: data ? JSON.stringify(data) : null,
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("AJAX Call[" + uri + "] Fail...");
                hideLoading();
                self.error(errorThrown);
            }
        });
    }

    function showLoading() {
        $('#myModal').modal('show', {
            backdrop: 'static',
            keyboard: false
        });
    }

    function hideLoading() {
        $('#myModal').modal('hide');
    }

    showLoading();
    self.activate();
    console.log("ViewModel initialized!");
};

$(document).ready(function () {
    console.log("document.ready!");
    ko.applyBindings(new vm());
});

$(document).ajaxComplete(function () {
    $("#myModal").modal('hide');
});
