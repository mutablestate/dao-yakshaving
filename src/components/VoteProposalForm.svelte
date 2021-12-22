<script>
  import { ethers } from "ethers";
  import { currentAccount, tokenModule, voteModule } from "../stores";

  export let voteProposals;
  export let hasVoted;

  let isVoting = false;

  function typeToEmoji(type) {
    return {
      0: "🛑",
      1: "🔥",
      2: "🤐",
    }[type];
  }

  async function handleSubmitVote() {
    isVoting = true;
    const votes = voteProposals.map((proposal) => {
      let voteResult = {
        proposalId: proposal.proposalId,
        vote: 2,
      };
      proposal.votes.forEach((vote) => {
        const elem = document.getElementById(
          proposal.proposalId + "-" + vote.type
        );

        if (elem.checked) {
          voteResult.vote = vote.type;
          return;
        }
      });
      return voteResult;
    });
    // first we need to make sure the user delegates their token to vote
    try {
      //we'll check if the wallet still needs to delegate their tokens before they can vote
      const delegation = await $tokenModule.getDelegationOf($currentAccount);
      // if the delegation is the 0x0 address that means they have not delegated their governance tokens yet
      if (delegation === ethers.constants.AddressZero) {
        //if they haven't delegated their tokens yet, we'll have them delegate them before voting
        await $tokenModule.delegateTo($currentAccount);
      }
      // then we need to vote on the proposals
      try {
        await Promise.all(
          votes.map(async (vote) => {
            // before voting we first need to check whether the proposal is open for voting
            // we first need to get the latest state of the proposal
            const proposal = await $voteModule.get(vote.proposalId);
            // then we check if the proposal is open for voting (state === 1 means it is open)
            if (proposal.state === 1) {
              // if it is open for voting, we'll vote on it
              return $voteModule.vote(vote.proposalId, vote.vote);
            }
            // if the proposal is not open for voting we just return nothing, letting us continue
            return;
          })
        );
        try {
          // if any of the propsals are ready to be executed we'll need to execute them
          // a proposal is ready to be executed if it is in state 4
          await Promise.all(
            votes.map(async (vote) => {
              // we'll first get the latest state of the proposal again, since we may have just voted before
              const proposal = await $voteModule.get(vote.proposalId);

              //if the state is in state 4 (meaning that it is ready to be executed), we'll execute the proposal
              if (proposal.state === 4) {
                return $voteModule.execute(vote.proposalId);
              }
            })
          );
          // if we get here that means we successfully voted, so let's set the "hasVoted" state to true
          hasVoted = true;
          // and log out a success message
          console.log("successfully voted");
        } catch (err) {
          console.error("failed to execute votes", err);
        }
      } catch (err) {
        console.error("failed to vote", err);
      }
    } catch (err) {
      console.error("failed to delegate tokens");
    } finally {
      // in *either* case we need to set the isVoting state to false to enable the button again
      isVoting = false;
    }
  }
</script>

<form on:submit|preventDefault|stopPropagation={handleSubmitVote}>
  {#each voteProposals as { proposalId, description, votes } (proposalId)}
    <div class="card shadow-md mb-4">
      <div class="vote-description mb-2">{description}</div>
      {#each votes as { type, label } (type)}
        <div>
          <input
            type="radio"
            class="radio"
            id={proposalId + "-" + type}
            name={proposalId}
            value={type}
            checked={type === 2}
          />
          <label class="label" for={proposalId + "-" + type}>
            {typeToEmoji(type)}
            {label}
          </label>
        </div>
      {/each}
    </div>
  {/each}
  <button
    type="submit"
    class="button shadow-md"
    disabled={isVoting || hasVoted}
  >
    {isVoting ? "Voting..." : hasVoted ? "You Already Voted" : "Submit Votes"}
  </button>
  <div class="vote-tx-info">
    This will trigger multiple transactions that you will need to sign.
  </div>
</form>

<style>
  .vote-description {
    font-weight: 600;
    color: var(--hp-pop);
  }
  .vote-tx-info {
    font-style: italic;
    color: var(--tx-main);
  }

  .radio {
    margin: 0.5rem;
  }
</style>
