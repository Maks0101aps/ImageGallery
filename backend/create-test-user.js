const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

// Функция для создания тестового пользователя
async function createTestUser() {
  try {
    // Данные тестового пользователя
    const testUser = {
      id: 1,
      username: 'test',
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 10),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Создаем файл с тестовым пользователем
    const usersFilePath = path.join(__dirname, 'mock-users.json');
    
    // Если файл существует, читаем его и добавляем пользователя
    let users = [];
    if (fs.existsSync(usersFilePath)) {
      const fileContent = fs.readFileSync(usersFilePath, 'utf8');
      users = JSON.parse(fileContent);
      
      // Проверяем, существует ли уже пользователь с таким email или username
      const existingEmail = users.find(u => u.email === testUser.email);
      const existingUsername = users.find(u => u.username === testUser.username);
      
      if (existingEmail) {
        console.log('Пользователь с таким email уже существует.');
        return;
      }
      
      if (existingUsername) {
        console.log('Пользователь с таким username уже существует.');
        return;
      }
    }
    
    // Добавляем нового пользователя
    users.push(testUser);
    
    // Записываем обновленный список пользователей в файл
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    
    console.log('Тестовый пользователь успешно создан:');
    console.log(`- Username: ${testUser.username}`);
    console.log(`- Email: ${testUser.email}`);
    console.log(`- Password: password123`);
    console.log('\nВы можете использовать эти данные для входа в приложение.');
    
  } catch (error) {
    console.error('Ошибка при создании тестового пользователя:', error.message);
  }
}

// Запускаем функцию создания тестового пользователя
createTestUser(); 