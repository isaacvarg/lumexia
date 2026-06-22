"use client"
import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TbArrowLeft, TbSlash } from "react-icons/tb";

const PageBreadcrumbs = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams()
  const router = useRouter();
  const id = searchParams.get('id')
  const segments = pathname.split("/").filter((segment) => segment !== "");
  console.log(segments)

  return (
    <div className="flex flex-row space-x-2 text-base-content items-center mb-4">

      <button className="btn btn-ghost px-5" onClick={() => router.back()}>
        <TbArrowLeft className="text-3xl hover:text-cararra-800" />
      </button>

      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;
        return (
          <React.Fragment key={index}>
            <span><TbSlash className="text-2xl" /></span>
            {isLast ? (
              <span className="font-poppins items-center text-xl font-medium text-cararra-600">
                {decodeURIComponent(segment).replace(/\s+/g, "-")}
              </span>
            ) : (
              <a
                href={`/${segments.slice(0, index + 1).join("/")}`}
                className="font-poppins items-center text-xl font-medium hover:text-cararra-800"
              >
                {segment}
              </a>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default PageBreadcrumbs;

