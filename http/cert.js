const { exec } = require("child_process");
const fs = require("fs");

// Create cert directory if it doesn't exist
if (!fs.existsSync('./cert')) {
  fs.mkdirSync('./cert');
}
//# Generate PFX from key + cert openssl pkcs12 -certpbe AES-256-CBC -export  -out test_cert.pfx  -inkey private-key.pem -in certificate.pem -passout pass:mysecretpassword
const command = `openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj "/CN=localhost" -keyout ./cert/private-key.pem -out ./cert/certificate.pem`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error("Error generating certificate:", error);
    return;
  }

  if (stderr) {
    console.log("OpenSSL output:", stderr);
  }

  console.log("SSL certificate generated successfully!");
});