import { DurableObject } from 'cloudflare:workers';

export interface PollVoteData {
  [choiceId: string]: number;
}

export class PollDurableObject extends DurableObject {
  private votes: PollVoteData | undefined;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.votes = undefined;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    
    if (url.pathname === "/get-votes") {
      const votes = await this.getVotes();
      return Response.json(votes);
    }
    
    if (url.pathname.startsWith("/vote/")) {
      const choiceId = url.pathname.split("/vote/")[1];
      if (!choiceId) {
        return new Response("Choice ID required", { status: 400 });
      }
      const votes = await this.vote(choiceId);
      return Response.json(votes);
    }
    
    if (url.pathname === "/reset-votes") {
      const votes = await this.resetVotes();
      return Response.json(votes);
    }
    
    return new Response("Not Found", { status: 404 });
  }

  async getVotes(): Promise<PollVoteData> {
    if (this.votes === undefined) {
      this.votes = await this.ctx.storage.get<PollVoteData>("votes") ?? {};
    }
    return this.votes;
  }

  async vote(choiceId: string): Promise<PollVoteData> {
    const currentVotes = await this.getVotes();
    this.votes = { 
      ...currentVotes, 
      [choiceId]: (currentVotes[choiceId] ?? 0) + 1 
    };
    
    await this.ctx.storage.put("votes", this.votes);
    return this.votes;
  }

  async resetVotes(): Promise<PollVoteData> {
    this.votes = {};
    await this.ctx.storage.put("votes", this.votes);
    return this.votes;
  }
}