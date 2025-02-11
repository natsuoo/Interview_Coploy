import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import '../styles/Instructions.css';

const Instructions: React.FC = () => {
  const navigate = useNavigate();
  const { entrevistaId } = useParams<{ entrevistaId: string }>();

  const handleContinue = () => {
    navigate(`/teste-microfone/${entrevistaId}`);
  };

  return (
    <div className="instructions-container">
      <div className="instructions-content">
        <div className="header-section">
          <h1 className="welcome-title">Olá, Candidato</h1>
          <p className="welcome-subtitle">
            Entrevista para <span className="highlight">Dev Senior</span>
          </p>
        </div>

        <div className="alert-section">
          <AlertTriangle size={20} />
          <p>Siga as instruções abaixo para uma melhor experiência</p>
        </div>

        <div className="steps-container">
          <div className="step">
            <div className="step-number">01</div>
            <div className="step-content">
              <h3>Preparação</h3>
              <p>Escolha um local silencioso e bem iluminado. Você terá uma única chance para responder todas as perguntas.</p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">02</div>
            <div className="step-content">
              <h3>Processo</h3>
              <p>Você terá 20 segundos para ler cada pergunta e 3 minutos para respondê-la.</p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">03</div>
            <div className="step-content">
              <h3>Gravação</h3>
              <p>Clique em "Iniciar Resposta" quando estiver pronto. Ao terminar, clique em "Encerrar Resposta".</p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">04</div>
            <div className="step-content">
              <h3>Finalização</h3>
              <p>Após responder todas as perguntas, clique em "Finalizar" e aguarde o feedback.</p>
            </div>
          </div>
        </div>

        <button 
          className="continue-button"
          onClick={handleContinue}
        >
          Continuar
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default Instructions;