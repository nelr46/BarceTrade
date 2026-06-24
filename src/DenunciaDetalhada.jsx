import React, { useState, useEffect } from 'react';
import api from './api';

const DenunciaDetalhada = ({ anuncio }) => {
  const [form, setForm] = useState({
    motivo: 'Atividades Ilícitas',
    gravidade: 'Alta',
    descricao: '',
    autoridades: false,
    confirmacao: true
  });

  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async () => {
    if (!form.confirmacao) {
      alert('Precisa confirmar a veracidade da denúncia.');
      return;
    }

    if (!user || !anuncio) {
      alert("Utilizador ou anúncio inválido.");
      return;
    }

    try {
      await api.post('/denuncia', {
        reportUserId: user.id,
        postId: anuncio.id, // ← aqui usamos corretamente o ID do post (postId)
        status: 0,
        motivo: `${form.motivo} (Gravidade: ${form.gravidade})`,
        descricao: form.descricao,
        remetente: user.nome,
        participationId: anuncio.participation_id || null,
        destinatario: anuncio.dono,
        titulo: anuncio.titulo
      });

      alert('Denúncia enviada com sucesso!');
    } catch (err) {
      console.error("Erro ao enviar denúncia:", err);
      alert('Erro ao enviar denúncia');
    }
  };

  return (
    <div className="form-container">
      <h2>Denunciar Anúncio</h2>
      <p><strong>Anúncio:</strong> {anuncio?.titulo || 'Desconhecido'}</p>
      <hr />

      <div className="grid-2col">
        <div>
          <label>Motivo</label>
          <select name="motivo" value={form.motivo} onChange={handleChange}>
            <option>Atividades Ilícitas</option>
            <option>Spam</option>
            <option>Conteúdo impróprio</option>
          </select>

          <label>Gravidade</label>
          <select name="gravidade" value={form.gravidade} onChange={handleChange}>
            <option>Alta</option>
            <option>Média</option>
            <option>Baixa</option>
          </select>
        </div>

        <div>
          <label>Descrição</label>
          <textarea
            name="descricao"
            value={form.descricao}
            onChange={handleChange}
          ></textarea>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
            <label htmlFor="autoridades" style={{ fontWeight: 'bold' }}>
              Devem ser envolvidas as autoridades?
            </label>
            <input
              type="checkbox"
              id="autoridades"
              name="autoridades"
              checked={form.autoridades}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div className="checkbox" style={{ marginTop: '20px' }}>
        <input
          type="checkbox"
          name="confirmacao"
          checked={form.confirmacao}
          onChange={handleChange}
        />
        <label className="subtext">
          Confirmo perante a minha honra a veracidade desta denúncia,
          sujeitando-me a ser processado por difamação.
        </label>
      </div>

      <button className="black" onClick={handleSubmit} style={{ marginTop: '20px' }}>
        Enviar
      </button>
    </div>
  );
};

export default DenunciaDetalhada;
