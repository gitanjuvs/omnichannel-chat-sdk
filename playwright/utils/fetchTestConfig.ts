import fs from 'fs';
import path from 'path';
import YAML from 'yaml';

const fetchTestConfig = () => {
    if (process.env.testConfig) {
        return JSON.parse(process.env.testConfig);
    }

    const testConfigFilePath = path.join(path.dirname(__dirname), 'test.config.sample.yml');
    // console.log(testConfigFilePath);
    let testConfig = null;
    try {
        const fileData = fs.readFileSync(testConfigFilePath, 'utf8');
        // console.log(fileData);
        testConfig = YAML.parse(fileData);
        // console.log(testConfig)
    } catch {
        console.log("Catch Block Start")
        throw new Error(`Unable to process test config file ${testConfigFilePath}`);
    }

    if (!testConfig) {
        console.log("File is empty")
        throw new Error('Test config file is empty');
    }

    return testConfig;
};

export default fetchTestConfig;