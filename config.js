// API呼び出し関数（GET方式）
async function callAPI(action, data = {}) {
  console.log('API呼び出し開始:', action, data);
  
  try {
    // URLパラメータを構築
    var params = new URLSearchParams({
      action: action,
      token: API_TOKEN
    });
    
    // データをパラメータに追加
    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        var value = data[key];
        // オブジェクトの場合はJSON文字列化
        if (typeof value === 'object') {
          params.append(key, JSON.stringify(value));
        } else {
          params.append(key, value);
        }
      }
    }
    
    var url = API_URL + '?' + params.toString();
    console.log('リクエストURL:', url);
    
    const response = await fetch(url, {
      method: 'GET'
    });
