import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class WatchDirectoryDto {
    @IsString({ message: 'directory 必须是字符串' })
    @IsNotEmpty({ message: 'directory 不能为空' })
    @MinLength(1, { message: 'directory 长度不能小于1' })
    @MaxLength(1000, { message: 'directory 长度不能超过1000' })
    directory: string;
}

export class UnwatchDirectoryDto {
    @IsString({ message: 'directory 必须是字符串' })
    @IsNotEmpty({ message: 'directory 不能为空' })
    @MinLength(1, { message: 'directory 长度不能小于1' })
    @MaxLength(1000, { message: 'directory 长度不能超过1000' })
    directory: string;
}
