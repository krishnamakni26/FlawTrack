const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/middleware/upload.middleware.js');

const newContent = `const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const env = require('../config/env');

const uploadDir = path.resolve(process.cwd(), env.UPLOAD_DIR);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Allowed MIME types and extensions
const ALLOWED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/json',
  'application/zip',
  'application/x-zip-compressed',
  'application/octet-stream', // checked with extension
]);

const ALLOWED_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.pdf',
  '.txt',
  '.log',
  '.csv',
  '.json',
  '.zip',
]);

// BUG-002 fix: extensions that are dangerous even when embedded in the filename
// Prevents double-extension attacks such as shell.php.png
const DANGEROUS_EXTENSIONS = new Set([
  '.php', '.php3', '.php4', '.php5', '.phtml',
  '.asp', '.aspx', '.jsp', '.jspx',
  '.exe', '.bat', '.cmd', '.com', '.msi',
  '.sh', '.bash', '.zsh',
  '.py', '.rb', '.pl', '.lua',
  '.js', '.mjs', '.ts',
  '.ps1', '.psm1', '.vbs', '.vbe', '.wsf',
  '.dll', '.so',
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate secure cryptographically random UUID filename to prevent collisions & traversal
    const ext = path.extname(file.originalname).toLowerCase();
    const secureName = \`\${crypto.randomUUID()}\${ext}\`;
    cb(null, secureName);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  // 1. Validate final extension against allowlist
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    const error = new Error(\`File extension '\${ext}' is not permitted. Allowed: \${Array.from(ALLOWED_EXTENSIONS).join(', ')}\`);
    error.statusCode = 400;
    error.code = 'INVALID_FILE_TYPE';
    return cb(error, false);
  }

  // 2. BUG-002 fix: reject filenames that embed a dangerous extension anywhere in the name
  //    e.g. "shell.php.png" splits to ["shell", "php", "png"] and ".php" is caught.
  const nameParts = file.originalname.toLowerCase().split('.');
  // Check all segments except the last (already validated above)
  for (let i = 0; i < nameParts.length - 1; i++) {
    const segment = '.' + nameParts[i];
    if (DANGEROUS_EXTENSIONS.has(segment)) {
      const error = new Error(\`Filename contains a disallowed embedded extension '\${segment}'.\`);
      error.statusCode = 400;
      error.code = 'INVALID_FILE_TYPE';
      return cb(error, false);
    }
  }

  // 3. BUG-001 fix: correct MIME check
  //    The old code was: !ALLOWED_MIME_TYPES.has(file.mimetype) && !ALLOWED_MIME_TYPES.has('application/octet-stream')
  //    Since 'application/octet-stream' IS in the set, the second operand was always false,
  //    making the entire condition always false => MIME was never enforced.
  //    Fix: allow octet-stream explicitly (extension already validated); reject all other unknown MIMEs.
  if (file.mimetype !== 'application/octet-stream' && !ALLOWED_MIME_TYPES.has(file.mimetype)) {
    const error = new Error(\`File MIME type '\${file.mimetype}' is not permitted.\`);
    error.statusCode = 400;
    error.code = 'INVALID_MIME_TYPE';
    return cb(error, false);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,
    files: 5,
  },
});

module.exports = upload;
`;

fs.writeFileSync(filePath, newContent, 'utf8');
console.log('upload.middleware.js patched successfully (BUG-001, BUG-002)');
