import chroma from 'chroma-js';

type RGB = [number, number, number];

// Calculate euclidean distance between two RGB colors
const distance = (color1: RGB, color2: RGB): number => {
  return Math.sqrt(
    Math.pow(color1[0] - color2[0], 2) +
    Math.pow(color1[1] - color2[1], 2) +
    Math.pow(color1[2] - color2[2], 2)
  );
};

// Main K-means clustering function
export const extractColors = (imageData: Uint8ClampedArray, k: number): string[] => {
  const pixels: RGB[] = [];
  
  // Sample pixels to improve performance (e.g., skip every 10th pixel)
  const step = 4 * 10; 
  for (let i = 0; i < imageData.length; i += step) {
    // Ignore fully transparent pixels
    if (imageData[i + 3] > 125) {
      pixels.push([imageData[i], imageData[i + 1], imageData[i + 2]]);
    }
  }

  if (pixels.length === 0) return [];

  // Initialize centroids randomly from the pixels
  let centroids: RGB[] = [];
  for (let i = 0; i < k; i++) {
    const randomIdx = Math.floor(Math.random() * pixels.length);
    centroids.push(pixels[randomIdx]);
  }

  const maxIterations = 10;
  for (let iter = 0; iter < maxIterations; iter++) {
    // Assign pixels to nearest centroid
    const clusters: RGB[][] = Array.from({ length: k }, () => []);
    
    for (const pixel of pixels) {
      let minDist = Infinity;
      let minIdx = 0;
      for (let i = 0; i < centroids.length; i++) {
        const d = distance(pixel, centroids[i]);
        if (d < minDist) {
          minDist = d;
          minIdx = i;
        }
      }
      clusters[minIdx].push(pixel);
    }

    // Update centroids
    let changed = false;
    for (let i = 0; i < k; i++) {
      const cluster = clusters[i];
      if (cluster.length > 0) {
        const sum = cluster.reduce((acc, val) => [acc[0] + val[0], acc[1] + val[1], acc[2] + val[2]], [0, 0, 0]);
        const newCentroid: RGB = [
          Math.round(sum[0] / cluster.length),
          Math.round(sum[1] / cluster.length),
          Math.round(sum[2] / cluster.length)
        ];
        if (distance(centroids[i], newCentroid) > 0) {
          changed = true;
          centroids[i] = newCentroid;
        }
      }
    }
    
    if (!changed) break;
  }

  // Convert centroids back to hex
  return centroids.map(c => chroma(c).hex());
};
