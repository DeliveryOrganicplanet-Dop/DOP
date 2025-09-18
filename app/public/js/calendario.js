const foodData = {
    1: { name: 'Brócolis', image: 'imagens/brocolis.png', benefit: 'Prevenção câncer', description: 'Rico em sulforafano, ajuda na prevenção do câncer de próstata. Consuma 3-4 porções por semana.', link: '/Brocolis', benefits: ['Antioxidante', 'Anti-inflamatório'], nutrition: { calories: '34 kcal', protein: '2.8g', fiber: '2.6g', vitaminC: '89mg' } },
    5: { name: 'Abacaxi', image: 'imagens/abacaxi.png', benefit: 'Digestão', description: 'Rico em bromelina, enzima que auxilia na digestão e tem propriedades anti-inflamatórias.', link: '/abacaxi', benefits: ['Digestivo', 'Anti-inflamatório'], nutrition: { calories: '50 kcal', protein: '0.5g', fiber: '1.4g', vitaminC: '47mg' } },
    10: { name: 'Alface', image: 'imagens/alface.png', benefit: 'Hidratação', description: 'Composta por 95% de água, excelente para hidratação e rica em folato.', link: '/alface', benefits: ['Hidratante', 'Vitaminas'], nutrition: { calories: '15 kcal', protein: '1.4g', fiber: '1.3g', folate: '38mcg' } },
    15: { name: 'Ameixa', image: 'imagens/ameixa.png', benefit: 'Fibras', description: 'Rica em fibras solúveis e insolúveis, auxilia no funcionamento intestinal.', link: '/ameixa', benefits: ['Fibras', 'Antioxidante'], nutrition: { calories: '46 kcal', protein: '0.7g', fiber: '1.4g', potassium: '157mg' } }
};

let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

function generateCalendar(month, year) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    
    document.getElementById('monthYear').textContent = `${months[month]} ${year}`;
    
    const calendarDays = document.getElementById('calendarDays');
    calendarDays.innerHTML = '';
    
    let date = 1;
    for (let i = 0; i < 6; i++) {
        const row = document.createElement('tr');
        
        for (let j = 0; j < 7; j++) {
            const cell = document.createElement('td');
            
            if (i === 0 && j < firstDay) {
                cell.textContent = '';
            } else if (date > daysInMonth) {
                break;
            } else {
                cell.textContent = date;
                cell.onclick = () => selectDay(date);
                
                if (date === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                    cell.classList.add('today');
                }
                
                if (foodData[date]) {
                    cell.classList.add('has-event');
                    cell.title = `${foodData[date].name} - ${foodData[date].benefit}`;
                }
                
                date++;
            }
            row.appendChild(cell);
        }
        calendarDays.appendChild(row);
    }
}

function selectDay(day) {
    const food = foodData[day];
    if (food) {
        updateDailyTip(food);
        showModal(food);
    } else {
        updateDailyTip({
            name: 'Dia Livre',
            description: 'Aproveite para experimentar novos alimentos saudáveis!',
            image: 'imagens/organico.png',
            benefits: ['Variedade', 'Descoberta'],
            link: '/'
        });
    }
}

function updateDailyTip(food) {
    document.getElementById('tipTitle').textContent = food.name;
    document.getElementById('tipDescription').textContent = food.description;
    document.getElementById('tipImage').src = food.image;
    document.getElementById('tipImage').alt = food.name;
    
    const benefitsContainer = document.getElementById('tipBenefits');
    benefitsContainer.innerHTML = '';
    food.benefits?.forEach(benefit => {
        const tag = document.createElement('mark');
        tag.className = 'benefit-tag';
        tag.textContent = benefit;
        benefitsContainer.appendChild(tag);
    });
    
    const buyButton = document.getElementById('buyButton');
    buyButton.href = food.link;
    buyButton.textContent = `Comprar ${food.name}`;
}

function showModal(food) {
    document.getElementById('modalTitle').textContent = food.name;
    document.getElementById('modalDescription').textContent = food.description;
    document.getElementById('modalImage').src = food.image;
    document.getElementById('modalImage').alt = food.name;
    
    const modalBenefits = document.getElementById('modalBenefits');
    modalBenefits.innerHTML = '';
    food.benefits?.forEach(benefit => {
        const tag = document.createElement('mark');
        tag.className = 'benefit-tag';
        tag.textContent = benefit;
        modalBenefits.appendChild(tag);
    });
    
    if (food.nutrition) {
        const nutritionFacts = document.getElementById('nutritionFacts');
        nutritionFacts.innerHTML = '';
        Object.entries(food.nutrition).forEach(([key, value]) => {
            const dt = document.createElement('dt');
            const dd = document.createElement('dd');
            dt.textContent = key.charAt(0).toUpperCase() + key.slice(1);
            dd.textContent = value;
            nutritionFacts.appendChild(dt);
            nutritionFacts.appendChild(dd);
        });
    }
    
    document.getElementById('modalBuyButton').href = food.link;
    document.getElementById('foodModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('foodModal').style.display = 'none';
}

function previousMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    generateCalendar(currentMonth, currentYear);
}

function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    generateCalendar(currentMonth, currentYear);
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

function addNutritionItemListeners() {
    document.querySelectorAll('.nutrition-item').forEach(item => {
        item.addEventListener('click', () => {
            const day = parseInt(item.getAttribute('data-day'));
            selectDay(day);
        });
    });
}

function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-value') || stat.textContent);
        let current = 0;
        const increment = target / 50;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            stat.textContent = Math.floor(current) + (stat.textContent.includes('%') ? '%' : '');
        }, 30);
    });
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Carregar tema salvo
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    document.querySelector('.theme-toggle').textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    
    // Gerar calendário
    generateCalendar(currentMonth, currentYear);
    
    // Configurar dica do dia inicial
    const today = new Date().getDate();
    const todayFood = foodData[today] || foodData[1];
    updateDailyTip(todayFood);
    
    // Adicionar listeners
    addNutritionItemListeners();
    
    // Animar estatísticas
    setTimeout(animateStats, 500);
    
    // Fechar modal ao clicar fora
    window.onclick = (event) => {
        const modal = document.getElementById('foodModal');
        if (event.target === modal) {
            closeModal();
        }
    };
    
    // Atalhos de teclado
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
        if (e.key === 'ArrowLeft') previousMonth();
        if (e.key === 'ArrowRight') nextMonth();
    });
});