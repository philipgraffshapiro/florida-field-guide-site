/*! Leaflet 1.9.4; locally maintained modular distribution. See vendor/README.md and license notice. */
"use strict";
lf_ae =
  "onselectstart" in document
    ? ((lf_re = function () {
        lf_S(window, "selectstart", lf_O);
      }),
      function () {
        lf_k(window, "selectstart", lf_O);
      })
    : ((lf_se = lf_we([
        "userSelect",
        "WebkitUserSelect",
        "OUserSelect",
        "MozUserSelect",
        "msUserSelect",
      ])),
      (lf_re = function () {
        var t;
        lf_se &&
          ((t = document.documentElement.style),
          (lf_oe = t[lf_se]),
          (t[lf_se] = "none"));
      }),
      function () {
        lf_se &&
          ((document.documentElement.style[lf_se] = lf_oe), (lf_oe = void 0));
      });
lf_pt = {
  __proto__: null,
  TRANSFORM: lf_ue,
  TRANSITION: lf_ce,
  TRANSITION_END: lf_de,
  get: lf__e,
  getStyle: lf_pe,
  create: lf_P,
  remove: lf_T,
  empty: lf_me,
  toFront: lf_fe,
  toBack: lf_ge,
  hasClass: lf_ve,
  addClass: lf_M,
  removeClass: lf_z,
  setClass: lf_ye,
  getClass: lf_xe,
  setOpacity: lf_C,
  testProp: lf_we,
  setTransform: lf_be,
  setPosition: lf_Z,
  getPosition: lf_Pe,
  get disableTextSelection() {
    return lf_re;
  },
  get enableTextSelection() {
    return lf_ae;
  },
  disableImageDrag: lf_Le,
  enableImageDrag: lf_Te,
  preventOutline: lf_Me,
  restoreOutline: lf_ze,
  getSizedParentNode: lf_Ce,
  getScale: lf_Ze,
};
function lf_S(t, e, i, n) {
  if (e && "object" == typeof e) for (var o in e) lf_ke(t, o, e[o], i);
  else
    for (var s = 0, r = (e = lf_F(e)).length; s < r; s++) lf_ke(t, e[s], i, n);
  return this;
}
var lf_E = "_leaflet_events";
function lf_k(t, e, i, n) {
  if (1 === arguments.length) lf_Se(t), delete t[lf_E];
  else if (e && "object" == typeof e) for (var o in e) lf_Oe(t, o, e[o], i);
  else if (((e = lf_F(e)), 2 === arguments.length))
    lf_Se(t, function (t) {
      return -1 !== lf_G(e, t);
    });
  else for (var s = 0, r = e.length; s < r; s++) lf_Oe(t, e[s], i, n);
  return this;
}
function lf_Se(t, e) {
  for (var i in t[lf_E]) {
    var n = i.split(/\d/)[0];
    (e && !e(n)) || lf_Oe(t, n, null, null, i);
  }
}
var lf_Ee = {
  mouseenter: "mouseover",
  mouseleave: "mouseout",
  wheel: !("onwheel" in window) && "mousewheel",
};
function lf_ke(e, t, i, n) {
  var o,
    s,
    r = t + lf_h(i) + (n ? "_" + lf_h(n) : "");
  (e[lf_E] && e[lf_E][r]) ||
    ((s = o =
      function (t) {
        return i.call(n || e, t || window.event);
      }),
    !lf_b.touchNative && lf_b.pointer && 0 === t.indexOf("touch")
      ? (o = lf_Jt(e, t, o))
      : lf_b.touch && "dblclick" === t
        ? (o = lf_ne(e, o))
        : "addEventListener" in e
          ? "touchstart" === t ||
            "touchmove" === t ||
            "wheel" === t ||
            "mousewheel" === t
            ? e.addEventListener(
                lf_Ee[t] || t,
                o,
                !!lf_b.passiveEvents && {
                  passive: !1,
                },
              )
            : "mouseenter" === t || "mouseleave" === t
              ? e.addEventListener(
                  lf_Ee[t],
                  (o = function (t) {
                    (t = t || window.event), lf_We(e, t) && s(t);
                  }),
                  !1,
                )
              : e.addEventListener(t, s, !1)
          : e.attachEvent("on" + t, o),
    (e[lf_E] = e[lf_E] || {}),
    (e[lf_E][r] = o));
}
function lf_Oe(t, e, i, n, o) {
  o = o || e + lf_h(i) + (n ? "_" + lf_h(n) : "");
  var s,
    r,
    i = t[lf_E] && t[lf_E][o];
  i &&
    (!lf_b.touchNative && lf_b.pointer && 0 === e.indexOf("touch")
      ? ((n = t),
        (r = i),
        lf_Gt[(s = e)]
          ? n.removeEventListener(lf_Gt[s], r, !1)
          : console.warn("wrong event specified:", s))
      : lf_b.touch && "dblclick" === e
        ? ((n = i),
          (r = t).removeEventListener("dblclick", n.dblclick),
          r.removeEventListener("click", n.simDblclick))
        : "removeEventListener" in t
          ? t.removeEventListener(lf_Ee[e] || e, i, !1)
          : t.detachEvent("on" + e, i),
    (t[lf_E][o] = null));
}
function lf_Ae(t) {
  return (
    t.stopPropagation
      ? t.stopPropagation()
      : t.originalEvent
        ? (t.originalEvent._stopped = !0)
        : (t.cancelBubble = !0),
    this
  );
}
function lf_Be(t) {
  return lf_ke(t, "wheel", lf_Ae), this;
}
function lf_Ie(t) {
  return (
    lf_S(t, "mousedown touchstart dblclick contextmenu", lf_Ae),
    (t._leaflet_disable_click = !0),
    this
  );
}
function lf_O(t) {
  return t.preventDefault ? t.preventDefault() : (t.returnValue = !1), this;
}
function lf_Re(t) {
  return lf_O(t), lf_Ae(t), this;
}
function lf_Ne(t) {
  if (t.composedPath) return t.composedPath();
  for (var e = [], i = t.target; i; ) e.push(i), (i = i.parentNode);
  return e;
}
function lf_De(t, e) {
  var i, n;
  return e
    ? ((n = (i = lf_Ze(e)).boundingClientRect),
      new lf_p(
        (t.clientX - n.left) / i.x - e.clientLeft,
        (t.clientY - n.top) / i.y - e.clientTop,
      ))
    : new lf_p(t.clientX, t.clientY);
}
var lf_je =
  lf_b.linux && lf_b.chrome
    ? window.devicePixelRatio
    : lf_b.mac
      ? 3 * window.devicePixelRatio
      : 0 < window.devicePixelRatio
        ? 2 * window.devicePixelRatio
        : 1;
