import {fontStacks} from "./font-stacks.js";


export const getFontStack = (serif = false) => {
    if(serif) {
        return fontStacks.georgia;
    }
    return fontStacks.system;
}

export const figmaNameToMixin = (name) => {
    let textElement = 'p';
    if(name.indexOf('lvl') !== - 1){
        const lvl = name.replace(/\D+/, '');
        return `h${lvl}`;
    }
    if(name.toLowerCase().indexOf('headline') !== - 1){
        return name.toLowerCase();
    }
    if(name.indexOf('text') !== - 1){
        let split = name.split('text');
        let modifier = split[0].toLowerCase().trim();
        if(modifier === 'normal') {
            return textElement;
        }
        return `${textElement}--${modifier}`;
    }
    return name;
}

const FIGMA_BREAKPOINT = {
    XS: '320px',
    SM: '720px',
    MD: '960px',
    LG: '1280px'
};
const BREAKPOINT = {
    '720px': 'sm',
    '960px': 'md',
    '1280px': 'md'
}

export const objectToStyle = (object) => {

    let hasBreakpoint = Object.keys(object).length > 1;

    const setStyle = (obj, styles) => {
        obj['font-family'] = styles.fontFamily;
        obj['font-size'] = styles.fontSize;
        obj['line-height'] = Math.round(styles.lineHeightPx);
        obj['font-weight'] = styles.fontWeight;
        if(styles.textCase && styles.textCase === 'UPPER'){
            obj['text-transform'] = 'uppercase';
        }
    };

    let style = {};
    for(let breakpoint in object) {
        if(!hasBreakpoint || (hasBreakpoint && breakpoint === FIGMA_BREAKPOINT.XS)){
            setStyle(style, object[breakpoint]);
            continue;
        }
        if(!style[BREAKPOINT[breakpoint]]){
            style[BREAKPOINT[breakpoint]] = {};
        }
        setStyle(style[BREAKPOINT[breakpoint]], object[breakpoint]);
    }

    return style;
}

export const styleToScss = (style, font) => {
    let scss = [];

    const textMixinSignature = ['font-size', 'line-height', 'font-weight'];


    const formatFontSize = (style, tab = 1) => {
        let args = [];
        for(let prop of textMixinSignature) {
            if(style[prop]){
                args.push(style[prop]);
            }
        }
        if(args.length) {
            return `${'\t'.repeat(tab)}@include text(${args.join(', ')});`
        }
    };

    const propToStyle = (prop, style, tab = 1) => {
        let value = style[prop];
        if(prop === 'font-family' && font[value]){
        value = font[value];
        }
       return `${'\t'.repeat(tab)}${prop}: ${value};`;
    };

    let size = formatFontSize(style,1);
    if(size){
        scss.push(size);
    }
    for(let prop in style) {
        if(typeof style[prop] === 'object') {

            scss.push(`\t@include breakpoint(${prop}) {`);
            if((style[prop]['font-size'] && style[prop]['font-size'] !== style['font-size'])
                || (style[prop]['font-weight'] && style[prop]['font-weight'] !== style['font-weight'])){
                let bpSize = formatFontSize(style[prop], 2);
                if(bpSize){
                    scss.push(bpSize);
                }
            }
            for(let bpProp in style[prop]) {
                if(textMixinSignature.indexOf(bpProp) === -1 ){
                    if(style[bpProp] && style[bpProp] !== style[prop][bpProp]) {
                        let value = propToStyle(bpProp, style[prop][bpProp], 2);
                        if(value) {
                            scss.push(value);
                        }
                    }
                }
            }
            scss.push(`\t}`);
            continue;
        }
        if(textMixinSignature.indexOf(prop) === -1 ){
            let value = propToStyle(prop, style, 1);
            if(value) {
                scss.push(value);
            }
        }
    }

    return scss.join('\n');


}

