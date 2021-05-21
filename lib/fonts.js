import {getConfiguration} from '../config.js';
import {getNode, ELEMENT_TYPE} from '../utils/figma.js';
import {sleep} from "../utils/tools.js";

import cliProgress from 'cli-progress';

const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

const configuration = getConfiguration();

export const getFonts = async () => {

    let fonts = [];

    const fontNodeId = configuration.node_ids.fonts;

    await getNode(fontNodeId).then(async (response) => {
        let styles = response.data.nodes[decodeURIComponent(fontNodeId)].styles;

        let total = Object.keys(styles).length;
        let progress = 0;
        progressBar.start( total);

        for(let nodeId of Object.keys(styles)) {
            let font = await getNode(nodeId).then(async (response) => {
                let nodeInfo = response.data.nodes[decodeURIComponent(nodeId)].document;
                //colors: solid : type
                if(ELEMENT_TYPE.TEXT === nodeInfo.type && nodeInfo.style && nodeInfo.style.fontFamily) {
                    return Promise.resolve({
                        name: nodeInfo.style.fontFamily,
                    });
                }
                return Promise.resolve();
            });
            if(font) {
                fonts.push(font);
            }
            progress++;
            progressBar.update(progress);
            sleep(configuration.downloadDelay);
        }
        progressBar.stop();

        return Promise.resolve();
    });
    //filter duplicate
    fonts = fonts.filter((v,i,a) => {
        return a.findIndex(t => (t.name === v.name)) === i
    })
    return fonts;
}
