// src/MenuTrocas.jsx
import React from 'react';
import { PlusCircle, Eye } from 'lucide-react'; 

const MenuTrocas = ({ onAdicionar, onVer }) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      gap: '100px',
      alignItems: 'center',
      height: '70vh',
      flexWrap: 'wrap'
    }}>
      {/* Botão Adicionar Item */}
      <div
        onClick={onAdicionar}
        style={{
          textAlign: 'center',
          cursor: 'pointer'
        }}
      >
        <PlusCircle size={80} strokeWidth={2} />
        <p style={{ marginTop: '10px', fontSize: '18px' }}>Adicionar Item</p>
      </div>

      {/* Botão Ver Anúncios (agora redireciona para propostasPorItem via App.jsx) */}
      <div
        onClick={onVer}
        style={{
          textAlign: 'center',
          cursor: 'pointer'
        }}
      >
        <Eye size={80} strokeWidth={2} />
        <p style={{ marginTop: '10px', fontSize: '18px' }}>Ver Anúncios</p>
      </div>
    </div>
  );
};

export default MenuTrocas;
