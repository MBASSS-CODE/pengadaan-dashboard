import fs from 'fs';
import path from 'path';
import { fakerID_ID as faker } from '@faker-js/faker';

const tahun = new Date().getFullYear().toString();
const demoDir = path.resolve(process.cwd(), 'server/data_demo');

const dirs = [
  demoDir,
  path.join(demoDir, 'rup'),
  path.join(demoDir, 'tender'),
  path.join(demoDir, 'ekatalog'),
  path.join(demoDir, 'merged')
];

dirs.forEach(d => {
  if (!fs.existsSync(d)) {
    fs.mkdirSync(d, { recursive: true });
  }
});

// 1. Generate Satker
const satkerList = [];
for (let i = 0; i < 5; i++) {
  satkerList.push({
    kd_satker: faker.string.numeric(6),
    nama_satker: `Dinas ${faker.commerce.department()} ${faker.location.city()}`,
    status_satker: 'Aktif',
    jenis_satker: 'OPD',
    alamat: faker.location.streetAddress()
  });
}
fs.writeFileSync(path.join(demoDir, 'rup', `master-satker_${tahun}.json`), JSON.stringify(satkerList, null, 2));

// 2. Generate PPK Master
const ppkList = [];
for (let i = 0; i < 20; i++) {
  const satker = faker.helpers.arrayElement(satkerList);
  const nip = faker.string.numeric(18);
  const nama = faker.person.fullName();
  ppkList.push({
    nip_nama_masked: `${nip} - ${nama}`,
    nip_asli: nip,
    nama_lengkap: nama,
    jabatan: 'Pejabat Pembuat Komitmen',
    unit_kerja: satker.nama_satker,
    telepon: faker.phone.number(),
    email: faker.internet.email()
  });
}
fs.writeFileSync(path.join(demoDir, 'ppk_master.json'), JSON.stringify(ppkList, null, 2));

// 3. Generate Penyedia Master
const penyediaList = [];
for (let i = 0; i < 50; i++) {
  penyediaList.push({
    kode_penyedia: faker.string.uuid(),
    nama_penyedia: faker.company.name(),
    npwp: faker.string.numeric(15),
    jenis_perusahaan: 'Badan Usaha',
    bentuk_usaha: faker.helpers.arrayElement(['PT', 'CV', 'Firma']),
    alamat: faker.location.streetAddress(),
    status_umkk: faker.helpers.arrayElement(['UMKM', 'Non-UMKM'])
  });
}
fs.writeFileSync(path.join(demoDir, 'penyedia_master.json'), JSON.stringify(penyediaList, null, 2));

// 4. Generate RUP Penyedia
const rupPenyediaList = [];
const rupCodes = [];
for (let i = 0; i < 200; i++) {
  const satker = faker.helpers.arrayElement(satkerList);
  const ppk = faker.helpers.arrayElement(ppkList);
  const kd_rup = faker.string.numeric(8);
  rupCodes.push(kd_rup);
  
  rupPenyediaList.push({
    kd_rup: kd_rup,
    kd_satker: satker.kd_satker,
    nama_paket: `Pengadaan Barang ${faker.commerce.productName()}`,
    pagu: faker.number.int({ min: 10000000, max: 5000000000 }),
    status_aktif_rup: 'Aktif',
    status_delete_rup: 'Tidak',
    status_umumkan_rup: 'Sudah',
    jenis_pengadaan: faker.helpers.arrayElement(['Barang', 'Jasa Konsultansi', 'Pekerjaan Konstruksi', 'Jasa Lainnya']),
    metode_pengadaan: faker.helpers.arrayElement(['E-Purchasing', 'Tender', 'Tender Cepat', 'Pengadaan Langsung', 'Penunjukan Langsung']),
    urarian_pekerjaan: faker.commerce.productDescription(),
    nip_ppk: ppk.nip_asli,
    nama_ppk: ppk.nama_lengkap,
    status_pdn: faker.helpers.arrayElement(['Ya', 'Tidak']),
    status_ukm: faker.helpers.arrayElement(['Ya', 'Tidak'])
  });
}
fs.writeFileSync(path.join(demoDir, 'rup', `paket-penyedia_${tahun}.json`), JSON.stringify(rupPenyediaList, null, 2));

// 5. Generate RUP Swakelola
const rupSwakelolaList = [];
for (let i = 0; i < 50; i++) {
  const satker = faker.helpers.arrayElement(satkerList);
  const ppk = faker.helpers.arrayElement(ppkList);
  rupSwakelolaList.push({
    kd_rup: faker.string.numeric(8),
    kd_satker: satker.kd_satker,
    nama_paket: `Kegiatan Swakelola ${faker.company.catchPhrase()}`,
    pagu: faker.number.int({ min: 5000000, max: 500000000 }),
    tipe_swakelola: faker.helpers.arrayElement(['Tipe I', 'Tipe II', 'Tipe III', 'Tipe IV']),
    nama_ppk: ppk.nama_lengkap,
    nip_ppk: ppk.nip_asli,
    status_aktif: 'Aktif',
    status_umumkan: 'Sudah'
  });
}
fs.writeFileSync(path.join(demoDir, 'rup', `paket-swakelola_${tahun}.json`), JSON.stringify(rupSwakelolaList, null, 2));

