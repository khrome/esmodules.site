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
    checkBrowser('nd', 'nodejs');
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
    "chrome" :1,
    "firefox":2,
    "safari" :3,
    "edge"   :4,
    "legacy" :5,
    "nodejs":6
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

const makeParams = (settings, delimiter=' ', indent='    ')=>{
    return Object.keys(settings).map((key)=>{
        return indent+key+'="'+settings[key]+'"';
    }).join(delimiter)+'\n'
}

export const exampleCode = (
    settings, config, appended='', indent=''
)=>{
    let location = null;
    const flatSettings = JSON.parse(JSON.stringify(settings.browsers));
    Object.keys(settings).forEach((name)=>{
        if(name === 'browsers' || !settings[name]) return;
        flatSettings[name] = settings[name];
    });
    try{
        const referrer = new URL(document.referrer);
        location = (referrer.protocol || 'https:') + "//esmodules.site/esmodule-banner.mjs";
    }catch(ex){
        location = 'https://esmodules.site/esmodule-banner.mjs';
    }
    if(config.publicNodeInstall){
        location = './node_modules/esmodules.site/esmodule-banner.mjs';
    }
    if(config.isHTML){
        if(config.usesMap){
            return (`
<script type="importmap"> { "imports": {
    "esmodule-banner": "${location}"
} }</script>
<script>import 'esmodule-banner';</script>
<module-banner ${'\n'+ makeParams(flatSettings, ' \n')} ></module-banner>
${config.includeForkRibbon?`<fork-banner url="${config.includesForkMe || 'https://source.site'}"></fork-banner>`:''}
`+appended).replace(/\n/g, '\n'+indent);
        }else{
            return (`
<script type="module">
    import '${location}';
</script>
<module-banner ${'\n'+ makeParams(flatSettings, ' \n')} ></module-banner>
${config.includeForkRibbon?`<fork-banner url="${config.includesForkMe || 'https://source.site'}"></fork-banner>`:''}
`+appended).replace(/\n/g, '\n'+indent);
        }
    }else{
        if(config.usesMap){
            return (`
/*
    // IMPORT MAP
    { "imports": {
        "esmodule-banner": "${location}"
    } }
*/
import { 
    ForkBanner,
    ModuleBanner
} from 'esmodule-banner';
const moduleEl = document.createElement('module-banner');
const forkMeEl = document.createElement('fork-banner');
forkMeEl.setAttribute('url', "${config.includesForkMe || 'https://source.site'}");
`+appended).replace(/\n/g, '\n'+indent);
        }else{
            return (`
import { 
    ForkBanner,
    ModuleBanner
} from '${location}';
const moduleEl = document.createElement('module-banner');
const forkMeEl = document.createElement('fork-banner');
forkMeEl.setAttribute('url', "${config.includesForkMe || 'https://source.site'}");
`+appended).replace(/\n/g, '\n'+indent);
        }
    }
};

