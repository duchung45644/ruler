import { mount } from 'svelte';
import Ai from './Ai.svelte';
import { lang } from './lang.svelte';
import './app.css';

document.documentElement.lang = lang.code;
mount(Ai, { target: document.getElementById('app')! });
