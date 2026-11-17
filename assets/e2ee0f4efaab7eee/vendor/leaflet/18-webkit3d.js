/*! Leaflet 1.9.4; locally maintained modular distribution. See vendor/README.md and license notice. */
"use strict";
var lf_zt = {
  _initContainer: function () {
    this._container = lf_P("div", "leaflet-vml-container");
  },
  _update: function () {
    this._map._animatingZoom ||
      (lf_Wi.prototype._update.call(this), this.fire("update"));
  },
  _initPath: function (t) {
    var e = (t._container = lf_Vi("shape"));
    lf_M(e, "leaflet-vml-shape " + (this.options.className || "")),
      (e.coordsize = "1 1"),
      (t._path = lf_Vi("path")),
      e.appendChild(t._path),
      this._updateStyle(t),
      (this._layers[lf_h(t)] = t);
  },
  _addPath: function (t) {
    var e = t._container;
    this._container.appendChild(e),
      t.options.interactive && t.addInteractiveTarget(e);
  },
  _removePath: function (t) {
    var e = t._container;
    lf_T(e), t.removeInteractiveTarget(e), delete this._layers[lf_h(t)];
  },
  _updateStyle: function (t) {
    var e = t._stroke,
      i = t._fill,
      n = t.options,
      o = t._container;
    (o.stroked = !!n.stroke),
      (o.filled = !!n.fill),
      n.stroke
        ? ((e = e || (t._stroke = lf_Vi("stroke"))),
          o.appendChild(e),
          (e.weight = n.weight + "px"),
          (e.color = n.color),
          (e.opacity = n.opacity),
          n.dashArray
            ? (e.dashStyle = lf_d(n.dashArray)
                ? n.dashArray.join(" ")
                : n.dashArray.replace(/( *, *)/g, " "))
            : (e.dashStyle = ""),
          (e.endcap = n.lineCap.replace("butt", "flat")),
          (e.joinstyle = n.lineJoin))
        : e && (o.removeChild(e), (t._stroke = null)),
      n.fill
        ? ((i = i || (t._fill = lf_Vi("fill"))),
          o.appendChild(i),
          (i.color = n.fillColor || n.color),
          (i.opacity = n.fillOpacity))
        : i && (o.removeChild(i), (t._fill = null));
  },
  _updateCircle: function (t) {
    var e = t._point.round(),
      i = Math.round(t._radius),
      n = Math.round(t._radiusY || i);
    this._setPath(
      t,
      t._empty()
        ? "M0 0"
        : "AL " + e.x + "," + e.y + " " + i + "," + n + " 0,23592600",
    );
  },
  _setPath: function (t, e) {
    t._path.v = e;
  },
  _bringToFront: function (t) {
    lf_fe(t._container);
  },
  _bringToBack: function (t) {
    lf_ge(t._container);
  },
};
var lf_qi = lf_b.vml ? lf_Vi : lf_ct;
var lf_Gi = lf_Wi.extend({
  _initContainer: function () {
    (this._container = lf_qi("svg")),
      this._container.setAttribute("pointer-events", "none"),
      (this._rootGroup = lf_qi("g")),
      this._container.appendChild(this._rootGroup);
  },
  _destroyContainer: function () {
    lf_T(this._container),
      lf_k(this._container),
      delete this._container,
      delete this._rootGroup,
      delete this._svgSize;
  },
  _update: function () {
    var t, e, i;
    (this._map._animatingZoom && this._bounds) ||
      (lf_Wi.prototype._update.call(this),
      (e = (t = this._bounds).getSize()),
      (i = this._container),
      (this._svgSize && this._svgSize.equals(e)) ||
        ((this._svgSize = e),
        i.setAttribute("width", e.x),
        i.setAttribute("height", e.y)),
      lf_Z(i, t.min),
      i.setAttribute("viewBox", [t.min.x, t.min.y, e.x, e.y].join(" ")),
      this.fire("update"));
  },
  _initPath: function (t) {
    var e = (t._path = lf_qi("path"));
    t.options.className && lf_M(e, t.options.className),
      t.options.interactive && lf_M(e, "leaflet-interactive"),
      this._updateStyle(t),
      (this._layers[lf_h(t)] = t);
  },
  _addPath: function (t) {
    this._rootGroup || this._initContainer(),
      this._rootGroup.appendChild(t._path),
      t.addInteractiveTarget(t._path);
  },
  _removePath: function (t) {
    lf_T(t._path),
      t.removeInteractiveTarget(t._path),
      delete this._layers[lf_h(t)];
  },
  _updatePath: function (t) {
    t._project(), t._update();
  },
  _updateStyle: function (t) {
    var e = t._path,
      t = t.options;
    e &&
      (t.stroke
        ? (e.setAttribute("stroke", t.color),
          e.setAttribute("stroke-opacity", t.opacity),
          e.setAttribute("stroke-width", t.weight),
          e.setAttribute("stroke-linecap", t.lineCap),
          e.setAttribute("stroke-linejoin", t.lineJoin),
          t.dashArray
            ? e.setAttribute("stroke-dasharray", t.dashArray)
            : e.removeAttribute("stroke-dasharray"),
          t.dashOffset
            ? e.setAttribute("stroke-dashoffset", t.dashOffset)
            : e.removeAttribute("stroke-dashoffset"))
        : e.setAttribute("stroke", "none"),
      t.fill
        ? (e.setAttribute("fill", t.fillColor || t.color),
          e.setAttribute("fill-opacity", t.fillOpacity),
          e.setAttribute("fill-rule", t.fillRule || "evenodd"))
        : e.setAttribute("fill", "none"));
  },
  _updatePoly: function (t, e) {
    this._setPath(t, lf_dt(t._parts, e));
  },
  _updateCircle: function (t) {
    var e = t._point,
      i = Math.max(Math.round(t._radius), 1),
      n =
        "a" + i + "," + (Math.max(Math.round(t._radiusY), 1) || i) + " 0 1,0 ",
      e = t._empty()
        ? "M0 0"
        : "M" + (e.x - i) + "," + e.y + n + 2 * i + ",0 " + n + 2 * -i + ",0 ";
    this._setPath(t, e);
  },
  _setPath: function (t, e) {
    t._path.setAttribute("d", e);
  },
  _bringToFront: function (t) {
    lf_fe(t._path);
  },
  _bringToBack: function (t) {
    lf_ge(t._path);
  },
});
function lf_Ki(t) {
  return lf_b.svg || lf_b.vml ? new lf_Gi(t) : null;
}
lf_b.vml && lf_Gi.include(lf_zt);
lf_A.include({
  getRenderer: function (t) {
    t =
      (t =
        t.options.renderer ||
        this._getPaneRenderer(t.options.pane) ||
        this.options.renderer ||
        this._renderer) || (this._renderer = this._createRenderer());
    return this.hasLayer(t) || this.addLayer(t), t;
  },
  _getPaneRenderer: function (t) {
    var e;
    return (
      "overlayPane" !== t &&
      void 0 !== t &&
      (void 0 === (e = this._paneRenderers[t]) &&
        ((e = this._createRenderer({
          pane: t,
        })),
        (this._paneRenderers[t] = e)),
      e)
    );
  },
  _createRenderer: function (t) {
    return (this.options.preferCanvas && lf_Ui(t)) || lf_Ki(t);
  },
});
var lf_Yi = lf_xi.extend({
  initialize: function (t, e) {
    lf_xi.prototype.initialize.call(this, this._boundsToLatLngs(t), e);
  },
  setBounds: function (t) {
    return this.setLatLngs(this._boundsToLatLngs(t));
  },
  _boundsToLatLngs: function (t) {
    return [
      (t = lf_g(t)).getSouthWest(),
      t.getNorthWest(),
      t.getNorthEast(),
      t.getSouthEast(),
    ];
  },
});
lf_Gi.create = lf_qi;
lf_Gi.pointsToPath = lf_dt;
lf_wi.geometryToLayer = lf_bi;
lf_wi.coordsToLatLng = lf_Li;
lf_wi.coordsToLatLngs = lf_Ti;
lf_wi.latLngToCoords = lf_Mi;
lf_wi.latLngsToCoords = lf_zi;
lf_wi.getFeature = lf_Ci;
lf_wi.asFeature = lf_Zi;
lf_A.mergeOptions({
  boxZoom: !0,
});
var lf__t = lf_n.extend({
  initialize: function (t) {
    (this._map = t),
      (this._container = t._container),
      (this._pane = t._panes.overlayPane),
      (this._resetStateTimeout = 0),
      t.on("unload", this._destroy, this);
  },
  addHooks: function () {
    lf_S(this._container, "mousedown", this._onMouseDown, this);
  },
  removeHooks: function () {
    lf_k(this._container, "mousedown", this._onMouseDown, this);
  },
  moved: function () {
    return this._moved;
  },
  _destroy: function () {
    lf_T(this._pane), delete this._pane;
  },
  _resetState: function () {
    (this._resetStateTimeout = 0), (this._moved = !1);
  },
  _clearDeferredResetState: function () {
    0 !== this._resetStateTimeout &&
      (clearTimeout(this._resetStateTimeout), (this._resetStateTimeout = 0));
  },
  _onMouseDown: function (t) {
    if (!t.shiftKey || (1 !== t.which && 1 !== t.button)) return !1;
    this._clearDeferredResetState(),
      this._resetState(),
      lf_re(),
      lf_Le(),
      (this._startPoint = this._map.mouseEventToContainerPoint(t)),
      lf_S(
        document,
        {
          contextmenu: lf_Re,
          mousemove: this._onMouseMove,
          mouseup: this._onMouseUp,
          keydown: this._onKeyDown,
        },
        this,
      );
  },
  _onMouseMove: function (t) {
    this._moved ||
      ((this._moved = !0),
      (this._box = lf_P("div", "leaflet-zoom-box", this._container)),
      lf_M(this._container, "leaflet-crosshair"),
      this._map.fire("boxzoomstart")),
      (this._point = this._map.mouseEventToContainerPoint(t));
    var t = new lf_f(this._point, this._startPoint),
      e = t.getSize();
    lf_Z(this._box, t.min),
      (this._box.style.width = e.x + "px"),
      (this._box.style.height = e.y + "px");
  },
  _finish: function () {
    this._moved &&
      (lf_T(this._box), lf_z(this._container, "leaflet-crosshair")),
      lf_ae(),
      lf_Te(),
      lf_k(
        document,
        {
          contextmenu: lf_Re,
          mousemove: this._onMouseMove,
          mouseup: this._onMouseUp,
          keydown: this._onKeyDown,
        },
        this,
      );
  },
  _onMouseUp: function (t) {
    (1 !== t.which && 1 !== t.button) ||
      (this._finish(),
      this._moved &&
        (this._clearDeferredResetState(),
        (this._resetStateTimeout = setTimeout(lf_a(this._resetState, this), 0)),
        (t = new lf_s(
          this._map.containerPointToLatLng(this._startPoint),
          this._map.containerPointToLatLng(this._point),
        )),
        this._map.fitBounds(t).fire("boxzoomend", {
          boxZoomBounds: t,
        })));
  },
  _onKeyDown: function (t) {
    27 === t.keyCode &&
      (this._finish(), this._clearDeferredResetState(), this._resetState());
  },
});
lf_A.addInitHook("addHandler", "boxZoom", lf__t);
lf_A.mergeOptions({
  doubleClickZoom: !0,
});
var lf_Ct = lf_n.extend({
  addHooks: function () {
    this._map.on("dblclick", this._onDoubleClick, this);
  },
  removeHooks: function () {
    this._map.off("dblclick", this._onDoubleClick, this);
  },
  _onDoubleClick: function (t) {
    var e = this._map,
      i = e.getZoom(),
      n = e.options.zoomDelta,
      i = t.originalEvent.shiftKey ? i - n : i + n;
    "center" === e.options.doubleClickZoom
      ? e.setZoom(i)
      : e.setZoomAround(t.containerPoint, i);
  },
});
lf_A.addInitHook("addHandler", "doubleClickZoom", lf_Ct);
lf_A.mergeOptions({
  dragging: !0,
  inertia: !0,
  inertiaDeceleration: 3400,
  inertiaMaxSpeed: 1 / 0,
  easeLinearity: 0.2,
  worldCopyJump: !1,
  maxBoundsViscosity: 0,
});
