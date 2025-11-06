// ====== KONFIGURASI DASAR ======
let level = 1;
let lives = 3;
const maxLevel = 5;
const showTime = 4000;
let sequence = [];
let playTimer = null;

const colors = ["#f44336", "#2196f3", "#ffeb3b", "#4caf50", "#9c27b0"];
const shapes = ["circle", "square", "triangle"];

// ====== AMBIL ELEMEN DARI HTML ======
const info = document.getElementById("info");
const gameArea = document.getElementById("gameArea");
const slots = document.getElementById("slots");
const livesDisplay = document.getElementById("lives");
const startBtn = document.getElementById("startBtn");

updateLives();

startBtn.addEventListener("click", startLevel);


// ====== FUNGSI UTAMA: MULAI LEVEL ======
function startLevel() {
  startBtn.style.display = "none";
  info.textContent = `Level ${level}: Ingat urutan bentuk dan warnanya!`;
  gameArea.innerHTML = "";
  slots.innerHTML = "";
  sequence = [];

  generateSequence(level + 1);
  tampilkanSequence();

  setTimeout(() => {
    info.textContent = "Sekarang susun ulang bentuknya!";
    startPlayPhase();
  }, showTime);
}


// ====== BUAT URUTAN BENTUK ACAK ======
function generateSequence(jumlah) {
  for (let i = 0; i < jumlah; i++) {
    let bentuk = shapes[Math.floor(Math.random() * shapes.length)];
    let warna = colors[Math.floor(Math.random() * colors.length)];
    sequence.push({ shape: bentuk, color: warna });
  }
}


// ====== TAMPILKAN URUTAN BENTUK UNTUK DIINGAT ======
function tampilkanSequence() {
  for (let i = 0; i < sequence.length; i++) {
    let s = buatBentuk(sequence[i], i);
    gameArea.appendChild(s);
  }
}


// ====== FASE MENYUSUN (DRAG & DROP) ======
function startPlayPhase() {
  gameArea.innerHTML = "";
  slots.innerHTML = "";

  for (let i = 0; i < sequence.length; i++) {
    let kotak = document.createElement("div");
    kotak.className = "slot";
    kotak.dataset.index = i;

    kotak.addEventListener("dragover", e => e.preventDefault());
    kotak.addEventListener("drop", dragDrop);
    slots.appendChild(kotak);
  }

  let acak = acakArray(sequence.slice());

  for (let i = 0; i < acak.length; i++) {
    let s = buatBentuk(acak[i], i);
    s.draggable = true;
    s.addEventListener("dragstart", e => e.dataTransfer.setData("id", s.id));
    gameArea.appendChild(s);
  }

  playTimer = setTimeout(() => kalah("Waktu habis!"), 60000);
}


// ====== BUAT ELEMEN BENTUK (DIV) ======
function buatBentuk(data, id) {
  let el = document.createElement("div");
  el.id = "shape-" + id;
  el.className = "shape " + data.shape;
  el.dataset.shape = data.shape;
  el.dataset.color = data.color;

  if (data.shape === "triangle") {
    el.style.borderBottomColor = data.color;
  } else {
    el.style.backgroundColor = data.color;
  }

  return el;
}


// ====== SAAT BENTUK DI-DRAG KE SLOT ======
function dragDrop(e) {
  e.preventDefault();
  const id = e.dataTransfer.getData("id");
  const elemen = document.getElementById(id);

  if (e.target.classList.contains("slot") && e.target.childNodes.length === 0) {
    e.target.appendChild(elemen);
    elemen.draggable = false;
    cekSelesai();
  }
}


// ====== CEK APAKAH SEMUA SLOT SUDAH TERISI ======
function cekSelesai() {
  let filled = slots.querySelectorAll(".shape");
  if (filled.length === sequence.length) {
    clearTimeout(playTimer);
    cekHasil();
  }
}


// ====== CEK APAKAH SUSUNAN PEMAIN BENAR ======
function cekHasil() {
  let benar = true;
  let slotEl = slots.children;

  for (let i = 0; i < slotEl.length; i++) {
    let el = slotEl[i].children[0];
    if (!el) return;
    if (el.dataset.shape !== sequence[i].shape || el.dataset.color !== sequence[i].color) {
      benar = false;
      break;
    }
  }

  if (benar) menang();
  else animasiBubbleSort();
}


