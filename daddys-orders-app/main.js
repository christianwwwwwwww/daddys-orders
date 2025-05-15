let salt = Math.floor(Math.random() * 1000000);
// TODO: Replace with dynamic address from wallet
const userAddress = "aleo1lx3g77tkhtjyv57qssnrz2paktw3fk607ct4c8jd8xcztqwm8vqq854h6z";
const worker = new Worker("worker.js", { type: "module" });

let lastDecryptedOrder = null;

const MAIN_OPTIONS = [
  "Steak Grilled Cheesy Burrito",
  "5 Layer Beef Burrito",
  "Beef Burrito",
  "Burrito Supreme",
  "Crunchwrap Supreme",
  "Doritos Gordita Crunch",
];
const SIDE_OPTIONS = [
  "Regular Fries",
  "Chips & Cheese",
  "Fries Supreme",
  "Nachos Supreme",
  "Chili Cheese Fries",
  "Cinnamon Twists",
];
const DRINK_OPTIONS = [
  "Mountain Dew Baja Blast",
  "Pepsi",
  "7 Up",
  "Diet Pepsi",
  "Mountain Dew",
  "Iced Tea",
];

worker.onmessage = function (e) {
  const { success, action, result, error } = e.data;

  if (!success) {
    console.error(`❌ Error in ${action}:`, error);
    alert(`❌ ${action} failed: ${error}`);
    return;
  }

  if (action === "get_order") {
    const txId = result;
    console.log("🔍 TODO: fetch and decrypt tx:", txId);

    // TODO manually provide decrypted record values for now
    // lastDecryptedOrder = {
    //   main: 4,
    //   side: 3,
    //   drink: 1,
    // };

    const readableOrder = {
      main: MAIN_OPTIONS[lastDecryptedOrder.main],
      side: SIDE_OPTIONS[lastDecryptedOrder.side],
      drink: DRINK_OPTIONS[lastDecryptedOrder.drink],
    };

    const msg = `🧾 Daddy’s Order:\n\n🌯 Main: ${readableOrder.main}\n🍟 Side: ${readableOrder.side}\n🥤 Drink: ${readableOrder.drink}`;
    document.getElementById("order-display").innerText = msg;
    return;
  }

if (action === "decrypt_order_record") {
  // TODO  Hardcoded test values - replace
  lastDecryptedOrder = {
    main: 4,
    side: 3,
    drink: 1,
  };

  const readableOrder = {
    main: MAIN_OPTIONS[lastDecryptedOrder.main],
    side: SIDE_OPTIONS[lastDecryptedOrder.side],
    drink: DRINK_OPTIONS[lastDecryptedOrder.drink],
  };

  const msg = `🧾 Daddy’s Order:\n\n🌯 Main: ${readableOrder.main}\n🧀 Side: ${readableOrder.side}\n🥤 Drink: ${readableOrder.drink}`;
  console.log(msg);
  document.getElementById("order-display").innerText = msg;
  return;
}


  console.log(`✅ ${action} successful:`, result);
};

window.getOrder = () => {
  worker.postMessage({
    action: "get_order",
    payload: {
      address: userAddress,
      salt: salt,
    },
  });
};

