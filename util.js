export const getConfig = (localdomains)=>{
    const args = new URLSearchParams(window.location.search);
    const browsers = {};
    const checkBrowser = (code, name)=>{
        let arg = null;
        if(arg = args.get(code)){
            switch(arg){
                case 'n':
                    browsers[name] = 'unsupported';
                    break;
                case 'y':
                    browsers[name] = 'supported';
                    break;
                case 'f':
                    browsers[name] = 'fallback';
                    break;
                case 'u':
                    browsers[name] = 'untested';
                    break;
            }
        }else{
            browsers[name] = 'unsupported';
        }
    };
    checkBrowser('ff', 'firefox');
    checkBrowser('cr', 'chrome');
    checkBrowser('sf', 'safari');
    checkBrowser('ed', 'edge');
    let support = 'none';
    if(args.get('rd')) support = 'redirect';
    if(args.get('in')) support = 'inline';
    let mechanism = 'none';
    if(args.get('st')) mechanism = 'standalone';
    if(args.get('im')) mechanism = 'import';
    if(args.get('cp')) mechanism = 'compiled';
    if(args.get('bd')) mechanism = 'bundled';
    let toolchain = args.get('br');
    switch(toolchain){
        case 'b': toolchain = 'babel'; break;
        case 'w': toolchain = 'webpack'; break;
        case 'r': toolchain = 'browserify'; break;
        case 'p': toolchain = 'parcel'; break;
    }
    let format = args.get('fm');
    switch(format){
        case 'g': format = 'global'; break;
        case 'd': format = 'definition'; break;
        case 'm': format = 'module'; break;
        case 'i': format = 'namespaced'; break;
    }
    let segmented = args.get('sg') === 'on'?true:false;
    const result = {
        browsers,
        support,
        mechanism,
        toolchain,
        format,
        segmented
    }
    return result;
};

const environmentMap = {
    "chrome":2,
    "safari":4,
    "firefox":3,
    "edge":5,
    "node.js":6
};
const settingMap = {
    "import": 1,
    "importmap":2,
    "delivery":3
};
export const grid = (environment, setting)=>{
    const col = environmentMap[environment];
    const row = settingMap[setting];
    const results = document.querySelector(`table#matrix tr:nth-of-type(${row}) td:nth-of-type(${col})`);
    return results;
};