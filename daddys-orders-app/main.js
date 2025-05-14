let salt = Math.floor(Math.random() * 1000000); // You could also let user re-roll

// Replace the Aleo address with your current connected user (hardcoded for now)
const userAddress = "aleo1lx3g77tkhtjyv57qssnrz2paktw3fk607ct4c8jd8xcztqwm8vqq854h6z";
const worker = new Worker("worker.js", { type: "module" });

worker.onmessage = function (e) {
  const { success, action, result, error } = e.data;

  if (!success) {
    console.error(`❌ Error in ${action}:`, error);
    alert(`❌ ${action} failed: ${error}`);
    return;
  }

  console.log(`✅ ${action} successful:`, result);
  alert(`${action} result:\n` + JSON.stringify(result, null, 2));
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

window.testDecrypt = () => {
  worker.postMessage({ action: "test_decrypt" });
};

window.obeyOrder = () => {
  // Replace these with real values from get_order output later
  const main = 0;
  const side = 1;
  const drink = 2;

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

document.querySelector("#app").innerHTML = `
  <div>
    <h1>DADDY'S ORDERS</h1>
    <div class="card">
      <button onclick="window.getOrder()">Get Order</button>
      <button onclick="window.obeyOrder()">Prove Obedience</button>
    </div>
    <p class="read-the-docs">
      Follow your assigned combo or suffer.
    </p>
  </div>
`;