window.obeyOrder = () => {
  if (!lastDecryptedOrder) {
    alert("No order to obey yet. Get your order first.");
    return;
  }

  const { main, side, drink } = lastDecryptedOrder;

  worker.postMessage({
    action: "obey_order",
    payload: {
      address: userAddress,
      salt: salt,
      main,
      side,
      drink,
    },
  });
};
window.uploadReceipt = function() {
  const fileInput = document.getElementById('receipt-upload');
  const file = fileInput.files[0];
  
  if (!file) {
    alert('Please select an image file first');
    return;
  }
  
  // Update UI to show loading state
  document.getElementById('upload-status').innerText = 'Processing receipt...';
  
  // Read the file as base64
  const reader = new FileReader();
  reader.onload = function(e) {
    const base64Image = e.target.result;
    
    // Send to Python backend
    fetch('http://localhost:5000/process-receipt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image: base64Image
      })
    })
    .then(response => response.json())
    .then(data => {
      document.getElementById('upload-status').innerText = 'Receipt processed!';
      
      if (data.success) {
        // Store the detected items
        const detectedItems = data.detected_items;
        console.log(data.detected_items);
        
        // Compare with the expected order
        if (lastDecryptedOrder) {
          let matches = 0;
          let totalItems = 3;
          let discrepancies = [];

          const expectedMain = MAIN_OPTIONS[lastDecryptedOrder.main];
          const expectedSide = SIDE_OPTIONS[lastDecryptedOrder.side];
          const expectedDrink = DRINK_OPTIONS[lastDecryptedOrder.drink];

          if (detectedItems.main === expectedMain) {
            matches++;
          } else {
            discrepancies.push(`YOU WERE SUPPOSED TO ORDER A ${expectedMain} AS A SIDE. NO OBEDIENCE TOKENS FOR YOU.`);
          }

          if (detectedItems.side === expectedSide) {
            matches++;
          } else {
            discrepancies.push(`YOU WERE SUPPOSED TO ORDER A ${expectedSide} AS A SIDE. NO OBEDIENCE TOKENS FOR YOU.`);
          }

          if (detectedItems.drink === expectedDrink) {
            matches++;
          } else {
            discrepancies.push(`YOU WERE SUPPOSED TO ORDER A ${expectedDrink} AS A SIDE. NO OBEDIENCE TOKENS FOR YOU.`);
          }
          
          
          // Display verification results
          const percentMatch = totalItems > 0 ? Math.round((matches / totalItems) * 100) : 0;
          
          let resultMessage = `Receipt Verification Result: ${percentMatch}% match\n\n`;
          resultMessage += `Found ${matches} out of 3 possible items on the receipt.\n\n`;
          
          if (discrepancies.length > 0) {
            resultMessage += "Discrepancies found:\n" + discrepancies.join('\n');
          } else if (totalItems > 0) {
            resultMessage += "All detected items match the expected order!";
          } else {
            resultMessage += "No menu items were detected in the receipt.";
          }
          
          document.getElementById('verification-result').innerText = resultMessage;
        } else {
          document.getElementById('verification-result').innerText = "No expected order to compare with. Please get your order first.";
        }
      } else {
        document.getElementById('upload-status').innerText = 'Error processing receipt';
        alert('Error processing the receipt: ' + (data.error || 'Unknown error'));
      }
    })
    .catch(error => {
      document.getElementById('upload-status').innerText = 'Error processing receipt';
      console.error('Error sending image to server:', error);
      alert('Error connecting to the server. Please make sure the backend is running.');
    });
  };
  
  reader.readAsDataURL(file);
};

// Update your HTML template to include the receipt upload functionality
const originalHTML = document.querySelector("#app").innerHTML;
document.querySelector("#app").innerHTML = `
  <div id="bg">
    <div id="screen-text">
      <h1>DADDY'S ORDERS</h1>
      <p id="order-display">Allow your loving daddy, Leo to make your choices. Upload a receipt proving you obeyed His orders to be rewarded.</p>
      <button onclick="window.getOrder()">Get Order</button>
      <button onclick="window.obeyOrder()">Prove Obedience</button>
    </div>
    <p id="order-display" class="read-the-docs">
      Follow your assigned combo or suffer.
    </p>
    <div class="receipt-verification">
      <h2>Verify UberEats Receipt</h2>
      <input type="file" id="receipt-upload" accept="image/*" />
      <button onclick="window.uploadReceipt()">Verify Receipt</button>
      <p id="upload-status"></p>
      <div id="verification-result" class="verification-result"></div>
    </div>
  </div>
`;

// Restore any existing order display
if (lastDecryptedOrder) {
  const readableOrder = {
    main: MAIN_OPTIONS[lastDecryptedOrder.main],
    side: SIDE_OPTIONS[lastDecryptedOrder.side],
    drink: DRINK_OPTIONS[lastDecryptedOrder.drink],
  };
  const msg = `🧾 Daddy's Order:\n\n🌯 Main: ${readableOrder.main}\n🍟 Side: ${readableOrder.side}\n🥤 Drink: ${readableOrder.drink}`;
  document.getElementById("order-display").innerText = msg;
}

// document.querySelector("#app").innerHTML = `
//   <div>
//     <h1>DADDY'S ORDERS</h1>
//     <div class="card">
//       <button onclick="window.getOrder()">Get Order</button>
//       <button onclick="window.obeyOrder()">Prove Obedience</button>
//     </div>
//     <p id="order-display" class="read-the-docs">
//       Follow your assigned combo or suffer.
//     </p>
//   </div>
// `;

window.worker = worker;
