import { i18n } from '#i18n';
import { mount } from 'svelte';
import { loadFonts } from '../../ui/fonts';
import App from './App.svelte';
import './style.css';

document.title = i18n.t('options.pageTitle');
loadFonts();
// shown once storage, theme and fonts are settled, so the page never flashes (9.08)
const show = () => void document.fonts.ready.then(() => document.body.classList.add('ready'));
mount(App, { target: document.getElementById('app')!, props: { onready: show } });
