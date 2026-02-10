import { Config, getConfig, setConfig } from '@/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
    config: Config;
    constructor() {}

    getConfig() {
        return getConfig();
    }

    /** 合并传入的配置与当前配置后写入，未传的字段（如 tmdb）保留原值 */
    setConfig(partial: Partial<Config>) {
        const current = getConfig();
        const merged: Config = {
            log: partial.log ?? current.log,
            ai: partial.ai ?? current.ai,
            tmdb: partial.tmdb ?? current.tmdb,
            folders: partial.folders ?? current.folders,
        };
        setConfig(merged);
    }
}
