const { jsPDF } = window.jspdf;
let uploadedFiles = [];
let customerFiles = [];
let customerImagesBase64 = [];

// 切换标签
function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(e => e.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(e => e.classList.remove('active'));
  document.getElementById(tabName).classList.add('active');
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  if (tabName === 'customer') loadCustomerList();
  if (tabName === 'contact') loadContactList();
  if (tabName === 'inventory') loadInventoryTable();
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
  initSelectButtons();
  loadCustomerList();
  loadContactList();
  loadInventoryTable();
  loadTemplateImages();
});

// 选择按钮
function initSelectButtons() {
  document.querySelectorAll('.select-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      this.parentElement.querySelectorAll('.select-btn').forEach(s => s.classList.remove('selected'));
      this.classList.add('selected');
      const inp = this.parentElement.parentElement.querySelector('input[type="hidden"]');
      if (inp) inp.value = this.dataset.value;
    });
  });
}

// 计算 + 五金
function calculate() {
  const type = document.getElementById('type').value;
  const w = parseFloat(document.getElementById('width').value);
  const h = parseFloat(document.getElementById('height').value);
  const openType = document.getElementById('openType').value;

  if (!type || !w || !h || !openType) { alert('请填写完整信息'); return; }

  const frame = ((w + h) * 2 / 1000).toFixed(2);
  let sash = 0;
  if (openType === '平开') sash = ((w + h) * 2 / 1000).toFixed(2);
  else if (openType === '推拉') sash = (w * 2 / 1000).toFixed(2);
  const glass = ((w + h) * 2 / 1000).toFixed(2);
  const area = (w * h / 1000000).toFixed(3);
  const mullion = (h / 1000).toFixed(2);
  const cross = (w / 1000).toFixed(2);
  const total = (parseFloat(frame) + parseFloat(sash) + parseFloat(glass) + parseFloat(mullion) + parseFloat(cross)).toFixed(2);

  let hardware = '';
  if (openType === '平开') hardware = '合页2个 + 执手1套 + 锁点1套';
  if (openType === '推拉') hardware = '滑轮2套 + 钩锁1套 + 防撞条';

  document.getElementById('frameResult').textContent = frame;
  document.getElementById('sashResult').textContent = sash;
  document.getElementById('glassResult').textContent = glass;
  document.getElementById('areaResult').textContent = area;
  document.getElementById('mullionResult').textContent = mullion;
  document.getElementById('crossResult').textContent = cross;
  document.getElementById('totalResult').textContent = total;
  document.getElementById('hardwareResult').textContent = hardware;
  document.getElementById('result').style.display = 'block';
}

// 复制
function copyToClipboard(text) {
  if (navigator.clipboard) navigator.clipboard.writeText(text);
  else {
    const t = document.createElement('textarea');
    t.value = text; document.body.appendChild(t); t.select(); document.execCommand('copy'); document.body.removeChild(t);
  }
}

// 询价
function contactSales() {
  const msg = `【门窗配单】
类型：${document.getElementById('type').value}
尺寸：${document.getElementById('width').value}×${document.getElementById('height').value}
开启：${document.getElementById('openType').value}
框料：${document.getElementById('frameResult').textContent}米
五金：${document.getElementById('hardwareResult').textContent}`;
  copyToClipboard(msg);
  alert('已复制到剪贴板');
}

// PDF
function exportPDF() {
  html2canvas(document.getElementById('result')).then(canvas => {
    const pdf = new jsPDF();
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 10, 180, 0);
    pdf.save('门窗配单.pdf');
  });
}

// 打印
function printResult() {
  const t = document.getElementById('result').innerText;
  const w = window.open('', '_blank');
  w.document.write(`<pre style="padding:20px;font-size:16px;">${t}</pre>`);
  w.document.close(); w.print();
}

