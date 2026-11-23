/*! Leaflet 1.9.4; locally maintained modular distribution. See vendor/README.md and license notice. */
"use strict";
var lf_Map_options = {
  options: {
    crs: lf_lt,
    center: void 0,
    zoom: void 0,
    minZoom: void 0,
    maxZoom: void 0,
    layers: [],
    maxBounds: void 0,
    renderer: void 0,
    zoomAnimation: !0,
    zoomAnimationThreshold: 4,
    fadeAnimation: !0,
    markerZoomAnimation: !0,
    transform3DLimit: 8388608,
    zoomSnap: 1,
    zoomDelta: 1,
    trackResize: !0,
  },
  initialize: function (t, e) {
    (e = lf_c(this, e)),
      (this._handlers = []),
      (this._layers = {}),
      (this._zoomBoundLayers = {}),
      (this._sizeChanged = !0),
      this._initContainer(t),
      this._initLayout(),
      (this._onResize = lf_a(this._onResize, this)),
      this._initEvents(),
      e.maxBounds && this.setMaxBounds(e.maxBounds),
      void 0 !== e.zoom && (this._zoom = this._limitZoom(e.zoom)),
      e.center &&
        void 0 !== e.zoom &&
        this.setView(lf_w(e.center), e.zoom, {
          reset: !0,
        }),
      this.callInitHooks(),
      (this._zoomAnimated =
        lf_ce && lf_b.any3d && !lf_b.mobileOpera && this.options.zoomAnimation),
      this._zoomAnimated &&
        (this._createAnimProxy(),
        lf_S(this._proxy, lf_de, this._catchTransitionEnd, this)),
      this._addLayers(this.options.layers);
  },
  setView: function (t, e, i) {
    if (
      ((e = void 0 === e ? this._zoom : this._limitZoom(e)),
      (t = this._limitCenter(lf_w(t), e, this.options.maxBounds)),
      (i = i || {}),
      this._stop(),
      this._loaded && !i.reset && !0 !== i) &&
      (void 0 !== i.animate &&
        ((i.zoom = lf_l(
          {
            animate: i.animate,
          },
          i.zoom,
        )),
        (i.pan = lf_l(
          {
            animate: i.animate,
            duration: i.duration,
          },
          i.pan,
        ))),
      this._zoom !== e
        ? this._tryAnimatedZoom && this._tryAnimatedZoom(t, e, i.zoom)
        : this._tryAnimatedPan(t, i.pan))
    )
      return clearTimeout(this._sizeTimer), this;
    return this._resetView(t, e, i.pan && i.pan.noMoveStart), this;
  },
  setZoom: function (t, e) {
    return this._loaded
      ? this.setView(this.getCenter(), t, {
          zoom: e,
        })
      : ((this._zoom = t), this);
  },
  zoomIn: function (t, e) {
    return (
      (t = t || (lf_b.any3d ? this.options.zoomDelta : 1)),
      this.setZoom(this._zoom + t, e)
    );
  },
  zoomOut: function (t, e) {
    return (
      (t = t || (lf_b.any3d ? this.options.zoomDelta : 1)),
      this.setZoom(this._zoom - t, e)
    );
  },
  setZoomAround: function (t, e, i) {
    var n = this.getZoomScale(e),
      o = this.getSize().divideBy(2),
      t = (t instanceof lf_p ? t : this.latLngToContainerPoint(t))
        .subtract(o)
        .multiplyBy(1 - 1 / n),
      n = this.containerPointToLatLng(o.add(t));
    return this.setView(n, e, {
      zoom: i,
    });
  },
  _getBoundsCenterZoom: function (t, e) {
    (e = e || {}), (t = t.getBounds ? t.getBounds() : lf_g(t));
    var i = lf_m(e.paddingTopLeft || e.padding || [0, 0]),
      n = lf_m(e.paddingBottomRight || e.padding || [0, 0]),
      o = this.getBoundsZoom(t, !1, i.add(n));
    return (o = "number" == typeof e.maxZoom ? Math.min(e.maxZoom, o) : o) ===
      1 / 0
      ? {
          center: t.getCenter(),
          zoom: o,
        }
      : ((e = n.subtract(i).divideBy(2)),
        (n = this.project(t.getSouthWest(), o)),
        (i = this.project(t.getNorthEast(), o)),
        {
          center: this.unproject(n.add(i).divideBy(2).add(e), o),
          zoom: o,
        });
  },
  fitBounds: function (t, e) {
    if ((t = lf_g(t)).isValid())
      return (
        (t = this._getBoundsCenterZoom(t, e)), this.setView(t.center, t.zoom, e)
      );
    throw new Error("Bounds are not valid.");
  },
  fitWorld: function (t) {
    return this.fitBounds(
      [
        [-90, -180],
        [90, 180],
      ],
      t,
    );
  },
  panTo: function (t, e) {
    return this.setView(t, this._zoom, {
      pan: e,
    });
  },
  panBy: function (t, e) {
    var i;
    return (
      (e = e || {}),
      (t = lf_m(t).round()).x || t.y
        ? (!0 === e.animate || this.getSize().contains(t)
            ? (this._panAnim ||
                ((this._panAnim = new lf_Fe()),
                this._panAnim.on(
                  {
                    step: this._onPanTransitionStep,
                    end: this._onPanTransitionEnd,
                  },
                  this,
                )),
              e.noMoveStart || this.fire("movestart"),
              !1 !== e.animate
                ? (lf_M(this._mapPane, "leaflet-pan-anim"),
                  (i = this._getMapPanePos().subtract(t).round()),
                  this._panAnim.run(
                    this._mapPane,
                    i,
                    e.duration || 0.25,
                    e.easeLinearity,
                  ))
                : (this._rawPanBy(t), this.fire("move").fire("moveend")))
            : this._resetView(
                this.unproject(this.project(this.getCenter()).add(t)),
                this.getZoom(),
              ),
          this)
        : this.fire("moveend")
    );
  },
  flyTo: function (n, o, t) {
    if (!1 === (t = t || {}).animate || !lf_b.any3d)
      return this.setView(n, o, t);
    this._stop();
    var s = this.project(this.getCenter()),
      r = this.project(n),
      e = this.getSize(),
      a = this._zoom,
      h = ((n = lf_w(n)), (o = void 0 === o ? a : o), Math.max(e.x, e.y)),
      i = h * this.getZoomScale(a, o),
      l = r.distanceTo(s) || 1,
      u = 1.42,
      c = u * u;
    function d(t) {
      (t =
        (i * i - h * h + (t ? -1 : 1) * c * c * l * l) /
        (2 * (t ? i : h) * c * l)),
        (t = Math.sqrt(t * t + 1) - t);
      return t < 1e-9 ? -18 : Math.log(t);
    }
    function _(t) {
      return (Math.exp(t) - Math.exp(-t)) / 2;
    }
    function p(t) {
      return (Math.exp(t) + Math.exp(-t)) / 2;
    }
    var m = d(0);
    function f(t) {
      return (h * (p(m) * (_((t = m + u * t)) / p(t)) - _(m))) / c;
    }
    var g = Date.now(),
      v = (d(1) - m) / u,
      y = t.duration ? 1e3 * t.duration : 1e3 * v * 0.8;
    return (
      this._moveStart(!0, t.noMoveStart),
      function t() {
        var e = (Date.now() - g) / y,
          i = (1 - Math.pow(1 - e, 1.5)) * v;
        e <= 1
          ? ((this._flyToFrame = lf_x(t, this)),
            this._move(
              this.unproject(s.add(r.subtract(s).multiplyBy(f(i) / l)), a),
              this.getScaleZoom(h / ((e = i), h * (p(m) / p(m + u * e))), a),
              {
                flyTo: !0,
              },
            ))
          : this._move(n, o)._moveEnd(!0);
      }.call(this),
      this
    );
  },
  flyToBounds: function (t, e) {
    t = this._getBoundsCenterZoom(t, e);
    return this.flyTo(t.center, t.zoom, e);
  },
  setMaxBounds: function (t) {
    return (
      (t = lf_g(t)),
      this.listens("moveend", this._panInsideMaxBounds) &&
        this.off("moveend", this._panInsideMaxBounds),
      t.isValid()
        ? ((this.options.maxBounds = t),
          this._loaded && this._panInsideMaxBounds(),
          this.on("moveend", this._panInsideMaxBounds))
        : ((this.options.maxBounds = null), this)
    );
  },
  setMinZoom: function (t) {
    var e = this.options.minZoom;
    return (
      (this.options.minZoom = t),
      this._loaded &&
      e !== t &&
      (this.fire("zoomlevelschange"), this.getZoom() < this.options.minZoom)
        ? this.setZoom(t)
        : this
    );
  },
  setMaxZoom: function (t) {
    var e = this.options.maxZoom;
    return (
      (this.options.maxZoom = t),
      this._loaded &&
      e !== t &&
      (this.fire("zoomlevelschange"), this.getZoom() > this.options.maxZoom)
        ? this.setZoom(t)
        : this
    );
  },
  panInsideBounds: function (t, e) {
    this._enforcingBounds = !0;
    var i = this.getCenter(),
      t = this._limitCenter(i, this._zoom, lf_g(t));
    return i.equals(t) || this.panTo(t, e), (this._enforcingBounds = !1), this;
  },
  panInside: function (t, e) {
    var i = lf_m((e = e || {}).paddingTopLeft || e.padding || [0, 0]),
      n = lf_m(e.paddingBottomRight || e.padding || [0, 0]),
      o = this.project(this.getCenter()),
      t = this.project(t),
      s = this.getPixelBounds(),
      i = lf__([s.min.add(i), s.max.subtract(n)]),
      s = i.getSize();
    return (
      i.contains(t) ||
        ((this._enforcingBounds = !0),
        (n = t.subtract(i.getCenter())),
        (i = i.extend(t).getSize().subtract(s)),
        (o.x += n.x < 0 ? -i.x : i.x),
        (o.y += n.y < 0 ? -i.y : i.y),
        this.panTo(this.unproject(o), e),
        (this._enforcingBounds = !1)),
      this
    );
  },
  invalidateSize: function (t) {
    if (!this._loaded) return this;
    t = lf_l(
      {
        animate: !1,
        pan: !0,
      },
      !0 === t
        ? {
            animate: !0,
          }
        : t,
    );
    var e = this.getSize(),
      i = ((this._sizeChanged = !0), (this._lastCenter = null), this.getSize()),
      n = e.divideBy(2).round(),
      o = i.divideBy(2).round(),
      n = n.subtract(o);
    return n.x || n.y
      ? (t.animate && t.pan
          ? this.panBy(n)
          : (t.pan && this._rawPanBy(n),
            this.fire("move"),
            t.debounceMoveend
              ? (clearTimeout(this._sizeTimer),
                (this._sizeTimer = setTimeout(
                  lf_a(this.fire, this, "moveend"),
                  200,
                )))
              : this.fire("moveend")),
        this.fire("resize", {
          oldSize: e,
          newSize: i,
        }))
      : this;
  },
};
