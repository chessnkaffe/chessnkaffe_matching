// src/utils/cafeData.ts
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface OpeningHours {
  open: string;
  close: string;
}

export interface DailyHours {
  monday: OpeningHours;
  tuesday: OpeningHours;
  wednesday: OpeningHours;
  thursday: OpeningHours;
  friday: OpeningHours;
  saturday: OpeningHours;
  sunday: OpeningHours;
}

export interface Features {
  hasChessSets: boolean;
  hasWifi: boolean;
  hasOutdoorSeating: boolean;
  noiseLevel: string;
}

export interface Ratings {
  overall: number;
  chessAtmosphere: number | null;
}

export interface Cafe {
  id: string;
  name: string;
  neighborhood: string;
  address: string;
  coordinates: Coordinates;
  features: Features;
  openingHours: DailyHours;
  ratings: Ratings;
  photos: string[];
}

export const copenhagenCafes = [
    {
      "id": "unique-by-grace",
      "name": "Unique by Grace Café",
      "neighborhood": "2200 Nørrebro",
      "address": "Griffenfeldsgade 54, 2200 København N",
      "coordinates": {
        "lat": 55.6877,
        "lng": 12.5493
      },
      "features": {
        "hasChessSets": false,
        "hasWifi": true,
        "hasOutdoorSeating": false,
        "noiseLevel": "moderate"
      },
      "openingHours": {
        "monday": { "open": "Closed", "close": "Closed" },
        "tuesday": { "open": "08:00", "close": "18:00" },
        "wednesday": { "open": "08:00", "close": "18:00" },
        "thursday": { "open": "08:00", "close": "18:00" },
        "friday": { "open": "08:00", "close": "18:00" },
        "saturday": { "open": "11:00", "close": "15:00" },
        "sunday": { "open": "11:00", "close": "15:00" }
      },
      "ratings": {
        "overall": 4.8,
        "chessAtmosphere": null
      },
      "photos": ["url1", "url2"]
    },
    {
      "id": "cafe-mellemrummet",
      "name": "Café Mellemrummet",
      "neighborhood": "2200 Nørrebro",
      "address": "Ravnsborggade 11, 2200 København N",
      "coordinates": {
        "lat": 55.6872,
        "lng": 12.5634
      },
      "features": {
        "hasChessSets": false,
        "hasWifi": true,
        "hasOutdoorSeating": true,
        "noiseLevel": "moderate"
      },
      "openingHours": {
        "monday": { "open": "10:00", "close": "23:00" },
        "tuesday": { "open": "10:00", "close": "23:00" },
        "wednesday": { "open": "10:00", "close": "23:00" },
        "thursday": { "open": "10:00", "close": "23:00" },
        "friday": { "open": "10:00", "close": "00:00" },
        "saturday": { "open": "10:00", "close": "00:00" },
        "sunday": { "open": "10:00", "close": "16:30" }
      },
      "ratings": {
        "overall": 4.6,
        "chessAtmosphere": null
      },
      "photos": ["url1", "url2"]
    },
    {
      "id": "oscar-bar-cafe",
      "name": "Oscar Bar | Café",
      "neighborhood": "1550 København V",
      "address": "Regnbuepladsen 9, 1550 København",
      "coordinates": {
        "lat": 55.6761,
        "lng": 12.5683
      },
      "features": {
        "hasChessSets": false,
        "hasWifi": true,
        "hasOutdoorSeating": true,
        "noiseLevel": "moderate"
      },
      "openingHours": {
        "monday": { "open": "11:00", "close": "23:00" },
        "tuesday": { "open": "11:00", "close": "23:00" },
        "wednesday": { "open": "11:00", "close": "23:00" },
        "thursday": { "open": "11:00", "close": "23:00" },
        "friday": { "open": "11:00", "close": "02:00" },
        "saturday": { "open": "11:00", "close": "02:00" },
        "sunday": { "open": "11:00", "close": "23:00" }
      },
      "ratings": {
        "overall": 4.4,
        "chessAtmosphere": null
      },
      "photos": ["url1", "url2"]
    },
    {
      "id": "send-flere-krydderier",
      "name": "Send Flere Krydderier",
      "neighborhood": "2200 Nørrebro",
      "address": "Nørrebrogade 208, 2200 København N",
      "coordinates": {
        "lat": 55.6938,
        "lng": 12.5525
      },
      "features": {
        "hasChessSets": false,
        "hasWifi": true,
        "hasOutdoorSeating": true,
        "noiseLevel": "moderate"
      },
      "openingHours": {
        "monday": { "open": "08:00", "close": "20:00" },
        "tuesday": { "open": "08:00", "close": "20:00" },
        "wednesday": { "open": "08:00", "close": "20:00" },
        "thursday": { "open": "08:00", "close": "20:00" },
        "friday": { "open": "08:00", "close": "20:00" },
        "saturday": { "open": "09:00", "close": "18:00" },
        "sunday": { "open": "09:00", "close": "18:00" }
      },
      "ratings": {
        "overall": 4.7,
        "chessAtmosphere": null
      },
      "photos": ["url1", "url2"]
    },
    {
      "id": "folkets-cafe",
      "name": "Folkets Café",
      "neighborhood": "2200 Nørrebro",
      "address": "Stengade 50, 2200 København N",
      "coordinates": {
        "lat": 55.6839,
        "lng": 12.5611
      },
      "features": {
        "hasChessSets": true,
        "hasWifi": true,
        "hasOutdoorSeating": true,
        "noiseLevel": "moderate"
      },
      "openingHours": {
        "monday": { "open": "Closed", "close": "Closed" },
        "tuesday": { "open": "10:00", "close": "22:00" },
        "wednesday": { "open": "10:00", "close": "20:00" },
        "thursday": { "open": "10:00", "close": "20:00" },
        "friday": { "open": "10:00", "close": "20:00" },
        "saturday": { "open": "Closed", "close": "Closed" },
        "sunday": { "open": "10:00", "close": "18:00" }
      },
      "ratings": {
        "overall": 4.9,
        "chessAtmosphere": null
      },
      "photos": ["url1", "url2"]
    },
    {
        "id": "absalon",
        "name": "Absalon",
        "neighborhood": "1651 Vesterbro",
        "address": "Sønder Boulevard 73, 1651 København V",
        "coordinates": {
        "lat": 55.6689,
        "lng": 12.5490
        },
        "features": {
        "hasChessSets": false,
        "hasWifi": true,
        "hasOutdoorSeating": true,
        "noiseLevel": "moderate"
        },
        "openingHours": {
        "monday": { "open": "07:00", "close": "00:00" },
        "tuesday": { "open": "07:00", "close": "00:00" },
        "wednesday": { "open": "07:00", "close": "00:00" },
        "thursday": { "open": "07:00", "close": "00:00" },
        "friday": { "open": "07:00", "close": "02:00" },
        "saturday": { "open": "07:00", "close": "02:00" },
        "sunday": { "open": "07:00", "close": "00:00" }
        },
        "ratings": {
        "overall": 4.7,
        "chessAtmosphere": null
        },
        "photos": ["url1", "url2"]
    },
    {
        "id": "gonzo",
        "name": "Gonzo",
        "neighborhood": "2200 Nørrebro",
        "address": "Jægersborggade 32, 2200 København N",
        "coordinates": {
        "lat": 55.6930,
        "lng": 12.5498
        },
        "features": {
        "hasChessSets": false,
        "hasWifi": true,
        "hasOutdoorSeating": false,
        "noiseLevel": "moderate"
        },
        "openingHours": {
        "monday": { "open": "08:00", "close": "22:00" },
        "tuesday": { "open": "08:00", "close": "22:00" },
        "wednesday": { "open": "08:00", "close": "22:00" },
        "thursday": { "open": "08:00", "close": "22:00" },
        "friday": { "open": "08:00", "close": "23:00" },
        "saturday": { "open": "09:00", "close": "23:00" },
        "sunday": { "open": "09:00", "close": "21:00" }
        },
        "ratings": {
        "overall": 4.5,
        "chessAtmosphere": null
        },
        "photos": ["url1", "url2"]
    },
    {
        "id": "kube",
        "name": "KU.BE",
        "neighborhood": "2000 Frederiksberg",
        "address": "Dirch Passers Allé 4, 2000 Frederiksberg",
        "coordinates": {
        "lat": 55.6794,
        "lng": 12.5164
        },
        "features": {
        "hasChessSets": false,
        "hasWifi": true,
        "hasOutdoorSeating": true,
        "noiseLevel": "moderate"
        },
        "openingHours": {
        "monday": { "open": "08:00", "close": "22:00" },
        "tuesday": { "open": "08:00", "close": "22:00" },
        "wednesday": { "open": "08:00", "close": "22:00" },
        "thursday": { "open": "08:00", "close": "22:00" },
        "friday": { "open": "08:00", "close": "22:00" },
        "saturday": { "open": "09:00", "close": "18:00" },
        "sunday": { "open": "09:00", "close": "18:00" }
        },
        "ratings": {
        "overall": 4.6,
        "chessAtmosphere": null
        },
        "photos": ["url1", "url2"]
    },
    {
        "id": "sweet-surrender",
        "name": "Sweet Surrender",
        "neighborhood": "2450 Sydhavnen",
        "address": "Egilsgade 10, 2300 København S",
        "coordinates": {
        "lat": 55.6651,
        "lng": 12.5543
        },
        "features": {
        "hasChessSets": false,
        "hasWifi": true,
        "hasOutdoorSeating": false,
        "noiseLevel": "quiet"
        },
        "openingHours": {
        "monday": { "open": "09:00", "close": "17:00" },
        "tuesday": { "open": "09:00", "close": "17:00" },
        "wednesday": { "open": "09:00", "close": "17:00" },
        "thursday": { "open": "09:00", "close": "17:00" },
        "friday": { "open": "09:00", "close": "17:00" },
        "saturday": { "open": "10:00", "close": "15:00" },
        "sunday": { "open": "Closed", "close": "Closed" }
        },
        "ratings": {
        "overall": 4.3,
        "chessAtmosphere": null
        },
        "photos": ["url1", "url2"]
    },
    {
        "id": "kanalhuset",
        "name": "Kanalhuset",
        "neighborhood": "1415 Christianshavn",
        "address": "Ovengaden Oven Vande 62, 1415 København",
        "coordinates": {
        "lat": 55.6733,
        "lng": 12.5921
        },
        "features": {
        "hasChessSets": false,
        "hasWifi": true,
        "hasOutdoorSeating": true,
        "noiseLevel": "moderate"
        },
        "openingHours": {
        "monday": { "open": "07:30", "close": "22:00" },
        "tuesday": { "open": "07:30", "close": "22:00" },
        "wednesday": { "open": "07:30", "close": "22:00" },
        "thursday": { "open": "07:30", "close": "22:00" },
        "friday": { "open": "07:30", "close": "00:00" },
        "saturday": { "open": "08:00", "close": "00:00" },
        "sunday": { "open": "08:00", "close": "22:00" }
        },
        "ratings": {
        "overall": 4.6,
        "chessAtmosphere": null
        },
        "photos": ["url1", "url2"]
    }
]
    



