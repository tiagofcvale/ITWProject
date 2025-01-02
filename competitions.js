var vm = function () {
    console.log('ViewModel initiated...');
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/API/competitions');
    self.displayName = 'Paris2024 Competitions List';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    self.competitions = ko.observableArray([]);
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
    self.toggleFavourite = function (id, name) {
        // Recupera os favoritos existentes do localStorage
        let existingFavs = [];
        try {
            existingFavs = JSON.parse(localStorage.getItem("fav")) || [];
        } catch (e) {
            existingFavs = [];
        }
    
        // Atualiza os favoritos no observableArray
        const existingIndex = self.favourites().findIndex(fav => fav.id === id && fav.name === name);
        if (existingIndex === -1) {
            self.favourites.push({ id: id, name: name });
        } else {
            self.favourites.splice(existingIndex, 1);
        }
    
        // Mescla os favoritos existentes no localStorage com os favoritos atuais
        const updatedFavs = [...existingFavs, ...ko.toJS(self.favourites())].filter(
            (fav, index, selfArray) =>
                selfArray.findIndex(f => f.id === fav.id && f.name === fav.name) === index // Remove duplicados
        );
    
        // Salva os favoritos mesclados no localStorage
        localStorage.setItem("fav", JSON.stringify(updatedFavs));
    };
    
    
    self.SetFavourites = function () {
        let storage;
        try {
            storage = JSON.parse(localStorage.getItem("fav"));
        } catch (e) {
            storage = [];
        }
    
        if (Array.isArray(storage)) {
            self.favourites(storage.filter(item => item.id && item.name));  // Filtros para garantir que sejam objetos válidos
        }
    };
    
    
    self.favourites = ko.observableArray([])

    self.searchQuery = ko.observable('');
    self.searchResults = ko.observableArray([]);

    self.searchCompetitions = function () {
        const query = self.searchQuery().trim();
        if (!query) {
            self.searchResults([]); 
            return;
        }

        const searchUri = `${self.baseUri()}/Search?q=${encodeURIComponent(query)}`;
        console.log(`Searching for competitions with query: ${query}`);
        ajaxHelper(searchUri, 'GET').done(function (data) {
            console.log('Search results:', data);
            self.searchResults(data); 
        }).fail(function () {
            self.searchResults([]); 
        });
    };

    self.activate = function (id) {
        console.log('CALL: getCompetitions...');
        var composedUri = self.baseUri() + "?page=" + id + "&pageSize=" + self.pagesize();
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log(data);
            hideLoading();
            self.competitions(data.Competitions);
            self.currentPage(data.CurrentPage);
            self.hasNext(data.HasNext);
            self.hasPrevious(data.HasPrevious);
            self.pagesize(data.PageSize)
            self.totalPages(data.TotalPages);
            self.totalRecords(data.TotalCompetitions);
            self.SetFavourites();
        });
    };

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
    };

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