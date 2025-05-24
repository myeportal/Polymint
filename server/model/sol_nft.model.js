const mongoose = require("mongoose");

const solNFT = new mongoose.Schema(
    {
        mint_address: { type: String, index: true, default: null },
        nft_owner: { type: String, index: true, default: null },
        content_type: { type: String, index: true },
        image_uri: { type: String, default: "" },
        music_uri: { type: String, default: "" },
        video_uri: { type: String, default: "" },
        metadata_uri: { type: String, default: "" },
        title: { type: String, default: "" },
        description: { type: String, default: "" },
        category: { type: String, default: "" },

    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    }
);

module.exports = mongoose.model("sol_nft", solNFT);