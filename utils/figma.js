import axios from "axios";
import {getConfiguration} from '../config.js';
const configuration = getConfiguration();



export const COLOR_TYPE = {
    SOLID: 'SOLID',
    GRADIENT_LINEAR: 'GRADIENT_LINEAR',
}

const getApiUrl = () => {
    return configuration.figma_api_url;
}

const getFileKey = () => {
    return configuration.figma_file_key;
}

const getHeaders = () => {
    return {
        "X-Figma-Token": configuration.figma_personal_token
    };
}

const FigmaApiService = {
    files : (nodeId) => `${getApiUrl()}/files/${getFileKey()}/nodes?ids=${nodeId}`,
    images : (nodeId, format = 'svg') => `${getApiUrl()}/images/${getFileKey()}/?ids=${nodeId}${format ? '&format='+format : ''}`,
    styles : () => `${getApiUrl()}/styles/${getFileKey()}/`
};

const getFigmaApi = (url) => {
    return axios.get(url, {
        headers: getHeaders()
    });
}


const getNodeUrl = (nodeId) => {
    return FigmaApiService.files(nodeId);
}

const getImageUrl = (nodeId, format = 'svg') => {
    return FigmaApiService.images(nodeId, format);
}

export const getNode = (nodeId) => {
    return getFigmaApi(getNodeUrl(nodeId));
}

export const getImage = (nodeId, format = 'svg') => {
    nodeId = encodeURIComponent(nodeId);
    return getFigmaApi(getImageUrl(nodeId, format));
}
