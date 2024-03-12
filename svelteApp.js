import App from './App.svelte'

const svelteApp = document.getElementById('svelte-app');

const app = new App({
    target: document.body,
    props: {}
});

export default app;