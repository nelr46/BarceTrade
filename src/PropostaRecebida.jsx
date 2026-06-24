import React from 'react';
import api from './api';

const PropostaRecebida = ({ propostas = [], onSwitch }) => {
  const handleAceitar = async (proposta) => {
    try {
      await api.put(`/proposta/${proposta.participation_id}`, {
        ...proposta,
        status: 'aceita'
      });
      alert('Proposta aceite com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao aceitar proposta.');
    }
  };

  const handleRecusar = async (proposta) => {
    try {
      await api.put(`/proposta/${proposta.participation_id}`, {
        ...proposta,
        status: 'recusada'
      });
      alert('Proposta recusada.');
    } catch (err) {
      console.error(err);
      alert('Erro ao recusar proposta.');
    }
  };

  if (!propostas.length) return <p>Não tens propostas pendentes.</p>;

  return (
    <div className="form-container">
      <h3>📬 Propostas Recebidas</h3>
      {propostas.map((proposta) => (
        <div key={proposta.participation_id} className="proposta-card">
          <p><strong>De:</strong> {proposta.remetente}</p>
          <p><strong>Item para troca:</strong> {proposta.itemParaTroca}</p>
          <p><strong>Item proposto:</strong> {proposta.itemProposto}</p>

          <div className="buttons">
            <button className="green" onClick={() => handleAceitar(proposta)}>Aceitar</button>
            <button className="yellow" onClick={() => onSwitch('editarProposta')}>Contra-Proposta</button>
            <button className="red" onClick={() => handleRecusar(proposta)}>Recusar</button>
          </div>

          <hr />
        </div>
      ))}
    </div>
  );
};
export default PropostaRecebida;