// 6. Generate Non-Tender
const nonTenderList = [];
for (let i = 0; i < 50; i++) {
  const rup = faker.helpers.arrayElement(rupPenyediaList);
  nonTenderList.push({
    kd_rup: rup.kd_rup,
    kd_satker: rup.kd_satker,
    nama_satker: satkerList.find(s => s.kd_satker === rup.kd_satker)?.nama_satker,
    nama_paket: rup.nama_paket,
    hps: rup.pagu * faker.number.float({ min: 0.8, max: 1.0, fractionDigits: 2 }),
    status_nontender: faker.helpers.arrayElement(['Selesai', 'Proses', 'Batal']),
    mtd_pemilihan: 'Pengadaan Langsung',
    tgl_mulai_nontender: faker.date.recent().toISOString(),
    nip_nama_ppk: `${rup.nip_ppk} - ${rup.nama_ppk}`
  });
}
fs.writeFileSync(path.join(demoDir, 'tender', `non-tender-pengumuman_${tahun}.json`), JSON.stringify(nonTenderList, null, 2));

// 7. Generate E-Purchasing
const epurchasingList = [];
for (let i = 0; i < 100; i++) {
  const rup = faker.helpers.arrayElement(rupPenyediaList);
  const penyedia = faker.helpers.arrayElement(penyediaList);
  epurchasingList.push({
    rup_code: rup.kd_rup,
    order_id: `PO-${faker.string.numeric(6)}`,
    order_date: faker.date.recent({ days: 180 }).toISOString(),
    status: faker.helpers.arrayElement(['Selesai', 'Paket Proses', 'Batal']),
    total: rup.pagu * faker.number.float({ min: 0.9, max: 1.0, fractionDigits: 2 }),
    kode_penyedia: penyedia.kode_penyedia,
    penyedia_nama: penyedia.nama_penyedia,
    penyedia_status_umkk: penyedia.status_umkk,
    rup_nama_paket: rup.nama_paket,
    shipment_status: faker.helpers.arrayElement(['Terkirim', 'Diproses', 'Pesanan Diterima'])
  });
}
fs.writeFileSync(path.join(demoDir, 'ekatalog', `paket-e-purchasing_${tahun}.json`), JSON.stringify(epurchasingList, null, 2));

// 8. Generate Pencatatan Swakelola
const pencatatanSwakelolaList = [];
const pencatatanSwakelolaRealisasiList = [];
for (let i = 0; i < 25; i++) {
  const rup = faker.helpers.arrayElement(rupSwakelolaList);
  const kd_swakelola_pct = faker.string.numeric(6);
  pencatatanSwakelolaList.push({
    kd_swakelola_pct,
    kd_rup: rup.kd_rup,
    kd_satker: rup.kd_satker,
    nama_satker: satkerList.find(s => s.kd_satker === rup.kd_satker)?.nama_satker,
    nama_paket: rup.nama_paket,
    pagu: rup.pagu,
    total_realisasi: rup.pagu * faker.number.float({ min: 0.8, max: 1.0, fractionDigits: 2 }),
    status_swakelola_pct: faker.helpers.arrayElement(['Selesai', 'Proses', 'Batal']),
    tipe_swakelola_nama: faker.helpers.arrayElement(['Tipe I', 'Tipe II', 'Tipe III', 'Tipe IV']),
    sumber_dana: faker.helpers.arrayElement(['APBN', 'APBD', 'BLU']),
    nip_ppk: rup.nip_ppk,
    nama_ppk: rup.nama_ppk,
    tgl_mulai: faker.date.recent().toISOString()
  });

  pencatatanSwakelolaRealisasiList.push({
    kd_swakelola_pct,
    nilai_realisasi: rup.pagu * faker.number.float({ min: 0.8, max: 1.0, fractionDigits: 2 }),
    tanggal_realisasi: faker.date.recent().toISOString()
  });
}
fs.writeFileSync(path.join(demoDir, 'tender', `pencatatan-swakelola_${tahun}.json`), JSON.stringify(pencatatanSwakelolaList, null, 2));
fs.writeFileSync(path.join(demoDir, 'tender', `pencatatan-swakelola-realisasi_${tahun}.json`), JSON.stringify(pencatatanSwakelolaRealisasiList, null, 2));

