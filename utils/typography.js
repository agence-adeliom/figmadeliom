
export const getFontStack = (serif = false) => {

    const sansSerif = [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        'Helvetica',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"'
    ];

    let stack = sansSerif;

    if(serif) {
        const serifStack = [
            'Constantia',
            '"Lucida Bright"',
            'Lucidabright',
            '"Lucida Serif"',
            'Lucida',
            '"DejaVu Serif"',
            '"Bitstream Vera Serif"',
            '"Liberation Serif"',
            'Georgia',
            'serif'
        ];
        stack = serifStack;
    }

    return stack.join(', ');
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
    const formatFontSize = (style, tab = 1) => {
        let lineHeight = '';
        if(style['line-height']) {
            lineHeight = `rem(${style['line-height']})`;
        }
        if(style['font-size']) {
         return `${'\t'.repeat(tab)}@include font-size(rem(${style['font-size']})${lineHeight ? ', '+ lineHeight: ''});`
        }
    }

    const propToStyle = (prop, style, tab = 1) => {
        let value = style[prop];
        if(prop === 'font-family' && font[value]){
        value = font[value];
        }
       return `${'\t'.repeat(tab)}${prop}: ${value};`;
    }

    let size = formatFontSize(style,1);
    if(size){
        scss.push(size);
    }
    for(let prop in style) {
        if(typeof style[prop] === 'object') {

            scss.push(`\t@include breakpoint(${prop}) {`);
            if(style[prop]['font-size'] && style[prop]['font-size']  !== style['font-size']){
                let bpSize = formatFontSize(style[prop], 2);
                if(bpSize){
                    scss.push(bpSize);
                }
            }
            for(let bpProp in style[prop]) {
                if(['line-height', 'font-size'].indexOf(bpProp) === -1 ){
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
        if(['line-height', 'font-size'].indexOf(prop) === -1 ){
            let value = propToStyle(prop, style, 1);
            if(value) {
                scss.push(value);
            }
        }
    }

    return scss.join('\n');


}

