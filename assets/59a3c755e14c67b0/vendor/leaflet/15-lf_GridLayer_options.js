/*! Leaflet 1.9.4; locally maintained modular distribution. See vendor/README.md and license notice. */
"use strict";
var lf_GridLayer_options = {
  options: {
    tileSize: 256,
    opacity: 1,
    updateWhenIdle: lf_b.mobile,
    updateWhenZooming: !0,
    updateInterval: 200,
    zIndex: 1,
    bounds: null,
    minZoom: 0,
    maxZoom: void 0,
    maxNativeZoom: void 0,
    minNativeZoom: void 0,
    noWrap: !1,
    pane: "tilePane",
    className: "",
    keepBuffer: 2,
  },
  initialize: function (t) {
    lf_c(this, t);
  },
  onAdd: function () {
    this._initContainer(),
      (this._levels = {}),
      (this._tiles = {}),
      this._resetView();
  },
  beforeAdd: function (t) {
    t._addZoomLimit(this);
  },
  onRemove: function (t) {
    this._removeAllTiles(),
      lf_T(this._container),
      t._removeZoomLimit(this),
      (this._container = null),
      (this._tileZoom = void 0);
  },
  bringToFront: function () {
    return (
      this._map && (lf_fe(this._container), this._setAutoZIndex(Math.max)), this
    );
  },
  bringToBack: function () {
    return (
      this._map && (lf_ge(this._container), this._setAutoZIndex(Math.min)), this
    );
  },
  getContainer: function () {
    return this._container;
  },
  setOpacity: function (t) {
    return (this.options.opacity = t), this._updateOpacity(), this;
  },
  setZIndex: function (t) {
    return (this.options.zIndex = t), this._updateZIndex(), this;
  },
  isLoading: function () {
    return this._loading;
  },
  redraw: function () {
    var t;
    return (
      this._map &&
        (this._removeAllTiles(),
        (t = this._clampZoom(this._map.getZoom())) !== this._tileZoom &&
          ((this._tileZoom = t), this._updateLevels()),
        this._update()),
      this
    );
  },
  getEvents: function () {
    var t = {
      viewprereset: this._invalidateAll,
      viewreset: this._resetView,
      zoom: this._resetView,
      moveend: this._onMoveEnd,
    };
    return (
      this.options.updateWhenIdle ||
        (this._onMove ||
          (this._onMove = lf_j(
            this._onMoveEnd,
            this.options.updateInterval,
            this,
          )),
        (t.move = this._onMove)),
      this._zoomAnimated && (t.zoomanim = this._animateZoom),
      t
    );
  },
  createTile: function () {
    return document.createElement("div");
  },
  getTileSize: function () {
    var t = this.options.tileSize;
    return t instanceof lf_p ? t : new lf_p(t, t);
  },
  _updateZIndex: function () {
    this._container &&
      void 0 !== this.options.zIndex &&
      null !== this.options.zIndex &&
      (this._container.style.zIndex = this.options.zIndex);
  },
  _setAutoZIndex: function (t) {
    for (
      var e,
        i = this.getPane().children,
        n = -t(-1 / 0, 1 / 0),
        o = 0,
        s = i.length;
      o < s;
      o++
    )
      (e = i[o].style.zIndex), i[o] !== this._container && e && (n = t(n, +e));
    isFinite(n) && ((this.options.zIndex = n + t(-1, 1)), this._updateZIndex());
  },
  _updateOpacity: function () {
    if (this._map && !lf_b.ielt9) {
      lf_C(this._container, this.options.opacity);
      var t,
        e = +new Date(),
        i = !1,
        n = !1;
      for (t in this._tiles) {
        var o,
          s = this._tiles[t];
        s.current &&
          s.loaded &&
          ((o = Math.min(1, (e - s.loaded) / 200)),
          lf_C(s.el, o),
          o < 1
            ? (i = !0)
            : (s.active ? (n = !0) : this._onOpaqueTile(s), (s.active = !0)));
      }
      n && !this._noPrune && this._pruneTiles(),
        i &&
          (lf_r(this._fadeFrame),
          (this._fadeFrame = lf_x(this._updateOpacity, this)));
    }
  },
  _onOpaqueTile: lf_u,
  _initContainer: function () {
    this._container ||
      ((this._container = lf_P(
        "div",
        "leaflet-layer " + (this.options.className || ""),
      )),
      this._updateZIndex(),
      this.options.opacity < 1 && this._updateOpacity(),
      this.getPane().appendChild(this._container));
  },
  _updateLevels: function () {
    var t = this._tileZoom,
      e = this.options.maxZoom;
    if (void 0 !== t) {
      for (var i in this._levels)
        (i = Number(i)),
          this._levels[i].el.children.length || i === t
            ? ((this._levels[i].el.style.zIndex = e - Math.abs(t - i)),
              this._onUpdateLevel(i))
            : (lf_T(this._levels[i].el),
              this._removeTilesAtZoom(i),
              this._onRemoveLevel(i),
              delete this._levels[i]);
      var n = this._levels[t],
        o = this._map;
      return (
        n ||
          (((n = this._levels[t] = {}).el = lf_P(
            "div",
            "leaflet-tile-container leaflet-zoom-animated",
            this._container,
          )),
          (n.el.style.zIndex = e),
          (n.origin = o.project(o.unproject(o.getPixelOrigin()), t).round()),
          (n.zoom = t),
          this._setZoomTransform(n, o.getCenter(), o.getZoom()),
          lf_u(n.el.offsetWidth),
          this._onCreateLevel(n)),
        (this._level = n)
      );
    }
  },
  _onUpdateLevel: lf_u,
  _onRemoveLevel: lf_u,
  _onCreateLevel: lf_u,
  _pruneTiles: function () {
    if (this._map) {
      var t,
        e,
        i,
        n = this._map.getZoom();
      if (n > this.options.maxZoom || n < this.options.minZoom)
        this._removeAllTiles();
      else {
        for (t in this._tiles) (i = this._tiles[t]).retain = i.current;
        for (t in this._tiles)
          (i = this._tiles[t]).current &&
            !i.active &&
            ((e = i.coords),
            this._retainParent(e.x, e.y, e.z, e.z - 5) ||
              this._retainChildren(e.x, e.y, e.z, e.z + 2));
        for (t in this._tiles) this._tiles[t].retain || this._removeTile(t);
      }
    }
  },
  _removeTilesAtZoom: function (t) {
    for (var e in this._tiles)
      this._tiles[e].coords.z === t && this._removeTile(e);
  },
  _removeAllTiles: function () {
    for (var t in this._tiles) this._removeTile(t);
  },
  _invalidateAll: function () {
    for (var t in this._levels)
      lf_T(this._levels[t].el),
        this._onRemoveLevel(Number(t)),
        delete this._levels[t];
    this._removeAllTiles(), (this._tileZoom = void 0);
  },
  _retainParent: function (t, e, i, n) {
    var t = Math.floor(t / 2),
      e = Math.floor(e / 2),
      i = i - 1,
      o = new lf_p(+t, +e),
      o = ((o.z = i), this._tileCoordsToKey(o)),
      o = this._tiles[o];
    return o && o.active
      ? (o.retain = !0)
      : (o && o.loaded && (o.retain = !0),
        n < i && this._retainParent(t, e, i, n));
  },
  _retainChildren: function (t, e, i, n) {
    for (var o = 2 * t; o < 2 * t + 2; o++)
      for (var s = 2 * e; s < 2 * e + 2; s++) {
        var r = new lf_p(o, s),
          r = ((r.z = i + 1), this._tileCoordsToKey(r)),
          r = this._tiles[r];
        r && r.active
          ? (r.retain = !0)
          : (r && r.loaded && (r.retain = !0),
            i + 1 < n && this._retainChildren(o, s, i + 1, n));
      }
  },
  _resetView: function (t) {
    t = t && (t.pinch || t.flyTo);
    this._setView(this._map.getCenter(), this._map.getZoom(), t, t);
  },
  _animateZoom: function (t) {
    this._setView(t.center, t.zoom, !0, t.noUpdate);
  },
  _clampZoom: function (t) {
    var e = this.options;
    return void 0 !== e.minNativeZoom && t < e.minNativeZoom
      ? e.minNativeZoom
      : void 0 !== e.maxNativeZoom && e.maxNativeZoom < t
        ? e.maxNativeZoom
        : t;
  },
  _setView: function (t, e, i, n) {
    var o = Math.round(e),
      o =
        (void 0 !== this.options.maxZoom && o > this.options.maxZoom) ||
        (void 0 !== this.options.minZoom && o < this.options.minZoom)
          ? void 0
          : this._clampZoom(o),
      s = this.options.updateWhenZooming && o !== this._tileZoom;
    (n && !s) ||
      ((this._tileZoom = o),
      this._abortLoading && this._abortLoading(),
      this._updateLevels(),
      this._resetGrid(),
      void 0 !== o && this._update(t),
      i || this._pruneTiles(),
      (this._noPrune = !!i)),
      this._setZoomTransforms(t, e);
  },
  _setZoomTransforms: function (t, e) {
    for (var i in this._levels) this._setZoomTransform(this._levels[i], t, e);
  },
  _setZoomTransform: function (t, e, i) {
    var n = this._map.getZoomScale(i, t.zoom),
      e = t.origin
        .multiplyBy(n)
        .subtract(this._map._getNewPixelOrigin(e, i))
        .round();
    lf_b.any3d ? lf_be(t.el, e, n) : lf_Z(t.el, e);
  },
  _resetGrid: function () {
    var t = this._map,
      e = t.options.crs,
      i = (this._tileSize = this.getTileSize()),
      n = this._tileZoom,
      o = this._map.getPixelWorldBounds(this._tileZoom);
    o && (this._globalTileRange = this._pxBoundsToTileRange(o)),
      (this._wrapX = e.wrapLng &&
        !this.options.noWrap && [
          Math.floor(t.project([0, e.wrapLng[0]], n).x / i.x),
          Math.ceil(t.project([0, e.wrapLng[1]], n).x / i.y),
        ]),
      (this._wrapY = e.wrapLat &&
        !this.options.noWrap && [
          Math.floor(t.project([e.wrapLat[0], 0], n).y / i.x),
          Math.ceil(t.project([e.wrapLat[1], 0], n).y / i.y),
        ]);
  },
  _onMoveEnd: function () {
    this._map && !this._map._animatingZoom && this._update();
  },
  _getTiledPixelBounds: function (t) {
    var e = this._map,
      i = e._animatingZoom
        ? Math.max(e._animateToZoom, e.getZoom())
        : e.getZoom(),
      i = e.getZoomScale(i, this._tileZoom),
      t = e.project(t, this._tileZoom).floor(),
      e = e.getSize().divideBy(2 * i);
    return new lf_f(t.subtract(e), t.add(e));
  },
};
