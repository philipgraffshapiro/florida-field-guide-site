/*! Leaflet 1.9.4; locally maintained modular distribution. See vendor/README.md and license notice. */
"use strict";
var lf_t = {};
function lf_l(t) {
  for (var e, i, n = 1, o = arguments.length; n < o; n++)
    for (e in (i = arguments[n])) t[e] = i[e];
  return t;
}
var lf_R =
  Object.create ||
  function (t) {
    return (lf_N.prototype = t), new lf_N();
  };
function lf_N() {}
function lf_a(t, e) {
  var i,
    n = Array.prototype.slice;
  return t.bind
    ? t.bind.apply(t, n.call(arguments, 1))
    : ((i = n.call(arguments, 2)),
      function () {
        return t.apply(e, i.length ? i.concat(n.call(arguments)) : arguments);
      });
}
var lf_D = 0;
function lf_h(t) {
  return "_leaflet_id" in t || (t._leaflet_id = ++lf_D), t._leaflet_id;
}
function lf_j(t, e, i) {
  var n,
    o,
    s = function () {
      (n = !1), o && (r.apply(i, o), (o = !1));
    },
    r = function () {
      n ? (o = arguments) : (t.apply(i, arguments), setTimeout(s, e), (n = !0));
    };
  return r;
}
function lf_H(t, e, i) {
  var n = e[1],
    e = e[0],
    o = n - e;
  return t === n && i ? t : ((((t - e) % o) + o) % o) + e;
}
function lf_u() {
  return !1;
}
function lf_i(t, e) {
  return !1 === e
    ? t
    : ((e = Math.pow(10, void 0 === e ? 6 : e)), Math.round(t * e) / e);
}
function lf_W(t) {
  return t.trim ? t.trim() : t.replace(/^\s+|\s+$/g, "");
}
function lf_F(t) {
  return lf_W(t).split(/\s+/);
}
function lf_c(t, e) {
  for (var i in (Object.prototype.hasOwnProperty.call(t, "options") ||
    (t.options = t.options ? lf_R(t.options) : {}),
  e))
    t.options[i] = e[i];
  return t.options;
}
function lf_U(t, e, i) {
  var n,
    o = [];
  for (n in t)
    o.push(
      encodeURIComponent(i ? n.toUpperCase() : n) +
        "=" +
        encodeURIComponent(t[n]),
    );
  return (e && -1 !== e.indexOf("?") ? "&" : "?") + o.join("&");
}
var lf_V = /\{ *([\w_ -]+) *\}/g;
function lf_q(t, i) {
  return t.replace(lf_V, function (t, e) {
    e = i[e];
    if (void 0 === e) throw new Error("No value provided for variable " + t);
    return (e = "function" == typeof e ? e(i) : e);
  });
}
var lf_d =
  Array.isArray ||
  function (t) {
    return "[object Array]" === Object.prototype.toString.call(t);
  };
function lf_G(t, e) {
  for (var i = 0; i < t.length; i++) if (t[i] === e) return i;
  return -1;
}
var lf_K = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
function lf_Y(t) {
  return window["webkit" + t] || window["moz" + t] || window["ms" + t];
}
var lf_X = 0;
function lf_J(t) {
  var e = +new Date(),
    i = Math.max(0, 16 - (e - lf_X));
  return (lf_X = e + i), window.setTimeout(t, i);
}
var lf_$ =
  window.requestAnimationFrame || lf_Y("RequestAnimationFrame") || lf_J;
var lf_Q =
  window.cancelAnimationFrame ||
  lf_Y("CancelAnimationFrame") ||
  lf_Y("CancelRequestAnimationFrame") ||
  function (t) {
    window.clearTimeout(t);
  };
