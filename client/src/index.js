import React from 'react';
import ReactDOM from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import { BrowserRouter as Router } from 'react-router-dom';
import './App.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root')
);

const domain = process.env.REACT_APP_AUTH0_DOMAIN;
const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;

root.render(
  <Router>
      <React.StrictMode>
        <Auth0Provider
        domain={domain}
        clientId={clientId}
        redirectUri={window.location.origin}>
        <App />
        </Auth0Provider>
      </React.StrictMode>
  </Router>
);

reportWebVitals();
