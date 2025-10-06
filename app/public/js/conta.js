function voltarPaginaInicial() {
    window.location.href = '/';
}

function deslogar() {
    if (confirm('Tem certeza que deseja sair da sua conta?')) {
        window.location.href = '/logout';
    }
}

function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const themeButton = document.querySelector('.theme-toggle');
    themeButton.textContent = newTheme === 'dark' ? '☀️' : '🌙';
}

function toggleEdit(section) {
    const modal = document.getElementById('editModal');
    modal.style.display = 'block';
}

function closeEditModal() {
    const modal = document.getElementById('editModal');
    modal.style.display = 'none';
}

function openPasswordModal() {
    document.getElementById('passwordModal').style.display = 'block';
}

function closePasswordModal() {
    document.getElementById('passwordModal').style.display = 'none';
    document.getElementById('passwordForm').reset();
    resetPasswordStrength();
}

function openPhotoModal() {
    document.getElementById('photoModal').style.display = 'block';
}

function closePhotoModal() {
    document.getElementById('photoModal').style.display = 'none';
    document.getElementById('photoPreview').style.display = 'none';
    document.getElementById('photoInput').value = '';
}

function checkPasswordStrength(password) {
    const strengthIndicator = document.getElementById('strengthIndicator');
    const strengthText = document.getElementById('strengthText');
    
    let strength = 0;
    let text = '';
    
    if (password.length >= 6) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    
    strengthIndicator.className = 'strength-fill';
    
    switch (strength) {
        case 0:
        case 1:
            strengthIndicator.classList.add('weak');
            text = 'Senha muito fraca';
            break;
        case 2:
            strengthIndicator.classList.add('fair');
            text = 'Senha fraca';
            break;
        case 3:
            strengthIndicator.classList.add('good');
            text = 'Senha boa';
            break;
        case 4:
        case 5:
            strengthIndicator.classList.add('strong');
            text = 'Senha forte';
            break;
    }
    
    strengthText.textContent = text;
    return strength;
}

function resetPasswordStrength() {
    const strengthIndicator = document.getElementById('strengthIndicator');
    const strengthText = document.getElementById('strengthText');
    strengthIndicator.className = 'strength-fill';
    strengthText.textContent = 'Digite uma senha';
}

async function handlePasswordForm(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        alert('Todos os campos são obrigatórios!');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        alert('As senhas não coincidem!');
        return;
    }
    
    if (checkPasswordStrength(newPassword) < 2) {
        alert('Escolha uma senha mais forte!');
        return;
    }
    
    try {
        const response = await fetch('/api/update-password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin',
            body: JSON.stringify({ currentPassword, newPassword })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Senha alterada com sucesso!');
            closePasswordModal();
        } else {
            alert('Erro: ' + result.error);
        }
    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        alert('Erro ao alterar senha. Tente novamente.');
    }
}

let cropData = {
    image: null,
    scale: 1,
    rotation: 0,
    offsetX: 0,
    offsetY: 0,
    isDragging: false,
    lastX: 0,
    lastY: 0
};

function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            cropData.image = new Image();
            cropData.image.onload = function() {
                initializeCrop();
                document.getElementById('photoPreview').style.display = 'block';
            };
            cropData.image.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function initializeCrop() {
    const canvas = document.getElementById('cropCanvas');
    const ctx = canvas.getContext('2d');
    
    // Reset crop data
    cropData.scale = 1;
    cropData.rotation = 0;
    cropData.offsetX = 0;
    cropData.offsetY = 0;
    
    // Reset sliders
    document.getElementById('zoomSlider').value = 1;
    document.getElementById('rotateSlider').value = 0;
    
    // Add event listeners
    setupCropControls();
    
    // Initial draw
    drawCroppedImage();
}

function setupCropControls() {
    const canvas = document.getElementById('cropCanvas');
    const zoomSlider = document.getElementById('zoomSlider');
    const rotateSlider = document.getElementById('rotateSlider');
    
    // Zoom control
    zoomSlider.oninput = function() {
        cropData.scale = parseFloat(this.value);
        drawCroppedImage();
    };
    
    // Rotation control
    rotateSlider.oninput = function() {
        cropData.rotation = parseFloat(this.value);
        drawCroppedImage();
    };
    
    // Mouse drag controls
    canvas.onmousedown = function(e) {
        cropData.isDragging = true;
        const rect = canvas.getBoundingClientRect();
        cropData.lastX = e.clientX - rect.left;
        cropData.lastY = e.clientY - rect.top;
    };
    
    canvas.onmousemove = function(e) {
        if (cropData.isDragging) {
            const rect = canvas.getBoundingClientRect();
            const currentX = e.clientX - rect.left;
            const currentY = e.clientY - rect.top;
            
            cropData.offsetX += currentX - cropData.lastX;
            cropData.offsetY += currentY - cropData.lastY;
            
            cropData.lastX = currentX;
            cropData.lastY = currentY;
            
            drawCroppedImage();
        }
    };
    
    canvas.onmouseup = function() {
        cropData.isDragging = false;
    };
    
    canvas.onmouseleave = function() {
        cropData.isDragging = false;
    };
}

