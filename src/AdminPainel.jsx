import React, { useEffect, useState } from 'react';
import api from './api';

const AdminPainel = () => {
  const [user, setUser] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [denuncias, setDenuncias] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (!user || !user.nome) return;

    const fetchData = async () => {
      try {
        const [feedbackRes, denunciaRes] = await Promise.all([
          api.get(`/feedback?destinatario=${user.nome}`),
          api.get(`/denuncia/destinatario/${user.nome}`)
        ]);

        setFeedbacks(feedbackRes.data);
        setDenuncias(denunciaRes.data);
      } catch (err) {
        console.error('Erro ao carregar dados do painel admin:', err);
        alert('Erro ao carregar feedbacks ou denúncias');
      }
    };

    fetchData();
  }, [user]);

  return (
    <div className="form-container">
      <h2>Painel de Avaliações</h2>

      <h3>Feedbacks</h3>
      {feedbacks.length === 0 ? (
        <p>Sem feedbacks recebidos.</p>
      ) : (
        feedbacks.map((f, i) => (
          <div key={i} style={{ marginBottom: '15px' }}>
            <p><strong>Remetente:</strong> {f.remetente}</p>
            <p><strong>Avaliação:</strong> {f.rating} estrelas</p>
            <p>{f.notes}</p>
            <hr />
          </div>
        ))
      )}

      <h3>Denúncias</h3>
      {denuncias.length === 0 ? (
        <p>Sem denúncias registradas.</p>
      ) : (
        denuncias.map((d, i) => (
          <div key={i} style={{ marginBottom: '15px' }}>
            <p><strong>Remetente:</strong> {d.remetente}</p>
            <p><strong>Anúncio/Event:</strong> {d.titulo}</p>
            <p><strong>Status:</strong> {d.status}</p>
            <p><strong>Motivo:</strong> {d.motivo}</p>
            <p><strong>Descrição:</strong> {d.descricao}</p>
            <p><strong>Data:</strong> {new Date(d.date_creation).toLocaleString()}</p>
            <hr />
          </div>
        ))
      )}
    </div>
  );
};

export default AdminPainel;
