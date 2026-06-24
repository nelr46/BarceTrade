import React, { useEffect, useState } from 'react';
import api from './api';

const ModeradorPainel = ({ user }) => {
  const [eventos, setEventos] = useState([]);
  const [denuncias, setDenuncias] = useState([]);

  const fetchEventos = async () => {
    try {
      const res = await api.get('/evento', { params: { type: 'evento' } });
      setEventos(res.data.filter(e => e.status === 'pendente'));
    } catch (err) {
      console.error('Erro ao buscar eventos:', err);
      alert('Erro ao carregar eventos');
    }
  };

  const fetchDenuncias = async () => {
    try {
      const res = await api.get('/denuncia');
      setDenuncias(res.data.filter(d => d.status === 0));
    } catch (err) {
      console.error('Erro ao buscar denúncias:', err);
    }
  };

  useEffect(() => {
    if (user?.moderator) {
      fetchEventos();
      fetchDenuncias();
    }
  }, [user]);

  const permitirEvento = async (postId) => {
    try {
      await api.put(`/evento/permitir/${postId}`);
      alert('Evento permitido com sucesso!');
      fetchEventos();
    } catch (err) {
      console.error('Erro ao permitir evento:', err);
      alert('Erro ao permitir evento');
    }
  };

  const recusarEvento = async (postId) => {
    if (!window.confirm('Desejas mesmo recusar este evento?')) return;
    try {
      await api.delete(`/evento/${postId}`);
      alert('Evento recusado e removido.');
      fetchEventos();
    } catch (err) {
      console.error('Erro ao recusar evento:', err);
    }
  };

  const alterarEvento = async (evento) => {
    const novoTitulo = prompt('Novo título:', evento.title);
    const novaDescricao = prompt('Nova descrição:', evento.description);
    if (!novoTitulo || !novaDescricao) return;

    try {
      await api.put(`/evento/${evento.postId}`, {
        ...evento,
        title: novoTitulo,
        description: novaDescricao,
        status: evento.status,
        creationDate: evento.creationDate,
        scheduling: evento.scheduling,
        local: evento.local,
        imagePath: evento.imagePath,
        userId: evento.userId,
        type: 'evento'
      });
      alert('Evento alterado com sucesso.');
      fetchEventos();
    } catch (err) {
      console.error('Erro ao alterar evento:', err);
      alert('Erro ao alterar evento');
    }
  };

  const permitirAnuncio = async (reportId, postId) => {
    try {
      await api.put(`/denuncia/resolver/${reportId}/${postId}`);
      alert('Anúncio permitido com sucesso!');
      fetchDenuncias();
      fetchEventos();
    } catch (err) {
      console.error('Erro ao permitir anúncio:', err);
      alert('Erro ao permitir anúncio');
    }
  };

  const removerAnuncio = async (reportId, postId) => {
    if (!window.confirm('Desejas remover este anúncio?')) return;
    try {
      await api.put(`/denuncia/remover-anuncio/${reportId}/${postId}`);
      alert('Anúncio marcado como recusado.');
      fetchDenuncias();
      fetchEventos();
    } catch (err) {
      console.error('Erro ao remover anúncio:', err);
      alert('Erro ao remover anúncio');
    }
  };

  return (
    <div className="form-container">
      <h2>📢 Painel do Moderador</h2>

      <h3>Eventos Pendentes</h3>
      {eventos.length === 0 ? (
        <p>Sem eventos pendentes.</p>
      ) : (
        eventos.map(e => (
          <div key={e.postId} className="evento-card" style={{ marginBottom: '20px' }}>
            <h3>{e.title}</h3>
            <p><strong>Autor:</strong> {e.userName}</p>
            <p><strong>Descrição:</strong> {e.description}</p>
            <div style={{ marginTop: '10px' }}>
              <button className="green" onClick={() => permitirEvento(e.postId)}>Permitir</button>
              <button className="yellow" onClick={() => alterarEvento(e)} style={{ marginLeft: '10px' }}>Alterar</button>
              <button className="red" onClick={() => recusarEvento(e.postId)} style={{ marginLeft: '10px' }}>Recusar</button>
            </div>
          </div>
        ))
      )}

      <h3>Denúncias Recebidas</h3>
      {denuncias.length === 0 ? (
        <p>Sem denúncias pendentes.</p>
      ) : (
        denuncias.map(r => (
          <div key={r.report_id} className="evento-card" style={{ marginBottom: '20px' }}>
            <h3>{r.titulo}</h3>
            <p><strong>Autor do anúncio:</strong> {r.destinatario}</p>
            <p><strong>Remetente:</strong> {r.remetente}</p>
            <p><strong>Motivo:</strong> {r.motivo}</p>
            <p><strong>Descrição da denúncia:</strong> {r.descricao}</p>
            <p><strong>Data:</strong> {new Date(r.date_creation).toLocaleString()}</p>
            <div style={{ marginTop: '10px' }}>
            <button
  className="green"
  onClick={() => permitirAnuncio(r.report_id, r.postId)} // ← em vez de r.reportUserId
>
  Permitir
</button>
<button
  className="red"
  onClick={() => removerAnuncio(r.report_id, r.postId)} // ← em vez de r.reportUserId
  style={{ marginLeft: '10px' }}
>
  Remover
</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ModeradorPainel;