function lf_He(t) {
  return lf_b.edge
    ? t.wheelDeltaY / 2
    : t.deltaY && 0 === t.deltaMode
      ? -t.deltaY / lf_je
      : t.deltaY && 1 === t.deltaMode
        ? 20 * -t.deltaY
        : t.deltaY && 2 === t.deltaMode
          ? 60 * -t.deltaY
          : t.deltaX || t.deltaZ
            ? 0
            : t.wheelDelta
              ? (t.wheelDeltaY || t.wheelDelta) / 2
              : t.detail && Math.abs(t.detail) < 32765
                ? 20 * -t.detail
                : t.detail
                  ? (t.detail / -32765) * 60
                  : 0;
}
function lf_We(t, e) {
  var i = e.relatedTarget;
  if (!i) return !0;
  try {
    for (; i && i !== t; ) i = i.parentNode;
  } catch (t) {
    return !1;
  }
  return i !== t;
}
var lf_mt = {
  __proto__: null,
  on: lf_S,
  off: lf_k,
  stopPropagation: lf_Ae,
  disableScrollPropagation: lf_Be,
  disableClickPropagation: lf_Ie,
  preventDefault: lf_O,
  stop: lf_Re,
  getPropagationPath: lf_Ne,
  getMousePosition: lf_De,
  getWheelDelta: lf_He,
  isExternalTarget: lf_We,
  addListener: lf_S,
  removeListener: lf_k,
};
var lf_Fe = lf_it.extend({
  run: function (t, e, i, n) {
    this.stop(),
      (this._el = t),
      (this._inProgress = !0),
      (this._duration = i || 0.25),
      (this._easeOutPower = 1 / Math.max(n || 0.5, 0.2)),
      (this._startPos = lf_Pe(t)),
      (this._offset = e.subtract(this._startPos)),
      (this._startTime = +new Date()),
      this.fire("start"),
      this._animate();
  },
  stop: function () {
    this._inProgress && (this._step(!0), this._complete());
  },
  _animate: function () {
    (this._animId = lf_x(this._animate, this)), this._step();
  },
  _step: function (t) {
    var e = +new Date() - this._startTime,
      i = 1e3 * this._duration;
    e < i
      ? this._runFrame(this._easeOut(e / i), t)
      : (this._runFrame(1), this._complete());
  },
  _runFrame: function (t, e) {
    t = this._startPos.add(this._offset.multiplyBy(t));
    e && t._round(), lf_Z(this._el, t), this.fire("step");
  },
  _complete: function () {
    lf_r(this._animId), (this._inProgress = !1), this.fire("end");
  },
  _easeOut: function (t) {
    return 1 - Math.pow(1 - t, this._easeOutPower);
  },
});
