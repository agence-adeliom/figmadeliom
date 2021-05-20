import axios from "axios";
import fs from 'fs';
import colors from "colors";

import {sleep, checkFolders} from "./utils/tools.js";
import {getConfiguration} from './config.js';
import {getNode, getImage} from './utils/figma.js'





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
