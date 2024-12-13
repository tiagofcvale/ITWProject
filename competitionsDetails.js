function formatValue(value) {
    return value ? value : "[sem informação]";
}
var vm = function () {
    console.log('ViewModel initiated...');
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/api/Competitions');
    self.displayName = 'Competition Details';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    self.SportId = ko.observable('');
    self.Name = ko.observable('');
    self.Tag = ko.observable('');
    self.Photo = ko.observable('');
    self.SportInfo = ko.observableArray([]);
    self.Athletes = ko.observableArray([]);
    self.AthletesCount = ko.observable(0);
    self.formattedAthletesCount = ko.computed(function () {
        return `[${self.AthletesCount()}] Athlete(s)`;
    });
    self.activate = function (sportId, name) {
        console.log('CALL: getSports...');
        var composedUri = self.baseUri() + '?sportId=' + encodeURIComponent(sportId) + "&name=" + encodeURIComponent(name);
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log('Dados recebidos:', data);
            console.log('URL da API:', composedUri);
            hideLoading();
            self.SportId(formatValue(data.SportId));
            self.Name(formatValue(data.Name));
            self.Tag(formatValue(data.Tag));
            if (!data.Photo || data.Photo === null || data.Photo.trim() === '') {
                self.Photo('Images/PersonNotFound.png'); 
            } else {
                self.Photo(data.Photo); 
            }
            self.Athletes(data.Athletes);
            self.SportInfo(formatValue(data.SportInfo));
            self.AthletesCount(self.Athletes().length);
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
        $('#myModal').on('shown.bs.modal', function (e) {
            $("#myModal").modal('hide');
        })
    }

    function getUrlParameter(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param); 
    }

    showLoading();
    var sportId = getUrlParameter('sportId');
    var name = getUrlParameter('name');

    if (!sportId || !name)
        console.error("Parâmetros da URL estão faltando ou inválidos.");
    else {
        self.activate(sportId,name);
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
