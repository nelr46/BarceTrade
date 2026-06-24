import React, { useState, useEffect } from "react";
import logo from "./assets/logo.png";
import "./styles.css";
import api from "./api"; // <-- Importa o Axios configurado

const Header = ({
  user,
  onLogout,
  onNavigate,
  activePage,
  notificacoes = [],
  fetchNotificacoes,
}) => {
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [notificacoesNaoLidas, setNotificacoesNaoLidas] = useState(
    notificacoes.length
  );

  const navItems = [
    { label: "Página Principal", view: "home" },
    { label: "Trocas", view: "centralTrocas" },
    { label: "Eventos", view: "eventos" },
    { label: "Feedbacks", view: "admin" },
    ...(user?.moderator ? [{ label: 'Moderador', view: 'mod' }] : []) // ✅ Apenas se moderador
  ];

  useEffect(() => {
    setNotificacoesNaoLidas(notificacoes.length);
  }, [notificacoes]);

  const abrirDropdown = async () => {
    setMostrarDropdown((prev) => {
      const novoEstado = !prev;
      if (novoEstado && fetchNotificacoes) {
        fetchNotificacoes(); // 🔥 Só busca quando for abrir o dropdown
      }
      return novoEstado;
    });
  };

  const marcarTodasComoLidas = async () => {
    if (!user?.nome) return;
    try {
      await api.post(
        `/notification/marcar-todas-como-lidas/${user.nome.toLowerCase()}`
      );
      console.log("✅ Notificações marcadas como lidas na API!");
      if (fetchNotificacoes) {
        await fetchNotificacoes(); // 🔥 Atualiza notificações depois
      }
      setMostrarDropdown(false); // Opcional: fechar o dropdown depois de marcar
    } catch (error) {
      console.error("❌ Erro ao marcar notificações:", error);
    }
  };

  return (
    <header className="header">
      <div className="logo">
        <img src={logo} alt="Logo" className="logo-img" />
      </div>

      <nav style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => onNavigate(item.view)}
            className={`nav-button ${activePage === item.view ? "active" : ""}`}
          >
            {item.label}
          </button>
        ))}

        {/* 🔔 Ícone de Notificações */}
        <div className="notificacoes-wrapper">
          <span
            className="notificacao-icon"
            title="Notificações"
            onClick={abrirDropdown}
            style={{ cursor: "pointer", position: "relative" }}
          >
            🔔
            {notificacoesNaoLidas > 0 && (
              <span className="notificacao-badge">{notificacoesNaoLidas}</span>
            )}
          </span>

          {mostrarDropdown && (
            <div className="dropdown-notificacoes">
              <h4>Notificações</h4>

              <button
                onClick={marcarTodasComoLidas}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "blue",
                  cursor: "pointer",
                  marginBottom: "10px",
                  fontSize: "14px",
                }}
              >
                Marcar todas como lidas
              </button>

              <ul style={{ listStyleType: "none", padding: 0 }}>
                {notificacoes.length === 0 && <li>Sem notificações</li>}
                {notificacoes.map((n, idx) => (
                  <li
                    key={idx}
                    style={{
                      marginBottom: "8px",
                      borderBottom: "1px solid #eee",
                      paddingBottom: "4px",
                    }}
                  >
                    {n.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ⤴️ Logout */}
        <span
          className="login-icon"
          title="Sair"
          onClick={onLogout}
          style={{ fontSize: "20px", cursor: "pointer" }}
        >
          ⤴️
        </span>
      </nav>
    </header>
  );
};

export default Header;
