/*! Leaflet 1.9.4; locally maintained modular distribution. See vendor/README.md and license notice. */
"use strict";
lf_p.prototype = {
  clone: function () {
    return new lf_p(this.x, this.y);
  },
  add: function (t) {
    return this.clone()._add(lf_m(t));
  },
  _add: function (t) {
    return (this.x += t.x), (this.y += t.y), this;
  },
  subtract: function (t) {
    return this.clone()._subtract(lf_m(t));
  },
  _subtract: function (t) {
    return (this.x -= t.x), (this.y -= t.y), this;
  },
  divideBy: function (t) {
    return this.clone()._divideBy(t);
  },
  _divideBy: function (t) {
    return (this.x /= t), (this.y /= t), this;
  },
  multiplyBy: function (t) {
    return this.clone()._multiplyBy(t);
  },
  _multiplyBy: function (t) {
    return (this.x *= t), (this.y *= t), this;
  },
  scaleBy: function (t) {
    return new lf_p(this.x * t.x, this.y * t.y);
  },
  unscaleBy: function (t) {
    return new lf_p(this.x / t.x, this.y / t.y);
  },
  round: function () {
    return this.clone()._round();
  },
  _round: function () {
    return (this.x = Math.round(this.x)), (this.y = Math.round(this.y)), this;
  },
  floor: function () {
    return this.clone()._floor();
  },
  _floor: function () {
    return (this.x = Math.floor(this.x)), (this.y = Math.floor(this.y)), this;
  },
  ceil: function () {
    return this.clone()._ceil();
  },
  _ceil: function () {
    return (this.x = Math.ceil(this.x)), (this.y = Math.ceil(this.y)), this;
  },
  trunc: function () {
    return this.clone()._trunc();
  },
  _trunc: function () {
    return (this.x = lf_nt(this.x)), (this.y = lf_nt(this.y)), this;
  },
  distanceTo: function (t) {
    var e = (t = lf_m(t)).x - this.x,
      t = t.y - this.y;
    return Math.sqrt(e * e + t * t);
  },
  equals: function (t) {
    return (t = lf_m(t)).x === this.x && t.y === this.y;
  },
  contains: function (t) {
    return (
      (t = lf_m(t)),
      Math.abs(t.x) <= Math.abs(this.x) && Math.abs(t.y) <= Math.abs(this.y)
    );
  },
  toString: function () {
    return "Point(" + lf_i(this.x) + ", " + lf_i(this.y) + ")";
  },
};
lf_f.prototype = {
  extend: function (t) {
    var e, i;
    if (t) {
      if (t instanceof lf_p || "number" == typeof t[0] || "x" in t)
        e = i = lf_m(t);
      else if (((e = (t = lf__(t)).min), (i = t.max), !e || !i)) return this;
      this.min || this.max
        ? ((this.min.x = Math.min(e.x, this.min.x)),
          (this.max.x = Math.max(i.x, this.max.x)),
          (this.min.y = Math.min(e.y, this.min.y)),
          (this.max.y = Math.max(i.y, this.max.y)))
        : ((this.min = e.clone()), (this.max = i.clone()));
    }
    return this;
  },
  getCenter: function (t) {
    return lf_m(
      (this.min.x + this.max.x) / 2,
      (this.min.y + this.max.y) / 2,
      t,
    );
  },
  getBottomLeft: function () {
    return lf_m(this.min.x, this.max.y);
  },
  getTopRight: function () {
    return lf_m(this.max.x, this.min.y);
  },
  getTopLeft: function () {
    return this.min;
  },
  getBottomRight: function () {
    return this.max;
  },
  getSize: function () {
    return this.max.subtract(this.min);
  },
  contains: function (t) {
    var e, i;
    return (
      (t = ("number" == typeof t[0] || t instanceof lf_p ? lf_m : lf__)(
        t,
      )) instanceof lf_f
        ? ((e = t.min), (i = t.max))
        : (e = i = t),
      e.x >= this.min.x &&
        i.x <= this.max.x &&
        e.y >= this.min.y &&
        i.y <= this.max.y
    );
  },
  intersects: function (t) {
    t = lf__(t);
    var e = this.min,
      i = this.max,
      n = t.min,
      t = t.max,
      o = t.x >= e.x && n.x <= i.x,
      t = t.y >= e.y && n.y <= i.y;
    return o && t;
  },
  overlaps: function (t) {
    t = lf__(t);
    var e = this.min,
      i = this.max,
      n = t.min,
      t = t.max,
      o = t.x > e.x && n.x < i.x,
      t = t.y > e.y && n.y < i.y;
    return o && t;
  },
  isValid: function () {
    return !(!this.min || !this.max);
  },
  pad: function (t) {
    var e = this.min,
      i = this.max,
      n = Math.abs(e.x - i.x) * t,
      t = Math.abs(e.y - i.y) * t;
    return lf__(lf_m(e.x - n, e.y - t), lf_m(i.x + n, i.y + t));
  },
  equals: function (t) {
    return (
      !!t &&
      ((t = lf__(t)),
      this.min.equals(t.getTopLeft()) && this.max.equals(t.getBottomRight()))
    );
  },
};
lf_s.prototype = {
  extend: function (t) {
    var e,
      i,
      n = this._southWest,
      o = this._northEast;
    if (t instanceof lf_v) i = e = t;
    else {
      if (!(t instanceof lf_s))
        return t ? this.extend(lf_w(t) || lf_g(t)) : this;
      if (((e = t._southWest), (i = t._northEast), !e || !i)) return this;
    }
    return (
      n || o
        ? ((n.lat = Math.min(e.lat, n.lat)),
          (n.lng = Math.min(e.lng, n.lng)),
          (o.lat = Math.max(i.lat, o.lat)),
          (o.lng = Math.max(i.lng, o.lng)))
        : ((this._southWest = new lf_v(e.lat, e.lng)),
          (this._northEast = new lf_v(i.lat, i.lng))),
      this
    );
  },
  pad: function (t) {
    var e = this._southWest,
      i = this._northEast,
      n = Math.abs(e.lat - i.lat) * t,
      t = Math.abs(e.lng - i.lng) * t;
    return new lf_s(
      new lf_v(e.lat - n, e.lng - t),
      new lf_v(i.lat + n, i.lng + t),
    );
  },
  getCenter: function () {
    return new lf_v(
      (this._southWest.lat + this._northEast.lat) / 2,
      (this._southWest.lng + this._northEast.lng) / 2,
    );
  },
  getSouthWest: function () {
    return this._southWest;
  },
  getNorthEast: function () {
    return this._northEast;
  },
  getNorthWest: function () {
    return new lf_v(this.getNorth(), this.getWest());
  },
  getSouthEast: function () {
    return new lf_v(this.getSouth(), this.getEast());
  },
  getWest: function () {
    return this._southWest.lng;
  },
  getSouth: function () {
    return this._southWest.lat;
  },
  getEast: function () {
    return this._northEast.lng;
  },
  getNorth: function () {
    return this._northEast.lat;
  },
  contains: function (t) {
    t = (
      "number" == typeof t[0] || t instanceof lf_v || "lat" in t ? lf_w : lf_g
    )(t);
    var e,
      i,
      n = this._southWest,
      o = this._northEast;
    return (
      t instanceof lf_s
        ? ((e = t.getSouthWest()), (i = t.getNorthEast()))
        : (e = i = t),
      e.lat >= n.lat && i.lat <= o.lat && e.lng >= n.lng && i.lng <= o.lng
    );
  },
  intersects: function (t) {
    t = lf_g(t);
    var e = this._southWest,
      i = this._northEast,
      n = t.getSouthWest(),
      t = t.getNorthEast(),
      o = t.lat >= e.lat && n.lat <= i.lat,
      t = t.lng >= e.lng && n.lng <= i.lng;
    return o && t;
  },
  overlaps: function (t) {
    t = lf_g(t);
    var e = this._southWest,
      i = this._northEast,
      n = t.getSouthWest(),
      t = t.getNorthEast(),
      o = t.lat > e.lat && n.lat < i.lat,
      t = t.lng > e.lng && n.lng < i.lng;
    return o && t;
  },
  toBBoxString: function () {
    return [
      this.getWest(),
      this.getSouth(),
      this.getEast(),
      this.getNorth(),
    ].join(",");
  },
  equals: function (t, e) {
    return (
      !!t &&
      ((t = lf_g(t)),
      this._southWest.equals(t.getSouthWest(), e) &&
        this._northEast.equals(t.getNorthEast(), e))
    );
  },
  isValid: function () {
    return !(!this._southWest || !this._northEast);
  },
};
var lf_ot = {
  latLngToPoint: function (t, e) {
    (t = this.projection.project(t)), (e = this.scale(e));
    return this.transformation._transform(t, e);
  },
  pointToLatLng: function (t, e) {
    (e = this.scale(e)), (t = this.transformation.untransform(t, e));
    return this.projection.unproject(t);
  },
  project: function (t) {
    return this.projection.project(t);
  },
  unproject: function (t) {
    return this.projection.unproject(t);
  },
  scale: function (t) {
    return 256 * Math.pow(2, t);
  },
  zoom: function (t) {
    return Math.log(t / 256) / Math.LN2;
  },
  getProjectedBounds: function (t) {
    var e;
    return this.infinite
      ? null
      : ((e = this.projection.bounds),
        (t = this.scale(t)),
        new lf_f(
          this.transformation.transform(e.min, t),
          this.transformation.transform(e.max, t),
        ));
  },
  infinite: !(lf_v.prototype = {
    equals: function (t, e) {
      return (
        !!t &&
        ((t = lf_w(t)),
        Math.max(Math.abs(this.lat - t.lat), Math.abs(this.lng - t.lng)) <=
          (void 0 === e ? 1e-9 : e))
      );
    },
    toString: function (t) {
      return "LatLng(" + lf_i(this.lat, t) + ", " + lf_i(this.lng, t) + ")";
    },
    distanceTo: function (t) {
      return lf_st.distance(this, lf_w(t));
    },
    wrap: function () {
      return lf_st.wrapLatLng(this);
    },
    toBounds: function (t) {
      var t = (180 * t) / 40075017,
        e = t / Math.cos((Math.PI / 180) * this.lat);
      return lf_g([this.lat - t, this.lng - e], [this.lat + t, this.lng + e]);
    },
    clone: function () {
      return new lf_v(this.lat, this.lng, this.alt);
    },
  }),
  wrapLatLng: function (t) {
    var e = this.wrapLng ? lf_H(t.lng, this.wrapLng, !0) : t.lng;
    return new lf_v(
      this.wrapLat ? lf_H(t.lat, this.wrapLat, !0) : t.lat,
      e,
      t.alt,
    );
  },
  wrapLatLngBounds: function (t) {
    var e = t.getCenter(),
      i = this.wrapLatLng(e),
      n = e.lat - i.lat,
      e = e.lng - i.lng;
    return 0 == n && 0 == e
      ? t
      : ((i = t.getSouthWest()),
        (t = t.getNorthEast()),
        new lf_s(
          new lf_v(i.lat - n, i.lng - e),
          new lf_v(t.lat - n, t.lng - e),
        ));
  },
};
var lf_st = lf_l({}, lf_ot, {
  wrapLng: [-180, 180],
  R: 6371e3,
  distance: function (t, e) {
    var i = Math.PI / 180,
      n = t.lat * i,
      o = e.lat * i,
      s = Math.sin(((e.lat - t.lat) * i) / 2),
      e = Math.sin(((e.lng - t.lng) * i) / 2),
      t = s * s + Math.cos(n) * Math.cos(o) * e * e,
      i = 2 * Math.atan2(Math.sqrt(t), Math.sqrt(1 - t));
    return this.R * i;
  },
});
var lf_rt = 6378137;
var lf_rt = {
  R: lf_rt,
  MAX_LATITUDE: 85.0511287798,
  project: function (t) {
    var e = Math.PI / 180,
      i = this.MAX_LATITUDE,
      i = Math.max(Math.min(i, t.lat), -i),
      i = Math.sin(i * e);
    return new lf_p(
      this.R * t.lng * e,
      (this.R * Math.log((1 + i) / (1 - i))) / 2,
    );
  },
  unproject: function (t) {
    var e = 180 / Math.PI;
    return new lf_v(
      (2 * Math.atan(Math.exp(t.y / this.R)) - Math.PI / 2) * e,
      (t.x * e) / this.R,
    );
  },
  bounds: new lf_f([-(lf_rt = lf_rt * Math.PI), -lf_rt], [lf_rt, lf_rt]),
};
function lf_at(t, e, i, n) {
  lf_d(t)
    ? ((this._a = t[0]), (this._b = t[1]), (this._c = t[2]), (this._d = t[3]))
    : ((this._a = t), (this._b = e), (this._c = i), (this._d = n));
}
function lf_ht(t, e, i, n) {
  return new lf_at(t, e, i, n);
}
