<script>
  import { beforeUpdate, onMount } from "svelte";
  import HelpComponent from "./components/tomat/HelpComponent.svelte";
  import Stamp from "./components/tomat/Stamp.svelte";
  import { a } from "../shared/globalState/a";
  import { a as b } from "../libs/canvas-text/src/shared/state";
  import { fontSize$ } from "../libs/canvas-text/src/shared/state";
  import { functionCalled$ } from "../libs/canvas-text/src/index";
  import { textLinesCollection } from "../libs/canvas-text/src/shared/state";
  import {
    initialize as dbInitialize,
    create as dbCreate,
    clear as dbClear,
  } from "../services/database";
  import { rerender } from "../libs/canvas-text/src";
  import { cnv } from "../libs/canvas-text/src/shared/cnv";
  import Save from "./components/tomat/icons/SaveIcon.svelte";
  import SaveIcon from "./components/tomat/icons/SaveIcon.svelte";
  import TextIcon from "./components/tomat/icons/TextIcon.svelte";
  import FontSizeUpIcon from "./components/tomat/icons/FontSizeUpIcon.svelte";
  import FontSizeDownIcon from "./components/tomat/icons/FontSizeDownIcon.svelte";
  import LineIcon from "./components/tomat/icons/LineIcon.svelte";
  import RectangleIcon from "./components/tomat/icons/RectangleIcon.svelte";
  import CircleIcon from "./components/tomat/icons/CircleIcon.svelte";
  import SelectIcon from "./components/tomat/icons/SelectIcon.svelte";
  import DeleteIcon from "./components/tomat/icons/DeleteIcon.svelte";
  import MoveIcon from "./components/tomat/icons/MoveIcon.svelte";
  import CopyIcon from "./components/tomat/icons/CopyIcon.svelte";
  import RotateIcon from "./components/tomat/icons/RotateIcon.svelte";
  import MirrorIcon from "./components/tomat/icons/MirrorIcon.svelte";
  import ScaleIcon from "./components/tomat/icons/ScaleIcon.svelte";
  import BreakIcon from "./components/tomat/icons/BreakIcon.svelte";
  import SaveDxfIcon from "./components/tomat/icons/SaveDxfIcon.svelte";
  import StampIcon from "./components/tomat/icons/StampIcon.svelte";
  import SavePdfIcon from "./components/tomat/icons/SavePdfIcon.svelte";
  import HelpIcon from "./components/tomat/icons/HelpIcon.svelte";

  let color = "blue";
  let toolButtonClass =
    "p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold mx-0.5";
  let toolIconClass = "h-6 w-6 text-slate-500";
  let helpHidden = false;
  let stampHidden = true;
  let curFontSize = null;
  let isStampVisible = true;

  $: if (isStampVisible) {
    a.isStampVisible = isStampVisible;
  }
  $: if (!isStampVisible) {
    a.isStampVisible = isStampVisible;
  }

  onMount(async function () {
    curFontSize = b.initFontSize;

    if (localStorage.helpHidden) {
      helpHidden = /true/.test(localStorage.helpHidden) ? true : false;
    }

    (await import("../libs/canvas-text/src/shared/state")).fontSize$.subscribe(
      (fontSize) => {
        curFontSize = fontSize;
      },
    );
  });

  function saveShapes() {
    dbClear();
    dbCreate(a.shapes);
    dbCreate(textLinesCollection);
    localStorage.setItem("zlc", a.zlc);
  }

  function changeFontSize(event) {
    var fontSize = event.target.value;
    textLinesCollection
      .filter((t) => t.selected)
      .forEach((t) => {
        t.fontSize = fontSize;
      });
    b.curTextLine.fontSize = fontSize;
    functionCalled$.next({
      self: "setFont",
    });
  }
</script>

