import React from "react";
import "./App.css";
import { MIDI } from "./lib/midi";

const midi = new MIDI();

function App() {
  // useEffect(() => {
  //   midi.listen();
  // });

  return (
    <div className="App">
      <header className="App-header"></header>
    </div>
  );
}

export default App;
