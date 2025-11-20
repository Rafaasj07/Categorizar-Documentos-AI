// Componente de feedback visual para estados de carregamento
const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="w-16 h-16 border-4 border-t-transparent border-solid border-indigo-400 rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingSpinner;