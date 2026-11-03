let tumEtkinlikler = [];
let aktifTur = "tumu";
let aramaMetni = "";

const kartlarKutusu = document.getElementById("kartlarKutusu") || document.getElementById("kartlar-konteyner");
const aramaInput = document.getElementById("aramaInput") || document.getElementById("arama-input");
const filtreDugmeleri = document.querySelectorAll(".filtre-dugmeleri button, .filtre-btn");
const etkinlikFormu = document.getElementById("etkinlikFormu");
const formMesaj = document.getElementById("formMesaj");

// Tema Değiştirici ve Sayfa Yüklenme Mantığı
window.addEventListener("DOMContentLoaded", () => {
    const temaToggleBtn = document.getElementById("temaToggleBtn");
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);

    if (temaToggleBtn) {
        temaToggleBtn.textContent = savedTheme === "dark" ? "☀️ Açık" : "🌙 Koyu";
        
        temaToggleBtn.addEventListener("click", () => {
            const currentTheme = document.documentElement.getAttribute("data-theme");
            const newTheme = currentTheme === "dark" ? "light" : "dark";
            
            document.documentElement.setAttribute("data-theme", newTheme);
            localStorage.setItem("theme", newTheme);
            temaToggleBtn.textContent = newTheme === "dark" ? "☀️ Açık" : "🌙 Koyu";
        });
    }

    etkinlikleriGetir();
});

// API'den Verileri Çekme
async function etkinlikleriGetir() {
    if (!kartlarKutusu) return;
    kartlarKutusu.innerHTML = '<div class="yukleniyor">Yükleniyor...</div>';
    try {
        const yanıt = await fetch("/api/etkinlikler");
        if (!yanıt.ok) {
            throw new Error("Sunucudan veriler alınamadı (HTTP " + yanıt.status + ")");
        }
        tumEtkinlikler = await yanıt.json();
        etkinlikleriCiz();
    } catch (hata) {
        console.error("Hata:", hata);
        kartlarKutusu.innerHTML = `<div class="mesaj-kutu hata-metni">Hata: Etkinlikler yüklenirken bir sorun oluştu. Lütfen sunucunun çalıştığından emin olun.</div>`;
    }
}