function lf_x(t, e, i) {
  if (!i || lf_$ !== lf_J) return lf_$.call(window, lf_a(t, e));
  t.call(e);
}
function lf_r(t) {
  t && lf_Q.call(window, t);
}
var lf_tt = {
  __proto__: null,
  extend: lf_l,
  create: lf_R,
  bind: lf_a,
  get lastId() {
    return lf_D;
  },
  stamp: lf_h,
  throttle: lf_j,
  wrapNum: lf_H,
  falseFn: lf_u,
  formatNum: lf_i,
  trim: lf_W,
  splitWords: lf_F,
  setOptions: lf_c,
  getParamString: lf_U,
  template: lf_q,
  isArray: lf_d,
  indexOf: lf_G,
  emptyImageUrl: lf_K,
  requestFn: lf_$,
  cancelFn: lf_Q,
  requestAnimFrame: lf_x,
  cancelAnimFrame: lf_r,
};
function lf_et() {}
lf_et.extend = function (t) {
  function e() {
    lf_c(this),
      this.initialize && this.initialize.apply(this, arguments),
      this.callInitHooks();
  }
  var i,
    n = (e.__super__ = this.prototype),
    o = lf_R(n);
  for (i in (((o.constructor = e).prototype = o), this))
    Object.prototype.hasOwnProperty.call(this, i) &&
      "prototype" !== i &&
      "__super__" !== i &&
      (e[i] = this[i]);
  if ((t.statics && lf_l(e, t.statics), t.includes)) {
    var s = t.includes;
    if ("undefined" != typeof L && L && L.Mixin) {
      s = lf_d(s) ? s : [s];
      for (var r = 0; r < s.length; r++)
        s[r] === L.Mixin.Events &&
          console.warn(
            "Deprecated include of L.Mixin.Events: this property will be removed in future releases, please inherit from L.Evented instead.",
            new Error().stack,
          );
    }
    lf_l.apply(null, [o].concat(t.includes));
  }
  return (
    lf_l(o, t),
    delete o.statics,
    delete o.includes,
    o.options &&
      ((o.options = n.options ? lf_R(n.options) : {}),
      lf_l(o.options, t.options)),
    (o._initHooks = []),
    (o.callInitHooks = function () {
      if (!this._initHooksCalled) {
        n.callInitHooks && n.callInitHooks.call(this),
          (this._initHooksCalled = !0);
        for (var t = 0, e = o._initHooks.length; t < e; t++)
          o._initHooks[t].call(this);
      }
    }),
    e
  );
};
lf_et.include = function (t) {
  var e = this.prototype.options;
  return (
    lf_l(this.prototype, t),
    t.options && ((this.prototype.options = e), this.mergeOptions(t.options)),
    this
  );
};
lf_et.mergeOptions = function (t) {
  return lf_l(this.prototype.options, t), this;
};
lf_et.addInitHook = function (t) {
  var e = Array.prototype.slice.call(arguments, 1),
    i =
      "function" == typeof t
        ? t
        : function () {
            this[t].apply(this, e);
          };
  return (
    (this.prototype._initHooks = this.prototype._initHooks || []),
    this.prototype._initHooks.push(i),
    this
  );
};
var lf_e = {
  on: function (t, e, i) {
    if ("object" == typeof t) for (var n in t) this._on(n, t[n], e);
    else
      for (var o = 0, s = (t = lf_F(t)).length; o < s; o++)
        this._on(t[o], e, i);
    return this;
  },
  off: function (t, e, i) {
    if (arguments.length) {
      if ("object" == typeof t) for (var n in t) this._off(n, t[n], e);
      else {
        t = lf_F(t);
        for (var o = 1 === arguments.length, s = 0, r = t.length; s < r; s++)
          o ? this._off(t[s]) : this._off(t[s], e, i);
      }
    } else delete this._events;
    return this;
  },
  _on: function (t, e, i, n) {
    "function" != typeof e
      ? console.warn("wrong listener type: " + typeof e)
      : !1 === this._listens(t, e, i) &&
        ((e = {
          fn: e,
          ctx: (i = i === this ? void 0 : i),
        }),
        n && (e.once = !0),
        (this._events = this._events || {}),
        (this._events[t] = this._events[t] || []),
        this._events[t].push(e));
  },
  _off: function (t, e, i) {
    var n, o, s;
    if (this._events && (n = this._events[t]))
      if (1 === arguments.length) {
        if (this._firingCount)
          for (o = 0, s = n.length; o < s; o++) n[o].fn = lf_u;
        delete this._events[t];
      } else
        "function" != typeof e
          ? console.warn("wrong listener type: " + typeof e)
          : !1 !== (e = this._listens(t, e, i)) &&
            ((i = n[e]),
            this._firingCount &&
              ((i.fn = lf_u), (this._events[t] = n = n.slice())),
            n.splice(e, 1));
  },
  fire: function (t, e, i) {
    if (this.listens(t, i)) {
      var n = lf_l({}, e, {
        type: t,
        target: this,
        sourceTarget: (e && e.sourceTarget) || this,
      });
      if (this._events) {
        var o = this._events[t];
        if (o) {
          this._firingCount = this._firingCount + 1 || 1;
          for (var s = 0, r = o.length; s < r; s++) {
            var a = o[s],
              h = a.fn;
            a.once && this.off(t, h, a.ctx), h.call(a.ctx || this, n);
          }
          this._firingCount--;
        }
      }
      i && this._propagateEvent(n);
    }
    return this;
  },
  listens: function (t, e, i, n) {
    "string" != typeof t && console.warn('"string" type argument expected');
    var o = e,
      s =
        ("function" != typeof e && ((n = !!e), (i = o = void 0)),
        this._events && this._events[t]);
    if (s && s.length && !1 !== this._listens(t, o, i)) return !0;
    if (n)
      for (var r in this._eventParents)
        if (this._eventParents[r].listens(t, e, i, n)) return !0;
    return !1;
  },
  _listens: function (t, e, i) {
    if (this._events) {
      var n = this._events[t] || [];
      if (!e) return !!n.length;
      i === this && (i = void 0);
      for (var o = 0, s = n.length; o < s; o++)
        if (n[o].fn === e && n[o].ctx === i) return o;
    }
    return !1;
  },
  once: function (t, e, i) {
    if ("object" == typeof t) for (var n in t) this._on(n, t[n], e, !0);
    else
      for (var o = 0, s = (t = lf_F(t)).length; o < s; o++)
        this._on(t[o], e, i, !0);
    return this;
  },
  addEventParent: function (t) {
    return (
      (this._eventParents = this._eventParents || {}),
      (this._eventParents[lf_h(t)] = t),
      this
    );
  },
  removeEventParent: function (t) {
    return this._eventParents && delete this._eventParents[lf_h(t)], this;
  },
  _propagateEvent: function (t) {
    for (var e in this._eventParents)
      this._eventParents[e].fire(
        t.type,
        lf_l(
          {
            layer: t.target,
            propagatedFrom: t.target,
          },
          t,
        ),
        !0,
      );
  },
};
lf_e.addEventListener = lf_e.on;
lf_e.removeEventListener = lf_e.clearAllEventListeners = lf_e.off;
lf_e.addOneTimeEventListener = lf_e.once;
lf_e.fireEvent = lf_e.fire;
lf_e.hasEventListeners = lf_e.listens;
var lf_it = lf_et.extend(lf_e);
function lf_p(t, e, i) {
  (this.x = i ? Math.round(t) : t), (this.y = i ? Math.round(e) : e);
}
var lf_nt =
  Math.trunc ||
  function (t) {
    return 0 < t ? Math.floor(t) : Math.ceil(t);
  };
