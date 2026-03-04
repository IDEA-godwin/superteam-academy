// import { WebIrys } from "@irys/sdk";
import { base64 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { ICourseContent } from "~/types/course";

export const uploadCourseContent = async (courseContent: ICourseContent, walletContext: any): Promise<Uint8Array> => {
   // Initialize WebIrys using the standard Solana wallet adapter
   // const irys = new WebIrys({
   //    network: "devnet", // Devnet provides free uploads for sub-100kb payloads
   //    token: "solana",
   //    wallet: { provider: walletContext, rpcUrl: "https://api.devnet.solana.com" },
   // });

   // await irys.ready();

   // // Serialize to strict JSON
   // const serializedData = JSON.stringify(courseContent);

   // // Create the payload size check and upload!
   // const receipt = await irys.upload(serializedData, {
   //    tags: [
   //       { name: "Content-Type", value: "application/json" },
   //       { name: "App-Name", value: "Superteam-Academy" },
   //       { name: "Course-Id", value: courseContent.id }
   //    ]
   // });

   // console.log("Irys receipt:", receipt);

   // // The Irys upload receipt `id` is a 43-character Base64Url string matching a 32-byte array.
   // // Anchor expects an Int8Array, so we decode the base64 string to a Buffer (which is extending Uint8Array)
   // // and map it to an Int8Array.
   const byteBuffer = Buffer.from("receipt.id", 'base64url');
   return new Uint8Array(byteBuffer);
};

export async function getCourseContent(txId: number[]) {
   const gateway = "https://gateway.irys.xyz"
   const id = base64.encode(Buffer.from(txId))
   const raw =  await fetch(`${gateway}/${id}`)
   return await raw.json()
}

export function txIdToBytes(txId: string): Uint8Array {
   const base64 = txId.replace(/-/g, "+").replace(/_/g, "/");
   const padded = base64 + "="; // 43 chars + 1 pad = 44 (valid base64 for 32 bytes)
   const byteBuffer = Buffer.from(padded, "base64");
   return new Uint8Array(byteBuffer.subarray(0, 32));
}