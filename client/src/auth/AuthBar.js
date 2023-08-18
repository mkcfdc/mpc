import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const AuthBar = () => {
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();

  return (
    <div className="bg-gray-100 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          {isAuthenticated ? (
            <div className="flex items-center">
              <img
                src={user.picture}
                alt="User"
                className="w-8 h-8 rounded-full mr-2"
              />
              <button
                className="text-black hover:text-gray-300"
                onClick={() => logout({ returnTo: window.location.origin })}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              className="text-black hover:text-gray-300"
              onClick={loginWithRedirect}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthBar;
