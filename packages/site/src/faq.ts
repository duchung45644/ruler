import { mount } from 'svelte';
import FaqPage from './FaqPage.svelte';
import { lang } from './lang.svelte';
import './app.css';

document.documentElement.lang = lang.code;
mount(FaqPage, { target: document.getElementById('app')! });
