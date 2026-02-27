// Apps Script のデプロイURL
const API_URL = 'https://script.google.com/macros/s/AKfycbwCJAZiNNbfuVQ4Obr7uq1tidytgxAhaE1dlpXsDJOx1uzV6xVMI36wjn6xGHV_3GMpyA/exec';

// 認証トークン（変更してください）
const API_TOKEN = 'tardiness-auth-2025-x8k9mP2qR7nL';

// API呼び出し関数
async function callAPI(action, data = {}) {
  console.log('API呼び出し開始:', action, data);
  
  try {
    const requestBody = {
      action: action,
      token: API_TOKEN,
      ...data
    };
    
    console.log('リクエストボディ:', requestBody);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('レスポンスステータス:', response.status);
    console.log('レスポンスOK:', response.ok);
    
    if (!response.ok) {
      throw new Error('HTTP error! status: ' + response.status);
    }
    
    const result = await response.json();
    console.log('API結果:', result);
    return result;
  } catch (error) {
    console.error('API Error:', error);
    alert('エラー: ' + error.toString()); // ← エラーをアラート表示
    return { success: false, error: error.toString() };
  }
}
