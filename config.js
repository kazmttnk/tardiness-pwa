// Apps Script のデプロイURL
const API_URL = 'https://script.google.com/macros/s/AKfycbwCJAZiNNbfuVQ4Obr7uq1tidytgxAhaE1dlpXsDJOx1uzV6xVMI36wjn6xGHV_3GMpyA/exec';

// 認証トークン
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
    
    // CORS回避のため no-cors モードを使用
    const response = await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',  // ← ここを変更
      headers: {
        'Content-Type': 'text/plain',  // ← ここも変更
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('レスポンス受信');
    
    // no-cors の場合、レスポンスを読めないので別の方法を試す
    // 一旦 GETパラメータ方式に変更する必要があります
    
    return { success: true };
    
  } catch (error) {
    console.error('API Error:', error);
    alert('エラー: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}
