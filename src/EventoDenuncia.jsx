import React from 'react';
import api from './api';

const EventoDenuncia = ({ evento = {}, denuncia = {}, onVoltar }) => {
  const handlePermitir = async () => {
    try {
      await api.put(`/evento/${evento.post_id}`, {
        ...evento,
        status: 'permitido'
      });
      alert('Evento mantido.');
      onVoltar?.();
    } catch (err) {
      console.error(err);
      alert('Erro ao permitir evento.');
    }
  };

  const handleRemover = async () => {
    try {
      await api.delete(`/evento/${evento.post_id}`);
      alert('Evento removido com sucesso!');
      onVoltar?.();
    } catch (err) {
      console.error(err);
      alert('Erro ao remover evento.');
    }
  };

  const handleAlterar = async () => {
    try {
      await api.put(`/denuncia/${denuncia.report_id}`, {
        ...denuncia,
        status: 1 // por exemplo: "em análise"
      });
      alert('Denúncia marcada como "em análise".');
    } catch (err) {
      console.error(err);
      alert('Erro ao alterar denúncia.');
    }
  };

  return (
    <div className="form-container">
      <h3>Denúncia</h3>
      <p><strong>Evento:</strong> {evento?.title || 'Título não disponível'}</p>

      <label>Motivo</label>
      <textarea defaultValue="Atividades Ilícitas" readOnly />
      <label>Descrição</label>
      <textarea defaultValue={denuncia?.descricao || ''} readOnly />

      <div className="buttons">
        <button className="green" onClick={handlePermitir}>Permitir</button>
        <button className="yellow" onClick={handleAlterar}>Alterar</button>
        <button className="red" onClick={handleRemover}>Remover</button>
      </div>
    </div>
  );
};

export default EventoDenuncia;
