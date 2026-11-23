/*! Leaflet 1.9.4; locally maintained modular distribution. See vendor/README.md and license notice. */
"use strict";
var lf_fi = lf_o.extend({
  options: {
    stroke: !0,
    color: "#3388ff",
    weight: 3,
    opacity: 1,
    lineCap: "round",
    lineJoin: "round",
    dashArray: null,
    dashOffset: null,
    fill: !1,
    fillColor: null,
    fillOpacity: 0.2,
    fillRule: "evenodd",
    interactive: !0,
    bubblingMouseEvents: !0,
  },
  beforeAdd: function (t) {
    this._renderer = t.getRenderer(this);
  },
  onAdd: function () {
    this._renderer._initPath(this),
      this._reset(),
      this._renderer._addPath(this);
  },
  onRemove: function () {
    this._renderer._removePath(this);
  },
  redraw: function () {
    return this._map && this._renderer._updatePath(this), this;
  },
  setStyle: function (t) {
    return (
      lf_c(this, t),
      this._renderer &&
        (this._renderer._updateStyle(this),
        this.options.stroke &&
          t &&
          Object.prototype.hasOwnProperty.call(t, "weight") &&
          this._updateBounds()),
      this
    );
  },
  bringToFront: function () {
    return this._renderer && this._renderer._bringToFront(this), this;
  },
  bringToBack: function () {
    return this._renderer && this._renderer._bringToBack(this), this;
  },
  getElement: function () {
    return this._path;
  },
  _reset: function () {
    this._project(), this._update();
  },
  _clickTolerance: function () {
    return (
      (this.options.stroke ? this.options.weight / 2 : 0) +
      (this._renderer.options.tolerance || 0)
    );
  },
});
var lf_gi = lf_fi.extend({
  options: {
    fill: !0,
    radius: 10,
  },
  initialize: function (t, e) {
    lf_c(this, e),
      (this._latlng = lf_w(t)),
      (this._radius = this.options.radius);
  },
  setLatLng: function (t) {
    var e = this._latlng;
    return (
      (this._latlng = lf_w(t)),
      this.redraw(),
      this.fire("move", {
        oldLatLng: e,
        latlng: this._latlng,
      })
    );
  },
  getLatLng: function () {
    return this._latlng;
  },
  setRadius: function (t) {
    return (this.options.radius = this._radius = t), this.redraw();
  },
  getRadius: function () {
    return this._radius;
  },
  setStyle: function (t) {
    var e = (t && t.radius) || this._radius;
    return lf_fi.prototype.setStyle.call(this, t), this.setRadius(e), this;
  },
  _project: function () {
    (this._point = this._map.latLngToLayerPoint(this._latlng)),
      this._updateBounds();
  },
  _updateBounds: function () {
    var t = this._radius,
      e = this._radiusY || t,
      i = this._clickTolerance(),
      t = [t + i, e + i];
    this._pxBounds = new lf_f(this._point.subtract(t), this._point.add(t));
  },
  _update: function () {
    this._map && this._updatePath();
  },
  _updatePath: function () {
    this._renderer._updateCircle(this);
  },
  _empty: function () {
    return this._radius && !this._renderer._bounds.intersects(this._pxBounds);
  },
  _containsPoint: function (t) {
    return t.distanceTo(this._point) <= this._radius + this._clickTolerance();
  },
});
var lf_vi = lf_gi.extend({
  initialize: function (t, e, i) {
    if (
      (lf_c(
        this,
        (e =
          "number" == typeof e
            ? lf_l({}, i, {
                radius: e,
              })
            : e),
      ),
      (this._latlng = lf_w(t)),
      isNaN(this.options.radius))
    )
      throw new Error("Circle radius cannot be NaN");
    this._mRadius = this.options.radius;
  },
  setRadius: function (t) {
    return (this._mRadius = t), this.redraw();
  },
  getRadius: function () {
    return this._mRadius;
  },
  getBounds: function () {
    var t = [this._radius, this._radiusY || this._radius];
    return new lf_s(
      this._map.layerPointToLatLng(this._point.subtract(t)),
      this._map.layerPointToLatLng(this._point.add(t)),
    );
  },
  setStyle: lf_fi.prototype.setStyle,
  _project: function () {
    var t,
      e,
      i,
      n,
      o,
      s = this._latlng.lng,
      r = this._latlng.lat,
      a = this._map,
      h = a.options.crs;
    h.distance === lf_st.distance
      ? ((n = Math.PI / 180),
        (o = this._mRadius / lf_st.R / n),
        (t = a.project([r + o, s])),
        (e = a.project([r - o, s])),
        (e = t.add(e).divideBy(2)),
        (i = a.unproject(e).lat),
        (n =
          Math.acos(
            (Math.cos(o * n) - Math.sin(r * n) * Math.sin(i * n)) /
              (Math.cos(r * n) * Math.cos(i * n)),
          ) / n),
        (!isNaN(n) && 0 !== n) || (n = o / Math.cos((Math.PI / 180) * r)),
        (this._point = e.subtract(a.getPixelOrigin())),
        (this._radius = isNaN(n) ? 0 : e.x - a.project([i, s - n]).x),
        (this._radiusY = e.y - t.y))
      : ((o = h.unproject(
          h.project(this._latlng).subtract([this._mRadius, 0]),
        )),
        (this._point = a.latLngToLayerPoint(this._latlng)),
        (this._radius = this._point.x - a.latLngToLayerPoint(o).x)),
      this._updateBounds();
  },
});
var lf_yi = lf_fi.extend({
  options: {
    smoothFactor: 1,
    noClip: !1,
  },
  initialize: function (t, e) {
    lf_c(this, e), this._setLatLngs(t);
  },
  getLatLngs: function () {
    return this._latlngs;
  },
  setLatLngs: function (t) {
    return this._setLatLngs(t), this.redraw();
  },
  isEmpty: function () {
    return !this._latlngs.length;
  },
  closestLayerPoint: function (t) {
    for (
      var e = 1 / 0, i = null, n = lf_ri, o = 0, s = this._parts.length;
      o < s;
      o++
    )
      for (var r = this._parts[o], a = 1, h = r.length; a < h; a++) {
        var l,
          u,
          c = n(t, (l = r[a - 1]), (u = r[a]), !0);
        c < e && ((e = c), (i = n(t, l, u)));
      }
    return i && (i.distance = Math.sqrt(e)), i;
  },
  getCenter: function () {
    if (this._map) return lf_hi(this._defaultShape(), this._map.options.crs);
    throw new Error("Must add layer to map before using getCenter()");
  },
  getBounds: function () {
    return this._bounds;
  },
  addLatLng: function (t, e) {
    return (
      (e = e || this._defaultShape()),
      (t = lf_w(t)),
      e.push(t),
      this._bounds.extend(t),
      this.redraw()
    );
  },
  _setLatLngs: function (t) {
    (this._bounds = new lf_s()), (this._latlngs = this._convertLatLngs(t));
  },
  _defaultShape: function () {
    return lf_I(this._latlngs) ? this._latlngs : this._latlngs[0];
  },
  _convertLatLngs: function (t) {
    for (var e = [], i = lf_I(t), n = 0, o = t.length; n < o; n++)
      i
        ? ((e[n] = lf_w(t[n])), this._bounds.extend(e[n]))
        : (e[n] = this._convertLatLngs(t[n]));
    return e;
  },
  _project: function () {
    var t = new lf_f();
    (this._rings = []),
      this._projectLatlngs(this._latlngs, this._rings, t),
      this._bounds.isValid() &&
        t.isValid() &&
        ((this._rawPxBounds = t), this._updateBounds());
  },
  _updateBounds: function () {
    var t = this._clickTolerance(),
      t = new lf_p(t, t);
    this._rawPxBounds &&
      (this._pxBounds = new lf_f([
        this._rawPxBounds.min.subtract(t),
        this._rawPxBounds.max.add(t),
      ]));
  },
  _projectLatlngs: function (t, e, i) {
    var n,
      o,
      s = t[0] instanceof lf_v,
      r = t.length;
    if (s) {
      for (o = [], n = 0; n < r; n++)
        (o[n] = this._map.latLngToLayerPoint(t[n])), i.extend(o[n]);
      e.push(o);
    } else for (n = 0; n < r; n++) this._projectLatlngs(t[n], e, i);
  },
  _clipPoints: function () {
    var t = this._renderer._bounds;
    if (((this._parts = []), this._pxBounds && this._pxBounds.intersects(t)))
      if (this.options.noClip) this._parts = this._rings;
      else
        for (
          var e, i, n, o, s = this._parts, r = 0, a = 0, h = this._rings.length;
          r < h;
          r++
        )
          for (e = 0, i = (o = this._rings[r]).length; e < i - 1; e++)
            (n = lf_ni(o[e], o[e + 1], t, e, !0)) &&
              ((s[a] = s[a] || []),
              s[a].push(n[0]),
              (n[1] === o[e + 1] && e !== i - 2) || (s[a].push(n[1]), a++));
  },
  _simplifyPoints: function () {
    for (
      var t = this._parts, e = this.options.smoothFactor, i = 0, n = t.length;
      i < n;
      i++
    )
      t[i] = lf_ei(t[i], e);
  },
  _update: function () {
    this._map &&
      (this._clipPoints(), this._simplifyPoints(), this._updatePath());
  },
  _updatePath: function () {
    this._renderer._updatePoly(this);
  },
  _containsPoint: function (t, e) {
    var i,
      n,
      o,
      s,
      r,
      a,
      h = this._clickTolerance();
    if (this._pxBounds && this._pxBounds.contains(t))
      for (i = 0, s = this._parts.length; i < s; i++)
        for (n = 0, o = (r = (a = this._parts[i]).length) - 1; n < r; o = n++)
          if ((e || 0 !== n) && lf_ii(t, a[o], a[n]) <= h) return !0;
    return !1;
  },
});
lf_yi._flat = lf_ai;
var lf_xi = lf_yi.extend({
  options: {
    fill: !0,
  },
  isEmpty: function () {
    return !this._latlngs.length || !this._latlngs[0].length;
  },
  getCenter: function () {
    if (this._map) return lf_$e(this._defaultShape(), this._map.options.crs);
    throw new Error("Must add layer to map before using getCenter()");
  },
  _convertLatLngs: function (t) {
    var t = lf_yi.prototype._convertLatLngs.call(this, t),
      e = t.length;
    return (
      2 <= e && t[0] instanceof lf_v && t[0].equals(t[e - 1]) && t.pop(), t
    );
  },
  _setLatLngs: function (t) {
    lf_yi.prototype._setLatLngs.call(this, t),
      lf_I(this._latlngs) && (this._latlngs = [this._latlngs]);
  },
  _defaultShape: function () {
    return (lf_I(this._latlngs[0]) ? this._latlngs : this._latlngs[0])[0];
  },
  _clipPoints: function () {
    var t = this._renderer._bounds,
      e = this.options.weight,
      e = new lf_p(e, e),
      t = new lf_f(t.min.subtract(e), t.max.add(e));
    if (((this._parts = []), this._pxBounds && this._pxBounds.intersects(t)))
      if (this.options.noClip) this._parts = this._rings;
      else
        for (var i, n = 0, o = this._rings.length; n < o; n++)
          (i = lf_Je(this._rings[n], t, !0)).length && this._parts.push(i);
  },
  _updatePath: function () {
    this._renderer._updatePoly(this, !0);
  },
  _containsPoint: function (t) {
    var e,
      i,
      n,
      o,
      s,
      r,
      a,
      h,
      l = !1;
    if (!this._pxBounds || !this._pxBounds.contains(t)) return !1;
    for (o = 0, a = this._parts.length; o < a; o++)
      for (s = 0, r = (h = (e = this._parts[o]).length) - 1; s < h; r = s++)
        (i = e[s]),
          (n = e[r]),
          i.y > t.y != n.y > t.y &&
            t.x < ((n.x - i.x) * (t.y - i.y)) / (n.y - i.y) + i.x &&
            (l = !l);
    return l || lf_yi.prototype._containsPoint.call(this, t, !0);
  },
});
