import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from "class-validator";

export class LogConfigDto {
    @IsString()
    @IsNotEmpty()
    level: string;

    @IsBoolean()
    toFile: boolean;

    @IsString()
    @IsNotEmpty()
    logDir: string;
}

export class AiConfigDto {
    @IsString()
    @IsNotEmpty()
    model: string;

    @IsString()
    @IsNotEmpty()
    baseUrl: string;

    @IsString()
    @IsNotEmpty()
    apiKey: string;

    @IsNumber()
    @IsOptional()
    recursionLimit?: number;
}

export class FolderDto {
    @IsString()
    @IsNotEmpty()
    path: string;
}

export class TmdbConfigDto {
    @IsString()
    @IsNotEmpty()
    key: string;
}

export class ConfigDto {
    @ValidateNested()
    @Type(() => LogConfigDto)
    log: LogConfigDto;

    @ValidateNested()
    @Type(() => AiConfigDto)
    ai: AiConfigDto;

    @ValidateNested()
    @Type(() => TmdbConfigDto)
    @IsOptional()
    tmdb?: TmdbConfigDto;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FolderDto)
    folders: FolderDto[];
}

export class SetConfigDto {
    @IsObject()
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => ConfigDto)
    config: ConfigDto;
}
