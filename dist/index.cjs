let vscode = require("vscode");

//#region node_modules/.pnpm/@reactive-vscode+reactivity@1.0.2/node_modules/@reactive-vscode/reactivity/dist/index.js
/**
* @vue/shared v3.5.32
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
/* @__NO_SIDE_EFFECTS__ */
function makeMap(str) {
	const map = /* @__PURE__ */ Object.create(null);
	for (const key of str.split(",")) map[key] = 1;
	return (val) => val in map;
}
var EMPTY_OBJ = !!(process.env.NODE_ENV !== "production") ? Object.freeze({}) : {};
process.env.NODE_ENV !== "production" && Object.freeze([]);
var extend = Object.assign;
var hasOwnProperty$1 = Object.prototype.hasOwnProperty;
var hasOwn = (val, key) => hasOwnProperty$1.call(val, key);
var isArray = Array.isArray;
var isMap = (val) => toTypeString(val) === "[object Map]";
var isFunction = (val) => typeof val === "function";
var isString = (val) => typeof val === "string";
var isSymbol = (val) => typeof val === "symbol";
var isObject = (val) => val !== null && typeof val === "object";
var objectToString = Object.prototype.toString;
var toTypeString = (value) => objectToString.call(value);
var toRawType = (value) => {
	return toTypeString(value).slice(8, -1);
};
var isIntegerKey = (key) => isString(key) && key !== "NaN" && key[0] !== "-" && "" + parseInt(key, 10) === key;
var cacheStringFunction = (fn) => {
	const cache = /* @__PURE__ */ Object.create(null);
	return ((str) => {
		return cache[str] || (cache[str] = fn(str));
	});
};
var camelizeRE = /-\w/g;
cacheStringFunction((str) => {
	return str.replace(camelizeRE, (c) => c.slice(1).toUpperCase());
});
var hyphenateRE = /\B([A-Z])/g;
cacheStringFunction((str) => str.replace(hyphenateRE, "-$1").toLowerCase());
var capitalize = cacheStringFunction((str) => {
	return str.charAt(0).toUpperCase() + str.slice(1);
});
cacheStringFunction((str) => {
	return str ? `on${capitalize(str)}` : ``;
});
var hasChanged = (value, oldValue) => !Object.is(value, oldValue);
/**
* @vue/reactivity v3.5.32
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
function warn$1(msg, ...args) {
	console.warn(`[Vue warn] ${msg}`, ...args);
}
var activeEffectScope;
var EffectScope = class {
	constructor(detached = false) {
		this.detached = detached;
		/**
		* @internal
		*/
		this._active = true;
		/**
		* @internal track `on` calls, allow `on` call multiple times
		*/
		this._on = 0;
		/**
		* @internal
		*/
		this.effects = [];
		/**
		* @internal
		*/
		this.cleanups = [];
		this._isPaused = false;
		this.__v_skip = true;
		this.parent = activeEffectScope;
		if (!detached && activeEffectScope) this.index = (activeEffectScope.scopes || (activeEffectScope.scopes = [])).push(this) - 1;
	}
	get active() {
		return this._active;
	}
	pause() {
		if (this._active) {
			this._isPaused = true;
			let i, l;
			if (this.scopes) for (i = 0, l = this.scopes.length; i < l; i++) this.scopes[i].pause();
			for (i = 0, l = this.effects.length; i < l; i++) this.effects[i].pause();
		}
	}
	/**
	* Resumes the effect scope, including all child scopes and effects.
	*/
	resume() {
		if (this._active) {
			if (this._isPaused) {
				this._isPaused = false;
				let i, l;
				if (this.scopes) for (i = 0, l = this.scopes.length; i < l; i++) this.scopes[i].resume();
				for (i = 0, l = this.effects.length; i < l; i++) this.effects[i].resume();
			}
		}
	}
	run(fn) {
		if (this._active) {
			const currentEffectScope = activeEffectScope;
			try {
				activeEffectScope = this;
				return fn();
			} finally {
				activeEffectScope = currentEffectScope;
			}
		} else if (!!(process.env.NODE_ENV !== "production")) warn$1(`cannot run an inactive effect scope.`);
	}
	/**
	* This should only be called on non-detached scopes
	* @internal
	*/
	on() {
		if (++this._on === 1) {
			this.prevScope = activeEffectScope;
			activeEffectScope = this;
		}
	}
	/**
	* This should only be called on non-detached scopes
	* @internal
	*/
	off() {
		if (this._on > 0 && --this._on === 0) {
			activeEffectScope = this.prevScope;
			this.prevScope = void 0;
		}
	}
	stop(fromParent) {
		if (this._active) {
			this._active = false;
			let i, l;
			for (i = 0, l = this.effects.length; i < l; i++) this.effects[i].stop();
			this.effects.length = 0;
			for (i = 0, l = this.cleanups.length; i < l; i++) this.cleanups[i]();
			this.cleanups.length = 0;
			if (this.scopes) {
				for (i = 0, l = this.scopes.length; i < l; i++) this.scopes[i].stop(true);
				this.scopes.length = 0;
			}
			if (!this.detached && this.parent && !fromParent) {
				const last = this.parent.scopes.pop();
				if (last && last !== this) {
					this.parent.scopes[this.index] = last;
					last.index = this.index;
				}
			}
			this.parent = void 0;
		}
	}
};
function effectScope(detached) {
	return new EffectScope(detached);
}
function getCurrentScope() {
	return activeEffectScope;
}
var activeSub;
var batchDepth = 0;
var batchedSub;
var batchedComputed;
function batch(sub, isComputed = false) {
	sub.flags |= 8;
	if (isComputed) {
		sub.next = batchedComputed;
		batchedComputed = sub;
		return;
	}
	sub.next = batchedSub;
	batchedSub = sub;
}
function startBatch() {
	batchDepth++;
}
function endBatch() {
	if (--batchDepth > 0) return;
	if (batchedComputed) {
		let e = batchedComputed;
		batchedComputed = void 0;
		while (e) {
			const next = e.next;
			e.next = void 0;
			e.flags &= -9;
			e = next;
		}
	}
	let error;
	while (batchedSub) {
		let e = batchedSub;
		batchedSub = void 0;
		while (e) {
			const next = e.next;
			e.next = void 0;
			e.flags &= -9;
			if (e.flags & 1) try {
				e.trigger();
			} catch (err) {
				if (!error) error = err;
			}
			e = next;
		}
	}
	if (error) throw error;
}
function prepareDeps(sub) {
	for (let link = sub.deps; link; link = link.nextDep) {
		link.version = -1;
		link.prevActiveLink = link.dep.activeLink;
		link.dep.activeLink = link;
	}
}
function cleanupDeps(sub) {
	let head;
	let tail = sub.depsTail;
	let link = tail;
	while (link) {
		const prev = link.prevDep;
		if (link.version === -1) {
			if (link === tail) tail = prev;
			removeSub(link);
			removeDep(link);
		} else head = link;
		link.dep.activeLink = link.prevActiveLink;
		link.prevActiveLink = void 0;
		link = prev;
	}
	sub.deps = head;
	sub.depsTail = tail;
}
function isDirty(sub) {
	for (let link = sub.deps; link; link = link.nextDep) if (link.dep.version !== link.version || link.dep.computed && (refreshComputed(link.dep.computed) || link.dep.version !== link.version)) return true;
	if (sub._dirty) return true;
	return false;
}
function refreshComputed(computed$1) {
	if (computed$1.flags & 4 && !(computed$1.flags & 16)) return;
	computed$1.flags &= -17;
	if (computed$1.globalVersion === globalVersion) return;
	computed$1.globalVersion = globalVersion;
	if (!computed$1.isSSR && computed$1.flags & 128 && (!computed$1.deps && !computed$1._dirty || !isDirty(computed$1))) return;
	computed$1.flags |= 2;
	const dep = computed$1.dep;
	const prevSub = activeSub;
	const prevShouldTrack = shouldTrack;
	activeSub = computed$1;
	shouldTrack = true;
	try {
		prepareDeps(computed$1);
		const value = computed$1.fn(computed$1._value);
		if (dep.version === 0 || hasChanged(value, computed$1._value)) {
			computed$1.flags |= 128;
			computed$1._value = value;
			dep.version++;
		}
	} catch (err) {
		dep.version++;
		throw err;
	} finally {
		activeSub = prevSub;
		shouldTrack = prevShouldTrack;
		cleanupDeps(computed$1);
		computed$1.flags &= -3;
	}
}
function removeSub(link, soft = false) {
	const { dep, prevSub, nextSub } = link;
	if (prevSub) {
		prevSub.nextSub = nextSub;
		link.prevSub = void 0;
	}
	if (nextSub) {
		nextSub.prevSub = prevSub;
		link.nextSub = void 0;
	}
	if (!!(process.env.NODE_ENV !== "production") && dep.subsHead === link) dep.subsHead = nextSub;
	if (dep.subs === link) {
		dep.subs = prevSub;
		if (!prevSub && dep.computed) {
			dep.computed.flags &= -5;
			for (let l = dep.computed.deps; l; l = l.nextDep) removeSub(l, true);
		}
	}
	if (!soft && !--dep.sc && dep.map) dep.map.delete(dep.key);
}
function removeDep(link) {
	const { prevDep, nextDep } = link;
	if (prevDep) {
		prevDep.nextDep = nextDep;
		link.prevDep = void 0;
	}
	if (nextDep) {
		nextDep.prevDep = prevDep;
		link.nextDep = void 0;
	}
}
var shouldTrack = true;
var trackStack = [];
function pauseTracking() {
	trackStack.push(shouldTrack);
	shouldTrack = false;
}
function resetTracking() {
	const last = trackStack.pop();
	shouldTrack = last === void 0 ? true : last;
}
var globalVersion = 0;
var Link = class {
	constructor(sub, dep) {
		this.sub = sub;
		this.dep = dep;
		this.version = dep.version;
		this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
	}
};
var Dep = class {
	constructor(computed$1) {
		this.computed = computed$1;
		this.version = 0;
		/**
		* Link between this dep and the current active effect
		*/
		this.activeLink = void 0;
		/**
		* Doubly linked list representing the subscribing effects (tail)
		*/
		this.subs = void 0;
		/**
		* For object property deps cleanup
		*/
		this.map = void 0;
		this.key = void 0;
		/**
		* Subscriber counter
		*/
		this.sc = 0;
		/**
		* @internal
		*/
		this.__v_skip = true;
		if (!!(process.env.NODE_ENV !== "production")) this.subsHead = void 0;
	}
	track(debugInfo) {
		if (!activeSub || !shouldTrack || activeSub === this.computed) return;
		let link = this.activeLink;
		if (link === void 0 || link.sub !== activeSub) {
			link = this.activeLink = new Link(activeSub, this);
			if (!activeSub.deps) activeSub.deps = activeSub.depsTail = link;
			else {
				link.prevDep = activeSub.depsTail;
				activeSub.depsTail.nextDep = link;
				activeSub.depsTail = link;
			}
			addSub(link);
		} else if (link.version === -1) {
			link.version = this.version;
			if (link.nextDep) {
				const next = link.nextDep;
				next.prevDep = link.prevDep;
				if (link.prevDep) link.prevDep.nextDep = next;
				link.prevDep = activeSub.depsTail;
				link.nextDep = void 0;
				activeSub.depsTail.nextDep = link;
				activeSub.depsTail = link;
				if (activeSub.deps === link) activeSub.deps = next;
			}
		}
		if (!!(process.env.NODE_ENV !== "production") && activeSub.onTrack) activeSub.onTrack(extend({ effect: activeSub }, debugInfo));
		return link;
	}
	trigger(debugInfo) {
		this.version++;
		globalVersion++;
		this.notify(debugInfo);
	}
	notify(debugInfo) {
		startBatch();
		try {
			if (!!(process.env.NODE_ENV !== "production")) {
				for (let head = this.subsHead; head; head = head.nextSub) if (head.sub.onTrigger && !(head.sub.flags & 8)) head.sub.onTrigger(extend({ effect: head.sub }, debugInfo));
			}
			for (let link = this.subs; link; link = link.prevSub) if (link.sub.notify()) link.sub.dep.notify();
		} finally {
			endBatch();
		}
	}
};
function addSub(link) {
	link.dep.sc++;
	if (link.sub.flags & 4) {
		const computed$1 = link.dep.computed;
		if (computed$1 && !link.dep.subs) {
			computed$1.flags |= 20;
			for (let l = computed$1.deps; l; l = l.nextDep) addSub(l);
		}
		const currentTail = link.dep.subs;
		if (currentTail !== link) {
			link.prevSub = currentTail;
			if (currentTail) currentTail.nextSub = link;
		}
		if (!!(process.env.NODE_ENV !== "production") && link.dep.subsHead === void 0) link.dep.subsHead = link;
		link.dep.subs = link;
	}
}
var targetMap = /* @__PURE__ */ new WeakMap();
var ITERATE_KEY = /* @__PURE__ */ Symbol(!!(process.env.NODE_ENV !== "production") ? "Object iterate" : "");
var MAP_KEY_ITERATE_KEY = /* @__PURE__ */ Symbol(!!(process.env.NODE_ENV !== "production") ? "Map keys iterate" : "");
var ARRAY_ITERATE_KEY = /* @__PURE__ */ Symbol(!!(process.env.NODE_ENV !== "production") ? "Array iterate" : "");
function track(target, type, key) {
	if (shouldTrack && activeSub) {
		let depsMap = targetMap.get(target);
		if (!depsMap) targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
		let dep = depsMap.get(key);
		if (!dep) {
			depsMap.set(key, dep = new Dep());
			dep.map = depsMap;
			dep.key = key;
		}
		if (!!(process.env.NODE_ENV !== "production")) dep.track({
			target,
			type,
			key
		});
		else dep.track();
	}
}
function trigger(target, type, key, newValue, oldValue, oldTarget) {
	const depsMap = targetMap.get(target);
	if (!depsMap) {
		globalVersion++;
		return;
	}
	const run = (dep) => {
		if (dep) if (!!(process.env.NODE_ENV !== "production")) dep.trigger({
			target,
			type,
			key,
			newValue,
			oldValue,
			oldTarget
		});
		else dep.trigger();
	};
	startBatch();
	if (type === "clear") depsMap.forEach(run);
	else {
		const targetIsArray = isArray(target);
		const isArrayIndex = targetIsArray && isIntegerKey(key);
		if (targetIsArray && key === "length") {
			const newLength = Number(newValue);
			depsMap.forEach((dep, key2) => {
				if (key2 === "length" || key2 === ARRAY_ITERATE_KEY || !isSymbol(key2) && key2 >= newLength) run(dep);
			});
		} else {
			if (key !== void 0 || depsMap.has(void 0)) run(depsMap.get(key));
			if (isArrayIndex) run(depsMap.get(ARRAY_ITERATE_KEY));
			switch (type) {
				case "add":
					if (!targetIsArray) {
						run(depsMap.get(ITERATE_KEY));
						if (isMap(target)) run(depsMap.get(MAP_KEY_ITERATE_KEY));
					} else if (isArrayIndex) run(depsMap.get("length"));
					break;
				case "delete":
					if (!targetIsArray) {
						run(depsMap.get(ITERATE_KEY));
						if (isMap(target)) run(depsMap.get(MAP_KEY_ITERATE_KEY));
					}
					break;
				case "set":
					if (isMap(target)) run(depsMap.get(ITERATE_KEY));
					break;
			}
		}
	}
	endBatch();
}
function reactiveReadArray(array) {
	const raw = /* @__PURE__ */ toRaw(array);
	if (raw === array) return raw;
	track(raw, "iterate", ARRAY_ITERATE_KEY);
	return /* @__PURE__ */ isShallow(array) ? raw : raw.map(toReactive);
}
function shallowReadArray(arr) {
	track(arr = /* @__PURE__ */ toRaw(arr), "iterate", ARRAY_ITERATE_KEY);
	return arr;
}
function toWrapped(target, item) {
	if (/* @__PURE__ */ isReadonly(target)) return /* @__PURE__ */ isReactive(target) ? toReadonly(toReactive(item)) : toReadonly(item);
	return toReactive(item);
}
var arrayInstrumentations = {
	__proto__: null,
	[Symbol.iterator]() {
		return iterator(this, Symbol.iterator, (item) => toWrapped(this, item));
	},
	concat(...args) {
		return reactiveReadArray(this).concat(...args.map((x$1) => isArray(x$1) ? reactiveReadArray(x$1) : x$1));
	},
	entries() {
		return iterator(this, "entries", (value) => {
			value[1] = toWrapped(this, value[1]);
			return value;
		});
	},
	every(fn, thisArg) {
		return apply(this, "every", fn, thisArg, void 0, arguments);
	},
	filter(fn, thisArg) {
		return apply(this, "filter", fn, thisArg, (v$1) => v$1.map((item) => toWrapped(this, item)), arguments);
	},
	find(fn, thisArg) {
		return apply(this, "find", fn, thisArg, (item) => toWrapped(this, item), arguments);
	},
	findIndex(fn, thisArg) {
		return apply(this, "findIndex", fn, thisArg, void 0, arguments);
	},
	findLast(fn, thisArg) {
		return apply(this, "findLast", fn, thisArg, (item) => toWrapped(this, item), arguments);
	},
	findLastIndex(fn, thisArg) {
		return apply(this, "findLastIndex", fn, thisArg, void 0, arguments);
	},
	forEach(fn, thisArg) {
		return apply(this, "forEach", fn, thisArg, void 0, arguments);
	},
	includes(...args) {
		return searchProxy(this, "includes", args);
	},
	indexOf(...args) {
		return searchProxy(this, "indexOf", args);
	},
	join(separator) {
		return reactiveReadArray(this).join(separator);
	},
	lastIndexOf(...args) {
		return searchProxy(this, "lastIndexOf", args);
	},
	map(fn, thisArg) {
		return apply(this, "map", fn, thisArg, void 0, arguments);
	},
	pop() {
		return noTracking(this, "pop");
	},
	push(...args) {
		return noTracking(this, "push", args);
	},
	reduce(fn, ...args) {
		return reduce(this, "reduce", fn, args);
	},
	reduceRight(fn, ...args) {
		return reduce(this, "reduceRight", fn, args);
	},
	shift() {
		return noTracking(this, "shift");
	},
	some(fn, thisArg) {
		return apply(this, "some", fn, thisArg, void 0, arguments);
	},
	splice(...args) {
		return noTracking(this, "splice", args);
	},
	toReversed() {
		return reactiveReadArray(this).toReversed();
	},
	toSorted(comparer) {
		return reactiveReadArray(this).toSorted(comparer);
	},
	toSpliced(...args) {
		return reactiveReadArray(this).toSpliced(...args);
	},
	unshift(...args) {
		return noTracking(this, "unshift", args);
	},
	values() {
		return iterator(this, "values", (item) => toWrapped(this, item));
	}
};
function iterator(self, method, wrapValue) {
	const arr = shallowReadArray(self);
	const iter = arr[method]();
	if (arr !== self && !/* @__PURE__ */ isShallow(self)) {
		iter._next = iter.next;
		iter.next = () => {
			const result = iter._next();
			if (!result.done) result.value = wrapValue(result.value);
			return result;
		};
	}
	return iter;
}
var arrayProto = Array.prototype;
function apply(self, method, fn, thisArg, wrappedRetFn, args) {
	const arr = shallowReadArray(self);
	const needsWrap = arr !== self && !/* @__PURE__ */ isShallow(self);
	const methodFn = arr[method];
	if (methodFn !== arrayProto[method]) {
		const result2 = methodFn.apply(self, args);
		return needsWrap ? toReactive(result2) : result2;
	}
	let wrappedFn = fn;
	if (arr !== self) {
		if (needsWrap) wrappedFn = function(item, index) {
			return fn.call(this, toWrapped(self, item), index, self);
		};
		else if (fn.length > 2) wrappedFn = function(item, index) {
			return fn.call(this, item, index, self);
		};
	}
	const result = methodFn.call(arr, wrappedFn, thisArg);
	return needsWrap && wrappedRetFn ? wrappedRetFn(result) : result;
}
function reduce(self, method, fn, args) {
	const arr = shallowReadArray(self);
	const needsWrap = arr !== self && !/* @__PURE__ */ isShallow(self);
	let wrappedFn = fn;
	let wrapInitialAccumulator = false;
	if (arr !== self) {
		if (needsWrap) {
			wrapInitialAccumulator = args.length === 0;
			wrappedFn = function(acc, item, index) {
				if (wrapInitialAccumulator) {
					wrapInitialAccumulator = false;
					acc = toWrapped(self, acc);
				}
				return fn.call(this, acc, toWrapped(self, item), index, self);
			};
		} else if (fn.length > 3) wrappedFn = function(acc, item, index) {
			return fn.call(this, acc, item, index, self);
		};
	}
	const result = arr[method](wrappedFn, ...args);
	return wrapInitialAccumulator ? toWrapped(self, result) : result;
}
function searchProxy(self, method, args) {
	const arr = /* @__PURE__ */ toRaw(self);
	track(arr, "iterate", ARRAY_ITERATE_KEY);
	const res = arr[method](...args);
	if ((res === -1 || res === false) && /* @__PURE__ */ isProxy(args[0])) {
		args[0] = /* @__PURE__ */ toRaw(args[0]);
		return arr[method](...args);
	}
	return res;
}
function noTracking(self, method, args = []) {
	pauseTracking();
	startBatch();
	const res = (/* @__PURE__ */ toRaw(self))[method].apply(self, args);
	endBatch();
	resetTracking();
	return res;
}
var isNonTrackableKeys = /* @__PURE__ */ makeMap(`__proto__,__v_isRef,__isVue`);
var builtInSymbols = new Set(/* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((key) => key !== "arguments" && key !== "caller").map((key) => Symbol[key]).filter(isSymbol));
function hasOwnProperty(key) {
	if (!isSymbol(key)) key = String(key);
	const obj = /* @__PURE__ */ toRaw(this);
	track(obj, "has", key);
	return obj.hasOwnProperty(key);
}
var BaseReactiveHandler = class {
	constructor(_isReadonly = false, _isShallow = false) {
		this._isReadonly = _isReadonly;
		this._isShallow = _isShallow;
	}
	get(target, key, receiver) {
		if (key === "__v_skip") return target["__v_skip"];
		const isReadonly2 = this._isReadonly, isShallow2 = this._isShallow;
		if (key === "__v_isReactive") return !isReadonly2;
		else if (key === "__v_isReadonly") return isReadonly2;
		else if (key === "__v_isShallow") return isShallow2;
		else if (key === "__v_raw") {
			if (receiver === (isReadonly2 ? isShallow2 ? shallowReadonlyMap : readonlyMap : isShallow2 ? shallowReactiveMap : reactiveMap).get(target) || Object.getPrototypeOf(target) === Object.getPrototypeOf(receiver)) return target;
			return;
		}
		const targetIsArray = isArray(target);
		if (!isReadonly2) {
			let fn;
			if (targetIsArray && (fn = arrayInstrumentations[key])) return fn;
			if (key === "hasOwnProperty") return hasOwnProperty;
		}
		const res = Reflect.get(target, key, /* @__PURE__ */ isRef(target) ? target : receiver);
		if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) return res;
		if (!isReadonly2) track(target, "get", key);
		if (isShallow2) return res;
		if (/* @__PURE__ */ isRef(res)) {
			const value = targetIsArray && isIntegerKey(key) ? res : res.value;
			return isReadonly2 && isObject(value) ? /* @__PURE__ */ readonly(value) : value;
		}
		if (isObject(res)) return isReadonly2 ? /* @__PURE__ */ readonly(res) : /* @__PURE__ */ reactive(res);
		return res;
	}
};
var MutableReactiveHandler = class extends BaseReactiveHandler {
	constructor(isShallow2 = false) {
		super(false, isShallow2);
	}
	set(target, key, value, receiver) {
		let oldValue = target[key];
		const isArrayWithIntegerKey = isArray(target) && isIntegerKey(key);
		if (!this._isShallow) {
			const isOldValueReadonly = /* @__PURE__ */ isReadonly(oldValue);
			if (!/* @__PURE__ */ isShallow(value) && !/* @__PURE__ */ isReadonly(value)) {
				oldValue = /* @__PURE__ */ toRaw(oldValue);
				value = /* @__PURE__ */ toRaw(value);
			}
			if (!isArrayWithIntegerKey && /* @__PURE__ */ isRef(oldValue) && !/* @__PURE__ */ isRef(value)) if (isOldValueReadonly) {
				if (!!(process.env.NODE_ENV !== "production")) warn$1(`Set operation on key "${String(key)}" failed: target is readonly.`, target[key]);
				return true;
			} else {
				oldValue.value = value;
				return true;
			}
		}
		const hadKey = isArrayWithIntegerKey ? Number(key) < target.length : hasOwn(target, key);
		const result = Reflect.set(target, key, value, /* @__PURE__ */ isRef(target) ? target : receiver);
		if (target === /* @__PURE__ */ toRaw(receiver)) {
			if (!hadKey) trigger(target, "add", key, value);
			else if (hasChanged(value, oldValue)) trigger(target, "set", key, value, oldValue);
		}
		return result;
	}
	deleteProperty(target, key) {
		const hadKey = hasOwn(target, key);
		const oldValue = target[key];
		const result = Reflect.deleteProperty(target, key);
		if (result && hadKey) trigger(target, "delete", key, void 0, oldValue);
		return result;
	}
	has(target, key) {
		const result = Reflect.has(target, key);
		if (!isSymbol(key) || !builtInSymbols.has(key)) track(target, "has", key);
		return result;
	}
	ownKeys(target) {
		track(target, "iterate", isArray(target) ? "length" : ITERATE_KEY);
		return Reflect.ownKeys(target);
	}
};
var ReadonlyReactiveHandler = class extends BaseReactiveHandler {
	constructor(isShallow2 = false) {
		super(true, isShallow2);
	}
	set(target, key) {
		if (!!(process.env.NODE_ENV !== "production")) warn$1(`Set operation on key "${String(key)}" failed: target is readonly.`, target);
		return true;
	}
	deleteProperty(target, key) {
		if (!!(process.env.NODE_ENV !== "production")) warn$1(`Delete operation on key "${String(key)}" failed: target is readonly.`, target);
		return true;
	}
};
var mutableHandlers = /* @__PURE__ */ new MutableReactiveHandler();
var readonlyHandlers = /* @__PURE__ */ new ReadonlyReactiveHandler();
var toShallow = (value) => value;
var getProto = (v$1) => Reflect.getPrototypeOf(v$1);
function createIterableMethod(method, isReadonly2, isShallow2) {
	return function(...args) {
		const target = this["__v_raw"];
		const rawTarget = /* @__PURE__ */ toRaw(target);
		const targetIsMap = isMap(rawTarget);
		const isPair = method === "entries" || method === Symbol.iterator && targetIsMap;
		const isKeyOnly = method === "keys" && targetIsMap;
		const innerIterator = target[method](...args);
		const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
		!isReadonly2 && track(rawTarget, "iterate", isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY);
		return extend(Object.create(innerIterator), { next() {
			const { value, done } = innerIterator.next();
			return done ? {
				value,
				done
			} : {
				value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
				done
			};
		} });
	};
}
function createReadonlyMethod(type) {
	return function(...args) {
		if (!!(process.env.NODE_ENV !== "production")) {
			const key = args[0] ? `on key "${args[0]}" ` : ``;
			warn$1(`${capitalize(type)} operation ${key}failed: target is readonly.`, /* @__PURE__ */ toRaw(this));
		}
		return type === "delete" ? false : type === "clear" ? void 0 : this;
	};
}
function createInstrumentations(readonly$1, shallow) {
	const instrumentations = {
		get(key) {
			const target = this["__v_raw"];
			const rawTarget = /* @__PURE__ */ toRaw(target);
			const rawKey = /* @__PURE__ */ toRaw(key);
			if (!readonly$1) {
				if (hasChanged(key, rawKey)) track(rawTarget, "get", key);
				track(rawTarget, "get", rawKey);
			}
			const { has } = getProto(rawTarget);
			const wrap = shallow ? toShallow : readonly$1 ? toReadonly : toReactive;
			if (has.call(rawTarget, key)) return wrap(target.get(key));
			else if (has.call(rawTarget, rawKey)) return wrap(target.get(rawKey));
			else if (target !== rawTarget) target.get(key);
		},
		get size() {
			const target = this["__v_raw"];
			!readonly$1 && track(/* @__PURE__ */ toRaw(target), "iterate", ITERATE_KEY);
			return target.size;
		},
		has(key) {
			const target = this["__v_raw"];
			const rawTarget = /* @__PURE__ */ toRaw(target);
			const rawKey = /* @__PURE__ */ toRaw(key);
			if (!readonly$1) {
				if (hasChanged(key, rawKey)) track(rawTarget, "has", key);
				track(rawTarget, "has", rawKey);
			}
			return key === rawKey ? target.has(key) : target.has(key) || target.has(rawKey);
		},
		forEach(callback, thisArg) {
			const observed = this;
			const target = observed["__v_raw"];
			const rawTarget = /* @__PURE__ */ toRaw(target);
			const wrap = shallow ? toShallow : readonly$1 ? toReadonly : toReactive;
			!readonly$1 && track(rawTarget, "iterate", ITERATE_KEY);
			return target.forEach((value, key) => {
				return callback.call(thisArg, wrap(value), wrap(key), observed);
			});
		}
	};
	extend(instrumentations, readonly$1 ? {
		add: createReadonlyMethod("add"),
		set: createReadonlyMethod("set"),
		delete: createReadonlyMethod("delete"),
		clear: createReadonlyMethod("clear")
	} : {
		add(value) {
			const target = /* @__PURE__ */ toRaw(this);
			const proto = getProto(target);
			const rawValue = /* @__PURE__ */ toRaw(value);
			const valueToAdd = !shallow && !/* @__PURE__ */ isShallow(value) && !/* @__PURE__ */ isReadonly(value) ? rawValue : value;
			if (!(proto.has.call(target, valueToAdd) || hasChanged(value, valueToAdd) && proto.has.call(target, value) || hasChanged(rawValue, valueToAdd) && proto.has.call(target, rawValue))) {
				target.add(valueToAdd);
				trigger(target, "add", valueToAdd, valueToAdd);
			}
			return this;
		},
		set(key, value) {
			if (!shallow && !/* @__PURE__ */ isShallow(value) && !/* @__PURE__ */ isReadonly(value)) value = /* @__PURE__ */ toRaw(value);
			const target = /* @__PURE__ */ toRaw(this);
			const { has, get } = getProto(target);
			let hadKey = has.call(target, key);
			if (!hadKey) {
				key = /* @__PURE__ */ toRaw(key);
				hadKey = has.call(target, key);
			} else if (!!(process.env.NODE_ENV !== "production")) checkIdentityKeys(target, has, key);
			const oldValue = get.call(target, key);
			target.set(key, value);
			if (!hadKey) trigger(target, "add", key, value);
			else if (hasChanged(value, oldValue)) trigger(target, "set", key, value, oldValue);
			return this;
		},
		delete(key) {
			const target = /* @__PURE__ */ toRaw(this);
			const { has, get } = getProto(target);
			let hadKey = has.call(target, key);
			if (!hadKey) {
				key = /* @__PURE__ */ toRaw(key);
				hadKey = has.call(target, key);
			} else if (!!(process.env.NODE_ENV !== "production")) checkIdentityKeys(target, has, key);
			const oldValue = get ? get.call(target, key) : void 0;
			const result = target.delete(key);
			if (hadKey) trigger(target, "delete", key, void 0, oldValue);
			return result;
		},
		clear() {
			const target = /* @__PURE__ */ toRaw(this);
			const hadItems = target.size !== 0;
			const oldTarget = !!(process.env.NODE_ENV !== "production") ? isMap(target) ? new Map(target) : new Set(target) : void 0;
			const result = target.clear();
			if (hadItems) trigger(target, "clear", void 0, void 0, oldTarget);
			return result;
		}
	});
	[
		"keys",
		"values",
		"entries",
		Symbol.iterator
	].forEach((method) => {
		instrumentations[method] = createIterableMethod(method, readonly$1, shallow);
	});
	return instrumentations;
}
function createInstrumentationGetter(isReadonly2, shallow) {
	const instrumentations = createInstrumentations(isReadonly2, shallow);
	return (target, key, receiver) => {
		if (key === "__v_isReactive") return !isReadonly2;
		else if (key === "__v_isReadonly") return isReadonly2;
		else if (key === "__v_raw") return target;
		return Reflect.get(hasOwn(instrumentations, key) && key in target ? instrumentations : target, key, receiver);
	};
}
var mutableCollectionHandlers = { get: /* @__PURE__ */ createInstrumentationGetter(false, false) };
var readonlyCollectionHandlers = { get: /* @__PURE__ */ createInstrumentationGetter(true, false) };
function checkIdentityKeys(target, has, key) {
	const rawKey = /* @__PURE__ */ toRaw(key);
	if (rawKey !== key && has.call(target, rawKey)) {
		const type = toRawType(target);
		warn$1(`Reactive ${type} contains both the raw and reactive versions of the same object${type === `Map` ? ` as keys` : ``}, which can lead to inconsistencies. Avoid differentiating between the raw and reactive versions of an object and only use the reactive version if possible.`);
	}
}
var reactiveMap = /* @__PURE__ */ new WeakMap();
var shallowReactiveMap = /* @__PURE__ */ new WeakMap();
var readonlyMap = /* @__PURE__ */ new WeakMap();
var shallowReadonlyMap = /* @__PURE__ */ new WeakMap();
function targetTypeMap(rawType) {
	switch (rawType) {
		case "Object":
		case "Array": return 1;
		case "Map":
		case "Set":
		case "WeakMap":
		case "WeakSet": return 2;
		default: return 0;
	}
}
function getTargetType(value) {
	return value["__v_skip"] || !Object.isExtensible(value) ? 0 : targetTypeMap(toRawType(value));
}
/* @__NO_SIDE_EFFECTS__ */
function reactive(target) {
	if (/* @__PURE__ */ isReadonly(target)) return target;
	return createReactiveObject(target, false, mutableHandlers, mutableCollectionHandlers, reactiveMap);
}
/* @__NO_SIDE_EFFECTS__ */
function readonly(target) {
	return createReactiveObject(target, true, readonlyHandlers, readonlyCollectionHandlers, readonlyMap);
}
function createReactiveObject(target, isReadonly2, baseHandlers, collectionHandlers, proxyMap) {
	if (!isObject(target)) {
		if (!!(process.env.NODE_ENV !== "production")) warn$1(`value cannot be made ${isReadonly2 ? "readonly" : "reactive"}: ${String(target)}`);
		return target;
	}
	if (target["__v_raw"] && !(isReadonly2 && target["__v_isReactive"])) return target;
	const targetType = getTargetType(target);
	if (targetType === 0) return target;
	const existingProxy = proxyMap.get(target);
	if (existingProxy) return existingProxy;
	const proxy = new Proxy(target, targetType === 2 ? collectionHandlers : baseHandlers);
	proxyMap.set(target, proxy);
	return proxy;
}
/* @__NO_SIDE_EFFECTS__ */
function isReactive(value) {
	if (/* @__PURE__ */ isReadonly(value)) return /* @__PURE__ */ isReactive(value["__v_raw"]);
	return !!(value && value["__v_isReactive"]);
}
/* @__NO_SIDE_EFFECTS__ */
function isReadonly(value) {
	return !!(value && value["__v_isReadonly"]);
}
/* @__NO_SIDE_EFFECTS__ */
function isShallow(value) {
	return !!(value && value["__v_isShallow"]);
}
/* @__NO_SIDE_EFFECTS__ */
function isProxy(value) {
	return value ? !!value["__v_raw"] : false;
}
/* @__NO_SIDE_EFFECTS__ */
function toRaw(observed) {
	const raw = observed && observed["__v_raw"];
	return raw ? /* @__PURE__ */ toRaw(raw) : observed;
}
var toReactive = (value) => isObject(value) ? /* @__PURE__ */ reactive(value) : value;
var toReadonly = (value) => isObject(value) ? /* @__PURE__ */ readonly(value) : value;
/* @__NO_SIDE_EFFECTS__ */
function isRef(r) {
	return r ? r["__v_isRef"] === true : false;
}
/* @__NO_SIDE_EFFECTS__ */
function shallowRef(value) {
	return createRef(value, true);
}
function createRef(rawValue, shallow) {
	if (/* @__PURE__ */ isRef(rawValue)) return rawValue;
	return new RefImpl(rawValue, shallow);
}
var RefImpl = class {
	constructor(value, isShallow2) {
		this.dep = new Dep();
		this["__v_isRef"] = true;
		this["__v_isShallow"] = false;
		this._rawValue = isShallow2 ? value : /* @__PURE__ */ toRaw(value);
		this._value = isShallow2 ? value : toReactive(value);
		this["__v_isShallow"] = isShallow2;
	}
	get value() {
		if (!!(process.env.NODE_ENV !== "production")) this.dep.track({
			target: this,
			type: "get",
			key: "value"
		});
		else this.dep.track();
		return this._value;
	}
	set value(newValue) {
		const oldValue = this._rawValue;
		const useDirectValue = this["__v_isShallow"] || /* @__PURE__ */ isShallow(newValue) || /* @__PURE__ */ isReadonly(newValue);
		newValue = useDirectValue ? newValue : /* @__PURE__ */ toRaw(newValue);
		if (hasChanged(newValue, oldValue)) {
			this._rawValue = newValue;
			this._value = useDirectValue ? newValue : toReactive(newValue);
			if (!!(process.env.NODE_ENV !== "production")) this.dep.trigger({
				target: this,
				type: "set",
				key: "value",
				newValue,
				oldValue
			});
			else this.dep.trigger();
		}
	}
};
var ComputedRefImpl = class {
	constructor(fn, setter, isSSR) {
		this.fn = fn;
		this.setter = setter;
		/**
		* @internal
		*/
		this._value = void 0;
		/**
		* @internal
		*/
		this.dep = new Dep(this);
		/**
		* @internal
		*/
		this.__v_isRef = true;
		/**
		* @internal
		*/
		this.deps = void 0;
		/**
		* @internal
		*/
		this.depsTail = void 0;
		/**
		* @internal
		*/
		this.flags = 16;
		/**
		* @internal
		*/
		this.globalVersion = globalVersion - 1;
		/**
		* @internal
		*/
		this.next = void 0;
		this.effect = this;
		this["__v_isReadonly"] = !setter;
		this.isSSR = isSSR;
	}
	/**
	* @internal
	*/
	notify() {
		this.flags |= 16;
		if (!(this.flags & 8) && activeSub !== this) {
			batch(this, true);
			return true;
		} else if (!!(process.env.NODE_ENV !== "production"));
	}
	get value() {
		const link = !!(process.env.NODE_ENV !== "production") ? this.dep.track({
			target: this,
			type: "get",
			key: "value"
		}) : this.dep.track();
		refreshComputed(this);
		if (link) link.version = this.dep.version;
		return this._value;
	}
	set value(newValue) {
		if (this.setter) this.setter(newValue);
		else if (!!(process.env.NODE_ENV !== "production")) warn$1("Write operation failed: computed value is readonly");
	}
};
/* @__NO_SIDE_EFFECTS__ */
function computed(getterOrOptions, debugOptions, isSSR = false) {
	let getter;
	let setter;
	if (isFunction(getterOrOptions)) getter = getterOrOptions;
	else {
		getter = getterOrOptions.get;
		setter = getterOrOptions.set;
	}
	const cRef = new ComputedRefImpl(getter, setter, isSSR);
	if (!!(process.env.NODE_ENV !== "production") && debugOptions && !isSSR) {
		cRef.onTrack = debugOptions.onTrack;
		cRef.onTrigger = debugOptions.onTrigger;
	}
	return cRef;
}
var LifecycleHooks = /* @__PURE__ */ function(LifecycleHooks$1) {
	LifecycleHooks$1["ACTIVATED"] = "a";
	LifecycleHooks$1["DEACTIVATED"] = "da";
	return LifecycleHooks$1;
}({});
var ErrorCodes = /* @__PURE__ */ function(ErrorCodes$1) {
	ErrorCodes$1[ErrorCodes$1["WATCH_GETTER"] = 0] = "WATCH_GETTER";
	ErrorCodes$1[ErrorCodes$1["WATCH_CALLBACK"] = 1] = "WATCH_CALLBACK";
	ErrorCodes$1[ErrorCodes$1["WATCH_CLEANUP"] = 2] = "WATCH_CLEANUP";
	ErrorCodes$1[ErrorCodes$1["APP_ERROR_HANDLER"] = 3] = "APP_ERROR_HANDLER";
	ErrorCodes$1[ErrorCodes$1["SCHEDULER"] = 4] = "SCHEDULER";
	return ErrorCodes$1;
}({});
var ErrorTypeStrings = {
	[LifecycleHooks.ACTIVATED]: "activated hook",
	[LifecycleHooks.DEACTIVATED]: "deactivated hook",
	[ErrorCodes.WATCH_GETTER]: "watcher getter",
	[ErrorCodes.WATCH_CALLBACK]: "watcher callback",
	[ErrorCodes.WATCH_CLEANUP]: "watcher cleanup function",
	[ErrorCodes.APP_ERROR_HANDLER]: "app errorHandler",
	[ErrorCodes.SCHEDULER]: "scheduler flush"
};

