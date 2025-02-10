import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiAlertTriangle } from 'react-icons/fi';
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
        <h1 className="welcome-title">Olá Nome usuario</h1>
        
        <p className="welcome-subtitle">
          Bem-vindo à entrevista de <span className="highlight">Dev senior</span>!
        </p>

        <div className="alert-section">
          <FiAlertTriangle className="alert-icon" />
          <p className="alert-text">
            Para garantir uma experiência ideal, siga as instruções abaixo com atenção.
          </p>
          <FiAlertTriangle className="alert-icon" />
        </div>

        <div className="important-notice">
          <p>
            Lembre-se: você terá apenas uma chance para responder a todas as perguntas. 
            Então, só comece quando estiver seguro de que pode concluir a entrevista.
          </p>
          <p>
            Realizar a entrevista em um local silencioso para não atrapalhar a avaliação.
          </p>
        </div>

        <div className="instructions-list">
          <ul>
            <li>Quando estiver pronto, clique em <span className="highlight">"Aceito Prosseguir"</span>.</li>
            <li>Você será levado para a página de <span className="highlight">Etapas do Processo</span>, onde poderá acompanhar o progresso e os requisitos de cada etapa.</li>
            <li>Selecione a próxima etapa do processo para iniciar.</li>
            <li>Clique em <span className="highlight">"Iniciar Resposta"</span>. Você terá <span className="highlight">20 segundos</span> para ler a pergunta e <span className="highlight">3 minutos</span> para respondê-la.</li>
            <li>Faça sua entrevista, respondendo as perguntas que aparecem na tela.</li>
            <li>Ao terminar, finalize clicando em <span className="highlight">"Encerrar Resposta"</span>.</li>
            <li>Caso precise de ajuda, clique no botão de <span className="highlight">Suporte</span>.</li>
            <li>A próxima pergunta aparecerá automaticamente após o processamento.</li>
            <li>Siga esse processo até a última pergunta.</li>
            <li>Ao responder a última, clique em <span className="highlight">"Finalizar"</span> e aguarde brevemente o feedback na tela.</li>
          </ul>
        </div>

        <p className="motivation-text">
          Você está preparado, e acreditamos em você. Vamos lá!
        </p>

        <button 
          className="continue-button"
          onClick={handleContinue}
        >
          Aceito Prosseguir
        </button>
      </div>
    </div>
  );
};

export default Instructions; 