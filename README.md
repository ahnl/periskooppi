# Periskooppi
![image](https://user-images.githubusercontent.com/46541386/125155763-a969d380-e16a-11eb-8be9-4a5a23c866ef.png)

Pinpoint **[lat, long]**- into **[x, y]**-coordinates on live 360 panorama of the city of Lappeenranta.

## How it works

### Pulling latest panorama imagery
- Checks for new panorama images in [skyviewlive.roundshot.co/lappeenranta](https://skyviewlive.roundshot.co/lappeenranta/) (they update them usually every 10 minutes)
  - Pulls 360 panorama image onto local disk

### Locating position and creating an image
- Request to `/here/:lat/:long`
- Convert **[lat, long]** into **[x, y]** (see [src/locate.js](https://github.com/ahnl/whereami-lpr/blob/main/src/locate.js))
  - Calculates distance and bearing between the given coordinates and the coordinates of Lappeenrannan Vesitorni (where the 360 panorama is taken)
  - The bearing translates easily into x-coordinate
  - The distance is used to determine the y-coordinate, by inserting it into a fitted curve's equation (because of the perspective)
- Draw onto the panorama image, and crop it
  - Load the latest panorama image from the disk
  - Insert pinpoint-image on top of it, in the **[x, y]**-coordinates provided by the previous step
  - Crop the image in square shape, try to have the pinpointed location in the middle on the x-axis
- Respond image/jpeg buffer

## Getting started

Clone the repository onto your local machine and install the dependencies using `npm install`.

Run the app using `npm start`. It should be ready to go, once it has finished downloading the latest panorama image. The server starts on port 80.

If you want to adapt this app to some other panorama imagery, you need to do some fiddling mostly with [src/locate.js](https://github.com/ahnl/whereami-lpr/blob/main/src/locate.js)'s values: center, zeroBearing, y-equation.

### Docker

Docker image is available in the GitHub Packages-registry. 

- https://github.com/ahnl/whereami-lpr/pkgs/container/whereami-lpr

Install it from the command line (make sure to log in first, with the **read:packages**-scope allowed):
```
docker pull ghcr.io/ahnl/whereami-lpr:latest
```

Run the image using:
```
docker run -p 80:80 -d ghcr.io/ahnl/whereami-lpr
```
