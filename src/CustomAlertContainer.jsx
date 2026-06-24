import React, { useEffect, useState } from "react";

let externalShowAlert = null;

const CustomAlertContainer = () => {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    externalShowAlert = (msg) => {
      setMessage(msg);
      setVisible(true);
      setTimeout(() => setVisible(false), 3000);
    };

    // Substituir alert() padrão
    window.alert = externalShowAlert;
  }, []);

  if (!visible) return null;

  return (
    <div className="custom-alert">
      <span>{message}</span>
      <button onClick={() => setVisible(false)}>×</button>
    </div>
  );
};

export default CustomAlertContainer;
