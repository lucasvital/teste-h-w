const crypto = require('crypto');

/**
 * Descriptografa dados usando AES-256-GCM
 * Formato H&W: todos os dados vêm em hexadecimal
 * @param {string} encryptedHex - Dados criptografados em hex
 * @param {string} ivHex - IV em hex (24 chars = 12 bytes)
 * @param {string} keyHex - Chave em hex (64 chars = 32 bytes)
 * @param {string} authTagHex - Auth tag em hex (32 chars = 16 bytes)
 * @returns {object} - Dados descriptografados como objeto JSON
 */
function decryptAES256GCM(encryptedHex, ivHex, keyHex, authTagHex) {
  try {
    // Converter de hexadecimal para Buffer
    const keyBuffer = Buffer.from(keyHex, 'hex');        // 32 bytes
    const ivBuffer = Buffer.from(ivHex, 'hex');          // 12 bytes
    const encryptedBuffer = Buffer.from(encryptedHex, 'hex');
    const authTagBuffer = Buffer.from(authTagHex, 'hex'); // 16 bytes
    
    // Criar decipher AES-256-GCM
    const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, ivBuffer);
    decipher.setAuthTag(authTagBuffer);
    
    // Descriptografar
    let decrypted = decipher.update(encryptedBuffer, null, 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Erro na descriptografia:', error.message);
    throw new Error('Falha ao descriptografar: ' + error.message);
  }
}

/**
 * Descriptografa dados no formato H&W
 * Formato esperado: { encrypted: { iv, authTag, encrypted }, secretKey }
 * @param {object} hwData - Dados no formato H&W
 * @returns {object} - Dados descriptografados
 */
function smartDecrypt(hwData) {
  try {
    // Extrair dados do formato H&W aninhado
    const { encrypted, secretKey } = hwData;
    const { iv, authTag, encrypted: ciphertext } = encrypted;
    
    // Validar que todos os campos existem
    if (!ciphertext || !iv || !authTag || !secretKey) {
      throw new Error('Dados incompletos. Esperado: { encrypted: { iv, authTag, encrypted }, secretKey }');
    }
    
    // Descriptografar (tudo em hexadecimal)
    return decryptAES256GCM(ciphertext, iv, secretKey, authTag);
  } catch (error) {
    console.error('Erro no smartDecrypt:', error.message);
    throw error;
  }
}

module.exports = {
  decryptAES256GCM,
  smartDecrypt
};
