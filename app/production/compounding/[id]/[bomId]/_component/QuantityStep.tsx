import React, { Dispatch, useState } from 'react'
import { TbBackspace } from 'react-icons/tb';
import { useWizard } from 'react-use-wizard';

// todo clean this up...

const QuantityStep = ({handleQuantity} : { handleQuantity: Dispatch<React.SetStateAction<number | null>>}) => {

  const [input, setInput] = useState("");
  const [isDemicalPresent, setIsDecimalPresent] = useState(false)
  const { nextStep} = useWizard()


  const buttonClass = 'flex items-center hover:cursor-pointer  justify-center bg-blue-100 rounded-lg p-4 font-semibold text-2xl'

  const handleNumButton = (num: number) => {
    setInput((prev) => prev + num)
  }

  const handleDecimalButton = () => {
    if (isDemicalPresent) return;

    setIsDecimalPresent(true);
    setInput((prev) => prev + '.')

  }

  const handleDeleteButton = () => {

    const deletedInput = input.slice(-1);

    if (deletedInput === '.') {
      setIsDecimalPresent(false);
    }

    setInput(prev => prev.slice(0, -1))

  }

  const handleSubmit = () => { 
      handleQuantity(parseFloat(input))
      nextStep()  
  }

  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]


  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 '>
      <span className='flex justify-between col-span-1 sm:col-span-2 lg:col-span-3 p-4 bg-gray-100 rounded-lg'>
        <div className='flex   font-semibold text-2xl font-poppins '>{input}</div>
        <span onClick={() => handleDeleteButton()} className='text-3xl'><TbBackspace /></span>
      </span>

      {numbers.map(num => <NumberButton key={num} num={num} handleClick={handleNumButton} />)}

      <div onClick={() => handleDecimalButton()} className={buttonClass} >.</div>

      <div onClick={() => handleSubmit()} className='flex items-center hover:cursor-pointer  justify-center bg-emerald-100 rounded-lg p-4 font-semibold text-2xl'>Submit</div>

    </div>
  )
}

const NumberButton = ({ num, handleClick }: { num: number, handleClick: (num: number) => void }) => {
  const [effect, setEffect] = useState(false);


  const buttonClass = `${effect && 'animate-wiggle'} flex items-center hover:cursor-pointer  justify-center bg-blue-100 rounded-lg p-4 font-semibold text-2xl`
  return <div className={buttonClass} onClick={() => { handleClick(num); setEffect(true) }} onAnimationEnd={() => setEffect(false)}>{num}</div>
}

export default QuantityStep
