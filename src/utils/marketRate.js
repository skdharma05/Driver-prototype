/**
 * Calculates suggested market rate based on distance and vehicle type
 * @param {number} distanceKm - Distance in kilometers
 * @param {string} vehicleType - Type of vehicle
 * @returns {object} - { min, max } suggests
 */
export const calculateMarketRate = (distanceKm, vehicleType) => {
  const ratePerKm = {
    '16-ft Open Truck': { min: 55, max: 65 },
    '22-ft Closed Truck': { min: 65, max: 75 },
    'Mini Truck': { min: 40, max: 50 },
    'Container': { min: 75, max: 90 },
  };

  // Default rate if type not found
  const rate = ratePerKm[vehicleType] || { min: 60, max: 70 };

  // Helper to round to nearest 500
  const roundTo500 = (num) => Math.round(num / 500) * 500;

  return {
    min: roundTo500(distanceKm * rate.min),
    max: roundTo500(distanceKm * rate.max),
  };
};
