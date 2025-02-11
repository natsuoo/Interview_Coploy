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
  private saveCandidateId(id: string) {
    try {
      localStorage.setItem('candidateId', id);
      console.log('ID do candidato salvo:', id); // Debug
    } catch (error) {
      console.error('Erro ao salvar ID do candidato:', error);
    }
  }

  getCandidateId(): string | null {
    try {
      const id = localStorage.getItem('candidateId');
      console.log('ID do candidato recuperado:', id); // Debug
      return id;
    } catch (error) {
      console.error('Erro ao recuperar ID do candidato:', error);
      return null;
    }
  }

  private clearCandidateId() {
    try {
      localStorage.removeItem('candidateId');
      console.log('ID do candidato removido'); // Debug
    } catch (error) {
      console.error('Erro ao remover ID do candidato:', error);
    }
  }

  async signup({ nome, email, telefone, linkedin_url, password }: SignUpData): Promise<boolean> {
    try {
      const { data: existingData, error: checkError } = await supabase
        .from('candidatos')
        .select('email, telefone')
        .or(`email.eq.${email},telefone.eq.${telefone}`)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Erro ao verificar dados existentes:", checkError);
        toast.error('Erro ao verificar disponibilidade dos dados');
        return false;
      }

      if (existingData) {
        if (existingData.email === email) {
          toast.error('Este email já está cadastrado');
          return false;
        }
        if (existingData.telefone === telefone) {
          toast.error('Este telefone já está cadastrado');
          return false;
        }
      }

      const { data, error: authError } = await supabase.auth.signUp({
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

      const { error: insertError } = await supabase
        .from('candidatos')
        .insert([{
          id: data.user.id,
          user_id: data.user.id,
          nome,
          email,
          telefone,
          linkedin_url
        }])
        .select()
        .single();

      if (insertError) {
        console.error("Erro ao inserir na tabela candidatos:", insertError);
        
        try {
          await supabase.auth.signOut();
        } catch (e) {
          console.error("Erro ao fazer rollback do usuário:", e);
        }
        
        if (insertError.code === '23505') {
          if (insertError.message.includes('telefone')) {
            toast.error('Este telefone já está cadastrado');
          } else if (insertError.message.includes('email')) {
            toast.error('Este email já está cadastrado');
          } else {
            toast.error('Erro ao criar perfil: dados duplicados');
          }
        } else {
          toast.error('Erro ao criar perfil');
        }
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
      console.log('Iniciando login para email:', email); // Debug

      // Primeiro busca o candidato pelo email
      const { data: candidato, error: candidatoError } = await supabase
        .from('candidatos')
        .select('*')
        .eq('email', email)
        .single();

      if (candidatoError) {
        console.error("Erro ao buscar perfil:", candidatoError);
        toast.error('Perfil não encontrado');
        return false;
      }

      console.log('Candidato encontrado:', candidato); // Debug

      // Tenta fazer login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error("Erro no login:", error.message);
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Email ou senha incorretos');
        } else {
          toast.error('Erro ao fazer login');
        }
        return false;
      }

      if (!data.user) {
        toast.error('Erro ao recuperar dados do usuário');
        return false;
      }

      // Salva o ID do candidato
      this.saveCandidateId(candidato.id);
      console.log('Login realizado com sucesso. ID salvo:', candidato.id); // Debug

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
      this.clearCandidateId(); // Limpa o ID do candidato ao fazer logout
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