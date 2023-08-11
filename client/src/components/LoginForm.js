import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

function LoginForm() {
  const { loginWithRedirect } = useAuth0() ;

  const handleLogin = () => {
    // Initiate the OAuth login flow provided by Auth0
    loginWithRedirect();
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Login</h2>
      <p>Welcome! Please log in to access the site.</p>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        onClick={handleLogin}
      >
        Log In with Auth0
      </button>
    </div>
  );
}

export default LoginForm;
