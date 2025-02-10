import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiRefreshCw } from 'react-icons/fi';
import '../styles/CameraTest.css';
import logo from '../public/logo.png';
import toast from 'react-hot-toast';

const CameraTest: React.FC = () => {
  const navigate = useNavigate();
  const { entrevistaId } = useParams<{ entrevistaId: string }>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraWorking, setIsCameraWorking] = useState(false);
  const [hasCameraAccess, setHasCameraAccess] = useState(false);

  useEffect(() => {
    const initializeCameras = async () => {
      try {
        // Primeiro solicita permissão para acessar a câmera
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop()); // Para a stream inicial

        // Agora enumera os dispositivos para obter os labels
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setCameras(videoDevices);
        setHasCameraAccess(videoDevices.length > 0);
        
        if (videoDevices.length > 0) {
          setSelectedCamera(videoDevices[0].deviceId);
        }
      } catch (error) {
        console.error('Erro ao carregar câmeras:', error);
        setHasCameraAccess(false);
      }
    };

    initializeCameras();
  }, []);

  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          aspectRatio: 16/9
        }
      });

      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        setIsCameraWorking(true);
      }
    } catch (error) {
      console.error('Erro ao iniciar câmera:', error);
      setIsCameraWorking(false);
      
      if (error instanceof DOMException && error.name === 'NotReadableError') {
        toast.error(
          'Não foi possível iniciar esta câmera. Por favor, selecione outra câmera ou verifique se ela não está sendo usada por outro aplicativo.',
          {
            duration: 5000,
            position: 'top-right',
          }
        );
      } else {
        toast.error('Ocorreu um erro ao iniciar a câmera. Por favor, tente novamente.', {
          duration: 5000,
          position: 'top-right',
        });
      }
    }
  };

  useEffect(() => {
    if (selectedCamera) {
      startCamera();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [selectedCamera]);

  const handleContinue = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    sessionStorage.setItem('cameraTestPassed', 'true');
    navigate(`/video/${entrevistaId}`);
  };

  return (
    <div className="camera-test-container">
      <div className="logo-container">
        <img src={logo} alt="Logo" className="logo" />
      </div>

      <div className="test-content">
        <h1 className="welcome-title">Teste sua Câmera</h1>
        <p className="test-instruction">
          Vamos verificar se sua câmera está funcionando corretamente
        </p>
        <p className="test-steps">
          Você deve conseguir se ver no preview abaixo
        </p>
        <p className="device-instruction">
          Selecione sua câmera e verifique se a imagem está clara
        </p>

        <div className="test-area">
          <div className="camera-preview">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="camera-video"
            />
          </div>

          <div className="controls-section">
            <h2 className="test-subtitle">Ajuste sua câmera</h2>
            <p className="verification-text">
              Certifique-se de que você está bem enquadrado e visível
            </p>

            <div className="camera-selector">
              <label>Câmeras disponíveis:</label>
              <select
                value={selectedCamera}
                onChange={(e) => setSelectedCamera(e.target.value)}
              >
                {cameras.map((camera, index) => (
                  <option key={camera.deviceId} value={camera.deviceId}>
                    {camera.label || `Câmera ${index + 1}`}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="refresh-button"
              onClick={startCamera}
            >
              <FiRefreshCw />
              Reiniciar Câmera
            </button>
          </div>
        </div>

        {isCameraWorking && hasCameraAccess && (
          <div className="continue-section">
            <button 
              className="continue-button"
              onClick={handleContinue}
            >
              Continuar para Entrevista
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraTest; 