// Add loading styles to document head
const loadingStyles = `
  <style>
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    
    .loading-gif {
      width: 80px;
      height: 80px;
      margin-bottom: 10px;
    }
    
    .small-text {
      font-size: 0.8em;
      color: #666;
      margin-top: 5px;
    }
  </style>
`;
document.head.insertAdjacentHTML('beforeend', loadingStyles);

let salt;
// TODO: Replace with dynamic address from wallet
const userAddress = "aleo1lx3g77tkhtjyv57qssnrz2paktw3fk607ct4c8jd8xcztqwm8vqq854h6z";
const worker = new Worker("worker.js", { type: "module" });

let lastDecryptedOrder = null;
let isLoading = false;

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
    isLoading = false;
    return;
  }

  if (action === "get_order") {
    const txId = result;
    console.log("🔍 Fetching and decrypting tx:", txId);
    
    // Update loading message
    document.getElementById("order-display").innerHTML = `
      <div class="loading-container">
        <img src="loading.gif" alt="Loading" class="loading-gif" />
        <p>Transaction submitted! Waiting for confirmation...</p>
        <p class="small-text">Transaction ID: ${txId.substring(0, 8)}...${txId.substring(txId.length - 8)}</p>
      </div>
    `;
  
    // Poll the API until the transaction is found or timeout occurs
    let retryCount = 0;
    const maxRetries = 20; // About 5 minutes if we retry every 15 seconds
    const retryInterval = 15000; // 15 seconds
    
    const checkTransaction = () => {
      if (retryCount >= maxRetries) {
        document.getElementById("order-display").innerHTML = `
          <p>Order request timed out. Transaction may still be processing.</p>
          <p class="small-text">Transaction ID: ${txId}</p>
          <button onclick="window.checkExistingOrder('${txId}')">Check Status</button>
        `;
        isLoading = false;
        return;
      }
      
      fetch(`https://vxb.ai/api/v5/mainnet/transactions/transaction/${txId}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`API response was not ok: ${response.status}`);
          }
          return response.json();
        })
        .then(txData => {
          // Check if transaction exists and was successful
          if (!txData.success || !txData.transaction) {
            retryCount++;
            setTimeout(checkTransaction, retryInterval);
            return;
          }
          
          // Transaction found - proceed with processing
          // Update loading message
          document.getElementById("order-display").innerHTML = `
            <div class="loading-container">
              <img src="loading.gif" alt="Loading" class="loading-gif" />
              <p>Transaction confirmed! Decrypting your order...</p>
            </div>
          `;
          
          // Get the first transition
          const firstTransition = txData.transaction.transaction.execution.transitions[0];
          
          // Verify it's from our program
          if (firstTransition.program !== "daddys_orders_v1.aleo") {
            throw new Error("Not a valid Daddy's Orders transaction");
          }
          
          // Get the record value from outputs
          if (firstTransition.outputs && firstTransition.outputs.length > 0) {
            const recordValue = firstTransition.outputs[0].value;
            console.log("Record value:", recordValue);
            
            // If this is just the record string, you'll need to decrypt it
            // For now, trigger the decrypt_order_record action with this record
            worker.postMessage({
              action: "decrypt_order_record",
              payload: {
                record: recordValue
              }
            });
          } else {
            throw new Error("No outputs found in transaction");
          }
        })
        .catch(error => {
          console.error("Error checking transaction:", error);
          // If it's a network error, retry
          if (error.message.includes("API response was not ok") || error.message.includes("Failed to fetch")) {
            retryCount++;
            setTimeout(checkTransaction, retryInterval);
          } else {
            // Other errors, fallback to hardcoded values
            console.warn("Using fallback hardcoded values");
            isLoading = false;
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

            const msg = `🧾 Daddy's Order:\n\n🌯 Main: ${readableOrder.main}\n🍟 Side: ${readableOrder.side}\n🥤 Drink: ${readableOrder.drink}`;
            document.getElementById("order-display").innerText = msg;
          }
        });
    };
    
    // Start checking the transaction
    setTimeout(checkTransaction, 5000); // Initial delay before first check
    
    return;
  }

  if (action === "decrypt_order_record") {
    isLoading = false;
    const parsed = JSON.parse(result);
    lastDecryptedOrder = parsed;

    const readableOrder = {
      main: MAIN_OPTIONS[parsed.main],
      side: SIDE_OPTIONS[parsed.side],
      drink: DRINK_OPTIONS[parsed.drink],
    };

    const msg = `🧾 Daddy's Order:\n\n🌯 Main: ${readableOrder.main}\n🍟 Side: ${readableOrder.side}\n🥤 Drink: ${readableOrder.drink}`;
    console.log(msg);
    document.getElementById("order-display").innerText = msg;
    return;
  }

  if (action === "obey_order") {
    console.log(`✅ ${action} successful:`, result);
    alert(`Obedience verified! Your compliance has been recorded on the blockchain.`);
    return;
  }

  console.log(`✅ ${action} successful:`, result);
};

