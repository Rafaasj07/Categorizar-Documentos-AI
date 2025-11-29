import { useState, useEffect } from 'react';

const FormularioDocumento = ({ aoAnalisar, carregando }) => {
  const [promptUsuario, setPromptUsuario] = useState('');
  const [arquivos, setArquivos] = useState([]);
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

  // Reseta subcontexto se o contexto principal mudar
  useEffect(() => {
    if (contextoSelecionado !== 'Gestão Educacional') {
      setSubContextoSelecionado(''); 
    } else if (!subContextoSelecionado) {
      setSubContextoSelecionado(''); 
    }
  }, [contextoSelecionado]);

  // Processa novos arquivos, valida tamanho/quantidade e adiciona à lista existente
  const aoMudarArquivo = (evento) => {
    const novosArquivos = Array.from(evento.target.files || []);
    setArquivoErro('');

    if (novosArquivos.length === 0) return;

    // Verificação Adicionada: Impede adição se ultrapassar o limite, mas mantém os anteriores
    if (arquivos.length + novosArquivos.length > MAXIMO_ARQUIVOS) {
      setArquivoErro(`Mais de ${MAXIMO_ARQUIVOS} arquivos selecionados.`);
      evento.target.value = ''; 
      return;
    }

    const arquivosValidos = [];
    let erroEncontrado = '';

    // Filtra duplicatas e valida tamanho
    for (const file of novosArquivos) {
      const jaExiste = arquivos.some(a => a.name === file.name && a.size === file.size);
      
      if (jaExiste) continue; 

      if (file.size > TAMANHO_MAXIMO_EM_BYTES) {
        const tamanhoEmMb = (TAMANHO_MAXIMO_EM_BYTES / (1024 * 1024)).toFixed(1);
        erroEncontrado = `Arquivo "${file.name}" excede ${tamanhoEmMb}MB.`;
        break;
      }
      arquivosValidos.push(file);
    }

    if (erroEncontrado) {
      setArquivoErro(erroEncontrado);
    } else {
      setArquivos(prev => [...prev, ...arquivosValidos]);
    }
    
    evento.target.value = ''; 
  };

  // Remove um arquivo específico da lista pelo índice
  const removerArquivo = (index) => {
    setArquivos(prev => prev.filter((_, i) => i !== index));
    setArquivoErro(''); 
  };

  // Dispara o clique no input file oculto
  const abrirSeletorArquivos = () => {
    document.getElementById('input-arquivo-oculto').click();
  };

  const aoSubmeter = (evento) => {
    evento.preventDefault();
    aoAnalisar(contextoSelecionado, subContextoSelecionado, promptUsuario, arquivos);
  };

  return (
    <div className="w-full max-w-3xl px-4 rounded-lg mb-8">
      <form onSubmit={aoSubmeter}>

        <div className="mb-6">
          <label className="block text-gray-300 text-lg font-semibold mb-2">
            1. Arquivos (Máx: {MAXIMO_ARQUIVOS} | 5MB cada)
          </label>
          
          {/* Input oculto controlado pelo botão abaixo */}
          <input
            type="file"
            id="input-arquivo-oculto"
            accept=".pdf"
            onChange={aoMudarArquivo}
            disabled={carregando}
            multiple
            className="hidden"
          />

          <button
            type="button"
            onClick={abrirSeletorArquivos}
            disabled={carregando || arquivos.length >= MAXIMO_ARQUIVOS}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            <i className='bx bx-plus-circle text-xl'></i>
            Adicionar PDF
          </button>

          {/* Lista de arquivos selecionados com opção de remoção */}
          {arquivos.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 space-y-2">
              {arquivos.map((file, index) => (
                <div key={`${file.name}-${index}`} className="flex justify-between items-center text-sm bg-gray-700/50 p-2 rounded">
                  <span className="text-gray-200 truncate mr-2">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removerArquivo(index)}
                    className="text-red-400 hover:text-red-300 transition-colors p-1"
                    title="Remover arquivo"
                  >
                    <i className='bx bx-trash text-lg'></i>
                  </button>
                </div>
              ))}
              <p className="text-gray-500 text-xs text-right mt-2">Total: {arquivos.length} arquivo(s)</p>
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
            disabled={
                carregando ||
                arquivos.length === 0 || 
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