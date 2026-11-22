/*! Leaflet 1.9.4; locally maintained modular distribution. See vendor/README.md and license notice. */
"use strict";
lf_at.prototype = {
  transform: function (t, e) {
    return this._transform(t.clone(), e);
  },
  _transform: function (t, e) {
    return (
      (t.x = (e = e || 1) * (this._a * t.x + this._b)),
      (t.y = e * (this._c * t.y + this._d)),
      t
    );
  },
  untransform: function (t, e) {
    return new lf_p(
      (t.x / (e = e || 1) - this._b) / this._a,
      (t.y / e - this._d) / this._c,
    );
  },
};
var lf_lt = lf_l({}, lf_st, {
  code: "EPSG:3857",
  projection: lf_rt,
  transformation: lf_ht((lf_lt = 0.5 / (Math.PI * lf_rt.R)), 0.5, -lf_lt, 0.5),
});
var lf_ut = lf_l({}, lf_lt, {
  code: "EPSG:900913",
});
function lf_ct(t) {
  return document.createElementNS("http://www.w3.org/2000/svg", t);
}
function lf_dt(t, e) {
  for (var i, n, o, s, r = "", a = 0, h = t.length; a < h; a++) {
    for (i = 0, n = (o = t[a]).length; i < n; i++)
      r += (i ? "L" : "M") + (s = o[i]).x + " " + s.y;
    r += e ? (lf_b.svg ? "z" : "x") : "";
  }
  return r || "M0 0";
}
var lf__t = document.documentElement.style;
var lf_pt = "ActiveXObject" in window;
var lf_mt = lf_pt && !document.addEventListener;
var lf_n = "msLaunchUri" in navigator && !("documentMode" in document);
var lf_ft = lf_y("webkit");
var lf_gt = lf_y("android");
var lf_vt = lf_y("android 2") || lf_y("android 3");
var lf_yt = parseInt(/WebKit\/([0-9]+)|$/.exec(navigator.userAgent)[1], 10);
var lf_yt = lf_gt && lf_y("Google") && lf_yt < 537 && !("AudioNode" in window);
var lf_xt = !!window.opera;
var lf_wt = !lf_n && lf_y("chrome");
var lf_bt = lf_y("gecko") && !lf_ft && !lf_xt && !lf_pt;
var lf_Pt = !lf_wt && lf_y("safari");
var lf_Lt = lf_y("phantom");
var lf_o = "OTransition" in lf__t;
var lf_Tt = 0 === navigator.platform.indexOf("Win");
var lf_Mt = lf_pt && "transition" in lf__t;
var lf_zt =
  "WebKitCSSMatrix" in window &&
  "m11" in new window.WebKitCSSMatrix() &&
  !lf_vt;
var lf__t = "MozPerspective" in lf__t;
var lf_Ct =
  !window.L_DISABLE_3D && (lf_Mt || lf_zt || lf__t) && !lf_o && !lf_Lt;
var lf_Zt = "undefined" != typeof orientation || lf_y("mobile");
var lf_St = lf_Zt && lf_ft;
var lf_Et = lf_Zt && lf_zt;
var lf_kt = !window.PointerEvent && window.MSPointerEvent;
var lf_Ot = !(!window.PointerEvent && !lf_kt);
var lf_At = "ontouchstart" in window || !!window.TouchEvent;
var lf_Bt = !window.L_NO_TOUCH && (lf_At || lf_Ot);
var lf_It = lf_Zt && lf_xt;
var lf_Rt = lf_Zt && lf_bt;
var lf_Nt =
  1 <
  (window.devicePixelRatio ||
    window.screen.deviceXDPI / window.screen.logicalXDPI);
var lf_Dt = (function () {
  var t = !1;
  try {
    var e = Object.defineProperty({}, "passive", {
      get: function () {
        t = !0;
      },
    });
    window.addEventListener("testPassiveEventSupport", lf_u, e),
      window.removeEventListener("testPassiveEventSupport", lf_u, e);
  } catch (error) {
    t = false;
    console.warn('Leaflet passive-event support probe failed; using ordinary event listeners.', error);
  }
  return t;
})();
var lf_jt = !!document.createElement("canvas").getContext;
var lf_Ht = !(!document.createElementNS || !lf_ct("svg").createSVGRect);
var lf_Wt =
  !!lf_Ht &&
  (((lf_Wt = document.createElement("div")).innerHTML = "<svg/>"),
  "http://www.w3.org/2000/svg" ===
    (lf_Wt.firstChild && lf_Wt.firstChild.namespaceURI));
