// ViewModel KnockOut
var vm = function () {
    console.log('ViewModel initiated...');
    //---Variáveis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/API/teams');
    self.displayName = 'Paris2024 Teams List';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    self.teams = ko.observableArray([]);
    self.currentPage = ko.observable(1);
    self.pagesize = ko.observable(20);
    self.totalRecords = ko.observable(50);
    self.hasPrevious = ko.observable(false);
    self.hasNext = ko.observable(false);
    self.selectedSport = ko.observable(''); 
    self.sports = ko.observableArray([]);

    self.filterBySport = function () {
        const sport = self.selectedSport();
        console.log('Esporte selecionado:', sport);  // Adicionado para depuração
    
        if (!sport) {
            // Se nenhum esporte for selecionado, exibe todos os times
            self.activate(self.currentPage());  // Ativa a paginação corretamente
        } else {
            console.log(`Filtrando times por esporte: ${sport}`);
            
            // Filtra os times que têm o código do esporte selecionado
            const filteredTeams = self.teams().filter(team => {
                console.log('Sport_Codes da equipa:', team.Sport_Codes); // Verifica a estrutura de dados
                if (Array.isArray(team.Sport_Codes)) {
                    // Se Sport_Codes for um array, verifica se o código do esporte está presente
                    return team.Sport_Codes.includes(sport);
                } else if (typeof team.Sport_Codes === 'string') {
                    // Se Sport_Codes for uma string, compara diretamente o código
                    return team.Sport_Codes === sport;
                }
                return false; // Se Sport_Codes não for nem string nem array
            });
            console.log('Times filtrados:', filteredTeams); // Verifica o resultado do filtro
            self.teams(filteredTeams);
            
            console.log('Times filtrados:', filteredTeams);  // Adicionado para depuração
    
            self.teams(filteredTeams);  // Atualiza os times filtrados
            self.currentPage(1); // Reinicia para a primeira página
            self.hasNext(false); // Desativa a navegação para a próxima página
            self.hasPrevious(false); // Desativa a navegação para a página anterior
            self.totalPages(1); // Apenas uma página de resultados
            self.totalRecords(filteredTeams.length);  // Atualiza o total de resultados
        }
    };
    

    self.loadSports = function () {
        const sportsUri = 'http://192.168.160.58/Paris2024/api/Sports';
        console.log('Loading sports...');
        ajaxHelper(sportsUri, 'GET').done(function (data) {
            console.log('Available Sports:', data);
        
            // Mapeando os dados corretamente para garantir que cada item tenha Name e Id
            self.sports(data.map(function(sport) {
                return { Id: sport.Id, Name: sport.Name };  // Garante que tenha as propriedades corretas
            }));
        }).fail(function () {
            console.error('Failed to load sports');
        });
    };
    
    
    
    self.loadSports()
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

        self.searchTeams = function () {
            const query = self.searchQuery().trim();
            if (!query) {
                self.searchResults([]); 
                return;
            }

        const searchUri = `${self.baseUri()}/Search?q=${encodeURIComponent(query)}`;
        console.log(`Searching for teams with query: ${query}`);
        ajaxHelper(searchUri, 'GET').done(function (data) {
            console.log('Search results:', data);
            self.searchResults(data); 
        }).fail(function () {
            self.searchResults([]); 
        });
    };


    //--- Page Events
    self.activate = function (id) {
        console.log('Chamando a API para a página:', id);
        var composedUri = self.baseUri() + "?page=" + id + "&pageSize=" + self.pagesize();
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log('Resposta da API de times:', data);
            if (data && data.Teams && data.Teams.length > 0) {
                self.teams(data.Teams);
            } else {
                console.log('Nenhum time encontrado.');
            }
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
let currentSortColumn = null;
    let isAscending = true;

    // Função para ordenar a tabela
    function sortTable(columnIndex) {
        const table = document.querySelector("table tbody");
        const rows = Array.from(table.rows);

        // Determina a nova ordem
        if (currentSortColumn === columnIndex) {
            isAscending = !isAscending; // Inverte a ordem
        } else {
            currentSortColumn = columnIndex;
            isAscending = true; // Reseta para ordem crescente
        }

        // Ordena as linhas
        rows.sort((a, b) => {
            const cellA = a.cells[columnIndex].textContent.trim();
            const cellB = b.cells[columnIndex].textContent.trim();

            return isAscending
                ? cellA.localeCompare(cellB, 'pt', { sensitivity: 'base' }) // Crescente
                : cellB.localeCompare(cellA, 'pt', { sensitivity: 'base' }); // Decrescente
        });

        // Remove as linhas antigas
        while (table.firstChild) {
            table.removeChild(table.firstChild);
        }

        // Adiciona as linhas ordenadas
        rows.forEach(row => table.appendChild(row));

        
    }