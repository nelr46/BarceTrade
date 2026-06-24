import React, { useEffect, useState } from "react";
import api from "./api";

const EventoPainel = ({ user, onEdit, onAdd }) => {
  const [eventos, setEventos] = useState([]);
  const [participacoes, setParticipacoes] = useState([]);
  const [filtro, setFiltro] = useState("eventos");

  const fetchEventos = async () => {
    try {
      const res = await api.get("/evento", {
        params: { userId: user?.id, type: "evento" },
      });
      setEventos(res.data || []);
    } catch (err) {
      console.error("Erro ao carregar eventos:", err);
    }
  };

  const fetchParticipacoes = async () => {
    try {
      const res = await api.get("/participacoes", {
        params: { userId: user?.id },
      });
      setParticipacoes(res.data || []);
    } catch (err) {
      console.error("Erro ao buscar participacoes:", err);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchEventos();
      fetchParticipacoes();
    }
  }, [user]);

  const handleParticipar = async (evento) => {
    try {
      await api.post("/notification", {
        type: 1,
        message: `${user.nome} participou no teu evento "${evento.title}"`,
        destinatario: evento.userName,
      });
      alert(`Participaste no evento "${evento.title}"`);
    } catch (err) {
      console.error("Erro ao participar:", err);
    }
  };

  const handleCancelarParticipacao = async (eventoId) => {
    try {
      await api.delete(`/participacoes/${eventoId}/${user.id}`);
      setParticipacoes((prev) => prev.filter((e) => e.postId !== eventoId));
      alert("Participacao cancelada.");
    } catch (err) {
      console.error("Erro ao cancelar participacao:", err);
    }
  };

  const handleEliminar = async (id) => {
    
    try {
      await api.delete(`/evento/${id}`);
      setEventos((prev) => prev.filter((e) => e.postId !== id));
      alert("Evento eliminado.");
    } catch (err) {
      console.error("Erro ao eliminar:", err);
    }
  };

  const renderEventos = () => {
    const eventosFiltrados = eventos.filter((e) =>
      filtro === "meus"
        ? e.userId === user?.id
        : filtro === "participar"
        ? participacoes.some((p) => p.postId === e.postId)
        : e.status === "permitido" || e.userId === user?.id
    );

    if (eventosFiltrados.length === 0) return <p>Sem eventos a mostrar.</p>;

    return eventosFiltrados.map((evento) => (
      <div key={evento.postId} className="anuncio-card evento-card">
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
          ) : filtro === "participar" ? (
            <button
              className="red"
              onClick={() => handleCancelarParticipacao(evento.postId)}
            >
              Cancelar Participacao
            </button>
          ) : (
            <button className="green" onClick={() => handleParticipar(evento)}>
              Participar
            </button>
          )}
        </div>
      </div>
    ));
  };

  return (
    <div className="home-container">
      <h2>📅 Painel de Eventos</h2>

      <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
        <select
          className="borders"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        >
          <option value="eventos">Eventos</option>
          <option value="meus">Meus Eventos</option>
          <option value="participar">Eventos que vou participar</option>
        </select>

        {filtro === "meus" && (
          <button
            className="black"
            style={{ marginLeft: "10px" }}
            onClick={() => onAdd("adicionarEvento")}
          >
            ➕ Adicionar Evento
          </button>
        )}
      </div>

      <div className="anuncios-lista eventos">{renderEventos()}</div>
    </div>
  );
};

export default EventoPainel;