function lf_y(t) {
  return 0 <= navigator.userAgent.toLowerCase().indexOf(t);
}
var lf_b = {
  ie: lf_pt,
  ielt9: lf_mt,
  edge: lf_n,
  webkit: lf_ft,
  android: lf_gt,
  android23: lf_vt,
  androidStock: lf_yt,
  opera: lf_xt,
  chrome: lf_wt,
  gecko: lf_bt,
  safari: lf_Pt,
  phantom: lf_Lt,
  opera12: lf_o,
  win: lf_Tt,
  ie3d: lf_Mt,
  webkit3d: lf_zt,
  gecko3d: lf__t,
  any3d: lf_Ct,
  mobile: lf_Zt,
  mobileWebkit: lf_St,
  mobileWebkit3d: lf_Et,
  msPointer: lf_kt,
  pointer: lf_Ot,
  touch: lf_Bt,
  touchNative: lf_At,
  mobileOpera: lf_It,
  mobileGecko: lf_Rt,
  retina: lf_Nt,
  passiveEvents: lf_Dt,
  canvas: lf_jt,
  svg: lf_Ht,
  vml:
    !lf_Ht &&
    (function () {
      try {
        var t = document.createElement("div"),
          e = ((t.innerHTML = '<v:shape adj="1"/>'), t.firstChild);
        return (
          (e.style.behavior = "url(#default#VML)"),
          e && "object" == typeof e.adj
        );
      } catch (t) {
        return !1;
      }
    })(),
  inlineSvg: lf_Wt,
  mac: 0 === navigator.platform.indexOf("Mac"),
  linux: 0 === navigator.platform.indexOf("Linux"),
};
var lf_Ft = lf_b.msPointer ? "MSPointerDown" : "pointerdown";
var lf_Ut = lf_b.msPointer ? "MSPointerMove" : "pointermove";
var lf_Vt = lf_b.msPointer ? "MSPointerUp" : "pointerup";
var lf_qt = lf_b.msPointer ? "MSPointerCancel" : "pointercancel";
var lf_Gt = {
  touchstart: lf_Ft,
  touchmove: lf_Ut,
  touchend: lf_Vt,
  touchcancel: lf_qt,
};
var lf_Kt = {
  touchstart: function (t, e) {
    e.MSPOINTER_TYPE_TOUCH &&
      e.pointerType === e.MSPOINTER_TYPE_TOUCH &&
      lf_O(e);
    lf_ee(t, e);
  },
  touchmove: lf_ee,
  touchend: lf_ee,
  touchcancel: lf_ee,
};
var lf_Yt = {};
var lf_Xt = !1;
function lf_Jt(t, e, i) {
  return (
    "touchstart" !== e ||
      lf_Xt ||
      (document.addEventListener(lf_Ft, lf_$t, !0),
      document.addEventListener(lf_Ut, lf_Qt, !0),
      document.addEventListener(lf_Vt, lf_te, !0),
      document.addEventListener(lf_qt, lf_te, !0),
      (lf_Xt = !0)),
    lf_Kt[e]
      ? ((i = lf_Kt[e].bind(this, i)), t.addEventListener(lf_Gt[e], i, !1), i)
      : (console.warn("wrong event specified:", e), lf_u)
  );
}
function lf_$t(t) {
  lf_Yt[t.pointerId] = t;
}
function lf_Qt(t) {
  lf_Yt[t.pointerId] && (lf_Yt[t.pointerId] = t);
}
function lf_te(t) {
  delete lf_Yt[t.pointerId];
}
function lf_ee(t, e) {
  if (e.pointerType !== (e.MSPOINTER_TYPE_MOUSE || "mouse")) {
    for (var i in ((e.touches = []), lf_Yt)) e.touches.push(lf_Yt[i]);
    (e.changedTouches = [e]), t(e);
  }
}
var lf_ie = 200;
function lf_ne(t, i) {
  t.addEventListener("dblclick", i);
  var n,
    o = 0;
  function e(t) {
    var e;
    1 !== t.detail
      ? (n = t.detail)
      : "mouse" === t.pointerType ||
        (t.sourceCapabilities && !t.sourceCapabilities.firesTouchEvents) ||
        ((e = lf_Ne(t)).some(function (t) {
          return t instanceof HTMLLabelElement && t.attributes.for;
        }) &&
          !e.some(function (t) {
            return (
              t instanceof HTMLInputElement || t instanceof HTMLSelectElement
            );
          })) ||
        ((e = Date.now()) - o <= lf_ie
          ? 2 === ++n &&
            i(
              (function (t) {
                var e,
                  i,
                  n = {};
                for (i in t) (e = t[i]), (n[i] = e && e.bind ? e.bind(t) : e);
                return (
                  ((t = n).type = "dblclick"),
                  (n.detail = 2),
                  (n.isTrusted = !1),
                  (n._simulated = !0),
                  n
                );
              })(t),
            )
          : (n = 1),
        (o = e));
  }
  return (
    t.addEventListener("click", e),
    {
      dblclick: i,
      simDblclick: e,
    }
  );
}
var lf_oe;
var lf_se;
var lf_re;
var lf_ae;
var lf_he;
var lf_le;
var lf_ue = lf_we([
  "transform",
  "webkitTransform",
  "OTransform",
  "MozTransform",
  "msTransform",
]);
var lf_ce = lf_we([
  "webkitTransition",
  "transition",
  "OTransition",
  "MozTransition",
  "msTransition",
]);
var lf_de =
  "webkitTransition" === lf_ce || "OTransition" === lf_ce
    ? lf_ce + "End"
    : "transitionend";
