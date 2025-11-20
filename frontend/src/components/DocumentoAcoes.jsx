import { useState } from 'react';
import { apiDownloadDocumento } from '../services/api';
import { flattenMetadata } from '../utils/renderUtils';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import FeedbackModal from './FeedbackModal';

const DocumentoAcoes = ({ doc, showFeedbackButton = true }) => {
  const [downloading, setDownloading] = useState(null);
  const [erro, setErro] = useState('');
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  // Obtém blob do arquivo via API e força download via link temporário
  const handleDownload = async (docToDownload) => {
    if (!docToDownload) return;
    setDownloading(docToDownload.doc_uuid);
    setErro('');
    try {
      const blob = await apiDownloadDocumento(docToDownload);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', docToDownload.fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const errorMsg = 'Não foi possível realizar o download.';
      setErro(errorMsg);
      alert(errorMsg);
    } finally {
      setDownloading(null);
    }
  };

  // Gera PDF client-side listando os metadados extraídos
  const handleDownloadMetadata = (docToDownload) => {
    if (!docToDownload || !docToDownload.resultadoIa || !docToDownload.resultadoIa.metadados) {
      const errorMsg = "Metadados não disponíveis para gerar PDF.";
      setErro(errorMsg);
      alert(errorMsg);
      return;
    }

    setDownloading(docToDownload.doc_uuid + '_meta');
    setErro('');
    try {
      const pdf = new jsPDF();
      const { resultadoIa, fileName } = docToDownload;
      const { categoria, metadados } = resultadoIa;

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text(`Metadados do Documento`, 14, 22);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      pdf.text(`Arquivo: ${fileName}`, 14, 30);
      pdf.text(`Categoria Identificada: ${categoria}`, 14, 36);

      // Processa estrutura de dados e gera tabela no PDF
      const metadataRows = flattenMetadata(metadados);

      autoTable(pdf, {
        startY: 45,
        head: [['Campo', 'Valor']],
        body: metadataRows,
        headStyles: { fillColor: [79, 70, 229] },
        theme: 'grid',
        styles: {
          cellPadding: 2,
          fontSize: 9,
          overflow: 'linebreak',
        },
        columnStyles: {
          0: { cellWidth: 60, fontStyle: 'bold' },
          1: { cellWidth: 'auto' },
        }
      });

      const pdfFileName = `metadados_${fileName.replace(/.[^/.]+$/, "")}.pdf`;
      pdf.save(pdfFileName);

    } catch (err) {
      console.error("Erro ao gerar PDF de metadados:", err);
      const errorMsg = "Erro ao gerar PDF de metadados.";
      setErro(errorMsg);
      alert(errorMsg);
    } finally {
      setDownloading(null);
    }
  };

  if (!doc) return null;

  // Habilita feedback apenas para categorias válidas/identificadas
  const canGiveFeedback = doc.resultadoIa &&
    doc.resultadoIa.categoria &&
    doc.resultadoIa.categoria !== 'Não Identificado' &&
    doc.resultadoIa.categoria !== 'Indefinida';

  return (
    <>
      {erro && <p className="text-red-500 text-sm text-center mt-2">{erro}</p>}

      <div className="flex flex-col sm:flex-row justify-start gap-4 mt-6 pt-4 border-t border-gray-700">

        {canGiveFeedback && showFeedbackButton && (
          <button
            onClick={() => setIsFeedbackModalOpen(true)}
            disabled={downloading !== null}
            className="flex items-center justify-center gap-2 px-5 py-2.5 font-medium text-sm text-indigo-400 bg-gray-900 border border-indigo-600 rounded-lg hover:bg-indigo-900/50 disabled:bg-gray-800 disabled:opacity-50 disabled:cursor-wait transition-colors"
          >
            <i className="bx bx-star text-lg"></i>
            Dar Feedback
          </button>
        )}

        <button
          onClick={() => handleDownloadMetadata(doc)}
          disabled={downloading === doc.doc_uuid + '_meta' || !doc.resultadoIa?.metadados}
          className="flex items-center justify-center gap-2 px-5 py-2.5 font-medium text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-wait transition-colors"
        >
          {downloading === doc.doc_uuid + '_meta' ? (
            <i className="bx bx-loader-alt animate-spin text-lg"></i>
          ) : (
            <i className="bx bxs-file-pdf text-lg"></i>
          )}
          Baixar Metadados
        </button>

        <button
          onClick={() => handleDownload(doc)}
          disabled={downloading === doc.doc_uuid}
          className="flex items-center justify-center gap-2 px-5 py-2.5 font-medium text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-wait transition-colors"
        >
          {downloading === doc.doc_uuid ? (
            <i className="bx bx-loader-alt animate-spin text-lg"></i>
          ) : (
            <i className="bx bxs-download text-lg"></i>
          )}
          Baixar Documento
        </button>
      </div>

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        doc={doc}
      />
    </>
  );
};

export default DocumentoAcoes;