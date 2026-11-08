/* eslint-disable @typescript-eslint/no-explicit-any -- these probes read arbitrary page globals */
/**
 * Technology signatures: port of legacy detect-technologies.js:270–3196, which is the library list
 * of Library-Detector-for-Chrome (MIT, see THIRD_PARTY_NOTICES.md). Order and logic kept; only
 * the decompiled helpers are written back as plain JS. Runs in the page's MAIN world.
 */
import type { Technology } from '../page/types';

/** Shared hit for probes that find a library but no version; detectAll only reads it. */
const NONE = Object.freeze({ version: null });

type Probe = any;
type Hit = { version?: unknown } | false | null | undefined | '' | 0;
export interface Signature {
  id: string;
  icon: string | null;
  url: string | null;
  test(w: Probe): Hit;
}

/** Shadow roots of the page, cached for one detectAll run (legacy `r`). */
let roots: ShadowRoot[] | null = null;
const OWN_CLASS = /^(?:exception|sr-ignore)-[a-p]{32}$/;
/** Our own UI hosts (legacy `s`): skipped so the extension never detects itself. */
function isOwn(el: Element & { dataset?: DOMStringMap }): boolean {
  for (const c of el.classList ?? []) if (OWN_CLASS.test(c)) return true;
  const id = el.dataset ? el.dataset.id : null;
  return typeof id === 'string' && /[a-p]{32}/.test(id);
}
function l(): ShadowRoot[] {
  if (roots) return roots;
  const out: ShadowRoot[] = [];
  const walk = (root: Document | ShadowRoot, depth: number) => {
    if (depth > 32) return;
    for (const el of root.querySelectorAll('*'))
      if (el.shadowRoot && !isOwn(el)) {
        out.push(el.shadowRoot);
        walk(el.shadowRoot, depth + 1);
      }
  };
  try {
    walk(document, 0);
  } catch {
    /* a hostile tree must not stop detection */
  }
  return (roots = out);
}
/** querySelector across open shadow roots (legacy `u`). */
const REACT_KEY =
  /^(__reactFiber\$|__reactInternalInstance\$|__reactContainer\$|_reactRootContainer$)/;

function hasReactNode(): boolean {
  const has = (el: Element) => Object.keys(el).some((k) => REACT_KEY.test(k));
  if (!document.body || has(document.body)) return !!document.body;
  const all = document.body.getElementsByTagName('*');
  for (let i = 0; i < all.length && i < 300; i++) if (has(all[i]!)) return true;
  return false;
}

function u(sel: string, root?: ParentNode): any {
  try {
    const hit = (root || document).querySelector(sel);
    if (hit) return hit;
    for (const r of l()) {
      const h = r.querySelector(sel);
      if (h) return h;
    }
  } catch {
    /* invalid selector */
  }
  return null;
}
/** querySelectorAll across open shadow roots (legacy `a`). */
function a(sel: string, root?: ParentNode): any[] {
  let out: Element[] = [];
  try {
    out = Array.from((root || document).querySelectorAll(sel));
    for (const r of l()) out = out.concat(Array.from(r.querySelectorAll(sel)));
  } catch {
    /* invalid selector */
  }
  return out;
}
const c = () => a('*');
const e = (x: Iterable<any> | ArrayLike<any>): any[] => Array.from(x);
const n = (x: unknown) => typeof x;

