/*! Leaflet 1.9.4; locally maintained modular distribution. See vendor/README.md and license notice. */
"use strict";
var lf_Map__moveStart = {
  _moveStart: function (t, e) {
    return t && this.fire("zoomstart"), e || this.fire("movestart"), this;
  },
  _move: function (t, e, i, n) {
    void 0 === e && (e = this._zoom);
    var o = this._zoom !== e;
    return (
      (this._zoom = e),
      (this._lastCenter = t),
      (this._pixelOrigin = this._getNewPixelOrigin(t)),
      n
        ? i && i.pinch && this.fire("zoom", i)
        : ((o || (i && i.pinch)) && this.fire("zoom", i), this.fire("move", i)),
      this
    );
  },
  _moveEnd: function (t) {
    return t && this.fire("zoomend"), this.fire("moveend");
  },
  _stop: function () {
    return lf_r(this._flyToFrame), this._panAnim && this._panAnim.stop(), this;
  },
  _rawPanBy: function (t) {
    lf_Z(this._mapPane, this._getMapPanePos().subtract(t));
  },
  _getZoomSpan: function () {
    return this.getMaxZoom() - this.getMinZoom();
  },
  _panInsideMaxBounds: function () {
    this._enforcingBounds || this.panInsideBounds(this.options.maxBounds);
  },
  _checkIfLoaded: function () {
    if (!this._loaded) throw new Error("Set map center and zoom first.");
  },
  _initEvents: function (t) {
    this._targets = {};
    var e = t ? lf_k : lf_S;
    e(
      (this._targets[lf_h(this._container)] = this)._container,
      "click dblclick mousedown mouseup mouseover mouseout mousemove contextmenu keypress keydown keyup",
      this._handleDOMEvent,
      this,
    ),
      this.options.trackResize && e(window, "resize", this._onResize, this),
      lf_b.any3d &&
        this.options.transform3DLimit &&
        (t ? this.off : this.on).call(this, "moveend", this._onMoveEnd);
  },
  _onResize: function () {
    lf_r(this._resizeRequest),
      (this._resizeRequest = lf_x(function () {
        this.invalidateSize({
          debounceMoveend: !0,
        });
      }, this));
  },
  _onScroll: function () {
    (this._container.scrollTop = 0), (this._container.scrollLeft = 0);
  },
  _onMoveEnd: function () {
    var t = this._getMapPanePos();
    Math.max(Math.abs(t.x), Math.abs(t.y)) >= this.options.transform3DLimit &&
      this._resetView(this.getCenter(), this.getZoom());
  },
  _findEventTargets: function (t, e) {
    for (
      var i,
        n = [],
        o = "mouseout" === e || "mouseover" === e,
        s = t.target || t.srcElement,
        r = !1;
      s;
    ) {
      if (
        (i = this._targets[lf_h(s)]) &&
        ("click" === e || "preclick" === e) &&
        this._draggableMoved(i)
      ) {
        r = !0;
        break;
      }
      if (i && i.listens(e, !0)) {
        if (o && !lf_We(s, t)) break;
        if ((n.push(i), o)) break;
      }
      if (s === this._container) break;
      s = s.parentNode;
    }
    return (n = n.length || r || o || !this.listens(e, !0) ? n : [this]);
  },
  _isClickDisabled: function (t) {
    for (; t && t !== this._container; ) {
      if (t._leaflet_disable_click) return !0;
      t = t.parentNode;
    }
  },
  _handleDOMEvent: function (t) {
    var e,
      i = t.target || t.srcElement;
    !this._loaded ||
      i._leaflet_disable_events ||
      ("click" === t.type && this._isClickDisabled(i)) ||
      ("mousedown" === (e = t.type) && lf_Me(i), this._fireDOMEvent(t, e));
  },
  _mouseEvents: ["click", "dblclick", "mouseover", "mouseout", "contextmenu"],
  _fireDOMEvent: function (t, e, i) {
    "click" === t.type &&
      (((a = lf_l({}, t)).type = "preclick"), this._fireDOMEvent(a, a.type, i));
    var n = this._findEventTargets(t, e);
    if (i) {
      for (var o = [], s = 0; s < i.length; s++)
        i[s].listens(e, !0) && o.push(i[s]);
      n = o.concat(n);
    }
    if (n.length) {
      "contextmenu" === e && lf_O(t);
      var r,
        a = n[0],
        h = {
          originalEvent: t,
        };
      for (
        "keypress" !== t.type &&
          "keydown" !== t.type &&
          "keyup" !== t.type &&
          ((r = a.getLatLng && (!a._radius || a._radius <= 10)),
          (h.containerPoint = r
            ? this.latLngToContainerPoint(a.getLatLng())
            : this.mouseEventToContainerPoint(t)),
          (h.layerPoint = this.containerPointToLayerPoint(h.containerPoint)),
          (h.latlng = r
            ? a.getLatLng()
            : this.layerPointToLatLng(h.layerPoint))),
          s = 0;
        s < n.length;
        s++
      )
        if (
          (n[s].fire(e, h, !0),
          h.originalEvent._stopped ||
            (!1 === n[s].options.bubblingMouseEvents &&
              -1 !== lf_G(this._mouseEvents, e)))
        )
          return;
    }
  },
  _draggableMoved: function (t) {
    return (
      ((t = t.dragging && t.dragging.enabled() ? t : this).dragging &&
        t.dragging.moved()) ||
      (this.boxZoom && this.boxZoom.moved())
    );
  },
  _clearHandlers: function () {
    for (var t = 0, e = this._handlers.length; t < e; t++)
      this._handlers[t].disable();
  },
  whenReady: function (t, e) {
    return (
      this._loaded
        ? t.call(e || this, {
            target: this,
          })
        : this.on("load", t, e),
      this
    );
  },
  _getMapPanePos: function () {
    return lf_Pe(this._mapPane) || new lf_p(0, 0);
  },
  _moved: function () {
    var t = this._getMapPanePos();
    return t && !t.equals([0, 0]);
  },
  _getTopLeftPoint: function (t, e) {
    return (
      t && void 0 !== e ? this._getNewPixelOrigin(t, e) : this.getPixelOrigin()
    ).subtract(this._getMapPanePos());
  },
  _getNewPixelOrigin: function (t, e) {
    var i = this.getSize()._divideBy(2);
    return this.project(t, e)._subtract(i)._add(this._getMapPanePos())._round();
  },
  _latLngToNewLayerPoint: function (t, e, i) {
    i = this._getNewPixelOrigin(i, e);
    return this.project(t, e)._subtract(i);
  },
  _latLngBoundsToNewLayerBounds: function (t, e, i) {
    i = this._getNewPixelOrigin(i, e);
    return lf__([
      this.project(t.getSouthWest(), e)._subtract(i),
      this.project(t.getNorthWest(), e)._subtract(i),
      this.project(t.getSouthEast(), e)._subtract(i),
      this.project(t.getNorthEast(), e)._subtract(i),
    ]);
  },
  _getCenterLayerPoint: function () {
    return this.containerPointToLayerPoint(this.getSize()._divideBy(2));
  },
  _getCenterOffset: function (t) {
    return this.latLngToLayerPoint(t).subtract(this._getCenterLayerPoint());
  },
  _limitCenter: function (t, e, i) {
    var n, o;
    return !i ||
      ((n = this.project(t, e)),
      (o = this.getSize().divideBy(2)),
      (o = new lf_f(n.subtract(o), n.add(o))),
      (o = this._getBoundsOffset(o, i, e)),
      Math.abs(o.x) <= 1 && Math.abs(o.y) <= 1)
      ? t
      : this.unproject(n.add(o), e);
  },
  _limitOffset: function (t, e) {
    var i;
    return e
      ? ((i = new lf_f((i = this.getPixelBounds()).min.add(t), i.max.add(t))),
        t.add(this._getBoundsOffset(i, e)))
      : t;
  },
  _getBoundsOffset: function (t, e, i) {
    (e = lf__(
      this.project(e.getNorthEast(), i),
      this.project(e.getSouthWest(), i),
    )),
      (i = e.min.subtract(t.min)),
      (e = e.max.subtract(t.max));
    return new lf_p(this._rebound(i.x, -e.x), this._rebound(i.y, -e.y));
  },
  _rebound: function (t, e) {
    return 0 < t + e
      ? Math.round(t - e) / 2
      : Math.max(0, Math.ceil(t)) - Math.max(0, Math.floor(e));
  },
  _limitZoom: function (t) {
    var e = this.getMinZoom(),
      i = this.getMaxZoom(),
      n = lf_b.any3d ? this.options.zoomSnap : 1;
    return n && (t = Math.round(t / n) * n), Math.max(e, Math.min(i, t));
  },
  _onPanTransitionStep: function () {
    this.fire("move");
  },
  _onPanTransitionEnd: function () {
    lf_z(this._mapPane, "leaflet-pan-anim"), this.fire("moveend");
  },
  _tryAnimatedPan: function (t, e) {
    t = this._getCenterOffset(t)._trunc();
    return (
      !(!0 !== (e && e.animate) && !this.getSize().contains(t)) &&
      (this.panBy(t, e), !0)
    );
  },
  _createAnimProxy: function () {
    var t = (this._proxy = lf_P("div", "leaflet-proxy leaflet-zoom-animated"));
    this._panes.mapPane.appendChild(t),
      this.on(
        "zoomanim",
        function (t) {
          var e = lf_ue,
            i = this._proxy.style[e];
          lf_be(
            this._proxy,
            this.project(t.center, t.zoom),
            this.getZoomScale(t.zoom, 1),
          ),
            i === this._proxy.style[e] &&
              this._animatingZoom &&
              this._onZoomTransitionEnd();
        },
        this,
      ),
      this.on("load moveend", this._animMoveEnd, this),
      this._on("unload", this._destroyAnimProxy, this);
  },
  _destroyAnimProxy: function () {
    lf_T(this._proxy),
      this.off("load moveend", this._animMoveEnd, this),
      delete this._proxy;
  },
  _animMoveEnd: function () {
    var t = this.getCenter(),
      e = this.getZoom();
    lf_be(this._proxy, this.project(t, e), this.getZoomScale(e, 1));
  },
  _catchTransitionEnd: function (t) {
    this._animatingZoom &&
      0 <= t.propertyName.indexOf("transform") &&
      this._onZoomTransitionEnd();
  },
  _nothingToAnimate: function () {
    return !this._container.getElementsByClassName("leaflet-zoom-animated")
      .length;
  },
  _tryAnimatedZoom: function (t, e, i) {
    if (!this._animatingZoom) {
      if (
        ((i = i || {}),
        !this._zoomAnimated ||
          !1 === i.animate ||
          this._nothingToAnimate() ||
          Math.abs(e - this._zoom) > this.options.zoomAnimationThreshold)
      )
        return !1;
      var n = this.getZoomScale(e),
        n = this._getCenterOffset(t)._divideBy(1 - 1 / n);
      if (!0 !== i.animate && !this.getSize().contains(n)) return !1;
      lf_x(function () {
        this._moveStart(!0, i.noMoveStart || !1)._animateZoom(t, e, !0);
      }, this);
    }
    return !0;
  },
};
var lf_Map__animateZoom = {
  _animateZoom: function (t, e, i, n) {
    this._mapPane &&
      (i &&
        ((this._animatingZoom = !0),
        (this._animateToCenter = t),
        (this._animateToZoom = e),
        lf_M(this._mapPane, "leaflet-zoom-anim")),
      this.fire("zoomanim", {
        center: t,
        zoom: e,
        noUpdate: n,
      }),
      this._tempFireZoomEvent ||
        (this._tempFireZoomEvent = this._zoom !== this._animateToZoom),
      this._move(this._animateToCenter, this._animateToZoom, void 0, !0),
      setTimeout(lf_a(this._onZoomTransitionEnd, this), 250));
  },
  _onZoomTransitionEnd: function () {
    this._animatingZoom &&
      (this._mapPane && lf_z(this._mapPane, "leaflet-zoom-anim"),
      (this._animatingZoom = !1),
      this._move(this._animateToCenter, this._animateToZoom, void 0, !0),
      this._tempFireZoomEvent && this.fire("zoom"),
      delete this._tempFireZoomEvent,
      this.fire("move"),
      this._moveEnd(!0));
  },
};
var lf_A = lf_it.extend(
  Object.assign(
    {},
    lf_Map_options,
    lf_Map_stop,
    lf_Map__moveStart,
    lf_Map__animateZoom,
  ),
);
function lf_Ue(t) {
  return new lf_B(t);
}
var lf_B = lf_et.extend({
  options: {
    position: "topright",
  },
  initialize: function (t) {
    lf_c(this, t);
  },
  getPosition: function () {
    return this.options.position;
  },
  setPosition: function (t) {
    var e = this._map;
    return (
      e && e.removeControl(this),
      (this.options.position = t),
      e && e.addControl(this),
      this
    );
  },
  getContainer: function () {
    return this._container;
  },
  addTo: function (t) {
    this.remove(), (this._map = t);
    var e = (this._container = this.onAdd(t)),
      i = this.getPosition(),
      t = t._controlCorners[i];
    return (
      lf_M(e, "leaflet-control"),
      -1 !== i.indexOf("bottom")
        ? t.insertBefore(e, t.firstChild)
        : t.appendChild(e),
      this._map.on("unload", this.remove, this),
      this
    );
  },
  remove: function () {
    return (
      this._map &&
        (lf_T(this._container),
        this.onRemove && this.onRemove(this._map),
        this._map.off("unload", this.remove, this),
        (this._map = null)),
      this
    );
  },
  _refocusOnMap: function (t) {
    this._map &&
      t &&
      0 < t.screenX &&
      0 < t.screenY &&
      this._map.getContainer().focus();
  },
});
