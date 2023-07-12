const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const rastrearEncomendas = require('correios-brasil').rastrearEncomendas;

app.use(bodyParser.json());

app.post('/rastrear', (req, res) => {
    const codRastreio = req.body.codigos || [];
    
    if (codRastreio.length === 0) {
        return res.status(400).json({ error: 'Nenhum código de rastreamento fornecido.' });
    }

    rastrearEncomendas(codRastreio).then((response) => {

        const response_js = [];

        for (let i = 0; i < response.length; i++) {

            const objeto = response[i];
            const eventos = objeto.eventos.reverse();
            const eventos_js = [];

            for (let j = 0; j < eventos.length; j++) {
                
                const evento = eventos[j];
                const data = new Date(evento.dtHrCriado);
                let origem, destino, descricao;

                if (evento.descricao != 'Objeto em trânsito - por favor aguarde') {

                    destino = null;
                    descricao = evento.descricao;

                    if(evento.descricao === 'Objeto recebido na unidade de exportação no país de origem') descricao = 'Objeto recebido na unidade de exportação';

                    if (Object.keys(evento.unidade.endereco).length === 0) {

                        if (evento.unidade.tipo === 'País') 
                            origem = evento.unidade.nome + ' - Internacional';
                        else 
                            origem = evento.unidade.nome;
                    } 
                    else {

                        if (evento.unidade.tipo === 'Unidade de Logística Integrada')
                            origem = 'Unidade de Logística - ' + evento.unidade.endereco.cidade + '/' + evento.unidade.endereco.uf;
                        else 
                            origem = evento.unidade.tipo + ' - ' + evento.unidade.endereco.cidade + '/' + evento.unidade.endereco.uf;
                    }
                } 
                else {

                    descricao = 'Objeto em trânsito';

                    if (evento.unidade.tipo === 'Unidade de Logística Integrada')
                        origem = 'Unidade de Logística - ' + evento.unidade.endereco.cidade + '/' + evento.unidade.endereco.uf;
                    else 
                        
                        if(evento.unidade.tipo === 'País')
                            origem = evento.unidade.nome + ' - Internacional';
                        else    
                            origem = evento.unidade.tipo + ' - ' + evento.unidade.endereco.cidade + '/' + evento.unidade.endereco.uf;

                    if (evento.unidadeDestino.tipo === 'Unidade de Logística Integrada')
                        destino = 'Unidade de Logística - ' + evento.unidadeDestino.endereco.cidade + '/' + evento.unidadeDestino.endereco.uf;
                    else

                        if(evento.unidade.tipo === 'País')
                            destino = evento.unidadeDestino.nome + ' - ' + evento.unidadeDestino.endereco.uf;
                        else 
                            destino = evento.unidadeDestino.nome + ' - ' + evento.unidadeDestino.endereco.cidade + '/' + evento.unidadeDestino.endereco.uf;
                }

                const evento_js = {

                    "data": data.toISOString(),
                    "descricao": descricao,
                    "origem": origem,
                    "destino": destino,
                };

                eventos_js.push(evento_js);
            }

            const objeto_js = {

                "objeto": objeto.codObjeto,
                "eventos": eventos_js,
            };

            response_js.push(objeto_js);
        }

        res.json(response_js)}).catch((error) => { res.status(500).json({ error: 'Erro ao rastrear encomendas: ' + error }); });
    });

    app.listen(process.env.PORT || 3000, () => {
    console.log('Servidor iniciado na porta 3000.');
});
