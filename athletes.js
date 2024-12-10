function formatValue(value, defaultMessage = "[No information]") {
    return value || defaultMessage;
}

// ViewModel KnockOut
var vm = function () {
    console.log('ViewModel initiated...');
    //---Variáveis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/API/athletes');
    self.displayName = 'Paris2024 Athletes List';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    self.athletes = ko.observableArray([]);
    self.currentPage = ko.observable(1);
    self.pagesize = ko.observable(20);
    self.totalRecords = ko.observable(50);
    self.hasPrevious = ko.observable(false);
    self.hasNext = ko.observable(false);
    self.previousPage = ko.computed(function () {
        return self.currentPage() * 1 - 1;
    }, self);
    self.nextPage = ko.computed(function () {
        return self.currentPage() * 1 + 1;
    }, self);
    self.fromRecord = ko.computed(function () {
        return self.previousPage() * self.pagesize() + 1;
    }, self);
    self.toRecord = ko.computed(function () {
        return Math.min(self.currentPage() * self.pagesize(), self.totalRecords());
    }, self);
    self.totalPages = ko.observable(0);
    self.pageArray = function () {
        var list = [];
        var size = Math.min(self.totalPages(), 9);
        var step;
        if (size < 9 || self.currentPage() === 1)
            step = 0;
        else if (self.currentPage() >= self.totalPages() - 4)
            step = self.totalPages() - 9;
        else
            step = Math.max(self.currentPage() - 5, 0);

        for (var i = 1; i <= size; i++)
            list.push(i + step);
        return list;
    };
    self.toggleFavourite = function (id) {
        if (self.favourites.indexOf(id) == -1) {
            self.favourites.push(id);
        }
        else {
            self.favourites.remove(id);
        }
        localStorage.setItem("fav", JSON.stringify(self.favourites()));
    };
    self.SetFavourites = function () {
        let storage;
        try {
            storage = JSON.parse(localStorage.getItem("fav"));
        }
        catch (e) {
            ;
        }
        if (Array.isArray(storage)) {
            self.favourites(storage);
        }
    }
    self.favourites = ko.observableArray([])

        self.searchQuery = ko.observable('');
        self.searchResults = ko.observableArray([]);

        self.searchAthletes = function () {
            const query = self.searchQuery().trim();
            if (!query) {
                self.searchResults([]); 
                return;
            }

        const searchUri = `${self.baseUri()}/Search?q=${encodeURIComponent(query)}`;
        console.log(`Searching for athletes with query: ${query}`);
        ajaxHelper(searchUri, 'GET').done(function (data) {
            console.log('Search results:', data);
            self.searchResults(data); 
        }).fail(function () {
            self.searchResults([]); 
        });
    };

    // Formatar datas de nascimento no array Athletes
    function formatDate(dateString) {
        const date = new Date(dateString);
        if (isNaN(date)) return ""; // Caso a data seja inválida
        return date.toLocaleDateString("pt-BR"); // Formato dd/mm/yyyy
    }

    //--- Page Events
    self.activate = function (id) {
        console.log('CALL: getAthletes...');
        var composedUri = self.baseUri() + "?page=" + id + "&pageSize=" + self.pagesize();
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log(data);
            hideLoading();
            // Formatar as datas de nascimento dos atletas
            const formattedAthletes = data.Athletes.map(athlete => {
                athlete.FormattedBirthDate = formatDate(athlete.BirthDate); // Adiciona o campo formatado
                return athlete;
            });
            self.athletes(formattedAthletes);
            self.currentPage(data.CurrentPage);
            self.hasNext(data.HasNext);
            self.hasPrevious(data.HasPrevious);
            self.pagesize(data.PageSize)
            self.totalPages(data.TotalPages);
            self.totalRecords(data.TotalAhletes);
            self.SetFavourites();
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

    //--- start ....
    showLoading();
    var pg = getUrlParameter('page');
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
function sortTable(columnIndex) {
    const tableHeaders = document.querySelectorAll("th.sortable");

    // Obter o nome da coluna
    const columnName = tableHeaders[columnIndex].textContent.trim().replace(" ", "");
    console.log("Coluna selecionada:", columnName);

    // Determinar a ordem
    if (currentSortColumn === columnIndex) {
        isAscending = !isAscending;
    } else {
        currentSortColumn = columnIndex;
        isAscending = true;
    }
    const order = isAscending ? "asc" : "desc";

    // Construir URL da API
    const apiUrl = `${self.baseUri()}?page=${self.currentPage()}&pagesize=${self.pagesize()}&order=${columnName}_${order}`;
    console.log("URL da API:", apiUrl);

    // Chamar a API
    fetch(apiUrl)
        .then(response => {
            console.log("Resposta da API:", response);
            if (!response.ok) {
                throw new Error(`Erro na API: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Dados recebidos:", data);
            if (data && data.Athletes) {
                updateTable(data.Athletes);
            } else {
                console.warn("Estrutura inesperada dos dados recebidos da API:", data);
            }
        })
        .catch(error => {
            console.error("Erro ao chamar a API:", error);
        });

    // Atualizar ícones
    updateSortIcons(columnIndex);
}

function updateTable(athletes) {
    const tbody = document.querySelector("table tbody");

    // Limpar tabela
    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }

    // Popular tabela com novos dados
    athletes.forEach(athlete => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td class="align-middle">${athlete.Id}</td>
            <td class="align-middle">${athlete.Name}</td>
            <td class="align-middle">${athlete.FormattedBirthDate || "[No information]"}</td>
            <td class="align-middle">${athlete.BirthPlace || "[No information]"}</td>
            <td class="align-middle">${athlete.BirthCountry || "[No information]"}</td>
            <td class="align-middle">${athlete.Sex || "[No information]"}</td>
            <td class="text-end">
                <a class="btn btn-default btn-light btn-xs" href="athleteDetails.html?id=${athlete.Id}">
                    <i class="fa fa-eye" title="Show details"></i>
                </a>
                <button class="btn btn-default btn-outline-danger btn-sm btn-favourite" 
                        id="favourite_${athlete.Id}"
                        onclick="toggleFavourite(${athlete.Id})">
                    <i class="${athlete.isFavourite ? 'fa fa-heart text-danger' : 'fa fa-heart-o'}" title="Add to favourites"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}
ko.computed(() => {
    console.log("Página atual:", self.currentPage());
    console.log("URI base:", self.baseUri());
});


   