export const SIGNATURES: Record<string, Signature> = {
  GWT: {
    id: 'gwt',
    icon: 'gwt',
    url: 'http://www.gwtproject.org/',
    test: function (t: Probe) {
      const t_document = t.document;
      const e = t_document.getElementById('__gwt_historyFrame');
      const n_gwt_uid = t_document.gwt_uid;
      const __listener = t_document.body.__listener;
      const __eventBits = t_document.body.__eventBits;
      const { __gwt_activeModules, __gwt_jsonp__ } = t;
      const u = t.__gwt_scriptsLoaded || t.__gwt_stylesLoaded || t.__gwt_activeModules;
      if (
        e ||
        n_gwt_uid ||
        __listener ||
        __eventBits ||
        __gwt_activeModules ||
        __gwt_jsonp__ ||
        u
      ) {
        const a = t_document.getElementsByTagName('iframe');
        let c = null;
        for (let p = 0; p < a.length; p++) {
          try {
            if (a[p].tabIndex < 0 && a[p].contentWindow && a[p].contentWindow.$gwt_version) {
              c = a[p].contentWindow.$gwt_version;
              break;
            }
          } catch {
            /* as legacy */
          }
        }
        if (c == '0.0.999') {
          c = 'Google Internal';
        }
        return {
          version: c,
        };
      }
      return false;
    },
  },
  Vaadin: {
    id: 'vaadin',
    icon: 'vaadin',
    url: 'https://vaadin.com/',
    test: function (t: Probe) {
      return !(!t.vaadin || !t.vaadin.registerWidgetset) && NONE;
    },
  },
  Bootstrap: {
    id: 'bootstrap',
    icon: 'bootstrap',
    url: 'https://getbootstrap.com/',
    test: function (t: Probe) {
      if (t.bootstrap && typeof t.bootstrap.Tooltip === 'function') {
        return {
          version: t.bootstrap.Tooltip.VERSION || 'v5+',
        };
      }
      return (
        !(!t.jQuery || !t.jQuery.fn.modal) &&
        (t.jQuery.fn.modal.Constructor && t.jQuery.fn.modal.Constructor.VERSION
          ? {
              version: t.jQuery.fn.modal.Constructor.VERSION,
            }
          : {
              version: 'v3/v4',
            })
      );
    },
  },
  Zurb: {
    id: 'zurb',
    icon: 'zurb',
    url: 'https://foundation.zurb.com/',
    test: function (t: Probe) {
      return (
        !(!t.Foundation || !t.Foundation.Toggler) && {
          version: t.Foundation.version || null,
        }
      );
    },
  },
  Polymer: {
    id: 'polymer',
    icon: 'polymer',
    url: 'https://www.polymer-project.org/',
    test: function (t: Probe) {
      return (
        !(!t.Polymer || !t.Polymer.dom) && {
          version: t.Polymer.version || null,
        }
      );
    },
  },
  LitElement: {
    id: 'litelement',
    icon: 'lit',
    url: 'https://lit-element.polymer-project.org/',
    test: function (t: Probe) {
      return (
        !(!t.litElementVersions || !t.litElementVersions.length) && {
          version: e(t.litElementVersions).sort((t, n) =>
            t.localeCompare(n, undefined, {
              numeric: true,
            }),
          ),
        }
      );
    },
  },
  'lit-html': {
    id: 'lit-html',
    icon: 'lit',
    url: 'https://lit-html.polymer-project.org/',
    test: function (t: Probe) {
      return (
        !(!t.litHtmlVersions || !t.litHtmlVersions.length) && {
          version: e(t.litHtmlVersions).sort((t, n) =>
            t.localeCompare(n, undefined, {
              numeric: true,
            }),
          ),
        }
      );
    },
  },
  Highcharts: {
    id: 'highcharts',
    icon: 'highcharts',
    url: 'http://www.highcharts.com',
    test: function (t: Probe) {
      return (
        !(!t.Highcharts || !t.Highcharts.Point) && {
          version: t.Highcharts.version || null,
        }
      );
    },
  },
  CreateJS: {
    id: 'createjs',
    icon: 'createjs',
    url: 'https://createjs.com/',
    test: function (t: Probe) {
      return !(!t.createjs || !t.createjs.promote) && NONE;
    },
  },
  'Google Maps': {
    id: 'gmaps',
    icon: 'gmaps',
    url: 'https://developers.google.com/maps/',
    test: function (t: Probe) {
      if (t.google && t.google.maps) {
        return {
          version: t.google.maps.version || null,
        };
      }
      return (
        (u('script[src*="maps.googleapis.com/maps/api"]') ||
          u('iframe[src*="google.com/maps/embed"]') ||
          !!u('.gm-style, [class^="gm-"], [id*="gmap"]')) &&
        NONE
      );
    },
  },
  jQuery: {
    id: 'jquery',
    icon: 'jquery',
    url: 'http://jquery.com',
    test: function (t: Probe) {
      const n = t.jQuery || t.$;
      return (
        !!(n && n.fn && n.fn.jquery) && {
          version: n.fn.jquery.replace(/[^\d+.+]/g, '') || null,
        }
      );
    },
  },
  'jQuery UI': {
    id: 'jquery_ui',
    icon: 'jquery_ui',
    url: 'http://jqueryui.com',
    test: function (t: Probe) {
      const n = t.jQuery || t.$ || t.$jq || t.$j;
      if (n && n.fn && n.fn.jquery && n.ui) {
        const e =
          'accordion,datepicker,dialog,draggable,droppable,progressbar,resizable,selectable,slider,menu,grid,tabs'.split(
            ',',
          );
        const o: string[] = [];
        for (let r = 0; r < e.length; r++) {
          if (n.ui[e[r]!]) {
            o.push(e[r]!.substr(0, 1).toUpperCase() + e[r]!.substr(1));
          }
        }
        return {
          version: n.ui.version || null,
          details: o.length ? `Plugins used: ${o.join(',')}` : '',
        };
      }
      return false;
    },
  },
  Dojo: {
    id: 'dojo',
    icon: 'dojo',
    url: 'http://dojotoolkit.org',
    test: function (t: Probe) {
      return (
        !(!t.dojo || !t.dojo.delegate) && {
          version: t.dojo.version ? t.dojo.version.toString() : null,
          details: `Details: ${t.dijit ? 'Uses Dijit' : 'none'}`,
        }
      );
    },
  },
  Prototype: {
    id: 'prototype',
    icon: 'prototype',
    url: 'http://prototypejs.org',
    test: function (t: Probe) {
      return (
        !(!t.Prototype || !t.Prototype.BrowserFeatures) && {
          version: t.Prototype.Version || null,
        }
      );
    },
  },
  MooTools: {
    id: 'mootools',
    icon: 'mootools',
    url: 'https://mootools.net/',
    test: function (t: Probe) {
      return (
        !(!t.MooTools || !t.MooTools.build) && {
          version: t.MooTools.version || null,
        }
      );
    },
  },
  'YUI 2': {
    id: 'yui',
    icon: 'yui',
    url: 'http://developer.yahoo.com/yui/2/',
    test: function (t: Probe) {
      return (
        !(!t.YAHOO || !t.YAHOO.util) && {
          version: t.YAHOO.VERSION || null,
        }
      );
    },
  },
  'YUI 3': {
    id: 'yui3',
    icon: 'yui',
    url: 'https://yuilibrary.com/',
    test: function (t: Probe) {
      return (
        !(!t.YUI || !t.YUI.Env) && {
          version: t.YUI.version || null,
        }
      );
    },
  },
  'Ext JS': {
    id: 'extjs',
    icon: 'extjs',
    url: 'https://www.sencha.com/products/extjs/',
    test: function (t: Probe) {
      if (t.Ext && t.Ext.versions) {
        return {
          version: t.Ext.versions.core.version,
        };
      }
      return (
        !!t.Ext && {
          version: t.Ext.version || null,
        }
      );
    },
  },
  'Closure Library': {
    id: 'closure',
    icon: 'closure',
    url: 'https://developers.google.com/closure/library/',
    test: function (t: Probe) {
      return !(!t.goog || !t.goog.provide) && NONE;
    },
  },
  Raphaël: {
    id: 'raphael',
    icon: null,
    url: 'http://dmitrybaranovskiy.github.io/raphael/',
    test: function (t: Probe) {
      return (
        !(!t.Raphael || !t.Raphael.circle) && {
          version: t.Raphael.version || null,
        }
      );
    },
  },
  React: {
    id: 'react',
    icon: 'react',
    url: 'https://reactjs.org/',
    test: function (t: Probe) {
      if (t.React && t.React.Component) {
        return {
          version: t.React.version || null,
        };
      }
      // bundled React exposes no global: look for the per-node keys it attaches
      // (`__reactFiber$<random>` etc.) on the first elements of the page
      if (u('[data-reactroot], [data-reactid]') || hasReactNode()) {
        return {
          version: t.React?.version || null,
        };
      }
      return (
        !(
          !(document.body as any)._reactRootContainer &&
          !(document.body.firstElementChild as any)?._reactRootContainer
        ) && {
          version: t.React?.version || null,
        }
      );
    },
  },
  'Next.js': {
    id: 'next',
    icon: 'next',
    url: 'https://nextjs.org/',
    test: function (t: Probe) {
      return (t.__NEXT_DATA__ || !!u('script[src*="/_next/static/"]')) && NONE;
    },
  },
  Preact: {
    id: 'preact',
    icon: 'preact',
    url: 'https://preactjs.com/',
    test: function (t: Probe) {
      if (!t.preact && !t.h) {
        return false;
      }
      if (t.preact) {
        return {
          version: t.preact.version || null,
        };
      }
      const n = typeof Symbol !== 'undefined' && Symbol.for && Symbol.for('preactattr');
      const e = document
        .createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, {
          acceptNode: function (t) {
            if (
              ((t) =>
                !!t &&
                (('__k' in t && '__e' in t) ||
                  '__preactattr_' in t ||
                  !(!n || (t as any)[n] == null)))(t)
            ) {
              return NodeFilter.FILTER_ACCEPT;
            }
            return NodeFilter.FILTER_SKIP;
          },
        })
        .nextNode();
      if (e) {
        let o = null;
        if ('__k' in e && '__e' in e) {
          o = '10';
        } else if ('__preactattr_' in e) {
          o = '8';
        } else if (n && (e as any)[n] != null) {
          o = '7';
        }
        return {
          version: o,
        };
      }
      return false;
    },
  },
  Modernizr: {
    id: 'modernizr',
    icon: 'modernizr',
    url: 'https://modernizr.com/',
    test: function (t: Probe) {
      return (
        !(!t.Modernizr || !t.Modernizr.addTest) && {
          version: t.Modernizr._version || null,
        }
      );
    },
  },
  Backbone: {
    id: 'backbone',
    icon: 'backbone',
    url: 'http://backbonejs.org/',
    test: function (t: Probe) {
      return (
        !(!t.Backbone || !t.Backbone.Model.extend) && {
          version: t.Backbone.VERSION || null,
        }
      );
    },
  },
  Leaflet: {
    id: 'leaflet',
    icon: 'leaflet',
    url: 'http://leafletjs.com',
    test: function (t: Probe) {
      return (
        !(!t.L || !t.L.GeoJSON || (!t.L.marker && !t.L.Marker)) && {
          version: t.L.version || t.L.VERSION || null,
        }
      );
    },
  },
  Mapbox: {
    id: 'mapbox',
    icon: 'mapbox',
    url: 'https://www.mapbox.com/',
    test: function (t: Probe) {
      return (
        !!(t.L && t.L.mapbox && t.L.mapbox.geocoder) && {
          version: t.L.mapbox.VERSION || null,
        }
      );
    },
  },
  'Lo-Dash': {
    id: 'lodash',
    icon: 'lodash',
    url: 'https://lodash.com/',
    test: function ({ _ }) {
      return (
        !(
          !_ ||
          typeof _.VERSION !== 'string' ||
          typeof _.rest !== 'function' ||
          !_.VERSION.startsWith('4.')
        ) && {
          version: _.VERSION,
        }
      );
    },
  },
  Underscore: {
    id: 'underscore',
    icon: 'underscore',
    url: 'http://underscorejs.org/',
    test: function (t: Probe) {
      return (
        !(!t._ || typeof t._.tap !== 'function') &&
        (!t._.VERSION || !t._.VERSION.startsWith('4.')) && {
          version: t._.VERSION || null,
        }
      );
    },
  },
  'Socket.IO': {
    id: 'socketio',
    icon: 'socketio',
    url: 'https://socket.io/',
    test: function (t: Probe) {
      return (
        !(!t.io || (!t.io.sockets && !t.io.Socket)) && {
          version: t.io.version || null,
        }
      );
    },
  },
  Mustache: {
    id: 'mustache',
    icon: 'mustache',
    url: 'http://mustache.github.io/',
    test: function (t: Probe) {
      return (
        !(!t.Mustache || !t.Mustache.to_html) && {
          version: t.Mustache.version || null,
        }
      );
    },
  },
  'Fabric.js': {
    id: 'fabricjs',
    icon: 'fabric',
    url: 'http://fabricjs.com/',
    test: function (t: Probe) {
      return (
        !(!t.fabric || !t.fabric.util) && {
          version: t.fabric.version || null,
        }
      );
    },
  },
  FuseJS: {
    id: 'fusejs',
    icon: 'fusejs',
    url: 'http://fusejs.io/',
    test: function (t: Probe) {
      return !!t.Fuse && NONE;
    },
  },
  'Tween.js': {
    id: 'tweenjs',
    icon: 'tween',
    url: 'https://github.com/tweenjs/tween.js',
    test: function (t: Probe) {
      return !(!t.TWEEN || !t.TWEEN.Easing) && NONE;
    },
  },
  'three.js': {
    id: 'threejs',
    icon: 'threejs',
    url: 'https://threejs.org/',
    test: function (t: Probe) {
      if (t.THREE && t.THREE.REVISION) {
        return {
          version: `r${t.THREE.REVISION}`,
        };
      }
      return !!t.THREE && NONE;
    },
  },
  'Paper.js': {
    id: 'paperjs',
    icon: 'paperjs',
    url: 'http://paperjs.org/',
    test: function (t: Probe) {
      return (
        !(!t.paper || !t.paper.Point) && {
          version: t.paper.version || null,
        }
      );
    },
  },
  D3: {
    id: 'd3',
    icon: 'd3',
    url: 'https://d3js.org/',
    test: function (t: Probe) {
      return (
        !(!t.d3 || !t.d3.select) && {
          version: t.d3.version || null,
        }
      );
    },
  },
  Handlebars: {
    id: 'handlebars',
    icon: 'handlebars',
    url: 'http://handlebarsjs.com/',
    test: function (t: Probe) {
      return (
        !(!t.Handlebars || !t.Handlebars.compile) && {
          version: t.Handlebars.VERSION || null,
        }
      );
    },
  },
  Handsontable: {
    id: 'handsontable',
    icon: 'handsontable',
    url: 'https://handsontable.com/',
    test: function (t: Probe) {
      return (
        !(!t.Handsontable || !t.Handsontable.Core) && {
          version: t.Handsontable.version || null,
        }
      );
    },
  },
  Knockout: {
    id: 'knockout',
    icon: 'knockout',
    url: 'http://knockoutjs.com/',
    test: function (t: Probe) {
      return (
        !(!t.ko || !t.ko.applyBindings) && {
          version: t.ko.version || null,
        }
      );
    },
  },
  Spine: {
    id: 'spine',
    icon: 'icon38',
    url: 'http://spine.github.io/',
    test: function (t: Probe) {
      return (
        !(!t.Spine || !t.Spine.Controller) && {
          version: t.Spine.version || null,
        }
      );
    },
  },
  'jQuery Mobile': {
    id: 'jquery-mobile',
    icon: 'jquery_mobile',
    url: 'http://jquerymobile.com/',
    test: function (t: Probe) {
      const n = t.jQuery || t.$ || t.$jq || t.$j;
      return (
        !!(n && n.fn && n.fn.jquery && n.mobile) && {
          version: n.mobile.version || null,
        }
      );
    },
  },
  'WebFont Loader': {
    id: 'webfontloader',
    icon: 'webfontloader',
    url: 'https://github.com/typekit/webfontloader',
    test: function (t: Probe) {
      return !(!t.WebFont || !t.WebFont.load) && NONE;
    },
  },
  Angular: {
    id: 'angular',
    icon: 'angular',
    url: 'https://angular.io/',
    test: function (t: Probe) {
      const n = u('[ng-version]');
      if (n) {
        return {
          version: n.getAttribute('ng-version') || null,
        };
      }
      return !!(t.ng && t.ng.probe instanceof Function) && NONE;
    },
  },
  AngularJS: {
    id: 'angularjs',
    icon: 'angularjs',
    url: 'https://angularjs.org/',
    test: function ({ angular }) {
      return (
        !!(angular && angular.version && angular.version.full) && {
          version: angular.version.full,
        }
      );
    },
  },
  Ionic: {
    id: 'ionic',
    icon: 'ionic',
    url: 'https://ionicframework.com/',
    test: function () {
      const n = u('ion-app');
      return !(!n || n.nodeName !== 'ION-APP') && NONE;
    },
  },
  'Ember.js': {
    id: 'emberjs',
    icon: 'emberjs',
    url: 'https://emberjs.com/',
    test: function (t: Probe) {
      const n = t.Ember || t.Em;
      return (
        !(!n || !n.GUID_KEY) && {
          version: n.VERSION || null,
        }
      );
    },
  },
  'Hammer.js': {
    id: 'hammerjs',
    icon: 'hammerjs',
    url: 'http://eightmedia.github.io/hammer.js/',
    test: function (t: Probe) {
      return (
        !(!t.Hammer || !t.Hammer.Pinch) && {
          version: t.Hammer.VERSION || '&lt; 1.0.10',
        }
      );
    },
  },
  'Visibility.js': {
    id: 'visibilityjs',
    icon: 'icon38',
    url: 'https://github.com/ai/visibilityjs',
    test: function (t: Probe) {
      return !(!t.Visibility || !t.Visibility.every) && NONE;
    },
  },
  'Pixi.js': {
    id: 'pixi',
    icon: 'pixi',
    url: 'http://www.pixijs.com/',
    test: function ({ PIXI }) {
      return (
        !!(PIXI && PIXI.WebGLRenderer && PIXI.VERSION) && {
          version: PIXI.VERSION.replace('v', '') || null,
        }
      );
    },
  },
  'GreenSock JS': {
    id: 'greensock',
    icon: 'greensock',
    url: 'https://greensock.com/gsap',
    test: function (t: Probe) {
      return (
        !(!t.TweenMax || !t.TweenMax.pauseAll) && {
          version: t.TweenMax.version || null,
        }
      );
    },
  },
  Isotope: {
    id: 'isotope',
    icon: null,
    url: 'https://isotope.metafizzy.co/',
    test: function (t: Probe) {
      return !!(t.Isotope || (t.$ != null && t.$.Isotope)) && NONE;
    },
  },
  Marionette: {
    id: 'marionette',
    icon: 'marionette',
    url: 'https://marionettejs.com/',
    test: function (t: Probe) {
      return (
        !(!t.Marionette || !t.Marionette.Application) && {
          version: t.Marionette.VERSION || null,
        }
      );
    },
  },
  Can: {
    id: 'canjs',
    icon: 'canjs',
    url: 'https://canjs.com/',
    test: function (t: Probe) {
      return (
        !(!t.can || !t.can.Construct) && {
          version: t.can.VERSION || null,
        }
      );
    },
  },
  Vue: {
    id: 'vue',
    icon: 'vue',
    url: 'https://vuejs.org/',
    test: function (t: Probe) {
      return (
        !(
          document
            .createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, function (t: any) {
              if (t.__vue__ != null) {
                return NodeFilter.FILTER_ACCEPT;
              }
              return NodeFilter.FILTER_SKIP;
            })
            .nextNode() === null && !t.Vue
        ) && {
          version: (t.Vue && t.Vue.version) || null,
        }
      );
    },
  },
  'Nuxt.js': {
    id: 'nuxt',
    icon: 'nuxt',
    url: 'https://nuxtjs.org/',
    test: function (t: Probe) {
      return !!(t.__NUXT__ || t.$nuxt || c().some((t) => t.__vue__?.nuxt)) && NONE;
    },
  },
  Two: {
    id: 'two',
    icon: 'two',
    url: 'https://two.js.org/',
    test: function (t: Probe) {
      return (
        !(!t.Two || !t.Two.Utils) && {
          version: t.Two.Version || null,
        }
      );
    },
  },
  'Material Design Lite': {
    id: 'materialdesignlite',
    icon: 'mdl',
    url: 'https://getmdl.io/',
    test: function (t: Probe) {
      return !(!t.componentHandler || !t.componentHandler.upgradeElement) && NONE;
    },
  },
  'Kendo UI': {
    id: 'kendoui',
    icon: 'kendoui',
    url: 'https://github.com/telerik/kendo-ui-core',
    test: function (t: Probe) {
      return (
        !!(t.kendo && t.kendo.View && t.kendo.View.extend) && {
          version: t.kendo.version || null,
        }
      );
    },
  },
  'Matter.js': {
    id: 'matterjs',
    icon: 'matter-js',
    url: 'http://brm.io/matter-js/',
    test: function (t: Probe) {
      return !(!t.Matter || !t.Matter.Engine) && NONE;
    },
  },
  Riot: {
    id: 'riot',
    icon: 'riot',
    url: 'https://riot.js.org/',
    test: function (t: Probe) {
      return (
        !(!t.riot || !t.riot.mixin) && {
          version: t.riot.version || null,
        }
      );
    },
  },
  'Moment.js': {
    id: 'momentjs',
    icon: 'momentjs',
    url: 'http://momentjs.com/',
    test: function (t: Probe) {
      return (
        !(!t.moment || (!t.moment.isMoment && !t.moment.lang)) && {
          version: t.moment.version || null,
        }
      );
    },
  },
  'Moment Timezone': {
    id: 'moment-timezone',
    icon: 'momentjs',
    url: 'http://momentjs.com/timezone/',
    test: function (t: Probe) {
      return (
        !(!t.moment || !t.moment.tz) && {
          version: t.moment.tz.version || null,
        }
      );
    },
  },
  ScrollMagic: {
    id: 'scrollmagic',
    icon: 'scrollmagic',
    url: 'http://scrollmagic.io/',
    test: function (t: Probe) {
      return (
        !(!t.ScrollMagic || !t.ScrollMagic.Controller) && {
          version: t.ScrollMagic.version || null,
        }
      );
    },
  },
  'Numeral.js': {
    id: 'numeraljs',
    icon: 'numeraljs',
    url: 'http://numeraljs.com/',
    test: function (t: Probe) {
      return (
        !(!t.numeral || !t.isNumeral) && {
          version: t.numeral.version || null,
        }
      );
    },
  },
  Framer: {
    id: 'framer',
    icon: 'framer',
    url: 'https://framer.com/',
    test: function (t: Probe) {
      return (
        !(!t.Framer || !t.Framer.Layer) && {
          version: t.Framer.Version.build || null,
        }
      );
    },
  },
  Marko: {
    id: 'marko',
    icon: 'marko',
    url: 'https://markojs.com/',
    test: function () {
      return !!u('[data-marko-key], [data-marko]') && NONE;
    },
  },
  AMP: {
    id: 'amp',
    icon: 'amp',
    url: 'https://amp.dev/',
    test: function (t: Probe) {
      const n = t.document.documentElement.getAttribute('amp-version');
      return (
        !!n && {
          version: n,
        }
      );
    },
  },
  Gatsby: {
    id: 'gatsby',
    icon: 'gatsby',
    url: 'https://www.gatsbyjs.org/',
    test: function () {
      return !!document.getElementById('___gatsby') && NONE;
    },
  },
  Shopify: {
    id: 'shopify',
    icon: 'shopify',
    url: 'https://www.shopify.com/',
    test: function (t: Probe) {
      return !(!t.Shopify || !t.Shopify.shop) && NONE;
    },
  },
  Magento: {
    id: 'magento',
    icon: 'magento',
    url: 'https://magento.com/',
    test: function () {
      const n = /\/static(?:\/version\d+)?\/frontend\/.+\/.+\/requirejs\/require(?:\.min)?\.js/;
      return (
        !!Array.from(a('script[src]') || []).some((t) => n.test(t.src)) && {
          version: 2,
        }
      );
    },
  },
  WordPress: {
    id: 'wordpress',
    icon: 'wordpress',
    url: 'https://wordpress.org/',
    test: function () {
      const n = !!u('link[rel="https://api.w.org/"]');
      const e = !!a('link[href*="wp-includes"], script[src*="wp-includes"]').length;
      if (!n && !e) {
        return false;
      }
      const o = u('meta[name=generator][content^="WordPress"]');
      return {
        version: o ? o.getAttribute('content').replace(/^\w+\s/, '') : null,
      };
    },
  },
  'WordPress Theme': {
    id: 'wp_theme',
    icon: 'theme',
    url: 'https://wordpress.org/themes/',
    test: function () {
      let n = null;
      const e = /\/wp-content\/themes\/([^/]+)\//;
      for (const i of Array.from(a('link[href], script[src]'))) {
        const s = (i.href || i.src || '').match(e);
        if (s && s[1]) {
          n = s[1];
        }
      }
      if (!n) {
        return false;
      }
      const l = n.replace(/[_-]/g, ' ').replace(/\b\w/g, (t: string) => t.toUpperCase());
      const u = encodeURIComponent(`${l} WordPress Theme`);
      this.url = `https://www.google.com/search?q=${u}`;
      return {
        version: l,
      };
    },
  },
  Wix: {
    id: 'wix',
    icon: 'wix',
    url: 'https://www.wix.com/',
    test: function (t: Probe) {
      return (
        ((t.wixPerformanceMeasurements && t.wixPerformanceMeasurements.info) ||
          !(!t.wixBiSession || !t.wixBiSession.info)) &&
        NONE
      );
    },
  },
  'core-js': {
    id: 'corejs',
    icon: 'corejs',
    url: 'https://github.com/zloirock/core-js',
    test: function ({ '__core-js_shared__': __core_js_shared__, core }) {
      if (__core_js_shared__) {
        const o = __core_js_shared__.versions;
        return {
          version: Array.isArray(o)
            ? o.map((t) => `core-js-${t.mode}@${t.version}`).join('; ')
            : null,
        };
      }
      return (
        !!core && {
          version: core.version || null,
        }
      );
    },
  },
  Drupal: {
    id: 'drupal',
    icon: 'drupal',
    url: 'https://www.drupal.org/',
    test: function (t: Probe) {
      const n = u('meta[name="generator"][content^="Drupal"]');
      const version = n ? n.getAttribute('content').replace(/\D+/gi, '') : null;
      const o = /\/sites\/(?:default|all)\/(?:themes|modules|files)/;
      const r = Array.from(a('link,style,script') || []);
      return (
        !!(
          r.some((t) => o.test(t.src)) ||
          r.some((t) => o.test(t.href)) ||
          n ||
          (t.Drupal && t.Drupal.behaviors)
        ) && {
          version,
        }
      );
    },
  },
  'Create React App': {
    id: 'create-react-app',
    icon: 'cra',
    url: 'https://create-react-app.dev/',
    test: function (t: Probe) {
      let n;
      let e;
      let firstElementChild = t.document.body.firstElementChild;
      do {
        if (firstElementChild.localName === 'noscript') {
          n = firstElementChild;
        } else if (firstElementChild.id === 'root') {
          e = firstElementChild;
        }
      } while ((firstElementChild = firstElementChild.nextElementSibling));
      return (
        !!(e && n && /You need to enable JavaScript to run this app/.test(n.textContent)) && NONE
      );
    },
  },
  Joomla: {
    id: 'joomla',
    icon: 'joomla',
    url: 'https://www.joomla.org/',
    test: function (t: Probe) {
      const n = u('meta[name=generator][content^="Joomla"]');
      const e = !!a('script[src*="/media/jui/js/bootstrap.min.js"]').length;
      if (n) {
        return {
          version: n.getAttribute('content').replace(/^\w+\s/, ''),
        };
      }
      return !(!t.Joomla && !e) && NONE;
    },
  },
  'WP Rocket': {
    id: 'wp-rocket',
    icon: 'wp-rocket',
    url: 'https://wp-rocket.me/',
    test: function (t: Probe) {
      let n = 0;
      if (t.RocketLazyLoadScripts || t.RocketPreloadLinksConfig) {
        n++;
      }
      if (u('style#wpr-usedcss')) {
        n++;
      }
      if (u('script[data-rocket-type], script[data-minify]')) {
        n++;
      }
      if (u('.rocket-lazyload, [data-rocket-lazyload]')) {
        n++;
      }
      return n >= 2 && NONE;
    },
  },
  Remix: {
    id: 'remix',
    icon: 'remix',
    url: 'https://remix.run/',
    test: function (t: Probe) {
      return !!t.__remixContext && NONE;
    },
  },
  ECharts: {
    id: 'echarts',
    icon: 'echarts',
    url: 'https://echarts.apache.org/en/index.html',
    test: function (t: Probe) {
      if (t.echarts && t.echarts.getInstanceByDom) {
        return {
          version: t.echarts.version || null,
        };
      }
      return !!u('[_echarts_instance_]') && NONE;
    },
  },
  'Chart.js': {
    id: 'chartjs',
    icon: 'chartjs',
    url: 'https://www.chartjs.org/',
    test: function (t: Probe) {
      if (t.Chart && t.Chart.registry) {
        return {
          version: t.Chart.version || null,
        };
      }
      return !!e(a('canvas')).some((t) => t.$chartjs) && NONE;
    },
  },
  FusionCharts: {
    id: 'fusioncharts',
    icon: 'fusioncharts',
    url: 'https://www.fusioncharts.com/',
    test: function (t: Probe) {
      if (t.FusionCharts && Array.isArray(t.FusionCharts.version)) {
        return {
          version: t.FusionCharts.version.join('.') || null,
        };
      }
      return !!e(a('.fusioncharts-container')).some((t) => t.FusionCharts) && NONE;
    },
  },
  AmCharts: {
    id: 'amcharts',
    icon: 'amcharts',
    url: 'https://www.amcharts.com/',
    test: function (t: Probe) {
      if (t.am5 && t.am5.registry) {
        return {
          version: t.am5.registry.version || null,
        };
      }
      if (t.am4core) {
        return {
          version: '4',
        };
      }
      if (t.AmCharts) {
        return {
          version: '3',
        };
      }
      return (
        !!u('.am5-html-container') && {
          version: '5',
        }
      );
    },
  },
  ApexCharts: {
    id: 'apexcharts',
    icon: 'apexcharts',
    url: 'https://apexcharts.com/',
    test: function (t: Probe) {
      return ((t.ApexCharts && t.ApexCharts.getChartByID) || !!u('svg.apexcharts-svg')) && NONE;
    },
  },
  Chartist: {
    id: 'chartist',
    icon: 'chartist',
    url: 'https://github.com/chartist-js/chartist',
    test: function () {
      return !!e(a('svg')).some((t) => t.attributes['xmlns:ct']) && NONE;
    },
  },
  Plotly: {
    id: 'plotly',
    icon: 'plotly',
    url: 'https://plotly.com/javascript/',
    test: function (t: Probe) {
      if (t.Plotly && t.Plotly.newPlot) {
        return {
          version: t.Plotly.version || null,
        };
      }
      return !!u('.js-plotly-plot') && NONE;
    },
  },
  Svelte: {
    id: 'svelte',
    icon: 'svelte',
    url: 'https://svelte.dev/',
    test: function (t: Probe) {
      const e = t.__svelte?.v;
      return (
        !!e &&
        (e.size === 1
          ? {
              version: e.values().next().value,
            }
          : NONE)
      );
    },
  },
  SvelteKit: {
    id: 'sveltekit',
    icon: 'svelte',
    url: 'https://kit.svelte.dev/',
    test: function () {
      return !!document.body.innerHTML.includes('__sveltekit_') && NONE;
    },
  },
  Astro: {
    id: 'astro',
    icon: 'astro',
    url: 'https://astro.build/',
    test: function () {
      return !(!u('astro-island') && !u('[astro-island]')) && NONE;
    },
  },
  'Vercel Analytics': {
    id: 'vercel-analytics',
    icon: 'vercel',
    url: 'https://vercel.com/analytics',
    test: function (t: Probe) {
      return (
        ((t.va && typeof t.va === 'function') ||
          !!u('script[src*="vercel.com/_vercel/insights"]')) &&
        NONE
      );
    },
  },
  Vite: {
    id: 'vite',
    icon: 'vite',
    url: 'https://vitejs.dev/',
    test: function (t: Probe) {
      return !(!t.__vite_plugin_react_preamble_installed__ && !t.__vite_is_modern_browser) && NONE;
    },
  },
  WooCommerce: {
    id: 'woocommerce',
    icon: 'woocommerce',
    url: 'https://woocommerce.com/',
    test: function (t: Probe) {
      const n = u('meta[name="generator"][content*="WooCommerce"]');
      if (n) {
        const e = n.getAttribute('content').match(/WooCommerce ([\d.]+)/);
        return {
          version: e ? e[1] : null,
        };
      }
      return (
        !(!t.wc_add_to_cart_params && !document.body.classList.contains('woocommerce')) && NONE
      );
    },
  },
  Stripe: {
    id: 'stripe',
    icon: 'stripe',
    url: 'https://stripe.com/',
    test: function (t: Probe) {
      return !(!t.Stripe || typeof t.Stripe !== 'function') && NONE;
    },
  },
  htmx: {
    id: 'htmx',
    icon: 'htmx',
    url: 'https://htmx.org/',
    test: function (t: Probe) {
      if (t.htmx) {
        return {
          version: t.htmx.version || null,
        };
      }
      return !!u('[hx-get], [hx-post], [hx-trigger]') && NONE;
    },
  },
  'Alpine.js': {
    id: 'alpinejs',
    icon: 'alpine',
    url: 'https://alpinejs.dev/',
    test: function (t: Probe) {
      if (t.Alpine) {
        return {
          version: t.Alpine.version || null,
        };
      }
      return !!u('[x-data], [x-init]') && NONE;
    },
  },
  'Framer Motion': {
    id: 'framer-motion',
    icon: 'framer',
    url: 'https://www.framer.com/motion/',
    test: function () {
      return !(!u('[data-framer-name]') && !u('[data-framer-component-type]')) && NONE;
    },
  },
  Sanity: {
    id: 'sanity',
    icon: 'sanity',
    url: 'https://www.sanity.io/',
    test: function (t: Probe) {
      return !!t.__sanityClient && NONE;
    },
  },
  Contentful: {
    id: 'contentful',
    icon: 'contentful',
    url: 'https://www.contentful.com/',
    test: function (t: Probe) {
      return !!t.contentful && NONE;
    },
  },
  Storybook: {
    id: 'storybook',
    icon: 'storybook',
    url: 'https://storybook.js.org/',
    test: function (t: Probe) {
      return !(!t.__STORYBOOK_ADDONS && !t.__STORYBOOK_STORY_STORE__) && NONE;
    },
  },
  Qwik: {
    id: 'qwik',
    icon: 'qwik',
    url: 'https://qwik.builder.io/',
    test: function (t: Probe) {
      return !(!t.qwikloader && !u('[q\\:id]')) && NONE;
    },
  },
  'Google Analytics': {
    id: 'google-analytics',
    icon: 'google-analytics',
    url: 'https://analytics.google.com/',
    test: function (t: Probe) {
      if (t.gtag || t.dataLayer) {
        return {
          version: 'GA4',
        };
      }
      return (
        !(!t.ga || !t.ga.create) && {
          version: 'Universal Analytics',
        }
      );
    },
  },
  Plausible: {
    id: 'plausible',
    icon: 'plausible',
    url: 'https://plausible.io/',
    test: function (t: Probe) {
      return !(!t.plausible && !u('script[src*="plausible.io"]')) && NONE;
    },
  },
  Posthog: {
    id: 'posthog',
    icon: 'posthog',
    url: 'https://posthog.com/',
    test: function (t: Probe) {
      return !!t.posthog && NONE;
    },
  },
  Sentry: {
    id: 'sentry',
    icon: 'sentry',
    url: 'https://sentry.io/',
    test: function (t: Probe) {
      return (
        !(!t.Sentry && !t.__SENTRY__) && {
          version: t.Sentry?.SDK_VERSION || null,
        }
      );
    },
  },
  Pinia: {
    id: 'pinia',
    icon: 'pinia',
    url: 'https://pinia.vuejs.org/',
    test: function (t: Probe) {
      return t.__VUE_DEVTOOLS_GLOBAL_HOOK__?.stores?.size > 0 && NONE;
    },
  },
  'Material UI': {
    id: 'mui',
    icon: 'mui',
    url: 'https://mui.com/',
    test: function () {
      if (u('[class^="MuiButton-"], [class^="MuiModal-"], [class^="MuiPaper-"]')) {
        return {
          version: 'v5+',
        };
      }
      return (
        !!(Array.from(a('link[href*="mui"]')).length > 0) && {
          version: 'CDN',
        }
      );
    },
  },
  'Ant Design': {
    id: 'antd',
    icon: 'antd',
    url: 'https://ant.design/',
    test: function (t: Probe) {
      return (t.antd || !!u('.ant-layout, .ant-modal, .ant-table, .ant-btn')) && NONE;
    },
  },
  'Chakra UI': {
    id: 'chakra',
    icon: 'chakra',
    url: 'https://chakra-ui.com/',
    test: function (t: Probe) {
      return (
        (u('[class^="chakra-button"], [class^="chakra-input"], [class^="chakra-toast"]') ||
          !(!t.document.documentElement.getAttribute('data-theme') || !u('[class^="css-"]'))) &&
        NONE
      );
    },
  },
  'Tailwind CSS': {
    id: 'tailwindcss',
    icon: 'tailwind',
    url: 'https://tailwindcss.com/',
    test: function () {
      if (
        (() => {
          const n = [
            ...e(Array.from(document.styleSheets || [])),
            ...e(document.adoptedStyleSheets || []),
          ];
          for (const i of l())
            n.push(...e(Array.from(i.styleSheets || [])).concat(e(i.adoptedStyleSheets || [])));
          return n;
        })().some((t) => {
          try {
            return Array.from(t.cssRules || []).some(
              (t: any) => t.cssText && t.cssText.includes('--tw-'),
            );
          } catch {
            return false;
          }
        })
      ) {
        return {
          version: 'v3+',
        };
      }
      return (
        !!u('.sm\\:w-1\\/2, .md\\:flex, .lg\\:grid, [class^="tw-"], [class*=" tw-"]') && {
          version: 'DOM Fallback',
        }
      );
    },
  },
  'Solid.js': {
    id: 'solidjs',
    icon: 'solid',
    url: 'https://www.solidjs.com/',
    test: function () {
      return !!u('[data-hk]') && NONE;
    },
  },
  Flatpickr: {
    id: 'flatpickr',
    icon: 'flatpickr',
    url: 'https://flatpickr.js.org/',
    test: function (t: Probe) {
      if (t.flatpickr) {
        return {
          version: t.flatpickr.version || null,
        };
      }
      return !!u('.flatpickr-calendar') && NONE;
    },
  },
  Pikaday: {
    id: 'pikaday',
    icon: null,
    url: 'https://pikaday.com/',
    test: function (t: Probe) {
      return !!t.Pikaday && NONE;
    },
  },
  'Tippy.js': {
    id: 'tippy',
    icon: 'tippy',
    url: 'https://atomiks.github.io/tippyjs/',
    test: function (t: Probe) {
      if (t.tippy) {
        return {
          version: t.tippy.version || null,
        };
      }
      return !!u('[data-tippy-root]') && NONE;
    },
  },
  'Popper.js': {
    id: 'popper',
    icon: 'popper',
    url: 'https://popper.js.org/',
    test: function (t: Probe) {
      return (
        !!t.Popper && {
          version: t.Popper.version || null,
        }
      );
    },
  },
  Rellax: {
    id: 'rellax',
    icon: 'rellax',
    url: 'https://dixonandmoe.com/rellax/',
    test: function (t: Probe) {
      return (t.Rellax || !!u('.rellax')) && NONE;
    },
  },
  'Locomotive Scroll': {
    id: 'locomotive-scroll',
    icon: 'locomotive',
    url: 'https://locomotivemtl.github.io/locomotive-scroll/',
    test: function (t: Probe) {
      return (t.LocomotiveScroll || !!u('[data-scroll-container]')) && NONE;
    },
  },
  'Smooth Scroll': {
    id: 'smooth-scroll',
    icon: null,
    url: 'https://github.com/cferdinandi/smooth-scroll',
    test: function (t: Probe) {
      return (t.SmoothScroll || !!u('[data-scroll]')) && NONE;
    },
  },
  SweetAlert2: {
    id: 'sweetalert2',
    icon: 'sweetalert',
    url: 'https://sweetalert2.github.io/',
    test: function (t: Probe) {
      return !(!t.Swal && !t.swal) && NONE;
    },
  },
  Fancybox: {
    id: 'fancybox',
    icon: null,
    url: 'https://fancyapps.com/fancybox/',
    test: function (t: Probe) {
      return (t.Fancybox || !!u('[data-fancybox]')) && NONE;
    },
  },
  'Sortable.js': {
    id: 'sortable',
    icon: 'sortable',
    url: 'https://sortablejs.github.io/Sortable/',
    test: function (t: Probe) {
      return (
        !!t.Sortable && {
          version: t.Sortable.version || null,
        }
      );
    },
  },
  Dragula: {
    id: 'dragula',
    icon: 'dragula',
    url: 'https://bevacqua.github.io/dragula/',
    test: function (t: Probe) {
      return !!t.dragula && NONE;
    },
  },
  Masonry: {
    id: 'masonry',
    icon: null,
    url: 'https://masonry.desandro.com/',
    test: function (t: Probe) {
      return (
        !!t.Masonry && {
          version: t.Masonry.version || null,
        }
      );
    },
  },
  Packery: {
    id: 'packery',
    icon: 'packery',
    url: 'https://packery.metafizzy.co/',
    test: function (t: Probe) {
      return !!t.Packery && NONE;
    },
  },
  LazyLoad: {
    id: 'lazyload',
    icon: null,
    url: 'https://github.com/verlok/vanilla-lazyload',
    test: function (t: Probe) {
      return (t.LazyLoad || !!u('[data-src], .lazy')) && NONE;
    },
  },
  Lozad: {
    id: 'lozad',
    icon: null,
    url: 'https://apoorv.pro/lozad.js/',
    test: function (t: Probe) {
      return (t.lozad || !!u('.lozad')) && NONE;
    },
  },
  'Highlight.js': {
    id: 'highlightjs',
    icon: null,
    url: 'https://highlightjs.org/',
    test: function (t: Probe) {
      if (t.hljs) {
        return {
          version: t.hljs.versionString || null,
        };
      }
      return !!u('.hljs') && NONE;
    },
  },
  Prism: {
    id: 'prism',
    icon: 'prism',
    url: 'https://prismjs.com/',
    test: function (t: Probe) {
      return (
        !!t.Prism && {
          version: t.Prism.version || null,
        }
      );
    },
  },
  'Medium Editor': {
    id: 'medium-editor',
    icon: 'medium-editor',
    url: 'https://yabwe.github.io/medium-editor/',
    test: function (t: Probe) {
      return !!t.MediumEditor && NONE;
    },
  },
  Quill: {
    id: 'quill',
    icon: 'quill',
    url: 'https://quilljs.com/',
    test: function (t: Probe) {
      if (t.Quill) {
        return {
          version: t.Quill.version || null,
        };
      }
      return !!u('.ql-editor') && NONE;
    },
  },
  'Font Awesome': {
    id: 'font-awesome',
    icon: 'fontawesome',
    url: 'https://fontawesome.com/',
    test: function (t: Probe) {
      if (t.FontAwesomeConfig) {
        return {
          version: t.FontAwesomeConfig.version,
        };
      }
      if (u('svg[data-icon], svg[data-prefix]')) {
        return {
          version: 'v5/v6',
        };
      }
      return (
        !!(Array.from(a('link[href*="font-awesome"], script[src*="fontawesome"]')).length > 0) && {
          version: 'CDN Link',
        }
      );
    },
  },
  'Feather Icons': {
    id: 'feather',
    icon: null,
    url: 'https://feathericons.com/',
    test: function (t: Probe) {
      return (t.feather || !!u('[data-feather]')) && NONE;
    },
  },
  'js-cookie': {
    id: 'js-cookie',
    icon: 'jscookie',
    url: 'https://github.com/js-cookie/js-cookie',
    test: function (t: Probe) {
      return !(!t.Cookies || !t.Cookies.get) && NONE;
    },
  },
  Select2: {
    id: 'select2',
    icon: 'select2',
    url: 'https://select2.org/',
    test: function (t: Probe) {
      if (t.jQuery && t.jQuery.fn && t.jQuery.fn.select2) {
        return {
          version: t.jQuery.fn.select2.defaults?.version || null,
        };
      }
      return !!u('.select2-container') && NONE;
    },
  },
  DataTables: {
    id: 'datatables',
    icon: null,
    url: 'https://datatables.net/',
    test: function (t: Probe) {
      return (
        !!(t.jQuery && t.jQuery.fn && t.jQuery.fn.DataTable) && {
          version: t.jQuery.fn.DataTable.version || null,
        }
      );
    },
  },
  'Slick Carousel': {
    id: 'slick',
    icon: 'slick',
    url: 'https://kenwheeler.github.io/slick/',
    test: function (t: Probe) {
      return ((t.jQuery && t.jQuery.fn && t.jQuery.fn.slick) || !!u('.slick-slider')) && NONE;
    },
  },
  'Owl Carousel': {
    id: 'owl-carousel',
    icon: 'owl',
    url: 'https://owlcarousel2.github.io/OwlCarousel2/',
    test: function (t: Probe) {
      return ((t.jQuery && t.jQuery.fn && t.jQuery.fn.owlCarousel) || !!u('.owl-carousel')) && NONE;
    },
  },
  'Magnific Popup': {
    id: 'magnific-popup',
    icon: null,
    url: 'https://dimsemenov.com/plugins/magnific-popup/',
    test: function (t: Probe) {
      return (
        !(!t.jQuery || !t.jQuery.magnificPopup) && {
          version: t.jQuery.magnificPopup.version || null,
        }
      );
    },
  },
  Lightbox2: {
    id: 'lightbox2',
    icon: null,
    url: 'https://lokeshdhakar.com/projects/lightbox2/',
    test: function (t: Probe) {
      return (
        ((t.lightbox && typeof t.lightbox.init === 'function') || !!u('[data-lightbox]')) && NONE
      );
    },
  },
  Axios: {
    id: 'axios',
    icon: 'axios',
    url: 'https://axios-http.com/',
    test: function (t: Probe) {
      return (
        !!t.axios && {
          version: t.axios.VERSION || null,
        }
      );
    },
  },
  Swiper: {
    id: 'swiper',
    icon: 'swiper',
    url: 'https://swiperjs.com/',
    test: function (t: Probe) {
      if (t.Swiper) {
        return {
          version: t.Swiper.version || null,
        };
      }
      return !!u('.swiper, .swiper-container') && NONE;
    },
  },
  'AOS (Animate On Scroll)': {
    id: 'aos',
    icon: null,
    url: 'https://michalsnik.github.io/aos/',
    test: function (t: Probe) {
      return (t.AOS || !!u('[data-aos]')) && NONE;
    },
  },
  'Particles.js': {
    id: 'particles',
    icon: 'particles',
    url: 'https://vincentgarreau.com/particles.js/',
    test: function (t: Probe) {
      return (t.particlesJS || !!document.getElementById('particles-js')) && NONE;
    },
  },
  'Typed.js': {
    id: 'typed',
    icon: null,
    url: 'https://mattboldt.com/demos/typed-js/',
    test: function (t: Probe) {
      if (t.Typed && typeof t.Typed === 'function') {
        try {
          return !(!t.Typed.prototype || typeof t.Typed.prototype.destroy !== 'function') && NONE;
        } catch {
          return false;
        }
      }
      return false;
    },
  },
  'CountUp.js': {
    id: 'countup',
    icon: null,
    url: 'https://inorganik.github.io/countUp.js/',
    test: function (t: Probe) {
      if (t.CountUp && typeof t.CountUp === 'function') {
        try {
          return !(!t.CountUp.prototype || typeof t.CountUp.prototype.start !== 'function') && NONE;
        } catch {
          return false;
        }
      }
      return false;
    },
  },
  'Anime.js': {
    id: 'animejs',
    icon: 'animejs',
    url: 'https://animejs.com/',
    test: function (t: Probe) {
      return (
        !(!t.anime || typeof t.anime !== 'function' || (!t.anime.version && !t.anime.timeline)) && {
          version: t.anime.version || null,
        }
      );
    },
  },
  Lottie: {
    id: 'lottie',
    icon: 'lottie',
    url: 'https://airbnb.io/lottie/',
    test: function (t: Probe) {
      return (
        !(!t.lottie || (!t.lottie.loadAnimation && !t.lottie.version)) && {
          version: t.lottie.version || null,
        }
      );
    },
  },
  'Parsley.js': {
    id: 'parsley',
    icon: null,
    url: 'https://parsleyjs.org/',
    test: function (t: Probe) {
      if (t.Parsley && (t.Parsley.version || t.Parsley.Factory)) {
        return {
          version: t.Parsley.version || null,
        };
      }
      return !!u('[data-parsley-validate]') && NONE;
    },
  },
  'jQuery Validation': {
    id: 'jquery-validation',
    icon: null,
    url: 'https://jqueryvalidation.org/',
    test: function (t: Probe) {
      return (
        !!(t.jQuery && t.jQuery.fn && t.jQuery.fn.validate) && {
          version: t.jQuery.fn.validate.version || null,
        }
      );
    },
  },
  Lucide: {
    id: 'lucide',
    icon: 'lucide',
    url: 'https://lucide.dev/',
    test: function () {
      return !!u('[data-lucide]') && NONE;
    },
  },
  'Phosphor Icons': {
    id: 'phosphor',
    icon: 'phosphor',
    url: 'https://phosphoricons.com/',
    test: function (t: Probe) {
      if (t.phosphor && n(t.phosphor) === 'object') {
        return NONE;
      }
      return (
        !!u(
          [
            'i[class^="ph-bold"]',
            'i[class^="ph-duotone"]',
            'i[class^="ph-fill"]',
            'i[class^="ph-light"]',
            'i[class^="ph-thin"]',
            'i[class^="ph-regular"]',
          ].join(', '),
        ) && NONE
      );
    },
  },
  Ionicons: {
    id: 'ionicons',
    icon: 'ionicons',
    url: 'https://ionic.io/ionicons',
    test: function () {
      return !!u('ion-icon') && NONE;
    },
  },
  'Radix UI': {
    id: 'radix-ui',
    icon: 'radix',
    url: 'https://www.radix-ui.com/',
    test: function () {
      return !(!u('[data-radix-portal]') && !u('[data-radix-dialog]')) && NONE;
    },
  },
  'Headless UI': {
    id: 'headlessui',
    icon: null,
    url: 'https://headlessui.com/',
    test: function () {
      return !!u('[data-headlessui-state]') && NONE;
    },
  },
  PrimeNG: {
    id: 'primeng',
    icon: 'primeng',
    url: 'https://primeng.org/',
    test: function (t: Probe) {
      return (
        !!(t.ng && u('.p-component') && u('[class^="p-button"], [class^="p-inputtext"]')) && NONE
      );
    },
  },
  PrimeReact: {
    id: 'primereact',
    icon: 'primereact',
    url: 'https://primereact.org/',
    test: function (t: Probe) {
      return (
        !(
          (!t.React && !u('[data-reactroot], [data-reactid]')) ||
          !u('.p-component') ||
          !u('[class^="p-button"], [class^="p-inputtext"]')
        ) && NONE
      );
    },
  },
  UnoCSS: {
    id: 'unocss',
    icon: 'unocss',
    url: 'https://unocss.dev/',
    test: function (t: Probe) {
      return !!t.__unocss && NONE;
    },
  },
  Tachyons: {
    id: 'tachyons',
    icon: null,
    url: 'https://tachyons.io/',
    test: function () {
      const n = `${document.body.className} ${c()
        .slice(0, 100)
        .map((t) => t.className)
        .join(' ')}`;
      return (
        !(
          !/\b(pa[0-7]|ma[0-7]|mv[0-7]|mh[0-7]|pv[0-7]|ph[0-7])\b/.test(n) ||
          !/\b(db|dib|dn|dt|dtc)\b/.test(n)
        ) && NONE
      );
    },
  },
  Quasar: {
    id: 'quasar',
    icon: 'quasar',
    url: 'https://quasar.dev/',
    test: function (t: Probe) {
      return (
        !(!t.Quasar || (!t.Quasar.version && !t.Quasar.components)) && {
          version: t.Quasar.version || null,
        }
      );
    },
  },
  Vuetify: {
    id: 'vuetify',
    icon: 'vuetify',
    url: 'https://vuetifyjs.com/',
    test: function (t: Probe) {
      return (
        !(!t.$vuetify || (!t.$vuetify.version && !t.$vuetify.theme)) && {
          version: t.$vuetify.version || null,
        }
      );
    },
  },
  'Google Fonts': {
    id: 'google-fonts',
    icon: 'google-fonts',
    url: 'https://fonts.google.com/',
    test: function () {
      const n = u('link[href*="fonts.googleapis.com"]');
      const e = u('link[rel="preconnect"][href*="fonts.gstatic.com"]');
      const o = performance
        .getEntriesByType('resource')
        .some(
          (t) => t.name.includes('fonts.gstatic.com') || t.name.includes('fonts.googleapis.com'),
        );
      return !!(n || e || o) && NONE;
    },
  },
  'Google Tag Manager': {
    id: 'google-tag-manager',
    icon: 'google-tag-manager',
    url: 'https://tagmanager.google.com/',
    test: function (t: Probe) {
      if (n(t.google_tag_manager) === 'object' && Array.isArray(t.dataLayer)) {
        let e = null;
        const o = u('script[src*="googletagmanager.com/gtm.js"]');
        if (o) {
          const r = o.src.match(/id=(GTM-[A-Z0-9]+)/);
          if (r) {
            e = r[1];
          }
        }
        return {
          version: e,
        };
      }
      return false;
    },
  },
  Cloudflare: {
    id: 'cloudflare',
    icon: 'cloudflare',
    url: 'https://www.cloudflare.com/',
    test: function (t: Probe) {
      return (
        !!(
          u('script[src*="cloudflare.com"]') ||
          u('script[src*="cloudflareinsights.com"]') ||
          t.document.cookie.includes('__cflb') ||
          t.document.cookie.includes('__cf_bm')
        ) && NONE
      );
    },
  },
  'Meta Pixel': {
    id: 'meta-pixel',
    icon: 'meta-pixel',
    url: 'https://www.facebook.com/business/tools/meta-pixel',
    test: function (t: Probe) {
      if (typeof t.fbq === 'function' && t._fbq !== undefined) {
        let n = null;
        const e = u('script[src*="connect.facebook.net"]');
        if (e) {
          const o = e.src.match(/v(\d+\.\d+)/);
          if (o) {
            n = o[1];
          }
        }
        return {
          version: n,
        };
      }
      return false;
    },
  },
  'Google Ads': {
    id: 'google-ads',
    icon: 'google-ads',
    url: 'https://ads.google.com/',
    test: function (t: Probe) {
      return (
        !(
          typeof t.gtag !== 'function' &&
          !u('script[src*="googleadservices.com"]') &&
          !u('script[src*="googlesyndication.com"]')
        ) && NONE
      );
    },
  },
  Akamai: {
    id: 'akamai',
    icon: 'akamai',
    url: 'https://www.akamai.com/',
    test: function () {
      return (
        !!(
          u('script[src*="edgekey.net"]') ||
          u('script[src*="akamaihd.net"]') ||
          u('script[src*="akamaized.net"]')
        ) && NONE
      );
    },
  },
  Hotjar: {
    id: 'hotjar',
    icon: 'hotjar',
    url: 'https://www.hotjar.com/',
    test: function (t: Probe) {
      if (typeof t.hj === 'function' || (n(t.hj) === 'object' && t.hj.q)) {
        let e = null;
        const o = u('script[src*="hotjar.com"]');
        if (o) {
          const r = o.src.match(/hjid=(\d+)/);
          if (r) {
            e = `ID: ${r[1]}`;
          }
        }
        return {
          version: e,
        };
      }
      return false;
    },
  },
  Segment: {
    id: 'segment',
    icon: 'segment',
    url: 'https://segment.com/',
    test: function (t: Probe) {
      return (
        n(t.analytics) === 'object' &&
        typeof t.analytics.track === 'function' &&
        typeof t.analytics.identify === 'function' &&
        n(t.analytics.Integrations) === 'object' &&
        NONE
      );
    },
  },
  Mixpanel: {
    id: 'mixpanel',
    icon: 'mixpanel',
    url: 'https://mixpanel.com/',
    test: function (t: Probe) {
      return (
        !(
          n(t.mixpanel) !== 'object' ||
          typeof t.mixpanel.track !== 'function' ||
          !t.mixpanel.__loaded
        ) && NONE
      );
    },
  },
  Amplitude: {
    id: 'amplitude',
    icon: 'amplitude',
    url: 'https://amplitude.com/',
    test: function (t: Probe) {
      return n(t.amplitude) === 'object' && typeof t.amplitude.getInstance === 'function' && NONE;
    },
  },
  Matomo: {
    id: 'matomo',
    icon: 'matomo',
    url: 'https://matomo.org/',
    test: function (t: Probe) {
      return !(t._paq === undefined || !Array.isArray(t._paq)) && NONE;
    },
  },
  HubSpot: {
    id: 'hubspot',
    icon: 'hubspot',
    url: 'https://www.hubspot.com/',
    test: function (t: Probe) {
      return !(t._hsq === undefined || !Array.isArray(t._hsq)) && NONE;
    },
  },
  Intercom: {
    id: 'intercom',
    icon: 'intercom',
    url: 'https://www.intercom.com/',
    test: function (t: Probe) {
      return typeof t.Intercom === 'function' && n(t.intercomSettings) === 'object' && NONE;
    },
  },
  Drift: {
    id: 'drift',
    icon: 'drift',
    url: 'https://www.drift.com/',
    test: function (t: Probe) {
      return n(t.drift) === 'object' && n(t.drift.api) === 'object' && NONE;
    },
  },
  Fastly: {
    id: 'fastly',
    icon: 'fastly',
    url: 'https://www.fastly.com/',
    test: function () {
      return !(!u('meta[name="fastly-id"]') && !u('script[src*="fastly.net"]')) && NONE;
    },
  },
  Netlify: {
    id: 'netlify',
    icon: 'netlify',
    url: 'https://www.netlify.com/',
    test: function () {
      for (let n = a('meta[name="generator"]'), e = 0; e < n.length; e++) {
        if (n[e].content && n[e].content.includes('Netlify')) {
          return NONE;
        }
      }
      return false;
    },
  },
  'Cloudflare Pages': {
    id: 'cloudflare-pages',
    icon: 'cloudflare',
    url: 'https://pages.cloudflare.com/',
    test: function () {
      const n = u('meta[name="generator"]');
      return !!(n && n.content && n.content.includes('Cloudflare Pages')) && NONE;
    },
  },
  Optimizely: {
    id: 'optimizely',
    icon: 'optimizely',
    url: 'https://www.optimizely.com/',
    test: function (t: Probe) {
      return (
        !(
          t.optimizely === undefined ||
          !Array.isArray(t.optimizely) ||
          typeof t.optimizely.push !== 'function'
        ) && NONE
      );
    },
  },
  VWO: {
    id: 'vwo',
    icon: 'vwo',
    url: 'https://vwo.com/',
    test: function (t: Probe) {
      return (t._vwo_code !== undefined || t.VWO !== undefined) && NONE;
    },
  },
  'Google Optimize': {
    id: 'google-optimize',
    icon: 'google-optimize',
    url: 'https://optimize.google.com/',
    test: function (t: Probe) {
      return !(!u('script[src*="optimize.google.com"]') && t.google_optimize === undefined) && NONE;
    },
  },
  Bugsnag: {
    id: 'bugsnag',
    icon: 'bugsnag',
    url: 'https://www.bugsnag.com/',
    test: function (t: Probe) {
      return t.Bugsnag !== undefined && typeof t.Bugsnag.notify === 'function' && NONE;
    },
  },
  Rollbar: {
    id: 'rollbar',
    icon: 'rollbar',
    url: 'https://rollbar.com/',
    test: function (t: Probe) {
      return t.Rollbar !== undefined && typeof t.Rollbar.error === 'function' && NONE;
    },
  },
  LogRocket: {
    id: 'logrocket',
    icon: 'logrocket',
    url: 'https://logrocket.com/',
    test: function (t: Probe) {
      return t.LogRocket !== undefined && typeof t.LogRocket.init === 'function' && NONE;
    },
  },
  FullStory: {
    id: 'fullstory',
    icon: 'fullstory',
    url: 'https://www.fullstory.com/',
    test: function (t: Probe) {
      return t.FS !== undefined && typeof t.FS.identify === 'function' && NONE;
    },
  },
};

const REACT_HOSTS = ['next', 'gatsby', 'remix', 'astro'];

/** Legacy run loop (:3200): one try per signature; meta-frameworks imply React. */
export function detectAll(w: Probe): Technology[] {
  roots = null;
  const out: Technology[] = [];
  for (const [name, sig] of Object.entries(SIGNATURES)) {
    try {
      const hit = sig.test(w);
      if (!hit) continue;
      const v = hit.version;
      out.push({
        id: sig.id,
        name,
        version: v != null ? (Array.isArray(v) ? v.join(', ') : String(v)) : null,
        url: sig.url,
        icon: sig.icon,
      });
      if (REACT_HOSTS.includes(sig.id) && !out.some((t) => t.id === 'react'))
        out.push({
          id: 'react',
          name: 'React',
          version: null,
          url: 'https://reactjs.org/',
          icon: 'react',
        });
    } catch {
      /* one broken probe must not spoil the run */
    }
  }
  roots = null;
  return out;
}
