function formatValue(value) {
    return value ? value : "[sem informação]";
}
// ViewModel KnockOut
var vm = function () {
    console.log('ViewModel initiated...');
    //---VariÃ¡veis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/api/Medals/Competition');
    self.displayName = 'Competition Details';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    //--- Data Record
    self.Competitions = ko.observableArray([]);
    //--- Contagens
    self.activate = function (sportId, competiton) {
        console.log('CALL: getSports...');
        var composedUri = self.baseUri() + '?sportId=' + encodeURIComponent(sportId) + "&competiton=" + encodeURIComponent(competiton);
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log('Dados recebidos:', data);
            console.log('URL da API:', composedUri);
            hideLoading();
            console.log("Data:", data)
            // Preenchendo os observáveis com os dados recebidos
            self.Competitions(data);
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

    function getUrlParameter(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param); // Retorna o valor do parâmetro ou null se não encontrado
    }

    //--- start ....
    showLoading();
    var sportId = getUrlParameter('sportId');
    var competiton = getUrlParameter('competiton');

    if (!sportId || !competiton)
        console.error("Parâmetros da URL estão faltando ou inválidos.");
    else {
        self.activate(sportId,competiton);
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
