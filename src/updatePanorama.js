import fs from 'fs';
import axios from 'axios';
import sharp from 'sharp';
import path from 'path';

export async function updatePanorama() {
    console.log(`Downloading structure.json`);
    const {data} = await axios.get('https://skyviewlive.roundshot.co/lappeenranta/structure.json');

    const latestImage = data.images.find(item => item.id == data.last_image);
    const url = latestImage.structure.full.url_full;
    const timestamp = new Date(latestImage.datetime * 1000);
    console.log(`Extracted image url ${url} with timestamp ${timestamp}`);

    const downloadPath = path.resolve('images', 'download.jpg');
    const outputPath = path.resolve('images', 'panorama.jpg');

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
    await image.toFile(outputPath);

    console.log(`Updating file modified timestamp`);
    fs.utimesSync( outputPath, timestamp, timestamp );

    console.log(`Deleting temporary download file`);
    fs.unlinkSync(downloadPath);

    console.log(`Success`);
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