let db;

//IndexedDB stores data inside the browser
//Open a connection to "Budget" database. Second paramater is the version of the db.
const request = indexedDB.open('BudgetDB', 1);

//upgrade event is triggered when you create a new DB or increase the version of existing db.
request.onupgradeneeded = function (e) {
  console.log('Upgrade needed in IndexDB');

  const { oldVersion } = e;
  const newVersion = e.newVersion || db.version;

  console.log(`DB Updated from version ${oldVersion} to ${newVersion}`);

  db = e.target.result;

//creates Budget object store, with auto-increment ID
  if (db.objectStoreNames.length === 0) {
    db.createObjectStore('BudgetStore', { autoIncrement: true });
  }
};

//If request errors, error event is triggered
request.onerror = function (e) {
  console.log(`Uh oh. ${e.target.errorCode}`);
};

function checkDatabase() {
  console.log('checkingn database');

  // Open a transaction on your BudgetStore db
  let transaction = db.transaction(['BudgetStore'], 'readwrite');

  // Access your BudgetStore object
  const store = transaction.objectStore('BudgetStore');

  // Get all records from store and set to a variable
  const getAll = store.getAll();

  // If the request was successful
  getAll.onsuccess = function () {
    // If there are items in the store, we need to bulk add them when we are back online
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((result) => {
          // If our returned response is not empty
          if (result.length !== 0) {
            // Open another transaction to BudgetStore with the ability to read and write
            transaction = db.transaction(['BudgetStore'], 'readwrite');

            // Assign the current store to a variable
            const currentStore = transaction.objectStore('BudgetStore');

            // Clear existing entries because our bulk add was successful
            currentStore.clear();
            console.log('Clearing store 🧹');
          }
        });
    }
  };
}

//If successful request, success event is trigerred.
request.onsuccess = function (e) {
  console.log('success');
  db = e.target.result;

  // Checks if the app is online, then reads the db
  if (navigator.onLine) {
    console.log('Backend online!');
    checkDatabase();
  }
};

const saveRecord = (record) => {
  console.log('Save record invoked');
  // Creates new transaction on the BudgetStore db with readwrite access
  const transaction = db.transaction(['BudgetStore'], 'readwrite');

  // Access your BudgetStore object store
  const store = transaction.objectStore('BudgetStore');

  // Add record to your store with add method.
  store.add(record);
};

// Listen for app coming back online
window.addEventListener('online', checkDatabase);
