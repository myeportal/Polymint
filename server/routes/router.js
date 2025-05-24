const express = require("express");
const evm_nftModel = require("../model/evm_nft.model");
const sol_nftModel = require("../model/sol_nft.model");


const router = express.Router();


router.get("/", (req, res) => {
    res.status(200).send("API up and running")
})

router.post("/create_evm_nft", async (req, res) => {
    try {
        const {
            content_type,
            collection_address,
            token_id,
            nft_owner,
            image_uri,
            metadata_uri,
            title,
            description,
            category,
            music_uri,
            video_uri
        } = req.body;

        if (!content_type || !collection_address || token_id == null || !nft_owner || !metadata_uri || !title || !category) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const baseData = {
            collection_address,
            token_id,
            nft_owner,
            content_type,
            metadata_uri,
            title,
            category
        };

        switch (content_type) {
            case "article":
                if (!image_uri || !description) {
                    return res.status(400).json({ error: "Missing fields for article type" });
                }
                await evm_nftModel.create({
                    ...baseData,
                    image_uri,
                    description
                });
                break;

            case "music":
                if (!music_uri) {
                    return res.status(400).json({ error: "Missing music_uri for music type" });
                }
                await evm_nftModel.create({
                    ...baseData,
                    music_uri
                });
                break;

            case "video":
                if (!video_uri) {
                    return res.status(400).json({ error: "Missing video_uri for video type" });
                }
                await evm_nftModel.create({
                    ...baseData,
                    video_uri
                });
                break;

            default:
                return res.status(400).json({ error: "Invalid content_type" });
        }

        return res.status(201).json({ message: "NFT created successfully" });

    } catch (error) {
        console.error("Error creating EVM NFT:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});


router.post("/create_sol_nft", async (req, res) => {
    try {
        const {
            mint_address,
            nft_owner,
            content_type,
            image_uri,
            music_uri,
            video_uri,
            metadata_uri,
            title,
            description,
            category
        } = req.body;

        // Basic required fields
        if (!mint_address || !nft_owner || !content_type || !metadata_uri || !title || !category) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const baseData = {
            mint_address,
            nft_owner,
            content_type,
            metadata_uri,
            title,
            category
        };

        switch (content_type) {
            case "article":
                if (!image_uri || !description) {
                    return res.status(400).json({ error: "Missing fields for article type" });
                }
                await sol_nftModel.create({
                    ...baseData,
                    image_uri,
                    description
                });
                break;

            case "music":
                if (!music_uri) {
                    return res.status(400).json({ error: "Missing music_uri for music type" });
                }
                await sol_nftModel.create({
                    ...baseData,
                    music_uri
                });
                break;

            case "video":
                if (!video_uri) {
                    return res.status(400).json({ error: "Missing video_uri for video type" });
                }
                await sol_nftModel.create({
                    ...baseData,
                    video_uri
                });
                break;

            default:
                return res.status(400).json({ error: "Invalid content_type" });
        }

        return res.status(201).json({ message: "Solana NFT created successfully" });

    } catch (error) {
        console.error("Error creating Solana NFT:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// Fetch EVM NFTs by wallet address
router.get("/evm_nfts", async (req, res) => {
    const { wallet_address } = req.query;

    if (!wallet_address) {
        return res.status(400).json({ error: "Missing wallet_address in query" });
    }

    try {
        const nfts = await evm_nftModel.find({ nft_owner: wallet_address }, { _id: 0 , __v:0 });
        return res.status(200).json({ nfts });
    } catch (error) {
        console.error("Error fetching EVM NFTs:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// Fetch Solana NFTs by wallet address
router.get("/sol_nfts", async (req, res) => {
    const { wallet_address } = req.query;

    if (!wallet_address) {
        return res.status(400).json({ error: "Missing wallet_address in query" });
    }

    try {
        const nfts = await sol_nftModel.find({ nft_owner: wallet_address }, { _id: 0 , __v:0 });
        return res.status(200).json({ nfts });
    } catch (error) {
        console.error("Error fetching Solana NFTs:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});




module.exports = router;