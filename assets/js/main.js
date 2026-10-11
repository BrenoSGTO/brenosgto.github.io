/**
 * Wedding Website Scripts
 * Breno & Mariana - Casamento
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initCountdown();
  initGiftsModal();
  initRSVPForm();
  initGuestbook();
});

/* ==========================================================================
   1. NAVBAR & MENU MOBILE
   ========================================================================== */
function initNavbar() {
  const header = document.querySelector('.site-header');
  const toggleBtn = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const links = document.querySelectorAll('.nav-link, .nav-cta-btn');

  // Sticky header on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });

    // Fechar ao clicar em qualquer link
    links.forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
      });
    });
  }
}

/* ==========================================================================
   2. CONTAGEM REGRESSIVA (COUNTDOWN)
   ========================================================================== */
function initCountdown() {
  // Data configurada para o casamento: 20 de Novembro de 2027 às 16:30
  const weddingDate = new Date('2027-11-20T16:30:00').getTime();

  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minutesEl = document.getElementById('cd-minutes');
  const secondsEl = document.getElementById('cd-seconds');

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  function updateTimer() {
    const now = new Date().getTime();
    const distance = weddingDate - now;

    if (distance < 0) {
      daysEl.innerText = '00';
      hoursEl.innerText = '00';
      minutesEl.innerText = '00';
      secondsEl.innerText = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.innerText = String(days).padStart(2, '0');
    hoursEl.innerText = String(hours).padStart(2, '0');
    minutesEl.innerText = String(minutes).padStart(2, '0');
    secondsEl.innerText = String(seconds).padStart(2, '0');
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

/* ==========================================================================
   3. MODAL DE PRESENTES & PIX
   ========================================================================== */
// Configurações do PIX e WhatsApp do Casal
const PIX_KEY_RAW = "13997766522";
const PIX_KEY_FORMATTED = "(13) 99776-6522";
const WHATSAPP_PHONE = "5513997766522";

function initGiftsModal() {
  const modal = document.getElementById('pix-modal');
  const modalClose = document.getElementById('pix-modal-close');
  const giftButtons = document.querySelectorAll('.btn-gift-action');
  
  const modalGiftTitle = document.getElementById('modal-gift-name');
  const modalGiftValue = document.getElementById('modal-gift-val');
  const pixKeyDisplay = document.getElementById('pix-key-display');
  const copyPixBtn = document.getElementById('copy-pix-btn');
  const pixQrImage = document.getElementById('pix-qr-img');
  const notifyWhatsBtn = document.getElementById('notify-pix-whats');

  if (!modal) return;

  // Abrir modal ao clicar em qualquer presente
  giftButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.gift-card');
      const title = card ? card.querySelector('.gift-title').innerText : 'Cota de Casamento';
      const price = card ? card.querySelector('.gift-price').innerText : 'Valor livre';

      if (modalGiftTitle) modalGiftTitle.innerText = title;
      if (modalGiftValue) modalGiftValue.innerText = price;
      if (pixKeyDisplay) pixKeyDisplay.innerText = `${PIX_KEY_FORMATTED} (Celular)`;

      // Gerar QR Code instantâneo com a chave PIX
      if (pixQrImage) {
        pixQrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(PIX_KEY_RAW)}`;
      }

      // Configurar link do WhatsApp para avisar os noivos
      if (notifyWhatsBtn) {
        const text = encodeURIComponent(`Olá Breno e Maria Helena! Acabei de contribuir com o presente "${title}" (${price}) no site do casamento de vocês! ❤️ Parabéns!`);
        notifyWhatsBtn.href = `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${text}`;
      }

      openModal(modal);
    });
  });

  // Fechar modal
  if (modalClose) {
    modalClose.addEventListener('click', () => closeModal(modal));
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal(modal);
  });

  // Copiar chave PIX (copia os números limpos para facilitar no app do banco)
  if (copyPixBtn) {
    copyPixBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(PIX_KEY_RAW).then(() => {
        showToast(" Chave PIX copiada com sucesso!");
        const originalText = copyPixBtn.innerHTML;
        copyPixBtn.innerHTML = `<span>✓ Copiado!</span>`;
        setTimeout(() => {
          copyPixBtn.innerHTML = originalText;
        }, 2500);
      }).catch(() => {
        showToast("Selecione e copie o número: " + PIX_KEY_FORMATTED);
      });
    });
  }
}

function openModal(modal) {
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

/* ==========================================================================
   4. FORMULÁRIO DE RSVP (CONFIRMAÇÃO DE PRESENÇA)
   ========================================================================== */
function initRSVPForm() {
  const form = document.getElementById('rsvp-form');
  const successModal = document.getElementById('rsvp-success-modal');
  const successClose = document.getElementById('rsvp-success-close');

  if (!form) return;

  // Seleção visual dos botões de rádio Sim / Não
  const radioCards = document.querySelectorAll('.radio-attendance-card');
  radioCards.forEach(card => {
    card.addEventListener('click', () => {
      radioCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.elements['name'] ? form.elements['name'].value.trim() : '';
    const phone = form.elements['phone'] ? form.elements['phone'].value.trim() : '';
    const guests = form.elements['guests'] ? form.elements['guests'].value : '1';
    const diet = form.elements['diet'] ? form.elements['diet'].value.trim() : '';
    const attending = form.querySelector('input[name="attending"]:checked')?.value || 'sim';

    if (!name) {
      showToast('Por favor, informe seu nome completo.');
      return;
    }

    // Salvar confirmação no armazenamento local (localStorage)
    const storedRSVPs = JSON.parse(localStorage.getItem('wedding_rsvps') || '[]');
    storedRSVPs.push({
      name,
      phone,
      guests,
      diet,
      attending,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('wedding_rsvps', JSON.stringify(storedRSVPs));

    // Configurar mensagem do WhatsApp para o convidado enviar com um clique
    const whatsBtn = document.getElementById('rsvp-whatsapp-confirm');
    if (whatsBtn) {
      const statusText = attending === 'sim' ? 'SIM, com certeza estarei lá comemorando com vocês!' : 'Infelizmente não poderei comparecer, mas desejo toda felicidade do mundo!';
      const msg = encodeURIComponent(`Olá Breno e Maria Helena! Confirmei minha presença pelo site:\n\n*Nome:* ${name}\n*Confirmação:* ${statusText}\n*Total de pessoas:* ${guests}${diet ? `\n*Observações:* ${diet}` : ''}`);
      whatsBtn.href = `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${msg}`;
    }

    // Abrir modal de sucesso
    if (successModal) {
      openModal(successModal);
    } else {
      showToast('Confirmação enviada com sucesso! Obrigado.');
    }

    form.reset();
  });

  if (successClose && successModal) {
    successClose.addEventListener('click', () => closeModal(successModal));
  }
}

/* ==========================================================================
   5. MURAL DE RECADOS
   ========================================================================== */
function initGuestbook() {
  const form = document.getElementById('guestbook-form');
  const container = document.getElementById('guestbook-messages');

  if (!form || !container) return;

  // Carregar recados salvos
  const savedMessages = JSON.parse(localStorage.getItem('wedding_guestbook') || '[]');
  
  // Se não houver recados ainda, exibe recados iniciais carinhosos de exemplo
  if (savedMessages.length === 0) {
    const initialExamples = [
      {
        author: "Camila & Rafael (Padrinhos)",
        date: "Ontem",
        message: "Estamos contando os dias para esse momento mágico! Vocês merecem toda a felicidade do mundo. Amamos muito vocês!"
      },
      {
        author: "Tia Lúcia",
        date: "Há 3 dias",
        message: "Que Deus abençoe essa linda união hoje e para todo o sempre! Mal posso esperar para ver a noiva mais linda."
      }
    ];
    initialExamples.forEach(msg => renderMessage(msg, container));
  } else {
    savedMessages.forEach(msg => renderMessage(msg, container));
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const authorInput = document.getElementById('guest-name');
    const messageInput = document.getElementById('guest-message');

    if (!authorInput || !messageInput) return;

    const author = authorInput.value.trim();
    const message = messageInput.value.trim();

    if (!author || !message) {
      showToast('Por favor, preencha seu nome e recado.');
      return;
    }

    const newMessage = {
      author,
      message,
      date: 'Agora mesmo'
    };

    // Renderiza na hora no topo
    renderMessage(newMessage, container, true);

    // Salva no localStorage
    savedMessages.unshift(newMessage);
    localStorage.setItem('wedding_guestbook', JSON.stringify(savedMessages));

    form.reset();
    showToast(' Recado publicado com carinho!');
  });
}

function renderMessage(item, container, prepend = false) {
  const card = document.createElement('div');
  card.className = 'message-card';
  card.innerHTML = `
    <div class="message-card-header">
      <span class="message-author">${escapeHTML(item.author)}</span>
      <span class="message-date">${escapeHTML(item.date)}</span>
    </div>
    <p class="message-body">"${escapeHTML(item.message)}"</p>
  `;

  if (prepend && container.firstChild) {
    container.insertBefore(card, container.firstChild);
  } else {
    container.appendChild(card);
  }
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.innerText = str;
  return div.innerHTML;
}

/* ==========================================================================
   TOAST HELPER
   ========================================================================== */
function showToast(message) {
  let toast = document.querySelector('.toast-notice');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<span>${message}</span>`;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}
