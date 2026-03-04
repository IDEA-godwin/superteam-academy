import { sign, verify } from "jsonwebtoken";
import { JSONFilePreset } from 'lowdb/node';
import path from 'path';
import fs from 'fs';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "fallback_secret_for_development";
const JWT_EXPIRES_IN = "7d";

export interface UserDBRecord {
   id: string; // Internal DB Primary Key
   email?: string;
   publicKey?: string; // Base58 Solana wallet address
   name?: string;
   avatar?: string;
   level?: number;
   rank?: number;
   xp?: number;
   streak?: number;
   bio?: string;
   twitter?: string;
   github?: string;
   website?: string;
   skills?: Record<string, number>;
   createdAt: Date;
   updatedAt: Date;
}

export interface UserSessionPayload {
   userId: string;
   email?: string;
   publicKey?: string;
}

type DatabaseSchema = {
   users: UserDBRecord[];
}

export class UserService {
   // LowDB instance promise
   private dbPromise: ReturnType<typeof JSONFilePreset<DatabaseSchema>>;

   constructor() {
      // Ensure data directory exists
      const dataDir = path.join(process.cwd(), '.data');
      if (!fs.existsSync(dataDir)) {
         fs.mkdirSync(dataDir, { recursive: true });
      }

      const file = path.join(dataDir, 'db.json');
      const defaultData: DatabaseSchema = { users: [] };
      this.dbPromise = JSONFilePreset(file, defaultData);
   }

   /**
    * Returns the initialized LowDB instance
    */
   private async getDb() {
      return await this.dbPromise;
   }

   /**
    * MOCK DATABASE: In a real implementation, this would be Prisma, Drizzle, or Mongoose.
    * Currently powered by LowDB for JSON persistence.
    */
   public async getUser(id: string): Promise<UserDBRecord | null> {
      const db = await this.getDb();
      return db.data.users.find(u => u.id === id) || null;
   }

   public async getUserByEmail(email: string): Promise<UserDBRecord | null> {
      const db = await this.getDb();
      return db.data.users.find(u => u.email === email) || null;
   }

   public async getUserByWallet(publicKey: string): Promise<UserDBRecord | null> {
      const db = await this.getDb();
      return db.data.users.find(u => u.publicKey === publicKey) || null;
   }

   private async dbCreateUser(data: Partial<UserDBRecord>): Promise<UserDBRecord> {
      const db = await this.getDb();
      const newUser: UserDBRecord = {
         id: `usr_${Date.now()}`,
         level: 0,
         rank: 0,
         xp: 0,
         streak: 0,
         skills: {},
         ...data,
         createdAt: new Date(),
         updatedAt: new Date(),
      } as UserDBRecord;

      db.data.users.push(newUser);
      await db.write();

      return newUser;
   }

   public async updateUser(id: string, data: Partial<UserDBRecord>): Promise<UserDBRecord> {
      const db = await this.getDb();
      const userIndex = db.data.users.findIndex(u => u.id === id);

      if (userIndex === -1) {
         throw new Error(`User with ID ${id} not found`);
      }

      const updatedUser = {
         ...db.data.users[userIndex],
         ...data,
         updatedAt: new Date(),
      };

      db.data.users[userIndex] = updatedUser;
      await db.write();

      return updatedUser;
   }



   // ─── AUTHENTICATION FLOWS ──────────────────────────────────────────────────

   /**
    * Handles a Web2 OAuth Login (Google/Github)
    */
   public async handleOAuthLogin(email: string, name?: string, avatar?: string, github?: string, token?: string): Promise<{ user: UserDBRecord, token: string }> {
      let user: UserDBRecord | null = null;

      if (token) {
         const decoded = this.verifyToken(token);
         if (decoded?.userId) {
            const user = await this.getUser(decoded.userId);
            if (user) return { user: await this.linkOAuth(user.id, email, name, avatar, github), token };
         }
      }

      user = await this.getUserByEmail(email) || await this.dbCreateUser({ email, name, avatar, github })
      if (github && !user.github)
         user = await this.updateUser(user.id, { github });

      const newToken = this.generateToken(user);
      return { user, token: newToken };
   }

   /**
    * Handles a Web3 SIWS (Sign-In With Solana) Login
    */
   public async handleWalletLogin(publicKey: string, token?: string): Promise<{ user: UserDBRecord, token: string }> {
      let user: UserDBRecord | null = null;

      // 1. Try to link to existing session if token is provided
      if (token) {
         const decoded = this.verifyToken(token);
         if (decoded?.userId) {
            user = await this.getUser(decoded.userId);
            if (user) {
               console.log(`[UserService] Token detected. Linking Wallet ${publicKey} to existing user ${user.id}`);
               return { user: await this.linkWallet(user.id, publicKey), token };
            }
         }
      }

      // 2. If no valid token / user not found, try to find by wallet
      user = await this.getUserByWallet(publicKey) || await this.dbCreateUser({ publicKey });

      const newToken = this.generateToken(user);
      return { user, token: newToken };
   }

   /**
    * Links a Wallet to an existing Web2 User account
    */
   public async linkWallet(userId: string, publicKey: string): Promise<UserDBRecord> {
      console.log(`[UserService] Linking wallet ${publicKey} to user ${userId}`);
      const user = await this.getUser(userId);
      if (!user) throw new Error(`[UserService] User ${userId} not found during wallet link`);
      return await this.updateUser(userId, { publicKey });
   }

   /**
    * Links an Email (OAuth) to an existing Web3 User account
    */
   public async linkOAuth(userId: string, email: string, name?: string, avatar?: string, github?: string): Promise<UserDBRecord> {
      console.log(`[UserService] Linking OAuth identity ${email} to user ${userId}`);

      const user = await this.getUser(userId);
      if (!user) throw new Error(`[UserService] User ${userId} not found during OAuth link`);

      const updateData: Partial<UserDBRecord> = { email };

      // Only attach these properties if the existing user does NOT already have them
      if (name && !user.name) updateData.name = name;
      if (avatar && !user.avatar) updateData.avatar = avatar;
      if (github && !user.github) updateData.github = github;

      return await this.updateUser(userId, updateData);
   }
   // ─── JWT MANAGEMENT ────────────────────────────────────────────────────────

   /**
    * Generates a stateless JWT for the authenticated user session
    */
   public generateToken(user: UserDBRecord): string {
      const payload: UserSessionPayload = {
         userId: user.id,
         email: user.email,
         publicKey: user.publicKey,
      };

      return sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
   }

   /**
    * Verifies and decodes a user's JWT session token
    */
   public verifyToken(token: string): UserSessionPayload | null {
      try {
         const decoded = verify(token, JWT_SECRET) as UserSessionPayload;
         return decoded;
      } catch (error) {
         console.error("[UserService] JWT Verification Failed:", error);
         return null;
      }
   }
}

// Export a singleton instance
export const userService = new UserService();
