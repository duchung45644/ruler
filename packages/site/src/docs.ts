import { mount } from 'svelte';
import Docs from './Docs.svelte';
import { lang } from './lang.svelte';
import './app.css';

document.documentElement.lang = lang.code;
mount(Docs, { target: document.getElementById('app')! });
