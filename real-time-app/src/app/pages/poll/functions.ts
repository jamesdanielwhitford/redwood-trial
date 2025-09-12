"use server";

import { db } from "@/db";
import { requestInfo } from "rwsdk/worker";

export type PollWithChoices = {
  id: string;
  title: string;
  createdAt: Date;
  choices: Array<{
    id: string;
    text: string;
    emoji: string;
    color: string;
    voteCount: number;
  }>;
};

export const createPoll = async (formData: FormData) => {
  const { ctx } = requestInfo;
  
  if (!ctx.user) {
    throw new Error("Must be logged in to create polls");
  }

  const title = formData.get("title") as string;
  const choices = JSON.parse(formData.get("choices") as string);

  if (!title || !choices || choices.length < 2) {
    throw new Error("Poll must have a title and at least 2 choices");
  }

  const poll = await db.poll.create({
    data: {
      title,
      createdBy: ctx.user.id,
      choices: {
        create: choices.map((choice: any) => ({
          text: choice.text,
          emoji: choice.emoji,
          color: choice.color,
        })),
      },
    },
    include: {
      choices: true,
    },
  });

  return poll;
};

export const getPoll = async (pollId: string): Promise<PollWithChoices | null> => {
  const poll = await db.poll.findUnique({
    where: { id: pollId },
    include: {
      choices: {
        include: {
          _count: {
            select: { votes: true },
          },
        },
      },
    },
  });

  if (!poll) return null;

  return {
    id: poll.id,
    title: poll.title,
    createdAt: poll.createdAt,
    choices: poll.choices.map((choice) => ({
      id: choice.id,
      text: choice.text,
      emoji: choice.emoji,
      color: choice.color,
      voteCount: choice._count.votes,
    })),
  };
};

export const getUserPolls = async (userId: string) => {
  return await db.poll.findMany({
    where: { createdBy: userId },
    include: {
      choices: {
        include: {
          _count: {
            select: { votes: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const vote = async (choiceId: string, voterIdentifier: string) => {
  // First, check if this voter has already voted on this poll
  const choice = await db.choice.findUnique({
    where: { id: choiceId },
    include: { poll: true },
  });

  if (!choice) {
    throw new Error("Choice not found");
  }

  // Remove any existing vote from this voter for this poll
  const existingVotes = await db.vote.findMany({
    where: {
      voterIdentifier,
      choice: {
        pollId: choice.pollId,
      },
    },
  });

  // Delete existing votes (toggle behavior)
  await db.vote.deleteMany({
    where: {
      voterIdentifier,
      choice: {
        pollId: choice.pollId,
      },
    },
  });

  // If they didn't vote for this choice before, add the vote
  const votedForThisChoice = existingVotes.some(vote => vote.choiceId === choiceId);
  
  if (!votedForThisChoice) {
    await db.vote.create({
      data: {
        choiceId,
        voterIdentifier,
      },
    });
  }
};