import {
   DUMMY_USER,
   DUMMY_ACHIEVEMENTS,
   DUMMY_CREDENTIALS,
   DUMMY_COMPLETED_COURSES,
   DUMMY_LEADERBOARD,
   DUMMY_COURSE_FILTERS,
   type Achievement,
   type Credential,
   type CompletedCourse,
   type LeaderboardUser,
   type CourseFilter
} from "~/lib/dummy-data";

/**
 * Utility to simulate network delays
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Mock API Service for User Data
 * 
 * Replace these returning functions with actual `fetch` or SDK calls 
 * when the backend API is ready.
 */
export const dataService = {

   /**
    * Fetch user achievements
    */
   async getUserAchievements(username?: string): Promise<Achievement[]> {
      await delay(400);
      return DUMMY_ACHIEVEMENTS;
   },

   /**
    * Fetch user on-chain credentials
    */
   async getUserCredentials(username?: string): Promise<Credential[]> {
      await delay(700);
      return DUMMY_CREDENTIALS;
   },

   /**
    * Fetch user completed courses
    */
   async getCompletedCourses(username?: string): Promise<CompletedCourse[]> {
      await delay(500);
      return DUMMY_COMPLETED_COURSES;
   },

   /**
    * Fetch the global leaderboard
    */
   async getLeaderboard(period: string = "all-time"): Promise<LeaderboardUser[]> {
      await delay(800);
      return DUMMY_LEADERBOARD;
   },

   /**
    * Fetch course filters
    */
   async getCourseFilters(): Promise<CourseFilter[]> {
      await delay(200);
      return DUMMY_COURSE_FILTERS;
   }
};
