const databaseName = 'tomatDatabase';
const shapesTableName = 'shapesTable';
const textTableName = 'textTable';

function initialize() {
    var request = indexedDB.open(databaseName);
    request.onupgradeneeded = function (event) {
        let db = event.target.result;
        db.createObjectStore(shapesTableName);
        db.createObjectStore(textTableName, { keyPath: 'id'});
        console.log('** database created successfully **');
    }
    request.onsuccess = function (event) {
        console.log(`** database request successful, database exists **`);
    }

}
function list() {

}
function create(arrayOfObjects) {
    var request = indexedDB.open(databaseName);
    request.onsuccess = function (event) {
        let db = event.target.result;
        let transaction = db.transaction([shapesTableName], 'readwrite');

        let shapesStore = transaction.objectStore(shapesTableName);

        let i = 0;
        for (const shape of arrayOfObjects) {
            let obj = shape.getObject();
            console.log(obj);
            shapesStore.put(obj,shape.id);
            i++;
        }
        
        transaction.oncomplete = function (event) {
            db.close();
            console.log('** database updated successfully **');
        }
    }
}
function retrieve(id) {

}
function update(id, obj) {

}
function del(id) {

}

export {initialize, list, create,retrieve, update, del}