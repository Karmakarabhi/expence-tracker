const axios = require('axios');
(async () => {
  try {
    const login = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    const token = login.data.token;
    
    // Get existing categories & projects
    const catsRes = await axios.get('http://localhost:5000/api/categories/flat', {headers: {Authorization:`Bearer ${token}`}});
    const projsRes = await axios.get('http://localhost:5000/api/projects', {headers: {Authorization:`Bearer ${token}`}});
    
    const catId = catsRes.data.data[0]._id;
    const projId = projsRes.data.data[0]._id;

    console.log("Attempting POST /api/expenses");
    const exp = await axios.post('http://localhost:5000/api/expenses', {
      projectId: projId,
      categoryId: catId,
      itemName: 'Item 1',
      quantity: 1,
      rate: 10,
      date: '2026-04-18',
      paymentStatus: 'paid'
    }, {headers: {Authorization:`Bearer ${token}`, "Content-Type": "application/json"}});
    console.log("Success", exp.data);
  } catch (err) {
    console.log("Error", err.response?.status, err.response?.data);
  }
})();
