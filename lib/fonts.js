import {getConfiguration} from '../config.js';
import {getNode, ELEMENT_TYPE} from '../utils/figma.js';
import {sleep} from "../utils/tools.js";

const configuration = getConfiguration();

export const getFonts = async () => {

    let fonts = [];

    const fontNodeId = configuration.node_ids.fonts;

    await getNode(fontNodeId).then(async (response) => {
        let styles = response.data.nodes[decodeURIComponent(fontNodeId)].styles;

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
            sleep(configuration.downloadDelay);
        }
        return Promise.resolve();
    });
    //filter duplicate
    fonts = fonts.filter((v,i,a) => {
        return a.findIndex(t => (t.name === v.name)) === i
    })
    return fonts;
}
