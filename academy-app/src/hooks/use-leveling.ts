import { useQuery } from '@tanstack/react-query';
import { useWallet } from '@solana/wallet-adapter-react';
import { levelingService } from '~/services/leveling.service';

export function useLeveling() {
   const { publicKey } = useWallet();

   const xpQuery = useQuery({
      queryKey: ['xpBalance', publicKey?.toString()],
      queryFn: () => levelingService.getXpBalance(publicKey!),
      enabled: !!publicKey,
   });

   const achieveQuery = useQuery({
      queryKey: ['achievements', publicKey?.toString()],
      queryFn: () => levelingService.getAchievements(publicKey!),
      enabled: !!publicKey,
   });

   const xp = xpQuery.data || 0;
   const level = levelingService.calculateLevel(xp);
   const xpToNext = levelingService.calculateXpToNextLevel(level, xp);

   return {
      xp,
      level,
      xpToNext,
      achievements: achieveQuery.data || [],
      isLoading: xpQuery.isLoading || achieveQuery.isLoading,
      refetch: () => {
         xpQuery.refetch();
         achieveQuery.refetch();
      }
   };
}
