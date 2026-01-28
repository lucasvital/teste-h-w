const express = require('express');
const axios = require('axios');
const { smartDecrypt } = require('../utils/crypto');

const router = express.Router();

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
    
    res.json({
      success: true,
      data: n8nResponse.data,
      message: 'Dados processados com sucesso'
    });
    
  } catch (error) {
    console.error('Erro no fetch-and-decrypt:', error.message);
    
    if (error.response) {
      return res.status(error.response.status).json({
        error: 'Erro na comunicação',
        details: error.response.data
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
