import { a } from "../shared/globalState/a";

const databaseName = 'tomatDatabase';
const shapesTableName = 'shapesTable';
const textTableName = 'textTable';

function initialize() {
    var request = indexedDB.open(databaseName);
    request.onerror = console.error;
    request.onupgradeneeded = function (event) {
        let db = event.target.result;
        db.createObjectStore(shapesTableName);
        db.createObjectStore(textTableName);
        console.log('** database created successfully **');
    }
    request.onsuccess = function (event) {
        console.log(`** database request successful, database exists **`);
    }

}
function list() {
    var request = indexedDB.open(databaseName);
    request.onerror = console.error;
    request.onsuccess = function (event) {
        let db = event.target.result;
        let transaction = db.transaction([shapesTableName, textTableName],'readonly');
        let shapesStore = transaction.objectStore(shapesTableName);
        let textStore  = transaction.objectStore(textTableName);
        let shapes = shapesStore.getAll();
        let text = textStore.getAll();
        shapes.onerror = console.error;
        shapes.onsuccess = function (event) {
            let shapes = event.target.result;
            a.storedShapes$.next(shapes);
            db.close();
        }
        text.onsuccess = function (event) {
            let text = event.target.result;
            a.storedText$.next(text);
            db.close();
        }
    }

}
function create(arrayOfObjects) {
    var request = indexedDB.open(databaseName);
    request.onerror = console.error;
    request.onsuccess = function (event) {
        let db = event.target.result;
        let transaction = db.transaction([shapesTableName, textTableName], 'readwrite');

        let shapesStore = transaction.objectStore(shapesTableName);
        let textStore  = transaction.objectStore(textTableName);

        for (const shape of arrayOfObjects) {
            let obj = shape.getObject();
            console.log(obj);
            if (shape.type !== 'text') {
                shapesStore.put(obj,`${shape.type}_${shape.id}`);
                
            }
            else {
                textStore.put(obj, `${shape.type}_${shape.id}`);
            }
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
function clear() {
    var request = indexedDB.open(databaseName);
    request.onerror = console.error;
    request.onsuccess = function (event) {
        let db = event.target.result;
        let transaction = db.transaction([shapesTableName, textTableName],'readwrite');
        let shapesStore = transaction.objectStore(shapesTableName);
        let textStore  = transaction.objectStore(textTableName);
        shapesStore.clear();
        textStore.clear();
        transaction.oncomplete = function (event) {
            db.close();
            console.log('** database cleared successfully **');
        }
    }
}

export {initialize, list, create,retrieve, update, del, clear}