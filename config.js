// Apps Script のデプロイURL
// TODO: デプロイ後に実際のURLに置き換えてください
const API_URL = 'https://script.google.com/macros/s/AKfycbwCJAZiNNbfuVQ4Obr7uq1tidytgxAhaE1dlpXsDJOx1uzV6xVMI36wjn6xGHV_3GMpyA/exec';

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
        ...data
      })
    });
    
    if (!response.ok) {
      throw new Error('HTTP error! status: ' + response.status);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, error: error.toString() };
  }
}

