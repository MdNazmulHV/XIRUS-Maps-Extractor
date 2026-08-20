// ⚡ BACKGROUND ROUTER: Handles folder mapping and file downloads
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "download_asset") {
    chrome.downloads.download({
      url: request.url,
      filename: `XIRUS_Extractor/${request.folder}/${request.filename}`,
      conflictAction: 'uniquify',
      saveAs: false
    });
  }
});

chrome.action.onClicked.addListener((tab) => {
  if (tab.url && tab.url.includes("google.com")) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: runXirusEngine
    });
  }
});

function runXirusEngine() {
  (async () => {
    const existingUi = document.getElementById('xirus-pro-panel');
    if (existingUi) {
      const isMin = existingUi.style.height === '48px';
      existingUi.style.height = isMin ? 'auto' : '48px';
      existingUi.style.width = isMin ? '360px' : '220px';
      return;
    }

    const humanSleep = (min, max) => new Promise(r => setTimeout(r, Math.floor(Math.random() * (max - min + 1) + min)));

    const pipeline = {
      history: new Set(),
   logData: `XIRUS EXTRACTION LOG\nDate: ${new Date().toLocaleString()}\n\n`,
   saved: 0, skipped: 0, limit: 100, emptyScrolls: 0,
   isPaused: false, isRunning: true
    };

    // --- 🎨 PREMIUM XIRUS UI ---
    const ui = document.createElement('div');
    ui.id = 'xirus-pro-panel';
    Object.assign(ui.style, {
      position: 'fixed', top: '20px', right: '20px', width: '360px', zIndex: '2147483647',
      backgroundColor: 'rgba(11, 13, 23, 0.95)', color: '#ffffff', padding: '0', borderRadius: '12px',
                  boxShadow: '0 25px 50px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.1)',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                  display: 'flex', flexDirection: 'column', overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
    });

    const style = document.createElement('style');
    style.innerHTML = `
    .xirus-input { width: 100%; box-sizing: border-box; padding: 10px 12px; border-radius: 8px; background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255,255,255,0.08); color: #fff; font-weight: 600; font-size: 13px; outline: none; transition: 0.2s; }
    .xirus-input:focus { border-color: #00f2fe; box-shadow: 0 0 10px rgba(0,242,254,0.2); }
    .xirus-switch { position: relative; display: inline-block; width: 36px; height: 20px; }
    .xirus-switch input { opacity: 0; width: 0; height: 0; }
    .xirus-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(255,255,255,0.1); transition: .4s; border-radius: 20px; }
    .xirus-slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 3px; bottom: 3px; background-color: #8e8e93; transition: .4s; border-radius: 50%; }
    .xirus-switch input:checked + .xirus-slider { background-color: rgba(0, 242, 254, 0.2); border: 1px solid #00f2fe; }
    .xirus-switch input:checked + .xirus-slider:before { transform: translateX(14px); background-color: #00f2fe; box-shadow: 0 0 8px #00f2fe; }
    .xirus-track { position: relative; height: 40px; background: rgba(0,0,0,0.3); border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 16px; overflow: hidden; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; }
    .xirus-line { position: absolute; left: 30px; right: 30px; height: 1px; background: rgba(255,255,255,0.1); z-index: 1; }
    .xirus-node { position: absolute; width: 8px; height: 8px; border-radius: 50%; background: #00f2fe; box-shadow: 0 0 10px #00f2fe; z-index: 2; opacity: 0; left: 20px; }
    @keyframes node-transfer { 0% { transform: translateX(0); opacity: 1; background: #00f2fe; box-shadow: 0 0 10px #00f2fe; } 80% { transform: translateX(250px); opacity: 1; } 100% { transform: translateX(270px); opacity: 0; } }
    @keyframes node-fail { 0% { transform: translateX(0); opacity: 1; background: #ff453a; box-shadow: 0 0 10px #ff453a; } 40% { transform: translateX(100px); opacity: 1; background: #ff453a; } 100% { transform: translateX(120px) translateY(20px); opacity: 0; } }
    .anim-transfer { animation: node-transfer 1s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
    .anim-fail { animation: node-fail 0.8s ease-in forwards; }
    .xirus-icon { fill: rgba(255,255,255,0.5); width: 16px; height: 16px; z-index: 3; }
    .xirus-icon-target { fill: #00f2fe; }
    `;
    document.head.appendChild(style);

    const savedLimit = localStorage.getItem('xirus_limit') || '100';
    const savedSize = localStorage.getItem('xirus_size') || '200';
    const savedFolder = localStorage.getItem('xirus_folder') || document.querySelector('h1')?.innerText.replace(/[<>:"/\\|?*]/g, '_').trim().slice(0, 40) || 'Unsorted';
    const wantsPhotos = localStorage.getItem('xirus_opt_photos') !== 'false';
    const wantsVideos = localStorage.getItem('xirus_opt_videos') !== 'false';

    ui.innerHTML = `
    <div id="xirus-drag" style="padding:14px 18px; background:linear-gradient(90deg, rgba(0,242,254,0.1) 0%, rgba(0,0,0,0) 100%); border-bottom:1px solid rgba(255,255,255,0.05); cursor:grab; display:flex; justify-content:space-between; align-items:center;">
    <span style="font-weight:800; letter-spacing:2px; color:#00f2fe; font-size:12px;">XIRUS <span style="color:#fff;">PRO</span></span>
    <div>
    <span id="xirus-min" style="cursor:pointer; opacity:0.6; font-size:16px; margin-right:12px; transition:0.2s;">−</span>
    <span id="xirus-close" style="cursor:pointer; opacity:0.6; font-size:16px; transition:0.2s;">✕</span>
    </div>
    </div>
    <div style="padding:18px;">
    <div style="margin-bottom:14px;">
    <label style="font-size:10px; font-weight:700; display:block; margin-bottom:6px; color:#8e8e93; letter-spacing:0.5px;">PROJECT DIRECTORY</label>
    <input id="xirus-folder" class="xirus-input" type="text" value="${savedFolder}">
    </div>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:16px;">
    <div>
    <label style="font-size:10px; font-weight:700; display:block; margin-bottom:6px; color:#8e8e93; letter-spacing:0.5px;">MAX ASSETS</label>
    <input id="xirus-limit" class="xirus-input" type="number" value="${savedLimit}">
    </div>
    <div>
    <label style="font-size:10px; font-weight:700; display:block; margin-bottom:6px; color:#8e8e93; letter-spacing:0.5px;">MIN SIZE (KB)</label>
    <input id="xirus-size" class="xirus-input" type="number" value="${savedSize}">
    </div>
    </div>
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; padding:12px; background:rgba(0,0,0,0.2); border-radius:8px; border:1px solid rgba(255,255,255,0.03);">
    <div style="display:flex; align-items:center; gap:8px;">
    <label class="xirus-switch"><input type="checkbox" id="xirus-opt-photos" ${wantsPhotos ? 'checked' : ''}><span class="xirus-slider"></span></label>
    <span style="font-size:11px; font-weight:600; color:#ccc;">Photos</span>
    </div>
    <div style="display:flex; align-items:center; gap:8px;">
    <label class="xirus-switch"><input type="checkbox" id="xirus-opt-videos" ${wantsVideos ? 'checked' : ''}><span class="xirus-slider"></span></label>
    <span style="font-size:11px; font-weight:600; color:#ccc;">HD Videos</span>
    </div>
    </div>
    <div class="xirus-track">
    <svg class="xirus-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
    <div class="xirus-line"></div>
    <div id="xirus-node" class="xirus-node"></div>
    <svg class="xirus-icon xirus-icon-target" viewBox="0 0 24 24"><path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/></svg>
    </div>
    <div style="display:flex; gap:12px; margin-bottom:18px;">
    <div style="flex:1; text-align:center; padding:12px; background:rgba(255,255,255,0.03); border-radius:8px; border:1px solid rgba(52, 199, 89, 0.2);">
    <div id="xirus-saved" style="font-size:26px; font-weight:800; color:#34c759; line-height:1;">0</div>
    <div style="color:#8e8e93; font-size:9px; font-weight:700; letter-spacing:1px; margin-top:6px;">EXTRACTED</div>
    </div>
    <div style="flex:1; text-align:center; padding:12px; background:rgba(255,255,255,0.03); border-radius:8px; border:1px solid rgba(255, 69, 58, 0.2);">
    <div id="xirus-skip" style="font-size:26px; font-weight:800; color:#ff453a; line-height:1;">0</div>
    <div style="color:#8e8e93; font-size:9px; font-weight:700; letter-spacing:1px; margin-top:6px;">FILTERED</div>
    </div>
    </div>
    <button id="xirus-ctrl" style="width:100%; padding:14px; background:linear-gradient(135deg, #00f2fe 0%, #4facfe 100%); border:none; border-radius:8px; color:#000; font-weight:800; font-size:12px; letter-spacing:1px; cursor:pointer; transition:0.2s;">
    INITIALIZE SEQUENCE
    </button>
    <div id="xirus-log" style="margin-top:14px; color:#8e8e93; font-family:monospace; font-size:10px; text-align:center; height:14px; overflow:hidden;">SYSTEM STANDBY</div>
    </div>
    `;
    document.body.appendChild(ui);

    const triggerAnimation = (isSuccess) => {
      const node = document.getElementById('xirus-node');
      if(!node) return;
      node.className = 'xirus-node';
      void node.offsetWidth;
      node.classList.add(isSuccess ? 'anim-transfer' : 'anim-fail');
    };

    let isDragging = false, currentX, currentY, initialX, initialY, xOffset = 0, yOffset = 0;
    const drag = document.getElementById('xirus-drag');
    drag.onmousedown = e => { if(e.target.tagName !== 'SPAN') { initialX = e.clientX - xOffset; initialY = e.clientY - yOffset; isDragging = true; }};
    document.onmouseup = () => { initialX = currentX; initialY = currentY; isDragging = false; };
    document.onmousemove = e => { if (isDragging) { e.preventDefault(); currentX = e.clientX - initialX; currentY = e.clientY - initialY; xOffset = currentX; yOffset = currentY; ui.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`; }};

    document.getElementById('xirus-min').onclick = () => {
      const isMin = ui.style.height === '48px';
      ui.style.height = isMin ? 'auto' : '48px';
      ui.style.width = isMin ? '360px' : '220px';
    };
    document.getElementById('xirus-close').onclick = () => { pipeline.isRunning = false; ui.remove(); };

    await new Promise(resolve => {
      document.getElementById('xirus-ctrl').onclick = function() {
        if (this.innerText === "INITIALIZE SEQUENCE") {
          pipeline.limit = +document.getElementById('xirus-limit').value || Infinity;
          if (pipeline.limit === 0) pipeline.limit = Infinity;

          localStorage.setItem('xirus_limit', pipeline.limit);
          localStorage.setItem('xirus_size', document.getElementById('xirus-size').value);
          localStorage.setItem('xirus_folder', document.getElementById('xirus-folder').value);
          localStorage.setItem('xirus_opt_photos', document.getElementById('xirus-opt-photos').checked);
          localStorage.setItem('xirus_opt_videos', document.getElementById('xirus-opt-videos').checked);

          this.innerText = "⏸ PAUSE SEQUENCE";
          this.style.background = "rgba(255,255,255,0.1)";
          this.style.color = "#fff";
          resolve();
        } else {
          pipeline.isPaused = !pipeline.isPaused;
          this.innerText = pipeline.isPaused ? "▶ RESUME SEQUENCE" : "⏸ PAUSE SEQUENCE";
          this.style.background = pipeline.isPaused ? "#34c759" : "rgba(255,255,255,0.1)";
          this.style.color = pipeline.isPaused ? "#000" : "#fff";
        }
      };
    });

    const logUpdate = (msg, isError = false) => {
      document.getElementById('xirus-saved').innerText = pipeline.saved;
      document.getElementById('xirus-skip').innerText = pipeline.skipped;
      const el = document.getElementById('xirus-log');
      el.innerText = msg;
      el.style.color = isError ? '#ff453a' : '#8e8e93';
    };

    const extractDateContext = () => {
      const match = document.body.innerText.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(20\d{2})/i);
      return match ? { monthYear: `${match[1]}-${match[2]}`, year: match[2] } : { monthYear: 'Unknown-Date', year: 'Unsorted' };
    };

    // --- AGGRESSIVE SCROLL FIX ---
    const executeScroll = () => {
      // এটি স্ক্রিনের সমস্ত স্ক্রলযোগ্য কন্টেইনারকে একসাথে পুশ করবে
      const scrollableDivs = Array.from(document.querySelectorAll('div')).filter(el => el.scrollHeight > el.clientHeight);
      scrollableDivs.forEach(div => { div.scrollTop += 2000; });
      window.scrollBy(0, 2000);
    };

    while (pipeline.saved < pipeline.limit && pipeline.isRunning) {
      if (pipeline.isPaused) { await humanSleep(500, 500); continue; }

      const MIN_SIZE = +(document.getElementById('xirus-size').value || 0) * 1024;
      const PROJECT = document.getElementById('xirus-folder').value.replace(/[<>:"/\\|?*]/g, '_').trim() || "XIRUS_Project";
      const WANTS_PHOTOS = document.getElementById('xirus-opt-photos').checked;
      const WANTS_VIDEOS = document.getElementById('xirus-opt-videos').checked;

      executeScroll();
      logUpdate(`Scanning for new assets...`);
      await humanSleep(1800, 2500);

      const batch = [];
      document.querySelectorAll('video, source, img, [style*="background-image"]').forEach(el => {
        let src = el.src || el.currentSrc;
        if (!src && el.style.backgroundImage) src = (el.style.backgroundImage.match(/url\(["']?([^"']+)["']?\)/) || [])[1];

        if (src && /googleusercontent|ggpht/.test(src) && !src.includes('/a/')) {
          const base = src.split('=')[0];
          if (!pipeline.history.has(base)) {
            pipeline.history.add(base);
            batch.push({ base });
          }
        }
      });

      if (batch.length === 0) {
        pipeline.emptyScrolls++;
        logUpdate(`Searching... (${pipeline.emptyScrolls}/10)`);
        if (pipeline.emptyScrolls >= 10) break; // এখন সে ১০ বার চেষ্টা করবে হাল ছাড়ার আগে
      } else {
        pipeline.emptyScrolls = 0;
      }

      for (const target of batch) {
        if (pipeline.saved >= pipeline.limit || !pipeline.isRunning) break;
        if (pipeline.isPaused) await humanSleep(1000, 1000);

        try {
          let url = '';
          let ext = 'jpg';
          let check = null;
          let isActuallyVideo = false;

          if (WANTS_VIDEOS) {
            const vidTest = await fetch(target.base + '=m18', { method: 'HEAD' });
            if (vidTest.ok && vidTest.headers.get('content-type')?.includes('video')) {
              isActuallyVideo = true;
            }
          }

          if (isActuallyVideo) {
            ext = 'mp4';
            for (const q of ['=m37', '=m22', '=m18']) {
              check = await fetch(target.base + q, { method: 'HEAD' });
              if (check.ok && check.headers.get('content-type')?.includes('video')) {
                url = target.base + q;
                break;
              }
            }
          } else if (WANTS_PHOTOS) {
            url = target.base + '=s0-d';
            ext = 'jpg';
            check = await fetch(url, { method: 'HEAD' });
          }

          if (!url || !check) { pipeline.skipped++; triggerAnimation(false); await humanSleep(300, 500); continue; }
          if (check.status === 429) { logUpdate("Rate Limit Detected. Pausing 15s...", true); await humanSleep(15000, 18000); continue; }
          if (!check.ok) { pipeline.skipped++; triggerAnimation(false); await humanSleep(300, 500); continue; }

          const sizeBytes = parseInt(check.headers.get('content-length') || '0', 10);

          if (ext === 'jpg' && sizeBytes > 0 && sizeBytes < MIN_SIZE) {
            pipeline.skipped++;
            triggerAnimation(false);
            await humanSleep(300, 500);
            continue;
          }

          const dateMeta = extractDateContext();
          pipeline.saved++;

          const filename = `${PROJECT}_${String(pipeline.saved).padStart(4, '0')}_${dateMeta.monthYear}.${ext}`;
          const folderPath = `${PROJECT}/${dateMeta.year}`;

          logUpdate(`Transferring: ${filename}`);
          pipeline.logData += `[${dateMeta.year}] ${filename} -> Source: ${url}\n`;

          chrome.runtime.sendMessage({ action: "download_asset", url: url, folder: folderPath, filename: filename });

          triggerAnimation(true);
          await humanSleep(1200, 1800);

        } catch (err) {
          pipeline.skipped++;
          triggerAnimation(false);
          await humanSleep(300, 500);
        }
      }
    }

    if (pipeline.saved > 0) {
      chrome.runtime.sendMessage({
        action: "download_asset",
        url: "data:text/plain;charset=utf-8," + encodeURIComponent(pipeline.logData),
                                 folder: document.getElementById('xirus-folder').value.replace(/[<>:"/\\|?*]/g, '_').trim(),
                                 filename: `XIRUS_Extraction_Log.txt`
      });
    }

    logUpdate("🏁 SEQUENCE COMPLETE");
    const btn = document.getElementById('xirus-ctrl');
    if (btn) { btn.innerText = "CLOSE TERMINAL"; btn.style.background = "#21262d"; btn.style.color = "#fff"; btn.onclick = () => ui.remove(); }
  })();
}
