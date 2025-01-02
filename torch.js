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
            element.textContent = isNaN(date) ? "[No information]" : date.toLocaleDateString("pt-PT");
        }
    };

    self.loadData = function () {
        $.ajax({
            type: 'GET',
            url: self.baseUri(),
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
                    var stageNumber = location.Stage_number;

                    console.log("City:", cityName, "Stage Number:", stageNumber);

                    L.marker([lat, lon], { icon: redIcon })
                        .addTo(self.map)
                        .bindPopup('<b>' + cityName + '</b><br>Stage Number: ' + (stageNumber || "Não disponível"));

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

    self.animateMarker = function () {
        if (self.route.length < 2) {
            console.error("Not enough points to animate!");
            return;
        }
    
        var blueIcon = L.icon({
            iconUrl: 'images/bonecorunning.png',
            iconSize: [30, 45],
            iconAnchor: [15, 45]
        });
    
        var currentMarker = null;
    
        function updateIconImage(imageUrl) {
            blueIcon = L.icon({
                iconUrl: imageUrl,
                iconSize: [30, 45],
                iconAnchor: [15, 45]
            });
            console.log("Imagem do ícone atualizada para:", imageUrl);
        }
    
        // Remover a necessidade do botão "Aplicar Imagem"
        document.getElementById('iconUploader').addEventListener('change', function () {
            const fileInput = document.getElementById('iconUploader');
            const file = fileInput.files[0];
    
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    updateIconImage(e.target.result);
                };
                reader.readAsDataURL(file);
            } else {
                alert("Por favor, seleciona uma imagem primeiro!");
            }
        });
    
        document.getElementById('startAnimation').addEventListener('click', function () {
            if (!currentMarker) {
                if (self.route.length > 0) {
                    currentMarker = L.marker(self.route[0], { icon: blueIcon }).addTo(self.map);
                    moveToNextPoint();
                } else {
                    alert("Não há uma rota disponível para animar!");
                }
            } else {
                alert("A animação já está a decorrer!");
            }
        });
    
        let index = 0;
    
        const progressBar = document.getElementById("progress-bar");
        const totalSteps = (self.route.length - 1) * 100;
        let progress = 0;
    
        function interpolateColor(progress) {
            const startColor = [135, 206, 250];
            const endColor = [255, 0, 0];
    
            const r = startColor[0] + progress * (endColor[0] - startColor[0]);
            const g = startColor[1] + progress * (endColor[1] - startColor[1]);
            const b = startColor[2] + progress * (endColor[2] - startColor[2]);
    
            return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
        }
    
        function moveToNextPoint() {
            if (index + 1 >= self.route.length) {
                console.log("Animation complete!");
                return;
            }
    
            const start = self.route[index];
            const end = self.route[index + 1];
            const duration = 1000;
            const steps = 100;
            const interval = duration / steps;
    
            let step = 0;
    
            const animate = setInterval(function () {
                step++;
                progress++;
    
                const lat = start[0] + (end[0] - start[0]) * (step / steps);
                const lon = start[1] + (end[1] - start[1]) * (step / steps);
                currentMarker.setLatLng([lat, lon]);
    
                const progressPercentage = (progress / totalSteps);
                progressBar.style.width = progressPercentage * 100 + "%";
                progressBar.style.backgroundColor = interpolateColor(progressPercentage);
    
                if (step >= steps) {
                    clearInterval(animate);
                    index++;
                    moveToNextPoint();
                }
            }, interval);
        }
    };
    

    self.activate(1);
    console.log("VM initialized!");

    self.init = function () {
        self.initMap();
        self.loadData();

        setTimeout(function () {
            self.animateMarker();
        }, 1000);
    };

    self.init();
};

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
        isAscending = !isAscending;
    } else {
        currentSortColumn = columnIndex;
        isAscending = true;
    }

    rows.sort((a, b) => {
        const cellA = a.cells[columnIndex].textContent.trim();
        const cellB = b.cells[columnIndex].textContent.trim();

        const valueA = isNaN(cellA) ? new Date(cellA).getTime() || cellA : parseFloat(cellA);
        const valueB = isNaN(cellB) ? new Date(cellB).getTime() || cellB : parseFloat(cellB);

        if (typeof valueA === "number" && typeof valueB === "number") {
            return isAscending ? valueA - valueB : valueB - valueA;
        } else if (!isNaN(new Date(cellA).getTime()) && !isNaN(new Date(cellB).getTime())) {
            return isAscending ? valueA - valueB : valueB - valueA;
        } else {
            return isAscending
                ? valueA.localeCompare(valueB, 'pt', { sensitivity: 'base' })
                : valueB.localeCompare(valueA, 'pt', { sensitivity: 'base' });
        }
    });

    while (table.firstChild) {
        table.removeChild(table.firstChild);
    }

    rows.forEach(row => table.appendChild(row));
}