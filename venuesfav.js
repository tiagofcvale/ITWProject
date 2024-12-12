//--- Internal functions
function ajaxHelper(uri, method, data) {
    return $.ajax({
        type: method,
        url: uri,
        dataType: 'json',
        contentType: 'application/json',
        data: data ? JSON.stringify(data) : null,
        error: function (jqXHR, textStatus, errorThrown) {
            console.log("AJAX Call[" + uri + "] Fail...");
            hideLoading();
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
    });
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
$(document).ready(function () {
    showLoading();

    let fav = JSON.parse(localStorage.getItem("fav") || "[]");
    console.log("Favourites:", fav);

    for (const Id of fav) {
        console.log("Fetching details for ID:", Id);

        ajaxHelper(`http://192.168.160.58/Paris2024/api/Venues/${Id}`, 'GET').done(function (data) {
            console.log(data);
            const pictogram = (!data.Pictogram || data.Pictogram === '') 
                ? 'Images/PersonNotFound.png' 
                : data.Pictogram;

            if (localStorage.getItem("fav").length !== 0) {
                $("#table-favourites").show();
                $('#noadd').hide();
                $('#nofav').hide();
                $("#table-favourites").append(
                    `<tr id="fav-${sanitizeId(Id)}">
                        <td class="align-middle">${data.Id}</td>
                        <td class="align-middle">${data.Name}</td>
                        <td class="align-middle"><a href="${data.Url}"><i class="fa fa-external-link" aria-hidden="true"></i></a></td>
                        <td class="align-middle">${data.Tag}</td>
                        <td class="text-end align-middle">
                            <a class="btn btn-default btn-light btn-xs" href="venuesDetails.html?id=${Id}">
                                <i class="fa fa-eye" title="Show details"></i>
                            </a>    
                            <a class="btn btn-default btn-sm btn-favourite" onclick="removeFav('${data.Id}')">
                                <i class="fa fa-heart text-danger" title="Remove Favourite"></i>
                            </a>
                        </td>
                    </tr>`
                );
            }
        });
        sleep(50);
    }

    hideLoading();
});

function sanitizeId(id) {
    return id.toString().replace(/[^a-zA-Z0-9_-]/g, '');
}

function removeFav(Id) {
    console.log("Attempting to remove favourite with ID:", Id);
    
    const sanitizedId = sanitizeId(Id);
    console.log("Sanitized ID:", sanitizedId);

    const row = $(`#fav-${sanitizedId}`);
    
    if (row.length) {
        row.remove();
        console.log("Removed from DOM:", `#fav-${sanitizedId}`);
    } else {
        console.error("Row not found in DOM:", `#fav-${sanitizedId}`);
    }

    let fav = JSON.parse(localStorage.getItem("fav") || "[]");
    console.log("Current favourites before removal:", fav);

    const index = fav.findIndex(favItem => favItem === sanitizedId);

    if (index !== -1) {
        fav.splice(index, 1); 
        localStorage.setItem("fav", JSON.stringify(fav));  
        console.log("Updated favourites:", fav);
    } else {
        console.error("ID not found in favourites:", sanitizedId);
    }

    
    if (fav.length === 0) {
        $("#table-favourites").hide();
        $('#nofav').show();
    }

    
    window.dispatchEvent(new Event('favoritesUpdated'));
}

$(document).ajaxComplete(function () {
    $("#myModal").modal('hide');
});
