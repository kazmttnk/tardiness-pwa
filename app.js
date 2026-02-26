// ============================================================
// アプリ変数
// ============================================================
let reasonList = [];
let currentStudent = null;
let selectedReason = null;
let isSaving = false;

// カメラ関連
let codeReader = null;
let currentStream = null;
let isScanning = false;

// ============================================================
// 初期化
// ============================================================
window.onload = function() {
  setupBarcodeInput();
  loadReasons();
  loadTodayRecords();
  loadSystemConfig();
};

// ============================================================
// バーコード入力
// ============================================================
function setupBarcodeInput() {
  const input = document.getElementById('barcodeInput');
  
  input.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchStudent();
    }
  });

  input.addEventListener('input', function(e) {
    let val = e.target.value.trim();
    e.target.value = val.replace(/[^0-9]/g, '');
    
    if (e.target.value.length === 6) {
      setTimeout(() => searchStudent(), 300);
    }
  });
}

// ============================================================
// 生徒検索
// ============================================================
async function searchStudent() {
  const val = document.getElementById('barcodeInput').value.trim();
  
  if (val.length !== 6) {
    showAlert('error', '生徒証番号は6桁で入力してください');
    return;
  }

  showAlert('info', '検索中...');
  document.getElementById('searchBtn').disabled = true;
  
  const result = await callAPI('getStudentInfo', { studentId: val });
  
  document.getElementById('searchBtn').disabled = false;
  
  if (result && result.success) {
    currentStudent = result;
    document.getElementById('displayStudentId').textContent = result.studentId;
    document.getElementById('displayName').textContent = result.name;
    document.getElementById('displayClass').textContent = result.studentInfo;
    document.getElementById('studentInfo').classList.add('show');
    document.getElementById('alertBox').className = 'hidden';
  } else {
    showAlert('error', result?.error || '生徒が見つかりません');
    resetForm();
  }
}

// ============================================================
// 遅刻理由読み込み
// ============================================================
async function loadReasons() {
  const result = await callAPI('getReasonList');
  
  if (result && result.success) {
    reasonList = result.reasons;
    renderReasons();
  }
}

function renderReasons() {
  const grid = document.getElementById('reasonGrid');
  grid.innerHTML = '';
  
  for (let i = 0; i < reasonList.length; i++) {
    (function(reason) {
      const btn = document.createElement('button');
      btn.className = 'reason-btn';
      btn.textContent = reason.display;
      btn.type = 'button';
      btn.onclick = function() {
        selectedReason = reason;
        const all = document.querySelectorAll('.reason-btn');
        for (let j = 0; j < all.length; j++) all[j].classList.remove('selected');
        btn.classList.add('selected');
        
        const detailInput = document.getElementById('detailInput');
        if (reason.display === 'その他') {
          detailInput.placeholder = '詳細（必須）';
          detailInput.style.borderColor = '#e74c3c';
        } else {
          detailInput.placeholder = '詳細（任意）';
          detailInput.style.borderColor = '#e0e0e0';
        }
      };
      grid.appendChild(btn);
    })(reasonList[i]);
  }
}

