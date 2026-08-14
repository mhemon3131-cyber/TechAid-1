// ==========================================================
// OPENSTREETMAP / NOMINATIM SERVICE
//
// Member 4 - Automatic Technician Assignment
//
// Main jobs:
//
// 1. Bangladesh location search
// 2. Dhaka-style location search improve kora
// 3. Search suggestions return kora
// 4. Coordinate -> address
// 5. Customer-Technician distance calculate
// ==========================================================


const NOMINATIM_URL =
  'https://nominatim.openstreetmap.org';


// ==========================================================
// REQUEST HEADERS
// ==========================================================

const getHeaders = () => ({
  'User-Agent':
    'TechAid-CSE471-University-Project/1.0',

  'Accept-Language':
    'en'
});


// ==========================================================
// CALL NOMINATIM SEARCH
//
// Ei helper ekta query diye search kore.
// ==========================================================

const runSearch = async (
  query,
  limit = 5
) => {

  const params =
    new URLSearchParams({
      q: query,

      format: 'json',

      addressdetails: '1',

      limit:
        String(limit),

      // Bangladesh results only
      countrycodes: 'bd'
    });


  const response =
    await fetch(
      `${NOMINATIM_URL}/search?${params.toString()}`,
      {
        headers:
          getHeaders()
      }
    );


  if (!response.ok) {

    throw new Error(
      'OpenStreetMap location search failed.'
    );
  }


  const results =
    await response.json();


  return results.map(
    (item) => ({

      latitude:
        Number(item.lat),

      longitude:
        Number(item.lon),

      displayName:
        item.display_name,

      address:
        item.address || {},

      importance:
        Number(
          item.importance || 0
        )
    })
  );
};


// ==========================================================
// CREATE BETTER SEARCH VARIANTS
//
// Nominatim sob shomoy:
//
// "Dhanmondi 15"
//
// perfectly understand na-o korte pare.
//
// Tai multiple smart variations search kori:
//
// Dhanmondi 15
// Dhanmondi 15, Dhaka
// Dhanmondi 15, Dhaka, Bangladesh
// Road 15, Dhanmondi, Dhaka
//
// Ete map search onek reliable hobe.
// ==========================================================

const createSearchVariants = (
  originalQuery
) => {

  const query =
    originalQuery
      .trim()
      .replace(/\s+/g, ' ');


  const variants = [
    query,

    `${query}, Dhaka`,

    `${query}, Dhaka, Bangladesh`
  ];


  // ========================================================
  // Example:
  //
  // "Dhanmondi 15"
  //
  // detect kore:
  //
  // area = Dhanmondi
  // road = 15
  //
  // then:
  //
  // Road 15, Dhanmondi, Dhaka
  // ========================================================

  const numberMatch =
    query.match(
      /^(.+?)\s+(\d+[A-Za-z]?)$/
    );


  if (numberMatch) {

    const area =
      numberMatch[1].trim();

    const number =
      numberMatch[2].trim();


    variants.push(
      `Road ${number}, ${area}, Dhaka`
    );


    variants.push(
      `${area} Road ${number}, Dhaka`
    );


    variants.push(
      `Road ${number}, ${area}, Dhaka, Bangladesh`
    );
  }


  // Duplicate query remove
  return [
    ...new Set(variants)
  ];
};


// ==========================================================
// SEARCH BANGLADESH LOCATIONS
//
// User:
// "Dhanmondi 15"
//
//          ↓
//
// Multiple search variants
//
//          ↓
//
// OpenStreetMap matching results
//
//          ↓
//
// Best results first
// ==========================================================

