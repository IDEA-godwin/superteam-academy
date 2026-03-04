'use client';

import { useIsFetching } from '@tanstack/react-query';
import { useAuthenticate } from '~/hooks/use-authenticate';
import LoadingSplash from './LoadingSplash';

export default function GlobalLoader() {
   // Returns the number of active background fetches from tanstack query
   const isFetching = useIsFetching();

   // We still want to respect local auth handshakes
   const { loading: isAuthLoading } = useAuthenticate();

   const isAppLoading = isAuthLoading || isFetching > 0;

   // Optionally only intercept if the page is truly in an initial load state.
   if (!isAppLoading) return null;

   return <LoadingSplash fullScreen={true} message="Loading content..." />;
}
