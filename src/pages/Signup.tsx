import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Phone } from 'lucide-react';
import { authService } from '../services/auth';
import './css/Login.css';

export default function SignUp() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const validateField = (field: string, value: string) => {
    const newErrors: {[key: string]: string} = {};

    switch (field) {
      case 'email':
        if (!value.includes('@')) {
          newErrors.email = 'Email inválido';
        }
        break;
      case 'password':
        if (value.length < 6) {
          newErrors.password = 'A senha deve ter pelo menos 6 caracteres';
        }
        break;
      case 'confirmPassword':
        if (value !== formData.password) {
          newErrors.confirmPassword = 'As senhas não coincidem';
        }
        break;
      default:
        if (!value.trim()) {
          newErrors[field] = 'Campo obrigatório';
        }
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!acceptedTerms) {
      setErrors(prev => ({ ...prev, terms: 'Você precisa aceitar os termos de uso' }));
      return;
    }

    const isValid = Object.keys(formData).every(field => 
      validateField(field, formData[field as keyof typeof formData])
    );

    if (isValid) {
      setIsLoading(true);
      const { confirmPassword, ...signupData } = formData;
      const success = await authService.signup({
        ...signupData,
        linkedin_url: ''
      });
      if (success) {
        navigate('/login');
      }
      setIsLoading(false);
    }
  };

  const handleSocialSignup = async (provider: 'google' | 'linkedin') => {
    setIsLoading(true);
    const success = await authService.loginWithProvider(provider);
    if (success) {
      // O redirecionamento será feito pelo Supabase
      console.log('Redirecionando para autenticação...');
    }
    setIsLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="logo-container">
        <div className="logo-placeholder"></div>
      </div>
      
      <div className="auth-content">
        <div className="auth-grid">
          <div className="auth-left">
            <div className="auth-form-container">
              <h1 className="auth-title">Bem-vindo a Coploy</h1>
              <p className="auth-subtitle">Preencha seus dados para começar</p>

              <div className="social-buttons">
                <button 
                  onClick={() => handleSocialSignup('google')}
                  className="social-button google"
                  disabled={isLoading}
                >
                  <img src="https://www.google.com/favicon.ico" alt="Google" />
                  Continuar com Google
                </button>
                <button 
                  onClick={() => handleSocialSignup('linkedin')}
                  className="social-button linkedin"
                  disabled={isLoading}
                >
                  <img src="https://www.linkedin.com/favicon.ico" alt="LinkedIn" />
                  Continuar com LinkedIn
                </button>
              </div>

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <div className={`input-container ${errors.nome ? 'error' : ''}`}>
                    <User className="input-icon" size={20} />
                    <input
                      type="text"
                      placeholder="Nome completo"
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      onBlur={(e) => validateField('nome', e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.nome && <span className="error-message">{errors.nome}</span>}
                </div>

                <div className="form-group">
                  <div className={`input-container ${errors.telefone ? 'error' : ''}`}>
                    <Phone className="input-icon" size={20} />
                    <input
                      type="tel"
                      placeholder="Telefone"
                      value={formData.telefone}
                      onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                      onBlur={(e) => validateField('telefone', e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.telefone && <span className="error-message">{errors.telefone}</span>}
                </div>

                <div className="form-group">
                  <div className={`input-container ${errors.email ? 'error' : ''}`}>
                    <Mail className="input-icon" size={20} />
                    <input
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      onBlur={(e) => validateField('email', e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <div className={`input-container ${errors.password ? 'error' : ''}`}>
                    <Lock className="input-icon" size={20} />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Senha"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      onBlur={(e) => validateField('password', e.target.value)}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && <span className="error-message">{errors.password}</span>}
                </div>

                <div className="form-group">
                  <div className={`input-container ${errors.confirmPassword ? 'error' : ''}`}>
                    <Lock className="input-icon" size={20} />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirmar senha"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      onBlur={(e) => validateField('confirmPassword', e.target.value)}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                </div>

                <div className="terms-checkbox">
                  <label className="checkbox-container">
                    <input 
                      type="checkbox" 
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      disabled={isLoading}
                    />
                    <span className="checkmark"></span>
                    <span className="terms-text">
                      Aceito os <Link to="/privacy">termos de uso e a política de privacidade</Link>
                    </span>
                  </label>
                  {errors.terms && <span className="error-message">{errors.terms}</span>}
                </div>

                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={isLoading}
                >
                  {isLoading ? 'Criando conta...' : 'Criar conta'}
                </button>
              </form>

              <p className="auth-footer">
                Já tem uma conta? <Link to="/login">Entrar</Link>
              </p>
            </div>
          </div>
          
          <div className="auth-right">
            <div className="image-placeholder"></div>
          </div>
        </div>
      </div>
    </div>
  );
}