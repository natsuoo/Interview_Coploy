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

      // 2. Criar usuário na autenticação com email confirmation desabilitado
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome,
            telefone,
            linkedin_url
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (authError) {
        if (authError.message.includes('rate_limit')) {
          toast.error('Por favor, aguarde alguns segundos antes de tentar novamente');
          return false;
        }
        if (authError.message.includes('already registered')) {
          toast.error('Este email já está cadastrado');
          return false;
        }
        console.error("Erro ao criar usuário:", authError);
        toast.error('Erro ao criar usuário');
        return false;
      }

      if (!data.user) {
        toast.error('Erro ao criar usuário');
        return false;
      }

      // 3. Inserir na tabela candidatos
      const { error: insertError } = await supabase
        .from('candidatos')
        .insert([{
          user_id: data.user.id,
          nome,
          email,
          telefone,
          linkedin_url
        }]);

      if (insertError) {
        console.error("Erro ao inserir na tabela candidatos:", insertError);
        
        // Se falhar ao inserir na tabela candidatos, tenta fazer rollback do usuário
        try {
          await supabase.auth.signOut();
        } catch (e) {
          console.error("Erro ao fazer rollback do usuário:", e);
        }
        
        toast.error('Erro ao criar perfil');
        return false;
      }

      toast.success('Cadastro realizado com sucesso! Por favor, faça login.');
      return true;
    } catch (error) {
      console.error('Erro no cadastro:', error);
      toast.error('Erro ao realizar cadastro');
      return false;
    }
  }

  async login(email: string, password: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error("Erro no login:", error.message);
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Email ou senha incorretos');
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Por favor, confirme seu email antes de fazer login');
        } else {
          toast.error('Erro ao fazer login');
        }
        return false;
      }

      // Verifica se existe na tabela candidatos
      const { data: candidato, error: candidatoError } = await supabase
        .from('candidatos')
        .select('*')
        .eq('user_id', data.user.id)
        .single();

      if (candidatoError || !candidato) {
        toast.error('Perfil não encontrado');
        await this.logout();
        return false;
      }

      toast.success('Login realizado com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro no login:', error);
      toast.error('Erro ao realizar login');
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
      toast.error('Erro ao realizar login social');
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
      toast.error('Erro ao realizar logout');
    }
  }

  isAuthenticated(): boolean {
    return !!this.getSession();
  }

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Erro ao obter sessão:', error);
      return null;
    }
    return session;
  }

  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Erro ao obter usuário:', error);
      return null;
    }
    return user;
  }
}

export const authService = new AuthService();