function lf__e(t) {
  return "string" == typeof t ? document.getElementById(t) : t;
}
function lf_pe(t, e) {
  var i = t.style[e] || (t.currentStyle && t.currentStyle[e]);
  return "auto" ===
    (i =
      (i && "auto" !== i) || !document.defaultView
        ? i
        : (t = document.defaultView.getComputedStyle(t, null))
          ? t[e]
          : null)
    ? null
    : i;
}
function lf_P(t, e, i) {
  t = document.createElement(t);
  return (t.className = e || ""), i && i.appendChild(t), t;
}
function lf_T(t) {
  var e = t.parentNode;
  e && e.removeChild(t);
}
function lf_me(t) {
  for (; t.firstChild; ) t.removeChild(t.firstChild);
}
function lf_fe(t) {
  var e = t.parentNode;
  e && e.lastChild !== t && e.appendChild(t);
}
function lf_ge(t) {
  var e = t.parentNode;
  e && e.firstChild !== t && e.insertBefore(t, e.firstChild);
}
function lf_ve(t, e) {
  return void 0 !== t.classList
    ? t.classList.contains(e)
    : 0 < (t = lf_xe(t)).length && lf_F(t).indexOf(e) !== -1;
}
function lf_M(t, e) {
  var i;
  if (void 0 !== t.classList)
    for (var n = lf_F(e), o = 0, s = n.length; o < s; o++)
      t.classList.add(n[o]);
  else lf_ve(t, e) || lf_ye(t, ((i = lf_xe(t)) ? i + " " : "") + e);
}
function lf_z(t, e) {
  void 0 !== t.classList
    ? t.classList.remove(e)
    : lf_ye(t, lf_W((" " + lf_xe(t) + " ").replace(" " + e + " ", " ")));
}
function lf_ye(t, e) {
  void 0 === t.className.baseVal
    ? (t.className = e)
    : (t.className.baseVal = e);
}
function lf_xe(t) {
  return void 0 ===
    (t = t.correspondingElement ? t.correspondingElement : t).className.baseVal
    ? t.className
    : t.className.baseVal;
}
function lf_C(t, e) {
  if ("opacity" in t.style) t.style.opacity = e;
  else if ("filter" in t.style) {
    var i = !1,
      n = "DXImageTransform.Microsoft.Alpha";
    try {
      i = t.filters.item(n);
    } catch (t) {
      if (1 === e) return;
    }
    (e = Math.round(100 * e)),
      i
        ? ((i.Enabled = 100 !== e), (i.Opacity = e))
        : (t.style.filter += " progid:" + n + "(opacity=" + e + ")");
  }
}
function lf_we(t) {
  for (var e = document.documentElement.style, i = 0; i < t.length; i++)
    if (t[i] in e) return t[i];
  return !1;
}
function lf_be(t, e, i) {
  e = e || new lf_p(0, 0);
  t.style[lf_ue] =
    (lf_b.ie3d
      ? "translate(" + e.x + "px," + e.y + "px)"
      : "translate3d(" + e.x + "px," + e.y + "px,0)") +
    (i ? " scale(" + i + ")" : "");
}
function lf_Z(t, e) {
  (t._leaflet_pos = e),
    lf_b.any3d
      ? lf_be(t, e)
      : ((t.style.left = e.x + "px"), (t.style.top = e.y + "px"));
}
function lf_Pe(t) {
  return t._leaflet_pos || new lf_p(0, 0);
}
function lf_Le() {
  lf_S(window, "dragstart", lf_O);
}
function lf_Te() {
  lf_k(window, "dragstart", lf_O);
}
function lf_Me(t) {
  for (; -1 === t.tabIndex; ) t = t.parentNode;
  t.style &&
    (lf_ze(),
    (lf_le = (lf_he = t).style.outlineStyle),
    (t.style.outlineStyle = "none"),
    lf_S(window, "keydown", lf_ze));
}
function lf_ze() {
  lf_he &&
    ((lf_he.style.outlineStyle = lf_le),
    (lf_le = lf_he = void 0),
    lf_k(window, "keydown", lf_ze));
}
function lf_Ce(t) {
  for (
    ;
    !(
      ((t = t.parentNode).offsetWidth && t.offsetHeight) ||
      t === document.body
    );
  );
  return t;
}
function lf_Ze(t) {
  var e = t.getBoundingClientRect();
  return {
    x: e.width / t.offsetWidth || 1,
    y: e.height / t.offsetHeight || 1,
    boundingClientRect: e,
  };
}
