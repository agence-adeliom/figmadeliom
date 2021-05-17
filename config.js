import colors from "colors";
import { createRequire } from 'module';

export const CONFIG_FILE = '.configrc.json';


const require = createRequire(import.meta.url);
const  packageData = require('./package.json');
const  defaultConfig = require(`./${CONFIG_FILE}`);

export const configurationIsComplete = () => {
    const config = getConfiguration();

    if (!config.figma_personal_token || !config.figma_personal_token.length) {
        console.log(colors.red("Missing 'figma_personal_token', check your config file."));
        return false;
    }
    if (!config.figma_file_key || !config.figma_file_key.length) {
        console.log(colors.red("Missing 'figma_file_key', check your config file."));
        return false;
    }

    return true
}

const getCustomConfiguration = () => {

    let file = [process.cwd(), CONFIG_FILE].join('/');
    //let file = [process.cwd(), 'tmpconfig.json'].join('/');
    try {
        return require(file);
    }
    catch (e) {
       // console.log(colors.red("No configuration file founded"));
    }

};

export const getConfiguration = () => {

    let configuration = defaultConfig;
    let userConfiguration = getCustomConfiguration();
    if(userConfiguration) {
        configuration = Object.assign(configuration, userConfiguration);
    }
    return configuration;
};

export const getPackage = () => {
    return packageData;
};
