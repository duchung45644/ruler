import { mount } from 'svelte';
import Privacy from './Privacy.svelte';
import { lang } from './lang.svelte';
import './app.css';

document.documentElement.lang = lang.code;
mount(Privacy, { target: document.getElementById('app')! });
