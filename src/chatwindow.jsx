import React, { useEffect, useState } from "react";
import api from "./api";

const ChatWindow = ({ user, contact, onBack }) => {
  const [mensagens, setMensagens] = useState([]);
  const [novaMensagem, setNovaMensagem] = useState("");

  const fetchMensagens = async () => {
    try {
      const res = await api.get(
        `/chat/conversa?user1=${user.id}&user2=${contact.id}`
      );
      setMensagens(res.data || []);
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
    }
  };

  useEffect(() => {
    if (user?.id && contact?.id) {
      fetchMensagens();
      const interval = setInterval(fetchMensagens, 5000); // Atualiza a cada 5s
      return () => clearInterval(interval);
    }
  }, [user, contact]);

  const handleEnviarMensagem = async () => {
    if (!novaMensagem.trim()) return;

    try {
      await api.post("/chat", {
        senderId: user.id,
        receiverId: contact.id,
        content: novaMensagem.trim(),
      });
      setNovaMensagem("");
      fetchMensagens();
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    }
  };

  return (
    <div className="form-container">
      <h2>Conversando com {contact.name}</h2>

      <div
        style={{
          height: "300px",
          overflowY: "auto",
          border: "1px solid #ddd",
          padding: "10px",
          borderRadius: "6px",
          background: "#f9f9f9",
          marginBottom: "20px",
        }}
      >
        {mensagens.length === 0 && (
          <p style={{ color: "gray" }}>Nenhuma mensagem ainda.</p>
        )}
        {mensagens.map((m, idx) => (
          <div
            key={idx}
            style={{
              textAlign: m.senderId === user.id ? "right" : "left",
              marginBottom: "10px",
            }}
          >
            <span
              style={{
                backgroundColor: m.senderId === user.id ? "#c7f05c" : "#eee",
                padding: "8px 12px",
                borderRadius: "20px",
                display: "inline-block",
                maxWidth: "70%",
              }}
            >
              {m.content}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <input
          type="text"
          className="styled-input"
          placeholder="Escreve uma mensagem..."
          value={novaMensagem}
          onChange={(e) => setNovaMensagem(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleEnviarMensagem();
            }
          }}
        />
        <button className="black" onClick={handleEnviarMensagem}>
          Enviar
        </button>
      </div>

      <button className="red" style={{ marginTop: "20px" }} onClick={onBack}>
        Voltar
      </button>
    </div>
  );
};

export default ChatWindow;
