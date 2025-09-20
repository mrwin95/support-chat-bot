import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';

interface BackendResponse {
    message: string;
}

function App() {

    const [message, setMessage] = useState<string>('');

    useEffect(() => {
        fetch('/api/message')
        .then((res) => res.json())
        .then((data: BackendResponse) => setMessage(data.message))
        .catch((err) => setMessage('Backend not reachable'));
    });
  return (
    <div style={{fontFamily: "Arial", margin: "40px"}}>
        <h1>React + Typescript + EKS Demo</h1>
        <p>Backend says: {message}</p>
    </div>
  );
}

export default App;
