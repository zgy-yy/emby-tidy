import type { Config } from "@/config";
import { Type } from "class-transformer";
import { IsNotEmpty, IsObject, ValidateNested } from "class-validator";


export class SetConfigDto {
    @IsObject({ message: 'config 必须是对象' })
    @IsNotEmpty({ message: 'config 不能为空' })
    @ValidateNested({ each: true })
    @Type(() => Object)
    config: Config;
}