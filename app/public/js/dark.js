const toggle = document.getElementById('toggle-dark');

  // Aplica tema salvo
  try {
    if (localStorage.getItem('theme') === 'dark') {
      document.body.classList.add('dark');
    }
  } catch (e) {
    console.warn('Erro ao carregar tema:', e);
  }

  toggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const theme = document.body.classList.contains('dark') ? 'dark' : 'light';
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      console.warn('Erro ao salvar tema:', e);
    }
  });