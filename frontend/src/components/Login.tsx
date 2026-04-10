import React, { useState } from 'react';
import { apiService } from '../services/apiService';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User, token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiService.login(email, password);
      onLogin(response.user, response.token);
    } catch (err) {
      setError('Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="login-info">
          <h3>Usuarios de prueba:</h3>
          <ul>
            <li>juan.pm@inti.com - password123 (PM)</li>
            <li>ana.pmo@inti.com - password123 (PMO)</li>
            <li>rafael.sponsor@inti.com - password123 (Sponsor)</li>
            <li>elena.dev@inti.com - password123 (Team_Member)</li>
            <li>carlos.tech@inti.com - password123 (Team_Member)</li>
            <li>maria.marketing@inti.com - password123 (Stakeholder)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;