"use server";

import { db } from "@/db";
import { redirect } from "rwsdk/server";
import { env } from "cloudflare:workers";
import { v4 as uuidv4 } from "uuid";

export type CreatePollData = {
  title: string;
  choices: Array<{ text: string; color: string }>;
};

export const createPoll = async (userId: string, data: CreatePollData) => {
  const pollId = uuidv4();
  
  const poll = await db.poll.create({
    data: {
      id: pollId,
      title: data.title,
      createdBy: userId,
      choices: {
        create: data.choices.map(choice => ({
          id: uuidv4(),
          text: choice.text,
          color: choice.color,
          votes: 0
        }))
      }
    },
    include: {
      choices: true
    }
  });
  
  return poll;
};

export const getUserPolls = async (userId: string) => {
  return await db.poll.findMany({
    where: {
      createdBy: userId
    },
    include: {
      choices: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

export const getPoll = async (pollId: string) => {
  return await db.poll.findUnique({
    where: {
      id: pollId
    },
    include: {
      choices: true
    }
  });
};