import crypto from "crypto";

const DEFAULT_AES_KEY =
  "f1e2d3c4b5a697887766554433221100f0e1d2c3b4a5968776655443322110ff";
const DEFAULT_AES_IV = "000102030405060708090a0b0c0d0e0f";

const getCipherParams = () => {
  const aesKey = process.env.AES_KEY || DEFAULT_AES_KEY;
  const aesIv = process.env.AES_IV || DEFAULT_AES_IV;

  return {
    key: Buffer.from(aesKey, "hex"),
    iv: Buffer.from(aesIv, "hex"),
  };
};

export const encrypt = (text: string): string => {
  const { key, iv } = getCipherParams();
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

export const decrypt = (encryptedText: string): string => {
  const { key, iv } = getCipherParams();
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