function drawCroppedImage() {
    const canvas = document.getElementById('cropCanvas');
    const ctx = canvas.getContext('2d');
    
    if (!cropData.image) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Save context
    ctx.save();
    
    // Move to center
    ctx.translate(canvas.width / 2, canvas.height / 2);
    
    // Apply rotation
    ctx.rotate(cropData.rotation * Math.PI / 180);
    
    // Apply scale
    ctx.scale(cropData.scale, cropData.scale);
    
    // Calculate image dimensions to fit in circle
    const size = Math.min(cropData.image.width, cropData.image.height);
    const drawSize = 180; // Slightly smaller than canvas for border
    
    // Draw image with offset
    ctx.drawImage(
        cropData.image,
        -drawSize / 2 + cropData.offsetX / cropData.scale,
        -drawSize / 2 + cropData.offsetY / cropData.scale,
        drawSize,
        drawSize
    );
    
    // Restore context
    ctx.restore();
    
    // Create circular mask
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 98, 0, 2 * Math.PI);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
}

function resetCrop() {
    cropData.scale = 1;
    cropData.rotation = 0;
    cropData.offsetX = 0;
    cropData.offsetY = 0;
    
    document.getElementById('zoomSlider').value = 1;
    document.getElementById('rotateSlider').value = 0;
    
    drawCroppedImage();
}

function openCamera() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function(stream) {
                // Criar elemento de vídeo para câmera
                const video = document.createElement('video');
                video.srcObject = stream;
                video.play();
                
                // Substituir área de upload por vídeo
                const uploadArea = document.querySelector('.upload-area');
                uploadArea.innerHTML = '';
                uploadArea.appendChild(video);
                
                // Adicionar botão para capturar
                const captureBtn = document.createElement('button');
                captureBtn.textContent = '📸 Capturar Foto';
                captureBtn.className = 'camera-btn';
                captureBtn.onclick = () => capturePhoto(video, stream);
                uploadArea.appendChild(captureBtn);
            })
            .catch(function(err) {
                alert('Erro ao acessar câmera: ' + err.message);
            });
    } else {
        alert('Câmera não disponível neste dispositivo');
    }
}

function capturePhoto(video, stream) {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    const dataURL = canvas.toDataURL('image/jpeg');
    
    // Create image for crop
    cropData.image = new Image();
    cropData.image.onload = function() {
        initializeCrop();
        document.getElementById('photoPreview').style.display = 'block';
    };
    cropData.image.src = dataURL;
    
    // Parar stream da câmera
    stream.getTracks().forEach(track => track.stop());
    
    // Restaurar área de upload
    const uploadArea = document.querySelector('.upload-area');
    uploadArea.innerHTML = `
        <input type="file" id="photoInput" accept="image/*" style="display: none;">
        <button type="button" onclick="document.getElementById('photoInput').click()" class="upload-btn">
            📁 Escolher Arquivo
        </button>
        <p>ou</p>
        <button type="button" onclick="openCamera()" class="camera-btn">
            📷 Usar Câmera
        </button>
    `;
    
    // Reativar event listener
    document.getElementById('photoInput').addEventListener('change', handlePhotoUpload);
}

async function savePhoto() {
    const canvas = document.getElementById('cropCanvas');
    
    if (!cropData.image) {
        alert('Selecione uma foto primeiro!');
        return;
    }
    
    try {
        // Convert canvas to blob
        canvas.toBlob(async function(blob) {
            const formData = new FormData();
            formData.append('photo', blob, 'profile.jpg');
            await uploadPhoto(formData);
        }, 'image/jpeg', 0.9);
        
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao salvar foto');
    }
}

