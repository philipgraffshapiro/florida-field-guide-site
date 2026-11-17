/*! Leaflet 1.9.4; locally maintained modular distribution. See vendor/README.md and license notice. */
"use strict";
var lf_Map_stop = {
  stop: function () {
    return (
      this.setZoom(this._limitZoom(this._zoom)),
      this.options.zoomSnap || this.fire("viewreset"),
      this._stop()
    );
  },
  locate: function (t) {
    var e, i;
    return (
      (t = this._locateOptions =
        lf_l(
          {
            timeout: 1e4,
            watch: !1,
          },
          t,
        )),
      "geolocation" in navigator
        ? ((e = lf_a(this._handleGeolocationResponse, this)),
          (i = lf_a(this._handleGeolocationError, this)),
          t.watch
            ? (this._locationWatchId = navigator.geolocation.watchPosition(
                e,
                i,
                t,
              ))
            : navigator.geolocation.getCurrentPosition(e, i, t))
        : this._handleGeolocationError({
            code: 0,
            message: "Geolocation not supported.",
          }),
      this
    );
  },
  stopLocate: function () {
    return (
      navigator.geolocation &&
        navigator.geolocation.clearWatch &&
        navigator.geolocation.clearWatch(this._locationWatchId),
      this._locateOptions && (this._locateOptions.setView = !1),
      this
    );
  },
  _handleGeolocationError: function (t) {
    var e;
    this._container._leaflet_id &&
      ((e = t.code),
      (t =
        t.message ||
        (1 === e
          ? "permission denied"
          : 2 === e
            ? "position unavailable"
            : "timeout")),
      this._locateOptions.setView && !this._loaded && this.fitWorld(),
      this.fire("locationerror", {
        code: e,
        message: "Geolocation error: " + t + ".",
      }));
  },
  _handleGeolocationResponse: function (t) {
    if (this._container._leaflet_id) {
      var e,
        i,
        n = new lf_v(t.coords.latitude, t.coords.longitude),
        o = n.toBounds(2 * t.coords.accuracy),
        s = this._locateOptions,
        r =
          (s.setView &&
            ((e = this.getBoundsZoom(o)),
            this.setView(n, s.maxZoom ? Math.min(e, s.maxZoom) : e)),
          {
            latlng: n,
            bounds: o,
            timestamp: t.timestamp,
          });
      for (i in t.coords)
        "number" == typeof t.coords[i] && (r[i] = t.coords[i]);
      this.fire("locationfound", r);
    }
  },
  addHandler: function (t, e) {
    return (
      e &&
        ((e = this[t] = new e(this)),
        this._handlers.push(e),
        this.options[t] && e.enable()),
      this
    );
  },
  remove: function () {
    if (
      (this._initEvents(!0),
      this.options.maxBounds && this.off("moveend", this._panInsideMaxBounds),
      this._containerId !== this._container._leaflet_id)
    )
      throw new Error("Map container is being reused by another instance");
    try {
      delete this._container._leaflet_id, delete this._containerId;
    } catch (t) {
      (this._container._leaflet_id = void 0), (this._containerId = void 0);
    }
    for (var t in (void 0 !== this._locationWatchId && this.stopLocate(),
    this._stop(),
    lf_T(this._mapPane),
    this._clearControlPos && this._clearControlPos(),
    this._resizeRequest &&
      (lf_r(this._resizeRequest), (this._resizeRequest = null)),
    this._clearHandlers(),
    this._loaded && this.fire("unload"),
    this._layers))
      this._layers[t].remove();
    for (t in this._panes) lf_T(this._panes[t]);
    return (
      (this._layers = []),
      (this._panes = []),
      delete this._mapPane,
      delete this._renderer,
      this
    );
  },
  createPane: function (t, e) {
    e = lf_P(
      "div",
      "leaflet-pane" + (t ? " leaflet-" + t.replace("Pane", "") + "-pane" : ""),
      e || this._mapPane,
    );
    return t && (this._panes[t] = e), e;
  },
  getCenter: function () {
    return (
      this._checkIfLoaded(),
      this._lastCenter && !this._moved()
        ? this._lastCenter.clone()
        : this.layerPointToLatLng(this._getCenterLayerPoint())
    );
  },
  getZoom: function () {
    return this._zoom;
  },
  getBounds: function () {
    var t = this.getPixelBounds();
    return new lf_s(
      this.unproject(t.getBottomLeft()),
      this.unproject(t.getTopRight()),
    );
  },
  getMinZoom: function () {
    return void 0 === this.options.minZoom
      ? this._layersMinZoom || 0
      : this.options.minZoom;
  },
  getMaxZoom: function () {
    return void 0 === this.options.maxZoom
      ? void 0 === this._layersMaxZoom
        ? 1 / 0
        : this._layersMaxZoom
      : this.options.maxZoom;
  },
  getBoundsZoom: function (t, e, i) {
    (t = lf_g(t)), (i = lf_m(i || [0, 0]));
    var n = this.getZoom() || 0,
      o = this.getMinZoom(),
      s = this.getMaxZoom(),
      r = t.getNorthWest(),
      t = t.getSouthEast(),
      i = this.getSize().subtract(i),
      t = lf__(this.project(t, n), this.project(r, n)).getSize(),
      r = lf_b.any3d ? this.options.zoomSnap : 1,
      a = i.x / t.x,
      i = i.y / t.y,
      t = e ? Math.max(a, i) : Math.min(a, i),
      n = this.getScaleZoom(t, n);
    return (
      r &&
        ((n = Math.round(n / (r / 100)) * (r / 100)),
        (n = e ? Math.ceil(n / r) * r : Math.floor(n / r) * r)),
      Math.max(o, Math.min(s, n))
    );
  },
  getSize: function () {
    return (
      (this._size && !this._sizeChanged) ||
        ((this._size = new lf_p(
          this._container.clientWidth || 0,
          this._container.clientHeight || 0,
        )),
        (this._sizeChanged = !1)),
      this._size.clone()
    );
  },
  getPixelBounds: function (t, e) {
    t = this._getTopLeftPoint(t, e);
    return new lf_f(t, t.add(this.getSize()));
  },
  getPixelOrigin: function () {
    return this._checkIfLoaded(), this._pixelOrigin;
  },
  getPixelWorldBounds: function (t) {
    return this.options.crs.getProjectedBounds(
      void 0 === t ? this.getZoom() : t,
    );
  },
  getPane: function (t) {
    return "string" == typeof t ? this._panes[t] : t;
  },
  getPanes: function () {
    return this._panes;
  },
  getContainer: function () {
    return this._container;
  },
  getZoomScale: function (t, e) {
    var i = this.options.crs;
    return (e = void 0 === e ? this._zoom : e), i.scale(t) / i.scale(e);
  },
  getScaleZoom: function (t, e) {
    var i = this.options.crs,
      t = ((e = void 0 === e ? this._zoom : e), i.zoom(t * i.scale(e)));
    return isNaN(t) ? 1 / 0 : t;
  },
  project: function (t, e) {
    return (
      (e = void 0 === e ? this._zoom : e),
      this.options.crs.latLngToPoint(lf_w(t), e)
    );
  },
  unproject: function (t, e) {
    return (
      (e = void 0 === e ? this._zoom : e),
      this.options.crs.pointToLatLng(lf_m(t), e)
    );
  },
  layerPointToLatLng: function (t) {
    t = lf_m(t).add(this.getPixelOrigin());
    return this.unproject(t);
  },
  latLngToLayerPoint: function (t) {
    return this.project(lf_w(t))._round()._subtract(this.getPixelOrigin());
  },
  wrapLatLng: function (t) {
    return this.options.crs.wrapLatLng(lf_w(t));
  },
  wrapLatLngBounds: function (t) {
    return this.options.crs.wrapLatLngBounds(lf_g(t));
  },
  distance: function (t, e) {
    return this.options.crs.distance(lf_w(t), lf_w(e));
  },
  containerPointToLayerPoint: function (t) {
    return lf_m(t).subtract(this._getMapPanePos());
  },
  layerPointToContainerPoint: function (t) {
    return lf_m(t).add(this._getMapPanePos());
  },
  containerPointToLatLng: function (t) {
    t = this.containerPointToLayerPoint(lf_m(t));
    return this.layerPointToLatLng(t);
  },
  latLngToContainerPoint: function (t) {
    return this.layerPointToContainerPoint(this.latLngToLayerPoint(lf_w(t)));
  },
  mouseEventToContainerPoint: function (t) {
    return lf_De(t, this._container);
  },
  mouseEventToLayerPoint: function (t) {
    return this.containerPointToLayerPoint(this.mouseEventToContainerPoint(t));
  },
  mouseEventToLatLng: function (t) {
    return this.layerPointToLatLng(this.mouseEventToLayerPoint(t));
  },
  _initContainer: function (t) {
    t = this._container = lf__e(t);
    if (!t) throw new Error("Map container not found.");
    if (t._leaflet_id) throw new Error("Map container is already initialized.");
    lf_S(t, "scroll", this._onScroll, this), (this._containerId = lf_h(t));
  },
  _initLayout: function () {
    var t = this._container,
      e =
        ((this._fadeAnimated = this.options.fadeAnimation && lf_b.any3d),
        lf_M(
          t,
          "leaflet-container" +
            (lf_b.touch ? " leaflet-touch" : "") +
            (lf_b.retina ? " leaflet-retina" : "") +
            (lf_b.ielt9 ? " leaflet-oldie" : "") +
            (lf_b.safari ? " leaflet-safari" : "") +
            (this._fadeAnimated ? " leaflet-fade-anim" : ""),
        ),
        lf_pe(t, "position"));
    "absolute" !== e &&
      "relative" !== e &&
      "fixed" !== e &&
      "sticky" !== e &&
      (t.style.position = "relative"),
      this._initPanes(),
      this._initControlPos && this._initControlPos();
  },
  _initPanes: function () {
    var t = (this._panes = {});
    (this._paneRenderers = {}),
      (this._mapPane = this.createPane("mapPane", this._container)),
      lf_Z(this._mapPane, new lf_p(0, 0)),
      this.createPane("tilePane"),
      this.createPane("overlayPane"),
      this.createPane("shadowPane"),
      this.createPane("markerPane"),
      this.createPane("tooltipPane"),
      this.createPane("popupPane"),
      this.options.markerZoomAnimation ||
        (lf_M(t.markerPane, "leaflet-zoom-hide"),
        lf_M(t.shadowPane, "leaflet-zoom-hide"));
  },
  _resetView: function (t, e, i) {
    lf_Z(this._mapPane, new lf_p(0, 0));
    var n = !this._loaded,
      o =
        ((this._loaded = !0),
        (e = this._limitZoom(e)),
        this.fire("viewprereset"),
        this._zoom !== e);
    this._moveStart(o, i)._move(t, e)._moveEnd(o),
      this.fire("viewreset"),
      n && this.fire("load");
  },
};
