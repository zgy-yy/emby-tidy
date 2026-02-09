
import * as path from 'path';
import * as fs from 'fs';

export type Config = {
    log: {
        level: string;
        toFile: boolean;
        logDir: string;
    }
    ai: {
        model: string;
        baseUrl: string;
        apiKey: string;
        recursionLimit?: number; // Agent 递归限制，默认 1000
    }
    folders: {
        path: string;
    }[]
}

const configPath = path.join(__dirname, 'config.json');
console.log('__dirname', __dirname);    
console.log('configPath', configPath);
export function getConfig(): Config {
    if (!fs.existsSync(configPath)) {
        const defaultConfig: Config = {
            log: {
                level: 'INFO',
                toFile: true,
                logDir: './logs',
            },
            ai: {
                model: 'deepseek-chat',
                baseUrl: 'https://api.deepseek.com',
                apiKey: 'sk-f6292ad530b148edb93d4bdc41601c6f',
                recursionLimit: 1000, // 默认递归限制为 1000
            },
            folders: [{
                path: '/Volumes/dav.2dland.cn/test',
            }],
        }
        fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
        return defaultConfig
    }
    const config = fs.readFileSync(configPath, 'utf8');
    const configJson = JSON.parse(config) as Config;
    return configJson as Config;
}


export function setConfig(config: Config) {
    console.log('setConfig', config);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

const config = getConfig();
console.log('config1', config);
export default config;