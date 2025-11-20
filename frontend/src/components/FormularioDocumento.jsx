import { useState, useEffect } from 'react';

const FormularioDocumento = ({ aoAnalisar, carregando }) => {
  const [promptUsuario, setPromptUsuario] = useState('');
  const [arquivos, setArquivos] = useState([]);
  const [nomesArquivos, setNomesArquivos] = useState([]);
  const [arquivoErro, setArquivoErro] = useState('');
  const [contextoSelecionado, setContextoSelecionado] = useState('Padrão');
  const [subContextoSelecionado, setSubContextoSelecionado] = useState('');

  const TAMANHO_MAXIMO_EM_BYTES = 5 * 1024 * 1024; // 5MB
  const MAXIMO_ARQUIVOS = 10;

  const opcoesContexto = ['Padrão', 'Nota Fiscal', 'Gestão Educacional', 'Cartório', 'SEI'];

  const opcoesSubContextoGestao = [
    { value: '', label: 'Selecione o tipo específico...' },
    { value: 'Diploma', label: 'Diploma' },
    { value: 'Histórico Escolar', label: 'Histórico Escolar' },
    { value: 'Ata de Resultados', label: 'Ata de Resultados' },
    { value: 'Certificado', label: 'Certificado (Curso, Evento, etc.)' },
    { value: 'Plano de Ensino', label: 'Plano de Ensino (Disciplina)' },
    { value: 'Regimento Interno', label: 'Regimento Interno (Institucional)' },
    { value: 'Portaria ou Ato', label: 'Portaria ou Ato Administrativo' },
    { value: 'Registro de Matrícula', label: 'Registro de Matrícula/Rematrícula' },
    { value: 'Outro', label: 'Outro / Não sei (Genérico)' }
  ];

  // Reseta o subcontexto quando a categoria principal muda para evitar inconsistências
  useEffect(() => {
    if (contextoSelecionado !== 'Gestão Educacional') {
      setSubContextoSelecionado(''); 
    } else if (!subContextoSelecionado) {
      setSubContextoSelecionado(''); 
    }
  }, [contextoSelecionado]);

  // Valida quantidade e tamanho dos arquivos, atualizando estados ou definindo erros
  const aoMudarArquivo = (evento) => {
    const files = evento.target.files;
    setArquivos([]);
    setNomesArquivos([]);
    setArquivoErro('');
    if (!files || files.length === 0) return;

    if (files.length > MAXIMO_ARQUIVOS) {
      setArquivoErro(`Selecione no máximo ${MAXIMO_ARQUIVOS} arquivos.`);
      evento.target.value = ''; 
      return;
    }

    const arquivosValidos = [];
    const nomesValidos = [];
    let erroEncontrado = '';

    // Itera para verificar tamanho individual de cada arquivo
    for (const file of files) {
      if (file.size > TAMANHO_MAXIMO_EM_BYTES) {
        const tamanhoEmMb = (TAMANHO_MAXIMO_EM_BYTES / (1024 * 1024)).toFixed(1);
        erroEncontrado = `Arquivo "${file.name}" excede ${tamanhoEmMb}MB.`;
        break;
      }
      arquivosValidos.push(file);
      nomesValidos.push(file.name);
    }

    if (erroEncontrado) {
      setArquivoErro(erroEncontrado);
      evento.target.value = ''; 
    } else {
      setArquivos(arquivosValidos);
      setNomesArquivos(nomesValidos);
    }
  };

  // Envia dados validados para função de callback pai
  const aoSubmeter = (evento) => {
    evento.preventDefault();
    aoAnalisar(contextoSelecionado, subContextoSelecionado, promptUsuario, arquivos);
  };

  return (
    <div className="w-full max-w-3xl px-4 rounded-lg mb-8">
      <form onSubmit={aoSubmeter}>

        <div className="mb-6">
          <label htmlFor="arquivo" className="block text-gray-300 text-lg font-semibold mb-2">
            1. Envie até 10 PDFs (Máx: 5MB cada)
          </label>
          <input
            type="file" id="arquivo" accept=".pdf"
            onChange={aoMudarArquivo} disabled={carregando} multiple
            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-gray-200 hover:file:bg-gray-600 cursor-pointer"
          />
          {nomesArquivos.length > 0 && (
            <div className="text-green-400 text-sm mt-2">
              <p>{nomesArquivos.length} arquivo(s) selecionado(s):</p>
              <ul className="list-disc list-inside">
                {nomesArquivos.map((name, index) => (
                  <li key={index} className="break-all">{name}</li>
                ))}
              </ul>
            </div>
          )}
          {arquivoErro && <p className="text-red-500 text-sm mt-2">{arquivoErro}</p>}
        </div>

        <div className="mb-6">
          <label htmlFor="contexto" className="block text-gray-300 text-lg font-semibold mb-2">
            2. Contexto Principal
          </label>
          <div className="relative">
            <select
              id="contexto" value={contextoSelecionado}
              onChange={(e) => setContextoSelecionado(e.target.value)}
              disabled={carregando}
              className="appearance-none shadow-inner border border-gray-700 rounded-lg w-full py-3 pl-4 pr-10 bg-gray-800 text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {opcoesContexto.map((opcao) => (
                <option key={opcao} value={opcao}>{opcao}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-400">▼</span>
          </div>
            <p className="text-gray-400 text-sm mt-1">Define o prompt a ser usado pela IA.</p>
        </div>

        {/* Renderiza seletor específico condicionalmente para Gestão Educacional */}
        {contextoSelecionado === 'Gestão Educacional' && (
          <div className="mb-6 pl-4 border-l-2 border-indigo-500"> 
            <label htmlFor="subcontexto" className="block text-gray-300 text-lg font-semibold mb-2">
              2.1. Tipo Específico (Gestão Educacional)
            </label>
            <div className="relative">
              <select
                id="subcontexto" value={subContextoSelecionado}
                onChange={(e) => setSubContextoSelecionado(e.target.value)}
                disabled={carregando}
                className={`appearance-none shadow-inner border rounded-lg w-full py-3 pl-4 pr-10 bg-gray-800 text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer ${!subContextoSelecionado ? 'border-yellow-500' : 'border-gray-700'}`}
                required 
              >
                {opcoesSubContextoGestao.map((opcao) => (
                  <option key={opcao.value} value={opcao.value}>
                    {opcao.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-400">▼</span>
            </div>
            <p className="text-gray-400 text-sm mt-1">Selecione o tipo mais próximo para maior precisão.</p>
              {!subContextoSelecionado && (
                  <p className="text-yellow-400 text-sm mt-1">Por favor, selecione um tipo específico.</p>
              )}
          </div>
        )}

        <div className="mb-6">
           <label htmlFor="promptUsuario" className="block text-gray-300 text-lg font-semibold mb-2">
            3. Instrução Adicional (Opcional)
           </label>
          <input
            type="text" id="promptUsuario" value={promptUsuario}
            onChange={(e) => setPromptUsuario(e.target.value)}
            disabled={carregando}
            className="shadow-inner appearance-none border border-gray-700 rounded-lg w-full py-3 px-4 bg-gray-800 text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500"
            placeholder="Ex: Foque nos dados do aluno."
          />
        </div>

        <div className="flex items-center justify-center mt-8">
          <button
            type="submit"
            // Bloqueia envio se carregando, sem arquivos ou sem subcontexto obrigatório
            disabled={
                carregando ||
                arquivos.length === 0 ||
                !!arquivoErro ||
                (contextoSelecionado === 'Gestão Educacional' && !subContextoSelecionado)
            }
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 text-lg rounded-lg focus:outline-none focus:shadow-outline disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
          >
            {carregando ? 'Analisando...' : `Analisar ${arquivos.length} Documento(s)`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioDocumento;