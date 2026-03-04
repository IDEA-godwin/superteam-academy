import { defineField, defineType } from 'sanity'

export default defineType({
   name: 'module',
   title: 'Module',
   type: 'object',
   fields: [
      defineField({
         name: 'id',
         type: 'number',
      }),
      defineField({
         name: 'title',
         type: 'string',
      }),
      defineField({
         name: 'description',
         type: 'text',
      }),
      defineField({
         name: 'lessons',
         type: 'array',
         of: [{ type: 'lesson' }], // Nested lessons
      }),
   ],
})