// 9. Generate Pencatatan Non-Tender
const pencatatanNonTenderList = [];
const pencatatanNonTenderRealisasiList = [];
for (let i = 0; i < 25; i++) {
  const rup = faker.helpers.arrayElement(rupPenyediaList);
  const kd_nontender_pct = faker.string.numeric(6);
  const penyedia = faker.helpers.arrayElement(penyediaList);
  
  pencatatanNonTenderList.push({
    kd_nontender_pct,
    kd_rup: rup.kd_rup,
    kd_satker: rup.kd_satker,
    nama_satker: satkerList.find(s => s.kd_satker === rup.kd_satker)?.nama_satker,
    nama_paket: rup.nama_paket,
    pagu: rup.pagu,
    total_realisasi: rup.pagu * faker.number.float({ min: 0.8, max: 1.0, fractionDigits: 2 }),
    status_nontender_pct: faker.helpers.arrayElement(['Selesai', 'Proses', 'Batal']),
    mtd_pemilihan: faker.helpers.arrayElement(['Pengadaan Langsung', 'Penunjukan Langsung', 'E-Purchasing', 'Tender Cepat']),
    kategori_pengadaan: faker.helpers.arrayElement(['Barang', 'Jasa Konsultansi', 'Jasa Lainnya', 'Pekerjaan Konstruksi']),
    sumber_dana: faker.helpers.arrayElement(['APBN', 'APBD', 'BLU']),
    bukti_pembayaran: faker.helpers.arrayElement(['Kuitansi', 'Faktur', 'Invoice']),
    nip_ppk: rup.nip_ppk,
    nama_ppk: rup.nama_ppk,
    tgl_mulai: faker.date.recent().toISOString()
  });

  pencatatanNonTenderRealisasiList.push({
    kd_nontender_pct,
    npwp_penyedia: penyedia.npwp,
    nilai_realisasi: rup.pagu * faker.number.float({ min: 0.8, max: 1.0, fractionDigits: 2 }),
    tanggal_realisasi: faker.date.recent().toISOString()
  });
}
fs.writeFileSync(path.join(demoDir, 'tender', `pencatatan-non-tender_${tahun}.json`), JSON.stringify(pencatatanNonTenderList, null, 2));
fs.writeFileSync(path.join(demoDir, 'tender', `pencatatan-non-tender-realisasi_${tahun}.json`), JSON.stringify(pencatatanNonTenderRealisasiList, null, 2));

// 10. Generate History Kaji Ulang
const historyKajiUlangList = [];
// 30% of penyedia and swakelola have kaji ulang
const allRupList = [...rupPenyediaList, ...rupSwakelolaList];
for (const rup of allRupList) {
  if (Math.random() < 0.3) {
    historyKajiUlangList.push({
      kd_rup_baru: rup.kd_rup,
      kd_rup_lama: faker.string.numeric(7),
      alasan_kaji_ulang: faker.lorem.sentence(),
      tgl_kaji_ulang: faker.date.recent().toISOString()
    });
  }
}
fs.writeFileSync(path.join(demoDir, 'rup', `history-kaji-ulang_${tahun}.json`), JSON.stringify(historyKajiUlangList, null, 2));

// 11. Generate Anggaran Penyedia
const anggaranPenyediaList = [];
for (const rup of rupPenyediaList) {
  anggaranPenyediaList.push({
    kd_rup: rup.kd_rup,
    mak: `054.01.${faker.string.numeric(4)}.${faker.string.numeric(4)}`,
    sumber_dana: faker.helpers.arrayElement(['APBN', 'APBD', 'BLU']),
    pagu: rup.pagu
  });
}
fs.writeFileSync(path.join(demoDir, 'rup', `paket-anggaran-penyedia_${tahun}.json`), JSON.stringify(anggaranPenyediaList, null, 2));

// 12. Generate Anggaran Swakelola
const anggaranSwakelolaList = [];
for (const rup of rupSwakelolaList) {
  anggaranSwakelolaList.push({
    kd_rup: rup.kd_rup,
    mak: `054.01.${faker.string.numeric(4)}.${faker.string.numeric(4)}`,
    sumber_dana: faker.helpers.arrayElement(['APBN', 'APBD', 'BLU']),
    pagu: rup.pagu
  });
}
fs.writeFileSync(path.join(demoDir, 'rup', `paket-anggaran-swakelola_${tahun}.json`), JSON.stringify(anggaranSwakelolaList, null, 2));

// Empty files for others to prevent merge errors
const emptyFiles = [
  `endpoints_config.json`,
  `cron_config.json`
];

emptyFiles.forEach(f => {
  fs.writeFileSync(path.join(demoDir, f), '[]');
});

console.log('✅ Demo data successfully generated in server/data_demo!');
