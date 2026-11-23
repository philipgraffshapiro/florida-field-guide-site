/*! Leaflet 1.9.4; locally maintained modular distribution. See vendor/README.md and license notice. */
"use strict";
var lf_Wi = lf_o.extend({
  options: {
    padding: 0.1,
  },
  initialize: function (t) {
    lf_c(this, t), lf_h(this), (this._layers = this._layers || {});
  },
  onAdd: function () {
    this._container ||
      (this._initContainer(), lf_M(this._container, "leaflet-zoom-animated")),
      this.getPane().appendChild(this._container),
      this._update(),
      this.on("update", this._updatePaths, this);
  },
  onRemove: function () {
    this.off("update", this._updatePaths, this), this._destroyContainer();
  },
  getEvents: function () {
    var t = {
      viewreset: this._reset,
      zoom: this._onZoom,
      moveend: this._update,
      zoomend: this._onZoomEnd,
    };
    return this._zoomAnimated && (t.zoomanim = this._onAnimZoom), t;
  },
  _onAnimZoom: function (t) {
    this._updateTransform(t.center, t.zoom);
  },
  _onZoom: function () {
    this._updateTransform(this._map.getCenter(), this._map.getZoom());
  },
  _updateTransform: function (t, e) {
    var i = this._map.getZoomScale(e, this._zoom),
      n = this._map.getSize().multiplyBy(0.5 + this.options.padding),
      o = this._map.project(this._center, e),
      n = n.multiplyBy(-i).add(o).subtract(this._map._getNewPixelOrigin(t, e));
    lf_b.any3d ? lf_be(this._container, n, i) : lf_Z(this._container, n);
  },
  _reset: function () {
    for (var t in (this._update(),
    this._updateTransform(this._center, this._zoom),
    this._layers))
      this._layers[t]._reset();
  },
  _onZoomEnd: function () {
    for (var t in this._layers) this._layers[t]._project();
  },
  _updatePaths: function () {
    for (var t in this._layers) this._layers[t]._update();
  },
  _update: function () {
    var t = this.options.padding,
      e = this._map.getSize(),
      i = this._map.containerPointToLayerPoint(e.multiplyBy(-t)).round();
    (this._bounds = new lf_f(i, i.add(e.multiplyBy(1 + 2 * t)).round())),
      (this._center = this._map.getCenter()),
      (this._zoom = this._map.getZoom());
  },
});
var lf_Fi = lf_Wi.extend({
  options: {
    tolerance: 0,
  },
  getEvents: function () {
    var t = lf_Wi.prototype.getEvents.call(this);
    return (t.viewprereset = this._onViewPreReset), t;
  },
  _onViewPreReset: function () {
    this._postponeUpdatePaths = !0;
  },
  onAdd: function () {
    lf_Wi.prototype.onAdd.call(this), this._draw();
  },
  _initContainer: function () {
    var t = (this._container = document.createElement("canvas"));
    lf_S(t, "mousemove", this._onMouseMove, this),
      lf_S(
        t,
        "click dblclick mousedown mouseup contextmenu",
        this._onClick,
        this,
      ),
      lf_S(t, "mouseout", this._handleMouseOut, this),
      (t._leaflet_disable_events = !0),
      (this._ctx = t.getContext("2d"));
  },
  _destroyContainer: function () {
    lf_r(this._redrawRequest),
      delete this._ctx,
      lf_T(this._container),
      lf_k(this._container),
      delete this._container;
  },
  _updatePaths: function () {
    if (!this._postponeUpdatePaths) {
      for (var t in ((this._redrawBounds = null), this._layers))
        this._layers[t]._update();
      this._redraw();
    }
  },
  _update: function () {
    var t, e, i, n;
    (this._map._animatingZoom && this._bounds) ||
      (lf_Wi.prototype._update.call(this),
      (t = this._bounds),
      (e = this._container),
      (i = t.getSize()),
      (n = lf_b.retina ? 2 : 1),
      lf_Z(e, t.min),
      (e.width = n * i.x),
      (e.height = n * i.y),
      (e.style.width = i.x + "px"),
      (e.style.height = i.y + "px"),
      lf_b.retina && this._ctx.scale(2, 2),
      this._ctx.translate(-t.min.x, -t.min.y),
      this.fire("update"));
  },
  _reset: function () {
    lf_Wi.prototype._reset.call(this),
      this._postponeUpdatePaths &&
        ((this._postponeUpdatePaths = !1), this._updatePaths());
  },
  _initPath: function (t) {
    this._updateDashArray(t);
    t = (this._layers[lf_h(t)] = t)._order = {
      layer: t,
      prev: this._drawLast,
      next: null,
    };
    this._drawLast && (this._drawLast.next = t),
      (this._drawLast = t),
      (this._drawFirst = this._drawFirst || this._drawLast);
  },
  _addPath: function (t) {
    this._requestRedraw(t);
  },
  _removePath: function (t) {
    var e = t._order,
      i = e.next,
      e = e.prev;
    i ? (i.prev = e) : (this._drawLast = e),
      e ? (e.next = i) : (this._drawFirst = i),
      delete t._order,
      delete this._layers[lf_h(t)],
      this._requestRedraw(t);
  },
  _updatePath: function (t) {
    this._extendRedrawBounds(t),
      t._project(),
      t._update(),
      this._requestRedraw(t);
  },
  _updateStyle: function (t) {
    this._updateDashArray(t), this._requestRedraw(t);
  },
  _updateDashArray: function (t) {
    if ("string" == typeof t.options.dashArray) {
      for (
        var e, i = t.options.dashArray.split(/[, ]+/), n = [], o = 0;
        o < i.length;
        o++
      ) {
        if (((e = Number(i[o])), isNaN(e))) return;
        n.push(e);
      }
      t.options._dashArray = n;
    } else t.options._dashArray = t.options.dashArray;
  },
  _requestRedraw: function (t) {
    this._map &&
      (this._extendRedrawBounds(t),
      (this._redrawRequest = this._redrawRequest || lf_x(this._redraw, this)));
  },
  _extendRedrawBounds: function (t) {
    var e;
    t._pxBounds &&
      ((e = (t.options.weight || 0) + 1),
      (this._redrawBounds = this._redrawBounds || new lf_f()),
      this._redrawBounds.extend(t._pxBounds.min.subtract([e, e])),
      this._redrawBounds.extend(t._pxBounds.max.add([e, e])));
  },
  _redraw: function () {
    (this._redrawRequest = null),
      this._redrawBounds &&
        (this._redrawBounds.min._floor(), this._redrawBounds.max._ceil()),
      this._clear(),
      this._draw(),
      (this._redrawBounds = null);
  },
  _clear: function () {
    var t,
      e = this._redrawBounds;
    e
      ? ((t = e.getSize()), this._ctx.clearRect(e.min.x, e.min.y, t.x, t.y))
      : (this._ctx.save(),
        this._ctx.setTransform(1, 0, 0, 1, 0, 0),
        this._ctx.clearRect(
          0,
          0,
          this._container.width,
          this._container.height,
        ),
        this._ctx.restore());
  },
  _draw: function () {
    var t,
      e,
      i = this._redrawBounds;
    this._ctx.save(),
      i &&
        ((e = i.getSize()),
        this._ctx.beginPath(),
        this._ctx.rect(i.min.x, i.min.y, e.x, e.y),
        this._ctx.clip()),
      (this._drawing = !0);
    for (var n = this._drawFirst; n; n = n.next)
      (t = n.layer),
        (!i || (t._pxBounds && t._pxBounds.intersects(i))) && t._updatePath();
    (this._drawing = !1), this._ctx.restore();
  },
  _updatePoly: function (t, e) {
    if (this._drawing) {
      var i,
        n,
        o,
        s,
        r = t._parts,
        a = r.length,
        h = this._ctx;
      if (a) {
        for (h.beginPath(), i = 0; i < a; i++) {
          for (n = 0, o = r[i].length; n < o; n++)
            (s = r[i][n]), h[n ? "lineTo" : "moveTo"](s.x, s.y);
          e && h.closePath();
        }
        this._fillStroke(h, t);
      }
    }
  },
  _updateCircle: function (t) {
    var e, i, n, o;
    this._drawing &&
      !t._empty() &&
      ((e = t._point),
      (i = this._ctx),
      (n = Math.max(Math.round(t._radius), 1)),
      1 != (o = (Math.max(Math.round(t._radiusY), 1) || n) / n) &&
        (i.save(), i.scale(1, o)),
      i.beginPath(),
      i.arc(e.x, e.y / o, n, 0, 2 * Math.PI, !1),
      1 != o && i.restore(),
      this._fillStroke(i, t));
  },
  _fillStroke: function (t, e) {
    var i = e.options;
    i.fill &&
      ((t.globalAlpha = i.fillOpacity),
      (t.fillStyle = i.fillColor || i.color),
      t.fill(i.fillRule || "evenodd")),
      i.stroke &&
        0 !== i.weight &&
        (t.setLineDash &&
          t.setLineDash((e.options && e.options._dashArray) || []),
        (t.globalAlpha = i.opacity),
        (t.lineWidth = i.weight),
        (t.strokeStyle = i.color),
        (t.lineCap = i.lineCap),
        (t.lineJoin = i.lineJoin),
        t.stroke());
  },
  _onClick: function (t) {
    for (
      var e, i, n = this._map.mouseEventToLayerPoint(t), o = this._drawFirst;
      o;
      o = o.next
    )
      (e = o.layer).options.interactive &&
        e._containsPoint(n) &&
        ((("click" === t.type || "preclick" === t.type) &&
          this._map._draggableMoved(e)) ||
          (i = e));
    this._fireEvent(!!i && [i], t);
  },
  _onMouseMove: function (t) {
    var e;
    !this._map ||
      this._map.dragging.moving() ||
      this._map._animatingZoom ||
      ((e = this._map.mouseEventToLayerPoint(t)), this._handleMouseHover(t, e));
  },
  _handleMouseOut: function (t) {
    var e = this._hoveredLayer;
    e &&
      (lf_z(this._container, "leaflet-interactive"),
      this._fireEvent([e], t, "mouseout"),
      (this._hoveredLayer = null),
      (this._mouseHoverThrottled = !1));
  },
  _handleMouseHover: function (t, e) {
    if (!this._mouseHoverThrottled) {
      for (var i, n, o = this._drawFirst; o; o = o.next)
        (i = o.layer).options.interactive && i._containsPoint(e) && (n = i);
      n !== this._hoveredLayer &&
        (this._handleMouseOut(t),
        n &&
          (lf_M(this._container, "leaflet-interactive"),
          this._fireEvent([n], t, "mouseover"),
          (this._hoveredLayer = n))),
        this._fireEvent(!!this._hoveredLayer && [this._hoveredLayer], t),
        (this._mouseHoverThrottled = !0),
        setTimeout(
          lf_a(function () {
            this._mouseHoverThrottled = !1;
          }, this),
          32,
        );
    }
  },
  _fireEvent: function (t, e, i) {
    this._map._fireDOMEvent(e, i || e.type, t);
  },
  _bringToFront: function (t) {
    var e,
      i,
      n = t._order;
    n &&
      ((e = n.next),
      (i = n.prev),
      e &&
        ((e.prev = i) ? (i.next = e) : e && (this._drawFirst = e),
        (n.prev = this._drawLast),
        ((this._drawLast.next = n).next = null),
        (this._drawLast = n),
        this._requestRedraw(t)));
  },
  _bringToBack: function (t) {
    var e,
      i,
      n = t._order;
    n &&
      ((e = n.next),
      (i = n.prev) &&
        ((i.next = e) ? (e.prev = i) : i && (this._drawLast = i),
        (n.prev = null),
        (n.next = this._drawFirst),
        (this._drawFirst.prev = n),
        (this._drawFirst = n),
        this._requestRedraw(t)));
  },
});
function lf_Ui(t) {
  return lf_b.canvas ? new lf_Fi(t) : null;
}
function lf_createLegacyVml(t) {
  return document.createElement(
    "<" + t + ' xmlns="urn:schemas-microsoft.com:vml" class="lvml">',
  );
}
var lf_Vi = (function () {
  if (!document.namespaces || typeof document.namespaces.add !== 'function') {
    return lf_createLegacyVml;
  }
  try {
    return (
      document.namespaces.add("lvml", "urn:schemas-microsoft-com:vml"),
      function (t) {
        return document.createElement("<lvml:" + t + ' class="lvml">');
      }
    );
  } catch (error) {
    console.warn('Leaflet VML namespace registration failed; using the inline namespace.', error);
  }
  return lf_createLegacyVml;
})();
