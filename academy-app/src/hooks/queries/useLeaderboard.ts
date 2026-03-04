import { useQuery } from "@tanstack/react-query";
import type { LeaderboardUser } from "~/lib/dummy-data";

export function useLeaderboard(period: string = "all-time", courseId: string = "all") {
   return useQuery({
      queryKey: ["leaderboard", period, courseId],
      queryFn: async () => {
         const searchParams = new URLSearchParams();
         if (period !== "all-time") searchParams.append("period", period);
         if (courseId !== "all") searchParams.append("course", courseId);

         const res = await fetch(`/api/leaderboard?${searchParams.toString()}`);

         if (!res.ok) {
            throw new Error("Failed to fetch leaderboard");
         }

         const data = await res.json();
         return data.leaderboard as LeaderboardUser[];
      },
      staleTime: 1000 * 60 * 5, // 5 minutes cache
   });
}
