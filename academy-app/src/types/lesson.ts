
export enum LessonType {
   VIDEO = 1, DOCUMENT = 2, CHALLENGE = 3
}

export interface ITestCase {
   input: string;
   expectedOutput: string;
}

/**
 * Shape returned by @sanity/code-input for `type: 'code'` fields.
 * Both starterCode and solutionCode are stored as this object in Sanity.
 */
export interface SanityCodeField {
   _type: "code";
   code: string;
   language: string;
   filename?: string;
}

export interface ILesson {
   lessonId?: number,  // alias lessonIndex
   title: string,
   lessonType: LessonType,
   videoUrl?: string,
   objective?: string,
   /** Portable Text body — rendered via @portabletext/react */
   body?: any[],
   /** Raw markdown body — only for DOCUMENT type, rendered via MarkdownRenderer */
   markdownContent?: string,
   starterCode?: SanityCodeField | string, // string kept for dummy-data backward compat
   solutionCode?: SanityCodeField | string,
   hints?: Array<string>,
   testCases?: Array<ITestCase>,
}