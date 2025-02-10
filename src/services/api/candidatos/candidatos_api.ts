import { FastifyInstance } from 'fastify';
import axios, { AxiosError } from 'axios';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: any;
  }
}

export default async function candidatosRoutes(app: FastifyInstance) {
  // Criar novo candidato
  app.post('/', async (request, reply) => {
    try {
      const {
        nome,
        email,
        telefone,
        linkedin_url
      } = request.body as {
        nome: string;
        email: string;
        telefone: string;
        linkedin_url: string;
      };
  
      // Enviando dados para a API externa sem additionalProps
      const response = await axios.post(
        process.env.API_URL + '/api/candidatos/',
        {
          nome,
          email,
          telefone,
          linkedin_url
        }
      );
  
      return reply.code(201).send(response.data);
    } catch (error) {
      console.error('Erro ao criar candidato:', error);
  
      if (error instanceof AxiosError) {
        if (error.response) {
          return reply.code(error.response.status).send({
            error: 'Erro ao processar requisição',
            detalhes: error.response.data,
            status: error.response.status
          });
        } else if (error.request) {
          return reply.code(503).send({
            error: 'Serviço temporariamente indisponível',
            detalhes: 'Não foi possível conectar ao servidor externo'
          });
        }
      }
  
      return reply.code(500).send({
        error: 'Erro interno do servidor',
        mensagem: 'Ocorreu um erro inesperado ao processar sua solicitação',
        timestamp: new Date().toISOString()
      });
    }
  });
}