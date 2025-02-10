export interface User {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  linkedin_url: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  nome: string;
  email: string;
  telefone: string;
  linkedin_url: string;
  password: string;
}