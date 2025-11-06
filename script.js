// ====== KONFIGURASI DASAR ======
let level = 1;
let lives = 3;
const maxLevel = 5;
const showTime = 4000; // waktu mengingat
let sequence = [];
let playTimer = null;
const colors = ["#f44336", "#2196f3", "#ffeb3b", "#4caf50", "#9c27b0"];
const shapes = ["circle", "square", "triangle"];

// ====== ELEMEN DOM ======
const info = document.getElementById("info");
const gameArea = document.getElementById("gameArea");
const slots = document.getElementById("slots");
const livesDisplay = document.getElementById("lives");
const startBtn = document.getElementById("startBtn");

// ====== INISIALISASI GAME ======
updateLives();
startBtn.addEventListener("click", startLevel);

// ====== FUNGSI UTAMA ======
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

function generateSequence(jumlah) {
  for (let i = 0; i < jumlah; i++) {
    let bentuk = shapes[Math.floor(Math.random() * shapes.length)];
    let warna = colors[Math.floor(Math.random() * colors.length)];
    sequence.push({ shape: bentuk, color: warna });
  }
}

function tampilkanSequence() {
  for (let i = 0; i < sequence.length; i++) {
    let s = buatBentuk(sequence[i], i);
    gameArea.appendChild(s);
  }
}

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

function cekSelesai() {
  let filled = slots.querySelectorAll(".shape");
  if (filled.length === sequence.length) {
    clearTimeout(playTimer);
    cekHasil();
  }
}

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
  else animasiBubbleSort(sequence.map(s => s.color.slice()));
}

function menang() {
  level++;
  if (level > maxLevel) {
    info.textContent = "🎉 Kamu sudah menamatkan semua level!";
    resetGame("Main Lagi?");
  } else {
    info.textContent = `✅ Level ${level - 1} selesai! Lanjut level ${level}...`;
    setTimeout(startLevel, 2000);
  }
}

function kalah(pesan) {
  lives--;
  updateLives();

  if (lives <= 0) {
    info.textContent = `💀 Game Over! ${pesan}`;
    resetGame("Coba Lagi?");
  } else {
    info.textContent = `${pesan} Nyawa tersisa: ${lives}`;
    setTimeout(startLevel, 2000);
  }
}

function resetGame(teks) {
  level = 1;
  lives = 3;
  startBtn.textContent = teks;
  startBtn.style.display = "block";
  updateLives();
}

// ====== VISUALISASI BUBBLE SORT (Perbaiki otomatis dengan animasi swap) ======
function animasiBubbleSort() {
  info.textContent = "❌ Urutan salah! Komputer memperbaiki urutan...";

  // ambil elemen saat ini di slot (yang diisi pemain)
  const currentEls = Array.from(slots.children).map(s => s.children[0]);
  if (currentEls.length === 0) {
    // tidak ada isi, langsung perbaiki
    slots.innerHTML = "";
    sequence.forEach((item, i) => {
      const s = buatBentuk(item, i);
      slots.appendChild(s);
    });
    setTimeout(() => kalah("Urutan diperbaiki otomatis!"), 600);
    return;
  }

  // buat key untuk perbandingan: "shape|color"
  const targetOrder = sequence.map(s => s.shape + "|" + s.color);

  // keys dari posisi sekarang
  const keys = currentEls.map(el => (el ? el.dataset.shape + "|" + el.dataset.color : null));

  // simulasikan bubble sort pada keys untuk mencatat daftar swap yang perlu dilakukan
  const swaps = [];
  const arr = keys.slice();
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      // bandingkan posisi target (index di targetOrder)
      const ia = targetOrder.indexOf(arr[j]);
      const ib = targetOrder.indexOf(arr[j + 1]);
      if (ia > ib) {
        swaps.push([j, j + 1]); // catat bahwa kita harus swap index j dan j+1
        const tmp = arr[j]; arr[j] = arr[j + 1]; arr[j + 1] = tmp;
      }
    }
  }

  // jika tidak ada swap (aneh tapi aman), langsung tampilkan urutan benar
  if (swaps.length === 0) {
    // langsung perbaiki tampilan
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

  // animasikan swaps satu-per-satu
  let step = 0;
  function nextSwap() {
    if (step >= swaps.length) {
      // selesai semua swap: tampilkan urutan akhir (seharusnya sudah benar)
      // (opsional: pastikan urutan final sama dengan sequence)
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
    // ambil slot DOM terkini (indikasi posisi index)
    const slotEls = Array.from(slots.children);
    const slotA = slotEls[a];
    const slotB = slotEls[b];
    const elA = slotA ? slotA.children[0] : null;
    const elB = slotB ? slotB.children[0] : null;

    if (!elA || !elB) {
      step++;
      return setTimeout(nextSwap, 100);
    }

    // efek visual sederhana: gerakkan sementara kiri/kanan lalu swap di DOM
    elA.style.transition = "transform 500ms";
    elB.style.transition = "transform 500ms";
    elA.style.transform = "translateX(18px)";
    elB.style.transform = "translateX(-18px)";

    setTimeout(() => {
      // swap node secara DOM: pindahkan elemen antar slot
      slotA.appendChild(elB);
      slotB.appendChild(elA);
      // reset transform
      elA.style.transform = "none";
      elB.style.transform = "none";
      // lanjut ke swap berikutnya setelah sebentar
      step++;
      setTimeout(nextSwap, 120);
    }, 700);
  }

  // mulai animasi
  nextSwap();
}


// ====== HELPER ======
function acakArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}

function updateLives() {
  livesDisplay.textContent = "Nyawa: " + "❤️".repeat(lives);
}
