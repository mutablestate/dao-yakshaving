<script lang="ts">
  import { onMount } from "svelte";
  import { ethers } from "ethers";
  import { ThirdwebSDK } from "@3rdweb/sdk";

  import yak2 from "./assets/yak2.jpg";
  import MemberTable from "./components/MemberTable.svelte";
  import VoteProposalForm from "./components/VoteProposalForm.svelte";
  import {
    bundleDropModule,
    tokenModule,
    voteModule,
    currentAccount,
    hasClaimedNft,
  } from "./stores";

  let ethereum: any;
  let isClaiming: boolean = false;

  let memberTokenAmounts = {};
  let memberAddresses: string[] = [];

  let voteProposals: any[] = [];
  let hasVoted: boolean = false;

  $: memberList = memberAddresses.map((address) => ({
    address,
    tokenAmount: ethers.utils.formatUnits(
      // @ts-ignore
      memberTokenAmounts[address] || 0,
      18
    ),
  }));

  const sdk = new ThirdwebSDK("rinkeby");
  bundleDropModule.set(
    sdk.getBundleDropModule("0x789Df20C3F24687031A6dc24680a704A963Ba34F")
  );
  tokenModule.set(
    sdk.getTokenModule("0x953079618B69c88B02b7a75EDd3380Dd3bae57Fb")
  );
  voteModule.set(
    sdk.getVoteModule("0x866cE9f5B7234206F7d1094431Fc6799ad488647")
  );

  function setSdkSigner() {
    if (!ethereum) return null;
    try {
      const provider = new ethers.providers.Web3Provider(ethereum);
      if (provider) {
        const signer = provider.getSigner();
        sdk.setProviderOrSigner(signer);
      }
    } catch (error) {
      console.log("Oof! failed to set signer");
    }
  }

  async function getMemberAddresses() {
    try {
      const addresses = await $bundleDropModule.getAllClaimerAddresses("0");
      console.log("🚀 Members addresses", addresses);
      memberAddresses = addresses;
    } catch (error) {
      console.log("Ooof! failed to get member list", error);
    }
  }

  async function getMemberTokenAmounts() {
    try {
      const amounts = await $tokenModule.getAllHolderBalances();
      memberTokenAmounts = amounts;
    } catch (error) {
      console.error("Ooof! failed to get token amounts", error);
    }
  }

  async function getVoteProposals() {
    try {
      const proposals = await $voteModule.getAll();
      console.log("🌈 Proposals:", proposals);
      voteProposals = proposals;
    } catch (error) {
      console.log("Ooof! failed to get proposals", error);
    }
  }

  async function getHasVoted() {
    if (voteProposals.length < 1) return null;
    try {
      const voted = await $voteModule.hasVoted(
        voteProposals[0].proposalId,
        $currentAccount
      );
      hasVoted = voted;
    } catch (error) {
      console.log("Ooof! failed to check if wallet has voted", error);
    }
  }

  async function getBalance() {
    try {
      const balance = await $bundleDropModule.balanceOf($currentAccount, "0");
      // If balance is greater than 0, they have our NFT!
      if (balance.gt(0)) {
        hasClaimedNft.set(true);
        console.log("🌟 this user has a membership NFT!");
        getMemberAddresses();
        getMemberTokenAmounts();
        getVoteProposals();
        getHasVoted();
      } else {
        hasClaimedNft.set(false);
        console.log("😭 this user doesn't have a membership NFT.");
      }
    } catch (error) {
      hasClaimedNft.set(false);
      console.error("failed to nft balance", error);
    }
  }

  // NOTE: connect first ethereum account in MetaMask
  async function handleConnectWallet() {
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    if (accounts.length > 0) {
      console.log("Connected ", accounts[0]);
      currentAccount.set(accounts[0]);
      getBalance();
    }
  }

  async function mintNft() {
    isClaiming = true;

    try {
      // NOTE: mint nft to user's wallet.
      await $bundleDropModule.claim("0", 1);
    } catch (error) {
      console.error("failed to claim", error);
      isClaiming = false;
    } finally {
      isClaiming = false;
      hasClaimedNft.set(true);
      console.log(
        `🌊 Successfully Minted! Check it out on OpenSea: https://testnets.opensea.io/assets/${bundleDropModule.address}/0`
      );
    }
  }

  onMount(async () => {
    ethereum = window?.ethereum;
    if (ethereum) {
      setSdkSigner();
      handleConnectWallet();
    } else {
      console.log("Login To Metamask!");
    }
  });
</script>

<svelte:head>
  <title>YakShavingDAO</title>
</svelte:head>

<main id="main">
  {#if $hasClaimedNft}
    <h1 class="center">The YakShaving DAO</h1>
    <div class="center">
      <img
        src={yak2}
        width="140px"
        height="140px"
        alt="yak"
        class="shadow-md"
      />
    </div>

    <div class="grid grid-cols-2 gap-8">
      <div>
        <h2>Shave That Yak</h2>
        <div class="card shadow-md">
          <MemberTable {memberList} />
        </div>
      </div>

      <div>
        <h2>Active Proposals</h2>
        <VoteProposalForm {voteProposals} {hasVoted} />
      </div>
    </div>
  {:else if $currentAccount}
    <div class="mint-nft">
      <h1>Mint your free DAO Membership NFT</h1>
      <button class="button" disabled={isClaiming} on:click={mintNft}>
        {isClaiming ? "Minting..." : "Mint your nft (FREE)"}
      </button>
    </div>
  {:else}
    <div class="connect-wallet">
      <h1>Hello YakShavers!</h1>
      <button class="button" on:click={handleConnectWallet}>
        Connect Wallet To Get Started
      </button>
    </div>
  {/if}
</main>

<style>
  :root {
    /* text */
    --tx-main: rgb(36, 32, 71);
    --tx-dimmed: rgb(115, 112, 158);
    /* element */
    --el-main: rgb(242, 246, 250);
    --el-shadow: rgb(82, 79, 239);
    --el-highlight: rgb(133, 116, 226);
    /* help */
    --hp-gray: rgb(110, 108, 126);
    --hp-danger: rgb(255, 49, 49);
    --hp-success: rgb(100, 188, 152);
    --hp-pop: rgb(82, 79, 239);
  }

  #main {
    padding-left: 2rem;
    padding-right: 2rem;
  }

  img {
    border-radius: 50%;
  }
</style>
