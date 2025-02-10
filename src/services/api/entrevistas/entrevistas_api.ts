import { FastifyInstance } from 'fastify';
import axios from 'axios';
import * as fs from 'fs';
import path from 'path';
import multipart from '@fastify/multipart';

// Configuração do Axios com timeout e validação de status
const API_URL = process.env.API_URL || 'http://localhost:8080/api/entrevistas';
const AXIOS_TIMEOUT = 30000;

const api = axios.create({
  timeout: AXIOS_TIMEOUT,
  baseURL: API_URL,
  validateStatus: (status) => status < 500
});

export default async function entrevistasRoutes(app: FastifyInstance) {
  await app.register(multipart);

  // 📌 Criar uma nova entrevista
  app.post('/', async (request, reply) => {
    try {
      const body = request.body as {
        nome: string;
        prompt: string;
        rags: { id: string; conteudo: string; tipo: string; descricao: string }[];
        idioma: string;
        max_perguntas: number;
        tempo_resposta: number;
        permite_pular: boolean;
        permite_refazer: boolean;
      };

      // Validação básica
      if (!body.nome || !body.prompt || body.rags.length === 0) {
        return reply.code(400).send({ error: 'Dados inválidos', message: 'Nome, prompt e RAGs são obrigatórios' });
      }

      // Enviar para a API
      const response = await api.post('/', body);

      if (response.status !== 201) {
        return reply.code(response.status).send({
          error: 'Erro na API externa',
          message: response.data?.detail || 'Erro ao criar entrevista'
        });
      }

      return reply.code(201).send(response.data);
    } catch (error) {
      return handleAxiosError(error, reply, 'Erro ao criar entrevista');
    }
  });

  // 📌 Listar entrevistas
  app.get('/', async (request, reply) => {
    try {
      const { pagina = 1, tamanho_pagina = 10, status } = request.query as {
        pagina?: number;
        tamanho_pagina?: number;
        status?: string;
      };

      const response = await api.get('/', { params: { pagina, tamanho_pagina, status } });

      return reply.send(response.data);
    } catch (error) {
      return handleAxiosError(error, reply, 'Erro ao listar entrevistas');
    }
  });

  // 📌 Buscar entrevista por ID
  app.get('/:entrevista_id', async (request, reply) => {
    try {
      const { entrevista_id } = request.params as { entrevista_id: string };

      const response = await api.get(`/${entrevista_id}`);

      if (response.status === 404) {
        return reply.code(404).send({ error: 'Entrevista não encontrada' });
      }

      return reply.send(response.data);
    } catch (error) {
      return handleAxiosError(error, reply, 'Erro ao buscar entrevista');
    }
  });

  // 📌 Iniciar uma entrevista
  app.post('/:entrevista_id/iniciar', async (request, reply) => {
    try {
      const { entrevista_id } = request.params as { entrevista_id: string };
      const { candidato_id } = request.body as { candidato_id: string };

      if (!candidato_id) {
        return reply.code(400).send({ error: 'ID do candidato é obrigatório' });
      }

      const response = await api.post(`/${entrevista_id}/iniciar`, { candidato_id });

      return reply.code(201).send(response.data);
    } catch (error) {
      return handleAxiosError(error, reply, 'Erro ao iniciar entrevista');
    }
  });

  // 📌 Receber vídeo em Base64 e salvar como arquivo
  app.post('/:entrevista_id/responder', async (request, reply) => {
    try {
      console.log('🔍 Iniciando processamento do vídeo...');
      const { entrevista_id } = request.params as { entrevista_id: string };
      
      const data = await request.file();
      if (!data) {
        console.warn('⚠️ Nenhum arquivo recebido');
        return reply.code(400).send({ error: 'Nenhum arquivo recebido' });
      }

      // Obter dados do FormData
      const candidato_id = data.fields?.candidato_id?.toString();
      const pergunta_atual = data.fields?.pergunta_atual?.toString();

      if (!candidato_id || !pergunta_atual) {
        return reply.code(400).send({ error: 'Dados incompletos' });
      }

      console.log('📝 Dados recebidos:', { entrevista_id, candidato_id, pergunta_atual });

      // Verificar se o Content-Type está correto
      console.log('📨 Content-Type:', request.headers['content-type']);
      
      console.log('📁 Detalhes do arquivo:', {
        filename: data.filename,
        mimetype: data.mimetype,
        size: data.file.bytesRead
      });

      // Validar tipo do arquivo
      if (!data.mimetype.includes('video/')) {
        return reply.code(400).send({ 
          error: 'Formato inválido',
          message: 'O arquivo deve ser um vídeo' 
        });
      }

      // Criar diretório para vídeos se não existir
      const uploadDir = path.resolve(process.cwd(), 'uploads', 'videos');
      console.log(`📁 Diretório de upload: ${uploadDir}`);
      await fs.promises.mkdir(uploadDir, { recursive: true });

      // Gerar nome único para o arquivo mantendo a extensão original
      const fileExtension = path.extname(data.filename) || '.webm';
      const filename = `${entrevista_id}_${Date.now()}${fileExtension}`;
      const filepath = path.join(uploadDir, filename);
      console.log(`📝 Nome do arquivo gerado: ${filename}`);

      // Salvar o arquivo
      await fs.promises.writeFile(filepath, await data.toBuffer());
      console.log('✅ Arquivo salvo com sucesso');

      // Enviar resposta
      return reply.code(200).send({ 
        message: 'Vídeo recebido com sucesso',
        filepath: filepath
      });

    } catch (error) {
      console.error('❌ Erro ao processar vídeo:', error);
      return reply.code(500).send({ 
        error: 'Erro interno',
        message: 'Erro ao processar o vídeo',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });
}

// 📌 Função auxiliar para tratar erros do Axios
function handleAxiosError(error: unknown, reply: any, defaultMessage: string) {
  console.error(defaultMessage, error);

  if (axios.isAxiosError(error)) {
    if (error.response) {
      return reply.code(error.response.status).send({
        error: 'Erro na API externa',
        message: error.response.data?.detail || defaultMessage
      });
    }
    return reply.code(503).send({ error: 'Serviço indisponível', message: 'Falha ao conectar ao servidor' });
  }

  return reply.code(500).send({ error: 'Erro interno', message: defaultMessage });
}
