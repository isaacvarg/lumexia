import { useRouter } from "next/navigation"
import { RequestLink } from "../../_actions/getAllRequestLinks"
import { Dispatch, SetStateAction } from "react";
import { TbPlus } from "react-icons/tb";

const CreateViewMode = ({ links, setMode }: { links: RequestLink[], setMode: Dispatch<SetStateAction<'view' | 'add'>> }) => {

    const router = useRouter();
    const handleClick = (request: RequestLink['purchasingRequest']) => {
        router.push(`/purchasing/requests/${request.referenceCode}?id=${request.id}`)
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
                onClick={() => setMode('add')}
                className="flex gap-x-2 items-center justify-center min-h-40 w-full bg-lilac-100 rounded-xl hover:cursor-pointer hover:bg-lilac-200">
                <span className="text-3xl"><TbPlus /></span>
                <p className="font-poppins text-xl font-semibold">
                    Items & Requests
                </p>
            </div>

            {links.map(link => {
                return (
                    <div key={link.id}
                        className="flex flex-col gap-4 bg-lilac-100 rounded-xl hover:cursor-pointer hover:bg-lilac-200 p-6"
                        onClick={() => handleClick(link.purchasingRequest)}
                    >

                        <div className="flex gap-x-2 items-center">
                            <h1 className="font-poppins text-xl font-semibold">
                                {link.purchasingRequest.item.name}
                            </h1>

                            <h2 className="font-poppins text-sm font-medium uppercase">({link.purchasingRequest.item.referenceCode})</h2>
                        </div>


                        <h2 className="font-poppins text-xl font-medium uppercase">REQ #{link.purchasingRequest.referenceCode}</h2>
                        <h2 className="font-poppins text-xl font-medium ">{link.purchasingRequest.title}</h2>
                    </div>
                )
            })}
        </div>
    )

}

export default CreateViewMode
