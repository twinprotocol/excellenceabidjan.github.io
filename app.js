let ws;
let myIdInput = document.getElementById('myId');
let peerIdInput = document.getElementById('peerId');
const connectBtn = document.getElementById('connectBtn');
const sendBtn = document.getElementById('sendBtn');
const textInput = document.getElementById('textInput');
const fileInput = document.getElementById('fileInput');
const messagesEl = document.getElementById('messages');
const onlineList = document.getElementById('onlineList');

function appendMessage(text, meta = '') {
  const el = document.createElement('div');
  el.className = 'msg';
  if (meta && meta.startsWith('me:')) el.classList.add('me');
  el.innerHTML = `<div class="meta">${meta}</div><div class="body">${text}</div>`;
  messagesEl.appendChild(el);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function connect() {
  const myId = (myIdInput.value || '').trim();
  if (!myId) return alert('Enter your id first (e.g. alice)');

  const wsUrl = `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/?id=${encodeURIComponent(myId)}`;
  ws = new WebSocket(wsUrl);

  ws.addEventListener('open', () => {
    appendMessage('Connected to server', 'system');
  });

  ws.addEventListener('message', (ev) => {
    let data;
    try {
      data = JSON.parse(ev.data);
    } catch (e) {
      console.log('non JSON message', ev.data);
      return;
    }

    if (data.type === 'presence') {
      renderOnline(data.online);
      return;
    }

    if (data.type === 'text') {
      appendMessage(escapeHtml(data.payload), `${data.from}`);
      return;
    }

    if (data.type === 'image') {
      // payload is DataURL
      const imgHtml = `<img src="${data.payload}" alt="image" />`;
      appendMessage(imgHtml, `${data.from}`);
      return;
    }

    if (data.type === 'delivery-failed') {
      appendMessage(`Delivery to ${data.to} failed (offline)`, 'system');
    }
  });

  ws.addEventListener('close', () => {
    appendMessage('Disconnected from server', 'system');
  });

  ws.addEventListener('error', (e) => {
    console.error('ws error', e);
  });
}

connectBtn.onclick = () => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.close();
    connectBtn.textContent = 'Connect';
    return;
  }
  connect();
  connectBtn.textContent = 'Disconnect';
};

sendBtn.onclick = () => {
  if (!ws || ws.readyState !== WebSocket.OPEN) return alert('Not connected');
  const text = textInput.value.trim();
  const to = (peerIdInput.value || '').trim() || null;

  if (fileInput.files && fileInput.files[0]) {
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const dataURL = reader.result;
      const payload = { type: 'image', to, payload: dataURL };
      ws.send(JSON.stringify(payload));
      appendMessage(`<img src="${dataURL}" />`, `me:${to || 'all'}`);
      fileInput.value = '';
    };
    reader.readAsDataURL(file);
  } else if (text) {
    const payload = { type: 'text', to, payload: text };
    ws.send(JSON.stringify(payload));
    appendMessage(escapeHtml(text), `me:${to || 'all'}`);
    textInput.value = '';
  }
};

function renderOnline(list) {
  onlineList.innerHTML = '';
  list.forEach(id => {
    const li = document.createElement('li');
    li.textContent = id;
    li.onclick = () => {
      peerIdInput.value = id;
    };
    onlineList.appendChild(li);
  });
}

function escapeHtml(unsafe) {
  return unsafe.replace(/[&<"'>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'})[m]);
}
