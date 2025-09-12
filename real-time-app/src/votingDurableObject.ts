import { DurableObject } from "cloudflare:workers";

export type VoteData = {
  dog: number;
  cat: number;
};

export class VotingDurableObject extends DurableObject {
  private state: DurableObjectState;
  private votes: VoteData | undefined;

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
    this.state = state;
    this.votes = undefined;
  }

  async getVotes(): Promise<VoteData> {
    return (this.votes ??=
      (await this.state.storage.get<VoteData>("votes")) ?? { dog: 0, cat: 0 });
  }

  async voteDog(): Promise<VoteData> {
    const currentVotes = await this.getVotes();
    this.votes = { ...currentVotes, dog: currentVotes.dog + 1 };
    await this.state.storage.put<VoteData>("votes", this.votes);
    return this.votes;
  }

  async voteCat(): Promise<VoteData> {
    const currentVotes = await this.getVotes();
    this.votes = { ...currentVotes, cat: currentVotes.cat + 1 };
    await this.state.storage.put<VoteData>("votes", this.votes);
    return this.votes;
  }
}