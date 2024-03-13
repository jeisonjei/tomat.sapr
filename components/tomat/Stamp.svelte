<script>
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";

    export let hidden;

    onMount(function (params) {
        
    });
</script>

{#if !hidden}
    <div
        transition:fade={{ delay: 0, duration: 200 }}
        class="dialog-center rounded"
    >
    <div>
        <button on:click={()=>hidden=true}>Закрыть</button>
    </div>
        <h1>Заполнение основной надписи</h1>
        <div style="background-color:yellow"><p>ВНИМАНИЕ! Функция в разработке, заполнение этой формы ни к чему не приведёт</p></div>
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
                        ><textarea type="text" name="" id="cell-6-12" /></td
                    >
                    <td class="cell-6-34" colspan="2"
                        ><textarea type="text" name="" id="cell-6-34" /></td
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
                        ><textarea type="text" name="" id="cell-7-12" /></td
                    >
                    <td class="cell-7-34" colspan="2"
                        ><textarea type="text" name="" id="cell-7-34" /></td
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
                        ><textarea type="text" name="" id="cell-8-12" /></td
                    >
                    <td class="cell-8-34" colspan="2"
                        ><textarea type="text" name="" id="cell-8-34" /></td
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
                        ><textarea type="text" name="" id="cell-9-12" /></td
                    >
                    <td class="cell-9-34" colspan="2"
                        ><textarea type="text" name="" id="cell-9-34" /></td
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
                        ><textarea type="text" name="" id="cell-11-6" /></td
                    >
                </tr>
            </tbody>
        </table>
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
    table.iksweb td,
    table.iksweb th {
        position: relative;
        border: 1px solid #595959;
    }
    table.iksweb td,
    table.iksweb th {
        padding: 3px;
        width: 30px;
        height: 35px;
    }
    table.iksweb th {
        background: #347c99;
        color: #fff;
        font-weight: normal;
    }
</style>
