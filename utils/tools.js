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

export const getGradient = (gradientHandles, colors) => {
    const angle = calculateAngle(gradientHandles[0], gradientHandles[1]);

    const gradient = [`${angle}deg`];
    for(let color of colors) {
        gradient.push(`${rgbToHex(color.color.r * 255 ,color.color.g * 255 ,color.color.b * 255)} ${floatToPercent(color.position)}`);
    }

    return gradient.join(', ');
};

const calculateAngle = (start, end) => {
    const radians = Math.atan(calculateGradient(start, end))
    return parseInt(radToDeg(radians).toFixed(1))
}

const calculateGradient = (start, end) => {
    return (end.y - start.y) / (end.x - start.x) * -1;
}

const radToDeg = (radian) => {
    return (180 * radian) / Math.PI;
}

const floatToPercent = (value) => {
    return (value *= 100).toFixed(0) + "%";
}
