import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PersonOutline, PasswordSharp, VisibilityOutlined, VisibilityOffOutlined } from '@mui/icons-material';
import { authService } from '../../services/auth';
import './Login.css';
import webcoploy from '../../public/webcoploy.png';


export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateField = (field: "email" | "password", value: string) => {
    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: value.trim() ? "" : "O campo não pode ser vazio.",
    }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) {
      validateField("email", e.target.value);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errors.password) {
      validateField("password", e.target.value);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    let newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) newErrors.email = "O campo não pode ser vazio.";
    if (!password.trim()) newErrors.password = "O campo não pode ser vazio.";

    setErrors(newErrors);

    if (!newErrors.email && !newErrors.password) {
      const success = await authService.login(email, password);
      if (success) {
        navigate('/video');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-form-container">
          <div className="login-left">
            <img src={webcoploy} alt="webcoploy" />
            <h1>O futuro do recrutamento é agora.</h1>
          </div>
          <div className="login-right">
            <h1>Olá, seja bem-vindo ao Coploy</h1>
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="login-form-title">
                <div className={`input-wrapper ${errors.email ? "error" : ""}`}>
                  <span className="input-icon">
                    <PersonOutline style={{ fontSize: '16px' }} />
                  </span>
                  <input
                    type="email"
                    className="login-input"
                    placeholder=" "
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={() => validateField("email", email)}
                  />
                  <label>Email</label>
                </div>
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="input-group">
                <div className={`input-wrapper ${errors.password ? "error" : ""}`}>
                  <span className="input-icon">
                    <PasswordSharp style={{ fontSize: '16px' }} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="login-input"
                    placeholder=" "
                    value={password}
                    onChange={handlePasswordChange}
                    onBlur={() => validateField("password", password)}
                  />
                  <label>Senha</label>
                  <button 
                    type="button" 
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <VisibilityOutlined /> : <VisibilityOffOutlined />}
                  </button>
                </div>
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>

              <div className="form-options">
                <div className="remember-email">
                  <label className="custom-checkbox">
                    <input type="checkbox" />
                    <span className="checkmark"></span>
                    Lembrar e-mail
                  </label>
                </div>
              </div>

              <div className="login-button-container">
                <button type="submit" className="login-button">
                  Login
                </button>
              </div>

              <div className="signup-link">
                <p>
                  Não tem uma conta? <Link to="/signup">Cadastre-se</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}