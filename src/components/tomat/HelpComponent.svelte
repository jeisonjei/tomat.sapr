<script>
  import { fade } from "svelte/transition";

    let td1Class='border border-slate-200 px-2 bg-slate-200 font-bold text-slate-600 w-1/4';
    let td2Class='border border-slate-200 px-2 w-3/4';
    export let hidden=false;

   
</script>

{#if !hidden}
<table transition:fade={{delay: 0, duration: 200}} class="table-fixed border-separate border-slate-200 text-sm">
    <tbody>
      <tr>
        <td class={td1Class}>SHIFT</td>
        <td class={td2Class}>Угловая привязка</td>
      </tr>
      <tr>
        <td class={td1Class}>F3</td>
        <td class={td2Class}>Включение и выключение магнитов</td>
      </tr>
      <tr>
        <td class={td1Class}>SHIFT + F</td>
        <td class={td2Class}>Включение и выключение магнитов</td>
      </tr>
      <tr>
        <td class={td1Class}>F1</td>
        <td class={td2Class}>Показать или скрыть область печати</td>
      </tr>
      <tr>
        <td class={td1Class}>S</td>
        <td class={td2Class}>Выбор</td>
      </tr>

      <tr>
        <td class={td1Class}>ESC</td>
        <td class={td2Class}>Отмена или выход из режима текста</td>
      </tr>

      <tr>
        <td class={td1Class}>SPACE</td>
        <td class={td2Class}>Панорамирование</td>
      </tr>
      <tr>
        <td class={td1Class}>Колесо</td>
        <td class={td2Class}>Зуммирование</td>
      </tr>
      <tr>
        <td class={td1Class}>L</td>
        <td class={td2Class}>Линия</td>
      </tr>
      <tr>
        <td class={td1Class}>ALT+L</td>
        <td class={td2Class}>Симметричная Линия</td>
      </tr>
      <tr>
        <td class={td1Class}>T</td>
        <td class={td2Class}>Текст</td>
      </tr>
      <tr>
        <td class="{td1Class}">X</td>
        <td class="{td2Class}">Редактирование текста</td>
      </tr>
      <tr>
        <td class="{td1Class}">Стрелка вверх/вниз</td>
        <td class="{td2Class}">Увеличить/уменьшить размер текста</td>
      </tr>
      <tr>
        <td class={td1Class}>ENTER</td>
        <td class={td2Class}>Перенос строки</td>
      </tr>

      <tr>
        <td class={td1Class}>K</td>
        <td class={td2Class}>Прямоугольник</td>
      </tr>
      <tr>
        <td class={td1Class}>Q</td>
        <td class={td2Class}>Квадрат</td>
      </tr>
      <tr>
        <td class={td1Class}>E</td>
        <td class={td2Class}> Круг</td>
      </tr>
      <tr>
        <td class={td1Class}>C</td>
        <td class={td2Class}>Копировать</td>
      </tr>
      <tr>
        <td class={td1Class}>M</td>
        <td class={td2Class}>Переместить</td>
      </tr>
      <tr>
        <td class={td1Class}>R</td>
        <td class={td2Class}>Поворот</td>
      </tr>
      <tr>
        <td class={td1Class}>ALT+R</td>
        <td class={td2Class}>Поворот с копированием</td>
      </tr>
      <tr>
        <td class={td1Class}>I</td>
        <td class={td2Class}>Зеркально отразить</td>
      </tr>
      <tr>
        <td class={td1Class}>W</td>
        <td class={td2Class}>Масштабировать</td>
      </tr>

      <tr>
        <td class={td1Class}>B</td>
        <td class={td2Class}>Разрыв линии или обрезка линии</td>
      </tr>
      <tr>
        <td class={td1Class}>CTRL</td>
        <td class={td2Class}>Альтернативный вариант редактирования фигур за ручки</td>
      </tr>
    </tbody>
  </table>
{/if}