export const searchBangladeshLocations =
  async (query) => {

    if (
      !query ||
      !query.trim()
    ) {

      return [];
    }


    const searchVariants =
      createSearchVariants(
        query
      );


    let allResults = [];


    // ======================================================
    // Search variants one by one
    //
    // Public Nominatim-ke unnecessary huge number of
    // requests dibo na.
    // ======================================================

    for (
      const searchQuery
      of searchVariants
    ) {

      try {

        const results =
          await runSearch(
            searchQuery,
            5
          );


        allResults.push(
          ...results
        );


        // Enough results pele ar extra query lagbe na
        if (
          allResults.length >= 8
        ) {
          break;
        }


      } catch (error) {

        console.log(
          'OSM search variant failed:',
          searchQuery,
          error.message
        );
      }
    }


    // ======================================================
    // DUPLICATE LOCATION REMOVE
    //
    // Same coordinate multiple query theke aste pare.
    // ======================================================

    const uniqueMap =
      new Map();


    for (
      const location
      of allResults
    ) {

      const key =
        `${location.latitude.toFixed(5)}-${location.longitude.toFixed(5)}`;


      if (
        !uniqueMap.has(key)
      ) {

        uniqueMap.set(
          key,
          location
        );
      }
    }


    let uniqueResults =
      Array.from(
        uniqueMap.values()
      );


    // ======================================================
    // BEST RESULTS FIRST
    //
    // Nominatim importance score use kori.
    // ======================================================

    uniqueResults =
      uniqueResults.sort(
        (
          a,
          b
        ) =>
          b.importance -
          a.importance
      );


    return uniqueResults.slice(
      0,
      6
    );
  };


// ==========================================================
// GEOCODE LOCATION
//
// Address -> best coordinate
// ==========================================================

export const geocodeDhakaLocation =
  async (address) => {

    if (
      !address ||
      !address.trim()
    ) {

      throw new Error(
        'Location address is required.'
      );
    }


    const results =
      await searchBangladeshLocations(
        address
      );


    if (
      results.length === 0
    ) {

      throw new Error(
        'Location not found on OpenStreetMap.'
      );
    }


    return results[0];
  };


// ==========================================================
// REVERSE GEOCODE
//
// Latitude + longitude
//
//          ↓
//
// OpenStreetMap readable address
// ==========================================================

export const reverseGeocodeLocation =
  async (
    latitude,
    longitude
  ) => {

    const params =
      new URLSearchParams({

        lat:
          String(latitude),

        lon:
          String(longitude),

        format:
          'json',

        addressdetails:
          '1',

        zoom:
          '18'
      });


    const response =
      await fetch(
        `${NOMINATIM_URL}/reverse?${params.toString()}`,
        {
          headers:
            getHeaders()
        }
      );


    if (!response.ok) {

      throw new Error(
        'OpenStreetMap reverse geocoding failed.'
      );
    }


    const result =
      await response.json();


    if (
      !result ||
      result.error
    ) {

      throw new Error(
        'Unable to determine this location.'
      );
    }


    return {

      latitude:
        Number(result.lat),

      longitude:
        Number(result.lon),

      displayName:
        result.display_name,

      address:
        result.address || {}
    };
  };


// ==========================================================
// HAVERSINE DISTANCE
//
// Customer coordinate
//           +
// Technician coordinate
//
//           ↓
//
// Straight-line distance in KM
// ==========================================================

export const calculateDistanceKm =
  (
    latitude1,
    longitude1,
    latitude2,
    longitude2
  ) => {

    const earthRadiusKm =
      6371;


    const toRadians =
      (degree) =>
        degree *
        Math.PI /
        180;


    const lat1 =
      toRadians(
        latitude1
      );


    const lat2 =
      toRadians(
        latitude2
      );


    const deltaLatitude =
      toRadians(
        latitude2 -
        latitude1
      );


    const deltaLongitude =
      toRadians(
        longitude2 -
        longitude1
      );


    const a =
      Math.sin(
        deltaLatitude / 2
      ) ** 2 +

      Math.cos(lat1) *

      Math.cos(lat2) *

      Math.sin(
        deltaLongitude / 2
      ) ** 2;


    const c =
      2 *
      Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
      );


    return Number(
      (
        earthRadiusKm *
        c
      ).toFixed(2)
    );
  };