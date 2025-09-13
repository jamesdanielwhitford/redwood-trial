import { DurableObject } from "cloudflare:workers";

export type PollVoteData = {
  [choiceId: string]: number;
};

export class PollDurableObject extends DurableObject {
  private state: DurableObjectState;
  private votes: PollVoteData | undefined;

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
    this.state = state;
    this.votes = undefined;
  }

  async getVotes(): Promise<PollVoteData> {
    return (this.votes ??=
      (await this.state.storage.get<PollVoteData>("votes")) ?? {});
  }

  async vote(choiceId: string): Promise<PollVoteData> {
    const currentVotes = await this.getVotes();
    this.votes = { 
      ...currentVotes, 
      [choiceId]: (currentVotes[choiceId] ?? 0) + 1 
    };
    await this.state.storage.put<PollVoteData>("votes", this.votes);
    return this.votes;
  }
}