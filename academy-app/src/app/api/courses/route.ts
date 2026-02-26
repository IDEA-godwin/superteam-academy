import { integrationService } from "~/services/integration";

export async function GET() {

   const courses = await integrationService.getCourses()

   return new Response(JSON.stringify(courses), {
      status: 200,
   })
}