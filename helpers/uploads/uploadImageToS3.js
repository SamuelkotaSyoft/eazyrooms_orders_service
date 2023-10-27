import AWS from "aws-sdk";
import multer from "multer";
import { v4 as uuid } from "uuid";

// Set up AWS SDK
const s3 = new AWS.S3({
  accessKeyId: process.env.S3_KEY,
  secretAccessKey: process.env.S3_SECRET,
  region: process.env.S3_REGION,
});

// Set up Multer middleware for handling image uploads
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // limit file size to 5MB
  },
  fileFilter: (req, file, cb) => {
    // validate file types
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/gif"
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only JPEG, PNG and GIF files are allowed."
        )
      );
    }
  },
}).single("image"); // the name of the file input field

const uploadImageToS3 = (req, res, next) => {
  imageUpload(req, res, (err) => {
    const uid = req.user_info.main_uid;

    if (req.file) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      // Get the uploaded file from the request object
      const file = req?.file;

      // Generate a unique filename for the file
      const filename = `${uuid()}_${file?.originalname}`;

      // Set up the S3 upload parameters
      const params = {
        Bucket: process.env.S3_BUCKET,
        Key: `images/${uid}/${filename}`,
        Body: file?.buffer,
        ContentType: file?.mimetype,
        // ACL: "public-read", // set file permissions to public
      };

      // Upload the file to S3
      s3.upload(params, (err, data) => {
        if (err) {
          console.log('upload file', err);
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

export { uploadImageToS3 };
