import axios from "axios";
import fs from 'fs';
import colors from "colors";

import {sleep, checkFolders, rgbToHex, getGradient} from "./utils/tools.js";
import {getConfiguration} from './config.js';
import {getNode, getImage, COLOR_TYPE} from './utils/figma.js'


const ICONS_NODE_ID = "2%3A200";
const COLORS_NODE_ID = "2%3A359";
const FONTS_NODE_ID = "796%3A32";


const configuration = getConfiguration();


//----
const getOutputIconsFolder = () => {
  return configuration.outputIconsDir;
};

const getOutputSassFile = () => {
    return configuration.outputSassFile;
};


const downloadIcon = (icon) => {
    if(icon.name) {
        const iconId = icon.id;
        const folders = icon.name.split('/');
        const fileName = folders.pop();
        return getImage(iconId).then(response => {
            let imageUrl = response.data.images[iconId];
            axios.get(imageUrl).then(response => {
                let folder = checkFolders([getOutputIconsFolder(), folders.join('/')].join('/'));
                const file = `${folder}/${fileName}.svg`;
                fs.writeFile(file, response.data, (err) => {
                    console.log(colors.green(`${file} successfully created!`));
                });
            }).catch(e => {
                console.log(colors.red(`Error fetching image: ${imageUrl}`));
            });
        });
    }
};


export const getIcons = () => {
    if(!configuration.node_ids || !configuration.node_ids.icons){
        console.log(colors.red('Missing node Id for icons, check your config file'));
        return;
    }

    const iconsNodeId = configuration.node_ids.icons;

    getNode(iconsNodeId).then(async (response) => {
        let icons = response.data.nodes[decodeURIComponent(iconsNodeId)].document.children;
        for(let icon of icons) {
            await downloadIcon(icon);
            await sleep(configuration.downloadDelay);
        }
    }).catch(e => {
        console.log(colors.red(`Error fetching Figma API for nodeId: ${nodeId}`));
    });

}

const getColors = async () => {

    if(!configuration.node_ids || !configuration.node_ids.colors){
        console.log(colors.red('Missing node Id for colors, check your config file'));
        return;
    }

    let colorsList = [];

    const colorNodeId = configuration.node_ids.colors;

     await getNode(colorNodeId).then(async (response) => {
        let styles = response.data.nodes[decodeURIComponent(colorNodeId)].styles;
        for(let nodeId of Object.keys(styles)){
             let col = await getNode(nodeId).then(async (response) => {
                let nodeInfo = response.data.nodes[decodeURIComponent(nodeId)].document;
                //colors: solid : type
                if(!nodeInfo.style && !nodeInfo.effects.length && nodeInfo.fills && nodeInfo.fills[0]) {
                    if(COLOR_TYPE.SOLID === nodeInfo.fills[0].type) {
                        const color = nodeInfo.fills[0].color;
                        return Promise.resolve({
                            name: nodeInfo.name,
                            color: rgbToHex(color.r * 255, color.g * 255, color.b * 255)
                        });
                    }
                    else if(COLOR_TYPE.GRADIENT_LINEAR === nodeInfo.fills[0].type) {
                        const gradient = getGradient(nodeInfo.fills[0].gradientHandlePositions, nodeInfo.fills[0].gradientStops);
                        return Promise.resolve({
                            name: nodeInfo.name,
                            color:`linear-gradient(${gradient})`,
                            gradient: true
                        });
                    }
                }
                return Promise.resolve();
            });
            if(col) {
                colorsList.push(col);
            }
            sleep(configuration.downloadDelay);
        }
        return Promise.resolve();
    });
    return colorsList;
}

export const buildColors = async () => {

  let contentArr = [
      `/* Updated at ${new Date().toUTCString()}*/` + '\n',
      '/* ===================\n' +
      '\t    Colors (Same variables as Figma)\n' +
      '/* ===================*/\n'
  ];

  console.log(`Starting colors fetching from API`);

  const colorValues = await getColors();

  console.log(colors.green(`Colors successfully fetched, starting treatment.`));

  if(!colorValues.length) {
      console.log(colors.red(`no color found, script aborded.`));
      return;
  }

  let gradients = [];
  let sassColors = [];
  let colorsMap = [];

  for(const color of colorValues) {
      const row = `$${color.name}: ${color.color};`;
      if(color.gradient) {
          gradients.push(row);
          continue;
      }
      sassColors.push(row);
      colorsMap.push(`\t${color.name}: $${color.name},`)
  }
    sassColors.sort();
  contentArr = contentArr.concat(sassColors);

  //put gradients after colors var
  if(gradients.length){
      gradients.unshift('\n');
      contentArr = contentArr.concat(gradients);
  }

  colorsMap.sort();
  colorsMap.unshift('\n//generate classes colors & bg (.color-secondary-01, .bg-secondary-01)\n$colors: (');
  colorsMap.push(');')
  contentArr = contentArr.concat(colorsMap);

  const content = contentArr.join('\n');

  let folders = getOutputSassFile().split('/');
  folders.pop();

  checkFolders(folders.join('/'));

  const file = getOutputSassFile();

  fs.writeFile(file, content, (err) => {
      console.log(colors.green(`${file} successfully created!`));
  });

};


/*
export const getFonts = async () => {
    let colors = [];
    await getNode(FONTS_NODE_ID).then(async (response) => {
        let styles = response.data.nodes[decodeURIComponent(FONTS_NODE_ID)].styles;
        console.log(styles)
    });
    return colors;
}
*/
