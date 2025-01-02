function ajaxHelper(uri, method, data) {
    return $.ajax({
        type: method,
        url: uri,
        dataType: 'json',
        contentType: 'application/json',
        data: data ? JSON.stringify(data) : null,
        error: function (jqXHR, textStatus, errorThrown) {
            console.error(`AJAX Call [${uri}] Fail: ${textStatus}`, errorThrown);
            hideLoading();
        }
    });
}

function showLoading() {
    $("#myModal").modal('show', { backdrop: 'static', keyboard: false });
}

function hideLoading() {
    $("#myModal").modal('hide');
}

function getUrlParameter(sParam) {
    const params = new URLSearchParams(window.location.search);
    return params.get(sParam);
}

function encodeForUrl(value) {
    return encodeURIComponent(value).replace(/'/g, '%27');
}

function sanitizeId(id) {
    return id.toString().replace(/[^a-zA-Z0-9_-]/g, '');
}

function appendToTable(tableId, rowContent) {
    $(`#${tableId}`).show().append(rowContent);
    $('#noadd, #nofav').hide();
}

function showNoFavoritesMessage() {
    $('#noadd, #nofav').show();
    console.log("No favorites to display.");
}

function processFavorites(fav, endpoints) {
    if (!fav.length) {
        showNoFavoritesMessage();
        return;
    }

    fav.forEach(item => {
        console.log(`Processing favorite item:`, item);

        Object.keys(endpoints).forEach(key => {
            let url;

            if (key === "competitions") {
                const { id: sportId, name } = item;

                if (!sportId || !name) {
                    console.error(`Invalid competition data:`, item);
                    return;
                }

                const encodedSportId = encodeForUrl(sportId);
                const encodedName = encodeForUrl(name);

                url = `${endpoints[key]}?sportId=${encodedSportId}&name=${encodedName}`;
            } else {
                url = `${endpoints[key]}${item}`;
            }

            ajaxHelper(url, 'GET')
                .done(data => {
                    if (!data) {
                        console.error(`No data returned for ${key} with ID:`, item);
                        return;
                    }

                    const photo = data.Photo || data.Pictogram || 'Images/PersonNotFound.png';
                    let row;

                    if (key === "venues") {
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
                    } else if (key === "sports") {
                        row = `
                            <tr id="fav-${sanitizeId(item)}">
                                <td class="align-middle">${data.Id || item}</td>
                                <td class="align-middle">${data.Name || "N/A"}</td>
                                <td class="align-middle"><a href="${data.Sport_url}"><i class="fa fa-external-link" aria-hidden="true"></i></a></td>
                                <td class="align-middle">
                                    <img style="height: 100px; width: 100px;" class="card-img-top" src="${data.Pictogram}" id="image1" onerror="this.onerror=null; this.src='Images/PersonNotFound.png';">
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
                    } else {
                        row = `
                            <tr id="fav-${sanitizeId(item)}">
                                <td class="align-middle">${data.Id || item}</td>
                                <td class="align-middle">${data.Name || "N/A"}</td>
                                <td class="align-middle">${data.Sex || "N/A"}</td>
                                <td class="align-middle">
                                    <img style="height: 100px; width: 100px;" class="card-img-top" src="${data.Photo}" id="image1" onerror="this.onerror=null; this.src='Images/PersonNotFound.png';">
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
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    console.error(`Failed to fetch data for ${key}: ${textStatus}`, errorThrown);
                });
        });
    });
}

$(document).ready(function () {
    showLoading();

    let fav;
    try {
        fav = JSON.parse(localStorage.getItem("fav") || "[]");
    } catch (error) {
        console.error("Error parsing favorites from localStorage:", error);
        fav = [];
    }

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

    processFavorites(fav, endpoints);
    hideLoading();
});
