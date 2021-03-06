import fs from 'fs/promises';
import express from 'express';
import sharp from 'sharp';
import cron from 'node-cron'
import nocache from 'nocache';
import path from 'path';

import { prettyDate } from './utils.js';
import { locate } from './locate.js';

import { updatePanorama } from './updatePanorama.js';
cron.schedule('*/4 * * * *', updatePanorama);
updatePanorama();

const panoramaFile = 'images/panorama.jpg';

const app = express();
app.use(express.static('public'));
app.use(nocache());

app.get("/here/:lat/:lon", async function(req, res){
    try {
        const location = [req.params.lat, req.params.lon];
        console.log(location)
        let image = await sharp(panoramaFile);
        const metadata = await image.metadata();

        const panoramaSize = [metadata.width, metadata.height];

        const pos = locate(location, panoramaSize);

        const leftCrop = Math.max(Math.min(pos[0] - ( panoramaSize[1] / 2), panoramaSize[0] - panoramaSize[1]), 0);

        await image.composite([
            {
                input: 'public/point.png',
                top: pos[1] - 25,
                left: (pos[0] - 25) - leftCrop
            },
            ...(req.query?.['noTime'] !== '' ? 
            [{
                input: Buffer.from(`<svg height="100" width="860"> <text x="30" y="50" font-size="30" fill="#fff" font-family="Arial, Ubuntu">${prettyDate((await fs.stat(panoramaFile)).mtime)}</text> </svg>`),
                top: 0,
                left: 0
            }] 
            : [])
        ])

        await image.resize({ width: panoramaSize[0] })

        await image.extract({
            width: panoramaSize[1],
            height: panoramaSize[1],
            top: 0,
            left: leftCrop
        });

        const buffer = await image.toBuffer();
        res.set("Content-Type", "image/jpeg");
        res.send(buffer);
    } catch (e) {
        console.error(e.message);
        res.end();
    }
});


app.listen(80);
