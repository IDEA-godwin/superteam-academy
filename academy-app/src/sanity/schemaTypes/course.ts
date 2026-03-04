import { defineField, defineType } from 'sanity'

export default defineType({
   name: 'course',
   title: 'Course',
   type: 'document',
   fields: [
      // Basic Metadata
      defineField({
         name: 'courseId',
         title: 'Course ID',
         type: 'string',
         description: 'Unique identifier for the course (often matching on-chain ID)',
         validation: (Rule) => Rule.required(),
      }),
      defineField({
         name: 'title',
         title: 'Course Title',
         type: 'string',
         validation: (Rule) => Rule.required(),
      }),
      defineField({
         name: 'slug',
         title: 'Slug',
         type: 'slug',
         options: { source: 'title' },
         validation: (Rule) => Rule.required(),
      }),
      defineField({
         name: 'description',
         title: 'Description',
         type: 'text',
         rows: 3,
      }),
      defineField({
         name: 'thumbnail',
         title: 'Thumbnail',
         type: 'image',
         options: { hotspot: true },
         validation: (Rule) => Rule.custom(async (value, context) => {
            if (!value || !value.asset || !value.asset._ref) return true;
            const client = context.getClient({ apiVersion: '2024-01-01' });
            const asset = await client.getDocument(value.asset._ref);
            if (asset && asset.size > 10240) { // 10KB = 10 * 1024 bytes
               return 'Thumbnail file size must strictly be less than 10KB.';
            }
            return true;
         })
      }),

      // Creator Object (ICreator)
      defineField({
         name: 'creator',
         title: 'Creator Information',
         type: 'object',
         fields: [
            { name: 'creatorName', type: 'string', title: 'Name' },
            { name: 'creatorPubKey', type: 'string', title: 'Solana Public Key' },
         ],
      }),

      // Curriculum (Modules & Lessons)
      defineField({
         name: 'modules',
         title: 'Course Modules',
         type: 'array',
         of: [{ type: 'module' }], // Reference to your module object
      }),
      defineField({
         name: 'lessonCount',
         title: 'Total Lessons',
         type: 'number',
         description: 'Calculated count of lessons across all modules',
      }),

      // Track & Difficulty
      defineField({
         name: 'difficulty',
         title: 'Difficulty Level',
         type: 'string',
         options: {
            list: [
               { title: 'Beginner', value: 'BEGINNER' },
               { title: 'Intermediate', value: 'INTERMEDIATE' },
               { title: 'Advanced', value: 'ADVANCED' },
            ],
         },
      }),
      defineField({
         name: 'track',
         title: 'Track Info',
         type: 'track', // Reference to your track object
      }),

      // Prerequisites (Self-referencing array)
      defineField({
         name: 'prerequisite',
         title: 'Prerequisites',
         type: 'array',
         of: [{ type: 'reference', to: [{ type: 'course' }] }],
         description: 'Courses required before starting this one',
      }),

      // Rewards & Logic
      defineField({
         name: 'xpPerLesson',
         title: 'XP Per Lesson',
         type: 'number',
         initialValue: 100,
      }),
      defineField({
         name: 'creatorRewardXp',
         title: 'Creator Reward XP',
         type: 'number',
      }),
      defineField({
         name: 'minCompletionsForReward',
         title: 'Min Completions for Reward',
         type: 'number',
      }),
   ],
})