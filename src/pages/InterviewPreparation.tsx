import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiMic, FiCamera, FiChevronDown } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import logo from '../public/logo.png';
import '../styles/InterviewPreparation.css';

const InterviewPreparation: React.FC = () => {
  const navigate = useNavigate();
  const { entrevistaId } = useParams<{ entrevistaId: string }>();
  const [micPermission, setMicPermission] = useState<boolean | null>(null);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [, setIsChecking] = useState(true);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>('');
  const [showCameraList, setShowCameraList] = useState(false);
  const [showMicList, setShowMicList] = useState(false);
  const [hasRequestedPermissions, setHasRequestedPermissions] = useState(false);

  const loadDevices = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          stream.getTracks().forEach(track => track.stop());
        })
        .catch(err => {
          if (err.name === 'NotReadableError') {
            toast.error('Um ou mais dispositivos estão sendo usados por outro aplicativo');
            return;
          }
          throw err;
        });

      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameraDevices = devices.filter(device => device.kind === 'videoinput');
      const micDevices = devices.filter(device => device.kind === 'audioinput');
      
      if (cameraDevices.length === 0) {
        toast.error('Nenhuma câmera encontrada');
        setCameraPermission(false);
      }
      
      if (micDevices.length === 0) {
        toast.error('Nenhum microfone encontrado');
        setMicPermission(false);
      }

      setCameras(cameraDevices);
      setMicrophones(micDevices);

      // Seleciona os primeiros dispositivos por padrão
      if (cameraDevices.length > 0) {
        setSelectedCamera(cameraDevices[0].label || `Câmera ${1}`);
        setCameraPermission(true);
      }
      if (micDevices.length > 0) {
        setSelectedMicrophone(micDevices[0].label || `Microfone ${1}`);
        setMicPermission(true);
      }
    } catch (error) {
      console.error('Erro ao carregar dispositivos:', error);
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          toast.error('Por favor, permita o acesso aos dispositivos para continuar');
          setMicPermission(false);
          setCameraPermission(false);
        } else {
          toast.error('Erro ao acessar dispositivos. Verifique as permissões do navegador.');
        }
      }
    }
  };

  const checkPermissions = async () => {
    setIsChecking(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true,
        video: true 
      });
      
      stream.getTracks().forEach(track => track.stop());
      setMicPermission(true);
      setCameraPermission(true);
      await loadDevices();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          toast.error('Por favor, permita o acesso ao microfone e câmera para continuar');
          setMicPermission(false);
          setCameraPermission(false);
        } else if (error.name === 'NotFoundError') {
          toast.error('Microfone ou câmera não encontrados no dispositivo');
          setMicPermission(false);
          setCameraPermission(false);
        } else {
          toast.error('Erro ao acessar dispositivos de mídia');
          setMicPermission(false);
          setCameraPermission(false);
        }
      }
    } finally {
      setIsChecking(false);
    }
  };

  const requestInitialPermissions = async () => {
    setIsChecking(true);
    let hasAudioPermission = false;
    let hasVideoPermission = false;

    // Tenta obter permissão do microfone primeiro
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ 
        audio: true,
        video: false 
      });
      audioStream.getTracks().forEach(track => track.stop());
      hasAudioPermission = true;
      setMicPermission(true);
    } catch (audioError) {
      console.error('Erro ao solicitar permissão do microfone:', audioError);
      if (audioError instanceof Error && audioError.name === 'NotAllowedError') {
        toast.error('É necessário permitir o acesso ao microfone');
        setMicPermission(false);
      }
    }

    // Tenta obter permissão da câmera
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({ 
        audio: false,
        video: true 
      });
      videoStream.getTracks().forEach(track => track.stop());
      hasVideoPermission = true;
      setCameraPermission(true);
    } catch (videoError) {
      console.error('Erro ao solicitar permissão da câmera:', videoError);
      if (videoError instanceof Error && videoError.name === 'NotAllowedError') {
        toast.error('É necessário permitir o acesso à câmera');
        setCameraPermission(false);
      }
    }

    // Se obteve ambas as permissões, carrega os dispositivos
    if (hasAudioPermission && hasVideoPermission) {
      setHasRequestedPermissions(true);
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameraDevices = devices.filter(device => device.kind === 'videoinput');
        const micDevices = devices.filter(device => device.kind === 'audioinput');
        
        if (cameraDevices.length === 0) {
          toast.error('Nenhuma câmera encontrada');
          setCameraPermission(false);
          return;
        }
        
        if (micDevices.length === 0) {
          toast.error('Nenhum microfone encontrado');
          setMicPermission(false);
          return;
        }

        setCameras(cameraDevices);
        setMicrophones(micDevices);

        // Seleciona os primeiros dispositivos por padrão
        if (cameraDevices.length > 0) {
          setSelectedCamera(cameraDevices[0].label || `Câmera ${1}`);
        }
        if (micDevices.length > 0) {
          setSelectedMicrophone(micDevices[0].label || `Microfone ${1}`);
        }

        toast.success('Dispositivos conectados com sucesso!');
      } catch (enumError) {
        console.error('Erro ao enumerar dispositivos:', enumError);
        toast.error('Erro ao listar dispositivos disponíveis');
      }
    } else {
      // Se alguma permissão foi negada
      if (!hasAudioPermission || !hasVideoPermission) {
        toast.error(
          'É necessário permitir o acesso ao microfone e à câmera para continuar. ' +
          'Por favor, verifique as permissões no seu navegador e tente novamente.'
        );
      }
    }

    setIsChecking(false);
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  const handleContinue = () => {
    if (micPermission && cameraPermission) {
      navigate(`/video/${entrevistaId}`);
    } else {
      toast.error('Por favor, permita o acesso ao microfone e câmera para continuar');
      checkPermissions();
    }
  };

  return (
    <div className="interview-preparation">
      <img 
        src={logo} 
        alt="Logo" 
        className="logo"
      />
      
      <div className="container">
        <h1 className="title">Preparação para a Entrevista</h1>
        
        <div className="checklist">
          <h2 className="text-xl font-semibold mb-4">Antes de começar:</h2>
          <ul className="list-disc list-inside space-y-3">
            <li>Verifique se você está em um ambiente silencioso</li>
            <li>Certifique-se de ter uma boa iluminação</li>
            <li>Posicione sua câmera na altura dos olhos</li>
            <li>Teste seu microfone e câmera</li>
            <li>Reserve um tempo adequado para responder todas as perguntas</li>
          </ul>
        </div>

        {!hasRequestedPermissions ? (
          <div className="flex flex-col items-center space-y-4">
            <p className="text-center text-gray-300">
              Para prosseguir com a entrevista, precisamos do seu consentimento para acessar a câmera e o microfone.
            </p>
            <button
              onClick={requestInitialPermissions}
              className="primary-button"
            >
              <FiCamera className="mr-2" />
              <FiMic className="mr-2" />
              Permitir Acesso aos Dispositivos
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              <h2 className="text-xl font-semibold mb-4">Verificação de Dispositivos:</h2>
              
              <div className="space-y-4">
                <div className="relative">
                  <button
                    onClick={() => setShowMicList(!showMicList)}
                    className="device-button"
                    disabled={!micPermission}
                  >
                    <div className="flex items-center space-x-4">
                      <FiMic size={24} />
                      <span>{selectedMicrophone || 'Selecione um microfone'}</span>
                    </div>
                    <FiChevronDown className={`transform transition-transform ${showMicList ? 'rotate-180' : ''}`} />
                  </button>
                  {showMicList && microphones.length > 0 && (
                    <div className="device-list">
                      {microphones.map((mic, index) => (
                        <button
                          key={mic.deviceId}
                          className="device-option"
                          onClick={() => {
                            setSelectedMicrophone(mic.label || `Microfone ${index + 1}`);
                            setShowMicList(false);
                          }}
                        >
                          {mic.label || `Microfone ${index + 1}`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowCameraList(!showCameraList)}
                    className="device-button"
                    disabled={!cameraPermission}
                  >
                    <div className="flex items-center space-x-4">
                      <FiCamera size={24} />
                      <span>{selectedCamera || 'Selecione uma câmera'}</span>
                    </div>
                    <FiChevronDown className={`transform transition-transform ${showCameraList ? 'rotate-180' : ''}`} />
                  </button>
                  {showCameraList && cameras.length > 0 && (
                    <div className="device-list">
                      {cameras.map((camera, index) => (
                        <button
                          key={camera.deviceId}
                          className="device-option"
                          onClick={() => {
                            setSelectedCamera(camera.label || `Câmera ${index + 1}`);
                            setShowCameraList(false);
                          }}
                        >
                          {camera.label || `Câmera ${index + 1}`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={checkPermissions}
                className="secondary-button"
              >
                Verificar Novamente
              </button>
              
              <button
                onClick={handleContinue}
                disabled={!micPermission || !cameraPermission}
                className={`primary-button ${!micPermission || !cameraPermission ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Continuar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InterviewPreparation; 