import { GuideTypo } from "../../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        <span className="font-semibold">Company Settings → Info</span> holds the
        company&apos;s identity, address, and purchasing contact — system-admin
        only, enforced on the server.
      </GuideTypo.Lead>

      <GuideTypo.Section>Fields</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Company">
          Company Name, Phone, Email.
        </GuideTypo.Item>
        <GuideTypo.Item term="Address">
          Street 1, Street 2, City, State, Zipcode.
        </GuideTypo.Item>
        <GuideTypo.Item term="Purchasing Contact">
          First Name, Last Name, Email.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Non-admins visiting <span className="font-mono">/settings/company</span>{" "}
        directly are redirected to <span className="font-mono">/settings</span> —
        this isn&apos;t just a hidden landing card.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
