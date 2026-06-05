const multer = require("multer");

// Keep the file in memory so we can stream the buffer straight to S3
// without writing to the EC2 disk.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

module.exports = upload;
