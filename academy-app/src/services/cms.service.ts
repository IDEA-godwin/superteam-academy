export interface ICourseMetadata {
   id: string;
   title: string;
   description: string;
   slug: string;
}

export interface ICMSProvider {
   getCourseMetadata(slug: string): Promise<ICourseMetadata | null>;
   getCourseLessons(slug: string): Promise<any[]>;
   getFeaturedCourses(): Promise<ICourseMetadata[]>;
}

/**
 * Standard interface for the future Headless CMS (Sanity / Strapi).
 * Ready to be swapped in when the external infrastructure is provisioned.
 */
export const cmsService: ICMSProvider = {
   async getCourseMetadata(slug: string) {
      // TODO: Replace with generic REST or GraphQL fetch covering Sanity/Strapi schemas
      return null;
   },
   async getCourseLessons(slug: string) {
      // TODO: Replace with generic REST or GraphQL fetch
      return [];
   },
   async getFeaturedCourses() {
      // TODO: Replace with generic REST or GraphQL fetch
      return [];
   }
}
