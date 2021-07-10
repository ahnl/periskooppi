import { getBearing, getDistance } from './utils.js';

const center =  [61.059307293961446, 28.198304621001437]; // lat, long
const zeroBearing = 248; // deg, 0 is if the panorama's X=0 is in the north bearing=0

export function locate(target, panoramaSize) {
    const bearing = getBearing(center, target);
    const realBearing = 0 - zeroBearing + ( 360 + bearing);

    const distance = getDistance(center, target);

    let x = (realBearing * ( panoramaSize[0] / 360)) % panoramaSize[0];
    let y = panoramaSize[1] - (((-243.6 * Math.pow(10, -0.0008158 * distance ) + 191) * 4 * 2)); 

    x = Math.floor(x);
    y = Math.floor(y);

    y = ( y >= 0 ? y : 0);
    // to-do: add max y-value based on the metric distance

    console.log(`X: ${x}px, Y: ${y}px`);

    return [Math.floor(x), Math.floor(y)];
};

/*
y equation was auto fitted using the following values:
    X Y
    171	0
    289	70
    350	107
    435	119
    1119	149
    3930	197
*/