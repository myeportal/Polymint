"use client";
import Head from "next/head";
import { useState, useRef, useEffect } from "react";
import Navbar from "../../components/navbar";
import axios from "axios";
import polymintabi from "../../contracts/polymintabi.json";
import { useSelectedNetwork } from "../../context/selectedNetwork";
import http from "../../utils/baseUrl";
import toast from "react-hot-toast";

// ETH imports
import { useAccount, useWriteContract } from "wagmi";

import { polygon } from "wagmi/chains";
import { parseEther } from "viem";

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createV1,
  TokenStandard,
} from "@metaplex-foundation/mpl-token-metadata";
import { clusterApiUrl } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import {
  generateSigner,
  percentAmount,
  sol,
  transactionBuilder,
} from "@metaplex-foundation/umi";
import { base58 } from "@metaplex-foundation/umi/serializers";
import {
  setComputeUnitPrice,
  transferSol,
} from "@metaplex-foundation/mpl-toolbox";

const pinata_jwt = process.env.NEXT_PUBLIC_PINATA_JWT;
const pinataBaseUrl = process.env.NEXT_PUBLIC_PINATA_BASE_URL;
const sol_receiver = process.env.NEXT_PUBLIC_SOL_RECEIVER_ADDRESS;
const ethContractAddress = process.env.NEXT_PUBLIC_ETH_CONTRACT_ADDRESS;
const solanaApi = process.env.NEXT_PUBLIC_SOLANA_API
const mintFees= process.env.NEXT_PUBLIC_MINT_FEES


