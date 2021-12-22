import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

const bundleDrop = sdk.getBundleDropModule(
  "0x789Df20C3F24687031A6dc24680a704A963Ba34F"
);

async function configNft() {
  try {
    await bundleDrop.createBatch([
      {
        name: "Yak Butter Tea",
        description: "This NFT will give you access to YakShavingDAO!",
        image: readFileSync("scripts/assets/tea.jpg"),
      },
    ]);
    console.log("✅ Successfully created a new NFT in the drop!");
  } catch (error) {
    console.error("failed to create the new NFT", error);
  }
}

configNft()