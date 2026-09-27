import React from 'react';

const ButtonComponent = ({ text, onClick, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`bg-[#304b62] hover:bg-[#253b4e] text-white font-medium py-2 px-4 rounded-md transition-colors shadow-sm ${className}`}
    >
      {text}
    </button>
  );
};

export default ButtonComponent;