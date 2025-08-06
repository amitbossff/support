<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <title>AmitTG</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #000000 0%, #0f0f0f 100%);
      color: #fff;
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      padding-bottom: 100px;
    }

    h1 {
      font-size: 28px;
      margin-bottom: 20px;
      color: #ffffff;
      text-shadow: 0 0 8px #00ffe0;
    }

    button {
      background: rgba(0, 255, 200, 0.1);
      border: 1px solid rgba(0, 255, 200, 0.4);
      color: #00ffe0;
      padding: 12px 20px;
      font-size: 16px;
      border-radius: 12px;
      cursor: pointer;
      transition: 0.3s;
      box-shadow: 0 0 8px rgba(0,255,200,0.2);
    }

    button:hover {
      background: rgba(0, 255, 200, 0.2);
      box-shadow: 0 0 12px rgba(0,255,200,0.5);
    }

    .tool-section {
      display: none;
      width: 95%;
      max-width: 600px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 16px;
      padding: 20px;
      margin-top: 15px;
      backdrop-filter: blur(10px);
      box-shadow: 0 8px 20px rgba(0, 255, 200, 0.08);
    }

    .tool-section.active {
      display: block;
    }

    textarea, input[type="text"] {
      width: 90%;
      font-size: 10px;
      padding: 14px;
      border-radius: 12px;
      border: none;
      margin-bottom: 15px;
      background: rgba(255, 255, 255, 0.07);
      color: #00ffe0;
      backdrop-filter: blur(4px);
    }

    textarea::placeholder, input::placeholder {
      color: #888;
    }

    textarea:focus, input:focus {
      outline: none;
      border: 1px solid #00ffe0;
      background: rgba(0, 255, 200, 0.08);
    }

    textarea[readonly] {
      background: rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(0,255,200,0.2);
      color: #00ffe0;
      font-size: 15px;
      padding: 15px;
      border-radius: 12px;
      resize: vertical;
      white-space: pre-wrap;
      word-break: break-word;
      backdrop-filter: blur(4px);
    }

    .copy-btn {
      background: #00ffe0;
      border: none;
      color: #000;
      padding: 12px;
      border-radius: 10px;
      cursor: pointer;
      width: 40%;
      margin-top: 10px;
      font-size: 16px;
      font-weight: bold;
      box-shadow: 0 0 10px rgba(0,255,200,0.5);
    }

    .copy-btn:hover {
      background: #00c2a6;
      box-shadow: 0 0 12px rgba(0,255,200,0.7);
    }

    h2, h3 {
      color: #ffffff;
      margin-bottom: 10px;
      text-shadow: 0 0 4px #00ffe0;
    }

    .bottom-grid {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      display: grid;
      grid-template-columns: repeat(2, auto);
      gap: 15px;
      z-index: 1000;
    }

    /* Toast container */
    .toast-container {
      position: fixed;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      z-index: 2000;
    }

    .toast-message {
      background: #00ffe0;
      color: #000;
      padding: 10px 20px;
      border-radius: 12px;
      font-weight: bold;
      font-size: 14px;
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.4s ease;
      box-shadow: 0 0 10px rgba(0, 255, 200, 0.6);
    }

    .toast-message.show {
      opacity: 1;
      transform: translateY(0);
    }

    @media (max-width: 600px) {
      body {
        padding: 10px;
        padding-bottom: 100px;
      }

      h1 {
        font-size: 22px;
      }

      button {
        font-size: 14px;
        padding: 10px;
      }

      textarea, input[type="text"] {
        font-size: 14px;
      }

      .copy-btn {
        font-size: 14px;
        padding: 10px;
      }

      .bottom-grid {
        grid-template-columns: 1fr 1fr;
        width: 90%;
      }
    }
  </style>
</head>
<body>

<h1>AmitTG Tool</h1>

<div id="tool1" class="tool-section">
  <h2>Step .1: Paste your post here</h2>
  <textarea id="inputData" placeholder="Paste your code lists here..."></textarea>
  <button onclick="processInput()">Submit</button>

  <h3>Output:</h3>
  <textarea id="outputArea1" readonly rows="10"></textarea>
  <button class="copy-btn" onclick="copyOutput('outputArea1')">Copy</button>
</div>