async function uploadPhoto(formData) {
    try {
        const response = await fetch('/api/upload-photo', {
            method: 'POST',
            credentials: 'same-origin',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            const userPhoto = document.getElementById('userPhoto');
            const avatarCircle = document.getElementById('avatarCircle');
            
            userPhoto.src = result.fotoPath;
            userPhoto.style.display = 'block';
            avatarCircle.style.display = 'none';
            
            closePhotoModal();
            alert('Foto salva com sucesso!');
        } else {
            alert('Erro: ' + result.error);
        }
    } catch (error) {
        console.error('Erro no upload:', error);
        alert('Erro ao fazer upload da foto');
    }
}

async function removePhoto() {
    try {
        const response = await fetch('/api/remove-photo', {
            method: 'DELETE',
            credentials: 'same-origin'
        });
        
        const result = await response.json();
        
        if (result.success) {
            const userPhoto = document.getElementById('userPhoto');
            const avatarCircle = document.getElementById('avatarCircle');
            
            userPhoto.style.display = 'none';
            avatarCircle.style.display = 'flex';
            
            closePhotoModal();
        } else {
            alert('Erro ao remover foto');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao remover foto');
    }
}

async function loadUserData() {
    try {
        const response = await fetch('/api/user-data', {
            credentials: 'same-origin'
        });
        const userData = await response.json();
        
        // Atualizar informações do usuário
        if (document.getElementById('userName')) {
            document.getElementById('userName').textContent = userData.NOME_USUARIO;
        }
        document.getElementById('nome-display').textContent = userData.NOME_USUARIO;
        document.getElementById('email-display').textContent = userData.EMAIL_USUARIO;
        
        // Atualizar avatar
        const avatarCircle = document.getElementById('avatarCircle');
        avatarCircle.textContent = userData.NOME_USUARIO.charAt(0).toUpperCase();
        
        // Carregar foto se existir
        if (userData.FOTO_USUARIO) {
            const userPhoto = document.getElementById('userPhoto');
            const avatarCircle = document.getElementById('avatarCircle');
            userPhoto.src = userData.FOTO_USUARIO;
            userPhoto.style.display = 'block';
            avatarCircle.style.display = 'none';
        }
        
        // Carregar estatísticas
        await loadUserStats();
        
    } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
    }
}

async function loadUserStats() {
    try {
        const response = await fetch('/api/user-stats', {
            credentials: 'same-origin'
        });
        const stats = await response.json();
        
        // Atualizar estatísticas na página
        const statNumbers = document.querySelectorAll('.stat-number');
        if (statNumbers.length >= 3) {
            statNumbers[0].textContent = stats.pedidosRealizados;
            statNumbers[0].setAttribute('data-value', stats.pedidosRealizados);
            
            statNumbers[1].textContent = `R$ ${stats.totalGasto.toFixed(2).replace('.', ',')}`;
            statNumbers[1].setAttribute('data-value', stats.totalGasto);
            
            statNumbers[2].textContent = stats.diasComoCliente;
            statNumbers[2].setAttribute('data-value', stats.diasComoCliente);
        }
        
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}

function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
        const target = parseFloat(stat.getAttribute('data-value') || stat.textContent.replace(/[^\d.,]/g, '').replace(',', '.'));
        let current = 0;
        const increment = target / 50;
        const isPrice = stat.textContent.includes('R$');
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            if (isPrice) {
                stat.textContent = `R$ ${current.toFixed(2).replace('.', ',')}`;
            } else {
                stat.textContent = Math.floor(current);
            }
        }, 30);
    });
}

function savePreferences() {
    const preferences = {};
    document.querySelectorAll('.preference-item input').forEach((checkbox, index) => {
        preferences[`pref_${index}`] = checkbox.checked;
    });
    
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    
    // Mostrar feedback visual
    const prefCard = document.querySelector('.preferences').closest('.info-card');
    const originalBg = prefCard.style.background;
    prefCard.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
    prefCard.style.color = 'white';
    
    setTimeout(() => {
        prefCard.style.background = originalBg;
        prefCard.style.color = '';
    }, 1000);
}

function loadPreferences() {
    const saved = localStorage.getItem('userPreferences');
    if (saved) {
        const preferences = JSON.parse(saved);
        document.querySelectorAll('.preference-item input').forEach((checkbox, index) => {
            if (preferences[`pref_${index}`] !== undefined) {
                checkbox.checked = preferences[`pref_${index}`];
            }
        });
    }
}

