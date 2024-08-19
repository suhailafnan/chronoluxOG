const updateCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const categories = await response.json();
      const categoryTableBody = document.getElementById('categoryTableBody');
      categoryTableBody.innerHTML = '';

      categories.forEach(category => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${category.name}</td>
          <td>${category.Description}</td>
          <td>${category.categ}</td>
        `;
        categoryTableBody.appendChild(row);
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Call the updateCategories function when the page loads
  window.onload = updateCategories;