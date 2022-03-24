import * as z from 'zod'

export type MappingItem = z.infer<typeof MappingItemShape>
const MappingItemShape = z.object({
    from: z.string(),
    to: z.string()
})

export type Credential = z.infer<typeof CredentialShape>
const CredentialShape = z.object({
    apiKey: z.string(),
    siteId:  z.string(),
})

export type Config = z.infer<typeof ConfigShape>
const ConfigShape = z.object({
    parallelism: z.number(),
    userId: z.string(),
    mappings: z.array(MappingItemShape),
    credential: CredentialShape
})

export const parseConfig = (configShape: unknown) => {
    return ConfigShape.parse(configShape)
}