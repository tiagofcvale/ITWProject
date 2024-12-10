// Helper AJAX function
function ajaxHelper(uri, method, data) {
    return $.ajax({
        type: method,
        url: uri,
        dataType: 'json',
        contentType: 'application/json',
        data: data ? JSON.stringify(data) : null,
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(`AJAX Call [${uri}] Fail: ${textStatus}`, errorThrown);
            hideLoading();
        }
    });
}

// Loading modal control
function showLoading() {
    $("#myModal").modal('show', { backdrop: 'static', keyboard: false });
}

function hideLoading() {
    $("#myModal").modal('hide');
}

// Get URL Parameter
function getUrlParameter(sParam) {
    const params = new URLSearchParams(window.location.search);
    return params.get(sParam);
}

function encodeForUrl(value) {
    return encodeURIComponent(value).replace(/'/g, '%27');
}


// Remove favorite item
function removeFav(Id, Name = '') {
    console.log("Removing favorite:", Id, Name);

    // Construir seletor para remoção visual
    let selector;

    if (Name) {
        // Se Name for fornecido, remover baseado em ambos
        const sanitizedId = sanitizeId(Id);
        const sanitizedName = sanitizeId(Name); // Sanitiza o nome para uso seguro
        selector = `#fav-${sanitizedId}-${sanitizedName}`;
    } else {
        // Apenas pelo ID para endpoints genéricos
        const sanitizedId = sanitizeId(Id);
        selector = `#fav-${sanitizedId}`;
    }

    // Remover o elemento visual
    $(selector).remove();

    // Atualizar localStorage
    let fav = JSON.parse(localStorage.getItem("fav") || "[]");

    const updatedFav = fav.filter(item => {
        if (Name) {
            // Para competitions, remover se ambos coincidem
            return !(item.SportId === Id && item.Name === Name);
        }
        // Para outros endpoints, remover apenas pelo Id
        return item.Id !== Id;
    });

    localStorage.setItem("fav", JSON.stringify(updatedFav)); // Salvar favoritos atualizados
}


// Sanitize ID to ensure safe use in HTML
function sanitizeId(id) {
    return id.toString().replace(/[^a-zA-Z0-9_-]/g, '');
}

// Function to append items dynamically to tables
function appendToTable(tableId, rowContent) {
    $(`#${tableId}`).show().append(rowContent);
    $('#noadd, #nofav').hide(); // Oculta mensagens de placeholder
}

// Main initialization
$(document).ready(function () {
    showLoading();

    let fav = JSON.parse(localStorage.getItem("fav") || "[]");
    console.log("Favorites:", fav);

    const endpoints = {
        athletes: "http://192.168.160.58/Paris2024/API/Athletes/",
        coaches: "http://192.168.160.58/Paris2024/API/Coaches/",
        officials: "http://192.168.160.58/Paris2024/API/Technical_officials/",
        venues: "http://192.168.160.58/Paris2024/api/Venues/",
        sports: "http://192.168.160.58/Paris2024/api/Sports/",
        teams: "http://192.168.160.58/Paris2024/API/Teams/",
        competitions: "http://192.168.160.58/Paris2024/api/Competitions"
    };

    // Primeiro, carregue todas as competições
    ajaxHelper(endpoints.competitions, 'GET').done(response => {
        const competitions = response.Competitions;
        console.log("Loaded competitions:", competitions);

        fav.forEach(item => {
            console.log(`Processing favorite item:`, item);
        
            Object.keys(endpoints).forEach(key => {
                let url;
        
                if (key === "competitions") {
                    // Desestruturar ID e Nome do item
                    const { id: sportId, name } = item;
        
                    // Evitar erros de dados incorretos
                    if (!sportId || !name) {
                        console.error(`Invalid competition data:`, item);
                        return;
                    }
        
                    // Codificar os parâmetros corretamente
                    const encodedSportId = encodeForUrl(sportId);
                    const encodedName = encodeForUrl(name);
        
                    // Montar a URL correta para a competição
                    url = `${endpoints[key]}?sportId=${encodedSportId}&name=${encodedName}`;
                } else {
                    // Outros endpoints
                    url = `${endpoints[key]}${item}`;
                }
        
                // Fazer a requisição AJAX para obter os detalhes do item
                ajaxHelper(url, 'GET').done(data => {
                    if (!data) {
                        console.error(`No data returned for ${key} with ID:`, item);
                        return;
                    }
        
                    const photo = data.Photo || data.Pictogram || 'Images/PersonNotFound.png';
                    let row;
        
                    if (key === "Competitions") {
                        var name= data.Name
                        console.log("sportId",encodedSportId)
                        console.log("name",encodedName)
                        // Linha para as competições
                        row = `
                            <tr id="fav-${sanitizeId(sportId)}-${sanitizeId(name)}">
                                <td class="align-middle">${sportId}</td>
                                <td class="align-middle">${data.Name}</td>
                                <td class="align-middle">${data.Tag || "N/A"}</td>
                                <td class="align-middle">
                                    <img style="height: 100px; width: 100px;" src="${photo}" alt="Image">
                                </td>
                                <td class="text-end align-middle">
                                    <a class="btn btn-default btn-light btn-xs" 
                                       href="competitionsDetails.html?sportId=${encodedSportId}&name=${encodedName}">
                                       <i class="fa fa-eye" title="Show details"></i>
                                    </a>
                                    <a class="btn btn-default btn-sm btn-favourite" 
                                       onclick="removeFav('${sportId}', '${name}')">
                                       <i class="fa fa-heart text-danger" title="Remove from favorites"></i>
                                    </a>
                                </td>
                            </tr>`;
                            appendToTable("table-favourites-competitions", row);
                    } else if (key === "Venues"){
                        // Linhas para outros endpoints
                        row = `
                            <tr id="fav-${sanitizeId(item)}">
                                <td class="align-middle">${data.Id || item}</td>
                                <td class="align-middle">${data.Name || "N/A"}</td>
                                <td class="align-middle"><a href="${data.Url}"><i class="fa fa-external-link" aria-hidden="true"></i></a></td>
                                <td class="align-middle">
                                    <img style="height: 100px; width: 100px;" src="${photo}" alt="Photo">
                                </td>
                                <td class="text-end align-middle">
                                    <a class="btn btn-default btn-light btn-xs" 
                                       href="${key}Details.html?id=${item}">
                                       <i class="fa fa-eye" title="Show details"></i>
                                    </a>
                                    <a class="btn btn-default btn-sm btn-favourite" 
                                       onclick="removeFav('${item}')">
                                       <i class="fa fa-heart text-danger" title="Remove from favorites"></i>
                                    </a>
                                </td>
                            </tr>`;
                        appendToTable(`table-favourites-${key}`, row);
                    } else if (key === "officials") {
                        console.log(`URL: ${url}`);
                        row = `
                            <tr id="fav-technical_officials">
                                <td class="align-middle">${data.Id || item}</td>
                                <td class="align-middle">${data.Name || "N/A"}</td>
                                <td class="align-middle">${data.Sex || "N/A"}</td>
                                <td class="align-middle">
                                    <img style="height: 100px; width: 100px;" src="${photo}" alt="Photo">
                                </td>
                                <td class="text-end align-middle">
                                    <a class="btn btn-default btn-light btn-xs" 
                                       href="${key}Details.html?id=${item}">
                                       <i class="fa fa-eye" title="Show details"></i>
                                    </a>
                                    <a class="btn btn-default btn-sm btn-favourite" 
                                       onclick="removeFav('${item}')">
                                       <i class="fa fa-heart text-danger" title="Remove from favorites"></i>
                                    </a>
                                </td>
                            </tr>`;
                            appendToTable(`table-favourites-technical_officials`, row);
                    } else {
                        row = `
                            <tr id="fav-${sanitizeId(item)}">
                                <td class="align-middle">${data.Id || item}</td>
                                <td class="align-middle">${data.Name || "N/A"}</td>
                                <td class="align-middle">${data.Sex || "N/A"}</td>
                                <td class="align-middle">
                                    <img style="height: 100px; width: 100px;" src="${photo}" alt="Photo">
                                </td>
                                <td class="text-end align-middle">
                                    <a class="btn btn-default btn-light btn-xs" 
                                       href="${key}Details.html?id=${item}">
                                       <i class="fa fa-eye" title="Show details"></i>
                                    </a>
                                    <a class="btn btn-default btn-sm btn-favourite" 
                                       onclick="removeFav('${item}')">
                                       <i class="fa fa-heart text-danger" title="Remove from favorites"></i>
                                    </a>
                                </td>
                            </tr>`;
                            appendToTable(`table-favourites-${key}`, row);
                    }
                }).fail((jqXHR, textStatus, errorThrown) => {
                    console.error(`Failed to fetch data for ${key}: ${textStatus}`, errorThrown);
                });
            });
        });
        
        
        
    });

    hideLoading();
});

