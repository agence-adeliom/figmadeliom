import {getConfiguration} from '../config.js';
import {getNode, ELEMENT_TYPE} from '../utils/figma.js';

import cliProgress from 'cli-progress';

const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

const configuration = getConfiguration();

export const getFonts = async () => {

    let fonts = [];
    const fontNodeId = configuration.node_ids.fonts;
    progressBar.start(2);
    await getNode(fontNodeId).then(async (response) => {
        let styles = response.data.nodes[decodeURIComponent(fontNodeId)].styles;

        progressBar.update(1);

        await getNode(Object.keys(styles).join(',')).then(async (response) => {
            if(response.data.nodes) {
                for(let nodeId of Object.keys(response.data.nodes)) {
                    const nodeInfo = response.data.nodes[nodeId].document;
                    if(ELEMENT_TYPE.TEXT === nodeInfo.type && nodeInfo.style && nodeInfo.style.fontFamily) {
                        fonts.push({
                            name: nodeInfo.style.fontFamily,
                        });
                    }
                }
            }
            progressBar.update(2);
        });
        progressBar.stop();

        return Promise.resolve();
    });
    //filter duplicate
    fonts = fonts.filter((v,i,a) => {
        return a.findIndex(t => (t.name === v.name)) === i
    })
    return fonts;
}
