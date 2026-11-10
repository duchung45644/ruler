import { mount } from 'svelte';
import Home from './Home.svelte';
import { lang } from './lang.svelte';
import './app.css';

document.documentElement.lang = lang.code;
mount(Home, { target: document.getElementById('app')! });
