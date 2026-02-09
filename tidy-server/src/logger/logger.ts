import log4js from 'log4js';
import * as path from 'path';
import * as fs from 'fs';

/**
 * 从环境变量读取配置
 */
function getLoggerConfig() {
    const logLevel = 'INFO';
    // 默认启用文件日志，除非明确设置为 false
    const logToFile = true;
    const logDir = './logs';
    const logConsole = true; // 默认为 true
    
    return {
        level: logLevel,
        toFile: logToFile,
        logDir,
        toConsole: logConsole,
    };
}

const config = getLoggerConfig();

// 确保日志目录存在
if (config.toFile && !fs.existsSync(config.logDir)) {
    fs.mkdirSync(config.logDir, { recursive: true });
}

/**
 * 配置 log4js
 */
log4js.configure({
    appenders: {
        // 控制台输出
        console: {
            type: 'console',
            layout: {
                type: 'pattern',
                pattern: '%[%d{ISO8601} [%p]%] %m',
            },
        },
        // 文件输出（按日期）
        file: {
            type: 'dateFile',
            filename: path.join(config.logDir, 'emby-tidy.log'),
            pattern: 'yyyy-MM-dd',
            alwaysIncludePattern: true,
            maxLogSize: 10485760, // 10MB
            backups: 5,
            layout: {
                type: 'pattern',
                pattern: '%d{ISO8601} [%p] %m',
            },
        },
    },
    categories: {
        default: {
            appenders: config.toFile 
                ? (config.toConsole ? ['console', 'file'] : ['file'])
                : (config.toConsole ? ['console'] : []),
            level: config.level,
        },
    },
});

/**
 * 创建 logger 实例
 */
const logger = log4js.getLogger();

export { logger };
