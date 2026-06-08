const mongoose = require('mongoose');
require('dotenv').config();
const Worker = require('./src/models/Worker');
const Service = require('./src/models/Service');

const services = [
  { service_name: 'Dọn nhà', description: 'Dọn dẹp nhà cửa', price: 200000 },
  { service_name: 'Giặt đồ', description: 'Giặt ủi đồ', price: 100000 },
  { service_name: 'Nấu ăn', description: 'Nấu ăn theo yêu cầu', price: 150000 },
  { service_name: 'Sửa điện', description: 'Sửa điện nhẹ', price: 300000 },
  { service_name: 'Vệ sinh máy lạnh', description: 'Vệ sinh bảo trì máy lạnh', price: 350000 },
];

const workers = [
  { full_name: 'Nguyễn Văn A', phone_number: '0901234567', email: 'nva@example.com', skills: [], status: 'active' },
  { full_name: 'Trần Thị B', phone_number: '0907654321', email: 'ttb@example.com', skills: [], status: 'active' },
  { full_name: 'Lê Văn C', phone_number: '0912345678', email: 'lvc@example.com', skills: [], status: 'active' },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DBNAME });
  const serviceResults = await Service.insertMany(services);
  const serviceIds = serviceResults.map(s => s._id);
  const workersWithSkills = workers.map((w, i) => ({
    ...w,
    skills: [serviceIds[i % serviceIds.length]]
  }));
  await Worker.insertMany(workersWithSkills);
  console.log('Seeded workers and services');
  await mongoose.connection.close();
}

seed().catch(console.error);
