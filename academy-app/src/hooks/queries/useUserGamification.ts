import { useQuery } from '@tanstack/react-query';
import { dataService } from '~/services/data.service';

export function useUserGamification() {
   return useQuery({
      queryKey: ['userGamification'],
      queryFn: async () => {
         const [achievements, credentials, completedCourses] = await Promise.all([
            dataService.getUserAchievements(),
            dataService.getUserCredentials(),
            dataService.getCompletedCourses(),
         ]);

         return { achievements, credentials, completedCourses };
      },
      staleTime: 1000 * 60 * 30, // Mock data changes rarely, cache for 30m
   });
}
