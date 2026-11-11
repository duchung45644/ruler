import { mount } from 'svelte';
import Features from './Features.svelte';
import { lang } from './lang.svelte';
import './app.css';

document.documentElement.lang = lang.code;
mount(Features, { target: document.getElementById('app')! });
