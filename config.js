// Apps Script のデプロイURL
const API_URL = 'https://script.google.com/macros/s/YOUR_ACTUAL_SCRIPT_ID/exec';

// 認証トークン（変更してください）
const API_TOKEN = 'tardiness-auth-2025-x8k9mP2qR7nL';

// API呼び出し関数
async function callAPI(action, data = {}) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: action,
        token: API_TOKEN,
        ...data
      })
    });
