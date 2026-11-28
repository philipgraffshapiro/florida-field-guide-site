/*! Leaflet 1.9.4; locally maintained modular distribution. See vendor/README.md and license notice. */
"use strict";
function lf_oi(t, e, i, n, o) {
  var s,
    r,
    a = e.x - t.x,
    e = e.y - t.y,
    h = n.min,
    n = n.max;
  return (
    8 & i
      ? ((s = t.x + (a * (n.y - t.y)) / e), (r = n.y))
      : 4 & i
        ? ((s = t.x + (a * (h.y - t.y)) / e), (r = h.y))
        : 2 & i
          ? ((s = n.x), (r = t.y + (e * (n.x - t.x)) / a))
          : 1 & i && ((s = h.x), (r = t.y + (e * (h.x - t.x)) / a)),
    new lf_p(s, r, o)
  );
}
function lf_si(t, e) {
  var i = 0;
  return (
    t.x < e.min.x ? (i |= 1) : t.x > e.max.x && (i |= 2),
    t.y < e.min.y ? (i |= 4) : t.y > e.max.y && (i |= 8),
    i
  );
}
function lf_ri(t, e, i, n) {
  var o = e.x,
    e = e.y,
    s = i.x - o,
    r = i.y - e,
    a = s * s + r * r;
  return (
    0 < a &&
      (1 < (a = ((t.x - o) * s + (t.y - e) * r) / a)
        ? ((o = i.x), (e = i.y))
        : 0 < a && ((o += s * a), (e += r * a))),
    (s = t.x - o),
    (r = t.y - e),
    n ? s * s + r * r : new lf_p(o, e)
  );
}
function lf_I(t) {
  return !lf_d(t[0]) || ("object" != typeof t[0][0] && void 0 !== t[0][0]);
}
function lf_ai(t) {
  return (
    console.warn(
      "Deprecated use of _flat, please use L.LineUtil.isFlat instead.",
    ),
    lf_I(t)
  );
}
function lf_hi(t, e) {
  var i, n, o, s, r, a;
  if (!t || 0 === t.length) throw new Error("latlngs not passed");
  lf_I(t) ||
    (console.warn("latlngs are not flat! Only the first ring will be used"),
    (t = t[0]));
  for (
    var h = lf_w([0, 0]),
      l = lf_g(t),
      u =
        (l.getNorthWest().distanceTo(l.getSouthWest()) *
          l.getNorthEast().distanceTo(l.getNorthWest()) <
          1700 && (h = lf_Qe(t)),
        t.length),
      c = [],
      d = 0;
    d < u;
    d++
  ) {
    var _ = lf_w(t[d]);
    c.push(e.project(lf_w([_.lat - h.lat, _.lng - h.lng])));
  }
  for (i = d = 0; d < u - 1; d++) i += c[d].distanceTo(c[d + 1]) / 2;
  if (0 === i) a = c[0];
  else
    for (n = d = 0; d < u - 1; d++)
      if (((o = c[d]), (s = c[d + 1]), i < (n += r = o.distanceTo(s)))) {
        a = [s.x - (r = (n - i) / r) * (s.x - o.x), s.y - r * (s.y - o.y)];
        break;
      }
  l = e.unproject(lf_m(a));
  return lf_w([l.lat + h.lat, l.lng + h.lng]);
}
var lf_vt = {
  __proto__: null,
  simplify: lf_ei,
  pointToSegmentDistance: lf_ii,
  closestPointOnSegment: function (t, e, i) {
    return lf_ri(t, e, i);
  },
  clipSegment: lf_ni,
  _getEdgeIntersection: lf_oi,
  _getBitCode: lf_si,
  _sqClosestPointOnSegment: lf_ri,
  isFlat: lf_I,
  _flat: lf_ai,
  polylineCenter: lf_hi,
};
var lf_yt = {
  project: function (t) {
    return new lf_p(t.lng, t.lat);
  },
  unproject: function (t) {
    return new lf_v(t.y, t.x);
  },
  bounds: new lf_f([-180, -90], [180, 90]),
};
var lf_xt = {
  R: 6378137,
  R_MINOR: 6356752.314245179,
  bounds: new lf_f(
    [-20037508.34279, -15496570.73972],
    [20037508.34279, 18764656.23138],
  ),
  project: function (t) {
    var e = Math.PI / 180,
      i = this.R,
      n = t.lat * e,
      o = this.R_MINOR / i,
      o = Math.sqrt(1 - o * o),
      s = o * Math.sin(n),
      s = Math.tan(Math.PI / 4 - n / 2) / Math.pow((1 - s) / (1 + s), o / 2),
      n = -i * Math.log(Math.max(s, 1e-10));
    return new lf_p(t.lng * e * i, n);
  },
  unproject: function (t) {
    for (
      var e,
        i = 180 / Math.PI,
        n = this.R,
        o = this.R_MINOR / n,
        s = Math.sqrt(1 - o * o),
        r = Math.exp(-t.y / n),
        a = Math.PI / 2 - 2 * Math.atan(r),
        h = 0,
        l = 0.1;
      h < 15 && 1e-7 < Math.abs(l);
      h++
    )
      (e = s * Math.sin(a)),
        (e = Math.pow((1 - e) / (1 + e), s / 2)),
        (a += l = Math.PI / 2 - 2 * Math.atan(r * e) - a);
    return new lf_v(a * i, (t.x * i) / n);
  },
};
var lf_wt = {
  __proto__: null,
  LonLat: lf_yt,
  Mercator: lf_xt,
  SphericalMercator: lf_rt,
};
var lf_Pt = lf_l({}, lf_st, {
  code: "EPSG:3395",
  projection: lf_xt,
  transformation: lf_ht((lf_bt = 0.5 / (Math.PI * lf_xt.R)), 0.5, -lf_bt, 0.5),
});
var lf_li = lf_l({}, lf_st, {
  code: "EPSG:4326",
  projection: lf_yt,
  transformation: lf_ht(1 / 180, 1, -1 / 180, 0.5),
});
var lf_Lt = lf_l({}, lf_ot, {
  projection: lf_yt,
  transformation: lf_ht(1, 0, -1, 0),
  scale: function (t) {
    return Math.pow(2, t);
  },
  zoom: function (t) {
    return Math.log(t) / Math.LN2;
  },
  distance: function (t, e) {
    var i = e.lng - t.lng,
      e = e.lat - t.lat;
    return Math.sqrt(i * i + e * e);
  },
  infinite: !0,
});
lf_ot.Earth = lf_st;
lf_ot.EPSG3395 = lf_Pt;
lf_ot.EPSG3857 = lf_lt;
lf_ot.EPSG900913 = lf_ut;
lf_ot.EPSG4326 = lf_li;
lf_ot.Simple = lf_Lt;
var lf_o = lf_it.extend({
  options: {
    pane: "overlayPane",
    attribution: null,
    bubblingMouseEvents: !0,
  },
  addTo: function (t) {
    return t.addLayer(this), this;
  },
  remove: function () {
    return this.removeFrom(this._map || this._mapToAdd);
  },
  removeFrom: function (t) {
    return t && t.removeLayer(this), this;
  },
  getPane: function (t) {
    return this._map.getPane(t ? this.options[t] || t : this.options.pane);
  },
  addInteractiveTarget: function (t) {
    return (this._map._targets[lf_h(t)] = this);
  },
  removeInteractiveTarget: function (t) {
    return delete this._map._targets[lf_h(t)], this;
  },
  getAttribution: function () {
    return this.options.attribution;
  },
  _layerAdd: function (t) {
    var e,
      i = t.target;
    i.hasLayer(this) &&
      ((this._map = i),
      (this._zoomAnimated = i._zoomAnimated),
      this.getEvents &&
        ((e = this.getEvents()),
        i.on(e, this),
        this.once(
          "remove",
          function () {
            i.off(e, this);
          },
          this,
        )),
      this.onAdd(i),
      this.fire("add"),
      i.fire("layeradd", {
        layer: this,
      }));
  },
});
lf_A.include({
  addLayer: function (t) {
    var e;
    if (t._layerAdd)
      return (
        (e = lf_h(t)),
        this._layers[e] ||
          (((this._layers[e] = t)._mapToAdd = this),
          t.beforeAdd && t.beforeAdd(this),
          this.whenReady(t._layerAdd, t)),
        this
      );
    throw new Error("The provided object is not a Layer.");
  },
  removeLayer: function (t) {
    var e = lf_h(t);
    return (
      this._layers[e] &&
        (this._loaded && t.onRemove(this),
        delete this._layers[e],
        this._loaded &&
          (this.fire("layerremove", {
            layer: t,
          }),
          t.fire("remove")),
        (t._map = t._mapToAdd = null)),
      this
    );
  },
  hasLayer: function (t) {
    return lf_h(t) in this._layers;
  },
  eachLayer: function (t, e) {
    for (var i in this._layers) t.call(e, this._layers[i]);
    return this;
  },
  _addLayers: function (t) {
    for (var e = 0, i = (t = t ? (lf_d(t) ? t : [t]) : []).length; e < i; e++)
      this.addLayer(t[e]);
  },
  _addZoomLimit: function (t) {
    (isNaN(t.options.maxZoom) && isNaN(t.options.minZoom)) ||
      ((this._zoomBoundLayers[lf_h(t)] = t), this._updateZoomLevels());
  },
  _removeZoomLimit: function (t) {
    t = lf_h(t);
    this._zoomBoundLayers[t] &&
      (delete this._zoomBoundLayers[t], this._updateZoomLevels());
  },
  _updateZoomLevels: function () {
    var t,
      e = 1 / 0,
      i = -1 / 0,
      n = this._getZoomSpan();
    for (t in this._zoomBoundLayers)
      var o = this._zoomBoundLayers[t].options,
        e = void 0 === o.minZoom ? e : Math.min(e, o.minZoom),
        i = void 0 === o.maxZoom ? i : Math.max(i, o.maxZoom);
    (this._layersMaxZoom = i === -1 / 0 ? void 0 : i),
      (this._layersMinZoom = e === 1 / 0 ? void 0 : e),
      n !== this._getZoomSpan() && this.fire("zoomlevelschange"),
      void 0 === this.options.maxZoom &&
        this._layersMaxZoom &&
        this.getZoom() > this._layersMaxZoom &&
        this.setZoom(this._layersMaxZoom),
      void 0 === this.options.minZoom &&
        this._layersMinZoom &&
        this.getZoom() < this._layersMinZoom &&
        this.setZoom(this._layersMinZoom);
  },
});
var lf_ui = lf_o.extend({
  initialize: function (t, e) {
    var i, n;
    if ((lf_c(this, e), (this._layers = {}), t))
      for (i = 0, n = t.length; i < n; i++) this.addLayer(t[i]);
  },
  addLayer: function (t) {
    var e = this.getLayerId(t);
    return (this._layers[e] = t), this._map && this._map.addLayer(t), this;
  },
  removeLayer: function (t) {
    t = t in this._layers ? t : this.getLayerId(t);
    return (
      this._map && this._layers[t] && this._map.removeLayer(this._layers[t]),
      delete this._layers[t],
      this
    );
  },
  hasLayer: function (t) {
    return ("number" == typeof t ? t : this.getLayerId(t)) in this._layers;
  },
  clearLayers: function () {
    return this.eachLayer(this.removeLayer, this);
  },
  invoke: function (t) {
    var e,
      i,
      n = Array.prototype.slice.call(arguments, 1);
    for (e in this._layers) (i = this._layers[e])[t] && i[t].apply(i, n);
    return this;
  },
  onAdd: function (t) {
    this.eachLayer(t.addLayer, t);
  },
  onRemove: function (t) {
    this.eachLayer(t.removeLayer, t);
  },
  eachLayer: function (t, e) {
    for (var i in this._layers) t.call(e, this._layers[i]);
    return this;
  },
  getLayer: function (t) {
    return this._layers[t];
  },
  getLayers: function () {
    var t = [];
    return this.eachLayer(t.push, t), t;
  },
  setZIndex: function (t) {
    return this.invoke("setZIndex", t);
  },
  getLayerId: lf_h,
});
var lf_ci = lf_ui.extend({
  addLayer: function (t) {
    return this.hasLayer(t)
      ? this
      : (t.addEventParent(this),
        lf_ui.prototype.addLayer.call(this, t),
        this.fire("layeradd", {
          layer: t,
        }));
  },
  removeLayer: function (t) {
    return this.hasLayer(t)
      ? ((t = t in this._layers ? this._layers[t] : t).removeEventParent(this),
        lf_ui.prototype.removeLayer.call(this, t),
        this.fire("layerremove", {
          layer: t,
        }))
      : this;
  },
  setStyle: function (t) {
    return this.invoke("setStyle", t);
  },
  bringToFront: function () {
    return this.invoke("bringToFront");
  },
  bringToBack: function () {
    return this.invoke("bringToBack");
  },
  getBounds: function () {
    var t,
      e = new lf_s();
    for (t in this._layers) {
      var i = this._layers[t];
      e.extend(i.getBounds ? i.getBounds() : i.getLatLng());
    }
    return e;
  },
});
