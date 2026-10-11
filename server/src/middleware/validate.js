/**
 * Request validation middleware using Zod
 * @param {import('zod').ZodSchema} schema
 * @param {'body' | 'query' | 'params'} source
 */
export function validate(schema, source = 'body') {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync(req[source])
      req[source] = parsed
      next()
    } catch (error) {
      next(error)
    }
  }
}

export default validate
