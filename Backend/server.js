const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const Redis = require("ioredis");
const { type } = require("os");


const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT;

const redisClient = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT
});

const app = express();
const PORT = 3000;

// Redis bağlantı olayları
redisClient.on("connect", () => console.log("✅ Redis'e bağlandı!"));
redisClient.on("error", (err) => console.error("❌ Redis bağlantı hatası:", err));

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, "../Frontend")));

// Ana sayfa
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../Frontend/public/index.html"));
});

// 🎯 Market verilerini getiren API
app.get("/market/:region_id/:item_id", async (req, res) => {
    console.log(req.params);
    const { region_id, item_id } = req.params;
    if (!region_id || !item_id) {
        return res.status(400).json({ error: "Lütfen geçerli bir Bölge ID ve Ürün ID girin." });
    }

    if (typeof region_id ==! "string" || typeof item_id !== "string") {
        return res.status(400).json({ error: "Bölge ID ve Ürün ID string olmalıdır." });
    }
    
    try {
        const response = await axios.get(
            `https://esi.evetech.net/latest/markets/${region_id}/orders/`,
            { params: { type_id: item_id, order_type: "sell" } }
        );
        res.json(response.data);
    } catch (error) {
        console.error("❌ EVE API Hatası:", error.message);
        res.status(500).json({ error: "EVE API’den veri alınırken hata oluştu." });
    }
});

// 🎯 İstasyon bilgisini getiren API
app.get("/station/:stationId", async (req, res) => {
    const { stationId } = req.params;
    const redisKey = `station:${stationId}`;

    try {
        // Redis'ten veri çek
        const cachedData = await redisClient.get(redisKey);
        if (cachedData) {
            console.log(`✅ Redis'ten alındı: ${cachedData}`);
            return res.json({ station_id: stationId, name: cachedData });
        }

        // API'ye istek at
        console.log(`🌍 API'ye istek atılıyor: İstasyon ${stationId}`);
        const response = await axios.get(`https://esi.evetech.net/latest/universe/stations/${stationId}/`);

        // Redis'e kaydet (1 saat cache)
        await redisClient.setex(redisKey, 3600, response.data.name);
        console.log(`💾 Redis'e kaydedildi: ${response.data.name}`);

        res.json({ station_id: stationId, name: response.data.name });

    } catch (error) {
        console.error(`❌ API Hatası: İstasyon ID ${stationId} bulunamadı.`);
        res.json({ station_id: stationId, name: `Bilinmeyen İstasyon (${stationId})` });
    }
});

// 🎯 Server başlat
app.listen(PORT, () => console.log(`🚀 Server ${PORT} portunda çalışıyor...`));