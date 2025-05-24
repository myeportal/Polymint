"use client";

import Image from "next/image";
import Navbar from "./components/navbar";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAccount } from "wagmi";
import { useSelectedNetwork } from "./context/selectedNetwork";
import { useEffect, useState } from "react";
import http from "./utils/baseUrl"; // adjust path if needed
import Footer from "./components/footer"

export default function Home() {
  const { isEthereum } = useSelectedNetwork();
  const { address } = useAccount(); // Ethereum
  const { publicKey } = useWallet(); // Solana
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);

  const connectedAddress = isEthereum ? address : publicKey?.toBase58();

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!connectedAddress) return;
      setLoading(true);

      try {
        const route = isEthereum ? "/evm_nfts" : "/sol_nfts";
        const response = await http.get(route, {
          params: { wallet_address: connectedAddress },
        });
        setNfts(response.data.nfts || []);
      } catch (error) {
        console.error("Error fetching NFTs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [connectedAddress, isEthereum]);
  return (
    <div className="flex flex-col h-screen">
      <div className="w-[80%] mx-auto">
        <Navbar />
        <h1 className="text-3xl font-bold mb-4">Discover NFTs</h1>
        <p className="text-gray-600 mb-6">Explore articles, music, and videos minted as NFTs.</p>

        {loading && <p className="text-gray-500">Loading NFTs...</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nfts.map((nft, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow">
              <div className="h-40 bg-gray-200 rounded mb-4 overflow-hidden flex items-center justify-center">
                {nft.image_uri ? (
                  <Image
                    src={nft.image_uri}
                    alt={nft.title || "NFT"}
                    width={400}
                    height={160}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-sm">No Preview Available</span>
                )}
              </div>
              <h2 className="text-xl font-semibold mb-1">{nft.title || "Untitled NFT"}</h2>
              {nft.content_type === "music" && <audio controls={true} src={nft.music_uri}></audio>}
              {nft.content_type === "video" && <video controls={true} src={nft.music_uri}></video>}
              <p className="text-gray-500 text-sm capitalize mb-1">{nft.content_type} NFT</p>
              <p className="text-gray-500 text-sm capitalize mb-1">{nft.category}</p>
              <p className="text-gray-400 text-xs mt-1">{nft.description || "No description"}</p>
            </div>
          ))}
        </div>

        {!loading && nfts.length === 0 && (
          <p className="text-gray-400 mt-6 text-center">No NFTs found for your wallet.</p>
        )}

      </div>
      <Footer />
    </div>

  );
}
