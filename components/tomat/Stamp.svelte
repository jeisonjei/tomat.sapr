<script>
  import { afterUpdate, beforeUpdate, onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { s } from "../../shared/globalState/settings.mjs";

  import { createRxDatabase } from "rxdb";
  import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
  import { addRxPlugin } from "rxdb";
  import { RxDBDevModePlugin } from "rxdb/plugins/dev-mode";
  import { removeRxDatabase } from "rxdb";
  import { fromEvent } from "rxjs";
  import { ColdObservable } from "rxjs/internal/testing/ColdObservable";

  export let hidden;




  // --------- STAMP PROPERTIES ---------
  let разработал_имя, проверил_имя, нормо_контроль_имя, гип_имя, дата_значение, шифр_значение, адрес_значение, объект_значение, имя_листа_значение, номер_листа_значение, всего_листов_значение, компания_значение, кол_уч_значение, стадия_значение, изм_значение, изм_документ_значение, изм_лист_значение, дата1, дата2, дата3, дата4, 
  изм_номер, изм_колуч, изм_лист, изм_документ,
  стадия, лист, листов ;
  let разработал = "Разработал";
  let проверил = "Проверил";
  let нормо_контроль = "Нормо-контроль";
  let гип = "ГИП"

  
  стадия = "Стадия";
  лист = "Лист";
  листов = "Листов";
  изм_номер = "Изм.";
  изм_колуч = "Кол.уч.";
  изм_лист = "Лист";
  изм_документ = "№ док.";

  // --------- STAMP PROPERTIES ---------

  afterUpdate(function(){
    const modeElem = document.getElementById('mode');

    if(!hidden){
      modeElem.innerHTML = 'mode: none';
    }
    else{
      modeElem.innerHTML = 'mode: select';
    }
  });


  let myDatabase;

  onMount(function (params) {
    addRxPlugin(RxDBDevModePlugin);

    async function createDatabase() {
      removeRxDatabase('mydatabase', getRxStorageDexie());
      myDatabase = await createRxDatabase({
        name: 'mydatabase',
        storage: getRxStorageDexie(),
      });

      const stampSchema = {
        version: 0,
        primaryKey: 'id',
        type: 'object',
        properties: {
          id: {
            type: 'string',
            maxLength: 100,
          },
          designer: {
            type: 'string',
          },
          checker: {
            type: 'string',
          },
          norm_checker: {
            type: 'string',
          },
          gip: {
            type: 'string',
          },
          codeNumber:{
            type: 'string'
          },
          address:{
            type: 'string'
          },
          building:{
            type: 'string'
          },
          sheetName:{
            type: 'string'
          },
          sheetNumber:{
            type: 'string'
          },
          sheetsQty:{
            type: 'string'
          },
          company: {
            type: 'string'
          },
          date:{
            type: 'string'
          },
          isSubmitted: {
            type: 'boolean',
          },
        },
      };

      const myCollection = await myDatabase.addCollections({
        // коллекция - это то же, что и таблица в других базах данных
        stamps: {
          schema: stampSchema,
        },
      });

      const olderDocuments = await myCollection.stamps.find().exec();

      for (let i = 0; i < olderDocuments.length; i++) {
          const element = olderDocuments[i];
          element.remove();
      }

      s.myDatabase = myDatabase;
    }
    createDatabase();
  });

  async function saveStamp() {
    // document - это то же самое, что строка в таблице в других базах данных
    const myDocument = await myDatabase.stamps.insert({
      id: "stamp1",
      designer: разработал_имя,
      checker: проверил_имя,
      norm_checker: нормо_контроль_имя,
      gip: гип_имя,
      change_doc: изм_документ_значение,
      change_sheet: изм_лист_значение,
      change: изм_значение,
      date1: дата1,
      date2: дата2,
      date3: дата3,
      date4: дата4,
      qty_part: кол_уч_значение,
      project_code: шифр_значение,
      address: адрес_значение,
      building: объект_значение,
      sheetName: имя_листа_значение,
      sheetNumber: номер_листа_значение,
      sheets_qty: всего_листов_значение,
      project_stage: стадия_значение,
      company: компания_значение,


    });
    hidden = true;
  }


  function isCaretAtStart(input) {
    return (
      input.selectionStart == 0 && input.selectionStart == input.selectionEnd
    );
  }

  function isCaretAtEnd(input) {
    return (
      input.value.length == input.selectionEnd &&
      input.selectionEnd == input.selectionStart
    );
  }

  let nextIdRow = 0;
  let nextIdCol = 0;
  function getRowAndCol(event) {
    const idArray = event.target.id.split("-");
    const idRow = idArray[1];
    const idCol = idArray[2];
    return { idRow, idRow, idCol: idCol };
  }
  function updateCurrId(event) {
    const { idRow, idCol } = getRowAndCol(event);
    nextIdRow = Number.parseInt(idRow);
    nextIdCol = Number.parseInt(idCol);
  }
  function handleTextareaKeyup(event) {
    const { idRow, idCol } = getRowAndCol(event);

    if (event.key === "ArrowUp") {
      nextIdRow = Number.parseInt(idRow) - 1;
      if (idRow === "1") {
        nextIdRow = 1;
      }
    } else if (event.key === "ArrowDown") {
      nextIdRow = Number.parseInt(idRow) + 1;
      if (idRow === "11") {
        nextIdRow = 11;
      }
    } else if (event.key === "ArrowLeft" && isCaretAtStart(event.target)) {
      nextIdCol = Number.parseInt(idCol) - 1;
      if (idCol === "1") {
        nextIdCol = 1;
      }
    } else if (event.key === "ArrowRight" && isCaretAtEnd(event.target)) {
      nextIdCol = Number.parseInt(idCol) + 1;
      if (idCol === "78910") {
        nextIdCol = 78910;
      } else if (idCol === "8910") {
        nextIdCol = 8910;
      } else if (idCol === "10") {
        nextIdCol = 10;
      }
    } else {
      return;
    }

    if (nextIdCol === 7) {
      if (["1", "2"].includes(idRow)) {
        nextIdRow = 12;
        nextIdCol = 78910;
      } else if (["3", "4", "5"].includes(idRow)) {
        nextIdRow = 345;
        nextIdCol = 78910;
      } else if (["6", "7", "8"].includes(idRow)) {
        nextIdRow = 678;
        nextIdCol = 7;
      } else if (["9", "10", "11"].includes(idRow)) {
        nextIdRow = 91011;
        nextIdCol = 7;
      } else if (["78"].includes(idRow)) {
        nextIdRow = 678;
        nextIdCol = 7;
      }
    } else if (nextIdCol === 8) {
      if (["678"].includes(idRow)) {
        nextIdRow = 6;
        nextIdCol = 8;
      } else if (["91011"].includes(idRow)) {
        nextIdRow = 91011;
        nextIdCol = 8910;
      }
    } else if (nextIdCol === 78909 && idRow === "12") {
      nextIdRow = 1;
      nextIdCol = 6;
    } else if (nextIdCol === 78909 && idRow === "345") {
      nextIdRow = 3;
      nextIdCol = 6;
    } else if (nextIdCol === 6 && idRow === "678") {
      nextIdRow = 6;
      nextIdCol = 6;
    } else if (nextIdCol === 6 && idRow === "91011") {
      nextIdRow = 9;
      nextIdCol = 6;
    } else if (nextIdCol === 8909) {
      nextIdRow = 91011;
      nextIdCol = 7;
    } else if (nextIdCol === 13) {
      nextIdCol = 34;
    } else if (nextIdCol === 33) {
      nextIdCol = 12;
    } else if (nextIdCol === 35) {
      nextIdCol = 5;
    } else if (nextIdCol === 4) {
      if (["6", "7", "8", "9", "10", "11"].includes(idRow)) {
        nextIdCol = 34;
      }
    } else if (nextIdCol === 11) {
      nextIdCol = 12;
    }

    let newId = "cell" + "-" + nextIdRow + "-" + nextIdCol;

    if (newId === "cell-6-1" || newId === "cell-6-2") {
      newId = "cell-6-12";
    } else if (newId === "cell-5-12") {
      newId = "cell-5-1";
    } else if (newId === "cell-6-3" || newId === "cell-6-4") {
      newId = "cell-6-34";
    } else if (newId === "cell-5-34") {
      newId = "cell-5-3";
    }
    // вниз
    else if (newId === "cell-13-78910") {
      newId = "cell-345-78910";
    } else if (newId === "cell-346-78910") {
      newId = "cell-678-7";
    } else if (newId === "cell-679-7") {
      newId = "cell-91011-7";
    }
    // а теперь наверх
    else if (newId === "cell-91010-7") {
      newId = "cell-678-7";
    } else if (newId === "cell-677-7") {
      newId = "cell-345-78910";
    } else if (newId === "cell-344-78910") {
      newId = "cell-12-78910";
    }

    // ---
    else if (newId === "cell-5-8") {
      newId = "cell-345-78910";
    } else if (newId === "cell-5-9") {
      newId = "cell-345-78910";
    } else if (newId === "cell-5-10") {
      newId = "cell-345-78910";
    } else if (newId === "cell-7-8") {
      newId = "cell-78-8";
    } else if (newId === "cell-7-9") {
      newId = "cell-78-9";
    } else if (newId === "cell-7-10") {
      newId = "cell-78-10";
    } else if (newId === "cell-77-8") {
      newId = "cell-6-8";
    } else if (newId === "cell-77-9") {
      newId = "cell-6-9";
    } else if (newId === "cell-77-10") {
      newId = "cell-6-10";
    } else if (newId === "cell-79-8") {
      newId = "cell-91011-8910";
    } else if (newId === "cell-79-9") {
      newId = "cell-91011-8910";
    } else if (newId === "cell-79-10") {
      newId = "cell-91011-8910";
    } else if (newId === "cell-91010-8910") {
      newId = "cell-78-8";
    }

    const newTextarea = document.getElementById(newId);
    newTextarea.focus();
    if (newId !== event.target.id) {
      newTextarea.select();
    }
  }
</script>

{#if !hidden}
  <div
    transition:fade={{ delay: 0, duration: 200 }}
    class="dialog-center rounded"
  >
    <div class="m-flex m-justify-end">
      <button on:click={() => (hidden = true)}>
        <svg
          class="h-6 w-6 text-slate-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" /></svg
        >
      </button>
    </div>
    <h1>Заполнение основной надписи</h1>
    <table class="iksweb">
      <tbody>
        <tr>
          <td class="cell-1-1">
            <textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              type="text"
              name=""
              id="cell-1-1"
            /></td
          >
          <td class="cell-1-2">
            <textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              type="text"
              name=""
              id="cell-1-2"
            /></td
          >
          <td class="cell-1-3"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              type="text"
              name=""
              id="cell-1-3"
            /></td
          >
          <td class="cell-1-4"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              type="text"
              name=""
              id="cell-1-4"
            /></td
          >
          <td class="cell-1-5"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              type="text"
              name=""
              id="cell-1-5"
            /></td
          >
          <td class="cell-1-6"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              type="text"
              name=""
              id="cell-1-6"
            /></td
          >
          <td class="cell-12-78910" colspan="4" rowspan="2"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              bind:value={шифр_значение}
              type="text"
              name=""
              id="cell-12-78910"
            /></td
          >
        </tr>
        <tr>
          <td class="cell-2-1"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              type="text"
              name=""
              id="cell-2-1"
            /></td
          >
          <td class="cell-2-2"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              type="text"
              name=""
              id="cell-2-2"
            /></td
          >
          <td class="cell-2-3"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              type="text"
              name=""
              id="cell-2-3"
            /></td
          >
          <td class="cell-2-4"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              type="text"
              name=""
              id="cell-2-4"
            /></td
          >
          <td class="cell-2-5"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              type="text"
              name=""
              id="cell-2-5"
            /></td
          >
          <td class="cell-2-6"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              type="text"
              name=""
              id="cell-2-6"
            /></td
          >
        </tr>
        <tr>
          <td class="cell-3-1"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              type="text"
              name=""
              id="cell-3-1"
            /></td
          >
          <td class="cell-3-2"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              type="text"
              name=""
              id="cell-3-2"
            /></td
          >
          <td class="cell-3-3"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              type="text"
              name=""
              id="cell-3-3"
            /></td
          >
          <td class="cell-3-4"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              type="text"
              name=""
              id="cell-3-4"
            /></td
          >
          <td class="cell-3-5"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              type="text"
              name=""
              id="cell-3-5"
            /></td
          >
          <td class="cell-3-6"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              type="text"
              name=""
              id="cell-3-6"
            /></td
          >
          <td class="cell-345-78910" colspan="4" rowspan="3"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              bind:value={адрес_значение}
              type="text"
              name=""
              id="cell-345-78910"
            /></td
          >
        </tr>
        <tr>
          <td class="cell-4-1"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              bind:value={изм_значение}
              type="text"
              name=""
              id="cell-4-1"
            /></td
          >
          <td class="cell-4-2"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              bind:value={кол_уч_значение}
              type="text"
              name=""
              id="cell-4-2"
            /></td
          >
          <td class="cell-4-3"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              bind:value={изм_лист_значение}
              type="text"
              name=""
              id="cell-4-3"
            /></td
          >
          <td class="cell-4-4"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              bind:value={изм_документ_значение}
              type="text"
              name=""
              id="cell-4-4"
            /></td
          >
          <td class="cell-4-5"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              type="text"
              name=""
              id="cell-4-5"
            /></td
          >
          <td class="cell-4-6"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              type="text"
              name=""
              id="cell-4-6"
            /></td
          >
        </tr>
        <tr>
          <td class="cell-5-1"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              bind:value={изм_номер}
              type="text"
              name=""
              id="cell-5-1"
            /></td
          >
          <td class="cell-5-2"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              bind:value={изм_колуч}
              type="text"
              name=""
              id="cell-5-2"
            /></td
          >
          <td class="cell-5-3"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              bind:value={изм_лист}
              type="text"
              name=""
              id="cell-5-3"
            /></td
          >
          <td class="cell-5-4"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              bind:value={изм_документ}
              type="text"
              name=""
              id="cell-5-4"
            /></td
          >
          <td class="cell-5-5"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              type="text"
              name=""
              id="cell-5-5"
            /></td
          >
          <td class="cell-5-6"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              type="text"
              name=""
              id="cell-5-6"
            /></td
          >
        </tr>
        <tr>
          <td class="cell-6-12" colspan="2"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              type="text"
              name=""
              id="cell-6-12"
              bind:value={разработал}
            /></td
          >
          <td class="cell-6-34" colspan="2"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              type="text"
              name=""
              id="cell-6-34"
              bind:value={разработал_имя}
            /></td
          >
          <td class="cell-6-5"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              type="text"
              name=""
              id="cell-6-5"
            /></td
          >
          <td class="cell-6-6"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              bind:value={дата1}
              type="text"
              name=""
              id="cell-6-6"
            /></td
          >
          <td class="cell-678-7" rowspan="3"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              bind:value={объект_значение}
              type="text"
              name=""
              id="cell-678-7"
            /></td
          >
          <td class="cell-6-8"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              bind:value={стадия}
              type="text"
              name=""
              id="cell-6-8"
            /></td
          >
          <td class="cell-6-9"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              bind:value={лист}
              type="text"
              name=""
              id="cell-6-9"
            /></td
          >
          <td class="cell-6-10"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              bind:value={листов}
              type="text"
              name=""
              id="cell-6-10"
            /></td
          >
        </tr>
        <tr>
          <td class="cell-7-12" colspan="2"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              type="text"
              name=""
              id="cell-7-12"
              bind:value={проверил}
            /></td
          >
          <td class="cell-7-34" colspan="2"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              type="text"
              name=""
              id="cell-7-34"
              bind:value={проверил_имя}
            /></td
          >
          <td class="cell-7-5"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              type="text"
              name=""
              id="cell-7-5"
            /></td
          >
          <td class="cell-7-6"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              bind:value={дата2}
              type="text"
              name=""
              id="cell-7-6"
            /></td
          >
          <td class="cell-78-8" rowspan="2"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              bind:value={стадия_значение}
              type="text"
              name=""
              id="cell-78-8"
            /></td
          >
          <td class="cell-78-9" rowspan="2"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              bind:value={номер_листа_значение}
              type="text"
              name=""
              id="cell-78-9"
            /></td
          >
          <td class="cell-78-10" rowspan="2"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              bind:value={всего_листов_значение}
              type="text"
              name=""
              id="cell-78-10"
            /></td
          >
        </tr>
        <tr>
          <td class="cell-8-12" colspan="2"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              type="text"
              name=""
              id="cell-8-12"
              bind:value={нормо_контроль}
            /></td
          >
          <td class="cell-8-34" colspan="2"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              type="text"
              name=""
              id="cell-8-34"
              bind:value={нормо_контроль_имя}
            /></td
          >
          <td class="cell-8-5"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              type="text"
              name=""
              id="cell-8-5"
            /></td
          >
          <td class="cell-8-6"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              bind:value={дата3}
              type="text"
              name=""
              id="cell-8-6"
            /></td
          >
        </tr>
        <tr>
          <td class="cell-9-12" colspan="2"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              type="text"
              name=""
              id="cell-9-12"
              bind:value={гип}
            /></td
          >
          <td class="cell-9-34" colspan="2"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              type="text"
              name=""
              id="cell-9-34"
              bind:value={гип_имя}
            /></td
          >
          <td class="cell-9-5"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              type="text"
              name=""
              id="cell-9-5"
            /></td
          >
          <td class="cell-9-6"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              bind:value={дата4}
              type="text"
              name=""
              id="cell-9-6"
            /></td
          >
          <td class="cell-91011-7" rowspan="3" style="width: 90px;"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              bind:value={имя_листа_значение}
              type="text"
              name=""
              id="cell-91011-7"
            /></td
          >
          <td class="cell-91011-8910" colspan="3" rowspan="3"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              bind:value={компания_значение}
              type="text"
              name=""
              id="cell-91011-8910"
            /></td
          >
        </tr>
        <tr>
          <td class="cell-10-12" colspan="2"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              type="text"
              name=""
              id="cell-10-12"
            /></td
          >
          <td class="cell-10-34" colspan="2"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              type="text"
              name=""
              id="cell-10-34"
            /></td
          >
          <td class="cell-10-5"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              type="text"
              name=""
              id="cell-10-5"
            /></td
          >
          <td class="cell-10-6"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              type="text"
              name=""
              id="cell-10-6"
            /></td
          >
        </tr>
        <tr>
          <td class="cell-11-12" colspan="2"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              type="text"
              name=""
              id="cell-11-12"
            /></td
          >
          <td class="cell-11-34" colspan="2"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              type="text"
              name=""
              id="cell-11-34"
            /></td
          >
          <td class="cell-11-5"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              type="text"
              name=""
              id="cell-11-5"
            /></td
          >
          <td class="cell-11-6"
            ><textarea
              on:keyup={handleTextareaKeyup}
              on:focus={updateCurrId}
              type="text"
              name=""
              id="cell-11-6"
            /></td
          >
        </tr>
      </tbody>
    </table>
    <div class="m-flex m-justify-end">
      <span class="small-hint"
        >Клавиши Home и End - перемещение в начало и в конец строки, стрелки -
        перемещение по таблице</span
      >
    </div>
    <div>
      <button class="m-btn-accept m-mb-1" on:click={saveStamp}>Сохранить</button>
      <button class="m-btn-cancel m-mb-1" on:click={()=>hidden=true}>Отмена</button>
    </div>
  </div>
{/if}

<style>
  .dialog-center {
    border: 1px solid slategray;
    position: absolute;
    z-index: 20;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 1rem;
    width: 75%;
    background-color: white;
  }
  textarea {
    position: absolute;
    border: 1px solid slategray;
    padding-left: 5px;
    padding-right: 5px;
    width: 100%;
    height: 100%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  table.iksweb {
    width: 100%;
    border-collapse: collapse;
    border-spacing: 0;
    height: auto;
    table-layout: auto;
  }
  table.iksweb,
  table.iksweb td {
    position: relative;
    border: 1px solid #595959;
  }
  table.iksweb td {
    padding: 3px;
    width: 30px;
    height: 35px;
  }

  h1 {
    font-size: xx-large;
    font-weight: bold;
    text-align: center;
    color: rgb(90, 90, 90);
  }
</style>
