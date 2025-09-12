"use server";

import { env } from "cloudflare:workers";

export const getCount = async (): Promise<number> => {
  const doId = env.COUNTER_DURABLE_OBJECT.idFromName("global-counter");
  const counterDO = env.COUNTER_DURABLE_OBJECT.get(doId);
  return counterDO.getCount();
};