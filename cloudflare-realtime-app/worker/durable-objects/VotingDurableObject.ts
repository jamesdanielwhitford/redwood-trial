import { DurableObject } from 'cloudflare:workers';

export interface VoteData {
  dog: number;
  cat: number;
}

export class VotingDurableObject extends DurableObject {
  private votes: VoteData | undefined;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.votes = undefined;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    
    if (url.pathname === "/vote-dog") {
      const votes = await this.voteDog();
      return Response.json(votes);
    }
    
    if (url.pathname === "/vote-cat") {
      const votes = await this.voteCat();
      return Response.json(votes);
    }
    
    if (url.pathname === "/get-votes") {
      const votes = await this.getVotes();
      return Response.json(votes);
    }
    
    if (url.pathname === "/reset-votes") {
      const votes = await this.resetVotes();
      return Response.json(votes);
    }
    
    return new Response("Not Found", { status: 404 });
  }

  async getVotes(): Promise<VoteData> {
    if (this.votes === undefined) {
      // Try to load from storage first
      this.votes = await this.ctx.storage.get<VoteData>("votes") ?? { dog: 0, cat: 0 };
      
      // If we have a database, sync with it
      if ((this.env as any)?.DB) {
        try {
          const result = await (this.env as any).DB.prepare(`
            SELECT 
              vote_type,
              COUNT(*) as count 
            FROM votes 
            WHERE id > 0
            GROUP BY vote_type
          `).all();
          
          if (result.success && result.results.length > 0) {
            const dbVotes: VoteData = { dog: 0, cat: 0 };
            for (const row of result.results) {
              const { vote_type, count } = row as { vote_type: string; count: number };
              if (vote_type === 'dog' || vote_type === 'cat') {
                dbVotes[vote_type] = count;
              }
            }
            this.votes = dbVotes;
            await this.ctx.storage.put("votes", this.votes);
          }
        } catch (error) {
          console.error("Error loading votes from database:", error);
        }
      }
    }
    
    return this.votes ?? { dog: 0, cat: 0 };
  }

  async voteDog(): Promise<VoteData> {
    const currentVotes = await this.getVotes();
    this.votes = { ...currentVotes, dog: currentVotes.dog + 1 };
    
    // Save to storage
    await this.ctx.storage.put("votes", this.votes);
    
    // Persist to database
    if ((this.env as any)?.DB) {
      try {
        await (this.env as any).DB.prepare("INSERT INTO votes (vote_type) VALUES (?)").bind("dog").run();
      } catch (error) {
        console.error("Error saving dog vote to database:", error);
      }
    }
    
    return this.votes;
  }

  async voteCat(): Promise<VoteData> {
    const currentVotes = await this.getVotes();
    this.votes = { ...currentVotes, cat: currentVotes.cat + 1 };
    
    // Save to storage
    await this.ctx.storage.put("votes", this.votes);
    
    // Persist to database
    if ((this.env as any)?.DB) {
      try {
        await (this.env as any).DB.prepare("INSERT INTO votes (vote_type) VALUES (?)").bind("cat").run();
      } catch (error) {
        console.error("Error saving cat vote to database:", error);
      }
    }
    
    return this.votes;
  }

  async resetVotes(): Promise<VoteData> {
    this.votes = { dog: 0, cat: 0 };
    await this.ctx.storage.put("votes", this.votes);
    
    // Clear database
    if ((this.env as any)?.DB) {
      try {
        await (this.env as any).DB.prepare("DELETE FROM votes WHERE id > 0").run();
      } catch (error) {
        console.error("Error clearing votes from database:", error);
      }
    }
    
    return this.votes;
  }
}