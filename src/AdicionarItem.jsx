import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import api from './api';

const AdicionarItem = ({ user, onItemAdicionado }) => {
  const [form, setForm] = useState({
    nome: '',
    estado: '',
    item: '',
    foto: null
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = e => {
    setForm({ ...form, foto: e.target.files[0] });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('Title', form.nome);
    formData.append('Description', `${form.estado} - Pretende: ${form.item}`);
    formData.append('Status', 'ativo');
    formData.append('Scheduling', new Date().toISOString());
    formData.append('UserId', user.id);
    formData.append('type', 'item'); // ✅ MAIÚSCULO

    if (form.foto) {
      formData.append('Foto', form.foto); // ✅ MAIÚSCULO para coincidir com backend
    }

    try {
      const res = await api.post('/evento', formData);
      alert(res.data.message || 'Item adicionado com sucesso!');
      onItemAdicionado?.(); // voltar para Home
    } catch (err) {
      console.error('Erro ao adicionar item', err);
      alert('Erro ao adicionar item');
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Adicionar</h1>

        <label>Nome</label>
        <input type="text" name="nome" value={form.nome} onChange={handleChange} required />

        <label>Estado</label>
        <input type="text" name="estado" value={form.estado} onChange={handleChange} required />

        <label>Item Pretendido</label>
        <input type="text" name="item" value={form.item} onChange={handleChange} required />

        <label>Fotografia</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <Upload size={20} />
        </div>

        <button type="submit" style={{ marginTop: '20px' }}>Adicionar</button>
      </form>
    </div>
  );
};

export default AdicionarItem;
