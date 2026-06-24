import React, { useEffect, useState } from 'react';
import api from './api';

const TrocasRecebidas = ({ user, onContraProposta }) => {
  const [propostas, setPropostas] = useState([]);

  const carregarPropostas = async () => {
    try {
      const res = await api.get('/proposta');
      const todas = res.data || [];
      const recebidas = todas.filter(p => p.destinatario === user?.nome);
      setPropostas(recebidas);
    } catch (err) {
      console.error(err);
      alert('Erro ao carregar propostas');
    }
  };

  const atualizarStatus = async (proposta, novoStatus) => {
    try {
      await api.put(`/proposta/${proposta.participation_id}`, {
        ...proposta,
        status: novoStatus
      });
      alert(`Proposta ${novoStatus === 'aceita' ? 'aceita' : 'recusada'} com sucesso.`);
      carregarPropostas();
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar proposta.');
    }
  };

  useEffect(() => {
    carregarPropostas();
  }, []);

  return (
    <div className="form-container">
      <h2>Trocas Recebidas</h2>
      {propostas.length === 0 ? (
        <p>Não recebeste nenhuma proposta ainda.</p>
      ) : (
        propostas.map((p, index) => (
          <div key={index} className="proposta-box">
            <p><strong>De:</strong> {p.remetente}</p>
            <p><strong>Item para troca:</strong> {p.itemParaTroca}</p>
            <p><strong>Item proposto:</strong> {p.itemProposto}</p>

            {p.status === 'pendente' && (
              <div className="buttons" style={{ marginTop: '10px' }}>
                <button className="green" onClick={() => atualizarStatus(p, 'aceita')}>Aceitar</button>
                <button className="yellow" onClick={() => onContraProposta(p)}>Contra-Proposta</button>
                <button className="red" onClick={() => atualizarStatus(p, 'recusada')}>Recusar</button>
              </div>
            )}
            <hr />
          </div>
        ))
      )}
    </div>
  );
};

export default TrocasRecebidas;
