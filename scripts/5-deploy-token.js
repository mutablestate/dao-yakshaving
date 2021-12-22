import sdk from "./1-initialize-sdk.js";

async function deployToken() {
  const app = sdk.getAppModule("0x6d0aF6c56E0a95002C0848C894266a218EE133A0");

  try {
    // Deploy a standard ERC-20 contract.
    const tokenModule = await app.deployTokenModule({
      // What's your token's name? Ex. "Ethereum"
      name: "YakShavingDAO Governance Token",
      // What's your token's symbol? Ex. "ETH"
      symbol: "YAK",
    });
    console.log(
      "✅ Successfully deployed token module, address:",
      tokenModule.address
    );
  } catch (error) {
    console.error("failed to deploy token module", error);
  }
}

deployToken();
