"use server"

import { signFileToken } from "@/lib/fileUrlSigning";

// Validity window for a file link, in seconds. Kept at 1 hour to match the
// previous presigned-URL behaviour.
const URL_TTL_SECONDS = 3600;

// Returns a same-origin, time-limited URL for an object in the store. The bytes
// are served by the proxy route at app/api/files/route.ts (which streams from
// RustFS server-side), so the browser never needs to reach the object store
// directly — this is what makes files work behind the Cloudflare tunnel.
export const getFileUrl = async (bucketName: string, objectName: string) => {
    const exp = Math.floor(Date.now() / 1000) + URL_TTL_SECONDS;
    const sig = signFileToken(bucketName, objectName, exp);

    const params = new URLSearchParams({
        b: bucketName,
        k: objectName,
        e: String(exp),
        s: sig,
    });

    return `/api/files?${params.toString()}`;
}
