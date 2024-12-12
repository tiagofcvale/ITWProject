//--- ViewModel
var vm = function () {
    console.log('ViewModel initiated...');
    
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/api/medals');
    self.displayName = 'Competition Details';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    //--- Data Record
    self.medals = ko.observableArray([]);

    //--- Page Events
    self.activate = function (sportId, name) {
        console.log('CALL: getSports...');
        var composedUri = self.baseUri() + '?sportId=' + encodeURIComponent(sportId) + "&name=" + encodeURIComponent(name);
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log('Dados recebidos:', data);
            console.log('URL da API:', composedUri);
            hideLoading();
            
            self.medals(data.Medals);
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
    };

    self.removeFav = function (sportId, competition) {
        console.log("removeFav function called with SportId:", sportId, "and Name:", competition);
    
       
        const sanitizedId = sanitizeId(sportId);
        const sanitizedCompetition = sanitizeName(competition);
    
        
        const rowSelector = `#fav-${sanitizedId}-${sanitizedCompetition}`;
        console.log("Row selector:", rowSelector);
        const row = $(rowSelector);
    
        
        if (row.length) {
            row.remove();
            console.log("Removed from DOM:", rowSelector);
        } else {
            console.error("Row not found in DOM:", rowSelector);
        }
    
        
        let fav = JSON.parse(localStorage.getItem("fav") || "[]");
        console.log("Current favourites before removal:", fav);
    

        const index = fav.findIndex(
            (favItem) =>
                favItem.id === sportId &&
                favItem.competition === competition
        );
    
        
        if (index !== -1) {
            fav.splice(index, 1); 
            localStorage.setItem("fav", JSON.stringify(fav));
            console.log("Updated favourites after removal:", fav);
        } else {
            console.error("SportId and Name not found in favourites:", sportId, competition);
        }
    
        
        if (fav.length === 0) {
            $("#table-favourites").hide();
            $('#nofav').show();
        }
    };

    
    function sanitizeId(id) {
        return id.toString().replace(/[^a-zA-Z0-9]/g, "");
    }

    
    function sanitizeName(name) {
        
        if (name == null) return ''; 
        return name
            .toString() 
            .replace(/[^a-zA-Z0-9]/g, "-") 
            .replace(/'/g, "-"); 
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

    function getUrlParameter(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param); 
    }

    //--- start .....
    showLoading();
    var sportId = getUrlParameter('sportId');
    var name = getUrlParameter('name');

    if (!sportId || !name)
        console.error("Parâmetros da URL estão faltando ou inválidos.");
    else {
        self.activate(sportId, name);
    }
    console.log("VM initialized!");

$(document).ready(function () {
    var fav = JSON.parse(localStorage.fav || '[]');
    console.log(fav);

    if (fav.length > 0) {
        $("#table-favourites").show();
        $('#noadd').hide();
        $('#nofav').hide();

        var composedUri = `http://192.168.160.58/Paris2024/api/medals`;

        ajaxHelper(composedUri, 'GET').done(function (response) {
            console.log(response);

            response.Medals.forEach(function (data) {
                const isFavourite = fav.some(favItem => favItem.id === data.SportId && favItem.competition === data.Competition);

                if (isFavourite) {
                    const photo = "Images/MedalPlaceholder.png";

                    console.log("SportId =", data.SportId);
                    console.log("Sport =", data.Sport);
                    const sportId = data.SportId;
                    const competition = data.Competition;

                    const row = `<tr id="fav-${sanitizeId(sportId)}-${sanitizeName(competition)}">
                        <td class="align-middle">${data.SportId}</td>
                        <td class="align-middle">${data.Sport}</td>
                        <td class="align-middle">${data.Competition}</td>
                        <td class="align-middle">${data.MedalName}</td>
                        <td class="text-end align-middle">
                            <!--<a class="btn btn-default btn-light btn-xs" href="competitionsDetails.html?sportId=${encodeURIComponent(data.SportId)}&competition=${encodeURIComponent(data.Competition)}">
                                <i class="fa fa-eye" title="Show details"></i>
                            </a>-->
                            <a class="btn btn-default btn-sm btn-favourite" href="#" id="remove-fav-${sanitizeId(sportId)}-${sanitizeName(competition)}">
                                <i class="fa fa-heart text-danger" title="Remove Favourite"></i>
                            </a>
                        </td>
                    </tr>`;

                    $("#table-favourites").append(row);

                    $(`#remove-fav-${sanitizeId(sportId)}-${sanitizeName(competition)}`).on('click', function () {
                        removeFav(sportId, competition);
                    });
                }
            });

            if (fav.length === 0) {
                $('#nofav').show();
                $('#noadd').hide();
                $("#table-favourites").hide();
            }
        });
    } else {
        $('#nofav').show();
        $('#noadd').hide();
        $("#table-favourites").hide();
    }

    hideLoading();
});

function removeFav(id, competition) {
    console.log('Removing favourite:', { id, competition });

    var fav = JSON.parse(localStorage.fav || '[]');

    fav = fav.filter(favItem => favItem.id !== id || favItem.competition !== competition);

    localStorage.fav = JSON.stringify(fav);

    $(`#fav-${sanitizeId(id)}-${sanitizeName(competition)}`).remove();

    if (fav.length === 0) {
        $('#nofav').show();
        $('#noadd').hide();
        $("#table-favourites").hide();
    }
}}


$(document).ready(function () {
    var viewModel = new vm();
    ko.applyBindings(viewModel);
});
