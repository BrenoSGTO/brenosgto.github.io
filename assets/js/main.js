/**
 * Wedding Website Scripts
 * Maria Helena & Breno — Casamento 2027
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollReveal();
  initCountdown();
  initGiftFilters();
  initGiftsModal();
  initRSVPForm();
  initGuestbook();
});

/* ==========================================================================
   CONFIGURAÇÕES DO PIX & WHATSAPP DO CASAL
   ========================================================================== */
const PIX_KEY_RAW = "13997766522";
const PIX_KEY_BR = "+5513997766522"; // Formato E.164 exigido pelo padrão EMV do Banco Central para chave celular
const PIX_KEY_FORMATTED = "(13) 99776-6522";
const PIX_MERCHANT_NAME = "BRENO";
const PIX_MERCHANT_CITY = "FLORIANOPOLIS";
const WHATSAPP_PHONE = "5513997766522";

/* ==========================================================================
   1. NAVBAR & MENU MOBILE
   ========================================================================== */
function initNavbar() {
  const header = document.querySelector('.site-header');
  const toggleBtn = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const links = document.querySelectorAll('.nav-link, .nav-cta-btn');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });

    links.forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
      });
    });
  }
}

/* ==========================================================================
   2. ANIMAÇÃO DE SCROLL REVEAL SUAVE
   ========================================================================== */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal-up');
  if (!('IntersectionObserver' in window)) {
    revealElements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealElements.forEach(el => observer.observe(el));
}

/* ==========================================================================
   3. CONTAGEM REGRESSIVA (COUNTDOWN)
   ========================================================================== */
function initCountdown() {
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
   4. FILTROS DA LISTA DE PRESENTES
   ========================================================================== */
function initGiftFilters() {
  const filterBtns = document.querySelectorAll('.gift-filter-btn');
  const giftCards = document.querySelectorAll('.gift-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const selectedCategory = btn.getAttribute('data-filter');

      giftCards.forEach(card => {
        const cardCat = card.getAttribute('data-category');
        if (selectedCategory === 'all' || cardCat === selectedCategory) {
          card.classList.remove('hidden-card');
        } else {
          card.classList.add('hidden-card');
        }
      });
    });
  });
}

/* ==========================================================================
   5. GERADOR DE PIX COPIA E COLA (EMV BR CODE BACEN) & MODAL DE PRESENTES
   ========================================================================== */
function formatEMVField(id, value) {
  const len = String(value.length).padStart(2, '0');
  return `${id}${len}${value}`;
}

