<script>
    import * as jscolor from '../../../libs/jscolor/jscolor.js';
    export let selectedColor='';
    
    function handleChange(event){
        selectedColor=event.target.value;
    }
    
</script>

<input on:change={selectedColor} data-jscolor="{{}}">