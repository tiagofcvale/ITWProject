// FormatValue
function formatValue(value) {
    if (Array.isArray(value)) {
        return value.length ? value.join(', ') : "[Unknown]";
    }
    return value ? value : "[Unknown]";
}

// ViewModel KnockOut
var vm = function () {
    console.log('ViewModel initiated...');

    //--- Variáveis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/api/Teams/');
    self.displayName = 'Teams Details';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');

    //--- Data Record
    self.Id = ko.observable('');
    self.Name = ko.observable('');
    self.Sex = ko.observable('');
    self.Num_athletes = ko.observable('');
    self.Num_coaches = ko.observable('');
    self.Athletes = ko.observableArray([]);
    self.NOC = ko.observable('');
    self.Coaches = ko.observableArray([]);
    self.Sport = ko.observable({});
    self.Medals = ko.observableArray([]);

    self.formatValue = function(value) {
        if (Array.isArray(value)) {
            return value.length ? value.join(', ') : "[Unknown]";
        } else if (typeof value === 'object' && value !== null) {
            return JSON.stringify(value);
        }
        return value ? value : "[Unknown]";
    };

    //--- Page Events
    self.activate = function (id) {
        console.log('CALL: getTeams...');
        var composedUri = self.baseUri() + id;
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log("Dados recebidos da API:", data);
            hideLoading();
            
            if (!data) {
                self.error("Nenhum dado encontrado para o ID fornecido.");
                return;
            }

           
            self.Id(formatValue(data.Id));
            self.Name(formatValue(data.Name));
            self.Sex(formatValue(data.Sex));
            self.Num_athletes(formatValue(data.Num_athletes));
            self.Num_coaches(formatValue(data.Num_coaches));

            self.Athletes(data.Athletes && data.Athletes.length ? data.Athletes : []);
            self.NOC(data.NOC ? data.NOC : {});
            self.Coaches(data.Coaches && data.Coaches.length ? data.Coaches : []);
            self.Sport(data.Sport ? data.Sport : {});
            self.Medals(data.Medals && data.Medals.length ? data.Medals : []);
        }).fail(function (error) {
            hideLoading();
            console.error("Erro ao buscar dados:", error);
            self.error("Erro ao buscar dados: " + error.responseText || error.statusText);
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
        });
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

    //--- start .....
    showLoading();
    var pg = getUrlParameter('id');
    console.log(pg);
    if (pg === undefined)
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
});