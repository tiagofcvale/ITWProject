
function formatValue(value) {
    return value ? value : "[sem informação]";
}
var vm = function () {
    console.log('ViewModel initiated...');
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/api/Coaches/');
    self.displayName = 'Coaches Details';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    self.Name = ko.observable('');
    self.Sex = ko.observable('');
    self.BirthDate = ko.observable('');
    self.Photo = ko.observable('');
    self.Function = ko.observable('');
    self.Sports = ko.observable([]);
    self.Country = ko.observable('');
    self.Country_code = ko.observable('');


    self.activate = function (id) {
        console.log('CALL: getCoaches...');
        var composedUri = self.baseUri() + id;
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log('Data received from API:', data);
    
            self.Photo(data.Photo && data.Photo.trim() ? data.Photo : 'Images/PersonNotFound.png');
            self.Name(formatValue(data.Name));
            self.Sex(formatValue(data.Sex));
            self.BirthDate(formatValue(new Date(data.BirthDate).toLocaleDateString()));
            self.Function(formatValue(data.Function));
            self.Sports(data.Sports); 
            self.Country(formatValue(data.Country));
            self.Country_code((data.Country_code));
            console.log("Country Code:",data.Country_code)
            hideLoading();
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

    function sleep(milliseconds) {
        const start = Date.now();
        while (Date.now() - start < milliseconds);
    }

    function showLoading() {
        $("#myModal").modal('show', {
            backdrop: 'static',
            keyboard: false
        });
    }
    function hideLoading() {
        $('#myModal').on('shown.bs.modal', function (e) {
            $("#myModal").modal('hide');
        })
    }

    function getUrlParameter(sParam) {
        var sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;
        console.log("sPageURL=", sPageURL);
        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }
        }
    };

    showLoading();
    var pg = getUrlParameter('id');
    console.log(pg);
    if (pg == undefined)
        self.activate(1);
    else {
        self.activate(pg);
    }
    console.log("VM initialized!");
};

$(document).ready(function () {
    console.log("ready!");
    ko.applyBindings(new vm());
});

$(document).ajaxComplete(function (event, xhr, options) {
    $("#myModal").modal('hide');
})