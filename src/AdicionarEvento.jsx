// src/AdicionarEvento.jsx
import React, { useState } from 'react';
import api from './api';

const AdicionarEvento = ({ user, onEventoAdicionado }) => {
  const [form, setForm] = useState({
    nome: '',
    tema: '',
    email: '',
    descricao: '',
    type: 'evento'
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', form.nome);
    formData.append('description', `Tema: ${form.tema} - ${form.descricao}`); // ✅ Sem o email aqui
    formData.append('email', form.email); // ✅ Enviado em campo próprio
    formData.append('status', 'pendente');
    formData.append('scheduling', new Date().toISOString());
    formData.append('userId', user.id);
    formData.append('type', 'evento');

    try {
      const res = await api.post('/evento', formData);
      alert(res.data.message || 'Evento adicionado com sucesso!');
      onEventoAdicionado?.(); // volta para lista de eventos
    } catch (err) {
      console.error('Erro ao adicionar evento', err);
      alert('Erro ao adicionar evento');
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Adicionar</h1>

        <label>Nome</label>
        <input type="text" name="nome" value={form.nome} onChange={handleChange} required />

        <label>Tema</label>
        <input type="text" name="tema" value={form.tema} onChange={handleChange} required />

        <label>Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} required />

        <label>Descrição</label>
        <textarea name="descricao" value={form.descricao} onChange={handleChange} required rows="4" />

        <button type="submit" style={{ marginTop: '20px' }}>Adicionar</button>
      </form>
    </div>
  );
};

export default AdicionarEvento;
