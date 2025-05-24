import { createConfig, http } from '@wagmi/core'
import { mainnet, sepolia } from '@wagmi/core/chains'

const config = createConfig({
  chains: [mainnet, sepolia],
//   transports: {
//     [mainnet.id]: http('https://mainnet.example.com'),
//     [sepolia.id]: http('https://sepolia.example.com'),
//   },
})

export default config;