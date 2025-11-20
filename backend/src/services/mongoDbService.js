import Documento from '../models/Document.js';

// Salva novos metadados de documento no banco
export async function registrarMetadados(metadata) {
    try {
        const novoDocumento = new Documento(metadata);
        await novoDocumento.save();
    } catch (error) {
        console.error("Erro ao registrar metadados:", error);
        throw new Error("Falha ao registrar informações do documento.");
    }
}

// Atualiza campo resultadoIa verificando estrutura mínima
export async function atualizarApenasMetadadosIA(doc_uuid, novoResultadoIa) {
    try {
        // Valida presença de campos obrigatórios
        if (!novoResultadoIa || !novoResultadoIa.categoria || typeof novoResultadoIa.metadados !== 'object') {
            throw new Error("Formato de metadados inválido. 'categoria' e 'metadados' são obrigatórios.");
        }

        // Atualiza documento e retorna versão nova
        const resultado = await Documento.findOneAndUpdate(
            { doc_uuid },
            { $set: { resultadoIa: novoResultadoIa } },
            { new: true } 
        );

        if (!resultado) {
            throw new Error("Documento não encontrado para atualização.");
        }
    } catch (error) {
        console.error(`Erro ao atualizar metadados manualmente (doc_uuid: ${doc_uuid}):`, error);
        throw new Error("Falha ao atualizar metadados no banco.");
    }
}

// Atualiza status e opcionalmente resultado da IA
export async function atualizarMetadados(doc_uuid, novoStatus, resultadoIa) {
    try {
        const updateData = { status: novoStatus };
        
        if (resultadoIa !== null) { 
            updateData.resultadoIa = resultadoIa;
        }
        
        await Documento.findOneAndUpdate({ doc_uuid }, { $set: updateData });
    } catch (error) {
        console.error(`Erro ao atualizar metadados (doc_uuid: ${doc_uuid}):`, error);
    }
}

// Busca documentos com filtros, ordenação e paginação baseada em token
export async function buscarDocumentos(user, termo, categoria, sortOrder = 'desc', limit = 10, nextToken = null) {
    try {
        // Decodifica token para calcular deslocamento
        const page = nextToken ? parseInt(Buffer.from(nextToken, 'base64').toString('utf-8')) : 1;
        const skip = (page - 1) * limit;

        const query = {};
        
        // Restringe busca a documentos do usuário se não for admin
        if (user.role !== 'admin') { 
            query.userId = user.id;
        }
        
        // Aplica regex em múltiplos campos de metadados e nome
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
        
        // Filtra por categoria exata ignorando case
        if (categoria) { 
            query['resultadoIa.categoria'] = { $regex: `^${categoria.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, $options: 'i' };
        }

        // Executa query com ordenação e limite definidos
        const documentos = await Documento.find(query)
            .sort({ uploadedTimeStamp: sortOrder === 'asc' ? 1 : -1 }) 
            .skip(skip) 
            .limit(limit) 
            .lean(); 

        // Calcula token para próxima página se houver mais resultados
        const totalDocumentos = await Documento.countDocuments(query);
        const hasNextPage = (skip + documentos.length) < totalDocumentos;
        const nextTokenString = hasNextPage ? Buffer.from((page + 1).toString()).toString('base64') : null;

        return { documentos, nextToken: nextTokenString };
    } catch (error) {
        console.error("Erro ao buscar documentos:", error);
        throw new Error("Falha ao buscar documentos.");
    }
}

// Remove documento pelo UUID
export async function apagarMetadados(doc_uuid) {
    try {
        await Documento.findOneAndDelete({ doc_uuid });
    } catch (error) {
        console.error(`Erro ao apagar metadados (doc_uuid: ${doc_uuid}):`, error);
        throw new Error("Falha ao apagar os metadados do documento.");
    }
}

// Retorna lista ordenada de categorias únicas processadas
export async function listarCategoriasUnicas() {
    try {
        // Agrega categorias distintas excluindo vazios
        const categorias = await Documento.distinct('resultadoIa.categoria', {
            status: 'PROCESSED', 
            'resultadoIa.categoria': { $exists: true, $ne: null, $ne: "" } 
        });
        
        return categorias.sort((a, b) => a.localeCompare(b));
    } catch (error) {
        console.error("Erro ao listar categorias:", error);
        throw new Error("Falha ao listar categorias.");
    }
}