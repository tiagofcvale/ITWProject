// FormatValue
function formatValue(value) {
    if (Array.isArray(value)) {
        return value.length > 0 ? value : []; // Retorne um array vazio em vez de string
    }
    return value ? value : "[sem informação]";
}
// ViewModel KnockOut
var vm = function () {
    console.log('ViewModel initiated...');
    //---VariÃ¡veis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/api/Sports/');
    self.displayName = 'Sport Details';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    //--- Data Record
    self.Id = ko.observable('');
    self.Name = ko.observable('');
    self.Sport_url = ko.observable('');
    self.Pictogram = ko.observable('');
    self.Athletes = ko.observableArray([]);
    self.Coaches = ko.observableArray([]);
    self.Competitions = ko.observableArray([]);
    self.Teams = ko.observableArray([]);
    self.Technical_officials = ko.observableArray([]);
    self.Venues = ko.observableArray([]);
    //--- Contagens
    self.AthletesCount = ko.observable(0);
    self.CoachesCount = ko.observable(0);
    self.CompetitionsCount = ko.observable(0);
    self.TeamsCount = ko.observable(0);
    self.TechnicalOfficialsCount = ko.observable(0);
    self.VenuesCount = ko.observable(0);
    //--- Formatação da contagem
    self.formattedAthletesCount = ko.computed(function () {
        return `[${self.AthletesCount()}] Athlete(s)`;
    });
    self.formattedCoachesCount = ko.computed(function () {
        return `[${self.CoachesCount()}] Coache(s)`;
    });
    self.formattedCompetitionsCount = ko.computed(function () {
        return `[${self.CompetitionsCount()}] Competition(s)`;
    });
    self.formattedTeamsCount = ko.computed(function () {
        return `[${self.TeamsCount()}] Team(s)`;
    });
    self.formattedTechnicalOfficialsCount = ko.computed(function () {
        return `[${self.TechnicalOfficialsCount()}] Technical Officer(s)`;
    });
    self.formattedVenuesCount = ko.computed(function () {
        return `[${self.VenuesCount()}] Local(s)`;
    });
    //--- Page Events
    self.activate = function (id) {
        console.log('CALL: getAthletes...');
        var composedUri = self.baseUri() + id;
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log(data);
            hideLoading();
            self.Id(formatValue(data.Id));
            self.Name(formatValue(data.Name));
            self.Sport_url(formatValue(data.Sport_url));
            self.Pictogram(formatValue(data.Pictogram));
            self.Athletes(formatValue(data.Athletes));
            self.Coaches(formatValue(data.Coaches))
            self.Competitions(formatValue(data.Competitions))
            self.Teams(formatValue(data.Teams))
            self.Technical_officials(formatValue(data.Technical_officials))
            self.Venues(formatValue(data.Venues))
            self.AthletesCount(self.Athletes().length);
            self.CoachesCount(self.Coaches().length);
            self.CompetitionsCount(self.Competitions().length);
            self.TeamsCount(self.Teams().length);
            self.TechnicalOfficialsCount(self.Technical_officials().length);
            self.VenuesCount(self.Venues().length);
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
