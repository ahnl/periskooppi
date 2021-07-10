let iconFeature, map;
let mapInitialized = false;

let position;
setPosition([61.062616, 28.198685]);

function initMap() {
    if (mapInitialized) return;
    mapInitialized = true;
    console.log("Initializing map...");

    let reversePos = [...position].reverse();

    iconFeature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat(reversePos)),
        name: 'Point',
    }); 

    map = new ol.Map({
        target: 'map',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            }),
            new ol.layer.Vector({
                source: new ol.source.Vector({
                  features: [iconFeature]
                }),
                style: new ol.style.Style({
                  image: new ol.style.Icon({
                    anchor: [0.5, 0.5],
                    src: '/point.png',
                    scale: 0.5
                  })
                })
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([28.198435718266765, 61.05949777944218]),
            zoom: 14
        })
    });
    
    map.on('click', function (evt) {
        const latLon = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326').reverse();
        setPosition(latLon);
    });
};

const locateBtn = document.querySelector("#locateBtn");
locateBtn.addEventListener("click", () => {
    let defaultText = locateBtn.innerHTML;

    locateBtn.disabled = true;
    locateBtn.innerHTML = "Locating...";
    
    function resetText() { 
        locateBtn.innerHTML = defaultText;
        locateBtn.disabled = false;
    }
    setTimeout(resetText, 20 * 1000);

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
            resetText();
            setPosition([pos.coords.latitude, pos.coords.longitude]);
        });
        
    } else {
        locateBtn.innerHTML = "Geolocation is not supported by this browser.";
    }
});

function setPosition(pos) {
    position = pos;
    document.querySelector("#latlongInput").value = position.join(", ");
    document.querySelector('#hereImage').src = `/here/${position[0]}/${position[1]}`;

    let reversePos = [...position].reverse();

    if (mapInitialized) iconFeature.setGeometry(new ol.geom.Point(ol.proj.fromLonLat(reversePos)))
}

const tabs = {
    position: {
        button: document.querySelector("#positionTabBtn"),
        tab: document.querySelector("#positionTab")
    },
    map: {
        button: document.querySelector("#mapTabBtn"),
        tab: document.querySelector("#mapTab")
    }
}
tabs.position.button.addEventListener("click", () => selectTab(tabs.position));
tabs.map.button.addEventListener("click", () => selectTab(tabs.map));
document.querySelector("#openMapTabLink").addEventListener("click", () => selectTab(tabs.map));

function selectTab({ tab, button }) {
    Object.keys(tabs).forEach(tab => {
        tabs[tab].button.classList.remove("selected");
        tabs[tab].tab.style.display = "none";
    })
    button.classList.add("selected");
    tab.style.display = "block";

    initMap();
}
