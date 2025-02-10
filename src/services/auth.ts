import { api } from './api';

interface User {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  linkedin_url: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
}

class AuthService {
  private state: AuthState = {
    user: null,
    token: localStorage.getItem('token')
  };

  constructor() {
    // Recupera o usuário do localStorage se existir
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.state.user = JSON.parse(storedUser);
    }
  }

  getUser(): User | null {
    return this.state.user;
  }

  getToken(): string | null {
    return this.state.token;
  }

  isAuthenticated(): boolean {
    return !!this.state.token;
  }

  async login(email: string, password: string): Promise<boolean> {
    try {
      const response = await api.login({ email, password });
      
      if (response.token) {
        this.state.token = response.token;
        this.state.user = response.user;
        
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        showSuccessToast('Login realizado com sucesso!');
        return true;
      }
      
      return false;
    } catch (error) {
      showErrorToast('Falha ao realizar login. Verifique suas credenciais.');
      return false;
    }
  }

  async signup(data: {
    nome: string;
    email: string;
    telefone: string;
    linkedin_url: string;
    password: string;
  }): Promise<boolean> {
    try {
      const response = await api.signUp(data);
      
      if (response.token) {
        this.state.token = response.token;
        this.state.user = response.user;
        
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        showSuccessToast('Cadastro realizado com sucesso!');
        return true;
      }
      
      return false;
    } catch (error) {
      showErrorToast('Falha ao realizar cadastro. Tente novamente.');
      return false;
    }
  }

  logout(): void {
    this.state.token = null;
    this.state.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}

export const authService = new AuthService();