import React, { useEffect, useState } from "react";
import api from "./api";

const ChatList = ({ user, onSelectChat }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get(`/user`);
        // Não mostra o próprio utilizador na lista
        const otherUsers = res.data.filter((u) => u.user_id !== user.id);
        setUsers(otherUsers);
      } catch (error) {
        console.error("Erro ao carregar utilizadores:", error);
      }
    };

    if (user?.id) fetchUsers();
  }, [user]);

  return (
    <div className="form-container">
      <h2>Conversas</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {users.length === 0 && <li>Sem outros utilizadores.</li>}
        {users.map((u) => (
          <li key={u.user_id} style={{ marginBottom: "10px" }}>
            <button
              className="black"
              style={{ width: "100%" }}
              onClick={() => onSelectChat({ id: u.user_id, name: u.name })}
            >
              {u.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatList;
