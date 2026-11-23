/*! Leaflet 1.9.4; locally maintained modular distribution. See vendor/README.md and license notice. */
"use strict";
var lf_GridLayer__update = {
  _update: function (center) {
    var map = this._map;
    if (!map) return;
    var zoom = this._clampZoom(map.getZoom());
    if (center === undefined) center = map.getCenter();
    if (this._tileZoom === undefined) return;
    var bounds = this._pxBoundsToTileRange(this._getTiledPixelBounds(center));
    var tileCenter = bounds.getCenter(), queue = [], margin = this.options.keepBuffer;
    var retained = new lf_f(bounds.getBottomLeft().subtract([margin, -margin]), bounds.getTopRight().add([margin, -margin]));
    if (![bounds.min.x, bounds.min.y, bounds.max.x, bounds.max.y].every(isFinite)) {
      throw new Error('Attempted to load an infinite number of tiles');
    }
    for (var key in this._tiles) {
      var tile = this._tiles[key], coords = tile.coords;
      if (coords.z !== this._tileZoom || !retained.contains(new lf_p(coords.x, coords.y))) tile.current = false;
    }
    if (Math.abs(zoom - this._tileZoom) > 1) {
      this._setView(center, zoom);
      return;
    }
    for (var y = bounds.min.y; y <= bounds.max.y; y++) {
      for (var x = bounds.min.x; x <= bounds.max.x; x++) {
        var point = new lf_p(x, y);
        point.z = this._tileZoom;
        if (!this._isValidTile(point)) continue;
        var existing = this._tiles[this._tileCoordsToKey(point)];
        if (existing) existing.current = true;
        else queue.push(point);
      }
    }
    queue.sort(function (a, b) { return a.distanceTo(tileCenter) - b.distanceTo(tileCenter); });
    if (!queue.length) return;
    if (!this._loading) { this._loading = true; this.fire('loading'); }
    var fragment = document.createDocumentFragment();
    for (var index = 0; index < queue.length; index++) this._addTile(queue[index], fragment);
    this._level.el.appendChild(fragment);
  },
  _isValidTile: function (t) {
    var e = this._map.options.crs;
    if (!e.infinite) {
      var i = this._globalTileRange;
      if (
        (!e.wrapLng && (t.x < i.min.x || t.x > i.max.x)) ||
        (!e.wrapLat && (t.y < i.min.y || t.y > i.max.y))
      )
        return !1;
    }
    return (
      !this.options.bounds ||
      ((e = this._tileCoordsToBounds(t)), lf_g(this.options.bounds).overlaps(e))
    );
  },
  _keyToBounds: function (t) {
    return this._tileCoordsToBounds(this._keyToTileCoords(t));
  },
  _tileCoordsToNwSe: function (t) {
    var e = this._map,
      i = this.getTileSize(),
      n = t.scaleBy(i),
      i = n.add(i);
    return [e.unproject(n, t.z), e.unproject(i, t.z)];
  },
  _tileCoordsToBounds: function (t) {
    (t = this._tileCoordsToNwSe(t)), (t = new lf_s(t[0], t[1]));
    return (t = this.options.noWrap ? t : this._map.wrapLatLngBounds(t));
  },
  _tileCoordsToKey: function (t) {
    return t.x + ":" + t.y + ":" + t.z;
  },
  _keyToTileCoords: function (t) {
    var t = t.split(":"),
      e = new lf_p(+t[0], +t[1]);
    return (e.z = +t[2]), e;
  },
  _removeTile: function (t) {
    var e = this._tiles[t];
    e &&
      (lf_T(e.el),
      delete this._tiles[t],
      this.fire("tileunload", {
        tile: e.el,
        coords: this._keyToTileCoords(t),
      }));
  },
  _initTile: function (t) {
    lf_M(t, "leaflet-tile");
    var e = this.getTileSize();
    (t.style.width = e.x + "px"),
      (t.style.height = e.y + "px"),
      (t.onselectstart = lf_u),
      (t.onmousemove = lf_u),
      lf_b.ielt9 && this.options.opacity < 1 && lf_C(t, this.options.opacity);
  },
  _addTile: function (t, e) {
    var i = this._getTilePos(t),
      n = this._tileCoordsToKey(t),
      o = this.createTile(this._wrapCoords(t), lf_a(this._tileReady, this, t));
    this._initTile(o),
      this.createTile.length < 2 &&
        lf_x(lf_a(this._tileReady, this, t, null, o)),
      lf_Z(o, i),
      (this._tiles[n] = {
        el: o,
        coords: t,
        current: !0,
      }),
      e.appendChild(o),
      this.fire("tileloadstart", {
        tile: o,
        coords: t,
      });
  },
  _tileReady: function (t, e, i) {
    e &&
      this.fire("tileerror", {
        error: e,
        tile: i,
        coords: t,
      });
    var n = this._tileCoordsToKey(t);
    (i = this._tiles[n]) &&
      ((i.loaded = +new Date()),
      this._map._fadeAnimated
        ? (lf_C(i.el, 0),
          lf_r(this._fadeFrame),
          (this._fadeFrame = lf_x(this._updateOpacity, this)))
        : ((i.active = !0), this._pruneTiles()),
      e ||
        (lf_M(i.el, "leaflet-tile-loaded"),
        this.fire("tileload", {
          tile: i.el,
          coords: t,
        })),
      this._noTilesToLoad() &&
        ((this._loading = !1),
        this.fire("load"),
        lf_b.ielt9 || !this._map._fadeAnimated
          ? lf_x(this._pruneTiles, this)
          : setTimeout(lf_a(this._pruneTiles, this), 250)));
  },
  _getTilePos: function (t) {
    return t.scaleBy(this.getTileSize()).subtract(this._level.origin);
  },
  _wrapCoords: function (t) {
    var e = new lf_p(
      this._wrapX ? lf_H(t.x, this._wrapX) : t.x,
      this._wrapY ? lf_H(t.y, this._wrapY) : t.y,
    );
    return (e.z = t.z), e;
  },
  _pxBoundsToTileRange: function (t) {
    var e = this.getTileSize();
    return new lf_f(
      t.min.unscaleBy(e).floor(),
      t.max.unscaleBy(e).ceil().subtract([1, 1]),
    );
  },
  _noTilesToLoad: function () {
    for (var t in this._tiles) if (!this._tiles[t].loaded) return !1;
    return !0;
  },
};
var lf_Ni = lf_o.extend(
  Object.assign({}, lf_GridLayer_options, lf_GridLayer__update),
);
var lf_Di = lf_Ni.extend({
  options: {
    minZoom: 0,
    maxZoom: 18,
    subdomains: "abc",
    errorTileUrl: "",
    zoomOffset: 0,
    tms: !1,
    zoomReverse: !1,
    detectRetina: !1,
    crossOrigin: !1,
    referrerPolicy: !1,
  },
  initialize: function (t, e) {
    (this._url = t),
      (e = lf_c(this, e)).detectRetina && lf_b.retina && 0 < e.maxZoom
        ? ((e.tileSize = Math.floor(e.tileSize / 2)),
          e.zoomReverse
            ? (e.zoomOffset--, (e.minZoom = Math.min(e.maxZoom, e.minZoom + 1)))
            : (e.zoomOffset++,
              (e.maxZoom = Math.max(e.minZoom, e.maxZoom - 1))),
          (e.minZoom = Math.max(0, e.minZoom)))
        : e.zoomReverse
          ? (e.minZoom = Math.min(e.maxZoom, e.minZoom))
          : (e.maxZoom = Math.max(e.minZoom, e.maxZoom)),
      "string" == typeof e.subdomains &&
        (e.subdomains = e.subdomains.split("")),
      this.on("tileunload", this._onTileRemove);
  },
  setUrl: function (t, e) {
    return (
      this._url === t && void 0 === e && (e = !0),
      (this._url = t),
      e || this.redraw(),
      this
    );
  },
  createTile: function (t, e) {
    var i = document.createElement("img");
    return (
      lf_S(i, "load", lf_a(this._tileOnLoad, this, e, i)),
      lf_S(i, "error", lf_a(this._tileOnError, this, e, i)),
      (!this.options.crossOrigin && "" !== this.options.crossOrigin) ||
        (i.crossOrigin =
          !0 === this.options.crossOrigin ? "" : this.options.crossOrigin),
      "string" == typeof this.options.referrerPolicy &&
        (i.referrerPolicy = this.options.referrerPolicy),
      (i.alt = ""),
      (i.src = this.getTileUrl(t)),
      i
    );
  },
  getTileUrl: function (t) {
    var e = {
      r: lf_b.retina ? "@2x" : "",
      s: this._getSubdomain(t),
      x: t.x,
      y: t.y,
      z: this._getZoomForUrl(),
    };
    return (
      this._map &&
        !this._map.options.crs.infinite &&
        ((t = this._globalTileRange.max.y - t.y),
        this.options.tms && (e.y = t),
        (e["-y"] = t)),
      lf_q(this._url, lf_l(e, this.options))
    );
  },
  _tileOnLoad: function (t, e) {
    lf_b.ielt9 ? setTimeout(lf_a(t, this, null, e), 0) : t(null, e);
  },
  _tileOnError: function (t, e, i) {
    var n = this.options.errorTileUrl;
    n && e.getAttribute("src") !== n && (e.src = n), t(i, e);
  },
  _onTileRemove: function (t) {
    t.tile.onload = null;
  },
  _getZoomForUrl: function () {
    var t = this._tileZoom,
      e = this.options.maxZoom;
    return (t = this.options.zoomReverse ? e - t : t) + this.options.zoomOffset;
  },
  _getSubdomain: function (t) {
    t = Math.abs(t.x + t.y) % this.options.subdomains.length;
    return this.options.subdomains[t];
  },
  _abortLoading: function () {
    var t, e, i;
    for (t in this._tiles)
      this._tiles[t].coords.z !== this._tileZoom &&
        (((i = this._tiles[t].el).onload = lf_u),
        (i.onerror = lf_u),
        i.complete ||
          ((i.src = lf_K),
          (e = this._tiles[t].coords),
          lf_T(i),
          delete this._tiles[t],
          this.fire("tileabort", {
            tile: i,
            coords: e,
          })));
  },
  _removeTile: function (t) {
    var e = this._tiles[t];
    if (e)
      return (
        e.el.setAttribute("src", lf_K),
        lf_Ni.prototype._removeTile.call(this, t)
      );
  },
  _tileReady: function (t, e, i) {
    if (this._map && (!i || i.getAttribute("src") !== lf_K))
      return lf_Ni.prototype._tileReady.call(this, t, e, i);
  },
});
function lf_ji(t, e) {
  return new lf_Di(t, e);
}
var lf_Hi = lf_Di.extend({
  defaultWmsParams: {
    service: "WMS",
    request: "GetMap",
    layers: "",
    styles: "",
    format: "image/jpeg",
    transparent: !1,
    version: "1.1.1",
  },
  options: {
    crs: null,
    uppercase: !1,
  },
  initialize: function (t, e) {
    this._url = t;
    var i,
      n = lf_l({}, this.defaultWmsParams);
    for (i in e) i in this.options || (n[i] = e[i]);
    var t = (e = lf_c(this, e)).detectRetina && lf_b.retina ? 2 : 1,
      o = this.getTileSize();
    (n.width = o.x * t), (n.height = o.y * t), (this.wmsParams = n);
  },
  onAdd: function (t) {
    (this._crs = this.options.crs || t.options.crs),
      (this._wmsVersion = parseFloat(this.wmsParams.version));
    var e = 1.3 <= this._wmsVersion ? "crs" : "srs";
    (this.wmsParams[e] = this._crs.code), lf_Di.prototype.onAdd.call(this, t);
  },
  getTileUrl: function (t) {
    var e = this._tileCoordsToNwSe(t),
      i = this._crs,
      i = lf__(i.project(e[0]), i.project(e[1])),
      e = i.min,
      i = i.max,
      e = (
        1.3 <= this._wmsVersion && this._crs === lf_li
          ? [e.y, e.x, i.y, i.x]
          : [e.x, e.y, i.x, i.y]
      ).join(","),
      i = lf_Di.prototype.getTileUrl.call(this, t);
    return (
      i +
      lf_U(this.wmsParams, i, this.options.uppercase) +
      (this.options.uppercase ? "&BBOX=" : "&bbox=") +
      e
    );
  },
  setParams: function (t, e) {
    return lf_l(this.wmsParams, t), e || this.redraw(), this;
  },
});
lf_Di.WMS = lf_Hi;
lf_ji.wms = function (t, e) {
  return new lf_Hi(t, e);
};
