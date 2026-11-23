/*! Leaflet 1.9.4; locally maintained modular distribution. See vendor/README.md and license notice. */
"use strict";
var lf_Ge = lf_B.extend({
  options: {
    position: "bottomleft",
    maxWidth: 100,
    metric: !0,
    imperial: !0,
  },
  onAdd: function (t) {
    var e = "leaflet-control-scale",
      i = lf_P("div", e),
      n = this.options;
    return (
      this._addScales(n, e + "-line", i),
      t.on(n.updateWhenIdle ? "moveend" : "move", this._update, this),
      t.whenReady(this._update, this),
      i
    );
  },
  onRemove: function (t) {
    t.off(this.options.updateWhenIdle ? "moveend" : "move", this._update, this);
  },
  _addScales: function (t, e, i) {
    t.metric && (this._mScale = lf_P("div", e, i)),
      t.imperial && (this._iScale = lf_P("div", e, i));
  },
  _update: function () {
    var t = this._map,
      e = t.getSize().y / 2,
      t = t.distance(
        t.containerPointToLatLng([0, e]),
        t.containerPointToLatLng([this.options.maxWidth, e]),
      );
    this._updateScales(t);
  },
  _updateScales: function (t) {
    this.options.metric && t && this._updateMetric(t),
      this.options.imperial && t && this._updateImperial(t);
  },
  _updateMetric: function (t) {
    var e = this._getRoundNum(t);
    this._updateScale(
      this._mScale,
      e < 1e3 ? e + " m" : e / 1e3 + " km",
      e / t,
    );
  },
  _updateImperial: function (t) {
    var e,
      i,
      t = 3.2808399 * t;
    5280 < t
      ? ((i = this._getRoundNum((e = t / 5280))),
        this._updateScale(this._iScale, i + " mi", i / e))
      : ((i = this._getRoundNum(t)),
        this._updateScale(this._iScale, i + " ft", i / t));
  },
  _updateScale: function (t, e, i) {
    (t.style.width = Math.round(this.options.maxWidth * i) + "px"),
      (t.innerHTML = e);
  },
  _getRoundNum: function (t) {
    var e = Math.pow(10, (Math.floor(t) + "").length - 1),
      t = t / e;
    return e * (t = 10 <= t ? 10 : 5 <= t ? 5 : 3 <= t ? 3 : 2 <= t ? 2 : 1);
  },
});
var lf_Ke = lf_B.extend({
  options: {
    position: "bottomright",
    prefix:
      '<a href="https://leafletjs.com" title="A JavaScript library for interactive maps">' +
      (lf_b.inlineSvg
        ? '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" class="leaflet-attribution-flag"><path fill="#4C7BE1" d="M0 0h12v4H0z"/><path fill="#FFD500" d="M0 4h12v3H0z"/><path fill="#E0BC00" d="M0 7h12v1H0z"/></svg> '
        : "") +
      "Leaflet</a>",
  },
  initialize: function (t) {
    lf_c(this, t), (this._attributions = {});
  },
  onAdd: function (t) {
    for (var e in (((t.attributionControl = this)._container = lf_P(
      "div",
      "leaflet-control-attribution",
    )),
    lf_Ie(this._container),
    t._layers))
      t._layers[e].getAttribution &&
        this.addAttribution(t._layers[e].getAttribution());
    return (
      this._update(),
      t.on("layeradd", this._addAttribution, this),
      this._container
    );
  },
  onRemove: function (t) {
    t.off("layeradd", this._addAttribution, this);
  },
  _addAttribution: function (t) {
    t.layer.getAttribution &&
      (this.addAttribution(t.layer.getAttribution()),
      t.layer.once(
        "remove",
        function () {
          this.removeAttribution(t.layer.getAttribution());
        },
        this,
      ));
  },
  setPrefix: function (t) {
    return (this.options.prefix = t), this._update(), this;
  },
  addAttribution: function (t) {
    return (
      t &&
        (this._attributions[t] || (this._attributions[t] = 0),
        this._attributions[t]++,
        this._update()),
      this
    );
  },
  removeAttribution: function (t) {
    return (
      t && this._attributions[t] && (this._attributions[t]--, this._update()),
      this
    );
  },
  _update: function () {
    if (this._map) {
      var t,
        e = [];
      for (t in this._attributions) this._attributions[t] && e.push(t);
      var i = [];
      this.options.prefix && i.push(this.options.prefix),
        e.length && i.push(e.join(", ")),
        (this._container.innerHTML = i.join(
          ' <span aria-hidden="true">|</span> ',
        ));
    }
  },
});
lf_A.mergeOptions({
  attributionControl: !0,
});
lf_A.addInitHook(function () {
  this.options.attributionControl && new lf_Ke().addTo(this);
});
lf_B.Layers = lf_Ve;
lf_B.Zoom = lf_qe;
lf_B.Scale = lf_Ge;
lf_B.Attribution = lf_Ke;
lf_Ue.layers = function (t, e, i) {
  return new lf_Ve(t, e, i);
};
lf_Ue.zoom = function (t) {
  return new lf_qe(t);
};
lf_Ue.scale = function (t) {
  return new lf_Ge(t);
};
lf_Ue.attribution = function (t) {
  return new lf_Ke(t);
};
var lf_n = lf_et.extend({
  initialize: function (t) {
    this._map = t;
  },
  enable: function () {
    return this._enabled || ((this._enabled = !0), this.addHooks()), this;
  },
  disable: function () {
    return this._enabled && ((this._enabled = !1), this.removeHooks()), this;
  },
  enabled: function () {
    return !!this._enabled;
  },
});
lf_n.addTo = function (t, e) {
  return t.addHandler(e, this), this;
};
var lf_ft = {
  Events: lf_e,
};
var lf_Ye = lf_b.touch ? "touchstart mousedown" : "mousedown";
var lf_Xe = lf_it.extend({
  options: {
    clickTolerance: 3,
  },
  initialize: function (t, e, i, n) {
    lf_c(this, n),
      (this._element = t),
      (this._dragStartTarget = e || t),
      (this._preventOutline = i);
  },
  enable: function () {
    this._enabled ||
      (lf_S(this._dragStartTarget, lf_Ye, this._onDown, this),
      (this._enabled = !0));
  },
  disable: function () {
    this._enabled &&
      (lf_Xe._dragging === this && this.finishDrag(!0),
      lf_k(this._dragStartTarget, lf_Ye, this._onDown, this),
      (this._enabled = !1),
      (this._moved = !1));
  },
  _onDown: function (t) {
    var e, i;
    this._enabled &&
      ((this._moved = !1),
      lf_ve(this._element, "leaflet-zoom-anim") ||
        (t.touches && 1 !== t.touches.length
          ? lf_Xe._dragging === this && this.finishDrag()
          : lf_Xe._dragging ||
            t.shiftKey ||
            (1 !== t.which && 1 !== t.button && !t.touches) ||
            ((lf_Xe._dragging = this)._preventOutline && lf_Me(this._element),
            lf_Le(),
            lf_re(),
            this._moving ||
              (this.fire("down"),
              (i = t.touches ? t.touches[0] : t),
              (e = lf_Ce(this._element)),
              (this._startPoint = new lf_p(i.clientX, i.clientY)),
              (this._startPos = lf_Pe(this._element)),
              (this._parentScale = lf_Ze(e)),
              (i = "mousedown" === t.type),
              lf_S(document, i ? "mousemove" : "touchmove", this._onMove, this),
              lf_S(
                document,
                i ? "mouseup" : "touchend touchcancel",
                this._onUp,
                this,
              )))));
  },
  _onMove: function (t) {
    var e;
    this._enabled &&
      (t.touches && 1 < t.touches.length
        ? (this._moved = !0)
        : (!(e = new lf_p(
            (e = t.touches && 1 === t.touches.length ? t.touches[0] : t)
              .clientX,
            e.clientY,
          )._subtract(this._startPoint)).x &&
            !e.y) ||
          Math.abs(e.x) + Math.abs(e.y) < this.options.clickTolerance ||
          ((e.x /= this._parentScale.x),
          (e.y /= this._parentScale.y),
          lf_O(t),
          this._moved ||
            (this.fire("dragstart"),
            (this._moved = !0),
            lf_M(document.body, "leaflet-dragging"),
            (this._lastTarget = t.target || t.srcElement),
            window.SVGElementInstance &&
              this._lastTarget instanceof window.SVGElementInstance &&
              (this._lastTarget = this._lastTarget.correspondingUseElement),
            lf_M(this._lastTarget, "leaflet-drag-target")),
          (this._newPos = this._startPos.add(e)),
          (this._moving = !0),
          (this._lastEvent = t),
          this._updatePosition()));
  },
  _updatePosition: function () {
    var t = {
      originalEvent: this._lastEvent,
    };
    this.fire("predrag", t),
      lf_Z(this._element, this._newPos),
      this.fire("drag", t);
  },
  _onUp: function () {
    this._enabled && this.finishDrag();
  },
  finishDrag: function (t) {
    lf_z(document.body, "leaflet-dragging"),
      this._lastTarget &&
        (lf_z(this._lastTarget, "leaflet-drag-target"),
        (this._lastTarget = null)),
      lf_k(document, "mousemove touchmove", this._onMove, this),
      lf_k(document, "mouseup touchend touchcancel", this._onUp, this),
      lf_Te(),
      lf_ae();
    var e = this._moved && this._moving;
    (this._moving = !1),
      (lf_Xe._dragging = !1),
      e &&
        this.fire("dragend", {
          noInertia: t,
          distance: this._newPos.distanceTo(this._startPos),
        });
  },
});
function lf_Je(t, e, i) {
  for (
    var n, o, s, r, a, h, l, u = [1, 4, 2, 8], c = 0, d = t.length;
    c < d;
    c++
  )
    t[c]._code = lf_si(t[c], e);
  for (s = 0; s < 4; s++) {
    for (h = u[s], n = [], c = 0, o = (d = t.length) - 1; c < d; o = c++)
      (r = t[c]),
        (a = t[o]),
        r._code & h
          ? a._code & h ||
            (((l = lf_oi(a, r, h, e, i))._code = lf_si(l, e)), n.push(l))
          : (a._code & h &&
              (((l = lf_oi(a, r, h, e, i))._code = lf_si(l, e)), n.push(l)),
            n.push(r));
    t = n;
  }
  return t;
}
function lf_$e(t, e) {
  var i, n, o, s, r, a, h;
  if (!t || 0 === t.length) throw new Error("latlngs not passed");
  lf_I(t) ||
    (console.warn("latlngs are not flat! Only the first ring will be used"),
    (t = t[0]));
  for (
    var l = lf_w([0, 0]),
      u = lf_g(t),
      c =
        (u.getNorthWest().distanceTo(u.getSouthWest()) *
          u.getNorthEast().distanceTo(u.getNorthWest()) <
          1700 && (l = lf_Qe(t)),
        t.length),
      d = [],
      _ = 0;
    _ < c;
    _++
  ) {
    var p = lf_w(t[_]);
    d.push(e.project(lf_w([p.lat - l.lat, p.lng - l.lng])));
  }
  for (_ = r = a = h = 0, i = c - 1; _ < c; i = _++)
    (n = d[_]),
      (o = d[i]),
      (s = n.y * o.x - o.y * n.x),
      (a += (n.x + o.x) * s),
      (h += (n.y + o.y) * s),
      (r += 3 * s);
  (u = 0 === r ? d[0] : [a / r, h / r]), (u = e.unproject(lf_m(u)));
  return lf_w([u.lat + l.lat, u.lng + l.lng]);
}
function lf_Qe(t) {
  for (var e = 0, i = 0, n = 0, o = 0; o < t.length; o++) {
    var s = lf_w(t[o]);
    (e += s.lat), (i += s.lng), n++;
  }
  return lf_w([e / n, i / n]);
}
var lf_ti;
var lf_gt = {
  __proto__: null,
  clipPolygon: lf_Je,
  polygonCenter: lf_$e,
  centroid: lf_Qe,
};
function lf_ei(t, e) {
  if (e && t.length) {
    var i = (t = (function (t, e) {
        for (var i = [t[0]], n = 1, o = 0, s = t.length; n < s; n++)
          (function (t, e) {
            var i = e.x - t.x,
              e = e.y - t.y;
            return i * i + e * e;
          })(t[n], t[o]) > e && (i.push(t[n]), (o = n));
        o < s - 1 && i.push(t[s - 1]);
        return i;
      })(t, (e = e * e))),
      n = i.length,
      o = new (typeof Uint8Array != void 0 + "" ? Uint8Array : Array)(n);
    (o[0] = o[n - 1] = 1),
      (function t(e, i, n, o, s) {
        var r,
          a,
          h,
          l = 0;
        for (a = o + 1; a <= s - 1; a++)
          (h = lf_ri(e[a], e[o], e[s], !0)), l < h && ((r = a), (l = h));
        n < l && ((i[r] = 1), t(e, i, n, o, r), t(e, i, n, r, s));
      })(i, o, e, 0, n - 1);
    var s,
      r = [];
    for (s = 0; s < n; s++) o[s] && r.push(i[s]);
    return r;
  }
  return t.slice();
}
function lf_ii(t, e, i) {
  return Math.sqrt(lf_ri(t, e, i, !0));
}
function lf_ni(t, e, i, n, o) {
  var s,
    r,
    a,
    h = n ? lf_ti : lf_si(t, i),
    l = lf_si(e, i);
  for (lf_ti = l; ; ) {
    if (!(h | l)) return [t, e];
    if (h & l) return !1;
    (a = lf_si((r = lf_oi(t, e, (s = h || l), i, o)), i)),
      s === h ? ((t = r), (h = a)) : ((e = r), (l = a));
  }
}
