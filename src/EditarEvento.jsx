import React, { useState, useEffect } from 'react';
import api from './api';

const EditarEvento = ({ evento, onBack }) => {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState('');

  useEffect(() => {
    if (evento) {
      setTitulo(evento.title || '');
      setDescricao(evento.description || '');
      setData(evento.scheduling?.split('T')[0] || '');
    }
  }, [evento]);

  const handleGuardar = async () => {
    if (!evento?.postId) {
      alert('ID do evento não encontrado.');
      return;
    }
  
    try {
      await api.put(`/evento/${evento.postId}`, {
        title: titulo,
        description: descricao,
        scheduling: new Date(data).toISOString(),
        status: evento.status || 'ativo',
        local: evento.local || 'Não especificado',
        creation_date: evento.creation_date || new Date().toISOString()
      });
  
      alert('Evento guardado com sucesso!');
      onBack();
    } catch (err) {
      console.error(err);
      alert('Erro ao guardar alterações');
    }
  };  

  if (!evento) return <p>Evento não encontrado.</p>;

  return (
    <div className="editar-evento-container">
      <h2>✏️ Editar Evento</h2>
  
      <label>Título:</label>
      <input
        type="text"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
      />
  
      <label>Descrição:</label>
      <textarea
        rows={4}
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
      />
  
      <label>Data:</label>
      <input
        type="date"
        value={data}
        onChange={(e) => setData(e.target.value)}
      />
  
      <div className="buttons">
        <button className="green" onClick={handleGuardar}>Guardar</button>
        <button className="red" onClick={onBack}>Cancelar</button>
      </div>
    </div>
  );  
};

export default EditarEvento;
