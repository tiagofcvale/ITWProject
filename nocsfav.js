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
        sParameterName;
    
    console.log("sPageURL=", sPageURL);
    for (var i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
};

//--- Start .... 
$(document).ready(function () {
    showLoading();
    var pg = getUrlParameter('page');
    console.log(pg);
    if (pg == undefined)
        self.activate(1);
    else {
        self.activate(pg);
    }
    console.log("VM initialized!");
});

//--- Page Events
self.activate = function (id) {
    console.log('CALL: getNOCs...');
    var composedUri = self.baseUri() + "?page=" + id + "&pageSize=" + self.pagesize();
    ajaxHelper(composedUri, 'GET').done(function (data) {
        console.log(data);
        hideLoading();
        self.records(data.Records);
        self.currentPage(data.CurrentPage);
        self.hasNext(data.HasNext);
        self.hasPrevious(data.HasPrevious);
        self.pagesize(data.PageSize);
        self.totalPages(data.TotalPages);
        self.totalRecords(data.TotalRecords);
        self.SetFavourites();
    });
};

function removeFav(Id) {
    console.log("remove fav");
    $("#fav-" + Id).remove();

    let fav = JSON.parse(localStorage.fav || '[]');
    const index = fav.indexOf(Id);

    if (index != -1) fav.splice(index, 1);

    localStorage.setItem("fav", JSON.stringify(fav));
}

$(document).ready(function () {
    showLoading();

    let fav = JSON.parse(localStorage.fav || '[]');
    console.log(fav);

    function getArrayCount(array) {
        return Array.isArray(array) ? array.length : 0;
    }

    for (const Id of fav) {
        console.log(Id);
        ajaxHelper('http://192.168.160.58/Paris2024/api/NOCs/' + Id, 'GET').done(function (data) {
            console.log(data);

            //Get Counts
            const athletesCount = getArrayCount(data.Athletes);
            const coachesCount = getArrayCount(data.Coaches);
            const medalsCount = getArrayCount(data.Medals);
            const teamsCount = getArrayCount(data.Teams);

            var photo = data.Photo && data.Photo !== '' ? data.Photo : 'Images/PersonNotFound.png';

            if (fav.length !== 0) {
                $("#table-favourites").show();
                $('#noadd').hide();
                $('#nofav').hide();
                $("#table-favourites").append(
                    `<tr id="fav-${Id}">
                        <td class="align-middle">${Id}</td>
                        <td class="align-middle">${data.Name}</td>
                        <td class="align-middle">${athletesCount}</td>
                        <td class="align-middle">${coachesCount}</td>
                        <td class="align-middle">${medalsCount}</td>
                        <td class="align-middle">${teamsCount}</td>
                        <td class="align-middle"><img style="height: 100px; width: 100px;" src="${photo}"></td>
                        <td class="text-end align-middle">
                            <a class="btn btn-default btn-light btn-xs" href="nocsDetails.html?id=${Id}">
                                <i class="fa fa-eye" title="Show details"></i>
                            </a>
                            <a class="btn btn-default btn-sm btn-favourite" onclick="removeFav('${Id}')">
                                <i class="fa fa-heart text-danger" title="Selecione para remover dos favoritos"></i>
                            </a>
                        </td>
                    </tr>`
                );
            }
        });
    }

    hideLoading();
});

$(document).ajaxComplete(function () {
    $("#myModal").modal('hide');
});
