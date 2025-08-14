// script.js
import fs from 'fs';
import csv from 'csv-parser';
import dotenv from 'dotenv';

import { initializeApp } from 'firebase/app';
import { getDatabase, onValue, ref, set } from 'firebase/database';

dotenv.config();

// 🔹 Configuração do Firebase
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// 🔹 Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 🔹 Função para ler CSV e popular o banco
function importarSchoolsCSV(filePath) {
  const schools = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      // Cada "row" é um objeto com as colunas do CSV
      schools.push(row);
    })
    .on('end', async () => {
      console.log(`📄 CSV carregado com ${schools.length} escolas.`);
      // return console.log(schools);

      for (const school of schools) {
        const schoolRef = ref(db, `schools/${school.inep}`);
        await set(schoolRef, {
          district: school.district ?? '',
          cnpj: school.cnpj ?? '',
          name: school.name ?? '',
          address: school.address ?? '',
          working: school.working
            ? school.working.toUpperCase() === 'FUNCIONANDO'
            : false,
        });
        console.log(`✅ Escola ${school.name} adicionada com sucesso!`);
      }

      console.log('🎉 Importação finalizada!');
    });
}

const SearchSchoolParalisada = async () => {
  try {
    onValue(
      ref(db, 'schools/'),
      (data) => {
        if (!data.exists()) return;

        const schools = Object.entries(data.val() ?? {}).map(
          ([inep, value]) => {
            return { inep, ...value };
          }
        );

        console.log(schools.filter((school) => !school.working));
      }
      // { onlyOnce: true }
    );
  } catch (error) {
    console.log(error);
  }
};

// const users = [
//   {
//     name: 'Janai',
//     skills: [
//       'React',
//       'Node',
//       ['UI', 'UX', ['UX Research', 'CX', ['DS', 'DesignOps']]],
//     ],
//   },
//   { name: 'Will', skills: ['React', 'Node'] },
// ];

// const AllSkills = () => {
//   // return console.log(users.flatMap((user) => user.skills));
//   return console.log(users.map((user) => user.skills).flat(4));
// };

// Executa a função
// importarSchoolsCSV('schools.csv');
SearchSchoolParalisada();
// AllSkills();
