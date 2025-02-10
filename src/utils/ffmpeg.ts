export async function convertToMP4(blob: Blob): Promise<Blob> {
  try {
    console.log('Iniciando processamento do vídeo...');
    
    // Se o blob já estiver em formato webm, podemos usá-lo diretamente
    if (blob.type === 'video/webm') {
      console.log('Vídeo já está em formato webm, enviando diretamente');
      return blob;
    }

    // Obtém o stream do blob original
    const videoURL = URL.createObjectURL(blob);
    const videoElement = document.createElement('video');
    videoElement.src = videoURL;

    // Aguarda o vídeo estar pronto
    await new Promise((resolve) => {
      videoElement.onloadedmetadata = resolve;
    });

    // Configura o canvas
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');

    // Configura o MediaRecorder
    const stream = canvas.captureStream(30); // 30 fps
    
    // Verifica os formatos suportados
    const mimeType = 'video/webm;codecs=vp8,opus';
    
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      console.error('Formato não suportado:', mimeType);
      throw new Error('Formato de vídeo não suportado pelo navegador');
    }

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: mimeType,
      videoBitsPerSecond: 2500000
    });

    const chunks: Blob[] = [];
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    // Promise para aguardar a conclusão da gravação
    const recordingPromise = new Promise<Blob>((resolve) => {
      mediaRecorder.onstop = () => {
        const finalBlob = new Blob(chunks, { type: 'video/webm' });
        resolve(finalBlob);
      };
    });

    // Inicia a gravação
    mediaRecorder.start();

    // Reproduz o vídeo e copia os frames para o canvas
    videoElement.play();
    
    const drawFrame = () => {
      if (videoElement.ended) {
        mediaRecorder.stop();
        return;
      }
      ctx?.drawImage(videoElement, 0, 0);
      requestAnimationFrame(drawFrame);
    };

    videoElement.onplay = () => {
      drawFrame();
    };

    // Aguarda a conclusão da gravação
    const finalBlob = await recordingPromise;

    // Limpa os recursos
    URL.revokeObjectURL(videoURL);
    videoElement.remove();
    canvas.remove();

    console.log('Processamento concluído com sucesso');
    return finalBlob;
  } catch (error) {
    console.error('Erro detalhado no processamento do vídeo:', error);
    if (error instanceof Error) {
      console.error('Mensagem de erro:', error.message);
      console.error('Stack trace:', error.stack);
    }
    throw new Error('Falha no processamento do vídeo. Por favor, tente novamente.');
  }
}