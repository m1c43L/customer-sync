import { parseConfig } from './src/config'
import { parseDataJsonFile } from './src/data'
import { sync } from './src/sync'
import { loadJsonSync } from './utils/file'
import cliProgress  from 'cli-progress';

const run = async () => {
    const args = [...process.argv]
    if (args.length < 4) {
        throw new Error('provide data and config: npm start data.json config.json')
    }

    let configPath = args.pop()
    if(!configPath.endsWith('.json')) {
        configPath = `${configPath}.json`
    }

    let dataPath = args.pop()
    if (!dataPath.endsWith('.json')) {
        dataPath = `${dataPath}.json`
    }

    const config = parseConfig(loadJsonSync(configPath))
    const data = parseDataJsonFile(loadJsonSync(dataPath))

    if (config.updateOnly) {
        console.warn('warning: `updateOnly` is enabled, new customers will not be added.')
    }

    const progress = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    progress.start(data.length,  0)
    
    const result = await sync(data,config, (count) => { 
        progress.increment(count)
    })
    progress.stop()

    console.log('synced ', result.length, ' rows')
}

run()