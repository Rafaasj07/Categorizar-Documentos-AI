import Documento from '../models/Document.js';

/**
 * Salva os metadados iniciais de um novo documento no MongoDB.
 */
export async function registrarMetadados(metadata) {
    try {
        const novoDocumento = new Documento(metadata);
        // Salva a nova instância do documento.
        await novoDocumento.save();
    } catch (error) {
        console.error("Erro ao registrar metadados:", error);
        throw new Error("Falha ao registrar informações do documento.");
    }
}

/**
 * Atualiza o status e/ou o resultado da IA de um documento existente pelo UUID.
 */
export async function atualizarMetadados(doc_uuid, novoStatus, resultadoIa) {
    try {
        const updateData = { status: novoStatus };
        // Adiciona o resultado da IA ao objeto de atualização apenas se for fornecido.
        if (resultadoIa !== null) { 
            updateData.resultadoIa = resultadoIa;
        }
        // Encontra pelo UUID e atualiza os dados.
        await Documento.findOneAndUpdate({ doc_uuid }, { $set: updateData });
    } catch (error) {
        console.error(`Erro ao atualizar metadados (doc_uuid: ${doc_uuid}):`, error);
    }
}

/**
 * Busca documentos no MongoDB com filtros (usuário, termo, categoria), ordenação e paginação.
 * Retorna um objeto com a lista de 'documentos' e o 'nextToken'.
 */
export async function buscarDocumentos(user, termo, categoria, sortOrder = 'desc', limit = 10, nextToken = null) {
    try {
        // Decodifica o token (base64) para calcular a página e o 'skip'.
        const page = nextToken ? parseInt(Buffer.from(nextToken, 'base64').toString('utf-8')) : 1;
        const skip = (page - 1) * limit;

        // Monta o objeto de query base para o MongoDB.
        const query = {};
        // Se o usuário não for 'admin', filtra apenas por seus próprios documentos.
        if (user.role !== 'admin') { 
            query.userId = user.id;
        }
        // Adiciona busca por termo (regex) em múltiplos campos do documento.
        if (termo) { 
            const regex = new RegExp(termo.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');
            query.$or = [ 
                { fileName: regex },
                { 'resultadoIa.categoria': regex },
                { 'resultadoIa.metadados.resumo': regex },
                { 'resultadoIa.metadados.resumo_geral_ia': regex },
                 { 'resultadoIa.metadados.numero_documento': regex },
                 { 'resultadoIa.metadados.numero_processo_sei': regex },
                 { 'resultadoIa.metadados.assunto': regex },
                 { 'resultadoIa.metadados.objeto_principal': regex },
                 { 'resultadoIa.metadados.numero_nf': regex },
                 { 'resultadoIa.metadados.chave_acesso': regex },
                 { 'resultadoIa.metadados.emitente.nome_razao_social': regex },
                 { 'resultadoIa.metadados.destinatario.nome_razao_social': regex },
                 { 'resultadoIa.metadados.aluno.nome': regex },
                 { 'resultadoIa.metadados.curso_detalhes.nome': regex }
            ];
        }
        // Adiciona filtro exato (case-insensitive) para a categoria.
        if (categoria) { 
            query['resultadoIa.categoria'] = { $regex: `^${categoria.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, $options: 'i' };
        }

        // Executa a busca no banco com ordenação, skip e limit.
        const documentos = await Documento.find(query)
            .sort({ uploadedTimeStamp: sortOrder === 'asc' ? 1 : -1 }) 
            .skip(skip) 
            .limit(limit) 
            .lean(); 

        // Calcula se há uma próxima página e gera o token (base64) para ela.
        const totalDocumentos = await Documento.countDocuments(query);
        const hasNextPage = (skip + documentos.length) < totalDocumentos;
        const nextTokenString = hasNextPage ? Buffer.from((page + 1).toString()).toString('base64') : null;

        return { documentos, nextToken: nextTokenString };
    } catch (error) {
        console.error("Erro ao buscar documentos:", error);
        throw new Error("Falha ao buscar documentos.");
    }
}

/**
 * Apaga os metadados de um documento do MongoDB usando o UUID.
 */
export async function apagarMetadados(doc_uuid) {
    try {
        // Encontra e remove o documento pelo UUID.
        await Documento.findOneAndDelete({ doc_uuid });
    } catch (error) {
        console.error(`Erro ao apagar metadados (doc_uuid: ${doc_uuid}):`, error);
        throw new Error("Falha ao apagar os metadados do documento.");
    }
}

/**
 * Lista todas as categorias únicas de documentos que já foram 'PROCESSED'.
 * Retorna um array de strings ordenado.
 */
export async function listarCategoriasUnicas() {
    try {
        // Busca valores distintos no campo 'resultadoIa.categoria' com filtros.
        const categorias = await Documento.distinct('resultadoIa.categoria', {
            status: 'PROCESSED',
            'resultadoIa.categoria': { $exists: true, $ne: null, $ne: "" }
        });
        // Ordena as categorias alfabeticamente.
        return categorias.sort((a, b) => a.localeCompare(b));
    } catch (error) {
        console.error("Erro ao listar categorias:", error);
        throw new Error("Falha ao listar categorias.");
    }
}