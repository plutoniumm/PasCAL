
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

    /* src/components/nav.svelte generated by Svelte v3.29.0 */

    const file = "src/components/nav.svelte";

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
    			add_location(img, file, 16, 2, 250);
    			set_style(span, "font-size", "40px");
    			set_style(span, "position", "relative");
    			set_style(span, "top", "-10px");
    			set_style(span, "line-height", "35px");
    			set_style(span, "padding", "5px");
    			add_location(span, file, 17, 2, 322);
    			attr_dev(nav, "class", "svelte-1kmekoq");
    			add_location(nav, file, 15, 0, 242);
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
    	validate_slots("Nav", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Nav> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Nav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nav",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/components/ddown.svelte generated by Svelte v3.29.0 */

    const file$1 = "src/components/ddown.svelte";

    function create_fragment$1(ctx) {
    	let table;
    	let tr0;
    	let th0;
    	let div0;
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
    	let div1;
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
    			div0 = element("div");
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
    			button1.textContent = "Secant";
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
    			div1 = element("div");
    			div1.textContent = "Matrices";
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
    			add_location(sup, file$1, 37, 20, 779);
    			attr_dev(div0, "class", "svelte-bam8ng");
    			add_location(div0, file$1, 37, 6, 765);
    			attr_dev(th0, "class", "svelte-bam8ng");
    			add_location(th0, file$1, 36, 4, 754);
    			attr_dev(button0, "class", "svelte-bam8ng");
    			add_location(button0, file$1, 39, 8, 817);
    			attr_dev(td0, "class", "svelte-bam8ng");
    			add_location(td0, file$1, 39, 4, 813);
    			attr_dev(button1, "class", "svelte-bam8ng");
    			add_location(button1, file$1, 40, 8, 857);
    			attr_dev(td1, "class", "svelte-bam8ng");
    			add_location(td1, file$1, 40, 4, 853);
    			attr_dev(button2, "class", "svelte-bam8ng");
    			add_location(button2, file$1, 41, 8, 894);
    			attr_dev(td2, "class", "svelte-bam8ng");
    			add_location(td2, file$1, 41, 4, 890);
    			attr_dev(button3, "class", "svelte-bam8ng");
    			add_location(button3, file$1, 42, 8, 937);
    			attr_dev(td3, "class", "svelte-bam8ng");
    			add_location(td3, file$1, 42, 4, 933);
    			attr_dev(tr0, "id", "eqns");
    			attr_dev(tr0, "class", "svelte-bam8ng");
    			add_location(tr0, file$1, 35, 2, 735);
    			attr_dev(div1, "class", "svelte-bam8ng");
    			add_location(div1, file$1, 46, 6, 1016);
    			attr_dev(th1, "class", "svelte-bam8ng");
    			add_location(th1, file$1, 45, 4, 1005);
    			attr_dev(button4, "class", "svelte-bam8ng");
    			add_location(button4, file$1, 48, 8, 1054);
    			attr_dev(td4, "class", "svelte-bam8ng");
    			add_location(td4, file$1, 48, 4, 1050);
    			attr_dev(button5, "class", "svelte-bam8ng");
    			add_location(button5, file$1, 49, 8, 1093);
    			attr_dev(td5, "class", "svelte-bam8ng");
    			add_location(td5, file$1, 49, 4, 1089);
    			attr_dev(button6, "class", "svelte-bam8ng");
    			add_location(button6, file$1, 50, 8, 1131);
    			attr_dev(td6, "class", "svelte-bam8ng");
    			add_location(td6, file$1, 50, 4, 1127);
    			attr_dev(button7, "class", "svelte-bam8ng");
    			add_location(button7, file$1, 51, 8, 1173);
    			attr_dev(td7, "class", "svelte-bam8ng");
    			add_location(td7, file$1, 51, 4, 1169);
    			attr_dev(tr1, "id", "matrix");
    			attr_dev(tr1, "class", "svelte-bam8ng");
    			add_location(tr1, file$1, 44, 2, 984);
    			attr_dev(table, "cellpadding", "0");
    			attr_dev(table, "cellspacing", "0");
    			attr_dev(table, "class", "svelte-bam8ng");
    			add_location(table, file$1, 34, 0, 672);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);
    			append_dev(table, tr0);
    			append_dev(tr0, th0);
    			append_dev(th0, div0);
    			append_dev(div0, t0);
    			append_dev(div0, sup);
    			append_dev(div0, t2);
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
    			append_dev(th1, div1);
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
    				dispose = listen_dev(
    					table,
    					"click",
    					function () {
    						if (is_function(/*fnHandler*/ ctx[0])) /*fnHandler*/ ctx[0].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    		},
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
    	validate_slots("Ddown", slots, []);
    	let { fnHandler } = $$props;
    	const writable_props = ["fnHandler"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Ddown> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("fnHandler" in $$props) $$invalidate(0, fnHandler = $$props.fnHandler);
    	};

    	$$self.$capture_state = () => ({ fnHandler });

    	$$self.$inject_state = $$props => {
    		if ("fnHandler" in $$props) $$invalidate(0, fnHandler = $$props.fnHandler);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [fnHandler];
    }

    class Ddown extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { fnHandler: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Ddown",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*fnHandler*/ ctx[0] === undefined && !("fnHandler" in props)) {
    			console.warn("<Ddown> was created without expected prop 'fnHandler'");
    		}
    	}

    	get fnHandler() {
    		throw new Error("<Ddown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fnHandler(value) {
    		throw new Error("<Ddown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/inputs.svelte generated by Svelte v3.29.0 */

    const file$2 = "src/components/inputs.svelte";

    function create_fragment$2(ctx) {
    	let section;
    	let input0;
    	let t0;
    	let br0;
    	let t1;
    	let input1;
    	let t2;
    	let br1;
    	let t3;
    	let input2;
    	let t4;
    	let br2;
    	let t5;
    	let input3;
    	let t6;
    	let br3;
    	let t7;
    	let input4;
    	let t8;
    	let br4;

    	const block = {
    		c: function create() {
    			section = element("section");
    			input0 = element("input");
    			t0 = space();
    			br0 = element("br");
    			t1 = space();
    			input1 = element("input");
    			t2 = space();
    			br1 = element("br");
    			t3 = space();
    			input2 = element("input");
    			t4 = space();
    			br2 = element("br");
    			t5 = space();
    			input3 = element("input");
    			t6 = space();
    			br3 = element("br");
    			t7 = space();
    			input4 = element("input");
    			t8 = space();
    			br4 = element("br");
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "sin(x) - cos(x) + 5");
    			attr_dev(input0, "class", "svelte-1lyw369");
    			add_location(input0, file$2, 12, 2, 127);
    			add_location(br0, file$2, 13, 2, 185);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "placeholder", "-1.5 || [[][][]]");
    			attr_dev(input1, "class", "svelte-1lyw369");
    			add_location(input1, file$2, 14, 2, 194);
    			add_location(br1, file$2, 15, 2, 249);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "placeholder", "3.3355 || [[][][]]");
    			attr_dev(input2, "class", "svelte-1lyw369");
    			add_location(input2, file$2, 16, 2, 258);
    			add_location(br2, file$2, 17, 2, 315);
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "placeholder", "10e-6");
    			attr_dev(input3, "class", "svelte-1lyw369");
    			add_location(input3, file$2, 18, 2, 324);
    			add_location(br3, file$2, 19, 2, 368);
    			attr_dev(input4, "type", "number");
    			attr_dev(input4, "placeholder", "1000");
    			attr_dev(input4, "class", "svelte-1lyw369");
    			add_location(input4, file$2, 20, 2, 377);
    			add_location(br4, file$2, 21, 2, 422);
    			add_location(section, file$2, 11, 0, 115);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, input0);
    			append_dev(section, t0);
    			append_dev(section, br0);
    			append_dev(section, t1);
    			append_dev(section, input1);
    			append_dev(section, t2);
    			append_dev(section, br1);
    			append_dev(section, t3);
    			append_dev(section, input2);
    			append_dev(section, t4);
    			append_dev(section, br2);
    			append_dev(section, t5);
    			append_dev(section, input3);
    			append_dev(section, t6);
    			append_dev(section, br3);
    			append_dev(section, t7);
    			append_dev(section, input4);
    			append_dev(section, t8);
    			append_dev(section, br4);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
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

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Inputs", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Inputs> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Inputs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Inputs",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.29.0 */

    const { console: console_1 } = globals;
    const file$3 = "src/App.svelte";

    function create_fragment$3(ctx) {
    	let main;
    	let nbar;
    	let t0;
    	let ddown;
    	let t1;
    	let inputs;
    	let current;
    	nbar = new Nav({ $$inline: true });

    	ddown = new Ddown({
    			props: { fnHandler: /*fnHandler*/ ctx[0] },
    			$$inline: true
    		});

    	inputs = new Inputs({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(nbar.$$.fragment);
    			t0 = space();
    			create_component(ddown.$$.fragment);
    			t1 = space();
    			create_component(inputs.$$.fragment);
    			attr_dev(main, "class", "svelte-ipu353");
    			add_location(main, file$3, 17, 0, 304);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(nbar, main, null);
    			append_dev(main, t0);
    			mount_component(ddown, main, null);
    			append_dev(main, t1);
    			mount_component(inputs, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(nbar.$$.fragment, local);
    			transition_in(ddown.$$.fragment, local);
    			transition_in(inputs.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nbar.$$.fragment, local);
    			transition_out(ddown.$$.fragment, local);
    			transition_out(inputs.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(nbar);
    			destroy_component(ddown);
    			destroy_component(inputs);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);

    	const fnHandler = e => {
    		console.log(e.target.innerText);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Nbar: Nav, Ddown, Inputs, fnHandler });
    	return [fnHandler];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    const app = new App( {
    	target: document.body,
    	props: {}
    } );

    return app;

}());
