var vm = function () {
    var self = this;

    // URL da API base
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/api/Athletics/Events');

    // Observables para evento, estágio e participantes
    self.selectedEventId = ko.observable();  // Evento selecionado
    self.selectedStageId = ko.observable();   // Estágio selecionado
    self.selectedEventStages = ko.observableArray([]);  // Armazena os estágios do evento
    self.Events = ko.observableArray([]);  // Armazena todos os eventos
    self.ParticipantDetails = ko.observableArray([]);
    self.error = ko.observable("");  // Observável para exibir erro

    // Carregar os eventos da API
    self.activate = function () {
        var composedUri = self.baseUri();
        ajaxHelper(composedUri, 'GET').done(function (data) {
            self.Events(data);  // Carrega os eventos na lista
            hideLoading();
            const formattedData = data.map(item => {
                // Atualiza o tipo de participante conforme necessário
                if (item.ParticipantType === 'Person') {
                    item.ParticipantTypeFormatted = 'Athlete';
                } else if (item.ParticipantType === 'Team') {
                    item.ParticipantTypeFormatted = 'Teams';
                } else {
                    item.ParticipantTypeFormatted = formatValue(item.ParticipantType);
                }

                // Agora vamos buscar os detalhes do participante
                var participantId = item.Id;  // Pegamos o Id do participante
                self.getParticipantDetails(participantId, item); // Chama a função para buscar os detalhes

                return item;
            });
        });
    };
    self.getParticipantDetails = function (participantId, participant) {
        var detailsUri = `http://192.168.160.58/Paris2024/api/Athletics/${encodeURIComponent(participantId)}`;
        console.log("Buscando detalhes do participante na URL:", detailsUri); // Log para verificar a URL
    
        return ajaxHelper(detailsUri, 'GET').done(function (details) {
            console.log('Detalhes do participante recebidos:', details);
    
            // Armazenar os detalhes do participante
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
    
            // Adiciona os detalhes ao array de participantes
            self.ParticipantDetails.push(participantDetail);
        }).fail(function (error) {
            console.error('Erro ao carregar detalhes do participante:', error);
        });
    };
    

    // Quando um evento for selecionado
    self.onEventChange = function () {
        var selectedEvent = self.Events().find(function (event) {
            return event.EventId === self.selectedEventId();
        });

        // Se o evento for encontrado, carrega os estágios
        if (selectedEvent) {
            self.selectedEventStages(selectedEvent.Stages);  // Atualiza os estágios
            self.selectedStageId(null);  // Limpa a seleção do estágio
            self.ParticipantDetails([]);  // Limpa os detalhes dos participantes ao mudar o evento
        } else {
            self.selectedEventStages([]);  // Limpa os estágios se nenhum evento for selecionado
            self.ParticipantDetails([]);  // Limpa os participantes ao mudar o evento
        }
    };

    // Quando um estágio for selecionado
    self.onStageChange = function () {
        // Verifica se um estágio foi selecionado
        if (self.selectedStageId()) {
            // Carrega os participantes para o estágio selecionado
            self.loadParticipants(self.selectedEventId(), self.selectedStageId());
        } else {
            // Se nenhum estágio for selecionado, limpa os participantes
            self.ParticipantDetails([]);
        }
    };

    // Função para carregar os participantes com base no evento e estágio selecionados
    self.loadParticipants = function (EventId, StageId) {
        // Criação da URI para buscar os participantes
        var composedUri = `http://192.168.160.58/Paris2024/api/Athletics/Participants?EventId=${encodeURIComponent(EventId)}&StageId=${encodeURIComponent(StageId)}`;
        console.log('Composed URI:', composedUri);
    
        // Chamada para buscar os participantes
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log('Dados recebidos:', data);
    
            if (Array.isArray(data)) {
                // Se os dados forem um array, buscar os detalhes completos de cada participante
                const participantPromises = data.map(function (item) {
                    const participantId = item.Id;
    
                    // Validar se o ID é válido antes de prosseguir
                    if (!participantId || typeof participantId !== 'number') {
                        console.warn('ID inválido para participante:', item);
                        return Promise.resolve(null); // Ignorar entradas inválidas
                    }
    
                    const participantDetailsUri = `http://192.168.160.58/Paris2024/api/Athletics/${participantId}`;
    
                    return ajaxHelper(participantDetailsUri, 'GET')
                        .then(function (detailData) {
                            // Processar e formatar os dados detalhados
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
                            return null; // Retornar null para indicar falha
                        });
                });
    
                // Espera que todas as promessas sejam resolvidas antes de atualizar o observable
                Promise.all(participantPromises).then(function (formattedDataArray) {
                    // Remover itens nulos (que falharam ao carregar)
                    const validData = formattedDataArray.filter(item => item !== null);
                    console.log('Dados formatados (válidos):', validData);
                    self.ParticipantDetails(validData);
                }).catch(function (error) {
                    console.error('Erro ao processar detalhes dos participantes:', error);
                    self.ParticipantDetails([]); // Atualizar com uma lista vazia em caso de falha geral
                });
    
            } else {
                console.warn('Dados não são um array:', data);
                self.ParticipantDetails([]);
            }
        }).fail(function (error) {
            console.error('Erro ao carregar participantes:', error);
            self.ParticipantDetails([]); // Atualizar com uma lista vazia em caso de falha
        });
    };
    
    

    // Função para carregar os detalhes do participante
    self.loadParticipantDetails = function (participantId) {
        var composedUri = `http://192.168.160.58/Paris2024/api/Athletics/${encodeURIComponent(participantId)}`;
        console.log('ParticipantDetails:', ko.toJS(self.ParticipantDetails));
        return new Promise(function (resolve, reject) {
            ajaxHelper(composedUri, 'GET').done(function (data) {
                console.log('Detalhes do participante:', data);
                if (data && data.Id) {
                    // Atribua os detalhes do participante sem modificar o Id ou outros campos chave
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
    
    

    // Função AJAX Helper
    function ajaxHelper(uri, method, data) {
        return $.ajax({
            type: method,
            url: uri,
            dataType: 'json',
            contentType: 'application/json',
            data: data ? JSON.stringify(data) : null,
            timeout: 10000,  // Aumente o timeout (em milissegundos)
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("AJAX Call[" + uri + "] Fail... Error: " + textStatus);
                hideLoading();
                self.error("Erro na requisição: " + textStatus + " - " + errorThrown);  // Atualiza o erro
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
        // Espera um pouco após a última requisição para garantir que todos os dados foram processados
        setTimeout(function () {
            $('#myModal').modal('hide');
        }, 1000); // Aguarda 1 segundo antes de esconder o loading
    }

    showLoading();
    // Inicializa a página carregando os eventos
    self.activate();
};

// Aplicando os bindings do Knockout
$(document).ready(function () {
    ko.applyBindings(new vm());
});
