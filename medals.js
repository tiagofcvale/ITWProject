var vm = function () {
    console.log('ViewModel initiated...');
    var self = this;
    self.medalsApiBase = "http://192.168.160.58/Paris2024/api/medals";
    self.competitionApiBase = "http://192.168.160.58/Paris2024/api/Medals/Competition";
    self.displayName = 'Paris2024 Medals List';
    self.competitions = ko.observableArray([]);
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    self.medals = ko.observableArray([]);
    self.currentPage = ko.observable(1);
    self.pagesize = ko.observable(20);
    self.totalRecords = ko.observable(50);
    self.hasPrevious = ko.observable(false);
    self.hasNext = ko.observable(false);
    self.filteredMedals = ko.observable('');
    self.medals = ko.observableArray([]);
    self.selectedCompetition = ko.observable(null);
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
    self.favourites = ko.observableArray([]);

    self.toggleFavourite = function (id, competition) {
        const existingIndex = self.favourites().findIndex(fav => fav.id === id && fav.competition === competition);
        
        console.log("Adicionando aos favoritos por SportId:",id)
        console.log("Adicionando aos favoritos por Competition:",competition)

        if (existingIndex === -1) {
            self.favourites.push({ id: id, competition: competition });
        } else {
            self.favourites.splice(existingIndex, 1);
        }

        const currentFavourites = self.favourites();
        localStorage.setItem("fav", JSON.stringify(currentFavourites));
    };

    self.SetFavourites = function () {
        let storage;
        try {
            storage = JSON.parse(localStorage.getItem("fav")) || [];
        } catch (e) {
            storage = [];
        }
        self.favourites(storage); 
    };

    self.SetFavourites();

    self.searchQuery = ko.observable('');
    self.searchResults = ko.observableArray([]);

    self.searchMedals = function () {
        const query = self.searchQuery().trim();
        if (!query) {
            self.searchResults([]); 
            return;
        }

        const searchUri = `${self.medalsApiBase}/Search?q=${encodeURIComponent(query)}`; 
        console.log(`Searching for medals with query: ${query}`);
        ajaxHelper(searchUri, 'GET').done(function (data) {
            console.log('Search results:', data);
            self.searchResults(data); 
        }).fail(function () {
            self.searchResults([]); 
        });
    };


    self.fetchMedals = function () {
        const selectedCompetition = document.getElementById("competitionFilter").value;
        
        if (!selectedCompetition) {
            self.filteredMedals([]); 
            return;
        }
    
        const selected = JSON.parse(selectedCompetition); 
        
        const { id, name } = selected;
        
        const competitionName = encodeURIComponent(name);  
        const sportId = encodeURIComponent(id);  
    
        fetch(`${self.competitionApiBase}?sportId=${sportId}&competition=${competitionName}`)
            .then(response => response.json())
            .then(data => {
                self.filteredMedals(data);
            })
            .catch(error => console.error("Erro ao buscar medalhas:", error));
    };
    

    self.loadCompetitions = function() {
        fetch(self.medalsApiBase) 
            .then(response => response.json())
            .then(data => {
                const competitions = data.Medals.map(item => ({
                    id: item.SportId,        
                    name: item.Competition   
                }));
    
                const uniqueCompetitions = Array.from(
                    new Map(competitions.map(item => [item.id + item.name, item])).values()
                );
                uniqueCompetitions.unshift({ id: '', name: 'All' });
    
                self.competitions(uniqueCompetitions); 
                console.log("Loaded competitions:", uniqueCompetitions);
            })
            .catch(error => console.error("Error fetching competitions:", error));
    };
    
    

    self.loadMedals = function () {
        const selectedCompetition = self.selectedCompetition();
    
        if (!selectedCompetition) {
            console.error("Seleção inválida de competição:", selectedCompetition);
            self.medals([]); 
            return;
        }
    
        console.log("Carregando medalhas para a competição:", selectedCompetition);
    
        fetch(self.medalsApiBase)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erro ao carregar dados da API: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                if (!data.Medals || !Array.isArray(data.Medals)) {
                    console.error("Estrutura inesperada de resposta da API:", data);
                    self.medals([]);
                    return;
                }
    
                console.log("Medalhas recebidas:", data.Medals);
    
                let filteredMedals = data.Medals;
                if (selectedCompetition.name !== 'All') {
                    filteredMedals = data.Medals.filter(medal => {
                        const sportIdMatch = medal.SportId.trim().toUpperCase() === selectedCompetition.id.trim().toUpperCase();
    
                        const normalizedCompetition = medal.Competition.trim().toLowerCase();
                        const normalizedSelectedCompetition = selectedCompetition.name.trim().toLowerCase();
                        const competitionMatch = normalizedCompetition.includes(normalizedSelectedCompetition);
    
                        return sportIdMatch && competitionMatch;
                    });
                }
    
                self.medals(filteredMedals); 
            })
            .catch(error => {
                console.error("Erro ao carregar medalhas:", error);
                self.medals([]); 
            });
    };
    
    
    
    
    
    
    
    
    
    
    



    self.selectedCompetition.subscribe(function (newSelection) {
        console.log("Nova competição selecionada:", newSelection);
        self.loadMedals(); // Recarrega as medalhas para a nova seleção
    });
    

    //--- Page Events
    self.activate = function (id) {
        console.log('CALL: getMedals...');
        var composedUri = self.medalsApiBase + "?page=" + id + "&pageSize=" + self.pagesize(); // Alterado para usar self.medalsApiBase
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log(data);
            console.log("Id: ",id);
            hideLoading();
            self.medals(data.Medals);
            self.currentPage(data.CurrentPage);
            self.hasNext(data.HasNext);
            self.hasPrevious(data.HasPrevious);
            self.pagesize(data.PageSize);
            self.totalPages(data.TotalPages);
            self.totalRecords(data.TotalMedals);
            self.SetFavourites();
            self.loadCompetitions(); // Adicione isso para garantir que as competições sejam carregadas
            console.log("Competitions:", data.Competitions);
            console.log("Medals data:", data.Medals);
            console.log("Selected competition:", data.selectedCompetition);
            console.log("Filtered medals:", data.filteredMedals);
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
    }

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
});

let currentSortColumn = null;
let isAscending = true;

function sortTable(columnIndex) {
    const table = document.querySelector("table tbody");
    const rows = Array.from(table.rows);

    // Determina a nova ordem
    if (currentSortColumn === columnIndex) {
        isAscending = !isAscending; 
    } else {
        currentSortColumn = columnIndex;
        isAscending = true; 
    }

    // Ordena as linhas
    rows.sort((a, b) => {
        const cellA = a.cells[columnIndex].textContent.trim();
        const cellB = b.cells[columnIndex].textContent.trim();

        return isAscending
            ? cellA.localeCompare(cellB, 'pt', { sensitivity: 'base' })
            : cellB.localeCompare(cellA, 'pt', { sensitivity: 'base' });
    });

    while (table.firstChild) {
        table.removeChild(table.firstChild);
    }

    rows.forEach(row => table.appendChild(row));

    updateSortIcons(columnIndex);
}
