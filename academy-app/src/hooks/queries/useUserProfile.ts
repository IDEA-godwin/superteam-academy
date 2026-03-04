import { useQuery } from '@tanstack/react-query';

export function useUserProfile(walletAddress?: string | null) {
   return useQuery({
      queryKey: ['userProfile', walletAddress],
      queryFn: async () => {
         const walletParam = walletAddress ? `?wallet=${walletAddress}` : '';
         const res = await fetch(`/api/user/profile${walletParam}`);

         if (!res.ok) {
            if (res.status === 404) return null; // Expected if user literally doesn't exist
            if (res.status === 401) throw new Error('Unauthorized');
            throw new Error('Failed to fetch user profile');
         }

         return res.json();
      },
      // If we don't have a wallet to search for, and the user isn't logged in via NextAuth,
      // the API might bounce them or grab the NextAuth session server-side.
      // We'll let it fetch at least once so NextAuth can be checked.
      retry: 1,
      staleTime: 1000 * 60 * 5, // Cache for 5 minutes
   });
}
