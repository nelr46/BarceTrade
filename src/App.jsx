import React, { useState, useEffect } from 'react';
import Login from './Login';
import Register from './Register';
import RecoverPassword from './RecoverPassword';
import Header from './Header';
import Home from './Home';
import PropostaForm from './PropostaForm';
import EditarProposta from './EditarProposta';
import EventoPainel from './EventoPainel';
import EventoDenuncia from './EventoDenuncia';
import EditarItem from './EditarItem';
import AdicionarItem from './AdicionarItem';
import AvaliacaoForm from './AvaliacaoForm';
import DenunciaDetalhada from './DenunciaDetalhada';
import EditarEvento from './EditarEvento';
import AdminPainel from './AdminPainel';
import './styles.css';
import api from './api';
import MenuTrocas from './MenuTrocas';
import AdicionarEvento from './AdicionarEvento';
import PropostasPorItem from './PropostasPorItem';
import ModeradorPainel from './ModeradorPainel';
import ChatList from "./chatlist";
import ChatWindow from "./chatwindow";
import { jwtDecode } from 'jwt-decode';
import CustomAlertContainer from "./CustomAlertContainer";

const isTokenValid = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

const App = () => {
  const [view, setView] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedEvento, setSelectedEvento] = useState(null);
  const [selectedAnuncio, setSelectedAnuncio] = useState(null);
  const [propostaInicial, setPropostaInicial] = useState(null);
  const [propostasRecebidas, setPropostasRecebidas] = useState([]);
  const [propostasEnviadas, setPropostasEnviadas] = useState([]);
  const [notificacoes, setNotificacoes] = useState([]);
  const [avaliarProposta, setAvaliarProposta] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);

  const fetchNotificacoes = async () => {
    try {
      if (user?.nome) {
        const res = await api.get(`/notification/${user.nome.toLowerCase()}`);
        setNotificacoes(res.data || []);
      }
    } catch (err) {
      console.error("Erro ao buscar notificacoes", err);
    }
  };

  const fetchPropostas = async () => {
    if (isAuthenticated && user) {
      try {
        const res = await api.get('/proposta');
        const propostas = res.data || [];

        setPropostasRecebidas(
          propostas.filter(p =>
            p.destinatario?.toLowerCase().trim() === user.nome.toLowerCase().trim() &&
            p.status === 'pendente'
          )
        );

        setPropostasEnviadas(
          propostas.filter(p =>
            p.remetente?.toLowerCase().trim() === user.nome.toLowerCase().trim()
          )
        );
      } catch (err) {
        console.error('Erro ao carregar propostas', err);
      }
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && isTokenValid()) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setIsAuthenticated(true);
      setView("home");
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      setView("login");
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotificacoes();
      fetchPropostas();
    }
  }, [isAuthenticated, user]);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
    setView('home');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setView('login');
  };

  const handleEditarEvento = (evento) => {
    setSelectedEvento(evento);
    setView('editarEvento');
  };

  const handleDenunciarAnuncio = (anuncio) => {
    setSelectedAnuncio(anuncio);
    setView('denunciaDetalhada');
  };

  const handleRealizarTroca = (anuncio) => {
    setPropostaInicial({
      destinatario: anuncio?.dono || 'Desconhecido',
      itemProposto: anuncio?.titulo || 'Item desconhecido',
    });
    setView('trocas');
  };

  const handleEnviarProposta = async (novaProposta) => {
    try {
      const formData = new FormData();
      formData.append("description", `${novaProposta.itemParaTroca} ↔ ${novaProposta.itemProposto}`);
      formData.append("remetente", user?.nome || 'Utilizador');
      formData.append("destinatario", novaProposta.destinatario);
      formData.append("itemParaTroca", novaProposta.itemParaTroca);
      formData.append("itemProposto", novaProposta.itemProposto);
      formData.append("status", "pendente");

      if (novaProposta.foto) {
        formData.append("foto", novaProposta.foto);
      }

      await api.post('/proposta', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      await fetchPropostas();
      setView('centralTrocas');
    } catch (err) {
      console.error("Erro ao enviar proposta:", err);
      alert("Erro ao enviar proposta.");
    }
  };

  const handleCancelarProposta = async (id) => {
    try {
      await api.delete(`/proposta/${id}`);
      await fetchPropostas();
    } catch (err) {
      console.error("Erro ao cancelar proposta:", err);
      alert("Erro ao cancelar proposta.");
    }
  };

  const handleResponderProposta = (proposta) => {
    setPropostaInicial({
      destinatario: proposta.remetente,
      itemProposto: proposta.itemParaTroca,
    });
    setView('formContraProposta');
  };

  const handleAceitarProposta = (proposta) => {
    setPropostasRecebidas(prev => prev.filter(p => p.participation_id !== proposta.participation_id));
    setAvaliarProposta(proposta);
    setView('avaliacao');
  };

  const handleRecusarProposta = (proposta) => {
    setPropostasRecebidas(prev => prev.filter(p => p.participation_id !== proposta.participation_id));
    setAvaliarProposta(proposta);
    setView('avaliacao');
  };

  const handleAnuncioRemovido = (titulo) => {
    console.log(`Anúncio '${titulo}' removido da página principal.`);
  };

  const renderView = () => {
    if (!isAuthenticated) {
      return {
        login: <Login onSwitch={setView} onLoginSuccess={handleLoginSuccess} />,
        register: <Register onSwitch={setView} onRegisterSuccess={handleLoginSuccess} />,
        recover: <RecoverPassword onSwitch={setView} />,
      }[view];
    }

    if (view === "chat") {
      return selectedChat ? (
        <ChatWindow
          user={user}
          contact={selectedChat}
          onBack={() => setSelectedChat(null)}
        />
      ) : (
        <ChatList
          user={user}
          onSelectChat={(contact) => setSelectedChat(contact)}
        />
      );
    }

    return {
      home: (
        <Home
          user={user}
          onDenunciar={handleDenunciarAnuncio}
          onTrocar={handleRealizarTroca}
          onAdd={(view, data) => {
            setView(view);
            if (view === "chat" && data) {
              setSelectedChat(data);
            }
          }}
        />
      ),
      trocas: propostaInicial ? (
        <PropostaForm
          user={user}
          propostaInicial={propostaInicial}
          onSend={handleEnviarProposta}
          onCancel={() => setView('home')}
        />
      ) : <p>Carregando dados da proposta...</p>,
      admin: <AdminPainel feedbacks={[]} denuncias={[]} />,
      formContraProposta: propostaInicial ? (
        <PropostaForm
          user={user}
          propostaInicial={propostaInicial}
          onSend={handleEnviarProposta}
          onCancel={() => setView('centralTrocas')}
        />
      ) : <p>Carregando contra-proposta...</p>,
      centralTrocas: (
        <MenuTrocas
          onAdicionar={() => setView('adicionarItem')}
          onVer={() => setView('propostasPorItem')}
        />
      ),
      adicionarItem: <AdicionarItem user={user} onItemAdicionado={() => setView('home')} />,
      editarProposta: <EditarProposta />,
      propostasPorItem: (
        <PropostasPorItem
          user={user}
          propostasRecebidas={propostasRecebidas}
          propostasEnviadas={propostasEnviadas}
          onCancelarProposta={handleCancelarProposta}
          fetchPropostas={fetchPropostas}
          onResponder={handleResponderProposta}
          onAnuncioRemovido={handleAnuncioRemovido}
          onAceitar={handleAceitarProposta}
          onRecusar={handleRecusarProposta}
        />
      ),
      eventos: (
        <EventoPainel
          user={user}
          onEdit={handleEditarEvento}
          onAdd={setView}
        />
      ),
      adicionarEvento: <AdicionarEvento user={user} onEventoAdicionado={() => setView('eventos')} />,
      editarEvento: <EditarEvento evento={selectedEvento} onBack={() => setView('eventos')} />,
      eventoDenuncia: <EventoDenuncia />,
      editarItem: <EditarItem />,
      avaliacao: <AvaliacaoForm proposta={avaliarProposta} user={user} onCancel={() => setView('home')} onSubmit={() => setView('home')} />,
      denunciaDetalhada: <DenunciaDetalhada anuncio={selectedAnuncio} />,
      mod: user?.moderator
        ? <ModeradorPainel user={user} />
        : <p style={{ padding: '20px', textAlign: 'center' }}>❌ Acesso negado. Apenas moderadores.</p>
    }[view] || <Home />;
  };

  return (
    <>
      <CustomAlertContainer />
      {isAuthenticated && (
        <Header
          user={user}
          onLogout={handleLogout}
          onNavigate={setView}
          activePage={view}
          notificacoes={notificacoes}
          fetchNotificacoes={fetchNotificacoes}
        />
      )}
      {renderView()}
    </>
  );
};

export default App;