// 来图报价上传
function handleFiles(files) {
  for (let i = 0; i < files.length; i++) {
    if (!files[i].type.startsWith('image/')) continue;
    uploadedFiles.push(files[i]);
    const reader = new FileReader();
    reader.onload = e => {
      const div = document.createElement('div'); div.className = 'preview-item';
      const img = document.createElement('img'); img.src = e.target.result;
      const btn = document.createElement('button'); btn.className = 'remove-btn'; btn.textContent = '×';
      btn.onclick = () => { uploadedFiles = uploadedFiles.filter(x => x !== files[i]); div.remove(); };
      div.appendChild(img); div.appendChild(btn);
      document.getElementById('previewArea').appendChild(div);
    };
    reader.readAsDataURL(files[i]);
  }
}

// 一键拨号
function callPhone() {
  const phone = document.getElementById('quotePhone').value;
  if (!phone) { alert('请输入电话'); return; }
  location.href = `tel:${phone}`;
}

// 提交报价
function submitQuote() {
  const phone = document.getElementById('quotePhone').value;
  const msg = `【来图报价】
电话：${phone}
图片：${uploadedFiles.length}张
备注：${document.getElementById('remark').value}`;
  copyToClipboard(msg);
  alert('已复制，可发微信');
}

// ====================== 客户图片上传（修复可保存） ======================
function handleCustomerFiles(files) {
  customerFiles = [];
  customerImagesBase64 = [];
  document.getElementById('customerPreviewArea').innerHTML = '';

  for (let i = 0; i < files.length; i++) {
    if (!files[i].type.startsWith('image/')) continue;
    customerFiles.push(files[i]);

    const reader = new FileReader();
    reader.onload = function (e) {
      const base64 = e.target.result;
      customerImagesBase64.push(base64);

      const div = document.createElement('div'); div.className = 'preview-item';
      const img = document.createElement('img'); img.src = base64;
      const btn = document.createElement('button'); btn.className = 'remove-btn'; btn.textContent = '×';
      btn.onclick = () => {
        customerFiles = customerFiles.filter((x, idx) => idx !== i);
        customerImagesBase64 = customerImagesBase64.filter((x, idx) => idx !== i);
        div.remove();
      };
      div.appendChild(img);
      div.appendChild(btn);
      document.getElementById('customerPreviewArea').appendChild(div);
    };
    reader.readAsDataURL(files[i]);
  }
}

// ====================== 保存客户（带图片永久存储） ======================
function saveCustomer() {
  const name = document.getElementById('c_name').value;
  const tel = document.getElementById('c_tel').value;
  const addr = document.getElementById('c_addr').value;
  const note = document.getElementById('c_note').value;

  if (!name) { alert('请填写姓名'); return; }

  const data = {
    name, tel, addr, note,
    images: customerImagesBase64,
    time: new Date().toLocaleString()
  };

  let list = JSON.parse(localStorage.getItem('customerList') || '[]');
  list.unshift(data);
  localStorage.setItem('customerList', JSON.stringify(list));

  alert('客户信息+图片保存成功！');
  loadCustomerList();
}

// ====================== 加载客户列表（带图片显示+删除） ======================
function loadCustomerList() {
  const list = JSON.parse(localStorage.getItem('customerList') || '[]');
  let html = '';

  list.forEach((item, index) => {
    html += `
    <div class="customer-item" style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid #eee;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <strong style="font-size:16px;">${item.name}</strong>
        <button onclick="deleteCustomer(${index})" style="background:#ff4757;color:white;border:none;padding:5px 12px;border-radius:6px;cursor:pointer;font-size:12px;">
          🗑️ 删除
        </button>
      </div>
      <div style="margin-top:6px;color:#555;">电话：${item.tel}</div>
      <div>地址：${item.addr}</div>
      <div>备注：${item.note}</div>
      <div style="color:#888;font-size:12px;">时间：${item.time}</div>
      <div>上传图纸：${item.images?.length || 0} 张</div>
      <div style="margin-top:8px;display:grid;grid-template-columns:repeat(3,1fr);gap:6px;">
    `;

    if (item.images && item.images.length > 0) {
      item.images.forEach(img => {
        html += `<img src="${img}" style="width:100%;height:70px;object-fit:cover;border-radius:6px;">`;
      });
    }

    html += `
      </div>
    </div>
    `;
  });

  document.getElementById('customerList').innerHTML = html || '暂无客户记录';
}

