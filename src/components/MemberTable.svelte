<script lang="ts">
  import { shortenAddress } from "../utils";

  export let memberList: any[];

  const headerCells = [{ label: "Address" }, { label: "Token Amount" }];
</script>

<section>
  <div class="grid grid-cols-2 gap-1 items-center mb-2">
    {#each headerCells as { label }}
      <div class="label">
        {label}
      </div>
    {/each}
  </div>
  <div class="grid grid-cols-2 gap-1 items-center">
    {#each memberList as { address, tokenAmount } (address)}
      <div>
        {shortenAddress(address)}
      </div>
      <div>
        {tokenAmount}
      </div>
    {/each}
  </div>
</section>

<style>
  .label {
    font-weight: 600;
  }
</style>
