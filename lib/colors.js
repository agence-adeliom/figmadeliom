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
    progressBar.start(2);

    await getNode(colorNodeId).then(async (response) => {
        let styles = response.data.nodes[decodeURIComponent(colorNodeId)].styles;
        progressBar.update(1);

        await getNode(Object.keys(styles).join(',')).then(async (response) => {
            if(response.data.nodes) {
                for(let nodeId of Object.keys(response.data.nodes)) {
                    const nodeInfo = response.data.nodes[nodeId].document;
                    if(!nodeInfo.style && !nodeInfo.effects.length && nodeInfo.fills && nodeInfo.fills[0]) {
                        let colorName = getNameFromPath(nodeInfo.name);
                        if(COLOR_TYPE.SOLID === nodeInfo.fills[0].type) {
                            const color = nodeInfo.fills[0].color;
                            colorsList.push({
                                name: colorName,
                                color: rgbToHex(color.r * 255, color.g * 255, color.b * 255)
                            });
                        }
                        else if(COLOR_TYPE.GRADIENT_LINEAR === nodeInfo.fills[0].type) {
                            const gradient = getGradient(nodeInfo.fills[0].gradientHandlePositions, nodeInfo.fills[0].gradientStops);
                            colorsList.push({
                                name: colorName,
                                color:`linear-gradient(${gradient})`,
                                gradient: true
                            });
                        }
                    }
                }
          }
          progressBar.update(2);
        });
        progressBar.stop();

        return Promise.resolve();
    });
    return colorsList;
}

