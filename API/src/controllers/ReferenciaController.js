import referenciaService from '../services/ReferenciaService.js';

class ReferenciaController {
    async buscarExterna(req, res) {
        try {
            const { query } = req.query;
            const imagens = await referenciaService.buscarImagens(query);
            res.json(imagens);
        } catch (erro) {
            res.status(500).json({ erro: erro.message });
        }
    }

    async salvar(req, res) {
        try {
            const usuarioId = req.usuarioId; 
            const { unsplashId, urlImagem, comentario } = req.body;

            const idBanco = await referenciaService.salvarReferencia(usuarioId, unsplashId, urlImagem, comentario);
            res.status(201).json({ mensagem: 'Referência salva com sucesso!', id: idBanco });
        } catch (erro) {
            res.status(500).json({ erro: erro.message });
        }
    }

    async listar(req, res) {
        try {
            const referencias = await referenciaService.listarReferencias(req.usuarioId);
            res.json(referencias);
        } catch (erro) {
            res.status(500).json({ erro: erro.message });
        }
    }
}

export default new ReferenciaController();