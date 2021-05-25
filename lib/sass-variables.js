import colors from "colors";
import fs from 'fs';

import inquirer from 'inquirer';


import {checkFolders, indexToName} from "../utils/tools.js";
import {getFontStack} from "../utils/typography.js";

import {getColors} from "./colors.js";
import {getFonts} from "./fonts.js";
import {getConfiguration} from "../config.js";

const configuration = getConfiguration();

const getOutputSassFile = () => {
    return configuration.outputSassFile;
};

export const buildFile = async (addColors = true, addFonts = true) => {


    let contentArr = [`/* Updated at ${new Date().toUTCString()}*/` + '\n'];

    if(addColors) {
        contentArr.push('/* ===================\n');
        contentArr.push('\t    Colors (Same variables as Figma)\n');
        contentArr.push('/* ===================*/\n');

        console.log(colors.blue(`Starting colors fetching from API`));

        const colorValues = await getColors();

        console.log(colors.green(`Colors successfully fetched, starting treatment.`));

        if (colorValues.length) {
            let gradients = [];
            let sassColors = [];
            let colorsMap = [];

            for (const color of colorValues) {
                const row = `$${color.name}: ${color.color};`;
                if (color.gradient) {
                    gradients.push(row);
                    continue;
                }
                sassColors.push(row);
                colorsMap.push(`\t${color.name}: $${color.name},`)
            }
            sassColors.sort();
            contentArr = contentArr.concat(sassColors);

            //put gradients after colors var
            if (gradients.length) {
                gradients.unshift('\n');
                contentArr = contentArr.concat(gradients);
            }

            colorsMap.sort();
            colorsMap.unshift('\n//generate classes colors & bg (.color-secondary-01, .bg-secondary-01)\n$colors: (');
            colorsMap.push(');')
            contentArr = contentArr.concat(colorsMap);
        } else {
            console.log(colors.red(`no color found, script aborded.`));
        }
    }

    console.log(colors.blue(`Starting fonts fetching from API`));

    const fontsValues = await getFonts();

    console.log(colors.green(`${fontsValues.length} fonts successfully fetched, starting treatment.`));
    if(fontsValues.length) {
        //fonts
        contentArr.push('\n\n/* ===================');
        contentArr.push('Fonts');
        contentArr.push('/* ===================*/\n');

        let questionForSerif = [];

        for(const [i,font] of fontsValues.entries()) {
            questionForSerif.push(
                { type: 'confirm', name: font.name, message: `${font.name} is sans-serif and use system bases stack?`, default: true },
            );
        }
        inquirer
        .prompt(questionForSerif)
        .then(function (answers) {
            for(let [i,name] of Object.keys(answers).entries()) {
                //@TODO ask for font stack if not sytem based
                const row = `$font-${indexToName(i)}: ${name}, ${getFontStack(!answers[name])};`;
                contentArr.push(row);
            }
            saveFile(contentArr);
        })

    }
    else{
        console.log(colors.red(`no font founded`));
        saveFile(contentArr);
    }


};

const saveFile = (contentArr) => {

    //end treatment
    const content = contentArr.join('\n');

    let folders = getOutputSassFile().split('/');
    folders.pop();

    checkFolders(folders.join('/'));

    const file = getOutputSassFile();

    fs.writeFile(file, content, (err) => {
        console.log(colors.green(`${file} successfully created!`));
    });

}
