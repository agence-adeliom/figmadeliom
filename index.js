import axios from "axios";
import fs from 'fs';

import {sleep, checkFolders, rgbToHex} from "./utils/tools.js";

const FIGMA_PERSONAL_TOKEN = '187690-d9b36d79-1b27-4182-9376-abeb826e7278'; //access token
const FILE_KEY= "S5Y6JWXsg6fQhwercFaNd0"; //

const ICONS_NODE_ID = "2%3A200";

const COLORS_NODE_ID = "2%3A359";


const BASE_URL = `https://api.figma.com/v1`;

const FILE_URL = `${BASE_URL}/files/${FILE_KEY}/nodes?ids={nodeId}`;
const IMAGE_URL = `${BASE_URL}/images/${FILE_KEY}/?ids={nodeId}`;

const STYLE_URL = `${BASE_URL}/styles/${FILE_KEY}/`;

const DELAY = 1000;//in ms


const OUTPUT_FOLDER = './out';

const HEADERS = {
    "X-Figma-Token": FIGMA_PERSONAL_TOKEN
};

const ELEMENT_TYPE = {
    ELLIPSE: 'ELLIPSE',
};



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

                fs.writeFile(`${folder}/${fileName}.svg`, response.data, (err) => {
                    console.log(`${folder}/${fileName}.svg successfully created!`);
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
            await sleep(DELAY);
        }

    }).catch(e => {
        console.error("ERROR");
    });

}

export const getColors = async () => {
    let colors = [];
     await getNode(COLORS_NODE_ID).then(async (response) => {
        let styles = response.data.nodes[decodeURIComponent(COLORS_NODE_ID)].styles;
        for(let nodeId of Object.keys(styles)){
             let col = await getNode(nodeId).then(async (response) => {
                let nodeInfo = response.data.nodes[decodeURIComponent(nodeId)].document;
                //colors: solid : type
                if(!nodeInfo.style && !nodeInfo.effects.length && nodeInfo.fills && nodeInfo.fills[0]) {

                    if('SOLID' === nodeInfo.fills[0].type) {

                        const color = nodeInfo.fills[0].color;
                        return Promise.resolve({
                            name: nodeInfo.name,
                            color: rgbToHex(color.r * 255, color.g * 255, color.b * 255)
                        });
                    }
                    else if('GRADIENT_LINEAR' === nodeInfo.fills[0].type) {

                        return Promise.resolve({
                            name: nodeInfo.name,
                            color: getGradient(nodeInfo.fills[0].gradientHandlePositions, nodeInfo.fills[0].gradientStops)
                        });
                    }
                }


                return Promise.resolve();
            });
            if(col) {
                colors.push(col);
            }
            sleep(100);
        }
        return Promise.resolve();
    });

     console.log(colors);

    return colors;
}

//gradient

const getGradient = (gradientHandles, colors) => {
    const angle = calculateAngle(gradientHandles[0], gradientHandles[1]);

    const gradient = [`${angle}deg`];
    for(let color of colors) {
        gradient.push(`${rgbToHex(color.color.r * 255 ,color.color.g * 255 ,color.color.b * 255)} ${floatToPercent(color.position)}`);
    }

    return gradient.join(', ');
};

const calculateAngle = (start, end) => {
    const radians = Math.atan(calculateGradient(start, end))
    return parseInt(radToDeg(radians).toFixed(1))
}

const calculateGradient = (start, end) => {
    return (end.y - start.y) / (end.x - start.x) * -1
}

const radToDeg = (radian) => {
    return (180 * radian) / Math.PI;
}

const floatToPercent = (value) => {
    return (value *= 100).toFixed(0) + "%";
}
