import { getAuth } from "firebase-admin/auth";
import * as fs from "firebase-admin/firestore";
import axios from "axios";
import { fileTypeFromBuffer } from "file-type";

const fb = fs.getFirestore();

const uploadImageToWhatsapp = async (req, res, next) => {
  var uid;
  var apiKey;

  uid = req.fb_info.uid;
  // console.log("🚀 ~ file: ~ uid:", uid);

  await fb
    .collection("wa_key")
    .doc(uid)
    .get()
    .then((querySnapshot) => {
      // console.log("SNAPSHOT :>> ", querySnapshot.data());
      apiKey = querySnapshot.data().apiKey;
    })
    .catch((err) => {
      res.status(403).json(err);
    });

  const fileContents = req.body;
  // console.log("BUFFER.....", Buffer.from(fileContents, "buffer"));

  const buffer = Buffer.from(fileContents, "buffer");

  const fileTypeBuffer = await fileTypeFromBuffer(buffer);

  const mime = fileTypeBuffer.mime;

  // console.log("MIME.....", mime);
  // console.log("FILE CONTENTS.....", fileContents);

  await axios
    .post(
      "https://waba.360dialog.io/v1/media/",
      Buffer.from(fileContents, "buffer"),
      {
        headers: {
          "D360-API-KEY": apiKey,
          "Content-Type": mime,
        },
      }
    )
    .then((response) => {
      // console.log("RESPONSE........", JSON.stringify(response.data));
      req.mediaId = response.data.media[0].id;
      req.fileType = mime;
      // res.status(200).json(response.data);
      next();
    })
    .catch((error) => {
      // console.log("ERROR..............", error);
      res.status(500).json(error);
    });
};

export { uploadImageToWhatsapp };
