const { jsPDF } = window.jspdf;
function switchTab(tabName) {
 const contents = document.querySelectorAll('.tab-content');
 contents.forEach(content => content.classList.remove('active'));
 const buttons = document.querySelectorAll('.tab-btn');
 buttons.forEach(btn => btn.classList.remove('active'));
 document.getElementById(tabName).classList.add('active');
 const targetBtn = document.querySelector(`[data-tab="${tabName}"]`);
 if (targetBtn) targetBtn.classList.add('active');
}
document.addEventListener('DOMContentLoaded', function () {
 const tabButtons = document.querySelectorAll('.tab-btn');
 tabButtons.forEach(btn => {
 btn.addEventListener('click', function () {
 switchTab(this.getAttribute('data-tab'));
 });
 });
 initSelectButtons();
});
function initSelectButtons() {
 const selectButtons = document.querySelectorAll('.select-btn');
 selectButtons.forEach(btn => {
 btn.addEventListener('click', function () {
 const parent = this.parentElement;
 const siblings = parent.querySelectorAll('.select-btn');
 siblings.forEach(s => s.classList.remove('selected'));
 this.classList.add('selected');
 const hiddenInput = parent.parentElement.querySelector('input[type="hidden"]');
 if (hiddenInput) hiddenInput.value = this.getAttribute('data-value');
 });
 });
}

function calculate() {
 const type = document.getElementById('type').value;
 const width = parseFloat(document.getElementById('width').value);
 const height = parseFloat(document.getElementById('height').value);
 const openType = document.getElementById('openType').value;

 if (!type) { alert('请选择类型（窗/门）'); return; }
 if (!width || width <= 0) { alert('请输入有效的宽度'); return; }
 if (!height || height <= 0) { alert('请输入有效的高度'); return; }
 if (!openType) { alert('请选择开启方式'); return; }

 const frame = ((width + height) * 2 / 1000).toFixed(2);
 let sash = 0;
 if (openType === '平开') sash = ((width + height) * 2 / 1000).toFixed(2);
 else if (openType === '推拉') sash = (width * 2 / 1000).toFixed(2);
 const glass = ((width + height) * 2 / 1000).toFixed(2);
 const area = (width * height / 1000000).toFixed(3);
 const mullion = (height / 1000).toFixed(2);
 const cross = (width / 1000).toFixed(2);
 const total = (parseFloat(frame) + parseFloat(sash) + parseFloat(glass) + parseFloat(mullion) + parseFloat(cross)).toFixed(2);

 document.getElementById('frameResult').textContent = frame;
 document.getElementById('sashResult').textContent = sash;
 document.getElementById('glassResult').textContent = glass;
 document.getElementById('areaResult').textContent = area;
 document.getElementById('mullionResult').textContent = mullion;
 document.getElementById('crossResult').textContent = cross;
 document.getElementById('totalResult').textContent = total;
 document.getElementById('result').style.display = 'block';
 document.getElementById('result').scrollIntoView({ behavior: 'smooth' });
}

function contactSales() {
 const type = document.getElementById('type').value;
 const w = document.getElementById('width').value;
 const h = document.getElementById('height').value;
 const openType = document.getElementById('openType').value;
 const msg = `【门窗配单询价】
类型：${type}
尺寸：${w}mm × ${h}mm
开启：${openType}
框料：${document.getElementById('frameResult').textContent}米
扇料：${document.getElementById('sashResult').textContent}米
压线：${document.getElementById('glassResult').textContent}米
面积：${document.getElementById('areaResult').textContent}㎡
总用料：${document.getElementById('totalResult').textContent}米`;
 copyToClipboard(msg);
 alert('已复制到剪贴板，请打开微信发送！');
}

function copyToClipboard(text) {
 if (navigator.clipboard) navigator.clipboard.writeText(text);
 else {
 const t = document.createElement('textarea');
 t.value = text; document.body.appendChild(t); t.select(); document.execCommand('copy'); document.body.removeChild(t);
 }
}

function exportPDF() {
 const res = document.getElementById('result');
 if (!res) { alert('请先计算'); return; }
 html2canvas(res).then(canvas => {
 const pdf = new jsPDF('p', 'mm', 'a4');
 pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 10, 170, 0);
 pdf.save('门窗配单.pdf');
 });
}

function printResult() {
 const content = document.getElementById('result').innerText;
 if (!content) { alert('请先计算'); return; }
 const w = window.open('', '_blank');
 w.document.write(`<pre style="font-size:16px;padding:20px;">${content}</pre>`);
 w.document.close(); w.print();
}

let uploadedFiles = [];
function handleFiles(files) {
 const previewArea = document.getElementById('previewArea');
 for (let i = 0; i < files.length; i++) {
 const file = files[i];
 if (!file.type.startsWith('image/')) { alert(file.name + ' 不是图片'); continue; }
 if (file.size > 10 * 1024 * 1024) { alert('文件过大'); continue; }
 uploadedFiles.push(file);
 const reader = new FileReader();
 reader.onload = e => {
 const item = document.createElement('div'); item.className = 'preview-item';
 const img = document.createElement('img'); img.src = e.target.result;
 const btn = document.createElement('button'); btn.className = 'remove-btn'; btn.textContent = '×';
 btn.onclick = () => { uploadedFiles.splice(uploadedFiles.indexOf(file), 1); item.remove(); };
 item.appendChild(img); item.appendChild(btn); previewArea.appendChild(item);
 };
 reader.readAsDataURL(file);
 }
}

function submitQuote() {
 if (uploadedFiles.length === 0) { alert('请上传图片'); return; }
 const msg = `【来图报价】\n图片：${uploadedFiles.length}张\n备注：${document.getElementById('remark').value}`;
 copyToClipboard(msg);
 alert('已复制文字，请手动发图片+文字给销售');
}

const uploadArea = document.getElementById('uploadArea');
if (uploadArea) {
 uploadArea.addEventListener('dragover', e => { e.preventDefault(); uploadArea.style.borderColor = '#764ba2'; });
 uploadArea.addEventListener('dragleave', e => { e.preventDefault(); uploadArea.style.borderColor = '#667eea'; });
 uploadArea.addEventListener('drop', e => {
 e.preventDefault(); uploadArea.style.borderColor = '#667eea';
 handleFiles(e.dataTransfer.files);
 });
}