// ====== SAAT PEMAIN BENAR (MENANG) ======
function menang() {
  level++;
  if (level > maxLevel) {
    info.textContent = "Kamu sudah menamatkan semua level!";
    resetGame("Main Lagi?");
  } else {
    info.textContent = `Level ${level - 1} selesai! Lanjut level ${level}...`;
    setTimeout(startLevel, 2000);
  }
}


// ====== SAAT PEMAIN KALAH ======
function kalah(pesan) {
  lives--;
  updateLives();

  if (lives <= 0) {
    info.textContent = `Game Over! ${pesan}`;
    resetGame("Coba Lagi?");
  } else {
    info.textContent = `${pesan} Nyawa tersisa: ${lives}`;
    setTimeout(startLevel, 2000);
  }
}


// ====== RESET GAME KE LEVEL 1 ======
function resetGame(teks) {
  level = 1;
  lives = 3;
  startBtn.textContent = teks;
  startBtn.style.display = "block";
  updateLives();
}


// ====== VISUALISASI BUBBLE SORT (Menukar bentuk otomatis) ======
function animasiBubbleSort() {
  info.textContent = "❌ Urutan salah! Komputer memperbaiki urutan...";

  const currentEls = Array.from(slots.children).map(s => s.children[0]);

  if (currentEls.length === 0) {
    slots.innerHTML = "";
    sequence.forEach((item, i) => {
      const s = buatBentuk(item, i);
      slots.appendChild(s);
    });
    setTimeout(() => kalah("Urutan diperbaiki otomatis!"), 600);
    return;
  }

  const targetOrder = sequence.map(s => s.shape + "|" + s.color);

  const keys = currentEls.map(el => (el ? el.dataset.shape + "|" + el.dataset.color : null));

  const swaps = [];
  const arr = keys.slice();

  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      const ia = targetOrder.indexOf(arr[j]);
      const ib = targetOrder.indexOf(arr[j + 1]);
      if (ia > ib) {
        swaps.push([j, j + 1]);
        const tmp = arr[j]; arr[j] = arr[j + 1]; arr[j + 1] = tmp;
      }
    }
  }

  if (swaps.length === 0) {
    slots.innerHTML = "";
    sequence.forEach((item, i) => {
      const s = buatBentuk(item, i);
      s.style.opacity = "0";
      slots.appendChild(s);
      setTimeout(() => { s.style.transition = "opacity 200ms"; s.style.opacity = "1"; }, i * 100);
    });
    setTimeout(() => kalah("Urutan diperbaiki otomatis!"), sequence.length * 120 + 300);
    return;
  }

  let step = 0;
  function nextSwap() {
    if (step >= swaps.length) {
      slots.innerHTML = "";
      sequence.forEach((item, i) => {
        const s = buatBentuk(item, i);
        s.style.opacity = "0";
        slots.appendChild(s);
        setTimeout(() => { s.style.transition = "opacity 200ms"; s.style.opacity = "1"; }, i * 100);
      });
      setTimeout(() => { kalah("Urutan diperbaiki otomatis!"); }, sequence.length * 120 + 300);
      return;
    }

    const [a, b] = swaps[step];
    const slotEls = Array.from(slots.children);
    const slotA = slotEls[a];
    const slotB = slotEls[b];
    const elA = slotA ? slotA.children[0] : null;
    const elB = slotB ? slotB.children[0] : null;

    if (!elA || !elB) {
      step++;
      return setTimeout(nextSwap, 100);
    }

    elA.style.transition = "transform 500ms";
    elB.style.transition = "transform 500ms";
    elA.style.transform = "translateX(18px)";
    elB.style.transform = "translateX(-18px)";

    setTimeout(() => {
      slotA.appendChild(elB);
      slotB.appendChild(elA);
      elA.style.transform = "none";
      elB.style.transform = "none";
      step++;
      setTimeout(nextSwap, 120);
    }, 700);
  }

  nextSwap();
}


// ====== FUNGSI BANTUAN ======
function acakArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}

// Nyawa pemain
function updateLives() {
  livesDisplay.textContent = "Nyawa: " + "❤️".repeat(lives);
}
