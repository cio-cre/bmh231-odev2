let etkinliklerDizisi = [];
let aktifTur = "tumu";
let aramaMetni = "";

const konteyner = document.getElementById("kartlar-konteyner");
const aramaInput = document.getElementById("arama-input");
const filtreBtnler = document.querySelectorAll(".filtre-btn");

// D2 aşamasında fetch ile güncellenecek kısım
async function verileriGetir() {
  try {
    konteyner.innerHTML = "<p>Yükleniyor...</p>";
    const yanit = await fetch("/api/etkinlikler");
    if (!yanit.ok) throw new Error("Sunucu yanıt vermedi.");
    etkinliklerDizisi = await yanit.json();
    ekranıCiz(etkinliklerDizisi);
  } catch (hata) {
    konteyner.innerHTML = `<p style="color: red;">Hata: ${hata.message}</p>`;
  }
}

function ekranıCiz(liste) {
  konteyner.innerHTML = "";
  
  // Filtre ve Arama Birlikte Uygulanır
  const filtrelenmis = liste.filter(e => {
    const turUyumu = aktifTur === "tumu" || e.tur === aktifTur;
    const aramaUyumu = e.baslik.toLowerCase().includes(aramaMetni.toLowerCase());
    return turUyumu && aramaUyumu;
  });

  if (filtrelenmis.length === 0) {
    konteyner.innerHTML = "<p>Aramanıza uygun etkinlik yok.</p>";
    return;
  }

  filtrelenmis.forEach(e => {
    const kart = document.createElement("article");
    kart.className = "kart";

    const baslik = document.createElement("h3");
    baslik.textContent = e.baslik;

    const tarih = document.createElement("p");
    const formatliTarih = new Date(e.tarih).toLocaleDateString("tr-TR");
    tarih.textContent = `Tarih: ${formatliTarih}`;

    const yer = document.createElement("p");
    yer.textContent = `Yer: ${e.yer}`;

    const kontenjan = document.createElement("p");
    kontenjan.textContent = `Kontenjan: ${e.kontenjan}`;

    const etiket = document.createElement("span");
    etiket.textContent = `Tür: ${e.tur}`;

    kart.append(baslik, tarih, yer, kontenjan, etiket);
    konteyner.appendChild(kart);
  });
}

// Filtre Düğmeleri Olayı
filtreBtnler.forEach(btn => {
  btn.addEventListener("click", (e) => {
    filtreBtnler.forEach(b => b.classList.remove("secili"));
    e.target.classList.add("secili");
    aktifTur = e.target.dataset.tur;
    ekranıCiz(etkinliklerDizisi);
  });
});

// Arama Kutusu Olayı
aramaInput.addEventListener("input", (e) => {
  aramaMetni = e.target.value.trim();
  ekranıCiz(etkinliklerDizisi);
});

// Form Doğrulama (C3)
const form = document.getElementById("etkinlik-form");
const formMesaj = document.getElementById("form-mesaj");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const baslikVal = form.baslik.value.trim();
  const tarihVal = form.tarih.value;
  const epostaVal = form.eposta.value.trim();

  formMesaj.className = "";
  
  if (baslikVal.length < 5) {
    formMesaj.textContent = "Etkinlik adı en az 5 karakter olmalıdır.";
    formMesaj.style.color = "red";
    return;
  }

  if (!tarihVal || new Date(tarihVal) < new Date()) {
    formMesaj.textContent = "Geçersiz veya geçmiş bir tarih seçilemez.";
    formMesaj.style.color = "red";
    return;
  }

  const epostaRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!epostaRegex.test(epostaVal)) {
    formMesaj.textContent = "Geçerli bir e-posta adresi giriniz.";
    formMesaj.style.color = "red";
    return;
  }

  formMesaj.textContent = "Öneriniz başarıyla alındı, teşekkür ederiz!";
  formMesaj.style.color = "green";
  form.reset();
});

// Sayfa açıldığında verileri çek
verileriGetir();