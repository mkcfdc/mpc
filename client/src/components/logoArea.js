import React from 'react';
import { FaFilm } from 'react-icons/fa'; // Import the Film icon from react-icons/fa

function LogoArea() {
  return (
    <div className="bg-white bg-opacity-0 p-4 flex items-center justify-center">
      <span className="text-black text-2xl font-semibold flex items-center">
        <FaFilm className="bg-opacity-0 mr-2" />
          Movie Poop Chute
      </span>
    </div>
  );
}

export default LogoArea;
