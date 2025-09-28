import Documento from '../models/Document.js';

// Função auxiliar para padronizar texto (remove acentos, converte para minúsculas).
const normalizeString = (str) => {
    if (!str || typeof str !== 'string') return '';
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

// Salva as informações iniciais de um documento no banco.
export async function registrarMetadados(metadata) {
    try {
        const novoDocumento = new Documento(metadata);
        await novoDocumento.save();
    } catch (error) {
        console.error("Erro ao registrar metadados no MongoDB:", error);
        throw new Error("Falha ao registrar informações do documento.");
    }
}

// Atualiza um documento existente com o resultado da análise da IA e seu status.
export async function atualizarMetadados(doc_uuid, novoStatus, resultadoIa) {
    try {
        await Documento.findOneAndUpdate(
            { doc_uuid },
            { $set: { status: novoStatus, resultadoIa: resultadoIa } }
        );
    } catch (error) {
        console.error("Erro ao atualizar metadados no MongoDB:", error);
    }
}

// Realiza uma busca por documentos no banco com base em filtros e paginação.
export async function buscarDocumentos(user, termo, categoria, sortOrder = 'desc', limit = 10, nextToken = null) {
    try {
        // Lógica para calcular a paginação.
        const page = nextToken ? parseInt(Buffer.from(nextToken, 'base64').toString('utf-8')) : 1;
        const skip = (page - 1) * limit;

        // Monta a query de busca com base nos filtros recebidos.
        const query = {};

        // Se o usuário não for um admin, filtra os resultados para mostrar apenas os seus documentos.
        if (user.role !== 'admin') {
            query.userId = user.id;
        }

        if (termo) {
            const termoRegex = new RegExp(normalizeString(termo), 'i');
            query.$or = [
                { fileName: { $regex: termo, $options: 'i' } },
                { 'resultadoIa.categoria': { $regex: termo, $options: 'i' } },
                { 'resultadoIa.metadados.resumo': { $regex: termo, $options: 'i' } }
            ];
        }
        if (categoria) {
            query['resultadoIa.categoria'] = { $regex: categoria, $options: 'i' };
        }

        // Executa a busca no banco, aplicando ordenação e limites.
        const documentos = await Documento.find(query)
            .sort({ uploadedTimeStamp: sortOrder === 'asc' ? 1 : -1 })
            .skip(skip)
            .limit(limit);

        // Verifica se existem mais resultados para criar o token da próxima página.
        const totalDocumentos = await Documento.countDocuments(query);
        const hasNextPage = (skip + documentos.length) < totalDocumentos;

        const nextTokenString = hasNextPage
            ? Buffer.from((page + 1).toString()).toString('base64')
            : null;

        // Retorna os documentos encontrados e o token de paginação.
        return { documentos, nextToken: nextTokenString };
    } catch (error) {
        console.error("Erro ao buscar documentos no MongoDB:", error);
        throw new Error("Falha ao buscar documentos.");
    }
}

// Apaga o registro de um documento do banco de dados.
export async function apagarMetadados(doc_uuid) {
    try {
        await Documento.findOneAndDelete({ doc_uuid });
    } catch (error) {
        console.error("Erro ao apagar metadados do MongoDB:", error);
        throw new Error("Falha ao apagar os metadados do documento.");
    }
}

// Busca e retorna uma lista de todas as categorias únicas já registradas.
export async function listarCategoriasUnicas() {
    try {
        const categorias = await Documento.distinct('resultadoIa.categoria');
        // Filtra valores vazios e ordena a lista alfabeticamente.
        return categorias.filter(c => c).sort();
    } catch (error) {
        console.error("Erro ao listar categorias únicas no MongoDB:", error);
        throw new Error("Falha ao listar categorias.");
    }
}