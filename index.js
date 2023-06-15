var rastrearEncomendas = require('correios-brasil').rastrearEncomendas;
var codRastreio = ['NL609847554BR', 'NL587173487BR'];

// ------------------------------------------------------------------------------ //

rastrearEncomendas(codRastreio).then(function (response) {

    var response_js = [];

    for (var i = 0; i < response.length; i++) {

        var objeto = response[i];
        var eventos = objeto.eventos.reverse();
        var eventos_js = [];

        for (var j = 0; j < eventos.length; j++) {

            var evento = eventos[j];

            // ---------------------------------- //

            var data = new Date(evento.dtHrCriado);
            var origem, destino;

            if(evento.descricao != 'Objeto em trânsito - por favor aguarde') {

                destino = null;

                if (Object.keys(evento.unidade.endereco).length == 0) {

                    if(evento.unidade.tipo == "País") 
                        origem = evento.unidade.nome + " - Internacional";
                    else 
                        origem = evento.unidade.nome;
                }
                else {

                    if(evento.unidade.tipo == "Unidade de Logística Integrada")
                        origem = "Unidade de Logística - " + evento.unidade.endereco.cidade + "/" + evento.unidade.endereco.uf;
                    else
                        origem = evento.unidade.tipo + " - " + evento.unidade.endereco.cidade + "/" + evento.unidade.endereco.uf;
                }
            }
            else {

                if(evento.unidade.tipo == "Unidade de Logística Integrada")
                    origem = "Unidade de Logística - " + evento.unidade.endereco.cidade + "/" + evento.unidade.endereco.uf;
                else
                    origem = evento.unidade.tipo + " - " + evento.unidade.endereco.cidade + "/" + evento.unidade.endereco.uf;
                
                if(evento.unidadeDestino.tipo == "Unidade de Logística Integrada")
                    destino = "Unidade de Logística - " + evento.unidadeDestino.endereco.cidade + "/" + evento.unidadeDestino.endereco.uf;
                else
                    destino = evento.unidadeDestino.nome + " - " + evento.unidadeDestino.endereco.cidade + "/" + evento.unidadeDestino.endereco.uf;
            }

            // ---------------------------------- //

            let evento_js = {

                data: data.toISOString(),
                descricao: evento.descricao,
                origem: origem,
                destino: destino
            };

            eventos_js.push(evento_js);
        }

        // ---------------------------------- //

        var objeto_js = {

            objeto: objeto.codObjeto,
            eventos: eventos_js
        };

        response_js.push(objeto_js);
    }

    console.log(JSON.stringify(response_js, null, 4));
});
