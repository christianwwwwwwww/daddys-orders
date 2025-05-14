let salt = Math.floor(Math.random() * 1000000);
// TODO replace with dynamic address
const userAddress = "aleo1lx3g77tkhtjyv57qssnrz2paktw3fk607ct4c8jd8xcztqwm8vqq854h6z";
const worker = new Worker("worker.js", { type: "module" });
let lastDecryptedOrder = null; // gets filled in after decrypting

// TODO remove this hardcoded just for testing
lastDecryptedOrder = {
  main: 4,
  side: 3,
  drink: 1,
};

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

  if (action === "decrypt_order_record") {
    const parsed = JSON.parse(result);
    lastDecryptedOrder = parsed; // save it globally

    const readableOrder = {
      main: MAIN_OPTIONS[parsed.main],
      side: SIDE_OPTIONS[parsed.side],
      drink: DRINK_OPTIONS[parsed.drink],
    };

    const msg = `🧾 Daddy’s Order:\n\n🌯 Main: ${readableOrder.main}\n🍟 Side: ${readableOrder.side}\n🥤 Drink: ${readableOrder.drink}`;
    console.log(msg);
    document.getElementById("order-display").innerText = msg;
    alert(msg);
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
  worker.postMessage({ action: "decrypt_order_record" });
};

// TODO replace with actual numbers from decrypted record 
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


document.querySelector("#app").innerHTML = `
  <div>
    <h1>DADDY'S ORDERS</h1>
    <div class="card">
      <button onclick="window.getOrder()">Get Order</button>
      <button onclick="window.obeyOrder()">Prove Obedience</button>
    </div>
    <p id="order-display" class="read-the-docs">
      Follow your assigned combo or suffer.
    </p>
  </div>
`;




// TODO remove this - just testing
if (lastDecryptedOrder) {
  const readableOrder = {
    main: MAIN_OPTIONS[lastDecryptedOrder.main],
    side: SIDE_OPTIONS[lastDecryptedOrder.side],
    drink: DRINK_OPTIONS[lastDecryptedOrder.drink],
  };

  const msg = `🧾 Daddy’s Order:\n\n🌯 Main: ${readableOrder.main}\n🍟 Side: ${readableOrder.side}\n🥤 Drink: ${readableOrder.drink}`;
  document.getElementById("order-display").innerText = msg;
}
