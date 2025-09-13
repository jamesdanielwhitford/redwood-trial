"use server";

import { env } from "cloudflare:workers";
import { PollVoteData } from "../../../pollDurableObject";

export const getPollVotes = async (pollId: string): Promise<PollVoteData> => {
  const doId = env.POLL_DURABLE_OBJECT.idFromName(pollId);
  const pollDO = env.POLL_DURABLE_OBJECT.get(doId);
  return pollDO.getVotes();
};