import React, { useState } from 'react';
import api from './api';

const PropostaForm = ({ user, propostaInicial = {}, onSend, onCancel }) => {
  const [itemParaTroca, setItemParaTroca] = useState('');
  const [foto, setFoto] = useState(null);

  const itemProposto = propostaInicial.itemProposto?.trim() || 'Item desconhecido';
  const destinatario = propostaInicial.destinatario?.trim() || 'Desconhecido';

  const storedUser = JSON.parse(localStorage.getItem('user'));
  const nomeRemetente = user?.nome || storedUser?.nome || 'Utilizador';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!itemParaTroca) {
      alert("Por favor, indica o nome do item que vais propor.");
      return;
    }

    // ✅ Constrói um objeto de proposta para enviar ao App.jsx
    const novaProposta = {
      destinatario,
      itemProposto,
      itemParaTroca,
      foto
    };

    // 🔁 Passa o objeto para o App.jsx
    onSend?.(novaProposta);
  };

  return (
    <div className="form-container">
      <h3>Enviar Proposta a <strong>{destinatario}</strong></h3>
      <hr />
      <p><strong>Item pretendido:</strong> {itemProposto}</p>

      <label>Item que vais oferecer</label>
      <input
        type="text"
        value={itemParaTroca}
        onChange={(e) => setItemParaTroca(e.target.value)}
        placeholder="Ex: Bicicleta vermelha"
        required
      />

      <label>Imagem do teu item (opcional)</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFoto(e.target.files[0])}
      />

      <div className="buttons" style={{ marginTop: '20px' }}>
        <button className="green" onClick={handleSubmit}>Enviar</button>
        <button className="red" onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  );
};

export default PropostaForm;
