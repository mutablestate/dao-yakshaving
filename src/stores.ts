import { writable } from "svelte/store";
import type { BundleDropModule, TokenModule, VoteModule } from "@3rdweb/sdk";

export const currentAccount = writable<string>("");
export const hasClaimedNft = writable<boolean>(false);

export const bundleDropModule = writable<BundleDropModule>();
export const tokenModule = writable<TokenModule>();
export const voteModule = writable<VoteModule>();
