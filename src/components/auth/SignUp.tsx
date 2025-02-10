import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PersonOutline, VisibilityOutlined, VisibilityOffOutlined } from '@mui/icons-material';
import { authService } from '../../services/auth';
import './SignUp.css';

export default function SignUp() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    linkedin_url: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'telefone') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length <= 11) {
        if (formattedValue.length > 2) {
          formattedValue = `(${formattedValue.slice(0,2)}) ${formattedValue.slice(2)}`;
        }
        if (formattedValue.length > 9) {
          formattedValue = `${formattedValue.slice(0,9)}-${formattedValue.slice(9)}`;
        }
      }
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    if (errors[name]) {
      validateField(name, formattedValue);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = Object.keys(formData).every(field => 
      validateField(field, formData[field as keyof typeof formData])
    );

    if (isValid) {
      const { confirmPassword, ...signupData } = formData;
      const success = await authService.signup(signupData);
      if (success) {
        navigate('/video');
      }
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-content">
        <div className="signup-form-container">
          <div className="signup-left">
            <h1>O futuro do recrutamento é agora.</h1>
          </div>
          <div className="signup-right">
            <h1>Cadastre-se no Coploy</h1>
            <form className="signup-form" onSubmit={handleSubmit}>
              {Object.entries({
                nome: 'Nome',
                email: 'Email',
                telefone: 'Telefone',
                linkedin_url: 'LinkedIn URL',
                password: 'Senha',
                confirmPassword: 'Confirmar Senha'
              }).map(([field, label]) => (
                <div className="input-group" key={field}>
                  <div className={`input-wrapper ${errors[field] ? "error" : ""}`}>
                    <span className="input-icon">
                      <PersonOutline style={{ fontSize: '16px' }} />
                    </span>
                    <input
                      type={field.includes('password') ? (field === 'password' ? (showPassword ? 'text' : 'password') : (showConfirmPassword ? 'text' : 'password')) : 'text'}
                      name={field}
                      className="signup-input"
                      placeholder=" "
                      value={formData[field as keyof typeof formData]}
                      onChange={handleChange}
                      onBlur={(e) => validateField(field, e.target.value)}
                    />
                    <label>{label}</label>
                    {field.includes('password') && (
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => field === 'password' ? setShowPassword(!showPassword) : setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {(field === 'password' ? showPassword : showConfirmPassword) ? 
                          <VisibilityOutlined /> : 
                          <VisibilityOffOutlined />
                        }
                      </button>
                    )}
                  </div>
                  {errors[field] && <span className="error-message">{errors[field]}</span>}
                </div>
              ))}

              <div className="form-options">
                <div className="remember-email">
                  <label className="custom-checkbox">
                    <input type="checkbox" required />
                    <span className="checkmark"></span>
                    Aceito os <strong>termos de uso</strong> e a <strong>política de privacidade</strong>
                  </label>
                </div>
              </div>

              <div className="signup-button-container">
                <button type="submit" className="signup-button">
                  Cadastrar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}