<div id="tool2" class="tool-section">
  <h2>Step .2: Final Formatter</h2>
  <input type="text" id="dateInput" placeholder="Enter date" />

  <textarea id="list1Input" placeholder="Paste Name List Here..."></textarea>

  <textarea id="list2Input" placeholder="Paste Code List Here..."></textarea>

  <button onclick="generateOutput()">Generate</button>

  <h3>Output:</h3>
  <textarea id="outputArea2" readonly rows="10"></textarea>
  <button class="copy-btn" onclick="copyOutput('outputArea2')">Copy</button>
</div>

<!-- BOTTOM GRID BUTTONS -->
<div class="bottom-grid">
  <button onclick="showTool('tool1')">Post</button>
  <button onclick="showTool('tool2')">Code</button>
</div>

<!-- Toast container -->
<div class="toast-container" id="toastContainer"></div>

<script>
  function showTool(id) {
    document.getElementById("tool1").classList.remove("active");
    document.getElementById("tool2").classList.remove("active");
    document.getElementById(id).classList.add("active");
  }

  function copyOutput(id) {
    const text = document.getElementById(id).value;
    if (!text.trim()) {
      showToast("Nothing to copy!");
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      showToast("Output copied!");
    });
  }

  function processInput() {
    const text = document.getElementById("inputData").value.trim();
    if (!text) {
      showToast("Please paste some data first.");
      return;
    }

    const lines = text.split('\n').map(l => l.trim()).filter(l => l !== "");
    const serialToName = {};
    const nameToUrl = {};
    let currentName = null;
    let currentSerial = null;

    for(let i=0; i<lines.length; i++) {
      const line = lines[i];
      if(/^Link\s*➡️\s*\d+$/.test(line)){
        if(currentName !== null){
          currentSerial = parseInt(line.split('➡️')[1].trim());
          serialToName[currentSerial] = currentName;
        }
        currentName = null;
      } else if(/^Link\s*➡️\s*https?:\/\//.test(line)){
        if(currentName !== null){
          const url = line.split('➡️')[1].trim();
          nameToUrl[currentName] = url;
        }
        currentName = null;
      } else {
        const cleanName = line.replace(/[✅❌]/g, '').trim();
        if(cleanName.length > 0) currentName = cleanName;
      }
    }

    let output = "";
    const sortedSerials = Object.keys(serialToName).map(x=>parseInt(x)).sort((a,b)=>a-b);
    sortedSerials.forEach(serial => {
      const name = serialToName[serial];
      if(nameToUrl[name]){
        output += `${serial}. ${name} ✅\n\n`;
      } else {
        output += `${serial}. ${name} ❌\n\n`;
      }
    });

    document.getElementById("outputArea1").value = output;
    showToast("Processed successfully!");
  }

  function generateOutput() {
    const date = document.getElementById("dateInput").value.trim();
    const list1Text = document.getElementById("list1Input").value.trim();
    const list2Text = document.getElementById("list2Input").value.trim();

    if (!date || !list1Text || !list2Text) {
      showToast("Please enter date and paste both lists.");
      return;
    }

    const list1Lines = list1Text.split('\n').map(l => l.trim()).filter(l => l !== "");
    const list1Data = {};
    for(let line of list1Lines){
      const m = line.match(/^(\d+)\.\s*(.+?)\s*([✅❌])$/);
      if(m){
        const serial = m[1];
        const name = m[2];
        const status = m[3];
        list1Data[serial] = {name, status};
      }
    }

    const list2Lines = list2Text.split('\n').map(l => l.trim()).filter(l => l !== "");
    const list2Data = {};
    for(let line of list2Lines){
      const m = line.match(/^(\d+)\.\s*(\S+)\s+(\S+)\s+(\S+)$/);
      if(m){
        const serial = m[1];
        const code = m[2];
        const amount = m[3];
        const number = m[4];
        list2Data[serial] = {code, amount, number};
      }
    }

    let output = date + "\n\n";
    const serials = Object.keys(list1Data).sort((a,b) => parseInt(a)-parseInt(b));
    for(let serial of serials){
      const entry1 = list1Data[serial];
      output += `${serial}. **${entry1.name}** ${entry1.status}\n`;
      if(list2Data[serial]){
        const e2 = list2Data[serial];
        output += `  \`${e2.code}\`   ${e2.amount}   ${e2.number}\n\n`;
      } else {
        output += `\n`;
      }
    }

    document.getElementById("outputArea2").value = output;
    showToast("Formatted successfully!");
  }

  function showToast(message) {
    const toastContainer = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = "toast-message";
    toast.textContent = message;
    toastContainer.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("show"));
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }
</script>
</body>
</html>
