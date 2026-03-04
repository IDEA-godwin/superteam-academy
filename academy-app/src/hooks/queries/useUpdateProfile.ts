import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UpdateProfilePayload {
   name?: string;
   bio?: string;
   twitter?: string;
   github?: string;
   website?: string;
   skills?: Record<string, number>;
}

export function useUpdateProfile(walletAddress?: string | null) {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async (data: UpdateProfilePayload) => {
         const walletParam = walletAddress ? `?wallet=${walletAddress}` : '';
         const res = await fetch(`/api/user/profile${walletParam}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
         });

         if (!res.ok) {
            throw new Error('Failed to update profile');
         }

         return res.json();
      },
      onSuccess: () => {
         // Invalidate the cache to instantly refetch the updated data everywhere
         queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      },
   });
}
