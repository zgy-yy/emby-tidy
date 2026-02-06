import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class ScanDirectoryDto {
    @IsString({ message: 'directory 必须是字符串' })
    @IsNotEmpty({ message: 'directory 不能为空' })
    @MinLength(1, { message: 'directory 长度不能小于1' })
    @MaxLength(1000, { message: 'directory 长度不能超过1000' })
    directory: string;
}

export class DeleteFileDto {
    @IsString({ message: 'path 必须是字符串' })
    @IsNotEmpty({ message: 'path 不能为空' })
    @MinLength(1, { message: 'path 长度不能小于1' })
    @MaxLength(1000, { message: 'path 长度不能超过1000' })
    path: string;
}

export class MoveFileDto {
    @IsString({ message: 'filePath 必须是字符串' })
    @IsNotEmpty({ message: 'filePath 不能为空' })
    @MinLength(1, { message: 'filePath 长度不能小于1' })
    @MaxLength(1000, { message: 'filePath 长度不能超过1000' })
    filePath: string;

    @IsString({ message: 'targetDirectory 必须是字符串' })
    @IsNotEmpty({ message: 'targetDirectory 不能为空' })
    @MinLength(1, { message: 'targetDirectory 长度不能小于1' })
    @MaxLength(1000, { message: 'targetDirectory 长度不能超过1000' })
    targetDirectory: string;
}

export class RenameFileDto {
    @IsString({ message: 'filePath 必须是字符串' })
    @IsNotEmpty({ message: 'filePath 不能为空' })
    @MinLength(1, { message: 'filePath 长度不能小于1' })
    @MaxLength(1000, { message: 'filePath 长度不能超过1000' })
    filePath: string;

    @IsString({ message: 'newName 必须是字符串' })
    @IsNotEmpty({ message: 'newName 不能为空' })
    @MinLength(1, { message: 'newName 长度不能小于1' })
    @MaxLength(500, { message: 'newName 长度不能超过500' })
    newName: string;
}

export class TidyFileDto {
    @IsString({ message: 'path 必须是字符串' })
    @IsNotEmpty({ message: 'path 不能为空' })
    @MinLength(1, { message: 'path 长度不能小于1' })
    @MaxLength(1000, { message: 'path 长度不能超过1000' })
    path: string;
}
