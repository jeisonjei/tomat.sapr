<script>
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";
    import {s} from '../../shared/settings.mjs'

    export let hidden;
    let inp1Value;

    let разработал = "Разработал";
    let проверил = "Проверил";
    let нормо_контроль = "Нормо-контроль";
    let гип = "ГИП";
    let разработал_имя, проверил_имя, нормо_контроль_имя, гип_имя;

    onMount(function (params) {
        
    });

    function saveStamp(){
        console.log("разработал_имя",разработал_имя,"проверил_имя",проверил_имя,"нормо_контроль_имя",нормо_контроль_имя,"гип_имя",гип_имя);
        s.разработал_имя = разработал_имя;
        s.проверил_имя = проверил_имя;
        s.нормо_контроль_имя = нормо_контроль_имя;
        s.гип_имя = гип_имя;
    }
</script>

{#if !hidden}
    <div
        transition:fade={{ delay: 0, duration: 200 }}
        class="dialog-center rounded"
    >
    <div class="m-flex m-justify-end">
        <button on:click={()=>hidden=true}>
            <svg class="h-6 w-6 text-slate-500"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round">  <circle cx="12" cy="12" r="10" />  <line x1="15" y1="9" x2="9" y2="15" />  <line x1="9" y1="9" x2="15" y2="15" /></svg>
        </button>
    </div>
        <h1>Заполнение основной надписи</h1>
        <div class="m-alert"><p>ВНИМАНИЕ! Функция в разработке, заполнение этой формы ни к чему не приведёт</p></div>
        <table class="iksweb">
            <tbody>
                <tr>
                    <td class="cell-1-1"
                        ><textarea type="text" name="" id="cell-1-1" /></td
                    >
                    <td class="cell-1-2"
                        ><textarea type="text" name="" id="cell-1-2" /></td
                    >
                    <td class="cell-1-3"
                        ><textarea type="text" name="" id="cell-1-3" /></td
                    >
                    <td class="cell-1-4"
                        ><textarea type="text" name="" id="cell-1-4" /></td
                    >
                    <td class="cell-1-5"
                        ><textarea type="text" name="" id="cell-1-5" /></td
                    >
                    <td class="cell-1-6"
                        ><textarea type="text" name="" id="cell-1-6" /></td
                    >
                    <td class="cell-12-78910" colspan="4" rowspan="2"
                        ><textarea type="text" name="" id="cell-12-78910" /></td
                    >
                </tr>
                <tr>
                    <td class="cell-2-1"
                        ><textarea type="text" name="" id="cell-2-1" /></td
                    >
                    <td class="cell-2-2"
                        ><textarea type="text" name="" id="cell-2-2" /></td
                    >
                    <td class="cell-2-3"
                        ><textarea type="text" name="" id="cell-2-3" /></td
                    >
                    <td class="cell-2-4"
                        ><textarea type="text" name="" id="cell-2-4" /></td
                    >
                    <td class="cell-2-5"
                        ><textarea type="text" name="" id="cell-2-5" /></td
                    >
                    <td class="cell-2-6"
                        ><textarea type="text" name="" id="cell-2-6" /></td
                    >
                </tr>
                <tr>
                    <td class="cell-3-1"
                        ><textarea type="text" name="" id="cell-3-1" /></td
                    >
                    <td class="cell-3-2"
                        ><textarea type="text" name="" id="cell-3-2" /></td
                    >
                    <td class="cell-3-3"
                        ><textarea type="text" name="" id="cell-3-3" /></td
                    >
                    <td class="cell-3-4"
                        ><textarea type="text" name="" id="cell-3-4" /></td
                    >
                    <td class="cell-3-5"
                        ><textarea type="text" name="" id="cell-3-5" /></td
                    >
                    <td class="cell-3-6"
                        ><textarea type="text" name="" id="cell-3-6" /></td
                    >
                    <td class="cell-345-78910" colspan="4" rowspan="3"
                        ><textarea type="text" name="" id="cell-345-78910" /></td
                    >
                </tr>
                <tr>
                    <td class="cell-4-1"
                        ><textarea type="text" name="" id="cell-4-1" /></td
                    >
                    <td class="cell-4-2"
                        ><textarea type="text" name="" id="cell-4-2" /></td
                    >
                    <td class="cell-4-3"
                        ><textarea type="text" name="" id="cell-4-3" /></td
                    >
                    <td class="cell-4-4"
                        ><textarea type="text" name="" id="cell-4-4" /></td
                    >
                    <td class="cell-4-5"
                        ><textarea type="text" name="" id="cell-4-5" /></td
                    >
                    <td class="cell-4-6"
                        ><textarea type="text" name="" id="cell-4-6" /></td
                    >
                </tr>
                <tr>
                    <td class="cell-5-1"
                        ><textarea type="text" name="" id="cell-5-1" /></td
                    >
                    <td class="cell-5-2"
                        ><textarea type="text" name="" id="cell-5-2" /></td
                    >
                    <td class="cell-5-3"
                        ><textarea type="text" name="" id="cell-5-3" /></td
                    >
                    <td class="cell-5-4"
                        ><textarea type="text" name="" id="cell-5-4" /></td
                    >
                    <td class="cell-5-5"
                        ><textarea type="text" name="" id="cell-5-5" /></td
                    >
                    <td class="cell-5-6"
                        ><textarea type="text" name="" id="cell-5-6" /></td
                    >
                </tr>
                <tr>
                    <td class="cell-6-12" colspan="2"
                        ><textarea type="text" name="" id="cell-6-12" bind:value={разработал}/></td
                    >
                    <td class="cell-6-34" colspan="2"
                        ><textarea type="text" name="" id="cell-6-34" bind:value={разработал_имя}/></td
                    >
                    <td class="cell-6-5"
                        ><textarea type="text" name="" id="cell-6-5" /></td
                    >
                    <td class="cell-6-6"
                        ><textarea type="text" name="" id="cell-6-6" /></td
                    >
                    <td class="cell-678-7" rowspan="3"
                        ><textarea type="text" name="" id="cell-678-7" /></td
                    >
                    <td class="cell-6-8"
                        ><textarea type="text" name="" id="cell-6-8" /></td
                    >
                    <td class="cell-6-9"
                        ><textarea type="text" name="" id="cell-6-9" /></td
                    >
                    <td class="cell-6-10"
                        ><textarea type="text" name="" id="cell-6-10" /></td
                    >
                </tr>
                <tr>
                    <td class="cell-7-12" colspan="2"
                        ><textarea type="text" name="" id="cell-7-12" bind:value={проверил}/></td
                    >
                    <td class="cell-7-34" colspan="2"
                        ><textarea type="text" name="" id="cell-7-34" bind:value={проверил_имя}/></td
                    >
                    <td class="cell-7-5"
                        ><textarea type="text" name="" id="cell-7-5" /></td
                    >
                    <td class="cell-7-6"
                        ><textarea type="text" name="" id="cell-7-6" /></td
                    >
                    <td class="cell-78-8" rowspan="2"
                        ><textarea type="text" name="" id="cell-78-8" /></td
                    >
                    <td class="cell-78-9" rowspan="2"
                        ><textarea type="text" name="" id="cell-78-9" /></td
                    >
                    <td class="cell-78-10" rowspan="2"
                        ><textarea type="text" name="" id="cell-78-10" /></td
                    >
                </tr>
                <tr>
                    <td class="cell-8-12" colspan="2"
                        ><textarea type="text" name="" id="cell-8-12" bind:value={нормо_контроль}/></td
                    >
                    <td class="cell-8-34" colspan="2"
                        ><textarea type="text" name="" id="cell-8-34" bind:value={нормо_контроль_имя}/></td
                    >
                    <td class="cell-8-5"
                        ><textarea type="text" name="" id="cell-8-5" /></td
                    >
                    <td class="cell-8-6"
                        ><textarea type="text" name="" id="cell-8-6" /></td
                    >
                </tr>
                <tr>
                    <td class="cell-9-12" colspan="2"
                        ><textarea type="text" name="" id="cell-9-12" bind:value={гип}/></td
                    >
                    <td class="cell-9-34" colspan="2"
                        ><textarea type="text" name="" id="cell-9-34" bind:value={гип_имя}/></td
                    >
                    <td class="cell-9-5"
                        ><textarea type="text" name="" id="cell-9-5" /></td
                    >
                    <td class="cell-9-6"
                        ><textarea type="text" name="" id="cell-9-6" /></td
                    >
                    <td class="cell-91011-7" rowspan="3"
                        ><textarea type="text" name="" id="cell-91011-7" /></td
                    >
                    <td class="cell-91011-8910" colspan="3" rowspan="3"
                        ><textarea type="text" name="" id="cell-91011-8910" /></td
                    >
                </tr>
                <tr>
                    <td class="cell-10-12" colspan="2"
                        ><textarea type="text" name="" id="cell-10-12" /></td
                    >
                    <td class="cell-10-34" colspan="2"
                        ><textarea type="text" name="" id="cell-10-34" /></td
                    >
                    <td class="cell-10-5"
                        ><textarea type="text" name="" id="cell-10-5" /></td
                    >
                    <td class="cell-10-6"
                        ><textarea type="text" name="" id="cell-10-6" /></td
                    >
                </tr>
                <tr>
                    <td class="cell-11-12" colspan="2"
                        ><textarea type="text" name="" id="cell-11-12" /></td
                    >
                    <td class="cell-11-34" colspan="2"
                        ><textarea type="text" name="" id="cell-11-34" /></td
                    >
                    <td class="cell-11-5"
                        ><textarea type="text" name="" id="cell-11-5" /></td
                    >
                    <td class="cell-11-6"
                        ><textarea type="text" name="" id="cell-11-6" bind:value={inp1Value}/></td
                    >
                </tr>
            </tbody>
        </table>
        <button class="m-btn-accept m-my-1" on:click={saveStamp}>Сохранить</button>
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
    }
    textarea {
        position:absolute;
        border: 1px solid slategray;
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
    table.iksweb td
     {
        position: relative;
        border: 1px solid #595959;
    }
    table.iksweb td
     {
        padding: 3px;
        width: 30px;
        height: 35px;
    }

    h1{
        font-size: xx-large;
        font-weight: bold;
        text-align: center;
        color: rgb(90,90,90);
    }



</style>
