"use client"
import React from 'react';
import { useRouter } from 'next/navigation';

interface NavigationButtonProps {
  label: string;
  icon?: JSX.Element;
  path: string;
}

const NavigationButton: React.FC<NavigationButtonProps> = ({ label, icon, path }) => {
  const router = useRouter();

  const handleClick = () => {
    if (path) {
      router.push(path);
    }
  };

  return (
    <button
      className="flex items-center space-x-2 p-2 rounded-md bg-blue-500 text-white"
      onClick={handleClick}
    >
      {icon && <span className="text-xl">{icon}</span>}
      <span>{label}</span>
    </button>
  );
};

export default NavigationButton;


