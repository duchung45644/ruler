import { mount } from 'svelte';
import App from './App.svelte';
import './style.css';

mount(App, { target: document.getElementById('app')! });
// fade in once fonts and theme are settled, so the panel never flashes the wrong scheme
const show = () => document.body.classList.add('ready');
if (document.readyState === 'complete') show();
else addEventListener('load', show, { once: true });
