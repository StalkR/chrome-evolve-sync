(function(){
  addButtons();
})();

function addButtons() {
  const buttonLoad = document.createElement('button');
  buttonLoad.innerText = 'Sync load';
  buttonLoad.onclick = load;
  const buttonSave = document.createElement('button');
  buttonSave.innerText = 'Sync save';
  buttonSave.onclick = save;
  const insert = document.getElementById('versionLog').parentNode;
  insert.appendChild(buttonLoad);
  insert.appendChild(buttonSave);
}

function load() {
  chrome.storage.sync.get(null, function(items) {
    if (chrome.runtime.error || items === undefined) {
      console.log('[EvolveSync] no save to load')
      return;
    }
    importSave(join(items));
  });
}

function importSave(data) {
  document.getElementById('importExport').value = data;
  for (const e of document.getElementsByClassName("importExport")) {
    for (const b of e.getElementsByTagName("button")) {
      if (b.innerText == "Import Game") {
        console.log('[EvolveSync] loading save');
        b.click();
      }
    }
  }
}

function save() {
  let data = window.localStorage.getItem('evolved') || false;
  if (!data) {
    console.log('[EvolveSync] no save available');
    return;
  }
  const state = JSON.parse(LZString.decompressFromUTF16(data));
  if (!state) {
    console.log('[EvolveSync] save is corrupted');
    return;
  }
  const save = LZString.compressToBase64(JSON.stringify(state));
  const chunks = split(save);
  const used = Math.floor(100 * JSON.stringify(chunks).length / QUOTA_BYTES);
  chrome.storage.sync.set(chunks);
  console.log(`[EvolveSync] saved: ${chunks.n} chunks, ${used}% storage used`);
}

// The maximum total amount (in bytes) of data that can be stored in sync
// storage, as measured by the JSON stringification of every value plus every
// key's length.
// Source: https://developer.chrome.com/docs/extensions/reference/api/storage
const QUOTA_BYTES = 102400;

// The maximum size (in bytes) of each individual item in sync storage, as
// measured by the JSON stringification of its value plus its key length. 
// Source: https://developer.chrome.com/docs/extensions/reference/api/storage
const QUOTA_BYTES_PER_ITEM = 8192;

// Choose chunk_size as max size minus enough for stringification and key.
function split(data, chunk_size = 8100) {
  const chunks = {};
  let i = 0;
  for (let o = 0; o < data.length; o += chunk_size) {
    chunks[i] = data.substr(o, chunk_size);
    i++;
  }
  chunks.n = i;
  return chunks;
}

function join(chunks) {
  let joined = ''
  for (let i = 0; i < chunks.n; i++) {
    joined += chunks[i];
  }
  return joined;
}
