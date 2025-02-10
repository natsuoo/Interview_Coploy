import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Webcam from "react-webcam";
import { toast } from "react-hot-toast";
import { Play, Square, AlertCircle } from "lucide-react";
import { InterviewSession } from "../types/interview";
import AudioSpectrum from "../components/video/AudioSpectrum";
import CameraButton from "../components/video/CameraButton";
import MicrophoneButton from "../components/video/MicrophoneButton";
import RecordingOverlay from "../components/video/RecordingOverlay";
import "../components/video/VideoRecording.css";
import axios from "axios";
import logo from "../public/logo.png";


const VideoRecording: React.FC = () => {
  const navigate = useNavigate();
  const { entrevistaId } = useParams<{ entrevistaId: string }>();
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [selectedMicLabel, setSelectedMicLabel] = useState("Microfone");
  const [selectedCameraLabel, setSelectedCameraLabel] = useState("Câmera Padrão");
  const [isRecording, setIsRecording] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [deviceError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const webcamRef = useRef<Webcam>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

  useEffect(() => {
    // Função para solicitar permissões iniciais
    const requestInitialPermissions = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: true,
          video: true 
        });
        
        // Se conseguiu acesso, para os tracks
        stream.getTracks().forEach(track => track.stop());
        
        setIsMicEnabled(true);
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === 'NotAllowedError') {
            toast.error('Por favor, permita o acesso ao microfone e câmera para continuar');
            setIsMicEnabled(false);
          } else if (error.name === 'NotFoundError') {
            toast.error('Microfone ou câmera não encontrados no dispositivo');
            setIsMicEnabled(false);
          } else {
            toast.error('Erro ao acessar dispositivos de mídia');
            setIsMicEnabled(false);
          }
        }
        console.error('Erro ao solicitar permissões:', error);
      }
    };

    // Solicita permissões assim que o componente montar
    requestInitialPermissions();
  }, []); // Executa apenas uma vez no mount

  useEffect(() => {
    if (!entrevistaId) {
      toast.error("ID da entrevista não fornecido");
      navigate("/erro");
      return;
    }

    const initInterview = async () => {
      try {
        setIsLoading(true);
        const candidato_id = "11026483-0901-432f-abeb-3f83fc2caa50";

        const response = await axios.post(
          `${API_URL}/entrevistas/${entrevistaId}/iniciar`,
          { candidato_id }
        );
        
        const { pergunta_atual, total_perguntas, perguntas_restantes } = response.data;
        
        setSession({
          id: response.data.id,
          candidato_id: response.data.candidato_id,
          pergunta_atual,
          total_perguntas,
          perguntas_restantes
        });
        
        setTimeRemaining(pergunta_atual.tempo_maximo || 120);
      } catch (error) {
        console.error("Erro ao iniciar entrevista:", error);
        toast.error("Não foi possível iniciar a entrevista");
        navigate("/erro");
      } finally {
        setIsLoading(false);
      }
    };

    initInterview();
  }, [entrevistaId, navigate]);

  const startTimer = () => {
    const maxTime = session?.pergunta_atual?.tempo_maximo || 120;
    setTimeRemaining(maxTime);
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === 1) {
          clearInterval(timer);
          stopRecording();
          return 0;
        }
        return prev ? prev - 1 : 0;
      });
    }, 1000);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: isMicEnabled
      });

      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8,opus',
        videoBitsPerSecond: 2500000
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const webmBlob = new Blob(chunksRef.current, { type: 'video/webm' });
        await sendVideoToServer(webmBlob);
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      startTimer();
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      toast.error('Erro ao iniciar gravação');
    }
  };

  // const convertToMP4 = async (webmBlob: Blob) => {
  //   try {
  //     setIsConverting(true);
  //     console.log('🔄 Iniciando conversão para MP4...');
      
  //     const ffmpeg = new FFmpeg();
  //     await ffmpeg.load();

  //     console.log('📝 Processando arquivo...');
  //     await ffmpeg.writeFile('input.webm', await fetchFile(webmBlob));
      
  //     console.log('🎬 Convertendo para MP4...');
  //     await ffmpeg.exec([
  //       '-i', 'input.webm',
  //       '-c:v', 'libx264',
  //       '-preset', 'ultrafast',
  //       '-c:a', 'aac',
  //       'output.mp4'
  //     ]);

  //     const data = await ffmpeg.readFile('output.mp4');
  //     const mp4Blob = new Blob([data], { type: 'video/mp4' });

  //     await sendVideoToServer(mp4Blob);
  //     setIsConverting(false);

  //   } catch (error) {
  //     console.error('Erro na conversão:', error);
  //     toast.error('Erro ao converter vídeo');
  //     setIsConverting(false);
  //   }
  // };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      toast.loading('Aguarde, salvando sua resposta...', {
        duration: Infinity,
        id: 'saving-response'
      });
    }
  };

  const sendVideoToServer = async (webmBlob: Blob) => {
    try {
      const formData = new FormData();
      
      const videoFile = new File([webmBlob], `entrevista_${session?.id}_${Date.now()}.webm`, {
        type: 'video/webm'
      });

      formData.append('video', videoFile);
      formData.append('candidato_id', session?.candidato_id || '');
      formData.append('pergunta_atual', session?.pergunta_atual.ordem.toString() || '');

      const response = await axios.post(
        `${API_URL}/entrevistas/${session?.id}/responder`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          }
        }
      );

      toast.dismiss('saving-response');

      if (response.data.finalizada) {
        toast.success('Entrevista finalizada!');
        navigate('/entrevista-finalizada');
      } else {
        const novaSession = {
          ...session,
          id: response.data.id,
          candidato_id: response.data.candidato_id,
          pergunta_atual: {
            ...response.data.pergunta_atual,
            texto: response.data.pergunta_atual.texto
          },
          total_perguntas: response.data.total_perguntas,
          perguntas_restantes: response.data.perguntas_restantes
        };
        
        setSession(novaSession);
        setTimeRemaining(response.data.pergunta_atual.tempo_maximo || 120);
              }

    } catch (error) {
      console.error('❌ Erro ao enviar vídeo:', error);
      toast.dismiss('saving-response');
      if (axios.isAxiosError(error) && error.response) {
        console.error('Detalhes do erro:', error.response.data);
        toast.error(`Erro ao enviar vídeo: ${error.response.data.message || 'Erro desconhecido'}`);
      } else {
        toast.error('Erro ao enviar vídeo');
      }
    } finally {
      setIsConverting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="video-recorder">
        <p>Iniciando entrevista...</p>
      </div>
    );
  }

  if (deviceError) {
    return (
      <div className="video-recorder">
        <div className="text-red-500">
          <AlertCircle size={40} />
        </div>
        <p>{deviceError}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="video-recorder" ref={containerRef}>
      <img 
        src={logo} 
        alt="Logo" 
        className="absolute top-4 left-4 h-20 z-10"
      />
      <div className="top-text">
        {session?.pergunta_atual?.texto || 'Carregando pergunta...'}
      </div>
      <div className="video-container">
        <div className="overlay-top"></div>
        <div className="overlay-bottom"></div>
        <Webcam ref={webcamRef} audio={false} className="video-preview" />

        <RecordingOverlay isRecording={isRecording} timeRemaining={timeRemaining} />
        <div className="controls-wrapper">
          <div className="device-controls">
            <CameraButton
              selectedLabel={selectedCameraLabel}
              setSelectedLabel={setSelectedCameraLabel}
            />
            <MicrophoneButton
              enabled={isMicEnabled}
              setEnabled={setIsMicEnabled}
              selectedLabel={selectedMicLabel}
              setSelectedLabel={setSelectedMicLabel}
            />
          </div>
          {!isRecording && !isConverting && session && (
            <button onClick={startRecording} className="record-button">
              <Play className="h-4 w-4" /> Iniciar
            </button>
          )}
          {isRecording && !isConverting && (
            <button onClick={stopRecording} className="record-button">
              <Square className="h-4 w-4" /> Parar
            </button>
          )}
        </div>
        {isMicEnabled && streamRef.current && (
          <AudioSpectrum audioStream={streamRef.current} />
        )}
      </div>
    </div>
  );
};

export default VideoRecording;
