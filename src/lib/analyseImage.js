/**
 * Analyse an uploaded image file.
 * Detects file type, vector status, basic colour info.
 */
export async function analyseImage(file) {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();
  const isVector = /(\.svg|\.eps|\.pdf)$/.test(fileName) || fileType.includes('svg') || fileType.includes('postscript');

  let colorCount = 0;
  let dominantColor = null;

  if (!isVector && fileType.startsWith('image/')) {
    const imageBitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(imageBitmap, 0, 0);
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const colorMap = {};
    for (let i = 0; i < data.length; i += 4) {
      const rgb = `${data[i]},${data[i+1]},${data[i+2]}`;
      colorMap[rgb] = (colorMap[rgb] || 0) + 1;
    }

    const sorted = Object.entries(colorMap).sort((a, b) => b[1] - a[1]);
    colorCount = sorted.length;
    dominantColor = sorted[0]?.[0] || null;
  }

  return {
    type: fileType,
    isVector,
    colorCount,
    dominantColor
  };
}
