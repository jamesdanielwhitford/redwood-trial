import { DurableObject } from "cloudflare:workers";

export class CounterDurableObject extends DurableObject {
  private state: DurableObjectState;
  private count: number | undefined;

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
    this.state = state;
    this.count = undefined;
  }

  async getCount(): Promise<number> {
    return (this.count ??=
      (await this.state.storage.get<number>("count")) ?? 0);
  }

  async increment(): Promise<number> {
    this.count = (await this.getCount()) + 1;
    await this.state.storage.put<number>("count", this.count);
    return this.count;
  }

  async decrement(): Promise<number> {
    this.count = (await this.getCount()) - 1;
    await this.state.storage.put<number>("count", this.count);
    return this.count;
  }
}