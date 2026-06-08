const mongoose = require('mongoose');
const Worker = require('./src/models/Worker');
const Service = require('./src/models/Service');

const services = [
  { service_name: 'Dọn nhà', description: 'Dọn dẹp nhà cửa', price: 200000 },
  { service_name: 'Giặt đồ', description: 'Giặt ủi đồ', price: 100000 },
  { service_name: 'Nấu ăn', description: 'Nấu ăn theo yêu cầu', price: 150000 },
];

const workers = [
  { full_name: 'Nguyễn Văn A', phone_number: '0901234567', email: 'nva@example.com', skills: [], status: 'active' },
  { full_name: 'Trần Thị B', phone_number: '0907654321', email: 'ttb@example.com', skills: [], status: 'active' },
];

async function seed() {
  await mongoose.connect('mongodb://localhost:27017/house-buddy');
  const serviceResults = await Service.insertMany(services);
  const serviceIds = serviceResults.map(s => s._id);
  const workersWithSkills = workers.map((w, i) => ({
    ...w,
    skills: [serviceIds[i % serviceIds.length]]
  }));
  await Worker.insertMany(workersWithSkills);
  console.log('Seeded');
  await mongoose.connection.close();
}

seed().catch(console.error);
