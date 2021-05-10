import fs from 'fs';

export const sleep = (ms) => {
    return new Promise(res => setTimeout(res, ms));
};

export const checkFolders = (path) => {

    if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true });
    }
    return path;
};

export const rgbToHex = (r, g, b) => {
    const hexColor = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    if (hexColor.length > 7) {
        return hexColor.slice(0, 7);
    }
    return hexColor;
}