// ============================================================
// 記録保存
// ============================================================
async function saveRecord() {
  if (isSaving) return;
  if (!currentStudent) {
    showAlert('error', '生徒情報が取得されていません');
    return;
  }
  if (!selectedReason) {
    showAlert('error', '遅刻理由を選択してください');
    return;
  }

  const detail = document.getElementById('detailInput').value.trim();
  if (selectedReason.display === 'その他' && !detail) {
    showModalAlert(
      '詳細の入力が必要です',
      '「その他」を選択した場合は、詳細欄に遅刻理由を具体的に入力してください。'
    );
    return;
  }

  isSaving = true;
  const saveBtn = document.getElementById('saveBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  saveBtn.disabled = true;
  cancelBtn.disabled = true;
  saveBtn.textContent = '保存中...';
  showAlert('info', '保存中...');

  const recordData = {
    studentId: currentStudent.studentId,
    studentInfo: currentStudent.studentInfo,
    grade: currentStudent.grade,
    class: currentStudent.class,
    number: currentStudent.number,
    name: currentStudent.name,
    reasonNumber: selectedReason.number,
    reasonText: selectedReason.text,
    detail: detail,
    hasPhoneCall: document.getElementById('hasPhoneCall').checked,
    hasStudentCard: document.getElementById('hasStudentCard').checked
  };

  const result = await callAPI('saveTardinessRecord', { recordData: recordData });

  if (result && result.success) {
    showAlert('success', '✓ 記録を保存しました');
    resetForm();
    loadTodayRecords();
  } else {
    showAlert('error', '保存に失敗しました: ' + (result?.error || '不明なエラー'));
    saveBtn.disabled = false;
    cancelBtn.disabled = false;
    saveBtn.textContent = '記録を保存';
  }
  
  isSaving = false;
}

// ============================================================
// フォームリセット
// ============================================================
function resetForm() {
  currentStudent = null;
  selectedReason = null;
  
  document.getElementById('barcodeInput').value = '';
  document.getElementById('studentInfo').classList.remove('show');
  
  const reasonBtns = document.querySelectorAll('.reason-btn');
  for (let i = 0; i < reasonBtns.length; i++) {
    reasonBtns[i].classList.remove('selected');
  }
  
  const detailInput = document.getElementById('detailInput');
  detailInput.value = '';
  detailInput.placeholder = '詳細（任意）';
  detailInput.style.borderColor = '#e0e0e0';
  
  document.getElementById('hasPhoneCall').checked = false;
  document.getElementById('hasStudentCard').checked = false;
  
  document.getElementById('saveBtn').disabled = false;
  document.getElementById('cancelBtn').disabled = false;
  document.getElementById('saveBtn').textContent = '記録を保存';
  
  document.getElementById('barcodeInput').focus();
}

// ============================================================
// 本日の記録読み込み
// ============================================================
async function loadTodayRecords() {
  const result = await callAPI('getTodayRecords');
  
  if (result && result.success) {
    renderTodayRecords(result.records);
  }
}

function renderTodayRecords(records) {
  const list = document.getElementById('recordsList');
  const count = document.getElementById('recordCount');
  
  count.textContent = records.length + '件';
  
  if (records.length === 0) {
    list.innerHTML = '<div class="loading">まだ記録がありません</div>';
    return;
  }
  
  list.innerHTML = '';
  records.forEach(rec => {
    const item = document.createElement('div');
    item.className = 'record-item';
    
    const time = new Date(rec.timestamp);
    const hh = time.getHours();
    const mm = String(time.getMinutes()).padStart(2, '0');
    
    item.innerHTML = `
      <div class="record-info">
        <div class="record-student">${rec.studentInfo} ${rec.name}</div>
        <div class="record-detail">${rec.reasonText}</div>
      </div>
      <div class="record-time">${hh}:${mm}</div>
    `;
    list.appendChild(item);
  });
}

// ============================================================
// システム設定読み込み
// ============================================================
async function loadSystemConfig() {
  const result = await callAPI('getSystemConfig');
  
  if (result && result.success) {
    document.getElementById('gateTime').textContent = result.gateTime;
  }
}

// ============================================================
// カメラ機能
// ============================================================
function toggleCamera() {
  if (isScanning) {
    stopCamera();
  } else {
    startCamera();
  }
}

function startCamera() {
  const preview = document.getElementById('cameraPreview');
  const video = document.getElementById('videoPreview');
  const status = document.getElementById('scanStatus');
  
  preview.classList.remove('hidden');
  status.textContent = 'カメラを起動中...';
  
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    status.textContent = 'お使いのブラウザはカメラに対応していません';
    alert('お使いのブラウザはカメラに対応していません。\nSafari の最新版をご使用ください。');
    preview.classList.add('hidden');
    return;
  }
  
  const constraints = {
    video: {
      facingMode: { ideal: 'environment' },
      width: { ideal: 1280 },
      height: { ideal: 720 }
    }
  };
  
  navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
      currentStream = stream;
      video.srcObject = stream;
      video.play();
      
      status.textContent = 'バーコードをカメラに向けてください...';
      isScanning = true;
      
      codeReader = new ZXing.BrowserMultiFormatReader();
      scanBarcodeFromVideo();
    })
    .catch(err => {
      console.error('カメラエラー:', err);
      status.textContent = 'カメラの起動に失敗: ' + err.name;
      
      if (err.name === 'NotAllowedError') {
        alert('カメラの使用が許可されていません。\n\nSafariの設定方法:\n1. アドレスバーの左側の「AA」をタップ\n2. 「Webサイトの設定」をタップ\n3. カメラ → 許可');
      } else if (err.name === 'NotFoundError') {
        alert('カメラが見つかりませんでした。');
      } else if (err.name === 'NotReadableError') {
        alert('カメラが他のアプリで使用中の可能性があります。');
      } else {
        alert('カメラの起動に失敗しました:\n' + err.name);
      }
      
      preview.classList.add('hidden');
    });
}

function scanBarcodeFromVideo() {
  if (!isScanning || !codeReader) return;
  
  codeReader.decodeOnceFromVideoDevice(undefined, 'videoPreview')
    .then(result => {
      const code = result.text;
      console.log('バーコード検出:', code);
      
      const numbers = code.replace(/[^0-9]/g, '');
      if (numbers.length >= 6) {
        const studentId = numbers.substring(0, 6);
        document.getElementById('barcodeInput').value = studentId;
        
        document.getElementById('scanStatus').textContent = '✓ 検出: ' + studentId;
        
        stopCamera();
        setTimeout(() => searchStudent(), 300);
      } else {
        setTimeout(scanBarcodeFromVideo, 100);
      }
    })
    .catch(err => {
      if (err.name === 'NotFoundException') {
        setTimeout(scanBarcodeFromVideo, 100);
      } else {
        console.error('スキャンエラー:', err);
        setTimeout(scanBarcodeFromVideo, 100);
      }
    });
}

function stopCamera() {
  isScanning = false;
  
  if (codeReader) {
    codeReader.reset();
    codeReader = null;
  }
  
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
    currentStream = null;
  }
  
  const video = document.getElementById('videoPreview');
  video.srcObject = null;
  
  document.getElementById('cameraPreview').classList.add('hidden');
}

// ============================================================
// UI ヘルパー
// ============================================================
function showAlert(type, message) {
  const box = document.getElementById('alertBox');
  box.className = 'alert alert-' + type;
  box.textContent = message;
  setTimeout(() => {
    if (type !== 'info') box.className = 'hidden';
  }, 5000);
}

function showModalAlert(title, message) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalMessage').textContent = message;
  document.getElementById('modalOverlay').classList.add('show');
}

function closeModalAlert() {
  document.getElementById('modalOverlay').classList.remove('show');
}