// 删除客户记录
function deleteCustomer(index) {
  if (!confirm('确定删除这条客户记录？删除后无法恢复！')) return;
  let list = JSON.parse(localStorage.getItem('customerList') || '[]');
  list.splice(index, 1);
  localStorage.setItem('customerList', JSON.stringify(list));
  alert('删除成功！');
  loadCustomerList();
}

// 发给老板
function sendToBoss() {
  const name = document.getElementById('c_name').value;
  const tel = document.getElementById('c_tel').value;
  const addr = document.getElementById('c_addr').value;
  const note = document.getElementById('c_note').value;
  const imgCount = customerImagesBase64.length;

  const msg = `【客户订单】
姓名：${name}
电话：${tel}
地址：${addr}
需求：${note}
图纸：${imgCount}张
请老板审核！`;

  copyToClipboard(msg);
  alert('已复制客户信息，可发给老板！');
}

// ========== 窗型模板 点击更换图片（老板专用） ==========
let currentUploadIndex = 1;
function openTemplateUpload(index) {
  currentUploadIndex = index;
  document.getElementById('templateFileInput').click();
}

document.getElementById('templateFileInput').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function() {
    const imgUrl = reader.result;
    document.getElementById('tempImg' + currentUploadIndex).src = imgUrl;
    localStorage.setItem('templateImg' + currentUploadIndex, imgUrl);
    alert('图' + currentUploadIndex + ' 更换成功！');
  };
  reader.readAsDataURL(file);
});

// 加载模板图片
function loadTemplateImages() {
  for (let i = 1; i <= 4; i++) {
    const saved = localStorage.getItem('templateImg' + i);
    if (saved) document.getElementById('tempImg' + i).src = saved;
  }
}

// ========== 联系方式管理 ==========
function loadContactList() {
  const list = JSON.parse(localStorage.getItem('contactList') || '[]');
  let html = '';

  if (list.length === 0) {
    html = '<p style="text-align:center;color:#999;padding:30px;">暂无联系方式，请添加</p>';
  } else {
    list.forEach((item, index) => {
      html += `
      <div class="contact-card" style="background:#f8f9fa;border-radius:12px;padding:15px;margin-bottom:12px;position:relative;">
        <button onclick="deleteContact(${index})" style="position:absolute;top:10px;right:10px;background:#ff4757;color:white;border:none;width:24px;height:24px;border-radius:50%;cursor:pointer;font-size:14px;">
          ×
        </button>
        <h3 style="margin:0 0 10px;font-size:18px;">${item.name}</h3>
        <div style="margin-bottom:8px;">
          📱 电话：${item.phone || '未填写'}
          ${item.phone ? `<button onclick="callContact('${item.phone}')" style="margin-left:8px;padding:4px 10px;background:#10b981;color:white;border:none;border-radius:5px;cursor:pointer;font-size:12px;">拨打</button>` : ''}
        </div>
        <div>
          💬 微信：${item.wechat || '未填写'}
          ${item.wechat ? `<button onclick="copyWechat('${item.wechat}')" style="margin-left:8px;padding:4px 10px;background:#6366f1;color:white;border:none;border-radius:5px;cursor:pointer;font-size:12px;">复制</button>` : ''}
        </div>
      </div>
      `;
    });
  }

  document.getElementById('contactList').innerHTML = html;
}

