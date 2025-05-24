import Image from "next/image";
import twitter from "../assets/twitter.png";

export default function Footer() {
    return (
        <div className="border-t border-zinc-300 w-full mt-auto pt-14 pb-24">
            <div className="w-[80%] mx-auto flex flex-col md:flex-row gap-12 justify-between">
                {/* Left Side */}
                <div className="flex-1">
                    <p className="font-bold text-2xl">PolymintMe</p>
                    <p className="mt-2">Building the future of decentralized creativity.</p>
                    <a href="https://x.com/PolyMintMe" target="_blank">
                        <Image src={twitter} className="w-12 my-2" alt="twitter" />
                    </a>
                    <p className="text-zinc-400 text-sm">Polymintme, a Wyoming DAO</p>
                </div>

                {/* Right Side - Contact Form */}
                <div className="flex-1">
                    <p className="font-bold text-xl mb-4">Contact Us</p>
                    <form className="flex flex-col gap-4">
                        <input
                            type="text"
                            placeholder="Name"
                            className="border border-zinc-300 rounded px-4 py-2"
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            className="border border-zinc-300 rounded px-4 py-2"
                        />
                        <input
                            type="text"
                            placeholder="Subject"
                            className="border border-zinc-300 rounded px-4 py-2"
                        />
                        <textarea
                            placeholder="Your message"
                            rows="4"
                            className="border border-zinc-300 rounded px-4 py-2"
                        ></textarea>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-zinc-800 transition"
                        >
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
