import { useEffect } from "react";
import { useTelegram } from "./hooks/useTelegram";
import Header from "./components/Header/Header";
import Button from "./components/Button/Button"

import './App.css';

function App() {
  const { tg, onToggleButton, onToggleBackButton, onToggleSettingsButton } = useTelegram();

  useEffect(() => {
    const initializeApp = async () => {
      await tg.ready();
      onToggleButton();
    };

    initializeApp();
  }, [tg, onToggleButton]);

  return (
    <div className="App">
      <Header />
      <Button onClick={onToggleBackButton}>BackButton</Button>
      <Button onClick={onToggleSettingsButton}>SettingsButton</Button>
    </div>
  );
}

export default App;
