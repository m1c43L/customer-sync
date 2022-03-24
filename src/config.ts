import * as z from 'zod'

export const MappingItemShape = z.object({
    from: z.string(),
    to: z.string()
})

export const ConfigShape = z.object({
    parallelism: z.number(),
    userId: z.string(),
    mappings: z.array(MappingItemShape),
    apiKey: z.string()
})