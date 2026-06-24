import React from 'react';

// Fallback para imagem ausente
const DEFAULT_IMAGE = 'https://via.placeholder.com/250x150?text=Sem+Imagem';

const AnuncioCard = ({ titulo = 'Sem título', estado = 'Indefinido', imagem, tipo = 'Desconhecido', data }) => {
  const dataFormatada = data
    ? new Date(data).toLocaleDateString('pt-PT')
    : 'Data não disponível';

  return (
    <div className="anuncio-card">
      <img
        src={imagem || DEFAULT_IMAGE}
        alt={`Imagem de ${titulo}`}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = DEFAULT_IMAGE;
        }}
      />
      <h3>{titulo}</h3>
      <p><strong>Estado:</strong> {estado}</p>
      <p><strong>Localidade:</strong> {tipo}</p>
      <p><strong>Data:</strong> {dataFormatada}</p>
    </div>
  );
};

export default AnuncioCard;
