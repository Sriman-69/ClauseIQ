import React from 'react';
import DocumentUpload from './components/DocumentUpload';
import Chat from './components/Chat';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>ClauseIQ</h1>
      </header>
      <main>
        <DocumentUpload />
        <Chat />
      </main>
    </div>
  );
}

export default App;
