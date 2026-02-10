
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
    },
    tmdb: {
        key: string;
    },
    folders: {
        path: string;
    }[]
} 

// 根据环境变量判断是否为生产环境（Docker）
// 生产环境：NODE_ENV=production 且存在 /app/config 目录
// 开发环境：使用相对路径
const isProduction = process.env.NODE_ENV === 'production';
const isDocker = isProduction && fs.existsSync('/app/config');
const configDir = isDocker ? '/app/config' : path.join(__dirname,'..','..','config');
const configPath = path.join(configDir, 'config.json');

export function getConfig(): Config {
    if (!fs.existsSync(configPath)) {
        // 根据环境设置默认路径
        const defaultLogDir = isDocker ? '/app/logs' : path.join(__dirname,'..','..','logs');
        const defaultMediaPath = isDocker ? '/app/media' : path.join(__dirname,'..','..','media');
        
        const defaultConfig: Config = {
            log: {
                level: 'INFO',
                toFile: true,
                logDir: defaultLogDir,
            },
            tmdb: {
                key: 'a7bed360d30feb5f61533fc032aa5582',
            },
            ai: {
                model: 'deepseek-chat',
                baseUrl: 'https://api.deepseek.com',
                apiKey: 'sk-f6292ad530b148edb93d4bdc41601c6f',
                recursionLimit: 1000, // 默认递归限制为 1000
            },
            folders: [{
                path: defaultMediaPath,
            }],
        }
        
        // 确保配置目录存在
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
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
    // 确保配置目录存在
    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
    }
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

const config = getConfig();
export default config;