function calculateCRC16(payload) {
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function generatePixCopyPaste(amountNumber) {
  const gui = formatEMVField('00', 'br.gov.bcb.pix');
  const key = formatEMVField('01', PIX_KEY_BR);
  const merchantAccountInfo = formatEMVField('26', gui + key);

  let payload =
    formatEMVField('00', '01') + // Payload Format Indicator
    merchantAccountInfo +
    formatEMVField('52', '0000') + // Merchant Category Code
    formatEMVField('53', '986');   // Moeda (986 = Real Brasileiro)

  if (amountNumber && !isNaN(amountNumber) && amountNumber > 0) {
    payload += formatEMVField('54', Number(amountNumber).toFixed(2));
  }

  payload +=
    formatEMVField('58', 'BR') +
    formatEMVField('59', PIX_MERCHANT_NAME) +
    formatEMVField('60', PIX_MERCHANT_CITY) +
    formatEMVField('62', formatEMVField('05', 'CASAMENTOMB')) +
    '6304';

  const crc = calculateCRC16(payload);
  return payload + crc;
}

function initGiftsModal() {
  const modal = document.getElementById('pix-modal');
  const modalClose = document.getElementById('pix-modal-close');
  const giftButtons = document.querySelectorAll('.btn-gift-action');
  const directPixBtn = document.getElementById('copy-direct-pix-btn');

  const modalGiftIcon = document.getElementById('modal-gift-icon');
  const modalGiftTitle = document.getElementById('modal-gift-name');
  const modalGiftValue = document.getElementById('modal-gift-val');
  const pixKeyDisplay = document.getElementById('pix-key-display');
  const copyPayloadBtn = document.getElementById('copy-pix-payload-btn');
  const copyPhoneBtn = document.getElementById('copy-pix-phone-btn');
  const pixQrImage = document.getElementById('pix-qr-img');
  const notifyWhatsBtn = document.getElementById('notify-pix-whats');

  let currentPixPayload = PIX_KEY_RAW;

  // Botão da barra rápida de copiar a chave telefone
  if (directPixBtn) {
    directPixBtn.addEventListener('click', () => {
      copyToClipboard(PIX_KEY_RAW, '🌺 Chave PIX (13997766522) copiada com sucesso!');
    });
  }

  if (!modal) return;

  giftButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.gift-card');
      const icon = card ? card.querySelector('.gift-icon').innerText : '🎁';
      const title = card ? card.querySelector('.gift-title').innerText : 'Presente de Casamento';
      const rawPriceAttr = card ? card.getAttribute('data-price') : null;

      let numericAmount = null;
      let displayPrice = 'Valor Livre';

      if (rawPriceAttr === 'custom') {
        const customInput = document.getElementById('custom-gift-input');
        const val = customInput ? parseFloat(customInput.value) : NaN;
        if (!isNaN(val) && val > 0) {
          numericAmount = val;
          displayPrice = `R$ ${val.toFixed(2).replace('.', ',')}`;
        } else {
          displayPrice = 'Qualquer Valor (Livre)';
        }
      } else if (rawPriceAttr) {
        numericAmount = parseFloat(rawPriceAttr);
        displayPrice = card.querySelector('.gift-price')?.innerText || `R$ ${numericAmount.toFixed(2)}`;
      }

      // Gera o código PIX Copia e Cola Oficial (EMV) com o valor do presente
      currentPixPayload = generatePixCopyPaste(numericAmount);

      if (modalGiftIcon) modalGiftIcon.innerText = icon;
      if (modalGiftTitle) modalGiftTitle.innerText = title;
      if (modalGiftValue) modalGiftValue.innerText = displayPrice;
      if (pixKeyDisplay) pixKeyDisplay.innerText = currentPixPayload;

      // Gera QR Code escaneável pelo app do banco
      if (pixQrImage) {
        pixQrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentPixPayload)}`;
      }

      // Link do WhatsApp para avisar a Maria Helena e o Breno
      if (notifyWhatsBtn) {
        const text = encodeURIComponent(`Olá Maria Helena e Breno! 🌺 Acabei de enviar o presente "${title}" (${displayPrice}) pelo PIX do site do casamento! Muitas felicidades para vocês! ❤️`);
        notifyWhatsBtn.href = `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${text}`;
      }

      openModal(modal);
    });
  });

  if (modalClose) {
    modalClose.addEventListener('click', () => closeModal(modal));
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal(modal);
  });

  if (copyPayloadBtn) {
    copyPayloadBtn.addEventListener('click', () => {
      copyToClipboard(currentPixPayload, '✨ Código PIX Copia e Cola copiado! Cole no app do seu banco.');
    });
  }

  if (copyPhoneBtn) {
    copyPhoneBtn.addEventListener('click', () => {
      copyToClipboard(PIX_KEY_RAW, '📱 Chave Telefone 13997766522 copiada!');
    });
  }
}

function copyToClipboard(text, successMsg) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(successMsg);
  }).catch(() => {
    showToast(`Copie a chave: ${PIX_KEY_FORMATTED}`);
  });
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
   6. FORMULÁRIO DE RSVP (CONFIRMAÇÃO DE PRESENÇA)
   ========================================================================== */
function initRSVPForm() {
  const form = document.getElementById('rsvp-form');
  const guestsSelect = document.getElementById('rsvp-guests');
  const companionsWrap = document.getElementById('companions-field-wrap');
  const successModal = document.getElementById('rsvp-success-modal');
  const successClose = document.getElementById('rsvp-success-close');

  if (!form) return;

  // Exibir campo de nome dos acompanhantes se selecionar 2 ou mais pessoas
  if (guestsSelect && companionsWrap) {
    guestsSelect.addEventListener('change', () => {
      if (parseInt(guestsSelect.value, 10) > 1) {
        companionsWrap.style.display = 'flex';
      } else {
        companionsWrap.style.display = 'none';
      }
    });
  }

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
    const companions = form.elements['companions'] ? form.elements['companions'].value.trim() : '';
    const diet = form.elements['diet'] ? form.elements['diet'].value.trim() : '';
    const attending = form.querySelector('input[name="attending"]:checked')?.value || 'sim';

    if (!name) {
      showToast('Por favor, informe seu nome completo.');
      return;
    }

    const storedRSVPs = JSON.parse(localStorage.getItem('wedding_rsvps') || '[]');
    storedRSVPs.push({
      name,
      phone,
      guests,
      companions,
      diet,
      attending,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('wedding_rsvps', JSON.stringify(storedRSVPs));

    const whatsBtn = document.getElementById('rsvp-whatsapp-confirm');
    if (whatsBtn) {
      const statusText = attending === 'sim'
        ? '🎉 SIM, estarei lá comemorando com vocês!'
        : '😢 Infelizmente não poderei comparecer, mas desejo toda felicidade do mundo!';

      let msg = `Olá Maria Helena e Breno! 🌺 Confirmei minha presença pelo site do casamento:\n\n*Nome:* ${name}\n*Status:* ${statusText}\n*Total de pessoas:* ${guests}`;
      if (companions && parseInt(guests, 10) > 1) {
        msg += `\n*Acompanhante(s):* ${companions}`;
      }
      if (diet) {
        msg += `\n*Observações/Música:* ${diet}`;
      }

      whatsBtn.href = `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(msg)}`;
    }

    if (successModal) {
      openModal(successModal);
    } else {
      showToast('🌺 Confirmação registrada com sucesso!');
    }

    form.reset();
    if (companionsWrap) companionsWrap.style.display = 'none';
  });

  if (successClose && successModal) {
    successClose.addEventListener('click', () => closeModal(successModal));
  }
}

/* ==========================================================================
   7. MURAL DE RECADOS
   ========================================================================== */
function initGuestbook() {
  const form = document.getElementById('guestbook-form');
  const container = document.getElementById('guestbook-messages');

  if (!form || !container) return;

  const savedMessages = JSON.parse(localStorage.getItem('wedding_guestbook_mb') || '[]');

  if (savedMessages.length === 0) {
    const initialExamples = [
      {
        author: "Padrinhos & Amigos",
        date: "Recente",
        message: "Maria Helena e Breno, estamos contando os dias para celebrar esse pôr do sol inesquecível com vocês! Que Deus abençoe sempre essa união linda!"
      },
      {
        author: "Tia Lúcia & Família",
        date: "Há 2 dias",
        message: "Desde 2022 já sabíamos que vocês tinham nascido um para o outro. Que o cordão de três dobras seja sempre a base do lar de vocês!"
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

    renderMessage(newMessage, container, true);

    savedMessages.unshift(newMessage);
    localStorage.setItem('wedding_guestbook_mb', JSON.stringify(savedMessages));

    form.reset();
    showToast('🌺 Recado publicado no mural com carinho!');
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
  }, 3400);
}