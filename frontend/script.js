  const form = document.getElementById('simpleForm');
  const result = document.getElementById('result');

form.addEventListener('submit', function (e) {
  e.preventDefault();

  console.log(document.getElementById('name'));
  

  const formData = {
    date: document.getElementById('date').value,
    name: document.getElementById('name').value,
    phone: document.getElementById('phone_number').value,
    company: document.getElementById('company').value,
    po: document.getElementById('purchase_order').value,
    temp: document.getElementById('truck_temp').value,
    cleanliness: document.querySelector('input[name="cleanliness"]:checked').value,
    time: document.getElementById('current-time').value
  };

  // Note the port change to 5000 for Python/Flask
  fetch('http://127.0.0.1:5000/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  })
  .then(response => response.json())
  .then(data => {
    result.innerHTML = `<p style="color: green;">${data.message}</p>`;
    form.reset();
  })
  .catch(error => {
    console.error('Error:', error);
    result.innerHTML = `<p style="color: red;">Could not connect to Python server.</p>`;
  });
});