const express = require('express');
const axios = require('axios');
const { smartDecrypt } = require('../utils/crypto');

const router = express.Router();

function looksLikeDuplicate(text) {
  if (!text || typeof text !== 'string') return false;
  const lower = text.toLowerCase();
  return (
    lower.includes('duplicate') ||
    lower.includes('unique') ||
    lower.includes('unique_violation') ||
    lower.includes('duplicate key') ||
    lower.includes('already exists') ||
    lower.includes('já existe') ||
    lower.includes('users_email_key')
  );
}

function checkDuplicateInArray(arr) {
  if (!Array.isArray(arr)) return false;
  return arr.some(
    (item) =>
      looksLikeDuplicate(item?.message) ||
      looksLikeDuplicate(item?.error?.description)
  );
}

function isN8nDbErrorPayload(obj) {
  if (!obj || typeof obj !== 'object') return false;
  if (obj.success === false && obj.code === 'DB_ERROR') return true;
  if (obj.success === false && looksLikeDuplicate(obj.message)) return true;
  return false;
}

function hasDuplicateErrorInBody(data) {
  if (Array.isArray(data)) return checkDuplicateInArray(data);
  if (data && typeof data === 'object') {
    if (Array.isArray(data.data)) return checkDuplicateInArray(data.data);
    if (isN8nDbErrorPayload(data.data)) return true;
    const str = JSON.stringify(data);
    return looksLikeDuplicate(str);
  }
  return looksLikeDuplicate(String(data));
}

router.post('/fetch-and-decrypt', async (req, res) => {
  try {
    const { ENCRYPTED_DATA_URL, N8N_WEBHOOK_SAVE_URL } = process.env;
    
    if (!ENCRYPTED_DATA_URL) {
      return res.status(500).json({ 
        error: 'ENCRYPTED_DATA_URL não configurada' 
      });
    }
    
    if (!N8N_WEBHOOK_SAVE_URL) {
      return res.status(500).json({ 
        error: 'N8N_WEBHOOK_SAVE_URL não configurada' 
      });
    }
    
    const encryptedResponse = await axios.get(ENCRYPTED_DATA_URL);
    const encryptedData = encryptedResponse.data.data || encryptedResponse.data;
    const decryptedData = smartDecrypt(encryptedData);
    
    const n8nResponse = await axios.post(N8N_WEBHOOK_SAVE_URL, {
      users: decryptedData
    });

    if (hasDuplicateErrorInBody(n8nResponse.data)) {
      return res.status(409).json({
        error:
          'Já existem dados na tabela. Clique em Limpar e, em seguida, em Executar novamente.',
        code: 'duplicate'
      });
    }

    res.json({
      success: true,
      data: n8nResponse.data,
      message: 'Dados processados com sucesso'
    });
  } catch (error) {
    console.error('Erro no fetch-and-decrypt:', error.message);

    if (error.response && hasDuplicateErrorInBody(error.response.data)) {
      return res.status(409).json({
        error:
          'Já existem dados na tabela. Clique em Limpar e, em seguida, em Executar novamente.',
        code: 'duplicate'
      });
    }

    if (error.response) {
      return res.status(error.response.status).json({
        error: 'Erro na comunicação',
        details: error.response.data
      });
    }

    if (looksLikeDuplicate(error.message)) {
      return res.status(409).json({
        error:
          'Já existem dados na tabela. Clique em Limpar e, em seguida, em Executar novamente.',
        code: 'duplicate'
      });
    }

    res.status(500).json({
      error: 'Erro ao processar requisição',
      details: error.message
    });
  }
});

router.post('/clear', async (req, res) => {
  try {
    const { N8N_WEBHOOK_CLEAR_URL } = process.env;
    
    if (!N8N_WEBHOOK_CLEAR_URL) {
      return res.status(500).json({ 
        error: 'N8N_WEBHOOK_CLEAR_URL não configurada' 
      });
    }
    
    const n8nResponse = await axios.post(N8N_WEBHOOK_CLEAR_URL, {
      action: 'truncate',
      table: 'users'
    });
    
    res.json({
      success: true,
      data: n8nResponse.data,
      message: 'Dados limpos com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao limpar dados:', error.message);
    
    res.status(500).json({
      error: 'Erro ao limpar dados',
      details: error.message
    });
  }
});

module.exports = router;
