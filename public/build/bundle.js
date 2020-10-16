
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
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
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
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
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
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
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
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
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
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
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.0' }, detail)));
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
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
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
        $capture_state() { }
        $inject_state() { }
    }

    /* src/components/Navbar.svelte generated by Svelte v3.29.0 */

    const file = "src/components/Navbar.svelte";

    function create_fragment(ctx) {
    	let nav;
    	let img;
    	let img_src_value;
    	let t0;
    	let span;

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			img = element("img");
    			t0 = space();
    			span = element("span");
    			span.textContent = "PasCAL";
    			if (img.src !== (img_src_value = "./assets/logo.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "width", "50px");
    			attr_dev(img, "height", "auto");
    			attr_dev(img, "alt", "Logo");
    			add_location(img, file, 14, 2, 184);
    			set_style(span, "font-size", "40px");
    			set_style(span, "position", "relative");
    			set_style(span, "top", "-10px");
    			set_style(span, "line-height", "35px");
    			set_style(span, "padding", "5px");
    			add_location(span, file, 15, 2, 256);
    			attr_dev(nav, "class", "svelte-s744s9");
    			add_location(nav, file, 13, 0, 176);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, img);
    			append_dev(nav, t0);
    			append_dev(nav, span);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Navbar", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/components/Dropdown.svelte generated by Svelte v3.29.0 */

    const { console: console_1 } = globals;
    const file$1 = "src/components/Dropdown.svelte";

    function create_fragment$1(ctx) {
    	let table;
    	let tr0;
    	let th0;
    	let t0;
    	let sup;
    	let t2;
    	let t3;
    	let td0;
    	let button0;
    	let t5;
    	let td1;
    	let button1;
    	let t7;
    	let td2;
    	let button2;
    	let t9;
    	let td3;
    	let button3;
    	let t11;
    	let tr1;
    	let th1;
    	let t13;
    	let td4;
    	let button4;
    	let t15;
    	let td5;
    	let button5;
    	let t17;
    	let td6;
    	let button6;
    	let t19;
    	let td7;
    	let button7;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			table = element("table");
    			tr0 = element("tr");
    			th0 = element("th");
    			t0 = text("Linear Eq");
    			sup = element("sup");
    			sup.textContent = "n";
    			t2 = text("s");
    			t3 = space();
    			td0 = element("td");
    			button0 = element("button");
    			button0.textContent = "Bisection";
    			t5 = space();
    			td1 = element("td");
    			button1 = element("button");
    			button1.textContent = "Secant Method";
    			t7 = space();
    			td2 = element("td");
    			button2 = element("button");
    			button2.textContent = "Regula Falsi";
    			t9 = space();
    			td3 = element("td");
    			button3 = element("button");
    			button3.textContent = "Newton-Raphson";
    			t11 = space();
    			tr1 = element("tr");
    			th1 = element("th");
    			th1.textContent = "Matrices";
    			t13 = space();
    			td4 = element("td");
    			button4 = element("button");
    			button4.textContent = "Multiply";
    			t15 = space();
    			td5 = element("td");
    			button5 = element("button");
    			button5.textContent = "Inverse";
    			t17 = space();
    			td6 = element("td");
    			button6 = element("button");
    			button6.textContent = "LU Dolittle";
    			t19 = space();
    			td7 = element("td");
    			button7 = element("button");
    			button7.textContent = "LU Crout";
    			add_location(sup, file$1, 15, 17, 251);
    			attr_dev(th0, "class", "svelte-ekuo8v");
    			add_location(th0, file$1, 15, 4, 238);
    			add_location(button0, file$1, 16, 8, 278);
    			attr_dev(td0, "class", "svelte-ekuo8v");
    			add_location(td0, file$1, 16, 4, 274);
    			add_location(button1, file$1, 17, 8, 318);
    			attr_dev(td1, "class", "svelte-ekuo8v");
    			add_location(td1, file$1, 17, 4, 314);
    			add_location(button2, file$1, 18, 8, 362);
    			attr_dev(td2, "class", "svelte-ekuo8v");
    			add_location(td2, file$1, 18, 4, 358);
    			add_location(button3, file$1, 19, 8, 405);
    			attr_dev(td3, "class", "svelte-ekuo8v");
    			add_location(td3, file$1, 19, 4, 401);
    			add_location(tr0, file$1, 14, 2, 229);
    			attr_dev(th1, "class", "svelte-ekuo8v");
    			add_location(th1, file$1, 22, 4, 461);
    			add_location(button4, file$1, 23, 8, 487);
    			attr_dev(td4, "class", "svelte-ekuo8v");
    			add_location(td4, file$1, 23, 4, 483);
    			add_location(button5, file$1, 24, 8, 526);
    			attr_dev(td5, "class", "svelte-ekuo8v");
    			add_location(td5, file$1, 24, 4, 522);
    			add_location(button6, file$1, 25, 8, 564);
    			attr_dev(td6, "class", "svelte-ekuo8v");
    			add_location(td6, file$1, 25, 4, 560);
    			add_location(button7, file$1, 26, 8, 606);
    			attr_dev(td7, "class", "svelte-ekuo8v");
    			add_location(td7, file$1, 26, 4, 602);
    			add_location(tr1, file$1, 21, 2, 452);
    			attr_dev(table, "class", "svelte-ekuo8v");
    			add_location(table, file$1, 13, 0, 198);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);
    			append_dev(table, tr0);
    			append_dev(tr0, th0);
    			append_dev(th0, t0);
    			append_dev(th0, sup);
    			append_dev(th0, t2);
    			append_dev(tr0, t3);
    			append_dev(tr0, td0);
    			append_dev(td0, button0);
    			append_dev(tr0, t5);
    			append_dev(tr0, td1);
    			append_dev(td1, button1);
    			append_dev(tr0, t7);
    			append_dev(tr0, td2);
    			append_dev(td2, button2);
    			append_dev(tr0, t9);
    			append_dev(tr0, td3);
    			append_dev(td3, button3);
    			append_dev(table, t11);
    			append_dev(table, tr1);
    			append_dev(tr1, th1);
    			append_dev(tr1, t13);
    			append_dev(tr1, td4);
    			append_dev(td4, button4);
    			append_dev(tr1, t15);
    			append_dev(tr1, td5);
    			append_dev(td5, button5);
    			append_dev(tr1, t17);
    			append_dev(tr1, td6);
    			append_dev(td6, button6);
    			append_dev(tr1, t19);
    			append_dev(tr1, td7);
    			append_dev(td7, button7);

    			if (!mounted) {
    				dispose = listen_dev(table, "click", /*fnHandler*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Dropdown", slots, []);

    	const fnHandler = e => {
    		console.log(e.target.innerText);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Dropdown> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ fnHandler });
    	return [fnHandler];
    }

    class Dropdown extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dropdown",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.29.0 */
    const file$2 = "src/App.svelte";

    function create_fragment$2(ctx) {
    	let main;
    	let nbar;
    	let t;
    	let ddown;
    	let current;
    	nbar = new Navbar({ $$inline: true });
    	ddown = new Dropdown({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(nbar.$$.fragment);
    			t = space();
    			create_component(ddown.$$.fragment);
    			attr_dev(main, "class", "svelte-17l0jr0");
    			add_location(main, file$2, 14, 0, 227);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(nbar, main, null);
    			append_dev(main, t);
    			mount_component(ddown, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(nbar.$$.fragment, local);
    			transition_in(ddown.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nbar.$$.fragment, local);
    			transition_out(ddown.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(nbar);
    			destroy_component(ddown);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Nbar: Navbar, Ddown: Dropdown });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    const app = new App( {
    	target: document.body,
    	props: {}
    } );

    return app;

}());
