// FormatValue
function formatValue(value) {
    if (Array.isArray(value)) {
        return value.length ? value.join(', ') : "[Unknown]";
    }
    return value ? value : "[Unknown]";
}
function formatPhoto(value) {
    return value ? value : "Images/PersonNotFound.png";
}
// ViewModel KnockOut
var vm = function () {
    console.log('ViewModel initiated...');
    //---VariÃ¡veis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/api/Technical_Officials/');
    self.displayName = 'Technical_Officials Details';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    //--- Data Record
    self.Name = ko.observable('');
    self.Id = ko.observable('');
    self.Sex = ko.observable('');
    self.Category = ko.observable('');
    self.Function = ko.observable('');
    self.Photo = ko.observable('');
    self.Organisation = ko.observable('');
    self.Sports = ko.observableArray([]);
    self.OrganisationCode = ko.observable('');
    self.OrganisationLong = ko.observable('');
    self.BirthDate = ko.observable('');
    self.Url = ko.observable('');
    //--- Page Events
    self.activate = function (id) {
        console.log('CALL: getTechnical_officials...');
        var composedUri = self.baseUri() + id;
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log(data);
            hideLoading();
            self.Name(formatValue(data.Name));
            self.Function(formatValue(data.Function));
            self.Id(formatValue(data.Id));
            self.Category(formatValue(data.Category));
            self.Sex(formatValue(data.Sex));
            self.BirthDate(data.BirthDate ? new Date(data.BirthDate).toLocaleDateString() : "[Unknown]"); 
            self.Organisation(formatValue(data.Organisation));
            self.OrganisationCode(formatValue(data.BirthCountry));
            if (!data.Photo || data.Photo === null || data.Photo.trim() === '') {
                self.Photo('Images/PersonNotFound.png'); 
            } else {
                self.Photo(data.Photo); 
            }
            self.OrganisationLong(formatValue(data.OrganisationLong));
            console.log("OrganisationLong:",data.OrganisationLong)
            self.Url(formatValue(data.Url));
            console.log("Url:",data.Url)
            self.Sports((data.Sports || []));
            console.log("Sports:",data.Sports)
        });
    };

    //--- Internal functions
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
        $('#myModal').on('shown.bs.modal', function (e) {
            $("#myModal").modal('hide');
        })
    }

    function getUrlParameter(sParam) {
        var sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }
        }
    };

    //--- start ....
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
    console.log("document.ready!");
    ko.applyBindings(new vm());
});

$(document).ajaxComplete(function (event, xhr, options) {
    $("#myModal").modal('hide');
})
