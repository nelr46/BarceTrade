import React, { useEffect, useState } from 'react';
import api from './api';

const normalize = (str) => str?.trim().toLowerCase();

const PropostasPorItem = ({
  user,
  propostasRecebidas = [],
  propostasEnviadas = [],
  onResponder,
  onAnuncioRemovido,
  onAceitar,
  onRecusar,
  fetchPropostas
}) => {
  const [meusItens, setMeusItens] = useState([]);

  useEffect(() => {
    const fetchMeusItens = async () => {
      try {
        const res = await api.get('/evento', {
          params: { userId: user.id, type: 'item' }
        });
        setMeusItens(res.data || []);
      } catch (err) {
        console.error('Erro ao carregar itens do user', err);
        alert('Erro ao carregar os seus itens');
      }
    };

    if (user?.id) fetchMeusItens();
  }, [user]);

  useEffect(() => {
    console.log("📦 Propostas Recebidas:", propostasRecebidas);
    console.log("🎯 Nome do utilizador:", user?.nome);
    console.log("📦 Meus Itens:", meusItens);
  }, [propostasRecebidas, user, meusItens]);

  const atualizarEstado = async (id, estado, itemProposto = '', proposta) => {
    try {
      const res = await api.put(`/proposta/${id}/estado`, { estado });

      if (res.status === 200) {
        await fetchPropostas();
        if (estado === 'aceite') {
          onAnuncioRemovido?.(itemProposto);
          onAceitar?.(proposta);
        }
        if (estado === 'rejeitada') {
          onRecusar?.(proposta);
        }
      } else {
        throw new Error('Resposta inesperada');
      }
    } catch (err) {
      console.error('Erro ao atualizar estado da proposta:', err);
      alert('Erro ao atualizar proposta');
    }
  };

  const handleCancelarProposta = async (id) => {
    try {
      await api.delete(`/proposta/${id}`);
      alert("Proposta cancelada com sucesso.");
      await fetchPropostas();
    } catch (err) {
      console.error("Erro ao cancelar proposta:", err);
      alert("Erro ao cancelar proposta.");
    }
  };

  return (
    <div className="propostas-painel painel-grid">
      {/* ---------- RECEBIDAS ---------- */}
<div className="coluna propostas-recebidas">
  <h2>📦 Propostas Recebidas</h2>
  {propostasRecebidas.length === 0 ? (
    <p>Não recebeste nenhuma proposta ainda.</p>
  ) : (
    propostasRecebidas.map((p) => (
      <div key={p.participation_id} className="proposta-card-enviada">
        <div className="proposta-img-info">
          <img
            src={p.file ? `http://localhost:5000${p.file}` : 'https://via.placeholder.com/100x100?text=Imagem'}
            alt="Item"
            className="mini-img"
          />
          <div>
            <p><strong>De:</strong> {p.remetente}</p>
            <p><strong>Item pretendido:</strong> {p.itemProposto}</p>
            <p><strong>Item oferecido:</strong> {p.itemParaTroca}</p>
            <p><strong>Status:</strong> {p.status}</p>
          </div>
        </div>
        <div className="buttons" style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <button className="green" onClick={() => atualizarEstado(p.participation_id, 'aceite', p.itemProposto, p)}>Aceitar</button>
          <button className="yellow" onClick={() => onResponder(p, 'contra-proposta')}>Contra-Proposta</button>
          <button className="red" onClick={() => atualizarEstado(p.participation_id, 'rejeitada', '', p)}>Rejeitar</button>
        </div>
      </div>
    ))
  )}
</div>


      {/* ---------- ENVIADAS ---------- */}
      <div className="coluna propostas-enviadas">
        <h2>📣 Propostas Enviadas</h2>
        {propostasEnviadas.length === 0 ? (
          <p>Nenhuma proposta enviada.</p>
        ) : (
          propostasEnviadas.map((p) => (
            <div key={p.participation_id} className="proposta-card-enviada">
              <div className="proposta-img-info">
                <img
                  src={p.file ? `http://localhost:5000${p.file}` : 'https://via.placeholder.com/100x100?text=Imagem'}
                  alt="Item"
                  className="mini-img"
                />
                <div>
                  <p><strong>Para:</strong> {p.destinatario}</p>
                  <p><strong>Item proposto:</strong> {p.itemProposto}</p>
                  <p><strong>Item para troca:</strong> {p.itemParaTroca}</p>
                  <p><strong>Status:</strong> {p.status}</p>
                </div>
              </div>
              <div className="buttons" style={{ marginTop: '10px' }}>
                <button className="red" onClick={() => handleCancelarProposta(p.participation_id)}>Cancelar Proposta</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PropostasPorItem;
