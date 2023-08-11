// src/components/ProtectedRoute.js
import React from 'react';
import { Route } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const { isAuthenticated } = useAuth0();

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated ? <Component {...props} /> : <div>Not authorized</div>
      }
    />
  );
};

export default ProtectedRoute;
