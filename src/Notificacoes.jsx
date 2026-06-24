import React, { useEffect, useState } from 'react';
import api from './api';

const Notificacoes = ({ user }) => {
  const [notificacoes, setNotificacoes] = useState([]);

  useEffect(() => {
    const fetchNotificacoes = async () => {
      try {
        const res = await api.get(`/notification/${user.nome}`);
        setNotificacoes(res.data || []);
      } catch (err) {
        console.error('Erro ao buscar notificações', err);
      }
    };

    if (user?.nome) fetchNotificacoes();
  }, [user]);

  return (
    <div className="notificacoes-box">
      <h3>🔔 Notificações</h3>
      <ul>
        {notificacoes.length === 0 && <li>Sem notificações</li>}
        {notificacoes.map((n, idx) => (
          <li key={idx}>{n.message}</li>
        ))}
      </ul>
    </div>
  );
};

export default Notificacoes;
