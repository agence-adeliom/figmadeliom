import colors from "colors";

import {getConfiguration} from '../config.js';
import {getNode, ELEMENT_TYPE} from '../utils/figma.js';
import {saveFile, indexToName, getNameFromPath, sleep} from "../utils/tools.js";

import {figmaNameToMixin, objectToStyle, styleToScss} from "../utils/typography.js";
import {getFonts} from "./fonts.js";


const configuration = getConfiguration();

const getOutputHeadingFile = () => {
    return configuration.outputHeadingFile;
};
const getOutputTextsFile = () => {
    return configuration.outputTextsFile;
};

const getTypography = async () => {

    let typos = [];

    const typoNodeId = configuration.node_ids.typography;

    await getNode(typoNodeId).then(async (response) => {
        let styles = response.data.nodes[decodeURIComponent(typoNodeId)].styles;

        for(let nodeId of Object.keys(styles)) {
            let typo = await getNode(nodeId).then(async (response) => {
                let nodeInfo = response.data.nodes[decodeURIComponent(nodeId)].document;
                if(ELEMENT_TYPE.TEXT === nodeInfo.type && nodeInfo.style) {
                    const nameArr = nodeInfo.name.split('>');
                    const breakpoint = nameArr.length > 1 ? nameArr.pop() : '';
                    const simpleName = getNameFromPath(nameArr[0]);
                    return Promise.resolve({
                        name: simpleName,
                        breakpoint: breakpoint,
                        style: nodeInfo.style
                    });
                }
                return Promise.resolve();
            });
            if(typo) {
                typos.push(typo);
            }
            sleep(configuration.downloadDelay);
        }
        let organized = {};
        for(let typo of typos){
            const name = figmaNameToMixin(typo.name);
            if(!organized[name]){
                organized[name] = {};
            }
            organized[name][typo.breakpoint] = typo.style;
        }
        typos = organized;

        return Promise.resolve();
    });

    return typos;
}

export const buildTypography = async (addTexts = true, addHeading = true) => {
    const heading = {};
    const texts = {};
    console.log(`Starting typography data fetching from API`);

    const typoValues = await getTypography();
    for(let name in typoValues) {
        if(name.indexOf('p') !== -1) {
            texts[name] = typoValues[name];
            continue;
        }
        heading[name] = typoValues[name];
    }

    console.log(colors.green(`Typography successfully fetched, starting treatment.`));

    console.log(`Starting fonts fetching from API`);
    const fontsValues = await getFonts();
    let fonts = {};
    for(const [i,font] of fontsValues.entries()) {
        fonts[font.name] = `$font-${indexToName(i)}`;
    }

    if(addHeading) {
        buildFile(heading, fonts, getOutputHeadingFile());
    }
    if(addTexts) {
        buildFile(texts, fonts, getOutputTextsFile(), true);
    }


};

const buildFile = (styleObj, fonts, path, mixin = false) => {
    let headingCss = [];
    for(let name in styleObj) {
        let pre = mixin ? '@mixin ' : '%';
        let style = objectToStyle(styleObj[name]);
        let scss = styleToScss(style, fonts);
        headingCss.push(`${pre}${name}{`);
        headingCss.push(`${scss}`);
        headingCss.push(`}`);
    }
    saveFile(headingCss.join('\n'), path, (file, error) => {
        console.log(colors.green(`${file} successfully created!`));
    });
};

