# Kampüs Etkinlik Panosu (BMH231 - Ödev 2)

Bu proje, Yozgat Bozok Üniversitesi Bilgisayar Mühendisliği Web Programlama dersi için geliştirilmiş kampüs etkinlikleri yönetim ve listeleme web uygulamasıdır.

## Kurulum ve Çalıştırma
1. Depoyu klonlayın: `git clone https://github.com/KULLANICI/bmh231-odev2`
2. Dizin içine girin: `cd bmh231-odev2`
3. Sunucuyu başlatın: `npm start`
4. Tarayıcıda açın: `http://localhost:3000`

## API Uç Noktaları
| Yöntem | Yol | Açıklama |
|---|---|---|
| GET | `/` | Ana sayfa |
| GET | `/api/etkinlikler` | Tüm etkinlikleri JSON olarak getirir |
| GET | `/api/etkinlikler?tur=atolye` | Belirli türdeki etkinlikleri filtreler |
| GET | `/api/etkinlikler/:id` | ID'ye göre tek etkinlik getirir |