function lf_m(t, e, i) {
  return t instanceof lf_p
    ? t
    : lf_d(t)
      ? new lf_p(t[0], t[1])
      : null == t
        ? t
        : "object" == typeof t && "x" in t && "y" in t
          ? new lf_p(t.x, t.y)
          : new lf_p(t, e, i);
}
function lf_f(t, e) {
  if (t)
    for (var i = e ? [t, e] : t, n = 0, o = i.length; n < o; n++)
      this.extend(i[n]);
}
function lf__(t, e) {
  return !t || t instanceof lf_f ? t : new lf_f(t, e);
}
function lf_s(t, e) {
  if (t)
    for (var i = e ? [t, e] : t, n = 0, o = i.length; n < o; n++)
      this.extend(i[n]);
}
function lf_g(t, e) {
  return t instanceof lf_s ? t : new lf_s(t, e);
}
function lf_v(t, e, i) {
  if (isNaN(t) || isNaN(e))
    throw new Error("Invalid LatLng object: (" + t + ", " + e + ")");
  (this.lat = +t), (this.lng = +e), void 0 !== i && (this.alt = +i);
}
function lf_w(t, e, i) {
  return t instanceof lf_v
    ? t
    : lf_d(t) && "object" != typeof t[0]
      ? 3 === t.length
        ? new lf_v(t[0], t[1], t[2])
        : 2 === t.length
          ? new lf_v(t[0], t[1])
          : null
      : null == t
        ? t
        : "object" == typeof t && "lat" in t
          ? new lf_v(t.lat, "lng" in t ? t.lng : t.lon, t.alt)
          : void 0 === e
            ? null
            : new lf_v(t, e, i);
}
