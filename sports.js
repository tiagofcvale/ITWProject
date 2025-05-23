// ViewModel KnockOut
var vm = function () {
    console.log('ViewModel initiated...');
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/api/Sports');
    self.displayName = 'Sports List';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    self.Sports = ko.observableArray([]);
    self.favourites = ko.observableArray([]); 

    
    self.toggleFavourite = function (id) {
        if (self.favourites.indexOf(id) == -1) {
            self.favourites.push(id);
        } else {
            self.favourites.remove(id);
        }
        localStorage.setItem("fav", JSON.stringify(self.favourites()));
    };

    
    self.SetFavourites = function () {
        let storage;
        try {
            storage = JSON.parse(localStorage.getItem("fav"));
        } catch (e) {
            console.error("Erro ao carregar favoritos", e);
        }
        if (Array.isArray(storage)) {
            self.favourites(storage);  
        }
    };
    self.searchQuery = ko.observable('');
        self.searchResults = ko.observableArray([]);

        self.searchSports = function () {
            const query = self.searchQuery().trim();
            if (!query) {
                self.searchResults([]); 
                return;
            }

        const searchUri = `${self.baseUri()}/Search?q=${encodeURIComponent(query)}`;
        console.log(`Searching for sports with query: ${query}`);
        ajaxHelper(searchUri, 'GET').done(function (data) {
            console.log('Search results:', data);
            self.searchResults(data); 
        }).fail(function () {
            self.searchResults([]); 
        });
    };

    self.activate = function (id) {
        console.log('CALL: getAthletes...');
        var composedUri = self.baseUri();
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log(data);
            self.Sports(data);
            self.SetFavourites();
            hideLoading();
        });
    };

    window.addEventListener('favoritesUpdated', function () {
        console.log("Favorites updated! Refreshing the list in sports.html.");
        self.SetFavourites();  
    });

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

    // Inicia a página
    showLoading();
    var pg = getUrlParameter('id');
    if (pg == undefined)
        self.activate(1);
    else {
        self.activate(pg);
    }

    console.log("VM initialized!");
};

$(document).ready(function () {
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

        if (currentSortColumn === columnIndex) {
            isAscending = !isAscending; 
        } else {
            currentSortColumn = columnIndex;
            isAscending = true;
        }

    
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