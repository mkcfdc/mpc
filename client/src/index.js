import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import Auth0ProviderWithHistory from './auth/auth0';
import './App.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root')
);

root.render(
  <Router>
    <Auth0ProviderWithHistory>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </Auth0ProviderWithHistory>
  </Router>
);

reportWebVitals();
