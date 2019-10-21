
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (!store || typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, callback) {
        const unsub = store.subscribe(callback);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.ctx, definition[1](fn ? fn(ctx) : {})))
            : ctx.$$scope.ctx;
    }
    function get_slot_changes(definition, ctx, changed, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.changed || {}, definition[1](fn ? fn(changed) : {})))
            : ctx.$$scope.changed || {};
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    let running = false;
    function run_tasks() {
        tasks.forEach(task => {
            if (!task[0](now())) {
                tasks.delete(task);
                task[1]();
            }
        });
        running = tasks.size > 0;
        if (running)
            raf(run_tasks);
    }
    function loop(fn) {
        let task;
        if (!running) {
            running = true;
            raf(run_tasks);
        }
        return {
            promise: new Promise(fulfil => {
                tasks.add(task = [fn, fulfil]);
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        for (const key in attributes) {
            if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key in node) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    class HtmlTag {
        constructor(html, anchor = null) {
            this.e = element('div');
            this.a = anchor;
            this.u(html);
        }
        m(target, anchor = null) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(target, this.n[i], anchor);
            }
            this.t = target;
        }
        u(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        p(html) {
            this.d();
            this.u(html);
            this.m(this.t, this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    let stylesheet;
    let active = 0;
    let current_rules = {};
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        if (!current_rules[name]) {
            if (!stylesheet) {
                const style = element('style');
                document.head.appendChild(style);
                stylesheet = style.sheet;
            }
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        node.style.animation = (node.style.animation || '')
            .split(', ')
            .filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        )
            .join(', ');
        if (name && !--active)
            clear_rules();
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            let i = stylesheet.cssRules.length;
            while (i--)
                stylesheet.deleteRule(i);
            current_rules = {};
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = current_component;
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }

    const globals = (typeof window !== 'undefined' ? window : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
                return ret;
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, detail));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    /**
     * Derived value store by synchronizing one or more readable stores and
     * applying an aggregation function over its input values.
     * @param {Stores} stores input stores
     * @param {function(Stores=, function(*)=):*}fn function callback that aggregates the values
     * @param {*=}initial_value when used asynchronously
     */
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => store.subscribe((value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const LOCATION = {};
    const ROUTER = {};

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    function getLocation(source) {
      return {
        ...source.location,
        state: source.history.state,
        key: (source.history.state && source.history.state.key) || "initial"
      };
    }

    function createHistory(source, options) {
      const listeners = [];
      let location = getLocation(source);

      return {
        get location() {
          return location;
        },

        listen(listener) {
          listeners.push(listener);

          const popstateListener = () => {
            location = getLocation(source);
            listener({ location, action: "POP" });
          };

          source.addEventListener("popstate", popstateListener);

          return () => {
            source.removeEventListener("popstate", popstateListener);

            const index = listeners.indexOf(listener);
            listeners.splice(index, 1);
          };
        },

        navigate(to, { state, replace = false } = {}) {
          state = { ...state, key: Date.now() + "" };
          // try...catch iOS Safari limits to 100 pushState calls
          try {
            if (replace) {
              source.history.replaceState(state, null, to);
            } else {
              source.history.pushState(state, null, to);
            }
          } catch (e) {
            source.location[replace ? "replace" : "assign"](to);
          }

          location = getLocation(source);
          listeners.forEach(listener => listener({ location, action: "PUSH" }));
        }
      };
    }

    // Stores history entries in memory for testing or other platforms like Native
    function createMemorySource(initialPathname = "/") {
      let index = 0;
      const stack = [{ pathname: initialPathname, search: "" }];
      const states = [];

      return {
        get location() {
          return stack[index];
        },
        addEventListener(name, fn) {},
        removeEventListener(name, fn) {},
        history: {
          get entries() {
            return stack;
          },
          get index() {
            return index;
          },
          get state() {
            return states[index];
          },
          pushState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            index++;
            stack.push({ pathname, search });
            states.push(state);
          },
          replaceState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            stack[index] = { pathname, search };
            states[index] = state;
          }
        }
      };
    }

    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const canUseDOM = Boolean(
      typeof window !== "undefined" &&
        window.document &&
        window.document.createElement
    );
    const globalHistory = createHistory(canUseDOM ? window : createMemorySource());
    const { navigate } = globalHistory;

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    const paramRe = /^:(.+)/;

    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Check if `string` starts with `search`
     * @param {string} string
     * @param {string} search
     * @return {boolean}
     */
    function startsWith(string, search) {
      return string.substr(0, search.length) === search;
    }

    /**
     * Check if `segment` is a root segment
     * @param {string} segment
     * @return {boolean}
     */
    function isRootSegment(segment) {
      return segment === "";
    }

    /**
     * Check if `segment` is a dynamic segment
     * @param {string} segment
     * @return {boolean}
     */
    function isDynamic(segment) {
      return paramRe.test(segment);
    }

    /**
     * Check if `segment` is a splat
     * @param {string} segment
     * @return {boolean}
     */
    function isSplat(segment) {
      return segment[0] === "*";
    }

    /**
     * Split up the URI into segments delimited by `/`
     * @param {string} uri
     * @return {string[]}
     */
    function segmentize(uri) {
      return (
        uri
          // Strip starting/ending `/`
          .replace(/(^\/+|\/+$)/g, "")
          .split("/")
      );
    }

    /**
     * Strip `str` of potential start and end `/`
     * @param {string} str
     * @return {string}
     */
    function stripSlashes(str) {
      return str.replace(/(^\/+|\/+$)/g, "");
    }

    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    function rankRoute(route, index) {
      const score = route.default
        ? 0
        : segmentize(route.path).reduce((score, segment) => {
            score += SEGMENT_POINTS;

            if (isRootSegment(segment)) {
              score += ROOT_POINTS;
            } else if (isDynamic(segment)) {
              score += DYNAMIC_POINTS;
            } else if (isSplat(segment)) {
              score -= SEGMENT_POINTS + SPLAT_PENALTY;
            } else {
              score += STATIC_POINTS;
            }

            return score;
          }, 0);

      return { route, score, index };
    }

    /**
     * Give a score to all routes and sort them on that
     * @param {object[]} routes
     * @return {object[]}
     */
    function rankRoutes(routes) {
      return (
        routes
          .map(rankRoute)
          // If two routes have the exact same score, we go by index instead
          .sort((a, b) =>
            a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
          )
      );
    }

    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { path, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    function pick(routes, uri) {
      let match;
      let default_;

      const [uriPathname] = uri.split("?");
      const uriSegments = segmentize(uriPathname);
      const isRootUri = uriSegments[0] === "";
      const ranked = rankRoutes(routes);

      for (let i = 0, l = ranked.length; i < l; i++) {
        const route = ranked[i].route;
        let missed = false;

        if (route.default) {
          default_ = {
            route,
            params: {},
            uri
          };
          continue;
        }

        const routeSegments = segmentize(route.path);
        const params = {};
        const max = Math.max(uriSegments.length, routeSegments.length);
        let index = 0;

        for (; index < max; index++) {
          const routeSegment = routeSegments[index];
          const uriSegment = uriSegments[index];

          if (routeSegment !== undefined && isSplat(routeSegment)) {
            // Hit a splat, just grab the rest, and return a match
            // uri:   /files/documents/work
            // route: /files/* or /files/*splatname
            const splatName = routeSegment === "*" ? "*" : routeSegment.slice(1);

            params[splatName] = uriSegments
              .slice(index)
              .map(decodeURIComponent)
              .join("/");
            break;
          }

          if (uriSegment === undefined) {
            // URI is shorter than the route, no match
            // uri:   /users
            // route: /users/:userId
            missed = true;
            break;
          }

          let dynamicMatch = paramRe.exec(routeSegment);

          if (dynamicMatch && !isRootUri) {
            const value = decodeURIComponent(uriSegment);
            params[dynamicMatch[1]] = value;
          } else if (routeSegment !== uriSegment) {
            // Current segments don't match, not dynamic, not splat, so no match
            // uri:   /users/123/settings
            // route: /users/:id/profile
            missed = true;
            break;
          }
        }

        if (!missed) {
          match = {
            route,
            params,
            uri: "/" + uriSegments.slice(0, index).join("/")
          };
          break;
        }
      }

      return match || default_ || null;
    }

    /**
     * Check if the `path` matches the `uri`.
     * @param {string} path
     * @param {string} uri
     * @return {?object}
     */
    function match(route, uri) {
      return pick([route], uri);
    }

    /**
     * Add the query to the pathname if a query is given
     * @param {string} pathname
     * @param {string} [query]
     * @return {string}
     */
    function addQuery(pathname, query) {
      return pathname + (query ? `?${query}` : "");
    }

    /**
     * Resolve URIs as though every path is a directory, no files. Relative URIs
     * in the browser can feel awkward because not only can you be "in a directory",
     * you can be "at a file", too. For example:
     *
     *  browserSpecResolve('foo', '/bar/') => /bar/foo
     *  browserSpecResolve('foo', '/bar') => /foo
     *
     * But on the command line of a file system, it's not as complicated. You can't
     * `cd` from a file, only directories. This way, links have to know less about
     * their current path. To go deeper you can do this:
     *
     *  <Link to="deeper"/>
     *  // instead of
     *  <Link to=`{${props.uri}/deeper}`/>
     *
     * Just like `cd`, if you want to go deeper from the command line, you do this:
     *
     *  cd deeper
     *  # not
     *  cd $(pwd)/deeper
     *
     * By treating every path as a directory, linking to relative paths should
     * require less contextual information and (fingers crossed) be more intuitive.
     * @param {string} to
     * @param {string} base
     * @return {string}
     */
    function resolve(to, base) {
      // /foo/bar, /baz/qux => /foo/bar
      if (startsWith(to, "/")) {
        return to;
      }

      const [toPathname, toQuery] = to.split("?");
      const [basePathname] = base.split("?");
      const toSegments = segmentize(toPathname);
      const baseSegments = segmentize(basePathname);

      // ?a=b, /users?b=c => /users?a=b
      if (toSegments[0] === "") {
        return addQuery(basePathname, toQuery);
      }

      // profile, /users/789 => /users/789/profile
      if (!startsWith(toSegments[0], ".")) {
        const pathname = baseSegments.concat(toSegments).join("/");

        return addQuery((basePathname === "/" ? "" : "/") + pathname, toQuery);
      }

      // ./       , /users/123 => /users/123
      // ../      , /users/123 => /users
      // ../..    , /users/123 => /
      // ../../one, /a/b/c/d   => /a/b/one
      // .././one , /a/b/c/d   => /a/b/c/one
      const allSegments = baseSegments.concat(toSegments);
      const segments = [];

      allSegments.forEach(segment => {
        if (segment === "..") {
          segments.pop();
        } else if (segment !== ".") {
          segments.push(segment);
        }
      });

      return addQuery("/" + segments.join("/"), toQuery);
    }

    /**
     * Combines the `basepath` and the `path` into one path.
     * @param {string} basepath
     * @param {string} path
     */
    function combinePaths(basepath, path) {
      return `${stripSlashes(
    path === "/" ? basepath : `${stripSlashes(basepath)}/${stripSlashes(path)}`
  )}/`;
    }

    /**
     * Decides whether a given `event` should result in a navigation or not.
     * @param {object} event
     */
    function shouldNavigate(event) {
      return (
        !event.defaultPrevented &&
        event.button === 0 &&
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
      );
    }

    /* node_modules/svelte-routing/src/Router.svelte generated by Svelte v3.12.1 */

    function create_fragment(ctx) {
    	var current;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $base, $location, $routes;

    	

      let { basepath = "/", url = null } = $$props;

      const locationContext = getContext(LOCATION);
      const routerContext = getContext(ROUTER);

      const routes = writable([]); validate_store(routes, 'routes'); component_subscribe($$self, routes, $$value => { $routes = $$value; $$invalidate('$routes', $routes); });
      const activeRoute = writable(null);
      let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

      // If locationContext is not set, this is the topmost Router in the tree.
      // If the `url` prop is given we force the location to it.
      const location =
        locationContext ||
        writable(url ? { pathname: url } : globalHistory.location); validate_store(location, 'location'); component_subscribe($$self, location, $$value => { $location = $$value; $$invalidate('$location', $location); });

      // If routerContext is set, the routerBase of the parent Router
      // will be the base for this Router's descendants.
      // If routerContext is not set, the path and resolved uri will both
      // have the value of the basepath prop.
      const base = routerContext
        ? routerContext.routerBase
        : writable({
            path: basepath,
            uri: basepath
          }); validate_store(base, 'base'); component_subscribe($$self, base, $$value => { $base = $$value; $$invalidate('$base', $base); });

      const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
        // If there is no activeRoute, the routerBase will be identical to the base.
        if (activeRoute === null) {
          return base;
        }

        const { path: basepath } = base;
        const { route, uri } = activeRoute;
        // Remove the potential /* or /*splatname from
        // the end of the child Routes relative paths.
        const path = route.default ? basepath : route.path.replace(/\*.*$/, "");

        return { path, uri };
      });

      function registerRoute(route) {
        const { path: basepath } = $base;
        let { path } = route;

        // We store the original path in the _path property so we can reuse
        // it when the basepath changes. The only thing that matters is that
        // the route reference is intact, so mutation is fine.
        route._path = path;
        route.path = combinePaths(basepath, path);

        if (typeof window === "undefined") {
          // In SSR we should set the activeRoute immediately if it is a match.
          // If there are more Routes being registered after a match is found,
          // we just skip them.
          if (hasActiveRoute) {
            return;
          }

          const matchingRoute = match(route, $location.pathname);
          if (matchingRoute) {
            activeRoute.set(matchingRoute);
            hasActiveRoute = true;
          }
        } else {
          routes.update(rs => {
            rs.push(route);
            return rs;
          });
        }
      }

      function unregisterRoute(route) {
        routes.update(rs => {
          const index = rs.indexOf(route);
          rs.splice(index, 1);
          return rs;
        });
      }

      if (!locationContext) {
        // The topmost Router in the tree is responsible for updating
        // the location store and supplying it through context.
        onMount(() => {
          const unlisten = globalHistory.listen(history => {
            location.set(history.location);
          });

          return unlisten;
        });

        setContext(LOCATION, location);
      }

      setContext(ROUTER, {
        activeRoute,
        base,
        routerBase,
        registerRoute,
        unregisterRoute
      });

    	const writable_props = ['basepath', 'url'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('basepath' in $$props) $$invalidate('basepath', basepath = $$props.basepath);
    		if ('url' in $$props) $$invalidate('url', url = $$props.url);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return { basepath, url, hasActiveRoute, $base, $location, $routes };
    	};

    	$$self.$inject_state = $$props => {
    		if ('basepath' in $$props) $$invalidate('basepath', basepath = $$props.basepath);
    		if ('url' in $$props) $$invalidate('url', url = $$props.url);
    		if ('hasActiveRoute' in $$props) hasActiveRoute = $$props.hasActiveRoute;
    		if ('$base' in $$props) base.set($base);
    		if ('$location' in $$props) location.set($location);
    		if ('$routes' in $$props) routes.set($routes);
    	};

    	$$self.$$.update = ($$dirty = { $base: 1, $routes: 1, $location: 1 }) => {
    		if ($$dirty.$base) { {
            const { path: basepath } = $base;
            routes.update(rs => {
              rs.forEach(r => (r.path = combinePaths(basepath, r._path)));
              return rs;
            });
          } }
    		if ($$dirty.$routes || $$dirty.$location) { {
            const bestMatch = pick($routes, $location.pathname);
            activeRoute.set(bestMatch);
          } }
    	};

    	return {
    		basepath,
    		url,
    		routes,
    		location,
    		base,
    		$$slots,
    		$$scope
    	};
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["basepath", "url"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Router", options, id: create_fragment.name });
    	}

    	get basepath() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basepath(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-routing/src/Route.svelte generated by Svelte v3.12.1 */

    const get_default_slot_changes = ({ routeParams, $location }) => ({ params: routeParams, location: $location });
    const get_default_slot_context = ({ routeParams, $location }) => ({
    	params: routeParams,
    	location: $location
    });

    // (40:0) {#if $activeRoute !== null && $activeRoute.route === route}
    function create_if_block(ctx) {
    	var current_block_type_index, if_block, if_block_anchor, current;

    	var if_block_creators = [
    		create_if_block_1,
    		create_else_block
    	];

    	var if_blocks = [];

    	function select_block_type(changed, ctx) {
    		if (ctx.component !== null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(null, ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(changed, ctx);
    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(changed, ctx);
    			} else {
    				group_outros();
    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});
    				check_outros();

    				if_block = if_blocks[current_block_type_index];
    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}
    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);

    			if (detaching) {
    				detach_dev(if_block_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block.name, type: "if", source: "(40:0) {#if $activeRoute !== null && $activeRoute.route === route}", ctx });
    	return block;
    }

    // (43:2) {:else}
    function create_else_block(ctx) {
    	var current;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(nodes);
    		},

    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && (changed.$$scope || changed.routeParams || changed.$location)) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, get_default_slot_changes),
    					get_slot_context(default_slot_template, ctx, get_default_slot_context)
    				);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block.name, type: "else", source: "(43:2) {:else}", ctx });
    	return block;
    }

    // (41:2) {#if component !== null}
    function create_if_block_1(ctx) {
    	var switch_instance_anchor, current;

    	var switch_instance_spread_levels = [
    		{ location: ctx.$location },
    		ctx.routeParams,
    		ctx.routeProps
    	];

    	var switch_value = ctx.component;

    	function switch_props(ctx) {
    		let switch_instance_props = {};
    		for (var i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}
    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) switch_instance.$$.fragment.c();
    			switch_instance_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var switch_instance_changes = (changed.$location || changed.routeParams || changed.routeProps) ? get_spread_update(switch_instance_spread_levels, [
    									(changed.$location) && { location: ctx.$location },
    			(changed.routeParams) && get_spread_object(ctx.routeParams),
    			(changed.routeProps) && get_spread_object(ctx.routeProps)
    								]) : {};

    			if (switch_value !== (switch_value = ctx.component)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;
    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});
    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());

    					switch_instance.$$.fragment.c();
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}

    			else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(switch_instance_anchor);
    			}

    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_1.name, type: "if", source: "(41:2) {#if component !== null}", ctx });
    	return block;
    }

    function create_fragment$1(ctx) {
    	var if_block_anchor, current;

    	var if_block = (ctx.$activeRoute !== null && ctx.$activeRoute.route === ctx.route) && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.$activeRoute !== null && ctx.$activeRoute.route === ctx.route) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();
    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach_dev(if_block_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$1.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $activeRoute, $location;

    	

      let { path = "", component = null } = $$props;

      const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER); validate_store(activeRoute, 'activeRoute'); component_subscribe($$self, activeRoute, $$value => { $activeRoute = $$value; $$invalidate('$activeRoute', $activeRoute); });
      const location = getContext(LOCATION); validate_store(location, 'location'); component_subscribe($$self, location, $$value => { $location = $$value; $$invalidate('$location', $location); });

      const route = {
        path,
        // If no path prop is given, this Route will act as the default Route
        // that is rendered if no other Route in the Router is a match.
        default: path === ""
      };
      let routeParams = {};
      let routeProps = {};

      registerRoute(route);

      // There is no need to unregister Routes in SSR since it will all be
      // thrown away anyway.
      if (typeof window !== "undefined") {
        onDestroy(() => {
          unregisterRoute(route);
        });
      }

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$new_props => {
    		$$invalidate('$$props', $$props = assign(assign({}, $$props), $$new_props));
    		if ('path' in $$new_props) $$invalidate('path', path = $$new_props.path);
    		if ('component' in $$new_props) $$invalidate('component', component = $$new_props.component);
    		if ('$$scope' in $$new_props) $$invalidate('$$scope', $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return { path, component, routeParams, routeProps, $activeRoute, $location };
    	};

    	$$self.$inject_state = $$new_props => {
    		$$invalidate('$$props', $$props = assign(assign({}, $$props), $$new_props));
    		if ('path' in $$props) $$invalidate('path', path = $$new_props.path);
    		if ('component' in $$props) $$invalidate('component', component = $$new_props.component);
    		if ('routeParams' in $$props) $$invalidate('routeParams', routeParams = $$new_props.routeParams);
    		if ('routeProps' in $$props) $$invalidate('routeProps', routeProps = $$new_props.routeProps);
    		if ('$activeRoute' in $$props) activeRoute.set($activeRoute);
    		if ('$location' in $$props) location.set($location);
    	};

    	$$self.$$.update = ($$dirty = { $activeRoute: 1, $$props: 1 }) => {
    		if ($$dirty.$activeRoute) { if ($activeRoute && $activeRoute.route === route) {
            $$invalidate('routeParams', routeParams = $activeRoute.params);
          } }
    		{
            const { path, component, ...rest } = $$props;
            $$invalidate('routeProps', routeProps = rest);
          }
    	};

    	return {
    		path,
    		component,
    		activeRoute,
    		location,
    		route,
    		routeParams,
    		routeProps,
    		$activeRoute,
    		$location,
    		$$props: $$props = exclude_internal_props($$props),
    		$$slots,
    		$$scope
    	};
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, ["path", "component"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Route", options, id: create_fragment$1.name });
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-routing/src/Link.svelte generated by Svelte v3.12.1 */

    const file = "node_modules/svelte-routing/src/Link.svelte";

    function create_fragment$2(ctx) {
    	var a, current, dispose;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	var a_levels = [
    		{ href: ctx.href },
    		{ "aria-current": ctx.ariaCurrent },
    		ctx.props
    	];

    	var a_data = {};
    	for (var i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");

    			if (default_slot) default_slot.c();

    			set_attributes(a, a_data);
    			add_location(a, file, 40, 0, 1249);
    			dispose = listen_dev(a, "click", ctx.onClick);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(a_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
    			}

    			set_attributes(a, get_spread_update(a_levels, [
    				(changed.href) && { href: ctx.href },
    				(changed.ariaCurrent) && { "aria-current": ctx.ariaCurrent },
    				(changed.props) && ctx.props
    			]));
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(a);
    			}

    			if (default_slot) default_slot.d(detaching);
    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$2.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $base, $location;

    	

      let { to = "#", replace = false, state = {}, getProps = () => ({}) } = $$props;

      const { base } = getContext(ROUTER); validate_store(base, 'base'); component_subscribe($$self, base, $$value => { $base = $$value; $$invalidate('$base', $base); });
      const location = getContext(LOCATION); validate_store(location, 'location'); component_subscribe($$self, location, $$value => { $location = $$value; $$invalidate('$location', $location); });
      const dispatch = createEventDispatcher();

      let href, isPartiallyCurrent, isCurrent, props;

      function onClick(event) {
        dispatch("click", event);

        if (shouldNavigate(event)) {
          event.preventDefault();
          // Don't push another entry to the history stack when the user
          // clicks on a Link to the page they are currently on.
          const shouldReplace = $location.pathname === href || replace;
          navigate(href, { state, replace: shouldReplace });
        }
      }

    	const writable_props = ['to', 'replace', 'state', 'getProps'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Link> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('to' in $$props) $$invalidate('to', to = $$props.to);
    		if ('replace' in $$props) $$invalidate('replace', replace = $$props.replace);
    		if ('state' in $$props) $$invalidate('state', state = $$props.state);
    		if ('getProps' in $$props) $$invalidate('getProps', getProps = $$props.getProps);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return { to, replace, state, getProps, href, isPartiallyCurrent, isCurrent, props, $base, $location, ariaCurrent };
    	};

    	$$self.$inject_state = $$props => {
    		if ('to' in $$props) $$invalidate('to', to = $$props.to);
    		if ('replace' in $$props) $$invalidate('replace', replace = $$props.replace);
    		if ('state' in $$props) $$invalidate('state', state = $$props.state);
    		if ('getProps' in $$props) $$invalidate('getProps', getProps = $$props.getProps);
    		if ('href' in $$props) $$invalidate('href', href = $$props.href);
    		if ('isPartiallyCurrent' in $$props) $$invalidate('isPartiallyCurrent', isPartiallyCurrent = $$props.isPartiallyCurrent);
    		if ('isCurrent' in $$props) $$invalidate('isCurrent', isCurrent = $$props.isCurrent);
    		if ('props' in $$props) $$invalidate('props', props = $$props.props);
    		if ('$base' in $$props) base.set($base);
    		if ('$location' in $$props) location.set($location);
    		if ('ariaCurrent' in $$props) $$invalidate('ariaCurrent', ariaCurrent = $$props.ariaCurrent);
    	};

    	let ariaCurrent;

    	$$self.$$.update = ($$dirty = { to: 1, $base: 1, $location: 1, href: 1, isCurrent: 1, getProps: 1, isPartiallyCurrent: 1 }) => {
    		if ($$dirty.to || $$dirty.$base) { $$invalidate('href', href = to === "/" ? $base.uri : resolve(to, $base.uri)); }
    		if ($$dirty.$location || $$dirty.href) { $$invalidate('isPartiallyCurrent', isPartiallyCurrent = startsWith($location.pathname, href)); }
    		if ($$dirty.href || $$dirty.$location) { $$invalidate('isCurrent', isCurrent = href === $location.pathname); }
    		if ($$dirty.isCurrent) { $$invalidate('ariaCurrent', ariaCurrent = isCurrent ? "page" : undefined); }
    		if ($$dirty.getProps || $$dirty.$location || $$dirty.href || $$dirty.isPartiallyCurrent || $$dirty.isCurrent) { $$invalidate('props', props = getProps({
            location: $location,
            href,
            isPartiallyCurrent,
            isCurrent
          })); }
    	};

    	return {
    		to,
    		replace,
    		state,
    		getProps,
    		base,
    		location,
    		href,
    		props,
    		onClick,
    		ariaCurrent,
    		$$slots,
    		$$scope
    	};
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, ["to", "replace", "state", "getProps"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Link", options, id: create_fragment$2.name });
    	}

    	get to() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get state() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getProps() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getProps(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /*
    object-assign
    (c) Sindre Sorhus
    @license MIT
    */
    /* eslint-disable no-unused-vars */
    var getOwnPropertySymbols = Object.getOwnPropertySymbols;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var propIsEnumerable = Object.prototype.propertyIsEnumerable;

    function toObject(val) {
    	if (val === null || val === undefined) {
    		throw new TypeError('Object.assign cannot be called with null or undefined');
    	}

    	return Object(val);
    }

    function shouldUseNative() {
    	try {
    		if (!Object.assign) {
    			return false;
    		}

    		// Detect buggy property enumeration order in older V8 versions.

    		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
    		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
    		test1[5] = 'de';
    		if (Object.getOwnPropertyNames(test1)[0] === '5') {
    			return false;
    		}

    		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
    		var test2 = {};
    		for (var i = 0; i < 10; i++) {
    			test2['_' + String.fromCharCode(i)] = i;
    		}
    		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
    			return test2[n];
    		});
    		if (order2.join('') !== '0123456789') {
    			return false;
    		}

    		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
    		var test3 = {};
    		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
    			test3[letter] = letter;
    		});
    		if (Object.keys(Object.assign({}, test3)).join('') !==
    				'abcdefghijklmnopqrst') {
    			return false;
    		}

    		return true;
    	} catch (err) {
    		// We don't expect any of the above to throw, but better to be safe.
    		return false;
    	}
    }

    var objectAssign = shouldUseNative() ? Object.assign : function (target, source) {
    	var from;
    	var to = toObject(target);
    	var symbols;

    	for (var s = 1; s < arguments.length; s++) {
    		from = Object(arguments[s]);

    		for (var key in from) {
    			if (hasOwnProperty.call(from, key)) {
    				to[key] = from[key];
    			}
    		}

    		if (getOwnPropertySymbols) {
    			symbols = getOwnPropertySymbols(from);
    			for (var i = 0; i < symbols.length; i++) {
    				if (propIsEnumerable.call(from, symbols[i])) {
    					to[symbols[i]] = from[symbols[i]];
    				}
    			}
    		}
    	}

    	return to;
    };

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function unwrapExports (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    function getCjsExportFromNamespace (n) {
    	return n && n['default'] || n;
    }

    var isFunction_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function isFunction(x) {
        return typeof x === 'function';
    }
    exports.isFunction = isFunction;
    //# sourceMappingURL=isFunction.js.map
    });

    unwrapExports(isFunction_1);
    var isFunction_2 = isFunction_1.isFunction;

    var config = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var _enable_super_gross_mode_that_will_cause_bad_things = false;
    exports.config = {
        Promise: undefined,
        set useDeprecatedSynchronousErrorHandling(value) {
            if (value) {
                var error = new Error();
                console.warn('DEPRECATED! RxJS was set to use deprecated synchronous error handling behavior by code at: \n' + error.stack);
            }
            else if (_enable_super_gross_mode_that_will_cause_bad_things) {
                console.log('RxJS: Back to a better error behavior. Thank you. <3');
            }
            _enable_super_gross_mode_that_will_cause_bad_things = value;
        },
        get useDeprecatedSynchronousErrorHandling() {
            return _enable_super_gross_mode_that_will_cause_bad_things;
        },
    };
    //# sourceMappingURL=config.js.map
    });

    unwrapExports(config);
    var config_1 = config.config;

    var hostReportError_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function hostReportError(err) {
        setTimeout(function () { throw err; }, 0);
    }
    exports.hostReportError = hostReportError;
    //# sourceMappingURL=hostReportError.js.map
    });

    unwrapExports(hostReportError_1);
    var hostReportError_2 = hostReportError_1.hostReportError;

    var Observer = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });


    exports.empty = {
        closed: true,
        next: function (value) { },
        error: function (err) {
            if (config.config.useDeprecatedSynchronousErrorHandling) {
                throw err;
            }
            else {
                hostReportError_1.hostReportError(err);
            }
        },
        complete: function () { }
    };
    //# sourceMappingURL=Observer.js.map
    });

    unwrapExports(Observer);
    var Observer_1 = Observer.empty;

    var isArray = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isArray = (function () { return Array.isArray || (function (x) { return x && typeof x.length === 'number'; }); })();
    //# sourceMappingURL=isArray.js.map
    });

    unwrapExports(isArray);
    var isArray_1 = isArray.isArray;

    var isObject_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function isObject(x) {
        return x !== null && typeof x === 'object';
    }
    exports.isObject = isObject;
    //# sourceMappingURL=isObject.js.map
    });

    unwrapExports(isObject_1);
    var isObject_2 = isObject_1.isObject;

    var UnsubscriptionError = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var UnsubscriptionErrorImpl = (function () {
        function UnsubscriptionErrorImpl(errors) {
            Error.call(this);
            this.message = errors ?
                errors.length + " errors occurred during unsubscription:\n" + errors.map(function (err, i) { return i + 1 + ") " + err.toString(); }).join('\n  ') : '';
            this.name = 'UnsubscriptionError';
            this.errors = errors;
            return this;
        }
        UnsubscriptionErrorImpl.prototype = Object.create(Error.prototype);
        return UnsubscriptionErrorImpl;
    })();
    exports.UnsubscriptionError = UnsubscriptionErrorImpl;
    //# sourceMappingURL=UnsubscriptionError.js.map
    });

    unwrapExports(UnsubscriptionError);
    var UnsubscriptionError_1 = UnsubscriptionError.UnsubscriptionError;

    var Subscription_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });




    var Subscription = (function () {
        function Subscription(unsubscribe) {
            this.closed = false;
            this._parentOrParents = null;
            this._subscriptions = null;
            if (unsubscribe) {
                this._unsubscribe = unsubscribe;
            }
        }
        Subscription.prototype.unsubscribe = function () {
            var errors;
            if (this.closed) {
                return;
            }
            var _a = this, _parentOrParents = _a._parentOrParents, _unsubscribe = _a._unsubscribe, _subscriptions = _a._subscriptions;
            this.closed = true;
            this._parentOrParents = null;
            this._subscriptions = null;
            if (_parentOrParents instanceof Subscription) {
                _parentOrParents.remove(this);
            }
            else if (_parentOrParents !== null) {
                for (var index = 0; index < _parentOrParents.length; ++index) {
                    var parent_1 = _parentOrParents[index];
                    parent_1.remove(this);
                }
            }
            if (isFunction_1.isFunction(_unsubscribe)) {
                try {
                    _unsubscribe.call(this);
                }
                catch (e) {
                    errors = e instanceof UnsubscriptionError.UnsubscriptionError ? flattenUnsubscriptionErrors(e.errors) : [e];
                }
            }
            if (isArray.isArray(_subscriptions)) {
                var index = -1;
                var len = _subscriptions.length;
                while (++index < len) {
                    var sub = _subscriptions[index];
                    if (isObject_1.isObject(sub)) {
                        try {
                            sub.unsubscribe();
                        }
                        catch (e) {
                            errors = errors || [];
                            if (e instanceof UnsubscriptionError.UnsubscriptionError) {
                                errors = errors.concat(flattenUnsubscriptionErrors(e.errors));
                            }
                            else {
                                errors.push(e);
                            }
                        }
                    }
                }
            }
            if (errors) {
                throw new UnsubscriptionError.UnsubscriptionError(errors);
            }
        };
        Subscription.prototype.add = function (teardown) {
            var subscription = teardown;
            if (!teardown) {
                return Subscription.EMPTY;
            }
            switch (typeof teardown) {
                case 'function':
                    subscription = new Subscription(teardown);
                case 'object':
                    if (subscription === this || subscription.closed || typeof subscription.unsubscribe !== 'function') {
                        return subscription;
                    }
                    else if (this.closed) {
                        subscription.unsubscribe();
                        return subscription;
                    }
                    else if (!(subscription instanceof Subscription)) {
                        var tmp = subscription;
                        subscription = new Subscription();
                        subscription._subscriptions = [tmp];
                    }
                    break;
                default: {
                    throw new Error('unrecognized teardown ' + teardown + ' added to Subscription.');
                }
            }
            var _parentOrParents = subscription._parentOrParents;
            if (_parentOrParents === null) {
                subscription._parentOrParents = this;
            }
            else if (_parentOrParents instanceof Subscription) {
                if (_parentOrParents === this) {
                    return subscription;
                }
                subscription._parentOrParents = [_parentOrParents, this];
            }
            else if (_parentOrParents.indexOf(this) === -1) {
                _parentOrParents.push(this);
            }
            else {
                return subscription;
            }
            var subscriptions = this._subscriptions;
            if (subscriptions === null) {
                this._subscriptions = [subscription];
            }
            else {
                subscriptions.push(subscription);
            }
            return subscription;
        };
        Subscription.prototype.remove = function (subscription) {
            var subscriptions = this._subscriptions;
            if (subscriptions) {
                var subscriptionIndex = subscriptions.indexOf(subscription);
                if (subscriptionIndex !== -1) {
                    subscriptions.splice(subscriptionIndex, 1);
                }
            }
        };
        Subscription.EMPTY = (function (empty) {
            empty.closed = true;
            return empty;
        }(new Subscription()));
        return Subscription;
    }());
    exports.Subscription = Subscription;
    function flattenUnsubscriptionErrors(errors) {
        return errors.reduce(function (errs, err) { return errs.concat((err instanceof UnsubscriptionError.UnsubscriptionError) ? err.errors : err); }, []);
    }
    //# sourceMappingURL=Subscription.js.map
    });

    unwrapExports(Subscription_1);
    var Subscription_2 = Subscription_1.Subscription;

    var rxSubscriber = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.rxSubscriber = (function () {
        return typeof Symbol === 'function'
            ? Symbol('rxSubscriber')
            : '@@rxSubscriber_' + Math.random();
    })();
    exports.$$rxSubscriber = exports.rxSubscriber;
    //# sourceMappingURL=rxSubscriber.js.map
    });

    unwrapExports(rxSubscriber);
    var rxSubscriber_1 = rxSubscriber.rxSubscriber;
    var rxSubscriber_2 = rxSubscriber.$$rxSubscriber;

    var Subscriber_1 = createCommonjsModule(function (module, exports) {
    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });






    var Subscriber = (function (_super) {
        __extends(Subscriber, _super);
        function Subscriber(destinationOrNext, error, complete) {
            var _this = _super.call(this) || this;
            _this.syncErrorValue = null;
            _this.syncErrorThrown = false;
            _this.syncErrorThrowable = false;
            _this.isStopped = false;
            switch (arguments.length) {
                case 0:
                    _this.destination = Observer.empty;
                    break;
                case 1:
                    if (!destinationOrNext) {
                        _this.destination = Observer.empty;
                        break;
                    }
                    if (typeof destinationOrNext === 'object') {
                        if (destinationOrNext instanceof Subscriber) {
                            _this.syncErrorThrowable = destinationOrNext.syncErrorThrowable;
                            _this.destination = destinationOrNext;
                            destinationOrNext.add(_this);
                        }
                        else {
                            _this.syncErrorThrowable = true;
                            _this.destination = new SafeSubscriber(_this, destinationOrNext);
                        }
                        break;
                    }
                default:
                    _this.syncErrorThrowable = true;
                    _this.destination = new SafeSubscriber(_this, destinationOrNext, error, complete);
                    break;
            }
            return _this;
        }
        Subscriber.prototype[rxSubscriber.rxSubscriber] = function () { return this; };
        Subscriber.create = function (next, error, complete) {
            var subscriber = new Subscriber(next, error, complete);
            subscriber.syncErrorThrowable = false;
            return subscriber;
        };
        Subscriber.prototype.next = function (value) {
            if (!this.isStopped) {
                this._next(value);
            }
        };
        Subscriber.prototype.error = function (err) {
            if (!this.isStopped) {
                this.isStopped = true;
                this._error(err);
            }
        };
        Subscriber.prototype.complete = function () {
            if (!this.isStopped) {
                this.isStopped = true;
                this._complete();
            }
        };
        Subscriber.prototype.unsubscribe = function () {
            if (this.closed) {
                return;
            }
            this.isStopped = true;
            _super.prototype.unsubscribe.call(this);
        };
        Subscriber.prototype._next = function (value) {
            this.destination.next(value);
        };
        Subscriber.prototype._error = function (err) {
            this.destination.error(err);
            this.unsubscribe();
        };
        Subscriber.prototype._complete = function () {
            this.destination.complete();
            this.unsubscribe();
        };
        Subscriber.prototype._unsubscribeAndRecycle = function () {
            var _parentOrParents = this._parentOrParents;
            this._parentOrParents = null;
            this.unsubscribe();
            this.closed = false;
            this.isStopped = false;
            this._parentOrParents = _parentOrParents;
            return this;
        };
        return Subscriber;
    }(Subscription_1.Subscription));
    exports.Subscriber = Subscriber;
    var SafeSubscriber = (function (_super) {
        __extends(SafeSubscriber, _super);
        function SafeSubscriber(_parentSubscriber, observerOrNext, error, complete) {
            var _this = _super.call(this) || this;
            _this._parentSubscriber = _parentSubscriber;
            var next;
            var context = _this;
            if (isFunction_1.isFunction(observerOrNext)) {
                next = observerOrNext;
            }
            else if (observerOrNext) {
                next = observerOrNext.next;
                error = observerOrNext.error;
                complete = observerOrNext.complete;
                if (observerOrNext !== Observer.empty) {
                    context = Object.create(observerOrNext);
                    if (isFunction_1.isFunction(context.unsubscribe)) {
                        _this.add(context.unsubscribe.bind(context));
                    }
                    context.unsubscribe = _this.unsubscribe.bind(_this);
                }
            }
            _this._context = context;
            _this._next = next;
            _this._error = error;
            _this._complete = complete;
            return _this;
        }
        SafeSubscriber.prototype.next = function (value) {
            if (!this.isStopped && this._next) {
                var _parentSubscriber = this._parentSubscriber;
                if (!config.config.useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
                    this.__tryOrUnsub(this._next, value);
                }
                else if (this.__tryOrSetError(_parentSubscriber, this._next, value)) {
                    this.unsubscribe();
                }
            }
        };
        SafeSubscriber.prototype.error = function (err) {
            if (!this.isStopped) {
                var _parentSubscriber = this._parentSubscriber;
                var useDeprecatedSynchronousErrorHandling = config.config.useDeprecatedSynchronousErrorHandling;
                if (this._error) {
                    if (!useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
                        this.__tryOrUnsub(this._error, err);
                        this.unsubscribe();
                    }
                    else {
                        this.__tryOrSetError(_parentSubscriber, this._error, err);
                        this.unsubscribe();
                    }
                }
                else if (!_parentSubscriber.syncErrorThrowable) {
                    this.unsubscribe();
                    if (useDeprecatedSynchronousErrorHandling) {
                        throw err;
                    }
                    hostReportError_1.hostReportError(err);
                }
                else {
                    if (useDeprecatedSynchronousErrorHandling) {
                        _parentSubscriber.syncErrorValue = err;
                        _parentSubscriber.syncErrorThrown = true;
                    }
                    else {
                        hostReportError_1.hostReportError(err);
                    }
                    this.unsubscribe();
                }
            }
        };
        SafeSubscriber.prototype.complete = function () {
            var _this = this;
            if (!this.isStopped) {
                var _parentSubscriber = this._parentSubscriber;
                if (this._complete) {
                    var wrappedComplete = function () { return _this._complete.call(_this._context); };
                    if (!config.config.useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
                        this.__tryOrUnsub(wrappedComplete);
                        this.unsubscribe();
                    }
                    else {
                        this.__tryOrSetError(_parentSubscriber, wrappedComplete);
                        this.unsubscribe();
                    }
                }
                else {
                    this.unsubscribe();
                }
            }
        };
        SafeSubscriber.prototype.__tryOrUnsub = function (fn, value) {
            try {
                fn.call(this._context, value);
            }
            catch (err) {
                this.unsubscribe();
                if (config.config.useDeprecatedSynchronousErrorHandling) {
                    throw err;
                }
                else {
                    hostReportError_1.hostReportError(err);
                }
            }
        };
        SafeSubscriber.prototype.__tryOrSetError = function (parent, fn, value) {
            if (!config.config.useDeprecatedSynchronousErrorHandling) {
                throw new Error('bad call');
            }
            try {
                fn.call(this._context, value);
            }
            catch (err) {
                if (config.config.useDeprecatedSynchronousErrorHandling) {
                    parent.syncErrorValue = err;
                    parent.syncErrorThrown = true;
                    return true;
                }
                else {
                    hostReportError_1.hostReportError(err);
                    return true;
                }
            }
            return false;
        };
        SafeSubscriber.prototype._unsubscribe = function () {
            var _parentSubscriber = this._parentSubscriber;
            this._context = null;
            this._parentSubscriber = null;
            _parentSubscriber.unsubscribe();
        };
        return SafeSubscriber;
    }(Subscriber));
    exports.SafeSubscriber = SafeSubscriber;
    //# sourceMappingURL=Subscriber.js.map
    });

    unwrapExports(Subscriber_1);
    var Subscriber_2 = Subscriber_1.Subscriber;
    var Subscriber_3 = Subscriber_1.SafeSubscriber;

    var filter_1 = createCommonjsModule(function (module, exports) {
    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });

    function filter(predicate, thisArg) {
        return function filterOperatorFunction(source) {
            return source.lift(new FilterOperator(predicate, thisArg));
        };
    }
    exports.filter = filter;
    var FilterOperator = (function () {
        function FilterOperator(predicate, thisArg) {
            this.predicate = predicate;
            this.thisArg = thisArg;
        }
        FilterOperator.prototype.call = function (subscriber, source) {
            return source.subscribe(new FilterSubscriber(subscriber, this.predicate, this.thisArg));
        };
        return FilterOperator;
    }());
    var FilterSubscriber = (function (_super) {
        __extends(FilterSubscriber, _super);
        function FilterSubscriber(destination, predicate, thisArg) {
            var _this = _super.call(this, destination) || this;
            _this.predicate = predicate;
            _this.thisArg = thisArg;
            _this.count = 0;
            return _this;
        }
        FilterSubscriber.prototype._next = function (value) {
            var result;
            try {
                result = this.predicate.call(this.thisArg, value, this.count++);
            }
            catch (err) {
                this.destination.error(err);
                return;
            }
            if (result) {
                this.destination.next(value);
            }
        };
        return FilterSubscriber;
    }(Subscriber_1.Subscriber));
    //# sourceMappingURL=filter.js.map
    });

    unwrapExports(filter_1);
    var filter_2 = filter_1.filter;

    var filter_1$1 = filter_1.filter;

    var filter = {
    	filter: filter_1$1
    };

    var map_1 = createCommonjsModule(function (module, exports) {
    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });

    function map(project, thisArg) {
        return function mapOperation(source) {
            if (typeof project !== 'function') {
                throw new TypeError('argument is not a function. Are you looking for `mapTo()`?');
            }
            return source.lift(new MapOperator(project, thisArg));
        };
    }
    exports.map = map;
    var MapOperator = (function () {
        function MapOperator(project, thisArg) {
            this.project = project;
            this.thisArg = thisArg;
        }
        MapOperator.prototype.call = function (subscriber, source) {
            return source.subscribe(new MapSubscriber(subscriber, this.project, this.thisArg));
        };
        return MapOperator;
    }());
    exports.MapOperator = MapOperator;
    var MapSubscriber = (function (_super) {
        __extends(MapSubscriber, _super);
        function MapSubscriber(destination, project, thisArg) {
            var _this = _super.call(this, destination) || this;
            _this.project = project;
            _this.count = 0;
            _this.thisArg = thisArg || _this;
            return _this;
        }
        MapSubscriber.prototype._next = function (value) {
            var result;
            try {
                result = this.project.call(this.thisArg, value, this.count++);
            }
            catch (err) {
                this.destination.error(err);
                return;
            }
            this.destination.next(result);
        };
        return MapSubscriber;
    }(Subscriber_1.Subscriber));
    //# sourceMappingURL=map.js.map
    });

    unwrapExports(map_1);
    var map_2 = map_1.map;
    var map_3 = map_1.MapOperator;

    var map_1$1 = map_1.map;

    var map = {
    	map: map_1$1
    };

    var isObj = function (x) {
    	var type = typeof x;
    	return x !== null && (type === 'object' || type === 'function');
    };

    var hasOwnProperty$1 = Object.prototype.hasOwnProperty;
    var propIsEnumerable$1 = Object.prototype.propertyIsEnumerable;

    function toObject$1(val) {
    	if (val === null || val === undefined) {
    		throw new TypeError('Sources cannot be null or undefined');
    	}

    	return Object(val);
    }

    function assignKey(to, from, key) {
    	var val = from[key];

    	if (val === undefined || val === null) {
    		return;
    	}

    	if (hasOwnProperty$1.call(to, key)) {
    		if (to[key] === undefined || to[key] === null) {
    			throw new TypeError('Cannot convert undefined or null to object (' + key + ')');
    		}
    	}

    	if (!hasOwnProperty$1.call(to, key) || !isObj(val)) {
    		to[key] = val;
    	} else {
    		to[key] = assign$1(Object(to[key]), from[key]);
    	}
    }

    function assign$1(to, from) {
    	if (to === from) {
    		return to;
    	}

    	from = Object(from);

    	for (var key in from) {
    		if (hasOwnProperty$1.call(from, key)) {
    			assignKey(to, from, key);
    		}
    	}

    	if (Object.getOwnPropertySymbols) {
    		var symbols = Object.getOwnPropertySymbols(from);

    		for (var i = 0; i < symbols.length; i++) {
    			if (propIsEnumerable$1.call(from, symbols[i])) {
    				assignKey(to, from, symbols[i]);
    			}
    		}
    	}

    	return to;
    }

    var deepAssign = function deepAssign(target) {
    	target = toObject$1(target);

    	for (var s = 1; s < arguments.length; s++) {
    		assign$1(target, arguments[s]);
    	}

    	return target;
    };

    var getSelection = function getSelection(sel) {
      if (typeof sel === 'string' || Array.isArray(sel)) {
        return {
          id: sel
        };
      }

      if (sel && sel.query) {
        return {
          query: sel.query
        };
      }

      var selectionOpts = ['* Document ID (<docId>)', '* Array of document IDs', '* Object containing `query`'].join('\n');
      throw new Error("Unknown selection - must be one of:\n\n".concat(selectionOpts));
    };

    var validators = createCommonjsModule(function (module, exports) {

    function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

    var VALID_ASSET_TYPES = ['image', 'file'];
    var VALID_INSERT_LOCATIONS = ['before', 'after', 'replace'];

    exports.dataset = function (name) {
      if (!/^[-\w]{1,128}$/.test(name)) {
        throw new Error('Datasets can only contain lowercase characters, numbers, underscores and dashes');
      }
    };

    exports.projectId = function (id) {
      if (!/^[-a-z0-9]+$/i.test(id)) {
        throw new Error('`projectId` can only contain only a-z, 0-9 and dashes');
      }
    };

    exports.validateAssetType = function (type) {
      if (VALID_ASSET_TYPES.indexOf(type) === -1) {
        throw new Error("Invalid asset type: ".concat(type, ". Must be one of ").concat(VALID_ASSET_TYPES.join(', ')));
      }
    };

    exports.validateObject = function (op, val) {
      if (val === null || _typeof(val) !== 'object' || Array.isArray(val)) {
        throw new Error("".concat(op, "() takes an object of properties"));
      }
    };

    exports.requireDocumentId = function (op, doc) {
      if (!doc._id) {
        throw new Error("".concat(op, "() requires that the document contains an ID (\"_id\" property)"));
      }

      exports.validateDocumentId(op, doc._id);
    };

    exports.validateDocumentId = function (op, id) {
      if (typeof id !== 'string' || !/^[a-z0-9_.-]+$/i.test(id)) {
        throw new Error("".concat(op, "(): \"").concat(id, "\" is not a valid document ID"));
      }
    };

    exports.validateInsert = function (at, selector, items) {
      var signature = 'insert(at, selector, items)';

      if (VALID_INSERT_LOCATIONS.indexOf(at) === -1) {
        var valid = VALID_INSERT_LOCATIONS.map(function (loc) {
          return "\"".concat(loc, "\"");
        }).join(', ');
        throw new Error("".concat(signature, " takes an \"at\"-argument which is one of: ").concat(valid));
      }

      if (typeof selector !== 'string') {
        throw new Error("".concat(signature, " takes a \"selector\"-argument which must be a string"));
      }

      if (!Array.isArray(items)) {
        throw new Error("".concat(signature, " takes an \"items\"-argument which must be an array"));
      }
    };

    exports.hasDataset = function (config) {
      if (!config.gradientMode && !config.dataset) {
        throw new Error('`dataset` must be provided to perform queries');
      }

      return config.dataset || '';
    };
    });
    var validators_1 = validators.dataset;
    var validators_2 = validators.projectId;
    var validators_3 = validators.validateAssetType;
    var validators_4 = validators.validateObject;
    var validators_5 = validators.requireDocumentId;
    var validators_6 = validators.validateDocumentId;
    var validators_7 = validators.validateInsert;
    var validators_8 = validators.hasDataset;

    function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }









    var validateObject = validators.validateObject;
    var validateInsert = validators.validateInsert;

    function Patch(selection) {
      var operations = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var client = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      this.selection = selection;
      this.operations = objectAssign({}, operations);
      this.client = client;
    }

    objectAssign(Patch.prototype, {
      clone: function clone() {
        return new Patch(this.selection, objectAssign({}, this.operations), this.client);
      },
      merge: function merge(props) {
        validateObject('merge', props);
        var stack = new Error().stack.toString().split('\n').filter(function (str) {
          return str.trim();
        }).slice(2);
        console.warn("The \"merge\" patch has been deprecated and will be removed in the future\n".concat(stack.join('\n')));
        return this._assign('merge', deepAssign(this.operations.merge || {}, props));
      },
      set: function set(props) {
        return this._assign('set', props);
      },
      diffMatchPatch: function diffMatchPatch(props) {
        validateObject('diffMatchPatch', props);
        return this._assign('diffMatchPatch', props);
      },
      unset: function unset(attrs) {
        if (!Array.isArray(attrs)) {
          throw new Error('unset(attrs) takes an array of attributes to unset, non-array given');
        }

        this.operations = objectAssign({}, this.operations, {
          unset: attrs
        });
        return this;
      },
      setIfMissing: function setIfMissing(props) {
        return this._assign('setIfMissing', props);
      },
      replace: function replace(props) {
        validateObject('replace', props);
        return this._set('set', {
          $: props
        }); // eslint-disable-line id-length
      },
      inc: function inc(props) {
        return this._assign('inc', props);
      },
      dec: function dec(props) {
        return this._assign('dec', props);
      },
      insert: function insert(at, selector, items) {
        var _this$_assign;

        validateInsert(at, selector, items);
        return this._assign('insert', (_this$_assign = {}, _defineProperty(_this$_assign, at, selector), _defineProperty(_this$_assign, "items", items), _this$_assign));
      },
      append: function append(selector, items) {
        return this.insert('after', "".concat(selector, "[-1]"), items);
      },
      prepend: function prepend(selector, items) {
        return this.insert('before', "".concat(selector, "[0]"), items);
      },
      splice: function splice(selector, start, deleteCount, items) {
        // Negative indexes doesn't mean the same in Sanity as they do in JS;
        // -1 means "actually at the end of the array", which allows inserting
        // at the end of the array without knowing its length. We therefore have
        // to substract negative indexes by one to match JS. If you want Sanity-
        // behaviour, just use `insert('replace', selector, items)` directly
        var delAll = typeof deleteCount === 'undefined' || deleteCount === -1;
        var startIndex = start < 0 ? start - 1 : start;
        var delCount = delAll ? -1 : Math.max(0, start + deleteCount);
        var delRange = startIndex < 0 && delCount >= 0 ? '' : delCount;
        var rangeSelector = "".concat(selector, "[").concat(startIndex, ":").concat(delRange, "]");
        return this.insert('replace', rangeSelector, items || []);
      },
      ifRevisionId: function ifRevisionId(rev) {
        this.operations.ifRevisionID = rev;
        return this;
      },
      serialize: function serialize() {
        return objectAssign(getSelection(this.selection), this.operations);
      },
      toJSON: function toJSON() {
        return this.serialize();
      },
      commit: function commit() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        if (!this.client) {
          throw new Error('No `client` passed to patch, either provide one or pass the ' + 'patch to a clients `mutate()` method');
        }

        var returnFirst = typeof this.selection === 'string';
        var opts = objectAssign({
          returnFirst: returnFirst,
          returnDocuments: true
        }, options);
        return this.client.mutate({
          patch: this.serialize()
        }, opts);
      },
      reset: function reset() {
        this.operations = {};
        return this;
      },
      _set: function _set(op, props) {
        return this._assign(op, props, false);
      },
      _assign: function _assign(op, props) {
        var merge = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
        validateObject(op, props);
        this.operations = objectAssign({}, this.operations, _defineProperty({}, op, objectAssign({}, merge && this.operations[op] || {}, props)));
        return this;
      }
    });
    var patch = Patch;

    function _defineProperty$1(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }







    var defaultMutateOptions = {
      returnDocuments: false
    };

    function Transaction() {
      var operations = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var client = arguments.length > 1 ? arguments[1] : undefined;
      var transactionId = arguments.length > 2 ? arguments[2] : undefined;
      this.trxId = transactionId;
      this.operations = operations;
      this.client = client;
    }

    objectAssign(Transaction.prototype, {
      clone: function clone() {
        return new Transaction(this.operations.slice(0), this.client, this.trxId);
      },
      create: function create(doc) {
        validators.validateObject('create', doc);
        return this._add({
          create: doc
        });
      },
      createIfNotExists: function createIfNotExists(doc) {
        var op = 'createIfNotExists';
        validators.validateObject(op, doc);
        validators.requireDocumentId(op, doc);
        return this._add(_defineProperty$1({}, op, doc));
      },
      createOrReplace: function createOrReplace(doc) {
        var op = 'createOrReplace';
        validators.validateObject(op, doc);
        validators.requireDocumentId(op, doc);
        return this._add(_defineProperty$1({}, op, doc));
      },
      delete: function _delete(documentId) {
        validators.validateDocumentId('delete', documentId);
        return this._add({
          delete: {
            id: documentId
          }
        });
      },
      patch: function patch$1(documentId, patchOps) {
        var isBuilder = typeof patchOps === 'function';
        var isPatch = documentId instanceof patch; // transaction.patch(client.patch('documentId').inc({visits: 1}))

        if (isPatch) {
          return this._add({
            patch: documentId.serialize()
          });
        } // patch => patch.inc({visits: 1}).set({foo: 'bar'})


        if (isBuilder) {
          var patch$1 = patchOps(new patch(documentId, {}, this.client));

          if (!(patch$1 instanceof patch)) {
            throw new Error('function passed to `patch()` must return the patch');
          }

          return this._add({
            patch: patch$1.serialize()
          });
        }

        return this._add({
          patch: objectAssign({
            id: documentId
          }, patchOps)
        });
      },
      transactionId: function transactionId(id) {
        if (!id) {
          return this.trxId;
        }

        this.trxId = id;
        return this;
      },
      serialize: function serialize() {
        return this.operations.slice();
      },
      toJSON: function toJSON() {
        return this.serialize();
      },
      commit: function commit(options) {
        if (!this.client) {
          throw new Error('No `client` passed to transaction, either provide one or pass the ' + 'transaction to a clients `mutate()` method');
        }

        return this.client.mutate(this.serialize(), objectAssign({
          transactionId: this.trxId
        }, defaultMutateOptions, options || {}));
      },
      reset: function reset() {
        this.operations = [];
        return this;
      },
      _add: function _add(mut) {
        this.operations.push(mut);
        return this;
      }
    });
    var transaction = Transaction;

    var enc = encodeURIComponent;

    var encodeQueryString = function (_ref) {
      var query = _ref.query,
          _ref$params = _ref.params,
          params = _ref$params === void 0 ? {} : _ref$params,
          _ref$options = _ref.options,
          options = _ref$options === void 0 ? {} : _ref$options;
      var base = "?query=".concat(enc(query));
      var qString = Object.keys(params).reduce(function (qs, param) {
        return "".concat(qs, "&").concat(enc("$".concat(param)), "=").concat(enc(JSON.stringify(params[param])));
      }, base);
      return Object.keys(options).reduce(function (qs, option) {
        // Only include the option if it is truthy
        return options[option] ? "".concat(qs, "&").concat(enc(option), "=").concat(enc(options[option])) : qs;
      }, qString);
    };

    var canReportError_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });

    function canReportError(observer) {
        while (observer) {
            var _a = observer, closed_1 = _a.closed, destination = _a.destination, isStopped = _a.isStopped;
            if (closed_1 || isStopped) {
                return false;
            }
            else if (destination && destination instanceof Subscriber_1.Subscriber) {
                observer = destination;
            }
            else {
                observer = null;
            }
        }
        return true;
    }
    exports.canReportError = canReportError;
    //# sourceMappingURL=canReportError.js.map
    });

    unwrapExports(canReportError_1);
    var canReportError_2 = canReportError_1.canReportError;

    var toSubscriber_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });



    function toSubscriber(nextOrObserver, error, complete) {
        if (nextOrObserver) {
            if (nextOrObserver instanceof Subscriber_1.Subscriber) {
                return nextOrObserver;
            }
            if (nextOrObserver[rxSubscriber.rxSubscriber]) {
                return nextOrObserver[rxSubscriber.rxSubscriber]();
            }
        }
        if (!nextOrObserver && !error && !complete) {
            return new Subscriber_1.Subscriber(Observer.empty);
        }
        return new Subscriber_1.Subscriber(nextOrObserver, error, complete);
    }
    exports.toSubscriber = toSubscriber;
    //# sourceMappingURL=toSubscriber.js.map
    });

    unwrapExports(toSubscriber_1);
    var toSubscriber_2 = toSubscriber_1.toSubscriber;

    var observable = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.observable = (function () { return typeof Symbol === 'function' && Symbol.observable || '@@observable'; })();
    //# sourceMappingURL=observable.js.map
    });

    unwrapExports(observable);
    var observable_1 = observable.observable;

    var noop_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function noop() { }
    exports.noop = noop;
    //# sourceMappingURL=noop.js.map
    });

    unwrapExports(noop_1);
    var noop_2 = noop_1.noop;

    var pipe_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });

    function pipe() {
        var fns = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            fns[_i] = arguments[_i];
        }
        return pipeFromArray(fns);
    }
    exports.pipe = pipe;
    function pipeFromArray(fns) {
        if (!fns) {
            return noop_1.noop;
        }
        if (fns.length === 1) {
            return fns[0];
        }
        return function piped(input) {
            return fns.reduce(function (prev, fn) { return fn(prev); }, input);
        };
    }
    exports.pipeFromArray = pipeFromArray;
    //# sourceMappingURL=pipe.js.map
    });

    unwrapExports(pipe_1);
    var pipe_2 = pipe_1.pipe;
    var pipe_3 = pipe_1.pipeFromArray;

    var Observable_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });





    var Observable = (function () {
        function Observable(subscribe) {
            this._isScalar = false;
            if (subscribe) {
                this._subscribe = subscribe;
            }
        }
        Observable.prototype.lift = function (operator) {
            var observable = new Observable();
            observable.source = this;
            observable.operator = operator;
            return observable;
        };
        Observable.prototype.subscribe = function (observerOrNext, error, complete) {
            var operator = this.operator;
            var sink = toSubscriber_1.toSubscriber(observerOrNext, error, complete);
            if (operator) {
                sink.add(operator.call(sink, this.source));
            }
            else {
                sink.add(this.source || (config.config.useDeprecatedSynchronousErrorHandling && !sink.syncErrorThrowable) ?
                    this._subscribe(sink) :
                    this._trySubscribe(sink));
            }
            if (config.config.useDeprecatedSynchronousErrorHandling) {
                if (sink.syncErrorThrowable) {
                    sink.syncErrorThrowable = false;
                    if (sink.syncErrorThrown) {
                        throw sink.syncErrorValue;
                    }
                }
            }
            return sink;
        };
        Observable.prototype._trySubscribe = function (sink) {
            try {
                return this._subscribe(sink);
            }
            catch (err) {
                if (config.config.useDeprecatedSynchronousErrorHandling) {
                    sink.syncErrorThrown = true;
                    sink.syncErrorValue = err;
                }
                if (canReportError_1.canReportError(sink)) {
                    sink.error(err);
                }
                else {
                    console.warn(err);
                }
            }
        };
        Observable.prototype.forEach = function (next, promiseCtor) {
            var _this = this;
            promiseCtor = getPromiseCtor(promiseCtor);
            return new promiseCtor(function (resolve, reject) {
                var subscription;
                subscription = _this.subscribe(function (value) {
                    try {
                        next(value);
                    }
                    catch (err) {
                        reject(err);
                        if (subscription) {
                            subscription.unsubscribe();
                        }
                    }
                }, reject, resolve);
            });
        };
        Observable.prototype._subscribe = function (subscriber) {
            var source = this.source;
            return source && source.subscribe(subscriber);
        };
        Observable.prototype[observable.observable] = function () {
            return this;
        };
        Observable.prototype.pipe = function () {
            var operations = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                operations[_i] = arguments[_i];
            }
            if (operations.length === 0) {
                return this;
            }
            return pipe_1.pipeFromArray(operations)(this);
        };
        Observable.prototype.toPromise = function (promiseCtor) {
            var _this = this;
            promiseCtor = getPromiseCtor(promiseCtor);
            return new promiseCtor(function (resolve, reject) {
                var value;
                _this.subscribe(function (x) { return value = x; }, function (err) { return reject(err); }, function () { return resolve(value); });
            });
        };
        Observable.create = function (subscribe) {
            return new Observable(subscribe);
        };
        return Observable;
    }());
    exports.Observable = Observable;
    function getPromiseCtor(promiseCtor) {
        if (!promiseCtor) {
            promiseCtor = config.config.Promise || Promise;
        }
        if (!promiseCtor) {
            throw new Error('no Promise impl found');
        }
        return promiseCtor;
    }
    //# sourceMappingURL=Observable.js.map
    });

    unwrapExports(Observable_1);
    var Observable_2 = Observable_1.Observable;

    var scan_1 = createCommonjsModule(function (module, exports) {
    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });

    function scan(accumulator, seed) {
        var hasSeed = false;
        if (arguments.length >= 2) {
            hasSeed = true;
        }
        return function scanOperatorFunction(source) {
            return source.lift(new ScanOperator(accumulator, seed, hasSeed));
        };
    }
    exports.scan = scan;
    var ScanOperator = (function () {
        function ScanOperator(accumulator, seed, hasSeed) {
            if (hasSeed === void 0) { hasSeed = false; }
            this.accumulator = accumulator;
            this.seed = seed;
            this.hasSeed = hasSeed;
        }
        ScanOperator.prototype.call = function (subscriber, source) {
            return source.subscribe(new ScanSubscriber(subscriber, this.accumulator, this.seed, this.hasSeed));
        };
        return ScanOperator;
    }());
    var ScanSubscriber = (function (_super) {
        __extends(ScanSubscriber, _super);
        function ScanSubscriber(destination, accumulator, _seed, hasSeed) {
            var _this = _super.call(this, destination) || this;
            _this.accumulator = accumulator;
            _this._seed = _seed;
            _this.hasSeed = hasSeed;
            _this.index = 0;
            return _this;
        }
        Object.defineProperty(ScanSubscriber.prototype, "seed", {
            get: function () {
                return this._seed;
            },
            set: function (value) {
                this.hasSeed = true;
                this._seed = value;
            },
            enumerable: true,
            configurable: true
        });
        ScanSubscriber.prototype._next = function (value) {
            if (!this.hasSeed) {
                this.seed = value;
                this.destination.next(value);
            }
            else {
                return this._tryNext(value);
            }
        };
        ScanSubscriber.prototype._tryNext = function (value) {
            var index = this.index++;
            var result;
            try {
                result = this.accumulator(this.seed, value, index);
            }
            catch (err) {
                this.destination.error(err);
            }
            this.seed = result;
            this.destination.next(result);
        };
        return ScanSubscriber;
    }(Subscriber_1.Subscriber));
    //# sourceMappingURL=scan.js.map
    });

    unwrapExports(scan_1);
    var scan_2 = scan_1.scan;

    var ArgumentOutOfRangeError = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var ArgumentOutOfRangeErrorImpl = (function () {
        function ArgumentOutOfRangeErrorImpl() {
            Error.call(this);
            this.message = 'argument out of range';
            this.name = 'ArgumentOutOfRangeError';
            return this;
        }
        ArgumentOutOfRangeErrorImpl.prototype = Object.create(Error.prototype);
        return ArgumentOutOfRangeErrorImpl;
    })();
    exports.ArgumentOutOfRangeError = ArgumentOutOfRangeErrorImpl;
    //# sourceMappingURL=ArgumentOutOfRangeError.js.map
    });

    unwrapExports(ArgumentOutOfRangeError);
    var ArgumentOutOfRangeError_1 = ArgumentOutOfRangeError.ArgumentOutOfRangeError;

    var empty_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });

    exports.EMPTY = new Observable_1.Observable(function (subscriber) { return subscriber.complete(); });
    function empty(scheduler) {
        return scheduler ? emptyScheduled(scheduler) : exports.EMPTY;
    }
    exports.empty = empty;
    function emptyScheduled(scheduler) {
        return new Observable_1.Observable(function (subscriber) { return scheduler.schedule(function () { return subscriber.complete(); }); });
    }
    //# sourceMappingURL=empty.js.map
    });

    unwrapExports(empty_1);
    var empty_2 = empty_1.EMPTY;
    var empty_3 = empty_1.empty;

    var takeLast_1 = createCommonjsModule(function (module, exports) {
    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });



    function takeLast(count) {
        return function takeLastOperatorFunction(source) {
            if (count === 0) {
                return empty_1.empty();
            }
            else {
                return source.lift(new TakeLastOperator(count));
            }
        };
    }
    exports.takeLast = takeLast;
    var TakeLastOperator = (function () {
        function TakeLastOperator(total) {
            this.total = total;
            if (this.total < 0) {
                throw new ArgumentOutOfRangeError.ArgumentOutOfRangeError;
            }
        }
        TakeLastOperator.prototype.call = function (subscriber, source) {
            return source.subscribe(new TakeLastSubscriber(subscriber, this.total));
        };
        return TakeLastOperator;
    }());
    var TakeLastSubscriber = (function (_super) {
        __extends(TakeLastSubscriber, _super);
        function TakeLastSubscriber(destination, total) {
            var _this = _super.call(this, destination) || this;
            _this.total = total;
            _this.ring = new Array();
            _this.count = 0;
            return _this;
        }
        TakeLastSubscriber.prototype._next = function (value) {
            var ring = this.ring;
            var total = this.total;
            var count = this.count++;
            if (ring.length < total) {
                ring.push(value);
            }
            else {
                var index = count % total;
                ring[index] = value;
            }
        };
        TakeLastSubscriber.prototype._complete = function () {
            var destination = this.destination;
            var count = this.count;
            if (count > 0) {
                var total = this.count >= this.total ? this.total : this.count;
                var ring = this.ring;
                for (var i = 0; i < total; i++) {
                    var idx = (count++) % total;
                    destination.next(ring[idx]);
                }
            }
            destination.complete();
        };
        return TakeLastSubscriber;
    }(Subscriber_1.Subscriber));
    //# sourceMappingURL=takeLast.js.map
    });

    unwrapExports(takeLast_1);
    var takeLast_2 = takeLast_1.takeLast;

    var defaultIfEmpty_1 = createCommonjsModule(function (module, exports) {
    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });

    function defaultIfEmpty(defaultValue) {
        if (defaultValue === void 0) { defaultValue = null; }
        return function (source) { return source.lift(new DefaultIfEmptyOperator(defaultValue)); };
    }
    exports.defaultIfEmpty = defaultIfEmpty;
    var DefaultIfEmptyOperator = (function () {
        function DefaultIfEmptyOperator(defaultValue) {
            this.defaultValue = defaultValue;
        }
        DefaultIfEmptyOperator.prototype.call = function (subscriber, source) {
            return source.subscribe(new DefaultIfEmptySubscriber(subscriber, this.defaultValue));
        };
        return DefaultIfEmptyOperator;
    }());
    var DefaultIfEmptySubscriber = (function (_super) {
        __extends(DefaultIfEmptySubscriber, _super);
        function DefaultIfEmptySubscriber(destination, defaultValue) {
            var _this = _super.call(this, destination) || this;
            _this.defaultValue = defaultValue;
            _this.isEmpty = true;
            return _this;
        }
        DefaultIfEmptySubscriber.prototype._next = function (value) {
            this.isEmpty = false;
            this.destination.next(value);
        };
        DefaultIfEmptySubscriber.prototype._complete = function () {
            if (this.isEmpty) {
                this.destination.next(this.defaultValue);
            }
            this.destination.complete();
        };
        return DefaultIfEmptySubscriber;
    }(Subscriber_1.Subscriber));
    //# sourceMappingURL=defaultIfEmpty.js.map
    });

    unwrapExports(defaultIfEmpty_1);
    var defaultIfEmpty_2 = defaultIfEmpty_1.defaultIfEmpty;

    var reduce_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });




    function reduce(accumulator, seed) {
        if (arguments.length >= 2) {
            return function reduceOperatorFunctionWithSeed(source) {
                return pipe_1.pipe(scan_1.scan(accumulator, seed), takeLast_1.takeLast(1), defaultIfEmpty_1.defaultIfEmpty(seed))(source);
            };
        }
        return function reduceOperatorFunction(source) {
            return pipe_1.pipe(scan_1.scan(function (acc, value, index) { return accumulator(acc, value, index + 1); }), takeLast_1.takeLast(1))(source);
        };
    }
    exports.reduce = reduce;
    //# sourceMappingURL=reduce.js.map
    });

    unwrapExports(reduce_1);
    var reduce_2 = reduce_1.reduce;

    var reduce_1$1 = reduce_1.reduce;

    var reduce = {
    	reduce: reduce_1$1
    };

    var Observable = Observable_1.Observable;



    var map$1 = map.map;

    var filter$1 = filter.filter;

    var reduce$1 = reduce.reduce;
    /*
     A minimal rxjs based observable that align as closely as possible with the current es-observable spec,
     without the static factory methods
     */


    function SanityObservableMinimal() {
      Observable.apply(this, arguments); // eslint-disable-line prefer-rest-params
    }

    SanityObservableMinimal.prototype = Object.create(objectAssign(Object.create(null), Observable.prototype));
    Object.defineProperty(SanityObservableMinimal.prototype, 'constructor', {
      value: SanityObservableMinimal,
      enumerable: false,
      writable: true,
      configurable: true
    });

    SanityObservableMinimal.prototype.lift = function lift(operator) {
      var observable = new SanityObservableMinimal();
      observable.source = this;
      observable.operator = operator;
      return observable;
    };

    function createDeprecatedMemberOp(name, op) {
      var hasWarned = false;
      return function deprecatedOperator() {
        if (!hasWarned) {
          hasWarned = true;
          console.warn(new Error("Calling observable.".concat(name, "(...) is deprecated. Please use observable.pipe(").concat(name, "(...)) instead")));
        }

        return this.pipe(op.apply(this, arguments));
      };
    }

    SanityObservableMinimal.prototype.map = createDeprecatedMemberOp('map', map$1);
    SanityObservableMinimal.prototype.filter = createDeprecatedMemberOp('filter', filter$1);
    SanityObservableMinimal.prototype.reduce = createDeprecatedMemberOp('filter', reduce$1);
    var SanityObservableMinimal_1 = SanityObservableMinimal;

    var minimal = SanityObservableMinimal_1;

    (function (global) {

        if (global.EventSource && !global._eventSourceImportPrefix){
            return;
        }

        var evsImportName = (global._eventSourceImportPrefix||'')+"EventSource";

        var EventSource = function (url, options) {

            if (!url || typeof url != 'string') {
                throw new SyntaxError('Not enough arguments');
            }

            this.URL = url;
            this.setOptions(options);
            var evs = this;
            setTimeout(function(){evs.poll();}, 0);
        };

        EventSource.prototype = {

            CONNECTING: 0,

            OPEN: 1,

            CLOSED: 2,

            defaultOptions: {

                loggingEnabled: false,

                loggingPrefix: "eventsource",

                interval: 500, // milliseconds

                bufferSizeLimit: 256*1024, // bytes

                silentTimeout: 300000, // milliseconds

                getArgs:{
                    'evs_buffer_size_limit': 256*1024
                },

                xhrHeaders:{
                    'Accept': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            },

            setOptions: function(options){

                var defaults = this.defaultOptions;
                var option;

                // set all default options...
                for (option in defaults){

                    if ( defaults.hasOwnProperty(option) ){
                        this[option] = defaults[option];
                    }
                }

                // override with what is in options
                for (option in options){

                    if (option in defaults && options.hasOwnProperty(option)){
                        this[option] = options[option];
                    }
                }

                // if getArgs option is enabled
                // ensure evs_buffer_size_limit corresponds to bufferSizeLimit
                if (this.getArgs && this.bufferSizeLimit) {

                    this.getArgs['evs_buffer_size_limit'] = this.bufferSizeLimit;
                }

                // if console is not available, force loggingEnabled to false
                if (typeof console === "undefined" || typeof console.log === "undefined") {

                    this.loggingEnabled = false;
                }
            },

            log: function(message) {

                if (this.loggingEnabled) {

                    console.log("[" + this.loggingPrefix +"]:" + message);
                }
            },

            poll: function() {

                try {

                    if (this.readyState == this.CLOSED) {
                        return;
                    }

                    this.cleanup();
                    this.readyState = this.CONNECTING;
                    this.cursor = 0;
                    this.cache = '';
                    this._xhr = new this.XHR(this);
                    this.resetNoActivityTimer();

                }
                catch (e) {

                    // in an attempt to silence the errors
                    this.log('There were errors inside the pool try-catch');
                    this.dispatchEvent('error', { type: 'error', data: e.message });
                }
            },

            pollAgain: function (interval) {

                // schedule poll to be called after interval milliseconds
                var evs = this;
                evs.readyState = evs.CONNECTING;
                evs.dispatchEvent('error', {
                    type: 'error',
                    data: "Reconnecting "
                });
                this._pollTimer = setTimeout(function(){evs.poll();}, interval||0);
            },


            cleanup: function() {

                this.log('evs cleaning up');

                if (this._pollTimer){
                    clearInterval(this._pollTimer);
                    this._pollTimer = null;
                }

                if (this._noActivityTimer){
                    clearInterval(this._noActivityTimer);
                    this._noActivityTimer = null;
                }

                if (this._xhr){
                    this._xhr.abort();
                    this._xhr = null;
                }
            },

            resetNoActivityTimer: function(){

                if (this.silentTimeout){

                    if (this._noActivityTimer){
                        clearInterval(this._noActivityTimer);
                    }
                    var evs = this;
                    this._noActivityTimer = setTimeout(
                            function(){ evs.log('Timeout! silentTImeout:'+evs.silentTimeout); evs.pollAgain(); },
                            this.silentTimeout
                            );
                }
            },

            close: function () {

                this.readyState = this.CLOSED;
                this.log('Closing connection. readyState: '+this.readyState);
                this.cleanup();
            },

            ondata: function() {

                var request = this._xhr;

                if (request.isReady() && !request.hasError() ) {
                    // reset the timer, as we have activity
                    this.resetNoActivityTimer();

                    // move this EventSource to OPEN state...
                    if (this.readyState == this.CONNECTING) {
                        this.readyState = this.OPEN;
                        this.dispatchEvent('open', { type: 'open' });
                    }

                    var buffer = request.getBuffer();

                    if (buffer.length > this.bufferSizeLimit) {
                        this.log('buffer.length > this.bufferSizeLimit');
                        this.pollAgain();
                    }

                    if (this.cursor == 0 && buffer.length > 0){

                        // skip byte order mark \uFEFF character if it starts the stream
                        if (buffer.substring(0,1) == '\uFEFF'){
                            this.cursor = 1;
                        }
                    }

                    var lastMessageIndex = this.lastMessageIndex(buffer);
                    if (lastMessageIndex[0] >= this.cursor){

                        var newcursor = lastMessageIndex[1];
                        var toparse = buffer.substring(this.cursor, newcursor);
                        this.parseStream(toparse);
                        this.cursor = newcursor;
                    }

                    // if request is finished, reopen the connection
                    if (request.isDone()) {
                        this.log('request.isDone(). reopening the connection');
                        this.pollAgain(this.interval);
                    }
                }
                else if (this.readyState !== this.CLOSED) {

                    this.log('this.readyState !== this.CLOSED');
                    this.pollAgain(this.interval);

                    //MV: Unsure why an error was previously dispatched
                }
            },

            parseStream: function(chunk) {

                // normalize line separators (\r\n,\r,\n) to \n
                // remove white spaces that may precede \n
                chunk = this.cache + this.normalizeToLF(chunk);

                var events = chunk.split('\n\n');

                var i, j, eventType, datas, line, retry;

                for (i=0; i < (events.length - 1); i++) {

                    eventType = 'message';
                    datas = [];
                    parts = events[i].split('\n');

                    for (j=0; j < parts.length; j++) {

                        line = this.trimWhiteSpace(parts[j]);

                        if (line.indexOf('event') == 0) {

                            eventType = line.replace(/event:?\s*/, '');
                        }
                        else if (line.indexOf('retry') == 0) {

                            retry = parseInt(line.replace(/retry:?\s*/, ''));
                            if(!isNaN(retry)) {
                                this.interval = retry;
                            }
                        }
                        else if (line.indexOf('data') == 0) {

                            datas.push(line.replace(/data:?\s*/, ''));
                        }
                        else if (line.indexOf('id:') == 0) {

                            this.lastEventId = line.replace(/id:?\s*/, '');
                        }
                        else if (line.indexOf('id') == 0) { // this resets the id

                            this.lastEventId = null;
                        }
                    }

                    if (datas.length) {
                        // dispatch a new event
                        var event = new MessageEvent(eventType, datas.join('\n'), window.location.origin, this.lastEventId);
                        this.dispatchEvent(eventType, event);
                    }
                }

                this.cache = events[events.length - 1];
            },

            dispatchEvent: function (type, event) {
                var handlers = this['_' + type + 'Handlers'];

                if (handlers) {

                    for (var i = 0; i < handlers.length; i++) {
                        handlers[i].call(this, event);
                    }
                }

                if (this['on' + type]) {
                    this['on' + type].call(this, event);
                }

            },

            addEventListener: function (type, handler) {
                if (!this['_' + type + 'Handlers']) {
                    this['_' + type + 'Handlers'] = [];
                }

                this['_' + type + 'Handlers'].push(handler);
            },

            removeEventListener: function (type, handler) {
                var handlers = this['_' + type + 'Handlers'];
                if (!handlers) {
                    return;
                }
                for (var i = handlers.length - 1; i >= 0; --i) {
                    if (handlers[i] === handler) {
                        handlers.splice(i, 1);
                        break;
                    }
                }
            },

            _pollTimer: null,

            _noactivityTimer: null,

            _xhr: null,

            lastEventId: null,

            cache: '',

            cursor: 0,

            onerror: null,

            onmessage: null,

            onopen: null,

            readyState: 0,

            // ===================================================================
            // helpers functions
            // those are attached to prototype to ease reuse and testing...

            urlWithParams: function (baseURL, params) {

                var encodedArgs = [];

                if (params){

                    var key, urlarg;
                    var urlize = encodeURIComponent;

                    for (key in params){
                        if (params.hasOwnProperty(key)) {
                            urlarg = urlize(key)+'='+urlize(params[key]);
                            encodedArgs.push(urlarg);
                        }
                    }
                }

                if (encodedArgs.length > 0){

                    if (baseURL.indexOf('?') == -1)
                        return baseURL + '?' + encodedArgs.join('&');
                    return baseURL + '&' + encodedArgs.join('&');
                }
                return baseURL;
            },

            lastMessageIndex: function(text) {

                var ln2 =text.lastIndexOf('\n\n');
                var lr2 = text.lastIndexOf('\r\r');
                var lrln2 = text.lastIndexOf('\r\n\r\n');

                if (lrln2 > Math.max(ln2, lr2)) {
                    return [lrln2, lrln2+4];
                }
                return [Math.max(ln2, lr2), Math.max(ln2, lr2) + 2]
            },

            trimWhiteSpace: function(str) {
                // to remove whitespaces left and right of string

                var reTrim = /^(\s|\u00A0)+|(\s|\u00A0)+$/g;
                return str.replace(reTrim, '');
            },

            normalizeToLF: function(str) {

                // replace \r and \r\n with \n
                return str.replace(/\r\n|\r/g, '\n');
            }

        };

        if (!isOldIE()){

            EventSource.isPolyfill = "XHR";

            // EventSource will send request using XMLHttpRequest
            EventSource.prototype.XHR = function(evs) {

                request = new XMLHttpRequest();
                this._request = request;
                evs._xhr = this;

                // set handlers
                request.onreadystatechange = function(){
                    if (request.readyState > 1 && evs.readyState != evs.CLOSED) {
                        if (request.status == 200 || (request.status>=300 && request.status<400)){
                            evs.ondata();
                        }
                        else {
                            request._failed = true;
                            evs.readyState = evs.CLOSED;
                            evs.dispatchEvent('error', {
                                type: 'error',
                                data: "The server responded with "+request.status
                            });
                            evs.close();
                        }
                    }
                };

                request.onprogress = function () {
                };

                request.open('GET', evs.urlWithParams(evs.URL, evs.getArgs), true);

                var headers = evs.xhrHeaders; // maybe null
                for (var header in headers) {
                    if (headers.hasOwnProperty(header)){
                        request.setRequestHeader(header, headers[header]);
                    }
                }
                if (evs.lastEventId) {
                    request.setRequestHeader('Last-Event-Id', evs.lastEventId);
                }

                request.send();
            };

            EventSource.prototype.XHR.prototype = {

                useXDomainRequest: false,

                _request: null,

                _failed: false, // true if we have had errors...

                isReady: function() {


                    return this._request.readyState >= 2;
                },

                isDone: function() {

                    return (this._request.readyState == 4);
                },

                hasError: function() {

                    return (this._failed || (this._request.status >= 400));
                },

                getBuffer: function() {

                    var rv = '';
                    try {
                        rv = this._request.responseText || '';
                    }
                    catch (e){}
                    return rv;
                },

                abort: function() {

                    if ( this._request ) {
                        this._request.abort();
                    }
                }
            };
        }
        else {

    	EventSource.isPolyfill = "IE_8-9";

            // patch EventSource defaultOptions
            var defaults = EventSource.prototype.defaultOptions;
            defaults.xhrHeaders = null; // no headers will be sent
            defaults.getArgs['evs_preamble'] = 2048 + 8;

            // EventSource will send request using Internet Explorer XDomainRequest
            EventSource.prototype.XHR = function(evs) {

                request = new XDomainRequest();
                this._request = request;

                // set handlers
                request.onprogress = function(){
                    request._ready = true;
                    evs.ondata();
                };

                request.onload = function(){
                    this._loaded = true;
                    evs.ondata();
                };

                request.onerror = function(){
                    this._failed = true;
                    evs.readyState = evs.CLOSED;
                    evs.dispatchEvent('error', {
                        type: 'error',
                        data: "XDomainRequest error"
                    });
                };

                request.ontimeout = function(){
                    this._failed = true;
                    evs.readyState = evs.CLOSED;
                    evs.dispatchEvent('error', {
                        type: 'error',
                        data: "XDomainRequest timed out"
                    });
                };

                // XDomainRequest does not allow setting custom headers
                // If EventSource has enabled the use of GET arguments
                // we add parameters to URL so that server can adapt the stream...
                var reqGetArgs = {};
                if (evs.getArgs) {

                    // copy evs.getArgs in reqGetArgs
                    var defaultArgs = evs.getArgs;
                        for (var key in defaultArgs) {
                            if (defaultArgs.hasOwnProperty(key)){
                                reqGetArgs[key] = defaultArgs[key];
                            }
                        }
                    if (evs.lastEventId){
                        reqGetArgs['evs_last_event_id'] = evs.lastEventId;
                    }
                }
                // send the request

                request.open('GET', evs.urlWithParams(evs.URL,reqGetArgs));
                request.send();
            };

            EventSource.prototype.XHR.prototype = {

                useXDomainRequest: true,

                _request: null,

                _ready: false, // true when progress events are dispatched

                _loaded: false, // true when request has been loaded

                _failed: false, // true if when request is in error

                isReady: function() {

                    return this._request._ready;
                },

                isDone: function() {

                    return this._request._loaded;
                },

                hasError: function() {

                    return this._request._failed;
                },

                getBuffer: function() {

                    var rv = '';
                    try {
                        rv = this._request.responseText || '';
                    }
                    catch (e){}
                    return rv;
                },

                abort: function() {

                    if ( this._request){
                        this._request.abort();
                    }
                }
            };
        }

        function MessageEvent(type, data, origin, lastEventId) {

            this.bubbles = false;
            this.cancelBubble = false;
            this.cancelable = false;
            this.data = data || null;
            this.origin = origin || '';
            this.lastEventId = lastEventId || '';
            this.type = type || 'message';
        }

        function isOldIE () {

            //return true if we are in IE8 or IE9
            return (window.XDomainRequest && (window.XMLHttpRequest && new XMLHttpRequest().responseType === undefined)) ? true : false;
        }

        global[evsImportName] = EventSource;
    })(commonjsGlobal);

    var eventsource = {

    };

    /* eslint-disable no-var */

    var browser = window.EventSource || eventsource.EventSource;

    var pick$1 = function (obj, props) {
      return props.reduce(function (selection, prop) {
        if (typeof obj[prop] === 'undefined') {
          return selection;
        }

        selection[prop] = obj[prop];
        return selection;
      }, {});
    };

    var defaults = function (obj, defaults) {
      return Object.keys(defaults).concat(Object.keys(obj)).reduce(function (target, prop) {
        target[prop] = typeof obj[prop] === 'undefined' ? defaults[prop] : obj[prop];
        return target;
      }, {});
    };

    var baseUrl = 'https://docs.sanity.io/help/';

    var generateHelpUrl = function generateHelpUrl(slug) {
      return baseUrl + slug
    };

    var once = function (fn) {
      var didCall = false;
      var returnValue;
      return function () {
        if (didCall) {
          return returnValue;
        }

        returnValue = fn.apply(void 0, arguments);
        didCall = true;
        return returnValue;
      };
    };

    var tokenWarning = ['Using token with listeners is not supported in browsers. ', "For more info, see ".concat(generateHelpUrl('js-client-listener-tokens-browser'), ".")]; // eslint-disable-next-line no-console

    var printTokenWarning = once(function () {
      return console.warn(tokenWarning.join(' '));
    });
    var isWindowEventSource = Boolean(typeof window !== 'undefined' && window.EventSource);
    var EventSource = isWindowEventSource ? window.EventSource // Native browser EventSource
    : browser; // Node.js, IE etc

    var possibleOptions = ['includePreviousRevision', 'includeResult', 'visibility'];
    var defaultOptions = {
      includeResult: true
    };

    var listen$1 = function listen(query, params) {
      var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var options = defaults(opts, defaultOptions);
      var listenOpts = pick$1(options, possibleOptions);
      var qs = encodeQueryString({
        query: query,
        params: params,
        options: listenOpts
      });
      var _this$clientConfig = this.clientConfig,
          url = _this$clientConfig.url,
          token = _this$clientConfig.token,
          withCredentials = _this$clientConfig.withCredentials;
      var uri = "".concat(url).concat(this.getDataUrl('listen', qs));
      var listenFor = options.events ? options.events : ['mutation'];
      var shouldEmitReconnect = listenFor.indexOf('reconnect') !== -1;

      if (token && isWindowEventSource) {
        printTokenWarning();
      }

      var esOptions = {};

      if (token || withCredentials) {
        esOptions.withCredentials = true;
      }

      if (token) {
        esOptions.headers = {
          Authorization: "Bearer ".concat(token)
        };
      }

      return new minimal(function (observer) {
        var es = getEventSource();
        var reconnectTimer;
        var stopped = false;

        function onError() {
          if (stopped) {
            return;
          }

          emitReconnect(); // Allow event handlers of `emitReconnect` to cancel/close the reconnect attempt

          if (stopped) {
            return;
          } // Unless we've explicitly stopped the ES (in which case `stopped` should be true),
          // we should never be in a disconnected state. By default, EventSource will reconnect
          // automatically, in which case it sets readyState to `CONNECTING`, but in some cases
          // (like when a laptop lid is closed), it closes the connection. In these cases we need
          // to explicitly reconnect.


          if (es.readyState === EventSource.CLOSED) {
            unsubscribe();
            clearTimeout(reconnectTimer);
            reconnectTimer = setTimeout(open, 100);
          }
        }

        function onChannelError(err) {
          observer.error(cooerceError(err));
        }

        function onMessage(evt) {
          var event = parseEvent(evt);
          return event instanceof Error ? observer.error(event) : observer.next(event);
        }

        function onDisconnect(evt) {
          stopped = true;
          unsubscribe();
          observer.complete();
        }

        function unsubscribe() {
          es.removeEventListener('error', onError, false);
          es.removeEventListener('channelError', onChannelError, false);
          es.removeEventListener('disconnect', onDisconnect, false);
          listenFor.forEach(function (type) {
            return es.removeEventListener(type, onMessage, false);
          });
          es.close();
        }

        function emitReconnect() {
          if (shouldEmitReconnect) {
            observer.next({
              type: 'reconnect'
            });
          }
        }

        function getEventSource() {
          var evs = new EventSource(uri, esOptions);
          evs.addEventListener('error', onError, false);
          evs.addEventListener('channelError', onChannelError, false);
          evs.addEventListener('disconnect', onDisconnect, false);
          listenFor.forEach(function (type) {
            return evs.addEventListener(type, onMessage, false);
          });
          return evs;
        }

        function open() {
          es = getEventSource();
        }

        function stop() {
          stopped = true;
          unsubscribe();
        }

        return stop;
      });
    };

    function parseEvent(event) {
      try {
        var data = event.data && JSON.parse(event.data) || {};
        return objectAssign({
          type: event.type
        }, data);
      } catch (err) {
        return err;
      }
    }

    function cooerceError(err) {
      if (err instanceof Error) {
        return err;
      }

      var evt = parseEvent(err);
      return evt instanceof Error ? evt : new Error(extractErrorMessage(evt));
    }

    function extractErrorMessage(err) {
      if (!err.error) {
        return err.message || 'Unknown listener error';
      }

      if (err.error.description) {
        return err.error.description;
      }

      return typeof err.error === 'string' ? err.error : JSON.stringify(err.error, null, 2);
    }

    function _defineProperty$2(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }



    var filter$2 = filter.filter;

    var map$2 = map.map;













    var excludeFalsey = function excludeFalsey(param, defValue) {
      var value = typeof param === 'undefined' ? defValue : param;
      return param === false ? undefined : value;
    };

    var getMutationQuery = function getMutationQuery() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return {
        returnIds: true,
        returnDocuments: excludeFalsey(options.returnDocuments, true),
        visibility: options.visibility || 'sync'
      };
    };

    var isResponse = function isResponse(event) {
      return event.type === 'response';
    };

    var getBody = function getBody(event) {
      return event.body;
    };

    var indexBy = function indexBy(docs, attr) {
      return docs.reduce(function (indexed, doc) {
        indexed[attr(doc)] = doc;
        return indexed;
      }, Object.create(null));
    };

    var toPromise = function toPromise(observable) {
      return observable.toPromise();
    };

    var getQuerySizeLimit = 11264;
    var dataMethods = {
      listen: listen$1,
      getDataUrl: function getDataUrl(operation, path) {
        var config = this.clientConfig;
        var catalog = config.gradientMode ? config.namespace : validators.hasDataset(config);
        var baseUri = "/".concat(operation, "/").concat(catalog);
        var uri = path ? "".concat(baseUri, "/").concat(path) : baseUri;
        return (this.clientConfig.gradientMode ? uri : "/data".concat(uri)).replace(/\/($|\?)/, '$1');
      },
      fetch: function fetch(query, params) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var mapResponse = options.filterResponse === false ? function (res) {
          return res;
        } : function (res) {
          return res.result;
        };

        var observable = this._dataRequest('query', {
          query: query,
          params: params
        }, options).pipe(map$2(mapResponse));

        return this.isPromiseAPI() ? toPromise(observable) : observable;
      },
      getDocument: function getDocument(id) {
        var options = {
          uri: this.getDataUrl('doc', id),
          json: true
        };

        var observable = this._requestObservable(options).pipe(filter$2(isResponse), map$2(function (event) {
          return event.body.documents && event.body.documents[0];
        }));

        return this.isPromiseAPI() ? toPromise(observable) : observable;
      },
      getDocuments: function getDocuments(ids) {
        var options = {
          uri: this.getDataUrl('doc', ids.join(',')),
          json: true
        };

        var observable = this._requestObservable(options).pipe(filter$2(isResponse), map$2(function (event) {
          var indexed = indexBy(event.body.documents || [], function (doc) {
            return doc._id;
          });
          return ids.map(function (id) {
            return indexed[id] || null;
          });
        }));

        return this.isPromiseAPI() ? toPromise(observable) : observable;
      },
      create: function create(doc, options) {
        return this._create(doc, 'create', options);
      },
      createIfNotExists: function createIfNotExists(doc, options) {
        validators.requireDocumentId('createIfNotExists', doc);
        return this._create(doc, 'createIfNotExists', options);
      },
      createOrReplace: function createOrReplace(doc, options) {
        validators.requireDocumentId('createOrReplace', doc);
        return this._create(doc, 'createOrReplace', options);
      },
      patch: function patch$1(selector, operations) {
        return new patch(selector, operations, this);
      },
      delete: function _delete(selection, options) {
        return this.dataRequest('mutate', {
          mutations: [{
            delete: getSelection(selection)
          }]
        }, options);
      },
      mutate: function mutate(mutations, options) {
        var mut = mutations instanceof patch || mutations instanceof transaction ? mutations.serialize() : mutations;
        var muts = Array.isArray(mut) ? mut : [mut];
        var transactionId = options && options.transactionId;
        return this.dataRequest('mutate', {
          mutations: muts,
          transactionId: transactionId
        }, options);
      },
      transaction: function transaction$1(operations) {
        return new transaction(operations, this);
      },
      dataRequest: function dataRequest(endpoint, body) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        var request = this._dataRequest(endpoint, body, options);

        return this.isPromiseAPI() ? toPromise(request) : request;
      },
      _dataRequest: function _dataRequest(endpoint, body) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var isMutation = endpoint === 'mutate'; // Check if the query string is within a configured threshold,
        // in which case we can use GET. Otherwise, use POST.

        var strQuery = !isMutation && encodeQueryString(body);
        var useGet = !isMutation && strQuery.length < getQuerySizeLimit;
        var stringQuery = useGet ? strQuery : '';
        var returnFirst = options.returnFirst;
        var timeout = options.timeout,
            token = options.token;
        var uri = this.getDataUrl(endpoint, stringQuery);
        var reqOptions = {
          method: useGet ? 'GET' : 'POST',
          uri: uri,
          json: true,
          body: useGet ? undefined : body,
          query: isMutation && getMutationQuery(options),
          timeout: timeout,
          token: token
        };
        return this._requestObservable(reqOptions).pipe(filter$2(isResponse), map$2(getBody), map$2(function (res) {
          if (!isMutation) {
            return res;
          } // Should we return documents?


          var results = res.results || [];

          if (options.returnDocuments) {
            return returnFirst ? results[0] && results[0].document : results.map(function (mut) {
              return mut.document;
            });
          } // Return a reduced subset


          var key = returnFirst ? 'documentId' : 'documentIds';
          var ids = returnFirst ? results[0] && results[0].id : results.map(function (mut) {
            return mut.id;
          });
          return _defineProperty$2({
            transactionId: res.transactionId,
            results: results
          }, key, ids);
        }));
      },
      _create: function _create(doc, op) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        var mutation = _defineProperty$2({}, op, doc);

        var opts = objectAssign({
          returnFirst: true,
          returnDocuments: true
        }, options);
        return this.dataRequest('mutate', {
          mutations: [mutation]
        }, opts);
      }
    };

    function DatasetsClient(client) {
      this.request = client.request.bind(client);
    }

    objectAssign(DatasetsClient.prototype, {
      create: function create(name, options) {
        return this._modify('PUT', name, options);
      },
      edit: function edit(name, options) {
        return this._modify('PATCH', name, options);
      },
      delete: function _delete(name) {
        return this._modify('DELETE', name);
      },
      list: function list() {
        return this.request({
          uri: '/datasets'
        });
      },
      _modify: function _modify(method, name, body) {
        validators.dataset(name);
        return this.request({
          method: method,
          uri: "/datasets/".concat(name),
          body: body
        });
      }
    });
    var datasetsClient = DatasetsClient;

    function ProjectsClient(client) {
      this.client = client;
    }

    objectAssign(ProjectsClient.prototype, {
      list: function list() {
        return this.client.request({
          uri: '/projects'
        });
      },
      getById: function getById(id) {
        return this.client.request({
          uri: "/projects/".concat(id)
        });
      }
    });
    var projectsClient = ProjectsClient;

    var queryString = function (params) {
      var qs = [];

      for (var key in params) {
        if (params.hasOwnProperty(key)) {
          qs.push("".concat(encodeURIComponent(key), "=").concat(encodeURIComponent(params[key])));
        }
      }

      return qs.length > 0 ? "?".concat(qs.join('&')) : '';
    };

    function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

    function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

    function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

    function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }



    var map$3 = map.map;

    var filter$3 = filter.filter;





    function AssetsClient(client) {
      this.client = client;
    }

    function toDocument(body) {
      // todo: rewrite to just return body.document in a while
      var document = body.document;
      Object.defineProperty(document, 'document', {
        enumerable: false,
        get: function get() {
          // eslint-disable-next-line no-console
          console.warn('The promise returned from client.asset.upload(...) now resolves with the asset document');
          return document;
        }
      });
      return document;
    }

    function optionsFromFile(opts, file) {
      if (typeof window === 'undefined' || !(file instanceof window.File)) {
        return opts;
      }

      return objectAssign({
        filename: opts.preserveFilename === false ? undefined : file.name,
        contentType: file.type
      }, opts);
    }

    objectAssign(AssetsClient.prototype, {
      /**
       * Upload an asset
       *
       * @param  {String} assetType `image` or `file`
       * @param  {File|Blob|Buffer|ReadableStream} body File to upload
       * @param  {Object}  opts Options for the upload
       * @param  {Boolean} opts.preserveFilename Whether or not to preserve the original filename (default: true)
       * @param  {String}  opts.filename Filename for this file (optional)
       * @param  {Number}  opts.timeout  Milliseconds to wait before timing the request out (default: 0)
       * @param  {String}  opts.contentType Mime type of the file
       * @param  {Array}   opts.extract Array of metadata parts to extract from image.
       *                                 Possible values: `location`, `exif`, `image`, `palette`
       * @return {Promise} Resolves with the created asset document
       */
      upload: function upload(assetType, body) {
        var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        validators.validateAssetType(assetType); // If an empty array is given, explicitly set `none` to override API defaults

        var meta = opts.extract || undefined;

        if (meta && !meta.length) {
          meta = ['none'];
        }

        var dataset = validators.hasDataset(this.client.clientConfig);
        var assetEndpoint = assetType === 'image' ? 'images' : 'files';
        var options = optionsFromFile(opts, body);
        var label = options.label,
            filename = options.filename;
        var query = {
          label: label,
          filename: filename,
          meta: meta
        };

        var observable = this.client._requestObservable({
          method: 'POST',
          timeout: options.timeout || 0,
          uri: "/assets/".concat(assetEndpoint, "/").concat(dataset),
          headers: options.contentType ? {
            'Content-Type': options.contentType
          } : {},
          query: query,
          body: body
        });

        return this.client.isPromiseAPI() ? observable.pipe(filter$3(function (event) {
          return event.type === 'response';
        }), map$3(function (event) {
          return toDocument(event.body);
        })).toPromise() : observable;
      },
      delete: function _delete(type, id) {
        // eslint-disable-next-line no-console
        console.warn('client.assets.delete() is deprecated, please use client.delete(<document-id>)');
        var docId = id || '';

        if (!/^(image|file)-/.test(docId)) {
          docId = "".concat(type, "-").concat(docId);
        } else if (type._id) {
          // We could be passing an entire asset document instead of an ID
          docId = type._id;
        }

        validators.hasDataset(this.client.clientConfig);
        return this.client.delete(docId);
      },
      getImageUrl: function getImageUrl(ref, query) {
        var id = ref._ref || ref;

        if (typeof id !== 'string') {
          throw new Error('getImageUrl() needs either an object with a _ref, or a string with an asset document ID');
        }

        if (!/^image-[A-Za-z0-9_]+-\d+x\d+-[a-z]{1,5}$/.test(id)) {
          throw new Error("Unsupported asset ID \"".concat(id, "\". URL generation only works for auto-generated IDs."));
        }

        var _id$split = id.split('-'),
            _id$split2 = _slicedToArray(_id$split, 4),
            assetId = _id$split2[1],
            size = _id$split2[2],
            format = _id$split2[3];

        validators.hasDataset(this.client.clientConfig);
        var _this$client$clientCo = this.client.clientConfig,
            projectId = _this$client$clientCo.projectId,
            dataset = _this$client$clientCo.dataset;
        var qs = query ? queryString(query) : '';
        return "https://cdn.sanity.io/images/".concat(projectId, "/").concat(dataset, "/").concat(assetId, "-").concat(size, ".").concat(format).concat(qs);
      }
    });
    var assetsClient = AssetsClient;

    function UsersClient(client) {
      this.client = client;
    }

    objectAssign(UsersClient.prototype, {
      getById: function getById(id) {
        return this.client.request({
          uri: "/users/".concat(id)
        });
      }
    });
    var usersClient = UsersClient;

    function AuthClient(client) {
      this.client = client;
    }

    objectAssign(AuthClient.prototype, {
      getLoginProviders: function getLoginProviders() {
        return this.client.request({
          uri: '/auth/providers'
        });
      },
      logout: function logout() {
        return this.client.request({
          uri: '/auth/logout',
          method: 'POST'
        });
      }
    });
    var authClient = AuthClient;

    var nanoPubsub = function Pubsub() {
      var subscribers = [];
      return {
        subscribe: subscribe,
        publish: publish
      }
      function subscribe(subscriber) {
        subscribers.push(subscriber);
        return function unsubscribe() {
          var idx = subscribers.indexOf(subscriber);
          if (idx > -1) {
            subscribers.splice(idx, 1);
          }
        }
      }
      function publish() {
        for (var i = 0; i < subscribers.length; i++) {
          subscribers[i].apply(null, arguments);
        }
      }
    };

    var middlewareReducer = function (middleware) {
      var applyMiddleware = function applyMiddleware(hook, defaultValue) {
        for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
          args[_key - 2] = arguments[_key];
        }

        return middleware[hook].reduce(function (value, handler) {
          return handler.apply(undefined, [value].concat(args));
        }, defaultValue);
      };

      return applyMiddleware;
    };

    /**
     * Check if we're required to add a port number.
     *
     * @see https://url.spec.whatwg.org/#default-port
     * @param {Number|String} port Port number we need to check
     * @param {String} protocol Protocol we need to check against.
     * @returns {Boolean} Is it a default port for the given protocol
     * @api private
     */
    var requiresPort = function required(port, protocol) {
      protocol = protocol.split(':')[0];
      port = +port;

      if (!port) return false;

      switch (protocol) {
        case 'http':
        case 'ws':
        return port !== 80;

        case 'https':
        case 'wss':
        return port !== 443;

        case 'ftp':
        return port !== 21;

        case 'gopher':
        return port !== 70;

        case 'file':
        return false;
      }

      return port !== 0;
    };

    var has = Object.prototype.hasOwnProperty
      , undef;

    /**
     * Decode a URI encoded string.
     *
     * @param {String} input The URI encoded string.
     * @returns {String|Null} The decoded string.
     * @api private
     */
    function decode(input) {
      try {
        return decodeURIComponent(input.replace(/\+/g, ' '));
      } catch (e) {
        return null;
      }
    }

    /**
     * Simple query string parser.
     *
     * @param {String} query The query string that needs to be parsed.
     * @returns {Object}
     * @api public
     */
    function querystring(query) {
      var parser = /([^=?&]+)=?([^&]*)/g
        , result = {}
        , part;

      while (part = parser.exec(query)) {
        var key = decode(part[1])
          , value = decode(part[2]);

        //
        // Prevent overriding of existing properties. This ensures that build-in
        // methods like `toString` or __proto__ are not overriden by malicious
        // querystrings.
        //
        // In the case if failed decoding, we want to omit the key/value pairs
        // from the result.
        //
        if (key === null || value === null || key in result) continue;
        result[key] = value;
      }

      return result;
    }

    /**
     * Transform a query string to an object.
     *
     * @param {Object} obj Object that should be transformed.
     * @param {String} prefix Optional prefix.
     * @returns {String}
     * @api public
     */
    function querystringify(obj, prefix) {
      prefix = prefix || '';

      var pairs = []
        , value
        , key;

      //
      // Optionally prefix with a '?' if needed
      //
      if ('string' !== typeof prefix) prefix = '?';

      for (key in obj) {
        if (has.call(obj, key)) {
          value = obj[key];

          //
          // Edge cases where we actually want to encode the value to an empty
          // string instead of the stringified value.
          //
          if (!value && (value === null || value === undef || isNaN(value))) {
            value = '';
          }

          key = encodeURIComponent(key);
          value = encodeURIComponent(value);

          //
          // If we failed to encode the strings, we should bail out as we don't
          // want to add invalid strings to the query.
          //
          if (key === null || value === null) continue;
          pairs.push(key +'='+ value);
        }
      }

      return pairs.length ? prefix + pairs.join('&') : '';
    }

    //
    // Expose the module.
    //
    var stringify = querystringify;
    var parse = querystring;

    var querystringify_1 = {
    	stringify: stringify,
    	parse: parse
    };

    var slashes = /^[A-Za-z][A-Za-z0-9+-.]*:\/\//
      , protocolre = /^([a-z][a-z0-9.+-]*:)?(\/\/)?([\S\s]*)/i
      , whitespace = '[\\x09\\x0A\\x0B\\x0C\\x0D\\x20\\xA0\\u1680\\u180E\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200A\\u202F\\u205F\\u3000\\u2028\\u2029\\uFEFF]'
      , left = new RegExp('^'+ whitespace +'+');

    /**
     * Trim a given string.
     *
     * @param {String} str String to trim.
     * @public
     */
    function trimLeft(str) {
      return (str ? str : '').toString().replace(left, '');
    }

    /**
     * These are the parse rules for the URL parser, it informs the parser
     * about:
     *
     * 0. The char it Needs to parse, if it's a string it should be done using
     *    indexOf, RegExp using exec and NaN means set as current value.
     * 1. The property we should set when parsing this value.
     * 2. Indication if it's backwards or forward parsing, when set as number it's
     *    the value of extra chars that should be split off.
     * 3. Inherit from location if non existing in the parser.
     * 4. `toLowerCase` the resulting value.
     */
    var rules = [
      ['#', 'hash'],                        // Extract from the back.
      ['?', 'query'],                       // Extract from the back.
      function sanitize(address) {          // Sanitize what is left of the address
        return address.replace('\\', '/');
      },
      ['/', 'pathname'],                    // Extract from the back.
      ['@', 'auth', 1],                     // Extract from the front.
      [NaN, 'host', undefined, 1, 1],       // Set left over value.
      [/:(\d+)$/, 'port', undefined, 1],    // RegExp the back.
      [NaN, 'hostname', undefined, 1, 1]    // Set left over.
    ];

    /**
     * These properties should not be copied or inherited from. This is only needed
     * for all non blob URL's as a blob URL does not include a hash, only the
     * origin.
     *
     * @type {Object}
     * @private
     */
    var ignore = { hash: 1, query: 1 };

    /**
     * The location object differs when your code is loaded through a normal page,
     * Worker or through a worker using a blob. And with the blobble begins the
     * trouble as the location object will contain the URL of the blob, not the
     * location of the page where our code is loaded in. The actual origin is
     * encoded in the `pathname` so we can thankfully generate a good "default"
     * location from it so we can generate proper relative URL's again.
     *
     * @param {Object|String} loc Optional default location object.
     * @returns {Object} lolcation object.
     * @public
     */
    function lolcation(loc) {
      var globalVar;

      if (typeof window !== 'undefined') globalVar = window;
      else if (typeof commonjsGlobal !== 'undefined') globalVar = commonjsGlobal;
      else if (typeof self !== 'undefined') globalVar = self;
      else globalVar = {};

      var location = globalVar.location || {};
      loc = loc || location;

      var finaldestination = {}
        , type = typeof loc
        , key;

      if ('blob:' === loc.protocol) {
        finaldestination = new Url(unescape(loc.pathname), {});
      } else if ('string' === type) {
        finaldestination = new Url(loc, {});
        for (key in ignore) delete finaldestination[key];
      } else if ('object' === type) {
        for (key in loc) {
          if (key in ignore) continue;
          finaldestination[key] = loc[key];
        }

        if (finaldestination.slashes === undefined) {
          finaldestination.slashes = slashes.test(loc.href);
        }
      }

      return finaldestination;
    }

    /**
     * @typedef ProtocolExtract
     * @type Object
     * @property {String} protocol Protocol matched in the URL, in lowercase.
     * @property {Boolean} slashes `true` if protocol is followed by "//", else `false`.
     * @property {String} rest Rest of the URL that is not part of the protocol.
     */

    /**
     * Extract protocol information from a URL with/without double slash ("//").
     *
     * @param {String} address URL we want to extract from.
     * @return {ProtocolExtract} Extracted information.
     * @private
     */
    function extractProtocol(address) {
      address = trimLeft(address);
      var match = protocolre.exec(address);

      return {
        protocol: match[1] ? match[1].toLowerCase() : '',
        slashes: !!match[2],
        rest: match[3]
      };
    }

    /**
     * Resolve a relative URL pathname against a base URL pathname.
     *
     * @param {String} relative Pathname of the relative URL.
     * @param {String} base Pathname of the base URL.
     * @return {String} Resolved pathname.
     * @private
     */
    function resolve$1(relative, base) {
      if (relative === '') return base;

      var path = (base || '/').split('/').slice(0, -1).concat(relative.split('/'))
        , i = path.length
        , last = path[i - 1]
        , unshift = false
        , up = 0;

      while (i--) {
        if (path[i] === '.') {
          path.splice(i, 1);
        } else if (path[i] === '..') {
          path.splice(i, 1);
          up++;
        } else if (up) {
          if (i === 0) unshift = true;
          path.splice(i, 1);
          up--;
        }
      }

      if (unshift) path.unshift('');
      if (last === '.' || last === '..') path.push('');

      return path.join('/');
    }

    /**
     * The actual URL instance. Instead of returning an object we've opted-in to
     * create an actual constructor as it's much more memory efficient and
     * faster and it pleases my OCD.
     *
     * It is worth noting that we should not use `URL` as class name to prevent
     * clashes with the global URL instance that got introduced in browsers.
     *
     * @constructor
     * @param {String} address URL we want to parse.
     * @param {Object|String} [location] Location defaults for relative paths.
     * @param {Boolean|Function} [parser] Parser for the query string.
     * @private
     */
    function Url(address, location, parser) {
      address = trimLeft(address);

      if (!(this instanceof Url)) {
        return new Url(address, location, parser);
      }

      var relative, extracted, parse, instruction, index, key
        , instructions = rules.slice()
        , type = typeof location
        , url = this
        , i = 0;

      //
      // The following if statements allows this module two have compatibility with
      // 2 different API:
      //
      // 1. Node.js's `url.parse` api which accepts a URL, boolean as arguments
      //    where the boolean indicates that the query string should also be parsed.
      //
      // 2. The `URL` interface of the browser which accepts a URL, object as
      //    arguments. The supplied object will be used as default values / fall-back
      //    for relative paths.
      //
      if ('object' !== type && 'string' !== type) {
        parser = location;
        location = null;
      }

      if (parser && 'function' !== typeof parser) parser = querystringify_1.parse;

      location = lolcation(location);

      //
      // Extract protocol information before running the instructions.
      //
      extracted = extractProtocol(address || '');
      relative = !extracted.protocol && !extracted.slashes;
      url.slashes = extracted.slashes || relative && location.slashes;
      url.protocol = extracted.protocol || location.protocol || '';
      address = extracted.rest;

      //
      // When the authority component is absent the URL starts with a path
      // component.
      //
      if (!extracted.slashes) instructions[3] = [/(.*)/, 'pathname'];

      for (; i < instructions.length; i++) {
        instruction = instructions[i];

        if (typeof instruction === 'function') {
          address = instruction(address);
          continue;
        }

        parse = instruction[0];
        key = instruction[1];

        if (parse !== parse) {
          url[key] = address;
        } else if ('string' === typeof parse) {
          if (~(index = address.indexOf(parse))) {
            if ('number' === typeof instruction[2]) {
              url[key] = address.slice(0, index);
              address = address.slice(index + instruction[2]);
            } else {
              url[key] = address.slice(index);
              address = address.slice(0, index);
            }
          }
        } else if ((index = parse.exec(address))) {
          url[key] = index[1];
          address = address.slice(0, index.index);
        }

        url[key] = url[key] || (
          relative && instruction[3] ? location[key] || '' : ''
        );

        //
        // Hostname, host and protocol should be lowercased so they can be used to
        // create a proper `origin`.
        //
        if (instruction[4]) url[key] = url[key].toLowerCase();
      }

      //
      // Also parse the supplied query string in to an object. If we're supplied
      // with a custom parser as function use that instead of the default build-in
      // parser.
      //
      if (parser) url.query = parser(url.query);

      //
      // If the URL is relative, resolve the pathname against the base URL.
      //
      if (
          relative
        && location.slashes
        && url.pathname.charAt(0) !== '/'
        && (url.pathname !== '' || location.pathname !== '')
      ) {
        url.pathname = resolve$1(url.pathname, location.pathname);
      }

      //
      // We should not add port numbers if they are already the default port number
      // for a given protocol. As the host also contains the port number we're going
      // override it with the hostname which contains no port number.
      //
      if (!requiresPort(url.port, url.protocol)) {
        url.host = url.hostname;
        url.port = '';
      }

      //
      // Parse down the `auth` for the username and password.
      //
      url.username = url.password = '';
      if (url.auth) {
        instruction = url.auth.split(':');
        url.username = instruction[0] || '';
        url.password = instruction[1] || '';
      }

      url.origin = url.protocol && url.host && url.protocol !== 'file:'
        ? url.protocol +'//'+ url.host
        : 'null';

      //
      // The href is just the compiled result.
      //
      url.href = url.toString();
    }

    /**
     * This is convenience method for changing properties in the URL instance to
     * insure that they all propagate correctly.
     *
     * @param {String} part          Property we need to adjust.
     * @param {Mixed} value          The newly assigned value.
     * @param {Boolean|Function} fn  When setting the query, it will be the function
     *                               used to parse the query.
     *                               When setting the protocol, double slash will be
     *                               removed from the final url if it is true.
     * @returns {URL} URL instance for chaining.
     * @public
     */
    function set(part, value, fn) {
      var url = this;

      switch (part) {
        case 'query':
          if ('string' === typeof value && value.length) {
            value = (fn || querystringify_1.parse)(value);
          }

          url[part] = value;
          break;

        case 'port':
          url[part] = value;

          if (!requiresPort(value, url.protocol)) {
            url.host = url.hostname;
            url[part] = '';
          } else if (value) {
            url.host = url.hostname +':'+ value;
          }

          break;

        case 'hostname':
          url[part] = value;

          if (url.port) value += ':'+ url.port;
          url.host = value;
          break;

        case 'host':
          url[part] = value;

          if (/:\d+$/.test(value)) {
            value = value.split(':');
            url.port = value.pop();
            url.hostname = value.join(':');
          } else {
            url.hostname = value;
            url.port = '';
          }

          break;

        case 'protocol':
          url.protocol = value.toLowerCase();
          url.slashes = !fn;
          break;

        case 'pathname':
        case 'hash':
          if (value) {
            var char = part === 'pathname' ? '/' : '#';
            url[part] = value.charAt(0) !== char ? char + value : value;
          } else {
            url[part] = value;
          }
          break;

        default:
          url[part] = value;
      }

      for (var i = 0; i < rules.length; i++) {
        var ins = rules[i];

        if (ins[4]) url[ins[1]] = url[ins[1]].toLowerCase();
      }

      url.origin = url.protocol && url.host && url.protocol !== 'file:'
        ? url.protocol +'//'+ url.host
        : 'null';

      url.href = url.toString();

      return url;
    }

    /**
     * Transform the properties back in to a valid and full URL string.
     *
     * @param {Function} stringify Optional query stringify function.
     * @returns {String} Compiled version of the URL.
     * @public
     */
    function toString(stringify) {
      if (!stringify || 'function' !== typeof stringify) stringify = querystringify_1.stringify;

      var query
        , url = this
        , protocol = url.protocol;

      if (protocol && protocol.charAt(protocol.length - 1) !== ':') protocol += ':';

      var result = protocol + (url.slashes ? '//' : '');

      if (url.username) {
        result += url.username;
        if (url.password) result += ':'+ url.password;
        result += '@';
      }

      result += url.host + url.pathname;

      query = 'object' === typeof url.query ? stringify(url.query) : url.query;
      if (query) result += '?' !== query.charAt(0) ? '?'+ query : query;

      if (url.hash) result += url.hash;

      return result;
    }

    Url.prototype = { set: set, toString: toString };

    //
    // Expose the URL parser and some additional properties that might be useful for
    // others or testing.
    //
    Url.extractProtocol = extractProtocol;
    Url.location = lolcation;
    Url.trimLeft = trimLeft;
    Url.qs = querystringify_1;

    var urlParse = Url;

    var isReactNative = typeof navigator === 'undefined' ? false : navigator.product === 'ReactNative';

    var has$1 = Object.prototype.hasOwnProperty;
    var defaultOptions$1 = { timeout: isReactNative ? 60000 : 120000 };

    var defaultOptionsProcessor = function (opts) {
      var options = typeof opts === 'string' ? objectAssign({ url: opts }, defaultOptions$1) : objectAssign({}, defaultOptions$1, opts);

      // Parse URL into parts
      var url = urlParse(options.url, {}, // Don't use current browser location
      true // Parse query strings
      );

      // Normalize timeouts
      options.timeout = normalizeTimeout(options.timeout);

      // Shallow-merge (override) existing query params
      if (options.query) {
        url.query = objectAssign({}, url.query, removeUndefined(options.query));
      }

      // Implicit POST if we have not specified a method but have a body
      options.method = options.body && !options.method ? 'POST' : (options.method || 'GET').toUpperCase();

      // Stringify URL
      options.url = url.toString(stringifyQueryString);

      return options;
    };

    function stringifyQueryString(obj) {
      var pairs = [];
      for (var key in obj) {
        if (has$1.call(obj, key)) {
          push(key, obj[key]);
        }
      }

      return pairs.length ? pairs.join('&') : '';

      function push(key, val) {
        if (Array.isArray(val)) {
          val.forEach(function (item) {
            return push(key, item);
          });
        } else {
          pairs.push([key, val].map(encodeURIComponent).join('='));
        }
      }
    }

    function normalizeTimeout(time) {
      if (time === false || time === 0) {
        return false;
      }

      if (time.connect || time.socket) {
        return time;
      }

      var delay = Number(time);
      if (isNaN(delay)) {
        return normalizeTimeout(defaultOptions$1.timeout);
      }

      return { connect: delay, socket: delay };
    }

    function removeUndefined(obj) {
      var target = {};
      for (var key in obj) {
        if (obj[key] !== undefined) {
          target[key] = obj[key];
        }
      }
      return target;
    }

    var validUrl = /^https?:\/\//i;

    var defaultOptionsValidator = function (options) {
      if (!validUrl.test(options.url)) {
        throw new Error("\"" + options.url + "\" is not a valid URL");
      }
    };

    /**
     * This file is only used for the browser version of `same-origin`.
     * Used to bring down the size of the browser bundle.
     */

    var regex = /^(?:(?:(?:([^:\/#\?]+:)?(?:(?:\/\/)((?:((?:[^:@\/#\?]+)(?:\:(?:[^:@\/#\?]+))?)@)?(([^:\/#\?\]\[]+|\[[^\/\]@#?]+\])(?:\:([0-9]+))?))?)?)?((?:\/?(?:[^\/\?#]+\/+)*)(?:[^\?#]*)))?(\?[^#]+)?)(#.*)?/;

    var urlParser = {
        regex: regex,
        parse: function(url) {
            var match = regex.exec(url);
            if (!match) {
                return {};
            }

            return {
                protocol: (match[1] || '').toLowerCase() || undefined,
                hostname: (match[5] || '').toLowerCase() || undefined,
                port: match[6] || undefined
            };
        }
    };

    var sameOrigin = function(uri1, uri2, ieMode) {
        if (uri1 === uri2) {
            return true;
        }

        var url1 = urlParser.parse(uri1, false, true);
        var url2 = urlParser.parse(uri2, false, true);

        var url1Port = url1.port|0 || (url1.protocol === 'https' ? 443 : 80);
        var url2Port = url2.port|0 || (url2.protocol === 'https' ? 443 : 80);

        var match = {
            proto: url1.protocol === url2.protocol,
            hostname: url1.hostname === url2.hostname,
            port: url1Port === url2Port
        };

        return ((match.proto && match.hostname) && (match.port || ieMode));
    };

    /* eslint no-invalid-this: 1 */

    var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
    var slice = Array.prototype.slice;
    var toStr = Object.prototype.toString;
    var funcType = '[object Function]';

    var implementation = function bind(that) {
        var target = this;
        if (typeof target !== 'function' || toStr.call(target) !== funcType) {
            throw new TypeError(ERROR_MESSAGE + target);
        }
        var args = slice.call(arguments, 1);

        var bound;
        var binder = function () {
            if (this instanceof bound) {
                var result = target.apply(
                    this,
                    args.concat(slice.call(arguments))
                );
                if (Object(result) === result) {
                    return result;
                }
                return this;
            } else {
                return target.apply(
                    that,
                    args.concat(slice.call(arguments))
                );
            }
        };

        var boundLength = Math.max(0, target.length - args.length);
        var boundArgs = [];
        for (var i = 0; i < boundLength; i++) {
            boundArgs.push('$' + i);
        }

        bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this,arguments); }')(binder);

        if (target.prototype) {
            var Empty = function Empty() {};
            Empty.prototype = target.prototype;
            bound.prototype = new Empty();
            Empty.prototype = null;
        }

        return bound;
    };

    var functionBind = Function.prototype.bind || implementation;

    var toStr$1 = Object.prototype.toString;

    var isArguments = function isArguments(value) {
    	var str = toStr$1.call(value);
    	var isArgs = str === '[object Arguments]';
    	if (!isArgs) {
    		isArgs = str !== '[object Array]' &&
    			value !== null &&
    			typeof value === 'object' &&
    			typeof value.length === 'number' &&
    			value.length >= 0 &&
    			toStr$1.call(value.callee) === '[object Function]';
    	}
    	return isArgs;
    };

    var keysShim;
    if (!Object.keys) {
    	// modified from https://github.com/es-shims/es5-shim
    	var has$2 = Object.prototype.hasOwnProperty;
    	var toStr$2 = Object.prototype.toString;
    	var isArgs = isArguments; // eslint-disable-line global-require
    	var isEnumerable = Object.prototype.propertyIsEnumerable;
    	var hasDontEnumBug = !isEnumerable.call({ toString: null }, 'toString');
    	var hasProtoEnumBug = isEnumerable.call(function () {}, 'prototype');
    	var dontEnums = [
    		'toString',
    		'toLocaleString',
    		'valueOf',
    		'hasOwnProperty',
    		'isPrototypeOf',
    		'propertyIsEnumerable',
    		'constructor'
    	];
    	var equalsConstructorPrototype = function (o) {
    		var ctor = o.constructor;
    		return ctor && ctor.prototype === o;
    	};
    	var excludedKeys = {
    		$applicationCache: true,
    		$console: true,
    		$external: true,
    		$frame: true,
    		$frameElement: true,
    		$frames: true,
    		$innerHeight: true,
    		$innerWidth: true,
    		$onmozfullscreenchange: true,
    		$onmozfullscreenerror: true,
    		$outerHeight: true,
    		$outerWidth: true,
    		$pageXOffset: true,
    		$pageYOffset: true,
    		$parent: true,
    		$scrollLeft: true,
    		$scrollTop: true,
    		$scrollX: true,
    		$scrollY: true,
    		$self: true,
    		$webkitIndexedDB: true,
    		$webkitStorageInfo: true,
    		$window: true
    	};
    	var hasAutomationEqualityBug = (function () {
    		/* global window */
    		if (typeof window === 'undefined') { return false; }
    		for (var k in window) {
    			try {
    				if (!excludedKeys['$' + k] && has$2.call(window, k) && window[k] !== null && typeof window[k] === 'object') {
    					try {
    						equalsConstructorPrototype(window[k]);
    					} catch (e) {
    						return true;
    					}
    				}
    			} catch (e) {
    				return true;
    			}
    		}
    		return false;
    	}());
    	var equalsConstructorPrototypeIfNotBuggy = function (o) {
    		/* global window */
    		if (typeof window === 'undefined' || !hasAutomationEqualityBug) {
    			return equalsConstructorPrototype(o);
    		}
    		try {
    			return equalsConstructorPrototype(o);
    		} catch (e) {
    			return false;
    		}
    	};

    	keysShim = function keys(object) {
    		var isObject = object !== null && typeof object === 'object';
    		var isFunction = toStr$2.call(object) === '[object Function]';
    		var isArguments = isArgs(object);
    		var isString = isObject && toStr$2.call(object) === '[object String]';
    		var theKeys = [];

    		if (!isObject && !isFunction && !isArguments) {
    			throw new TypeError('Object.keys called on a non-object');
    		}

    		var skipProto = hasProtoEnumBug && isFunction;
    		if (isString && object.length > 0 && !has$2.call(object, 0)) {
    			for (var i = 0; i < object.length; ++i) {
    				theKeys.push(String(i));
    			}
    		}

    		if (isArguments && object.length > 0) {
    			for (var j = 0; j < object.length; ++j) {
    				theKeys.push(String(j));
    			}
    		} else {
    			for (var name in object) {
    				if (!(skipProto && name === 'prototype') && has$2.call(object, name)) {
    					theKeys.push(String(name));
    				}
    			}
    		}

    		if (hasDontEnumBug) {
    			var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);

    			for (var k = 0; k < dontEnums.length; ++k) {
    				if (!(skipConstructor && dontEnums[k] === 'constructor') && has$2.call(object, dontEnums[k])) {
    					theKeys.push(dontEnums[k]);
    				}
    			}
    		}
    		return theKeys;
    	};
    }
    var implementation$1 = keysShim;

    var slice$1 = Array.prototype.slice;


    var origKeys = Object.keys;
    var keysShim$1 = origKeys ? function keys(o) { return origKeys(o); } : implementation$1;

    var originalKeys = Object.keys;

    keysShim$1.shim = function shimObjectKeys() {
    	if (Object.keys) {
    		var keysWorksWithArguments = (function () {
    			// Safari 5.0 bug
    			var args = Object.keys(arguments);
    			return args && args.length === arguments.length;
    		}(1, 2));
    		if (!keysWorksWithArguments) {
    			Object.keys = function keys(object) { // eslint-disable-line func-name-matching
    				if (isArguments(object)) {
    					return originalKeys(slice$1.call(object));
    				}
    				return originalKeys(object);
    			};
    		}
    	} else {
    		Object.keys = keysShim$1;
    	}
    	return Object.keys || keysShim$1;
    };

    var objectKeys = keysShim$1;

    var hasSymbols = typeof Symbol === 'function' && typeof Symbol('foo') === 'symbol';

    var toStr$3 = Object.prototype.toString;
    var concat = Array.prototype.concat;
    var origDefineProperty = Object.defineProperty;

    var isFunction = function (fn) {
    	return typeof fn === 'function' && toStr$3.call(fn) === '[object Function]';
    };

    var arePropertyDescriptorsSupported = function () {
    	var obj = {};
    	try {
    		origDefineProperty(obj, 'x', { enumerable: false, value: obj });
    		// eslint-disable-next-line no-unused-vars, no-restricted-syntax
    		for (var _ in obj) { // jscs:ignore disallowUnusedVariables
    			return false;
    		}
    		return obj.x === obj;
    	} catch (e) { /* this is IE 8. */
    		return false;
    	}
    };
    var supportsDescriptors = origDefineProperty && arePropertyDescriptorsSupported();

    var defineProperty = function (object, name, value, predicate) {
    	if (name in object && (!isFunction(predicate) || !predicate())) {
    		return;
    	}
    	if (supportsDescriptors) {
    		origDefineProperty(object, name, {
    			configurable: true,
    			enumerable: false,
    			value: value,
    			writable: true
    		});
    	} else {
    		object[name] = value;
    	}
    };

    var defineProperties = function (object, map) {
    	var predicates = arguments.length > 2 ? arguments[2] : {};
    	var props = objectKeys(map);
    	if (hasSymbols) {
    		props = concat.call(props, Object.getOwnPropertySymbols(map));
    	}
    	for (var i = 0; i < props.length; i += 1) {
    		defineProperty(object, props[i], map[props[i]], predicates[props[i]]);
    	}
    };

    defineProperties.supportsDescriptors = !!supportsDescriptors;

    var defineProperties_1 = defineProperties;

    /* eslint complexity: [2, 17], max-statements: [2, 33] */
    var shams = function hasSymbols() {
    	if (typeof Symbol !== 'function' || typeof Object.getOwnPropertySymbols !== 'function') { return false; }
    	if (typeof Symbol.iterator === 'symbol') { return true; }

    	var obj = {};
    	var sym = Symbol('test');
    	var symObj = Object(sym);
    	if (typeof sym === 'string') { return false; }

    	if (Object.prototype.toString.call(sym) !== '[object Symbol]') { return false; }
    	if (Object.prototype.toString.call(symObj) !== '[object Symbol]') { return false; }

    	// temp disabled per https://github.com/ljharb/object.assign/issues/17
    	// if (sym instanceof Symbol) { return false; }
    	// temp disabled per https://github.com/WebReflection/get-own-property-symbols/issues/4
    	// if (!(symObj instanceof Symbol)) { return false; }

    	// if (typeof Symbol.prototype.toString !== 'function') { return false; }
    	// if (String(sym) !== Symbol.prototype.toString.call(sym)) { return false; }

    	var symVal = 42;
    	obj[sym] = symVal;
    	for (sym in obj) { return false; } // eslint-disable-line no-restricted-syntax
    	if (typeof Object.keys === 'function' && Object.keys(obj).length !== 0) { return false; }

    	if (typeof Object.getOwnPropertyNames === 'function' && Object.getOwnPropertyNames(obj).length !== 0) { return false; }

    	var syms = Object.getOwnPropertySymbols(obj);
    	if (syms.length !== 1 || syms[0] !== sym) { return false; }

    	if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) { return false; }

    	if (typeof Object.getOwnPropertyDescriptor === 'function') {
    		var descriptor = Object.getOwnPropertyDescriptor(obj, sym);
    		if (descriptor.value !== symVal || descriptor.enumerable !== true) { return false; }
    	}

    	return true;
    };

    var origSymbol = commonjsGlobal.Symbol;


    var hasSymbols$1 = function hasNativeSymbols() {
    	if (typeof origSymbol !== 'function') { return false; }
    	if (typeof Symbol !== 'function') { return false; }
    	if (typeof origSymbol('foo') !== 'symbol') { return false; }
    	if (typeof Symbol('bar') !== 'symbol') { return false; }

    	return shams();
    };

    /* globals
    	Atomics,
    	SharedArrayBuffer,
    */

    var undefined$1; // eslint-disable-line no-shadow-restricted-names

    var $TypeError = TypeError;

    var ThrowTypeError = Object.getOwnPropertyDescriptor
    	? (function () { return Object.getOwnPropertyDescriptor(arguments, 'callee').get; }())
    	: function () { throw new $TypeError(); };

    var hasSymbols$2 = hasSymbols$1();

    var getProto = Object.getPrototypeOf || function (x) { return x.__proto__; }; // eslint-disable-line no-proto
    var generatorFunction =  undefined$1;
    var asyncFunction =  undefined$1;
    var asyncGenFunction =  undefined$1;

    var TypedArray = typeof Uint8Array === 'undefined' ? undefined$1 : getProto(Uint8Array);

    var INTRINSICS = {
    	'$ %Array%': Array,
    	'$ %ArrayBuffer%': typeof ArrayBuffer === 'undefined' ? undefined$1 : ArrayBuffer,
    	'$ %ArrayBufferPrototype%': typeof ArrayBuffer === 'undefined' ? undefined$1 : ArrayBuffer.prototype,
    	'$ %ArrayIteratorPrototype%': hasSymbols$2 ? getProto([][Symbol.iterator]()) : undefined$1,
    	'$ %ArrayPrototype%': Array.prototype,
    	'$ %ArrayProto_entries%': Array.prototype.entries,
    	'$ %ArrayProto_forEach%': Array.prototype.forEach,
    	'$ %ArrayProto_keys%': Array.prototype.keys,
    	'$ %ArrayProto_values%': Array.prototype.values,
    	'$ %AsyncFromSyncIteratorPrototype%': undefined$1,
    	'$ %AsyncFunction%': asyncFunction,
    	'$ %AsyncFunctionPrototype%':  undefined$1,
    	'$ %AsyncGenerator%':  undefined$1,
    	'$ %AsyncGeneratorFunction%': asyncGenFunction,
    	'$ %AsyncGeneratorPrototype%':  undefined$1,
    	'$ %AsyncIteratorPrototype%':  undefined$1,
    	'$ %Atomics%': typeof Atomics === 'undefined' ? undefined$1 : Atomics,
    	'$ %Boolean%': Boolean,
    	'$ %BooleanPrototype%': Boolean.prototype,
    	'$ %DataView%': typeof DataView === 'undefined' ? undefined$1 : DataView,
    	'$ %DataViewPrototype%': typeof DataView === 'undefined' ? undefined$1 : DataView.prototype,
    	'$ %Date%': Date,
    	'$ %DatePrototype%': Date.prototype,
    	'$ %decodeURI%': decodeURI,
    	'$ %decodeURIComponent%': decodeURIComponent,
    	'$ %encodeURI%': encodeURI,
    	'$ %encodeURIComponent%': encodeURIComponent,
    	'$ %Error%': Error,
    	'$ %ErrorPrototype%': Error.prototype,
    	'$ %eval%': eval, // eslint-disable-line no-eval
    	'$ %EvalError%': EvalError,
    	'$ %EvalErrorPrototype%': EvalError.prototype,
    	'$ %Float32Array%': typeof Float32Array === 'undefined' ? undefined$1 : Float32Array,
    	'$ %Float32ArrayPrototype%': typeof Float32Array === 'undefined' ? undefined$1 : Float32Array.prototype,
    	'$ %Float64Array%': typeof Float64Array === 'undefined' ? undefined$1 : Float64Array,
    	'$ %Float64ArrayPrototype%': typeof Float64Array === 'undefined' ? undefined$1 : Float64Array.prototype,
    	'$ %Function%': Function,
    	'$ %FunctionPrototype%': Function.prototype,
    	'$ %Generator%':  undefined$1,
    	'$ %GeneratorFunction%': generatorFunction,
    	'$ %GeneratorPrototype%':  undefined$1,
    	'$ %Int8Array%': typeof Int8Array === 'undefined' ? undefined$1 : Int8Array,
    	'$ %Int8ArrayPrototype%': typeof Int8Array === 'undefined' ? undefined$1 : Int8Array.prototype,
    	'$ %Int16Array%': typeof Int16Array === 'undefined' ? undefined$1 : Int16Array,
    	'$ %Int16ArrayPrototype%': typeof Int16Array === 'undefined' ? undefined$1 : Int8Array.prototype,
    	'$ %Int32Array%': typeof Int32Array === 'undefined' ? undefined$1 : Int32Array,
    	'$ %Int32ArrayPrototype%': typeof Int32Array === 'undefined' ? undefined$1 : Int32Array.prototype,
    	'$ %isFinite%': isFinite,
    	'$ %isNaN%': isNaN,
    	'$ %IteratorPrototype%': hasSymbols$2 ? getProto(getProto([][Symbol.iterator]())) : undefined$1,
    	'$ %JSON%': JSON,
    	'$ %JSONParse%': JSON.parse,
    	'$ %Map%': typeof Map === 'undefined' ? undefined$1 : Map,
    	'$ %MapIteratorPrototype%': typeof Map === 'undefined' || !hasSymbols$2 ? undefined$1 : getProto(new Map()[Symbol.iterator]()),
    	'$ %MapPrototype%': typeof Map === 'undefined' ? undefined$1 : Map.prototype,
    	'$ %Math%': Math,
    	'$ %Number%': Number,
    	'$ %NumberPrototype%': Number.prototype,
    	'$ %Object%': Object,
    	'$ %ObjectPrototype%': Object.prototype,
    	'$ %ObjProto_toString%': Object.prototype.toString,
    	'$ %ObjProto_valueOf%': Object.prototype.valueOf,
    	'$ %parseFloat%': parseFloat,
    	'$ %parseInt%': parseInt,
    	'$ %Promise%': typeof Promise === 'undefined' ? undefined$1 : Promise,
    	'$ %PromisePrototype%': typeof Promise === 'undefined' ? undefined$1 : Promise.prototype,
    	'$ %PromiseProto_then%': typeof Promise === 'undefined' ? undefined$1 : Promise.prototype.then,
    	'$ %Promise_all%': typeof Promise === 'undefined' ? undefined$1 : Promise.all,
    	'$ %Promise_reject%': typeof Promise === 'undefined' ? undefined$1 : Promise.reject,
    	'$ %Promise_resolve%': typeof Promise === 'undefined' ? undefined$1 : Promise.resolve,
    	'$ %Proxy%': typeof Proxy === 'undefined' ? undefined$1 : Proxy,
    	'$ %RangeError%': RangeError,
    	'$ %RangeErrorPrototype%': RangeError.prototype,
    	'$ %ReferenceError%': ReferenceError,
    	'$ %ReferenceErrorPrototype%': ReferenceError.prototype,
    	'$ %Reflect%': typeof Reflect === 'undefined' ? undefined$1 : Reflect,
    	'$ %RegExp%': RegExp,
    	'$ %RegExpPrototype%': RegExp.prototype,
    	'$ %Set%': typeof Set === 'undefined' ? undefined$1 : Set,
    	'$ %SetIteratorPrototype%': typeof Set === 'undefined' || !hasSymbols$2 ? undefined$1 : getProto(new Set()[Symbol.iterator]()),
    	'$ %SetPrototype%': typeof Set === 'undefined' ? undefined$1 : Set.prototype,
    	'$ %SharedArrayBuffer%': typeof SharedArrayBuffer === 'undefined' ? undefined$1 : SharedArrayBuffer,
    	'$ %SharedArrayBufferPrototype%': typeof SharedArrayBuffer === 'undefined' ? undefined$1 : SharedArrayBuffer.prototype,
    	'$ %String%': String,
    	'$ %StringIteratorPrototype%': hasSymbols$2 ? getProto(''[Symbol.iterator]()) : undefined$1,
    	'$ %StringPrototype%': String.prototype,
    	'$ %Symbol%': hasSymbols$2 ? Symbol : undefined$1,
    	'$ %SymbolPrototype%': hasSymbols$2 ? Symbol.prototype : undefined$1,
    	'$ %SyntaxError%': SyntaxError,
    	'$ %SyntaxErrorPrototype%': SyntaxError.prototype,
    	'$ %ThrowTypeError%': ThrowTypeError,
    	'$ %TypedArray%': TypedArray,
    	'$ %TypedArrayPrototype%': TypedArray ? TypedArray.prototype : undefined$1,
    	'$ %TypeError%': $TypeError,
    	'$ %TypeErrorPrototype%': $TypeError.prototype,
    	'$ %Uint8Array%': typeof Uint8Array === 'undefined' ? undefined$1 : Uint8Array,
    	'$ %Uint8ArrayPrototype%': typeof Uint8Array === 'undefined' ? undefined$1 : Uint8Array.prototype,
    	'$ %Uint8ClampedArray%': typeof Uint8ClampedArray === 'undefined' ? undefined$1 : Uint8ClampedArray,
    	'$ %Uint8ClampedArrayPrototype%': typeof Uint8ClampedArray === 'undefined' ? undefined$1 : Uint8ClampedArray.prototype,
    	'$ %Uint16Array%': typeof Uint16Array === 'undefined' ? undefined$1 : Uint16Array,
    	'$ %Uint16ArrayPrototype%': typeof Uint16Array === 'undefined' ? undefined$1 : Uint16Array.prototype,
    	'$ %Uint32Array%': typeof Uint32Array === 'undefined' ? undefined$1 : Uint32Array,
    	'$ %Uint32ArrayPrototype%': typeof Uint32Array === 'undefined' ? undefined$1 : Uint32Array.prototype,
    	'$ %URIError%': URIError,
    	'$ %URIErrorPrototype%': URIError.prototype,
    	'$ %WeakMap%': typeof WeakMap === 'undefined' ? undefined$1 : WeakMap,
    	'$ %WeakMapPrototype%': typeof WeakMap === 'undefined' ? undefined$1 : WeakMap.prototype,
    	'$ %WeakSet%': typeof WeakSet === 'undefined' ? undefined$1 : WeakSet,
    	'$ %WeakSetPrototype%': typeof WeakSet === 'undefined' ? undefined$1 : WeakSet.prototype
    };


    var $replace = functionBind.call(Function.call, String.prototype.replace);

    /* adapted from https://github.com/lodash/lodash/blob/4.17.15/dist/lodash.js#L6735-L6744 */
    var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
    var reEscapeChar = /\\(\\)?/g; /** Used to match backslashes in property paths. */
    var stringToPath = function stringToPath(string) {
    	var result = [];
    	$replace(string, rePropName, function (match, number, quote, subString) {
    		result[result.length] = quote ? $replace(subString, reEscapeChar, '$1') : (number || match);
    	});
    	return result;
    };
    /* end adaptation */

    var getBaseIntrinsic = function getBaseIntrinsic(name, allowMissing) {
    	var key = '$ ' + name;
    	if (!(key in INTRINSICS)) {
    		throw new SyntaxError('intrinsic ' + name + ' does not exist!');
    	}

    	// istanbul ignore if // hopefully this is impossible to test :-)
    	if (typeof INTRINSICS[key] === 'undefined' && !allowMissing) {
    		throw new $TypeError('intrinsic ' + name + ' exists, but is not available. Please file an issue!');
    	}

    	return INTRINSICS[key];
    };

    var GetIntrinsic = function GetIntrinsic(name, allowMissing) {
    	if (arguments.length > 1 && typeof allowMissing !== 'boolean') {
    		throw new TypeError('"allowMissing" argument must be a boolean');
    	}

    	var parts = stringToPath(name);

    	if (parts.length === 0) {
    		return getBaseIntrinsic(name, allowMissing);
    	}

    	var value = getBaseIntrinsic('%' + parts[0] + '%', allowMissing);
    	for (var i = 1; i < parts.length; i += 1) {
    		if (value != null) {
    			value = value[parts[i]];
    		}
    	}
    	return value;
    };

    var src = functionBind.call(Function.call, Object.prototype.hasOwnProperty);

    var $TypeError$1 = GetIntrinsic('%TypeError%');
    var $SyntaxError = GetIntrinsic('%SyntaxError%');



    var predicates = {
    	// https://ecma-international.org/ecma-262/6.0/#sec-property-descriptor-specification-type
    	'Property Descriptor': function isPropertyDescriptor(ES, Desc) {
    		if (ES.Type(Desc) !== 'Object') {
    			return false;
    		}
    		var allowed = {
    			'[[Configurable]]': true,
    			'[[Enumerable]]': true,
    			'[[Get]]': true,
    			'[[Set]]': true,
    			'[[Value]]': true,
    			'[[Writable]]': true
    		};

    		for (var key in Desc) { // eslint-disable-line
    			if (src(Desc, key) && !allowed[key]) {
    				return false;
    			}
    		}

    		var isData = src(Desc, '[[Value]]');
    		var IsAccessor = src(Desc, '[[Get]]') || src(Desc, '[[Set]]');
    		if (isData && IsAccessor) {
    			throw new $TypeError$1('Property Descriptors may not be both accessor and data descriptors');
    		}
    		return true;
    	}
    };

    var assertRecord = function assertRecord(ES, recordType, argumentName, value) {
    	var predicate = predicates[recordType];
    	if (typeof predicate !== 'function') {
    		throw new $SyntaxError('unknown record type: ' + recordType);
    	}
    	if (!predicate(ES, value)) {
    		throw new $TypeError$1(argumentName + ' must be a ' + recordType);
    	}
    };

    var $TypeError$2 = GetIntrinsic('%TypeError%');

    var isPropertyDescriptor = function IsPropertyDescriptor(ES, Desc) {
    	if (ES.Type(Desc) !== 'Object') {
    		return false;
    	}
    	var allowed = {
    		'[[Configurable]]': true,
    		'[[Enumerable]]': true,
    		'[[Get]]': true,
    		'[[Set]]': true,
    		'[[Value]]': true,
    		'[[Writable]]': true
    	};

        for (var key in Desc) { // eslint-disable-line
    		if (src(Desc, key) && !allowed[key]) {
    			return false;
    		}
    	}

    	if (ES.IsDataDescriptor(Desc) && ES.IsAccessorDescriptor(Desc)) {
    		throw new $TypeError$2('Property Descriptors may not be both accessor and data descriptors');
    	}
    	return true;
    };

    var _isNaN = Number.isNaN || function isNaN(a) {
    	return a !== a;
    };

    var $isNaN = Number.isNaN || function (a) { return a !== a; };

    var _isFinite = Number.isFinite || function (x) { return typeof x === 'number' && !$isNaN(x) && x !== Infinity && x !== -Infinity; };

    var sign = function sign(number) {
    	return number >= 0 ? 1 : -1;
    };

    var mod = function mod(number, modulo) {
    	var remain = number % modulo;
    	return Math.floor(remain >= 0 ? remain : remain + modulo);
    };

    var $Function = GetIntrinsic('%Function%');
    var $apply = $Function.apply;
    var $call = $Function.call;

    var callBind = function callBind() {
    	return functionBind.apply($call, arguments);
    };

    var apply = function applyBind() {
    	return functionBind.apply($apply, arguments);
    };
    callBind.apply = apply;

    var $indexOf = callBind(GetIntrinsic('String.prototype.indexOf'));

    var callBound = function callBoundIntrinsic(name, allowMissing) {
    	var intrinsic = GetIntrinsic(name, !!allowMissing);
    	if (typeof intrinsic === 'function' && $indexOf(name, '.prototype.')) {
    		return callBind(intrinsic);
    	}
    	return intrinsic;
    };

    var $strSlice = callBound('String.prototype.slice');

    var isPrefixOf = function isPrefixOf(prefix, string) {
    	if (prefix === string) {
    		return true;
    	}
    	if (prefix.length > string.length) {
    		return false;
    	}
    	return $strSlice(string, 0, prefix.length) === prefix;
    };

    var fnToStr = Function.prototype.toString;

    var constructorRegex = /^\s*class\b/;
    var isES6ClassFn = function isES6ClassFunction(value) {
    	try {
    		var fnStr = fnToStr.call(value);
    		return constructorRegex.test(fnStr);
    	} catch (e) {
    		return false; // not a function
    	}
    };

    var tryFunctionObject = function tryFunctionToStr(value) {
    	try {
    		if (isES6ClassFn(value)) { return false; }
    		fnToStr.call(value);
    		return true;
    	} catch (e) {
    		return false;
    	}
    };
    var toStr$4 = Object.prototype.toString;
    var fnClass = '[object Function]';
    var genClass = '[object GeneratorFunction]';
    var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

    var isCallable = function isCallable(value) {
    	if (!value) { return false; }
    	if (typeof value !== 'function' && typeof value !== 'object') { return false; }
    	if (typeof value === 'function' && !value.prototype) { return true; }
    	if (hasToStringTag) { return tryFunctionObject(value); }
    	if (isES6ClassFn(value)) { return false; }
    	var strClass = toStr$4.call(value);
    	return strClass === fnClass || strClass === genClass;
    };

    var isPrimitive = function isPrimitive(value) {
    	return value === null || (typeof value !== 'function' && typeof value !== 'object');
    };

    var toStr$5 = Object.prototype.toString;





    // http://ecma-international.org/ecma-262/5.1/#sec-8.12.8
    var ES5internalSlots = {
    	'[[DefaultValue]]': function (O) {
    		var actualHint;
    		if (arguments.length > 1) {
    			actualHint = arguments[1];
    		} else {
    			actualHint = toStr$5.call(O) === '[object Date]' ? String : Number;
    		}

    		if (actualHint === String || actualHint === Number) {
    			var methods = actualHint === String ? ['toString', 'valueOf'] : ['valueOf', 'toString'];
    			var value, i;
    			for (i = 0; i < methods.length; ++i) {
    				if (isCallable(O[methods[i]])) {
    					value = O[methods[i]]();
    					if (isPrimitive(value)) {
    						return value;
    					}
    				}
    			}
    			throw new TypeError('No default value');
    		}
    		throw new TypeError('invalid [[DefaultValue]] hint supplied');
    	}
    };

    // http://ecma-international.org/ecma-262/5.1/#sec-9.1
    var es5 = function ToPrimitive(input) {
    	if (isPrimitive(input)) {
    		return input;
    	}
    	if (arguments.length > 1) {
    		return ES5internalSlots['[[DefaultValue]]'](input, arguments[1]);
    	}
    	return ES5internalSlots['[[DefaultValue]]'](input);
    };

    var $Object = GetIntrinsic('%Object%');
    var $EvalError = GetIntrinsic('%EvalError%');
    var $TypeError$3 = GetIntrinsic('%TypeError%');
    var $String = GetIntrinsic('%String%');
    var $Date = GetIntrinsic('%Date%');
    var $Number = GetIntrinsic('%Number%');
    var $floor = GetIntrinsic('%Math.floor%');
    var $DateUTC = GetIntrinsic('%Date.UTC%');
    var $abs = GetIntrinsic('%Math.abs%');















    var $getUTCFullYear = callBound('Date.prototype.getUTCFullYear');

    var HoursPerDay = 24;
    var MinutesPerHour = 60;
    var SecondsPerMinute = 60;
    var msPerSecond = 1e3;
    var msPerMinute = msPerSecond * SecondsPerMinute;
    var msPerHour = msPerMinute * MinutesPerHour;
    var msPerDay = 86400000;

    // https://es5.github.io/#x9
    var ES5 = {
    	ToPrimitive: es5,

    	ToBoolean: function ToBoolean(value) {
    		return !!value;
    	},
    	ToNumber: function ToNumber(value) {
    		return +value; // eslint-disable-line no-implicit-coercion
    	},
    	ToInteger: function ToInteger(value) {
    		var number = this.ToNumber(value);
    		if (_isNaN(number)) { return 0; }
    		if (number === 0 || !_isFinite(number)) { return number; }
    		return sign(number) * Math.floor(Math.abs(number));
    	},
    	ToInt32: function ToInt32(x) {
    		return this.ToNumber(x) >> 0;
    	},
    	ToUint32: function ToUint32(x) {
    		return this.ToNumber(x) >>> 0;
    	},
    	ToUint16: function ToUint16(value) {
    		var number = this.ToNumber(value);
    		if (_isNaN(number) || number === 0 || !_isFinite(number)) { return 0; }
    		var posInt = sign(number) * Math.floor(Math.abs(number));
    		return mod(posInt, 0x10000);
    	},
    	ToString: function ToString(value) {
    		return $String(value);
    	},
    	ToObject: function ToObject(value) {
    		this.CheckObjectCoercible(value);
    		return $Object(value);
    	},
    	CheckObjectCoercible: function CheckObjectCoercible(value, optMessage) {
    		/* jshint eqnull:true */
    		if (value == null) {
    			throw new $TypeError$3(optMessage || 'Cannot call method on ' + value);
    		}
    		return value;
    	},
    	IsCallable: isCallable,
    	SameValue: function SameValue(x, y) {
    		if (x === y) { // 0 === -0, but they are not identical.
    			if (x === 0) { return 1 / x === 1 / y; }
    			return true;
    		}
    		return _isNaN(x) && _isNaN(y);
    	},

    	// https://ecma-international.org/ecma-262/5.1/#sec-8
    	Type: function Type(x) {
    		if (x === null) {
    			return 'Null';
    		}
    		if (typeof x === 'undefined') {
    			return 'Undefined';
    		}
    		if (typeof x === 'function' || typeof x === 'object') {
    			return 'Object';
    		}
    		if (typeof x === 'number') {
    			return 'Number';
    		}
    		if (typeof x === 'boolean') {
    			return 'Boolean';
    		}
    		if (typeof x === 'string') {
    			return 'String';
    		}
    	},

    	// https://ecma-international.org/ecma-262/6.0/#sec-property-descriptor-specification-type
    	IsPropertyDescriptor: function IsPropertyDescriptor(Desc) {
    		return isPropertyDescriptor(this, Desc);
    	},

    	// https://ecma-international.org/ecma-262/5.1/#sec-8.10.1
    	IsAccessorDescriptor: function IsAccessorDescriptor(Desc) {
    		if (typeof Desc === 'undefined') {
    			return false;
    		}

    		assertRecord(this, 'Property Descriptor', 'Desc', Desc);

    		if (!src(Desc, '[[Get]]') && !src(Desc, '[[Set]]')) {
    			return false;
    		}

    		return true;
    	},

    	// https://ecma-international.org/ecma-262/5.1/#sec-8.10.2
    	IsDataDescriptor: function IsDataDescriptor(Desc) {
    		if (typeof Desc === 'undefined') {
    			return false;
    		}

    		assertRecord(this, 'Property Descriptor', 'Desc', Desc);

    		if (!src(Desc, '[[Value]]') && !src(Desc, '[[Writable]]')) {
    			return false;
    		}

    		return true;
    	},

    	// https://ecma-international.org/ecma-262/5.1/#sec-8.10.3
    	IsGenericDescriptor: function IsGenericDescriptor(Desc) {
    		if (typeof Desc === 'undefined') {
    			return false;
    		}

    		assertRecord(this, 'Property Descriptor', 'Desc', Desc);

    		if (!this.IsAccessorDescriptor(Desc) && !this.IsDataDescriptor(Desc)) {
    			return true;
    		}

    		return false;
    	},

    	// https://ecma-international.org/ecma-262/5.1/#sec-8.10.4
    	FromPropertyDescriptor: function FromPropertyDescriptor(Desc) {
    		if (typeof Desc === 'undefined') {
    			return Desc;
    		}

    		assertRecord(this, 'Property Descriptor', 'Desc', Desc);

    		if (this.IsDataDescriptor(Desc)) {
    			return {
    				value: Desc['[[Value]]'],
    				writable: !!Desc['[[Writable]]'],
    				enumerable: !!Desc['[[Enumerable]]'],
    				configurable: !!Desc['[[Configurable]]']
    			};
    		} else if (this.IsAccessorDescriptor(Desc)) {
    			return {
    				get: Desc['[[Get]]'],
    				set: Desc['[[Set]]'],
    				enumerable: !!Desc['[[Enumerable]]'],
    				configurable: !!Desc['[[Configurable]]']
    			};
    		} else {
    			throw new $TypeError$3('FromPropertyDescriptor must be called with a fully populated Property Descriptor');
    		}
    	},

    	// https://ecma-international.org/ecma-262/5.1/#sec-8.10.5
    	ToPropertyDescriptor: function ToPropertyDescriptor(Obj) {
    		if (this.Type(Obj) !== 'Object') {
    			throw new $TypeError$3('ToPropertyDescriptor requires an object');
    		}

    		var desc = {};
    		if (src(Obj, 'enumerable')) {
    			desc['[[Enumerable]]'] = this.ToBoolean(Obj.enumerable);
    		}
    		if (src(Obj, 'configurable')) {
    			desc['[[Configurable]]'] = this.ToBoolean(Obj.configurable);
    		}
    		if (src(Obj, 'value')) {
    			desc['[[Value]]'] = Obj.value;
    		}
    		if (src(Obj, 'writable')) {
    			desc['[[Writable]]'] = this.ToBoolean(Obj.writable);
    		}
    		if (src(Obj, 'get')) {
    			var getter = Obj.get;
    			if (typeof getter !== 'undefined' && !this.IsCallable(getter)) {
    				throw new TypeError('getter must be a function');
    			}
    			desc['[[Get]]'] = getter;
    		}
    		if (src(Obj, 'set')) {
    			var setter = Obj.set;
    			if (typeof setter !== 'undefined' && !this.IsCallable(setter)) {
    				throw new $TypeError$3('setter must be a function');
    			}
    			desc['[[Set]]'] = setter;
    		}

    		if ((src(desc, '[[Get]]') || src(desc, '[[Set]]')) && (src(desc, '[[Value]]') || src(desc, '[[Writable]]'))) {
    			throw new $TypeError$3('Invalid property descriptor. Cannot both specify accessors and a value or writable attribute');
    		}
    		return desc;
    	},

    	// https://ecma-international.org/ecma-262/5.1/#sec-11.9.3
    	'Abstract Equality Comparison': function AbstractEqualityComparison(x, y) {
    		var xType = this.Type(x);
    		var yType = this.Type(y);
    		if (xType === yType) {
    			return x === y; // ES6+ specified this shortcut anyways.
    		}
    		if (x == null && y == null) {
    			return true;
    		}
    		if (xType === 'Number' && yType === 'String') {
    			return this['Abstract Equality Comparison'](x, this.ToNumber(y));
    		}
    		if (xType === 'String' && yType === 'Number') {
    			return this['Abstract Equality Comparison'](this.ToNumber(x), y);
    		}
    		if (xType === 'Boolean') {
    			return this['Abstract Equality Comparison'](this.ToNumber(x), y);
    		}
    		if (yType === 'Boolean') {
    			return this['Abstract Equality Comparison'](x, this.ToNumber(y));
    		}
    		if ((xType === 'String' || xType === 'Number') && yType === 'Object') {
    			return this['Abstract Equality Comparison'](x, this.ToPrimitive(y));
    		}
    		if (xType === 'Object' && (yType === 'String' || yType === 'Number')) {
    			return this['Abstract Equality Comparison'](this.ToPrimitive(x), y);
    		}
    		return false;
    	},

    	// https://ecma-international.org/ecma-262/5.1/#sec-11.9.6
    	'Strict Equality Comparison': function StrictEqualityComparison(x, y) {
    		var xType = this.Type(x);
    		var yType = this.Type(y);
    		if (xType !== yType) {
    			return false;
    		}
    		if (xType === 'Undefined' || xType === 'Null') {
    			return true;
    		}
    		return x === y; // shortcut for steps 4-7
    	},

    	// https://ecma-international.org/ecma-262/5.1/#sec-11.8.5
    	// eslint-disable-next-line max-statements
    	'Abstract Relational Comparison': function AbstractRelationalComparison(x, y, LeftFirst) {
    		if (this.Type(LeftFirst) !== 'Boolean') {
    			throw new $TypeError$3('Assertion failed: LeftFirst argument must be a Boolean');
    		}
    		var px;
    		var py;
    		if (LeftFirst) {
    			px = this.ToPrimitive(x, $Number);
    			py = this.ToPrimitive(y, $Number);
    		} else {
    			py = this.ToPrimitive(y, $Number);
    			px = this.ToPrimitive(x, $Number);
    		}
    		var bothStrings = this.Type(px) === 'String' && this.Type(py) === 'String';
    		if (!bothStrings) {
    			var nx = this.ToNumber(px);
    			var ny = this.ToNumber(py);
    			if (_isNaN(nx) || _isNaN(ny)) {
    				return undefined;
    			}
    			if (_isFinite(nx) && _isFinite(ny) && nx === ny) {
    				return false;
    			}
    			if (nx === 0 && ny === 0) {
    				return false;
    			}
    			if (nx === Infinity) {
    				return false;
    			}
    			if (ny === Infinity) {
    				return true;
    			}
    			if (ny === -Infinity) {
    				return false;
    			}
    			if (nx === -Infinity) {
    				return true;
    			}
    			return nx < ny; // by now, these are both nonzero, finite, and not equal
    		}
    		if (isPrefixOf(py, px)) {
    			return false;
    		}
    		if (isPrefixOf(px, py)) {
    			return true;
    		}
    		return px < py; // both strings, neither a prefix of the other. shortcut for steps c-f
    	},

    	// https://ecma-international.org/ecma-262/5.1/#sec-15.9.1.10
    	msFromTime: function msFromTime(t) {
    		return mod(t, msPerSecond);
    	},

    	// https://ecma-international.org/ecma-262/5.1/#sec-15.9.1.10
    	SecFromTime: function SecFromTime(t) {
    		return mod($floor(t / msPerSecond), SecondsPerMinute);
    	},

    	// https://ecma-international.org/ecma-262/5.1/#sec-15.9.1.10
    	MinFromTime: function MinFromTime(t) {
    		return mod($floor(t / msPerMinute), MinutesPerHour);
    	},

    	// https://ecma-international.org/ecma-262/5.1/#sec-15.9.1.10
    	HourFromTime: function HourFromTime(t) {
    		return mod($floor(t / msPerHour), HoursPerDay);
    	},

    	// https://ecma-international.org/ecma-262/5.1/#sec-15.9.1.2
    	Day: function Day(t) {
    		return $floor(t / msPerDay);
    	},

    	// https://ecma-international.org/ecma-262/5.1/#sec-15.9.1.2
    	TimeWithinDay: function TimeWithinDay(t) {
    		return mod(t, msPerDay);
    	},

    	// https://ecma-international.org/ecma-262/5.1/#sec-15.9.1.3
    	DayFromYear: function DayFromYear(y) {
    		return (365 * (y - 1970)) + $floor((y - 1969) / 4) - $floor((y - 1901) / 100) + $floor((y - 1601) / 400);
    	},

    	// https://ecma-international.org/ecma-262/5.1/#sec-15.9.1.3
    	TimeFromYear: function TimeFromYear(y) {
    		return msPerDay * this.DayFromYear(y);
    	},

    	// https://ecma-international.org/ecma-262/5.1/#sec-15.9.1.3
    	YearFromTime: function YearFromTime(t) {
    		// largest y such that this.TimeFromYear(y) <= t
    		return $getUTCFullYear(new $Date(t));
    	},

    	// https://ecma-international.org/ecma-262/5.1/#sec-15.9.1.6
    	WeekDay: function WeekDay(t) {
    		return mod(this.Day(t) + 4, 7);
    	},

    	// https://ecma-international.org/ecma-262/5.1/#sec-15.9.1.3
    	DaysInYear: function DaysInYear(y) {
    		if (mod(y, 4) !== 0) {
    			return 365;
    		}
    		if (mod(y, 100) !== 0) {
    			return 366;
    		}
    		if (mod(y, 400) !== 0) {
    			return 365;
    		}
    		return 366;
    	},

    	// https://ecma-international.org/ecma-262/5.1/#sec-15.9.1.3
    	InLeapYear: function InLeapYear(t) {
    		var days = this.DaysInYear(this.YearFromTime(t));
    		if (days === 365) {
    			return 0;
    		}
    		if (days === 366) {
    			return 1;
    		}
    		throw new $EvalError('Assertion failed: there are not 365 or 366 days in a year, got: ' + days);
    	},

    	// https://ecma-international.org/ecma-262/5.1/#sec-15.9.1.4
    	DayWithinYear: function DayWithinYear(t) {
    		return this.Day(t) - this.DayFromYear(this.YearFromTime(t));
    	},

    	// https://ecma-international.org/ecma-262/5.1/#sec-15.9.1.4
    	MonthFromTime: function MonthFromTime(t) {
    		var day = this.DayWithinYear(t);
    		if (0 <= day && day < 31) {
    			return 0;
    		}
    		var leap = this.InLeapYear(t);
    		if (31 <= day && day < (59 + leap)) {
    			return 1;
    		}
    		if ((59 + leap) <= day && day < (90 + leap)) {
    			return 2;
    		}
    		if ((90 + leap) <= day && day < (120 + leap)) {
    			return 3;
    		}
    		if ((120 + leap) <= day && day < (151 + leap)) {
    			return 4;
    		}
    		if ((151 + leap) <= day && day < (181 + leap)) {
    			return 5;
    		}
    		if ((181 + leap) <= day && day < (212 + leap)) {
    			return 6;
    		}
    		if ((212 + leap) <= day && day < (243 + leap)) {
    			return 7;
    		}
    		if ((243 + leap) <= day && day < (273 + leap)) {
    			return 8;
    		}
    		if ((273 + leap) <= day && day < (304 + leap)) {
    			return 9;
    		}
    		if ((304 + leap) <= day && day < (334 + leap)) {
    			return 10;
    		}
    		if ((334 + leap) <= day && day < (365 + leap)) {
    			return 11;
    		}
    	},

    	// https://ecma-international.org/ecma-262/5.1/#sec-15.9.1.5
    	DateFromTime: function DateFromTime(t) {
    		var m = this.MonthFromTime(t);
    		var d = this.DayWithinYear(t);
    		if (m === 0) {
    			return d + 1;
    		}
    		if (m === 1) {
    			return d - 30;
    		}
    		var leap = this.InLeapYear(t);
    		if (m === 2) {
    			return d - 58 - leap;
    		}
    		if (m === 3) {
    			return d - 89 - leap;
    		}
    		if (m === 4) {
    			return d - 119 - leap;
    		}
    		if (m === 5) {
    			return d - 150 - leap;
    		}
    		if (m === 6) {
    			return d - 180 - leap;
    		}
    		if (m === 7) {
    			return d - 211 - leap;
    		}
    		if (m === 8) {
    			return d - 242 - leap;
    		}
    		if (m === 9) {
    			return d - 272 - leap;
    		}
    		if (m === 10) {
    			return d - 303 - leap;
    		}
    		if (m === 11) {
    			return d - 333 - leap;
    		}
    		throw new $EvalError('Assertion failed: MonthFromTime returned an impossible value: ' + m);
    	},

    	// https://ecma-international.org/ecma-262/5.1/#sec-15.9.1.12
    	MakeDay: function MakeDay(year, month, date) {
    		if (!_isFinite(year) || !_isFinite(month) || !_isFinite(date)) {
    			return NaN;
    		}
    		var y = this.ToInteger(year);
    		var m = this.ToInteger(month);
    		var dt = this.ToInteger(date);
    		var ym = y + $floor(m / 12);
    		var mn = mod(m, 12);
    		var t = $DateUTC(ym, mn, 1);
    		if (this.YearFromTime(t) !== ym || this.MonthFromTime(t) !== mn || this.DateFromTime(t) !== 1) {
    			return NaN;
    		}
    		return this.Day(t) + dt - 1;
    	},

    	// https://ecma-international.org/ecma-262/5.1/#sec-15.9.1.13
    	MakeDate: function MakeDate(day, time) {
    		if (!_isFinite(day) || !_isFinite(time)) {
    			return NaN;
    		}
    		return (day * msPerDay) + time;
    	},

    	// https://ecma-international.org/ecma-262/5.1/#sec-15.9.1.11
    	MakeTime: function MakeTime(hour, min, sec, ms) {
    		if (!_isFinite(hour) || !_isFinite(min) || !_isFinite(sec) || !_isFinite(ms)) {
    			return NaN;
    		}
    		var h = this.ToInteger(hour);
    		var m = this.ToInteger(min);
    		var s = this.ToInteger(sec);
    		var milli = this.ToInteger(ms);
    		var t = (h * msPerHour) + (m * msPerMinute) + (s * msPerSecond) + milli;
    		return t;
    	},

    	// https://ecma-international.org/ecma-262/5.1/#sec-15.9.1.14
    	TimeClip: function TimeClip(time) {
    		if (!_isFinite(time) || $abs(time) > 8.64e15) {
    			return NaN;
    		}
    		return $Number(new $Date(this.ToNumber(time)));
    	},

    	// https://ecma-international.org/ecma-262/5.1/#sec-5.2
    	modulo: function modulo(x, y) {
    		return mod(x, y);
    	}
    };

    var es5$1 = ES5;

    var replace = functionBind.call(Function.call, String.prototype.replace);

    /* eslint-disable no-control-regex */
    var leftWhitespace = /^[\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF]+/;
    var rightWhitespace = /[\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF]+$/;
    /* eslint-enable no-control-regex */

    var implementation$2 = function trim() {
    	var S = es5$1.ToString(es5$1.CheckObjectCoercible(this));
    	return replace(replace(S, leftWhitespace, ''), rightWhitespace, '');
    };

    var zeroWidthSpace = '\u200b';

    var polyfill = function getPolyfill() {
    	if (String.prototype.trim && zeroWidthSpace.trim() === zeroWidthSpace) {
    		return String.prototype.trim;
    	}
    	return implementation$2;
    };

    var shim = function shimStringTrim() {
    	var polyfill$1 = polyfill();
    	defineProperties_1(String.prototype, { trim: polyfill$1 }, {
    		trim: function testTrim() {
    			return String.prototype.trim !== polyfill$1;
    		}
    	});
    	return polyfill$1;
    };

    var boundTrim = functionBind.call(Function.call, polyfill());

    defineProperties_1(boundTrim, {
    	getPolyfill: polyfill,
    	implementation: implementation$2,
    	shim: shim
    });

    var string_prototype_trim = boundTrim;

    var toStr$6 = Object.prototype.toString;
    var hasOwnProperty$2 = Object.prototype.hasOwnProperty;

    var forEachArray = function forEachArray(array, iterator, receiver) {
        for (var i = 0, len = array.length; i < len; i++) {
            if (hasOwnProperty$2.call(array, i)) {
                if (receiver == null) {
                    iterator(array[i], i, array);
                } else {
                    iterator.call(receiver, array[i], i, array);
                }
            }
        }
    };

    var forEachString = function forEachString(string, iterator, receiver) {
        for (var i = 0, len = string.length; i < len; i++) {
            // no such thing as a sparse string.
            if (receiver == null) {
                iterator(string.charAt(i), i, string);
            } else {
                iterator.call(receiver, string.charAt(i), i, string);
            }
        }
    };

    var forEachObject = function forEachObject(object, iterator, receiver) {
        for (var k in object) {
            if (hasOwnProperty$2.call(object, k)) {
                if (receiver == null) {
                    iterator(object[k], k, object);
                } else {
                    iterator.call(receiver, object[k], k, object);
                }
            }
        }
    };

    var forEach = function forEach(list, iterator, thisArg) {
        if (!isCallable(iterator)) {
            throw new TypeError('iterator must be a function');
        }

        var receiver;
        if (arguments.length >= 3) {
            receiver = thisArg;
        }

        if (toStr$6.call(list) === '[object Array]') {
            forEachArray(list, iterator, receiver);
        } else if (typeof list === 'string') {
            forEachString(list, iterator, receiver);
        } else {
            forEachObject(list, iterator, receiver);
        }
    };

    var forEach_1 = forEach;

    var isArray$1 = function(arg) {
          return Object.prototype.toString.call(arg) === '[object Array]';
        };

    var parseHeaders = function (headers) {
      if (!headers)
        return {}

      var result = {};

      forEach_1(
          string_prototype_trim(headers).split('\n')
        , function (row) {
            var index = row.indexOf(':')
              , key = string_prototype_trim(row.slice(0, index)).toLowerCase()
              , value = string_prototype_trim(row.slice(index + 1));

            if (typeof(result[key]) === 'undefined') {
              result[key] = value;
            } else if (isArray$1(result[key])) {
              result[key].push(value);
            } else {
              result[key] = [ result[key], value ];
            }
          }
      );

      return result
    };

    /* eslint max-depth: ["error", 4] */


    var noop$1 = function noop() {
      /* intentional noop */
    };

    var win = window;
    var XmlHttpRequest = win.XMLHttpRequest || noop$1;
    var hasXhr2 = 'withCredentials' in new XmlHttpRequest();
    var XDomainRequest$1 = hasXhr2 ? XmlHttpRequest : win.XDomainRequest;
    var adapter = 'xhr';

    var browserRequest = function (context, callback) {
      var opts = context.options;
      var options = context.applyMiddleware('finalizeOptions', opts);
      var timers = {};

      // Deep-checking window.location because of react native, where `location` doesn't exist
      var cors = win && win.location && !sameOrigin(win.location.href, options.url);

      // Allow middleware to inject a response, for instance in the case of caching or mocking
      var injectedResponse = context.applyMiddleware('interceptRequest', undefined, {
        adapter: adapter,
        context: context
      });

      // If middleware injected a response, treat it as we normally would and return it
      // Do note that the injected response has to be reduced to a cross-environment friendly response
      if (injectedResponse) {
        var cbTimer = setTimeout(callback, 0, null, injectedResponse);
        var cancel = function cancel() {
          return clearTimeout(cbTimer);
        };
        return { abort: cancel };
      }

      // We'll want to null out the request on success/failure
      var xhr = cors ? new XDomainRequest$1() : new XmlHttpRequest();

      var isXdr = win.XDomainRequest && xhr instanceof win.XDomainRequest;
      var headers = options.headers;

      // Request state
      var aborted = false;
      var loaded = false;
      var timedOut = false;

      // Apply event handlers
      xhr.onerror = onError;
      xhr.ontimeout = onError;
      xhr.onabort = function () {
        aborted = true;
      };

      // IE9 must have onprogress be set to a unique function
      xhr.onprogress = function () {
        /* intentional noop */
      };

      var loadEvent = isXdr ? 'onload' : 'onreadystatechange';
      xhr[loadEvent] = function () {
        // Prevent request from timing out
        resetTimers();

        if (aborted || xhr.readyState !== 4 && !isXdr) {
          return;
        }

        // Will be handled by onError
        if (xhr.status === 0) {
          return;
        }

        onLoad();
      };

      // @todo two last options to open() is username/password
      xhr.open(options.method, options.url, true // Always async
      );

      // Some options need to be applied after open
      xhr.withCredentials = !!options.withCredentials;

      // Set headers
      if (headers && xhr.setRequestHeader) {
        for (var key in headers) {
          if (headers.hasOwnProperty(key)) {
            xhr.setRequestHeader(key, headers[key]);
          }
        }
      } else if (headers && isXdr) {
        throw new Error('Headers cannot be set on an XDomainRequest object');
      }

      if (options.rawBody) {
        xhr.responseType = 'arraybuffer';
      }

      // Let middleware know we're about to do a request
      context.applyMiddleware('onRequest', { options: options, adapter: adapter, request: xhr, context: context });

      xhr.send(options.body || null);

      // Figure out which timeouts to use (if any)
      var delays = options.timeout;
      if (delays) {
        timers.connect = setTimeout(function () {
          return timeoutRequest('ETIMEDOUT');
        }, delays.connect);
      }

      return { abort: abort };

      function abort() {
        aborted = true;

        if (xhr) {
          xhr.abort();
        }
      }

      function timeoutRequest(code) {
        timedOut = true;
        xhr.abort();
        var error = new Error(code === 'ESOCKETTIMEDOUT' ? 'Socket timed out on request to ' + options.url : 'Connection timed out on request to ' + options.url);
        error.code = code;
        context.channels.error.publish(error);
      }

      function resetTimers() {
        if (!delays) {
          return;
        }

        stopTimers();
        timers.socket = setTimeout(function () {
          return timeoutRequest('ESOCKETTIMEDOUT');
        }, delays.socket);
      }

      function stopTimers() {
        // Only clear the connect timeout if we've got a connection
        if (aborted || xhr.readyState >= 2 && timers.connect) {
          clearTimeout(timers.connect);
        }

        if (timers.socket) {
          clearTimeout(timers.socket);
        }
      }

      function onError() {
        if (loaded) {
          return;
        }

        // Clean up
        stopTimers();
        loaded = true;
        xhr = null;

        // Annoyingly, details are extremely scarce and hidden from us.
        // We only really know that it is a network error
        var err = new Error('Network error while attempting to reach ' + options.url);
        err.isNetworkError = true;
        err.request = options;
        callback(err);
      }

      function reduceResponse() {
        var statusCode = xhr.status;
        var statusMessage = xhr.statusText;

        if (isXdr && statusCode === undefined) {
          // IE8 CORS GET successful response doesn't have a status field, but body is fine
          statusCode = 200;
        } else if (statusCode > 12000 && statusCode < 12156) {
          // Yet another IE quirk where it emits weird status codes on network errors
          // https://support.microsoft.com/en-us/kb/193625
          return onError();
        } else {
          // Another IE bug where HTTP 204 somehow ends up as 1223
          statusCode = xhr.status === 1223 ? 204 : xhr.status;
          statusMessage = xhr.status === 1223 ? 'No Content' : statusMessage;
        }

        return {
          body: xhr.response || xhr.responseText,
          url: options.url,
          method: options.method,
          headers: isXdr ? {} : parseHeaders(xhr.getAllResponseHeaders()),
          statusCode: statusCode,
          statusMessage: statusMessage
        };
      }

      function onLoad() {
        if (aborted || loaded || timedOut) {
          return;
        }

        if (xhr.status === 0) {
          onError();
          return;
        }

        // Prevent being called twice
        stopTimers();
        loaded = true;
        callback(null, reduceResponse());
      }
    };

    var request$1 = browserRequest;

    // node-request in node, browser-request in browsers

    var channelNames = ['request', 'response', 'progress', 'error', 'abort'];
    var middlehooks = ['processOptions', 'validateOptions', 'interceptRequest', 'finalizeOptions', 'onRequest', 'onResponse', 'onError', 'onReturn', 'onHeaders'];

    var lib = function createRequester() {
      var initMiddleware = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      var loadedMiddleware = [];
      var middleware = middlehooks.reduce(function (ware, name) {
        ware[name] = ware[name] || [];
        return ware;
      }, {
        processOptions: [defaultOptionsProcessor],
        validateOptions: [defaultOptionsValidator]
      });

      function request(opts) {
        var channels = channelNames.reduce(function (target, name) {
          target[name] = nanoPubsub();
          return target;
        }, {});

        // Prepare a middleware reducer that can be reused throughout the lifecycle
        var applyMiddleware = middlewareReducer(middleware);

        // Parse the passed options
        var options = applyMiddleware('processOptions', opts);

        // Validate the options
        applyMiddleware('validateOptions', options);

        // Build a context object we can pass to child handlers
        var context = { options: options, channels: channels, applyMiddleware: applyMiddleware

          // We need to hold a reference to the current, ongoing request,
          // in order to allow cancellation. In the case of the retry middleware,
          // a new request might be triggered
        };var ongoingRequest = null;
        var unsubscribe = channels.request.subscribe(function (ctx) {
          // Let request adapters (node/browser) perform the actual request
          ongoingRequest = request$1(ctx, function (err, res) {
            return onResponse(err, res, ctx);
          });
        });

        // If we abort the request, prevent further requests from happening,
        // and be sure to cancel any ongoing request (obviously)
        channels.abort.subscribe(function () {
          unsubscribe();
          if (ongoingRequest) {
            ongoingRequest.abort();
          }
        });

        // See if any middleware wants to modify the return value - for instance
        // the promise or observable middlewares
        var returnValue = applyMiddleware('onReturn', channels, context);

        // If return value has been modified by a middleware, we expect the middleware
        // to publish on the 'request' channel. If it hasn't been modified, we want to
        // trigger it right away
        if (returnValue === channels) {
          channels.request.publish(context);
        }

        return returnValue;

        function onResponse(reqErr, res, ctx) {
          var error = reqErr;
          var response = res;

          // We're processing non-errors first, in case a middleware converts the
          // response into an error (for instance, status >= 400 == HttpError)
          if (!error) {
            try {
              response = applyMiddleware('onResponse', res, ctx);
            } catch (err) {
              response = null;
              error = err;
            }
          }

          // Apply error middleware - if middleware return the same (or a different) error,
          // publish as an error event. If we *don't* return an error, assume it has been handled
          error = error && applyMiddleware('onError', error, ctx);

          // Figure out if we should publish on error/response channels
          if (error) {
            channels.error.publish(error);
          } else if (response) {
            channels.response.publish(response);
          }
        }
      }

      request.use = function use(newMiddleware) {
        if (!newMiddleware) {
          throw new Error('Tried to add middleware that resolved to falsey value');
        }

        if (typeof newMiddleware === 'function') {
          throw new Error('Tried to add middleware that was a function. It probably expects you to pass options to it.');
        }

        if (newMiddleware.onReturn && middleware.onReturn.length > 0) {
          throw new Error('Tried to add new middleware with `onReturn` handler, but another handler has already been registered for this event');
        }

        middlehooks.forEach(function (key) {
          if (newMiddleware[key]) {
            middleware[key].push(newMiddleware[key]);
          }
        });

        loadedMiddleware.push(newMiddleware);
        return request;
      };

      request.clone = function clone() {
        return createRequester(loadedMiddleware);
      };

      initMiddleware.forEach(request.use);

      return request;
    };

    var getIt = lib;

    var global_1 = createCommonjsModule(function (module) {

    /* eslint-disable no-negated-condition */
    if (typeof window !== 'undefined') {
      module.exports = window;
    } else if (typeof commonjsGlobal !== 'undefined') {
      module.exports = commonjsGlobal;
    } else if (typeof self !== 'undefined') {
      module.exports = self;
    } else {
      module.exports = {};
    }
    //# sourceMappingURL=global.js.map
    });

    var observable$1 = function () {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var Observable = opts.implementation || global_1.Observable;
      if (!Observable) {
        throw new Error('`Observable` is not available in global scope, and no implementation was passed');
      }

      return {
        onReturn: function onReturn(channels, context) {
          return new Observable(function (observer) {
            channels.error.subscribe(function (err) {
              return observer.error(err);
            });
            channels.progress.subscribe(function (event) {
              return observer.next(objectAssign({ type: 'progress' }, event));
            });
            channels.response.subscribe(function (response) {
              observer.next(objectAssign({ type: 'response' }, response));
              observer.complete();
            });

            channels.request.publish(context);
            return function () {
              return channels.abort.publish();
            };
          });
        }
      };
    };

    /*!
     * isobject <https://github.com/jonschlinkert/isobject>
     *
     * Copyright (c) 2014-2017, Jon Schlinkert.
     * Released under the MIT License.
     */

    var isobject = function isObject(val) {
      return val != null && typeof val === 'object' && Array.isArray(val) === false;
    };

    function isObjectObject(o) {
      return isobject(o) === true
        && Object.prototype.toString.call(o) === '[object Object]';
    }

    var isPlainObject = function isPlainObject(o) {
      var ctor,prot;

      if (isObjectObject(o) === false) return false;

      // If has modified constructor
      ctor = o.constructor;
      if (typeof ctor !== 'function') return false;

      // If has modified prototype
      prot = ctor.prototype;
      if (isObjectObject(prot) === false) return false;

      // If constructor does not have an Object-specific method
      if (prot.hasOwnProperty('isPrototypeOf') === false) {
        return false;
      }

      // Most likely a plain Object
      return true;
    };

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };




    var serializeTypes = ['boolean', 'string', 'number'];
    var isBuffer = function isBuffer(obj) {
      return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj);
    };

    var jsonRequest = function () {
      return {
        processOptions: function processOptions(options) {
          var body = options.body;
          if (!body) {
            return options;
          }

          var isStream = typeof body.pipe === 'function';
          var shouldSerialize = !isStream && !isBuffer(body) && (serializeTypes.indexOf(typeof body === 'undefined' ? 'undefined' : _typeof(body)) !== -1 || Array.isArray(body) || isPlainObject(body));

          if (!shouldSerialize) {
            return options;
          }

          return objectAssign({}, options, {
            body: JSON.stringify(options.body),
            headers: objectAssign({}, options.headers, {
              'Content-Type': 'application/json'
            })
          });
        }
      };
    };

    var jsonResponse = function (opts) {
      return {
        onResponse: function onResponse(response) {
          var contentType = response.headers['content-type'] || '';
          var shouldDecode = opts && opts.force || contentType.indexOf('application/json') !== -1;
          if (!response.body || !contentType || !shouldDecode) {
            return response;
          }

          return objectAssign({}, response, { body: tryParse(response.body) });
        },

        processOptions: function processOptions(options) {
          return objectAssign({}, options, {
            headers: objectAssign({ Accept: 'application/json' }, options.headers)
          });
        }
      };
    };

    function tryParse(body) {
      try {
        return JSON.parse(body);
      } catch (err) {
        err.message = 'Failed to parsed response body as JSON: ' + err.message;
        throw err;
      }
    }

    var browserProgress = function () {
      return {
        onRequest: function onRequest(evt) {
          if (evt.adapter !== 'xhr') {
            return;
          }

          var xhr = evt.request;
          var context = evt.context;

          if ('upload' in xhr && 'onprogress' in xhr.upload) {
            xhr.upload.onprogress = handleProgress('upload');
          }

          if ('onprogress' in xhr) {
            xhr.onprogress = handleProgress('download');
          }

          function handleProgress(stage) {
            return function (event) {
              var percent = event.lengthComputable ? event.loaded / event.total * 100 : -1;
              context.channels.progress.publish({
                stage: stage,
                percent: percent,
                total: event.total,
                loaded: event.loaded,
                lengthComputable: event.lengthComputable
              });
            };
          }
        }
      };
    };

    var progress = browserProgress;

    var makeError_1 = createCommonjsModule(function (module, exports) {

    // ===================================================================

    var construct = typeof Reflect !== 'undefined' ? Reflect.construct : undefined;
    var defineProperty = Object.defineProperty;

    // -------------------------------------------------------------------

    var captureStackTrace = Error.captureStackTrace;
    if (captureStackTrace === undefined) {
      captureStackTrace = function captureStackTrace (error) {
        var container = new Error();

        defineProperty(error, 'stack', {
          configurable: true,
          get: function getStack () {
            var stack = container.stack;

            // Replace property with value for faster future accesses.
            defineProperty(this, 'stack', {
              configurable: true,
              value: stack,
              writable: true
            });

            return stack
          },
          set: function setStack (stack) {
            defineProperty(error, 'stack', {
              configurable: true,
              value: stack,
              writable: true
            });
          }
        });
      };
    }

    // -------------------------------------------------------------------

    function BaseError (message) {
      if (message !== undefined) {
        defineProperty(this, 'message', {
          configurable: true,
          value: message,
          writable: true
        });
      }

      var cname = this.constructor.name;
      if (
        cname !== undefined &&
        cname !== this.name
      ) {
        defineProperty(this, 'name', {
          configurable: true,
          value: cname,
          writable: true
        });
      }

      captureStackTrace(this, this.constructor);
    }

    BaseError.prototype = Object.create(Error.prototype, {
      // See: https://github.com/JsCommunity/make-error/issues/4
      constructor: {
        configurable: true,
        value: BaseError,
        writable: true
      }
    });

    // -------------------------------------------------------------------

    // Sets the name of a function if possible (depends of the JS engine).
    var setFunctionName = (function () {
      function setFunctionName (fn, name) {
        return defineProperty(fn, 'name', {
          configurable: true,
          value: name
        })
      }
      try {
        var f = function () {};
        setFunctionName(f, 'foo');
        if (f.name === 'foo') {
          return setFunctionName
        }
      } catch (_) {}
    })();

    // -------------------------------------------------------------------

    function makeError (constructor, super_) {
      if (super_ == null || super_ === Error) {
        super_ = BaseError;
      } else if (typeof super_ !== 'function') {
        throw new TypeError('super_ should be a function')
      }

      var name;
      if (typeof constructor === 'string') {
        name = constructor;
        constructor = construct !== undefined
          ? function () { return construct(super_, arguments, this.constructor) }
          : function () { super_.apply(this, arguments); };

        // If the name can be set, do it once and for all.
        if (setFunctionName !== undefined) {
          setFunctionName(constructor, name);
          name = undefined;
        }
      } else if (typeof constructor !== 'function') {
        throw new TypeError('constructor should be either a string or a function')
      }

      // Also register the super constructor also as `constructor.super_` just
      // like Node's `util.inherits()`.
      constructor.super_ = constructor['super'] = super_;

      var properties = {
        constructor: {
          configurable: true,
          value: constructor,
          writable: true
        }
      };

      // If the name could not be set on the constructor, set it on the
      // prototype.
      if (name !== undefined) {
        properties.name = {
          configurable: true,
          value: name,
          writable: true
        };
      }
      constructor.prototype = Object.create(super_.prototype, properties);

      return constructor
    }
    exports = module.exports = makeError;
    exports.BaseError = BaseError;
    });
    var makeError_2 = makeError_1.BaseError;

    function ClientError(res) {
      var props = extractErrorProps(res);
      ClientError.super.call(this, props.message);
      objectAssign(this, props);
    }

    function ServerError(res) {
      var props = extractErrorProps(res);
      ServerError.super.call(this, props.message);
      objectAssign(this, props);
    }

    function extractErrorProps(res) {
      var body = res.body;
      var props = {
        response: res,
        statusCode: res.statusCode,
        responseBody: stringifyBody(body, res)
      }; // API/Boom style errors ({statusCode, error, message})

      if (body.error && body.message) {
        props.message = "".concat(body.error, " - ").concat(body.message);
        return props;
      } // Query/database errors ({error: {description, other, arb, props}})


      if (body.error && body.error.description) {
        props.message = body.error.description;
        props.details = body.error;
        return props;
      } // Other, more arbitrary errors


      props.message = body.error || body.message || httpErrorMessage(res);
      return props;
    }

    function httpErrorMessage(res) {
      var statusMessage = res.statusMessage ? " ".concat(res.statusMessage) : '';
      return "".concat(res.method, "-request to ").concat(res.url, " resulted in HTTP ").concat(res.statusCode).concat(statusMessage);
    }

    function stringifyBody(body, res) {
      var contentType = (res.headers['content-type'] || '').toLowerCase();
      var isJson = contentType.indexOf('application/json') !== -1;
      return isJson ? JSON.stringify(body, null, 2) : body;
    }

    makeError_1(ClientError);
    makeError_1(ServerError);
    var ClientError_1 = ClientError;
    var ServerError_1 = ServerError;

    var errors = {
    	ClientError: ClientError_1,
    	ServerError: ServerError_1
    };

    var browserMiddleware = [];

    /* eslint-disable no-empty-function, no-process-env */














    var ClientError$1 = errors.ClientError,
        ServerError$1 = errors.ServerError;

    var httpError = {
      onResponse: function onResponse(res) {
        if (res.statusCode >= 500) {
          throw new ServerError$1(res);
        } else if (res.statusCode >= 400) {
          throw new ClientError$1(res);
        }

        return res;
      }
    }; // Environment-specific middleware.



    var middleware = browserMiddleware.concat([jsonRequest(), jsonResponse(), progress(), httpError, observable$1({
      implementation: minimal
    })]);
    var request$2 = getIt(middleware);

    function httpRequest(options) {
      var requester = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : request$2;
      return requester(objectAssign({
        maxRedirects: 0
      }, options));
    }

    httpRequest.defaultRequester = request$2;
    httpRequest.ClientError = ClientError$1;
    httpRequest.ServerError = ServerError$1;
    var request_1 = httpRequest;

    var projectHeader = 'X-Sanity-Project-ID';

    var requestOptions = function (config) {
      var overrides = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var headers = {};
      var token = overrides.token || config.token;

      if (token) {
        headers.Authorization = "Bearer ".concat(token);
      }

      if (!overrides.useGlobalApi && !config.useProjectHostname && config.projectId) {
        headers[projectHeader] = config.projectId;
      }

      var withCredentials = Boolean(typeof overrides.withCredentials === 'undefined' ? config.token || config.withCredentials : overrides.withCredentials);
      var timeout = typeof overrides.timeout === 'undefined' ? config.timeout : overrides.timeout;
      return objectAssign({}, overrides, {
        headers: objectAssign({}, headers, overrides.headers || {}),
        timeout: typeof timeout === 'undefined' ? 5 * 60 * 1000 : timeout,
        json: true,
        withCredentials: withCredentials
      });
    };

    var defaultCdnHost = 'apicdn.sanity.io';
    var defaultConfig = {
      apiHost: 'https://api.sanity.io',
      useProjectHostname: true,
      gradientMode: false,
      isPromiseAPI: true
    };
    var LOCALHOSTS = ['localhost', '127.0.0.1', '0.0.0.0'];

    var isLocal = function isLocal(host) {
      return LOCALHOSTS.indexOf(host) !== -1;
    }; // eslint-disable-next-line no-console


    var createWarningPrinter = function createWarningPrinter(message) {
      return once(function () {
        return console.warn(message.join(' '));
      });
    };

    var printCdnWarning = createWarningPrinter(['You are not using the Sanity CDN. That means your data is always fresh, but the CDN is faster and', "cheaper. Think about it! For more info, see ".concat(generateHelpUrl('js-client-cdn-configuration'), "."), 'To hide this warning, please set the `useCdn` option to either `true` or `false` when creating', 'the client.']);
    var printBrowserTokenWarning = createWarningPrinter(['You have configured Sanity client to use a token in the browser. This may cause unintentional security issues.', "See ".concat(generateHelpUrl('js-client-browser-token'), " for more information and how to hide this warning.")]);
    var printCdnTokenWarning = createWarningPrinter(['You have set `useCdn` to `true` while also specifying a token. This is usually not what you', 'want. The CDN cannot be used with an authorization token, since private data cannot be cached.', "See ".concat(generateHelpUrl('js-client-usecdn-token'), " for more information.")]);
    var defaultConfig_1 = defaultConfig;

    var initConfig = function (config, prevConfig) {
      var newConfig = objectAssign({}, defaultConfig, prevConfig, config);
      var gradientMode = newConfig.gradientMode;
      var projectBased = !gradientMode && newConfig.useProjectHostname;

      if (typeof Promise === 'undefined') {
        var helpUrl = generateHelpUrl('js-client-promise-polyfill');
        throw new Error("No native Promise-implementation found, polyfill needed - see ".concat(helpUrl));
      }

      if (gradientMode && !newConfig.namespace) {
        throw new Error('Configuration must contain `namespace` when running in gradient mode');
      }

      if (projectBased && !newConfig.projectId) {
        throw new Error('Configuration must contain `projectId`');
      }

      var isBrowser = typeof window !== 'undefined' && window.location && window.location.hostname;
      var isLocalhost = isBrowser && isLocal(window.location.hostname);

      if (isBrowser && isLocalhost && newConfig.token && newConfig.ignoreBrowserTokenWarning !== true) {
        printBrowserTokenWarning();
      } else if ((!isBrowser || isLocalhost) && newConfig.useCdn && newConfig.token) {
        printCdnTokenWarning();
      } else if (typeof newConfig.useCdn === 'undefined') {
        printCdnWarning();
      }

      if (projectBased) {
        validators.projectId(newConfig.projectId);
      }

      if (!gradientMode && newConfig.dataset) {
        validators.dataset(newConfig.dataset, newConfig.gradientMode);
      }

      newConfig.isDefaultApi = newConfig.apiHost === defaultConfig.apiHost;
      newConfig.useCdn = Boolean(newConfig.useCdn) && !newConfig.token && !newConfig.withCredentials;

      if (newConfig.gradientMode) {
        newConfig.url = newConfig.apiHost;
        newConfig.cdnUrl = newConfig.apiHost;
      } else {
        var hostParts = newConfig.apiHost.split('://', 2);
        var protocol = hostParts[0];
        var host = hostParts[1];
        var cdnHost = newConfig.isDefaultApi ? defaultCdnHost : host;

        if (newConfig.useProjectHostname) {
          newConfig.url = "".concat(protocol, "://").concat(newConfig.projectId, ".").concat(host, "/v1");
          newConfig.cdnUrl = "".concat(protocol, "://").concat(newConfig.projectId, ".").concat(cdnHost, "/v1");
        } else {
          newConfig.url = "".concat(newConfig.apiHost, "/v1");
          newConfig.cdnUrl = newConfig.url;
        }
      }

      return newConfig;
    };

    var config$1 = {
    	defaultConfig: defaultConfig_1,
    	initConfig: initConfig
    };

    var filter$4 = filter.filter;

    var map$4 = map.map;





















    var defaultConfig$1 = config$1.defaultConfig,
        initConfig$1 = config$1.initConfig;

    var toPromise$1 = function toPromise(observable) {
      return observable.toPromise();
    };

    function SanityClient() {
      var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultConfig$1;

      if (!(this instanceof SanityClient)) {
        return new SanityClient(config);
      }

      this.config(config);
      this.assets = new assetsClient(this);
      this.datasets = new datasetsClient(this);
      this.projects = new projectsClient(this);
      this.users = new usersClient(this);
      this.auth = new authClient(this);

      if (this.clientConfig.isPromiseAPI) {
        var observableConfig = objectAssign({}, this.clientConfig, {
          isPromiseAPI: false
        });
        this.observable = new SanityClient(observableConfig);
      }
    }

    objectAssign(SanityClient.prototype, dataMethods);
    objectAssign(SanityClient.prototype, {
      clone: function clone() {
        return new SanityClient(this.config());
      },
      config: function config(newConfig) {
        if (typeof newConfig === 'undefined') {
          return objectAssign({}, this.clientConfig);
        }

        if (this.observable) {
          var observableConfig = objectAssign({}, newConfig, {
            isPromiseAPI: false
          });
          this.observable.config(observableConfig);
        }

        this.clientConfig = initConfig$1(newConfig, this.clientConfig || {});
        return this;
      },
      getUrl: function getUrl(uri) {
        var canUseCdn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        var base = canUseCdn ? this.clientConfig.cdnUrl : this.clientConfig.url;
        return "".concat(base, "/").concat(uri.replace(/^\//, ''));
      },
      isPromiseAPI: function isPromiseAPI() {
        return this.clientConfig.isPromiseAPI;
      },
      _requestObservable: function _requestObservable(options) {
        var uri = options.url || options.uri;
        var canUseCdn = this.clientConfig.useCdn && ['GET', 'HEAD'].indexOf(options.method || 'GET') >= 0 && uri.indexOf('/data/') === 0;
        var reqOptions = requestOptions(this.clientConfig, objectAssign({}, options, {
          url: this.getUrl(uri, canUseCdn)
        }));
        return request_1(reqOptions, this.clientConfig.requester);
      },
      request: function request(options) {
        var observable = this._requestObservable(options).pipe(filter$4(function (event) {
          return event.type === 'response';
        }), map$4(function (event) {
          return event.body;
        }));

        return this.isPromiseAPI() ? toPromise$1(observable) : observable;
      }
    });
    SanityClient.Patch = patch;
    SanityClient.Transaction = transaction;
    SanityClient.ClientError = request_1.ClientError;
    SanityClient.ServerError = request_1.ServerError;
    SanityClient.requester = request_1.defaultRequester;
    var sanityClient = SanityClient;

    /*!
     * Cross-Browser Split 1.1.1
     * Copyright 2007-2012 Steven Levithan <stevenlevithan.com>
     * Available under the MIT License
     * ECMAScript compliant, uniform cross-browser split method
     */

    /**
     * Splits a string into an array of strings using a regex or string separator. Matches of the
     * separator are not included in the result array. However, if `separator` is a regex that contains
     * capturing groups, backreferences are spliced into the result each time `separator` is matched.
     * Fixes browser bugs compared to the native `String.prototype.split` and can be used reliably
     * cross-browser.
     * @param {String} str String to split.
     * @param {RegExp|String} separator Regex or string to use for separating the string.
     * @param {Number} [limit] Maximum number of items to include in the result array.
     * @returns {Array} Array of substrings.
     * @example
     *
     * // Basic use
     * split('a b c d', ' ');
     * // -> ['a', 'b', 'c', 'd']
     *
     * // With limit
     * split('a b c d', ' ', 2);
     * // -> ['a', 'b']
     *
     * // Backreferences in result array
     * split('..word1 word2..', /([a-z]+)(\d+)/i);
     * // -> ['..', 'word', '1', ' ', 'word', '2', '..']
     */
    var browserSplit = (function split(undef) {

      var nativeSplit = String.prototype.split,
        compliantExecNpcg = /()??/.exec("")[1] === undef,
        // NPCG: nonparticipating capturing group
        self;

      self = function(str, separator, limit) {
        // If `separator` is not a regex, use `nativeSplit`
        if (Object.prototype.toString.call(separator) !== "[object RegExp]") {
          return nativeSplit.call(str, separator, limit);
        }
        var output = [],
          flags = (separator.ignoreCase ? "i" : "") + (separator.multiline ? "m" : "") + (separator.extended ? "x" : "") + // Proposed for ES6
          (separator.sticky ? "y" : ""),
          // Firefox 3+
          lastLastIndex = 0,
          // Make `global` and avoid `lastIndex` issues by working with a copy
          separator = new RegExp(separator.source, flags + "g"),
          separator2, match, lastIndex, lastLength;
        str += ""; // Type-convert
        if (!compliantExecNpcg) {
          // Doesn't need flags gy, but they don't hurt
          separator2 = new RegExp("^" + separator.source + "$(?!\\s)", flags);
        }
        /* Values for `limit`, per the spec:
         * If undefined: 4294967295 // Math.pow(2, 32) - 1
         * If 0, Infinity, or NaN: 0
         * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
         * If negative number: 4294967296 - Math.floor(Math.abs(limit))
         * If other: Type-convert, then use the above rules
         */
        limit = limit === undef ? -1 >>> 0 : // Math.pow(2, 32) - 1
        limit >>> 0; // ToUint32(limit)
        while (match = separator.exec(str)) {
          // `separator.lastIndex` is not reliable cross-browser
          lastIndex = match.index + match[0].length;
          if (lastIndex > lastLastIndex) {
            output.push(str.slice(lastLastIndex, match.index));
            // Fix browsers whose `exec` methods don't consistently return `undefined` for
            // nonparticipating capturing groups
            if (!compliantExecNpcg && match.length > 1) {
              match[0].replace(separator2, function() {
                for (var i = 1; i < arguments.length - 2; i++) {
                  if (arguments[i] === undef) {
                    match[i] = undef;
                  }
                }
              });
            }
            if (match.length > 1 && match.index < str.length) {
              Array.prototype.push.apply(output, match.slice(1));
            }
            lastLength = match[0].length;
            lastLastIndex = lastIndex;
            if (output.length >= limit) {
              break;
            }
          }
          if (separator.lastIndex === match.index) {
            separator.lastIndex++; // Avoid an infinite loop
          }
        }
        if (lastLastIndex === str.length) {
          if (lastLength || !separator.test("")) {
            output.push("");
          }
        } else {
          output.push(str.slice(lastLastIndex));
        }
        return output.length > limit ? output.slice(0, limit) : output;
      };

      return self;
    })();

    var indexOf = [].indexOf;

    var indexof = function(arr, obj){
      if (indexOf) return arr.indexOf(obj);
      for (var i = 0; i < arr.length; ++i) {
        if (arr[i] === obj) return i;
      }
      return -1;
    };

    // contains, add, remove, toggle


    var classList = ClassList;

    function ClassList(elem) {
        var cl = elem.classList;

        if (cl) {
            return cl
        }

        var classList = {
            add: add
            , remove: remove
            , contains: contains
            , toggle: toggle
            , toString: $toString
            , length: 0
            , item: item
        };

        return classList

        function add(token) {
            var list = getTokens();
            if (indexof(list, token) > -1) {
                return
            }
            list.push(token);
            setTokens(list);
        }

        function remove(token) {
            var list = getTokens()
                , index = indexof(list, token);

            if (index === -1) {
                return
            }

            list.splice(index, 1);
            setTokens(list);
        }

        function contains(token) {
            return indexof(getTokens(), token) > -1
        }

        function toggle(token) {
            if (contains(token)) {
                remove(token);
                return false
            } else {
                add(token);
                return true
            }
        }

        function $toString() {
            return elem.className
        }

        function item(index) {
            var tokens = getTokens();
            return tokens[index] || null
        }

        function getTokens() {
            var className = elem.className;

            return filter$5(className.split(" "), isTruthy)
        }

        function setTokens(list) {
            var length = list.length;

            elem.className = list.join(" ");
            classList.length = length;

            for (var i = 0; i < list.length; i++) {
                classList[i] = list[i];
            }

            delete list[length];
        }
    }

    function filter$5 (arr, fn) {
        var ret = [];
        for (var i = 0; i < arr.length; i++) {
            if (fn(arr[i])) ret.push(arr[i]);
        }
        return ret
    }

    function isTruthy(value) {
        return !!value
    }

    var _nodeResolve_empty = {};

    var _nodeResolve_empty$1 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': _nodeResolve_empty
    });

    var require$$0 = getCjsExportFromNamespace(_nodeResolve_empty$1);

    var hyperscript = createCommonjsModule(function (module) {
    var w = typeof window === 'undefined' ? require$$0 : window;
    var document = w.document;
    var Text = w.Text;

    function context () {

      var cleanupFuncs = [];

      function h() {
        var args = [].slice.call(arguments), e = null;
        function item (l) {
          var r;
          function parseClass (string) {
            // Our minimal parser doesn’t understand escaping CSS special
            // characters like `#`. Don’t use them. More reading:
            // https://mathiasbynens.be/notes/css-escapes .

            var m = browserSplit(string, /([\.#]?[^\s#.]+)/);
            if(/^\.|#/.test(m[1]))
              e = document.createElement('div');
            forEach(m, function (v) {
              var s = v.substring(1,v.length);
              if(!v) return
              if(!e)
                e = document.createElement(v);
              else if (v[0] === '.')
                classList(e).add(s);
              else if (v[0] === '#')
                e.setAttribute('id', s);
            });
          }

          if(l == null)
            ;
          else if('string' === typeof l) {
            if(!e)
              parseClass(l);
            else
              e.appendChild(r = document.createTextNode(l));
          }
          else if('number' === typeof l
            || 'boolean' === typeof l
            || l instanceof Date
            || l instanceof RegExp ) {
              e.appendChild(r = document.createTextNode(l.toString()));
          }
          //there might be a better way to handle this...
          else if (isArray(l))
            forEach(l, item);
          else if(isNode(l))
            e.appendChild(r = l);
          else if(l instanceof Text)
            e.appendChild(r = l);
          else if ('object' === typeof l) {
            for (var k in l) {
              if('function' === typeof l[k]) {
                if(/^on\w+/.test(k)) {
                  (function (k, l) { // capture k, l in the closure
                    if (e.addEventListener){
                      e.addEventListener(k.substring(2), l[k], false);
                      cleanupFuncs.push(function(){
                        e.removeEventListener(k.substring(2), l[k], false);
                      });
                    }else{
                      e.attachEvent(k, l[k]);
                      cleanupFuncs.push(function(){
                        e.detachEvent(k, l[k]);
                      });
                    }
                  })(k, l);
                } else {
                  // observable
                  e[k] = l[k]();
                  cleanupFuncs.push(l[k](function (v) {
                    e[k] = v;
                  }));
                }
              }
              else if(k === 'style') {
                if('string' === typeof l[k]) {
                  e.style.cssText = l[k];
                }else{
                  for (var s in l[k]) (function(s, v) {
                    if('function' === typeof v) {
                      // observable
                      e.style.setProperty(s, v());
                      cleanupFuncs.push(v(function (val) {
                        e.style.setProperty(s, val);
                      }));
                    } else
                      var match = l[k][s].match(/(.*)\W+!important\W*$/);
                      if (match) {
                        e.style.setProperty(s, match[1], 'important');
                      } else {
                        e.style.setProperty(s, l[k][s]);
                      }
                  })(s, l[k][s]);
                }
              } else if(k === 'attrs') {
                for (var v in l[k]) {
                  e.setAttribute(v, l[k][v]);
                }
              }
              else if (k.substr(0, 5) === "data-") {
                e.setAttribute(k, l[k]);
              } else {
                e[k] = l[k];
              }
            }
          } else if ('function' === typeof l) {
            //assume it's an observable!
            var v = l();
            e.appendChild(r = isNode(v) ? v : document.createTextNode(v));

            cleanupFuncs.push(l(function (v) {
              if(isNode(v) && r.parentElement)
                r.parentElement.replaceChild(v, r), r = v;
              else
                r.textContent = v;
            }));
          }

          return r
        }
        while(args.length)
          item(args.shift());

        return e
      }

      h.cleanup = function () {
        for (var i = 0; i < cleanupFuncs.length; i++){
          cleanupFuncs[i]();
        }
        cleanupFuncs.length = 0;
      };

      return h
    }

    var h = module.exports = context();
    h.context = context;

    function isNode (el) {
      return el && el.nodeName && el.nodeType
    }

    function forEach (arr, fn) {
      if (arr.forEach) return arr.forEach(fn)
      for (var i = 0; i < arr.length; i++) fn(arr[i], i);
    }

    function isArray (arr) {
      return Object.prototype.toString.call(arr) == '[object Array]'
    }
    });

    var baseUrl$1 = 'https://docs.sanity.io/help/';

    var generateHelpUrl$1 = function generateHelpUrl(slug) {
      return baseUrl$1 + slug
    };

    var imageUrl_umd = createCommonjsModule(function (module, exports) {
    (function (global, factory) {
       module.exports = factory() ;
    }(commonjsGlobal, (function () {
      var example = 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg';
      function parseAssetId(ref) {
        var ref$1 = ref.split('-');
        var id = ref$1[1];
        var dimensionString = ref$1[2];
        var format = ref$1[3];

        if (!id || !dimensionString || !format) {
          throw new Error(("Malformed asset _ref '" + ref + "'. Expected an id like \"" + example + "\"."));
        }

        var ref$2 = dimensionString.split('x');
        var imgWidthStr = ref$2[0];
        var imgHeightStr = ref$2[1];
        var width = +imgWidthStr;
        var height = +imgHeightStr;
        var isValidAssetId = isFinite(width) && isFinite(height);

        if (!isValidAssetId) {
          throw new Error(("Malformed asset _ref '" + ref + "'. Expected an id like \"" + example + "\"."));
        }

        return {
          id: id,
          width: width,
          height: height,
          format: format
        };
      }

      var isRef = function (src) {
        var source = src;
        return source ? typeof source._ref === 'string' : false;
      };

      var isAsset = function (src) {
        var source = src;
        return source ? typeof source._id === 'string' : false;
      };

      var isAssetStub = function (src) {
        var source = src;
        return source && source.asset ? typeof source.asset.url === 'string' : false;
      }; // Convert an asset-id, asset or image to an image record suitable for processing
      // eslint-disable-next-line complexity


      function parseSource(source) {
        if (!source) {
          return null;
        }

        var image;

        if (typeof source === 'string' && isUrl(source)) {
          // Someone passed an existing image url?
          image = {
            asset: {
              _ref: urlToId(source)
            }
          };
        } else if (typeof source === 'string') {
          // Just an asset id
          image = {
            asset: {
              _ref: source
            }
          };
        } else if (isRef(source)) {
          // We just got passed an asset directly
          image = {
            asset: source
          };
        } else if (isAsset(source)) {
          // If we were passed an image asset document
          image = {
            asset: {
              _ref: source._id || ''
            }
          };
        } else if (isAssetStub(source)) {
          // If we were passed a partial asset (`url`, but no `_id`)
          image = {
            asset: {
              _ref: urlToId(source.asset.url)
            }
          };
        } else if (typeof source.asset === 'object') {
          // Probably an actual image with materialized asset
          image = source;
        } else {
          // We got something that does not look like an image, or it is an image
          // that currently isn't sporting an asset.
          return null;
        }

        var img = source;

        if (img.crop) {
          image.crop = img.crop;
        }

        if (img.hotspot) {
          image.hotspot = img.hotspot;
        }

        return applyDefaults(image);
      }

      function isUrl(url) {
        return /^https?:\/\//.test(("" + url));
      }

      function urlToId(url) {
        var parts = url.split('/').slice(-1);
        return ("image-" + (parts[0])).replace(/\.([a-z]+)$/, '-$1');
      } // Mock crop and hotspot if image lacks it


      function applyDefaults(image) {
        if (image.crop && image.hotspot) {
          return image;
        } // We need to pad in default values for crop or hotspot


        var result = Object.assign({}, image);

        if (!result.crop) {
          result.crop = {
            left: 0,
            top: 0,
            bottom: 0,
            right: 0
          };
        }

        if (!result.hotspot) {
          result.hotspot = {
            x: 0.5,
            y: 0.5,
            height: 1.0,
            width: 1.0
          };
        }

        return result;
      }

      var SPEC_NAME_TO_URL_NAME_MAPPINGS = [['width', 'w'], ['height', 'h'], ['format', 'fm'], ['download', 'dl'], ['blur', 'blur'], ['sharpen', 'sharp'], ['invert', 'invert'], ['orientation', 'or'], ['minHeight', 'min-h'], ['maxHeight', 'max-h'], ['minWidth', 'min-w'], ['maxWidth', 'max-w'], ['quality', 'q'], ['fit', 'fit'], ['crop', 'crop'], ['auto', 'auto'], ['dpr', 'dpr']];
      function urlForImage(options) {
        var spec = Object.assign({}, (options || {}));
        var source = spec.source;
        delete spec.source;
        var image = parseSource(source);

        if (!image) {
          return null;
        }

        var id = image.asset._ref || image.asset._id || '';
        var asset = parseAssetId(id); // Compute crop rect in terms of pixel coordinates in the raw source image

        var cropLeft = Math.round(image.crop.left * asset.width);
        var cropTop = Math.round(image.crop.top * asset.height);
        var crop = {
          left: cropLeft,
          top: cropTop,
          width: Math.round(asset.width - image.crop.right * asset.width - cropLeft),
          height: Math.round(asset.height - image.crop.bottom * asset.height - cropTop)
        }; // Compute hot spot rect in terms of pixel coordinates

        var hotSpotVerticalRadius = image.hotspot.height * asset.height / 2;
        var hotSpotHorizontalRadius = image.hotspot.width * asset.width / 2;
        var hotSpotCenterX = image.hotspot.x * asset.width;
        var hotSpotCenterY = image.hotspot.y * asset.height;
        var hotspot = {
          left: hotSpotCenterX - hotSpotHorizontalRadius,
          top: hotSpotCenterY - hotSpotVerticalRadius,
          right: hotSpotCenterX + hotSpotHorizontalRadius,
          bottom: hotSpotCenterY + hotSpotVerticalRadius
        }; // If irrelevant, or if we are requested to: don't perform crop/fit based on
        // the crop/hotspot.

        if (!(spec.rect || spec.focalPoint || spec.ignoreImageParams || spec.crop)) {
          spec = Object.assign({}, spec,
            fit({
              crop: crop,
              hotspot: hotspot
            }, spec));
        }

        return specToImageUrl(Object.assign({}, spec,
          {asset: asset}));
      } // eslint-disable-next-line complexity

      function specToImageUrl(spec) {
        var cdnUrl = spec.baseUrl || 'https://cdn.sanity.io';
        var filename = (spec.asset.id) + "-" + (spec.asset.width) + "x" + (spec.asset.height) + "." + (spec.asset.format);
        var baseUrl = cdnUrl + "/images/" + (spec.projectId) + "/" + (spec.dataset) + "/" + filename;
        var params = [];

        if (spec.rect) {
          // Only bother url with a crop if it actually crops anything
          var ref = spec.rect;
          var left = ref.left;
          var top = ref.top;
          var width = ref.width;
          var height = ref.height;
          var isEffectiveCrop = left !== 0 || top !== 0 || height !== spec.asset.height || width !== spec.asset.width;

          if (isEffectiveCrop) {
            params.push(("rect=" + left + "," + top + "," + width + "," + height));
          }
        }

        if (spec.bg) {
          params.push(("bg=" + (spec.bg)));
        }

        if (spec.focalPoint) {
          params.push(("fp-x=" + (spec.focalPoint.x)));
          params.push(("fp-x=" + (spec.focalPoint.y)));
        }

        var flip = [spec.flipHorizontal && 'h', spec.flipVertical && 'v'].filter(Boolean).join('');

        if (flip) {
          params.push(("flip=" + flip));
        } // Map from spec name to url param name, and allow using the actual param name as an alternative


        SPEC_NAME_TO_URL_NAME_MAPPINGS.forEach(function (mapping) {
          var specName = mapping[0];
          var param = mapping[1];

          if (typeof spec[specName] !== 'undefined') {
            params.push((param + "=" + (encodeURIComponent(spec[specName]))));
          } else if (typeof spec[param] !== 'undefined') {
            params.push((param + "=" + (encodeURIComponent(spec[param]))));
          }
        });

        if (params.length === 0) {
          return baseUrl;
        }

        return (baseUrl + "?" + (params.join('&')));
      }

      function fit(source, spec) {
        var cropRect;
        var imgWidth = spec.width;
        var imgHeight = spec.height; // If we are not constraining the aspect ratio, we'll just use the whole crop

        if (!(imgWidth && imgHeight)) {
          return {
            width: imgWidth,
            height: imgHeight,
            rect: source.crop
          };
        }

        var crop = source.crop;
        var hotspot = source.hotspot; // If we are here, that means aspect ratio is locked and fitting will be a bit harder

        var desiredAspectRatio = imgWidth / imgHeight;
        var cropAspectRatio = crop.width / crop.height;

        if (cropAspectRatio > desiredAspectRatio) {
          // The crop is wider than the desired aspect ratio. That means we are cutting from the sides
          var height = crop.height;
          var width = height * desiredAspectRatio;
          var top = crop.top; // Center output horizontally over hotspot

          var hotspotXCenter = (hotspot.right - hotspot.left) / 2 + hotspot.left;
          var left = hotspotXCenter - width / 2; // Keep output within crop

          if (left < crop.left) {
            left = crop.left;
          } else if (left + width > crop.left + crop.width) {
            left = crop.left + crop.width - width;
          }

          cropRect = {
            left: Math.round(left),
            top: Math.round(top),
            width: Math.round(width),
            height: Math.round(height)
          };
        } else {
          // The crop is taller than the desired ratio, we are cutting from top and bottom
          var width$1 = crop.width;
          var height$1 = width$1 / desiredAspectRatio;
          var left$1 = crop.left; // Center output vertically over hotspot

          var hotspotYCenter = (hotspot.bottom - hotspot.top) / 2 + hotspot.top;
          var top$1 = hotspotYCenter - height$1 / 2; // Keep output rect within crop

          if (top$1 < crop.top) {
            top$1 = crop.top;
          } else if (top$1 + height$1 > crop.top + crop.height) {
            top$1 = crop.top + crop.height - height$1;
          }

          cropRect = {
            left: Math.max(0, Math.floor(left$1)),
            top: Math.max(0, Math.floor(top$1)),
            width: Math.round(width$1),
            height: Math.round(height$1)
          };
        }

        return {
          width: imgWidth,
          height: imgHeight,
          rect: cropRect
        };
      } // For backwards-compatibility

      var validFits = ['clip', 'crop', 'fill', 'fillmax', 'max', 'scale', 'min'];
      var validCrops = ['top', 'bottom', 'left', 'right', 'center', 'focalpoint', 'entropy'];
      var validAutoModes = ['format'];

      function isSanityClient(client) {
        return client ? typeof client.clientConfig === 'object' : false;
      }

      function rewriteSpecName(key) {
        var specs = SPEC_NAME_TO_URL_NAME_MAPPINGS;

        for (var i = 0, list = specs; i < list.length; i += 1) {
          var entry = list[i];

          var specName = entry[0];
          var param = entry[1];

          if (key === specName || key === param) {
            return specName;
          }
        }

        return key;
      }

      function urlBuilder(options) {
        // Did we get a SanityClient?
        var client = options;

        if (isSanityClient(client)) {
          // Inherit config from client
          var ref = client.clientConfig;
          var apiHost = ref.apiHost;
          var projectId = ref.projectId;
          var dataset = ref.dataset;
          return new ImageUrlBuilder(null, {
            baseUrl: apiHost.replace(/^https:\/\/api\./, 'https://cdn.'),
            projectId: projectId,
            dataset: dataset
          });
        } // Or just accept the options as given


        return new ImageUrlBuilder(null, options);
      }

      var ImageUrlBuilder = function ImageUrlBuilder(parent, options) {
        this.options = parent ? Object.assign({}, (parent.options || {}),
          (options || {})) // Merge parent options
        : Object.assign({}, (options || {})); // Copy options
      };

      ImageUrlBuilder.prototype.withOptions = function withOptions (options) {
        var baseUrl = options.baseUrl || '';
        var newOptions = {
          baseUrl: baseUrl
        };

        for (var key in options) {
          if (options.hasOwnProperty(key)) {
            var specKey = rewriteSpecName(key);
            newOptions[specKey] = options[key];
          }
        }

        return new ImageUrlBuilder(this, Object.assign({}, {baseUrl: baseUrl},
          newOptions));
      }; // The image to be represented. Accepts a Sanity 'image'-document, 'asset'-document or
      // _id of asset. To get the benefit of automatic hot-spot/crop integration with the content
      // studio, the 'image'-document must be provided.


      ImageUrlBuilder.prototype.image = function image (source) {
        return this.withOptions({
          source: source
        });
      }; // Specify the dataset


      ImageUrlBuilder.prototype.dataset = function dataset (dataset$1) {
        return this.withOptions({
          dataset: dataset$1
        });
      }; // Specify the projectId


      ImageUrlBuilder.prototype.projectId = function projectId (projectId$1) {
        return this.withOptions({
          projectId: projectId$1
        });
      }; // Specify background color


      ImageUrlBuilder.prototype.bg = function bg (bg$1) {
        return this.withOptions({
          bg: bg$1
        });
      }; // Set DPR scaling factor


      ImageUrlBuilder.prototype.dpr = function dpr (dpr$1) {
        return this.withOptions({
          dpr: dpr$1
        });
      }; // Specify the width of the image in pixels


      ImageUrlBuilder.prototype.width = function width (width$1) {
        return this.withOptions({
          width: width$1
        });
      }; // Specify the height of the image in pixels


      ImageUrlBuilder.prototype.height = function height (height$1) {
        return this.withOptions({
          height: height$1
        });
      }; // Specify focal point in fraction of image dimensions. Each component 0.0-1.0


      ImageUrlBuilder.prototype.focalPoint = function focalPoint (x, y) {
        return this.withOptions({
          focalPoint: {
            x: x,
            y: y
          }
        });
      };

      ImageUrlBuilder.prototype.maxWidth = function maxWidth (maxWidth$1) {
        return this.withOptions({
          maxWidth: maxWidth$1
        });
      };

      ImageUrlBuilder.prototype.minWidth = function minWidth (minWidth$1) {
        return this.withOptions({
          minWidth: minWidth$1
        });
      };

      ImageUrlBuilder.prototype.maxHeight = function maxHeight (maxHeight$1) {
        return this.withOptions({
          maxHeight: maxHeight$1
        });
      };

      ImageUrlBuilder.prototype.minHeight = function minHeight (minHeight$1) {
        return this.withOptions({
          minHeight: minHeight$1
        });
      }; // Specify width and height in pixels


      ImageUrlBuilder.prototype.size = function size (width, height) {
        return this.withOptions({
          width: width,
          height: height
        });
      }; // Specify blur between 0 and 100


      ImageUrlBuilder.prototype.blur = function blur (blur$1) {
        return this.withOptions({
          blur: blur$1
        });
      };

      ImageUrlBuilder.prototype.sharpen = function sharpen (sharpen$1) {
        return this.withOptions({
          sharpen: sharpen$1
        });
      }; // Specify the desired rectangle of the image


      ImageUrlBuilder.prototype.rect = function rect (left, top, width, height) {
        return this.withOptions({
          rect: {
            left: left,
            top: top,
            width: width,
            height: height
          }
        });
      }; // Specify the image format of the image. 'jpg', 'pjpg', 'png', 'webp'


      ImageUrlBuilder.prototype.format = function format (format$1) {
        return this.withOptions({
          format: format$1
        });
      };

      ImageUrlBuilder.prototype.invert = function invert (invert$1) {
        return this.withOptions({
          invert: invert$1
        });
      }; // Rotation in degrees 0, 90, 180, 270


      ImageUrlBuilder.prototype.orientation = function orientation (orientation$1) {
        return this.withOptions({
          orientation: orientation$1
        });
      }; // Compression quality 0-100


      ImageUrlBuilder.prototype.quality = function quality (quality$1) {
        return this.withOptions({
          quality: quality$1
        });
      }; // Make it a download link. Parameter is default filename.


      ImageUrlBuilder.prototype.forceDownload = function forceDownload (download) {
        return this.withOptions({
          download: download
        });
      }; // Flip image horizontally


      ImageUrlBuilder.prototype.flipHorizontal = function flipHorizontal () {
        return this.withOptions({
          flipHorizontal: true
        });
      }; // Flip image verically


      ImageUrlBuilder.prototype.flipVertical = function flipVertical () {
        return this.withOptions({
          flipVertical: true
        });
      }; // Ignore crop/hotspot from image record, even when present


      ImageUrlBuilder.prototype.ignoreImageParams = function ignoreImageParams () {
        return this.withOptions({
          ignoreImageParams: true
        });
      };

      ImageUrlBuilder.prototype.fit = function fit (value) {
        if (validFits.indexOf(value) === -1) {
          throw new Error(("Invalid fit mode \"" + value + "\""));
        }

        return this.withOptions({
          fit: value
        });
      };

      ImageUrlBuilder.prototype.crop = function crop (value) {
        if (validCrops.indexOf(value) === -1) {
          throw new Error(("Invalid crop mode \"" + value + "\""));
        }

        return this.withOptions({
          crop: value
        });
      };

      ImageUrlBuilder.prototype.auto = function auto (value) {
        if (validAutoModes.indexOf(value) === -1) {
          throw new Error(("Invalid auto mode \"" + value + "\""));
        }

        return this.withOptions({
          auto: value
        });
      }; // Gets the url based on the submitted parameters


      ImageUrlBuilder.prototype.url = function url () {
        return urlForImage(this.options);
      }; // Synonym for url()


      ImageUrlBuilder.prototype.toString = function toString () {
        return this.url();
      };

      return urlBuilder;

    })));
    //# sourceMappingURL=image-url.umd.js.map
    });

    var enc$1 = encodeURIComponent;
    var materializeError = "You must either:\n  - Pass `projectId` and `dataset` to the block renderer\n  - Materialize images to include the `url` field.\n\nFor more information, see ".concat(generateHelpUrl$1('block-content-image-materializing'));

    var getQueryString = function getQueryString(options) {
      var query = options.imageOptions;
      var keys = Object.keys(query);

      if (!keys.length) {
        return '';
      }

      var params = keys.map(function (key) {
        return "".concat(enc$1(key), "=").concat(enc$1(query[key]));
      });
      return "?".concat(params.join('&'));
    };

    var buildUrl = function buildUrl(props) {
      var node = props.node,
          options = props.options;
      var projectId = options.projectId,
          dataset = options.dataset;
      var asset = node.asset;

      if (!asset) {
        throw new Error('Image does not have required `asset` property');
      }

      if (asset.url) {
        return asset.url + getQueryString(options);
      }

      if (!projectId || !dataset) {
        throw new Error(materializeError);
      }

      var ref = asset._ref;

      if (!ref) {
        throw new Error('Invalid image reference in block, no `_ref` found on `asset`');
      }

      return imageUrl_umd(objectAssign({
        projectId: projectId,
        dataset: dataset
      }, options.imageOptions || {})).image(node).toString();
    };

    var getImageUrl = buildUrl;

    var defaultMarks = ['strong', 'em', 'code', 'underline', 'strike-through'];

    var buildMarksTree = function buildMarksTree(block) {
      var children = block.children,
          markDefs = block.markDefs;

      if (!children || !children.length) {
        return [];
      }

      var sortedMarks = children.map(sortMarksByOccurences);
      var rootNode = {
        _type: 'span',
        children: []
      };
      var nodeStack = [rootNode];
      children.forEach(function (span, i) {
        var marksNeeded = sortedMarks[i];

        if (!marksNeeded) {
          var lastNode = nodeStack[nodeStack.length - 1];
          lastNode.children.push(span);
          return;
        }

        var pos = 1; // Start at position one. Root is always plain and should never be removed. (?)

        if (nodeStack.length > 1) {
          for (pos; pos < nodeStack.length; pos++) {
            var mark = nodeStack[pos].markKey;
            var index = marksNeeded.indexOf(mark); // eslint-disable-next-line max-depth

            if (index === -1) {
              break;
            }

            marksNeeded.splice(index, 1);
          }
        } // Keep from beginning to first miss


        nodeStack = nodeStack.slice(0, pos); // Add needed nodes

        var currentNode = findLastParentNode(nodeStack);
        marksNeeded.forEach(function (mark) {
          var node = {
            _type: 'span',
            _key: span._key,
            children: [],
            mark: markDefs.find(function (def) {
              return def._key === mark;
            }) || mark,
            markKey: mark
          };
          currentNode.children.push(node);
          nodeStack.push(node);
          currentNode = node;
        }); // Split at newlines to make individual line chunks, but keep newline
        // characters as individual elements in the array. We use these characters
        // in the span serializer to trigger hard-break rendering

        if (isTextSpan(span)) {
          var lines = span.text.split('\n');

          for (var line = lines.length; line-- > 1;) {
            lines.splice(line, 0, '\n');
          }

          currentNode.children = currentNode.children.concat(lines);
        } else {
          currentNode.children = currentNode.children.concat(span);
        }
      });
      return rootNode.children;
    }; // We want to sort all the marks of all the spans in the following order:
    // 1. Marks that are shared amongst the most adjacent siblings
    // 2. Non-default marks (links, custom metadata)
    // 3. Built-in, plain marks (bold, emphasis, code etc)


    function sortMarksByOccurences(span, i, spans) {
      if (!span.marks || span.marks.length === 0) {
        return span.marks || [];
      }

      var markOccurences = span.marks.reduce(function (occurences, mark) {
        occurences[mark] = occurences[mark] ? occurences[mark] + 1 : 1;

        for (var siblingIndex = i + 1; siblingIndex < spans.length; siblingIndex++) {
          var sibling = spans[siblingIndex];

          if (sibling.marks && Array.isArray(sibling.marks) && sibling.marks.indexOf(mark) !== -1) {
            occurences[mark]++;
          } else {
            break;
          }
        }

        return occurences;
      }, {});
      var sortByOccurence = sortMarks.bind(null, markOccurences); // Slicing because sort() mutates the input

      return span.marks.slice().sort(sortByOccurence);
    }

    function sortMarks(occurences, markA, markB) {
      var aOccurences = occurences[markA] || 0;
      var bOccurences = occurences[markB] || 0;

      if (aOccurences !== bOccurences) {
        return bOccurences - aOccurences;
      }

      var aDefaultPos = defaultMarks.indexOf(markA);
      var bDefaultPos = defaultMarks.indexOf(markB); // Sort default marks last

      if (aDefaultPos !== bDefaultPos) {
        return aDefaultPos - bDefaultPos;
      } // Sort other marks simply by key


      if (markA < markB) {
        return -1;
      } else if (markA > markB) {
        return 1;
      }

      return 0;
    }

    function isTextSpan(node) {
      return node._type === 'span' && typeof node.text === 'string' && (Array.isArray(node.marks) || typeof node.marks === 'undefined');
    }

    function findLastParentNode(nodes) {
      for (var i = nodes.length - 1; i >= 0; i--) {
        var node = nodes[i];

        if (node._type === 'span' && node.children) {
          return node;
        }
      }

      return undefined;
    }

    var buildMarksTree_1 = buildMarksTree;

    /* eslint-disable max-depth, complexity */


    function nestLists(blocks) {
      var mode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'html';
      var tree = [];
      var currentList;

      for (var i = 0; i < blocks.length; i++) {
        var block = blocks[i];

        if (!isListBlock(block)) {
          tree.push(block);
          currentList = null;
          continue;
        } // Start of a new list?


        if (!currentList) {
          currentList = listFromBlock(block);
          tree.push(currentList);
          continue;
        } // New list item within same list?


        if (blockMatchesList(block, currentList)) {
          currentList.children.push(block);
          continue;
        } // Different list props, are we going deeper?


        if (block.level > currentList.level) {
          var newList = listFromBlock(block);

          if (mode === 'html') {
            // Because HTML is kinda weird, nested lists needs to be nested within list items
            // So while you would think that we could populate the parent list with a new sub-list,
            // We actually have to target the last list element (child) of the parent.
            // However, at this point we need to be very careful - simply pushing to the list of children
            // will mutate the input, and we don't want to blindly clone the entire tree.
            // Clone the last child while adding our new list as the last child of it
            var lastListItem = lastChild(currentList);
            var newLastChild = objectAssign({}, lastListItem, {
              children: lastListItem.children.concat(newList)
            }); // Swap the last child

            currentList.children[currentList.children.length - 1] = newLastChild;
          } else {
            currentList.children.push(newList);
          } // Set the newly created, deeper list as the current


          currentList = newList;
          continue;
        } // Different list props, are we going back up the tree?


        if (block.level < currentList.level) {
          // Current list has ended, and we need to hook up with a parent of the same level and type
          var match = findListMatching(tree[tree.length - 1], block);

          if (match) {
            currentList = match;
            currentList.children.push(block);
            continue;
          } // Similar parent can't be found, assume new list


          currentList = listFromBlock(block);
          tree.push(currentList);
          continue;
        } // Different list props, different list style?


        if (block.listItem !== currentList.listItem) {
          var _match = findListMatching(tree[tree.length - 1], {
            level: block.level
          });

          if (_match && _match.listItem === block.listItem) {
            currentList = _match;
            currentList.children.push(block);
            continue;
          } else {
            currentList = listFromBlock(block);
            tree.push(currentList);
            continue;
          }
        } // eslint-disable-next-line no-console


        console.warn('Unknown state encountered for block', block);
        tree.push(block);
      }

      return tree;
    }

    function isListBlock(block) {
      return Boolean(block.listItem);
    }

    function blockMatchesList(block, list) {
      return block.level === list.level && block.listItem === list.listItem;
    }

    function listFromBlock(block) {
      return {
        _type: 'list',
        _key: "".concat(block._key, "-parent"),
        level: block.level,
        listItem: block.listItem,
        children: [block]
      };
    }

    function lastChild(block) {
      return block.children && block.children[block.children.length - 1];
    }

    function findListMatching(rootNode, matching) {
      var filterOnType = typeof matching.listItem === 'string';

      if (rootNode._type === 'list' && rootNode.level === matching.level && filterOnType && rootNode.listItem === matching.listItem) {
        return rootNode;
      }

      var node = lastChild(rootNode);

      if (!node) {
        return false;
      }

      return findListMatching(node, matching);
    }

    var nestLists_1 = nestLists;

    var generateKeys = function (blocks) {
      return blocks.map(function (block) {
        if (block._key) {
          return block;
        }

        return objectAssign({
          _key: getStaticKey(block)
        }, block);
      });
    };

    function getStaticKey(item) {
      return checksum(JSON.stringify(item)).toString(36).replace(/[^A-Za-z0-9]/g, '');
    }
    /* eslint-disable no-bitwise */


    function checksum(str) {
      var hash = 0;
      var strlen = str.length;

      if (strlen === 0) {
        return hash;
      }

      for (var i = 0; i < strlen; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash &= hash; // Convert to 32bit integer
      }

      return hash;
    }

    function _typeof$1(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof$1 = function _typeof(obj) { return typeof obj; }; } else { _typeof$1 = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof$1(obj); }



    var isDefined = function isDefined(val) {
      return typeof val !== 'undefined';
    }; // Recursively merge/replace default serializers with user-specified serializers


    var mergeSerializers = function mergeSerializers(defaultSerializers, userSerializers) {
      return Object.keys(defaultSerializers).reduce(function (acc, key) {
        var type = _typeof$1(defaultSerializers[key]);

        if (type === 'function') {
          acc[key] = isDefined(userSerializers[key]) ? userSerializers[key] : defaultSerializers[key];
        } else if (type === 'object') {
          acc[key] = objectAssign({}, defaultSerializers[key], userSerializers[key]);
        } else {
          acc[key] = typeof userSerializers[key] === 'undefined' ? defaultSerializers[key] : userSerializers[key];
        }

        return acc;
      }, {});
    };

    // Properties to extract from props and pass to serializers as options


    var optionProps = ['projectId', 'dataset', 'imageOptions'];

    var isDefined$1 = function isDefined(val) {
      return typeof val !== 'undefined';
    };

    var defaults$1 = {
      imageOptions: {}
    };

    function blocksToNodes(h, properties, defaultSerializers, serializeSpan) {
      var props = objectAssign({}, defaults$1, properties);
      var rawBlocks = Array.isArray(props.blocks) ? props.blocks : [props.blocks];
      var keyedBlocks = generateKeys(rawBlocks);
      var blocks = nestLists_1(keyedBlocks, props.listNestMode);
      var serializers = mergeSerializers(defaultSerializers, props.serializers || {});
      var options = optionProps.reduce(function (opts, key) {
        var value = props[key];

        if (isDefined$1(value)) {
          opts[key] = value;
        }

        return opts;
      }, {});

      function serializeNode(node, index, siblings, isInline) {
        if (isList(node)) {
          return serializeList(node);
        }

        if (isListItem(node)) {
          return serializeListItem(node, findListItemIndex(node, siblings));
        }

        if (isSpan(node)) {
          return serializeSpan(node, serializers, index, {
            serializeNode: serializeNode
          });
        }

        return serializeBlock(node, index, isInline);
      }

      function findListItemIndex(node, siblings) {
        var index = 0;

        for (var i = 0; i < siblings.length; i++) {
          if (siblings[i] === node) {
            return index;
          }

          if (!isListItem(siblings[i])) {
            continue;
          }

          index++;
        }

        return index;
      }

      function serializeBlock(block, index, isInline) {
        var tree = buildMarksTree_1(block);
        var children = tree.map(function (node, i, siblings) {
          return serializeNode(node, i, siblings, true);
        });
        var blockProps = {
          key: block._key || "block-".concat(index),
          node: block,
          isInline: isInline,
          serializers: serializers,
          options: options
        };
        return h(serializers.block, blockProps, children);
      }

      function serializeListItem(block, index) {
        var key = block._key;
        var tree = buildMarksTree_1(block);
        var children = tree.map(serializeNode);
        return h(serializers.listItem, {
          node: block,
          serializers: serializers,
          index: index,
          key: key,
          options: options
        }, children);
      }

      function serializeList(list) {
        var type = list.listItem;
        var level = list.level;
        var key = list._key;
        var children = list.children.map(serializeNode);
        return h(serializers.list, {
          key: key,
          level: level,
          type: type,
          options: options
        }, children);
      } // Default to false, so `undefined` will evaluate to the default here


      var renderContainerOnSingleChild = Boolean(props.renderContainerOnSingleChild);
      var nodes = blocks.map(serializeNode);

      if (renderContainerOnSingleChild || nodes.length > 1) {
        var containerProps = props.className ? {
          className: props.className
        } : {};
        return h(serializers.container, containerProps, nodes);
      }

      if (nodes[0]) {
        return nodes[0];
      }

      return typeof serializers.empty === 'function' ? h(serializers.empty) : serializers.empty;
    }

    function isList(block) {
      return block._type === 'list' && block.listItem;
    }

    function isListItem(block) {
      return block._type === 'block' && block.listItem;
    }

    function isSpan(block) {
      return typeof block === 'string' || block.marks || block._type === 'span';
    }

    var blocksToNodes_1 = blocksToNodes;

    var serializers = function (h, serializerOpts) {
      var serializeOptions = serializerOpts || {
        useDashedStyles: false // Low-level block serializer

      };

      function BlockSerializer(props) {
        var node = props.node,
            serializers = props.serializers,
            options = props.options,
            isInline = props.isInline,
            children = props.children;
        var blockType = node._type;
        var serializer = serializers.types[blockType];

        if (!serializer) {
          throw new Error("Unknown block type \"".concat(blockType, "\", please specify a serializer for it in the `serializers.types` prop"));
        }

        return h(serializer, {
          node: node,
          options: options,
          isInline: isInline
        }, children);
      } // Low-level span serializer


      function SpanSerializer(props) {
        var _props$node = props.node,
            mark = _props$node.mark,
            children = _props$node.children;
        var isPlain = typeof mark === 'string';
        var markType = isPlain ? mark : mark._type;
        var serializer = props.serializers.marks[markType];

        if (!serializer) {
          // @todo Revert back to throwing errors?
          // eslint-disable-next-line no-console
          console.warn("Unknown mark type \"".concat(markType, "\", please specify a serializer for it in the `serializers.marks` prop"));
          return h(props.serializers.markFallback, null, children);
        }

        return h(serializer, props.node, children);
      } // Low-level list serializer


      function ListSerializer(props) {
        var tag = props.type === 'bullet' ? 'ul' : 'ol';
        return h(tag, null, props.children);
      } // Low-level list item serializer


      function ListItemSerializer(props) {
        var children = !props.node.style || props.node.style === 'normal' ? // Don't wrap plain text in paragraphs inside of a list item
        props.children : // But wrap any other style in whatever the block serializer says to use
        h(props.serializers.types.block, props, props.children);
        return h('li', null, children);
      } // Renderer of an actual block of type `block`. Confusing, we know.


      function BlockTypeSerializer(props) {
        var style = props.node.style || 'normal';

        if (/^h\d/.test(style)) {
          return h(style, null, props.children);
        }

        return style === 'blockquote' ? h('blockquote', null, props.children) : h('p', null, props.children);
      } // Serializers for things that can be directly attributed to a tag without any props
      // We use partial application to do this, passing the tag name as the first argument


      function RawMarkSerializer(tag, props) {
        return h(tag, null, props.children);
      }

      function UnderlineSerializer(props) {
        var style = serializeOptions.useDashedStyles ? {
          'text-decoration': 'underline'
        } : {
          textDecoration: 'underline'
        };
        return h('span', {
          style: style
        }, props.children);
      }

      function StrikeThroughSerializer(props) {
        return h('del', null, props.children);
      }

      function LinkSerializer(props) {
        return h('a', {
          href: props.mark.href
        }, props.children);
      }

      function ImageSerializer(props) {
        if (!props.node.asset) {
          return null;
        }

        var img = h('img', {
          src: getImageUrl(props)
        });
        return props.isInline ? img : h('figure', null, img);
      } // Serializer that recursively calls itself, producing a hyperscript tree of spans


      function serializeSpan(span, serializers, index, options) {
        if (span === '\n' && serializers.hardBreak) {
          return h(serializers.hardBreak, {
            key: "hb-".concat(index)
          });
        }

        if (typeof span === 'string') {
          return serializers.text ? h(serializers.text, {
            key: "text-".concat(index)
          }, span) : span;
        }

        var children;

        if (span.children) {
          children = {
            children: span.children.map(function (child, i) {
              return options.serializeNode(child, i, span.children, true);
            })
          };
        }

        var serializedNode = objectAssign({}, span, children);
        return h(serializers.span, {
          key: span._key || "span-".concat(index),
          node: serializedNode,
          serializers: serializers
        });
      }

      var HardBreakSerializer = function HardBreakSerializer() {
        return h('br');
      };

      var defaultMarkSerializers = {
        strong: RawMarkSerializer.bind(null, 'strong'),
        em: RawMarkSerializer.bind(null, 'em'),
        code: RawMarkSerializer.bind(null, 'code'),
        underline: UnderlineSerializer,
        'strike-through': StrikeThroughSerializer,
        link: LinkSerializer
      };
      var defaultSerializers = {
        // Common overrides
        types: {
          block: BlockTypeSerializer,
          image: ImageSerializer
        },
        marks: defaultMarkSerializers,
        // Less common overrides
        list: ListSerializer,
        listItem: ListItemSerializer,
        block: BlockSerializer,
        span: SpanSerializer,
        hardBreak: HardBreakSerializer,
        // Container element
        container: 'div',
        // When we can't resolve the mark properly, use this renderer as the container
        markFallback: 'span',
        // Allow overriding text renderer, but leave undefined to just use plain strings by default
        text: undefined,
        // Empty nodes (React uses null, hyperscript with empty strings)
        empty: ''
      };
      return {
        defaultSerializers: defaultSerializers,
        serializeSpan: serializeSpan
      };
    };

    var renderNode = function renderNode(serializer, properties, children) {
      var props = properties || {};

      if (typeof serializer === 'function') {
        return serializer(objectAssign({}, props, {
          children: children
        }));
      }

      var tag = serializer;
      var childNodes = props.children || children;
      return hyperscript(tag, props, childNodes);
    };

    var _getSerializers = serializers(renderNode, {
      useDashedStyles: true
    }),
        defaultSerializers = _getSerializers.defaultSerializers,
        serializeSpan = _getSerializers.serializeSpan;

    var blockContentToHyperscript = function blockContentToHyperscript(options) {
      return blocksToNodes_1(renderNode, options, defaultSerializers, serializeSpan);
    }; // Expose default serializers to the user


    blockContentToHyperscript.defaultSerializers = defaultSerializers; // Expose logic for building image URLs from an image reference/node

    blockContentToHyperscript.getImageUrl = getImageUrl; // Expose node renderer

    blockContentToHyperscript.renderNode = renderNode;
    var lib$1 = blockContentToHyperscript;

    var h = lib$1.renderNode;
    var blocksToHtml = function blocksToHtml(options) {
      var rootNode = lib$1(options);
      return rootNode.outerHTML || rootNode;
    };

    blocksToHtml.defaultSerializers = lib$1.defaultSerializers;
    blocksToHtml.getImageUrl = lib$1.getImageUrl;
    blocksToHtml.renderNode = h;
    blocksToHtml.h = h;

    var blocksToHtml_1 = blocksToHtml;

    const client = sanityClient({
      projectId: 'ylcal1e4',
      dataset: 'production',
      token: '', // or leave blank to be anonymous user
      useCdn: true // `false` if you want to ensure fresh data
    });

    const renderBlockText = text =>
      blocksToHtml_1({
        blocks: text,
        projectId: 'ylcal1e4',
        dataset: 'production'
      });

    const builder = imageUrl_umd(client);

    /**
     * Checks if `value` is classified as an `Array` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an array, else `false`.
     * @example
     *
     * _.isArray([1, 2, 3]);
     * // => true
     *
     * _.isArray(document.body.children);
     * // => false
     *
     * _.isArray('abc');
     * // => false
     *
     * _.isArray(_.noop);
     * // => false
     */
    var isArray$2 = Array.isArray;

    var isArray_1$1 = isArray$2;

    /** Detect free variable `global` from Node.js. */
    var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

    var _freeGlobal = freeGlobal;

    /** Detect free variable `self`. */
    var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

    /** Used as a reference to the global object. */
    var root = _freeGlobal || freeSelf || Function('return this')();

    var _root = root;

    /** Built-in value references. */
    var Symbol$1 = _root.Symbol;

    var _Symbol = Symbol$1;

    /** Used for built-in method references. */
    var objectProto = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$3 = objectProto.hasOwnProperty;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
     * of values.
     */
    var nativeObjectToString = objectProto.toString;

    /** Built-in value references. */
    var symToStringTag = _Symbol ? _Symbol.toStringTag : undefined;

    /**
     * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the raw `toStringTag`.
     */
    function getRawTag(value) {
      var isOwn = hasOwnProperty$3.call(value, symToStringTag),
          tag = value[symToStringTag];

      try {
        value[symToStringTag] = undefined;
        var unmasked = true;
      } catch (e) {}

      var result = nativeObjectToString.call(value);
      if (unmasked) {
        if (isOwn) {
          value[symToStringTag] = tag;
        } else {
          delete value[symToStringTag];
        }
      }
      return result;
    }

    var _getRawTag = getRawTag;

    /** Used for built-in method references. */
    var objectProto$1 = Object.prototype;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
     * of values.
     */
    var nativeObjectToString$1 = objectProto$1.toString;

    /**
     * Converts `value` to a string using `Object.prototype.toString`.
     *
     * @private
     * @param {*} value The value to convert.
     * @returns {string} Returns the converted string.
     */
    function objectToString(value) {
      return nativeObjectToString$1.call(value);
    }

    var _objectToString = objectToString;

    /** `Object#toString` result references. */
    var nullTag = '[object Null]',
        undefinedTag = '[object Undefined]';

    /** Built-in value references. */
    var symToStringTag$1 = _Symbol ? _Symbol.toStringTag : undefined;

    /**
     * The base implementation of `getTag` without fallbacks for buggy environments.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the `toStringTag`.
     */
    function baseGetTag(value) {
      if (value == null) {
        return value === undefined ? undefinedTag : nullTag;
      }
      return (symToStringTag$1 && symToStringTag$1 in Object(value))
        ? _getRawTag(value)
        : _objectToString(value);
    }

    var _baseGetTag = baseGetTag;

    /**
     * Checks if `value` is object-like. A value is object-like if it's not `null`
     * and has a `typeof` result of "object".
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
     * @example
     *
     * _.isObjectLike({});
     * // => true
     *
     * _.isObjectLike([1, 2, 3]);
     * // => true
     *
     * _.isObjectLike(_.noop);
     * // => false
     *
     * _.isObjectLike(null);
     * // => false
     */
    function isObjectLike(value) {
      return value != null && typeof value == 'object';
    }

    var isObjectLike_1 = isObjectLike;

    /** `Object#toString` result references. */
    var symbolTag = '[object Symbol]';

    /**
     * Checks if `value` is classified as a `Symbol` primitive or object.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
     * @example
     *
     * _.isSymbol(Symbol.iterator);
     * // => true
     *
     * _.isSymbol('abc');
     * // => false
     */
    function isSymbol(value) {
      return typeof value == 'symbol' ||
        (isObjectLike_1(value) && _baseGetTag(value) == symbolTag);
    }

    var isSymbol_1 = isSymbol;

    /** Used to match property names within property paths. */
    var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
        reIsPlainProp = /^\w*$/;

    /**
     * Checks if `value` is a property name and not a property path.
     *
     * @private
     * @param {*} value The value to check.
     * @param {Object} [object] The object to query keys on.
     * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
     */
    function isKey(value, object) {
      if (isArray_1$1(value)) {
        return false;
      }
      var type = typeof value;
      if (type == 'number' || type == 'symbol' || type == 'boolean' ||
          value == null || isSymbol_1(value)) {
        return true;
      }
      return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
        (object != null && value in Object(object));
    }

    var _isKey = isKey;

    /**
     * Checks if `value` is the
     * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
     * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an object, else `false`.
     * @example
     *
     * _.isObject({});
     * // => true
     *
     * _.isObject([1, 2, 3]);
     * // => true
     *
     * _.isObject(_.noop);
     * // => true
     *
     * _.isObject(null);
     * // => false
     */
    function isObject(value) {
      var type = typeof value;
      return value != null && (type == 'object' || type == 'function');
    }

    var isObject_1$1 = isObject;

    /** `Object#toString` result references. */
    var asyncTag = '[object AsyncFunction]',
        funcTag = '[object Function]',
        genTag = '[object GeneratorFunction]',
        proxyTag = '[object Proxy]';

    /**
     * Checks if `value` is classified as a `Function` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a function, else `false`.
     * @example
     *
     * _.isFunction(_);
     * // => true
     *
     * _.isFunction(/abc/);
     * // => false
     */
    function isFunction$1(value) {
      if (!isObject_1$1(value)) {
        return false;
      }
      // The use of `Object#toString` avoids issues with the `typeof` operator
      // in Safari 9 which returns 'object' for typed arrays and other constructors.
      var tag = _baseGetTag(value);
      return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
    }

    var isFunction_1$1 = isFunction$1;

    /** Used to detect overreaching core-js shims. */
    var coreJsData = _root['__core-js_shared__'];

    var _coreJsData = coreJsData;

    /** Used to detect methods masquerading as native. */
    var maskSrcKey = (function() {
      var uid = /[^.]+$/.exec(_coreJsData && _coreJsData.keys && _coreJsData.keys.IE_PROTO || '');
      return uid ? ('Symbol(src)_1.' + uid) : '';
    }());

    /**
     * Checks if `func` has its source masked.
     *
     * @private
     * @param {Function} func The function to check.
     * @returns {boolean} Returns `true` if `func` is masked, else `false`.
     */
    function isMasked(func) {
      return !!maskSrcKey && (maskSrcKey in func);
    }

    var _isMasked = isMasked;

    /** Used for built-in method references. */
    var funcProto = Function.prototype;

    /** Used to resolve the decompiled source of functions. */
    var funcToString = funcProto.toString;

    /**
     * Converts `func` to its source code.
     *
     * @private
     * @param {Function} func The function to convert.
     * @returns {string} Returns the source code.
     */
    function toSource(func) {
      if (func != null) {
        try {
          return funcToString.call(func);
        } catch (e) {}
        try {
          return (func + '');
        } catch (e) {}
      }
      return '';
    }

    var _toSource = toSource;

    /**
     * Used to match `RegExp`
     * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
     */
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

    /** Used to detect host constructors (Safari). */
    var reIsHostCtor = /^\[object .+?Constructor\]$/;

    /** Used for built-in method references. */
    var funcProto$1 = Function.prototype,
        objectProto$2 = Object.prototype;

    /** Used to resolve the decompiled source of functions. */
    var funcToString$1 = funcProto$1.toString;

    /** Used to check objects for own properties. */
    var hasOwnProperty$4 = objectProto$2.hasOwnProperty;

    /** Used to detect if a method is native. */
    var reIsNative = RegExp('^' +
      funcToString$1.call(hasOwnProperty$4).replace(reRegExpChar, '\\$&')
      .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
    );

    /**
     * The base implementation of `_.isNative` without bad shim checks.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a native function,
     *  else `false`.
     */
    function baseIsNative(value) {
      if (!isObject_1$1(value) || _isMasked(value)) {
        return false;
      }
      var pattern = isFunction_1$1(value) ? reIsNative : reIsHostCtor;
      return pattern.test(_toSource(value));
    }

    var _baseIsNative = baseIsNative;

    /**
     * Gets the value at `key` of `object`.
     *
     * @private
     * @param {Object} [object] The object to query.
     * @param {string} key The key of the property to get.
     * @returns {*} Returns the property value.
     */
    function getValue(object, key) {
      return object == null ? undefined : object[key];
    }

    var _getValue = getValue;

    /**
     * Gets the native function at `key` of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {string} key The key of the method to get.
     * @returns {*} Returns the function if it's native, else `undefined`.
     */
    function getNative(object, key) {
      var value = _getValue(object, key);
      return _baseIsNative(value) ? value : undefined;
    }

    var _getNative = getNative;

    /* Built-in method references that are verified to be native. */
    var nativeCreate = _getNative(Object, 'create');

    var _nativeCreate = nativeCreate;

    /**
     * Removes all key-value entries from the hash.
     *
     * @private
     * @name clear
     * @memberOf Hash
     */
    function hashClear() {
      this.__data__ = _nativeCreate ? _nativeCreate(null) : {};
      this.size = 0;
    }

    var _hashClear = hashClear;

    /**
     * Removes `key` and its value from the hash.
     *
     * @private
     * @name delete
     * @memberOf Hash
     * @param {Object} hash The hash to modify.
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function hashDelete(key) {
      var result = this.has(key) && delete this.__data__[key];
      this.size -= result ? 1 : 0;
      return result;
    }

    var _hashDelete = hashDelete;

    /** Used to stand-in for `undefined` hash values. */
    var HASH_UNDEFINED = '__lodash_hash_undefined__';

    /** Used for built-in method references. */
    var objectProto$3 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$5 = objectProto$3.hasOwnProperty;

    /**
     * Gets the hash value for `key`.
     *
     * @private
     * @name get
     * @memberOf Hash
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function hashGet(key) {
      var data = this.__data__;
      if (_nativeCreate) {
        var result = data[key];
        return result === HASH_UNDEFINED ? undefined : result;
      }
      return hasOwnProperty$5.call(data, key) ? data[key] : undefined;
    }

    var _hashGet = hashGet;

    /** Used for built-in method references. */
    var objectProto$4 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$6 = objectProto$4.hasOwnProperty;

    /**
     * Checks if a hash value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf Hash
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function hashHas(key) {
      var data = this.__data__;
      return _nativeCreate ? (data[key] !== undefined) : hasOwnProperty$6.call(data, key);
    }

    var _hashHas = hashHas;

    /** Used to stand-in for `undefined` hash values. */
    var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';

    /**
     * Sets the hash `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf Hash
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the hash instance.
     */
    function hashSet(key, value) {
      var data = this.__data__;
      this.size += this.has(key) ? 0 : 1;
      data[key] = (_nativeCreate && value === undefined) ? HASH_UNDEFINED$1 : value;
      return this;
    }

    var _hashSet = hashSet;

    /**
     * Creates a hash object.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function Hash(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    // Add methods to `Hash`.
    Hash.prototype.clear = _hashClear;
    Hash.prototype['delete'] = _hashDelete;
    Hash.prototype.get = _hashGet;
    Hash.prototype.has = _hashHas;
    Hash.prototype.set = _hashSet;

    var _Hash = Hash;

    /**
     * Removes all key-value entries from the list cache.
     *
     * @private
     * @name clear
     * @memberOf ListCache
     */
    function listCacheClear() {
      this.__data__ = [];
      this.size = 0;
    }

    var _listCacheClear = listCacheClear;

    /**
     * Performs a
     * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * comparison between two values to determine if they are equivalent.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     * @example
     *
     * var object = { 'a': 1 };
     * var other = { 'a': 1 };
     *
     * _.eq(object, object);
     * // => true
     *
     * _.eq(object, other);
     * // => false
     *
     * _.eq('a', 'a');
     * // => true
     *
     * _.eq('a', Object('a'));
     * // => false
     *
     * _.eq(NaN, NaN);
     * // => true
     */
    function eq(value, other) {
      return value === other || (value !== value && other !== other);
    }

    var eq_1 = eq;

    /**
     * Gets the index at which the `key` is found in `array` of key-value pairs.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {*} key The key to search for.
     * @returns {number} Returns the index of the matched value, else `-1`.
     */
    function assocIndexOf(array, key) {
      var length = array.length;
      while (length--) {
        if (eq_1(array[length][0], key)) {
          return length;
        }
      }
      return -1;
    }

    var _assocIndexOf = assocIndexOf;

    /** Used for built-in method references. */
    var arrayProto = Array.prototype;

    /** Built-in value references. */
    var splice = arrayProto.splice;

    /**
     * Removes `key` and its value from the list cache.
     *
     * @private
     * @name delete
     * @memberOf ListCache
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function listCacheDelete(key) {
      var data = this.__data__,
          index = _assocIndexOf(data, key);

      if (index < 0) {
        return false;
      }
      var lastIndex = data.length - 1;
      if (index == lastIndex) {
        data.pop();
      } else {
        splice.call(data, index, 1);
      }
      --this.size;
      return true;
    }

    var _listCacheDelete = listCacheDelete;

    /**
     * Gets the list cache value for `key`.
     *
     * @private
     * @name get
     * @memberOf ListCache
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function listCacheGet(key) {
      var data = this.__data__,
          index = _assocIndexOf(data, key);

      return index < 0 ? undefined : data[index][1];
    }

    var _listCacheGet = listCacheGet;

    /**
     * Checks if a list cache value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf ListCache
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function listCacheHas(key) {
      return _assocIndexOf(this.__data__, key) > -1;
    }

    var _listCacheHas = listCacheHas;

    /**
     * Sets the list cache `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf ListCache
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the list cache instance.
     */
    function listCacheSet(key, value) {
      var data = this.__data__,
          index = _assocIndexOf(data, key);

      if (index < 0) {
        ++this.size;
        data.push([key, value]);
      } else {
        data[index][1] = value;
      }
      return this;
    }

    var _listCacheSet = listCacheSet;

    /**
     * Creates an list cache object.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function ListCache(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    // Add methods to `ListCache`.
    ListCache.prototype.clear = _listCacheClear;
    ListCache.prototype['delete'] = _listCacheDelete;
    ListCache.prototype.get = _listCacheGet;
    ListCache.prototype.has = _listCacheHas;
    ListCache.prototype.set = _listCacheSet;

    var _ListCache = ListCache;

    /* Built-in method references that are verified to be native. */
    var Map$1 = _getNative(_root, 'Map');

    var _Map = Map$1;

    /**
     * Removes all key-value entries from the map.
     *
     * @private
     * @name clear
     * @memberOf MapCache
     */
    function mapCacheClear() {
      this.size = 0;
      this.__data__ = {
        'hash': new _Hash,
        'map': new (_Map || _ListCache),
        'string': new _Hash
      };
    }

    var _mapCacheClear = mapCacheClear;

    /**
     * Checks if `value` is suitable for use as unique object key.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
     */
    function isKeyable(value) {
      var type = typeof value;
      return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
        ? (value !== '__proto__')
        : (value === null);
    }

    var _isKeyable = isKeyable;

    /**
     * Gets the data for `map`.
     *
     * @private
     * @param {Object} map The map to query.
     * @param {string} key The reference key.
     * @returns {*} Returns the map data.
     */
    function getMapData(map, key) {
      var data = map.__data__;
      return _isKeyable(key)
        ? data[typeof key == 'string' ? 'string' : 'hash']
        : data.map;
    }

    var _getMapData = getMapData;

    /**
     * Removes `key` and its value from the map.
     *
     * @private
     * @name delete
     * @memberOf MapCache
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function mapCacheDelete(key) {
      var result = _getMapData(this, key)['delete'](key);
      this.size -= result ? 1 : 0;
      return result;
    }

    var _mapCacheDelete = mapCacheDelete;

    /**
     * Gets the map value for `key`.
     *
     * @private
     * @name get
     * @memberOf MapCache
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function mapCacheGet(key) {
      return _getMapData(this, key).get(key);
    }

    var _mapCacheGet = mapCacheGet;

    /**
     * Checks if a map value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf MapCache
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function mapCacheHas(key) {
      return _getMapData(this, key).has(key);
    }

    var _mapCacheHas = mapCacheHas;

    /**
     * Sets the map `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf MapCache
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the map cache instance.
     */
    function mapCacheSet(key, value) {
      var data = _getMapData(this, key),
          size = data.size;

      data.set(key, value);
      this.size += data.size == size ? 0 : 1;
      return this;
    }

    var _mapCacheSet = mapCacheSet;

    /**
     * Creates a map cache object to store key-value pairs.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function MapCache(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    // Add methods to `MapCache`.
    MapCache.prototype.clear = _mapCacheClear;
    MapCache.prototype['delete'] = _mapCacheDelete;
    MapCache.prototype.get = _mapCacheGet;
    MapCache.prototype.has = _mapCacheHas;
    MapCache.prototype.set = _mapCacheSet;

    var _MapCache = MapCache;

    /** Error message constants. */
    var FUNC_ERROR_TEXT = 'Expected a function';

    /**
     * Creates a function that memoizes the result of `func`. If `resolver` is
     * provided, it determines the cache key for storing the result based on the
     * arguments provided to the memoized function. By default, the first argument
     * provided to the memoized function is used as the map cache key. The `func`
     * is invoked with the `this` binding of the memoized function.
     *
     * **Note:** The cache is exposed as the `cache` property on the memoized
     * function. Its creation may be customized by replacing the `_.memoize.Cache`
     * constructor with one whose instances implement the
     * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
     * method interface of `clear`, `delete`, `get`, `has`, and `set`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Function
     * @param {Function} func The function to have its output memoized.
     * @param {Function} [resolver] The function to resolve the cache key.
     * @returns {Function} Returns the new memoized function.
     * @example
     *
     * var object = { 'a': 1, 'b': 2 };
     * var other = { 'c': 3, 'd': 4 };
     *
     * var values = _.memoize(_.values);
     * values(object);
     * // => [1, 2]
     *
     * values(other);
     * // => [3, 4]
     *
     * object.a = 2;
     * values(object);
     * // => [1, 2]
     *
     * // Modify the result cache.
     * values.cache.set(object, ['a', 'b']);
     * values(object);
     * // => ['a', 'b']
     *
     * // Replace `_.memoize.Cache`.
     * _.memoize.Cache = WeakMap;
     */
    function memoize(func, resolver) {
      if (typeof func != 'function' || (resolver != null && typeof resolver != 'function')) {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      var memoized = function() {
        var args = arguments,
            key = resolver ? resolver.apply(this, args) : args[0],
            cache = memoized.cache;

        if (cache.has(key)) {
          return cache.get(key);
        }
        var result = func.apply(this, args);
        memoized.cache = cache.set(key, result) || cache;
        return result;
      };
      memoized.cache = new (memoize.Cache || _MapCache);
      return memoized;
    }

    // Expose `MapCache`.
    memoize.Cache = _MapCache;

    var memoize_1 = memoize;

    /** Used as the maximum memoize cache size. */
    var MAX_MEMOIZE_SIZE = 500;

    /**
     * A specialized version of `_.memoize` which clears the memoized function's
     * cache when it exceeds `MAX_MEMOIZE_SIZE`.
     *
     * @private
     * @param {Function} func The function to have its output memoized.
     * @returns {Function} Returns the new memoized function.
     */
    function memoizeCapped(func) {
      var result = memoize_1(func, function(key) {
        if (cache.size === MAX_MEMOIZE_SIZE) {
          cache.clear();
        }
        return key;
      });

      var cache = result.cache;
      return result;
    }

    var _memoizeCapped = memoizeCapped;

    /** Used to match property names within property paths. */
    var rePropName$1 = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

    /** Used to match backslashes in property paths. */
    var reEscapeChar$1 = /\\(\\)?/g;

    /**
     * Converts `string` to a property path array.
     *
     * @private
     * @param {string} string The string to convert.
     * @returns {Array} Returns the property path array.
     */
    var stringToPath$1 = _memoizeCapped(function(string) {
      var result = [];
      if (string.charCodeAt(0) === 46 /* . */) {
        result.push('');
      }
      string.replace(rePropName$1, function(match, number, quote, subString) {
        result.push(quote ? subString.replace(reEscapeChar$1, '$1') : (number || match));
      });
      return result;
    });

    var _stringToPath = stringToPath$1;

    /**
     * A specialized version of `_.map` for arrays without support for iteratee
     * shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns the new mapped array.
     */
    function arrayMap(array, iteratee) {
      var index = -1,
          length = array == null ? 0 : array.length,
          result = Array(length);

      while (++index < length) {
        result[index] = iteratee(array[index], index, array);
      }
      return result;
    }

    var _arrayMap = arrayMap;

    /** Used as references for various `Number` constants. */
    var INFINITY = 1 / 0;

    /** Used to convert symbols to primitives and strings. */
    var symbolProto = _Symbol ? _Symbol.prototype : undefined,
        symbolToString = symbolProto ? symbolProto.toString : undefined;

    /**
     * The base implementation of `_.toString` which doesn't convert nullish
     * values to empty strings.
     *
     * @private
     * @param {*} value The value to process.
     * @returns {string} Returns the string.
     */
    function baseToString(value) {
      // Exit early for strings to avoid a performance hit in some environments.
      if (typeof value == 'string') {
        return value;
      }
      if (isArray_1$1(value)) {
        // Recursively convert values (susceptible to call stack limits).
        return _arrayMap(value, baseToString) + '';
      }
      if (isSymbol_1(value)) {
        return symbolToString ? symbolToString.call(value) : '';
      }
      var result = (value + '');
      return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
    }

    var _baseToString = baseToString;

    /**
     * Converts `value` to a string. An empty string is returned for `null`
     * and `undefined` values. The sign of `-0` is preserved.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to convert.
     * @returns {string} Returns the converted string.
     * @example
     *
     * _.toString(null);
     * // => ''
     *
     * _.toString(-0);
     * // => '-0'
     *
     * _.toString([1, 2, 3]);
     * // => '1,2,3'
     */
    function toString$1(value) {
      return value == null ? '' : _baseToString(value);
    }

    var toString_1 = toString$1;

    /**
     * Casts `value` to a path array if it's not one.
     *
     * @private
     * @param {*} value The value to inspect.
     * @param {Object} [object] The object to query keys on.
     * @returns {Array} Returns the cast property path array.
     */
    function castPath(value, object) {
      if (isArray_1$1(value)) {
        return value;
      }
      return _isKey(value, object) ? [value] : _stringToPath(toString_1(value));
    }

    var _castPath = castPath;

    /** Used as references for various `Number` constants. */
    var INFINITY$1 = 1 / 0;

    /**
     * Converts `value` to a string key if it's not a string or symbol.
     *
     * @private
     * @param {*} value The value to inspect.
     * @returns {string|symbol} Returns the key.
     */
    function toKey(value) {
      if (typeof value == 'string' || isSymbol_1(value)) {
        return value;
      }
      var result = (value + '');
      return (result == '0' && (1 / value) == -INFINITY$1) ? '-0' : result;
    }

    var _toKey = toKey;

    /**
     * The base implementation of `_.get` without support for default values.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Array|string} path The path of the property to get.
     * @returns {*} Returns the resolved value.
     */
    function baseGet(object, path) {
      path = _castPath(path, object);

      var index = 0,
          length = path.length;

      while (object != null && index < length) {
        object = object[_toKey(path[index++])];
      }
      return (index && index == length) ? object : undefined;
    }

    var _baseGet = baseGet;

    /**
     * Gets the value at `path` of `object`. If the resolved value is
     * `undefined`, the `defaultValue` is returned in its place.
     *
     * @static
     * @memberOf _
     * @since 3.7.0
     * @category Object
     * @param {Object} object The object to query.
     * @param {Array|string} path The path of the property to get.
     * @param {*} [defaultValue] The value returned for `undefined` resolved values.
     * @returns {*} Returns the resolved value.
     * @example
     *
     * var object = { 'a': [{ 'b': { 'c': 3 } }] };
     *
     * _.get(object, 'a[0].b.c');
     * // => 3
     *
     * _.get(object, ['a', '0', 'b', 'c']);
     * // => 3
     *
     * _.get(object, 'a.b.c', 'default');
     * // => 'default'
     */
    function get(object, path, defaultValue) {
      var result = object == null ? undefined : _baseGet(object, path);
      return result === undefined ? defaultValue : result;
    }

    var get_1 = get;

    /**
     * Gets the timestamp of the number of milliseconds that have elapsed since
     * the Unix epoch (1 January 1970 00:00:00 UTC).
     *
     * @static
     * @memberOf _
     * @since 2.4.0
     * @category Date
     * @returns {number} Returns the timestamp.
     * @example
     *
     * _.defer(function(stamp) {
     *   console.log(_.now() - stamp);
     * }, _.now());
     * // => Logs the number of milliseconds it took for the deferred invocation.
     */
    var now$1 = function() {
      return _root.Date.now();
    };

    var now_1 = now$1;

    /** Used as references for various `Number` constants. */
    var NAN = 0 / 0;

    /** Used to match leading and trailing whitespace. */
    var reTrim = /^\s+|\s+$/g;

    /** Used to detect bad signed hexadecimal string values. */
    var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

    /** Used to detect binary string values. */
    var reIsBinary = /^0b[01]+$/i;

    /** Used to detect octal string values. */
    var reIsOctal = /^0o[0-7]+$/i;

    /** Built-in method references without a dependency on `root`. */
    var freeParseInt = parseInt;

    /**
     * Converts `value` to a number.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to process.
     * @returns {number} Returns the number.
     * @example
     *
     * _.toNumber(3.2);
     * // => 3.2
     *
     * _.toNumber(Number.MIN_VALUE);
     * // => 5e-324
     *
     * _.toNumber(Infinity);
     * // => Infinity
     *
     * _.toNumber('3.2');
     * // => 3.2
     */
    function toNumber(value) {
      if (typeof value == 'number') {
        return value;
      }
      if (isSymbol_1(value)) {
        return NAN;
      }
      if (isObject_1$1(value)) {
        var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
        value = isObject_1$1(other) ? (other + '') : other;
      }
      if (typeof value != 'string') {
        return value === 0 ? value : +value;
      }
      value = value.replace(reTrim, '');
      var isBinary = reIsBinary.test(value);
      return (isBinary || reIsOctal.test(value))
        ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
        : (reIsBadHex.test(value) ? NAN : +value);
    }

    var toNumber_1 = toNumber;

    /** Error message constants. */
    var FUNC_ERROR_TEXT$1 = 'Expected a function';

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeMax = Math.max,
        nativeMin = Math.min;

    /**
     * Creates a debounced function that delays invoking `func` until after `wait`
     * milliseconds have elapsed since the last time the debounced function was
     * invoked. The debounced function comes with a `cancel` method to cancel
     * delayed `func` invocations and a `flush` method to immediately invoke them.
     * Provide `options` to indicate whether `func` should be invoked on the
     * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
     * with the last arguments provided to the debounced function. Subsequent
     * calls to the debounced function return the result of the last `func`
     * invocation.
     *
     * **Note:** If `leading` and `trailing` options are `true`, `func` is
     * invoked on the trailing edge of the timeout only if the debounced function
     * is invoked more than once during the `wait` timeout.
     *
     * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
     * until to the next tick, similar to `setTimeout` with a timeout of `0`.
     *
     * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
     * for details over the differences between `_.debounce` and `_.throttle`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Function
     * @param {Function} func The function to debounce.
     * @param {number} [wait=0] The number of milliseconds to delay.
     * @param {Object} [options={}] The options object.
     * @param {boolean} [options.leading=false]
     *  Specify invoking on the leading edge of the timeout.
     * @param {number} [options.maxWait]
     *  The maximum time `func` is allowed to be delayed before it's invoked.
     * @param {boolean} [options.trailing=true]
     *  Specify invoking on the trailing edge of the timeout.
     * @returns {Function} Returns the new debounced function.
     * @example
     *
     * // Avoid costly calculations while the window size is in flux.
     * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
     *
     * // Invoke `sendMail` when clicked, debouncing subsequent calls.
     * jQuery(element).on('click', _.debounce(sendMail, 300, {
     *   'leading': true,
     *   'trailing': false
     * }));
     *
     * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
     * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
     * var source = new EventSource('/stream');
     * jQuery(source).on('message', debounced);
     *
     * // Cancel the trailing debounced invocation.
     * jQuery(window).on('popstate', debounced.cancel);
     */
    function debounce(func, wait, options) {
      var lastArgs,
          lastThis,
          maxWait,
          result,
          timerId,
          lastCallTime,
          lastInvokeTime = 0,
          leading = false,
          maxing = false,
          trailing = true;

      if (typeof func != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT$1);
      }
      wait = toNumber_1(wait) || 0;
      if (isObject_1$1(options)) {
        leading = !!options.leading;
        maxing = 'maxWait' in options;
        maxWait = maxing ? nativeMax(toNumber_1(options.maxWait) || 0, wait) : maxWait;
        trailing = 'trailing' in options ? !!options.trailing : trailing;
      }

      function invokeFunc(time) {
        var args = lastArgs,
            thisArg = lastThis;

        lastArgs = lastThis = undefined;
        lastInvokeTime = time;
        result = func.apply(thisArg, args);
        return result;
      }

      function leadingEdge(time) {
        // Reset any `maxWait` timer.
        lastInvokeTime = time;
        // Start the timer for the trailing edge.
        timerId = setTimeout(timerExpired, wait);
        // Invoke the leading edge.
        return leading ? invokeFunc(time) : result;
      }

      function remainingWait(time) {
        var timeSinceLastCall = time - lastCallTime,
            timeSinceLastInvoke = time - lastInvokeTime,
            timeWaiting = wait - timeSinceLastCall;

        return maxing
          ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke)
          : timeWaiting;
      }

      function shouldInvoke(time) {
        var timeSinceLastCall = time - lastCallTime,
            timeSinceLastInvoke = time - lastInvokeTime;

        // Either this is the first call, activity has stopped and we're at the
        // trailing edge, the system time has gone backwards and we're treating
        // it as the trailing edge, or we've hit the `maxWait` limit.
        return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
          (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
      }

      function timerExpired() {
        var time = now_1();
        if (shouldInvoke(time)) {
          return trailingEdge(time);
        }
        // Restart the timer.
        timerId = setTimeout(timerExpired, remainingWait(time));
      }

      function trailingEdge(time) {
        timerId = undefined;

        // Only invoke if we have `lastArgs` which means `func` has been
        // debounced at least once.
        if (trailing && lastArgs) {
          return invokeFunc(time);
        }
        lastArgs = lastThis = undefined;
        return result;
      }

      function cancel() {
        if (timerId !== undefined) {
          clearTimeout(timerId);
        }
        lastInvokeTime = 0;
        lastArgs = lastCallTime = lastThis = timerId = undefined;
      }

      function flush() {
        return timerId === undefined ? result : trailingEdge(now_1());
      }

      function debounced() {
        var time = now_1(),
            isInvoking = shouldInvoke(time);

        lastArgs = arguments;
        lastThis = this;
        lastCallTime = time;

        if (isInvoking) {
          if (timerId === undefined) {
            return leadingEdge(lastCallTime);
          }
          if (maxing) {
            // Handle invocations in a tight loop.
            clearTimeout(timerId);
            timerId = setTimeout(timerExpired, wait);
            return invokeFunc(lastCallTime);
          }
        }
        if (timerId === undefined) {
          timerId = setTimeout(timerExpired, wait);
        }
        return result;
      }
      debounced.cancel = cancel;
      debounced.flush = flush;
      return debounced;
    }

    var debounce_1 = debounce;

    /** Error message constants. */
    var FUNC_ERROR_TEXT$2 = 'Expected a function';

    /**
     * Creates a throttled function that only invokes `func` at most once per
     * every `wait` milliseconds. The throttled function comes with a `cancel`
     * method to cancel delayed `func` invocations and a `flush` method to
     * immediately invoke them. Provide `options` to indicate whether `func`
     * should be invoked on the leading and/or trailing edge of the `wait`
     * timeout. The `func` is invoked with the last arguments provided to the
     * throttled function. Subsequent calls to the throttled function return the
     * result of the last `func` invocation.
     *
     * **Note:** If `leading` and `trailing` options are `true`, `func` is
     * invoked on the trailing edge of the timeout only if the throttled function
     * is invoked more than once during the `wait` timeout.
     *
     * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
     * until to the next tick, similar to `setTimeout` with a timeout of `0`.
     *
     * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
     * for details over the differences between `_.throttle` and `_.debounce`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Function
     * @param {Function} func The function to throttle.
     * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
     * @param {Object} [options={}] The options object.
     * @param {boolean} [options.leading=true]
     *  Specify invoking on the leading edge of the timeout.
     * @param {boolean} [options.trailing=true]
     *  Specify invoking on the trailing edge of the timeout.
     * @returns {Function} Returns the new throttled function.
     * @example
     *
     * // Avoid excessively updating the position while scrolling.
     * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
     *
     * // Invoke `renewToken` when the click event is fired, but not more than once every 5 minutes.
     * var throttled = _.throttle(renewToken, 300000, { 'trailing': false });
     * jQuery(element).on('click', throttled);
     *
     * // Cancel the trailing throttled invocation.
     * jQuery(window).on('popstate', throttled.cancel);
     */
    function throttle(func, wait, options) {
      var leading = true,
          trailing = true;

      if (typeof func != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT$2);
      }
      if (isObject_1$1(options)) {
        leading = 'leading' in options ? !!options.leading : leading;
        trailing = 'trailing' in options ? !!options.trailing : trailing;
      }
      return debounce_1(func, wait, {
        'leading': leading,
        'maxWait': wait,
        'trailing': trailing
      });
    }

    var throttle_1 = throttle;

    /**
     * The base implementation of methods like `_.max` and `_.min` which accepts a
     * `comparator` to determine the extremum value.
     *
     * @private
     * @param {Array} array The array to iterate over.
     * @param {Function} iteratee The iteratee invoked per iteration.
     * @param {Function} comparator The comparator used to compare values.
     * @returns {*} Returns the extremum value.
     */
    function baseExtremum(array, iteratee, comparator) {
      var index = -1,
          length = array.length;

      while (++index < length) {
        var value = array[index],
            current = iteratee(value);

        if (current != null && (computed === undefined
              ? (current === current && !isSymbol_1(current))
              : comparator(current, computed)
            )) {
          var computed = current,
              result = value;
        }
      }
      return result;
    }

    var _baseExtremum = baseExtremum;

    /**
     * The base implementation of `_.gt` which doesn't coerce arguments.
     *
     * @private
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {boolean} Returns `true` if `value` is greater than `other`,
     *  else `false`.
     */
    function baseGt(value, other) {
      return value > other;
    }

    var _baseGt = baseGt;

    /**
     * Removes all key-value entries from the stack.
     *
     * @private
     * @name clear
     * @memberOf Stack
     */
    function stackClear() {
      this.__data__ = new _ListCache;
      this.size = 0;
    }

    var _stackClear = stackClear;

    /**
     * Removes `key` and its value from the stack.
     *
     * @private
     * @name delete
     * @memberOf Stack
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function stackDelete(key) {
      var data = this.__data__,
          result = data['delete'](key);

      this.size = data.size;
      return result;
    }

    var _stackDelete = stackDelete;

    /**
     * Gets the stack value for `key`.
     *
     * @private
     * @name get
     * @memberOf Stack
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function stackGet(key) {
      return this.__data__.get(key);
    }

    var _stackGet = stackGet;

    /**
     * Checks if a stack value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf Stack
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function stackHas(key) {
      return this.__data__.has(key);
    }

    var _stackHas = stackHas;

    /** Used as the size to enable large array optimizations. */
    var LARGE_ARRAY_SIZE = 200;

    /**
     * Sets the stack `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf Stack
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the stack cache instance.
     */
    function stackSet(key, value) {
      var data = this.__data__;
      if (data instanceof _ListCache) {
        var pairs = data.__data__;
        if (!_Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
          pairs.push([key, value]);
          this.size = ++data.size;
          return this;
        }
        data = this.__data__ = new _MapCache(pairs);
      }
      data.set(key, value);
      this.size = data.size;
      return this;
    }

    var _stackSet = stackSet;

    /**
     * Creates a stack cache object to store key-value pairs.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function Stack(entries) {
      var data = this.__data__ = new _ListCache(entries);
      this.size = data.size;
    }

    // Add methods to `Stack`.
    Stack.prototype.clear = _stackClear;
    Stack.prototype['delete'] = _stackDelete;
    Stack.prototype.get = _stackGet;
    Stack.prototype.has = _stackHas;
    Stack.prototype.set = _stackSet;

    var _Stack = Stack;

    /** Used to stand-in for `undefined` hash values. */
    var HASH_UNDEFINED$2 = '__lodash_hash_undefined__';

    /**
     * Adds `value` to the array cache.
     *
     * @private
     * @name add
     * @memberOf SetCache
     * @alias push
     * @param {*} value The value to cache.
     * @returns {Object} Returns the cache instance.
     */
    function setCacheAdd(value) {
      this.__data__.set(value, HASH_UNDEFINED$2);
      return this;
    }

    var _setCacheAdd = setCacheAdd;

    /**
     * Checks if `value` is in the array cache.
     *
     * @private
     * @name has
     * @memberOf SetCache
     * @param {*} value The value to search for.
     * @returns {number} Returns `true` if `value` is found, else `false`.
     */
    function setCacheHas(value) {
      return this.__data__.has(value);
    }

    var _setCacheHas = setCacheHas;

    /**
     *
     * Creates an array cache object to store unique values.
     *
     * @private
     * @constructor
     * @param {Array} [values] The values to cache.
     */
    function SetCache(values) {
      var index = -1,
          length = values == null ? 0 : values.length;

      this.__data__ = new _MapCache;
      while (++index < length) {
        this.add(values[index]);
      }
    }

    // Add methods to `SetCache`.
    SetCache.prototype.add = SetCache.prototype.push = _setCacheAdd;
    SetCache.prototype.has = _setCacheHas;

    var _SetCache = SetCache;

    /**
     * A specialized version of `_.some` for arrays without support for iteratee
     * shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {boolean} Returns `true` if any element passes the predicate check,
     *  else `false`.
     */
    function arraySome(array, predicate) {
      var index = -1,
          length = array == null ? 0 : array.length;

      while (++index < length) {
        if (predicate(array[index], index, array)) {
          return true;
        }
      }
      return false;
    }

    var _arraySome = arraySome;

    /**
     * Checks if a `cache` value for `key` exists.
     *
     * @private
     * @param {Object} cache The cache to query.
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function cacheHas(cache, key) {
      return cache.has(key);
    }

    var _cacheHas = cacheHas;

    /** Used to compose bitmasks for value comparisons. */
    var COMPARE_PARTIAL_FLAG = 1,
        COMPARE_UNORDERED_FLAG = 2;

    /**
     * A specialized version of `baseIsEqualDeep` for arrays with support for
     * partial deep comparisons.
     *
     * @private
     * @param {Array} array The array to compare.
     * @param {Array} other The other array to compare.
     * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
     * @param {Function} customizer The function to customize comparisons.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Object} stack Tracks traversed `array` and `other` objects.
     * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
     */
    function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
          arrLength = array.length,
          othLength = other.length;

      if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
        return false;
      }
      // Assume cyclic values are equal.
      var stacked = stack.get(array);
      if (stacked && stack.get(other)) {
        return stacked == other;
      }
      var index = -1,
          result = true,
          seen = (bitmask & COMPARE_UNORDERED_FLAG) ? new _SetCache : undefined;

      stack.set(array, other);
      stack.set(other, array);

      // Ignore non-index properties.
      while (++index < arrLength) {
        var arrValue = array[index],
            othValue = other[index];

        if (customizer) {
          var compared = isPartial
            ? customizer(othValue, arrValue, index, other, array, stack)
            : customizer(arrValue, othValue, index, array, other, stack);
        }
        if (compared !== undefined) {
          if (compared) {
            continue;
          }
          result = false;
          break;
        }
        // Recursively compare arrays (susceptible to call stack limits).
        if (seen) {
          if (!_arraySome(other, function(othValue, othIndex) {
                if (!_cacheHas(seen, othIndex) &&
                    (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
                  return seen.push(othIndex);
                }
              })) {
            result = false;
            break;
          }
        } else if (!(
              arrValue === othValue ||
                equalFunc(arrValue, othValue, bitmask, customizer, stack)
            )) {
          result = false;
          break;
        }
      }
      stack['delete'](array);
      stack['delete'](other);
      return result;
    }

    var _equalArrays = equalArrays;

    /** Built-in value references. */
    var Uint8Array$1 = _root.Uint8Array;

    var _Uint8Array = Uint8Array$1;

    /**
     * Converts `map` to its key-value pairs.
     *
     * @private
     * @param {Object} map The map to convert.
     * @returns {Array} Returns the key-value pairs.
     */
    function mapToArray(map) {
      var index = -1,
          result = Array(map.size);

      map.forEach(function(value, key) {
        result[++index] = [key, value];
      });
      return result;
    }

    var _mapToArray = mapToArray;

    /**
     * Converts `set` to an array of its values.
     *
     * @private
     * @param {Object} set The set to convert.
     * @returns {Array} Returns the values.
     */
    function setToArray(set) {
      var index = -1,
          result = Array(set.size);

      set.forEach(function(value) {
        result[++index] = value;
      });
      return result;
    }

    var _setToArray = setToArray;

    /** Used to compose bitmasks for value comparisons. */
    var COMPARE_PARTIAL_FLAG$1 = 1,
        COMPARE_UNORDERED_FLAG$1 = 2;

    /** `Object#toString` result references. */
    var boolTag = '[object Boolean]',
        dateTag = '[object Date]',
        errorTag = '[object Error]',
        mapTag = '[object Map]',
        numberTag = '[object Number]',
        regexpTag = '[object RegExp]',
        setTag = '[object Set]',
        stringTag = '[object String]',
        symbolTag$1 = '[object Symbol]';

    var arrayBufferTag = '[object ArrayBuffer]',
        dataViewTag = '[object DataView]';

    /** Used to convert symbols to primitives and strings. */
    var symbolProto$1 = _Symbol ? _Symbol.prototype : undefined,
        symbolValueOf = symbolProto$1 ? symbolProto$1.valueOf : undefined;

    /**
     * A specialized version of `baseIsEqualDeep` for comparing objects of
     * the same `toStringTag`.
     *
     * **Note:** This function only supports comparing values with tags of
     * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
     *
     * @private
     * @param {Object} object The object to compare.
     * @param {Object} other The other object to compare.
     * @param {string} tag The `toStringTag` of the objects to compare.
     * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
     * @param {Function} customizer The function to customize comparisons.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Object} stack Tracks traversed `object` and `other` objects.
     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
     */
    function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
      switch (tag) {
        case dataViewTag:
          if ((object.byteLength != other.byteLength) ||
              (object.byteOffset != other.byteOffset)) {
            return false;
          }
          object = object.buffer;
          other = other.buffer;

        case arrayBufferTag:
          if ((object.byteLength != other.byteLength) ||
              !equalFunc(new _Uint8Array(object), new _Uint8Array(other))) {
            return false;
          }
          return true;

        case boolTag:
        case dateTag:
        case numberTag:
          // Coerce booleans to `1` or `0` and dates to milliseconds.
          // Invalid dates are coerced to `NaN`.
          return eq_1(+object, +other);

        case errorTag:
          return object.name == other.name && object.message == other.message;

        case regexpTag:
        case stringTag:
          // Coerce regexes to strings and treat strings, primitives and objects,
          // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
          // for more details.
          return object == (other + '');

        case mapTag:
          var convert = _mapToArray;

        case setTag:
          var isPartial = bitmask & COMPARE_PARTIAL_FLAG$1;
          convert || (convert = _setToArray);

          if (object.size != other.size && !isPartial) {
            return false;
          }
          // Assume cyclic values are equal.
          var stacked = stack.get(object);
          if (stacked) {
            return stacked == other;
          }
          bitmask |= COMPARE_UNORDERED_FLAG$1;

          // Recursively compare objects (susceptible to call stack limits).
          stack.set(object, other);
          var result = _equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
          stack['delete'](object);
          return result;

        case symbolTag$1:
          if (symbolValueOf) {
            return symbolValueOf.call(object) == symbolValueOf.call(other);
          }
      }
      return false;
    }

    var _equalByTag = equalByTag;

    /**
     * Appends the elements of `values` to `array`.
     *
     * @private
     * @param {Array} array The array to modify.
     * @param {Array} values The values to append.
     * @returns {Array} Returns `array`.
     */
    function arrayPush(array, values) {
      var index = -1,
          length = values.length,
          offset = array.length;

      while (++index < length) {
        array[offset + index] = values[index];
      }
      return array;
    }

    var _arrayPush = arrayPush;

    /**
     * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
     * `keysFunc` and `symbolsFunc` to get the enumerable property names and
     * symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Function} keysFunc The function to get the keys of `object`.
     * @param {Function} symbolsFunc The function to get the symbols of `object`.
     * @returns {Array} Returns the array of property names and symbols.
     */
    function baseGetAllKeys(object, keysFunc, symbolsFunc) {
      var result = keysFunc(object);
      return isArray_1$1(object) ? result : _arrayPush(result, symbolsFunc(object));
    }

    var _baseGetAllKeys = baseGetAllKeys;

    /**
     * A specialized version of `_.filter` for arrays without support for
     * iteratee shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {Array} Returns the new filtered array.
     */
    function arrayFilter(array, predicate) {
      var index = -1,
          length = array == null ? 0 : array.length,
          resIndex = 0,
          result = [];

      while (++index < length) {
        var value = array[index];
        if (predicate(value, index, array)) {
          result[resIndex++] = value;
        }
      }
      return result;
    }

    var _arrayFilter = arrayFilter;

    /**
     * This method returns a new empty array.
     *
     * @static
     * @memberOf _
     * @since 4.13.0
     * @category Util
     * @returns {Array} Returns the new empty array.
     * @example
     *
     * var arrays = _.times(2, _.stubArray);
     *
     * console.log(arrays);
     * // => [[], []]
     *
     * console.log(arrays[0] === arrays[1]);
     * // => false
     */
    function stubArray() {
      return [];
    }

    var stubArray_1 = stubArray;

    /** Used for built-in method references. */
    var objectProto$5 = Object.prototype;

    /** Built-in value references. */
    var propertyIsEnumerable = objectProto$5.propertyIsEnumerable;

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeGetSymbols = Object.getOwnPropertySymbols;

    /**
     * Creates an array of the own enumerable symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of symbols.
     */
    var getSymbols = !nativeGetSymbols ? stubArray_1 : function(object) {
      if (object == null) {
        return [];
      }
      object = Object(object);
      return _arrayFilter(nativeGetSymbols(object), function(symbol) {
        return propertyIsEnumerable.call(object, symbol);
      });
    };

    var _getSymbols = getSymbols;

    /**
     * The base implementation of `_.times` without support for iteratee shorthands
     * or max array length checks.
     *
     * @private
     * @param {number} n The number of times to invoke `iteratee`.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns the array of results.
     */
    function baseTimes(n, iteratee) {
      var index = -1,
          result = Array(n);

      while (++index < n) {
        result[index] = iteratee(index);
      }
      return result;
    }

    var _baseTimes = baseTimes;

    /** `Object#toString` result references. */
    var argsTag = '[object Arguments]';

    /**
     * The base implementation of `_.isArguments`.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an `arguments` object,
     */
    function baseIsArguments(value) {
      return isObjectLike_1(value) && _baseGetTag(value) == argsTag;
    }

    var _baseIsArguments = baseIsArguments;

    /** Used for built-in method references. */
    var objectProto$6 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$7 = objectProto$6.hasOwnProperty;

    /** Built-in value references. */
    var propertyIsEnumerable$1 = objectProto$6.propertyIsEnumerable;

    /**
     * Checks if `value` is likely an `arguments` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an `arguments` object,
     *  else `false`.
     * @example
     *
     * _.isArguments(function() { return arguments; }());
     * // => true
     *
     * _.isArguments([1, 2, 3]);
     * // => false
     */
    var isArguments$1 = _baseIsArguments(function() { return arguments; }()) ? _baseIsArguments : function(value) {
      return isObjectLike_1(value) && hasOwnProperty$7.call(value, 'callee') &&
        !propertyIsEnumerable$1.call(value, 'callee');
    };

    var isArguments_1 = isArguments$1;

    /**
     * This method returns `false`.
     *
     * @static
     * @memberOf _
     * @since 4.13.0
     * @category Util
     * @returns {boolean} Returns `false`.
     * @example
     *
     * _.times(2, _.stubFalse);
     * // => [false, false]
     */
    function stubFalse() {
      return false;
    }

    var stubFalse_1 = stubFalse;

    var isBuffer_1 = createCommonjsModule(function (module, exports) {
    /** Detect free variable `exports`. */
    var freeExports =  exports && !exports.nodeType && exports;

    /** Detect free variable `module`. */
    var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

    /** Detect the popular CommonJS extension `module.exports`. */
    var moduleExports = freeModule && freeModule.exports === freeExports;

    /** Built-in value references. */
    var Buffer = moduleExports ? _root.Buffer : undefined;

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

    /**
     * Checks if `value` is a buffer.
     *
     * @static
     * @memberOf _
     * @since 4.3.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
     * @example
     *
     * _.isBuffer(new Buffer(2));
     * // => true
     *
     * _.isBuffer(new Uint8Array(2));
     * // => false
     */
    var isBuffer = nativeIsBuffer || stubFalse_1;

    module.exports = isBuffer;
    });

    /** Used as references for various `Number` constants. */
    var MAX_SAFE_INTEGER = 9007199254740991;

    /** Used to detect unsigned integer values. */
    var reIsUint = /^(?:0|[1-9]\d*)$/;

    /**
     * Checks if `value` is a valid array-like index.
     *
     * @private
     * @param {*} value The value to check.
     * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
     * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
     */
    function isIndex(value, length) {
      var type = typeof value;
      length = length == null ? MAX_SAFE_INTEGER : length;

      return !!length &&
        (type == 'number' ||
          (type != 'symbol' && reIsUint.test(value))) &&
            (value > -1 && value % 1 == 0 && value < length);
    }

    var _isIndex = isIndex;

    /** Used as references for various `Number` constants. */
    var MAX_SAFE_INTEGER$1 = 9007199254740991;

    /**
     * Checks if `value` is a valid array-like length.
     *
     * **Note:** This method is loosely based on
     * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
     * @example
     *
     * _.isLength(3);
     * // => true
     *
     * _.isLength(Number.MIN_VALUE);
     * // => false
     *
     * _.isLength(Infinity);
     * // => false
     *
     * _.isLength('3');
     * // => false
     */
    function isLength(value) {
      return typeof value == 'number' &&
        value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER$1;
    }

    var isLength_1 = isLength;

    /** `Object#toString` result references. */
    var argsTag$1 = '[object Arguments]',
        arrayTag = '[object Array]',
        boolTag$1 = '[object Boolean]',
        dateTag$1 = '[object Date]',
        errorTag$1 = '[object Error]',
        funcTag$1 = '[object Function]',
        mapTag$1 = '[object Map]',
        numberTag$1 = '[object Number]',
        objectTag = '[object Object]',
        regexpTag$1 = '[object RegExp]',
        setTag$1 = '[object Set]',
        stringTag$1 = '[object String]',
        weakMapTag = '[object WeakMap]';

    var arrayBufferTag$1 = '[object ArrayBuffer]',
        dataViewTag$1 = '[object DataView]',
        float32Tag = '[object Float32Array]',
        float64Tag = '[object Float64Array]',
        int8Tag = '[object Int8Array]',
        int16Tag = '[object Int16Array]',
        int32Tag = '[object Int32Array]',
        uint8Tag = '[object Uint8Array]',
        uint8ClampedTag = '[object Uint8ClampedArray]',
        uint16Tag = '[object Uint16Array]',
        uint32Tag = '[object Uint32Array]';

    /** Used to identify `toStringTag` values of typed arrays. */
    var typedArrayTags = {};
    typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
    typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
    typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
    typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
    typedArrayTags[uint32Tag] = true;
    typedArrayTags[argsTag$1] = typedArrayTags[arrayTag] =
    typedArrayTags[arrayBufferTag$1] = typedArrayTags[boolTag$1] =
    typedArrayTags[dataViewTag$1] = typedArrayTags[dateTag$1] =
    typedArrayTags[errorTag$1] = typedArrayTags[funcTag$1] =
    typedArrayTags[mapTag$1] = typedArrayTags[numberTag$1] =
    typedArrayTags[objectTag] = typedArrayTags[regexpTag$1] =
    typedArrayTags[setTag$1] = typedArrayTags[stringTag$1] =
    typedArrayTags[weakMapTag] = false;

    /**
     * The base implementation of `_.isTypedArray` without Node.js optimizations.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
     */
    function baseIsTypedArray(value) {
      return isObjectLike_1(value) &&
        isLength_1(value.length) && !!typedArrayTags[_baseGetTag(value)];
    }

    var _baseIsTypedArray = baseIsTypedArray;

    /**
     * The base implementation of `_.unary` without support for storing metadata.
     *
     * @private
     * @param {Function} func The function to cap arguments for.
     * @returns {Function} Returns the new capped function.
     */
    function baseUnary(func) {
      return function(value) {
        return func(value);
      };
    }

    var _baseUnary = baseUnary;

    var _nodeUtil = createCommonjsModule(function (module, exports) {
    /** Detect free variable `exports`. */
    var freeExports =  exports && !exports.nodeType && exports;

    /** Detect free variable `module`. */
    var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

    /** Detect the popular CommonJS extension `module.exports`. */
    var moduleExports = freeModule && freeModule.exports === freeExports;

    /** Detect free variable `process` from Node.js. */
    var freeProcess = moduleExports && _freeGlobal.process;

    /** Used to access faster Node.js helpers. */
    var nodeUtil = (function() {
      try {
        // Use `util.types` for Node.js 10+.
        var types = freeModule && freeModule.require && freeModule.require('util').types;

        if (types) {
          return types;
        }

        // Legacy `process.binding('util')` for Node.js < 10.
        return freeProcess && freeProcess.binding && freeProcess.binding('util');
      } catch (e) {}
    }());

    module.exports = nodeUtil;
    });

    /* Node.js helper references. */
    var nodeIsTypedArray = _nodeUtil && _nodeUtil.isTypedArray;

    /**
     * Checks if `value` is classified as a typed array.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
     * @example
     *
     * _.isTypedArray(new Uint8Array);
     * // => true
     *
     * _.isTypedArray([]);
     * // => false
     */
    var isTypedArray = nodeIsTypedArray ? _baseUnary(nodeIsTypedArray) : _baseIsTypedArray;

    var isTypedArray_1 = isTypedArray;

    /** Used for built-in method references. */
    var objectProto$7 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$8 = objectProto$7.hasOwnProperty;

    /**
     * Creates an array of the enumerable property names of the array-like `value`.
     *
     * @private
     * @param {*} value The value to query.
     * @param {boolean} inherited Specify returning inherited property names.
     * @returns {Array} Returns the array of property names.
     */
    function arrayLikeKeys(value, inherited) {
      var isArr = isArray_1$1(value),
          isArg = !isArr && isArguments_1(value),
          isBuff = !isArr && !isArg && isBuffer_1(value),
          isType = !isArr && !isArg && !isBuff && isTypedArray_1(value),
          skipIndexes = isArr || isArg || isBuff || isType,
          result = skipIndexes ? _baseTimes(value.length, String) : [],
          length = result.length;

      for (var key in value) {
        if ((inherited || hasOwnProperty$8.call(value, key)) &&
            !(skipIndexes && (
               // Safari 9 has enumerable `arguments.length` in strict mode.
               key == 'length' ||
               // Node.js 0.10 has enumerable non-index properties on buffers.
               (isBuff && (key == 'offset' || key == 'parent')) ||
               // PhantomJS 2 has enumerable non-index properties on typed arrays.
               (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
               // Skip index properties.
               _isIndex(key, length)
            ))) {
          result.push(key);
        }
      }
      return result;
    }

    var _arrayLikeKeys = arrayLikeKeys;

    /** Used for built-in method references. */
    var objectProto$8 = Object.prototype;

    /**
     * Checks if `value` is likely a prototype object.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
     */
    function isPrototype(value) {
      var Ctor = value && value.constructor,
          proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$8;

      return value === proto;
    }

    var _isPrototype = isPrototype;

    /**
     * Creates a unary function that invokes `func` with its argument transformed.
     *
     * @private
     * @param {Function} func The function to wrap.
     * @param {Function} transform The argument transform.
     * @returns {Function} Returns the new function.
     */
    function overArg(func, transform) {
      return function(arg) {
        return func(transform(arg));
      };
    }

    var _overArg = overArg;

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeKeys = _overArg(Object.keys, Object);

    var _nativeKeys = nativeKeys;

    /** Used for built-in method references. */
    var objectProto$9 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$9 = objectProto$9.hasOwnProperty;

    /**
     * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     */
    function baseKeys(object) {
      if (!_isPrototype(object)) {
        return _nativeKeys(object);
      }
      var result = [];
      for (var key in Object(object)) {
        if (hasOwnProperty$9.call(object, key) && key != 'constructor') {
          result.push(key);
        }
      }
      return result;
    }

    var _baseKeys = baseKeys;

    /**
     * Checks if `value` is array-like. A value is considered array-like if it's
     * not a function and has a `value.length` that's an integer greater than or
     * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
     * @example
     *
     * _.isArrayLike([1, 2, 3]);
     * // => true
     *
     * _.isArrayLike(document.body.children);
     * // => true
     *
     * _.isArrayLike('abc');
     * // => true
     *
     * _.isArrayLike(_.noop);
     * // => false
     */
    function isArrayLike(value) {
      return value != null && isLength_1(value.length) && !isFunction_1$1(value);
    }

    var isArrayLike_1 = isArrayLike;

    /**
     * Creates an array of the own enumerable property names of `object`.
     *
     * **Note:** Non-object values are coerced to objects. See the
     * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
     * for more details.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.keys(new Foo);
     * // => ['a', 'b'] (iteration order is not guaranteed)
     *
     * _.keys('hi');
     * // => ['0', '1']
     */
    function keys(object) {
      return isArrayLike_1(object) ? _arrayLikeKeys(object) : _baseKeys(object);
    }

    var keys_1 = keys;

    /**
     * Creates an array of own enumerable property names and symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names and symbols.
     */
    function getAllKeys(object) {
      return _baseGetAllKeys(object, keys_1, _getSymbols);
    }

    var _getAllKeys = getAllKeys;

    /** Used to compose bitmasks for value comparisons. */
    var COMPARE_PARTIAL_FLAG$2 = 1;

    /** Used for built-in method references. */
    var objectProto$a = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$a = objectProto$a.hasOwnProperty;

    /**
     * A specialized version of `baseIsEqualDeep` for objects with support for
     * partial deep comparisons.
     *
     * @private
     * @param {Object} object The object to compare.
     * @param {Object} other The other object to compare.
     * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
     * @param {Function} customizer The function to customize comparisons.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Object} stack Tracks traversed `object` and `other` objects.
     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
     */
    function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG$2,
          objProps = _getAllKeys(object),
          objLength = objProps.length,
          othProps = _getAllKeys(other),
          othLength = othProps.length;

      if (objLength != othLength && !isPartial) {
        return false;
      }
      var index = objLength;
      while (index--) {
        var key = objProps[index];
        if (!(isPartial ? key in other : hasOwnProperty$a.call(other, key))) {
          return false;
        }
      }
      // Assume cyclic values are equal.
      var stacked = stack.get(object);
      if (stacked && stack.get(other)) {
        return stacked == other;
      }
      var result = true;
      stack.set(object, other);
      stack.set(other, object);

      var skipCtor = isPartial;
      while (++index < objLength) {
        key = objProps[index];
        var objValue = object[key],
            othValue = other[key];

        if (customizer) {
          var compared = isPartial
            ? customizer(othValue, objValue, key, other, object, stack)
            : customizer(objValue, othValue, key, object, other, stack);
        }
        // Recursively compare objects (susceptible to call stack limits).
        if (!(compared === undefined
              ? (objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack))
              : compared
            )) {
          result = false;
          break;
        }
        skipCtor || (skipCtor = key == 'constructor');
      }
      if (result && !skipCtor) {
        var objCtor = object.constructor,
            othCtor = other.constructor;

        // Non `Object` object instances with different constructors are not equal.
        if (objCtor != othCtor &&
            ('constructor' in object && 'constructor' in other) &&
            !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
              typeof othCtor == 'function' && othCtor instanceof othCtor)) {
          result = false;
        }
      }
      stack['delete'](object);
      stack['delete'](other);
      return result;
    }

    var _equalObjects = equalObjects;

    /* Built-in method references that are verified to be native. */
    var DataView$1 = _getNative(_root, 'DataView');

    var _DataView = DataView$1;

    /* Built-in method references that are verified to be native. */
    var Promise$1 = _getNative(_root, 'Promise');

    var _Promise = Promise$1;

    /* Built-in method references that are verified to be native. */
    var Set$1 = _getNative(_root, 'Set');

    var _Set = Set$1;

    /* Built-in method references that are verified to be native. */
    var WeakMap$1 = _getNative(_root, 'WeakMap');

    var _WeakMap = WeakMap$1;

    /** `Object#toString` result references. */
    var mapTag$2 = '[object Map]',
        objectTag$1 = '[object Object]',
        promiseTag = '[object Promise]',
        setTag$2 = '[object Set]',
        weakMapTag$1 = '[object WeakMap]';

    var dataViewTag$2 = '[object DataView]';

    /** Used to detect maps, sets, and weakmaps. */
    var dataViewCtorString = _toSource(_DataView),
        mapCtorString = _toSource(_Map),
        promiseCtorString = _toSource(_Promise),
        setCtorString = _toSource(_Set),
        weakMapCtorString = _toSource(_WeakMap);

    /**
     * Gets the `toStringTag` of `value`.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the `toStringTag`.
     */
    var getTag = _baseGetTag;

    // Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
    if ((_DataView && getTag(new _DataView(new ArrayBuffer(1))) != dataViewTag$2) ||
        (_Map && getTag(new _Map) != mapTag$2) ||
        (_Promise && getTag(_Promise.resolve()) != promiseTag) ||
        (_Set && getTag(new _Set) != setTag$2) ||
        (_WeakMap && getTag(new _WeakMap) != weakMapTag$1)) {
      getTag = function(value) {
        var result = _baseGetTag(value),
            Ctor = result == objectTag$1 ? value.constructor : undefined,
            ctorString = Ctor ? _toSource(Ctor) : '';

        if (ctorString) {
          switch (ctorString) {
            case dataViewCtorString: return dataViewTag$2;
            case mapCtorString: return mapTag$2;
            case promiseCtorString: return promiseTag;
            case setCtorString: return setTag$2;
            case weakMapCtorString: return weakMapTag$1;
          }
        }
        return result;
      };
    }

    var _getTag = getTag;

    /** Used to compose bitmasks for value comparisons. */
    var COMPARE_PARTIAL_FLAG$3 = 1;

    /** `Object#toString` result references. */
    var argsTag$2 = '[object Arguments]',
        arrayTag$1 = '[object Array]',
        objectTag$2 = '[object Object]';

    /** Used for built-in method references. */
    var objectProto$b = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$b = objectProto$b.hasOwnProperty;

    /**
     * A specialized version of `baseIsEqual` for arrays and objects which performs
     * deep comparisons and tracks traversed objects enabling objects with circular
     * references to be compared.
     *
     * @private
     * @param {Object} object The object to compare.
     * @param {Object} other The other object to compare.
     * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
     * @param {Function} customizer The function to customize comparisons.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Object} [stack] Tracks traversed `object` and `other` objects.
     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
     */
    function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
      var objIsArr = isArray_1$1(object),
          othIsArr = isArray_1$1(other),
          objTag = objIsArr ? arrayTag$1 : _getTag(object),
          othTag = othIsArr ? arrayTag$1 : _getTag(other);

      objTag = objTag == argsTag$2 ? objectTag$2 : objTag;
      othTag = othTag == argsTag$2 ? objectTag$2 : othTag;

      var objIsObj = objTag == objectTag$2,
          othIsObj = othTag == objectTag$2,
          isSameTag = objTag == othTag;

      if (isSameTag && isBuffer_1(object)) {
        if (!isBuffer_1(other)) {
          return false;
        }
        objIsArr = true;
        objIsObj = false;
      }
      if (isSameTag && !objIsObj) {
        stack || (stack = new _Stack);
        return (objIsArr || isTypedArray_1(object))
          ? _equalArrays(object, other, bitmask, customizer, equalFunc, stack)
          : _equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
      }
      if (!(bitmask & COMPARE_PARTIAL_FLAG$3)) {
        var objIsWrapped = objIsObj && hasOwnProperty$b.call(object, '__wrapped__'),
            othIsWrapped = othIsObj && hasOwnProperty$b.call(other, '__wrapped__');

        if (objIsWrapped || othIsWrapped) {
          var objUnwrapped = objIsWrapped ? object.value() : object,
              othUnwrapped = othIsWrapped ? other.value() : other;

          stack || (stack = new _Stack);
          return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
        }
      }
      if (!isSameTag) {
        return false;
      }
      stack || (stack = new _Stack);
      return _equalObjects(object, other, bitmask, customizer, equalFunc, stack);
    }

    var _baseIsEqualDeep = baseIsEqualDeep;

    /**
     * The base implementation of `_.isEqual` which supports partial comparisons
     * and tracks traversed objects.
     *
     * @private
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @param {boolean} bitmask The bitmask flags.
     *  1 - Unordered comparison
     *  2 - Partial comparison
     * @param {Function} [customizer] The function to customize comparisons.
     * @param {Object} [stack] Tracks traversed `value` and `other` objects.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     */
    function baseIsEqual(value, other, bitmask, customizer, stack) {
      if (value === other) {
        return true;
      }
      if (value == null || other == null || (!isObjectLike_1(value) && !isObjectLike_1(other))) {
        return value !== value && other !== other;
      }
      return _baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
    }

    var _baseIsEqual = baseIsEqual;

    /** Used to compose bitmasks for value comparisons. */
    var COMPARE_PARTIAL_FLAG$4 = 1,
        COMPARE_UNORDERED_FLAG$2 = 2;

    /**
     * The base implementation of `_.isMatch` without support for iteratee shorthands.
     *
     * @private
     * @param {Object} object The object to inspect.
     * @param {Object} source The object of property values to match.
     * @param {Array} matchData The property names, values, and compare flags to match.
     * @param {Function} [customizer] The function to customize comparisons.
     * @returns {boolean} Returns `true` if `object` is a match, else `false`.
     */
    function baseIsMatch(object, source, matchData, customizer) {
      var index = matchData.length,
          length = index,
          noCustomizer = !customizer;

      if (object == null) {
        return !length;
      }
      object = Object(object);
      while (index--) {
        var data = matchData[index];
        if ((noCustomizer && data[2])
              ? data[1] !== object[data[0]]
              : !(data[0] in object)
            ) {
          return false;
        }
      }
      while (++index < length) {
        data = matchData[index];
        var key = data[0],
            objValue = object[key],
            srcValue = data[1];

        if (noCustomizer && data[2]) {
          if (objValue === undefined && !(key in object)) {
            return false;
          }
        } else {
          var stack = new _Stack;
          if (customizer) {
            var result = customizer(objValue, srcValue, key, object, source, stack);
          }
          if (!(result === undefined
                ? _baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG$4 | COMPARE_UNORDERED_FLAG$2, customizer, stack)
                : result
              )) {
            return false;
          }
        }
      }
      return true;
    }

    var _baseIsMatch = baseIsMatch;

    /**
     * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` if suitable for strict
     *  equality comparisons, else `false`.
     */
    function isStrictComparable(value) {
      return value === value && !isObject_1$1(value);
    }

    var _isStrictComparable = isStrictComparable;

    /**
     * Gets the property names, values, and compare flags of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the match data of `object`.
     */
    function getMatchData(object) {
      var result = keys_1(object),
          length = result.length;

      while (length--) {
        var key = result[length],
            value = object[key];

        result[length] = [key, value, _isStrictComparable(value)];
      }
      return result;
    }

    var _getMatchData = getMatchData;

    /**
     * A specialized version of `matchesProperty` for source values suitable
     * for strict equality comparisons, i.e. `===`.
     *
     * @private
     * @param {string} key The key of the property to get.
     * @param {*} srcValue The value to match.
     * @returns {Function} Returns the new spec function.
     */
    function matchesStrictComparable(key, srcValue) {
      return function(object) {
        if (object == null) {
          return false;
        }
        return object[key] === srcValue &&
          (srcValue !== undefined || (key in Object(object)));
      };
    }

    var _matchesStrictComparable = matchesStrictComparable;

    /**
     * The base implementation of `_.matches` which doesn't clone `source`.
     *
     * @private
     * @param {Object} source The object of property values to match.
     * @returns {Function} Returns the new spec function.
     */
    function baseMatches(source) {
      var matchData = _getMatchData(source);
      if (matchData.length == 1 && matchData[0][2]) {
        return _matchesStrictComparable(matchData[0][0], matchData[0][1]);
      }
      return function(object) {
        return object === source || _baseIsMatch(object, source, matchData);
      };
    }

    var _baseMatches = baseMatches;

    /**
     * The base implementation of `_.hasIn` without support for deep paths.
     *
     * @private
     * @param {Object} [object] The object to query.
     * @param {Array|string} key The key to check.
     * @returns {boolean} Returns `true` if `key` exists, else `false`.
     */
    function baseHasIn(object, key) {
      return object != null && key in Object(object);
    }

    var _baseHasIn = baseHasIn;

    /**
     * Checks if `path` exists on `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Array|string} path The path to check.
     * @param {Function} hasFunc The function to check properties.
     * @returns {boolean} Returns `true` if `path` exists, else `false`.
     */
    function hasPath(object, path, hasFunc) {
      path = _castPath(path, object);

      var index = -1,
          length = path.length,
          result = false;

      while (++index < length) {
        var key = _toKey(path[index]);
        if (!(result = object != null && hasFunc(object, key))) {
          break;
        }
        object = object[key];
      }
      if (result || ++index != length) {
        return result;
      }
      length = object == null ? 0 : object.length;
      return !!length && isLength_1(length) && _isIndex(key, length) &&
        (isArray_1$1(object) || isArguments_1(object));
    }

    var _hasPath = hasPath;

    /**
     * Checks if `path` is a direct or inherited property of `object`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Object
     * @param {Object} object The object to query.
     * @param {Array|string} path The path to check.
     * @returns {boolean} Returns `true` if `path` exists, else `false`.
     * @example
     *
     * var object = _.create({ 'a': _.create({ 'b': 2 }) });
     *
     * _.hasIn(object, 'a');
     * // => true
     *
     * _.hasIn(object, 'a.b');
     * // => true
     *
     * _.hasIn(object, ['a', 'b']);
     * // => true
     *
     * _.hasIn(object, 'b');
     * // => false
     */
    function hasIn(object, path) {
      return object != null && _hasPath(object, path, _baseHasIn);
    }

    var hasIn_1 = hasIn;

    /** Used to compose bitmasks for value comparisons. */
    var COMPARE_PARTIAL_FLAG$5 = 1,
        COMPARE_UNORDERED_FLAG$3 = 2;

    /**
     * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
     *
     * @private
     * @param {string} path The path of the property to get.
     * @param {*} srcValue The value to match.
     * @returns {Function} Returns the new spec function.
     */
    function baseMatchesProperty(path, srcValue) {
      if (_isKey(path) && _isStrictComparable(srcValue)) {
        return _matchesStrictComparable(_toKey(path), srcValue);
      }
      return function(object) {
        var objValue = get_1(object, path);
        return (objValue === undefined && objValue === srcValue)
          ? hasIn_1(object, path)
          : _baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG$5 | COMPARE_UNORDERED_FLAG$3);
      };
    }

    var _baseMatchesProperty = baseMatchesProperty;

    /**
     * This method returns the first argument it receives.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Util
     * @param {*} value Any value.
     * @returns {*} Returns `value`.
     * @example
     *
     * var object = { 'a': 1 };
     *
     * console.log(_.identity(object) === object);
     * // => true
     */
    function identity$1(value) {
      return value;
    }

    var identity_1 = identity$1;

    /**
     * The base implementation of `_.property` without support for deep paths.
     *
     * @private
     * @param {string} key The key of the property to get.
     * @returns {Function} Returns the new accessor function.
     */
    function baseProperty(key) {
      return function(object) {
        return object == null ? undefined : object[key];
      };
    }

    var _baseProperty = baseProperty;

    /**
     * A specialized version of `baseProperty` which supports deep paths.
     *
     * @private
     * @param {Array|string} path The path of the property to get.
     * @returns {Function} Returns the new accessor function.
     */
    function basePropertyDeep(path) {
      return function(object) {
        return _baseGet(object, path);
      };
    }

    var _basePropertyDeep = basePropertyDeep;

    /**
     * Creates a function that returns the value at `path` of a given object.
     *
     * @static
     * @memberOf _
     * @since 2.4.0
     * @category Util
     * @param {Array|string} path The path of the property to get.
     * @returns {Function} Returns the new accessor function.
     * @example
     *
     * var objects = [
     *   { 'a': { 'b': 2 } },
     *   { 'a': { 'b': 1 } }
     * ];
     *
     * _.map(objects, _.property('a.b'));
     * // => [2, 1]
     *
     * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
     * // => [1, 2]
     */
    function property(path) {
      return _isKey(path) ? _baseProperty(_toKey(path)) : _basePropertyDeep(path);
    }

    var property_1 = property;

    /**
     * The base implementation of `_.iteratee`.
     *
     * @private
     * @param {*} [value=_.identity] The value to convert to an iteratee.
     * @returns {Function} Returns the iteratee.
     */
    function baseIteratee(value) {
      // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
      // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
      if (typeof value == 'function') {
        return value;
      }
      if (value == null) {
        return identity_1;
      }
      if (typeof value == 'object') {
        return isArray_1$1(value)
          ? _baseMatchesProperty(value[0], value[1])
          : _baseMatches(value);
      }
      return property_1(value);
    }

    var _baseIteratee = baseIteratee;

    /**
     * This method is like `_.max` except that it accepts `iteratee` which is
     * invoked for each element in `array` to generate the criterion by which
     * the value is ranked. The iteratee is invoked with one argument: (value).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Math
     * @param {Array} array The array to iterate over.
     * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
     * @returns {*} Returns the maximum value.
     * @example
     *
     * var objects = [{ 'n': 1 }, { 'n': 2 }];
     *
     * _.maxBy(objects, function(o) { return o.n; });
     * // => { 'n': 2 }
     *
     * // The `_.property` iteratee shorthand.
     * _.maxBy(objects, 'n');
     * // => { 'n': 2 }
     */
    function maxBy(array, iteratee) {
      return (array && array.length)
        ? _baseExtremum(array, _baseIteratee(iteratee), _baseGt)
        : undefined;
    }

    var maxBy_1 = maxBy;

    var lodash_min = createCommonjsModule(function (module, exports) {
    (function(){function n(n,t,r){switch(r.length){case 0:return n.call(t);case 1:return n.call(t,r[0]);case 2:return n.call(t,r[0],r[1]);case 3:return n.call(t,r[0],r[1],r[2])}return n.apply(t,r)}function t(n,t,r,e){for(var u=-1,i=null==n?0:n.length;++u<i;){var o=n[u];t(e,o,r(o),n);}return e}function r(n,t){for(var r=-1,e=null==n?0:n.length;++r<e&&false!==t(n[r],r,n););return n}function e(n,t){for(var r=null==n?0:n.length;r--&&false!==t(n[r],r,n););return n}function u(n,t){for(var r=-1,e=null==n?0:n.length;++r<e;)if(!t(n[r],r,n))return false;
    return true}function i(n,t){for(var r=-1,e=null==n?0:n.length,u=0,i=[];++r<e;){var o=n[r];t(o,r,n)&&(i[u++]=o);}return i}function o(n,t){return !(null==n||!n.length)&&-1<v(n,t,0)}function f(n,t,r){for(var e=-1,u=null==n?0:n.length;++e<u;)if(r(t,n[e]))return true;return false}function c(n,t){for(var r=-1,e=null==n?0:n.length,u=Array(e);++r<e;)u[r]=t(n[r],r,n);return u}function a(n,t){for(var r=-1,e=t.length,u=n.length;++r<e;)n[u+r]=t[r];return n}function l(n,t,r,e){var u=-1,i=null==n?0:n.length;for(e&&i&&(r=n[++u]);++u<i;)r=t(r,n[u],u,n);
    return r}function s(n,t,r,e){var u=null==n?0:n.length;for(e&&u&&(r=n[--u]);u--;)r=t(r,n[u],u,n);return r}function h(n,t){for(var r=-1,e=null==n?0:n.length;++r<e;)if(t(n[r],r,n))return true;return false}function p(n,t,r){var e;return r(n,function(n,r,u){if(t(n,r,u))return e=r,false}),e}function _(n,t,r,e){var u=n.length;for(r+=e?1:-1;e?r--:++r<u;)if(t(n[r],r,n))return r;return -1}function v(n,t,r){if(t===t)n:{--r;for(var e=n.length;++r<e;)if(n[r]===t){n=r;break n}n=-1;}else n=_(n,d,r);return n}function g(n,t,r,e){
    --r;for(var u=n.length;++r<u;)if(e(n[r],t))return r;return -1}function d(n){return n!==n}function y(n,t){var r=null==n?0:n.length;return r?m(n,t)/r:F}function b(n){return function(t){return null==t?T:t[n]}}function x(n){return function(t){return null==n?T:n[t]}}function j(n,t,r,e,u){return u(n,function(n,u,i){r=e?(e=false,n):t(r,n,u,i);}),r}function w(n,t){var r=n.length;for(n.sort(t);r--;)n[r]=n[r].c;return n}function m(n,t){for(var r,e=-1,u=n.length;++e<u;){var i=t(n[e]);i!==T&&(r=r===T?i:r+i);}return r;
    }function A(n,t){for(var r=-1,e=Array(n);++r<n;)e[r]=t(r);return e}function E(n,t){return c(t,function(t){return [t,n[t]]})}function k(n){return function(t){return n(t)}}function S(n,t){return c(t,function(t){return n[t]})}function O(n,t){return n.has(t)}function I(n,t){for(var r=-1,e=n.length;++r<e&&-1<v(t,n[r],0););return r}function R(n,t){for(var r=n.length;r--&&-1<v(t,n[r],0););return r}function z(n){return "\\"+Un[n]}function W(n){var t=-1,r=Array(n.size);return n.forEach(function(n,e){r[++t]=[e,n];
    }),r}function B(n,t){return function(r){return n(t(r))}}function L(n,t){for(var r=-1,e=n.length,u=0,i=[];++r<e;){var o=n[r];o!==t&&"__lodash_placeholder__"!==o||(n[r]="__lodash_placeholder__",i[u++]=r);}return i}function U(n){var t=-1,r=Array(n.size);return n.forEach(function(n){r[++t]=n;}),r}function C(n){var t=-1,r=Array(n.size);return n.forEach(function(n){r[++t]=[n,n];}),r}function D(n){if(Rn.test(n)){for(var t=On.lastIndex=0;On.test(n);)++t;n=t;}else n=Qn(n);return n}function M(n){return Rn.test(n)?n.match(On)||[]:n.split("");
    }var T,$=1/0,F=NaN,N=[["ary",128],["bind",1],["bindKey",2],["curry",8],["curryRight",16],["flip",512],["partial",32],["partialRight",64],["rearg",256]],P=/\b__p\+='';/g,Z=/\b(__p\+=)''\+/g,q=/(__e\(.*?\)|\b__t\))\+'';/g,V=/&(?:amp|lt|gt|quot|#39);/g,K=/[&<>"']/g,G=RegExp(V.source),H=RegExp(K.source),J=/<%-([\s\S]+?)%>/g,Y=/<%([\s\S]+?)%>/g,Q=/<%=([\s\S]+?)%>/g,X=/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,nn=/^\w*$/,tn=/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,rn=/[\\^$.*+?()[\]{}|]/g,en=RegExp(rn.source),un=/^\s+|\s+$/g,on=/^\s+/,fn=/\s+$/,cn=/\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/,an=/\{\n\/\* \[wrapped with (.+)\] \*/,ln=/,? & /,sn=/[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g,hn=/\\(\\)?/g,pn=/\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g,_n=/\w*$/,vn=/^[-+]0x[0-9a-f]+$/i,gn=/^0b[01]+$/i,dn=/^\[object .+?Constructor\]$/,yn=/^0o[0-7]+$/i,bn=/^(?:0|[1-9]\d*)$/,xn=/[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g,jn=/($^)/,wn=/['\n\r\u2028\u2029\\]/g,mn="[\\ufe0e\\ufe0f]?(?:[\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff]|\\ud83c[\\udffb-\\udfff])?(?:\\u200d(?:[^\\ud800-\\udfff]|(?:\\ud83c[\\udde6-\\uddff]){2}|[\\ud800-\\udbff][\\udc00-\\udfff])[\\ufe0e\\ufe0f]?(?:[\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff]|\\ud83c[\\udffb-\\udfff])?)*",An="(?:[\\u2700-\\u27bf]|(?:\\ud83c[\\udde6-\\uddff]){2}|[\\ud800-\\udbff][\\udc00-\\udfff])"+mn,En="(?:[^\\ud800-\\udfff][\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff]?|[\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff]|(?:\\ud83c[\\udde6-\\uddff]){2}|[\\ud800-\\udbff][\\udc00-\\udfff]|[\\ud800-\\udfff])",kn=RegExp("['\u2019]","g"),Sn=RegExp("[\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff]","g"),On=RegExp("\\ud83c[\\udffb-\\udfff](?=\\ud83c[\\udffb-\\udfff])|"+En+mn,"g"),In=RegExp(["[A-Z\\xc0-\\xd6\\xd8-\\xde]?[a-z\\xdf-\\xf6\\xf8-\\xff]+(?:['\u2019](?:d|ll|m|re|s|t|ve))?(?=[\\xac\\xb1\\xd7\\xf7\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf\\u2000-\\u206f \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000]|[A-Z\\xc0-\\xd6\\xd8-\\xde]|$)|(?:[A-Z\\xc0-\\xd6\\xd8-\\xde]|[^\\ud800-\\udfff\\xac\\xb1\\xd7\\xf7\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf\\u2000-\\u206f \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000\\d+\\u2700-\\u27bfa-z\\xdf-\\xf6\\xf8-\\xffA-Z\\xc0-\\xd6\\xd8-\\xde])+(?:['\u2019](?:D|LL|M|RE|S|T|VE))?(?=[\\xac\\xb1\\xd7\\xf7\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf\\u2000-\\u206f \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000]|[A-Z\\xc0-\\xd6\\xd8-\\xde](?:[a-z\\xdf-\\xf6\\xf8-\\xff]|[^\\ud800-\\udfff\\xac\\xb1\\xd7\\xf7\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf\\u2000-\\u206f \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000\\d+\\u2700-\\u27bfa-z\\xdf-\\xf6\\xf8-\\xffA-Z\\xc0-\\xd6\\xd8-\\xde])|$)|[A-Z\\xc0-\\xd6\\xd8-\\xde]?(?:[a-z\\xdf-\\xf6\\xf8-\\xff]|[^\\ud800-\\udfff\\xac\\xb1\\xd7\\xf7\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf\\u2000-\\u206f \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000\\d+\\u2700-\\u27bfa-z\\xdf-\\xf6\\xf8-\\xffA-Z\\xc0-\\xd6\\xd8-\\xde])+(?:['\u2019](?:d|ll|m|re|s|t|ve))?|[A-Z\\xc0-\\xd6\\xd8-\\xde]+(?:['\u2019](?:D|LL|M|RE|S|T|VE))?|\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])|\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])|\\d+",An].join("|"),"g"),Rn=RegExp("[\\u200d\\ud800-\\udfff\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff\\ufe0e\\ufe0f]"),zn=/[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/,Wn="Array Buffer DataView Date Error Float32Array Float64Array Function Int8Array Int16Array Int32Array Map Math Object Promise RegExp Set String Symbol TypeError Uint8Array Uint8ClampedArray Uint16Array Uint32Array WeakMap _ clearTimeout isFinite parseInt setTimeout".split(" "),Bn={};
    Bn["[object Float32Array]"]=Bn["[object Float64Array]"]=Bn["[object Int8Array]"]=Bn["[object Int16Array]"]=Bn["[object Int32Array]"]=Bn["[object Uint8Array]"]=Bn["[object Uint8ClampedArray]"]=Bn["[object Uint16Array]"]=Bn["[object Uint32Array]"]=true,Bn["[object Arguments]"]=Bn["[object Array]"]=Bn["[object ArrayBuffer]"]=Bn["[object Boolean]"]=Bn["[object DataView]"]=Bn["[object Date]"]=Bn["[object Error]"]=Bn["[object Function]"]=Bn["[object Map]"]=Bn["[object Number]"]=Bn["[object Object]"]=Bn["[object RegExp]"]=Bn["[object Set]"]=Bn["[object String]"]=Bn["[object WeakMap]"]=false;
    var Ln={};Ln["[object Arguments]"]=Ln["[object Array]"]=Ln["[object ArrayBuffer]"]=Ln["[object DataView]"]=Ln["[object Boolean]"]=Ln["[object Date]"]=Ln["[object Float32Array]"]=Ln["[object Float64Array]"]=Ln["[object Int8Array]"]=Ln["[object Int16Array]"]=Ln["[object Int32Array]"]=Ln["[object Map]"]=Ln["[object Number]"]=Ln["[object Object]"]=Ln["[object RegExp]"]=Ln["[object Set]"]=Ln["[object String]"]=Ln["[object Symbol]"]=Ln["[object Uint8Array]"]=Ln["[object Uint8ClampedArray]"]=Ln["[object Uint16Array]"]=Ln["[object Uint32Array]"]=true,
    Ln["[object Error]"]=Ln["[object Function]"]=Ln["[object WeakMap]"]=false;var Un={"\\":"\\","'":"'","\n":"n","\r":"r","\u2028":"u2028","\u2029":"u2029"},Cn=parseFloat,Dn=parseInt,Mn=typeof commonjsGlobal=="object"&&commonjsGlobal&&commonjsGlobal.Object===Object&&commonjsGlobal,Tn=typeof self=="object"&&self&&self.Object===Object&&self,$n=Mn||Tn||Function("return this")(),Fn=exports&&!exports.nodeType&&exports,Nn=Fn&&'object'=="object"&&module&&!module.nodeType&&module,Pn=Nn&&Nn.exports===Fn,Zn=Pn&&Mn.process,qn=function(){
    try{var n=Nn&&Nn.f&&Nn.f("util").types;return n?n:Zn&&Zn.binding&&Zn.binding("util")}catch(n){}}(),Vn=qn&&qn.isArrayBuffer,Kn=qn&&qn.isDate,Gn=qn&&qn.isMap,Hn=qn&&qn.isRegExp,Jn=qn&&qn.isSet,Yn=qn&&qn.isTypedArray,Qn=b("length"),Xn=x({"\xc0":"A","\xc1":"A","\xc2":"A","\xc3":"A","\xc4":"A","\xc5":"A","\xe0":"a","\xe1":"a","\xe2":"a","\xe3":"a","\xe4":"a","\xe5":"a","\xc7":"C","\xe7":"c","\xd0":"D","\xf0":"d","\xc8":"E","\xc9":"E","\xca":"E","\xcb":"E","\xe8":"e","\xe9":"e","\xea":"e","\xeb":"e","\xcc":"I",
    "\xcd":"I","\xce":"I","\xcf":"I","\xec":"i","\xed":"i","\xee":"i","\xef":"i","\xd1":"N","\xf1":"n","\xd2":"O","\xd3":"O","\xd4":"O","\xd5":"O","\xd6":"O","\xd8":"O","\xf2":"o","\xf3":"o","\xf4":"o","\xf5":"o","\xf6":"o","\xf8":"o","\xd9":"U","\xda":"U","\xdb":"U","\xdc":"U","\xf9":"u","\xfa":"u","\xfb":"u","\xfc":"u","\xdd":"Y","\xfd":"y","\xff":"y","\xc6":"Ae","\xe6":"ae","\xde":"Th","\xfe":"th","\xdf":"ss","\u0100":"A","\u0102":"A","\u0104":"A","\u0101":"a","\u0103":"a","\u0105":"a","\u0106":"C",
    "\u0108":"C","\u010a":"C","\u010c":"C","\u0107":"c","\u0109":"c","\u010b":"c","\u010d":"c","\u010e":"D","\u0110":"D","\u010f":"d","\u0111":"d","\u0112":"E","\u0114":"E","\u0116":"E","\u0118":"E","\u011a":"E","\u0113":"e","\u0115":"e","\u0117":"e","\u0119":"e","\u011b":"e","\u011c":"G","\u011e":"G","\u0120":"G","\u0122":"G","\u011d":"g","\u011f":"g","\u0121":"g","\u0123":"g","\u0124":"H","\u0126":"H","\u0125":"h","\u0127":"h","\u0128":"I","\u012a":"I","\u012c":"I","\u012e":"I","\u0130":"I","\u0129":"i",
    "\u012b":"i","\u012d":"i","\u012f":"i","\u0131":"i","\u0134":"J","\u0135":"j","\u0136":"K","\u0137":"k","\u0138":"k","\u0139":"L","\u013b":"L","\u013d":"L","\u013f":"L","\u0141":"L","\u013a":"l","\u013c":"l","\u013e":"l","\u0140":"l","\u0142":"l","\u0143":"N","\u0145":"N","\u0147":"N","\u014a":"N","\u0144":"n","\u0146":"n","\u0148":"n","\u014b":"n","\u014c":"O","\u014e":"O","\u0150":"O","\u014d":"o","\u014f":"o","\u0151":"o","\u0154":"R","\u0156":"R","\u0158":"R","\u0155":"r","\u0157":"r","\u0159":"r",
    "\u015a":"S","\u015c":"S","\u015e":"S","\u0160":"S","\u015b":"s","\u015d":"s","\u015f":"s","\u0161":"s","\u0162":"T","\u0164":"T","\u0166":"T","\u0163":"t","\u0165":"t","\u0167":"t","\u0168":"U","\u016a":"U","\u016c":"U","\u016e":"U","\u0170":"U","\u0172":"U","\u0169":"u","\u016b":"u","\u016d":"u","\u016f":"u","\u0171":"u","\u0173":"u","\u0174":"W","\u0175":"w","\u0176":"Y","\u0177":"y","\u0178":"Y","\u0179":"Z","\u017b":"Z","\u017d":"Z","\u017a":"z","\u017c":"z","\u017e":"z","\u0132":"IJ","\u0133":"ij",
    "\u0152":"Oe","\u0153":"oe","\u0149":"'n","\u017f":"s"}),nt=x({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}),tt=x({"&amp;":"&","&lt;":"<","&gt;":">","&quot;":'"',"&#39;":"'"}),rt=function x(mn){function An(n){if(yu(n)&&!ff(n)&&!(n instanceof Un)){if(n instanceof On)return n;if(oi.call(n,"__wrapped__"))return Fe(n)}return new On(n)}function En(){}function On(n,t){this.__wrapped__=n,this.__actions__=[],this.__chain__=!!t,this.__index__=0,this.__values__=T;}function Un(n){this.__wrapped__=n,
    this.__actions__=[],this.__dir__=1,this.__filtered__=false,this.__iteratees__=[],this.__takeCount__=4294967295,this.__views__=[];}function Mn(n){var t=-1,r=null==n?0:n.length;for(this.clear();++t<r;){var e=n[t];this.set(e[0],e[1]);}}function Tn(n){var t=-1,r=null==n?0:n.length;for(this.clear();++t<r;){var e=n[t];this.set(e[0],e[1]);}}function Fn(n){var t=-1,r=null==n?0:n.length;for(this.clear();++t<r;){var e=n[t];this.set(e[0],e[1]);}}function Nn(n){var t=-1,r=null==n?0:n.length;for(this.__data__=new Fn;++t<r;)this.add(n[t]);
    }function Zn(n){this.size=(this.__data__=new Tn(n)).size;}function qn(n,t){var r,e=ff(n),u=!e&&of(n),i=!e&&!u&&af(n),o=!e&&!u&&!i&&_f(n),u=(e=e||u||i||o)?A(n.length,ni):[],f=u.length;for(r in n)!t&&!oi.call(n,r)||e&&("length"==r||i&&("offset"==r||"parent"==r)||o&&("buffer"==r||"byteLength"==r||"byteOffset"==r)||Se(r,f))||u.push(r);return u}function Qn(n){var t=n.length;return t?n[ir(0,t-1)]:T}function et(n,t){return De(Ur(n),pt(t,0,n.length))}function ut(n){return De(Ur(n))}function it(n,t,r){(r===T||lu(n[t],r))&&(r!==T||t in n)||st(n,t,r);
    }function ot(n,t,r){var e=n[t];oi.call(n,t)&&lu(e,r)&&(r!==T||t in n)||st(n,t,r);}function ft(n,t){for(var r=n.length;r--;)if(lu(n[r][0],t))return r;return -1}function ct(n,t,r,e){return uo(n,function(n,u,i){t(e,n,r(n),i);}),e}function at(n,t){return n&&Cr(t,Wu(t),n)}function lt(n,t){return n&&Cr(t,Bu(t),n)}function st(n,t,r){"__proto__"==t&&Ai?Ai(n,t,{configurable:true,enumerable:true,value:r,writable:true}):n[t]=r;}function ht(n,t){for(var r=-1,e=t.length,u=Ku(e),i=null==n;++r<e;)u[r]=i?T:Ru(n,t[r]);return u;
    }function pt(n,t,r){return n===n&&(r!==T&&(n=n<=r?n:r),t!==T&&(n=n>=t?n:t)),n}function _t(n,t,e,u,i,o){var f,c=1&t,a=2&t,l=4&t;if(e&&(f=i?e(n,u,i,o):e(n)),f!==T)return f;if(!du(n))return n;if(u=ff(n)){if(f=me(n),!c)return Ur(n,f)}else{var s=vo(n),h="[object Function]"==s||"[object GeneratorFunction]"==s;if(af(n))return Ir(n,c);if("[object Object]"==s||"[object Arguments]"==s||h&&!i){if(f=a||h?{}:Ae(n),!c)return a?Mr(n,lt(f,n)):Dr(n,at(f,n))}else{if(!Ln[s])return i?n:{};f=Ee(n,s,c);}}if(o||(o=new Zn),
    i=o.get(n))return i;o.set(n,f),pf(n)?n.forEach(function(r){f.add(_t(r,t,e,r,n,o));}):sf(n)&&n.forEach(function(r,u){f.set(u,_t(r,t,e,u,n,o));});var a=l?a?ve:_e:a?Bu:Wu,p=u?T:a(n);return r(p||n,function(r,u){p&&(u=r,r=n[u]),ot(f,u,_t(r,t,e,u,n,o));}),f}function vt(n){var t=Wu(n);return function(r){return gt(r,n,t)}}function gt(n,t,r){var e=r.length;if(null==n)return !e;for(n=Qu(n);e--;){var u=r[e],i=t[u],o=n[u];if(o===T&&!(u in n)||!i(o))return false}return true}function dt(n,t,r){if(typeof n!="function")throw new ti("Expected a function");
    return bo(function(){n.apply(T,r);},t)}function yt(n,t,r,e){var u=-1,i=o,a=true,l=n.length,s=[],h=t.length;if(!l)return s;r&&(t=c(t,k(r))),e?(i=f,a=false):200<=t.length&&(i=O,a=false,t=new Nn(t));n:for(;++u<l;){var p=n[u],_=null==r?p:r(p),p=e||0!==p?p:0;if(a&&_===_){for(var v=h;v--;)if(t[v]===_)continue n;s.push(p);}else i(t,_,e)||s.push(p);}return s}function bt(n,t){var r=true;return uo(n,function(n,e,u){return r=!!t(n,e,u)}),r}function xt(n,t,r){for(var e=-1,u=n.length;++e<u;){var i=n[e],o=t(i);if(null!=o&&(f===T?o===o&&!wu(o):r(o,f)))var f=o,c=i;
    }return c}function jt(n,t){var r=[];return uo(n,function(n,e,u){t(n,e,u)&&r.push(n);}),r}function wt(n,t,r,e,u){var i=-1,o=n.length;for(r||(r=ke),u||(u=[]);++i<o;){var f=n[i];0<t&&r(f)?1<t?wt(f,t-1,r,e,u):a(u,f):e||(u[u.length]=f);}return u}function mt(n,t){return n&&oo(n,t,Wu)}function At(n,t){return n&&fo(n,t,Wu)}function Et(n,t){return i(t,function(t){return _u(n[t])})}function kt(n,t){t=Sr(t,n);for(var r=0,e=t.length;null!=n&&r<e;)n=n[Me(t[r++])];return r&&r==e?n:T}function St(n,t,r){return t=t(n),
    ff(n)?t:a(t,r(n))}function Ot(n){if(null==n)n=n===T?"[object Undefined]":"[object Null]";else if(mi&&mi in Qu(n)){var t=oi.call(n,mi),r=n[mi];try{n[mi]=T;var e=true;}catch(n){}var u=ai.call(n);e&&(t?n[mi]=r:delete n[mi]),n=u;}else n=ai.call(n);return n}function It(n,t){return n>t}function Rt(n,t){return null!=n&&oi.call(n,t)}function zt(n,t){return null!=n&&t in Qu(n)}function Wt(n,t,r){for(var e=r?f:o,u=n[0].length,i=n.length,a=i,l=Ku(i),s=1/0,h=[];a--;){var p=n[a];a&&t&&(p=c(p,k(t))),s=Ci(p.length,s),
    l[a]=!r&&(t||120<=u&&120<=p.length)?new Nn(a&&p):T;}var p=n[0],_=-1,v=l[0];n:for(;++_<u&&h.length<s;){var g=p[_],d=t?t(g):g,g=r||0!==g?g:0;if(v?!O(v,d):!e(h,d,r)){for(a=i;--a;){var y=l[a];if(y?!O(y,d):!e(n[a],d,r))continue n}v&&v.push(d),h.push(g);}}return h}function Bt(n,t,r){var e={};return mt(n,function(n,u,i){t(e,r(n),u,i);}),e}function Lt(t,r,e){return r=Sr(r,t),t=2>r.length?t:kt(t,hr(r,0,-1)),r=null==t?t:t[Me(Ve(r))],null==r?T:n(r,t,e)}function Ut(n){return yu(n)&&"[object Arguments]"==Ot(n)}function Ct(n){
    return yu(n)&&"[object ArrayBuffer]"==Ot(n)}function Dt(n){return yu(n)&&"[object Date]"==Ot(n)}function Mt(n,t,r,e,u){if(n===t)t=true;else if(null==n||null==t||!yu(n)&&!yu(t))t=n!==n&&t!==t;else n:{var i=ff(n),o=ff(t),f=i?"[object Array]":vo(n),c=o?"[object Array]":vo(t),f="[object Arguments]"==f?"[object Object]":f,c="[object Arguments]"==c?"[object Object]":c,a="[object Object]"==f,o="[object Object]"==c;if((c=f==c)&&af(n)){if(!af(t)){t=false;break n}i=true,a=false;}if(c&&!a)u||(u=new Zn),t=i||_f(n)?se(n,t,r,e,Mt,u):he(n,t,f,r,e,Mt,u);else{
    if(!(1&r)&&(i=a&&oi.call(n,"__wrapped__"),f=o&&oi.call(t,"__wrapped__"),i||f)){n=i?n.value():n,t=f?t.value():t,u||(u=new Zn),t=Mt(n,t,r,e,u);break n}if(c)t:if(u||(u=new Zn),i=1&r,f=_e(n),o=f.length,c=_e(t).length,o==c||i){for(a=o;a--;){var l=f[a];if(!(i?l in t:oi.call(t,l))){t=false;break t}}if((c=u.get(n))&&u.get(t))t=c==t;else{c=true,u.set(n,t),u.set(t,n);for(var s=i;++a<o;){var l=f[a],h=n[l],p=t[l];if(e)var _=i?e(p,h,l,t,n,u):e(h,p,l,n,t,u);if(_===T?h!==p&&!Mt(h,p,r,e,u):!_){c=false;break}s||(s="constructor"==l);
    }c&&!s&&(r=n.constructor,e=t.constructor,r!=e&&"constructor"in n&&"constructor"in t&&!(typeof r=="function"&&r instanceof r&&typeof e=="function"&&e instanceof e)&&(c=false)),u.delete(n),u.delete(t),t=c;}}else t=false;else t=false;}}return t}function Tt(n){return yu(n)&&"[object Map]"==vo(n)}function $t(n,t,r,e){var u=r.length,i=u,o=!e;if(null==n)return !i;for(n=Qu(n);u--;){var f=r[u];if(o&&f[2]?f[1]!==n[f[0]]:!(f[0]in n))return false}for(;++u<i;){var f=r[u],c=f[0],a=n[c],l=f[1];if(o&&f[2]){if(a===T&&!(c in n))return false;
    }else{if(f=new Zn,e)var s=e(a,l,c,n,t,f);if(s===T?!Mt(l,a,3,e,f):!s)return false}}return true}function Ft(n){return !(!du(n)||ci&&ci in n)&&(_u(n)?hi:dn).test(Te(n))}function Nt(n){return yu(n)&&"[object RegExp]"==Ot(n)}function Pt(n){return yu(n)&&"[object Set]"==vo(n)}function Zt(n){return yu(n)&&gu(n.length)&&!!Bn[Ot(n)]}function qt(n){return typeof n=="function"?n:null==n?$u:typeof n=="object"?ff(n)?Jt(n[0],n[1]):Ht(n):Zu(n)}function Vt(n){if(!ze(n))return Li(n);var t,r=[];for(t in Qu(n))oi.call(n,t)&&"constructor"!=t&&r.push(t);
    return r}function Kt(n,t){return n<t}function Gt(n,t){var r=-1,e=su(n)?Ku(n.length):[];return uo(n,function(n,u,i){e[++r]=t(n,u,i);}),e}function Ht(n){var t=xe(n);return 1==t.length&&t[0][2]?We(t[0][0],t[0][1]):function(r){return r===n||$t(r,n,t)}}function Jt(n,t){return Ie(n)&&t===t&&!du(t)?We(Me(n),t):function(r){var e=Ru(r,n);return e===T&&e===t?zu(r,n):Mt(t,e,3)}}function Yt(n,t,r,e,u){n!==t&&oo(t,function(i,o){if(u||(u=new Zn),du(i)){var f=u,c=Le(n,o),a=Le(t,o),l=f.get(a);if(l)it(n,o,l);else{
    var l=e?e(c,a,o+"",n,t,f):T,s=l===T;if(s){var h=ff(a),p=!h&&af(a),_=!h&&!p&&_f(a),l=a;h||p||_?ff(c)?l=c:hu(c)?l=Ur(c):p?(s=false,l=Ir(a,true)):_?(s=false,l=zr(a,true)):l=[]:xu(a)||of(a)?(l=c,of(c)?l=Ou(c):du(c)&&!_u(c)||(l=Ae(a))):s=false;}s&&(f.set(a,l),Yt(l,a,r,e,f),f.delete(a)),it(n,o,l);}}else f=e?e(Le(n,o),i,o+"",n,t,u):T,f===T&&(f=i),it(n,o,f);},Bu);}function Qt(n,t){var r=n.length;if(r)return t+=0>t?r:0,Se(t,r)?n[t]:T}function Xt(n,t,r){var e=-1;return t=c(t.length?t:[$u],k(ye())),n=Gt(n,function(n){return {
    a:c(t,function(t){return t(n)}),b:++e,c:n}}),w(n,function(n,t){var e;n:{e=-1;for(var u=n.a,i=t.a,o=u.length,f=r.length;++e<o;){var c=Wr(u[e],i[e]);if(c){e=e>=f?c:c*("desc"==r[e]?-1:1);break n}}e=n.b-t.b;}return e})}function nr(n,t){return tr(n,t,function(t,r){return zu(n,r)})}function tr(n,t,r){for(var e=-1,u=t.length,i={};++e<u;){var o=t[e],f=kt(n,o);r(f,o)&&lr(i,Sr(o,n),f);}return i}function rr(n){return function(t){return kt(t,n)}}function er(n,t,r,e){var u=e?g:v,i=-1,o=t.length,f=n;for(n===t&&(t=Ur(t)),
    r&&(f=c(n,k(r)));++i<o;)for(var a=0,l=t[i],l=r?r(l):l;-1<(a=u(f,l,a,e));)f!==n&&xi.call(f,a,1),xi.call(n,a,1);return n}function ur(n,t){for(var r=n?t.length:0,e=r-1;r--;){var u=t[r];if(r==e||u!==i){var i=u;Se(u)?xi.call(n,u,1):xr(n,u);}}}function ir(n,t){return n+Ii(Ti()*(t-n+1))}function or(n,t){var r="";if(!n||1>t||9007199254740991<t)return r;do t%2&&(r+=n),(t=Ii(t/2))&&(n+=n);while(t);return r}function fr(n,t){return xo(Be(n,t,$u),n+"")}function cr(n){return Qn(Uu(n))}function ar(n,t){var r=Uu(n);
    return De(r,pt(t,0,r.length))}function lr(n,t,r,e){if(!du(n))return n;t=Sr(t,n);for(var u=-1,i=t.length,o=i-1,f=n;null!=f&&++u<i;){var c=Me(t[u]),a=r;if(u!=o){var l=f[c],a=e?e(l,c,f):T;a===T&&(a=du(l)?l:Se(t[u+1])?[]:{});}ot(f,c,a),f=f[c];}return n}function sr(n){return De(Uu(n))}function hr(n,t,r){var e=-1,u=n.length;for(0>t&&(t=-t>u?0:u+t),r=r>u?u:r,0>r&&(r+=u),u=t>r?0:r-t>>>0,t>>>=0,r=Ku(u);++e<u;)r[e]=n[e+t];return r}function pr(n,t){var r;return uo(n,function(n,e,u){return r=t(n,e,u),!r}),!!r}
    function _r(n,t,r){var e=0,u=null==n?e:n.length;if(typeof t=="number"&&t===t&&2147483647>=u){for(;e<u;){var i=e+u>>>1,o=n[i];null!==o&&!wu(o)&&(r?o<=t:o<t)?e=i+1:u=i;}return u}return vr(n,t,$u,r)}function vr(n,t,r,e){t=r(t);for(var u=0,i=null==n?0:n.length,o=t!==t,f=null===t,c=wu(t),a=t===T;u<i;){var l=Ii((u+i)/2),s=r(n[l]),h=s!==T,p=null===s,_=s===s,v=wu(s);(o?e||_:a?_&&(e||h):f?_&&h&&(e||!p):c?_&&h&&!p&&(e||!v):p||v?0:e?s<=t:s<t)?u=l+1:i=l;}return Ci(i,4294967294)}function gr(n,t){for(var r=-1,e=n.length,u=0,i=[];++r<e;){
    var o=n[r],f=t?t(o):o;if(!r||!lu(f,c)){var c=f;i[u++]=0===o?0:o;}}return i}function dr(n){return typeof n=="number"?n:wu(n)?F:+n}function yr(n){if(typeof n=="string")return n;if(ff(n))return c(n,yr)+"";if(wu(n))return ro?ro.call(n):"";var t=n+"";return "0"==t&&1/n==-$?"-0":t}function br(n,t,r){var e=-1,u=o,i=n.length,c=true,a=[],l=a;if(r)c=false,u=f;else if(200<=i){if(u=t?null:so(n))return U(u);c=false,u=O,l=new Nn;}else l=t?[]:a;n:for(;++e<i;){var s=n[e],h=t?t(s):s,s=r||0!==s?s:0;if(c&&h===h){for(var p=l.length;p--;)if(l[p]===h)continue n;
    t&&l.push(h),a.push(s);}else u(l,h,r)||(l!==a&&l.push(h),a.push(s));}return a}function xr(n,t){return t=Sr(t,n),n=2>t.length?n:kt(n,hr(t,0,-1)),null==n||delete n[Me(Ve(t))]}function jr(n,t,r,e){for(var u=n.length,i=e?u:-1;(e?i--:++i<u)&&t(n[i],i,n););return r?hr(n,e?0:i,e?i+1:u):hr(n,e?i+1:0,e?u:i)}function wr(n,t){var r=n;return r instanceof Un&&(r=r.value()),l(t,function(n,t){return t.func.apply(t.thisArg,a([n],t.args))},r)}function mr(n,t,r){var e=n.length;if(2>e)return e?br(n[0]):[];for(var u=-1,i=Ku(e);++u<e;)for(var o=n[u],f=-1;++f<e;)f!=u&&(i[u]=yt(i[u]||o,n[f],t,r));
    return br(wt(i,1),t,r)}function Ar(n,t,r){for(var e=-1,u=n.length,i=t.length,o={};++e<u;)r(o,n[e],e<i?t[e]:T);return o}function Er(n){return hu(n)?n:[]}function kr(n){return typeof n=="function"?n:$u}function Sr(n,t){return ff(n)?n:Ie(n,t)?[n]:jo(Iu(n))}function Or(n,t,r){var e=n.length;return r=r===T?e:r,!t&&r>=e?n:hr(n,t,r)}function Ir(n,t){if(t)return n.slice();var r=n.length,r=gi?gi(r):new n.constructor(r);return n.copy(r),r}function Rr(n){var t=new n.constructor(n.byteLength);return new vi(t).set(new vi(n)),
    t}function zr(n,t){return new n.constructor(t?Rr(n.buffer):n.buffer,n.byteOffset,n.length)}function Wr(n,t){if(n!==t){var r=n!==T,e=null===n,u=n===n,i=wu(n),o=t!==T,f=null===t,c=t===t,a=wu(t);if(!f&&!a&&!i&&n>t||i&&o&&c&&!f&&!a||e&&o&&c||!r&&c||!u)return 1;if(!e&&!i&&!a&&n<t||a&&r&&u&&!e&&!i||f&&r&&u||!o&&u||!c)return -1}return 0}function Br(n,t,r,e){var u=-1,i=n.length,o=r.length,f=-1,c=t.length,a=Ui(i-o,0),l=Ku(c+a);for(e=!e;++f<c;)l[f]=t[f];for(;++u<o;)(e||u<i)&&(l[r[u]]=n[u]);for(;a--;)l[f++]=n[u++];
    return l}function Lr(n,t,r,e){var u=-1,i=n.length,o=-1,f=r.length,c=-1,a=t.length,l=Ui(i-f,0),s=Ku(l+a);for(e=!e;++u<l;)s[u]=n[u];for(l=u;++c<a;)s[l+c]=t[c];for(;++o<f;)(e||u<i)&&(s[l+r[o]]=n[u++]);return s}function Ur(n,t){var r=-1,e=n.length;for(t||(t=Ku(e));++r<e;)t[r]=n[r];return t}function Cr(n,t,r,e){var u=!r;r||(r={});for(var i=-1,o=t.length;++i<o;){var f=t[i],c=e?e(r[f],n[f],f,r,n):T;c===T&&(c=n[f]),u?st(r,f,c):ot(r,f,c);}return r}function Dr(n,t){return Cr(n,po(n),t)}function Mr(n,t){return Cr(n,_o(n),t);
    }function Tr(n,r){return function(e,u){var i=ff(e)?t:ct,o=r?r():{};return i(e,n,ye(u,2),o)}}function $r(n){return fr(function(t,r){var e=-1,u=r.length,i=1<u?r[u-1]:T,o=2<u?r[2]:T,i=3<n.length&&typeof i=="function"?(u--,i):T;for(o&&Oe(r[0],r[1],o)&&(i=3>u?T:i,u=1),t=Qu(t);++e<u;)(o=r[e])&&n(t,o,e,i);return t})}function Fr(n,t){return function(r,e){if(null==r)return r;if(!su(r))return n(r,e);for(var u=r.length,i=t?u:-1,o=Qu(r);(t?i--:++i<u)&&false!==e(o[i],i,o););return r}}function Nr(n){return function(t,r,e){
    var u=-1,i=Qu(t);e=e(t);for(var o=e.length;o--;){var f=e[n?o:++u];if(false===r(i[f],f,i))break}return t}}function Pr(n,t,r){function e(){return (this&&this!==$n&&this instanceof e?i:n).apply(u?r:this,arguments)}var u=1&t,i=Vr(n);return e}function Zr(n){return function(t){t=Iu(t);var r=Rn.test(t)?M(t):T,e=r?r[0]:t.charAt(0);return t=r?Or(r,1).join(""):t.slice(1),e[n]()+t}}function qr(n){return function(t){return l(Mu(Du(t).replace(kn,"")),n,"")}}function Vr(n){return function(){var t=arguments;switch(t.length){
    case 0:return new n;case 1:return new n(t[0]);case 2:return new n(t[0],t[1]);case 3:return new n(t[0],t[1],t[2]);case 4:return new n(t[0],t[1],t[2],t[3]);case 5:return new n(t[0],t[1],t[2],t[3],t[4]);case 6:return new n(t[0],t[1],t[2],t[3],t[4],t[5]);case 7:return new n(t[0],t[1],t[2],t[3],t[4],t[5],t[6])}var r=eo(n.prototype),t=n.apply(r,t);return du(t)?t:r}}function Kr(t,r,e){function u(){for(var o=arguments.length,f=Ku(o),c=o,a=de(u);c--;)f[c]=arguments[c];return c=3>o&&f[0]!==a&&f[o-1]!==a?[]:L(f,a),
    o-=c.length,o<e?ue(t,r,Jr,u.placeholder,T,f,c,T,T,e-o):n(this&&this!==$n&&this instanceof u?i:t,this,f)}var i=Vr(t);return u}function Gr(n){return function(t,r,e){var u=Qu(t);if(!su(t)){var i=ye(r,3);t=Wu(t),r=function(n){return i(u[n],n,u)};}return r=n(t,r,e),-1<r?u[i?t[r]:r]:T}}function Hr(n){return pe(function(t){var r=t.length,e=r,u=On.prototype.thru;for(n&&t.reverse();e--;){var i=t[e];if(typeof i!="function")throw new ti("Expected a function");if(u&&!o&&"wrapper"==ge(i))var o=new On([],true);}for(e=o?e:r;++e<r;)var i=t[e],u=ge(i),f="wrapper"==u?ho(i):T,o=f&&Re(f[0])&&424==f[1]&&!f[4].length&&1==f[9]?o[ge(f[0])].apply(o,f[3]):1==i.length&&Re(i)?o[u]():o.thru(i);
    return function(){var n=arguments,e=n[0];if(o&&1==n.length&&ff(e))return o.plant(e).value();for(var u=0,n=r?t[u].apply(this,n):e;++u<r;)n=t[u].call(this,n);return n}})}function Jr(n,t,r,e,u,i,o,f,c,a){function l(){for(var d=arguments.length,y=Ku(d),b=d;b--;)y[b]=arguments[b];if(_){var x,j=de(l),b=y.length;for(x=0;b--;)y[b]===j&&++x;}if(e&&(y=Br(y,e,u,_)),i&&(y=Lr(y,i,o,_)),d-=x,_&&d<a)return j=L(y,j),ue(n,t,Jr,l.placeholder,r,y,j,f,c,a-d);if(j=h?r:this,b=p?j[n]:n,d=y.length,f){x=y.length;for(var w=Ci(f.length,x),m=Ur(y);w--;){
    var A=f[w];y[w]=Se(A,x)?m[A]:T;}}else v&&1<d&&y.reverse();return s&&c<d&&(y.length=c),this&&this!==$n&&this instanceof l&&(b=g||Vr(b)),b.apply(j,y)}var s=128&t,h=1&t,p=2&t,_=24&t,v=512&t,g=p?T:Vr(n);return l}function Yr(n,t){return function(r,e){return Bt(r,n,t(e))}}function Qr(n,t){return function(r,e){var u;if(r===T&&e===T)return t;if(r!==T&&(u=r),e!==T){if(u===T)return e;typeof r=="string"||typeof e=="string"?(r=yr(r),e=yr(e)):(r=dr(r),e=dr(e)),u=n(r,e);}return u}}function Xr(t){return pe(function(r){
    return r=c(r,k(ye())),fr(function(e){var u=this;return t(r,function(t){return n(t,u,e)})})})}function ne(n,t){t=t===T?" ":yr(t);var r=t.length;return 2>r?r?or(t,n):t:(r=or(t,Oi(n/D(t))),Rn.test(t)?Or(M(r),0,n).join(""):r.slice(0,n))}function te(t,r,e,u){function i(){for(var r=-1,c=arguments.length,a=-1,l=u.length,s=Ku(l+c),h=this&&this!==$n&&this instanceof i?f:t;++a<l;)s[a]=u[a];for(;c--;)s[a++]=arguments[++r];return n(h,o?e:this,s)}var o=1&r,f=Vr(t);return i}function re(n){return function(t,r,e){
    e&&typeof e!="number"&&Oe(t,r,e)&&(r=e=T),t=Au(t),r===T?(r=t,t=0):r=Au(r),e=e===T?t<r?1:-1:Au(e);var u=-1;r=Ui(Oi((r-t)/(e||1)),0);for(var i=Ku(r);r--;)i[n?r:++u]=t,t+=e;return i}}function ee(n){return function(t,r){return typeof t=="string"&&typeof r=="string"||(t=Su(t),r=Su(r)),n(t,r)}}function ue(n,t,r,e,u,i,o,f,c,a){var l=8&t,s=l?o:T;o=l?T:o;var h=l?i:T;return i=l?T:i,t=(t|(l?32:64))&~(l?64:32),4&t||(t&=-4),u=[n,t,u,h,s,i,o,f,c,a],r=r.apply(T,u),Re(n)&&yo(r,u),r.placeholder=e,Ue(r,n,t)}function ie(n){
    var t=Yu[n];return function(n,r){if(n=Su(n),(r=null==r?0:Ci(Eu(r),292))&&Wi(n)){var e=(Iu(n)+"e").split("e"),e=t(e[0]+"e"+(+e[1]+r)),e=(Iu(e)+"e").split("e");return +(e[0]+"e"+(+e[1]-r))}return t(n)}}function oe(n){return function(t){var r=vo(t);return "[object Map]"==r?W(t):"[object Set]"==r?C(t):E(t,n(t))}}function fe(n,t,r,e,u,i,o,f){var c=2&t;if(!c&&typeof n!="function")throw new ti("Expected a function");var a=e?e.length:0;if(a||(t&=-97,e=u=T),o=o===T?o:Ui(Eu(o),0),f=f===T?f:Eu(f),a-=u?u.length:0,
    64&t){var l=e,s=u;e=u=T;}var h=c?T:ho(n);return i=[n,t,r,e,u,l,s,i,o,f],h&&(r=i[1],n=h[1],t=r|n,e=128==n&&8==r||128==n&&256==r&&i[7].length<=h[8]||384==n&&h[7].length<=h[8]&&8==r,131>t||e)&&(1&n&&(i[2]=h[2],t|=1&r?0:4),(r=h[3])&&(e=i[3],i[3]=e?Br(e,r,h[4]):r,i[4]=e?L(i[3],"__lodash_placeholder__"):h[4]),(r=h[5])&&(e=i[5],i[5]=e?Lr(e,r,h[6]):r,i[6]=e?L(i[5],"__lodash_placeholder__"):h[6]),(r=h[7])&&(i[7]=r),128&n&&(i[8]=null==i[8]?h[8]:Ci(i[8],h[8])),null==i[9]&&(i[9]=h[9]),i[0]=h[0],i[1]=t),n=i[0],
    t=i[1],r=i[2],e=i[3],u=i[4],f=i[9]=i[9]===T?c?0:n.length:Ui(i[9]-a,0),!f&&24&t&&(t&=-25),Ue((h?co:yo)(t&&1!=t?8==t||16==t?Kr(n,t,f):32!=t&&33!=t||u.length?Jr.apply(T,i):te(n,t,r,e):Pr(n,t,r),i),n,t)}function ce(n,t,r,e){return n===T||lu(n,ei[r])&&!oi.call(e,r)?t:n}function ae(n,t,r,e,u,i){return du(n)&&du(t)&&(i.set(t,n),Yt(n,t,T,ae,i),i.delete(t)),n}function le(n){return xu(n)?T:n}function se(n,t,r,e,u,i){var o=1&r,f=n.length,c=t.length;if(f!=c&&!(o&&c>f))return false;if((c=i.get(n))&&i.get(t))return c==t;
    var c=-1,a=true,l=2&r?new Nn:T;for(i.set(n,t),i.set(t,n);++c<f;){var s=n[c],p=t[c];if(e)var _=o?e(p,s,c,t,n,i):e(s,p,c,n,t,i);if(_!==T){if(_)continue;a=false;break}if(l){if(!h(t,function(n,t){if(!O(l,t)&&(s===n||u(s,n,r,e,i)))return l.push(t)})){a=false;break}}else if(s!==p&&!u(s,p,r,e,i)){a=false;break}}return i.delete(n),i.delete(t),a}function he(n,t,r,e,u,i,o){switch(r){case"[object DataView]":if(n.byteLength!=t.byteLength||n.byteOffset!=t.byteOffset)break;n=n.buffer,t=t.buffer;case"[object ArrayBuffer]":
    if(n.byteLength!=t.byteLength||!i(new vi(n),new vi(t)))break;return true;case"[object Boolean]":case"[object Date]":case"[object Number]":return lu(+n,+t);case"[object Error]":return n.name==t.name&&n.message==t.message;case"[object RegExp]":case"[object String]":return n==t+"";case"[object Map]":var f=W;case"[object Set]":if(f||(f=U),n.size!=t.size&&!(1&e))break;return (r=o.get(n))?r==t:(e|=2,o.set(n,t),t=se(f(n),f(t),e,u,i,o),o.delete(n),t);case"[object Symbol]":if(to)return to.call(n)==to.call(t)}
    return false}function pe(n){return xo(Be(n,T,Ze),n+"")}function _e(n){return St(n,Wu,po)}function ve(n){return St(n,Bu,_o)}function ge(n){for(var t=n.name+"",r=Gi[t],e=oi.call(Gi,t)?r.length:0;e--;){var u=r[e],i=u.func;if(null==i||i==n)return u.name}return t}function de(n){return (oi.call(An,"placeholder")?An:n).placeholder}function ye(){var n=An.iteratee||Fu,n=n===Fu?qt:n;return arguments.length?n(arguments[0],arguments[1]):n}function be(n,t){var r=n.__data__,e=typeof t;return ("string"==e||"number"==e||"symbol"==e||"boolean"==e?"__proto__"!==t:null===t)?r[typeof t=="string"?"string":"hash"]:r.map;
    }function xe(n){for(var t=Wu(n),r=t.length;r--;){var e=t[r],u=n[e];t[r]=[e,u,u===u&&!du(u)];}return t}function je(n,t){var r=null==n?T:n[t];return Ft(r)?r:T}function we(n,t,r){t=Sr(t,n);for(var e=-1,u=t.length,i=false;++e<u;){var o=Me(t[e]);if(!(i=null!=n&&r(n,o)))break;n=n[o];}return i||++e!=u?i:(u=null==n?0:n.length,!!u&&gu(u)&&Se(o,u)&&(ff(n)||of(n)))}function me(n){var t=n.length,r=new n.constructor(t);return t&&"string"==typeof n[0]&&oi.call(n,"index")&&(r.index=n.index,r.input=n.input),r}function Ae(n){
    return typeof n.constructor!="function"||ze(n)?{}:eo(di(n))}function Ee(n,t,r){var e=n.constructor;switch(t){case"[object ArrayBuffer]":return Rr(n);case"[object Boolean]":case"[object Date]":return new e(+n);case"[object DataView]":return t=r?Rr(n.buffer):n.buffer,new n.constructor(t,n.byteOffset,n.byteLength);case"[object Float32Array]":case"[object Float64Array]":case"[object Int8Array]":case"[object Int16Array]":case"[object Int32Array]":case"[object Uint8Array]":case"[object Uint8ClampedArray]":
    case"[object Uint16Array]":case"[object Uint32Array]":return zr(n,r);case"[object Map]":return new e;case"[object Number]":case"[object String]":return new e(n);case"[object RegExp]":return t=new n.constructor(n.source,_n.exec(n)),t.lastIndex=n.lastIndex,t;case"[object Set]":return new e;case"[object Symbol]":return to?Qu(to.call(n)):{}}}function ke(n){return ff(n)||of(n)||!!(ji&&n&&n[ji])}function Se(n,t){var r=typeof n;return t=null==t?9007199254740991:t,!!t&&("number"==r||"symbol"!=r&&bn.test(n))&&-1<n&&0==n%1&&n<t;
    }function Oe(n,t,r){if(!du(r))return false;var e=typeof t;return !!("number"==e?su(r)&&Se(t,r.length):"string"==e&&t in r)&&lu(r[t],n)}function Ie(n,t){if(ff(n))return false;var r=typeof n;return !("number"!=r&&"symbol"!=r&&"boolean"!=r&&null!=n&&!wu(n))||(nn.test(n)||!X.test(n)||null!=t&&n in Qu(t))}function Re(n){var t=ge(n),r=An[t];return typeof r=="function"&&t in Un.prototype&&(n===r||(t=ho(r),!!t&&n===t[0]))}function ze(n){var t=n&&n.constructor;return n===(typeof t=="function"&&t.prototype||ei)}function We(n,t){
    return function(r){return null!=r&&(r[n]===t&&(t!==T||n in Qu(r)))}}function Be(t,r,e){return r=Ui(r===T?t.length-1:r,0),function(){for(var u=arguments,i=-1,o=Ui(u.length-r,0),f=Ku(o);++i<o;)f[i]=u[r+i];for(i=-1,o=Ku(r+1);++i<r;)o[i]=u[i];return o[r]=e(f),n(t,this,o)}}function Le(n,t){if(("constructor"!==t||"function"!=typeof n[t])&&"__proto__"!=t)return n[t]}function Ue(n,t,r){var e=t+"";t=xo;var u,i=$e;return u=(u=e.match(an))?u[1].split(ln):[],r=i(u,r),(i=r.length)&&(u=i-1,r[u]=(1<i?"& ":"")+r[u],
    r=r.join(2<i?", ":" "),e=e.replace(cn,"{\n/* [wrapped with "+r+"] */\n")),t(n,e)}function Ce(n){var t=0,r=0;return function(){var e=Di(),u=16-(e-r);if(r=e,0<u){if(800<=++t)return arguments[0]}else t=0;return n.apply(T,arguments)}}function De(n,t){var r=-1,e=n.length,u=e-1;for(t=t===T?e:t;++r<t;){var e=ir(r,u),i=n[e];n[e]=n[r],n[r]=i;}return n.length=t,n}function Me(n){if(typeof n=="string"||wu(n))return n;var t=n+"";return "0"==t&&1/n==-$?"-0":t}function Te(n){if(null!=n){try{return ii.call(n)}catch(n){}
    return n+""}return ""}function $e(n,t){return r(N,function(r){var e="_."+r[0];t&r[1]&&!o(n,e)&&n.push(e);}),n.sort()}function Fe(n){if(n instanceof Un)return n.clone();var t=new On(n.__wrapped__,n.__chain__);return t.__actions__=Ur(n.__actions__),t.__index__=n.__index__,t.__values__=n.__values__,t}function Ne(n,t,r){var e=null==n?0:n.length;return e?(r=null==r?0:Eu(r),0>r&&(r=Ui(e+r,0)),_(n,ye(t,3),r)):-1}function Pe(n,t,r){var e=null==n?0:n.length;if(!e)return -1;var u=e-1;return r!==T&&(u=Eu(r),u=0>r?Ui(e+u,0):Ci(u,e-1)),
    _(n,ye(t,3),u,true)}function Ze(n){return (null==n?0:n.length)?wt(n,1):[]}function qe(n){return n&&n.length?n[0]:T}function Ve(n){var t=null==n?0:n.length;return t?n[t-1]:T}function Ke(n,t){return n&&n.length&&t&&t.length?er(n,t):n}function Ge(n){return null==n?n:$i.call(n)}function He(n){if(!n||!n.length)return [];var t=0;return n=i(n,function(n){if(hu(n))return t=Ui(n.length,t),true}),A(t,function(t){return c(n,b(t))})}function Je(t,r){if(!t||!t.length)return [];var e=He(t);return null==r?e:c(e,function(t){
    return n(r,T,t)})}function Ye(n){return n=An(n),n.__chain__=true,n}function Qe(n,t){return t(n)}function Xe(){return this}function nu(n,t){return (ff(n)?r:uo)(n,ye(t,3))}function tu(n,t){return (ff(n)?e:io)(n,ye(t,3))}function ru(n,t){return (ff(n)?c:Gt)(n,ye(t,3))}function eu(n,t,r){return t=r?T:t,t=n&&null==t?n.length:t,fe(n,128,T,T,T,T,t)}function uu(n,t){var r;if(typeof t!="function")throw new ti("Expected a function");return n=Eu(n),function(){return 0<--n&&(r=t.apply(this,arguments)),1>=n&&(t=T),
    r}}function iu(n,t,r){return t=r?T:t,n=fe(n,8,T,T,T,T,T,t),n.placeholder=iu.placeholder,n}function ou(n,t,r){return t=r?T:t,n=fe(n,16,T,T,T,T,T,t),n.placeholder=ou.placeholder,n}function fu(n,t,r){function e(t){var r=c,e=a;return c=a=T,_=t,s=n.apply(e,r)}function u(n){var r=n-p;return n-=_,p===T||r>=t||0>r||g&&n>=l}function i(){var n=Go();if(u(n))return o(n);var r,e=bo;r=n-_,n=t-(n-p),r=g?Ci(n,l-r):n,h=e(i,r);}function o(n){return h=T,d&&c?e(n):(c=a=T,s)}function f(){var n=Go(),r=u(n);if(c=arguments,
    a=this,p=n,r){if(h===T)return _=n=p,h=bo(i,t),v?e(n):s;if(g)return lo(h),h=bo(i,t),e(p)}return h===T&&(h=bo(i,t)),s}var c,a,l,s,h,p,_=0,v=false,g=false,d=true;if(typeof n!="function")throw new ti("Expected a function");return t=Su(t)||0,du(r)&&(v=!!r.leading,l=(g="maxWait"in r)?Ui(Su(r.maxWait)||0,t):l,d="trailing"in r?!!r.trailing:d),f.cancel=function(){h!==T&&lo(h),_=0,c=p=a=h=T;},f.flush=function(){return h===T?s:o(Go())},f}function cu(n,t){function r(){var e=arguments,u=t?t.apply(this,e):e[0],i=r.cache;
    return i.has(u)?i.get(u):(e=n.apply(this,e),r.cache=i.set(u,e)||i,e)}if(typeof n!="function"||null!=t&&typeof t!="function")throw new ti("Expected a function");return r.cache=new(cu.Cache||Fn),r}function au(n){if(typeof n!="function")throw new ti("Expected a function");return function(){var t=arguments;switch(t.length){case 0:return !n.call(this);case 1:return !n.call(this,t[0]);case 2:return !n.call(this,t[0],t[1]);case 3:return !n.call(this,t[0],t[1],t[2])}return !n.apply(this,t)}}function lu(n,t){return n===t||n!==n&&t!==t;
    }function su(n){return null!=n&&gu(n.length)&&!_u(n)}function hu(n){return yu(n)&&su(n)}function pu(n){if(!yu(n))return false;var t=Ot(n);return "[object Error]"==t||"[object DOMException]"==t||typeof n.message=="string"&&typeof n.name=="string"&&!xu(n)}function _u(n){return !!du(n)&&(n=Ot(n),"[object Function]"==n||"[object GeneratorFunction]"==n||"[object AsyncFunction]"==n||"[object Proxy]"==n)}function vu(n){return typeof n=="number"&&n==Eu(n)}function gu(n){return typeof n=="number"&&-1<n&&0==n%1&&9007199254740991>=n;
    }function du(n){var t=typeof n;return null!=n&&("object"==t||"function"==t)}function yu(n){return null!=n&&typeof n=="object"}function bu(n){return typeof n=="number"||yu(n)&&"[object Number]"==Ot(n)}function xu(n){return !(!yu(n)||"[object Object]"!=Ot(n))&&(n=di(n),null===n||(n=oi.call(n,"constructor")&&n.constructor,typeof n=="function"&&n instanceof n&&ii.call(n)==li))}function ju(n){return typeof n=="string"||!ff(n)&&yu(n)&&"[object String]"==Ot(n)}function wu(n){return typeof n=="symbol"||yu(n)&&"[object Symbol]"==Ot(n);
    }function mu(n){if(!n)return [];if(su(n))return ju(n)?M(n):Ur(n);if(wi&&n[wi]){n=n[wi]();for(var t,r=[];!(t=n.next()).done;)r.push(t.value);return r}return t=vo(n),("[object Map]"==t?W:"[object Set]"==t?U:Uu)(n)}function Au(n){return n?(n=Su(n),n===$||n===-$?1.7976931348623157e308*(0>n?-1:1):n===n?n:0):0===n?n:0}function Eu(n){n=Au(n);var t=n%1;return n===n?t?n-t:n:0}function ku(n){return n?pt(Eu(n),0,4294967295):0}function Su(n){if(typeof n=="number")return n;if(wu(n))return F;if(du(n)&&(n=typeof n.valueOf=="function"?n.valueOf():n,
    n=du(n)?n+"":n),typeof n!="string")return 0===n?n:+n;n=n.replace(un,"");var t=gn.test(n);return t||yn.test(n)?Dn(n.slice(2),t?2:8):vn.test(n)?F:+n}function Ou(n){return Cr(n,Bu(n))}function Iu(n){return null==n?"":yr(n)}function Ru(n,t,r){return n=null==n?T:kt(n,t),n===T?r:n}function zu(n,t){return null!=n&&we(n,t,zt)}function Wu(n){return su(n)?qn(n):Vt(n)}function Bu(n){if(su(n))n=qn(n,true);else if(du(n)){var t,r=ze(n),e=[];for(t in n)("constructor"!=t||!r&&oi.call(n,t))&&e.push(t);n=e;}else{if(t=[],
    null!=n)for(r in Qu(n))t.push(r);n=t;}return n}function Lu(n,t){if(null==n)return {};var r=c(ve(n),function(n){return [n]});return t=ye(t),tr(n,r,function(n,r){return t(n,r[0])})}function Uu(n){return null==n?[]:S(n,Wu(n))}function Cu(n){return $f(Iu(n).toLowerCase())}function Du(n){return (n=Iu(n))&&n.replace(xn,Xn).replace(Sn,"")}function Mu(n,t,r){return n=Iu(n),t=r?T:t,t===T?zn.test(n)?n.match(In)||[]:n.match(sn)||[]:n.match(t)||[]}function Tu(n){return function(){return n}}function $u(n){return n;
    }function Fu(n){return qt(typeof n=="function"?n:_t(n,1))}function Nu(n,t,e){var u=Wu(t),i=Et(t,u);null!=e||du(t)&&(i.length||!u.length)||(e=t,t=n,n=this,i=Et(t,Wu(t)));var o=!(du(e)&&"chain"in e&&!e.chain),f=_u(n);return r(i,function(r){var e=t[r];n[r]=e,f&&(n.prototype[r]=function(){var t=this.__chain__;if(o||t){var r=n(this.__wrapped__);return (r.__actions__=Ur(this.__actions__)).push({func:e,args:arguments,thisArg:n}),r.__chain__=t,r}return e.apply(n,a([this.value()],arguments))});}),n}function Pu(){}
    function Zu(n){return Ie(n)?b(Me(n)):rr(n)}function qu(){return []}function Vu(){return false}mn=null==mn?$n:rt.defaults($n.Object(),mn,rt.pick($n,Wn));var Ku=mn.Array,Gu=mn.Date,Hu=mn.Error,Ju=mn.Function,Yu=mn.Math,Qu=mn.Object,Xu=mn.RegExp,ni=mn.String,ti=mn.TypeError,ri=Ku.prototype,ei=Qu.prototype,ui=mn["__core-js_shared__"],ii=Ju.prototype.toString,oi=ei.hasOwnProperty,fi=0,ci=function(){var n=/[^.]+$/.exec(ui&&ui.keys&&ui.keys.IE_PROTO||"");return n?"Symbol(src)_1."+n:""}(),ai=ei.toString,li=ii.call(Qu),si=$n._,hi=Xu("^"+ii.call(oi).replace(rn,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$"),pi=Pn?mn.Buffer:T,_i=mn.Symbol,vi=mn.Uint8Array,gi=pi?pi.g:T,di=B(Qu.getPrototypeOf,Qu),yi=Qu.create,bi=ei.propertyIsEnumerable,xi=ri.splice,ji=_i?_i.isConcatSpreadable:T,wi=_i?_i.iterator:T,mi=_i?_i.toStringTag:T,Ai=function(){
    try{var n=je(Qu,"defineProperty");return n({},"",{}),n}catch(n){}}(),Ei=mn.clearTimeout!==$n.clearTimeout&&mn.clearTimeout,ki=Gu&&Gu.now!==$n.Date.now&&Gu.now,Si=mn.setTimeout!==$n.setTimeout&&mn.setTimeout,Oi=Yu.ceil,Ii=Yu.floor,Ri=Qu.getOwnPropertySymbols,zi=pi?pi.isBuffer:T,Wi=mn.isFinite,Bi=ri.join,Li=B(Qu.keys,Qu),Ui=Yu.max,Ci=Yu.min,Di=Gu.now,Mi=mn.parseInt,Ti=Yu.random,$i=ri.reverse,Fi=je(mn,"DataView"),Ni=je(mn,"Map"),Pi=je(mn,"Promise"),Zi=je(mn,"Set"),qi=je(mn,"WeakMap"),Vi=je(Qu,"create"),Ki=qi&&new qi,Gi={},Hi=Te(Fi),Ji=Te(Ni),Yi=Te(Pi),Qi=Te(Zi),Xi=Te(qi),no=_i?_i.prototype:T,to=no?no.valueOf:T,ro=no?no.toString:T,eo=function(){
    function n(){}return function(t){return du(t)?yi?yi(t):(n.prototype=t,t=new n,n.prototype=T,t):{}}}();An.templateSettings={escape:J,evaluate:Y,interpolate:Q,variable:"",imports:{_:An}},An.prototype=En.prototype,An.prototype.constructor=An,On.prototype=eo(En.prototype),On.prototype.constructor=On,Un.prototype=eo(En.prototype),Un.prototype.constructor=Un,Mn.prototype.clear=function(){this.__data__=Vi?Vi(null):{},this.size=0;},Mn.prototype.delete=function(n){return n=this.has(n)&&delete this.__data__[n],
    this.size-=n?1:0,n},Mn.prototype.get=function(n){var t=this.__data__;return Vi?(n=t[n],"__lodash_hash_undefined__"===n?T:n):oi.call(t,n)?t[n]:T},Mn.prototype.has=function(n){var t=this.__data__;return Vi?t[n]!==T:oi.call(t,n)},Mn.prototype.set=function(n,t){var r=this.__data__;return this.size+=this.has(n)?0:1,r[n]=Vi&&t===T?"__lodash_hash_undefined__":t,this},Tn.prototype.clear=function(){this.__data__=[],this.size=0;},Tn.prototype.delete=function(n){var t=this.__data__;return n=ft(t,n),!(0>n)&&(n==t.length-1?t.pop():xi.call(t,n,1),
    --this.size,true)},Tn.prototype.get=function(n){var t=this.__data__;return n=ft(t,n),0>n?T:t[n][1]},Tn.prototype.has=function(n){return -1<ft(this.__data__,n)},Tn.prototype.set=function(n,t){var r=this.__data__,e=ft(r,n);return 0>e?(++this.size,r.push([n,t])):r[e][1]=t,this},Fn.prototype.clear=function(){this.size=0,this.__data__={hash:new Mn,map:new(Ni||Tn),string:new Mn};},Fn.prototype.delete=function(n){return n=be(this,n).delete(n),this.size-=n?1:0,n},Fn.prototype.get=function(n){return be(this,n).get(n);
    },Fn.prototype.has=function(n){return be(this,n).has(n)},Fn.prototype.set=function(n,t){var r=be(this,n),e=r.size;return r.set(n,t),this.size+=r.size==e?0:1,this},Nn.prototype.add=Nn.prototype.push=function(n){return this.__data__.set(n,"__lodash_hash_undefined__"),this},Nn.prototype.has=function(n){return this.__data__.has(n)},Zn.prototype.clear=function(){this.__data__=new Tn,this.size=0;},Zn.prototype.delete=function(n){var t=this.__data__;return n=t.delete(n),this.size=t.size,n},Zn.prototype.get=function(n){
    return this.__data__.get(n)},Zn.prototype.has=function(n){return this.__data__.has(n)},Zn.prototype.set=function(n,t){var r=this.__data__;if(r instanceof Tn){var e=r.__data__;if(!Ni||199>e.length)return e.push([n,t]),this.size=++r.size,this;r=this.__data__=new Fn(e);}return r.set(n,t),this.size=r.size,this};var uo=Fr(mt),io=Fr(At,true),oo=Nr(),fo=Nr(true),co=Ki?function(n,t){return Ki.set(n,t),n}:$u,ao=Ai?function(n,t){return Ai(n,"toString",{configurable:true,enumerable:false,value:Tu(t),writable:true})}:$u,lo=Ei||function(n){
    return $n.clearTimeout(n)},so=Zi&&1/U(new Zi([,-0]))[1]==$?function(n){return new Zi(n)}:Pu,ho=Ki?function(n){return Ki.get(n)}:Pu,po=Ri?function(n){return null==n?[]:(n=Qu(n),i(Ri(n),function(t){return bi.call(n,t)}))}:qu,_o=Ri?function(n){for(var t=[];n;)a(t,po(n)),n=di(n);return t}:qu,vo=Ot;(Fi&&"[object DataView]"!=vo(new Fi(new ArrayBuffer(1)))||Ni&&"[object Map]"!=vo(new Ni)||Pi&&"[object Promise]"!=vo(Pi.resolve())||Zi&&"[object Set]"!=vo(new Zi)||qi&&"[object WeakMap]"!=vo(new qi))&&(vo=function(n){
    var t=Ot(n);if(n=(n="[object Object]"==t?n.constructor:T)?Te(n):"")switch(n){case Hi:return "[object DataView]";case Ji:return "[object Map]";case Yi:return "[object Promise]";case Qi:return "[object Set]";case Xi:return "[object WeakMap]"}return t});var go=ui?_u:Vu,yo=Ce(co),bo=Si||function(n,t){return $n.setTimeout(n,t)},xo=Ce(ao),jo=function(n){n=cu(n,function(n){return 500===t.size&&t.clear(),n});var t=n.cache;return n}(function(n){var t=[];return 46===n.charCodeAt(0)&&t.push(""),n.replace(tn,function(n,r,e,u){
    t.push(e?u.replace(hn,"$1"):r||n);}),t}),wo=fr(function(n,t){return hu(n)?yt(n,wt(t,1,hu,true)):[]}),mo=fr(function(n,t){var r=Ve(t);return hu(r)&&(r=T),hu(n)?yt(n,wt(t,1,hu,true),ye(r,2)):[]}),Ao=fr(function(n,t){var r=Ve(t);return hu(r)&&(r=T),hu(n)?yt(n,wt(t,1,hu,true),T,r):[]}),Eo=fr(function(n){var t=c(n,Er);return t.length&&t[0]===n[0]?Wt(t):[]}),ko=fr(function(n){var t=Ve(n),r=c(n,Er);return t===Ve(r)?t=T:r.pop(),r.length&&r[0]===n[0]?Wt(r,ye(t,2)):[]}),So=fr(function(n){var t=Ve(n),r=c(n,Er);return (t=typeof t=="function"?t:T)&&r.pop(),
    r.length&&r[0]===n[0]?Wt(r,T,t):[]}),Oo=fr(Ke),Io=pe(function(n,t){var r=null==n?0:n.length,e=ht(n,t);return ur(n,c(t,function(n){return Se(n,r)?+n:n}).sort(Wr)),e}),Ro=fr(function(n){return br(wt(n,1,hu,true))}),zo=fr(function(n){var t=Ve(n);return hu(t)&&(t=T),br(wt(n,1,hu,true),ye(t,2))}),Wo=fr(function(n){var t=Ve(n),t=typeof t=="function"?t:T;return br(wt(n,1,hu,true),T,t)}),Bo=fr(function(n,t){return hu(n)?yt(n,t):[]}),Lo=fr(function(n){return mr(i(n,hu))}),Uo=fr(function(n){var t=Ve(n);return hu(t)&&(t=T),
    mr(i(n,hu),ye(t,2))}),Co=fr(function(n){var t=Ve(n),t=typeof t=="function"?t:T;return mr(i(n,hu),T,t)}),Do=fr(He),Mo=fr(function(n){var t=n.length,t=1<t?n[t-1]:T,t=typeof t=="function"?(n.pop(),t):T;return Je(n,t)}),To=pe(function(n){function t(t){return ht(t,n)}var r=n.length,e=r?n[0]:0,u=this.__wrapped__;return !(1<r||this.__actions__.length)&&u instanceof Un&&Se(e)?(u=u.slice(e,+e+(r?1:0)),u.__actions__.push({func:Qe,args:[t],thisArg:T}),new On(u,this.__chain__).thru(function(n){return r&&!n.length&&n.push(T),
    n})):this.thru(t)}),$o=Tr(function(n,t,r){oi.call(n,r)?++n[r]:st(n,r,1);}),Fo=Gr(Ne),No=Gr(Pe),Po=Tr(function(n,t,r){oi.call(n,r)?n[r].push(t):st(n,r,[t]);}),Zo=fr(function(t,r,e){var u=-1,i=typeof r=="function",o=su(t)?Ku(t.length):[];return uo(t,function(t){o[++u]=i?n(r,t,e):Lt(t,r,e);}),o}),qo=Tr(function(n,t,r){st(n,r,t);}),Vo=Tr(function(n,t,r){n[r?0:1].push(t);},function(){return [[],[]]}),Ko=fr(function(n,t){if(null==n)return [];var r=t.length;return 1<r&&Oe(n,t[0],t[1])?t=[]:2<r&&Oe(t[0],t[1],t[2])&&(t=[t[0]]),
    Xt(n,wt(t,1),[])}),Go=ki||function(){return $n.Date.now()},Ho=fr(function(n,t,r){var e=1;if(r.length)var u=L(r,de(Ho)),e=32|e;return fe(n,e,t,r,u)}),Jo=fr(function(n,t,r){var e=3;if(r.length)var u=L(r,de(Jo)),e=32|e;return fe(t,e,n,r,u)}),Yo=fr(function(n,t){return dt(n,1,t)}),Qo=fr(function(n,t,r){return dt(n,Su(t)||0,r)});cu.Cache=Fn;var Xo=fr(function(t,r){r=1==r.length&&ff(r[0])?c(r[0],k(ye())):c(wt(r,1),k(ye()));var e=r.length;return fr(function(u){for(var i=-1,o=Ci(u.length,e);++i<o;)u[i]=r[i].call(this,u[i]);
    return n(t,this,u)})}),nf=fr(function(n,t){return fe(n,32,T,t,L(t,de(nf)))}),tf=fr(function(n,t){return fe(n,64,T,t,L(t,de(tf)))}),rf=pe(function(n,t){return fe(n,256,T,T,T,t)}),ef=ee(It),uf=ee(function(n,t){return n>=t}),of=Ut(function(){return arguments}())?Ut:function(n){return yu(n)&&oi.call(n,"callee")&&!bi.call(n,"callee")},ff=Ku.isArray,cf=Vn?k(Vn):Ct,af=zi||Vu,lf=Kn?k(Kn):Dt,sf=Gn?k(Gn):Tt,hf=Hn?k(Hn):Nt,pf=Jn?k(Jn):Pt,_f=Yn?k(Yn):Zt,vf=ee(Kt),gf=ee(function(n,t){return n<=t}),df=$r(function(n,t){
    if(ze(t)||su(t))Cr(t,Wu(t),n);else for(var r in t)oi.call(t,r)&&ot(n,r,t[r]);}),yf=$r(function(n,t){Cr(t,Bu(t),n);}),bf=$r(function(n,t,r,e){Cr(t,Bu(t),n,e);}),xf=$r(function(n,t,r,e){Cr(t,Wu(t),n,e);}),jf=pe(ht),wf=fr(function(n,t){n=Qu(n);var r=-1,e=t.length,u=2<e?t[2]:T;for(u&&Oe(t[0],t[1],u)&&(e=1);++r<e;)for(var u=t[r],i=Bu(u),o=-1,f=i.length;++o<f;){var c=i[o],a=n[c];(a===T||lu(a,ei[c])&&!oi.call(n,c))&&(n[c]=u[c]);}return n}),mf=fr(function(t){return t.push(T,ae),n(Of,T,t)}),Af=Yr(function(n,t,r){
    null!=t&&typeof t.toString!="function"&&(t=ai.call(t)),n[t]=r;},Tu($u)),Ef=Yr(function(n,t,r){null!=t&&typeof t.toString!="function"&&(t=ai.call(t)),oi.call(n,t)?n[t].push(r):n[t]=[r];},ye),kf=fr(Lt),Sf=$r(function(n,t,r){Yt(n,t,r);}),Of=$r(function(n,t,r,e){Yt(n,t,r,e);}),If=pe(function(n,t){var r={};if(null==n)return r;var e=false;t=c(t,function(t){return t=Sr(t,n),e||(e=1<t.length),t}),Cr(n,ve(n),r),e&&(r=_t(r,7,le));for(var u=t.length;u--;)xr(r,t[u]);return r}),Rf=pe(function(n,t){return null==n?{}:nr(n,t);
    }),zf=oe(Wu),Wf=oe(Bu),Bf=qr(function(n,t,r){return t=t.toLowerCase(),n+(r?Cu(t):t)}),Lf=qr(function(n,t,r){return n+(r?"-":"")+t.toLowerCase()}),Uf=qr(function(n,t,r){return n+(r?" ":"")+t.toLowerCase()}),Cf=Zr("toLowerCase"),Df=qr(function(n,t,r){return n+(r?"_":"")+t.toLowerCase()}),Mf=qr(function(n,t,r){return n+(r?" ":"")+$f(t)}),Tf=qr(function(n,t,r){return n+(r?" ":"")+t.toUpperCase()}),$f=Zr("toUpperCase"),Ff=fr(function(t,r){try{return n(t,T,r)}catch(n){return pu(n)?n:new Hu(n)}}),Nf=pe(function(n,t){
    return r(t,function(t){t=Me(t),st(n,t,Ho(n[t],n));}),n}),Pf=Hr(),Zf=Hr(true),qf=fr(function(n,t){return function(r){return Lt(r,n,t)}}),Vf=fr(function(n,t){return function(r){return Lt(n,r,t)}}),Kf=Xr(c),Gf=Xr(u),Hf=Xr(h),Jf=re(),Yf=re(true),Qf=Qr(function(n,t){return n+t},0),Xf=ie("ceil"),nc=Qr(function(n,t){return n/t},1),tc=ie("floor"),rc=Qr(function(n,t){return n*t},1),ec=ie("round"),uc=Qr(function(n,t){return n-t},0);return An.after=function(n,t){if(typeof t!="function")throw new ti("Expected a function");
    return n=Eu(n),function(){if(1>--n)return t.apply(this,arguments)}},An.ary=eu,An.assign=df,An.assignIn=yf,An.assignInWith=bf,An.assignWith=xf,An.at=jf,An.before=uu,An.bind=Ho,An.bindAll=Nf,An.bindKey=Jo,An.castArray=function(){if(!arguments.length)return [];var n=arguments[0];return ff(n)?n:[n]},An.chain=Ye,An.chunk=function(n,t,r){if(t=(r?Oe(n,t,r):t===T)?1:Ui(Eu(t),0),r=null==n?0:n.length,!r||1>t)return [];for(var e=0,u=0,i=Ku(Oi(r/t));e<r;)i[u++]=hr(n,e,e+=t);return i},An.compact=function(n){for(var t=-1,r=null==n?0:n.length,e=0,u=[];++t<r;){
    var i=n[t];i&&(u[e++]=i);}return u},An.concat=function(){var n=arguments.length;if(!n)return [];for(var t=Ku(n-1),r=arguments[0];n--;)t[n-1]=arguments[n];return a(ff(r)?Ur(r):[r],wt(t,1))},An.cond=function(t){var r=null==t?0:t.length,e=ye();return t=r?c(t,function(n){if("function"!=typeof n[1])throw new ti("Expected a function");return [e(n[0]),n[1]]}):[],fr(function(e){for(var u=-1;++u<r;){var i=t[u];if(n(i[0],this,e))return n(i[1],this,e)}})},An.conforms=function(n){return vt(_t(n,1))},An.constant=Tu,
    An.countBy=$o,An.create=function(n,t){var r=eo(n);return null==t?r:at(r,t)},An.curry=iu,An.curryRight=ou,An.debounce=fu,An.defaults=wf,An.defaultsDeep=mf,An.defer=Yo,An.delay=Qo,An.difference=wo,An.differenceBy=mo,An.differenceWith=Ao,An.drop=function(n,t,r){var e=null==n?0:n.length;return e?(t=r||t===T?1:Eu(t),hr(n,0>t?0:t,e)):[]},An.dropRight=function(n,t,r){var e=null==n?0:n.length;return e?(t=r||t===T?1:Eu(t),t=e-t,hr(n,0,0>t?0:t)):[]},An.dropRightWhile=function(n,t){return n&&n.length?jr(n,ye(t,3),true,true):[];
    },An.dropWhile=function(n,t){return n&&n.length?jr(n,ye(t,3),true):[]},An.fill=function(n,t,r,e){var u=null==n?0:n.length;if(!u)return [];for(r&&typeof r!="number"&&Oe(n,t,r)&&(r=0,e=u),u=n.length,r=Eu(r),0>r&&(r=-r>u?0:u+r),e=e===T||e>u?u:Eu(e),0>e&&(e+=u),e=r>e?0:ku(e);r<e;)n[r++]=t;return n},An.filter=function(n,t){return (ff(n)?i:jt)(n,ye(t,3))},An.flatMap=function(n,t){return wt(ru(n,t),1)},An.flatMapDeep=function(n,t){return wt(ru(n,t),$)},An.flatMapDepth=function(n,t,r){return r=r===T?1:Eu(r),
    wt(ru(n,t),r)},An.flatten=Ze,An.flattenDeep=function(n){return (null==n?0:n.length)?wt(n,$):[]},An.flattenDepth=function(n,t){return null!=n&&n.length?(t=t===T?1:Eu(t),wt(n,t)):[]},An.flip=function(n){return fe(n,512)},An.flow=Pf,An.flowRight=Zf,An.fromPairs=function(n){for(var t=-1,r=null==n?0:n.length,e={};++t<r;){var u=n[t];e[u[0]]=u[1];}return e},An.functions=function(n){return null==n?[]:Et(n,Wu(n))},An.functionsIn=function(n){return null==n?[]:Et(n,Bu(n))},An.groupBy=Po,An.initial=function(n){
    return (null==n?0:n.length)?hr(n,0,-1):[]},An.intersection=Eo,An.intersectionBy=ko,An.intersectionWith=So,An.invert=Af,An.invertBy=Ef,An.invokeMap=Zo,An.iteratee=Fu,An.keyBy=qo,An.keys=Wu,An.keysIn=Bu,An.map=ru,An.mapKeys=function(n,t){var r={};return t=ye(t,3),mt(n,function(n,e,u){st(r,t(n,e,u),n);}),r},An.mapValues=function(n,t){var r={};return t=ye(t,3),mt(n,function(n,e,u){st(r,e,t(n,e,u));}),r},An.matches=function(n){return Ht(_t(n,1))},An.matchesProperty=function(n,t){return Jt(n,_t(t,1))},An.memoize=cu,
    An.merge=Sf,An.mergeWith=Of,An.method=qf,An.methodOf=Vf,An.mixin=Nu,An.negate=au,An.nthArg=function(n){return n=Eu(n),fr(function(t){return Qt(t,n)})},An.omit=If,An.omitBy=function(n,t){return Lu(n,au(ye(t)))},An.once=function(n){return uu(2,n)},An.orderBy=function(n,t,r,e){return null==n?[]:(ff(t)||(t=null==t?[]:[t]),r=e?T:r,ff(r)||(r=null==r?[]:[r]),Xt(n,t,r))},An.over=Kf,An.overArgs=Xo,An.overEvery=Gf,An.overSome=Hf,An.partial=nf,An.partialRight=tf,An.partition=Vo,An.pick=Rf,An.pickBy=Lu,An.property=Zu,
    An.propertyOf=function(n){return function(t){return null==n?T:kt(n,t)}},An.pull=Oo,An.pullAll=Ke,An.pullAllBy=function(n,t,r){return n&&n.length&&t&&t.length?er(n,t,ye(r,2)):n},An.pullAllWith=function(n,t,r){return n&&n.length&&t&&t.length?er(n,t,T,r):n},An.pullAt=Io,An.range=Jf,An.rangeRight=Yf,An.rearg=rf,An.reject=function(n,t){return (ff(n)?i:jt)(n,au(ye(t,3)))},An.remove=function(n,t){var r=[];if(!n||!n.length)return r;var e=-1,u=[],i=n.length;for(t=ye(t,3);++e<i;){var o=n[e];t(o,e,n)&&(r.push(o),
    u.push(e));}return ur(n,u),r},An.rest=function(n,t){if(typeof n!="function")throw new ti("Expected a function");return t=t===T?t:Eu(t),fr(n,t)},An.reverse=Ge,An.sampleSize=function(n,t,r){return t=(r?Oe(n,t,r):t===T)?1:Eu(t),(ff(n)?et:ar)(n,t)},An.set=function(n,t,r){return null==n?n:lr(n,t,r)},An.setWith=function(n,t,r,e){return e=typeof e=="function"?e:T,null==n?n:lr(n,t,r,e)},An.shuffle=function(n){return (ff(n)?ut:sr)(n)},An.slice=function(n,t,r){var e=null==n?0:n.length;return e?(r&&typeof r!="number"&&Oe(n,t,r)?(t=0,
    r=e):(t=null==t?0:Eu(t),r=r===T?e:Eu(r)),hr(n,t,r)):[]},An.sortBy=Ko,An.sortedUniq=function(n){return n&&n.length?gr(n):[]},An.sortedUniqBy=function(n,t){return n&&n.length?gr(n,ye(t,2)):[]},An.split=function(n,t,r){return r&&typeof r!="number"&&Oe(n,t,r)&&(t=r=T),r=r===T?4294967295:r>>>0,r?(n=Iu(n))&&(typeof t=="string"||null!=t&&!hf(t))&&(t=yr(t),!t&&Rn.test(n))?Or(M(n),0,r):n.split(t,r):[]},An.spread=function(t,r){if(typeof t!="function")throw new ti("Expected a function");return r=null==r?0:Ui(Eu(r),0),
    fr(function(e){var u=e[r];return e=Or(e,0,r),u&&a(e,u),n(t,this,e)})},An.tail=function(n){var t=null==n?0:n.length;return t?hr(n,1,t):[]},An.take=function(n,t,r){return n&&n.length?(t=r||t===T?1:Eu(t),hr(n,0,0>t?0:t)):[]},An.takeRight=function(n,t,r){var e=null==n?0:n.length;return e?(t=r||t===T?1:Eu(t),t=e-t,hr(n,0>t?0:t,e)):[]},An.takeRightWhile=function(n,t){return n&&n.length?jr(n,ye(t,3),false,true):[]},An.takeWhile=function(n,t){return n&&n.length?jr(n,ye(t,3)):[]},An.tap=function(n,t){return t(n),
    n},An.throttle=function(n,t,r){var e=true,u=true;if(typeof n!="function")throw new ti("Expected a function");return du(r)&&(e="leading"in r?!!r.leading:e,u="trailing"in r?!!r.trailing:u),fu(n,t,{leading:e,maxWait:t,trailing:u})},An.thru=Qe,An.toArray=mu,An.toPairs=zf,An.toPairsIn=Wf,An.toPath=function(n){return ff(n)?c(n,Me):wu(n)?[n]:Ur(jo(Iu(n)))},An.toPlainObject=Ou,An.transform=function(n,t,e){var u=ff(n),i=u||af(n)||_f(n);if(t=ye(t,4),null==e){var o=n&&n.constructor;e=i?u?new o:[]:du(n)&&_u(o)?eo(di(n)):{};
    }return (i?r:mt)(n,function(n,r,u){return t(e,n,r,u)}),e},An.unary=function(n){return eu(n,1)},An.union=Ro,An.unionBy=zo,An.unionWith=Wo,An.uniq=function(n){return n&&n.length?br(n):[]},An.uniqBy=function(n,t){return n&&n.length?br(n,ye(t,2)):[]},An.uniqWith=function(n,t){return t=typeof t=="function"?t:T,n&&n.length?br(n,T,t):[]},An.unset=function(n,t){return null==n||xr(n,t)},An.unzip=He,An.unzipWith=Je,An.update=function(n,t,r){return null==n?n:lr(n,t,kr(r)(kt(n,t)),void 0)},An.updateWith=function(n,t,r,e){
    return e=typeof e=="function"?e:T,null!=n&&(n=lr(n,t,kr(r)(kt(n,t)),e)),n},An.values=Uu,An.valuesIn=function(n){return null==n?[]:S(n,Bu(n))},An.without=Bo,An.words=Mu,An.wrap=function(n,t){return nf(kr(t),n)},An.xor=Lo,An.xorBy=Uo,An.xorWith=Co,An.zip=Do,An.zipObject=function(n,t){return Ar(n||[],t||[],ot)},An.zipObjectDeep=function(n,t){return Ar(n||[],t||[],lr)},An.zipWith=Mo,An.entries=zf,An.entriesIn=Wf,An.extend=yf,An.extendWith=bf,Nu(An,An),An.add=Qf,An.attempt=Ff,An.camelCase=Bf,An.capitalize=Cu,
    An.ceil=Xf,An.clamp=function(n,t,r){return r===T&&(r=t,t=T),r!==T&&(r=Su(r),r=r===r?r:0),t!==T&&(t=Su(t),t=t===t?t:0),pt(Su(n),t,r)},An.clone=function(n){return _t(n,4)},An.cloneDeep=function(n){return _t(n,5)},An.cloneDeepWith=function(n,t){return t=typeof t=="function"?t:T,_t(n,5,t)},An.cloneWith=function(n,t){return t=typeof t=="function"?t:T,_t(n,4,t)},An.conformsTo=function(n,t){return null==t||gt(n,t,Wu(t))},An.deburr=Du,An.defaultTo=function(n,t){return null==n||n!==n?t:n},An.divide=nc,An.endsWith=function(n,t,r){
    n=Iu(n),t=yr(t);var e=n.length,e=r=r===T?e:pt(Eu(r),0,e);return r-=t.length,0<=r&&n.slice(r,e)==t},An.eq=lu,An.escape=function(n){return (n=Iu(n))&&H.test(n)?n.replace(K,nt):n},An.escapeRegExp=function(n){return (n=Iu(n))&&en.test(n)?n.replace(rn,"\\$&"):n},An.every=function(n,t,r){var e=ff(n)?u:bt;return r&&Oe(n,t,r)&&(t=T),e(n,ye(t,3))},An.find=Fo,An.findIndex=Ne,An.findKey=function(n,t){return p(n,ye(t,3),mt)},An.findLast=No,An.findLastIndex=Pe,An.findLastKey=function(n,t){return p(n,ye(t,3),At);
    },An.floor=tc,An.forEach=nu,An.forEachRight=tu,An.forIn=function(n,t){return null==n?n:oo(n,ye(t,3),Bu)},An.forInRight=function(n,t){return null==n?n:fo(n,ye(t,3),Bu)},An.forOwn=function(n,t){return n&&mt(n,ye(t,3))},An.forOwnRight=function(n,t){return n&&At(n,ye(t,3))},An.get=Ru,An.gt=ef,An.gte=uf,An.has=function(n,t){return null!=n&&we(n,t,Rt)},An.hasIn=zu,An.head=qe,An.identity=$u,An.includes=function(n,t,r,e){return n=su(n)?n:Uu(n),r=r&&!e?Eu(r):0,e=n.length,0>r&&(r=Ui(e+r,0)),ju(n)?r<=e&&-1<n.indexOf(t,r):!!e&&-1<v(n,t,r);
    },An.indexOf=function(n,t,r){var e=null==n?0:n.length;return e?(r=null==r?0:Eu(r),0>r&&(r=Ui(e+r,0)),v(n,t,r)):-1},An.inRange=function(n,t,r){return t=Au(t),r===T?(r=t,t=0):r=Au(r),n=Su(n),n>=Ci(t,r)&&n<Ui(t,r)},An.invoke=kf,An.isArguments=of,An.isArray=ff,An.isArrayBuffer=cf,An.isArrayLike=su,An.isArrayLikeObject=hu,An.isBoolean=function(n){return true===n||false===n||yu(n)&&"[object Boolean]"==Ot(n)},An.isBuffer=af,An.isDate=lf,An.isElement=function(n){return yu(n)&&1===n.nodeType&&!xu(n)},An.isEmpty=function(n){
    if(null==n)return true;if(su(n)&&(ff(n)||typeof n=="string"||typeof n.splice=="function"||af(n)||_f(n)||of(n)))return !n.length;var t=vo(n);if("[object Map]"==t||"[object Set]"==t)return !n.size;if(ze(n))return !Vt(n).length;for(var r in n)if(oi.call(n,r))return false;return true},An.isEqual=function(n,t){return Mt(n,t)},An.isEqualWith=function(n,t,r){var e=(r=typeof r=="function"?r:T)?r(n,t):T;return e===T?Mt(n,t,T,r):!!e},An.isError=pu,An.isFinite=function(n){return typeof n=="number"&&Wi(n)},An.isFunction=_u,
    An.isInteger=vu,An.isLength=gu,An.isMap=sf,An.isMatch=function(n,t){return n===t||$t(n,t,xe(t))},An.isMatchWith=function(n,t,r){return r=typeof r=="function"?r:T,$t(n,t,xe(t),r)},An.isNaN=function(n){return bu(n)&&n!=+n},An.isNative=function(n){if(go(n))throw new Hu("Unsupported core-js use. Try https://npms.io/search?q=ponyfill.");return Ft(n)},An.isNil=function(n){return null==n},An.isNull=function(n){return null===n},An.isNumber=bu,An.isObject=du,An.isObjectLike=yu,An.isPlainObject=xu,An.isRegExp=hf,
    An.isSafeInteger=function(n){return vu(n)&&-9007199254740991<=n&&9007199254740991>=n},An.isSet=pf,An.isString=ju,An.isSymbol=wu,An.isTypedArray=_f,An.isUndefined=function(n){return n===T},An.isWeakMap=function(n){return yu(n)&&"[object WeakMap]"==vo(n)},An.isWeakSet=function(n){return yu(n)&&"[object WeakSet]"==Ot(n)},An.join=function(n,t){return null==n?"":Bi.call(n,t)},An.kebabCase=Lf,An.last=Ve,An.lastIndexOf=function(n,t,r){var e=null==n?0:n.length;if(!e)return -1;var u=e;if(r!==T&&(u=Eu(r),u=0>u?Ui(e+u,0):Ci(u,e-1)),
    t===t){for(r=u+1;r--&&n[r]!==t;);n=r;}else n=_(n,d,u,true);return n},An.lowerCase=Uf,An.lowerFirst=Cf,An.lt=vf,An.lte=gf,An.max=function(n){return n&&n.length?xt(n,$u,It):T},An.maxBy=function(n,t){return n&&n.length?xt(n,ye(t,2),It):T},An.mean=function(n){return y(n,$u)},An.meanBy=function(n,t){return y(n,ye(t,2))},An.min=function(n){return n&&n.length?xt(n,$u,Kt):T},An.minBy=function(n,t){return n&&n.length?xt(n,ye(t,2),Kt):T},An.stubArray=qu,An.stubFalse=Vu,An.stubObject=function(){return {}},An.stubString=function(){
    return ""},An.stubTrue=function(){return true},An.multiply=rc,An.nth=function(n,t){return n&&n.length?Qt(n,Eu(t)):T},An.noConflict=function(){return $n._===this&&($n._=si),this},An.noop=Pu,An.now=Go,An.pad=function(n,t,r){n=Iu(n);var e=(t=Eu(t))?D(n):0;return !t||e>=t?n:(t=(t-e)/2,ne(Ii(t),r)+n+ne(Oi(t),r))},An.padEnd=function(n,t,r){n=Iu(n);var e=(t=Eu(t))?D(n):0;return t&&e<t?n+ne(t-e,r):n},An.padStart=function(n,t,r){n=Iu(n);var e=(t=Eu(t))?D(n):0;return t&&e<t?ne(t-e,r)+n:n},An.parseInt=function(n,t,r){
    return r||null==t?t=0:t&&(t=+t),Mi(Iu(n).replace(on,""),t||0)},An.random=function(n,t,r){if(r&&typeof r!="boolean"&&Oe(n,t,r)&&(t=r=T),r===T&&(typeof t=="boolean"?(r=t,t=T):typeof n=="boolean"&&(r=n,n=T)),n===T&&t===T?(n=0,t=1):(n=Au(n),t===T?(t=n,n=0):t=Au(t)),n>t){var e=n;n=t,t=e;}return r||n%1||t%1?(r=Ti(),Ci(n+r*(t-n+Cn("1e-"+((r+"").length-1))),t)):ir(n,t)},An.reduce=function(n,t,r){var e=ff(n)?l:j,u=3>arguments.length;return e(n,ye(t,4),r,u,uo)},An.reduceRight=function(n,t,r){var e=ff(n)?s:j,u=3>arguments.length;
    return e(n,ye(t,4),r,u,io)},An.repeat=function(n,t,r){return t=(r?Oe(n,t,r):t===T)?1:Eu(t),or(Iu(n),t)},An.replace=function(){var n=arguments,t=Iu(n[0]);return 3>n.length?t:t.replace(n[1],n[2])},An.result=function(n,t,r){t=Sr(t,n);var e=-1,u=t.length;for(u||(u=1,n=T);++e<u;){var i=null==n?T:n[Me(t[e])];i===T&&(e=u,i=r),n=_u(i)?i.call(n):i;}return n},An.round=ec,An.runInContext=x,An.sample=function(n){return (ff(n)?Qn:cr)(n)},An.size=function(n){if(null==n)return 0;if(su(n))return ju(n)?D(n):n.length;
    var t=vo(n);return "[object Map]"==t||"[object Set]"==t?n.size:Vt(n).length},An.snakeCase=Df,An.some=function(n,t,r){var e=ff(n)?h:pr;return r&&Oe(n,t,r)&&(t=T),e(n,ye(t,3))},An.sortedIndex=function(n,t){return _r(n,t)},An.sortedIndexBy=function(n,t,r){return vr(n,t,ye(r,2))},An.sortedIndexOf=function(n,t){var r=null==n?0:n.length;if(r){var e=_r(n,t);if(e<r&&lu(n[e],t))return e}return -1},An.sortedLastIndex=function(n,t){return _r(n,t,true)},An.sortedLastIndexBy=function(n,t,r){return vr(n,t,ye(r,2),true);
    },An.sortedLastIndexOf=function(n,t){if(null==n?0:n.length){var r=_r(n,t,true)-1;if(lu(n[r],t))return r}return -1},An.startCase=Mf,An.startsWith=function(n,t,r){return n=Iu(n),r=null==r?0:pt(Eu(r),0,n.length),t=yr(t),n.slice(r,r+t.length)==t},An.subtract=uc,An.sum=function(n){return n&&n.length?m(n,$u):0},An.sumBy=function(n,t){return n&&n.length?m(n,ye(t,2)):0},An.template=function(n,t,r){var e=An.templateSettings;r&&Oe(n,t,r)&&(t=T),n=Iu(n),t=bf({},t,e,ce),r=bf({},t.imports,e.imports,ce);var u,i,o=Wu(r),f=S(r,o),c=0;
    r=t.interpolate||jn;var a="__p+='";r=Xu((t.escape||jn).source+"|"+r.source+"|"+(r===Q?pn:jn).source+"|"+(t.evaluate||jn).source+"|$","g");var l=oi.call(t,"sourceURL")?"//# sourceURL="+(t.sourceURL+"").replace(/[\r\n]/g," ")+"\n":"";if(n.replace(r,function(t,r,e,o,f,l){return e||(e=o),a+=n.slice(c,l).replace(wn,z),r&&(u=true,a+="'+__e("+r+")+'"),f&&(i=true,a+="';"+f+";\n__p+='"),e&&(a+="'+((__t=("+e+"))==null?'':__t)+'"),c=l+t.length,t}),a+="';",(t=oi.call(t,"variable")&&t.variable)||(a="with(obj){"+a+"}"),
    a=(i?a.replace(P,""):a).replace(Z,"$1").replace(q,"$1;"),a="function("+(t||"obj")+"){"+(t?"":"obj||(obj={});")+"var __t,__p=''"+(u?",__e=_.escape":"")+(i?",__j=Array.prototype.join;function print(){__p+=__j.call(arguments,'')}":";")+a+"return __p}",t=Ff(function(){return Ju(o,l+"return "+a).apply(T,f)}),t.source=a,pu(t))throw t;return t},An.times=function(n,t){if(n=Eu(n),1>n||9007199254740991<n)return [];var r=4294967295,e=Ci(n,4294967295);for(t=ye(t),n-=4294967295,e=A(e,t);++r<n;)t(r);return e},An.toFinite=Au,
    An.toInteger=Eu,An.toLength=ku,An.toLower=function(n){return Iu(n).toLowerCase()},An.toNumber=Su,An.toSafeInteger=function(n){return n?pt(Eu(n),-9007199254740991,9007199254740991):0===n?n:0},An.toString=Iu,An.toUpper=function(n){return Iu(n).toUpperCase()},An.trim=function(n,t,r){return (n=Iu(n))&&(r||t===T)?n.replace(un,""):n&&(t=yr(t))?(n=M(n),r=M(t),t=I(n,r),r=R(n,r)+1,Or(n,t,r).join("")):n},An.trimEnd=function(n,t,r){return (n=Iu(n))&&(r||t===T)?n.replace(fn,""):n&&(t=yr(t))?(n=M(n),t=R(n,M(t))+1,
    Or(n,0,t).join("")):n},An.trimStart=function(n,t,r){return (n=Iu(n))&&(r||t===T)?n.replace(on,""):n&&(t=yr(t))?(n=M(n),t=I(n,M(t)),Or(n,t).join("")):n},An.truncate=function(n,t){var r=30,e="...";if(du(t))var u="separator"in t?t.separator:u,r="length"in t?Eu(t.length):r,e="omission"in t?yr(t.omission):e;n=Iu(n);var i=n.length;if(Rn.test(n))var o=M(n),i=o.length;if(r>=i)return n;if(i=r-D(e),1>i)return e;if(r=o?Or(o,0,i).join(""):n.slice(0,i),u===T)return r+e;if(o&&(i+=r.length-i),hf(u)){if(n.slice(i).search(u)){
    var f=r;for(u.global||(u=Xu(u.source,Iu(_n.exec(u))+"g")),u.lastIndex=0;o=u.exec(f);)var c=o.index;r=r.slice(0,c===T?i:c);}}else n.indexOf(yr(u),i)!=i&&(u=r.lastIndexOf(u),-1<u&&(r=r.slice(0,u)));return r+e},An.unescape=function(n){return (n=Iu(n))&&G.test(n)?n.replace(V,tt):n},An.uniqueId=function(n){var t=++fi;return Iu(n)+t},An.upperCase=Tf,An.upperFirst=$f,An.each=nu,An.eachRight=tu,An.first=qe,Nu(An,function(){var n={};return mt(An,function(t,r){oi.call(An.prototype,r)||(n[r]=t);}),n}(),{chain:false
    }),An.VERSION="4.17.15",r("bind bindKey curry curryRight partial partialRight".split(" "),function(n){An[n].placeholder=An;}),r(["drop","take"],function(n,t){Un.prototype[n]=function(r){r=r===T?1:Ui(Eu(r),0);var e=this.__filtered__&&!t?new Un(this):this.clone();return e.__filtered__?e.__takeCount__=Ci(r,e.__takeCount__):e.__views__.push({size:Ci(r,4294967295),type:n+(0>e.__dir__?"Right":"")}),e},Un.prototype[n+"Right"]=function(t){return this.reverse()[n](t).reverse()};}),r(["filter","map","takeWhile"],function(n,t){
    var r=t+1,e=1==r||3==r;Un.prototype[n]=function(n){var t=this.clone();return t.__iteratees__.push({iteratee:ye(n,3),type:r}),t.__filtered__=t.__filtered__||e,t};}),r(["head","last"],function(n,t){var r="take"+(t?"Right":"");Un.prototype[n]=function(){return this[r](1).value()[0]};}),r(["initial","tail"],function(n,t){var r="drop"+(t?"":"Right");Un.prototype[n]=function(){return this.__filtered__?new Un(this):this[r](1)};}),Un.prototype.compact=function(){return this.filter($u)},Un.prototype.find=function(n){
    return this.filter(n).head()},Un.prototype.findLast=function(n){return this.reverse().find(n)},Un.prototype.invokeMap=fr(function(n,t){return typeof n=="function"?new Un(this):this.map(function(r){return Lt(r,n,t)})}),Un.prototype.reject=function(n){return this.filter(au(ye(n)))},Un.prototype.slice=function(n,t){n=Eu(n);var r=this;return r.__filtered__&&(0<n||0>t)?new Un(r):(0>n?r=r.takeRight(-n):n&&(r=r.drop(n)),t!==T&&(t=Eu(t),r=0>t?r.dropRight(-t):r.take(t-n)),r)},Un.prototype.takeRightWhile=function(n){
    return this.reverse().takeWhile(n).reverse()},Un.prototype.toArray=function(){return this.take(4294967295)},mt(Un.prototype,function(n,t){var r=/^(?:filter|find|map|reject)|While$/.test(t),e=/^(?:head|last)$/.test(t),u=An[e?"take"+("last"==t?"Right":""):t],i=e||/^find/.test(t);u&&(An.prototype[t]=function(){function t(n){return n=u.apply(An,a([n],f)),e&&h?n[0]:n}var o=this.__wrapped__,f=e?[1]:arguments,c=o instanceof Un,l=f[0],s=c||ff(o);s&&r&&typeof l=="function"&&1!=l.length&&(c=s=false);var h=this.__chain__,p=!!this.__actions__.length,l=i&&!h,c=c&&!p;
    return !i&&s?(o=c?o:new Un(this),o=n.apply(o,f),o.__actions__.push({func:Qe,args:[t],thisArg:T}),new On(o,h)):l&&c?n.apply(this,f):(o=this.thru(t),l?e?o.value()[0]:o.value():o)});}),r("pop push shift sort splice unshift".split(" "),function(n){var t=ri[n],r=/^(?:push|sort|unshift)$/.test(n)?"tap":"thru",e=/^(?:pop|shift)$/.test(n);An.prototype[n]=function(){var n=arguments;if(e&&!this.__chain__){var u=this.value();return t.apply(ff(u)?u:[],n)}return this[r](function(r){return t.apply(ff(r)?r:[],n)});
    };}),mt(Un.prototype,function(n,t){var r=An[t];if(r){var e=r.name+"";oi.call(Gi,e)||(Gi[e]=[]),Gi[e].push({name:t,func:r});}}),Gi[Jr(T,2).name]=[{name:"wrapper",func:T}],Un.prototype.clone=function(){var n=new Un(this.__wrapped__);return n.__actions__=Ur(this.__actions__),n.__dir__=this.__dir__,n.__filtered__=this.__filtered__,n.__iteratees__=Ur(this.__iteratees__),n.__takeCount__=this.__takeCount__,n.__views__=Ur(this.__views__),n},Un.prototype.reverse=function(){if(this.__filtered__){var n=new Un(this);
    n.__dir__=-1,n.__filtered__=true;}else n=this.clone(),n.__dir__*=-1;return n},Un.prototype.value=function(){var n,t=this.__wrapped__.value(),r=this.__dir__,e=ff(t),u=0>r,i=e?t.length:0;n=i;for(var o=this.__views__,f=0,c=-1,a=o.length;++c<a;){var l=o[c],s=l.size;switch(l.type){case"drop":f+=s;break;case"dropRight":n-=s;break;case"take":n=Ci(n,f+s);break;case"takeRight":f=Ui(f,n-s);}}if(n={start:f,end:n},o=n.start,f=n.end,n=f-o,o=u?f:o-1,f=this.__iteratees__,c=f.length,a=0,l=Ci(n,this.__takeCount__),!e||!u&&i==n&&l==n)return wr(t,this.__actions__);
    e=[];n:for(;n--&&a<l;){for(o+=r,u=-1,i=t[o];++u<c;){var h=f[u],s=h.type,h=(0, h.iteratee)(i);if(2==s)i=h;else if(!h){if(1==s)continue n;break n}}e[a++]=i;}return e},An.prototype.at=To,An.prototype.chain=function(){return Ye(this)},An.prototype.commit=function(){return new On(this.value(),this.__chain__)},An.prototype.next=function(){this.__values__===T&&(this.__values__=mu(this.value()));var n=this.__index__>=this.__values__.length;return {done:n,value:n?T:this.__values__[this.__index__++]}},An.prototype.plant=function(n){
    for(var t,r=this;r instanceof En;){var e=Fe(r);e.__index__=0,e.__values__=T,t?u.__wrapped__=e:t=e;var u=e,r=r.__wrapped__;}return u.__wrapped__=n,t},An.prototype.reverse=function(){var n=this.__wrapped__;return n instanceof Un?(this.__actions__.length&&(n=new Un(this)),n=n.reverse(),n.__actions__.push({func:Qe,args:[Ge],thisArg:T}),new On(n,this.__chain__)):this.thru(Ge)},An.prototype.toJSON=An.prototype.valueOf=An.prototype.value=function(){return wr(this.__wrapped__,this.__actions__)},An.prototype.first=An.prototype.head,
    wi&&(An.prototype[wi]=Xe),An}();Nn?((Nn.exports=rt)._=rt,Fn._=rt):$n._=rt;}).call(commonjsGlobal);
    });

    var _mapping = createCommonjsModule(function (module, exports) {
    /** Used to map aliases to their real names. */
    exports.aliasToReal = {

      // Lodash aliases.
      'each': 'forEach',
      'eachRight': 'forEachRight',
      'entries': 'toPairs',
      'entriesIn': 'toPairsIn',
      'extend': 'assignIn',
      'extendAll': 'assignInAll',
      'extendAllWith': 'assignInAllWith',
      'extendWith': 'assignInWith',
      'first': 'head',

      // Methods that are curried variants of others.
      'conforms': 'conformsTo',
      'matches': 'isMatch',
      'property': 'get',

      // Ramda aliases.
      '__': 'placeholder',
      'F': 'stubFalse',
      'T': 'stubTrue',
      'all': 'every',
      'allPass': 'overEvery',
      'always': 'constant',
      'any': 'some',
      'anyPass': 'overSome',
      'apply': 'spread',
      'assoc': 'set',
      'assocPath': 'set',
      'complement': 'negate',
      'compose': 'flowRight',
      'contains': 'includes',
      'dissoc': 'unset',
      'dissocPath': 'unset',
      'dropLast': 'dropRight',
      'dropLastWhile': 'dropRightWhile',
      'equals': 'isEqual',
      'identical': 'eq',
      'indexBy': 'keyBy',
      'init': 'initial',
      'invertObj': 'invert',
      'juxt': 'over',
      'omitAll': 'omit',
      'nAry': 'ary',
      'path': 'get',
      'pathEq': 'matchesProperty',
      'pathOr': 'getOr',
      'paths': 'at',
      'pickAll': 'pick',
      'pipe': 'flow',
      'pluck': 'map',
      'prop': 'get',
      'propEq': 'matchesProperty',
      'propOr': 'getOr',
      'props': 'at',
      'symmetricDifference': 'xor',
      'symmetricDifferenceBy': 'xorBy',
      'symmetricDifferenceWith': 'xorWith',
      'takeLast': 'takeRight',
      'takeLastWhile': 'takeRightWhile',
      'unapply': 'rest',
      'unnest': 'flatten',
      'useWith': 'overArgs',
      'where': 'conformsTo',
      'whereEq': 'isMatch',
      'zipObj': 'zipObject'
    };

    /** Used to map ary to method names. */
    exports.aryMethod = {
      '1': [
        'assignAll', 'assignInAll', 'attempt', 'castArray', 'ceil', 'create',
        'curry', 'curryRight', 'defaultsAll', 'defaultsDeepAll', 'floor', 'flow',
        'flowRight', 'fromPairs', 'invert', 'iteratee', 'memoize', 'method', 'mergeAll',
        'methodOf', 'mixin', 'nthArg', 'over', 'overEvery', 'overSome','rest', 'reverse',
        'round', 'runInContext', 'spread', 'template', 'trim', 'trimEnd', 'trimStart',
        'uniqueId', 'words', 'zipAll'
      ],
      '2': [
        'add', 'after', 'ary', 'assign', 'assignAllWith', 'assignIn', 'assignInAllWith',
        'at', 'before', 'bind', 'bindAll', 'bindKey', 'chunk', 'cloneDeepWith',
        'cloneWith', 'concat', 'conformsTo', 'countBy', 'curryN', 'curryRightN',
        'debounce', 'defaults', 'defaultsDeep', 'defaultTo', 'delay', 'difference',
        'divide', 'drop', 'dropRight', 'dropRightWhile', 'dropWhile', 'endsWith', 'eq',
        'every', 'filter', 'find', 'findIndex', 'findKey', 'findLast', 'findLastIndex',
        'findLastKey', 'flatMap', 'flatMapDeep', 'flattenDepth', 'forEach',
        'forEachRight', 'forIn', 'forInRight', 'forOwn', 'forOwnRight', 'get',
        'groupBy', 'gt', 'gte', 'has', 'hasIn', 'includes', 'indexOf', 'intersection',
        'invertBy', 'invoke', 'invokeMap', 'isEqual', 'isMatch', 'join', 'keyBy',
        'lastIndexOf', 'lt', 'lte', 'map', 'mapKeys', 'mapValues', 'matchesProperty',
        'maxBy', 'meanBy', 'merge', 'mergeAllWith', 'minBy', 'multiply', 'nth', 'omit',
        'omitBy', 'overArgs', 'pad', 'padEnd', 'padStart', 'parseInt', 'partial',
        'partialRight', 'partition', 'pick', 'pickBy', 'propertyOf', 'pull', 'pullAll',
        'pullAt', 'random', 'range', 'rangeRight', 'rearg', 'reject', 'remove',
        'repeat', 'restFrom', 'result', 'sampleSize', 'some', 'sortBy', 'sortedIndex',
        'sortedIndexOf', 'sortedLastIndex', 'sortedLastIndexOf', 'sortedUniqBy',
        'split', 'spreadFrom', 'startsWith', 'subtract', 'sumBy', 'take', 'takeRight',
        'takeRightWhile', 'takeWhile', 'tap', 'throttle', 'thru', 'times', 'trimChars',
        'trimCharsEnd', 'trimCharsStart', 'truncate', 'union', 'uniqBy', 'uniqWith',
        'unset', 'unzipWith', 'without', 'wrap', 'xor', 'zip', 'zipObject',
        'zipObjectDeep'
      ],
      '3': [
        'assignInWith', 'assignWith', 'clamp', 'differenceBy', 'differenceWith',
        'findFrom', 'findIndexFrom', 'findLastFrom', 'findLastIndexFrom', 'getOr',
        'includesFrom', 'indexOfFrom', 'inRange', 'intersectionBy', 'intersectionWith',
        'invokeArgs', 'invokeArgsMap', 'isEqualWith', 'isMatchWith', 'flatMapDepth',
        'lastIndexOfFrom', 'mergeWith', 'orderBy', 'padChars', 'padCharsEnd',
        'padCharsStart', 'pullAllBy', 'pullAllWith', 'rangeStep', 'rangeStepRight',
        'reduce', 'reduceRight', 'replace', 'set', 'slice', 'sortedIndexBy',
        'sortedLastIndexBy', 'transform', 'unionBy', 'unionWith', 'update', 'xorBy',
        'xorWith', 'zipWith'
      ],
      '4': [
        'fill', 'setWith', 'updateWith'
      ]
    };

    /** Used to map ary to rearg configs. */
    exports.aryRearg = {
      '2': [1, 0],
      '3': [2, 0, 1],
      '4': [3, 2, 0, 1]
    };

    /** Used to map method names to their iteratee ary. */
    exports.iterateeAry = {
      'dropRightWhile': 1,
      'dropWhile': 1,
      'every': 1,
      'filter': 1,
      'find': 1,
      'findFrom': 1,
      'findIndex': 1,
      'findIndexFrom': 1,
      'findKey': 1,
      'findLast': 1,
      'findLastFrom': 1,
      'findLastIndex': 1,
      'findLastIndexFrom': 1,
      'findLastKey': 1,
      'flatMap': 1,
      'flatMapDeep': 1,
      'flatMapDepth': 1,
      'forEach': 1,
      'forEachRight': 1,
      'forIn': 1,
      'forInRight': 1,
      'forOwn': 1,
      'forOwnRight': 1,
      'map': 1,
      'mapKeys': 1,
      'mapValues': 1,
      'partition': 1,
      'reduce': 2,
      'reduceRight': 2,
      'reject': 1,
      'remove': 1,
      'some': 1,
      'takeRightWhile': 1,
      'takeWhile': 1,
      'times': 1,
      'transform': 2
    };

    /** Used to map method names to iteratee rearg configs. */
    exports.iterateeRearg = {
      'mapKeys': [1],
      'reduceRight': [1, 0]
    };

    /** Used to map method names to rearg configs. */
    exports.methodRearg = {
      'assignInAllWith': [1, 0],
      'assignInWith': [1, 2, 0],
      'assignAllWith': [1, 0],
      'assignWith': [1, 2, 0],
      'differenceBy': [1, 2, 0],
      'differenceWith': [1, 2, 0],
      'getOr': [2, 1, 0],
      'intersectionBy': [1, 2, 0],
      'intersectionWith': [1, 2, 0],
      'isEqualWith': [1, 2, 0],
      'isMatchWith': [2, 1, 0],
      'mergeAllWith': [1, 0],
      'mergeWith': [1, 2, 0],
      'padChars': [2, 1, 0],
      'padCharsEnd': [2, 1, 0],
      'padCharsStart': [2, 1, 0],
      'pullAllBy': [2, 1, 0],
      'pullAllWith': [2, 1, 0],
      'rangeStep': [1, 2, 0],
      'rangeStepRight': [1, 2, 0],
      'setWith': [3, 1, 2, 0],
      'sortedIndexBy': [2, 1, 0],
      'sortedLastIndexBy': [2, 1, 0],
      'unionBy': [1, 2, 0],
      'unionWith': [1, 2, 0],
      'updateWith': [3, 1, 2, 0],
      'xorBy': [1, 2, 0],
      'xorWith': [1, 2, 0],
      'zipWith': [1, 2, 0]
    };

    /** Used to map method names to spread configs. */
    exports.methodSpread = {
      'assignAll': { 'start': 0 },
      'assignAllWith': { 'start': 0 },
      'assignInAll': { 'start': 0 },
      'assignInAllWith': { 'start': 0 },
      'defaultsAll': { 'start': 0 },
      'defaultsDeepAll': { 'start': 0 },
      'invokeArgs': { 'start': 2 },
      'invokeArgsMap': { 'start': 2 },
      'mergeAll': { 'start': 0 },
      'mergeAllWith': { 'start': 0 },
      'partial': { 'start': 1 },
      'partialRight': { 'start': 1 },
      'without': { 'start': 1 },
      'zipAll': { 'start': 0 }
    };

    /** Used to identify methods which mutate arrays or objects. */
    exports.mutate = {
      'array': {
        'fill': true,
        'pull': true,
        'pullAll': true,
        'pullAllBy': true,
        'pullAllWith': true,
        'pullAt': true,
        'remove': true,
        'reverse': true
      },
      'object': {
        'assign': true,
        'assignAll': true,
        'assignAllWith': true,
        'assignIn': true,
        'assignInAll': true,
        'assignInAllWith': true,
        'assignInWith': true,
        'assignWith': true,
        'defaults': true,
        'defaultsAll': true,
        'defaultsDeep': true,
        'defaultsDeepAll': true,
        'merge': true,
        'mergeAll': true,
        'mergeAllWith': true,
        'mergeWith': true,
      },
      'set': {
        'set': true,
        'setWith': true,
        'unset': true,
        'update': true,
        'updateWith': true
      }
    };

    /** Used to map real names to their aliases. */
    exports.realToAlias = (function() {
      var hasOwnProperty = Object.prototype.hasOwnProperty,
          object = exports.aliasToReal,
          result = {};

      for (var key in object) {
        var value = object[key];
        if (hasOwnProperty.call(result, value)) {
          result[value].push(key);
        } else {
          result[value] = [key];
        }
      }
      return result;
    }());

    /** Used to map method names to other names. */
    exports.remap = {
      'assignAll': 'assign',
      'assignAllWith': 'assignWith',
      'assignInAll': 'assignIn',
      'assignInAllWith': 'assignInWith',
      'curryN': 'curry',
      'curryRightN': 'curryRight',
      'defaultsAll': 'defaults',
      'defaultsDeepAll': 'defaultsDeep',
      'findFrom': 'find',
      'findIndexFrom': 'findIndex',
      'findLastFrom': 'findLast',
      'findLastIndexFrom': 'findLastIndex',
      'getOr': 'get',
      'includesFrom': 'includes',
      'indexOfFrom': 'indexOf',
      'invokeArgs': 'invoke',
      'invokeArgsMap': 'invokeMap',
      'lastIndexOfFrom': 'lastIndexOf',
      'mergeAll': 'merge',
      'mergeAllWith': 'mergeWith',
      'padChars': 'pad',
      'padCharsEnd': 'padEnd',
      'padCharsStart': 'padStart',
      'propertyOf': 'get',
      'rangeStep': 'range',
      'rangeStepRight': 'rangeRight',
      'restFrom': 'rest',
      'spreadFrom': 'spread',
      'trimChars': 'trim',
      'trimCharsEnd': 'trimEnd',
      'trimCharsStart': 'trimStart',
      'zipAll': 'zip'
    };

    /** Used to track methods that skip fixing their arity. */
    exports.skipFixed = {
      'castArray': true,
      'flow': true,
      'flowRight': true,
      'iteratee': true,
      'mixin': true,
      'rearg': true,
      'runInContext': true
    };

    /** Used to track methods that skip rearranging arguments. */
    exports.skipRearg = {
      'add': true,
      'assign': true,
      'assignIn': true,
      'bind': true,
      'bindKey': true,
      'concat': true,
      'difference': true,
      'divide': true,
      'eq': true,
      'gt': true,
      'gte': true,
      'isEqual': true,
      'lt': true,
      'lte': true,
      'matchesProperty': true,
      'merge': true,
      'multiply': true,
      'overArgs': true,
      'partial': true,
      'partialRight': true,
      'propertyOf': true,
      'random': true,
      'range': true,
      'rangeRight': true,
      'subtract': true,
      'zip': true,
      'zipObject': true,
      'zipObjectDeep': true
    };
    });
    var _mapping_1 = _mapping.aliasToReal;
    var _mapping_2 = _mapping.aryMethod;
    var _mapping_3 = _mapping.aryRearg;
    var _mapping_4 = _mapping.iterateeAry;
    var _mapping_5 = _mapping.iterateeRearg;
    var _mapping_6 = _mapping.methodRearg;
    var _mapping_7 = _mapping.methodSpread;
    var _mapping_8 = _mapping.mutate;
    var _mapping_9 = _mapping.realToAlias;
    var _mapping_10 = _mapping.remap;
    var _mapping_11 = _mapping.skipFixed;
    var _mapping_12 = _mapping.skipRearg;

    /**
     * The default argument placeholder value for methods.
     *
     * @type {Object}
     */
    var placeholder = {};

    /** Built-in value reference. */
    var push = Array.prototype.push;

    /**
     * Creates a function, with an arity of `n`, that invokes `func` with the
     * arguments it receives.
     *
     * @private
     * @param {Function} func The function to wrap.
     * @param {number} n The arity of the new function.
     * @returns {Function} Returns the new function.
     */
    function baseArity(func, n) {
      return n == 2
        ? function(a, b) { return func.apply(undefined, arguments); }
        : function(a) { return func.apply(undefined, arguments); };
    }

    /**
     * Creates a function that invokes `func`, with up to `n` arguments, ignoring
     * any additional arguments.
     *
     * @private
     * @param {Function} func The function to cap arguments for.
     * @param {number} n The arity cap.
     * @returns {Function} Returns the new function.
     */
    function baseAry(func, n) {
      return n == 2
        ? function(a, b) { return func(a, b); }
        : function(a) { return func(a); };
    }

    /**
     * Creates a clone of `array`.
     *
     * @private
     * @param {Array} array The array to clone.
     * @returns {Array} Returns the cloned array.
     */
    function cloneArray(array) {
      var length = array ? array.length : 0,
          result = Array(length);

      while (length--) {
        result[length] = array[length];
      }
      return result;
    }

    /**
     * Creates a function that clones a given object using the assignment `func`.
     *
     * @private
     * @param {Function} func The assignment function.
     * @returns {Function} Returns the new cloner function.
     */
    function createCloner(func) {
      return function(object) {
        return func({}, object);
      };
    }

    /**
     * A specialized version of `_.spread` which flattens the spread array into
     * the arguments of the invoked `func`.
     *
     * @private
     * @param {Function} func The function to spread arguments over.
     * @param {number} start The start position of the spread.
     * @returns {Function} Returns the new function.
     */
    function flatSpread(func, start) {
      return function() {
        var length = arguments.length,
            lastIndex = length - 1,
            args = Array(length);

        while (length--) {
          args[length] = arguments[length];
        }
        var array = args[start],
            otherArgs = args.slice(0, start);

        if (array) {
          push.apply(otherArgs, array);
        }
        if (start != lastIndex) {
          push.apply(otherArgs, args.slice(start + 1));
        }
        return func.apply(this, otherArgs);
      };
    }

    /**
     * Creates a function that wraps `func` and uses `cloner` to clone the first
     * argument it receives.
     *
     * @private
     * @param {Function} func The function to wrap.
     * @param {Function} cloner The function to clone arguments.
     * @returns {Function} Returns the new immutable function.
     */
    function wrapImmutable(func, cloner) {
      return function() {
        var length = arguments.length;
        if (!length) {
          return;
        }
        var args = Array(length);
        while (length--) {
          args[length] = arguments[length];
        }
        var result = args[0] = cloner.apply(undefined, args);
        func.apply(undefined, args);
        return result;
      };
    }

    /**
     * The base implementation of `convert` which accepts a `util` object of methods
     * required to perform conversions.
     *
     * @param {Object} util The util object.
     * @param {string} name The name of the function to convert.
     * @param {Function} func The function to convert.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.cap=true] Specify capping iteratee arguments.
     * @param {boolean} [options.curry=true] Specify currying.
     * @param {boolean} [options.fixed=true] Specify fixed arity.
     * @param {boolean} [options.immutable=true] Specify immutable operations.
     * @param {boolean} [options.rearg=true] Specify rearranging arguments.
     * @returns {Function|Object} Returns the converted function or object.
     */
    function baseConvert(util, name, func, options) {
      var isLib = typeof name == 'function',
          isObj = name === Object(name);

      if (isObj) {
        options = func;
        func = name;
        name = undefined;
      }
      if (func == null) {
        throw new TypeError;
      }
      options || (options = {});

      var config = {
        'cap': 'cap' in options ? options.cap : true,
        'curry': 'curry' in options ? options.curry : true,
        'fixed': 'fixed' in options ? options.fixed : true,
        'immutable': 'immutable' in options ? options.immutable : true,
        'rearg': 'rearg' in options ? options.rearg : true
      };

      var defaultHolder = isLib ? func : placeholder,
          forceCurry = ('curry' in options) && options.curry,
          forceFixed = ('fixed' in options) && options.fixed,
          forceRearg = ('rearg' in options) && options.rearg,
          pristine = isLib ? func.runInContext() : undefined;

      var helpers = isLib ? func : {
        'ary': util.ary,
        'assign': util.assign,
        'clone': util.clone,
        'curry': util.curry,
        'forEach': util.forEach,
        'isArray': util.isArray,
        'isError': util.isError,
        'isFunction': util.isFunction,
        'isWeakMap': util.isWeakMap,
        'iteratee': util.iteratee,
        'keys': util.keys,
        'rearg': util.rearg,
        'toInteger': util.toInteger,
        'toPath': util.toPath
      };

      var ary = helpers.ary,
          assign = helpers.assign,
          clone = helpers.clone,
          curry = helpers.curry,
          each = helpers.forEach,
          isArray = helpers.isArray,
          isError = helpers.isError,
          isFunction = helpers.isFunction,
          isWeakMap = helpers.isWeakMap,
          keys = helpers.keys,
          rearg = helpers.rearg,
          toInteger = helpers.toInteger,
          toPath = helpers.toPath;

      var aryMethodKeys = keys(_mapping.aryMethod);

      var wrappers = {
        'castArray': function(castArray) {
          return function() {
            var value = arguments[0];
            return isArray(value)
              ? castArray(cloneArray(value))
              : castArray.apply(undefined, arguments);
          };
        },
        'iteratee': function(iteratee) {
          return function() {
            var func = arguments[0],
                arity = arguments[1],
                result = iteratee(func, arity),
                length = result.length;

            if (config.cap && typeof arity == 'number') {
              arity = arity > 2 ? (arity - 2) : 1;
              return (length && length <= arity) ? result : baseAry(result, arity);
            }
            return result;
          };
        },
        'mixin': function(mixin) {
          return function(source) {
            var func = this;
            if (!isFunction(func)) {
              return mixin(func, Object(source));
            }
            var pairs = [];
            each(keys(source), function(key) {
              if (isFunction(source[key])) {
                pairs.push([key, func.prototype[key]]);
              }
            });

            mixin(func, Object(source));

            each(pairs, function(pair) {
              var value = pair[1];
              if (isFunction(value)) {
                func.prototype[pair[0]] = value;
              } else {
                delete func.prototype[pair[0]];
              }
            });
            return func;
          };
        },
        'nthArg': function(nthArg) {
          return function(n) {
            var arity = n < 0 ? 1 : (toInteger(n) + 1);
            return curry(nthArg(n), arity);
          };
        },
        'rearg': function(rearg) {
          return function(func, indexes) {
            var arity = indexes ? indexes.length : 0;
            return curry(rearg(func, indexes), arity);
          };
        },
        'runInContext': function(runInContext) {
          return function(context) {
            return baseConvert(util, runInContext(context), options);
          };
        }
      };

      /*--------------------------------------------------------------------------*/

      /**
       * Casts `func` to a function with an arity capped iteratee if needed.
       *
       * @private
       * @param {string} name The name of the function to inspect.
       * @param {Function} func The function to inspect.
       * @returns {Function} Returns the cast function.
       */
      function castCap(name, func) {
        if (config.cap) {
          var indexes = _mapping.iterateeRearg[name];
          if (indexes) {
            return iterateeRearg(func, indexes);
          }
          var n = !isLib && _mapping.iterateeAry[name];
          if (n) {
            return iterateeAry(func, n);
          }
        }
        return func;
      }

      /**
       * Casts `func` to a curried function if needed.
       *
       * @private
       * @param {string} name The name of the function to inspect.
       * @param {Function} func The function to inspect.
       * @param {number} n The arity of `func`.
       * @returns {Function} Returns the cast function.
       */
      function castCurry(name, func, n) {
        return (forceCurry || (config.curry && n > 1))
          ? curry(func, n)
          : func;
      }

      /**
       * Casts `func` to a fixed arity function if needed.
       *
       * @private
       * @param {string} name The name of the function to inspect.
       * @param {Function} func The function to inspect.
       * @param {number} n The arity cap.
       * @returns {Function} Returns the cast function.
       */
      function castFixed(name, func, n) {
        if (config.fixed && (forceFixed || !_mapping.skipFixed[name])) {
          var data = _mapping.methodSpread[name],
              start = data && data.start;

          return start  === undefined ? ary(func, n) : flatSpread(func, start);
        }
        return func;
      }

      /**
       * Casts `func` to an rearged function if needed.
       *
       * @private
       * @param {string} name The name of the function to inspect.
       * @param {Function} func The function to inspect.
       * @param {number} n The arity of `func`.
       * @returns {Function} Returns the cast function.
       */
      function castRearg(name, func, n) {
        return (config.rearg && n > 1 && (forceRearg || !_mapping.skipRearg[name]))
          ? rearg(func, _mapping.methodRearg[name] || _mapping.aryRearg[n])
          : func;
      }

      /**
       * Creates a clone of `object` by `path`.
       *
       * @private
       * @param {Object} object The object to clone.
       * @param {Array|string} path The path to clone by.
       * @returns {Object} Returns the cloned object.
       */
      function cloneByPath(object, path) {
        path = toPath(path);

        var index = -1,
            length = path.length,
            lastIndex = length - 1,
            result = clone(Object(object)),
            nested = result;

        while (nested != null && ++index < length) {
          var key = path[index],
              value = nested[key];

          if (value != null &&
              !(isFunction(value) || isError(value) || isWeakMap(value))) {
            nested[key] = clone(index == lastIndex ? value : Object(value));
          }
          nested = nested[key];
        }
        return result;
      }

      /**
       * Converts `lodash` to an immutable auto-curried iteratee-first data-last
       * version with conversion `options` applied.
       *
       * @param {Object} [options] The options object. See `baseConvert` for more details.
       * @returns {Function} Returns the converted `lodash`.
       */
      function convertLib(options) {
        return _.runInContext.convert(options)(undefined);
      }

      /**
       * Create a converter function for `func` of `name`.
       *
       * @param {string} name The name of the function to convert.
       * @param {Function} func The function to convert.
       * @returns {Function} Returns the new converter function.
       */
      function createConverter(name, func) {
        var realName = _mapping.aliasToReal[name] || name,
            methodName = _mapping.remap[realName] || realName,
            oldOptions = options;

        return function(options) {
          var newUtil = isLib ? pristine : helpers,
              newFunc = isLib ? pristine[methodName] : func,
              newOptions = assign(assign({}, oldOptions), options);

          return baseConvert(newUtil, realName, newFunc, newOptions);
        };
      }

      /**
       * Creates a function that wraps `func` to invoke its iteratee, with up to `n`
       * arguments, ignoring any additional arguments.
       *
       * @private
       * @param {Function} func The function to cap iteratee arguments for.
       * @param {number} n The arity cap.
       * @returns {Function} Returns the new function.
       */
      function iterateeAry(func, n) {
        return overArg(func, function(func) {
          return typeof func == 'function' ? baseAry(func, n) : func;
        });
      }

      /**
       * Creates a function that wraps `func` to invoke its iteratee with arguments
       * arranged according to the specified `indexes` where the argument value at
       * the first index is provided as the first argument, the argument value at
       * the second index is provided as the second argument, and so on.
       *
       * @private
       * @param {Function} func The function to rearrange iteratee arguments for.
       * @param {number[]} indexes The arranged argument indexes.
       * @returns {Function} Returns the new function.
       */
      function iterateeRearg(func, indexes) {
        return overArg(func, function(func) {
          var n = indexes.length;
          return baseArity(rearg(baseAry(func, n), indexes), n);
        });
      }

      /**
       * Creates a function that invokes `func` with its first argument transformed.
       *
       * @private
       * @param {Function} func The function to wrap.
       * @param {Function} transform The argument transform.
       * @returns {Function} Returns the new function.
       */
      function overArg(func, transform) {
        return function() {
          var length = arguments.length;
          if (!length) {
            return func();
          }
          var args = Array(length);
          while (length--) {
            args[length] = arguments[length];
          }
          var index = config.rearg ? 0 : (length - 1);
          args[index] = transform(args[index]);
          return func.apply(undefined, args);
        };
      }

      /**
       * Creates a function that wraps `func` and applys the conversions
       * rules by `name`.
       *
       * @private
       * @param {string} name The name of the function to wrap.
       * @param {Function} func The function to wrap.
       * @returns {Function} Returns the converted function.
       */
      function wrap(name, func, placeholder) {
        var result,
            realName = _mapping.aliasToReal[name] || name,
            wrapped = func,
            wrapper = wrappers[realName];

        if (wrapper) {
          wrapped = wrapper(func);
        }
        else if (config.immutable) {
          if (_mapping.mutate.array[realName]) {
            wrapped = wrapImmutable(func, cloneArray);
          }
          else if (_mapping.mutate.object[realName]) {
            wrapped = wrapImmutable(func, createCloner(func));
          }
          else if (_mapping.mutate.set[realName]) {
            wrapped = wrapImmutable(func, cloneByPath);
          }
        }
        each(aryMethodKeys, function(aryKey) {
          each(_mapping.aryMethod[aryKey], function(otherName) {
            if (realName == otherName) {
              var data = _mapping.methodSpread[realName],
                  afterRearg = data && data.afterRearg;

              result = afterRearg
                ? castFixed(realName, castRearg(realName, wrapped, aryKey), aryKey)
                : castRearg(realName, castFixed(realName, wrapped, aryKey), aryKey);

              result = castCap(realName, result);
              result = castCurry(realName, result, aryKey);
              return false;
            }
          });
          return !result;
        });

        result || (result = wrapped);
        if (result == func) {
          result = forceCurry ? curry(result, 1) : function() {
            return func.apply(this, arguments);
          };
        }
        result.convert = createConverter(realName, func);
        result.placeholder = func.placeholder = placeholder;

        return result;
      }

      /*--------------------------------------------------------------------------*/

      if (!isObj) {
        return wrap(name, func, defaultHolder);
      }
      var _ = func;

      // Convert methods by ary cap.
      var pairs = [];
      each(aryMethodKeys, function(aryKey) {
        each(_mapping.aryMethod[aryKey], function(key) {
          var func = _[_mapping.remap[key] || key];
          if (func) {
            pairs.push([key, wrap(key, func, _)]);
          }
        });
      });

      // Convert remaining methods.
      each(keys(_), function(key) {
        var func = _[key];
        if (typeof func == 'function') {
          var length = pairs.length;
          while (length--) {
            if (pairs[length][0] == key) {
              return;
            }
          }
          func.convert = createConverter(key, func);
          pairs.push([key, func]);
        }
      });

      // Assign to `_` leaving `_.prototype` unchanged to allow chaining.
      each(pairs, function(pair) {
        _[pair[0]] = pair[1];
      });

      _.convert = convertLib;
      _.placeholder = _;

      // Assign aliases.
      each(keys(_), function(key) {
        each(_mapping.realToAlias[key] || [], function(alias) {
          _[alias] = _[key];
        });
      });

      return _;
    }

    var _baseConvert = baseConvert;

    var _ = lodash_min.runInContext();
    var fp = _baseConvert(_, _);

    /**
     * Gets the last element of `array`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Array
     * @param {Array} array The array to query.
     * @returns {*} Returns the last element of `array`.
     * @example
     *
     * _.last([1, 2, 3]);
     * // => 3
     */
    function last(array) {
      var length = array == null ? 0 : array.length;
      return length ? array[length - 1] : undefined;
    }

    var last_1 = last;

    /** `Object#toString` result references. */
    var stringTag$2 = '[object String]';

    /**
     * Checks if `value` is classified as a `String` primitive or object.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a string, else `false`.
     * @example
     *
     * _.isString('abc');
     * // => true
     *
     * _.isString(1);
     * // => false
     */
    function isString(value) {
      return typeof value == 'string' ||
        (!isArray_1$1(value) && isObjectLike_1(value) && _baseGetTag(value) == stringTag$2);
    }

    var isString_1 = isString;

    /**
     * Gets the size of an ASCII `string`.
     *
     * @private
     * @param {string} string The string inspect.
     * @returns {number} Returns the string size.
     */
    var asciiSize = _baseProperty('length');

    var _asciiSize = asciiSize;

    /** Used to compose unicode character classes. */
    var rsAstralRange = '\\ud800-\\udfff',
        rsComboMarksRange = '\\u0300-\\u036f',
        reComboHalfMarksRange = '\\ufe20-\\ufe2f',
        rsComboSymbolsRange = '\\u20d0-\\u20ff',
        rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange,
        rsVarRange = '\\ufe0e\\ufe0f';

    /** Used to compose unicode capture groups. */
    var rsZWJ = '\\u200d';

    /** Used to detect strings with [zero-width joiners or code points from the astral planes](http://eev.ee/blog/2015/09/12/dark-corners-of-unicode/). */
    var reHasUnicode = RegExp('[' + rsZWJ + rsAstralRange  + rsComboRange + rsVarRange + ']');

    /**
     * Checks if `string` contains Unicode symbols.
     *
     * @private
     * @param {string} string The string to inspect.
     * @returns {boolean} Returns `true` if a symbol is found, else `false`.
     */
    function hasUnicode(string) {
      return reHasUnicode.test(string);
    }

    var _hasUnicode = hasUnicode;

    /** Used to compose unicode character classes. */
    var rsAstralRange$1 = '\\ud800-\\udfff',
        rsComboMarksRange$1 = '\\u0300-\\u036f',
        reComboHalfMarksRange$1 = '\\ufe20-\\ufe2f',
        rsComboSymbolsRange$1 = '\\u20d0-\\u20ff',
        rsComboRange$1 = rsComboMarksRange$1 + reComboHalfMarksRange$1 + rsComboSymbolsRange$1,
        rsVarRange$1 = '\\ufe0e\\ufe0f';

    /** Used to compose unicode capture groups. */
    var rsAstral = '[' + rsAstralRange$1 + ']',
        rsCombo = '[' + rsComboRange$1 + ']',
        rsFitz = '\\ud83c[\\udffb-\\udfff]',
        rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')',
        rsNonAstral = '[^' + rsAstralRange$1 + ']',
        rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}',
        rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]',
        rsZWJ$1 = '\\u200d';

    /** Used to compose unicode regexes. */
    var reOptMod = rsModifier + '?',
        rsOptVar = '[' + rsVarRange$1 + ']?',
        rsOptJoin = '(?:' + rsZWJ$1 + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*',
        rsSeq = rsOptVar + reOptMod + rsOptJoin,
        rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')';

    /** Used to match [string symbols](https://mathiasbynens.be/notes/javascript-unicode). */
    var reUnicode = RegExp(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g');

    /**
     * Gets the size of a Unicode `string`.
     *
     * @private
     * @param {string} string The string inspect.
     * @returns {number} Returns the string size.
     */
    function unicodeSize(string) {
      var result = reUnicode.lastIndex = 0;
      while (reUnicode.test(string)) {
        ++result;
      }
      return result;
    }

    var _unicodeSize = unicodeSize;

    /**
     * Gets the number of symbols in `string`.
     *
     * @private
     * @param {string} string The string to inspect.
     * @returns {number} Returns the string size.
     */
    function stringSize(string) {
      return _hasUnicode(string)
        ? _unicodeSize(string)
        : _asciiSize(string);
    }

    var _stringSize = stringSize;

    /** `Object#toString` result references. */
    var mapTag$3 = '[object Map]',
        setTag$3 = '[object Set]';

    /**
     * Gets the size of `collection` by returning its length for array-like
     * values or the number of own enumerable string keyed properties for objects.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Collection
     * @param {Array|Object|string} collection The collection to inspect.
     * @returns {number} Returns the collection size.
     * @example
     *
     * _.size([1, 2, 3]);
     * // => 3
     *
     * _.size({ 'a': 1, 'b': 2 });
     * // => 2
     *
     * _.size('pebbles');
     * // => 7
     */
    function size(collection) {
      if (collection == null) {
        return 0;
      }
      if (isArrayLike_1(collection)) {
        return isString_1(collection) ? _stringSize(collection) : collection.length;
      }
      var tag = _getTag(collection);
      if (tag == mapTag$3 || tag == setTag$3) {
        return collection.size;
      }
      return _baseKeys(collection).length;
    }

    var size_1 = size;

    const isClassEvent = event =>
      event.type === 'addClass' || event.type === 'removeClass';

    const isShowEvent = event =>
      event.type === 'showText' ||
      event.type === 'showVideo' ||
      event.type === 'showImage';

    const logEvent = e => {
      console.log('🤡-🤡-🤡-🤡-🤡-');
      console.log('___ EVENT', e.timelineIndex);
      console.log('Will start at:', printSeconds(e.startAt));
      console.log('Will end at:', printSeconds(e.endAt));
      console.log('Event type:', e.type);
      return e
    };

    const logTimeline = timeline => {
      console.log(
        '––– Total duration:',
        printSeconds(get_1(last_1(timeline), 'endAt', 'undefined'))
      );
      console.log('––– Total events:', size_1(timeline));
      return timeline
    };

    const printSeconds = ms => Math.round(ms / 1000) + ' seconds';

    /** Used to generate unique IDs. */
    var idCounter = 0;

    /**
     * Generates a unique ID. If `prefix` is given, the ID is appended to it.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Util
     * @param {string} [prefix=''] The value to prefix the ID with.
     * @returns {string} Returns the unique ID.
     * @example
     *
     * _.uniqueId('contact_');
     * // => 'contact_104'
     *
     * _.uniqueId();
     * // => '105'
     */
    function uniqueId(prefix) {
      var id = ++idCounter;
      return toString_1(prefix) + id;
    }

    var uniqueId_1 = uniqueId;

    const addElement = (erosionMachineContainer, event) => {
      if (isClassEvent(event)) {
        try {
          event.targetEl = document.querySelector('#' + event.id);
        } catch (err) {
          console.error('Add/remove class: Target element does not exist:', err);
        }
        return event
      }

      const elementType = {
        showVideo: 'video',
        showText: 'div',
        showImage: 'img'
      };

      let elementObject = document.createElement(
        elementType[get_1(event, 'type', 'div')]
      );

      elementObject.id = get_1(event, 'id', uniqueId_1());
      elementObject.classList = get_1(event, 'class', '');
      elementObject.classList.add('timeline-event--hidden');
      elementObject.innerText = get_1(event, 'text', '');
      elementObject.style.position = 'fixed';

      // +++ Video attributes
      if (event.type === 'showVideo') {
        let sourceElement = document.createElement('source');
        sourceElement.src = event.url_mp4 ? event.url_mp4 : '';
        sourceElement.type = 'video/mp4';
        try {
          elementObject.appendChild(sourceElement);
        } catch (err) {
          console.log(err);
        }
        elementObject.loop = get_1(event, 'loop', 'false');
        elementObject.preload = 'auto';
        elementObject.crossOrigin = 'anonymous';

        let subtitlesBox = document.createElement('div');
        subtitlesBox.classList.add('subtitle-box');

        try {
          erosionMachineContainer.appendChild(subtitlesBox);
        } catch (err) {
          console.log(err);
        }

        // +++ Subtitles
        if (event.subtitles_en) {
          let subtitlesTrack = document.createElement('track');
          subtitlesTrack.kind = 'subtitles';
          subtitlesTrack.label = 'English subtitles';
          subtitlesTrack.src = event.subtitles_en;
          subtitlesTrack.srcLang = 'en';
          subtitlesTrack.default = true;
          try {
            elementObject.appendChild(subtitlesTrack);
          } catch (err) {
            console.log(err);
          }
        }

        if (event.subtitles_ru) {
          let subtitlesTrackRu = document.createElement('track');
          subtitlesTrackRu.kind = 'subtitles';
          subtitlesTrackRu.label = 'Russian subtitles';
          subtitlesTrackRu.src = event.subtitles_ru;
          subtitlesTrackRu.srcLang = 'ru';
          try {
            elementObject.appendChild(subtitlesTrackRu);
          } catch (err) {
            console.log(err);
          }
        }

        event.subtitleBoxEl = subtitlesBox;
      }

      // +++ Image src
      if (event.type === 'showImage') elementObject.src = event.src;

      try {
        erosionMachineContainer.appendChild(elementObject);
      } catch (err) {
        console.log(err);
      }

      event.el = elementObject;

      return event
    };

    const setRandomPosition = event => {
      if (event.el) {
        event.el.style.top =
          Math.floor(Math.random() * (window.innerHeight - event.el.clientHeight)) +
          'px';
        event.el.style.left =
          Math.floor(Math.random() * (window.innerWidth - event.el.clientWidth)) +
          'px';
      }
      return event
    };

    // startAt; previous event start + previous event duration
    // end:At own start time + own duration
    const calculateTime = timeline => {
      return timeline.map((e, i, arr) => {
        e.startAt = i === 0 ? 0 : arr[i - 1].startAt + arr[i - 1].duration;
        e.endAt = e.startAt + e.duration;
        e.timelineIndex = i;
        return e
      })
    };

    // startAt; assemblage start + own delay
    // endAt: assemblage end time
    const calculateTimeAssemblage = parentEvent => {
      if (parentEvent.type != 'assemblage') return parentEvent
      return get_1(parentEvent, 'events', []).map((e, i) => {
        e.startAt = parentEvent.startAt + get_1(e, 'delayed', 0);
        e.endAt = parentEvent.endAt;
        e.timelineIndex = parentEvent.timelineIndex + '.' + i;
        return e
      })
    };

    const initiateTimer = event => {
      if (isShowEvent(event)) {
        event.startTimer = setTimeout(() => {
          showEl(event);
        }, event.startAt);
        event.endTimer = setTimeout(() => {
          removeEl(event);
        }, event.startAt + event.endAt);
        return event
      }
      if (isClassEvent(event)) {
        event.startTimer = setTimeout(() => {
          if (event.type === 'addClass') addClass(event);
          if (event.type === 'removeClass') removeClass(event);
        }, event.startAt);
        return event
      }
    };

    const showEl = e => {
      e.el.classList.remove('timeline-event--hidden');
      if (e.type === 'showVideo') playVideo(e);
    };

    const removeEl = e => {
      e.el.remove();
      if (get_1('e', 'subtitleBoxEl', false)) e.subtitleBoxEl.remove();
    };

    const addClass = e => {
      if (e.targetEl) e.targetEl.classList.add(e.class);
    };
    const removeClass = e => {
      if (e.targetEl) e.targetEl.classList.remove(e.class);
    };

    const playVideo = event => {
      event.el.textTracks[0].oncuechange = function() {
        try {
          event.subtitleBoxEl.innerText = get_1(
            event.el,
            'textTracks[0].activeCues[0].text',
            ''
          );
        } catch (err) {
          console.error('💥 Error adding subtitle:', err);
        }
      };
      let promise = event.el.play();
      if (promise !== undefined) {
        promise
          .then(() => {
            console.log('Video started');
          })
          .catch(error => {
            console.error('💥 Error starting video:', error);
          });
      }
    };

    const orbBackgroundOne = writable('rgba(0,0,255,1)');
    const orbBackgroundTwo = writable('rgba(0,0,255,1)');
    const orbColorOne = writable('rgba(0,0,0,1)');
    const orbColorTwo = writable('rgba(255,255,255,1)');
    const orbPosition = writable({
      top: '10px',
      left: '10px'
    });
    const erosionMachineCounter = writable(0);
    const erosionMachineActive = writable(false);
    const activePage = writable('');
    const textContent = writable(false);
    const menuActive = writable(false);

    /* src/eeefff/ErosionMachine.svelte generated by Svelte v3.12.1 */
    const { window: window_1 } = globals;

    const file$1 = "src/eeefff/ErosionMachine.svelte";

    function create_fragment$3(ctx) {
    	var section, dispose;

    	const block = {
    		c: function create() {
    			section = element("section");
    			attr_dev(section, "class", "erosion-machine-container svelte-1ryre6j");
    			add_location(section, file$1, 136, 0, 3423);
    			dispose = listen_dev(window_1, "mousemove", throttle_1(ctx.handleMouseMove, 200));
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			ctx.section_binding(section);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(section);
    			}

    			ctx.section_binding(null);
    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$3.name, type: "component", source: "", ctx });
    	return block;
    }

    const EEEFFF_JSON =
        "https://dev.eeefff.org/data/outsourcing-paradise-parasite/erosion-machine-timeline.json";

    function instance$3($$self, $$props, $$invalidate) {
    	let $erosionMachineActive;

    	validate_store(erosionMachineActive, 'erosionMachineActive');
    	component_subscribe($$self, erosionMachineActive, $$value => { $erosionMachineActive = $$value; $$invalidate('$erosionMachineActive', $erosionMachineActive); });

    	

      // *** DOM References
      let erosionMachineContainer = {};

      // *** VARIABLES
      let counter = 0;
      let activeTimeline = [];
      let restartTimer = 0;

      const startCountdown = (delay, timeline) =>
        window.setInterval(() => {
          if (counter === delay) {
            clearTimeline();
            startTimeline(timeline);
          }
          $$invalidate('counter', counter += 1);
        }, 1000);

      const startTimeline = timeline => {
        const curriedAddElement = fp.curry(addElement)(erosionMachineContainer);
        activeTimeline = fp.flow(
          fp.shuffle,
          calculateTime,
          fp.map(calculateTimeAssemblage),
          fp.flatten,
          fp.map(curriedAddElement),
          fp.map(logEvent),
          fp.map(setRandomPosition),
          logTimeline,
          fp.map(initiateTimer)
        )(timeline);

        erosionMachineActive.set(true);

        // Restart when last event has ended
        try {
          restartTimer = setTimeout(() => {
            clearTimeline();
            startTimeline(timeline);
          }, maxBy_1(timeline, e => e.endAt).endAt);
        } catch (err) {
          console.error("Restart failed:", err);
        }
      };

      const handleMouseMove = () => {
        $$invalidate('counter', counter = 0);
        if ($erosionMachineActive) clearTimeline();
      };

      //  Clear timers, delete erosion machine content
      const clearTimeline = timeline => {
        try {
          activeTimeline.forEach(e => {
            if (get_1(e, "startTimer", false)) clearTimeout(e.startTimer);
            if (get_1(e, "endTimer", false)) clearTimeout(e.endTimer);
          });
          clearTimeout(restartTimer);
          if (erosionMachineContainer) $$invalidate('erosionMachineContainer', erosionMachineContainer.innerHTML = "", erosionMachineContainer);
          erosionMachineActive.set(false);
        } catch (err) {
          console.error("Error on clear timeline:", err);
        }
      };

      onMount(async () => {
        const response = await fetch(EEEFFF_JSON);
        const TIMELINE_JSON = await response.json();

        if (get_1(TIMELINE_JSON, "config.disabled", true)) return false;

        startCountdown(TIMELINE_JSON.config.delay, TIMELINE_JSON.timeline);
      });

      onDestroy(async () => {
        clearTimeline();
      });

    	function section_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('erosionMachineContainer', erosionMachineContainer = $$value);
    		});
    	}

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('erosionMachineContainer' in $$props) $$invalidate('erosionMachineContainer', erosionMachineContainer = $$props.erosionMachineContainer);
    		if ('counter' in $$props) $$invalidate('counter', counter = $$props.counter);
    		if ('activeTimeline' in $$props) activeTimeline = $$props.activeTimeline;
    		if ('restartTimer' in $$props) restartTimer = $$props.restartTimer;
    		if ('$erosionMachineActive' in $$props) erosionMachineActive.set($erosionMachineActive);
    	};

    	$$self.$$.update = ($$dirty = { counter: 1 }) => {
    		if ($$dirty.counter) { {
            erosionMachineCounter.set(counter);
          } }
    	};

    	return {
    		erosionMachineContainer,
    		handleMouseMove,
    		section_binding
    	};
    }

    class ErosionMachine extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "ErosionMachine", options, id: create_fragment$3.name });
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }
    function quartOut(t) {
        return Math.pow(t - 1.0, 3.0) * (1.0 - t) + 1.0;
    }

    function fade(node, { delay = 0, duration = 400 }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    /* src/Menu.svelte generated by Svelte v3.12.1 */

    const file$2 = "src/Menu.svelte";

    // (176:6) {#if active}
    function create_if_block$1(ctx) {
    	var div0, div0_intro, div0_outro, t0, div1, div1_intro, div1_outro, t1, div2, div2_intro, div2_outro, t2, div3, div3_intro, div3_outro, t3, div4, div4_intro, div4_outro, t4, div5, div5_intro, div5_outro, current;

    	var link0 = new Link({
    		props: {
    		to: "liquid-fiction",
    		$$slots: { default: [create_default_slot_6] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var link1 = new Link({
    		props: {
    		to: "editorial",
    		$$slots: { default: [create_default_slot_5] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var link2 = new Link({
    		props: {
    		to: "cycle-1",
    		$$slots: { default: [create_default_slot_4] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var link3 = new Link({
    		props: {
    		to: "alina-chaiderov",
    		$$slots: { default: [create_default_slot_3] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var link4 = new Link({
    		props: {
    		to: "eeefff",
    		$$slots: { default: [create_default_slot_2] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var link5 = new Link({
    		props: {
    		to: "olof-marsja",
    		$$slots: { default: [create_default_slot_1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			link0.$$.fragment.c();
    			t0 = space();
    			div1 = element("div");
    			link1.$$.fragment.c();
    			t1 = space();
    			div2 = element("div");
    			link2.$$.fragment.c();
    			t2 = space();
    			div3 = element("div");
    			link3.$$.fragment.c();
    			t3 = space();
    			div4 = element("div");
    			link4.$$.fragment.c();
    			t4 = space();
    			div5 = element("div");
    			link5.$$.fragment.c();
    			attr_dev(div0, "class", "item svelte-1xo260f");
    			add_location(div0, file$2, 176, 8, 4397);
    			attr_dev(div1, "class", "item svelte-1xo260f");
    			add_location(div1, file$2, 185, 8, 4743);
    			attr_dev(div2, "class", "item svelte-1xo260f");
    			add_location(div2, file$2, 194, 8, 5076);
    			attr_dev(div3, "class", "item svelte-1xo260f");
    			add_location(div3, file$2, 203, 8, 5407);
    			attr_dev(div4, "class", "item svelte-1xo260f");
    			add_location(div4, file$2, 214, 8, 5812);
    			attr_dev(div5, "class", "item svelte-1xo260f");
    			add_location(div5, file$2, 223, 8, 6136);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			mount_component(link0, div0, null);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			mount_component(link1, div1, null);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			mount_component(link2, div2, null);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div3, anchor);
    			mount_component(link3, div3, null);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div4, anchor);
    			mount_component(link4, div4, null);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div5, anchor);
    			mount_component(link5, div5, null);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(link0.$$.fragment, local);

    			add_render_callback(() => {
    				if (div0_outro) div0_outro.end(1);
    				if (!div0_intro) div0_intro = create_in_transition(div0, fly, { duration: 400, y: 20, delay: 0, easing: quartOut });
    				div0_intro.start();
    			});

    			transition_in(link1.$$.fragment, local);

    			add_render_callback(() => {
    				if (div1_outro) div1_outro.end(1);
    				if (!div1_intro) div1_intro = create_in_transition(div1, fly, { duration: 400, y: 20, delay: 100, easing: quartOut });
    				div1_intro.start();
    			});

    			transition_in(link2.$$.fragment, local);

    			add_render_callback(() => {
    				if (div2_outro) div2_outro.end(1);
    				if (!div2_intro) div2_intro = create_in_transition(div2, fly, { duration: 400, y: 20, delay: 200, easing: quartOut });
    				div2_intro.start();
    			});

    			transition_in(link3.$$.fragment, local);

    			add_render_callback(() => {
    				if (div3_outro) div3_outro.end(1);
    				if (!div3_intro) div3_intro = create_in_transition(div3, fly, { duration: 400, y: 20, delay: 300, easing: quartOut });
    				div3_intro.start();
    			});

    			transition_in(link4.$$.fragment, local);

    			add_render_callback(() => {
    				if (div4_outro) div4_outro.end(1);
    				if (!div4_intro) div4_intro = create_in_transition(div4, fly, { duration: 400, y: 20, delay: 400, easing: quartOut });
    				div4_intro.start();
    			});

    			transition_in(link5.$$.fragment, local);

    			add_render_callback(() => {
    				if (div5_outro) div5_outro.end(1);
    				if (!div5_intro) div5_intro = create_in_transition(div5, fly, { duration: 400, y: 20, delay: 500, easing: quartOut });
    				div5_intro.start();
    			});

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(link0.$$.fragment, local);
    			if (div0_intro) div0_intro.invalidate();

    			div0_outro = create_out_transition(div0, fly, { duration: 300, y: 60, delay: 500 });

    			transition_out(link1.$$.fragment, local);
    			if (div1_intro) div1_intro.invalidate();

    			div1_outro = create_out_transition(div1, fly, { duration: 300, y: 60, delay: 400 });

    			transition_out(link2.$$.fragment, local);
    			if (div2_intro) div2_intro.invalidate();

    			div2_outro = create_out_transition(div2, fly, { duration: 300, y: 60, delay: 300 });

    			transition_out(link3.$$.fragment, local);
    			if (div3_intro) div3_intro.invalidate();

    			div3_outro = create_out_transition(div3, fly, { duration: 300, y: 60, delay: 200 });

    			transition_out(link4.$$.fragment, local);
    			if (div4_intro) div4_intro.invalidate();

    			div4_outro = create_out_transition(div4, fly, { duration: 300, y: 60, delay: 100 });

    			transition_out(link5.$$.fragment, local);
    			if (div5_intro) div5_intro.invalidate();

    			div5_outro = create_out_transition(div5, fly, { duration: 300, y: 60, delay: 0 });

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div0);
    			}

    			destroy_component(link0);

    			if (detaching) {
    				if (div0_outro) div0_outro.end();
    				detach_dev(t0);
    				detach_dev(div1);
    			}

    			destroy_component(link1);

    			if (detaching) {
    				if (div1_outro) div1_outro.end();
    				detach_dev(t1);
    				detach_dev(div2);
    			}

    			destroy_component(link2);

    			if (detaching) {
    				if (div2_outro) div2_outro.end();
    				detach_dev(t2);
    				detach_dev(div3);
    			}

    			destroy_component(link3);

    			if (detaching) {
    				if (div3_outro) div3_outro.end();
    				detach_dev(t3);
    				detach_dev(div4);
    			}

    			destroy_component(link4);

    			if (detaching) {
    				if (div4_outro) div4_outro.end();
    				detach_dev(t4);
    				detach_dev(div5);
    			}

    			destroy_component(link5);

    			if (detaching) {
    				if (div5_outro) div5_outro.end();
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block$1.name, type: "if", source: "(176:6) {#if active}", ctx });
    	return block;
    }

    // (181:10) <Link to="liquid-fiction">
    function create_default_slot_6(ctx) {
    	var span0, t_1, span1;

    	const block = {
    		c: function create() {
    			span0 = element("span");
    			span0.textContent = "LIQUID FICTION";
    			t_1 = space();
    			span1 = element("span");
    			span1.textContent = "FICTION LIQUID";
    			attr_dev(span0, "class", "line-1 svelte-1xo260f");
    			add_location(span0, file$2, 181, 12, 4604);
    			attr_dev(span1, "class", "line-2 svelte-1xo260f");
    			add_location(span1, file$2, 182, 12, 4659);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, span0, anchor);
    			insert_dev(target, t_1, anchor);
    			insert_dev(target, span1, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(span0);
    				detach_dev(t_1);
    				detach_dev(span1);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_6.name, type: "slot", source: "(181:10) <Link to=\"liquid-fiction\">", ctx });
    	return block;
    }

    // (190:10) <Link to="editorial">
    function create_default_slot_5(ctx) {
    	var span0, t_1, span1;

    	const block = {
    		c: function create() {
    			span0 = element("span");
    			span0.textContent = "EDITORIAL";
    			t_1 = space();
    			span1 = element("span");
    			span1.textContent = "TXTXTXTXT";
    			attr_dev(span0, "class", "line-1 svelte-1xo260f");
    			add_location(span0, file$2, 190, 12, 4947);
    			attr_dev(span1, "class", "line-2 svelte-1xo260f");
    			add_location(span1, file$2, 191, 12, 4997);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, span0, anchor);
    			insert_dev(target, t_1, anchor);
    			insert_dev(target, span1, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(span0);
    				detach_dev(t_1);
    				detach_dev(span1);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_5.name, type: "slot", source: "(190:10) <Link to=\"editorial\">", ctx });
    	return block;
    }

    // (199:10) <Link to="cycle-1">
    function create_default_slot_4(ctx) {
    	var span0, t_1, span1;

    	const block = {
    		c: function create() {
    			span0 = element("span");
    			span0.textContent = "CYCLE ONE";
    			t_1 = space();
    			span1 = element("span");
    			span1.textContent = "11111 >>>";
    			attr_dev(span0, "class", "line-1 svelte-1xo260f");
    			add_location(span0, file$2, 199, 12, 5278);
    			attr_dev(span1, "class", "line-2 svelte-1xo260f");
    			add_location(span1, file$2, 200, 12, 5328);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, span0, anchor);
    			insert_dev(target, t_1, anchor);
    			insert_dev(target, span1, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(span0);
    				detach_dev(t_1);
    				detach_dev(span1);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_4.name, type: "slot", source: "(199:10) <Link to=\"cycle-1\">", ctx });
    	return block;
    }

    // (208:10) <Link to="alina-chaiderov">
    function create_default_slot_3(ctx) {
    	var span0, t_1, span1;

    	const block = {
    		c: function create() {
    			span0 = element("span");
    			span0.textContent = "Alina Chaiderov";
    			t_1 = space();
    			span1 = element("span");
    			span1.textContent = "~~~~~_~~~~~~~~~";
    			attr_dev(span0, "class", "line-1 svelte-1xo260f");
    			add_location(span0, file$2, 208, 12, 5617);
    			attr_dev(span1, "class", "line-2 svelte-1xo260f");
    			add_location(span1, file$2, 209, 12, 5673);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, span0, anchor);
    			insert_dev(target, t_1, anchor);
    			insert_dev(target, span1, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(span0);
    				detach_dev(t_1);
    				detach_dev(span1);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_3.name, type: "slot", source: "(208:10) <Link to=\"alina-chaiderov\">", ctx });
    	return block;
    }

    // (219:10) <Link to="eeefff">
    function create_default_slot_2(ctx) {
    	var span0, t_1, span1;

    	const block = {
    		c: function create() {
    			span0 = element("span");
    			span0.textContent = "eeefff";
    			t_1 = space();
    			span1 = element("span");
    			span1.textContent = "~~~~~~";
    			attr_dev(span0, "class", "line-1 svelte-1xo260f");
    			add_location(span0, file$2, 219, 12, 6013);
    			attr_dev(span1, "class", "line-2 svelte-1xo260f");
    			add_location(span1, file$2, 220, 12, 6060);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, span0, anchor);
    			insert_dev(target, t_1, anchor);
    			insert_dev(target, span1, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(span0);
    				detach_dev(t_1);
    				detach_dev(span1);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_2.name, type: "slot", source: "(219:10) <Link to=\"eeefff\">", ctx });
    	return block;
    }

    // (228:10) <Link to="olof-marsja">
    function create_default_slot_1(ctx) {
    	var span0, t_1, span1;

    	const block = {
    		c: function create() {
    			span0 = element("span");
    			span0.textContent = "Olof Marsja";
    			t_1 = space();
    			span1 = element("span");
    			span1.textContent = "~~~~_~~~~~~";
    			attr_dev(span0, "class", "line-1 svelte-1xo260f");
    			add_location(span0, file$2, 228, 12, 6340);
    			attr_dev(span1, "class", "line-2 svelte-1xo260f");
    			add_location(span1, file$2, 229, 12, 6392);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, span0, anchor);
    			insert_dev(target, t_1, anchor);
    			insert_dev(target, span1, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(span0);
    				detach_dev(t_1);
    				detach_dev(span1);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_1.name, type: "slot", source: "(228:10) <Link to=\"olof-marsja\">", ctx });
    	return block;
    }

    // (174:2) <Router>
    function create_default_slot(ctx) {
    	var div, current;

    	var if_block = (ctx.active) && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "inner");
    			add_location(div, file$2, 174, 4, 4350);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.active) {
    				if (!if_block) {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				} else transition_in(if_block, 1);
    			} else if (if_block) {
    				group_outros();
    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}

    			if (if_block) if_block.d();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot.name, type: "slot", source: "(174:2) <Router>", ctx });
    	return block;
    }

    function create_fragment$4(ctx) {
    	var div2, t, div1, div0, svg, defs, clipPath, rect, title, t_1, g, path, current, dispose;

    	var router = new Router({
    		props: {
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			router.$$.fragment.c();
    			t = space();
    			div1 = element("div");
    			div0 = element("div");
    			svg = svg_element("svg");
    			defs = svg_element("defs");
    			clipPath = svg_element("clipPath");
    			rect = svg_element("rect");
    			title = svg_element("title");
    			t_1 = text("cross");
    			g = svg_element("g");
    			path = svg_element("path");
    			attr_dev(rect, "class", "cls-1 svelte-1xo260f");
    			attr_dev(rect, "x", "1.08");
    			attr_dev(rect, "y", "0.65");
    			attr_dev(rect, "width", "55.46");
    			attr_dev(rect, "height", "55.39");
    			add_location(rect, file$2, 244, 12, 6787);
    			attr_dev(clipPath, "id", "clip-path");
    			attr_dev(clipPath, "transform", "translate(-1.08 -0.65)");
    			add_location(clipPath, file$2, 243, 10, 6714);
    			add_location(defs, file$2, 242, 8, 6697);
    			add_location(title, file$2, 252, 8, 6973);
    			attr_dev(path, "class", "cls-3 svelte-1xo260f");
    			attr_dev(path, "d", "M2.12,49a3.91,3.91,0,0,0-1,2.4,3.08,3.08,0,0,0,1,2.41l1.23,1.23A3.37,3.37,0,0,0,5.69,56a3.12,3.12,0,0,0,2.47-.89L27.38,35.59a1.55,1.55,0,0,1,2.47,0L49.34,54.94A3,3,0,0,0,51.67,56a3.37,3.37,0,0,0,2.47-1.1l1.38-1.23a2.88,2.88,0,0,0,1-2.4,3.62,3.62,0,0,0-1-2.41L36,29.41a1.55,1.55,0,0,1,0-2.47L55.52,7.72a3.18,3.18,0,0,0,.89-2.47,3.45,3.45,0,0,0-.89-2.33L54.28,1.68a3.2,3.2,0,0,0-2.47-1,3.44,3.44,0,0,0-2.33,1L30,20.9a1.4,1.4,0,0,1-2.33,0L8.16,1.68a2.84,2.84,0,0,0-2.27-1,3.51,3.51,0,0,0-2.54,1.1L2.12,2.92a3.21,3.21,0,0,0-1,2.54,3.48,3.48,0,0,0,1,2.4L21.34,27.22a1.66,1.66,0,0,1,0,2.47Z");
    			attr_dev(path, "transform", "translate(-1.08 -0.65)");
    			add_location(path, file$2, 254, 10, 7030);
    			attr_dev(g, "class", "cls-2 svelte-1xo260f");
    			add_location(g, file$2, 253, 8, 7002);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "viewBox", "0 0 55.46 55.39");
    			attr_dev(svg, "class", "svelte-1xo260f");
    			add_location(svg, file$2, 238, 6, 6555);
    			attr_dev(div0, "class", "inner-1");
    			add_location(div0, file$2, 237, 4, 6527);
    			attr_dev(div1, "class", "close svelte-1xo260f");
    			add_location(div1, file$2, 236, 2, 6503);
    			attr_dev(div2, "class", "menu svelte-1xo260f");
    			toggle_class(div2, "active", ctx.active);
    			add_location(div2, file$2, 166, 0, 4250);
    			dispose = listen_dev(div2, "click", ctx.click_handler);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			mount_component(router, div2, null);
    			append_dev(div2, t);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, svg);
    			append_dev(svg, defs);
    			append_dev(defs, clipPath);
    			append_dev(clipPath, rect);
    			append_dev(svg, title);
    			append_dev(title, t_1);
    			append_dev(svg, g);
    			append_dev(g, path);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var router_changes = {};
    			if (changed.$$scope || changed.active) router_changes.$$scope = { changed, ctx };
    			router.$set(router_changes);

    			if (changed.active) {
    				toggle_class(div2, "active", ctx.active);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div2);
    			}

    			destroy_component(router);

    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$4.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	

      // const handleExit = () => {
      //   exit = true;
      //   setTimeout(() => {
      //     exit = false;
      //   }, 1000);
      // };

      // *** VARIABLES
      let { active = false } = $$props;
      const dispatch = createEventDispatcher();
      // export let exit = false;

    	const writable_props = ['active'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Menu> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    	    dispatch('close');
    	  };

    	$$self.$set = $$props => {
    		if ('active' in $$props) $$invalidate('active', active = $$props.active);
    	};

    	$$self.$capture_state = () => {
    		return { active };
    	};

    	$$self.$inject_state = $$props => {
    		if ('active' in $$props) $$invalidate('active', active = $$props.active);
    	};

    	$$self.$$.update = ($$dirty = { active: 1 }) => {
    		if ($$dirty.active) { {
            menuActive.set(active);
          } }
    	};

    	return { active, dispatch, click_handler };
    }

    class Menu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, ["active"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Menu", options, id: create_fragment$4.name });
    	}

    	get active() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Orb.svelte generated by Svelte v3.12.1 */

    const file$3 = "src/Orb.svelte";

    function create_fragment$5(ctx) {
    	var div5, div2, div0, t1, div1, t3, div4, div3, t4, current, dispose;

    	var menu = new Menu({
    		props: { active: ctx.$menuActive },
    		$$inline: true
    	});
    	menu.$on("close", ctx.close_handler);

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "LIQUID~";
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "FICTION";
    			t3 = space();
    			div4 = element("div");
    			div3 = element("div");
    			t4 = space();
    			menu.$$.fragment.c();
    			attr_dev(div0, "class", "inner-1 svelte-7ywk0j");
    			add_location(div0, file$3, 154, 4, 3446);
    			attr_dev(div1, "class", "inner-2 svelte-7ywk0j");
    			add_location(div1, file$3, 155, 4, 3509);
    			attr_dev(div2, "class", "nav-text svelte-7ywk0j");
    			toggle_class(div2, "scrolling", scrolling);
    			add_location(div2, file$3, 153, 2, 3403);
    			attr_dev(div3, "class", "spinner-half svelte-7ywk0j");
    			add_location(div3, file$3, 158, 4, 3634);
    			attr_dev(div4, "id", "spinner");
    			attr_dev(div4, "class", "spinner svelte-7ywk0j");
    			toggle_class(div4, "scrolling", scrolling);
    			add_location(div4, file$3, 157, 2, 3579);
    			attr_dev(div5, "class", "orb svelte-7ywk0j");
    			toggle_class(div5, "inactive", ctx.$menuActive);
    			toggle_class(div5, "hidden", ctx.$activePage === 'landing');
    			add_location(div5, file$3, 145, 0, 3224);
    			dispose = listen_dev(div5, "click", ctx.click_handler);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div2);
    			append_dev(div2, div0);
    			ctx.div0_binding(div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			ctx.div1_binding(div1);
    			append_dev(div5, t3);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			ctx.div5_binding(div5);
    			insert_dev(target, t4, anchor);
    			mount_component(menu, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.scrolling) {
    				toggle_class(div2, "scrolling", scrolling);
    				toggle_class(div4, "scrolling", scrolling);
    			}

    			if (changed.$menuActive) {
    				toggle_class(div5, "inactive", ctx.$menuActive);
    			}

    			if (changed.$activePage) {
    				toggle_class(div5, "hidden", ctx.$activePage === 'landing');
    			}

    			var menu_changes = {};
    			if (changed.$menuActive) menu_changes.active = ctx.$menuActive;
    			menu.$set(menu_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(menu.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(menu.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div5);
    			}

    			ctx.div0_binding(null);
    			ctx.div1_binding(null);
    			ctx.div5_binding(null);

    			if (detaching) {
    				detach_dev(t4);
    			}

    			destroy_component(menu, detaching);

    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$5.name, type: "component", source: "", ctx });
    	return block;
    }

    let y = 0;

    let scrolling = false;

    let menuExit = false;

    function instance$5($$self, $$props, $$invalidate) {
    	let $orbBackgroundOne, $orbColorOne, $orbBackgroundTwo, $orbColorTwo, $orbPosition, $menuActive, $activePage;

    	validate_store(orbBackgroundOne, 'orbBackgroundOne');
    	component_subscribe($$self, orbBackgroundOne, $$value => { $orbBackgroundOne = $$value; $$invalidate('$orbBackgroundOne', $orbBackgroundOne); });
    	validate_store(orbColorOne, 'orbColorOne');
    	component_subscribe($$self, orbColorOne, $$value => { $orbColorOne = $$value; $$invalidate('$orbColorOne', $orbColorOne); });
    	validate_store(orbBackgroundTwo, 'orbBackgroundTwo');
    	component_subscribe($$self, orbBackgroundTwo, $$value => { $orbBackgroundTwo = $$value; $$invalidate('$orbBackgroundTwo', $orbBackgroundTwo); });
    	validate_store(orbColorTwo, 'orbColorTwo');
    	component_subscribe($$self, orbColorTwo, $$value => { $orbColorTwo = $$value; $$invalidate('$orbColorTwo', $orbColorTwo); });
    	validate_store(orbPosition, 'orbPosition');
    	component_subscribe($$self, orbPosition, $$value => { $orbPosition = $$value; $$invalidate('$orbPosition', $orbPosition); });
    	validate_store(menuActive, 'menuActive');
    	component_subscribe($$self, menuActive, $$value => { $menuActive = $$value; $$invalidate('$menuActive', $menuActive); });
    	validate_store(activePage, 'activePage');
    	component_subscribe($$self, activePage, $$value => { $activePage = $$value; $$invalidate('$activePage', $activePage); });

    	

      let orbObject = {};
      let orbInnerOne = {};
      let orbInnerTwo = {};

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('orbInnerOne', orbInnerOne = $$value);
    		});
    	}

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('orbInnerTwo', orbInnerTwo = $$value);
    		});
    	}

    	function div5_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('orbObject', orbObject = $$value);
    		});
    	}

    	const click_handler = () => {
    	    menuActive.set(!$menuActive);
    	  };

    	const close_handler = () => {
    	    menuActive.set(false);
    	  };

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('orbObject' in $$props) $$invalidate('orbObject', orbObject = $$props.orbObject);
    		if ('orbInnerOne' in $$props) $$invalidate('orbInnerOne', orbInnerOne = $$props.orbInnerOne);
    		if ('orbInnerTwo' in $$props) $$invalidate('orbInnerTwo', orbInnerTwo = $$props.orbInnerTwo);
    		if ('y' in $$props) y = $$props.y;
    		if ('scrolling' in $$props) $$invalidate('scrolling', scrolling = $$props.scrolling);
    		if ('menuExit' in $$props) menuExit = $$props.menuExit;
    		if ('$orbBackgroundOne' in $$props) orbBackgroundOne.set($orbBackgroundOne);
    		if ('$orbColorOne' in $$props) orbColorOne.set($orbColorOne);
    		if ('$orbBackgroundTwo' in $$props) orbBackgroundTwo.set($orbBackgroundTwo);
    		if ('$orbColorTwo' in $$props) orbColorTwo.set($orbColorTwo);
    		if ('$orbPosition' in $$props) orbPosition.set($orbPosition);
    		if ('$menuActive' in $$props) menuActive.set($menuActive);
    		if ('$activePage' in $$props) activePage.set($activePage);
    	};

    	$$self.$$.update = ($$dirty = { orbInnerOne: 1, $orbBackgroundOne: 1, $orbColorOne: 1, orbInnerTwo: 1, $orbBackgroundTwo: 1, $orbColorTwo: 1, orbObject: 1, $orbPosition: 1 }) => {
    		if ($$dirty.orbInnerOne || $$dirty.$orbBackgroundOne || $$dirty.$orbColorOne || $$dirty.orbInnerTwo || $$dirty.$orbBackgroundTwo || $$dirty.$orbColorTwo || $$dirty.orbObject || $$dirty.$orbPosition) { {
            TweenMax.to(orbInnerOne, 0.1, {
              css: { background: $orbBackgroundOne, color: $orbColorOne }
            });
        
            TweenMax.to(orbInnerTwo, 0.1, {
              css: { background: $orbBackgroundTwo, color: $orbColorTwo }
            });
        
            TweenMax.to(orbObject, 2, {
              top: $orbPosition.top,
              left: $orbPosition.left,
              ease: Power4.easeOut
            });
          } }
    	};

    	return {
    		orbObject,
    		orbInnerOne,
    		orbInnerTwo,
    		$menuActive,
    		$activePage,
    		div0_binding,
    		div1_binding,
    		div5_binding,
    		click_handler,
    		close_handler
    	};
    }

    class Orb extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Orb", options, id: create_fragment$5.name });
    	}
    }

    /** Built-in value references. */
    var spreadableSymbol = _Symbol ? _Symbol.isConcatSpreadable : undefined;

    /**
     * Checks if `value` is a flattenable `arguments` object or array.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is flattenable, else `false`.
     */
    function isFlattenable(value) {
      return isArray_1$1(value) || isArguments_1(value) ||
        !!(spreadableSymbol && value && value[spreadableSymbol]);
    }

    var _isFlattenable = isFlattenable;

    /**
     * The base implementation of `_.flatten` with support for restricting flattening.
     *
     * @private
     * @param {Array} array The array to flatten.
     * @param {number} depth The maximum recursion depth.
     * @param {boolean} [predicate=isFlattenable] The function invoked per iteration.
     * @param {boolean} [isStrict] Restrict to values that pass `predicate` checks.
     * @param {Array} [result=[]] The initial result value.
     * @returns {Array} Returns the new flattened array.
     */
    function baseFlatten(array, depth, predicate, isStrict, result) {
      var index = -1,
          length = array.length;

      predicate || (predicate = _isFlattenable);
      result || (result = []);

      while (++index < length) {
        var value = array[index];
        if (depth > 0 && predicate(value)) {
          if (depth > 1) {
            // Recursively flatten arrays (susceptible to call stack limits).
            baseFlatten(value, depth - 1, predicate, isStrict, result);
          } else {
            _arrayPush(result, value);
          }
        } else if (!isStrict) {
          result[result.length] = value;
        }
      }
      return result;
    }

    var _baseFlatten = baseFlatten;

    /**
     * Copies the values of `source` to `array`.
     *
     * @private
     * @param {Array} source The array to copy values from.
     * @param {Array} [array=[]] The array to copy values to.
     * @returns {Array} Returns `array`.
     */
    function copyArray(source, array) {
      var index = -1,
          length = source.length;

      array || (array = Array(length));
      while (++index < length) {
        array[index] = source[index];
      }
      return array;
    }

    var _copyArray = copyArray;

    /**
     * Creates a new array concatenating `array` with any additional arrays
     * and/or values.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Array
     * @param {Array} array The array to concatenate.
     * @param {...*} [values] The values to concatenate.
     * @returns {Array} Returns the new concatenated array.
     * @example
     *
     * var array = [1];
     * var other = _.concat(array, 2, [3], [[4]]);
     *
     * console.log(other);
     * // => [1, 2, 3, [4]]
     *
     * console.log(array);
     * // => [1]
     */
    function concat$1() {
      var length = arguments.length;
      if (!length) {
        return [];
      }
      var args = Array(length - 1),
          array = arguments[0],
          index = length;

      while (index--) {
        args[index - 1] = arguments[index];
      }
      return _arrayPush(isArray_1$1(array) ? _copyArray(array) : [array], _baseFlatten(args, 1));
    }

    var concat_1 = concat$1;

    /* src/Pane.svelte generated by Svelte v3.12.1 */

    const file$4 = "src/Pane.svelte";

    function create_fragment$6(ctx) {
    	var div2, html_tag, raw_value = renderBlockText(ctx.essay.content) + "", t, div1, div0, svg, defs, clipPath, rect, title, t_1, g, path, div2_intro, dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			t = space();
    			div1 = element("div");
    			div0 = element("div");
    			svg = svg_element("svg");
    			defs = svg_element("defs");
    			clipPath = svg_element("clipPath");
    			rect = svg_element("rect");
    			title = svg_element("title");
    			t_1 = text("cross");
    			g = svg_element("g");
    			path = svg_element("path");
    			html_tag = new HtmlTag(raw_value, t);
    			attr_dev(rect, "class", "cls-1 svelte-1gdi6mm");
    			attr_dev(rect, "x", "1.08");
    			attr_dev(rect, "y", "0.65");
    			attr_dev(rect, "width", "55.46");
    			attr_dev(rect, "height", "55.39");
    			add_location(rect, file$4, 139, 12, 3122);
    			attr_dev(clipPath, "id", "clip-path");
    			attr_dev(clipPath, "transform", "translate(-1.08 -0.65)");
    			add_location(clipPath, file$4, 138, 10, 3049);
    			add_location(defs, file$4, 137, 8, 3032);
    			add_location(title, file$4, 147, 8, 3308);
    			attr_dev(path, "class", "cls-3 svelte-1gdi6mm");
    			attr_dev(path, "d", "M2.12,49a3.91,3.91,0,0,0-1,2.4,3.08,3.08,0,0,0,1,2.41l1.23,1.23A3.37,3.37,0,0,0,5.69,56a3.12,3.12,0,0,0,2.47-.89L27.38,35.59a1.55,1.55,0,0,1,2.47,0L49.34,54.94A3,3,0,0,0,51.67,56a3.37,3.37,0,0,0,2.47-1.1l1.38-1.23a2.88,2.88,0,0,0,1-2.4,3.62,3.62,0,0,0-1-2.41L36,29.41a1.55,1.55,0,0,1,0-2.47L55.52,7.72a3.18,3.18,0,0,0,.89-2.47,3.45,3.45,0,0,0-.89-2.33L54.28,1.68a3.2,3.2,0,0,0-2.47-1,3.44,3.44,0,0,0-2.33,1L30,20.9a1.4,1.4,0,0,1-2.33,0L8.16,1.68a2.84,2.84,0,0,0-2.27-1,3.51,3.51,0,0,0-2.54,1.1L2.12,2.92a3.21,3.21,0,0,0-1,2.54,3.48,3.48,0,0,0,1,2.4L21.34,27.22a1.66,1.66,0,0,1,0,2.47Z");
    			attr_dev(path, "transform", "translate(-1.08 -0.65)");
    			add_location(path, file$4, 149, 10, 3365);
    			attr_dev(g, "class", "cls-2 svelte-1gdi6mm");
    			add_location(g, file$4, 148, 8, 3337);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "viewBox", "0 0 55.46 55.39");
    			attr_dev(svg, "class", "svelte-1gdi6mm");
    			add_location(svg, file$4, 133, 6, 2890);
    			attr_dev(div0, "class", "inner-1");
    			add_location(div0, file$4, 132, 4, 2862);
    			attr_dev(div1, "class", "close svelte-1gdi6mm");
    			add_location(div1, file$4, 131, 2, 2821);
    			attr_dev(div2, "class", "pane svelte-1gdi6mm");
    			set_style(div2, "transform", "translateX(" + ctx.left + "vw)");
    			set_style(div2, "background", ctx.bgColor);
    			toggle_class(div2, "active", ctx.active);
    			toggle_class(div2, "hidden", ctx.hidden);
    			toggle_class(div2, "introduction", ctx.order === 0 && ctx.section != 'editorial');
    			add_location(div2, file$4, 121, 0, 2527);

    			dispose = [
    				listen_dev(div1, "click", ctx.close),
    				listen_dev(div2, "click", ctx.open)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			html_tag.m(div2);
    			append_dev(div2, t);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, svg);
    			append_dev(svg, defs);
    			append_dev(defs, clipPath);
    			append_dev(clipPath, rect);
    			append_dev(svg, title);
    			append_dev(title, t_1);
    			append_dev(svg, g);
    			append_dev(g, path);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.essay) && raw_value !== (raw_value = renderBlockText(ctx.essay.content) + "")) {
    				html_tag.p(raw_value);
    			}

    			if (changed.left) {
    				set_style(div2, "transform", "translateX(" + ctx.left + "vw)");
    			}

    			if (changed.bgColor) {
    				set_style(div2, "background", ctx.bgColor);
    			}

    			if (changed.active) {
    				toggle_class(div2, "active", ctx.active);
    			}

    			if (changed.hidden) {
    				toggle_class(div2, "hidden", ctx.hidden);
    			}

    			if ((changed.order || changed.section)) {
    				toggle_class(div2, "introduction", ctx.order === 0 && ctx.section != 'editorial');
    			}
    		},

    		i: function intro(local) {
    			if (!div2_intro) {
    				add_render_callback(() => {
    					div2_intro = create_in_transition(div2, fly, { x: 300, delay: ctx.order * 100, opacity: 0 });
    					div2_intro.start();
    				});
    			}
    		},

    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div2);
    			}

    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$6.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	

      const dispatch = createEventDispatcher();

      // *** PROPS
      let { essay = {}, totalPanes = 1, order = 1, active = false, hidden = false, bgColor = "#0000ff", section = "" } = $$props;

      // *** VARIABLES
      let width = 100;
      let left = 0;

      const open = () => {
        // active = !active;
        if (active) {
          dispatch("activated", {
            order: 1000
          });
        } else {
          dispatch("activated", {
            order: order
          });
        }
      };

      const close = () => {
        dispatch("activated", {
          order: 1000
        });
      };

    	const writable_props = ['essay', 'totalPanes', 'order', 'active', 'hidden', 'bgColor', 'section'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Pane> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('essay' in $$props) $$invalidate('essay', essay = $$props.essay);
    		if ('totalPanes' in $$props) $$invalidate('totalPanes', totalPanes = $$props.totalPanes);
    		if ('order' in $$props) $$invalidate('order', order = $$props.order);
    		if ('active' in $$props) $$invalidate('active', active = $$props.active);
    		if ('hidden' in $$props) $$invalidate('hidden', hidden = $$props.hidden);
    		if ('bgColor' in $$props) $$invalidate('bgColor', bgColor = $$props.bgColor);
    		if ('section' in $$props) $$invalidate('section', section = $$props.section);
    	};

    	$$self.$capture_state = () => {
    		return { essay, totalPanes, order, active, hidden, bgColor, section, width, left };
    	};

    	$$self.$inject_state = $$props => {
    		if ('essay' in $$props) $$invalidate('essay', essay = $$props.essay);
    		if ('totalPanes' in $$props) $$invalidate('totalPanes', totalPanes = $$props.totalPanes);
    		if ('order' in $$props) $$invalidate('order', order = $$props.order);
    		if ('active' in $$props) $$invalidate('active', active = $$props.active);
    		if ('hidden' in $$props) $$invalidate('hidden', hidden = $$props.hidden);
    		if ('bgColor' in $$props) $$invalidate('bgColor', bgColor = $$props.bgColor);
    		if ('section' in $$props) $$invalidate('section', section = $$props.section);
    		if ('width' in $$props) $$invalidate('width', width = $$props.width);
    		if ('left' in $$props) $$invalidate('left', left = $$props.left);
    	};

    	$$self.$$.update = ($$dirty = { totalPanes: 1, active: 1, width: 1, order: 1 }) => {
    		if ($$dirty.totalPanes) { $$invalidate('width', width = 100 / totalPanes); }
    		if ($$dirty.active || $$dirty.width || $$dirty.totalPanes || $$dirty.order) { $$invalidate('left', left = active ? 0 : ((100 - width) / (totalPanes - 1)) * order); }
    	};

    	return {
    		essay,
    		totalPanes,
    		order,
    		active,
    		hidden,
    		bgColor,
    		section,
    		left,
    		open,
    		close
    	};
    }

    class Pane extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, ["essay", "totalPanes", "order", "active", "hidden", "bgColor", "section"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Pane", options, id: create_fragment$6.name });
    	}

    	get essay() {
    		throw new Error("<Pane>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set essay(value) {
    		throw new Error("<Pane>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get totalPanes() {
    		throw new Error("<Pane>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set totalPanes(value) {
    		throw new Error("<Pane>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get order() {
    		throw new Error("<Pane>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set order(value) {
    		throw new Error("<Pane>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<Pane>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Pane>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hidden() {
    		throw new Error("<Pane>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hidden(value) {
    		throw new Error("<Pane>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bgColor() {
    		throw new Error("<Pane>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bgColor(value) {
    		throw new Error("<Pane>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get section() {
    		throw new Error("<Pane>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set section(value) {
    		throw new Error("<Pane>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Editorial.svelte generated by Svelte v3.12.1 */

    const file$5 = "src/Editorial.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.text = list[i];
    	child_ctx.order = i;
    	return child_ctx;
    }

    // (138:2) {#each textList as text, order}
    function create_each_block(ctx) {
    	var current;

    	var pane = new Pane({
    		props: {
    		essay: ctx.text,
    		bgColor: ctx.bgColors[ctx.order],
    		section: "editorial",
    		active: ctx.activeOrder === ctx.order ? true : false,
    		hidden: ctx.activeOrder != 1000 && ctx.activeOrder < ctx.order ? true : false,
    		order: ctx.order,
    		totalPanes: ctx.textList.length
    	},
    		$$inline: true
    	});
    	pane.$on("activated", ctx.activated_handler);

    	const block = {
    		c: function create() {
    			pane.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(pane, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var pane_changes = {};
    			if (changed.textList) pane_changes.essay = ctx.text;
    			if (changed.activeOrder) pane_changes.active = ctx.activeOrder === ctx.order ? true : false;
    			if (changed.activeOrder) pane_changes.hidden = ctx.activeOrder != 1000 && ctx.activeOrder < ctx.order ? true : false;
    			if (changed.textList) pane_changes.totalPanes = ctx.textList.length;
    			pane.$set(pane_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(pane.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(pane.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(pane, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block.name, type: "each", source: "(138:2) {#each textList as text, order}", ctx });
    	return block;
    }

    function create_fragment$7(ctx) {
    	var t, div, current;

    	let each_value = ctx.textList;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			t = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			document.title = "Editorial | LIQUID FICTION";
    			attr_dev(div, "class", "about svelte-dln1y5");
    			add_location(div, file$5, 136, 0, 2781);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.textList || changed.bgColors || changed.activeOrder) {
    				each_value = ctx.textList;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();
    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},

    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(t);
    				detach_dev(div);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$7.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let $textContent;

    	validate_store(textContent, 'textContent');
    	component_subscribe($$self, textContent, $$value => { $textContent = $$value; $$invalidate('$textContent', $textContent); });

    	

      // *** VARIABLES
      let activeOrder = 1000;
      let textList = [];

      const bgColors = [
        "Gold",
        "RosyBrown",
        "Gold",
        "RosyBrown",
        "Gold",
        "RosyBrown"
      ];

      activePage.set("about");
      orbBackgroundOne.set("rgb(255, 69, 0)");
      orbBackgroundTwo.set("rgba(255,140,0,1)");

      orbColorTwo.set("rgba(255,255,255,1)");
      orbColorOne.set("rgba(255,255,255,1)");

      $textContent.then(content => {
        $$invalidate('textList', textList = concat_1(get_1(content, "essays", [])));
      });

    	const activated_handler = (event) => {
    	        $$invalidate('activeOrder', activeOrder = event.detail.order);
    	      };

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('activeOrder' in $$props) $$invalidate('activeOrder', activeOrder = $$props.activeOrder);
    		if ('textList' in $$props) $$invalidate('textList', textList = $$props.textList);
    		if ('$textContent' in $$props) textContent.set($textContent);
    	};

    	$$self.$$.update = ($$dirty = { activeOrder: 1 }) => {
    		if ($$dirty.activeOrder) { {
            if (activeOrder === 1000) {
              orbPosition.set({
                top: window.innerHeight - 110 + "px",
                left: "10px"
              });
            } else {
              orbPosition.set({
                top: window.innerHeight - 110 + "px",
                left: window.innerWidth - 110 + "px"
              });
            }
          } }
    	};

    	return {
    		activeOrder,
    		textList,
    		bgColors,
    		activated_handler
    	};
    }

    class Editorial extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Editorial", options, id: create_fragment$7.name });
    	}
    }

    /* src/About.svelte generated by Svelte v3.12.1 */

    const file$6 = "src/About.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.text = list[i];
    	child_ctx.order = i;
    	return child_ctx;
    }

    // (145:2) {#each textList as text, order}
    function create_each_block$1(ctx) {
    	var current;

    	var pane = new Pane({
    		props: {
    		essay: ctx.text,
    		bgColor: ctx.bgColors[ctx.order],
    		active: ctx.activeOrder === ctx.order ? true : false,
    		hidden: ctx.activeOrder != 1000 && ctx.activeOrder < ctx.order ? true : false,
    		order: ctx.order,
    		totalPanes: ctx.textList.length
    	},
    		$$inline: true
    	});
    	pane.$on("activated", ctx.activated_handler);

    	const block = {
    		c: function create() {
    			pane.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(pane, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var pane_changes = {};
    			if (changed.textList) pane_changes.essay = ctx.text;
    			if (changed.activeOrder) pane_changes.active = ctx.activeOrder === ctx.order ? true : false;
    			if (changed.activeOrder) pane_changes.hidden = ctx.activeOrder != 1000 && ctx.activeOrder < ctx.order ? true : false;
    			if (changed.textList) pane_changes.totalPanes = ctx.textList.length;
    			pane.$set(pane_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(pane.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(pane.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(pane, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$1.name, type: "each", source: "(145:2) {#each textList as text, order}", ctx });
    	return block;
    }

    function create_fragment$8(ctx) {
    	var t, div, current;

    	let each_value = ctx.textList;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			t = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			document.title = "Editorial | LIQUID FICTION";
    			attr_dev(div, "class", "about svelte-1sw5j2d");
    			add_location(div, file$6, 143, 0, 2935);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.textList || changed.bgColors || changed.activeOrder) {
    				each_value = ctx.textList;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();
    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},

    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(t);
    				detach_dev(div);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$8.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let $textContent;

    	validate_store(textContent, 'textContent');
    	component_subscribe($$self, textContent, $$value => { $textContent = $$value; $$invalidate('$textContent', $textContent); });

    	

      // *** VARIABLES
      let activeOrder = 1000;
      let textList = [];

      const bgColors = [
        "darkorange",
        "darkgoldenrod",
        "darkorange",
        "darkgoldenrod",
        "darkorange",
        "darkgoldenrod",
        "darkorange",
        "darkgoldenrod",
        "darkorange",
        "darkgoldenrod"
      ];

      activePage.set("about");
      orbBackgroundOne.set("rgb(0, 0, 0)");
      orbBackgroundTwo.set("rgba(255,69,0,1)");

      orbColorTwo.set("rgba(255,255,255,1)");
      orbColorOne.set("rgba(255,255,255,1)");

      $textContent.then(content => {
        $$invalidate('textList', textList = concat_1(
          get_1(content, "introduction.main", []),
          get_1(content, "credits", [])
        ));
      });

    	const activated_handler = (event) => {
    	        $$invalidate('activeOrder', activeOrder = event.detail.order);
    	      };

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('activeOrder' in $$props) $$invalidate('activeOrder', activeOrder = $$props.activeOrder);
    		if ('textList' in $$props) $$invalidate('textList', textList = $$props.textList);
    		if ('$textContent' in $$props) textContent.set($textContent);
    	};

    	$$self.$$.update = ($$dirty = { activeOrder: 1 }) => {
    		if ($$dirty.activeOrder) { {
            if (activeOrder === 1000) {
              orbPosition.set({
                top: window.innerHeight - 110 + "px",
                left: "10px"
              });
            } else {
              orbPosition.set({
                top: window.innerHeight - 110 + "px",
                left: window.innerWidth - 110 + "px"
              });
            }
          } }
    	};

    	return {
    		activeOrder,
    		textList,
    		bgColors,
    		activated_handler
    	};
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "About", options, id: create_fragment$8.name });
    	}
    }

    /* src/CycleOne.svelte generated by Svelte v3.12.1 */

    const file$7 = "src/CycleOne.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.text = list[i];
    	child_ctx.order = i;
    	return child_ctx;
    }

    // (136:2) {#each textList as text, order}
    function create_each_block$2(ctx) {
    	var current;

    	var pane = new Pane({
    		props: {
    		essay: ctx.text,
    		bgColor: ctx.bgColors[ctx.order],
    		active: ctx.activeOrder === ctx.order ? true : false,
    		hidden: ctx.activeOrder != 1000 && ctx.activeOrder < ctx.order ? true : false,
    		order: ctx.order,
    		totalPanes: ctx.textList.length
    	},
    		$$inline: true
    	});
    	pane.$on("activated", ctx.activated_handler);

    	const block = {
    		c: function create() {
    			pane.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(pane, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var pane_changes = {};
    			if (changed.textList) pane_changes.essay = ctx.text;
    			if (changed.activeOrder) pane_changes.active = ctx.activeOrder === ctx.order ? true : false;
    			if (changed.activeOrder) pane_changes.hidden = ctx.activeOrder != 1000 && ctx.activeOrder < ctx.order ? true : false;
    			if (changed.textList) pane_changes.totalPanes = ctx.textList.length;
    			pane.$set(pane_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(pane.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(pane.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(pane, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$2.name, type: "each", source: "(136:2) {#each textList as text, order}", ctx });
    	return block;
    }

    function create_fragment$9(ctx) {
    	var t, div, current;

    	let each_value = ctx.textList;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			t = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			document.title = "Cycle 1 | LIQUID FICTION";
    			attr_dev(div, "class", "about svelte-1b525l5");
    			add_location(div, file$7, 134, 0, 2857);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.textList || changed.bgColors || changed.activeOrder) {
    				each_value = ctx.textList;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();
    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},

    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(t);
    				detach_dev(div);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$9.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let $textContent;

    	validate_store(textContent, 'textContent');
    	component_subscribe($$self, textContent, $$value => { $textContent = $$value; $$invalidate('$textContent', $textContent); });

    	

      // *** VARIABLES
      let activeOrder = 1000;
      let textList = [];

      activePage.set("about");
      orbBackgroundOne.set("rgb(230, 230, 230)");
      orbBackgroundTwo.set("rgba(255,69,0,1)");

      orbColorOne.set("rgba(140,140,140,1)");
      orbColorTwo.set("rgba(0,0,0,1)");

      const bgColors = ["seagreen", "orangered", "seagreen", "orangered"];

      $textContent.then(content => {
        // console.dir(content);
        $$invalidate('textList', textList = concat_1(
          get_1(content, "introduction.firstCycle", []),
          get_1(content, "artists", [])
        ));
        // console.dir(textList);
      });

    	const activated_handler = (event) => {
    	        $$invalidate('activeOrder', activeOrder = event.detail.order);
    	      };

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('activeOrder' in $$props) $$invalidate('activeOrder', activeOrder = $$props.activeOrder);
    		if ('textList' in $$props) $$invalidate('textList', textList = $$props.textList);
    		if ('$textContent' in $$props) textContent.set($textContent);
    	};

    	$$self.$$.update = ($$dirty = { activeOrder: 1 }) => {
    		if ($$dirty.activeOrder) { {
            if (activeOrder === 1000) {
              orbPosition.set({
                top: window.innerHeight - 110 + "px",
                left: "10px"
              });
            } else {
              orbPosition.set({
                top: window.innerHeight - 110 + "px",
                left: window.innerWidth - 110 + "px"
              });
            }
          } }
    	};

    	return {
    		activeOrder,
    		textList,
    		bgColors,
    		activated_handler
    	};
    }

    class CycleOne extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "CycleOne", options, id: create_fragment$9.name });
    	}
    }

    /* src/eeefff/EEEFFF.svelte generated by Svelte v3.12.1 */
    const { console: console_1 } = globals;

    const file$8 = "src/eeefff/EEEFFF.svelte";

    // (87:2) {#if !$erosionMachineActive}
    function create_if_block$2(ctx) {
    	var video, source, track, video_intro, dispose;

    	const block = {
    		c: function create() {
    			video = element("video");
    			source = element("source");
    			track = element("track");
    			attr_dev(source, "src", "https://dev.eeefff.org/data/outsourcing-paradise-parasite/videos/start-time.mp4");
    			attr_dev(source, "type", "video/mp4");
    			add_location(source, file$8, 93, 6, 2008);
    			attr_dev(track, "kind", "subtitles");
    			attr_dev(track, "label", "English subtitles");
    			track.default = true;
    			attr_dev(track, "src", "https://dev.eeefff.org/data/outsourcing-paradise-parasite/selected-04/spinner.mp4_en.vtt");
    			attr_dev(track, "srclang", "en");
    			add_location(track, file$8, 96, 6, 2144);
    			attr_dev(video, "preload", "auto");
    			attr_dev(video, "crossorigin", "anonymous");
    			attr_dev(video, "class", "svelte-m1lp4w");
    			add_location(video, file$8, 87, 4, 1872);
    			dispose = listen_dev(video, "ended", ended_handler);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, video, anchor);
    			append_dev(video, source);
    			append_dev(video, track);
    			ctx.video_binding(video);
    		},

    		p: noop,

    		i: function intro(local) {
    			if (!video_intro) {
    				add_render_callback(() => {
    					video_intro = create_in_transition(video, fade, {});
    					video_intro.start();
    				});
    			}
    		},

    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(video);
    			}

    			ctx.video_binding(null);
    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block$2.name, type: "if", source: "(87:2) {#if !$erosionMachineActive}", ctx });
    	return block;
    }

    function create_fragment$a(ctx) {
    	var t, div, dispose;

    	var if_block = (!ctx.$erosionMachineActive) && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			t = space();
    			div = element("div");
    			if (if_block) if_block.c();
    			document.title = "EEEFFF | LIQUID FICTION";
    			attr_dev(div, "class", "eeefff svelte-m1lp4w");
    			add_location(div, file$8, 85, 0, 1770);
    			dispose = listen_dev(div, "mousemove", throttle_1(ctx.handleMouseMove, 200));
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    		},

    		p: function update(changed, ctx) {
    			if (!ctx.$erosionMachineActive) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},

    		i: function intro(local) {
    			transition_in(if_block);
    		},

    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(t);
    				detach_dev(div);
    			}

    			if (if_block) if_block.d();
    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$a.name, type: "component", source: "", ctx });
    	return block;
    }

    const ended_handler = () => {};

    function instance$a($$self, $$props, $$invalidate) {
    	let $erosionMachineActive;

    	validate_store(erosionMachineActive, 'erosionMachineActive');
    	component_subscribe($$self, erosionMachineActive, $$value => { $erosionMachineActive = $$value; $$invalidate('$erosionMachineActive', $erosionMachineActive); });

    	

      // *** PROPS
      let { location } = $$props;

      let introVideoEl = {};

      activePage.set("eeefff");
      orbBackgroundOne.set("rgba(180,180,180,1)");
      orbBackgroundTwo.set("rgba(130,130,130,1)");

      orbColorOne.set("rgba(30,30,30,1)");
      orbColorTwo.set("rgba(211,211,211,1)");

      orbPosition.set({
        top: "10px",
        left: "10px"
      });

      const handleMouseMove = () => {
        if (introVideoEl) $$invalidate('introVideoEl', introVideoEl.currentTime = 0, introVideoEl);
      };

      const playVideo = () => {
        console.log("playing video");
        let promise = introVideoEl.play();
        if (promise !== undefined) {
          promise
            .then(_ => {
              console.log("🎥 Video started");
            })
            .catch(error => {
              console.error("💥 Error starting video:", error);
            });
        }
      };

      onMount(async () => {
        if (introVideoEl) playVideo();
      });

    	const writable_props = ['location'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console_1.warn(`<EEEFFF> was created with unknown prop '${key}'`);
    	});

    	function video_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('introVideoEl', introVideoEl = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ('location' in $$props) $$invalidate('location', location = $$props.location);
    	};

    	$$self.$capture_state = () => {
    		return { location, introVideoEl, $erosionMachineActive };
    	};

    	$$self.$inject_state = $$props => {
    		if ('location' in $$props) $$invalidate('location', location = $$props.location);
    		if ('introVideoEl' in $$props) $$invalidate('introVideoEl', introVideoEl = $$props.introVideoEl);
    		if ('$erosionMachineActive' in $$props) erosionMachineActive.set($erosionMachineActive);
    	};

    	return {
    		location,
    		introVideoEl,
    		handleMouseMove,
    		$erosionMachineActive,
    		video_binding
    	};
    }

    class EEEFFF extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, ["location"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "EEEFFF", options, id: create_fragment$a.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.location === undefined && !('location' in props)) {
    			console_1.warn("<EEEFFF> was created without expected prop 'location'");
    		}
    	}

    	get location() {
    		throw new Error("<EEEFFF>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set location(value) {
    		throw new Error("<EEEFFF>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var viewerApi = createCommonjsModule(function (module, exports) {
    !function(t,e){module.exports=e();}(window,function(){return function(t){var e={};function i(n){if(e[n])return e[n].exports;var s=e[n]={i:n,l:!1,exports:{}};return t[n].call(s.exports,s,s.exports,i),s.l=!0,s.exports}return i.m=t,i.c=e,i.d=function(t,e,n){i.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n});},i.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0});},i.t=function(t,e){if(1&e&&(t=i(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(i.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var s in t)i.d(n,s,function(e){return t[e]}.bind(null,s));return n},i.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return i.d(e,"a",e),e},i.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},i.p="/static/builds/web/dist/",i(i.s=1)}([function(t,e){function i(t){return (i="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function n(e){return "function"==typeof Symbol&&"symbol"===i(Symbol.iterator)?t.exports=n=function(t){return i(t)}:t.exports=n=function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":i(t)},n(e)}t.exports=n;},function(t,e,i){i.r(e);var n=i(0),s=i.n(n),r=function(t,e,i){this._target=t,this._requestIdCounter=0,this._pendingRequests={},this._eventListeners={},this._ready=!1,this._domain=i,this._instanceId=e,this.listenServer();};r.prototype={getIdentifier:function(){return this._instanceId},getDomain:function(){return this._domain},setIdentifier:function(t){this._instanceId=t;},use:function(t,e){this._version=t,this._ready=!0;var i=this._requestIdCounter++;this._pendingRequests[i]=function(t,i,n){t?e.call(this,t):e.call(this,null,new function(t,e){t.forEach(function(t){this[t]=function(){var i,n=e._requestIdCounter++,s=Array.prototype.slice.call(arguments);s.length>0&&"function"==typeof s[s.length-1]&&(i=s.pop()),i&&(e._pendingRequests[n]=i.bind(this)),e._target.postMessage({type:"api.request",instanceId:e.getIdentifier(),requestId:n,member:t,arguments:s},e.getDomain());};},this),this.addEventListener=function(t,i,n){"viewerready"===t&&e.isViewerReady&&i(),e._eventListeners[t]||(e._eventListeners[t]=[]),e._eventListeners[t].push(i),n&&this.setListenerOptions&&(n.name=t,this.setListenerOptions(n));},this.removeEventListener=function(t,i){if(e._eventListeners[t]){var n=e._eventListeners[t].indexOf(i);-1!==n&&e._eventListeners[t].splice(n,1);}};}(n,this));}.bind(this),this._target.postMessage({type:"api.initialize",requestId:i,name:t,instanceId:this._instanceId},this._domain);},listenServer:function(){var t=["api.initialize.result","api.request.result","api.event"];window.addEventListener("message",function(e){if(e.origin===this._domain&&e.data&&e.data.type&&e.data.instanceId&&e.data.instanceId===this.getIdentifier()){var i=e.data.type;if(-1!==t.indexOf(i))if("api.event"===i){var n=e.data.results,s=n[0];if(this._eventListeners["*"]||this._eventListeners.all)return void["*","all"].forEach(function(t){var e=this._eventListeners[t];e&&e.forEach(function(t){t.apply(t,n);});},this);var r=n.slice(1),o=this._eventListeners[s];o?o.forEach(function(t){t.apply(t,r);}):"viewerready"===s&&(this.isViewerReady=!0);}else{var a=e.data.requestId,u=this._pendingRequests[a];if(!u)return;u.apply(null,e.data.results),this._pendingRequests[a]=void 0;}}}.bind(this));}};var o=r,a=/[&|;]+/g;function u(t){var e={};return Object.keys(t).forEach(function(i){e[i]=Array.isArray(t[i])?t[i]:[t[i]];}),e}function d(t){return "object"===s()(t)?u(t):("?"===t[0]&&(t=t.substr(1)),t.split(a).reduce(function(t,e){if(0===e.length)return t;var i=e.indexOf("=");-1===i&&(i=e.length);var n=decodeURIComponent(e.substr(0,i).replace(/\+/g,"%20")),s=decodeURIComponent(e.substr(i+1).replace(/\+/g,"%20"));return void 0===t[n]&&(t[n]=[]),t[n].push(s),t},{}))}window.SketchfabAPIClient=o;var c=function(t,e){var i=t,n=e;"object"===s()(t)&&(n=t,i=null),this._version=i,this._target=n,window.sketchfabAPIinstances||(window.sketchfabAPIinstances=[]),window.sketchfabAPIinstances.push(this),this._apiId=window.sketchfabAPIinstances.length.toString(),this._target.id&&(this._apiId+="_"+this._target.id),this._target.allow||(this._target.allow="vr; autoplay; fullscreen"),this._client=void 0,this._options=void 0,this._domain="sketchfab.com",this._domain="same-as-current"===this._domain?window.location.hostname:this._domain,this._urlTemplate="https://YYYY/models/XXXX/embed",this._url=this._urlTemplate.replace("YYYY",this._domain),this._transmitOptions={},this._getURLOptions();};c.prototype={_urlOptionsDict:{skfb_api_version:{default:"1.5.2",type:"string"}},_optionsLoaded:function(t){this._urlOptions=t,this._version=this._getURLOption("skfb_api_version",this._version);},_getURLOption:function(t,e){var i=this._urlOptionsDict[t];if(!i)return e;void 0!==e&&null!==e||(e=i.default);var n=this._urlOptions[t];return n&&n.length?n[0]:e},_getURLOptions:function(){if(!window||!window.location.search)return this._optionsLoaded({});var t=d(window.location.search);for(var e in t)e.startsWith("skfb_")&&(this._transmitOptions[e.substr(5)]=t[e]);return this._optionsLoaded(t)},getEmbedURL:function(t,e){var i=this._url+"?api_version="+this._version+"&api_id="+this._apiId;e&&Object.keys(e).forEach(function(t){null!=e[t]&&"function"!=typeof e[t]&&(i+="&"+t.toString()+"="+e[t].toString());});var n=this._transmitOptions;return Object.keys(this._transmitOptions).forEach(function(t){i+="&"+t.toString()+"="+n[t].toString();}),i.replace("XXXX",t)},init:function(t,e){this._options=e,this._uid=t,this._realInit();},reload:function(t){var e=document.createElement("script");e.setAttribute("src","https://static."+t+"/api/sketchfab-viewer-"+this._version+".js"),e.addEventListener("load",function(){this._url=this._urlTemplate.replace("YYYY",t),-1!==this._domain.indexOf("sketchfab.com")&&(this._transmitOptions.hook_prod=1,this._transmitOptions.model=this._uid),this._realInit();}.bind(this)),document.body.appendChild(e);},_initializeAPIEmbed:function(t){if(t.data&&t.data.instanceId&&this._apiId===t.data.instanceId&&"api.ready"===t.data.type){var e=t.data.options;if(e&&e.domain)this.reload(e.domain);else{if(void 0!==t.data.error)return this.error(t.data.error),void window.removeEventListener("message",this._initializeAPIEmbedBinded);var i=this._target.src.split("/");i="https://"+i[2],this._client=new window.SketchfabAPIClient(this._target.contentWindow,this._apiId,i),this._client.use(this._version,function(t,e){if(t)throw t;this.success.call(this,e);}.bind(this)),window.removeEventListener("message",this._initializeAPIEmbedBinded);}}},_realInit:function(){this._initializeAPIEmbedBinded=this._initializeAPIEmbed.bind(this),window.addEventListener("message",this._initializeAPIEmbedBinded),this._target.src=this.getEmbedURL(this._uid,this._options);},success:function(t){this._options.success&&"function"==typeof this._options.success&&this._options.success(t);},error:function(t){this._options.error&&"function"==typeof this._options.error&&this._options.error(t);}};e.default=c;}]).default});
    //# sourceMappingURL=sketchfab-viewer-1.5.2.js.map
    });

    var Sketchfab = unwrapExports(viewerApi);
    var viewerApi_1 = viewerApi.Sketchfab;

    // Object.keys
    if (!Object.keys) {
      Object.keys = function(object) {
        var keys = [];
        for (var name in object) {
          if (Object.prototype.hasOwnProperty.call(object, name)) {
            keys.push(name);
          }
        }
        return keys;
      };
    }

    // ChildNode.remove
    if(!("remove" in Element.prototype)){
      Element.prototype.remove = function(){
        if(this.parentNode) {
          this.parentNode.removeChild(this);
        }
      };
    }

    var win$1 = window;

    var raf$1 = win$1.requestAnimationFrame
      || win$1.webkitRequestAnimationFrame
      || win$1.mozRequestAnimationFrame
      || win$1.msRequestAnimationFrame
      || function(cb) { return setTimeout(cb, 16); };

    var win$2 = window;

    var caf = win$2.cancelAnimationFrame
      || win$2.mozCancelAnimationFrame
      || function(id){ clearTimeout(id); };

    function extend() {
      var obj, name, copy,
          target = arguments[0] || {},
          i = 1,
          length = arguments.length;

      for (; i < length; i++) {
        if ((obj = arguments[i]) !== null) {
          for (name in obj) {
            copy = obj[name];

            if (target === copy) {
              continue;
            } else if (copy !== undefined) {
              target[name] = copy;
            }
          }
        }
      }
      return target;
    }

    function checkStorageValue (value) {
      return ['true', 'false'].indexOf(value) >= 0 ? JSON.parse(value) : value;
    }

    function setLocalStorage(storage, key, value, access) {
      if (access) {
        try { storage.setItem(key, value); } catch (e) {}
      }
      return value;
    }

    function getSlideId() {
      var id = window.tnsId;
      window.tnsId = !id ? 1 : id + 1;
      
      return 'tns' + window.tnsId;
    }

    function getBody$1 () {
      var doc = document,
          body = doc.body;

      if (!body) {
        body = doc.createElement('body');
        body.fake = true;
      }

      return body;
    }

    var docElement = document.documentElement;

    function setFakeBody (body) {
      var docOverflow = '';
      if (body.fake) {
        docOverflow = docElement.style.overflow;
        //avoid crashing IE8, if background image is used
        body.style.background = '';
        //Safari 5.13/5.1.4 OSX stops loading if ::-webkit-scrollbar is used and scrollbars are visible
        body.style.overflow = docElement.style.overflow = 'hidden';
        docElement.appendChild(body);
      }

      return docOverflow;
    }

    function resetFakeBody (body, docOverflow) {
      if (body.fake) {
        body.remove();
        docElement.style.overflow = docOverflow;
        // Trigger layout so kinetic scrolling isn't disabled in iOS6+
        // eslint-disable-next-line
        docElement.offsetHeight;
      }
    }

    // get css-calc 

    function calc() {
      var doc = document, 
          body = getBody$1(),
          docOverflow = setFakeBody(body),
          div = doc.createElement('div'), 
          result = false;

      body.appendChild(div);
      try {
        var str = '(10px * 10)',
            vals = ['calc' + str, '-moz-calc' + str, '-webkit-calc' + str],
            val;
        for (var i = 0; i < 3; i++) {
          val = vals[i];
          div.style.width = val;
          if (div.offsetWidth === 100) { 
            result = val.replace(str, ''); 
            break;
          }
        }
      } catch (e) {}
      
      body.fake ? resetFakeBody(body, docOverflow) : div.remove();

      return result;
    }

    // get subpixel support value

    function percentageLayout() {
      // check subpixel layout supporting
      var doc = document,
          body = getBody$1(),
          docOverflow = setFakeBody(body),
          wrapper = doc.createElement('div'),
          outer = doc.createElement('div'),
          str = '',
          count = 70,
          perPage = 3,
          supported = false;

      wrapper.className = "tns-t-subp2";
      outer.className = "tns-t-ct";

      for (var i = 0; i < count; i++) {
        str += '<div></div>';
      }

      outer.innerHTML = str;
      wrapper.appendChild(outer);
      body.appendChild(wrapper);

      supported = Math.abs(wrapper.getBoundingClientRect().left - outer.children[count - perPage].getBoundingClientRect().left) < 2;

      body.fake ? resetFakeBody(body, docOverflow) : wrapper.remove();

      return supported;
    }

    function mediaquerySupport () {
      var doc = document,
          body = getBody$1(),
          docOverflow = setFakeBody(body),
          div = doc.createElement('div'),
          style = doc.createElement('style'),
          rule = '@media all and (min-width:1px){.tns-mq-test{position:absolute}}',
          position;

      style.type = 'text/css';
      div.className = 'tns-mq-test';

      body.appendChild(style);
      body.appendChild(div);

      if (style.styleSheet) {
        style.styleSheet.cssText = rule;
      } else {
        style.appendChild(doc.createTextNode(rule));
      }

      position = window.getComputedStyle ? window.getComputedStyle(div).position : div.currentStyle['position'];

      body.fake ? resetFakeBody(body, docOverflow) : div.remove();

      return position === "absolute";
    }

    // create and append style sheet
    function createStyleSheet (media) {
      // Create the <style> tag
      var style = document.createElement("style");
      // style.setAttribute("type", "text/css");

      // Add a media (and/or media query) here if you'd like!
      // style.setAttribute("media", "screen")
      // style.setAttribute("media", "only screen and (max-width : 1024px)")
      if (media) { style.setAttribute("media", media); }

      // WebKit hack :(
      // style.appendChild(document.createTextNode(""));

      // Add the <style> element to the page
      document.querySelector('head').appendChild(style);

      return style.sheet ? style.sheet : style.styleSheet;
    }

    // cross browsers addRule method
    function addCSSRule(sheet, selector, rules, index) {
      // return raf(function() {
        'insertRule' in sheet ?
          sheet.insertRule(selector + '{' + rules + '}', index) :
          sheet.addRule(selector, rules, index);
      // });
    }

    // cross browsers addRule method
    function removeCSSRule(sheet, index) {
      // return raf(function() {
        'deleteRule' in sheet ?
          sheet.deleteRule(index) :
          sheet.removeRule(index);
      // });
    }

    function getCssRulesLength(sheet) {
      var rule = ('insertRule' in sheet) ? sheet.cssRules : sheet.rules;
      return rule.length;
    }

    function toDegree (y, x) {
      return Math.atan2(y, x) * (180 / Math.PI);
    }

    function getTouchDirection(angle, range) {
      var direction = false,
          gap = Math.abs(90 - Math.abs(angle));
          
      if (gap >= 90 - range) {
        direction = 'horizontal';
      } else if (gap <= range) {
        direction = 'vertical';
      }

      return direction;
    }

    // https://toddmotto.com/ditch-the-array-foreach-call-nodelist-hack/
    function forEach$1 (arr, callback, scope) {
      for (var i = 0, l = arr.length; i < l; i++) {
        callback.call(scope, arr[i], i);
      }
    }

    var classListSupport = 'classList' in document.createElement('_');

    var hasClass = classListSupport ?
        function (el, str) { return el.classList.contains(str); } :
        function (el, str) { return el.className.indexOf(str) >= 0; };

    var addClass$1 = classListSupport ?
        function (el, str) {
          if (!hasClass(el,  str)) { el.classList.add(str); }
        } :
        function (el, str) {
          if (!hasClass(el,  str)) { el.className += ' ' + str; }
        };

    var removeClass$1 = classListSupport ?
        function (el, str) {
          if (hasClass(el,  str)) { el.classList.remove(str); }
        } :
        function (el, str) {
          if (hasClass(el, str)) { el.className = el.className.replace(str, ''); }
        };

    function hasAttr(el, attr) {
      return el.hasAttribute(attr);
    }

    function getAttr(el, attr) {
      return el.getAttribute(attr);
    }

    function isNodeList(el) {
      // Only NodeList has the "item()" function
      return typeof el.item !== "undefined"; 
    }

    function setAttrs(els, attrs) {
      els = (isNodeList(els) || els instanceof Array) ? els : [els];
      if (Object.prototype.toString.call(attrs) !== '[object Object]') { return; }

      for (var i = els.length; i--;) {
        for(var key in attrs) {
          els[i].setAttribute(key, attrs[key]);
        }
      }
    }

    function removeAttrs(els, attrs) {
      els = (isNodeList(els) || els instanceof Array) ? els : [els];
      attrs = (attrs instanceof Array) ? attrs : [attrs];

      var attrLength = attrs.length;
      for (var i = els.length; i--;) {
        for (var j = attrLength; j--;) {
          els[i].removeAttribute(attrs[j]);
        }
      }
    }

    function arrayFromNodeList (nl) {
      var arr = [];
      for (var i = 0, l = nl.length; i < l; i++) {
        arr.push(nl[i]);
      }
      return arr;
    }

    function hideElement(el, forceHide) {
      if (el.style.display !== 'none') { el.style.display = 'none'; }
    }

    function showElement(el, forceHide) {
      if (el.style.display === 'none') { el.style.display = ''; }
    }

    function isVisible(el) {
      return window.getComputedStyle(el).display !== 'none';
    }

    function whichProperty(props){
      if (typeof props === 'string') {
        var arr = [props],
            Props = props.charAt(0).toUpperCase() + props.substr(1),
            prefixes = ['Webkit', 'Moz', 'ms', 'O'];
            
        prefixes.forEach(function(prefix) {
          if (prefix !== 'ms' || props === 'transform') {
            arr.push(prefix + Props);
          }
        });

        props = arr;
      }

      var el = document.createElement('fakeelement'),
          len = props.length;
      for(var i = 0; i < props.length; i++){
        var prop = props[i];
        if( el.style[prop] !== undefined ){ return prop; }
      }

      return false; // explicit for ie9-
    }

    function has3DTransforms(tf){
      if (!tf) { return false; }
      if (!window.getComputedStyle) { return false; }
      
      var doc = document,
          body = getBody$1(),
          docOverflow = setFakeBody(body),
          el = doc.createElement('p'),
          has3d,
          cssTF = tf.length > 9 ? '-' + tf.slice(0, -9).toLowerCase() + '-' : '';

      cssTF += 'transform';

      // Add it to the body to get the computed style
      body.insertBefore(el, null);

      el.style[tf] = 'translate3d(1px,1px,1px)';
      has3d = window.getComputedStyle(el).getPropertyValue(cssTF);

      body.fake ? resetFakeBody(body, docOverflow) : el.remove();

      return (has3d !== undefined && has3d.length > 0 && has3d !== "none");
    }

    // get transitionend, animationend based on transitionDuration
    // @propin: string
    // @propOut: string, first-letter uppercase
    // Usage: getEndProperty('WebkitTransitionDuration', 'Transition') => webkitTransitionEnd
    function getEndProperty(propIn, propOut) {
      var endProp = false;
      if (/^Webkit/.test(propIn)) {
        endProp = 'webkit' + propOut + 'End';
      } else if (/^O/.test(propIn)) {
        endProp = 'o' + propOut + 'End';
      } else if (propIn) {
        endProp = propOut.toLowerCase() + 'end';
      }
      return endProp;
    }

    // Test via a getter in the options object to see if the passive property is accessed
    var supportsPassive = false;
    try {
      var opts = Object.defineProperty({}, 'passive', {
        get: function() {
          supportsPassive = true;
        }
      });
      window.addEventListener("test", null, opts);
    } catch (e) {}
    var passiveOption = supportsPassive ? { passive: true } : false;

    function addEvents(el, obj, preventScrolling) {
      for (var prop in obj) {
        var option = ['touchstart', 'touchmove'].indexOf(prop) >= 0 && !preventScrolling ? passiveOption : false;
        el.addEventListener(prop, obj[prop], option);
      }
    }

    function removeEvents(el, obj) {
      for (var prop in obj) {
        var option = ['touchstart', 'touchmove'].indexOf(prop) >= 0 ? passiveOption : false;
        el.removeEventListener(prop, obj[prop], option);
      }
    }

    function Events() {
      return {
        topics: {},
        on: function (eventName, fn) {
          this.topics[eventName] = this.topics[eventName] || [];
          this.topics[eventName].push(fn);
        },
        off: function(eventName, fn) {
          if (this.topics[eventName]) {
            for (var i = 0; i < this.topics[eventName].length; i++) {
              if (this.topics[eventName][i] === fn) {
                this.topics[eventName].splice(i, 1);
                break;
              }
            }
          }
        },
        emit: function (eventName, data) {
          data.type = eventName;
          if (this.topics[eventName]) {
            this.topics[eventName].forEach(function(fn) {
              fn(data, eventName);
            });
          }
        }
      };
    }

    function jsTransform(element, attr, prefix, postfix, to, duration, callback) {
      var tick = Math.min(duration, 10),
          unit = (to.indexOf('%') >= 0) ? '%' : 'px',
          to = to.replace(unit, ''),
          from = Number(element.style[attr].replace(prefix, '').replace(postfix, '').replace(unit, '')),
          positionTick = (to - from) / duration * tick;

      setTimeout(moveElement, tick);
      function moveElement() {
        duration -= tick;
        from += positionTick;
        element.style[attr] = prefix + from + unit + postfix;
        if (duration > 0) { 
          setTimeout(moveElement, tick); 
        } else {
          callback();
        }
      }
    }

    var tns = function(options) {
      options = extend({
        container: '.slider',
        mode: 'carousel',
        axis: 'horizontal',
        items: 1,
        gutter: 0,
        edgePadding: 0,
        fixedWidth: false,
        autoWidth: false,
        viewportMax: false,
        slideBy: 1,
        center: false,
        controls: true,
        controlsPosition: 'top',
        controlsText: ['prev', 'next'],
        controlsContainer: false,
        prevButton: false,
        nextButton: false,
        nav: true,
        navPosition: 'top',
        navContainer: false,
        navAsThumbnails: false,
        arrowKeys: false,
        speed: 300,
        autoplay: false,
        autoplayPosition: 'top',
        autoplayTimeout: 5000,
        autoplayDirection: 'forward',
        autoplayText: ['start', 'stop'],
        autoplayHoverPause: false,
        autoplayButton: false,
        autoplayButtonOutput: true,
        autoplayResetOnVisibility: true,
        animateIn: 'tns-fadeIn',
        animateOut: 'tns-fadeOut',
        animateNormal: 'tns-normal',
        animateDelay: false,
        loop: true,
        rewind: false,
        autoHeight: false,
        responsive: false,
        lazyload: false,
        lazyloadSelector: '.tns-lazy-img',
        touch: true,
        mouseDrag: false,
        swipeAngle: 15,
        nested: false,
        preventActionWhenRunning: false,
        preventScrollOnTouch: false,
        freezable: true,
        onInit: false,
        useLocalStorage: true
      }, options || {});
      
      var doc = document,
          win = window,
          KEYS = {
            ENTER: 13,
            SPACE: 32,
            LEFT: 37,
            RIGHT: 39
          },
          tnsStorage = {},
          localStorageAccess = options.useLocalStorage;

      if (localStorageAccess) {
        // check browser version and local storage access
        var browserInfo = navigator.userAgent;
        var uid = new Date;

        try {
          tnsStorage = win.localStorage;
          if (tnsStorage) {
            tnsStorage.setItem(uid, uid);
            localStorageAccess = tnsStorage.getItem(uid) == uid;
            tnsStorage.removeItem(uid);
          } else {
            localStorageAccess = false;
          }
          if (!localStorageAccess) { tnsStorage = {}; }
        } catch(e) {
          localStorageAccess = false;
        }

        if (localStorageAccess) {
          // remove storage when browser version changes
          if (tnsStorage['tnsApp'] && tnsStorage['tnsApp'] !== browserInfo) {
            ['tC', 'tPL', 'tMQ', 'tTf', 't3D', 'tTDu', 'tTDe', 'tADu', 'tADe', 'tTE', 'tAE'].forEach(function(item) { tnsStorage.removeItem(item); });
          }
          // update browserInfo
          localStorage['tnsApp'] = browserInfo;
        }
      }

      var CALC = tnsStorage['tC'] ? checkStorageValue(tnsStorage['tC']) : setLocalStorage(tnsStorage, 'tC', calc(), localStorageAccess),
          PERCENTAGELAYOUT = tnsStorage['tPL'] ? checkStorageValue(tnsStorage['tPL']) : setLocalStorage(tnsStorage, 'tPL', percentageLayout(), localStorageAccess),
          CSSMQ = tnsStorage['tMQ'] ? checkStorageValue(tnsStorage['tMQ']) : setLocalStorage(tnsStorage, 'tMQ', mediaquerySupport(), localStorageAccess),
          TRANSFORM = tnsStorage['tTf'] ? checkStorageValue(tnsStorage['tTf']) : setLocalStorage(tnsStorage, 'tTf', whichProperty('transform'), localStorageAccess),
          HAS3DTRANSFORMS = tnsStorage['t3D'] ? checkStorageValue(tnsStorage['t3D']) : setLocalStorage(tnsStorage, 't3D', has3DTransforms(TRANSFORM), localStorageAccess),
          TRANSITIONDURATION = tnsStorage['tTDu'] ? checkStorageValue(tnsStorage['tTDu']) : setLocalStorage(tnsStorage, 'tTDu', whichProperty('transitionDuration'), localStorageAccess),
          TRANSITIONDELAY = tnsStorage['tTDe'] ? checkStorageValue(tnsStorage['tTDe']) : setLocalStorage(tnsStorage, 'tTDe', whichProperty('transitionDelay'), localStorageAccess),
          ANIMATIONDURATION = tnsStorage['tADu'] ? checkStorageValue(tnsStorage['tADu']) : setLocalStorage(tnsStorage, 'tADu', whichProperty('animationDuration'), localStorageAccess),
          ANIMATIONDELAY = tnsStorage['tADe'] ? checkStorageValue(tnsStorage['tADe']) : setLocalStorage(tnsStorage, 'tADe', whichProperty('animationDelay'), localStorageAccess),
          TRANSITIONEND = tnsStorage['tTE'] ? checkStorageValue(tnsStorage['tTE']) : setLocalStorage(tnsStorage, 'tTE', getEndProperty(TRANSITIONDURATION, 'Transition'), localStorageAccess),
          ANIMATIONEND = tnsStorage['tAE'] ? checkStorageValue(tnsStorage['tAE']) : setLocalStorage(tnsStorage, 'tAE', getEndProperty(ANIMATIONDURATION, 'Animation'), localStorageAccess);

      // get element nodes from selectors
      var supportConsoleWarn = win.console && typeof win.console.warn === "function",
          tnsList = ['container', 'controlsContainer', 'prevButton', 'nextButton', 'navContainer', 'autoplayButton'], 
          optionsElements = {};
          
      tnsList.forEach(function(item) {
        if (typeof options[item] === 'string') {
          var str = options[item],
              el = doc.querySelector(str);
          optionsElements[item] = str;

          if (el && el.nodeName) {
            options[item] = el;
          } else {
            if (supportConsoleWarn) { console.warn('Can\'t find', options[item]); }
            return;
          }
        }
      });

      // make sure at least 1 slide
      if (options.container.children.length < 1) {
        if (supportConsoleWarn) { console.warn('No slides found in', options.container); }
        return;
       }

      // update options
      var responsive = options.responsive,
          nested = options.nested,
          carousel = options.mode === 'carousel' ? true : false;

      if (responsive) {
        // apply responsive[0] to options and remove it
        if (0 in responsive) {
          options = extend(options, responsive[0]);
          delete responsive[0];
        }

        var responsiveTem = {};
        for (var key in responsive) {
          var val = responsive[key];
          // update responsive
          // from: 300: 2
          // to: 
          //   300: { 
          //     items: 2 
          //   } 
          val = typeof val === 'number' ? {items: val} : val;
          responsiveTem[key] = val;
        }
        responsive = responsiveTem;
        responsiveTem = null;
      }

      // update options
      function updateOptions (obj) {
        for (var key in obj) {
          if (!carousel) {
            if (key === 'slideBy') { obj[key] = 'page'; }
            if (key === 'edgePadding') { obj[key] = false; }
            if (key === 'autoHeight') { obj[key] = false; }
          }

          // update responsive options
          if (key === 'responsive') { updateOptions(obj[key]); }
        }
      }
      if (!carousel) { updateOptions(options); }


      // === define and set variables ===
      if (!carousel) {
        options.axis = 'horizontal';
        options.slideBy = 'page';
        options.edgePadding = false;

        var animateIn = options.animateIn,
            animateOut = options.animateOut,
            animateDelay = options.animateDelay,
            animateNormal = options.animateNormal;
      }

      var horizontal = options.axis === 'horizontal' ? true : false,
          outerWrapper = doc.createElement('div'),
          innerWrapper = doc.createElement('div'),
          middleWrapper,
          container = options.container,
          containerParent = container.parentNode,
          containerHTML = container.outerHTML,
          slideItems = container.children,
          slideCount = slideItems.length,
          breakpointZone,
          windowWidth = getWindowWidth(),
          isOn = false;
      if (responsive) { setBreakpointZone(); }
      if (carousel) { container.className += ' tns-vpfix'; }

      // fixedWidth: viewport > rightBoundary > indexMax
      var autoWidth = options.autoWidth,
          fixedWidth = getOption('fixedWidth'),
          edgePadding = getOption('edgePadding'),
          gutter = getOption('gutter'),
          viewport = getViewportWidth(),
          center = getOption('center'),
          items = !autoWidth ? Math.floor(getOption('items')) : 1,
          slideBy = getOption('slideBy'),
          viewportMax = options.viewportMax || options.fixedWidthViewportWidth,
          arrowKeys = getOption('arrowKeys'),
          speed = getOption('speed'),
          rewind = options.rewind,
          loop = rewind ? false : options.loop,
          autoHeight = getOption('autoHeight'),
          controls = getOption('controls'),
          controlsText = getOption('controlsText'),
          nav = getOption('nav'),
          touch = getOption('touch'),
          mouseDrag = getOption('mouseDrag'),
          autoplay = getOption('autoplay'),
          autoplayTimeout = getOption('autoplayTimeout'),
          autoplayText = getOption('autoplayText'),
          autoplayHoverPause = getOption('autoplayHoverPause'),
          autoplayResetOnVisibility = getOption('autoplayResetOnVisibility'),
          sheet = createStyleSheet(),
          lazyload = options.lazyload,
          lazyloadSelector = options.lazyloadSelector,
          slidePositions, // collection of slide positions
          slideItemsOut = [],
          cloneCount = loop ? getCloneCountForLoop() : 0,
          slideCountNew = !carousel ? slideCount + cloneCount : slideCount + cloneCount * 2,
          hasRightDeadZone = (fixedWidth || autoWidth) && !loop ? true : false,
          rightBoundary = fixedWidth ? getRightBoundary() : null,
          updateIndexBeforeTransform = (!carousel || !loop) ? true : false,
          // transform
          transformAttr = horizontal ? 'left' : 'top',
          transformPrefix = '',
          transformPostfix = '',
          // index
          getIndexMax = (function () {
            if (fixedWidth) {
              return function() { return center && !loop ? slideCount - 1 : Math.ceil(- rightBoundary / (fixedWidth + gutter)); };
            } else if (autoWidth) {
              return function() {
                for (var i = slideCountNew; i--;) {
                  if (slidePositions[i] >= - rightBoundary) { return i; }
                }
              };
            } else {
              return function() {
                if (center && carousel && !loop) {
                  return slideCount - 1;
                } else {
                  return loop || carousel ? Math.max(0, slideCountNew - Math.ceil(items)) : slideCountNew - 1;
                }
              };
            }
          })(),
          index = getStartIndex(getOption('startIndex')),
          indexCached = index,
          displayIndex = getCurrentSlide(),
          indexMin = 0,
          indexMax = !autoWidth ? getIndexMax() : null,
          // resize
          resizeTimer,
          preventActionWhenRunning = options.preventActionWhenRunning,
          swipeAngle = options.swipeAngle,
          moveDirectionExpected = swipeAngle ? '?' : true,
          running = false,
          onInit = options.onInit,
          events = new Events(),
          // id, class
          newContainerClasses = ' tns-slider tns-' + options.mode,
          slideId = container.id || getSlideId(),
          disable = getOption('disable'),
          disabled = false,
          freezable = options.freezable,
          freeze = freezable && !autoWidth ? getFreeze() : false,
          frozen = false,
          controlsEvents = {
            'click': onControlsClick,
            'keydown': onControlsKeydown
          },
          navEvents = {
            'click': onNavClick,
            'keydown': onNavKeydown
          },
          hoverEvents = {
            'mouseover': mouseoverPause,
            'mouseout': mouseoutRestart
          },
          visibilityEvent = {'visibilitychange': onVisibilityChange},
          docmentKeydownEvent = {'keydown': onDocumentKeydown},
          touchEvents = {
            'touchstart': onPanStart,
            'touchmove': onPanMove,
            'touchend': onPanEnd,
            'touchcancel': onPanEnd
          }, dragEvents = {
            'mousedown': onPanStart,
            'mousemove': onPanMove,
            'mouseup': onPanEnd,
            'mouseleave': onPanEnd
          },
          hasControls = hasOption('controls'),
          hasNav = hasOption('nav'),
          navAsThumbnails = autoWidth ? true : options.navAsThumbnails,
          hasAutoplay = hasOption('autoplay'),
          hasTouch = hasOption('touch'),
          hasMouseDrag = hasOption('mouseDrag'),
          slideActiveClass = 'tns-slide-active',
          imgCompleteClass = 'tns-complete',
          imgEvents = {
            'load': onImgLoaded,
            'error': onImgFailed
          },
          imgsComplete,
          liveregionCurrent,
          preventScroll = options.preventScrollOnTouch === 'force' ? true : false;

      // controls
      if (hasControls) {
        var controlsContainer = options.controlsContainer,
            controlsContainerHTML = options.controlsContainer ? options.controlsContainer.outerHTML : '',
            prevButton = options.prevButton,
            nextButton = options.nextButton,
            prevButtonHTML = options.prevButton ? options.prevButton.outerHTML : '',
            nextButtonHTML = options.nextButton ? options.nextButton.outerHTML : '',
            prevIsButton,
            nextIsButton;
      }

      // nav
      if (hasNav) {
        var navContainer = options.navContainer,
            navContainerHTML = options.navContainer ? options.navContainer.outerHTML : '',
            navItems,
            pages = autoWidth ? slideCount : getPages(),
            pagesCached = 0,
            navClicked = -1,
            navCurrentIndex = getCurrentNavIndex(),
            navCurrentIndexCached = navCurrentIndex,
            navActiveClass = 'tns-nav-active',
            navStr = 'Carousel Page ',
            navStrCurrent = ' (Current Slide)';
      }

      // autoplay
      if (hasAutoplay) {
        var autoplayDirection = options.autoplayDirection === 'forward' ? 1 : -1,
            autoplayButton = options.autoplayButton,
            autoplayButtonHTML = options.autoplayButton ? options.autoplayButton.outerHTML : '',
            autoplayHtmlStrings = ['<span class=\'tns-visually-hidden\'>', ' animation</span>'],
            autoplayTimer,
            animating,
            autoplayHoverPaused,
            autoplayUserPaused,
            autoplayVisibilityPaused;
      }

      if (hasTouch || hasMouseDrag) {
        var initPosition = {},
            lastPosition = {},
            translateInit,
            disX,
            disY,
            panStart = false,
            rafIndex,
            getDist = horizontal ? 
              function(a, b) { return a.x - b.x; } :
              function(a, b) { return a.y - b.y; };
      }
      
      // disable slider when slidecount <= items
      if (!autoWidth) { resetVariblesWhenDisable(disable || freeze); }

      if (TRANSFORM) {
        transformAttr = TRANSFORM;
        transformPrefix = 'translate';

        if (HAS3DTRANSFORMS) {
          transformPrefix += horizontal ? '3d(' : '3d(0px, ';
          transformPostfix = horizontal ? ', 0px, 0px)' : ', 0px)';
        } else {
          transformPrefix += horizontal ? 'X(' : 'Y(';
          transformPostfix = ')';
        }

      }

      if (carousel) { container.className = container.className.replace('tns-vpfix', ''); }
      initStructure();
      initSheet();
      initSliderTransform();

      // === COMMON FUNCTIONS === //
      function resetVariblesWhenDisable (condition) {
        if (condition) {
          controls = nav = touch = mouseDrag = arrowKeys = autoplay = autoplayHoverPause = autoplayResetOnVisibility = false;
        }
      }

      function getCurrentSlide () {
        var tem = carousel ? index - cloneCount : index;
        while (tem < 0) { tem += slideCount; }
        return tem%slideCount + 1;
      }

      function getStartIndex (ind) {
        ind = ind ? Math.max(0, Math.min(loop ? slideCount - 1 : slideCount - items, ind)) : 0;
        return carousel ? ind + cloneCount : ind;
      }

      function getAbsIndex (i) {
        if (i == null) { i = index; }

        if (carousel) { i -= cloneCount; }
        while (i < 0) { i += slideCount; }

        return Math.floor(i%slideCount);
      }

      function getCurrentNavIndex () {
        var absIndex = getAbsIndex(),
            result;

        result = navAsThumbnails ? absIndex : 
          fixedWidth || autoWidth ? Math.ceil((absIndex + 1) * pages / slideCount - 1) : 
              Math.floor(absIndex / items);

        // set active nav to the last one when reaches the right edge
        if (!loop && carousel && index === indexMax) { result = pages - 1; }

        return result;
      }

      function getItemsMax () {
        // fixedWidth or autoWidth while viewportMax is not available
        if (autoWidth || (fixedWidth && !viewportMax)) {
          return slideCount - 1;
        // most cases
        } else {
          var str = fixedWidth ? 'fixedWidth' : 'items',
              arr = [];

          if (fixedWidth || options[str] < slideCount) { arr.push(options[str]); }

          if (responsive) {
            for (var bp in responsive) {
              var tem = responsive[bp][str];
              if (tem && (fixedWidth || tem < slideCount)) { arr.push(tem); }
            }
          }

          if (!arr.length) { arr.push(0); }

          return Math.ceil(fixedWidth ? viewportMax / Math.min.apply(null, arr) : Math.max.apply(null, arr));
        }
      }

      function getCloneCountForLoop () {
        var itemsMax = getItemsMax(),
            result = carousel ? Math.ceil((itemsMax * 5 - slideCount)/2) : (itemsMax * 4 - slideCount);
        result = Math.max(itemsMax, result);

        return hasOption('edgePadding') ? result + 1 : result;
      }

      function getWindowWidth () {
        return win.innerWidth || doc.documentElement.clientWidth || doc.body.clientWidth;
      }

      function getInsertPosition (pos) {
        return pos === 'top' ? 'afterbegin' : 'beforeend';
      }

      function getClientWidth (el) {
        var div = doc.createElement('div'), rect, width;
        el.appendChild(div);
        rect = div.getBoundingClientRect();
        width = rect.right - rect.left;
        div.remove();
        return width || getClientWidth(el.parentNode);
      }

      function getViewportWidth () {
        var gap = edgePadding ? edgePadding * 2 - gutter : 0;
        return getClientWidth(containerParent) - gap;
      }

      function hasOption (item) {
        if (options[item]) {
          return true;
        } else {
          if (responsive) {
            for (var bp in responsive) {
              if (responsive[bp][item]) { return true; }
            }
          }
          return false;
        }
      }

      // get option:
      // fixed width: viewport, fixedWidth, gutter => items
      // others: window width => all variables
      // all: items => slideBy
      function getOption (item, ww) {
        if (ww == null) { ww = windowWidth; }

        if (item === 'items' && fixedWidth) {
          return Math.floor((viewport + gutter) / (fixedWidth + gutter)) || 1;

        } else {
          var result = options[item];

          if (responsive) {
            for (var bp in responsive) {
              // bp: convert string to number
              if (ww >= parseInt(bp)) {
                if (item in responsive[bp]) { result = responsive[bp][item]; }
              }
            }
          }

          if (item === 'slideBy' && result === 'page') { result = getOption('items'); }
          if (!carousel && (item === 'slideBy' || item === 'items')) { result = Math.floor(result); }

          return result;
        }
      }

      function getSlideMarginLeft (i) {
        return CALC ? 
          CALC + '(' + i * 100 + '% / ' + slideCountNew + ')' : 
          i * 100 / slideCountNew + '%';
      }

      function getInnerWrapperStyles (edgePaddingTem, gutterTem, fixedWidthTem, speedTem, autoHeightBP) {
        var str = '';

        if (edgePaddingTem !== undefined) {
          var gap = edgePaddingTem;
          if (gutterTem) { gap -= gutterTem; }
          str = horizontal ?
            'margin: 0 ' + gap + 'px 0 ' + edgePaddingTem + 'px;' :
            'margin: ' + edgePaddingTem + 'px 0 ' + gap + 'px 0;';
        } else if (gutterTem && !fixedWidthTem) {
          var gutterTemUnit = '-' + gutterTem + 'px',
              dir = horizontal ? gutterTemUnit + ' 0 0' : '0 ' + gutterTemUnit + ' 0';
          str = 'margin: 0 ' + dir + ';';
        }

        if (!carousel && autoHeightBP && TRANSITIONDURATION && speedTem) { str += getTransitionDurationStyle(speedTem); }
        return str;
      }

      function getContainerWidth (fixedWidthTem, gutterTem, itemsTem) {
        if (fixedWidthTem) {
          return (fixedWidthTem + gutterTem) * slideCountNew + 'px';
        } else {
          return CALC ?
            CALC + '(' + slideCountNew * 100 + '% / ' + itemsTem + ')' :
            slideCountNew * 100 / itemsTem + '%';
        }
      }

      function getSlideWidthStyle (fixedWidthTem, gutterTem, itemsTem) {
        var width;

        if (fixedWidthTem) {
          width = (fixedWidthTem + gutterTem) + 'px';
        } else {
          if (!carousel) { itemsTem = Math.floor(itemsTem); }
          var dividend = carousel ? slideCountNew : itemsTem;
          width = CALC ? 
            CALC + '(100% / ' + dividend + ')' : 
            100 / dividend + '%';
        }

        width = 'width:' + width;

        // inner slider: overwrite outer slider styles
        return nested !== 'inner' ? width + ';' : width + ' !important;';
      }

      function getSlideGutterStyle (gutterTem) {
        var str = '';

        // gutter maybe interger || 0
        // so can't use 'if (gutter)'
        if (gutterTem !== false) {
          var prop = horizontal ? 'padding-' : 'margin-',
              dir = horizontal ? 'right' : 'bottom';
          str = prop +  dir + ': ' + gutterTem + 'px;';
        }

        return str;
      }

      function getCSSPrefix (name, num) {
        var prefix = name.substring(0, name.length - num).toLowerCase();
        if (prefix) { prefix = '-' + prefix + '-'; }

        return prefix;
      }

      function getTransitionDurationStyle (speed) {
        return getCSSPrefix(TRANSITIONDURATION, 18) + 'transition-duration:' + speed / 1000 + 's;';
      }

      function getAnimationDurationStyle (speed) {
        return getCSSPrefix(ANIMATIONDURATION, 17) + 'animation-duration:' + speed / 1000 + 's;';
      }

      function initStructure () {
        var classOuter = 'tns-outer',
            classInner = 'tns-inner',
            hasGutter = hasOption('gutter');

        outerWrapper.className = classOuter;
        innerWrapper.className = classInner;
        outerWrapper.id = slideId + '-ow';
        innerWrapper.id = slideId + '-iw';

        // set container properties
        if (container.id === '') { container.id = slideId; }
        newContainerClasses += PERCENTAGELAYOUT || autoWidth ? ' tns-subpixel' : ' tns-no-subpixel';
        newContainerClasses += CALC ? ' tns-calc' : ' tns-no-calc';
        if (autoWidth) { newContainerClasses += ' tns-autowidth'; }
        newContainerClasses += ' tns-' + options.axis;
        container.className += newContainerClasses;

        // add constrain layer for carousel
        if (carousel) {
          middleWrapper = doc.createElement('div');
          middleWrapper.id = slideId + '-mw';
          middleWrapper.className = 'tns-ovh';

          outerWrapper.appendChild(middleWrapper);
          middleWrapper.appendChild(innerWrapper);
        } else {
          outerWrapper.appendChild(innerWrapper);
        }

        if (autoHeight) {
          var wp = middleWrapper ? middleWrapper : innerWrapper;
          wp.className += ' tns-ah';
        }

        containerParent.insertBefore(outerWrapper, container);
        innerWrapper.appendChild(container);

        // add id, class, aria attributes 
        // before clone slides
        forEach$1(slideItems, function(item, i) {
          addClass$1(item, 'tns-item');
          if (!item.id) { item.id = slideId + '-item' + i; }
          if (!carousel && animateNormal) { addClass$1(item, animateNormal); }
          setAttrs(item, {
            'aria-hidden': 'true',
            'tabindex': '-1'
          });
        });

        // ## clone slides
        // carousel: n + slides + n
        // gallery:      slides + n
        if (cloneCount) {
          var fragmentBefore = doc.createDocumentFragment(), 
              fragmentAfter = doc.createDocumentFragment();

          for (var j = cloneCount; j--;) {
            var num = j%slideCount,
                cloneFirst = slideItems[num].cloneNode(true);
            removeAttrs(cloneFirst, 'id');
            fragmentAfter.insertBefore(cloneFirst, fragmentAfter.firstChild);

            if (carousel) {
              var cloneLast = slideItems[slideCount - 1 - num].cloneNode(true);
              removeAttrs(cloneLast, 'id');
              fragmentBefore.appendChild(cloneLast);
            }
          }

          container.insertBefore(fragmentBefore, container.firstChild);
          container.appendChild(fragmentAfter);
          slideItems = container.children;
        }

      }

      function initSliderTransform () {
        // ## images loaded/failed
        if (hasOption('autoHeight') || autoWidth || !horizontal) {
          var imgs = container.querySelectorAll('img');

          // add complete class if all images are loaded/failed
          forEach$1(imgs, function(img) {
            var src = img.src;
            
            if (src && src.indexOf('data:image') < 0) {
              addEvents(img, imgEvents);
              img.src = '';
              img.src = src;
              addClass$1(img, 'loading');
            } else if (!lazyload) {
              imgLoaded(img);
            }
          });

          // All imgs are completed
          raf$1(function(){ imgsLoadedCheck(arrayFromNodeList(imgs), function() { imgsComplete = true; }); });

          // Check imgs in window only for auto height
          if (!autoWidth && horizontal) { imgs = getImageArray(index, Math.min(index + items - 1, slideCountNew - 1)); }

          lazyload ? initSliderTransformStyleCheck() : raf$1(function(){ imgsLoadedCheck(arrayFromNodeList(imgs), initSliderTransformStyleCheck); });

        } else {
          // set container transform property
          if (carousel) { doContainerTransformSilent(); }

          // update slider tools and events
          initTools();
          initEvents();
        }
      }

      function initSliderTransformStyleCheck () {
        if (autoWidth) {
          // check styles application
          var num = loop ? index : slideCount - 1;
          (function stylesApplicationCheck() {
            slideItems[num - 1].getBoundingClientRect().right.toFixed(2) === slideItems[num].getBoundingClientRect().left.toFixed(2) ?
            initSliderTransformCore() :
            setTimeout(function(){ stylesApplicationCheck(); }, 16);
          })();
        } else {
          initSliderTransformCore();
        }
      }


      function initSliderTransformCore () {
        // run Fn()s which are rely on image loading
        if (!horizontal || autoWidth) {
          setSlidePositions();

          if (autoWidth) {
            rightBoundary = getRightBoundary();
            if (freezable) { freeze = getFreeze(); }
            indexMax = getIndexMax(); // <= slidePositions, rightBoundary <=
            resetVariblesWhenDisable(disable || freeze);
          } else {
            updateContentWrapperHeight();
          }
        }

        // set container transform property
        if (carousel) { doContainerTransformSilent(); }

        // update slider tools and events
        initTools();
        initEvents();
      }

      function initSheet () {
        // gallery:
        // set animation classes and left value for gallery slider
        if (!carousel) { 
          for (var i = index, l = index + Math.min(slideCount, items); i < l; i++) {
            var item = slideItems[i];
            item.style.left = (i - index) * 100 / items + '%';
            addClass$1(item, animateIn);
            removeClass$1(item, animateNormal);
          }
        }

        // #### LAYOUT

        // ## INLINE-BLOCK VS FLOAT

        // ## PercentageLayout:
        // slides: inline-block
        // remove blank space between slides by set font-size: 0

        // ## Non PercentageLayout:
        // slides: float
        //         margin-right: -100%
        //         margin-left: ~

        // Resource: https://docs.google.com/spreadsheets/d/147up245wwTXeQYve3BRSAD4oVcvQmuGsFteJOeA5xNQ/edit?usp=sharing
        if (horizontal) {
          if (PERCENTAGELAYOUT || autoWidth) {
            addCSSRule(sheet, '#' + slideId + ' > .tns-item', 'font-size:' + win.getComputedStyle(slideItems[0]).fontSize + ';', getCssRulesLength(sheet));
            addCSSRule(sheet, '#' + slideId, 'font-size:0;', getCssRulesLength(sheet));
          } else if (carousel) {
            forEach$1(slideItems, function (slide, i) {
              slide.style.marginLeft = getSlideMarginLeft(i);
            });
          }
        }


        // ## BASIC STYLES
        if (CSSMQ) {
          // middle wrapper style
          if (TRANSITIONDURATION) {
            var str = middleWrapper && options.autoHeight ? getTransitionDurationStyle(options.speed) : '';
            addCSSRule(sheet, '#' + slideId + '-mw', str, getCssRulesLength(sheet));
          }

          // inner wrapper styles
          str = getInnerWrapperStyles(options.edgePadding, options.gutter, options.fixedWidth, options.speed, options.autoHeight);
          addCSSRule(sheet, '#' + slideId + '-iw', str, getCssRulesLength(sheet));

          // container styles
          if (carousel) {
            str = horizontal && !autoWidth ? 'width:' + getContainerWidth(options.fixedWidth, options.gutter, options.items) + ';' : '';
            if (TRANSITIONDURATION) { str += getTransitionDurationStyle(speed); }
            addCSSRule(sheet, '#' + slideId, str, getCssRulesLength(sheet));
          }

          // slide styles
          str = horizontal && !autoWidth ? getSlideWidthStyle(options.fixedWidth, options.gutter, options.items) : '';
          if (options.gutter) { str += getSlideGutterStyle(options.gutter); }
          // set gallery items transition-duration
          if (!carousel) {
            if (TRANSITIONDURATION) { str += getTransitionDurationStyle(speed); }
            if (ANIMATIONDURATION) { str += getAnimationDurationStyle(speed); }
          }
          if (str) { addCSSRule(sheet, '#' + slideId + ' > .tns-item', str, getCssRulesLength(sheet)); }

        // non CSS mediaqueries: IE8
        // ## update inner wrapper, container, slides if needed
        // set inline styles for inner wrapper & container
        // insert stylesheet (one line) for slides only (since slides are many)
        } else {
          // middle wrapper styles
          update_carousel_transition_duration();

          // inner wrapper styles
          innerWrapper.style.cssText = getInnerWrapperStyles(edgePadding, gutter, fixedWidth, autoHeight);

          // container styles
          if (carousel && horizontal && !autoWidth) {
            container.style.width = getContainerWidth(fixedWidth, gutter, items);
          }

          // slide styles
          var str = horizontal && !autoWidth ? getSlideWidthStyle(fixedWidth, gutter, items) : '';
          if (gutter) { str += getSlideGutterStyle(gutter); }

          // append to the last line
          if (str) { addCSSRule(sheet, '#' + slideId + ' > .tns-item', str, getCssRulesLength(sheet)); }
        }

        // ## MEDIAQUERIES
        if (responsive && CSSMQ) {
          for (var bp in responsive) {
            // bp: convert string to number
            bp = parseInt(bp);

            var opts = responsive[bp],
                str = '',
                middleWrapperStr = '',
                innerWrapperStr = '',
                containerStr = '',
                slideStr = '',
                itemsBP = !autoWidth ? getOption('items', bp) : null,
                fixedWidthBP = getOption('fixedWidth', bp),
                speedBP = getOption('speed', bp),
                edgePaddingBP = getOption('edgePadding', bp),
                autoHeightBP = getOption('autoHeight', bp),
                gutterBP = getOption('gutter', bp);

            // middle wrapper string
            if (TRANSITIONDURATION && middleWrapper && getOption('autoHeight', bp) && 'speed' in opts) {
              middleWrapperStr = '#' + slideId + '-mw{' + getTransitionDurationStyle(speedBP) + '}';
            }

            // inner wrapper string
            if ('edgePadding' in opts || 'gutter' in opts) {
              innerWrapperStr = '#' + slideId + '-iw{' + getInnerWrapperStyles(edgePaddingBP, gutterBP, fixedWidthBP, speedBP, autoHeightBP) + '}';
            }

            // container string
            if (carousel && horizontal && !autoWidth && ('fixedWidth' in opts || 'items' in opts || (fixedWidth && 'gutter' in opts))) {
              containerStr = 'width:' + getContainerWidth(fixedWidthBP, gutterBP, itemsBP) + ';';
            }
            if (TRANSITIONDURATION && 'speed' in opts) {
              containerStr += getTransitionDurationStyle(speedBP);
            }
            if (containerStr) {
              containerStr = '#' + slideId + '{' + containerStr + '}';
            }

            // slide string
            if ('fixedWidth' in opts || (fixedWidth && 'gutter' in opts) || !carousel && 'items' in opts) {
              slideStr += getSlideWidthStyle(fixedWidthBP, gutterBP, itemsBP);
            }
            if ('gutter' in opts) {
              slideStr += getSlideGutterStyle(gutterBP);
            }
            // set gallery items transition-duration
            if (!carousel && 'speed' in opts) {
              if (TRANSITIONDURATION) { slideStr += getTransitionDurationStyle(speedBP); }
              if (ANIMATIONDURATION) { slideStr += getAnimationDurationStyle(speedBP); }
            }
            if (slideStr) { slideStr = '#' + slideId + ' > .tns-item{' + slideStr + '}'; }

            // add up
            str = middleWrapperStr + innerWrapperStr + containerStr + slideStr;

            if (str) {
              sheet.insertRule('@media (min-width: ' + bp / 16 + 'em) {' + str + '}', sheet.cssRules.length);
            }
          }
        }
      }

      function initTools () {
        // == slides ==
        updateSlideStatus();

        // == live region ==
        outerWrapper.insertAdjacentHTML('afterbegin', '<div class="tns-liveregion tns-visually-hidden" aria-live="polite" aria-atomic="true">slide <span class="current">' + getLiveRegionStr() + '</span>  of ' + slideCount + '</div>');
        liveregionCurrent = outerWrapper.querySelector('.tns-liveregion .current');

        // == autoplayInit ==
        if (hasAutoplay) {
          var txt = autoplay ? 'stop' : 'start';
          if (autoplayButton) {
            setAttrs(autoplayButton, {'data-action': txt});
          } else if (options.autoplayButtonOutput) {
            outerWrapper.insertAdjacentHTML(getInsertPosition(options.autoplayPosition), '<button data-action="' + txt + '">' + autoplayHtmlStrings[0] + txt + autoplayHtmlStrings[1] + autoplayText[0] + '</button>');
            autoplayButton = outerWrapper.querySelector('[data-action]');
          }

          // add event
          if (autoplayButton) {
            addEvents(autoplayButton, {'click': toggleAutoplay});
          }

          if (autoplay) {
            startAutoplay();
            if (autoplayHoverPause) { addEvents(container, hoverEvents); }
            if (autoplayResetOnVisibility) { addEvents(container, visibilityEvent); }
          }
        }
     
        // == navInit ==
        if (hasNav) {
          // customized nav
          // will not hide the navs in case they're thumbnails
          if (navContainer) {
            setAttrs(navContainer, {'aria-label': 'Carousel Pagination'});
            navItems = navContainer.children;
            forEach$1(navItems, function(item, i) {
              setAttrs(item, {
                'data-nav': i,
                'tabindex': '-1',
                'aria-label': navStr + (i + 1),
                'aria-controls': slideId,
              });
            });

          // generated nav 
          } else {
            var navHtml = '',
                hiddenStr = navAsThumbnails ? '' : 'style="display:none"';
            for (var i = 0; i < slideCount; i++) {
              // hide nav items by default
              navHtml += '<button data-nav="' + i +'" tabindex="-1" aria-controls="' + slideId + '" ' + hiddenStr + ' aria-label="' + navStr + (i + 1) +'"></button>';
            }
            navHtml = '<div class="tns-nav" aria-label="Carousel Pagination">' + navHtml + '</div>';
            outerWrapper.insertAdjacentHTML(getInsertPosition(options.navPosition), navHtml);

            navContainer = outerWrapper.querySelector('.tns-nav');
            navItems = navContainer.children;
          }

          updateNavVisibility();

          // add transition
          if (TRANSITIONDURATION) {
            var prefix = TRANSITIONDURATION.substring(0, TRANSITIONDURATION.length - 18).toLowerCase(),
                str = 'transition: all ' + speed / 1000 + 's';

            if (prefix) {
              str = '-' + prefix + '-' + str;
            }

            addCSSRule(sheet, '[aria-controls^=' + slideId + '-item]', str, getCssRulesLength(sheet));
          }

          setAttrs(navItems[navCurrentIndex], {'aria-label': navStr + (navCurrentIndex + 1) + navStrCurrent});
          removeAttrs(navItems[navCurrentIndex], 'tabindex');
          addClass$1(navItems[navCurrentIndex], navActiveClass);

          // add events
          addEvents(navContainer, navEvents);
        }



        // == controlsInit ==
        if (hasControls) {
          if (!controlsContainer && (!prevButton || !nextButton)) {
            outerWrapper.insertAdjacentHTML(getInsertPosition(options.controlsPosition), '<div class="tns-controls" aria-label="Carousel Navigation" tabindex="0"><button data-controls="prev" tabindex="-1" aria-controls="' + slideId +'">' + controlsText[0] + '</button><button data-controls="next" tabindex="-1" aria-controls="' + slideId +'">' + controlsText[1] + '</button></div>');

            controlsContainer = outerWrapper.querySelector('.tns-controls');
          }

          if (!prevButton || !nextButton) {
            prevButton = controlsContainer.children[0];
            nextButton = controlsContainer.children[1];
          }

          if (options.controlsContainer) {
            setAttrs(controlsContainer, {
              'aria-label': 'Carousel Navigation',
              'tabindex': '0'
            });
          }

          if (options.controlsContainer || (options.prevButton && options.nextButton)) {
            setAttrs([prevButton, nextButton], {
              'aria-controls': slideId,
              'tabindex': '-1',
            });
          }
          
          if (options.controlsContainer || (options.prevButton && options.nextButton)) {
            setAttrs(prevButton, {'data-controls' : 'prev'});
            setAttrs(nextButton, {'data-controls' : 'next'});
          }

          prevIsButton = isButton(prevButton);
          nextIsButton = isButton(nextButton);

          updateControlsStatus();

          // add events
          if (controlsContainer) {
            addEvents(controlsContainer, controlsEvents);
          } else {
            addEvents(prevButton, controlsEvents);
            addEvents(nextButton, controlsEvents);
          }
        }

        // hide tools if needed
        disableUI();
      }

      function initEvents () {
        // add events
        if (carousel && TRANSITIONEND) {
          var eve = {};
          eve[TRANSITIONEND] = onTransitionEnd;
          addEvents(container, eve);
        }

        if (touch) { addEvents(container, touchEvents, options.preventScrollOnTouch); }
        if (mouseDrag) { addEvents(container, dragEvents); }
        if (arrowKeys) { addEvents(doc, docmentKeydownEvent); }

        if (nested === 'inner') {
          events.on('outerResized', function () {
            resizeTasks();
            events.emit('innerLoaded', info());
          });
        } else if (responsive || fixedWidth || autoWidth || autoHeight || !horizontal) {
          addEvents(win, {'resize': onResize});
        }

        if (autoHeight) {
          if (nested === 'outer') {
            events.on('innerLoaded', doAutoHeight);
          } else if (!disable) { doAutoHeight(); }
        }

        doLazyLoad();
        if (disable) { disableSlider(); } else if (freeze) { freezeSlider(); }

        events.on('indexChanged', additionalUpdates);
        if (nested === 'inner') { events.emit('innerLoaded', info()); }
        if (typeof onInit === 'function') { onInit(info()); }
        isOn = true;
      }

      function destroy () {
        // sheet
        sheet.disabled = true;
        if (sheet.ownerNode) { sheet.ownerNode.remove(); }

        // remove win event listeners
        removeEvents(win, {'resize': onResize});

        // arrowKeys, controls, nav
        if (arrowKeys) { removeEvents(doc, docmentKeydownEvent); }
        if (controlsContainer) { removeEvents(controlsContainer, controlsEvents); }
        if (navContainer) { removeEvents(navContainer, navEvents); }

        // autoplay
        removeEvents(container, hoverEvents);
        removeEvents(container, visibilityEvent);
        if (autoplayButton) { removeEvents(autoplayButton, {'click': toggleAutoplay}); }
        if (autoplay) { clearInterval(autoplayTimer); }

        // container
        if (carousel && TRANSITIONEND) {
          var eve = {};
          eve[TRANSITIONEND] = onTransitionEnd;
          removeEvents(container, eve);
        }
        if (touch) { removeEvents(container, touchEvents); }
        if (mouseDrag) { removeEvents(container, dragEvents); }

        // cache Object values in options && reset HTML
        var htmlList = [containerHTML, controlsContainerHTML, prevButtonHTML, nextButtonHTML, navContainerHTML, autoplayButtonHTML];

        tnsList.forEach(function(item, i) {
          var el = item === 'container' ? outerWrapper : options[item];

          if (typeof el === 'object') {
            var prevEl = el.previousElementSibling ? el.previousElementSibling : false,
                parentEl = el.parentNode;
            el.outerHTML = htmlList[i];
            options[item] = prevEl ? prevEl.nextElementSibling : parentEl.firstElementChild;
          }
        });


        // reset variables
        tnsList = animateIn = animateOut = animateDelay = animateNormal = horizontal = outerWrapper = innerWrapper = container = containerParent = containerHTML = slideItems = slideCount = breakpointZone = windowWidth = autoWidth = fixedWidth = edgePadding = gutter = viewport = items = slideBy = viewportMax = arrowKeys = speed = rewind = loop = autoHeight = sheet = lazyload = slidePositions = slideItemsOut = cloneCount = slideCountNew = hasRightDeadZone = rightBoundary = updateIndexBeforeTransform = transformAttr = transformPrefix = transformPostfix = getIndexMax = index = indexCached = indexMin = indexMax = resizeTimer = swipeAngle = moveDirectionExpected = running = onInit = events = newContainerClasses = slideId = disable = disabled = freezable = freeze = frozen = controlsEvents = navEvents = hoverEvents = visibilityEvent = docmentKeydownEvent = touchEvents = dragEvents = hasControls = hasNav = navAsThumbnails = hasAutoplay = hasTouch = hasMouseDrag = slideActiveClass = imgCompleteClass = imgEvents = imgsComplete = controls = controlsText = controlsContainer = controlsContainerHTML = prevButton = nextButton = prevIsButton = nextIsButton = nav = navContainer = navContainerHTML = navItems = pages = pagesCached = navClicked = navCurrentIndex = navCurrentIndexCached = navActiveClass = navStr = navStrCurrent = autoplay = autoplayTimeout = autoplayDirection = autoplayText = autoplayHoverPause = autoplayButton = autoplayButtonHTML = autoplayResetOnVisibility = autoplayHtmlStrings = autoplayTimer = animating = autoplayHoverPaused = autoplayUserPaused = autoplayVisibilityPaused = initPosition = lastPosition = translateInit = disX = disY = panStart = rafIndex = getDist = touch = mouseDrag = null;
        // check variables
        // [animateIn, animateOut, animateDelay, animateNormal, horizontal, outerWrapper, innerWrapper, container, containerParent, containerHTML, slideItems, slideCount, breakpointZone, windowWidth, autoWidth, fixedWidth, edgePadding, gutter, viewport, items, slideBy, viewportMax, arrowKeys, speed, rewind, loop, autoHeight, sheet, lazyload, slidePositions, slideItemsOut, cloneCount, slideCountNew, hasRightDeadZone, rightBoundary, updateIndexBeforeTransform, transformAttr, transformPrefix, transformPostfix, getIndexMax, index, indexCached, indexMin, indexMax, resizeTimer, swipeAngle, moveDirectionExpected, running, onInit, events, newContainerClasses, slideId, disable, disabled, freezable, freeze, frozen, controlsEvents, navEvents, hoverEvents, visibilityEvent, docmentKeydownEvent, touchEvents, dragEvents, hasControls, hasNav, navAsThumbnails, hasAutoplay, hasTouch, hasMouseDrag, slideActiveClass, imgCompleteClass, imgEvents, imgsComplete, controls, controlsText, controlsContainer, controlsContainerHTML, prevButton, nextButton, prevIsButton, nextIsButton, nav, navContainer, navContainerHTML, navItems, pages, pagesCached, navClicked, navCurrentIndex, navCurrentIndexCached, navActiveClass, navStr, navStrCurrent, autoplay, autoplayTimeout, autoplayDirection, autoplayText, autoplayHoverPause, autoplayButton, autoplayButtonHTML, autoplayResetOnVisibility, autoplayHtmlStrings, autoplayTimer, animating, autoplayHoverPaused, autoplayUserPaused, autoplayVisibilityPaused, initPosition, lastPosition, translateInit, disX, disY, panStart, rafIndex, getDist, touch, mouseDrag ].forEach(function(item) { if (item !== null) { console.log(item); } });

        for (var a in this) {
          if (a !== 'rebuild') { this[a] = null; }
        }
        isOn = false;
      }

    // === ON RESIZE ===
      // responsive || fixedWidth || autoWidth || !horizontal
      function onResize (e) {
        raf$1(function(){ resizeTasks(getEvent(e)); });
      }

      function resizeTasks (e) {
        if (!isOn) { return; }
        if (nested === 'outer') { events.emit('outerResized', info(e)); }
        windowWidth = getWindowWidth();
        var bpChanged,
            breakpointZoneTem = breakpointZone,
            needContainerTransform = false;

        if (responsive) {
          setBreakpointZone();
          bpChanged = breakpointZoneTem !== breakpointZone;
          // if (hasRightDeadZone) { needContainerTransform = true; } // *?
          if (bpChanged) { events.emit('newBreakpointStart', info(e)); }
        }

        var indChanged,
            itemsChanged,
            itemsTem = items,
            disableTem = disable,
            freezeTem = freeze,
            arrowKeysTem = arrowKeys,
            controlsTem = controls,
            navTem = nav,
            touchTem = touch,
            mouseDragTem = mouseDrag,
            autoplayTem = autoplay,
            autoplayHoverPauseTem = autoplayHoverPause,
            autoplayResetOnVisibilityTem = autoplayResetOnVisibility,
            indexTem = index;

        if (bpChanged) {
          var fixedWidthTem = fixedWidth,
              autoHeightTem = autoHeight,
              controlsTextTem = controlsText,
              centerTem = center,
              autoplayTextTem = autoplayText;

          if (!CSSMQ) {
            var gutterTem = gutter,
                edgePaddingTem = edgePadding;
          }
        }

        // get option:
        // fixed width: viewport, fixedWidth, gutter => items
        // others: window width => all variables
        // all: items => slideBy
        arrowKeys = getOption('arrowKeys');
        controls = getOption('controls');
        nav = getOption('nav');
        touch = getOption('touch');
        center = getOption('center');
        mouseDrag = getOption('mouseDrag');
        autoplay = getOption('autoplay');
        autoplayHoverPause = getOption('autoplayHoverPause');
        autoplayResetOnVisibility = getOption('autoplayResetOnVisibility');

        if (bpChanged) {
          disable = getOption('disable');
          fixedWidth = getOption('fixedWidth');
          speed = getOption('speed');
          autoHeight = getOption('autoHeight');
          controlsText = getOption('controlsText');
          autoplayText = getOption('autoplayText');
          autoplayTimeout = getOption('autoplayTimeout');

          if (!CSSMQ) {
            edgePadding = getOption('edgePadding');
            gutter = getOption('gutter');
          }
        }
        // update options
        resetVariblesWhenDisable(disable);

        viewport = getViewportWidth(); // <= edgePadding, gutter
        if ((!horizontal || autoWidth) && !disable) {
          setSlidePositions();
          if (!horizontal) {
            updateContentWrapperHeight(); // <= setSlidePositions
            needContainerTransform = true;
          }
        }
        if (fixedWidth || autoWidth) {
          rightBoundary = getRightBoundary(); // autoWidth: <= viewport, slidePositions, gutter
                                              // fixedWidth: <= viewport, fixedWidth, gutter
          indexMax = getIndexMax(); // autoWidth: <= rightBoundary, slidePositions
                                    // fixedWidth: <= rightBoundary, fixedWidth, gutter
        }

        if (bpChanged || fixedWidth) {
          items = getOption('items');
          slideBy = getOption('slideBy');
          itemsChanged = items !== itemsTem;

          if (itemsChanged) {
            if (!fixedWidth && !autoWidth) { indexMax = getIndexMax(); } // <= items
            // check index before transform in case
            // slider reach the right edge then items become bigger
            updateIndex();
          }
        }
        
        if (bpChanged) {
          if (disable !== disableTem) {
            if (disable) {
              disableSlider();
            } else {
              enableSlider(); // <= slidePositions, rightBoundary, indexMax
            }
          }
        }

        if (freezable && (bpChanged || fixedWidth || autoWidth)) {
          freeze = getFreeze(); // <= autoWidth: slidePositions, gutter, viewport, rightBoundary
                                // <= fixedWidth: fixedWidth, gutter, rightBoundary
                                // <= others: items

          if (freeze !== freezeTem) {
            if (freeze) {
              doContainerTransform(getContainerTransformValue(getStartIndex(0)));
              freezeSlider();
            } else {
              unfreezeSlider();
              needContainerTransform = true;
            }
          }
        }

        resetVariblesWhenDisable(disable || freeze); // controls, nav, touch, mouseDrag, arrowKeys, autoplay, autoplayHoverPause, autoplayResetOnVisibility
        if (!autoplay) { autoplayHoverPause = autoplayResetOnVisibility = false; }

        if (arrowKeys !== arrowKeysTem) {
          arrowKeys ?
            addEvents(doc, docmentKeydownEvent) :
            removeEvents(doc, docmentKeydownEvent);
        }
        if (controls !== controlsTem) {
          if (controls) {
            if (controlsContainer) {
              showElement(controlsContainer);
            } else {
              if (prevButton) { showElement(prevButton); }
              if (nextButton) { showElement(nextButton); }
            }
          } else {
            if (controlsContainer) {
              hideElement(controlsContainer);
            } else {
              if (prevButton) { hideElement(prevButton); }
              if (nextButton) { hideElement(nextButton); }
            }
          }
        }
        if (nav !== navTem) {
          nav ?
            showElement(navContainer) :
            hideElement(navContainer);
        }
        if (touch !== touchTem) {
          touch ?
            addEvents(container, touchEvents, options.preventScrollOnTouch) :
            removeEvents(container, touchEvents);
        }
        if (mouseDrag !== mouseDragTem) {
          mouseDrag ?
            addEvents(container, dragEvents) :
            removeEvents(container, dragEvents);
        }
        if (autoplay !== autoplayTem) {
          if (autoplay) {
            if (autoplayButton) { showElement(autoplayButton); }
            if (!animating && !autoplayUserPaused) { startAutoplay(); }
          } else {
            if (autoplayButton) { hideElement(autoplayButton); }
            if (animating) { stopAutoplay(); }
          }
        }
        if (autoplayHoverPause !== autoplayHoverPauseTem) {
          autoplayHoverPause ?
            addEvents(container, hoverEvents) :
            removeEvents(container, hoverEvents);
        }
        if (autoplayResetOnVisibility !== autoplayResetOnVisibilityTem) {
          autoplayResetOnVisibility ?
            addEvents(doc, visibilityEvent) :
            removeEvents(doc, visibilityEvent);
        }

        if (bpChanged) {
          if (fixedWidth !== fixedWidthTem || center !== centerTem) { needContainerTransform = true; }

          if (autoHeight !== autoHeightTem) {
            if (!autoHeight) { innerWrapper.style.height = ''; }
          }

          if (controls && controlsText !== controlsTextTem) {
            prevButton.innerHTML = controlsText[0];
            nextButton.innerHTML = controlsText[1];
          }

          if (autoplayButton && autoplayText !== autoplayTextTem) {
            var i = autoplay ? 1 : 0,
                html = autoplayButton.innerHTML,
                len = html.length - autoplayTextTem[i].length;
            if (html.substring(len) === autoplayTextTem[i]) {
              autoplayButton.innerHTML = html.substring(0, len) + autoplayText[i];
            }
          }
        } else {
          if (center && (fixedWidth || autoWidth)) { needContainerTransform = true; }
        }

        if (itemsChanged || fixedWidth && !autoWidth) {
          pages = getPages();
          updateNavVisibility();
        }

        indChanged = index !== indexTem;
        if (indChanged) { 
          events.emit('indexChanged', info());
          needContainerTransform = true;
        } else if (itemsChanged) {
          if (!indChanged) { additionalUpdates(); }
        } else if (fixedWidth || autoWidth) {
          doLazyLoad(); 
          updateSlideStatus();
          updateLiveRegion();
        }

        if (itemsChanged && !carousel) { updateGallerySlidePositions(); }

        if (!disable && !freeze) {
          // non-meduaqueries: IE8
          if (bpChanged && !CSSMQ) {
            // middle wrapper styles
            if (autoHeight !== autoheightTem || speed !== speedTem) {
              update_carousel_transition_duration();
            }

            // inner wrapper styles
            if (edgePadding !== edgePaddingTem || gutter !== gutterTem) {
              innerWrapper.style.cssText = getInnerWrapperStyles(edgePadding, gutter, fixedWidth, speed, autoHeight);
            }

            if (horizontal) {
              // container styles
              if (carousel) {
                container.style.width = getContainerWidth(fixedWidth, gutter, items);
              }

              // slide styles
              var str = getSlideWidthStyle(fixedWidth, gutter, items) + 
                        getSlideGutterStyle(gutter);

              // remove the last line and
              // add new styles
              removeCSSRule(sheet, getCssRulesLength(sheet) - 1);
              addCSSRule(sheet, '#' + slideId + ' > .tns-item', str, getCssRulesLength(sheet));
            }
          }

          // auto height
          if (autoHeight) { doAutoHeight(); }

          if (needContainerTransform) {
            doContainerTransformSilent();
            indexCached = index;
          }
        }

        if (bpChanged) { events.emit('newBreakpointEnd', info(e)); }
      }





      // === INITIALIZATION FUNCTIONS === //
      function getFreeze () {
        if (!fixedWidth && !autoWidth) {
          var a = center ? items - (items - 1) / 2 : items;
          return  slideCount <= a;
        }

        var width = fixedWidth ? (fixedWidth + gutter) * slideCount : slidePositions[slideCount],
            vp = edgePadding ? viewport + edgePadding * 2 : viewport + gutter;

        if (center) {
          vp -= fixedWidth ? (viewport - fixedWidth) / 2 : (viewport - (slidePositions[index + 1] - slidePositions[index] - gutter)) / 2;
        }

        return width <= vp;
      }

      function setBreakpointZone () {
        breakpointZone = 0;
        for (var bp in responsive) {
          bp = parseInt(bp); // convert string to number
          if (windowWidth >= bp) { breakpointZone = bp; }
        }
      }

      // (slideBy, indexMin, indexMax) => index
      var updateIndex = (function () {
        return loop ? 
          carousel ?
            // loop + carousel
            function () {
              var leftEdge = indexMin,
                  rightEdge = indexMax;

              leftEdge += slideBy;
              rightEdge -= slideBy;

              // adjust edges when has edge paddings
              // or fixed-width slider with extra space on the right side
              if (edgePadding) {
                leftEdge += 1;
                rightEdge -= 1;
              } else if (fixedWidth) {
                if ((viewport + gutter)%(fixedWidth + gutter)) { rightEdge -= 1; }
              }

              if (cloneCount) {
                if (index > rightEdge) {
                  index -= slideCount;
                } else if (index < leftEdge) {
                  index += slideCount;
                }
              }
            } :
            // loop + gallery
            function() {
              if (index > indexMax) {
                while (index >= indexMin + slideCount) { index -= slideCount; }
              } else if (index < indexMin) {
                while (index <= indexMax - slideCount) { index += slideCount; }
              }
            } :
          // non-loop
          function() {
            index = Math.max(indexMin, Math.min(indexMax, index));
          };
      })();

      function disableUI () {
        if (!autoplay && autoplayButton) { hideElement(autoplayButton); }
        if (!nav && navContainer) { hideElement(navContainer); }
        if (!controls) {
          if (controlsContainer) {
            hideElement(controlsContainer);
          } else {
            if (prevButton) { hideElement(prevButton); }
            if (nextButton) { hideElement(nextButton); }
          }
        }
      }

      function enableUI () {
        if (autoplay && autoplayButton) { showElement(autoplayButton); }
        if (nav && navContainer) { showElement(navContainer); }
        if (controls) {
          if (controlsContainer) {
            showElement(controlsContainer);
          } else {
            if (prevButton) { showElement(prevButton); }
            if (nextButton) { showElement(nextButton); }
          }
        }
      }

      function freezeSlider () {
        if (frozen) { return; }

        // remove edge padding from inner wrapper
        if (edgePadding) { innerWrapper.style.margin = '0px'; }

        // add class tns-transparent to cloned slides
        if (cloneCount) {
          var str = 'tns-transparent';
          for (var i = cloneCount; i--;) {
            if (carousel) { addClass$1(slideItems[i], str); }
            addClass$1(slideItems[slideCountNew - i - 1], str);
          }
        }

        // update tools
        disableUI();

        frozen = true;
      }

      function unfreezeSlider () {
        if (!frozen) { return; }

        // restore edge padding for inner wrapper
        // for mordern browsers
        if (edgePadding && CSSMQ) { innerWrapper.style.margin = ''; }

        // remove class tns-transparent to cloned slides
        if (cloneCount) {
          var str = 'tns-transparent';
          for (var i = cloneCount; i--;) {
            if (carousel) { removeClass$1(slideItems[i], str); }
            removeClass$1(slideItems[slideCountNew - i - 1], str);
          }
        }

        // update tools
        enableUI();

        frozen = false;
      }

      function disableSlider () {
        if (disabled) { return; }

        sheet.disabled = true;
        container.className = container.className.replace(newContainerClasses.substring(1), '');
        removeAttrs(container, ['style']);
        if (loop) {
          for (var j = cloneCount; j--;) {
            if (carousel) { hideElement(slideItems[j]); }
            hideElement(slideItems[slideCountNew - j - 1]);
          }
        }

        // vertical slider
        if (!horizontal || !carousel) { removeAttrs(innerWrapper, ['style']); }

        // gallery
        if (!carousel) { 
          for (var i = index, l = index + slideCount; i < l; i++) {
            var item = slideItems[i];
            removeAttrs(item, ['style']);
            removeClass$1(item, animateIn);
            removeClass$1(item, animateNormal);
          }
        }

        // update tools
        disableUI();

        disabled = true;
      }

      function enableSlider () {
        if (!disabled) { return; }

        sheet.disabled = false;
        container.className += newContainerClasses;
        doContainerTransformSilent();

        if (loop) {
          for (var j = cloneCount; j--;) {
            if (carousel) { showElement(slideItems[j]); }
            showElement(slideItems[slideCountNew - j - 1]);
          }
        }

        // gallery
        if (!carousel) { 
          for (var i = index, l = index + slideCount; i < l; i++) {
            var item = slideItems[i],
                classN = i < index + items ? animateIn : animateNormal;
            item.style.left = (i - index) * 100 / items + '%';
            addClass$1(item, classN);
          }
        }

        // update tools
        enableUI();

        disabled = false;
      }

      function updateLiveRegion () {
        var str = getLiveRegionStr();
        if (liveregionCurrent.innerHTML !== str) { liveregionCurrent.innerHTML = str; }
      }

      function getLiveRegionStr () {
        var arr = getVisibleSlideRange(),
            start = arr[0] + 1,
            end = arr[1] + 1;
        return start === end ? start + '' : start + ' to ' + end; 
      }

      function getVisibleSlideRange (val) {
        if (val == null) { val = getContainerTransformValue(); }
        var start = index, end, rangestart, rangeend;

        // get range start, range end for autoWidth and fixedWidth
        if (center || edgePadding) {
          if (autoWidth || fixedWidth) {
            rangestart = - (parseFloat(val) + edgePadding);
            rangeend = rangestart + viewport + edgePadding * 2;
          }
        } else {
          if (autoWidth) {
            rangestart = slidePositions[index];
            rangeend = rangestart + viewport;
          }
        }

        // get start, end
        // - check auto width
        if (autoWidth) {
          slidePositions.forEach(function(point, i) {
            if (i < slideCountNew) {
              if ((center || edgePadding) && point <= rangestart + 0.5) { start = i; }
              if (rangeend - point >= 0.5) { end = i; }
            }
          });

        // - check percentage width, fixed width
        } else {

          if (fixedWidth) {
            var cell = fixedWidth + gutter;
            if (center || edgePadding) {
              start = Math.floor(rangestart/cell);
              end = Math.ceil(rangeend/cell - 1);
            } else {
              end = start + Math.ceil(viewport/cell) - 1;
            }

          } else {
            if (center || edgePadding) {
              var a = items - 1;
              if (center) {
                start -= a / 2;
                end = index + a / 2;
              } else {
                end = index + a;
              }

              if (edgePadding) {
                var b = edgePadding * items / viewport;
                start -= b;
                end += b;
              }

              start = Math.floor(start);
              end = Math.ceil(end);
            } else {
              end = start + items - 1;
            }
          }

          start = Math.max(start, 0);
          end = Math.min(end, slideCountNew - 1);
        }

        return [start, end];
      }

      function doLazyLoad () {
        if (lazyload && !disable) {
          getImageArray.apply(null, getVisibleSlideRange()).forEach(function (img) {
            if (!hasClass(img, imgCompleteClass)) {
              // stop propagation transitionend event to container
              var eve = {};
              eve[TRANSITIONEND] = function (e) { e.stopPropagation(); };
              addEvents(img, eve);

              addEvents(img, imgEvents);

              // update src
              img.src = getAttr(img, 'data-src');

              // update srcset
              var srcset = getAttr(img, 'data-srcset');
              if (srcset) { img.srcset = srcset; }

              addClass$1(img, 'loading');
            }
          });
        }
      }

      function onImgLoaded (e) {
        imgLoaded(getTarget(e));
      }

      function onImgFailed (e) {
        imgFailed(getTarget(e));
      }

      function imgLoaded (img) {
        addClass$1(img, 'loaded');
        imgCompleted(img);
      }

      function imgFailed (img) {
        addClass$1(img, 'failed');
        imgCompleted(img);
      }

      function imgCompleted (img) {
        addClass$1(img, 'tns-complete');
        removeClass$1(img, 'loading');
        removeEvents(img, imgEvents);
      }

      function getImageArray (start, end) {
        var imgs = [];
        while (start <= end) {
          forEach$1(slideItems[start].querySelectorAll('img'), function (img) { imgs.push(img); });
          start++;
        }

        return imgs;
      }

      // check if all visible images are loaded
      // and update container height if it's done
      function doAutoHeight () {
        var imgs = getImageArray.apply(null, getVisibleSlideRange());
        raf$1(function(){ imgsLoadedCheck(imgs, updateInnerWrapperHeight); });
      }

      function imgsLoadedCheck (imgs, cb) {
        // directly execute callback function if all images are complete
        if (imgsComplete) { return cb(); }

        // check selected image classes otherwise
        imgs.forEach(function (img, index) {
          if (hasClass(img, imgCompleteClass)) { imgs.splice(index, 1); }
        });

        // execute callback function if selected images are all complete
        if (!imgs.length) { return cb(); }

        // otherwise execute this functiona again
        raf$1(function(){ imgsLoadedCheck(imgs, cb); });
      } 

      function additionalUpdates () {
        doLazyLoad(); 
        updateSlideStatus();
        updateLiveRegion();
        updateControlsStatus();
        updateNavStatus();
      }


      function update_carousel_transition_duration () {
        if (carousel && autoHeight) {
          middleWrapper.style[TRANSITIONDURATION] = speed / 1000 + 's';
        }
      }

      function getMaxSlideHeight (slideStart, slideRange) {
        var heights = [];
        for (var i = slideStart, l = Math.min(slideStart + slideRange, slideCountNew); i < l; i++) {
          heights.push(slideItems[i].offsetHeight);
        }

        return Math.max.apply(null, heights);
      }

      // update inner wrapper height
      // 1. get the max-height of the visible slides
      // 2. set transitionDuration to speed
      // 3. update inner wrapper height to max-height
      // 4. set transitionDuration to 0s after transition done
      function updateInnerWrapperHeight () {
        var maxHeight = autoHeight ? getMaxSlideHeight(index, items) : getMaxSlideHeight(cloneCount, slideCount),
            wp = middleWrapper ? middleWrapper : innerWrapper;

        if (wp.style.height !== maxHeight) { wp.style.height = maxHeight + 'px'; }
      }

      // get the distance from the top edge of the first slide to each slide
      // (init) => slidePositions
      function setSlidePositions () {
        slidePositions = [0];
        var attr = horizontal ? 'left' : 'top',
            attr2 = horizontal ? 'right' : 'bottom',
            base = slideItems[0].getBoundingClientRect()[attr];

        forEach$1(slideItems, function(item, i) {
          // skip the first slide
          if (i) { slidePositions.push(item.getBoundingClientRect()[attr] - base); }
          // add the end edge
          if (i === slideCountNew - 1) { slidePositions.push(item.getBoundingClientRect()[attr2] - base); }
        });
      }

      // update slide
      function updateSlideStatus () {
        var range = getVisibleSlideRange(),
            start = range[0],
            end = range[1];

        forEach$1(slideItems, function(item, i) {
          // show slides
          if (i >= start && i <= end) {
            if (hasAttr(item, 'aria-hidden')) {
              removeAttrs(item, ['aria-hidden', 'tabindex']);
              addClass$1(item, slideActiveClass);
            }
          // hide slides
          } else {
            if (!hasAttr(item, 'aria-hidden')) {
              setAttrs(item, {
                'aria-hidden': 'true',
                'tabindex': '-1'
              });
              removeClass$1(item, slideActiveClass);
            }
          }
        });
      }

      // gallery: update slide position
      function updateGallerySlidePositions () {
        var l = index + Math.min(slideCount, items);
        for (var i = slideCountNew; i--;) {
          var item = slideItems[i];

          if (i >= index && i < l) {
            // add transitions to visible slides when adjusting their positions
            addClass$1(item, 'tns-moving');

            item.style.left = (i - index) * 100 / items + '%';
            addClass$1(item, animateIn);
            removeClass$1(item, animateNormal);
          } else if (item.style.left) {
            item.style.left = '';
            addClass$1(item, animateNormal);
            removeClass$1(item, animateIn);
          }

          // remove outlet animation
          removeClass$1(item, animateOut);
        }

        // removing '.tns-moving'
        setTimeout(function() {
          forEach$1(slideItems, function(el) {
            removeClass$1(el, 'tns-moving');
          });
        }, 300);
      }

      // set tabindex on Nav
      function updateNavStatus () {
        // get current nav
        if (nav) {
          navCurrentIndex = navClicked >= 0 ? navClicked : getCurrentNavIndex();
          navClicked = -1;

          if (navCurrentIndex !== navCurrentIndexCached) {
            var navPrev = navItems[navCurrentIndexCached],
                navCurrent = navItems[navCurrentIndex];

            setAttrs(navPrev, {
              'tabindex': '-1',
              'aria-label': navStr + (navCurrentIndexCached + 1)
            });
            removeClass$1(navPrev, navActiveClass);
            
            setAttrs(navCurrent, {'aria-label': navStr + (navCurrentIndex + 1) + navStrCurrent});
            removeAttrs(navCurrent, 'tabindex');
            addClass$1(navCurrent, navActiveClass);

            navCurrentIndexCached = navCurrentIndex;
          }
        }
      }

      function getLowerCaseNodeName (el) {
        return el.nodeName.toLowerCase();
      }

      function isButton (el) {
        return getLowerCaseNodeName(el) === 'button';
      }

      function isAriaDisabled (el) {
        return el.getAttribute('aria-disabled') === 'true';
      }

      function disEnableElement (isButton, el, val) {
        if (isButton) {
          el.disabled = val;
        } else {
          el.setAttribute('aria-disabled', val.toString());
        }
      }

      // set 'disabled' to true on controls when reach the edges
      function updateControlsStatus () {
        if (!controls || rewind || loop) { return; }

        var prevDisabled = (prevIsButton) ? prevButton.disabled : isAriaDisabled(prevButton),
            nextDisabled = (nextIsButton) ? nextButton.disabled : isAriaDisabled(nextButton),
            disablePrev = (index <= indexMin) ? true : false,
            disableNext = (!rewind && index >= indexMax) ? true : false;

        if (disablePrev && !prevDisabled) {
          disEnableElement(prevIsButton, prevButton, true);
        }
        if (!disablePrev && prevDisabled) {
          disEnableElement(prevIsButton, prevButton, false);
        }
        if (disableNext && !nextDisabled) {
          disEnableElement(nextIsButton, nextButton, true);
        }
        if (!disableNext && nextDisabled) {
          disEnableElement(nextIsButton, nextButton, false);
        }
      }

      // set duration
      function resetDuration (el, str) {
        if (TRANSITIONDURATION) { el.style[TRANSITIONDURATION] = str; }
      }

      function getSliderWidth () {
        return fixedWidth ? (fixedWidth + gutter) * slideCountNew : slidePositions[slideCountNew];
      }

      function getCenterGap (num) {
        if (num == null) { num = index; }

        var gap = edgePadding ? gutter : 0;
        return autoWidth ? ((viewport - gap) - (slidePositions[num + 1] - slidePositions[num] - gutter))/2 :
          fixedWidth ? (viewport - fixedWidth) / 2 :
            (items - 1) / 2;
      }

      function getRightBoundary () {
        var gap = edgePadding ? gutter : 0,
            result = (viewport + gap) - getSliderWidth();

        if (center && !loop) {
          result = fixedWidth ? - (fixedWidth + gutter) * (slideCountNew - 1) - getCenterGap() :
            getCenterGap(slideCountNew - 1) - slidePositions[slideCountNew - 1];
        }
        if (result > 0) { result = 0; }

        return result;
      }

      function getContainerTransformValue (num) {
        if (num == null) { num = index; }

        var val;
        if (horizontal && !autoWidth) {
          if (fixedWidth) {
            val = - (fixedWidth + gutter) * num;
            if (center) { val += getCenterGap(); }
          } else {
            var denominator = TRANSFORM ? slideCountNew : items;
            if (center) { num -= getCenterGap(); }
            val = - num * 100 / denominator;
          }
        } else {
          val = - slidePositions[num];
          if (center && autoWidth) {
            val += getCenterGap();
          }
        }

        if (hasRightDeadZone) { val = Math.max(val, rightBoundary); }

        val += (horizontal && !autoWidth && !fixedWidth) ? '%' : 'px';

        return val;
      }

      function doContainerTransformSilent (val) {
        resetDuration(container, '0s');
        doContainerTransform(val);
      }

      function doContainerTransform (val) {
        if (val == null) { val = getContainerTransformValue(); }
        container.style[transformAttr] = transformPrefix + val + transformPostfix;
      }

      function animateSlide (number, classOut, classIn, isOut) {
        var l = number + items;
        if (!loop) { l = Math.min(l, slideCountNew); }

        for (var i = number; i < l; i++) {
            var item = slideItems[i];

          // set item positions
          if (!isOut) { item.style.left = (i - index) * 100 / items + '%'; }

          if (animateDelay && TRANSITIONDELAY) {
            item.style[TRANSITIONDELAY] = item.style[ANIMATIONDELAY] = animateDelay * (i - number) / 1000 + 's';
          }
          removeClass$1(item, classOut);
          addClass$1(item, classIn);
          
          if (isOut) { slideItemsOut.push(item); }
        }
      }

      // make transfer after click/drag:
      // 1. change 'transform' property for mordern browsers
      // 2. change 'left' property for legacy browsers
      var transformCore = (function () {
        return carousel ?
          function () {
            resetDuration(container, '');
            if (TRANSITIONDURATION || !speed) {
              // for morden browsers with non-zero duration or 
              // zero duration for all browsers
              doContainerTransform();
              // run fallback function manually 
              // when duration is 0 / container is hidden
              if (!speed || !isVisible(container)) { onTransitionEnd(); }

            } else {
              // for old browser with non-zero duration
              jsTransform(container, transformAttr, transformPrefix, transformPostfix, getContainerTransformValue(), speed, onTransitionEnd);
            }

            if (!horizontal) { updateContentWrapperHeight(); }
          } :
          function () {
            slideItemsOut = [];

            var eve = {};
            eve[TRANSITIONEND] = eve[ANIMATIONEND] = onTransitionEnd;
            removeEvents(slideItems[indexCached], eve);
            addEvents(slideItems[index], eve);

            animateSlide(indexCached, animateIn, animateOut, true);
            animateSlide(index, animateNormal, animateIn);

            // run fallback function manually 
            // when transition or animation not supported / duration is 0
            if (!TRANSITIONEND || !ANIMATIONEND || !speed || !isVisible(container)) { onTransitionEnd(); }
          };
      })();

      function render (e, sliderMoved) {
        if (updateIndexBeforeTransform) { updateIndex(); }

        // render when slider was moved (touch or drag) even though index may not change
        if (index !== indexCached || sliderMoved) {
          // events
          events.emit('indexChanged', info());
          events.emit('transitionStart', info());
          if (autoHeight) { doAutoHeight(); }

          // pause autoplay when click or keydown from user
          if (animating && e && ['click', 'keydown'].indexOf(e.type) >= 0) { stopAutoplay(); }

          running = true;
          transformCore();
        }
      }

      /*
       * Transfer prefixed properties to the same format
       * CSS: -Webkit-Transform => webkittransform
       * JS: WebkitTransform => webkittransform
       * @param {string} str - property
       *
       */
      function strTrans (str) {
        return str.toLowerCase().replace(/-/g, '');
      }

      // AFTER TRANSFORM
      // Things need to be done after a transfer:
      // 1. check index
      // 2. add classes to visible slide
      // 3. disable controls buttons when reach the first/last slide in non-loop slider
      // 4. update nav status
      // 5. lazyload images
      // 6. update container height
      function onTransitionEnd (event) {
        // check running on gallery mode
        // make sure trantionend/animationend events run only once
        if (carousel || running) {
          events.emit('transitionEnd', info(event));

          if (!carousel && slideItemsOut.length > 0) {
            for (var i = 0; i < slideItemsOut.length; i++) {
              var item = slideItemsOut[i];
              // set item positions
              item.style.left = '';

              if (ANIMATIONDELAY && TRANSITIONDELAY) { 
                item.style[ANIMATIONDELAY] = '';
                item.style[TRANSITIONDELAY] = '';
              }
              removeClass$1(item, animateOut);
              addClass$1(item, animateNormal);
            }
          }

          /* update slides, nav, controls after checking ...
           * => legacy browsers who don't support 'event' 
           *    have to check event first, otherwise event.target will cause an error 
           * => or 'gallery' mode: 
           *   + event target is slide item
           * => or 'carousel' mode: 
           *   + event target is container, 
           *   + event.property is the same with transform attribute
           */
          if (!event || 
              !carousel && event.target.parentNode === container || 
              event.target === container && strTrans(event.propertyName) === strTrans(transformAttr)) {

            if (!updateIndexBeforeTransform) { 
              var indexTem = index;
              updateIndex();
              if (index !== indexTem) { 
                events.emit('indexChanged', info());

                doContainerTransformSilent();
              }
            } 

            if (nested === 'inner') { events.emit('innerLoaded', info()); }
            running = false;
            indexCached = index;
          }
        }

      }

      // # ACTIONS
      function goTo (targetIndex, e) {
        if (freeze) { return; }

        // prev slideBy
        if (targetIndex === 'prev') {
          onControlsClick(e, -1);

        // next slideBy
        } else if (targetIndex === 'next') {
          onControlsClick(e, 1);

        // go to exact slide
        } else {
          if (running) {
            if (preventActionWhenRunning) { return; } else { onTransitionEnd(); }
          }

          var absIndex = getAbsIndex(), 
              indexGap = 0;

          if (targetIndex === 'first') {
            indexGap = - absIndex;
          } else if (targetIndex === 'last') {
            indexGap = carousel ? slideCount - items - absIndex : slideCount - 1 - absIndex;
          } else {
            if (typeof targetIndex !== 'number') { targetIndex = parseInt(targetIndex); }

            if (!isNaN(targetIndex)) {
              // from directly called goTo function
              if (!e) { targetIndex = Math.max(0, Math.min(slideCount - 1, targetIndex)); }

              indexGap = targetIndex - absIndex;
            }
          }

          // gallery: make sure new page won't overlap with current page
          if (!carousel && indexGap && Math.abs(indexGap) < items) {
            var factor = indexGap > 0 ? 1 : -1;
            indexGap += (index + indexGap - slideCount) >= indexMin ? slideCount * factor : slideCount * 2 * factor * -1;
          }

          index += indexGap;

          // make sure index is in range
          if (carousel && loop) {
            if (index < indexMin) { index += slideCount; }
            if (index > indexMax) { index -= slideCount; }
          }

          // if index is changed, start rendering
          if (getAbsIndex(index) !== getAbsIndex(indexCached)) {
            render(e);
          }

        }
      }

      // on controls click
      function onControlsClick (e, dir) {
        if (running) {
          if (preventActionWhenRunning) { return; } else { onTransitionEnd(); }
        }
        var passEventObject;

        if (!dir) {
          e = getEvent(e);
          var target = getTarget(e);

          while (target !== controlsContainer && [prevButton, nextButton].indexOf(target) < 0) { target = target.parentNode; }

          var targetIn = [prevButton, nextButton].indexOf(target);
          if (targetIn >= 0) {
            passEventObject = true;
            dir = targetIn === 0 ? -1 : 1;
          }
        }

        if (rewind) {
          if (index === indexMin && dir === -1) {
            goTo('last', e);
            return;
          } else if (index === indexMax && dir === 1) {
            goTo('first', e);
            return;
          }
        }

        if (dir) {
          index += slideBy * dir;
          if (autoWidth) { index = Math.floor(index); }
          // pass e when click control buttons or keydown
          render((passEventObject || (e && e.type === 'keydown')) ? e : null);
        }
      }

      // on nav click
      function onNavClick (e) {
        if (running) {
          if (preventActionWhenRunning) { return; } else { onTransitionEnd(); }
        }
        
        e = getEvent(e);
        var target = getTarget(e), navIndex;

        // find the clicked nav item
        while (target !== navContainer && !hasAttr(target, 'data-nav')) { target = target.parentNode; }
        if (hasAttr(target, 'data-nav')) {
          var navIndex = navClicked = Number(getAttr(target, 'data-nav')),
              targetIndexBase = fixedWidth || autoWidth ? navIndex * slideCount / pages : navIndex * items,
              targetIndex = navAsThumbnails ? navIndex : Math.min(Math.ceil(targetIndexBase), slideCount - 1);
          goTo(targetIndex, e);

          if (navCurrentIndex === navIndex) {
            if (animating) { stopAutoplay(); }
            navClicked = -1; // reset navClicked
          }
        }
      }

      // autoplay functions
      function setAutoplayTimer () {
        autoplayTimer = setInterval(function () {
          onControlsClick(null, autoplayDirection);
        }, autoplayTimeout);

        animating = true;
      }

      function stopAutoplayTimer () {
        clearInterval(autoplayTimer);
        animating = false;
      }

      function updateAutoplayButton (action, txt) {
        setAttrs(autoplayButton, {'data-action': action});
        autoplayButton.innerHTML = autoplayHtmlStrings[0] + action + autoplayHtmlStrings[1] + txt;
      }

      function startAutoplay () {
        setAutoplayTimer();
        if (autoplayButton) { updateAutoplayButton('stop', autoplayText[1]); }
      }

      function stopAutoplay () {
        stopAutoplayTimer();
        if (autoplayButton) { updateAutoplayButton('start', autoplayText[0]); }
      }

      // programaitcally play/pause the slider
      function play () {
        if (autoplay && !animating) {
          startAutoplay();
          autoplayUserPaused = false;
        }
      }
      function pause () {
        if (animating) {
          stopAutoplay();
          autoplayUserPaused = true;
        }
      }

      function toggleAutoplay () {
        if (animating) {
          stopAutoplay();
          autoplayUserPaused = true;
        } else {
          startAutoplay();
          autoplayUserPaused = false;
        }
      }

      function onVisibilityChange () {
        if (doc.hidden) {
          if (animating) {
            stopAutoplayTimer();
            autoplayVisibilityPaused = true;
          }
        } else if (autoplayVisibilityPaused) {
          setAutoplayTimer();
          autoplayVisibilityPaused = false;
        }
      }

      function mouseoverPause () {
        if (animating) { 
          stopAutoplayTimer();
          autoplayHoverPaused = true;
        }
      }

      function mouseoutRestart () {
        if (autoplayHoverPaused) { 
          setAutoplayTimer();
          autoplayHoverPaused = false;
        }
      }

      // keydown events on document 
      function onDocumentKeydown (e) {
        e = getEvent(e);
        var keyIndex = [KEYS.LEFT, KEYS.RIGHT].indexOf(e.keyCode);

        if (keyIndex >= 0) {
          onControlsClick(e, keyIndex === 0 ? -1 : 1);
        }
      }

      // on key control
      function onControlsKeydown (e) {
        e = getEvent(e);
        var keyIndex = [KEYS.LEFT, KEYS.RIGHT].indexOf(e.keyCode);

        if (keyIndex >= 0) {
          if (keyIndex === 0) {
            if (!prevButton.disabled) { onControlsClick(e, -1); }
          } else if (!nextButton.disabled) {
            onControlsClick(e, 1);
          }
        }
      }

      // set focus
      function setFocus (el) {
        el.focus();
      }

      // on key nav
      function onNavKeydown (e) {
        e = getEvent(e);
        var curElement = doc.activeElement;
        if (!hasAttr(curElement, 'data-nav')) { return; }

        // var code = e.keyCode,
        var keyIndex = [KEYS.LEFT, KEYS.RIGHT, KEYS.ENTER, KEYS.SPACE].indexOf(e.keyCode),
            navIndex = Number(getAttr(curElement, 'data-nav'));

        if (keyIndex >= 0) {
          if (keyIndex === 0) {
            if (navIndex > 0) { setFocus(navItems[navIndex - 1]); }
          } else if (keyIndex === 1) {
            if (navIndex < pages - 1) { setFocus(navItems[navIndex + 1]); }
          } else {
            navClicked = navIndex;
            goTo(navIndex, e);
          }
        }
      }

      function getEvent (e) {
        e = e || win.event;
        return isTouchEvent(e) ? e.changedTouches[0] : e;
      }
      function getTarget (e) {
        return e.target || win.event.srcElement;
      }

      function isTouchEvent (e) {
        return e.type.indexOf('touch') >= 0;
      }

      function preventDefaultBehavior (e) {
        e.preventDefault ? e.preventDefault() : e.returnValue = false;
      }

      function getMoveDirectionExpected () {
        return getTouchDirection(toDegree(lastPosition.y - initPosition.y, lastPosition.x - initPosition.x), swipeAngle) === options.axis;
      }

      function onPanStart (e) {
        if (running) {
          if (preventActionWhenRunning) { return; } else { onTransitionEnd(); }
        }

        if (autoplay && animating) { stopAutoplayTimer(); }
        
        panStart = true;
        if (rafIndex) {
          caf(rafIndex);
          rafIndex = null;
        }

        var $ = getEvent(e);
        events.emit(isTouchEvent(e) ? 'touchStart' : 'dragStart', info(e));

        if (!isTouchEvent(e) && ['img', 'a'].indexOf(getLowerCaseNodeName(getTarget(e))) >= 0) {
          preventDefaultBehavior(e);
        }

        lastPosition.x = initPosition.x = $.clientX;
        lastPosition.y = initPosition.y = $.clientY;
        if (carousel) {
          translateInit = parseFloat(container.style[transformAttr].replace(transformPrefix, ''));
          resetDuration(container, '0s');
        }
      }

      function onPanMove (e) {
        if (panStart) {
          var $ = getEvent(e);
          lastPosition.x = $.clientX;
          lastPosition.y = $.clientY;

          if (carousel) {
            if (!rafIndex) { rafIndex = raf$1(function(){ panUpdate(e); }); }
          } else {
            if (moveDirectionExpected === '?') { moveDirectionExpected = getMoveDirectionExpected(); }
            if (moveDirectionExpected) { preventScroll = true; }
          }

          if (preventScroll) { e.preventDefault(); }
        }
      }

      function panUpdate (e) {
        if (!moveDirectionExpected) {
          panStart = false;
          return;
        }
        caf(rafIndex);
        if (panStart) { rafIndex = raf$1(function(){ panUpdate(e); }); }

        if (moveDirectionExpected === '?') { moveDirectionExpected = getMoveDirectionExpected(); }
        if (moveDirectionExpected) {
          if (!preventScroll && isTouchEvent(e)) { preventScroll = true; }

          try {
            if (e.type) { events.emit(isTouchEvent(e) ? 'touchMove' : 'dragMove', info(e)); }
          } catch(err) {}

          var x = translateInit,
              dist = getDist(lastPosition, initPosition);
          if (!horizontal || fixedWidth || autoWidth) {
            x += dist;
            x += 'px';
          } else {
            var percentageX = TRANSFORM ? dist * items * 100 / ((viewport + gutter) * slideCountNew): dist * 100 / (viewport + gutter);
            x += percentageX;
            x += '%';
          }

          container.style[transformAttr] = transformPrefix + x + transformPostfix;
        }
      }

      function onPanEnd (e) {
        if (panStart) {
          if (rafIndex) {
            caf(rafIndex);
            rafIndex = null;
          }
          if (carousel) { resetDuration(container, ''); }
          panStart = false;

          var $ = getEvent(e);
          lastPosition.x = $.clientX;
          lastPosition.y = $.clientY;
          var dist = getDist(lastPosition, initPosition);

          if (Math.abs(dist)) {
            // drag vs click
            if (!isTouchEvent(e)) {
              // prevent "click"
              var target = getTarget(e);
              addEvents(target, {'click': function preventClick (e) {
                preventDefaultBehavior(e);
                removeEvents(target, {'click': preventClick});
              }}); 
            }

            if (carousel) {
              rafIndex = raf$1(function() {
                if (horizontal && !autoWidth) {
                  var indexMoved = - dist * items / (viewport + gutter);
                  indexMoved = dist > 0 ? Math.floor(indexMoved) : Math.ceil(indexMoved);
                  index += indexMoved;
                } else {
                  var moved = - (translateInit + dist);
                  if (moved <= 0) {
                    index = indexMin;
                  } else if (moved >= slidePositions[slideCountNew - 1]) {
                    index = indexMax;
                  } else {
                    var i = 0;
                    while (i < slideCountNew && moved >= slidePositions[i]) {
                      index = i;
                      if (moved > slidePositions[i] && dist < 0) { index += 1; }
                      i++;
                    }
                  }
                }

                render(e, dist);
                events.emit(isTouchEvent(e) ? 'touchEnd' : 'dragEnd', info(e));
              });
            } else {
              if (moveDirectionExpected) {
                onControlsClick(e, dist > 0 ? -1 : 1);
              }
            }
          }
        }

        // reset
        if (options.preventScrollOnTouch === 'auto') { preventScroll = false; }
        if (swipeAngle) { moveDirectionExpected = '?'; } 
        if (autoplay && !animating) { setAutoplayTimer(); }
      }

      // === RESIZE FUNCTIONS === //
      // (slidePositions, index, items) => vertical_conentWrapper.height
      function updateContentWrapperHeight () {
        var wp = middleWrapper ? middleWrapper : innerWrapper;
        wp.style.height = slidePositions[index + items] - slidePositions[index] + 'px';
      }

      function getPages () {
        var rough = fixedWidth ? (fixedWidth + gutter) * slideCount / viewport : slideCount / items;
        return Math.min(Math.ceil(rough), slideCount);
      }

      /*
       * 1. update visible nav items list
       * 2. add "hidden" attributes to previous visible nav items
       * 3. remove "hidden" attrubutes to new visible nav items
       */
      function updateNavVisibility () {
        if (!nav || navAsThumbnails) { return; }

        if (pages !== pagesCached) {
          var min = pagesCached,
              max = pages,
              fn = showElement;

          if (pagesCached > pages) {
            min = pages;
            max = pagesCached;
            fn = hideElement;
          }

          while (min < max) {
            fn(navItems[min]);
            min++;
          }

          // cache pages
          pagesCached = pages;
        }
      }

      function info (e) {
        return {
          container: container,
          slideItems: slideItems,
          navContainer: navContainer,
          navItems: navItems,
          controlsContainer: controlsContainer,
          hasControls: hasControls,
          prevButton: prevButton,
          nextButton: nextButton,
          items: items,
          slideBy: slideBy,
          cloneCount: cloneCount,
          slideCount: slideCount,
          slideCountNew: slideCountNew,
          index: index,
          indexCached: indexCached,
          displayIndex: getCurrentSlide(),
          navCurrentIndex: navCurrentIndex,
          navCurrentIndexCached: navCurrentIndexCached,
          pages: pages,
          pagesCached: pagesCached,
          sheet: sheet,
          isOn: isOn,
          event: e || {},
        };
      }

      return {
        version: '2.9.2',
        getInfo: info,
        events: events,
        goTo: goTo,
        play: play,
        pause: pause,
        isOn: isOn,
        updateSliderHeight: updateInnerWrapperHeight,
        refresh: initSliderTransform,
        destroy: destroy,
        rebuild: function() {
          return tns(extend(options, optionsElements));
        }
      };
    };

    /* src/olof-marsja/OlofMarsja.svelte generated by Svelte v3.12.1 */

    const file$9 = "src/olof-marsja/OlofMarsja.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.iTem = list[i];
    	return child_ctx;
    }

    // (728:12) {#each iArray as iTem}
    function create_each_block$3(ctx) {
    	var div, t_value = ctx.iTem + "", t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			add_location(div, file$9, 728, 14, 22609);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$3.name, type: "each", source: "(728:12) {#each iArray as iTem}", ctx });
    	return block;
    }

    function create_fragment$b(ctx) {
    	var t0, div8, div7, iframe, t1, video, t2, div2, div1, img0, t3, div0, t4, br0, t5, br1, t6, br2, t7, br3, t8, br4, t9, br5, t10, br6, t11, br7, t12, br8, t13, br9, t14, br10, t15, br11, t16, br12, t17, br13, t18, br14, t19, br15, t20, br16, t21, br17, t22, br18, t23, br19, t24, br20, t25, br21, t26, br22, t27, br23, t28, br24, t29, br25, t30, br26, t31, br27, t32, br28, t33, br29, t34, br30, t35, br31, t36, br32, t37, br33, t38, br34, t39, br35, t40, br36, t41, br37, t42, br38, t43, br39, t44, br40, t45, br41, t46, br42, t47, br43, t48, br44, t49, br45, t50, br46, t51, br47, t52, br48, t53, br49, t54, br50, t55, br51, t56, br52, t57, br53, t58, br54, t59, br55, t60, br56, t61, br57, t62, br58, t63, br59, t64, br60, t65, br61, t66, br62, t67, br63, t68, br64, t69, br65, t70, br66, t71, br67, t72, br68, t73, br69, t74, br70, t75, br71, t76, br72, t77, br73, t78, br74, t79, br75, t80, br76, t81, br77, t82, br78, t83, br79, t84, br80, t85, br81, t86, br82, t87, br83, t88, br84, t89, br85, t90, br86, t91, br87, t92, br88, t93, br89, t94, br90, t95, br91, t96, br92, t97, br93, t98, br94, t99, br95, t100, br96, t101, br97, t102, br98, t103, br99, t104, br100, t105, br101, t106, br102, t107, br103, t108, br104, t109, br105, t110, br106, t111, br107, t112, br108, t113, br109, t114, t115, div6, div5, img1, t116, div4, div3, div7_intro;

    	let each_value = ctx.iArray;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			t0 = space();
    			div8 = element("div");
    			div7 = element("div");
    			iframe = element("iframe");
    			t1 = space();
    			video = element("video");
    			t2 = space();
    			div2 = element("div");
    			div1 = element("div");
    			img0 = element("img");
    			t3 = space();
    			div0 = element("div");
    			t4 = text("Hola Olof\n          ");
    			br0 = element("br");
    			t5 = text("\n          THIS JUST IN —\n          ");
    			br1 = element("br");
    			t6 = text("\n          Former favourite frequency of the world, commonly known as #love, is\n          struggling to find outlets for expression!\n          ");
    			br2 = element("br");
    			t7 = text("\n          WHAT?\n          ");
    			br3 = element("br");
    			t8 = text("\n          I know.\n          ");
    			br4 = element("br");
    			t9 = text("\n          Due to the steady increase of human interest in drama and distraction\n          – globally – #love is officially at risk of not being\n          commonly felt.\n          ");
    			br5 = element("br");
    			t10 = text("\n          Brace yourself ladies and gentlemen, #love is officially an Endangered\n          Frequency!\n          ");
    			br6 = element("br");
    			t11 = text("\n          As most people are aware, the Emotional/Energetic StockMarket is\n          teaming with options! Love, joy, creativity, patience, chill and\n          kindness are most certainly some tasty favourites. There are also some\n          spicier vibes up for investment such as frustration, anger, doubt,\n          apathy and the ever increasing popular vibe – #fear.\n          ");
    			br7 = element("br");
    			t12 = text("\n          #Fear’s marketing campaign is something to behold. Catching the\n          attention of millions and millions of attention investors, it has\n          literally swept through the Mental Atmosphere of humanity –\n          like a virus.\n          ");
    			br8 = element("br");
    			t13 = text("\n          Passed around Via Us.\n          ");
    			br9 = element("br");
    			t14 = text("\n          It is a radical thought, that #fear gets up to 80% more airtime than\n          any other vibe?\n          ");
    			br10 = element("br");
    			t15 = text("\n          So what of these nourishing vibes that are no longer so popular?\n          ");
    			br11 = element("br");
    			t16 = text("\n          Do they just have weak marketing? Bad branding? Not enough likes and\n          followers?\n          ");
    			br12 = element("br");
    			t17 = text("\n          A few weeks ago it was announced, the most recent vibe to join the\n          endangered frequency list was #freedom.\n          ");
    			br13 = element("br");
    			t18 = text("\n          WHAT?!!!!!\n          ");
    			br14 = element("br");
    			t19 = text("\n          Of all the things to go out of fashion? FREEDOM!!! But how can it\n          happen?\n          ");
    			br15 = element("br");
    			t20 = text("\n          According to NOW NiNJAs all over the world, it has been a very sneaky\n          series of events, #limitation and #restriction have been parading\n          around like law and order – creating the illusion that more\n          rules are cool – and we need more and more of them. So, rules\n          are on the rise, yet little do people know that many of them are\n          funded by #limitation and #fear.\n          ");
    			br16 = element("br");
    			t21 = text("\n          The status of #trust is being watched VERY carefully. It seems that\n          the deeply rich imagination of a hand full of dreamers in this world,\n          is still holding #trust in it’s fundamental place… but\n          who knows for how long…\n          ");
    			br17 = element("br");
    			t22 = text("\n          Reports are coming in from all over NowHere, that some of our classic\n          good vibes – are missing.\n          ");
    			br18 = element("br");
    			t23 = text("\n          Think about it for a moment, are there some feelings you miss feeling?\n          Are your best emotions only active as memories? Well, you are not\n          alone.\n          ");
    			br19 = element("br");
    			t24 = text("\n          It’s not just you, this has become our global energetic\n          culture. It is more common for people to feel concern or anxious than\n          they are to feel inspired and powerful.\n          ");
    			br20 = element("br");
    			t25 = text("\n          Which brings us to the Present Moment.\n          ");
    			br21 = element("br");
    			t26 = text("\n          The NOW needs you! For conscious participation in the Present Moment!\n          ");
    			br22 = element("br");
    			t27 = text("\n          Are you ready to play the GAME?!!!\n          ");
    			br23 = element("br");
    			t28 = space();
    			br24 = element("br");
    			t29 = text("\n          Hola Olof\n          ");
    			br25 = element("br");
    			t30 = text("\n          Getting bombarded in you inbox is one thing, but getting bombarded in\n          your mind is another!\n          ");
    			br26 = element("br");
    			t31 = text("\n          In this 'high-tech, low touch' time we REALLY have to filter\n          what we let in...\n          ");
    			br27 = element("br");
    			t32 = text("\n          What we let in – reflects what we 'put out'. And the\n          essence of what we put out – determines what comes back in.\n          ");
    			br28 = element("br");
    			t33 = text("\n          Oh! What a sneaky little circle!\n          ");
    			br29 = element("br");
    			t34 = text("\n          The sheer volume of information is an avalanche on your awareness!!\n          Scrolling, clicking, watching and listening. Every iota of information\n          generates a thought and feeling from you. We are speeding up, scanning\n          and spamming, letting more in...\n          ");
    			br30 = element("br");
    			t35 = text("\n          Thanks for your precious attention.\n          ");
    			br31 = element("br");
    			t36 = text("\n          #legit.\n          ");
    			br32 = element("br");
    			t37 = text("\n          The wrong advertisements in your awareness can shorten your attention\n          span!\n          ");
    			br33 = element("br");
    			t38 = text("\n          ⚠️ Not to mention turn you into a momenterrorist!\n          ⚠️\n          ");
    			br34 = element("br");
    			t39 = text("\n          Quality control is the order of the day!\n          ");
    			br35 = element("br");
    			t40 = text("\n          Looking at this epidemic, I put my NOW NiNJA jumpsuit on and came up\n          with a genius way to sneak up on your awareness....\n          ");
    			br36 = element("br");
    			t41 = space();
    			br37 = element("br");
    			t42 = text("\n          Hola Olof\n          ");
    			br38 = element("br");
    			t43 = text("\n          Two of the biggest challenges that individuals have with holding a new\n          vision for their lives is:\n          ");
    			br39 = element("br");
    			t44 = text("\n          #1. Forgetting to do it. (We are just too busy!)\n          ");
    			br40 = element("br");
    			t45 = text("\n          #2. Struggling to feel and think beyond who they are in this moment.\n          ");
    			br41 = element("br");
    			t46 = text("\n          It makes sense that it is challenging, after all, you are VERY good at\n          being this version of you. You've been in this role for what? 20,\n          30, 40, 50 years?!!\n          ");
    			br42 = element("br");
    			t47 = text("\n          No wonder it can feel so hard to change!!\n          ");
    			br43 = element("br");
    			t48 = text("\n          We are mostly a collection of habits!\n          ");
    			br44 = element("br");
    			t49 = text("\n          Change takes practice. Persistence. Courage. You have to catch\n          yourself out in the NOWness of a moment and load and code your new\n          program – on the spot.\n          ");
    			br45 = element("br");
    			t50 = text("\n          You've got to turn up at rehearsal and learn the new script.\n          ");
    			br46 = element("br");
    			t51 = text("\n          You have practice a new posture and exude a new vibe.\n          ");
    			br47 = element("br");
    			t52 = text("\n          You have to practice complete emotional investment to become a new\n          identity\n          ");
    			br48 = element("br");
    			t53 = text("\n          AND\n          ");
    			br49 = element("br");
    			t54 = text("\n          you have to start right from where you are, in the life that you have\n          – with the habits that you currently have.\n          ");
    			br50 = element("br");
    			t55 = text("\n          Do you have a plan? Whatcha going to do NOW, NiNJA?! 5,6,7,8!!!\n          ");
    			br51 = element("br");
    			t56 = space();
    			br52 = element("br");
    			t57 = text("\n          Hola Olof!!!\n          ");
    			br53 = element("br");
    			t58 = text("\n          LiFE!! What a Game! We count down to the NOW! and then we launch\n          ourselves, victoriously, into the new NOW, with a few more layers,\n          lessons and desires and hopefully a few less layers of worry and fear!\n          Some of us are hungry, eagerly wanting to become more of ourselves.\n          Some of us are wanting last year to disappear as quickly as possible,\n          because the pain of that chapter was too much to bare. Wherever you\n          are on the spectrum of vibes, I hope we can meet in the middle of\n          ");
    			br54 = element("br");
    			t59 = text("\n          ––––––––>>>\n          THiS\n          <<<––––––––\n          moment\n          ");
    			br55 = element("br");
    			t60 = text("\n          understanding that life is but a stream of elegant instants, and ALL\n          moments are created equal! The Game of Life rolls on.\n          ");
    			br56 = element("br");
    			t61 = text("\n          Rumour has is it – the ebb and flow of 3D life is not for the\n          faint hearted. Duality is in fact quite an emotional war zone! But as\n          you look back into 2018 – at what happened, who happened, the\n          plot twists, the connections, the break ups, the breakthroughs, I\n          trust you will find a way to\n          –––>>> rest\n          <<<––– in your mighty unfolding.\n          ");
    			br57 = element("br");
    			t62 = text("\n          NiNJA yo self into the NOW!\n          ");
    			br58 = element("br");
    			t63 = text("\n          Let yourself off the hook! And while you are at it… stretch\n          yourself a little further, because I have a sneaking suspicion that\n          eternity is a long time and that THiS moment (in particular) REALLY\n          counts! Here’s to a mighty 2019! And here’s to a\n          deepening devotion to creating quality moments.\n          ");
    			br59 = element("br");
    			t64 = text("\n          THERE IS SO MUCH GOODNESS GOING ON IN THIS WORLD! Thanks for being a\n          part of the answer Olof <3\n          ");
    			br60 = element("br");
    			t65 = text("\n          Hola Olof!!\n          ");
    			br61 = element("br");
    			t66 = text("\n          How can I stay positive and inspired in negative environments? THIS is\n          one of my favourite questions of All Time! AND it becomes more and\n          more relevant during this incredible time in human history! Staying\n          inspired and plugged into your potential is the ultimate quest in Time\n          and Space.\n          ");
    			br62 = element("br");
    			t67 = text("\n          Not only do we have to find ways to dodge the damage, we want to\n          strengthen our focus, be solution orientated, and represent the\n          possibilities during this incredible time!\n          ");
    			br63 = element("br");
    			t68 = text("\n          Yet shortly after leaving the comfort of your own NOW LAB, the battle\n          begins. The sheer onslaught of negative messaging is coming right at\n          ya!\n          ");
    			br64 = element("br");
    			t69 = text("\n          Yet... YOU are the HERO in this story! SO, how are you going to stay\n          awake NOW, NiNJA…? Especially when you are surrounded by those\n          intense ‘momenterrorists!’ I trust this vid will remind\n          you to find creative ways to stay on the path.\n          🏽⭐️\n          ");
    			br65 = element("br");
    			t70 = space();
    			br66 = element("br");
    			t71 = text("\n          Hey there Olof Do you ever get a sense, that something is trying to\n          happen through you? Like there is something giant in you; a gift, a\n          talent, a capacity!\n          ");
    			br67 = element("br");
    			t72 = text("\n          Whatever it is, it scares the wits out of you – because you\n          have no idea of HOW to get from where you are right now, to living\n          that life of #creativity, #freedom, #service and #abundance! In fact,\n          it looks perfectly impossible.\n          ");
    			br68 = element("br");
    			t73 = text("\n          But you and I know, even though this dream goes against all your logic\n          and reasoning, it has somehow hit you deep in the NOW ;)\n          ");
    			br69 = element("br");
    			t74 = text("\n          And it just won't – go – away.\n          ");
    			br70 = element("br");
    			t75 = text("\n          So whether you are tormented by a vision, or you are yet to really\n          uncover and discover your 'thing'....\n          ");
    			br71 = element("br");
    			t76 = text("\n          NOW is the time to start asking yourself – some radically\n          different questions.\n          ");
    			br72 = element("br");
    			t77 = text("\n          I can help you do just that.\n          ");
    			br73 = element("br");
    			t78 = space();
    			br74 = element("br");
    			t79 = text("\n          Hola Olof\n          ");
    			br75 = element("br");
    			t80 = text("\n          Do you feel your Divine Assignment? Do you wake up everyday, ready to\n          hear the intuitive marching orders from the Intelligence of Source?\n          ");
    			br76 = element("br");
    			t81 = text("\n          With so much distraction coming in from everywhere, what does it take\n          to be the hero in your own story?\n          ");
    			br77 = element("br");
    			t82 = text("\n          Here is a summary of the task at hand, with love from....\n          ");
    			br78 = element("br");
    			t83 = text("\n          \t \t\t\t \t\t\t\t Sometimes your own\n          'momenterrorism' can be so bad you actually believe\n          everything is working against you. You envision your happiness gagged\n          and bound; being held ransom by some invisible power in the\n          universe!!!\n          ");
    			br79 = element("br");
    			t84 = text("\n          Wrong.\n          ");
    			br80 = element("br");
    			t85 = text("\n          R.O.N.G. :)\n          ");
    			br81 = element("br");
    			t86 = text("\n          Wrong.\n          ");
    			br82 = element("br");
    			t87 = text("\n          Your happiness is NOT being held ransom by an all powerful\n          somethin'-or-other. The only thing lording over you is –\n          your own stagnated perception. AKA: resistance.\n          ");
    			br83 = element("br");
    			t88 = text("\n          Argh! Really?\n          ");
    			br84 = element("br");
    			t89 = text("\n          I know, it's an anti-climax to reality.\n          ");
    			br85 = element("br");
    			t90 = text("\n          Lucky for you, you can just get out of the way and let it flow.\n          ");
    			br86 = element("br");
    			t91 = text("\n          HOW?\n          ");
    			br87 = element("br");
    			t92 = text("\n          1. Be# willing. Willingness will get you every where these days ;)\n          ");
    			br88 = element("br");
    			t93 = text("\n          2. Take your Vow to NOW – make this decision important!! Make\n          (the quality of) your life depend on it! I'm talking about a real\n          promise to bring a high quality participation to the present moment.\n          ");
    			br89 = element("br");
    			t94 = text("\n          3. Develop some NOWism strategies to take care of your\n          'momenterrorists' when they arise to hi-jack your mind. Try\n          the NOWism FREE Mini Course >>> NEOS <<<\n          if you haven't already! (That is a FREE download.)\n          ");
    			br90 = element("br");
    			t95 = text("\n          You're welcome…\n          ");
    			br91 = element("br");
    			t96 = text("\n          Hola Olof!\n          ");
    			br92 = element("br");
    			t97 = text("\n          WARNING! Humans can whinge about the most insignificant things! The\n          ego goes on a rampage, feeling entitled to more, more, MORE!\n          ");
    			br93 = element("br");
    			t98 = text("\n          Meanwhile (in reality), infinite gifts have already been given!\n          ");
    			br94 = element("br");
    			t99 = text("\n          NOW NiNJA response:\n          ");
    			br95 = element("br");
    			t100 = text("\n          Get out your cosmic cheque book.... and write yourself a little\n          reminder.\n          ");
    			br96 = element("br");
    			t101 = text("\n          STOP! Stand still and let the love in!\n          ");
    			br97 = element("br");
    			t102 = text("\n          Deflecting compliments is a disempowering energetic posture. It is\n          like refusing a most generous gift AND it is spiritually rude.\n          ");
    			br98 = element("br");
    			t103 = text("\n          Learning how to gracefully receive a compliment is a powerful step in\n          the journey of self empowerment.\n          ");
    			br99 = element("br");
    			t104 = text("\n          So what’s going on with that anyway? Why do so many of us\n          flinch when someone gives us a compliment?\n          ");
    			br100 = element("br");
    			t105 = text("\n          I have a little tale to share with you... A few years ago, here in\n          Swaziland, Africa, I complimented a woman on the boldly colourful\n          dress she was wearing. “Wow! That is a beautiful colour on\n          you!”\n          ");
    			br101 = element("br");
    			t106 = text("\n          She responded with, “I know, that is true. Thank you.”\n          ");
    			br102 = element("br");
    			t107 = text("\n          She took that compliment head on, without a minuscule of hesitation or\n          doubt. In fact she opened up and revelled in the greatness of how it\n          felt. And that, my NiNJA friend, is not ego, it is the glory of true\n          #selfworth.\n          ");
    			br103 = element("br");
    			t108 = text("\n          I remember how I felt as she soaked up my compliment without delay\n          – it felt slightly shocking to be honest, and that’s\n          when I realised, this is a very interesting energetic culture that we\n          have been perpetuating.\n          ");
    			br104 = element("br");
    			t109 = text("\n          #fear of appearing egotistical has high-jacked basic self worth in our\n          western culture – in a most terrible way.\n          ");
    			br105 = element("br");
    			t110 = text("\n          Not only do we flinch when people give us a compliment, we also scowl\n          if someone else enjoys and fully receives a compliment.\n          ");
    			br106 = element("br");
    			t111 = text("\n          WHAT?\n          ");
    			br107 = element("br");
    			t112 = text("\n          Now clearly there is a difference between a rampaging ego and genuine\n          self worth, and it is time for us to stop being so self-depreciating\n          and start to stand up straight and SEE straight!\n          ");
    			br108 = element("br");
    			t113 = text("\n          The new culture starts with you and me.\n          ");
    			br109 = element("br");
    			t114 = text("\n          May you take the complimentary ticket, Olof, from this present moment\n          and admit your awesomeness.");
    			t115 = space();
    			div6 = element("div");
    			div5 = element("div");
    			img1 = element("img");
    			t116 = space();
    			div4 = element("div");
    			div3 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			document.title = "Olof Marsja | LIQUID FICTION";
    			attr_dev(iframe, "alt", "Olof Marsja");
    			attr_dev(iframe, "title", "Olof Marsja");
    			attr_dev(iframe, "src", "");
    			attr_dev(iframe, "id", "api-frame");
    			attr_dev(iframe, "allow", "autoplay; fullscreen; vr");
    			attr_dev(iframe, "allowvr", "");
    			iframe.allowFullscreen = true;
    			attr_dev(iframe, "mozallowfullscreen", "true");
    			attr_dev(iframe, "webkitallowfullscreen", "true");
    			attr_dev(iframe, "class", "svelte-phcgsp");
    			toggle_class(iframe, "loaded", ctx.loaded);
    			add_location(iframe, file$9, 365, 4, 6356);
    			attr_dev(video, "class", "slipa svelte-phcgsp");
    			attr_dev(video, "src", "/img/s2.mp4");
    			video.autoplay = true;
    			video.muted = true;
    			video.loop = true;
    			add_location(video, file$9, 379, 4, 6708);
    			attr_dev(img0, "src", "/img/plate1.png");
    			attr_dev(img0, "alt", "Olof Marsja - Plate 1");
    			attr_dev(img0, "class", "svelte-phcgsp");
    			add_location(img0, file$9, 383, 8, 6831);
    			add_location(br0, file$9, 386, 10, 6946);
    			add_location(br1, file$9, 388, 10, 6995);
    			add_location(br2, file$9, 391, 10, 7144);
    			add_location(br3, file$9, 393, 10, 7177);
    			add_location(br4, file$9, 395, 10, 7212);
    			add_location(br5, file$9, 399, 10, 7412);
    			add_location(br6, file$9, 402, 10, 7531);
    			add_location(br7, file$9, 408, 10, 7926);
    			add_location(br8, file$9, 413, 10, 8201);
    			add_location(br9, file$9, 415, 10, 8250);
    			add_location(br10, file$9, 418, 10, 8372);
    			add_location(br11, file$9, 420, 10, 8464);
    			add_location(br12, file$9, 423, 10, 8581);
    			add_location(br13, file$9, 426, 10, 8725);
    			add_location(br14, file$9, 428, 10, 8763);
    			add_location(br15, file$9, 431, 10, 8874);
    			add_location(br16, file$9, 438, 10, 9321);
    			add_location(br17, file$9, 443, 10, 9616);
    			add_location(br18, file$9, 446, 10, 9756);
    			add_location(br19, file$9, 450, 10, 9947);
    			add_location(br20, file$9, 454, 10, 10167);
    			add_location(br21, file$9, 456, 10, 10233);
    			add_location(br22, file$9, 458, 10, 10330);
    			add_location(br23, file$9, 460, 10, 10392);
    			add_location(br24, file$9, 461, 10, 10409);
    			add_location(br25, file$9, 463, 10, 10446);
    			add_location(br26, file$9, 466, 10, 10575);
    			add_location(br27, file$9, 469, 10, 10701);
    			add_location(br28, file$9, 472, 10, 10875);
    			add_location(br29, file$9, 474, 10, 10935);
    			add_location(br30, file$9, 479, 10, 11235);
    			add_location(br31, file$9, 481, 10, 11298);
    			add_location(br32, file$9, 483, 10, 11333);
    			add_location(br33, file$9, 486, 10, 11446);
    			add_location(br34, file$9, 489, 10, 11564);
    			add_location(br35, file$9, 491, 10, 11632);
    			add_location(br36, file$9, 494, 10, 11790);
    			add_location(br37, file$9, 495, 10, 11807);
    			add_location(br38, file$9, 497, 10, 11844);
    			add_location(br39, file$9, 500, 10, 11979);
    			add_location(br40, file$9, 502, 10, 12055);
    			add_location(br41, file$9, 504, 10, 12151);
    			add_location(br42, file$9, 508, 10, 12360);
    			add_location(br43, file$9, 510, 10, 12429);
    			add_location(br44, file$9, 512, 10, 12494);
    			add_location(br45, file$9, 516, 10, 12701);
    			add_location(br46, file$9, 518, 10, 12794);
    			add_location(br47, file$9, 520, 10, 12875);
    			add_location(br48, file$9, 523, 10, 12988);
    			add_location(br49, file$9, 525, 10, 13019);
    			add_location(br50, file$9, 528, 10, 13176);
    			add_location(br51, file$9, 530, 10, 13267);
    			add_location(br52, file$9, 531, 10, 13284);
    			add_location(br53, file$9, 533, 10, 13324);
    			add_location(br54, file$9, 541, 10, 13886);
    			add_location(br55, file$9, 546, 10, 14121);
    			add_location(br56, file$9, 549, 10, 14281);
    			add_location(br57, file$9, 557, 10, 14788);
    			add_location(br58, file$9, 559, 10, 14843);
    			add_location(br59, file$9, 565, 10, 15224);
    			add_location(br60, file$9, 568, 10, 15362);
    			add_location(br61, file$9, 570, 10, 15401);
    			add_location(br62, file$9, 576, 10, 15756);
    			add_location(br63, file$9, 580, 10, 15975);
    			add_location(br64, file$9, 584, 10, 16165);
    			add_location(br65, file$9, 590, 10, 16514);
    			add_location(br66, file$9, 591, 10, 16531);
    			add_location(br67, file$9, 595, 10, 16734);
    			add_location(br68, file$9, 600, 10, 17026);
    			add_location(br69, file$9, 603, 10, 17191);
    			add_location(br70, file$9, 605, 10, 17268);
    			add_location(br71, file$9, 608, 10, 17420);
    			add_location(br72, file$9, 611, 10, 17543);
    			add_location(br73, file$9, 613, 10, 17599);
    			add_location(br74, file$9, 614, 10, 17616);
    			add_location(br75, file$9, 616, 10, 17653);
    			add_location(br76, file$9, 619, 10, 17828);
    			add_location(br77, file$9, 622, 10, 17969);
    			add_location(br78, file$9, 624, 10, 18054);
    			add_location(br79, file$9, 630, 10, 18387);
    			add_location(br80, file$9, 632, 10, 18421);
    			add_location(br81, file$9, 634, 10, 18460);
    			add_location(br82, file$9, 636, 10, 18494);
    			add_location(br83, file$9, 640, 10, 18717);
    			add_location(br84, file$9, 642, 10, 18758);
    			add_location(br85, file$9, 644, 10, 18830);
    			add_location(br86, file$9, 646, 10, 18921);
    			add_location(br87, file$9, 648, 10, 18953);
    			add_location(br88, file$9, 650, 10, 19047);
    			add_location(br89, file$9, 654, 10, 19303);
    			add_location(br90, file$9, 659, 10, 19612);
    			add_location(br91, file$9, 661, 10, 19667);
    			add_location(br92, file$9, 663, 10, 19705);
    			add_location(br93, file$9, 666, 10, 19871);
    			add_location(br94, file$9, 668, 10, 19962);
    			add_location(br95, file$9, 670, 10, 20009);
    			add_location(br96, file$9, 673, 10, 20120);
    			add_location(br97, file$9, 675, 10, 20186);
    			add_location(br98, file$9, 678, 10, 20353);
    			add_location(br99, file$9, 681, 10, 20493);
    			add_location(br100, file$9, 684, 10, 20638);
    			add_location(br101, file$9, 689, 10, 20907);
    			add_location(br102, file$9, 691, 10, 21003);
    			add_location(br103, file$9, 696, 10, 21281);
    			add_location(br104, file$9, 701, 10, 21566);
    			add_location(br105, file$9, 704, 10, 21723);
    			add_location(br106, file$9, 707, 10, 21886);
    			add_location(br107, file$9, 709, 10, 21919);
    			add_location(br108, file$9, 713, 10, 22154);
    			add_location(br109, file$9, 715, 10, 22221);
    			attr_dev(div0, "class", "text svelte-phcgsp");
    			add_location(div0, file$9, 384, 8, 6897);
    			attr_dev(div1, "class", "inner svelte-phcgsp");
    			add_location(div1, file$9, 382, 6, 6803);
    			attr_dev(div2, "class", "plate-1 svelte-phcgsp");
    			add_location(div2, file$9, 381, 4, 6775);
    			attr_dev(img1, "src", "/img/Rock.png");
    			attr_dev(img1, "alt", "Olof Marsja - Rock");
    			attr_dev(img1, "class", "svelte-phcgsp");
    			add_location(img1, file$9, 724, 8, 22443);
    			add_location(div3, file$9, 726, 10, 22533);
    			attr_dev(div4, "class", "text svelte-phcgsp");
    			add_location(div4, file$9, 725, 8, 22504);
    			attr_dev(div5, "class", "inner svelte-phcgsp");
    			add_location(div5, file$9, 723, 6, 22415);
    			attr_dev(div6, "class", "rock svelte-phcgsp");
    			add_location(div6, file$9, 722, 4, 22390);
    			attr_dev(div7, "class", "container svelte-phcgsp");
    			add_location(div7, file$9, 361, 2, 6257);
    			attr_dev(div8, "class", "olof svelte-phcgsp");
    			add_location(div8, file$9, 359, 0, 6235);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div8, anchor);
    			append_dev(div8, div7);
    			append_dev(div7, iframe);
    			ctx.iframe_binding(iframe);
    			append_dev(div7, t1);
    			append_dev(div7, video);
    			append_dev(div7, t2);
    			append_dev(div7, div2);
    			append_dev(div2, div1);
    			append_dev(div1, img0);
    			append_dev(div1, t3);
    			append_dev(div1, div0);
    			append_dev(div0, t4);
    			append_dev(div0, br0);
    			append_dev(div0, t5);
    			append_dev(div0, br1);
    			append_dev(div0, t6);
    			append_dev(div0, br2);
    			append_dev(div0, t7);
    			append_dev(div0, br3);
    			append_dev(div0, t8);
    			append_dev(div0, br4);
    			append_dev(div0, t9);
    			append_dev(div0, br5);
    			append_dev(div0, t10);
    			append_dev(div0, br6);
    			append_dev(div0, t11);
    			append_dev(div0, br7);
    			append_dev(div0, t12);
    			append_dev(div0, br8);
    			append_dev(div0, t13);
    			append_dev(div0, br9);
    			append_dev(div0, t14);
    			append_dev(div0, br10);
    			append_dev(div0, t15);
    			append_dev(div0, br11);
    			append_dev(div0, t16);
    			append_dev(div0, br12);
    			append_dev(div0, t17);
    			append_dev(div0, br13);
    			append_dev(div0, t18);
    			append_dev(div0, br14);
    			append_dev(div0, t19);
    			append_dev(div0, br15);
    			append_dev(div0, t20);
    			append_dev(div0, br16);
    			append_dev(div0, t21);
    			append_dev(div0, br17);
    			append_dev(div0, t22);
    			append_dev(div0, br18);
    			append_dev(div0, t23);
    			append_dev(div0, br19);
    			append_dev(div0, t24);
    			append_dev(div0, br20);
    			append_dev(div0, t25);
    			append_dev(div0, br21);
    			append_dev(div0, t26);
    			append_dev(div0, br22);
    			append_dev(div0, t27);
    			append_dev(div0, br23);
    			append_dev(div0, t28);
    			append_dev(div0, br24);
    			append_dev(div0, t29);
    			append_dev(div0, br25);
    			append_dev(div0, t30);
    			append_dev(div0, br26);
    			append_dev(div0, t31);
    			append_dev(div0, br27);
    			append_dev(div0, t32);
    			append_dev(div0, br28);
    			append_dev(div0, t33);
    			append_dev(div0, br29);
    			append_dev(div0, t34);
    			append_dev(div0, br30);
    			append_dev(div0, t35);
    			append_dev(div0, br31);
    			append_dev(div0, t36);
    			append_dev(div0, br32);
    			append_dev(div0, t37);
    			append_dev(div0, br33);
    			append_dev(div0, t38);
    			append_dev(div0, br34);
    			append_dev(div0, t39);
    			append_dev(div0, br35);
    			append_dev(div0, t40);
    			append_dev(div0, br36);
    			append_dev(div0, t41);
    			append_dev(div0, br37);
    			append_dev(div0, t42);
    			append_dev(div0, br38);
    			append_dev(div0, t43);
    			append_dev(div0, br39);
    			append_dev(div0, t44);
    			append_dev(div0, br40);
    			append_dev(div0, t45);
    			append_dev(div0, br41);
    			append_dev(div0, t46);
    			append_dev(div0, br42);
    			append_dev(div0, t47);
    			append_dev(div0, br43);
    			append_dev(div0, t48);
    			append_dev(div0, br44);
    			append_dev(div0, t49);
    			append_dev(div0, br45);
    			append_dev(div0, t50);
    			append_dev(div0, br46);
    			append_dev(div0, t51);
    			append_dev(div0, br47);
    			append_dev(div0, t52);
    			append_dev(div0, br48);
    			append_dev(div0, t53);
    			append_dev(div0, br49);
    			append_dev(div0, t54);
    			append_dev(div0, br50);
    			append_dev(div0, t55);
    			append_dev(div0, br51);
    			append_dev(div0, t56);
    			append_dev(div0, br52);
    			append_dev(div0, t57);
    			append_dev(div0, br53);
    			append_dev(div0, t58);
    			append_dev(div0, br54);
    			append_dev(div0, t59);
    			append_dev(div0, br55);
    			append_dev(div0, t60);
    			append_dev(div0, br56);
    			append_dev(div0, t61);
    			append_dev(div0, br57);
    			append_dev(div0, t62);
    			append_dev(div0, br58);
    			append_dev(div0, t63);
    			append_dev(div0, br59);
    			append_dev(div0, t64);
    			append_dev(div0, br60);
    			append_dev(div0, t65);
    			append_dev(div0, br61);
    			append_dev(div0, t66);
    			append_dev(div0, br62);
    			append_dev(div0, t67);
    			append_dev(div0, br63);
    			append_dev(div0, t68);
    			append_dev(div0, br64);
    			append_dev(div0, t69);
    			append_dev(div0, br65);
    			append_dev(div0, t70);
    			append_dev(div0, br66);
    			append_dev(div0, t71);
    			append_dev(div0, br67);
    			append_dev(div0, t72);
    			append_dev(div0, br68);
    			append_dev(div0, t73);
    			append_dev(div0, br69);
    			append_dev(div0, t74);
    			append_dev(div0, br70);
    			append_dev(div0, t75);
    			append_dev(div0, br71);
    			append_dev(div0, t76);
    			append_dev(div0, br72);
    			append_dev(div0, t77);
    			append_dev(div0, br73);
    			append_dev(div0, t78);
    			append_dev(div0, br74);
    			append_dev(div0, t79);
    			append_dev(div0, br75);
    			append_dev(div0, t80);
    			append_dev(div0, br76);
    			append_dev(div0, t81);
    			append_dev(div0, br77);
    			append_dev(div0, t82);
    			append_dev(div0, br78);
    			append_dev(div0, t83);
    			append_dev(div0, br79);
    			append_dev(div0, t84);
    			append_dev(div0, br80);
    			append_dev(div0, t85);
    			append_dev(div0, br81);
    			append_dev(div0, t86);
    			append_dev(div0, br82);
    			append_dev(div0, t87);
    			append_dev(div0, br83);
    			append_dev(div0, t88);
    			append_dev(div0, br84);
    			append_dev(div0, t89);
    			append_dev(div0, br85);
    			append_dev(div0, t90);
    			append_dev(div0, br86);
    			append_dev(div0, t91);
    			append_dev(div0, br87);
    			append_dev(div0, t92);
    			append_dev(div0, br88);
    			append_dev(div0, t93);
    			append_dev(div0, br89);
    			append_dev(div0, t94);
    			append_dev(div0, br90);
    			append_dev(div0, t95);
    			append_dev(div0, br91);
    			append_dev(div0, t96);
    			append_dev(div0, br92);
    			append_dev(div0, t97);
    			append_dev(div0, br93);
    			append_dev(div0, t98);
    			append_dev(div0, br94);
    			append_dev(div0, t99);
    			append_dev(div0, br95);
    			append_dev(div0, t100);
    			append_dev(div0, br96);
    			append_dev(div0, t101);
    			append_dev(div0, br97);
    			append_dev(div0, t102);
    			append_dev(div0, br98);
    			append_dev(div0, t103);
    			append_dev(div0, br99);
    			append_dev(div0, t104);
    			append_dev(div0, br100);
    			append_dev(div0, t105);
    			append_dev(div0, br101);
    			append_dev(div0, t106);
    			append_dev(div0, br102);
    			append_dev(div0, t107);
    			append_dev(div0, br103);
    			append_dev(div0, t108);
    			append_dev(div0, br104);
    			append_dev(div0, t109);
    			append_dev(div0, br105);
    			append_dev(div0, t110);
    			append_dev(div0, br106);
    			append_dev(div0, t111);
    			append_dev(div0, br107);
    			append_dev(div0, t112);
    			append_dev(div0, br108);
    			append_dev(div0, t113);
    			append_dev(div0, br109);
    			append_dev(div0, t114);
    			append_dev(div7, t115);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			append_dev(div5, img1);
    			append_dev(div5, t116);
    			append_dev(div5, div4);
    			append_dev(div4, div3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div3, null);
    			}

    			ctx.div3_binding(div3);
    		},

    		p: function update(changed, ctx) {
    			if (changed.loaded) {
    				toggle_class(iframe, "loaded", ctx.loaded);
    			}

    			if (changed.iArray) {
    				each_value = ctx.iArray;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div3, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}
    		},

    		i: function intro(local) {
    			if (!div7_intro) {
    				add_render_callback(() => {
    					div7_intro = create_in_transition(div7, fly, { duration: 800, x: 60, delay: 0, easing: quartOut });
    					div7_intro.start();
    				});
    			}
    		},

    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(t0);
    				detach_dev(div8);
    			}

    			ctx.iframe_binding(null);

    			destroy_each(each_blocks, detaching);

    			ctx.div3_binding(null);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$b.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let $menuActive;

    	validate_store(menuActive, 'menuActive');
    	component_subscribe($$self, menuActive, $$value => { $menuActive = $$value; $$invalidate('$menuActive', $menuActive); });

    	

      activePage.set("olof");
      orbBackgroundOne.set("rgba(244,164,96,1)");
      orbBackgroundTwo.set("rgba(222,184,135,1)");

      orbColorOne.set("rgba(255,255,255,1)");
      orbColorTwo.set("rgba(0,0,0,1)");

      orbPosition.set({
        top: "10px",
        left: "10px"
      });

      let iframeEl = {};
      let iSlideEl = {};
      let loaded = false;
      let sketchFabClient = {};
      let slider = {};

      // $: {
      //   if ($menuActive) {
      //     slider.pause();
      //   } else if (slider.play) {
      //     console.log(slider);
      //     slider.play();
      //   }
      // }

      const iArray = [
        "iWake",
        "iCome",
        "iSee",
        "iCry",
        "iHear",
        "iSuck",
        "iEat",
        "iSubmitt",
        "iCrawl",
        "iSnuggle",
        "iLaugh",
        "iSit",
        "iBalance",
        "iGrab",
        "iWalk",
        "iScream",
        "iCuddle",
        "iLook",
        "iTake",
        "iCarry",
        "iShit",
        "iFeed",
        "iRoam",
        "iDrive",
        "iPour",
        "iCast",
        "iSolidify",
        "",
        "",
        "iSurf",
        "",
        "iCarve",
        "iMold",
        "iDigitalize",
        "iChange",
        "iTalk",
        "iBomb",
        "iPaint",
        "iBuild",
        "iDestroy",
        "iDress",
        "",
        "iWould",
        "",
        "iCook",
        "iPee",
        "iProtect",
        "iRemember",
        "iFinish",
        "iSwear",
        "",
        "",
        "iConnect",
        "iCompute",
        "iRun",
        "iBike",
        "iSmash",
        "iDraw",
        "iSew",
        "iWeld",
        "iHammer",
        "",
        "iSwim",
        "iPass",
        "iStop",
        "iThink",
        "iScrew",
        "iClay",
        "iBurn",
        "iHeat",
        "iDraught",
        "iBuy",
        "iCapitalise",
        "iBurry",
        "iMarry",
        "iDie",
        "iBorn",
        "iBust",
        "iAruge",
        "iDefend",
        "iAm",
        "iDevalue",
        "iForgett",
        "iDisappear",
        "iVanish",
        "",
        "iBlow",
        "",
        "iManage",
        "iBuild",
        "iLinger",
        "iToss",
        "i",
        "",
        "iWish",
        "iDo",
        "iBehave",
        "iSuffer",
        "iPray",
        "iKick",
        "iListen",
        "iWrite",
        "iKnit",
        "iPonder",
        "iSlaughter",
        "iBring",
        "iMark",
        "iSeparate",
        "i",
        "i",
        "i",
        "i",
        "i",
        "i",
        "i",
        "i",
        "",
        "iVoid",
        "iNail",
        "iKnife",
        "iLeaf",
        "iStone",
        "iPad",
        "iSand",
        "iPhone",
        "iMug",
        "iWater",
        "iSlab",
        "iWood",
        "iApple",
        "iOrange",
        "iMac",
        "",
        "iPillar",
        "iHouse",
        "iTent",
        "iHut",
        "iSkyskrape",
        "iCastle",
        "iBin",
        "i",
        "i",
        "i",
        "i",
        "i",
        "i",
        "i",
        "i",
        "i",
        "i"
      ];

      onMount(async () => {
        slider = tns({
          container: iSlideEl,
          items: 1,
          axis: "vertical",
          speed: 600,
          controls: false,
          nav: false,
          autoplay: true,
          mouseDrag: false,
          touch: false,
          autoplayTimeout: 2000,
          autoplayButtonOutput: false,
          autoplayText: false
        });

        slider.events.on("indexChanged", i => {
          if (!$menuActive) {
            try {
              let msg = new SpeechSynthesisUtterance(
                iArray[slider.getInfo().index - 1]
              );
              window.speechSynthesis.speak(msg);
            } catch (err) {
              console.error("💥 Speech synthesis error:", err);
            }
          }
        });

        let uid = "2bb57385c8df4e9bbe487a4be328a9a9";
        sketchFabClient = new Sketchfab(iframeEl);
        sketchFabClient.init(uid, {
          autospin: 0.1,
          autostart: 1,
          success: function onSuccess(api) {
            api.start();
            api.addEventListener("viewerready", function() {
              $$invalidate('loaded', loaded = true);
            });
          },
          error: function onError(err) {
            console.error("💥Viewer error", err);
          }
        });
      });

      onDestroy(async () => {
        iframeEl.remove();
        slider.destroy();
      });

    	function iframe_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('iframeEl', iframeEl = $$value);
    		});
    	}

    	function div3_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('iSlideEl', iSlideEl = $$value);
    		});
    	}

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('iframeEl' in $$props) $$invalidate('iframeEl', iframeEl = $$props.iframeEl);
    		if ('iSlideEl' in $$props) $$invalidate('iSlideEl', iSlideEl = $$props.iSlideEl);
    		if ('loaded' in $$props) $$invalidate('loaded', loaded = $$props.loaded);
    		if ('sketchFabClient' in $$props) sketchFabClient = $$props.sketchFabClient;
    		if ('slider' in $$props) slider = $$props.slider;
    		if ('$menuActive' in $$props) menuActive.set($menuActive);
    	};

    	return {
    		iframeEl,
    		iSlideEl,
    		loaded,
    		iArray,
    		iframe_binding,
    		div3_binding
    	};
    }

    class OlofMarsja extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "OlofMarsja", options, id: create_fragment$b.name });
    	}
    }

    /* src/alina-chaiderov/AlinaChaiderov.svelte generated by Svelte v3.12.1 */

    const file$a = "src/alina-chaiderov/AlinaChaiderov.svelte";

    // (86:0) {#if !$menuActive}
    function create_if_block$3(ctx) {
    	var iframe, iframe_intro;

    	const block = {
    		c: function create() {
    			iframe = element("iframe");
    			attr_dev(iframe, "title", "Alina Chaiderov");
    			attr_dev(iframe, "class", "embed-responsive-item svelte-zqzi32");
    			attr_dev(iframe, "src", "https://alinachaiderov.com/liquidfiction");
    			attr_dev(iframe, "allow", "encrypted-media");
    			iframe.allowFullscreen = true;
    			add_location(iframe, file$a, 86, 2, 1550);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, iframe, anchor);
    		},

    		i: function intro(local) {
    			if (!iframe_intro) {
    				add_render_callback(() => {
    					iframe_intro = create_in_transition(iframe, fade, { delay: 1000 });
    					iframe_intro.start();
    				});
    			}
    		},

    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(iframe);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block$3.name, type: "if", source: "(86:0) {#if !$menuActive}", ctx });
    	return block;
    }

    function create_fragment$c(ctx) {
    	var t, if_block_anchor;

    	var if_block = (!ctx.$menuActive) && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			document.title = "Alina Chaiderov | LIQUID FICTION";
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (!ctx.$menuActive) {
    				if (!if_block) {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else transition_in(if_block, 1);
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},

    		i: function intro(local) {
    			transition_in(if_block);
    		},

    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(t);
    			}

    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach_dev(if_block_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$c.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let $menuActive;

    	validate_store(menuActive, 'menuActive');
    	component_subscribe($$self, menuActive, $$value => { $menuActive = $$value; $$invalidate('$menuActive', $menuActive); });

    	

      activePage.set("alina");
      orbBackgroundOne.set("rgba(0,0,255,1)");
      orbBackgroundTwo.set("rgba(0,0,255,1)");
      orbColorOne.set("rgba(255,255,255,1)");
      orbColorTwo.set("rgba(255,255,255,1)");

      orbPosition.set({
        top: "10px",
        left: "10px"
      });

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('$menuActive' in $$props) menuActive.set($menuActive);
    	};

    	return { $menuActive };
    }

    class AlinaChaiderov extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "AlinaChaiderov", options, id: create_fragment$c.name });
    	}
    }

    /* src/Landing.svelte generated by Svelte v3.12.1 */

    const file$b = "src/Landing.svelte";

    function create_fragment$d(ctx) {
    	var title_value, t0, div4, div1, div0, t2, div3, div2, dispose;

    	document.title = title_value = ctx.titleOutput;

    	const block = {
    		c: function create() {
    			t0 = space();
    			div4 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "LIQUID~";
    			t2 = space();
    			div3 = element("div");
    			div2 = element("div");
    			div2.textContent = "FICTION";
    			attr_dev(div0, "class", "logo2 svelte-c7zhbr");
    			add_location(div0, file$b, 132, 4, 3128);
    			attr_dev(div1, "class", "pane top-left svelte-c7zhbr");
    			add_location(div1, file$b, 131, 2, 3096);
    			attr_dev(div2, "class", "logo2 svelte-c7zhbr");
    			add_location(div2, file$b, 136, 4, 3206);
    			attr_dev(div3, "class", "pane top-right svelte-c7zhbr");
    			add_location(div3, file$b, 135, 2, 3173);
    			add_location(div4, file$b, 127, 0, 3037);
    			dispose = listen_dev(div4, "click", ctx.click_handler);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div1);
    			append_dev(div1, div0);
    			append_dev(div4, t2);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.titleOutput) && title_value !== (title_value = ctx.titleOutput)) {
    				document.title = title_value;
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(t0);
    				detach_dev(div4);
    			}

    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$d.name, type: "component", source: "", ctx });
    	return block;
    }

    let titleAnimation = "LIQUID FICTION";

    let titleIndex = 0;

    function instance$d($$self) {
    	

      activePage.set("landing");
      orbBackgroundOne.set("rgba(0,0,0,1)");
      orbColorOne.set("rgba(255,255,0,1)");

      orbBackgroundTwo.set("rgba(255,0,0,1)");
      orbColorTwo.set("rgba(255,255,255,1)");
      let titleOutput = titleAnimation;
      let titleLength = titleAnimation.length;

      activePage.set("landing");

      // setInterval(() => {
      //   console.log(titleAnimation.length);
      //   if (titleIndex <= titleLength) {
      //     let temp = Array.from(titleAnimation).map((c, i) => {
      //       console.log(c, i);
      //       if (i >= titleIndex) {
      //         return c;
      //       } else {
      //         return "~";
      //       }
      //     });
      //     console.log(temp);
      //     titleOutput = temp.join("");
      //     titleIndex += 1;
      //   } else {
      //     titleOutput = titleAnimation;
      //     titleIndex = 0;
      //   }
      // }, 400);

    	const click_handler = () => {
    	    menuActive.set(true);
    	  };

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('titleAnimation' in $$props) titleAnimation = $$props.titleAnimation;
    		if ('titleOutput' in $$props) $$invalidate('titleOutput', titleOutput = $$props.titleOutput);
    		if ('titleLength' in $$props) titleLength = $$props.titleLength;
    		if ('titleIndex' in $$props) titleIndex = $$props.titleIndex;
    	};

    	return { titleOutput, click_handler };
    }

    class Landing extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Landing", options, id: create_fragment$d.name });
    	}
    }

    /* src/App.svelte generated by Svelte v3.12.1 */

    // (170:0) {#if $activePage != 'alina'}
    function create_if_block$4(ctx) {
    	var current;

    	var erosionmachine = new ErosionMachine({ $$inline: true });

    	const block = {
    		c: function create() {
    			erosionmachine.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(erosionmachine, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(erosionmachine.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(erosionmachine.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(erosionmachine, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block$4.name, type: "if", source: "(170:0) {#if $activePage != 'alina'}", ctx });
    	return block;
    }

    // (174:0) <Router>
    function create_default_slot$1(ctx) {
    	var t0, t1, t2, t3, t4, t5, current;

    	var route0 = new Route({
    		props: { path: "/", component: Landing },
    		$$inline: true
    	});

    	var route1 = new Route({
    		props: {
    		path: "/liquid-fiction",
    		component: About
    	},
    		$$inline: true
    	});

    	var route2 = new Route({
    		props: {
    		path: "/editorial",
    		component: Editorial
    	},
    		$$inline: true
    	});

    	var route3 = new Route({
    		props: {
    		path: "/cycle-1",
    		component: CycleOne
    	},
    		$$inline: true
    	});

    	var route4 = new Route({
    		props: { path: "eeefff", component: EEEFFF },
    		$$inline: true
    	});

    	var route5 = new Route({
    		props: {
    		path: "olof-marsja",
    		component: OlofMarsja
    	},
    		$$inline: true
    	});

    	var route6 = new Route({
    		props: {
    		path: "alina-chaiderov",
    		component: AlinaChaiderov
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			route0.$$.fragment.c();
    			t0 = space();
    			route1.$$.fragment.c();
    			t1 = space();
    			route2.$$.fragment.c();
    			t2 = space();
    			route3.$$.fragment.c();
    			t3 = space();
    			route4.$$.fragment.c();
    			t4 = space();
    			route5.$$.fragment.c();
    			t5 = space();
    			route6.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(route0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(route1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(route2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(route3, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(route4, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(route5, target, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(route6, target, anchor);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			transition_in(route0.$$.fragment, local);

    			transition_in(route1.$$.fragment, local);

    			transition_in(route2.$$.fragment, local);

    			transition_in(route3.$$.fragment, local);

    			transition_in(route4.$$.fragment, local);

    			transition_in(route5.$$.fragment, local);

    			transition_in(route6.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			transition_out(route2.$$.fragment, local);
    			transition_out(route3.$$.fragment, local);
    			transition_out(route4.$$.fragment, local);
    			transition_out(route5.$$.fragment, local);
    			transition_out(route6.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(route0, detaching);

    			if (detaching) {
    				detach_dev(t0);
    			}

    			destroy_component(route1, detaching);

    			if (detaching) {
    				detach_dev(t1);
    			}

    			destroy_component(route2, detaching);

    			if (detaching) {
    				detach_dev(t2);
    			}

    			destroy_component(route3, detaching);

    			if (detaching) {
    				detach_dev(t3);
    			}

    			destroy_component(route4, detaching);

    			if (detaching) {
    				detach_dev(t4);
    			}

    			destroy_component(route5, detaching);

    			if (detaching) {
    				detach_dev(t5);
    			}

    			destroy_component(route6, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot$1.name, type: "slot", source: "(174:0) <Router>", ctx });
    	return block;
    }

    function create_fragment$e(ctx) {
    	var t0, t1, current;

    	var orb = new Orb({ $$inline: true });

    	var if_block = (ctx.$activePage != 'alina') && create_if_block$4(ctx);

    	var router = new Router({
    		props: {
    		$$slots: { default: [create_default_slot$1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			orb.$$.fragment.c();
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			router.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(orb, target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(router, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.$activePage != 'alina') {
    				if (!if_block) {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t1.parentNode, t1);
    				} else transition_in(if_block, 1);
    			} else if (if_block) {
    				group_outros();
    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});
    				check_outros();
    			}

    			var router_changes = {};
    			if (changed.$$scope) router_changes.$$scope = { changed, ctx };
    			router.$set(router_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(orb.$$.fragment, local);

    			transition_in(if_block);

    			transition_in(router.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(orb.$$.fragment, local);
    			transition_out(if_block);
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(orb, detaching);

    			if (detaching) {
    				detach_dev(t0);
    			}

    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach_dev(t1);
    			}

    			destroy_component(router, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$e.name, type: "component", source: "", ctx });
    	return block;
    }

    const query = "*[]";

    async function loadData(query, params) {
      try {
        const res = await client.fetch(query, params);

        if (!Array.isArray(res)) {
          throw "Return data is not an array";
          return false;
        }

        let contentContstruction = {
          introduction: {
            main: {},
            firstCycle: {}
          },
          artists: [],
          essays: [],
          credits: {}
        };

        contentContstruction.introduction.main = res.find(
          d => get_1(d, "slug.current", "") === "introduction"
        );

        contentContstruction.introduction.firstCycle = res.find(
          d => get_1(d, "slug.current", "") === "cycle-one"
        );

        contentContstruction.credits = res.find(
          d => get_1(d, "slug.current", "") === "credits"
        );

        contentContstruction.artists = res.filter(
          d => get_1(d, "_type", "") === "artist"
        );

        contentContstruction.essays = res.filter(
          d =>
            get_1(d, "_type", "") === "post" &&
            get_1(d, "slug.current", "") != "credits" &&
            get_1(d, "slug.current", "") != "introduction" &&
            get_1(d, "slug.current", "") != "cycle-one"
        );

        return contentContstruction;
      } catch (err) {
        console.log(err);
        Sentry.captureException(err);
      }
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let $activePage;

    	validate_store(activePage, 'activePage');
    	component_subscribe($$self, activePage, $$value => { $activePage = $$value; $$invalidate('$activePage', $activePage); });

    	

      textContent.set(loadData(query, {}));

      onMount(async () => {
        window.scrollTo(0, 0);
      });

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('$activePage' in $$props) activePage.set($activePage);
    	};

    	return { $activePage };
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "App", options, id: create_fragment$e.name });
    	}
    }

    // Sentry.init({
    //   dsn: 'https://421a3e5a32d94b149d5e1eccb8af6f24@sentry.io/1771039'
    // })

    const app = new App({
      target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
