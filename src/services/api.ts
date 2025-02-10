const API_URL = 'http://localhost:5345';

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

export const api = {
  login: async (credentials: LoginCredentials) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Falha na autenticação');
    }

    return response.json();
  },

  signUp: async (data: SignUpData) => {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Falha no cadastro');
    }

    return response.json();
  },
};