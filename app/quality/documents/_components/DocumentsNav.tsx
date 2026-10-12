import Link from "next/link"
import { TbFileCertificate, TbInbox } from "react-icons/tb"

// Switches between the compliance dashboard and the document inbox.
const DocumentsNav = ({ active, inboxCount }: { active: "compliance" | "inbox"; inboxCount: number }) => (
  <nav className="join" aria-label="Documents">
    <Link
      href="/quality/documents"
      aria-current={active === "compliance" ? "page" : undefined}
      className={`btn btn-sm join-item ${active === "compliance" ? "btn-primary" : "btn-ghost border-base-300"}`}
    >
      <TbFileCertificate className="size-4" /> Compliance
    </Link>
    <Link
      href="/quality/documents/inbox"
      aria-current={active === "inbox" ? "page" : undefined}
      className={`btn btn-sm join-item ${active === "inbox" ? "btn-primary" : "btn-ghost border-base-300"}`}
    >
      <TbInbox className="size-4" /> Inbox
      {inboxCount > 0 && <span className="badge badge-sm badge-warning">{inboxCount}</span>}
    </Link>
  </nav>
)

export default DocumentsNav
