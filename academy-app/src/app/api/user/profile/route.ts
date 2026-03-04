import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "~/app/api/auth/[...nextauth]/route";
import { userService } from "~/services/user.service";

export async function GET(req: Request) {
   try {
      const { searchParams } = new URL(req.url);
      const wallet = searchParams.get('wallet');

      const session = await getServerSession(authOptions);

      let dbUser = null;

      // 1. Try resolving via NextAuth session email/id
      if (session?.user?.email) {
         dbUser = await userService.getUserByEmail(session.user.email);
      }
      // 2. Try resolving via provided wallet public key
      else if (wallet) {
         dbUser = await userService.getUserByWallet(wallet);

         // If the user connected a wallet that wasn't previously seen, we auto-create an anonymous wallet user
         // so they have a place to store their xp, stats, etc.
         if (!dbUser) {
            dbUser = await userService.handleWalletLogin(wallet);
         }
      }

      if (!dbUser) {
         return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json({ user: dbUser }, { status: 200 });

   } catch (error) {
      console.error("[Profile API Error]", error);
      return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 });
   }
}

export async function PUT(req: Request) {
   try {
      const { searchParams } = new URL(req.url)
      const wallet = searchParams.get('wallet')

      const session = await getServerSession(authOptions)

      let dbUser = null

      // Authenticate & Link
      if (session?.user?.email) {
         dbUser = await userService.getUserByEmail(session.user.email)

         // If they have a session but NO db record (e.g., dev data got cleared)
         if (!dbUser) {
            const result = await userService.handleOAuthLogin(
               session.user.email,
               session.user.name || undefined,
               session.user.image || undefined
            )
            dbUser = result.user
         }

         // LINKING LOGIC: If a wallet is provided and this Web2 user doesn't have one linked
         if (wallet && dbUser && dbUser.publicKey !== wallet) {
            dbUser = await userService.updateUser(dbUser.id, { publicKey: wallet })
            console.log(`[Profile API] Linked wallet ${wallet} to user ${dbUser.id}`)
         }

      } else if (wallet) {
         dbUser = await userService.getUserByWallet(wallet)

         if (!dbUser) {
            const result = await userService.handleWalletLogin(wallet)
            dbUser = result.user
         }
      }

      if (!dbUser) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      const body = await req.json()

      // Filter out only allowed fields for update
      const allowedUpdates = ["name", "bio", "twitter", "github", "website", "skills"]
      const updateData: any = {}

      for (const key of allowedUpdates) {
         if (body[key] !== undefined) {
            updateData[key] = body[key]
         }
      }

      const updatedUser = await userService.updateUser(dbUser.id, updateData)

      return NextResponse.json({ user: updatedUser }, { status: 200 })

   } catch (error) {
      console.error("[Profile API Error]", error)
      return NextResponse.json({ error: "Failed to update user profile" }, { status: 500 })
   }
}
