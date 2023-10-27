import AWS from "aws-sdk";
import multer from "multer";
import { v4 as uuid } from "uuid";

// Set up AWS SDK
const s3 = new AWS.S3({
  accessKeyId: process.env.S3_KEY,
  secretAccessKey: process.env.S3_SECRET,
  region: process.env.S3_REGION,
});

// Set up Multer middleware for handling document uploads
const uploadAudio = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 16 * 1024 * 1024, // limit file size to 16MB
  },
  fileFilter: (req, file, cb) => {
    // validate file types
    if (
      file.mimetype === "audio/x-aac" ||
      file.mimetype === "audio/aac" ||
      file.mimetype === "audio/vnd.dlna.adts" ||
      file.mimetype === "audio/ac3" ||
      file.mimetype === "audio/x-ac3" ||
      file.mimetype === "audio/vnd.dolby.dd-raw"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only aac and ac3 files are allowed."));
    }
  },
}).single("audio"); // the name of the file input field

const uploadAudioToS3 = (req, res, next) => {
  uploadAudio(req, res, (err) => {
    console.log("MULTER", req.file);

    const uid = req.user_info.main_uid;

    if (req.file) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      // Get the uploaded file from the request object
      const file = req?.file;
      // console.log("FILE...", file);

      // Generate a unique filename for the file
      const filename = `${uuid()}_${file?.originalname}`;

      // Set up the S3 upload parameters
      const params = {
        Bucket: process.env.S3_BUCKET,
        Key: `audio/${uid}/${filename}`,
        Body: file?.buffer,
        ContentType: file?.mimetype,
        // ACL: "public-read", // set file permissions to public
      };

      // Upload the file to S3
      s3.upload(params, (err, data) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Failed to upload file." });
        }
        // Add the uploaded file's S3 URL to the request object for use in next middleware
        req.fileUrl = data.Location;
        req.fileType = file.mimetype;
        next();
      });
    } else {
      next();
    }
  });
};

export { uploadAudioToS3 };