export default function MintMusic() {
  const { isEthereum } = useSelectedNetwork();
  const { address } = useAccount(); //eth
  const wallet = useWallet(); // sol

  const { writeContractAsync } = useWriteContract();
  const inputImageFile = useRef(null);
  const inputMusicFile = useRef(null);

  const [uploadedImageFile, setUploadedImageFile] = useState(null);
  const [uploadedMusicFile, setUploadedMusicFile] = useState(null);

  const [titleText, setTitleText] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [isNftMintInProcess, setIsNftMintInProcess] = useState(false);
  const [isMintable, setIsMintable] = useState(false);

  // State for progress and modals
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showMintingModal, setShowMintingModal] = useState(false);
  const [mintingSuccess, setMintingSuccess] = useState(false);

  useEffect(() => {
    setMintingSuccess(false);
    if (isEthereum) {
      if (address) {
        setIsMintable(true);
      } else {
        setIsMintable(false);
      }
    } else {
      if (wallet.publicKey) {
        setIsMintable(true);
      } else {
        setIsMintable(false);
      }
    }
  }, [isEthereum, address, wallet?.publicKey]);

  const handleUploadAndMint = async () => {
    setMintingSuccess(false);
    setIsNftMintInProcess(false);
    if (!uploadedImageFile) {
      toast.error("Please select an image file.");
      return;
    }
    if (!uploadedMusicFile) {
      toast.error("Please select an music file.");
      return;
    }

    if (!categoryName) {
      toast.error("Please select category");
      return;
    }
    if (!titleText) {
      toast.error("Please select music title");
      return;
    }

    const imageFormData = new FormData();
    const musicFormData = new FormData();

    imageFormData.append("file", uploadedImageFile);
    musicFormData.append("file", uploadedMusicFile);

    try {
      setShowUploadModal(true); // Show modal for music upload

      const uploadImage = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        imageFormData,
        {
          headers: { Authorization: `Bearer ${pinata_jwt}` },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round(
                (progressEvent.loaded / progressEvent.total) * 100
              );
              setUploadProgress(progress);
            }
          },
        }
      );

      const image_uri = `${pinataBaseUrl}${uploadImage.data.IpfsHash}`;

      const uploadMusic = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        musicFormData,
        {
          headers: { Authorization: `Bearer ${pinata_jwt}` },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round(
                (progressEvent.loaded / progressEvent.total) * 100
              );
              setUploadProgress(progress);
            }
          },
        }
      );

      setShowUploadModal(false); // Hide image upload modal

      const music_uri = `${pinataBaseUrl}${uploadMusic.data.IpfsHash}`;

      const metadata = {
        name: titleText,
        image: image_uri,
        music: music_uri,
        video: "",
        description: "",
        category: categoryName,
      };

      const uploadMetadata = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', metadata, {
        headers: {
          'Authorization': `Bearer ${pinata_jwt}`,
          'Content-Type': 'application/json'
        }
      })

      const metadataUrl = `${pinataBaseUrl}${uploadMetadata.data.IpfsHash}`;

      // Minting begins
      setShowMintingModal(true);

      if (isEthereum) {
        await writeContractAsync(
          {
            abi: polymintabi,
            address: ethContractAddress,
            functionName: "safeMint",
            chainId: polygon.id,
            args: [address, metadataUrl],
            account: address,
            value: parseEther("1", "wei"),
          },
          {
            onSuccess: async () => {
              await http.post("/create_evm_nft", {
                collection_address: ethContractAddress,
                nft_owner: address,
                token_id: 1,
                content_type: "music",
                image_uri: image_uri,
                metadata_uri: metadataUrl,
                title: titleText,
                description: "",
                category: categoryName,
              });

              toast.success("NFT minted successfully on Polygon!");
              setMintingSuccess(true);
            },
            onError: () => {
              toast.error("Minting failed on Polygon.");
            },
          }
        );
      } else {
        // Solana mint
        const umi = createUmi(solanaApi);
        umi.use(walletAdapterIdentity(wallet));
        const mint = generateSigner(umi);
        const mintInstruc = createV1(umi, {
          mint,
          authority: umi.identity,
          name: titleText,
          symbol: "PM",
          uri: metadataUrl,
          sellerFeeBasisPoints: percentAmount(0),
          tokenStandard: TokenStandard.NonFungible,
        });

        const transactionInstruc = transactionBuilder()
          .add(
            transferSol(umi, {
              source: umi.identity,
              destination: sol_receiver,
              amount: sol(parseFloat(mintFees)),
            })
          )
          .add(setComputeUnitPrice(umi, { microLamports: 10000 }))
          .add(mintInstruc);

        const sig = await transactionInstruc.sendAndConfirm(umi);
        console.log(base58.deserialize(sig.signature));

        await http.post("/create_sol_nft", {
          mint_address: mint.publicKey,
          nft_owner: wallet.publicKey.toString(),
          content_type: "music",
          music_uri: music_uri,
          image_uri: image_uri,
          metadata_uri: metadataUrl,
          title: titleText,
          description: "",
          category: categoryName,
        });

        toast.success("NFT minted successfully on Solana!");
        setMintingSuccess(true);
      }
    } catch (err) {
      if (err?.shortMessage) {
        toast.error(`Upload or minting failed, Reason: ${err.shortMessage} `);
      } else {
        toast.error("Something went wrong during upload or minting.");
      }
      setShowUploadModal(false);
      setShowMintingModal(false);
    }
  };

  return (
    <>
      <Navbar />
      <Head>
        <title>Block News Media - Mint</title>
        <meta name="description" content="Block News Media - Mint" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="px-4 py-8 min-h-screen bg-gray-50 flex flex-col items-center">
        <div className="w-full max-w-2xl bg-white shadow-lg border border-gray-200 rounded-lg p-6">
          {/* Header with Title and Switch */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold">Mint your Music as NFM</h1>
          </div>

          {/* Image Upload */}
          <p className="text-sm text-gray-600 mb-4">
            Upload the image that will represent your NFM
            <b> (JPEG and PNG Files ONLY, max file size: 1Gb)</b>
          </p>

          <div className="mb-6">

            <input
              type="file"
              ref={inputImageFile}
              accept=".jpg, .jpeg, .png"
              onChange={(e) =>
                setUploadedImageFile(e.target.files ? e.target.files[0] : null)
              }
              className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 
                        file:rounded-md file:border-0 file:text-sm file:font-semibold 
                        file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />

            <p className="text-sm mt-4 text-gray-600 mb-4">
              Upload the music that will represent your NFM
              <b> (.mp3 Audio files ONLY, max file size: 1Gb)</b>
            </p>

            <input
              type="file"
              accept=".mp3"
              ref={inputMusicFile}
              onChange={(e) =>
                setUploadedMusicFile(e.target.files ? e.target.files[0] : null)
              }
              className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 
                        file:rounded-md file:border-0 file:text-sm file:font-semibold 
                        file:bg-violet-50 file:text-violet-700 hover:file:bg-blue-100"
            />
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Music Title (NFT Title)
            </label>
            <input
              type="text"
              value={titleText}
              onChange={(e) => setTitleText(e.target.value)}
              placeholder="Max 20 characters"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
            />
          </div>

          {/* Category */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Genre
            </label>
            <select
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
            >
              <option value="" disabled>
                Select Genre
              </option>
              <option value="Country">Country</option>
              <option value="Electronic">Electronic</option>
              <option value="Funk">Funk</option>
              <option value="Hip Hop">Hip Hop</option>
              <option value="Jazz">Jazz</option>
              <option value="Latin">Latin</option>
              <option value="Pop">Pop</option>
              <option value="Punk">Punk</option>
              <option value="Reggae">Reggae</option>
              <option value="Rock">Rock</option>
              <option value="Metal">Metal</option>
              <option value="R&B">R&B</option>
              <option value="Soul">Soul</option>
              <option value="Rap">Rap</option>
            </select>
          </div>

          {/* Mint Button */}
          <div className="flex justify-end">
            <button
              onClick={() => {
                handleUploadAndMint();
              }}
              disabled={!isMintable || isNftMintInProcess}
              className="inline-flex items-center px-6 py-2 text-sm font-medium rounded-md 
                        text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isNftMintInProcess ? "Minting..." : "Create NFT"}
            </button>
          </div>
        </div>
      </div>

      {/* Upload Progress Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-20 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3 text-center border border-zinc-200">
            <h2 className="text-lg font-semibold mb-4">Uploading...</h2>
            <p className="text-xs mb-4 text-zinc-500 font-semibold">
              Please do not refresh or close page until it's completed.
            </p>
            <div className="h-2 mb-4 bg-gray-200 rounded-full">
              <div
                className="h-full bg-blue-600 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p>{uploadProgress}%</p>
          </div>
        </div>
      )}

      {/* Minting Modal */}
      {showMintingModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-20 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3 text-center border border-zinc-200">
            <h2 className="text-lg font-semibold mb-4">
              {mintingSuccess
                ? "Minting Successful!"
                : "Please approve from your wallet"}
            </h2>
            <p className="mb-4">
              {mintingSuccess
                ? "Your NFT has been successfully minted!"
                : "Waiting for wallet approval to complete the minting."}
            </p>
            <button
              onClick={() => setShowMintingModal(false)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
