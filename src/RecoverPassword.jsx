import React, { useState } from 'react';
import api from './api'; // axios configurado

const RecoverPassword = ({ onSwitch }) => {
  const [email, setEmail] = useState('');

  const handleRecover = async (e) => {
    e.preventDefault();

    try {
      // Simulação ou futura implementação de endpoint real
      await api.post('/recuperar-password', { email }); // <-- define depois no backend se quiseres
      alert('Instruções de recuperação enviadas para o email.');
    } catch (err) {
      console.error(err);
      alert('Erro ao tentar recuperar password.');
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleRecover}>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />

        <div className="buttons">
          <button type="button" onClick={() => onSwitch('login')}>Cancelar</button>
          <button type="submit">Recuperar Password</button>
        </div>
      </form>
    </div>
  );
};

export default RecoverPassword;
