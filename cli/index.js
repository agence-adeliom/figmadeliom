import program from 'commander';

import {getPackage, configurationIsComplete} from "../config.js";

const {bin, name: packageName, version} = getPackage();

import {getIcons} from "../lib/icons.js";
import {buildFile} from '../lib/sass-variables.js';

const getCommandName = () => {
    return (bin && Object.keys(bin)[0]) || packageName;
};


export const cli = async () => {
    program
        .name(getCommandName())
        .version(version)
        .command('icons')
        .description('Download icons from Figma Stylesheet')
        .action((file, options) => {
            if(configurationIsComplete()) {
                getIcons();
            }
        });
    program.command('sass')
        .description('Build Sass colors variables files from Figma Stylesheet')
        .option('--no-colors', 'Do not add colors')
        .option('--no-fonts', 'Do not add fonts')
        .action((options) => {
            console.log(options);
            if(configurationIsComplete()) {
                buildFile(options.colors, options.fonts);
            }
        });


    program.parse(process.argv);
};
