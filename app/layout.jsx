import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { EVMWalletProvider } from "./context/EvmWallet";
import { SolWalletProvider } from "./context/SolWallet";
import { SelectedNetworkProvider } from "./context/selectedNetwork"
import { Toaster } from 'react-hot-toast';
import hand from "./assets/hand.png"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Rise Up with Polymint.me",
  description: "Rise Up with Polymint.me",
  icons: {
    icon: [
      { url: '/hand.png', type: 'image/png' },
      { url: '/hand.png', sizes: '32x32', type: 'image/png' },
      { url: '/hand.png', sizes: '16x16', type: 'image/png' }
    ],
    shortcut: '/hand.png',
    apple: '/hand.png'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/hand.png" />
        <link rel="shortcut icon" type="image/png" href="/hand.png" />
        <link rel="apple-touch-icon" href="/hand.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SolWalletProvider>
          <EVMWalletProvider>
            <SelectedNetworkProvider>
              <Toaster position="top-center" />
              {children}
            </SelectedNetworkProvider>
          </EVMWalletProvider>
        </SolWalletProvider>
      </body>
    </html>
  );
}
