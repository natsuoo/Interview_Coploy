import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import '../styles/EntrevistaFinalizada.css';

const EntrevistaFinalizada: React.FC = () => {
  const navigate = useNavigate();

  const handleVoltar = () => {
    navigate('/');
  };

  return (
    <div className="entrevista-finalizada">
      <div className="entrevista-card">
        <div className="flex justify-center">
          <div className="icon-container">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-semibold text-white">
            Entrevista Finalizada!
          </h1>
         
          <p className="text-gray-400 text-sm">
            Obrigado por participar. <br></br>Suas respostas foram enviadas com sucesso.
          </p>
        </div>
        <br></br>
        <button
          onClick={handleVoltar}
          className="px-6 py-3 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-lg transition-colors"
        >
          Voltar ao início
        </button>
      </div>
    </div>
  );
};

export default EntrevistaFinalizada; 