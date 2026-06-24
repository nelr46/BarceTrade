import React, { useEffect, useState } from 'react';
import api from './api';

const Trocas = ({ user, onResponder, onCancelar }) => {
  const [propostas, setPropostas] = useState([]);

  const carregarPropostas = async () => {
    try {
      const res = await api.get('/proposta');
      setPropostas(res.data);
    } catch (err) {
      console.error(err);
      alert('Erro ao carregar propostas');
    }
  };

  const handleAtualizarStatus = async (proposta, novoStatus) => {
    try {
      await api.put(`/proposta/${proposta.participation_id}`, {
        ...proposta,
        status: novoStatus
      });
      alert(`Proposta ${novoStatus === 'aceita' ? 'aceita' : 'recusada'}!`);
      carregarPropostas();
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar proposta');
    }
  };

  useEffect(() => {
    carregarPropostas();
  }, []);

  const propostasEnviadas = propostas.filter(p => p.remetente === user?.nome);
  const propostasRecebidas = propostas.filter(p => p.destinatario === user?.nome);

  return (
    <div className="form-container">
      <h2>📤 Propostas Realizadas</h2>
      {propostasEnviadas.length === 0 ? (
        <p>❌ Nenhuma proposta enviada.</p>
      ) : (
        propostasEnviadas.map((p, index) => (
          <div key={index} className="proposta-box">
            <p>
              <strong>Para:</strong> {p.destinatario}<br />
              <strong>Trocar:</strong> <em>{p.itemParaTroca}</em> por <em>{p.itemProposto}</em><br />
              <strong>Estado:</strong> {p.status === 'aceita' ? '✅ Aceita' : p.status === 'recusada' ? '❌ Recusada' : '⌛ Pendente'}
            </p>
            <hr />
          </div>
        ))
      )}

      <h2 style={{ marginTop: '40px' }}>📥 Propostas Recebidas</h2>
      {propostasRecebidas.length === 0 ? (
        <p>❌ Nenhuma proposta recebida.</p>
      ) : (
        propostasRecebidas.map((p, index) => (
          <div key={index} className="proposta-box" style={{ marginBottom: '20px' }}>
            <p>
              <strong>De:</strong> {p.remetente}<br />
              <strong>Trocar:</strong> <em>{p.itemParaTroca}</em> por <em>{p.itemProposto}</em><br />
              <strong>Estado:</strong> {p.status === 'aceita' ? '✅ Aceita' : p.status === 'recusada' ? '❌ Recusada' : '⌛ Pendente'}
            </p>

            {p.status === 'pendente' && (
              <div className="buttons" style={{ marginTop: '10px' }}>
                <button className="green" onClick={() => handleAtualizarStatus(p, 'aceita')}>Aceitar</button>
                <button className="red" onClick={() => handleAtualizarStatus(p, 'recusada')}>Recusar</button>
                <button className="yellow" onClick={() => onResponder(p)}>Contra-Proposta</button>
              </div>
            )}

            <hr />
          </div>
        ))
      )}

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button className="black" onClick={onCancelar}>Voltar</button>
      </div>
    </div>
  );
};

export default Trocas;
