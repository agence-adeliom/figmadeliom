import colors from "colors";
import {COLOR_TYPE, getNode} from "../utils/figma.js";
import {getGradient, getNameFromPath, rgbToHex, sleep} from "../utils/tools.js";
import {getConfiguration} from "../config.js";
import cliProgress from "cli-progress";

const configuration = getConfiguration();


const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);



export const getColors = async () => {

    if(!configuration.node_ids || !configuration.node_ids.colors){
        console.log(colors.red('Missing node Id for colors, check your config file'));
        return;
    }

    let colorsList = [];

    const colorNodeId = configuration.node_ids.colors;

    await getNode(colorNodeId).then(async (response) => {
        let styles = response.data.nodes[decodeURIComponent(colorNodeId)].styles;

        let total = Object.keys(styles).length;
        let progress = 0;
        progressBar.start( total);

        for(let nodeId of Object.keys(styles)){
            let col = await getNode(nodeId).then(async (response) => {
                let nodeInfo = response.data.nodes[decodeURIComponent(nodeId)].document;
                //colors: solid : type
                if(!nodeInfo.style && !nodeInfo.effects.length && nodeInfo.fills && nodeInfo.fills[0]) {

                    let colorName = getNameFromPath(nodeInfo.name);

                    if(COLOR_TYPE.SOLID === nodeInfo.fills[0].type) {
                        const color = nodeInfo.fills[0].color;
                        return Promise.resolve({
                            name: colorName,
                            color: rgbToHex(color.r * 255, color.g * 255, color.b * 255)
                        });
                    }
                    else if(COLOR_TYPE.GRADIENT_LINEAR === nodeInfo.fills[0].type) {
                        const gradient = getGradient(nodeInfo.fills[0].gradientHandlePositions, nodeInfo.fills[0].gradientStops);
                        return Promise.resolve({
                            name: colorName,
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
            progress++;
            progressBar.update(progress);

            sleep(configuration.downloadDelay);
        }
        progressBar.stop();
        return Promise.resolve();
    });
    return colorsList;
}

