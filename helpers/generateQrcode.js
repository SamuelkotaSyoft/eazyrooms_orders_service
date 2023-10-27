import qrCode from "qrcode";

async function generateQrcode(qrData) {
  const qrCodeLink = new Promise(async (resolve, reject) => {
    await qrCode.toDataURL(qrData, function (err, data) {
      if (err) reject(err);
      resolve(data);
    });
  });
  return qrCodeLink
    .then((qrLink) => {
      return qrLink;
    })
    .catch((err) => {
      return;
    });
}

export { generateQrcode };