function addNewContact() {
  const name = document.getElementById('newContactName').value.trim();
  const phone = document.getElementById('newContactPhone').value.trim();
  const wechat = document.getElementById('newContactWechat').value.trim();

  if (!name) {
    alert('请填写联系人名称');
    return;
  }

  if (!phone && !wechat) {
    alert('至少填写电话或微信其中一项');
    return;
  }

  const list = JSON.parse(localStorage.getItem('contactList') || '[]');
  list.unshift({ name, phone, wechat });
  localStorage.setItem('contactList', JSON.stringify(list));

  // 清空输入框
  document.getElementById('newContactName').value = '';
  document.getElementById('newContactPhone').value = '';
  document.getElementById('newContactWechat').value = '';

  alert('联系方式保存成功！');
  loadContactList();
}

function deleteContact(index) {
  if (!confirm('确定删除这个联系人？')) return;
  const list = JSON.parse(localStorage.getItem('contactList') || '[]');
  list.splice(index, 1);
  localStorage.setItem('contactList', JSON.stringify(list));
  loadContactList();
}

function callContact(phone) {
  location.href = `tel:${phone}`;
}

function copyWechat(wechat) {
  copyToClipboard(wechat);
  alert('微信号已复制：' + wechat);
}

// ========== 库存管理 ==========
function loadInventoryTable() {
  const records = JSON.parse(localStorage.getItem('inventoryRecords') || '[]');
  const materials = {};

  // 汇总每种材料的进/出/存
  records.forEach(r => {
    if (!materials[r.name]) {
      materials[r.name] = { in: 0, out: 0 };
    }
    if (r.type === 'in') {
      materials[r.name].in += r.qty;
    } else {
      materials[r.name].out += r.qty;
    }
  });

  let html = '';
  const names = Object.keys(materials);

  if (names.length === 0) {
    html = '<tr><td colspan="5" style="padding:30px;text-align:center;color:#999;">暂无库存记录</td></tr>';
  } else {
    names.forEach((name, idx) => {
      const m = materials[name];
      const current = m.in - m.out;
      const color = current < 0 ? '#ff4757' : (current < 10 ? '#f59e0b' : '#10b981');
      html += `
      <tr style="border-bottom:1px solid #eee;">
        <td style="padding:12px;font-weight:600;">${name}</td>
        <td style="padding:12px;text-align:center;color:#10b981;">${m.in}</td>
        <td style="padding:12px;text-align:center;color:#ef4444;">${m.out}</td>
        <td style="padding:12px;text-align:center;font-weight:700;color:${color};">${current}</td>
        <td style="padding:12px;text-align:center;">
          <button onclick="deleteMaterial('${name}')" style="background:#ff4757;color:white;border:none;padding:4px 10px;border-radius:5px;cursor:pointer;font-size:12px;">删除</button>
        </td>
      </tr>
      `;
    });
  }

  document.getElementById('inventoryBody').innerHTML = html;
}

function addStockRecord() {
  const name = document.getElementById('materialName').value.trim();
  const qty = parseInt(document.getElementById('materialQty').value);
  const type = document.getElementById('stockType').value;

  if (!name) {
    alert('请输入材料名称');
    return;
  }
  if (!qty || qty <= 0) {
    alert('请输入有效数量');
    return;
  }

  const records = JSON.parse(localStorage.getItem('inventoryRecords') || '[]');
  records.unshift({
    name,
    qty,
    type,
    time: new Date().toLocaleString()
  });
  localStorage.setItem('inventoryRecords', JSON.stringify(records));

  // 清空输入
  document.getElementById('materialName').value = '';
  document.getElementById('materialQty').value = '';

  alert('库存记录成功！');
  loadInventoryTable();
}

function deleteMaterial(name) {
  if (!confirm(`确定删除「${name}」的所有库存记录？`)) return;
  const records = JSON.parse(localStorage.getItem('inventoryRecords') || '[]');
  const filtered = records.filter(r => r.name !== name);
  localStorage.setItem('inventoryRecords', JSON.stringify(filtered));
  loadInventoryTable();
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function () {
  loadContactList();
  loadInventoryTable();
});
