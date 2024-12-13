var vm = function () {
    console.log('ViewModel initiated...');
    //---Variáveis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/API/CountryMedals');
    self.displayName = 'Paris2024 Country Medals List';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    self.Countries = ko.observableArray([]);
    self.currentPage = ko.observable(1);
    self.pagesize = ko.observable(200);
    
    self.Order = ko.observable(1);
    
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
    self.favourites = ko.observableArray([]);

    self.searchQuery = ko.observable('');
    self.searchResults = ko.observableArray([]);

    self.activate = function (page = 1) {
        console.log('CALL: getCountriesByMedals...');
        
        var composedUri = self.baseUri() + "?page=" + page + "&pageSize=" + self.pagesize() + "&Order=" + self.Order();
        
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log(data);
            hideLoading();
            self.Countries(data);
            self.currentPage(data.CurrentPage);
            self.SetFavourites();
        });
    };

   
    self.changeOrder = function(order) {
        self.Order(order); 
        self.activate(self.currentPage()); 
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
    }

    //--- start .....
    showLoading();
    var pg = getUrlParameter('page');
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