async function handleEditForm(event) {
    event.preventDefault();
    
    const nome = document.getElementById('editNome').value;
    const email = document.getElementById('editEmail').value;
    
    if (!nome || !email) {
        alert('Nome e email são obrigatórios!');
        return;
    }
    
    try {
        const response = await fetch('/api/update-profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin',
            body: JSON.stringify({ nome, email })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Atualizar displays
            document.getElementById('nome-display').textContent = nome;
            document.getElementById('email-display').textContent = email;
            
            // Atualizar avatar
            document.querySelector('.avatar-circle').textContent = nome.charAt(0).toUpperCase();
            document.querySelector('.profile-info h2').textContent = nome;
            
            closeEditModal();
            
            // Mostrar feedback de sucesso
            const infoCard = document.querySelector('.info-list').closest('.info-card');
            const originalBg = infoCard.style.background;
            infoCard.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
            infoCard.style.color = 'white';
            
            setTimeout(() => {
                infoCard.style.background = originalBg;
                infoCard.style.color = '';
            }, 1500);
            
            alert('Perfil atualizado com sucesso!');
        } else {
            alert('Erro: ' + result.error);
        }
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        alert('Erro ao atualizar perfil. Tente novamente.');
    }
}

function addCardHoverEffects() {
    document.querySelectorAll('.info-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 8px 25px rgba(255, 140, 0, 0.2)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(-2px)';
            card.style.boxShadow = '';
        });
    });
}

function initializeTooltips() {
    const actionBtns = document.querySelectorAll('.action-btn');
    actionBtns.forEach(btn => {
        btn.addEventListener('mouseenter', (e) => {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = btn.title || 'Clique para acessar';
            tooltip.style.cssText = `
                position: absolute;
                background: var(--text-color);
                color: white;
                padding: 0.5rem;
                border-radius: 4px;
                font-size: 0.8rem;
                z-index: 1000;
                pointer-events: none;
                transform: translateX(-50%);
                white-space: nowrap;
            `;
            
            document.body.appendChild(tooltip);
            
            const rect = btn.getBoundingClientRect();
            tooltip.style.left = rect.left + rect.width / 2 + 'px';
            tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';
            
            btn._tooltip = tooltip;
        });
        
        btn.addEventListener('mouseleave', () => {
            if (btn._tooltip) {
                btn._tooltip.remove();
                btn._tooltip = null;
            }
        });
    });
}

// Funções de debug
async function debugPedidos() {
    try {
        const response = await fetch('/api/debug-pedidos', {
            credentials: 'same-origin'
        });
        const data = await response.json();
        
        console.log('Debug pedidos:', data);
        alert(`Pedidos encontrados: ${data.total_pedidos}\n\nDetalhes no console (F12)`);
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao buscar pedidos');
    }
}

async function aprovarUltimoPedido() {
    try {
        const response = await fetch('/api/aprovar-ultimo-pedido', {
            method: 'POST',
            credentials: 'same-origin'
        });
        const data = await response.json();
        
        if (data.success) {
            alert(data.message);
            // Recarregar estatísticas
            loadUserStats();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao aprovar pedido');
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Carregar tema salvo
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }
    
    // Carregar dados do usuário
    loadUserData();
    loadPreferences();
    
    // Animar estatísticas
    setTimeout(animateStats, 500);
    
    // Adicionar efeitos de hover
    addCardHoverEffects();
    
    // Inicializar tooltips
    initializeTooltips();
    
    // Event listeners
    const editForm = document.getElementById('editForm');
    if (editForm) {
        editForm.addEventListener('submit', handleEditForm);
    }
    
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordForm);
    }
    
    const photoInput = document.getElementById('photoInput');
    if (photoInput) {
        photoInput.addEventListener('change', handlePhotoUpload);
    }
    
    const newPasswordInput = document.getElementById('newPassword');
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', (e) => {
            checkPasswordStrength(e.target.value);
        });
    }
    
    // Salvar preferências automaticamente
    document.querySelectorAll('.preference-item input').forEach(checkbox => {
        checkbox.addEventListener('change', savePreferences);
    });
    
    // Fechar modais ao clicar fora
    window.onclick = (event) => {
        const editModal = document.getElementById('editModal');
        const passwordModal = document.getElementById('passwordModal');
        const photoModal = document.getElementById('photoModal');
        
        if (event.target === editModal) {
            closeEditModal();
        }
        if (event.target === passwordModal) {
            closePasswordModal();
        }
        if (event.target === photoModal) {
            closePhotoModal();
        }
    };
    
    // Atalhos de teclado
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeEditModal();
            closePasswordModal();
            closePhotoModal();
        }
    });
    
    // Animação de entrada
    document.querySelectorAll('.info-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
});