<Stamp bind:hidden={stampHidden}></Stamp>
<div class="row">
  <div class="flex-row jcc">
    <div>
      <div class="tools z-50 w-100">
        <div class="flex-row flex-wrap jcc">
          <div>
            <button
              title="Сохранить чертёж"
              tabindex="-1"
              id="save"
              class={toolButtonClass}
              on:click={saveShapes}
            >
              <SaveIcon meclass={toolIconClass}></SaveIcon>
            </button>
          </div>
          <div>
            <button
              tabindex="-1"
              id="text"
              class={toolButtonClass}
              title="Режим текста"
            >
              <TextIcon meclass={toolIconClass}></TextIcon>
            </button>
          </div>
          <div class="flex-row align-center">
            <input
              type="text"
              name="font-size"
              id="font-size-field"
              class="w-50px"
              placeholder="60"
              on:input={changeFontSize}
              value={curFontSize}
            />
            <!-- <button class={toolButtonClass} id="font-size-up" title="Увеличить шрифт">
              <FontSizeUpIcon meclass={toolIconClass}></FontSizeUpIcon>
            </button>
            <button id="font-size-down" class={toolButtonClass} title="Уменьшить шрифт">
              <FontSizeDownIcon meclass={toolIconClass}></FontSizeDownIcon>
            </button> -->
          </div>

          <div>
            <button
              tabindex="-1"
              id="line"
              class={toolButtonClass}
              title="Линия"
            >
              <LineIcon meclass={toolIconClass}></LineIcon>
            </button>
          </div>
          <div>
            <button
              tabindex="-1"
              id="rectangle"
              class={toolButtonClass}
              title="Прямоугольник"
            >
              <RectangleIcon meclass={toolIconClass}></RectangleIcon>
            </button>
          </div>
          <div>
            <button
              tabindex="-1"
              id="circle"
              class={toolButtonClass}
              title="Круг"
            >
              <CircleIcon meclass={toolIconClass}></CircleIcon>
            </button>
          </div>

          <div>
            <button
              tabindex="-1"
              id="select"
              class={toolButtonClass}
              title="Выбор элементов"
            >
              <SelectIcon meclass={toolIconClass}></SelectIcon>
            </button>
          </div>
          <div>
            <button
              tabindex="-1"
              id="delete"
              class={toolButtonClass}
              title="Удаление элементов"
            >
              <DeleteIcon meclass={toolIconClass}></DeleteIcon>
            </button>
          </div>

          <div>
            <button
              tabindex="-1"
              id="move"
              class={toolButtonClass}
              title="Перемещение"
            >
              <MoveIcon meclass={toolIconClass}></MoveIcon>
            </button>
          </div>
          <div>
            <button
              tabindex="-1"
              id="copy"
              class={toolButtonClass}
              title="Копирование"
            >
              <CopyIcon meclass={toolIconClass}></CopyIcon>
            </button>
          </div>
          <div>
            <button
              tabindex="-1"
              id="rotate"
              class={toolButtonClass}
              title="Поворот"
            >
              <RotateIcon meclass={toolIconClass}></RotateIcon>
            </button>
          </div>
          <div>
            <button
              tabindex="-1"
              id="mirror"
              class={toolButtonClass}
              title="Зеркальное отображение"
            >
              <MirrorIcon meclass={toolIconClass}></MirrorIcon>
            </button>
          </div>
          <div>
            <button
              tabindex="-1"
              id="scale"
              class={toolButtonClass}
              title="Масштабировать"
            >
              <ScaleIcon meclass={toolIconClass}></ScaleIcon>
            </button>
          </div>
          <button
            tabindex="-1"
            id="break"
            class={toolButtonClass}
            title="Обрезать или разорвать линию"
          >
            <BreakIcon meclass={toolIconClass}></BreakIcon>
          </button>

          <div>
            <button
              tabindex="-1"
              id="saveDxf"
              class={toolButtonClass}
              title="Экпорт в DXF"
            >
              <SaveDxfIcon meclass={toolIconClass}></SaveDxfIcon>
            </button>
          </div>
          <div>
            <button
              title="Рамка с основной надписью"
              tabindex="-1"
              id="stamp"
              class={toolButtonClass}
              on:click={() => (stampHidden = !stampHidden)}
            >
              <StampIcon meclass={toolIconClass}></StampIcon>
            </button>
          </div>
          <div>
            <button
              tabindex="-1"
              id="savePdf"
              class={toolButtonClass}
              title="Экспорт в PDF"
            >
              <SavePdfIcon meclass={toolIconClass}></SavePdfIcon>
            </button>
          </div>
          <div class="flex-row align-center">
            <input
              type="checkbox"
              tabindex="-1"
              name="is-stamp-visible"
              id="is-stamp-visible"
              bind:checked={isStampVisible}
              class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 mx-1"
            />
            <label for="output">Рамка</label>
          </div>
          <div>
            <select tabindex="-1" name="" id="format" class={toolButtonClass}>
              <option value="A4">A4</option>
              <option value="A3">A3</option>
              <option value="A2">A2</option>
              <option value="A1">A1</option>
            </select>
          </div>

          <div class="flex">
            <div class="flex items-center mx-1">
              <input
                type="checkbox"
                tabindex="-1"
                name="angleSnap"
                id="angleSnap"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 mx-1"
                on:change={() => {
                  a.angle_snap = !a.angle_snap;
                }}
              />
              <label for="angleSnap">Угл.</label>
            </div>
            <div class="flex-row align-center">
              <input
                type="checkbox"
                tabindex="-1"
                name="magnets"
                id="magnets"
                checked="true"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 mx-1"
              />
              <label for="magnets">Маг.</label>
            </div>

            <div class="flex-row align-center">
              <input
                type="checkbox"
                tabindex="-1"
                name="ctrl"
                id="ctrl"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 mx-1"
              />
              <label for="ctrl">Мод.</label>
            </div>
          </div>
          <div class="m-flex align-center m-justify-end m-mx-2 w-60">
            <div>
              <a class="link" href="/about.html" target="_blank">О программе</a>
            </div>
          </div>
        </div>
      </div>
      <div id="info" class="absolute-div z-20 w-1/4">
        <div>
          <button
            tabindex="-1"
            on:click={() => {
              helpHidden = !helpHidden;
              localStorage.helpHidden = helpHidden;
            }}
          >
            <HelpIcon meclass={toolIconClass}></HelpIcon>
          </button>
          <HelpComponent hidden={helpHidden}></HelpComponent>
        </div>
        <div style="margin-left: 4px; display: flex; flex-direction:column">
          <p id="mode"></p>
          <p id="tool"></p>
          <p id="cursor"></p>
          <p id="real-scale"></p>
          <p id="message1"></p>
          <p id="message2"></p>
          <p id="message3"></p>
          <p id="error"></p>
        </div>
      </div>
    </div>
  </div>
  <canvas class="drawing"></canvas>
  <canvas class="text"></canvas>
</div>
