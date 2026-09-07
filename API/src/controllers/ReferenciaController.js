import referenciaService from '../services/ReferenciaService.js';

// FUNÇÃO AUDITORIA LOG-SERVICE
const registrarLog = async (usuario_id, acao, ip, detalhes) => {
    try {
        await fetch('http://log-service:3002/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_id, acao, ip, detalhes })
        });
    } catch (error) {
        console.error('[AUDITORIA] Falha ao contatar LogService:', error.message);
    }
};

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
            const ipUsuario = req.headers['x-forwarded-for'] || req.ip || 'Desconhecido';
            const idBanco = await referenciaService.salvarReferencia(usuarioId, unsplashId, urlImagem, comentario);
            
            registrarLog(
                usuarioId, 
                'FAVORITAR_REFERENCIA', 
                ipUsuario, 
                `Salvou a imagem ID ${unsplashId} com comentário: "${comentario || 'Sem comentário'}"`
            );

            res.status(201).json({ mensagem: 'Referência salva com sucesso!', id: idBanco });
        } catch (erro) {
            const ipUsuario = req.headers['x-forwarded-for'] || req.ip || 'Desconhecido';
   
            registrarLog(req.usuarioId, 'ERRO_SALVAR_REFERENCIA', ipUsuario, `Erro: ${erro.message}`);
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