//#endregion
//#region node_modules/.pnpm/reactive-vscode@1.0.2_@types+vscode@1.120.0/node_modules/reactive-vscode/dist/index.js
var w = [];
var T = shallowRef(null), E = effectScope();
function ie(e) {
	return {
		activate: (t) => (T.value = t, E.run(() => (D.forEach((e$1) => e$1(t)), e(t)))),
		deactivate: async () => {
			await Promise.allSettled(w.map((e$1) => e$1())), E.stop();
		}
	};
}
var D = [];
function j(e) {
	let t = !1, n = !1, r;
	return () => {
		if (!n) {
			if (t) throw Error("Cannot call a singleton composable recursively.");
			try {
				t = !0, r = E.run(e);
			} finally {
				t = !1, n = !0;
			}
		}
		return r;
	};
}
function M(e) {
	return (getCurrentScope() ?? E).cleanups.push(e.dispose.bind(e)), e;
}
var N = j(() => {
	let e = shallowRef(vscode.window.activeColorTheme);
	return M(vscode.window.onDidChangeActiveColorTheme((t) => {
		e.value = t;
	})), e;
}), se = j(() => {
	let t = shallowRef(vscode.debug.activeDebugSession);
	return M(vscode.debug.onDidChangeActiveDebugSession((e) => {
		t.value = e;
	})), computed(() => t.value);
}), ce = j(() => {
	let e = shallowRef(vscode.window.activeNotebookEditor);
	return M(vscode.window.onDidChangeActiveNotebookEditor((t) => {
		e.value = t;
	})), e;
}), le = j(() => {
	let e = shallowRef(vscode.window.activeTerminal);
	return M(vscode.window.onDidChangeActiveTerminal((t) => {
		e.value = t;
	})), e;
}), ue = j(() => {
	let t = shallowRef(vscode.window.activeTextEditor);
	return M(vscode.window.onDidChangeActiveTextEditor((e) => {
		t.value = e;
	})), computed(() => t.value);
}), de = j(() => {
	let t = shallowRef(vscode.extensions.all);
	return M(vscode.extensions.onDidChange(() => {
		t.value = vscode.extensions.all;
	})), computed(() => t.value);
});
var V = j(() => {
	let t = shallowRef(vscode.env.shell);
	return M(vscode.env.onDidChangeShell((e) => {
		t.value = e;
	})), computed(() => t.value);
});
var ge = j(() => {
	let t = N();
	return computed(() => t.value.kind === vscode.ColorThemeKind.Dark || t.value.kind === vscode.ColorThemeKind.HighContrast);
}), _e = j(() => {
	let t = shallowRef(vscode.env.isTelemetryEnabled);
	return M(vscode.env.onDidChangeTelemetryEnabled((e) => {
		t.value = e;
	})), computed(() => t.value);
});
var ye = j(() => {
	let t = shallowRef(vscode.lm.tools);
	return M(vscode.lm.onDidChangeChatModels(() => {
		t.value = vscode.lm.tools;
	})), computed(() => t.value);
}), be = j(() => {
	let t = shallowRef(vscode.env.logLevel);
	return M(vscode.env.onDidChangeLogLevel((e) => {
		t.value = e;
	})), computed(() => t.value);
});
var Ce = j(() => {
	let e = shallowRef(vscode.window.terminals);
	function t() {
		e.value = vscode.window.terminals;
	}
	return M(vscode.window.onDidOpenTerminal(t)), M(vscode.window.onDidCloseTerminal(t)), e;
});
var Ee = j(() => {
	let t = shallowRef(vscode.tasks.taskExecutions);
	function n() {
		t.value = vscode.tasks.taskExecutions;
	}
	return M(vscode.tasks.onDidStartTask(n)), M(vscode.tasks.onDidEndTask(n)), computed(() => t.value);
});
var Me = j(() => {
	let t = shallowRef(vscode.window.visibleNotebookEditors);
	return M(vscode.window.onDidChangeVisibleNotebookEditors((e) => {
		t.value = e;
	})), computed(() => t.value);
}), Ne = j(() => {
	let t = shallowRef(vscode.window.visibleTextEditors);
	return M(vscode.window.onDidChangeVisibleTextEditors((e) => {
		t.value = e;
	})), computed(() => t.value);
});
var $ = j(() => {
	let t = shallowRef(vscode.window.state);
	return M(vscode.window.onDidChangeWindowState((e) => {
		t.value = e;
	})), {
		focused: computed(() => t.value.focused),
		active: computed(() => t.value.active)
	};
}), Le = j(() => $().active), Re = j(() => $().focused), ze = j(() => {
	let t = shallowRef(vscode.workspace.workspaceFolders);
	return M(vscode.workspace.onDidChangeWorkspaceFolders(() => {
		t.value = vscode.workspace.workspaceFolders;
	})), computed(() => t.value);
});

