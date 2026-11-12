import { mount } from 'svelte';
import App from './App.svelte';
import './styles.css';
import { installCsrfFetch } from './csrf.js';

installCsrfFetch();

mount(App, {
  target: document.getElementById('app')
});
