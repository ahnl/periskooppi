import fs from 'fs';
import axios from 'axios';
import sharp from 'sharp';
import path from 'path';

export async function updatePanorama() {
    try {
        console.log(`Updating panorama image...`);

        const downloadPath = path.resolve('images', 'download.jpg');
        const tempPath = path.resolve('images', 'panorama_temp.jpg');
        const outputPath = path.resolve('images', 'panorama.jpg');

        let latestTimestamp;

        try {
            const modified = fs.statSync(outputPath);
            latestTimestamp = modified.mtime;
        } catch (e) {}

        console.log(`Downloading structure.json`);
        const {data} = await axios.get('https://skyviewlive.roundshot.co/lappeenranta/structure.json');
        
        const latestImage = data.images.find(item => item.id == data.last_image);
        const url = latestImage.structure.full2.url_full;
        const timestamp = new Date(latestImage.datetime * 1000);
        console.log(`Extracted image url ${url} with timestamp ${timestamp}`);

        if (timestamp.getTime() == latestTimestamp.getTime()) {
            console.log(`Timestamp matches the latest local download, aborting`);
            return;
        }

        console.log(`Downloading the image`);
        await downloadImage(url, downloadPath);
        
        console.log(`Cropping the image`)
        const image = await sharp(downloadPath);
        const metadata = await image.metadata();
        const cropHeight = Math.floor(metadata.height * 0.42);
        await image.extract({
            width: metadata.width,
            height: cropHeight,
            top: metadata.height - cropHeight,
            left: 0
        });
        await image.toFile(tempPath);

        console.log(`Updating file modified timestamp`);
        fs.utimesSync( tempPath, timestamp, timestamp );

        console.log(`Copying temp file into output file`);
        fs.copyFileSync(tempPath, outputPath);

        console.log(`Deleting temporary files`);
        fs.unlinkSync(downloadPath);
        fs.unlinkSync(tempPath);

        console.log(`Success`);
    } catch (e) {
        console.log(`Couldn't update the panorama, because ${e.message}`);
    }
}

async function downloadImage (url, output) {  
    const writer = fs.createWriteStream(output)
  
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    })
  
    response.data.pipe(writer)
  
    return new Promise((resolve, reject) => {
        writer.on('finish', resolve)
        writer.on('error', reject)
    })
}