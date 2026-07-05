'use client'
import React, { useState } from 'react';
import { TbBackspace } from 'react-icons/tb';

const NumberButton = ({ num, handleClick }: { num: number, handleClick: (num: number) => void }) => {
  const [effect, setEffect] = useState(false);

  const buttonClass = `${effect && 'animate-wiggle'} flex items-center hover:cursor-pointer justify-center bg-base-300/50 rounded-lg p-4 font-semibold text-2xl`;

  const onClick = () => {
    handleClick(num);
    setEffect(true);
  };

  return (
    <div className={buttonClass} onClick={onClick} onAnimationEnd={() => setEffect(false)}>
      {num}
    </div>
  );
};

const QuantityStep = ({ currentStep, onQuantitySubmit }: { currentStep: number, onQuantitySubmit: (quantity: number) => void }) => {
  const [inputValue, setInputValue] = useState("");
  const [isDecimalPresent, setIsDecimalPresent] = useState(false);

  if (currentStep !== 1) return null;

  const buttonClass = 'flex items-center hover:cursor-pointer justify-center bg-base-300/50 rounded-lg p-4 font-semibold text-2xl';
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

  const handleNumButton = (num: number) => {
    setInputValue((prev) => prev + num);
  };

  const handleDecimalButton = () => {
    if (isDecimalPresent) return;
    setIsDecimalPresent(true);
    setInputValue((prev) => prev + '.');
  };

  const handleDeleteButton = () => {
    if (inputValue.slice(-1) === '.') {
      setIsDecimalPresent(false);
    }
    setInputValue(prev => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    const quantity = parseFloat(inputValue);
    if (!isNaN(quantity) && quantity > 0) {
      onQuantitySubmit(quantity);
    }
  };

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2'>
      <div className='flex justify-between col-span-1 sm:col-span-2 lg:col-span-3 p-4 bg-base-300/50 rounded-lg'>
        <div className='flex font-semibold text-2xl font-poppins'>{inputValue || '0'}</div>
        <button onClick={handleDeleteButton} className='text-3xl'>
          <TbBackspace />
        </button>
      </div>

      {numbers.map(num => (
        <NumberButton key={num} num={num} handleClick={handleNumButton} />
      ))}

      <button onClick={handleDecimalButton} className={buttonClass}>.</button>

      <button onClick={handleSubmit} className='flex items-center hover:cursor-pointer justify-center bg-success/50 rounded-lg p-4 font-semibold text-2xl'>
        Submit
      </button>
    </div>
  );
};

export default QuantityStep;
