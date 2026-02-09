import { Config, getConfig, setConfig } from '@/config';
import { Injectable } from '@nestjs/common';
import {createClient} from 'webdav';

@Injectable()
export class ConfigService {
    config: Config;
    constructor() {}

    getConfig() {
        return getConfig();
    }

    setConfig(config: Config) {
        setConfig(config);
    }
}
