//--- ViewModel
var vm = function () {
    console.log('ViewModel initiated...');
    
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/api/Competitions');
    self.displayName = 'Competition Details';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    //--- Data Record
    self.SportId = ko.observable('');
    self.Name = ko.observable('');
    self.Tag = ko.observable('');
    self.Photo = ko.observable('');
    self.SportInfo = ko.observableArray([]);
    self.Athletes = ko.observableArray([]);
    //--- Contagens
    self.AthletesCount = ko.observable(0);
    //--- Formatação da contagem
    self.formattedAthletesCount = ko.computed(function () {
        return `[${self.AthletesCount()}] Athlete(s)`;
    });

    //--- Page Events
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
            self.Photo(data.Photo || 'Images/PersonNotFound.png');  // Foto padrão se não houver
            self.Athletes(data.Athletes);
            self.SportInfo(formatValue(data.SportInfo));
            self.AthletesCount(self.Athletes().length);
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
    };

    // Função para remover o favorito
    self.removeFav = function (sportId, name) {
        console.log("removeFav function called with SportId:", sportId, "and Name:", name);
    
       
        const sanitizedId = sanitizeId(sportId);
        const sanitizedName = sanitizeName(name);
    
        
        const rowSelector = `#fav-${sanitizedId}-${sanitizedName}`;
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
                favItem.name === name
        );
    
        
        if (index !== -1) {
            fav.splice(index, 1); 
            localStorage.setItem("fav", JSON.stringify(fav)); // Atualizar o localStorage
            console.log("Updated favourites after removal:", fav);
        } else {
            console.error("SportId and Name not found in favourites:", sportId, name);
        }
    
        
        if (fav.length === 0) {
            $("#table-favourites").hide();
            $('#nofav').show();
        }
    };

    
    function sanitizeId(id) {
        return id.toString().replace(/[^a-zA-Z0-9]/g, "");  // Remove caracteres não alfanuméricos
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

    //--- Carregar favoritos ao iniciar
    $(document).ready(function () {
        var fav = JSON.parse(localStorage.fav || '[]');
        console.log(fav);

        if (fav.length > 0) {
            $("#table-favourites").show();
            $('#noadd').hide();
            $('#nofav').hide();

            // Iterando sobre os favoritos
            for (const favItem of fav) {
                const { id, name } = favItem;
                console.log(id, name);

                var composedUri = `http://192.168.160.58/Paris2024/api/Competitions?sportId=${encodeURIComponent(id)}&name=${encodeURIComponent(name)}`;

                ajaxHelper(composedUri, 'GET').done(function (data) {
                    console.log(data);
                
                    var photo = data.Photo || 'Images/PersonNotFound.png';
                
                    console.log("SportId =",data.SportId)
                    console.log("Name =",data.Name)
                    var id = data.SportId
                    var name= data.Name
                
                    // Adiciona o favorito na tabela
                    var row = `<tr id="fav-${sanitizeId(id)}-${sanitizeName(name)}">
                        <td class="align-middle">${data.SportId}</td>
                        <td class="align-middle">${data.Name}</td>
                        <td class="align-middle">${data.Tag}</td>
                        <td class="align-middle"><img style="height: 100px; width: 100px;" src="${photo}"></td>
                        <td class="text-end align-middle">
                            <a class="btn btn-default btn-light btn-xs" href="competitionsDetails.html?sportId=${encodeURIComponent(data.SportId)}&name=${encodeURIComponent(data.Name)}">
                                <i class="fa fa-eye" title="Show details"></i>
                            </a>
                            <a class="btn btn-default btn-sm btn-favourite" href="#" id="remove-fav-${sanitizeId(id)}-${sanitizeName(name)}">
                            <i class="fa fa-heart text-danger" title="Remove Favourite"></i>
                            </a>
                        </td>
                    </tr>`;
                
                    $("#table-favourites").append(row);
                
                    
                    $(`#remove-fav-${sanitizeId(id)}-${sanitizeName(name)}`).on('click', function() {
                        self.removeFav(id, data.Name);
                    });
                });

                // Evitar muitas requisições simultâneas
                sleep(50);
            }
        } else {
            $('#nofav').show();
            $('#noadd').hide();
            $("#table-favourites").hide();
        }

        hideLoading();
    });

    function sleep(milliseconds) {
        const start = Date.now();
        while (Date.now() - start < milliseconds);
    }
};

//--- Aplicar Knockout Bindings
$(document).ready(function () {
    var viewModel = new vm();
    ko.applyBindings(viewModel);
});
