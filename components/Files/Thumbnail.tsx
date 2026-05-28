import Image from "next/image";
import { TbFile, TbFileTypePdf } from "react-icons/tb";

type Size = "sm" | "md";

type Props = {
  url: string;
  thumbnailUrl?: string | undefined;
  mimeType: string;
  name: string;
  size?: Size;
};

const sizeClasses: Record<Size, { wrapper: string; w: number; h: number }> = {
  sm: { wrapper: "h-16 w-16", w: 64, h: 64 },
  md: { wrapper: "h-24 w-24", w: 96, h: 96 },
};

const FileThumbnail = ({ url, thumbnailUrl, mimeType, name, size = "md" }: Props) => {
  const isImage = mimeType.startsWith("image/");
  const isPdf = mimeType === "application/pdf";
  const sz = sizeClasses[size];

  const renderImg = (src: string) => (
    <Image
      src={src}
      alt={name}
      width={sz.w}
      height={sz.h}
      unoptimized
      className={`${sz.wrapper} object-cover rounded-lg border border-base-300 hover:opacity-80 transition-opacity`}
    />
  );

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block shrink-0"
      title={name}
    >
      {isImage ? (
        renderImg(thumbnailUrl ?? url)
      ) : isPdf && thumbnailUrl ? (
        renderImg(thumbnailUrl)
      ) : isPdf ? (
        <div
          className={`${sz.wrapper} flex flex-col items-center justify-center gap-1 rounded-lg border border-base-300 bg-base-200 hover:opacity-80 transition-opacity`}
        >
          <TbFileTypePdf className="text-2xl text-error" />
          <span className="text-xs text-base-content/60 font-poppins truncate max-w-full px-1">
            PDF
          </span>
        </div>
      ) : (
        <div
          className={`${sz.wrapper} flex flex-col items-center justify-center gap-1 rounded-lg border border-base-300 bg-base-200 hover:opacity-80 transition-opacity`}
        >
          <TbFile className="text-2xl text-base-content/60" />
        </div>
      )}
    </a>
  );
};

export default FileThumbnail;
