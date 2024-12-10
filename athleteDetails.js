// FormatValue
function formatValue(value) {
    return value ? value : "[sem informação]";
}
// ViewModel KnockOut
var vm = function () {
    console.log('ViewModel initiated...');
    //---VariÃ¡veis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/api/Athletes/');
    self.displayName = 'Athletes Details';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    //--- Data Record
    self.Name = ko.observable('');
    self.NameShort = ko.observable('');
    self.NameTV = ko.observable('');
    self.Sex = ko.observable('');
    self.BirthDate = ko.observable('');
    self.BirthPlace = ko.observable('');
    self.BirthCountry = ko.observable('');
    self.Photo = ko.observable('');
    self.Function = ko.observable('');
    self.Sports = ko.observableArray([]);
    self.Competitions = ko.observableArray([]);
    self.Residence_country = ko.observable('');
    self.Occupation = ko.observable('');
    self.Lang = ko.observable('');
    self.Reason = ko.observable('');
    self.Influence = ko.observable('');
    self.Philosophy = ko.observable('');
    self.Nationality_code = ko.observable('');
    self.Country = ko.observable('');
    //--- Page Events
    self.activate = function (id) {
        console.log('CALL: getAthletes...');
        var composedUri = self.baseUri() + id;
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log(data);
            hideLoading();
            self.Name(formatValue(data.Name));
            self.NameShort(formatValue(data.NameShort));
            self.NameTV(formatValue(data.NameTV));
            self.Sex(formatValue(data.Sex));
            self.BirthDate(data.BirthDate ? new Date(data.BirthDate).toLocaleDateString() : "[sem informação]"); // Formatar data
            self.BirthPlace(formatValue(data.BirthPlace));
            self.BirthCountry(formatValue(data.BirthCountry));
            if (!data.Photo || data.Photo === null || data.Photo.trim() === '') {
                self.Photo('Images/PersonNotFound.png'); 
            } else {
                self.Photo(data.Photo); 
            }
            self.Function(formatValue(data.Function));
            self.Sports(data.Sports);
            self.Competitions(data.Competitions);
            self.Residence_country(formatValue(data.Residence_country));
            self.Occupation(formatValue(data.Occupation));
            self.Lang(formatValue(data.Lang));
            self.Reason(formatValue(data.Reason));
            self.Influence(formatValue(data.Influence));
            self.Philosophy(formatValue(data.Philosophy));
            self.Nationality_code(formatValue(data.Nationality_code));
            self.Country(formatValue(data.Country));
        });
    };

    //--- Internal functions
    function ajaxHelper(uri, method, data) {
        self.error(''); // Clear error message
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