// Kartları Çizme ve Etkileşimler (Sayaç, Favori vb.)
function etkinlikleriCiz() {
    if (!kartlarKutusu) return;
    kartlarKutusu.innerHTML = "";

    const filtrelenmis = tumEtkinlikler.filter(etkinlik => {
        const turUyumu = (aktifTur === "tumu") || (etkinlik.tur === aktifTur);
        const aramaUyumu = etkinlik.baslik.toLowerCase().includes(aramaMetni.toLowerCase());
        return turUyumu && aramaUyumu;
    });

    if (filtrelenmis.length === 0) {
        kartlarKutusu.innerHTML = `<div class="mesaj-kutu">Aramanıza uygun etkinlik yok.</div>`;
        return;
    }

    filtrelenmis.forEach(etkinlik => {
        const kart = document.createElement("article");
        kart.className = "etkinlik-karti";

        const h3 = document.createElement("h3");
        h3.textContent = etkinlik.baslik;

        const tarihP = document.createElement("p");
        const formatliTarih = new Date(etkinlik.tarih).toLocaleDateString("tr-TR", {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        tarihP.textContent = `Tarih: ${formatliTarih}`;

        const yerP = document.createElement("p");
        yerP.textContent = `Yer: ${etkinlik.yer}`;

        const kontenjanP = document.createElement("p");
        kontenjanP.textContent = `Kontenjan: ${etkinlik.kontenjan} kişi`;

        // Kalan Süre Sayacı
        const bugunTarih = new Date();
        bugunTarih.setHours(0,0,0,0);
        const etkinlikTarihi = new Date(etkinlik.tarih);
        const farkGun = Math.ceil((etkinlikTarihi - bugunTarih) / (1000 * 60 * 60 * 24));
        
        const kalanSureP = document.createElement("p");
        kalanSureP.style.fontWeight = "bold";
        kalanSureP.style.color = farkGun < 0 ? "var(--hata-renk)" : "var(--ikincil-renk)";
        kalanSureP.textContent = farkGun < 0 ? "Etkinlik sona erdi." : `Kalan Süre: ${farkGun} gün`;

        const turSpan = document.createElement("span");
        turSpan.className = "tur-etiketi";
        turSpan.textContent = etkinlik.tur;

        // Favori Butonu
        const favBtn = document.createElement("button");
        let favoriler = JSON.parse(localStorage.getItem("favoriler")) || [];
        const isFav = favoriler.includes(etkinlik.id);
        favBtn.textContent = isFav ? "❤️ Favorilerde" : "🤍 Favori Ekle";
        favBtn.style.cssText = "background:none; border:none; cursor:pointer; font-size:0.9rem; margin-top:0.5rem; display:block;";

        favBtn.addEventListener("click", () => {
            let favs = JSON.parse(localStorage.getItem("favoriler")) || [];
            if (favs.includes(etkinlik.id)) {
                favs = favs.filter(id => id !== etkinlik.id);
                favBtn.textContent = "🤍 Favori Ekle";
            } else {
                favs.push(etkinlik.id);
                favBtn.textContent = "❤️ Favorilerde";
            }
            localStorage.setItem("favoriler", JSON.stringify(favs));
        });

        // Elemanları karta ekleme
        kart.appendChild(h3);
        kart.appendChild(tarihP);
        kart.appendChild(yerP);
        kart.appendChild(kontenjanP);
        kart.appendChild(kalanSureP);
        kart.appendChild(turSpan);
        kart.appendChild(favBtn);

        kartlarKutusu.appendChild(kart);
    });
}

// Filtre ve Arama Dinleyicileri
if (filtreDugmeleri) {
    filtreDugmeleri.forEach(dugme => {
        dugme.addEventListener("click", (e) => {
            filtreDugmeleri.forEach(d => d.classList.remove("aktif-filtre", "secili"));
            e.target.classList.add("aktif-filtre");
            aktifTur = e.target.getAttribute("data-tur") || "tumu";
            etkinlikleriCiz();
        });
    });
}

if (aramaInput) {
    aramaInput.addEventListener("input", (e) => {
        aramaMetni = e.target.value.trim();
        etkinlikleriCiz();
    });
}

// Form Doğrulama
if (etkinlikFormu) {
    etkinlikFormu.addEventListener("submit", (e) => {
        e.preventDefault();
        formMesaj.textContent = "";
        formMesaj.className = "form-mesaj";

        const baslik = document.getElementById("baslikInput")?.value.trim() || "";
        const tarih = document.getElementById("tarihInput")?.value || "";
        const email = document.getElementById("emailInput")?.value.trim() || "";

        if (baslik.length < 5) {
            formMesaj.textContent = "Etkinlik adı en az 5 karakter olmalıdır.";
            formMesaj.classList.add("hata-metni");
            return;
        }

        if (!tarih) {
            formMesaj.textContent = "Lütfen bir etkinlik tarihi seçiniz.";
            formMesaj.classList.add("hata-metni");
            return;
        }

        const secilenTarih = new Date(tarih);
        const bugun = new Date();
        bugun.setHours(0, 0, 0, 0);

        if (secilenTarih < bugun) {
            formMesaj.textContent = "Etkinlik tarihi geçmiş bir gün olamaz.";
            formMesaj.classList.add("hata-metni");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            formMesaj.textContent = "Lütfen geçerli bir e-posta adresi giriniz.";
            formMesaj.classList.add("hata-metni");
            return;
        }

        formMesaj.textContent = "Teşekkürler! Etkinlik öneriniz başarıyla alınmıştır.";
        formMesaj.classList.add("basari-metni");
        etkinlikFormu.reset();
    });
}