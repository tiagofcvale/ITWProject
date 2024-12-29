var vm = function () {
    var self = this;

    
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/api/Canoe_sprints/Events');

    
    self.selectedEventId = ko.observable();  
    self.selectedStageId = ko.observable();   
    self.selectedEventStages = ko.observableArray([]);  
    self.Events = ko.observableArray([]);  
    self.ParticipantDetails = ko.observableArray([]);
    self.error = ko.observable("");  

    self.activate = function () {
        var composedUri = self.baseUri();
        ajaxHelper(composedUri, 'GET').done(function (data) {
            self.Events(data);  
            hideLoading();
            const formattedData = data.map(item => {
                if (item.ParticipantType === 'Person') {
                    item.ParticipantTypeFormatted = 'Athlete';
                } else if (item.ParticipantType === 'Team') {
                    item.ParticipantTypeFormatted = 'Teams';
                } else {
                    item.ParticipantTypeFormatted = formatValue(item.ParticipantType);
                }

                var participantId = item.Id; 
                self.getParticipantDetails(participantId, item);

                return item;
            });
        });
    };
    self.getParticipantDetails = function (participantId, participant) {
        var detailsUri = `http://192.168.160.58/Paris2024/api/Canoe_sprints/${encodeURIComponent(participantId)}`;
        console.log("Buscando detalhes do participante na URL:", detailsUri); 
    
        return ajaxHelper(detailsUri, 'GET').done(function (details) {
            console.log('Detalhes do participante recebidos:', details);
    
            
            var participantDetail = {
                Id: details.Id,
                Name: details.Name,
                Date: details.Date,
                EventId: details.EventId,
                EventName: details.EventName,
                StageId: details.StageId,
                StageName: details.StageName,
                Sex: details.Sex,
                Venue: formatValue(details.Venue),
                ParticipantType: details.ParticipantType,
                ParticipantCode: details.ParticipantCode,
                ParticipantName: details.ParticipantName,
                CountryCode: details.CountryCode,
                CountryName: details.CountryName,
                CountryFlag: details.CountryFlag || 'Images/PersonNotFound.png',
                NOCFlag: details.NOCFlag || 'Images/PersonNotFound.png',
                Rank: details.Rank,
                Result: details.Result,
                ResultType: details.ResultType,
                ResultIRM: details.ResultIRM,
                ResultDiff: details.ResultDiff,
                ResultWLT: details.ResultWLT,
                QualificationMark: details.QualificationMark,
                StartOrder: details.StartOrder,
                Bib: details.Bib,
            };
    
            
            self.ParticipantDetails.push(participantDetail);
        }).fail(function (error) {
            console.error('Erro ao carregar detalhes do participante:', error);
        });
    };
    

    
    self.onEventChange = function () {
        var selectedEvent = self.Events().find(function (event) {
            return event.EventId === self.selectedEventId();
        });

        
        if (selectedEvent) {
            self.selectedEventStages(selectedEvent.Stages); 
            self.selectedStageId(null);  
            self.ParticipantDetails([]); 
        } else {
            self.selectedEventStages([]);
            self.ParticipantDetails([]); 
        }
    };

    
    self.onStageChange = function () {
        if (self.selectedStageId()) {
            self.loadParticipants(self.selectedEventId(), self.selectedStageId());
        } else {
            self.ParticipantDetails([]);
        }
    };

    self.loadParticipants = function (EventId, StageId) {
        var composedUri = `http://192.168.160.58/Paris2024/api/Canoe_sprints/Participants?EventId=${encodeURIComponent(EventId)}&StageId=${encodeURIComponent(StageId)}`;
        console.log('Composed URI:', composedUri);
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log('Dados recebidos:', data);
    
            if (Array.isArray(data)) {
                const participantPromises = data.map(function (item) {
                    const participantId = item.Id;
                    if (!participantId || typeof participantId !== 'number') {
                        console.warn('ID inválido para participante:', item);
                        return Promise.resolve(null);
                    }
    
                    const participantDetailsUri = `http://192.168.160.58/Paris2024/api/Canoe_sprints/${participantId}`;
    
                    return ajaxHelper(participantDetailsUri, 'GET')
                        .then(function (detailData) {
                            return {
                                Name: detailData.Name || 'Sem nome',
                                Id: detailData.Id,
                                ParticipantType: detailData.ParticipantType,
                                ParticipantName: detailData.ParticipantName,
                                Venue: detailData.Venue,
                                CountryName: detailData.CountryName,
                                CountryFlag: detailData.CountryFlag || 'Images/PersonNotFound.png',
                                NOCFlag: detailData.NOCFlag || 'Images/PersonNotFound.png',
                                Rank: detailData.Rank || 'N/A',
                                Result: detailData.Result || 'N/A',
                                ResultType: detailData.ResultType || 'N/A',
                                ParticipantCode: detailData.ParticipantCode,
                                CountryCode: detailData.CountryCode,
                            };
                        })
                        .catch(function (error) {
                            console.error(`Erro ao carregar detalhes do participante ${participantId}:`, error);
                            return null; 
                        });
                });
    
                Promise.all(participantPromises).then(function (formattedDataArray) {
                   
                    const validData = formattedDataArray.filter(item => item !== null);
                    console.log('Dados formatados (válidos):', validData);
                    self.ParticipantDetails(validData);
                }).catch(function (error) {
                    console.error('Erro ao processar detalhes dos participantes:', error);
                    self.ParticipantDetails([]);
                });
    
            } else {
                console.warn('Dados não são um array:', data);
                self.ParticipantDetails([]);
            }
        }).fail(function (error) {
            console.error('Erro ao carregar participantes:', error);
            self.ParticipantDetails([]);
        });
    };
    
    self.loadParticipantDetails = function (participantId) {
        var composedUri = `http://192.168.160.58/Paris2024/api/Canoe_sprints/${encodeURIComponent(participantId)}`;
        console.log('ParticipantDetails:', ko.toJS(self.ParticipantDetails));
        return new Promise(function (resolve, reject) {
            ajaxHelper(composedUri, 'GET').done(function (data) {
                console.log('Detalhes do participante:', data);
                if (data && data.Id) {
                    resolve({
                        Venue: data.Venue,
                        CountryCode: data.CountryCode,
                        Date: data.Date,
                        Sex: data.Sex,
                        ParticipantCode: data.ParticipantCode,
                        Rank: data.Rank,
                        Result: data.Result,
                        ResultType: data.ResultType,
                        ResultIRM: data.ResultIRM,
                        ResultDiff: data.ResultDiff,
                        ResultWLT: data.ResultWLT,
                        QualificationMark: data.QualificationMark,
                        StartOrder: data.StartOrder,
                        Bib: data.Bib,
                        CountryFlag: data.CountryFlag || 'Images/PersonNotFound.png',
                        NOCFlag: data.NOCFlag
                    });
                } else {
                    reject('Erro ao carregar detalhes do participante');
                }
            }).fail(function (error) {
                console.log('Erro ao carregar detalhes do participante:', error);
                reject(error);
            });
        });
    };
    
    

    function ajaxHelper(uri, method, data) {
        return $.ajax({
            type: method,
            url: uri,
            dataType: 'json',
            contentType: 'application/json',
            data: data ? JSON.stringify(data) : null,
            timeout: 10000,  
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("AJAX Call[" + uri + "] Fail... Error: " + textStatus);
                hideLoading();
                self.error("Erro na requisição: " + textStatus + " - " + errorThrown);  
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
        setTimeout(function () {
            $('#myModal').modal('hide');
        }, 1000);
    }

    showLoading();
    self.activate();
};

$(document).ready(function () {
    ko.applyBindings(new vm());
});
