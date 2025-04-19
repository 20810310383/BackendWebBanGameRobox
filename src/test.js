const crypto = require("crypto");

// Nhập thông tin thẻ và key ở đây
const partner_key = "05e982c2a98a1b2cd86df2e0ae8fdf4c";  // <-- Thay bằng key thật
const code = "664196324427";                    // Mã thẻ
const serial = "089801001443088";               // Seri thẻ

// Tạo chữ ký MD5
const sign = crypto
  .createHash("md5")
  .update(partner_key + code + serial)
  .digest("hex");

console.log("✅ SIGN:", sign);
