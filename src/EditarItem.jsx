import React, { useState, useEffect } from 'react';
import api from './api'; // axios configurado

const EditarItem = ({ item = null, onBack }) => {
  const [form, setForm] = useState({
    nome: '',
    tema: '',
    email: '',
    descricao: ''
  });

  useEffect(() => {
    if (item) {
      setForm({
        nome: item.local || '',
        tema: item.title || '',
        email: item.email || '', // ajustar se tiver email no item
        descricao: item.description || ''
      });
    }
  }, [item]);

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!item?.post_id) {
      alert('ID do item não encontrado.');
      return;
    }

    try {
      await api.put(`/evento/${item.post_id}`, {
        title: form.tema,
        description: form.descricao,
        local: form.nome,
        creation_date: item.creation_date || new Date().toISOString(),
        scheduling: item.scheduling || new Date().toISOString(),
        status: item.status || 'ativo'
      });

      alert('Item atualizado com sucesso!');
      onBack?.();
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar item');
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Editar</h1>

        <label>Nome</label>
        <div style={{ display: 'flex' }}>
          <input name="nome" value={form.nome} onChange={handleChange} />
          <span>🖉</span>
        </div>

        <label>Tema</label>
        <div style={{ display: 'flex' }}>
          <input name="tema" value={form.tema} onChange={handleChange} />
          <span>🖉</span>
        </div>

        <label>Email</label>
        <div style={{ display: 'flex' }}>
          <input name="email" value={form.email} onChange={handleChange} />
          <span>🖉</span>
        </div>

        <label>Descrição</label>
        <div style={{ display: 'flex' }}>
          <textarea name="descricao" value={form.descricao} onChange={handleChange}></textarea>
          <span>🖉</span>
        </div>

        <button type="submit" className="black">Alterar</button>
      </form>
    </div>
  );
};

export default EditarItem;
