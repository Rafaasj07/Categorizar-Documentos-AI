// Define o componente que exibe a animação de carregamento.
const LoadingSpinner = () => {
  return (
    // Cria um container que centraliza o spinner na tela.
    <div className="flex items-center justify-center min-h-screen bg-black">
      {/* Este é o elemento visual do spinner, um círculo que gira. */}
      <div className="w-16 h-16 border-4 border-t-transparent border-solid border-indigo-400 rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingSpinner;