import program from 'commander';

import {getPackage, configurationIsComplete} from "../config.js";

const {bin, name: packageName, version} = getPackage();

import {getIcons, buildColors} from "../index.js";

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
        .description('Build Sass variables files from Figma Stylesheet')
        .action((file, options) => {
            if(configurationIsComplete()) {
                buildColors();
            }
        });

    program.parse(process.argv);
};
