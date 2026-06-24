import React, { useState } from 'react';
import api from './api'; // axios configurado com baseURL

const Register = ({ onSwitch, onRegisterSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [notifications, setNotifications] = useState(true);

  const handleRegister = async e => {
    e.preventDefault();

    try {
      const response = await api.post('/user', {
        name: name || 'Utilizador',
        email,
        password,
        birthdate: birthdate || '2000-01-01',
        moderator: false,
        postalcode_id: 1 // usa o valor default ou ajusta se for dinâmico
      });

      if (response?.data?.token) {
        // ✅ Guardar token e user no localStorage
        localStorage.setItem('token', response.data.token);

        const userData = {
          id: response.data.id,
          nome: response.data.name,
          email: response.data.email,
          moderator: response.data.moderator || 0
        };

        localStorage.setItem('user', JSON.stringify(userData));
        onRegisterSuccess(userData); // chama login automático
      } else {
        alert('Registo efetuado, mas sem token.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao registar utilizador.');
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleRegister}>
        <label>Nome</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} required />

        <label>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />

        <label>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />

        <label>Data de Nascimento</label>
        <input type="date" value={birthdate} onChange={e => setBirthdate(e.target.value)} />

        <label className="checkbox">
          <input
            type="checkbox"
            checked={notifications}
            onChange={() => setNotifications(!notifications)}
          />
          <span>
            <strong>Notificações</strong>
            <div className="subtext">Receber Notificações</div>
          </span>
        </label>

        <button type="submit">Registar</button>
        <p className="link" onClick={() => onSwitch('login')}>Já tem conta? Entrar</p>
      </form>
    </div>
  );
};

export default Register;
