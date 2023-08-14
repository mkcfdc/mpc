import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import './App.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root')
);

root.render(
  <Router>
      <React.StrictMode>
        <App />
      </React.StrictMode>
  </Router>
);

reportWebVitals();
