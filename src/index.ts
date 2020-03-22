import { VideoCompressorOptions, VideoCompressor } from './compress-video';
import { Utility } from './utility';

class MainProgram {
    constructor() {
    }

    public main() {
        const filepath = '';
        const compressOptions: VideoCompressorOptions = {
            vBitRate: 50,
            size: '100%',
            fps: 5,
            aBitRate: 32,
            fmt: 'mp4',
            deleteOrigin: true
        };
        let filepathList: string[] = Utility.getAllFiles(filepath);
        let vc: VideoCompressor = new VideoCompressor(compressOptions, filepathList);
        vc.start();
    }
}

const mp = new MainProgram();
mp.main();
