import CryptoJS from "crypto-js";

const KEY = import.meta.env.VITE_APP_ENCRYPT_KEY;

const encrypt = (data: string) => {
  const encrypted_data = CryptoJS.AES.encrypt(data, KEY).toString();
  return encrypted_data;
};

const decrypt = (data: string) => {
  const decrypted_data = CryptoJS.AES.decrypt(data, KEY).toString(CryptoJS.enc.Utf8);
  return decrypted_data;
};

export {encrypt, decrypt};

