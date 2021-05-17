import axios from "axios";
import fs from 'fs';

import {sleep, checkFolders, rgbToHex, getGradient} from "./utils/tools.js";

const FIGMA_PERSONAL_TOKEN = '187690-d9b36d79-1b27-4182-9376-abeb826e7278'; //access token
const FILE_KEY= "S5Y6JWXsg6fQhwercFaNd0"; //


const BASE_URL = `https://api.figma.com/v1`;
const FILE_URL = `${BASE_URL}/files/${FILE_KEY}/nodes?ids={nodeId}`;
const IMAGE_URL = `${BASE_URL}/images/${FILE_KEY}/?ids={nodeId}`;
const STYLE_URL = `${BASE_URL}/styles/${FILE_KEY}/`;


const ICONS_NODE_ID = "2%3A200";
const COLORS_NODE_ID = "2%3A359";
const FONTS_NODE_ID = "796%3A32";



const ICON_DOWNLOAD_DELAY = 100;//in ms


const OUTPUT_FOLDER = './out';



const OUTPUT_SASS_FOLDER = './out/sass';
const OUTPUT_SASS_FILENAME = './_variables.scss';


const HEADERS = {
    "X-Figma-Token": FIGMA_PERSONAL_TOKEN
};

const ELEMENT_TYPE = {
    ELLIPSE: 'ELLIPSE',
};

const COLOR_TYPE = {
    SOLID: 'SOLID',
    GRADIENT_LINEAR: 'GRADIENT_LINEAR',
}



const getNodeUrl = (nodeId) => {
    let url = FILE_URL.replace('{nodeId}', nodeId);
    return url;
}

const getStyleUrl = () => {
    let url = STYLE_URL;
    return url;
}

const getImageUrl = (nodeId, format = 'svg') => {
    let url = IMAGE_URL.replace('{nodeId}', encodeURIComponent(nodeId));
    if(format) {
        url += `&format=${format}`;
    }
    return url;
}

const getNode = (nodeId) => {
    return axios.get(getNodeUrl(nodeId), {
        headers: HEADERS
    });
}

const getImage = (nodeId, format = 'svg') => {

    return axios.get(getImageUrl(nodeId, format), {
        headers: HEADERS
    });
}

const getStyle = () => {
    return axios.get(getStyleUrl(), {
        headers: HEADERS
    });
}


const downloadIcon = (icon) => {

    if(icon.name) {
        const iconId = icon.id;
        const folders = icon.name.split('/');
        const fileName = folders.pop();
        return getImage(iconId).then(r2 => {
            axios.get(r2.data.images[iconId]).then(response => {
                let folder = checkFolders([OUTPUT_FOLDER, folders.join('/')].join('/'));
                const file = `${folder}/${fileName}.svg`;
                fs.writeFile(file, response.data, (err) => {
                    console.log(`${file} successfully created!`);
                });
            })
        });
    }
};


export const getIcons = () => {

    getNode(ICONS_NODE_ID).then(async (response) => {

        let icons = response.data.nodes[decodeURIComponent(ICONS_NODE_ID)].document.children;

        for(let icon of icons) {
            await downloadIcon(icon);
            await sleep(ICON_DOWNLOAD_DELAY);
        }

    }).catch(e => {
        console.error("ERROR");
    });

}

const getColors = async () => {
    let colors = [];
     await getNode(COLORS_NODE_ID).then(async (response) => {
        let styles = response.data.nodes[decodeURIComponent(COLORS_NODE_ID)].styles;
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
                colors.push(col);
            }
            sleep(50);
        }
        return Promise.resolve();
    });
    return colors;
}

export const buildColors = async () => {

  let contentArr = [
      `/* Updated at ${new Date().toUTCString()}*/` + '\n',
      '/* ===================\n' +
      '\t    Colors (Same variables as Figma)\n' +
      '/* ===================*/\n'
  ];

  const colorValues = await getColors();

  if(!colorValues.length) {
      console.log(`no color found, script aborded.`);
      return;
  }

  let gradients = [];
  let colors = [];
  let colorsMap = [];

  for(const color of colorValues) {
      const row = `$${color.name}: ${color.color};`;
      if(color.gradient) {
          gradients.push(row);
          continue;
      }
      colors.push(row);
      colorsMap.push(`\t${color.name}: $${color.name},`)
  }
  colors.sort();
  contentArr = contentArr.concat(colors);

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

  let folder = checkFolders(OUTPUT_SASS_FOLDER);

  const file = `${folder}/${OUTPUT_SASS_FILENAME}`;

  fs.writeFile(file, content, (err) => {
      console.log(`${file} successfully created!`);
  });

};



export const getFonts = async () => {
    let colors = [];
    await getNode(FONTS_NODE_ID).then(async (response) => {
        let styles = response.data.nodes[decodeURIComponent(FONTS_NODE_ID)].styles;
        console.log(styles)
    });
    return colors;
}
