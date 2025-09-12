"use server";

import { env } from "cloudflare:workers";
import { VoteData } from "../../../votingDurableObject";

export const getVotes = async (): Promise<VoteData> => {
  const doId = env.VOTING_DURABLE_OBJECT.idFromName("global-voting");
  const votingDO = env.VOTING_DURABLE_OBJECT.get(doId);
  return votingDO.getVotes();
};