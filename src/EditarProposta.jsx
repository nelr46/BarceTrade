import React, { useState, useEffect } from 'react';
import api from './api'; // axios configurado

const EditarProposta = ({ proposta, onBack }) => {
  const [itemTroca, setItemTroca] = useState('');
  const [itemProposto, setItemProposto] = useState('');

  useEffect(() => {
    if (proposta) {
      setItemTroca(proposta.itemParaTroca || '');
      setItemProposto(proposta.itemProposto || '');
    }
  }, [proposta]);

  const handleUpdate = async () => {
    if (!proposta?.participation_id) {
      alert('ID da proposta não encontrado.');
      return;
    }

    try {
      await api.put(`/proposta/${proposta.participation_id}`, {
        description: `${itemTroca} ↔ ${itemProposto}`,
        file: 'proposta_editada.pdf' // substitui por algo real se necessário
      });

      alert('Proposta atualizada com sucesso!');
      onBack?.();
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar proposta');
    }
  };

  return (
    <div className="form-container">
      <h4>Editar Proposta</h4>
      <p><strong>{proposta?.remetente || 'Utilizador'}</strong></p>

      <label>Item para troca</label>
      <select value={itemTroca} onChange={e => setItemTroca(e.target.value)}>
        <option value="">-- Escolhe um item --</option>
        <option>Secador</option>
        <option>Máquina de café</option>
      </select>

      <label>Item proposto</label>
      <select value={itemProposto} onChange={e => setItemProposto(e.target.value)}>
        <option value="">-- Escolhe um item --</option>
        <option>Frigorífico</option>
        <option>Forno</option>
      </select>

      <div className="buttons">
        <button className="green" onClick={handleUpdate}>Enviar</button>
        <button className="red" onClick={onBack}>Cancelar</button>
      </div>
    </div>
  );
};

export default EditarProposta;
