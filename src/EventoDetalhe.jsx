import React, { useEffect, useState } from "react";
import api from "./api";

const EventoDetalhe = ({ user, onEdit, onAdd }) => {
  const [eventos, setEventos] = useState([]);

  const fetchEventos = async () => {
    try {
      const res = await api.get("/evento", {
        params: { userId: user?.id, type: "evento" },
      });
      const todos = res.data || [];

      // Filtrar para mostrar só "permitidos", exceto se for o autor
      const filtrados = todos.filter(e => e.status === 'permitido' || e.userId === user?.id);
      setEventos(filtrados);
    } catch (err) {
      console.error('Erro ao buscar eventos:', err);
      alert('Erro ao carregar eventos');
    }
  };


  useEffect(() => {
    if (user?.id) {
      fetchEventos();
    }
  }, [user]);

  const handleEliminar = async (id) => {
    const confirmar = window.confirm(
      "Tens a certeza que queres eliminar este evento?"
    );
    if (!confirmar) return;

    try {
      await api.delete(`/evento/${id}`);
      setEventos((prev) => prev.filter((e) => e.postId !== id));
      alert("Evento eliminado com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao apagar evento.");
    }
  };

  const handleParticipar = async (evento) => {
    try {
      alert(`Participaste no evento "${evento.title}"`);

      await api.post("/notification", {
        type: 1,
        message: `${user.nome} participou no teu evento "${evento.title}"`,
        destinatario: evento.userName,
      });
    } catch (err) {
      console.error("Erro ao participar e enviar notificação:", err);
      alert("Erro ao participar no evento");
    }
  };

  const abrirChat = (evento) => {
    onAdd("chat", {
      destinatarioId: evento.userId,
      destinatarioNome: evento.userName,
    });
  };

  return (
    <div className="home-container eventos-container">
      <h2>🗓️ Meus Eventos</h2>

      <div className="anuncios-lista eventos">
        <div
          className="anuncio-wrapper"
          onClick={() => onAdd("adicionarEvento")}
          style={{ cursor: "pointer" }}
        >
          <div className="anuncio-card evento-adicionar">
            <img
              src="https://cdn-icons-png.flaticon.com/512/992/992651.png"
              alt="Adicionar"
              style={{ width: "60px", height: "60px", marginBottom: "10px" }}
            />
            <h3>Adicionar Evento</h3>
          </div>
        </div>

       

{eventos.map((evento) => (
  <div key={evento.postId} className="anuncio-wrapper">
    <div className="anuncio-card evento-card">
      <img
        src={
          evento.imagePath
            ? `http://localhost:5000${evento.imagePath}`
            : "https://via.placeholder.com/250x150?text=Evento"
        }
        alt={evento.title}
      />
      <h3>{evento.title}</h3>
      <p>
        <strong>Estado:</strong> {evento.status}
      </p>
      <p>
        <strong>Local:</strong> {evento.local}
      </p>

      <div style={{ marginTop: "10px", textAlign: "center" }}>
        {evento.userId === user?.id ? (
          <>
            <button className="green" onClick={() => onEdit(evento)}>
              Editar
            </button>
            <button
              className="red"
              style={{ marginLeft: "10px" }}
              onClick={() => handleEliminar(evento.postId)}
            >
              Eliminar
            </button>
          </>
        ) : (
          <button
            className="green"
            onClick={() => handleParticipar(evento)}
          >
            Participar
          </button>
        )}

        {/* ✅ Botão "Chat" acessível a todos os utilizadores logados */}
        <button
          className="yellow"
          style={{ marginLeft: "10px" }}
          onClick={() => abrirChat(evento)}
        >
          Chat
        </button>
      </div>
    </div>
  </div>
))}

      </div>
    </div>
  );
};

export default EventoDetalhe;
