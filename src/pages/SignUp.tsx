import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Eye, EyeOff } from 'lucide-react';
import { AuthLayout } from '../components/layout/AuthLayout';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../config/constants';
import '../styles/auth.css';

export default function SignUp() {
  const { signup, isLoading } = useAuth();
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
      case 'nome':
        if (value.trim().length < 3) {
          newErrors.nome = 'O nome deve ter pelo menos 3 caracteres';
        }
        break;
      case 'email':
        if (!value.includes('@') || !value.includes('.')) {
          newErrors.email = 'Email inválido';
        }
        break;
      case 'telefone':
        if (value.replace(/\D/g, '').length < 10) {
          newErrors.telefone = 'Telefone inválido';
        }
        break;
      case 'linkedin_url':
        if (!value.includes('linkedin.com/')) {
          newErrors.linkedin_url = 'URL do LinkedIn inválida';
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

    if (name === 'password' && formData.confirmPassword) {
      validateField('confirmPassword', formData.confirmPassword);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = Object.keys(formData).every(field => 
      validateField(field, formData[field as keyof typeof formData])
    );

    if (isValid) {
      const { confirmPassword, ...signupData } = formData;
      await signup(signupData);
    }
  };

  return (
    <AuthLayout
      title="Cadastre-se no Coploy"
      subtitle="O futuro do recrutamento é agora."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {[
          { name: 'nome', label: 'Nome Completo', type: 'text' },
          { name: 'email', label: 'Email', type: 'email' },
          { name: 'telefone', label: 'Telefone', type: 'tel' },
          { name: 'linkedin_url', label: 'URL do LinkedIn', type: 'url' },
          { name: 'password', label: 'Senha', type: 'password' },
          { name: 'confirmPassword', label: 'Confirmar Senha', type: 'password' }
        ].map(field => (
          <div className="input-group" key={field.name}>
            <div className={`input-wrapper ${errors[field.name] ? "error" : ""}`}>
              <span className="input-icon">
                <User className="h-4 w-4" />
              </span>
              <input
                type={
                  field.type === 'password'
                    ? (field.name === 'password' ? (showPassword ? 'text' : 'password') : (showConfirmPassword ? 'text' : 'password'))
                    : field.type
                }
                name={field.name}
                className="auth-input"
                placeholder=" "
                value={formData[field.name as keyof typeof formData]}
                onChange={handleChange}
                onBlur={(e) => validateField(field.name, e.target.value)}
              />
              <label>{field.label}</label>
              {field.type === 'password' && (
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => field.name === 'password' 
                    ? setShowPassword(!showPassword)
                    : setShowConfirmPassword(!showConfirmPassword)
                  }
                >
                  {(field.name === 'password' ? showPassword : showConfirmPassword)
                    ? <EyeOff className="h-4 w-4" />
                    : <Eye className="h-4 w-4" />
                  }
                </button>
              )}
            </div>
            {errors[field.name] && (
              <span className="error-message">{errors[field.name]}</span>
            )}
          </div>
        ))}

        <div className="form-options">
          <label className="custom-checkbox">
            <input type="checkbox" required />
            <span className="checkmark"></span>
            Aceito os <strong>termos de uso</strong> e a <strong>política de privacidade</strong>
          </label>
        </div>

        <button 
          type="submit" 
          className="auth-button"
          disabled={isLoading}
        >
          {isLoading ? 'Carregando...' : 'Cadastrar'}
        </button>

        <div className="auth-link">
          <p>
            Já tem uma conta? <Link to={ROUTES.LOGIN}>Faça login</Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}