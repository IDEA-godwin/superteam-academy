import { PublicKey } from "@solana/web3.js";
import { ILesson } from "./lesson";
import { ITrack } from "./track";
import { BN } from "@coral-xyz/anchor";

export enum Difficulty {
   BEGINNER = 1, INTERMIDIATE = 2, ADVANCE = 3
}

export interface ICreator {
   creatorName: string,
   creatorPubkey?: string,
   creatorPubKey?: string
}

export interface IModule {
   id: number;
   title: string;
   description: string;
   lessons: Array<ILesson>;
}

export interface ICourse {
   courseId: string
   slug: string
   title: string
   description: string
   thumbnail?: string
   creator: ICreator
   lessonCount: number
   modules: Array<IModule>
   difficulty: Difficulty
   xpPerLesson: number
   track: ITrack
   prerequisite: Array<ICourse> | null
   creatorRewardXp: number
   minCompletionsForReward: number
}

export interface ICourseContent {
   id: string;
   slug: string;
   title: string;
   description: string;
   thumbnail?: string;
   creatorName: string;
   difficulty: Difficulty;
   challengeCount: number;
   xpTotal: number;
   duration: string;
   modules: Array<IModule>;
}

export interface ICreateCourse {
   courseId: string,
   creator: PublicKey,
   contentTxId: number[], //arweave tx bytes
   lessonCount: number,
   difficulty: number,
   xpPerLesson: number,
   trackId: number,
   trackLevel: number,
   prerequisite: PublicKey | null,
   creatorRewardXp: number,
   minCompletionsForReward: number,
}

export interface IUpdateCourse {
   newContentTxId: Uint8Array,
   newIsActive: boolean,
   newXpPerLesson: number,
   newCreatorRewardXp: number,
   newMinCompletionsForReward: number,
}

export interface Course {
   courseId: string;
    creator: PublicKey;
    contentTxId: number[];
    version: number;
    lessonCount: number;
    difficulty: number;
    xpPerLesson: number;
    trackId: number;
    trackLevel: number;
    prerequisite: PublicKey | null;
    creatorRewardXp: number;
    minCompletionsForReward: number;
    totalCompletions: number;
    totalEnrollments: number;
    isActive: boolean;
    createdAt: BN;
    updatedAt: BN;
    reserved: number[];
    bump: number;
}

export const buildCreateCourseInterface = (course: ICourse, contentTxId: Uint8Array): ICreateCourse => ({
   contentTxId: Array.from(contentTxId),
   courseId: course.courseId,
   creator: new PublicKey(course.creator.creatorPubKey || course.creator.creatorPubkey || ""),
   lessonCount: course.lessonCount,
   difficulty: course.difficulty,
   xpPerLesson: course.xpPerLesson,
   trackId: course.track.trackId,
   trackLevel: course.track.trackLevel,
   prerequisite: null,
   creatorRewardXp: course.creatorRewardXp,
   minCompletionsForReward: course.minCompletionsForReward,
})