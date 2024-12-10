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
let currentSortColumn = -1;
let isAscending = true;

// Função para ordenar a tabela
function sortTable(columnIndex) {
    const columnMap = {
        1: "Name",
        2: "BirthDate",
        3: "BirthPlace",
        4: "BirthCountry",
        5: "Sex"
    };
    const columnName = columnMap[columnIndex];
    console.log("Coluna selecionada:", columnName);

    // Determinar a ordem (ascendente ou descendente)
    if (currentSortColumn === columnIndex) {
        isAscending = !isAscending; // Alterna entre ascendente e descendente
    } else {
        currentSortColumn = columnIndex;
        isAscending = true; // Reseta para ascendente
    }
    const order = isAscending ? "asc" : "desc";

    // Construir URL da API com o parâmetro de ordenação
    const apiUrl = `${vm.baseUri()}?page=${vm.currentPage()}&pagesize=${vm.pagesize()}&order=${columnName}_${order}`;
    console.log("URL da API:", apiUrl);

    // Fazer chamada à API e atualizar a tabela
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro na API: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Dados recebidos:", data);
            if (data && data.Athletes) {
                vm.athletes(data.Athletes); // Atualizar o observable do Knockout.js
            }
            updateSortIcons(columnIndex); // Atualizar ícones de ordenação
        })
        .catch(error => {
            console.error("Erro ao chamar a API:", error);
        });
}

// Função para atualizar os ícones de ordenação


$(document).ready(function () {
    const apiUrl = 'http://192.168.160.58/Paris2024/API/Athletes';

    // Função para carregar os atletas
    function loadAthletes(page = 1, pageSize = 10, order = "Name_asc") {
        const url = `${apiUrl}?page=${page}&pagesize=${pageSize}&order=${order}`;
        ajaxHelper(url, 'GET').done(function (data) {
            $("#athletes-body").empty();
            data.Records.forEach(athlete => {
                const id = formatValue(athlete.Id, "[sem informação]");
                const name = formatValue(athlete.Name, "[sem informação]");
                const sex = formatValue(athlete.Sex, "[sem informação]");
                const photo = athlete.Photo ? athlete.Photo : 'Images/PersonNotFound.png';

                $("#athletes-body").append(
                    `<tr>
                        <td class="align-middle">${id}</td>
                        <td class="align-middle">${name}</td>
                        <td class="align-middle">${sex}</td>
                        <td class="align-middle"><img style="height: 100px; width: 100px;" src="${photo}"></td>
                        <td class="text-end align-middle">
                            <a class="btn btn-default btn-light btn-xs" href="athleteDetails.html?id=${id}">
                                <i class="fa fa-eye" title="Show details"></i>
                            </a>
                            <a class="btn btn-default btn-sm btn-favourite" onclick="addFavAthlete(${id})"><i class="fa fa-heart text-danger" title="Add to favourites"></i></a>
                        </td>
                    </tr>`
                );
            });
        });
    }

    // Função para adicionar um atleta aos favoritos
    function addFavAthlete(id) {
        let favAthletes = JSON.parse(localStorage.getItem('favAthletes')) || [];
        if (!favAthletes.includes(id)) {
            favAthletes.push(id);
            localStorage.setItem('favAthletes', JSON.stringify(favAthletes));
        }
    }

    // Carregar os atletas ao carregar a página
    loadAthletes();
});

function ajaxHelper(uri, method, data) {
    return $.ajax({
        type: method,
        url: uri,
        dataType: 'json',
        contentType: 'application/json',
        data: data ? JSON.stringify(data) : null,
        error: function (jqXHR, textStatus, errorThrown) {
            console.error('Error making AJAX request:', textStatus, errorThrown);
        }
    });
}
document.getElementById('toggleView').addEventListener('click', function() {
            const table = document.querySelector('table');
            const cards = document.getElementById('athletesCards');

            if (cards.classList.contains('d-none')) {
                cards.classList.remove('d-none');
                table.classList.add('d-none');
                this.textContent = 'Show Table';
            } else {
                cards.classList.add('d-none');
                table.classList.remove('d-none');
                this.textContent = 'Show Grid';
            }
        });

        // Add dynamic athlete cards (example)
        const athletes = [
            { Id: 1, Name: 'Athlete 1', FormattedBirthDate: '1990-01-01', BirthPlace: 'Place 1', BirthCountry: 'Country 1', Sex: 'M' },
            { Id: 2, Name: 'Athlete 2', FormattedBirthDate: '1992-05-12', BirthPlace: 'Place 2', BirthCountry: 'Country 2', Sex: 'F' },
            // Add more athletes here...
        ];

        function renderAthletes() {
            const cardsContainer = document.getElementById('athletesCards');
            cardsContainer.innerHTML = ''; // Clear existing cards

            athletes.forEach(athlete => {
                const card = document.createElement('div');
                card.classList.add('col');

                card.innerHTML = `
                    <div class="card">
                        <img src="images/athlete_placeholder.jpg" class="card-img-top" alt="${athlete.Name}">
                        <div class="card-body">
                            <h5 class="card-title">${athlete.Name}</h5>
                            <p class="card-text">
                                <strong>Birth Date:</strong> ${athlete.FormattedBirthDate}<br />
                                <strong>Birth Place:</strong> ${athlete.BirthPlace}<br />
                                <strong>Country:</strong> ${athlete.BirthCountry}<br />
                                <strong>Sex:</strong> ${athlete.Sex}
                            </p>
                            <a href="athleteDetails.html?id=${athlete.Id}" class="btn btn-primary">View Details</a>
                        </div>
                    </div>
                `;

                cardsContainer.appendChild(card);
            });
        }

        // Call the function to render the athletes
        renderAthletes();