window.getOrder = () => {
  salt = Math.floor(Math.random() * 1000000);
  console.log("Generated new salt:", salt);
  // Set loading state
  isLoading = true;
  
  // Update UI to show loading animation
  document.getElementById("order-display").innerHTML = `
    <div class="loading-container">
      <img src="loading.gif" alt="Loading" class="loading-gif" />
      <p>Getting your order from the blockchain...</p>
      <p class="small-text">This may take a few minutes to process.</p>
    </div>
  `;
  
  worker.postMessage({
    action: "get_order",
    payload: {
      address: userAddress,
      salt: salt,
    },
  });
};

window.checkExistingOrder = (txId) => {
  isLoading = true;
  document.getElementById("order-display").innerHTML = `
    <div class="loading-container">
      <img src="loading.gif" alt="Loading" class="loading-gif" />
      <p>Checking transaction status...</p>
      <p class="small-text">Transaction ID: ${txId.substring(0, 8)}...${txId.substring(txId.length - 8)}</p>
    </div>
  `;
  
  fetch(`https://vxb.ai/api/v5/mainnet/transactions/transaction/${txId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`API response was not ok: ${response.status}`);
      }
      return response.json();
    })
    .then(txData => {
      // Check if transaction exists and was successful
      if (!txData.success || !txData.transaction) {
        throw new Error("Transaction still processing. Try again later.");
      }
      
      // Transaction found - proceed with processing
      const firstTransition = txData.transaction.transaction.execution.transitions[0];
      
      // Verify it's from our program
      if (firstTransition.program !== "daddys_orders_v1.aleo") {
        throw new Error("Not a valid Daddy's Orders transaction");
      }
      
      // Get the record value from outputs
      if (firstTransition.outputs && firstTransition.outputs.length > 0) {
        const recordValue = firstTransition.outputs[0].value;
        console.log("Record value:", recordValue);
        
        document.getElementById("order-display").innerHTML = `
          <div class="loading-container">
            <img src="loading.gif" alt="Loading" class="loading-gif" />
            <p>Transaction found! Decrypting your order...</p>
          </div>
        `;
        
        worker.postMessage({
          action: "decrypt_order_record",
          payload: {
            record: recordValue
          }
        });
      } else {
        throw new Error("No outputs found in transaction");
      }
    })
    .catch(error => {
      isLoading = false;
      console.error("Error checking transaction:", error);
      document.getElementById("order-display").innerHTML = `
        <p>Error: ${error.message}</p>
        <button onclick="window.checkExistingOrder('${txId}')">Try Again</button>
      `;
    });
};

window.obeyOrder = () => {
  if (!lastDecryptedOrder) {
    alert("No order to obey yet. Get your order first.");
    return;
  }

  const { main, side, drink } = lastDecryptedOrder;
  
  // Show loading state
  document.getElementById("order-display").innerHTML = `
    <div class="loading-container">
      <img src="loading.gif" alt="Loading" class="loading-gif" />
      <p>Proving your obedience on the blockchain...</p>
    </div>
  `;

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
  document.getElementById('upload-status').innerHTML = `
    <div class="loading-container">
      <img src="loading.gif" alt="Loading" class="loading-gif" />
      <p>Processing receipt...</p>
    </div>
  `;
  
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
            discrepancies.push(`YOU WERE SUPPOSED TO ORDER A ${expectedMain} AS A MAIN. NO OBEDIENCE TOKENS FOR YOU.`);
          }

          if (detectedItems.side === expectedSide) {
            matches++;
          } else {
            discrepancies.push(`YOU WERE SUPPOSED TO ORDER A ${expectedSide} AS A SIDE. NO OBEDIENCE TOKENS FOR YOU.`);
          }

          if (detectedItems.drink === expectedDrink) {
            matches++;
          } else {
            discrepancies.push(`YOU WERE SUPPOSED TO ORDER A ${expectedDrink} AS A DRINK. NO OBEDIENCE TOKENS FOR YOU.`);
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
      <p id="order-display">Allow your loving daddy Leo to make your choices. Upload a receipt proving you obeyed His orders to be rewarded.</p>
      <button onclick="window.getOrder()">Get Order</button>
      <button onclick="window.obeyOrder()">Prove Obedience</button>
    </div>
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