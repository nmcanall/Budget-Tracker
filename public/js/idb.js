let db;

const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore("new_item", {autoIncrement: true});
}

request.onsuccess = function(event) {
    db = event.target.result;

    if(navigator.onLine) {
        uploadItem();
    }
}

request.onerror = function(event) {
    console.log(event.target.errorCode);
}

function saveRecord(record) {
    const transaction = db.transaction(["new_item"], "readwrite");
    const budgetObjectStore = transaction.objectStore("new_item");
    budgetObjectStore.add(record);
}

function uploadItem() {
    const transaction = db.transaction(["new_item"], "readwrite");
    const budgetObjectStore = transaction.objectStore("new_item");
    const getAll = budgetObjectStore.getAll();
    console.log(getAll);

    getAll.onsuccess = function() {
        if(getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*', 
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if(serverResponse.message) {
                        throw new Error(serverResponse);
                    }
                    const transaction = db.transaction(["new_item"], "readwrite");
                    const budgetObjectStore = transaction.objectStore("new_item");

                    budgetObjectStore.clear();

                    alert("All transactions have been submitted to the server!");
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }
}

window.addEventListener("online", uploadItem);