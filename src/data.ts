import * as z from 'zod'

export type DataItem = z.infer<typeof DataItemShape>
const DataItemShape = z.object({
    // transforming received value
    // to be unix timestamp
    created_at: z.string().or(z.number()).transform((value) => {
        if (typeof value === 'number') {
            return value
        }
        return (new Date(value).valueOf() / 1000) // convert to epoch seconds
    }).optional(),

}).passthrough()

const DataShape = z.array(DataItemShape)

/**
 * Note: this may transform properties upon validation
 * example:
 * - `created_at` are converted from string to unix timestamp
 * 
 * @param data 
 * @returns 
 */
export const parseDataJsonFile = (data: unknown) => {
    return DataShape.parse(data)
}