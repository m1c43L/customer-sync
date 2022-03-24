import { parseConfig } from './src/config'
import { parseDataJsonFile } from './src/data'
import { sync } from './src/sync'
import { loadJsonSync } from './utils/file'

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

  const result = await sync(parseDataJsonFile(loadJsonSync(dataPath)), parseConfig(loadJsonSync(configPath)))
  console.log(result)
}

run()