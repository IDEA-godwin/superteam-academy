import { type SchemaTypeDefinition } from 'sanity'
import track from './track'
import lesson from './lesson'
import course from './course'
import module from './module'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [track, module, lesson, course],
}
