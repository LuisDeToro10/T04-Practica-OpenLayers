/// INICIO DE IMPORTACIONES
import './style.css';
import {Map, View} from 'ol';
import { OSM, TileWMS, Vector as VectorSource } from "ol/source";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";

import GeoJSON from "ol/format/GeoJSON";

// Convertir de 3857 a 4326
import { fromLonLat } from 'ol/proj';

// Para los popups
import Overlay from 'ol/Overlay';

// Controles
import {
  ZoomToExtent,
  OverviewMap,
  defaults as defaultControls,
  Control
} from "ol/control";
/// FIN DE IMPORTACIONES



/// INICIO DE LA VISUALIZACIÓN INICIAL
// Vista inicial en España
let centerSpain_4326 = fromLonLat([-3.74922, 40.463667])

// Constante para la extension a la vista inicial limitada a su area geográfica (España)
const extentSpain = [-1235259.5, 4059581.4, 556231.5, 5627187.3];

// Mapa guia
const OverviewMapControl = new OverviewMap({
  layers: [
    new TileLayer({
      source: new OSM()
    })
  ],
});

// Constante para la extension a "A Coruña"
const extentACoruña = [-1035259.5, 5228540.6, -851509.8, 5418128.5]

// Extension a "A Coruña"
const zoomToACorunaControl = new ZoomToExtent({
  extent: extentACoruña
});

// Controles de minimapa y zoom A Coruña
const extendControls = [
  OverviewMapControl,
  zoomToACorunaControl
];
/// FIN DE LA VISUALIZACIÓN INICIAL



///INICIO DE CAPAS
// Proporcionada por el cliente
const caminosSantiagoLayer = new VectorLayer({
  title: "Caminos de Santiago",
  visible: true,
  source: new VectorSource({
    format: new GeoJSON(),
    url: "./data/caminos_santiago.geojson",
    attributions:'© Caminos de Santiago proporcionado por el cliente',
  }),
});

// OpenStreetMap
const osmLayer = new TileLayer({
  source: new OSM({
    attributions:
      '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }),
  type: "base",
});

// WMS del PNOA
const PNOALayer = new TileLayer({
  title: "PNOA",
  source: new TileWMS({
    url: "https://www.ign.es/wms-inspire/pnoa-ma?",
    params: { LAYERS: "OI.OrthoimageCoverage", TILED: true },
    attributions:
      '© <a href="https://www.ign.es/web/ign/portal">Instituto Geográfico Nacional</a>',
  }),
  type: "base",
});

// WMS de MTN50
const MTN50Layer = new TileLayer({
  title: "PNOA",
  source: new TileWMS({
    url: "https://www.ign.es/wms/primera-edicion-mtn",
    params: { LAYERS: "MTN50", TILED: true },
    attributions:
      '© <a href="https://www.ign.es/wms/primera-edicion-mtn">MTN50</a>',
  }),
  type: "base",
});
///FIN DE CAPAS



/// INICIO DE POPUP
// Variables asociadas a los objetos HTML
const container = document.getElementById("popup");
const content = document.getElementById("popup-content");
const closer = document.getElementById("popup-closer");

// Evento para ocultar popup
closer.onclick = function () {
  overlayPopup.setPosition(undefined);
  closer.blur();
  return false;
};

// Objeto overlay para el popup
const overlayPopup = new Overlay({
  element: container,
  autoPan: true,
  autoPanAnimation: {
    duration: 250,
  },
});
/// FIN DE POPUP



/// INICIO DEL MAPA
const map = new Map({
  target: 'map',
  layers: [MTN50Layer, PNOALayer, osmLayer, caminosSantiagoLayer],
  view: new View({
    center: centerSpain_4326,
    zoom: 6,
    maxZoom: 16,
    minZoom: 3,
    extent: extentSpain
  }),
  controls: defaultControls({
    zoom: true,
    attribution: true,
    rotate: true,
  }).extend(extendControls),
  overlays: [overlayPopup],
});
/// FIN DEL MAPA



/// EVENTO QUE MUESTRA LA INFORMACIÓN DEL POPUP
map.on("singleclick", function (evt) {
  // Función consulta de datos de la capa vectorial
  let info = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
    let nombre_feature = feature.get("nombre");
    let agrupacion_feature = feature.get("agrupacion");
    let data = [nombre_feature, agrupacion_feature]; // Almacenamos los datos en un array
    return data;
  });

  if (info) {
    container.style.display = "block";
    const coordinate = evt.coordinate;
    // Añadimos el contenido al HTML
    content.innerHTML = `<h3><u>Información</u></h3>
                          <p><b>Nombre</b>: ${info[0]}</p>
                          <p><b>Agrupación</b>: ${info[1]}</p>`;
    // Presenta la ventana en las coordenadas
    overlayPopup.setPosition(coordinate);
  } else {
    container.style.display = "none";
  }
});

// Cambia el cursor al pasar por encima de una feature
map.on("pointermove", function (evt) {
  map.getTargetElement().style.cursor = map.hasFeatureAtPixel(evt.pixel)
    ? "pointer"
    : "";
});
/// FIN DEL EVENTO QUE MUESTRA LA INFORMACIÓN DEL POPUP