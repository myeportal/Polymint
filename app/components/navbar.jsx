"use client";

import Link from "next/link";
import {
  Field,
  Label,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Switch,
} from "@headlessui/react";
import { ChevronDownIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useSelectedNetwork } from "../context/selectedNetwork";
import Image from "next/image";
import hand from "../assets/hand.png";
import articlesvg from "../assets/article.svg";
import musicsvg from "../assets/music.svg";
import videosvg from "../assets/video.svg";

export default function Navbar() {
  const { isEthereum, setIsEthereum } = useSelectedNetwork(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow mb-6 w-full">
      <div className="w-[80%] mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold flex items-center">
          <Image className="w-12" src={hand} alt="Logo" />
        </Link>

        {/* Mobile menu button */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center space-x-4">
          <Menu as="div" className="relative inline-block text-left">
            <MenuButton className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
              Mint NFT
              <ChevronDownIcon className="ml-2 -mr-1 h-5 w-5" />
            </MenuButton>

            <MenuItems className="absolute right-0 mt-2 w-56 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg focus:outline-none z-10">
              <div className="p-1">
                {[{ href: "/mint/article", icon: articlesvg, label: "Mint Article" },
                  { href: "/mint/music", icon: musicsvg, label: "Mint Music" },
                  { href: "/mint/video", icon: videosvg, label: "Mint Video" }].map((item) => (
                  <MenuItem key={item.href}>
                    {({ active }) => (
                      <Link
                        href={item.href}
                        className={`flex space-x-2 items-center ${active ? "bg-gray-100" : ""
                          } block px-4 py-2 text-sm text-gray-700`}
                      >
                        <Image className="w-8" src={item.icon} alt={item.label} />
                        <p>{item.label}</p>
                      </Link>
                    )}
                  </MenuItem>
                ))}
              </div>
            </MenuItems>
          </Menu>

          <Field>
            <div className="flex items-center space-x-2">
              <div className="h-12">
                {isEthereum ? (
                  <w3m-button />
                ) : (
                  <WalletMultiButton />
                )}
              </div>
              <Label className="text-sm text-gray-700 w-14 text-right">
                {isEthereum ? "Polygon" : "Solana"}
              </Label>
              <Switch
                checked={isEthereum}
                onChange={setIsEthereum}
                className={`${isEthereum ? "bg-blue-600" : "bg-purple-600"
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
              >
                <span
                  className={`${isEthereum ? "translate-x-6" : "translate-x-1"
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
            </div>
          </Field>
        </div>
      </div>

      {/* Mobile Menu Content */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pb-4 space-y-4">
          <Menu as="div" className="text-left">
            <MenuButton className="w-full text-left rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
              Mint NFT
              <ChevronDownIcon className="ml-2 -mr-1 h-5 w-5 inline-block" />
            </MenuButton>

            <MenuItems className="mt-2 w-full origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg focus:outline-none z-10">
              <div className="p-1">
                {[{ href: "/mint/article", icon: articlesvg, label: "Mint Article" },
                  { href: "/mint/music", icon: musicsvg, label: "Mint Music" },
                  { href: "/mint/video", icon: videosvg, label: "Mint Video" }].map((item) => (
                  <MenuItem key={item.href}>
                    {({ active }) => (
                      <Link
                        href={item.href}
                        className={`flex space-x-2 items-center ${active ? "bg-gray-100" : ""
                          } block px-4 py-2 text-sm text-gray-700`}
                      >
                        <Image className="w-8" src={item.icon} alt={item.label} />
                        <p>{item.label}</p>
                      </Link>
                    )}
                  </MenuItem>
                ))}
              </div>
            </MenuItems>
          </Menu>

          <div className="flex items-center justify-between">
            <div className="h-12">
              {isEthereum ? (
                <w3m-button />
              ) : (
                <WalletMultiButton />
              )}
            </div>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-700">
                {isEthereum ? "Ethereum" : "Solana"}
              </p>
              <Switch
                checked={isEthereum}
                onChange={setIsEthereum}
                className={`${isEthereum ? "bg-blue-600" : "bg-purple-600"
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
              >
                <span
                  className={`${isEthereum ? "translate-x-6" : "translate-x-1"
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
