import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "~/app/api/auth/[...nextauth]/route";
import { userService } from "~/services/user.service";

export async function POST(req: Request) {
   try {
      const session = await getServerSession(authOptions);
      const { wallet } = await req.json().catch(() => ({ wallet: null }));

      let dbUser = null;

      if (session?.user?.email) {
         dbUser = await userService.getUserByEmail(session.user.email);
      } else if (wallet) {
         dbUser = await userService.getUserByWallet(wallet);
      }

      if (!dbUser) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const updatedUser = await userService.trackActivity(dbUser.id);

      return NextResponse.json({ user: updatedUser }, { status: 200 });

   } catch (error) {
      console.error("[Track Activity Error]", error);
      return NextResponse.json({ error: "Server Error" }, { status: 500 });
   }
}
