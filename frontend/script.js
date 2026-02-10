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

  // 1. Identify the form
    const formType = form.getAttribute('data-form-type');
    const getVal = (id) => document.getElementById(id)?.value || "";
    
    let formData = {};

  console.log(document.getElementById('name'));
  const result = document.getElementById('result');
  const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
  
  
  // --- FORM 1: PICKUP ---
    if (formType === 'pickup') {
      const phoneInput = document.getElementById('phone_number').value;
    if (!phoneRegex.test(phoneInput)) {
      result.innerHTML = `<p style="color: red;">Error: Phone number must be exactly 10 digits (no dashes or spaces).</p>`;
    return; // Stops the function here so it doesn't send to Python
  }
        formData = {
            form_type: 'pickup',
            date: getVal('date'),
            driver_name: getVal('name'),
            phone: getVal('phone_number'),
            company: getVal('company'),
            po_number: getVal('purchase_order'),
            truck_temp: getVal('truck_temp'), // or whatever your ID is
            cleanliness: document.querySelector('input[name="cleanliness"]:checked')?.value || "N/A",
            time: getVal('current-time')
        };
    }

    // --- FORM 2: VISITOR ---
    else if (formType === 'visitor') {
        formData = {
            form_type: 'visitor',
            visitor_name: getVal('name'),
            company: getVal('company'),
            host_person: getVal('person_to_visit'),
            entry_time: getVal('time-in'),
            exit_time: getVal('time-out')
        };
    }

  // Note the port change to 5000 for Python/Flask
  fetch('http://192.168.20.117:5000/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  })
  .then(response => response.json())
  .then(data => {
    result.innerHTML = `<p style="color: green;">${data.message}</p>`;
    form.reset();
  setTimeout(function() {
            window.location.href = 'landing.html'; // This makes the text vanish
        }, 3000); // 20000ms = 20 seconds

  })
  .catch(error => {
    console.error('Error:', error);
    result.innerHTML = `<p style="color: red;">Could not connect to Python server.</p>`;
  });
});