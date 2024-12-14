// ViewModel KnockOut
var vm = function () {
    console.log('ViewModel initiated...');
    //---Variáveis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/api/Torch_route');
    self.displayName = 'Paris 2024 Torch Route';
    self.records = ko.observableArray([]);
    self.route = [];
    self.bounds = [];
    self.formatValue = function (value, defaultMessage = "[No information]") {
        return value || defaultMessage;
    };
    
    //--- Page Events
    self.activate = function (id) {
        console.log('CALL: getRoutes...');
        var composedUri = self.baseUri();
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log(data);
            self.records(data);
            
            
            
        });
    };
    ko.bindingHandlers.formatDate = {
        update: function (element, valueAccessor) {
            const value = ko.unwrap(valueAccessor());
            const date = new Date(value);
            if (isNaN(date)) {
                element.textContent = "[No information]";
            } else {
                element.textContent = date.toLocaleDateString("pt-PT"); // Formato português
            }
        }
    };

    self.loadData = function () {
        $.ajax({
            type: 'GET',
            url: 'http://192.168.160.58/Paris2024/api/Torch_route',
            dataType: 'json',
            success: function (data) {
                self.records(data); 
                self.plotRoute();  
            },
            error: function () {
                alert('Erro ao carregar os dados da API!');
            }
        });
    };

    self.initMap = function () {
        self.map = L.map('map').setView([48.8566, 2.3522], 6);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(self.map);
    };

    self.plotRoute = function () {
        var redIcon = L.icon({
            iconUrl: 'images/markertorch.png', 
            iconSize: [25, 45],
            iconAnchor: [12, 41], 
            popupAnchor: [5, 5]
        });

        self.records().forEach(function (location) {
            if (location.Lat !== null && location.Lon !== null) {
                var lat = parseFloat(location.Lat);
                var lon = parseFloat(location.Lon);

                if (!isNaN(lat) && !isNaN(lon)) {
                    var cityName = location.City;

                    L.marker([lat, lon], { icon: redIcon })
                        .addTo(self.map)
                        .bindPopup('<b>' + cityName + '</b>');

                    self.bounds.push([lat, lon]);
                    self.route.push([lat, lon]);
                }
            }
        });

        if (self.bounds.length > 0) self.map.fitBounds(self.bounds);
        if (self.route.length > 1) {
            L.polyline(self.route, { color: 'red' }).addTo(self.map);
        }
    };

    //--- start ....
    self.activate(1);
    console.log("VM initialized!");

    // Inicializar o ViewModel
    self.init = function () {
        self.initMap();
        self.loadData();
    };

    self.init();
};

//--- Internal functions
function ajaxHelper(uri, method, data) {
    return $.ajax({
        type: method,
        url: uri,
        dataType: 'json',
        contentType: 'application/json',
        data: data ? JSON.stringify(data) : null,
        error: function (jqXHR, textStatus, errorThrown) {
            alert("AJAX Call[" + uri + "] Fail...");
        }
    });
}

$(document).ready(function () {
    console.log("ready!");
    ko.applyBindings(new vm());
});
let currentSortColumn = null;
let isAscending = true;

function sortTable(columnIndex) {
    const table = document.querySelector("table tbody");
    const rows = Array.from(table.rows);

    if (currentSortColumn === columnIndex) {
        isAscending = !isAscending; // Inverte a ordem se for a mesma coluna
    } else {
        currentSortColumn = columnIndex;
        isAscending = true; // Reseta para ascendente para nova coluna
    }

    rows.sort((a, b) => {
        const cellA = a.cells[columnIndex].textContent.trim();
        const cellB = b.cells[columnIndex].textContent.trim();

        // Tenta converter para número ou data antes de comparar
        const valueA = isNaN(cellA) ? new Date(cellA).getTime() || cellA : parseFloat(cellA);
        const valueB = isNaN(cellB) ? new Date(cellB).getTime() || cellB : parseFloat(cellB);

        if (typeof valueA === "number" && typeof valueB === "number") {
            return isAscending ? valueA - valueB : valueB - valueA; // Comparação numérica
        } else if (!isNaN(new Date(cellA).getTime()) && !isNaN(new Date(cellB).getTime())) {
            return isAscending ? valueA - valueB : valueB - valueA; // Comparação de datas
        } else {
            return isAscending
                ? valueA.localeCompare(valueB, 'pt', { sensitivity: 'base' })
                : valueB.localeCompare(valueA, 'pt', { sensitivity: 'base' }); // Comparação de texto
        }
    });

    // Atualiza o DOM da tabela
    while (table.firstChild) {
        table.removeChild(table.firstChild);
    }

    rows.forEach(row => table.appendChild(row));
}
