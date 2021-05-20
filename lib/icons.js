import axios from "axios";
import colors from "colors";
import fs from 'fs';

import {getConfiguration} from "../config.js";
import {getImage, getNode} from "../utils/figma.js";
import {checkFolders, sleep} from "../utils/tools.js";


const configuration = getConfiguration();


//----
const getOutputIconsFolder = () => {
    return configuration.outputIconsDir;
};


const downloadIcon = (icon) => {
    if(icon.name) {
        const iconId = icon.id;
        const folders = icon.name.split('/');
        const fileName = folders.pop();
        return getImage(iconId).then(response => {
            let imageUrl = response.data.images[iconId];
            axios.get(imageUrl).then(response => {
                let folder = checkFolders(getOutputIconsFolder());
                if(configuration.outputIconsKeepFolder) {
                    folder = checkFolders([getOutputIconsFolder(), folders.join('/')].join('/'));
                }

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
    console.log(`Starting icons fetching from API`);

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
