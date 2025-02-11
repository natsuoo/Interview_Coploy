import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { Provider } from '@supabase/supabase-js';

interface SignUpData {
  nome: string;
  email: string;
  telefone: string;
  linkedin_url: string;
  password: string;
}

class AuthService {
  async signup({ nome, email, telefone, linkedin_url, password }: SignUpData): Promise<boolean> {
    try {
      // 1. Verificar se o email já existe
      const { data: existingUser } = await supabase
        .from('candidatos')
        .select('email')
        .eq('email', email)
        .single();

      if (existingUser) {
        toast.error('Este email já está cadastrado');
        return false;
      }

      // 2. Criar usuário na autenticação
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome,
            telefone,
            linkedin_url
          }
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          toast.error('Este email já está cadastrado');
          return false;
        }
        throw authError;
      }

      if (!authData.user) {
        toast.error('Falha ao criar usuário');
        return false;
      }

      // 3. Inserir dados na tabela candidatos
      const { error: dbError } = await supabase
        .from('candidatos')
        .insert({
          nome,
          email,
          telefone,
          linkedin_url,
          user_id: authData.user.id
        });

      if (dbError) {
        if (dbError.code === '23505') { // Código de erro de unique violation
          toast.error('Este email já está cadastrado');
          return false;
        }
        throw dbError;
      }

      toast.success('Cadastro realizado com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro no cadastro:', error);
      
      // Tratamento específico para erros conhecidos
      if (error instanceof Error) {
        if (error.message.includes('duplicate key')) {
          toast.error('Este email já está cadastrado');
        } else if (error.message.includes('invalid email')) {
          toast.error('Email inválido');
        } else if (error.message.includes('password')) {
          toast.error('Senha inválida. A senha deve ter pelo menos 6 caracteres');
        } else {
          toast.error('Falha ao realizar cadastro. Tente novamente.');
        }
      } else {
        toast.error('Falha ao realizar cadastro. Tente novamente.');
      }
      
      return false;
    }
  }

  async login(email: string, password: string): Promise<boolean> {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Email ou senha incorretos');
          return false;
        }
        throw error;
      }

      toast.success('Login realizado com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro no login:', error);
      toast.error('Falha ao realizar login. Verifique suas credenciais.');
      return false;
    }
  }

  async loginWithProvider(provider: Provider): Promise<boolean> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro no login social:', error);
      toast.error('Falha ao realizar login. Tente novamente.');
      return false;
    }
  }

  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      console.error('Erro no logout:', error);
      toast.error('Falha ao realizar logout.');
    }
  }

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Erro ao obter sessão:', error);
      return null;
    }
    return session;
  }

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Erro ao obter usuário:', error);
      return null;
    }
    return user;
  }
}

export const authService = new AuthService();