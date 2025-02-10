export interface Question {
  texto: string;
  ordem: number;
  contexto: string | null;
  tempo_maximo: number;
  permite_pular: boolean;
}

export interface InterviewSession {
  id: string;
  candidato_id: string;
  pergunta_atual: Question;
  total_perguntas: number;
  perguntas_restantes: number;
}

export interface InterviewResponse {
  proxima_pergunta: string;
  finalizada: boolean;
  total_perguntas: number;
  perguntas_restantes: number;
  feedback: string;
}