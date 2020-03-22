import * as ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import * as fs from 'fs';
import { Utility } from './utility';
import { EventEmitter } from 'events';

enum EventType {
    AnalyzeFinished = "AnalyzeFinished"
}

export class VideoCompressorOptions {
    vBitRate: number;
    size: string;
    fps: number;
    aBitRate: number;
    fmt: string;
    deleteOrigin: boolean;
 }

export class VideoCompressor {
    public options: VideoCompressorOptions;
    
    private filepathList: string[];
    private needCompressFilepathList: string[] = [];
    private eventEmitter: EventEmitter = new EventEmitter();

    constructor(options: VideoCompressorOptions, filepathList: string[]) {
        this.options = options;
        this.filepathList = filepathList || [];
    }

    public start(): void {
        this._analyze(0);
        this.eventEmitter.on(EventType.AnalyzeFinished, () => {
            this._compress(0);
         });
    };

    private _compress(index: number): void {
        if (index === 0) {
            Utility.log('------------------------------------------------------');
            Utility.log("压缩开始");
        }
        if (index >= this.needCompressFilepathList.length) {    
            Utility.log("所有文件压缩结束");
            Utility.log('------------------------------------------------------');
            return;
        }
        let filepath = this.needCompressFilepathList[index];
        let ext = path.extname(filepath).toLowerCase().substring(1);
        Utility.log(`开始压缩文件${filepath}`);
        let preStats = fs.statSync(filepath);
        let preSize: number = preStats.size/(1024*1024);
        let outputPath = path.resolve(path.dirname(filepath), `${path.basename(filepath, path.extname(filepath))}_temp.${this.options.fmt}`);
        ffmpeg(filepath)
            .videoCodec('libx264')
            .videoBitrate(this.options.vBitRate)
            .size(this.options.size)
            .autopad()
            .fps(this.options.fps)
            .audioBitrate(this.options.aBitRate)
            .audioCodec('libmp3lame')
            .audioChannels(2)
            .format(this.options.fmt)
            .on('end', () => {
                let outputStats = fs.statSync(outputPath);
                let outputSize = outputStats.size/(1024*1024);
                let ratio = preSize/outputSize;
                Utility.log(`文件${filepath}转换成功,转换前大小：${preSize.toFixed(2)}MB，转换后大小：${outputSize.toFixed(2)}MB，压缩比：${ratio.toFixed(2)}`);
                if (this.options.deleteOrigin) {
                    try {
                        fs.unlinkSync(filepath);
                        let rename = path.resolve(path.dirname(filepath), `${path.basename(filepath, path.extname(filepath))}.${this.options.fmt}`);
                        fs.renameSync(outputPath, rename);
                        this._compress(index + 1);
                    } catch (e) {
                        Utility.log('移动和重命名文件出错了，错误是：' + e);
                        this._compress(index + 1);
                    }
                }
            })
            .on('error', (err) => {
                Utility.log(`文件${filepath}转换失败，失败原因：${err}`);
                this._compress(index + 1);
            })
            // save to file
            .save(outputPath);
    }

    private _analyze(index: number): void {
        if (index === 0) {
            Utility.log("******************************************************");
            Utility.log("分析开始");   
        }
        if (index >= this.filepathList.length) {
            Utility.log("所有文件分析结束");
            Utility.log("******************************************************");
            this.eventEmitter.emit(EventType.AnalyzeFinished);
            return;
        }
        let filepath = this.filepathList[index];
        let ext = path.extname(filepath).toLowerCase().substring(1);
        if (['avi', 'mp4', 'flv', 'rmvb', 'mov', 'rm', '3gp', 'wmv', 'mkv'].indexOf(ext) < 0) {
            this._analyze(index + 1);
            return;
        }
    
        ffmpeg.ffprobe(filepath, (err, metadata) => {
            if (err) {
                if (err.toString().indexOf('Invalid data found when processing input') >= 0) {
                    Utility.log(`文件${filepath}数据无效`);
                }
            } else {
                let bitRate = metadata.format.bit_rate / 1024;
                if (bitRate > this.options.vBitRate * 2) {
                    this.needCompressFilepathList.push(filepath);
                }
            }
            this._analyze(index + 1);
        });
    }
 }

