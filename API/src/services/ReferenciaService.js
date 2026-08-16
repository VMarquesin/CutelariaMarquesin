import referenciaRepository from '../repositories/ReferenciaRepository.js';

class ReferenciaService {
    async buscarImagens(termoBusca = 'damascus knife') {
        const apiKey = process.env.UNSPLASH_API_KEY;
        const url = `https://api.unsplash.com/search/photos?query=${termoBusca}&per_page=10`;
        const resposta = await fetch(url, {
            headers: {
                'Authorization': `Client-ID ${apiKey}`
            }
        });

        if (!resposta.ok) {
            throw new Error('Falha ao buscar imagens no Unsplash');
        }

        const dados = await resposta.json();
        
        return dados.results.map(foto => ({
            unsplash_id: foto.id,
            url_imagem: foto.urls.regular,
            titulo: foto.alt_description || 'Referência de Cutelaria'
        }));
    }

    async salvarReferencia(usuarioId, unsplashId, urlImagem, comentario) {
        return await referenciaRepository.salvar(usuarioId, unsplashId, urlImagem, comentario);
    }

    async listarReferencias(usuarioId) {
        return await referenciaRepository.listarPorUsuario(usuarioId);
    }
}

export default new ReferenciaService();