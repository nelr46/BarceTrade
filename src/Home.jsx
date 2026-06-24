import React, { useEffect, useState } from "react";
import api from "./api";

const Home = ({ user, onDenunciar, onTrocar, onAdd }) => {
  const [anuncios, setAnuncios] = useState([]);
  const [ordenar, setOrdenar] = useState("Recentes");
  const [pesquisa, setPesquisa] = useState("");
  const [anunciosAceites, setAnunciosAceites] = useState([]);

  const fetchAnuncios = async () => {
    try {
      const [resEventos, resPropostas] = await Promise.all([
        api.get("/evento", { params: { type: "item" } }),
        api.get("/proposta"),
      ]);

      const propostasAceites = resPropostas.data.filter(
        (p) => p.status === "aceite"
      );
      const titulosAceites = propostasAceites.map((p) => p.itemProposto);

      const dados = resEventos.data
        .filter(
          (e) =>
            !titulosAceites.includes(e.title) &&
            (e.status === "ativo" || e.status === "permitido")
        )
        .map((e) => {
          const desc = e.description || "";
          const [estadoRaw, pretendidoRaw] = desc.split(" - Pretende: ");
          const estado = estadoRaw || e.status || "Desconhecido";
          const pretendido = pretendidoRaw || "Não especificado";

          return {
            id: e.postId,
            titulo: e.title,
            estado,
            pretendido,
            tipo: e.local || "Desconhecido",
            data: e.creationDate || e.scheduling || new Date(),
            imagem: e.imagePath
              ? `http://localhost:5000${e.imagePath}`
              : "https://via.placeholder.com/250x150?text=Sem+Imagem",
            dono: e.userName || "Desconhecido",
            autor: e.userName || "Desconhecido",
            userId: e.userId || null,
            participation_id: e.participation_id || null,
          };
        });

      setAnuncios(dados);
    } catch (err) {
      console.error("Erro ao buscar eventos:", err);
      alert("Erro ao carregar anúncios.");
    }
  };

  const fetchPropostasAceites = async () => {
    try {
      const res = await api.get("/proposta");
      const aceites = res.data
        .filter((p) => p.status === "aceite")
        .map((p) => p.itemProposto);
      setAnunciosAceites(aceites);
    } catch (err) {
      console.error("Erro ao buscar propostas aceites", err);
    }
  };

  const handleRemoverItem = async (itemId) => {
    
    try {
      await api.delete(`/evento/${itemId}`);
      alert("Item removido com sucesso!");
      fetchAnuncios();
    } catch (err) {
      console.error("Erro ao remover item:", err);
      alert("Erro ao remover item.");
    }
  };

  useEffect(() => {
    fetchAnuncios();
    fetchPropostasAceites();
  }, []);

  const filtrarAnuncios = () => {
    let resultado = [...anuncios];
    resultado = resultado.filter((a) => !anunciosAceites.includes(a.titulo));

    if (pesquisa.trim() !== "") {
      resultado = resultado.filter((a) =>
        a.tipo.toLowerCase().includes(pesquisa.toLowerCase())
      );
    }

    resultado.sort((a, b) =>
      ordenar === "Recentes"
        ? new Date(b.data) - new Date(a.data)
        : new Date(a.data) - new Date(b.data)
    );

    return resultado;
  };

  return (
    <div className="home-container">
      <div className="filtros">
        <h2>Anúncios</h2>

        <select
          className="borders"
          value={ordenar}
          onChange={(e) => setOrdenar(e.target.value)}
        >
          <option>Recentes</option>
          <option>Mais antigos</option>
        </select>

        <input
          type="text"
          placeholder="Pesquisar por localidade..."
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
          className="styled-input"
        />

        <button
          className="black"
          onClick={() => {
            fetchAnuncios();
            fetchPropostasAceites();
          }}
        >
          🔄 Recarregar
        </button>
      </div>

      <div className="anuncios-lista centralizada">
        {filtrarAnuncios().map((item) => (
          <div key={item.id} className="anuncio-wrapper">
            <div className="anuncio-card">
              <img src={item.imagem} alt={item.titulo} />
              <h3>{item.titulo}</h3>
              <p><strong>Estado:</strong> {item.estado}</p>
              <p><strong>Itens pretendidos:</strong> {item.pretendido}</p>
            </div>

            <div className="spacing">
              {item.userId === user?.id ? (
                <button
                  className="red"
                  onClick={() => handleRemoverItem(item.id)}
                >
                  Remover Item
                </button>
              ) : (
                <button
                  className="green"
                  onClick={() => onTrocar(item)}
                >
                  Propor Troca
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <button className="chat-button" onClick={() => onAdd("chat")}>
        💬
      </button>
    </div>
  );
};

export default Home;
