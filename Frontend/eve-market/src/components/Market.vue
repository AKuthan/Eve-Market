<script setup lang="ts">
import { ref } from 'vue'

const regionId = ref("");
const itemId = ref("");
const stationNames = ref<Record<string, string>>({});
const marketData = ref<{ price: number | string; volume_remain: number | string; location_name: string; location_id: string}[]>([]);

async function fetchMarketData() {
    if (!regionId.value || !itemId.value) {
        alert("Lütfen geçerli bir Bölge ID ve Ürün ID girin.");
        return;
    }

    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    const url = `${baseUrl}/market/${regionId.value}/${itemId.value}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        for (const entry of data) {
            if (!stationNames.value[entry.location_id]) {
                await fetchStationName(entry.location_id);
            }
        marketData.value = data.length;
        marketData.value = data.length
        ? data.map((entry: { price: number; volume_remain: number; location_id: string }) => ({
            price: entry.price,
            volume_remain: entry.volume_remain,
            location_id: entry.location_id,
            location_name: stationNames.value[entry.location_id] || `Bilinmeyen İstasyon (${entry.location_id})`
        }))
        : [{ price: "Veri yok", volume_remain: "-", location_name: "-" }];
    }
    } catch (error) {
        console.error("Veri alınırken hata oluştu:", error);
        alert(`Veri alınırken hata oluştu: ${(error as any).message}`);
        marketData.value = [{ price: "API Hatası", volume_remain: "-", location_id: "-", location_name: "-" }];
    }
}

async function fetchStationName(stationId: string) {
    try {
        const response = await fetch(`http://localhost:3000/station/${stationId}`);
        const data = await response.json();
        stationNames.value[stationId] = data.name;
    } catch (error) {
        console.error(`İstasyon ID ${stationId} alınamadı.`);
        stationNames.value[stationId] = `Bilinmeyen İstasyon (${stationId})`;
    }
}
</script>

<template>
  <div class="container mt-5">
      <h1 class="text-center mb-4">EVE Market</h1>

      <div class="row">
          <div class="col-md-4">
              <label for="regionId" class="form-label">Bölge ID</label>
              <input type="text" v-model="regionId" class="form-control">
          </div>
          <div class="col-md-4">
              <label for="itemId" class="form-label">Ürün ID</label>
              <input type="text" v-model="itemId" class="form-control">
          </div>
          <div class="col-md-4 d-flex align-items-end">
              <button class="btn btn-primary w-100" @click="fetchMarketData">Fiyatları Getir</button>
          </div>
      </div>

      <table class="table table-dark table-hover mt-4">
          <thead>
              <tr>
                  <th>Fiyat (ISK)</th>
                  <th>Adet</th>
                  <th>İstasyon</th>
              </tr>
          </thead>
          <tbody>
              <tr v-for="order in marketData" :key="order.location_id">
                  <td>{{ order.price.toLocaleString() }} ISK</td>
                  <td>{{ order.volume_remain }}</td>
                  <td>{{ order.location_name}}</td>
              </tr>
          </tbody>
      </table>
  </div>
</template>

