import Items from "./panels/items/Items"
import Links from "./panels/links/Links"
import Pricing from "./panels/pricing/Pricing"
import Receivables from "./panels/receivables/Receivables"
import Requests from "./panels/requests/Requests"
import UniversalScanner from "./panels/scanner/UniversalScanner"
import Welcome from "./panels/welcome/Welcome"

const PanelsView = async () => {

    return (
        <div className="grid grid-cols-3 gap-8">
            <UniversalScanner />
            <Requests />
            <Pricing />
            <Welcome />
            <Receivables />
            <Items />
            <Links />

        </div>
    )
}

export default PanelsView
