const Steps = ({ children }: { children: React.ReactNode }) => {
    return (
        <ul className="steps steps-vertical md:steps-horizontal w-full ">
            {children}
        </ul>
    )
}

export default Steps
