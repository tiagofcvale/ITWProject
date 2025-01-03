var vm = function () {
    
    console.log('ViewModel initiated...');
    var self = this;
    self.medalsApiBase = "http://192.168.160.58/Paris2024/api/medals";
    self.competitionApiBase = "http://192.168.160.58/Paris2024/api/Medals/Competition";
    self.displayName = 'Paris2024 Medals List';
    self.competitions = ko.observableArray([]);
    self.selectedCompetition = ko.observable(null); // Competição selecionada
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    self.medals = ko.observableArray([]);
    self.currentPage = ko.observable(1);
    self.pagesize = ko.observable(20);
    self.totalRecords = ko.observable(50);
    self.hasPrevious = ko.observable(false);
    self.hasNext = ko.observable(false);
    self.filteredMedals = ko.observable('');;
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
        const list = [];
        const size = Math.min(self.totalPages(), 9);
        const step = self.currentPage() > 5 ? self.currentPage() - 5 : 0;
    
        for (let i = 1; i <= size; i++) {
            list.push(i + step);
        }
        return list.filter(page => page <= self.totalPages());
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

    

    //--- Page Events
    self.activate = function (id) {
        console.log('CALL: getMedals...');
        var composedUri = `${self.medalsApiBase}?page=${id}&pageSize=${self.pagesize()}`; // Alterado para usar self.medalsApiBase
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

    //--- start .... 
    function getUrlParameter(sParam) {
        const sPageURL = window.location.search.substring(1),
              sURLVariables = sPageURL.split('&');
    
        for (let i = 0; i < sURLVariables.length; i++) {
            const sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? null : decodeURIComponent(sParameterName[1]);
            }
        }
        return null;
    }
    
showLoading();
var pg = getUrlParameter('page');
console.log(pg);
if (pg == undefined)
    self.activate(1);
else {
    self.activate(pg);
}
console.log("VM initialized!");


}

function showLoading() {
        $("#myModal").modal('show');
    }
    
    function hideLoading() {
        $("#myModal").modal('hide');
    }

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

   
}
