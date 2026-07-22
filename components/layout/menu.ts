export interface MenuItem {
  name: string;
  path: string;
  iconPaths: string[];
  endpointActive?: string;
  adminOnly?: boolean;
}

export interface MenuGroup {
  label: string;
  items: MenuItem[];
}

export const menuGroups: MenuGroup[] = [
  {
    label: 'Menu Utama',
    items: [
      {
        name: 'Dashboard',
        path: '/',
        iconPaths: [
          'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
        ]
      }
    ]
  },
  {
    label: 'RUP',
    items: [
      {
        name: 'Program Master',
        path: '/rup/program-master',
        endpointActive: 'program-master',
        iconPaths: [
          'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
        ]
      },
      {
        name: 'History Kaji Ulang',
        path: '/rup/history-kaji-ulang',
        endpointActive: 'history-kaji-ulang',
        iconPaths: [
          'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
        ]
      },
      {
        name: 'Master Satker',
        path: '/rup/master-satker',
        endpointActive: 'master-satker',
        iconPaths: [
          'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
        ]
      },
      {
        name: 'Anggaran Penyedia',
        path: '/rup/paket-anggaran-penyedia',
        endpointActive: 'paket-anggaran-penyedia',
        iconPaths: [
          'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z'
        ]
      },
      {
        name: 'Anggaran Swakelola',
        path: '/rup/paket-anggaran-swakelola',
        endpointActive: 'paket-anggaran-swakelola',
        iconPaths: [
          'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
        ]
      },
      {
        name: 'Paket Penyedia',
        path: '/rup/paket-penyedia',
        endpointActive: 'paket-penyedia',
        iconPaths: [
          'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
        ]
      },
      {
        name: 'Paket Swakelola',
        path: '/rup/paket-swakelola',
        endpointActive: 'paket-swakelola',
        iconPaths: [
          'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
        ]
      },
      {
        name: 'Swakelola Terumumkan',
        path: '/rup/paket-swakelola-terumumkan',
        endpointActive: 'paket-swakelola-terumumkan',
        iconPaths: [
          'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
        ]
      }
    ]
  },
  {
    label: 'Tender',
    items: [
      {
        name: 'Non-Tender Pengumuman',
        path: '/tender/non-tender-pengumuman',
        endpointActive: 'non-tender-pengumuman',
        iconPaths: [
          'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
        ]
      }
    ]
  },
  {
    label: 'Summary Table',
    items: [
      {
        name: 'Non-Tender Enriched',
        path: '/summary-table/non-tender-enriched',
        iconPaths: [
          'M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z'
        ]
      },
      {
        name: 'Paket Penyedia Enriched',
        path: '/summary-table/rup-penyedia-enriched',
        iconPaths: [
          'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
        ]
      }
    ]
  },
  {
    label: 'Admin',
    items: [
      {
        name: 'Sistem & Cache',
        path: '/admin/system',
        adminOnly: true,
        iconPaths: [
          'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
          'M15 12a3 3 0 11-6 0 3 3 0 016 0z'
        ]
      },
      {
        name: 'Kelola Merge Data',
        path: '/admin/data-merge',
        adminOnly: true,
        iconPaths: [
          'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
        ]
      },
      {
        name: 'Data PPK',
        path: '/admin/ppk-master',
        adminOnly: true,
        iconPaths: [
          'M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2'
        ]
      },
      {
        name: 'Manajemen Pengguna',
        path: '/users',
        adminOnly: true,
        iconPaths: [
          'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
        ]
      }
    ]
  }
];
