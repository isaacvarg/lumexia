import type { Metadata } from "next";
import { Inter, Poppins, Roboto } from "next/font/google";
import "./globals.css";
import Providers from "@/context/Providers";
import { auth } from "@/auth";
import Toast from "@/components/Toast";
import CommandPallet from "@/components/CommandPallet/CommandPallet";
import Sidebar from "./_components/sidebar/Sidebar";
import { getUserConfig } from "@/actions/users/getUserConfig";
import { AuthProvider } from "./_components/state/AuthProvider";
import QueryProvider from "./_components/state/QueryProvider";
import TopBar from "./_components/topbar/TopBar";

// fonts
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const roboto = Roboto({
  variable: "--font-roboto",
  weight: ["100", "300", "400", "500", "700", "900"],
  subsets: ["latin"],
});
const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Lumexia",
  description: "",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const theme = await getUserConfig('theme');

  return (
    <html lang="en" data-theme={theme?.value || 'latte'}>
      <body className={`${inter.variable} ${poppins.variable} ${roboto.variable}`}>
        <Providers>
          <AuthProvider session={session}>
            <QueryProvider>
              <div className="flex flex-row h-full">
                <Sidebar />

                <div className="flex flex-col w-full bg-base-200 px-28 pt-2 pb-8 gap-y-8">
                  <TopBar />
                  <CommandPallet />
                  {children}
                </div>
                <Toast.Toast />
              </div>
            </QueryProvider>
          </AuthProvider>
        </Providers>

      </body>
    </html>
  );
}
