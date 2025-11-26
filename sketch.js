////Nhan Le
// Professor: Andre Skupin
//Project: Interactive FDA Recall
// Using Dan Schiffman's videos and ChatGPT to check for mishap and assitance


let api ="https://api.fda.gov/drug/enforcement.json?";
let apikey ="api_key=P7QaQlQSDrNxWp9zw4ikaK6x4Gcah2GA5yjDTlTf";
let geoapi ="https://nominatim.openstreetmap.org/search?";
let input;
let button;
let yStart, yEnd;
let map;


let CLASS_COLORS={
  "Class I":"#fef0d9",
  "Class II":"#fdcc8a",
  "Class III":"#fc8d59",
};


let markersLayer;


let STATE_CENTROIDS = {
  "AL": [32.806671, -86.791130], "AK": [61.370716, -152.404419],
  "AZ": [33.729759, -111.431221], "AR": [34.969704, -92.373123],
  "CA": [36.116203, -119.681564], "CO": [39.059811, -105.311104],
  "CT": [41.597782, -72.755371],  "DE": [39.318523, -75.507141],
  "FL": [27.766279, -81.686783],  "GA": [33.040619, -83.643074],
  "HI": [21.094318, -157.498337], "ID": [44.240459, -114.478828],
  "IL": [40.349457, -88.986137],  "IN": [39.849426, -86.258278],
  "IA": [42.011539, -93.210526],  "KS": [38.526600, -96.726486],
  "KY": [37.668140, -84.670067],  "LA": [31.169546, -91.867805],
  "ME": [44.693947, -69.381927],  "MD": [39.063946, -76.802101],
  "MA": [42.230171, -71.530106],  "MI": [43.326618, -84.536095],
  "MN": [45.694454, -93.900192],  "MS": [32.741646, -89.678696],
  "MO": [38.456085, -92.288368],  "MT": [46.921925, -110.454353],
  "NE": [41.125370, -98.268082],  "NV": [38.313515, -117.055374],
  "NH": [43.452492, -71.563896],  "NJ": [40.298904, -74.521011],
  "NM": [34.840515, -106.248482], "NY": [42.165726, -74.948051],
  "NC": [35.630066, -79.806419],  "ND": [47.528912, -99.784012],
  "OH": [40.388783, -82.764915],  "OK": [35.565342, -96.928917],
  "OR": [44.572021, -122.070938], "PA": [40.590752, -77.209755],
  "RI": [41.680893, -71.511780],  "SC": [33.856892, -80.945007],
  "SD": [44.299782, -99.438828],  "TN": [35.747845, -86.692345],
  "TX": [31.054487, -97.563461],  "UT": [40.150032, -111.862434],
  "VT": [44.045876, -72.710686],  "VA": [37.769337, -78.169968],
  "WA": [47.400902, -121.490494], "WV": [38.491226, -80.954453],
  "WI": [44.268543, -89.616508],  "WY": [42.755966, -107.302490],
  "DC": [38.9072, -77.0369],      "PR": [18.2208, -66.5901]
};

function setup() {
  noCanvas();
  map = L.map('mapid').setView([32.7157, -117.1611], 13);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
  
  markersLayer = L.layerGroup().addTo(map);
  
input = select("#brandInput");
button = select("#submit");
yStart = select("#yearStart");
yEnd = select("#yearEnd");
populateYears();
button.mousePressed(fetchRecallsforBrand);}

//this one is basically get year and fill into the dropdown list, not relate to query send to FDA 
function populateYears(){
  let MIN = 2004;
  let MAX = new Date().getFullYear();
  
  yStart.elt.innerHTML="";
  yEnd.elt.innerHTML="";
  
  for(let i = MIN;i<=MAX;i++) {
    yStart.elt.add(new Option(i,i));
    yEnd.elt.add(new Option(i,i));
    }
  
  yStart.value(MAX - 2);
  yEnd.value(MAX);
}

//getting the user input year and transforming it to int so it can be paste into query. 
function getYear(){
  let MIN = 2004;
  let MAX = new Date().getFullYear();
  let ys = parseInt(yStart.value(),10);
  let ye = parseInt(yEnd.value(),10);
//return { ys, ye, since: `${ys}0101`, until: `${ye}1231` }; the suggested way, imma do it my way like ??
  return{ys,ye};
} 
 
function fetchRecallsforBrand(){
  let {ys,ye}=getYear();
  let filterdate= "+AND+report_date:[" + ys + "0101+TO+" + ye + "1231]";
  let encBrand = encodeURIComponent('"'+input.value()+'"'); //keeping "Tylenol" as ("Tylenol") to not disrupt query
  let url1 = api + apikey + "&search=openfda.brand_name:" + encBrand + filterdate + "&limit=500";
  console.log("url1:", url1);
  
  let url2 = api + apikey + "&search=product_description:" + encBrand + filterdate + "&limit=500";
  console.log("url2:", url2);

  
loadJSON(
    url1,
    function onBrandSuccess(data1) {
      if (data1 && data1.results && data1.results.length > 0) {
        gotData(data1); 
      } else {
        loadJSON(
          url2,
          function onDescSuccess(data2) {
            if (data2 && data2.results && data2.results.length > 0) {
              gotData(data2); 
            } else {
              gotData({ results: [] }); 
            }
          },
          function onDescError(err2) {
            console.error("desc failed:", err2);
            gotData({ results: [] });
          }
        );
      }
    },
    function onBrandError(err1) {
      console.error("brand failed:", err1);
      loadJSON(
        url2,
        function onDescSuccess(data2) {
          gotData(data2 || { results: [] });
        },
        function onDescError(err2) {
          console.error("desc failed:", err2);
          gotData({ results: [] });
        }
      );
    }
  );
}

function gotData(data) {
  let results = (data && data.results) ? data.results : [];
  console.log(`OpenFDA returned ${results.length} records.`);
  if (!results.length) return;
  markersLayer.clearLayers();
  let latlong=[];
// for every item inside the array called results create the variable rec that holds the item
  
  for (let rec of results) {
//read city and state
    let state = ((rec.state||"").trim().toUpperCase());
    let city = ((rec.city||"").trim());
    
//lookup coordinate by states
    let coords = STATE_CENTROIDS [state];
    
//choose a color by classname and if no class write Unknown and color black
    let cls = (rec.classification||"Unknown").trim();
    let color = CLASS_COLORS[cls]||"#6b7280";
    
//choose a brand to show
    let brand = rec.brand_name||"Brand not listed";
    if (rec.openfda && rec.openfda.brand_name) {
     brand = rec.openfda.brand_name;}
    
//building popup
  let popupHTML =`
  <div style="max-width:320px;font:13px/1.4 Verdana;">
        <div style="font-weight:600;margin-bottom:4px;">${brand}</div>
        <div style="color:#374151;margin-bottom:6px;">${rec.product_description || "—"}</div>
        <div><strong>Class:</strong> ${cls}</div>
        <div><strong>Location:</strong> ${city || "—"}, ${state || "—"}</div>
        <div><strong>Reason:</strong> ${rec.reason_for_recall || "—"}</div>
        <div><strong>Recalling firm:</strong> ${rec.recalling_firm || "—"}</div>
      </div>`;
L.circleMarker(coords,{radius: 10,color:color, fillColor:color,fillOpacity: 0.9,}).addTo(markersLayer).bindPopup(popupHTML);
    
    latlong.push(coords);
  }
    
if (latlong.length) {
    let bounds = L.latLngBounds(latlong);
    map.fitBounds(bounds.pad(0.2));
  }}

//GEOCODING

    
  
  

