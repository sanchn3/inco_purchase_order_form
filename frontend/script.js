const form = document.getElementById('simpleForm');
const result = document.getElementById('result');

window.onload = function() {
    const dateField = document.getElementById('date');
    if (dateField) {
        const today = new Date();
        
        // Format as YYYY-MM-DD (which HTML <input type="date"> requires)
        const yyyy = today.getFullYear();
        let mm = today.getMonth() + 1; // Months start at 0
        let dd = today.getDate();

        // Add a leading zero to single digits
        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;

        dateField.value = `${yyyy}-${mm}-${dd}`;
    }
};

form.addEventListener('submit', function (e) {
  e.preventDefault();


  console.log(document.getElementById('name'));
  const result = document.getElementById('result');
  const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
  const phoneInput = document.getElementById('phone_number').value;
   if (!phoneRegex.test(phoneInput)) {
    result.innerHTML = `<p style="color: red;">Error: Phone number must be exactly 10 digits (no dashes or spaces).</p>`;
    return; // Stops the function here so it doesn't send to Python
  }
  

  
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
  setTimeout(function() {
            result.innerHTML = ""; // This makes the text vanish
        }, 20000); // 20000ms = 20 seconds

  })
  .catch(error => {
    console.error('Error:', error);
    result.innerHTML = `<p style="color: red;">Could not connect to Python server.</p>`;
  });
});