//#endregion
//#region src/index.ts
const HEX_RE = /(?<![\w#])#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{4}|[0-9a-f]{3})(?![0-9a-f])/gi;
const FUNC_RE = /\b(?:rgba?|hsla?)\([^)]*\)/gi;
function clamp01(n) {
	return Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0));
}
function parseHex(hex) {
	let h$1 = hex.slice(1);
	if (h$1.length === 3 || h$1.length === 4) h$1 = h$1.split("").map((c) => c + c).join("");
	if (h$1.length !== 6 && h$1.length !== 8) return void 0;
	return new vscode.Color(Number.parseInt(h$1.slice(0, 2), 16) / 255, Number.parseInt(h$1.slice(2, 4), 16) / 255, Number.parseInt(h$1.slice(4, 6), 16) / 255, h$1.length === 8 ? Number.parseInt(h$1.slice(6, 8), 16) / 255 : 1);
}
function channel(token, max) {
	const t = token.trim();
	return t.endsWith("%") ? clamp01(Number.parseFloat(t) / 100) : clamp01(Number.parseFloat(t) / max);
}
function alpha(token) {
	const t = token.trim();
	return t.endsWith("%") ? clamp01(Number.parseFloat(t) / 100) : clamp01(Number.parseFloat(t));
}
function hslToRgb(h$1, s, l) {
	h$1 = (h$1 % 360 + 360) % 360 / 360;
	if (s === 0) return [
		l,
		l,
		l
	];
	const q = l < .5 ? l * (1 + s) : l + s - l * s;
	const p = 2 * l - q;
	const hue = (t) => {
		if (t < 0) t += 1;
		if (t > 1) t -= 1;
		if (t < 1 / 6) return p + (q - p) * 6 * t;
		if (t < 1 / 2) return q;
		if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
		return p;
	};
	return [
		hue(h$1 + 1 / 3),
		hue(h$1),
		hue(h$1 - 1 / 3)
	];
}
function parseFunc(text) {
	const isHsl = /^hsl/i.test(text);
	const [body, slashAlpha] = text.slice(text.indexOf("(") + 1, text.lastIndexOf(")")).split("/");
	const parts = body.trim().split(/[\s,]+/).filter(Boolean);
	if (parts.length < 3) return void 0;
	let r, g$1, b$1;
	if (isHsl) [r, g$1, b$1] = hslToRgb(Number.parseFloat(parts[0]), channel(parts[1], 100), channel(parts[2], 100));
	else {
		r = channel(parts[0], 255);
		g$1 = channel(parts[1], 255);
		b$1 = channel(parts[2], 255);
	}
	const alphaToken = slashAlpha ?? parts[3];
	return new vscode.Color(r, g$1, b$1, alphaToken === void 0 ? 1 : alpha(alphaToken));
}
function scanColors(document) {
	const text = document.getText();
	const colors = [];
	const add = (index, raw, color) => {
		if (!color) return;
		const range = new vscode.Range(document.positionAt(index), document.positionAt(index + raw.length));
		colors.push(new vscode.ColorInformation(range, color));
	};
	for (const m$1 of text.matchAll(HEX_RE)) add(m$1.index, m$1[0], parseHex(m$1[0]));
	for (const m$1 of text.matchAll(FUNC_RE)) add(m$1.index, m$1[0], parseFunc(m$1[0]));
	return colors;
}
function round(n) {
	return Math.round(n * 100) / 100;
}
function toHex(c) {
	const h$1 = (n) => Math.round(clamp01(n) * 255).toString(16).padStart(2, "0");
	const base = `#${h$1(c.red)}${h$1(c.green)}${h$1(c.blue)}`;
	return c.alpha < 1 ? `${base}${h$1(c.alpha)}` : base;
}
function toRgb(c) {
	const v$1 = (n) => Math.round(clamp01(n) * 255);
	return c.alpha < 1 ? `rgba(${v$1(c.red)}, ${v$1(c.green)}, ${v$1(c.blue)}, ${round(c.alpha)})` : `rgb(${v$1(c.red)}, ${v$1(c.green)}, ${v$1(c.blue)})`;
}
function rgbToHsl(r, g$1, b$1) {
	const max = Math.max(r, g$1, b$1);
	const min = Math.min(r, g$1, b$1);
	const l = (max + min) / 2;
	let h$1 = 0;
	let s = 0;
	if (max !== min) {
		const d = max - min;
		s = l > .5 ? d / (2 - max - min) : d / (max + min);
		if (max === r) h$1 = (g$1 - b$1) / d + (g$1 < b$1 ? 6 : 0);
		else if (max === g$1) h$1 = (b$1 - r) / d + 2;
		else h$1 = (r - g$1) / d + 4;
		h$1 /= 6;
	}
	return [
		Math.round(h$1 * 360),
		Math.round(s * 100),
		Math.round(l * 100)
	];
}
function toHsl(c) {
	const [h$1, s, l] = rgbToHsl(c.red, c.green, c.blue);
	return c.alpha < 1 ? `hsla(${h$1}, ${s}%, ${l}%, ${round(c.alpha)})` : `hsl(${h$1}, ${s}%, ${l}%)`;
}
const probing = /* @__PURE__ */ new Set();
const provider = {
	async provideDocumentColors(document, token) {
		if (!vscode.workspace.getConfiguration("colorProviderEverywhere").get("enabled", true)) return [];
		const key = document.uri.toString();
		if (probing.has(key)) return [];
		probing.add(key);
		try {
			const existing = await vscode.commands.executeCommand("vscode.executeDocumentColorProvider", document.uri);
			if (token.isCancellationRequested) return [];
			if (existing && existing.length > 0) return [];
			return scanColors(document);
		} finally {
			probing.delete(key);
		}
	},
	provideColorPresentations(color, _context) {
		return [
			toHex(color),
			toRgb(color),
			toHsl(color)
		].map((label) => new vscode.ColorPresentation(label));
	}
};
const { activate, deactivate } = ie(() => {
	M(vscode.languages.registerColorProvider("*", provider));
});

//#endregion
exports.activate = activate;
exports.deactivate = deactivate;
//# sourceMappingURL=index.cjs.map