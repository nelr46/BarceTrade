import React, { useState } from 'react';
import api from './api';

const AvaliacaoForm = ({ user, proposta, onCancel, onSubmit }) => {
  const [rating, setRating] = useState(1);
  const [texto, setTexto] = useState('');
  const [denuncia, setDenuncia] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [descDenuncia, setDescDenuncia] = useState('');

  const handleEnviar = async () => {
    try {
      // Enviar feedback com remetente e destinatario
      await api.post('/feedback', {
        rating,
        notes: texto,
        remetente: user?.nome,
        destinatario: proposta?.remetente, // Quem criou o evento/item
      });

      // Se denúncia estiver ativada, enviar também
      
      alert('Feedback enviado com sucesso!');
      if (onSubmit) onSubmit();
    } catch (err) {
      console.error("Erro ao submeter feedback/denúncia:", err);
      alert('Erro ao submeter feedback.');
    }
  };

  return (
    <div style={{ padding: '40px' }}>
      <h2 style={{ marginBottom: '30px' }}>Feedback</h2>
      <div
        className="form-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '40px',
          alignItems: 'start',
        }}
      >
        <div>
          <label><strong>Classificação</strong></label>
          <div className="stars" style={{ marginBottom: '10px' }}>
            {[1, 2, 3, 4, 5].map(n => (
              <span
                key={n}
                onClick={() => setRating(n)}
                style={{
                  fontSize: '30px',
                  cursor: 'pointer',
                  color: rating >= n ? 'blue' : 'gray',
                }}
              >
                ★
              </span>
            ))}
          </div>

          <label><strong>Descrição</strong></label>
          <textarea
            value={texto}
            onChange={e => setTexto(e.target.value)}
            rows={4}
            style={{ width: '100%' }}
          />
        </div>

      </div>

      <div
        style={{
          marginTop: '30px',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '15px',
        }}
      >
        <button className="green" onClick={handleEnviar}>Enviar</button>
        <button className="red" onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  );
};

export default AvaliacaoForm;
