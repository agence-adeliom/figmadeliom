import axios from "axios";
import colors from "colors";
import fs from 'fs';

import {getConfiguration} from "../config.js";
import {getImage, getNode} from "../utils/figma.js";
import {checkFolders} from "../utils/tools.js";
import cliProgress from "cli-progress";


const configuration = getConfiguration();

const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);


let progress = 0;
let total = 0;

//----
const getOutputIconsFolder = () => {
    return configuration.outputIconsDir;
};


const downloadIcon = (name, imageUrl) => {

    const folders = name.split('/');
    const fileName = folders.pop();
    return axios.get(imageUrl).then(response => {
        let folder = checkFolders(getOutputIconsFolder());
        //build subfolder inside output folder base on name
        if(configuration.outputIconsKeepFolder) {
            folder = checkFolders([getOutputIconsFolder(), folders.join('/')].join('/'));
        }
        const file = `${folder}/${fileName}.svg`;
        fs.writeFile(file, response.data, (err) => {
           // console.log(colors.green(`${file} successfully created!`));
            progress++;
            progressBar.update(progress);
            if(progress === total){
                progressBar.stop();
            }
        });
    }).catch(e => {
        console.log(colors.red(`Error fetching image: ${imageUrl}`));
        total--;
        if(progress === total){
            progressBar.stop();
        }
    });
};


export const getIcons = () => {
    if(!configuration.node_ids || !configuration.node_ids.icons){
        console.log(colors.red('Missing node Id for icons, check your config file'));
        return;
    }

    const iconsNodeId = configuration.node_ids.icons;
    console.log(colors.blue(`Starting icons fetching from API`));

    getNode(iconsNodeId).then(async (response) => {
        let icons = response.data.nodes[decodeURIComponent(iconsNodeId)].document.children;

        total = Object.keys(icons).length;
        progressBar.start(total);
        let iconIds = [];
        let iconNames = {};
        for(let icon of icons) {
            if(icon.name) {
                iconIds.push(icon.id);
                iconNames[icon.id] = icon.name;
            }
        }
        getImage(iconIds.join(',')).then( async response => {
            for(let iconId in response.data.images) {
                let url = response.data.images[iconId];
                 downloadIcon(iconNames[iconId], url);
            }
        });
    }).catch(e => {
        console.log(colors.red(`Error fetching Figma API for nodeId: ${nodeId}`));
    });

}
