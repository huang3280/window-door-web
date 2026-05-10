// 切换标签页
function switchTab(tabName) {
    // 隐藏所有标签内容
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.classList.remove('active'));
    
    // 移除所有按钮的激活状态
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // 显示选中的标签
    document.getElementById(tabName).classList.add('active');
    
    // 激活对应的按钮
    const targetBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (targetBtn) {
        targetBtn.classList.add('active');
    }
}

// 初始化标签页切换
document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
    
    // 初始化选择按钮
    initSelectButtons();
});

// 初始化选择按钮
function initSelectButtons() {
    const selectButtons = document.querySelectorAll('.select-btn');
    selectButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // 找到同组的所有按钮
            const parent = this.parentElement;
            const siblings = parent.querySelectorAll('.select-btn');
            siblings.forEach(s => s.classList.remove('selected'));
            
            // 选中当前按钮
            this.classList.add('selected');
            
            // 更新隐藏的input值
            const hiddenInput = parent.parentElement.querySelector('input[type="hidden"]');
            if (hiddenInput) {
                hiddenInput.value = this.getAttribute('data-value');
            }
        });
    });
}

// 材料计算
function calculate() {
    const type = document.getElementById('type').value;
    const width = parseFloat(document.getElementById('width').value);
    const height = parseFloat(document.getElementById('height').value);
    const openType = document.getElementById('openType').value;
    
    // 验证输入
    if (!type) {
        alert('请选择类型（窗/门）');
        return;
    }
    
    if (!width || width <= 0) {
        alert('请输入有效的宽度');
        return;
    }
    
    if (!height || height <= 0) {
        alert('请输入有效的高度');
        return;
    }
    
    if (!openType) {
        alert('请选择开启方式（平开/推拉）');
        return;
    }
    
    // 计算材料用量
    // 框料 = (宽 + 高) * 2 / 1000 (米)
    const frame = ((width + height) * 2 / 1000).toFixed(2);
    
    // 扇料根据开启方式计算
    let sash = 0;
    if (openType === '平开') {
        // 平开：扇料 = (宽 + 高) * 2 / 1000
        sash = ((width + height) * 2 / 1000).toFixed(2);
    } else if (openType === '推拉') {
        // 推拉：扇料 = 宽 * 2 / 1000
        sash = (width * 2 / 1000).toFixed(2);
    }
    
    // 压线 = (宽 + 高) * 2 / 1000 (米)
    const glass = ((width + height) * 2 / 1000).toFixed(2);
    
    // 显示结果
    document.getElementById('frameResult').textContent = frame;
    document.getElementById('sashResult').textContent = sash;
    document.getElementById('glassResult').textContent = glass;
    
    document.getElementById('result').style.display = 'block';
    
    // 滚动到结果区域
    document.getElementById('result').scrollIntoView({ behavior: 'smooth' });
}

// 联系销售（打开微信聊天）
function contactSales() {
    const type = document.getElementById('type').value;
    const width = document.getElementById('width').value;
    const height = document.getElementById('height').value;
    const openType = document.getElementById('openType').value;
    
    const frame = document.getElementById('frameResult').textContent;
    const sash = document.getElementById('sashResult').textContent;
    const glass = document.getElementById('glassResult').textContent;
    
    // 构造询价消息
    const message = `【门窗配单询价】\n类型：${type}\n尺寸：${width}mm × ${height}mm\n开启方式：${openType}\n\n材料用量：\n- 框料：${frame} 米\n- 扇料：${sash} 米\n- 压线：${glass} 米\n\n请报价，谢谢！`;
    
    // 尝试打开微信
    // 方法1：使用 weixin:// 协议（需要用户在手机上）
    // 方法2：复制文本到剪贴板
    
    // 先复制到剪贴板
    copyToClipboard(message);
    
    alert('询价信息已复制到剪贴板！\n\n请打开微信，粘贴发送给销售人员。');
    
    // 尝试打开微信（可能只在手机上有效）
    // window.location.href = 'weixin://';
}

// 复制到剪贴板
function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            console.log('已复制到剪贴板');
        }).catch(err => {
            console.error('复制失败:', err);
            fallbackCopyTextToClipboard(text);
        });
    } else {
        fallbackCopyTextToClipboard(text);
    }
}

// 降级方案：使用 textarea 复制
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = 0;
    textArea.style.left = 0;
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = 0;
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        console.log('已复制到剪贴板（降级方案）');
    } catch (err) {
        console.error('复制失败:', err);
    }
    
    document.body.removeChild(textArea);
}

// 处理文件上传
let uploadedFiles = [];

function handleFiles(files) {
    const previewArea = document.getElementById('previewArea');
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // 验证文件类型
        if (!file.type.startsWith('image/')) {
            alert(`文件 "${file.name}" 不是图片格式！`);
            continue;
        }
        
        // 验证文件大小（限制 10MB）
        if (file.size > 10 * 1024 * 1024) {
            alert(`文件 "${file.name}" 超过 10MB 限制！`);
            continue;
        }
        
        uploadedFiles.push(file);
        
        // 创建预览
        const reader = new FileReader();
        reader.onload = function(e) {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            
            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = file.name;
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.textContent = '×';
            removeBtn.onclick = function() {
                removeFile(file, previewItem);
            };
            
            previewItem.appendChild(img);
            previewItem.appendChild(removeBtn);
            previewArea.appendChild(previewItem);
        };
        
        reader.readAsDataURL(file);
    }
}

// 移除文件
function removeFile(file, previewItem) {
    const index = uploadedFiles.indexOf(file);
    if (index > -1) {
        uploadedFiles.splice(index, 1);
    }
    previewItem.remove();
}

// 提交报价请求
function submitQuote() {
    if (uploadedFiles.length === 0) {
        alert('请至少上传一张图片！');
        return;
    }
    
    const remark = document.getElementById('remark').value;
    
    // 构造报价请求消息
    let message = `【来图报价请求】\n`;
    message += `上传图片数量：${uploadedFiles.length} 张\n`;
    
    if (remark) {
        message += `备注：${remark}\n`;
    }
    
    message += `\n请查看图片并报价，谢谢！`;
    
    // 复制到剪贴板
    copyToClipboard(message);
    
    alert(`报价请求已准备好！\n\n已上传 ${uploadedFiles.length} 张图片\n询价信息已复制到剪贴板！\n\n请打开微信，粘贴发送给销售人员，并发送图片。`);
    
    // 提示用户手动发送图片
    alert('提示：图片需要您手动在微信中发送给销售人员。\n\n我们已为您准备好询价文字，直接粘贴即可。');
}

// 拖拽上传功能
document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('uploadArea');
    
    if (uploadArea) {
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.style.borderColor = '#764ba2';
            this.style.background = '#f0f0f0';
        });
        
        uploadArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.style.borderColor = '#667eea';
            this.style.background = '#f8f9fa';
        });
        
        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            this.style.borderColor = '#667eea';
            this.style.background = '#f8f9fa';
            
            const files = e.dataTransfer.files;
            handleFiles(files);
        });
    }
});
