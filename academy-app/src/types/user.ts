export interface IUserProfile {
   username: string;
   name: string;
   bio: string;
   avatar: string;
   email: string;
   joinDate: string;
   level: number;
   xp: number;
   rank: number;
   streak: number;
   twitter: string;
   github: string;
   website: string;
   skills: Record<string, number>;
}