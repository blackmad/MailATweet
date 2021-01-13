module.exports = {
  uploadFile: uploadToGoogle,
  makePath: makePath,
};

var randomstring = require("randomstring");
const { Storage } = require("@google-cloud/storage");
const format = require("util").format;
const process = require("process"); // Required to mock environment variables

const storage = Storage();

// A bucket is a container for objects (files).
const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET);

function makePath(path) {
  if (!path.endsWith(".png")) {
    path += ".png";
  }
  return format(`https://storage.googleapis.com/${bucket.name}/${path}`);
}

function uploadToGoogle(fileBuffer, callback) {
  // var fileBuffer = fs.readFileSync(localFilePath);
  // var metaData = getContentTypeByFile(fileName);
  const key = randomstring.generate();

  const remoteFilename = key + ".png";
  const remotePath = makePath(remoteFilename);

  // Create a new blob in the bucket and upload the file data.
  const blob = bucket.file(remoteFilename);
  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: "image/png",
      metadata: {
        custom: "metadata",
      },
    },
  });

  blobStream.on("error", (err) => {
    next(err);
  });

  console.log("putting on google at " + remotePath);

  blobStream.on("finish", () => {
    console.log("uploaded to " + remotePath);
    callback({
      id: key,
      path: remotePath,
    });
  });

  blobStream.end(fileBuffer);
}
