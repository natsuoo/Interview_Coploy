import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { authService } from '../services/auth';
import './css/Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateField = (field: "email" | "password", value: string) => {
    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: value.trim() ? "" : "O campo não pode ser vazio.",
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    let newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) newErrors.email = "O campo não pode ser vazio.";
    if (!password.trim()) newErrors.password = "O campo não pode ser vazio.";

    setErrors(newErrors);

    if (!newErrors.email && !newErrors.password) {
      setIsLoading(true);
      const success = await authService.login(email, password);
      if (success) {
        navigate('/video');
      }
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'linkedin') => {
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
              <h1 className="auth-title">Bem-vindo de volta</h1>
              <p className="auth-subtitle">Entre com sua conta para continuar</p>

              <div className="social-buttons">
                <button 
                  onClick={() => handleSocialLogin('google')}
                  className="social-button google"
                  disabled={isLoading}
                >
                  <img src="https://www.google.com/favicon.ico" alt="Google" />
                  Continuar com Google
                </button>
                <button 
                  onClick={() => handleSocialLogin('linkedin')}
                  className="social-button linkedin"
                  disabled={isLoading}
                >
                  <img src="https://www.linkedin.com/favicon.ico" alt="LinkedIn" />
                  Continuar com LinkedIn
                </button>
              </div>

              <div className="divider">
                <span>ou</span>
              </div>

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <div className={`input-container ${errors.email ? 'error' : ''}`}>
                    <Mail className="input-icon" size={20} />
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={(e) => validateField("email", e.target.value)}
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
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={(e) => validateField("password", e.target.value)}
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

                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={isLoading}
                >
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </button>
              </form>

              <p className="auth-footer">
                Não tem uma conta? <Link to="/signup">Cadastre-se</Link>
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