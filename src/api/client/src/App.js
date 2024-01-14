import { useEffect } from "react";
import { useTelegram } from "./hooks/useTelegram";
import Header from "./components/Header/Header";
import Button from "./components/Button/Button"

import './App.css';

function App() {
  const { tg,onToggleButton ,onToggleBackButton,onToggleSettingsButton,onTogglePopupButton} = useTelegram();
  useEffect(() => {
    tg.ready();
    onToggleButton();
  }, [tg,onToggleButton]);
 

  return (
    <div className="App">
      <Header />
      <Button onClick={onToggleButton}>MainButton</Button>
      <Button onClick={onToggleBackButton}>BackButton</Button>
      <Button onClick={onToggleSettingsButton}>SettingsButton</Button>
      <Button onClick={onTogglePopupButton}>PopupButton</Button>


    </div>
  );
}

export default App;