export const setGrid = (parameters, siteName='[not set]')=>{
    const titleEl = document.getElementById('info-title');
    const bodyEl = document.getElementById('info-body');
    Object.keys(parameters.browsers).forEach((browserName)=>{
        if(parameters.mechanism === 'standalone'){
            let info = '';
            let mapinfo = '';
            switch(parameters.browsers[browserName]){
                case 'supported':
                    grid(browserName, "import").innerHTML = '✔';
                    break;
                case 'unsupported':
                    grid(browserName, "import").innerHTML = 'X';
                    break;
                case 'fallback':
                    grid(browserName, "import").innerHTML = '√';
                    break;
                case 'untested':
                    grid(browserName, "import").innerHTML = '❓';
                    break;
            }
            
        }else{
            if(parameters.mechanism === 'import'){
                let info = '';
                let mapinfo = '';
                switch(parameters.browsers[browserName]){
                    case 'supported':
                        grid(browserName, "import").innerHTML = '✔';
                        grid(browserName, "importmap").innerHTML = '✔';
                        if(browserName === 'nodejs'){
                            info += `node.js uses es modules natively.`;
                            mapinfo += `node.js uses it's dependencies in it's package.json as an equivilent to an import map. All modules present may be imported, as long as the module supports it.\n`;
                        }else{
                            info += `${browserName} uses es modules with ${siteName} allowing for standard function of native modules via import.\n`;
                            mapinfo += `${browserName} uses input maps with ${siteName} allowing for various endpoints to resolve the individually modules natively, on demand.\n`;
                        }
                        break;
                    case 'unsupported':
                        grid(browserName, "import").innerHTML = '✗';
                        grid(browserName, "importmap").innerHTML = '✗';
                        info += `${browserName} does not support ${siteName} and no alternative is provided\n`;
                        mapinfo +=`${browserName} does not support ${siteName} and no alternative is provided\n`;
                        break;
                    case 'fallback':
                        if(parameters.support === 'redirect'){
                               grid(browserName, "import").innerHTML = '🔄';
                               grid(browserName, "importmap").innerHTML = '🔄';
                        }else{
                            if(parameters.support === 'inline'){
                                grid(browserName, "import").innerHTML = '🔀';
                                grid(browserName, "importmap").innerHTML = '🔀';
                            }else{
                                grid(browserName, "import").innerHTML = '√';
                                grid(browserName, "importmap").innerHTML = '√';
                            }
                        }
                        info += `${browserName} does not support ${siteName}, but the user will recieve a legacy site in it's place.\n`;
                        mapinfo +=`${browserName} does not support ${siteName}, but the user will recieve a legacy site in it's place.\n`;
                        break;
                    case 'untested':
                        grid(browserName, "import").innerHTML = '❓';
                        grid(browserName, "importmap").innerHTML = '❓';
                        info += `${browserName} has not been tested with ${siteName}, if you choose to test it, please file an issue with the results and the maintainer can update the corresponding status.\n`;
                        mapinfo +=`${browserName} has not been tested with ${siteName}, if you choose to test it, please file an issue with the results and the maintainer can update the corresponding status.\n`;
                        break;
                }
                grid(browserName, "import").addEventListener('mouseover', (e)=>{
                    titleEl.innerHTML = browserName +' import';
                    bodyEl.innerHTML = info[0].toUpperCase()+info.substring(1);
                });
                grid(browserName, "importmap").addEventListener('mouseover', (e)=>{
                    titleEl.innerHTML = browserName +' import map';
                    bodyEl.innerHTML = mapinfo[0].toUpperCase()+mapinfo.substring(1);
                });
            }else{
                let info = '';
                let mapinfo = '';
                if(parameters.mechanism === 'compiled'){
                    switch(parameters.browsers[browserName]){
                        case 'supported':
                            grid(browserName, "import").innerHTML = '✔';
                            grid(browserName, "importmap").innerHTML = '✔';
                            info += `${browserName} uses [format] output compiled from native imports for ${siteName}.\n`;
                            mapinfo += `${browserName} uses input maps with ${siteName} allowing for various endpoints to resolve the individual modules natively, on demand.\n`;
                            break;
                        case 'unsupported':
                            grid(browserName, "import").innerHTML = '✗';
                            grid(browserName, "importmap").innerHTML = '✗';
                            info += `${browserName} does not support ${siteName} and no alternative is provided\n`;
                            mapinfo +=`${browserName} does not support ${siteName} and no alternative is provided\n`;
                            break;
                        case 'fallback':
                            if(parameters.support === 'redirect'){
                                   grid(browserName, "import").innerHTML = '🔄';
                                   grid(browserName, "importmap").innerHTML = '🔄';
                            }else{
                                if(parameters.support === 'inline'){
                                    grid(browserName, "import").innerHTML = '🔀';
                                    grid(browserName, "importmap").innerHTML = '🔀';
                                }else{
                                    grid(browserName, "import").innerHTML = '√';
                                    grid(browserName, "importmap").innerHTML = '√';
                                }
                            }
                            info += `${browserName} does not support ${siteName}, but the user will recieve a legacy site in it's place.\n`;
                            mapinfo +=`${browserName} does not support ${siteName}, but the user will recieve a legacy site in it's place.\n`;
                            break;
                        case 'untested':
                            grid(browserName, "import").innerHTML = '❓';
                            grid(browserName, "importmap").innerHTML = '❓';
                            info += `${browserName} has not been tested with ${siteName}, if you choose to test it, please file an issue with the results and the maintainer can update the corresponding status.\n`;
                            mapinfo +=`${browserName} has not been tested with ${siteName}, if you choose to test it, please file an issue with the results and the maintainer can update the corresponding status.\n`;
                            break;
                    }
                    grid(browserName, "import").addEventListener('mouseover', (e)=>{
                        titleEl.innerHTML = browserName +' import';
                        bodyEl.innerHTML = info[0].toUpperCase()+info.substring(1);
                    });
                    grid(browserName, "importmap").addEventListener('mouseover', (e)=>{
                        titleEl.innerHTML = browserName +' import map';
                        bodyEl.innerHTML = mapinfo[0].toUpperCase()+mapinfo.substring(1);
                    });
                }else{
                    
                }
            }
            
        }
        const el = grid(browserName, "delivery");
        let info = ' ';
        switch(parameters.browsers[browserName]){
            case 'supported':
            case 'fallback':
                switch(parameters.mechanism){
                    case 'standalone':
                        el.innerHTML = '🔽';
                        info = `${siteName} uses direct module references and inline module definitions to load, echewing named modules to deliver to ${browserName}.`;
                        break;
                    case 'import':
                        if(browserName !== 'nodejs'){
                            el.innerHTML = '🗺️';
                            info = `${siteName} uses an import map to allow ${browserName} to resolve references to external or packaged modules.`;
                        }else{
                            el.innerHTML = '<img style="width:25px" src="./images/browsers/node.js.svg" >';
                            info = `This library loads modules directly from an npm repository.`;
                        }
                        break;
                    case 'fallback':
                        el.innerHTML = '🚩'; // 🔃
                        break;
                    case 'compiled':
                        if(parameters.toolchain && parameters.toolchain !== 'n'){
                            if(parameters.format){
                                let format = parameters.format;
                                switch(parameters.format){
                                    case 'module': format = 'Native ES Module'; break;
                                    case 'definition': format = 'UMD/AMD module'; break;
                                    case 'global': format = 'global javascript'; break;
                                    case 'namespaced': format = 'namespaced javascript'; break;
                                }
                                info = `${format} assets are produced by ${parameters.toolchain} for the ${browserName} deliverable from the original native modules.`;
                                el.innerHTML = '✔';
                            }else{
                                el.innerHTML = '✔';
                                info = `Compiled assets are produced for the output by ${parameters.toolchain} from the original source.`;
                            }
                        }else{
                            if(parameters.format){
                                let format = parameters.format;
                                switch(parameters.format){
                                    case 'module': format = 'Native ES Module'; break;
                                    case 'definition': format = 'UMD/AMD module'; break;
                                    case 'global': format = 'global javascript'; break;
                                    case 'namespaced': format = 'namespaced javascript'; break;
                                }
                                info = `${format} assets are produced for the ${browserName} deliverable from the original native modules.`;
                                el.innerHTML = '✔';
                            }else{
                                el.innerHTML = '✔';
                                info = `Compiled assets are produced for the ${browserName} output from th original source.`;
                            }
                        }
                        break;
                }
                break;
            case 'unsupported':
                el.innerHTML = '⛔';
                break;
            case 'untested':
                el.innerHTML = '⚠';
                info = `This library has not had it's imports tested, as a result it's delivery capability is unknown.`;
                break;
        }
        el.addEventListener('mouseover', (e)=>{
            titleEl.innerHTML = browserName +' delivery';
            bodyEl.innerHTML = info[0].toUpperCase()+info.substring(1);
        });
        //🔄 //reload/bounce
        //🔀 //inline
        //
        //🎁 //package
        //⛔ //no entry
    });
    grid('legacy', 'import').addEventListener('mouseover', (e)=>{
        titleEl.innerHTML = 'legacy import maps';
        bodyEl.innerHTML = 'Imports are not supported by legacy browsers';
    });
    grid('legacy', 'importmap').addEventListener('mouseover', (e)=>{
        titleEl.innerHTML = 'legacy import maps';
        bodyEl.innerHTML = 'Import maps are not supported by legacy browsers';
    });
    if(parameters.support === 'redirect' || parameters.support === 'inline'){
        if(parameters.support === 'redirect'){
            grid('legacy', 'import').innerHTML = ' ';
            grid('legacy', 'importmap').innerHTML = ' ';
            grid('legacy', 'delivery').innerHTML = '🔄';
            grid('legacy', 'delivery').addEventListener('mouseover', (e)=>{
                titleEl.innerHTML = 'legacy delivery';
                bodyEl.innerHTML = 'Legacy browsers are intercepted and redirected to a new experience which is not import based.';
            });
        }else{
            if(parameters.support === 'inline'){
                grid('legacy', 'import').innerHTML = ' ';
                grid('legacy', 'importmap').innerHTML = ' ';
                grid('legacy', 'delivery').innerHTML = '🔀';
                grid('legacy', 'delivery').addEventListener('mouseover', (e)=>{
                    titleEl.innerHTML = 'legacy delivery';
                    bodyEl.innerHTML = 'Legacy browsers are detected and dynamically delivered a different experience.';
                });
            }else{
                grid('legacy', 'import').innerHTML = ' ';
                grid('legacy', 'importmap').innerHTML = ' ';
                grid('legacy', 'delivery').innerHTML = '⛔';
                grid('legacy', 'delivery').addEventListener('mouseover', (e)=>{
                    titleEl.innerHTML = 'legacy delivery';
                    bodyEl.innerHTML = 'Legacy browsers are not supported.';
                });
            }
        }
    }
}