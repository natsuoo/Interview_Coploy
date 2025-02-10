import { InterviewSession, InterviewResponse } from '../types/interview';

const API_URL = import.meta.env.VITE_API_URL;

export const interviewService = {
  startInterview: async (entrevistaId: string, candidato_id: string): Promise<InterviewSession> => {
    try {
      console.log('Iniciando entrevista...', { entrevistaId, candidato_id });

      const response = await fetch(`${API_URL}/entrevistas/${entrevistaId}/iniciar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ candidato_id }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Erro na resposta da API:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });

        // Se a entrevista já estiver em andamento, tenta recuperá-la
        if (response.status === 400 && errorData?.detail?.includes('já existe uma entrevista em andamento')) {
          console.log('Tentando recuperar entrevista em andamento...');
          const currentResponse = await fetch(`${API_URL}/entrevistas/${entrevistaId}/atual`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          });

          if (!currentResponse.ok) {
            throw new Error('Não foi possível recuperar a entrevista em andamento');
          }

          const currentData = await currentResponse.json();
          console.log('Entrevista em andamento recuperada:', currentData);
          return currentData;
        }

        // Se a entrevista não for encontrada
        if (response.status === 404) {
          throw new Error('Entrevista não encontrada');
        }

        throw new Error(errorData?.detail || 'Falha ao iniciar entrevista');
      }

      const data = await response.json();
      console.log('Entrevista iniciada com sucesso:', data);
      
      return data;
    } catch (error) {
      console.error('Erro detalhado ao iniciar entrevista:', error);
      throw error;
    }
  },

  submitAnswer: async (
    entrevistaId: string,
    candidato_id: string,
    pergunta_atual: number,
    videoBlob: Blob
  ): Promise<InterviewResponse> => {
    try {
      console.log('=== Início do envio ===');
      
      // Verifica o tamanho do vídeo
      const MAX_SIZE = 50 * 1024 * 1024; // 50MB
      if (videoBlob.size > MAX_SIZE) {
        throw new Error(`Vídeo muito grande (${(videoBlob.size / 1024 / 1024).toFixed(2)}MB). O limite é ${MAX_SIZE / 1024 / 1024}MB`);
      }

      console.log('Dados iniciais:', {
        entrevistaId,
        candidato_id,
        pergunta_atual,
        blobSize: videoBlob.size,
        blobType: videoBlob.type,
        sizeInMB: (videoBlob.size / 1024 / 1024).toFixed(2)
      });

      // Converte para base64
      const base64Video = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          console.log('Base64 gerado:', {
            length: base64String.length,
            preview: base64String.substring(0, 100) + '...'
          });
          resolve(base64String);
        };
        reader.onerror = (error) => {
          console.error('Erro na leitura do blob:', error);
          reject(error);
        };
        reader.readAsDataURL(videoBlob);
      });

      const requestBody = {
        candidato_id,
        pergunta_atual,
        video: base64Video,
        mimeType: videoBlob.type || 'video/webm'
      };

      console.log('Preparando request:', {
        url: `${API_URL}/entrevistas/${entrevistaId}/responder`,
        bodySize: JSON.stringify(requestBody).length,
        mimeType: requestBody.mimeType
      });

      const response = await fetch(`${API_URL}/entrevistas/${entrevistaId}/responder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Resposta recebida:', {
        status: response.status,
        statusText: response.statusText
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Erro detalhado da API:', errorData);
        throw new Error(errorData?.detail || 'Erro ao enviar resposta');
      }

      const responseData = await response.json();
      console.log('Resposta processada com sucesso:', responseData);
      return responseData;

    } catch (error) {
      console.error('=== Erro no envio ===');
      console.error('Detalhes do erro:', error);
      throw error;
    }
  }
};