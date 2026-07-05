
import { PiFilePdfBold } from "react-icons/pi";
import { LuTextCursorInput } from "react-icons/lu";
import { Dispatch, SetStateAction } from "react";

const styles = "flex flex-col gap-y-4 p-8 items-center justify-center rounded-xl hover:cursor-pointer"

const ModeSelector = ({ setMode }: { setMode: Dispatch<SetStateAction<'manual' | 'ai' | null>> }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div onClick={() => setMode('manual')} className={`${styles} bg-lilac-100 hover:bg-lilac-200`}>
                <span className="text-4xl"><LuTextCursorInput /></span>
                <h1 className="font-poppins text-3xl font-semibold">
                    Manual Entry
                </h1>
            </div>

            <div onClick={() => setMode('ai')} className={`${styles} bg-blue-100 hover:bg-blue-200`}>
                <span className="text-4xl"><PiFilePdfBold /></span>
                <h1 className="font-poppins text-3xl font-semibold">
                    Recognize From PDF
                </h1>

            </div >


        </div >
    )
}

export default ModeSelector
