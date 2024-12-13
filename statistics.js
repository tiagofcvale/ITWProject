// ViewModel KnockOut
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
    

    //--- Page Events
    self.activate = function () {
        console.log('CALL: getCountriesByMedals...');
        var composedUri = self.baseUri() 
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log(data);
            hideLoading();
            self.Countries(data);
            self.currentPage(data.CurrentPage);
            self.hasNext(data.HasNext);
            self.hasPrevious(data.HasPrevious);
            self.pagesize(data.PageSize);
            self.totalPages(data.TotalPages);
            self.totalRecords(data.TotalCoaches);
            self.SetFavourites();
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



google.charts.load('current', { packages: ['bar'] });

google.charts.setOnLoadCallback(drawChart);

function drawChart() {
    $.ajax({
        url: 'http://192.168.160.58/Paris2024/API/CountryMedals', 
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            var chartData = [['Country', '🥇 Gold', '🥈 Silver', '🥉 Bronze']];
            data.forEach(function (item) {
                chartData.push([item.CountryName, item.GoldMedal, item.SilverMedal, item.BronzeMedal]);
            });

            var dataTable = google.visualization.arrayToDataTable(chartData);

            var options = {
                chart: {
                    title: 'Top 50 Medal Winners',
                    subtitle: 'Gold, Silver, and Bronze medals',
                },
                bars: 'horizontal', 
                axes: {
                    x: {
                        0: { side: 'top', label: 'Medals' } 
                    }
                },
                bar: { groupWidth: "90%" },
                colors: ['#FFD700', '#C0C0C0', '#CD7F32'], 
                legend: { position: 'top', textStyle: { color: 'red', fontSize: 15 } } 
            };

            var chart = new google.charts.Bar(document.getElementById('charttop50'));
            chart.draw(dataTable, google.charts.Bar.convertOptions(options));
        },
        error: function (error) {
            console.error('Erro ao buscar dados da API:', error);
        }
    });
    $.ajax({
        url: 'http://192.168.160.58/Paris2024/api/Medals/Top25', 
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            var chartData = [['Athelete', '🥇 Gold', '🥈 Silver', '🥉 Bronze']];
            data.forEach(function (item) {
                chartData.push([item.Name, item.Gold, item.Silver, item.Bronze]);
            });

            var dataTable = google.visualization.arrayToDataTable(chartData);

            var options = {
                chart: {
                    title: 'Top 50 Medal Winners',
                    subtitle: 'Gold, Silver, and Bronze medals',
                },
                bars: 'horizontal', 
                axes: {
                    x: {
                        0: { side: 'top', label: 'Medals' } 
                    }
                },
                bar: { groupWidth: "90%" },
                colors: ['#FFD700', '#C0C0C0', '#CD7F32'], 
                legend: { position: 'top', textStyle: { color: 'red', fontSize: 15 } } 
            };

            var chart = new google.charts.Bar(document.getElementById('charttop25'));
            chart.draw(dataTable, google.charts.Bar.convertOptions(options));
        },
        error: function (error) {
            console.error('Erro ao buscar dados da API:', error);
        }
    });
}


