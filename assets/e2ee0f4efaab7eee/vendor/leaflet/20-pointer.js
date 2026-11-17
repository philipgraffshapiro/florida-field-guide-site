/*! Leaflet 1.9.4; locally maintained modular distribution. See vendor/README.md and license notice. */
"use strict";
var lf_Ot = lf_n.extend({
  addHooks: function () {
    lf_M(this._map._container, "leaflet-touch-zoom"),
      lf_S(this._map._container, "touchstart", this._onTouchStart, this);
  },
  removeHooks: function () {
    lf_z(this._map._container, "leaflet-touch-zoom"),
      lf_k(this._map._container, "touchstart", this._onTouchStart, this);
  },
  _onTouchStart: function (t) {
    var e,
      i,
      n = this._map;
    !t.touches ||
      2 !== t.touches.length ||
      n._animatingZoom ||
      this._zooming ||
      ((e = n.mouseEventToContainerPoint(t.touches[0])),
      (i = n.mouseEventToContainerPoint(t.touches[1])),
      (this._centerPoint = n.getSize()._divideBy(2)),
      (this._startLatLng = n.containerPointToLatLng(this._centerPoint)),
      "center" !== n.options.touchZoom &&
        (this._pinchStartLatLng = n.containerPointToLatLng(
          e.add(i)._divideBy(2),
        )),
      (this._startDist = e.distanceTo(i)),
      (this._startZoom = n.getZoom()),
      (this._moved = !1),
      (this._zooming = !0),
      n._stop(),
      lf_S(document, "touchmove", this._onTouchMove, this),
      lf_S(document, "touchend touchcancel", this._onTouchEnd, this),
      lf_O(t));
  },
  _onTouchMove: function (t) {
    if (t.touches && 2 === t.touches.length && this._zooming) {
      var e = this._map,
        i = e.mouseEventToContainerPoint(t.touches[0]),
        n = e.mouseEventToContainerPoint(t.touches[1]),
        o = i.distanceTo(n) / this._startDist;
      if (
        ((this._zoom = e.getScaleZoom(o, this._startZoom)),
        !e.options.bounceAtZoomLimits &&
          ((this._zoom < e.getMinZoom() && o < 1) ||
            (this._zoom > e.getMaxZoom() && 1 < o)) &&
          (this._zoom = e._limitZoom(this._zoom)),
        "center" === e.options.touchZoom)
      ) {
        if (((this._center = this._startLatLng), 1 == o)) return;
      } else {
        i = i._add(n)._divideBy(2)._subtract(this._centerPoint);
        if (1 == o && 0 === i.x && 0 === i.y) return;
        this._center = e.unproject(
          e.project(this._pinchStartLatLng, this._zoom).subtract(i),
          this._zoom,
        );
      }
      this._moved || (e._moveStart(!0, !1), (this._moved = !0)),
        lf_r(this._animRequest);
      n = lf_a(
        e._move,
        e,
        this._center,
        this._zoom,
        {
          pinch: !0,
          round: !1,
        },
        void 0,
      );
      (this._animRequest = lf_x(n, this, !0)), lf_O(t);
    }
  },
  _onTouchEnd: function () {
    this._moved && this._zooming
      ? ((this._zooming = !1),
        lf_r(this._animRequest),
        lf_k(document, "touchmove", this._onTouchMove, this),
        lf_k(document, "touchend touchcancel", this._onTouchEnd, this),
        this._map.options.zoomAnimation
          ? this._map._animateZoom(
              this._center,
              this._map._limitZoom(this._zoom),
              !0,
              this._map.options.zoomSnap,
            )
          : this._map._resetView(
              this._center,
              this._map._limitZoom(this._zoom),
            ))
      : (this._zooming = !1);
  },
});
lf_A.addInitHook("addHandler", "touchZoom", lf_Ot);
lf_A.BoxZoom = lf__t;
lf_A.DoubleClickZoom = lf_Ct;
lf_A.Drag = lf_Zt;
lf_A.Keyboard = lf_St;
lf_A.ScrollWheelZoom = lf_Et;
lf_A.TapHold = lf_kt;
lf_A.TouchZoom = lf_Ot;
lf_t.Bounds = lf_f;
lf_t.Browser = lf_b;
lf_t.CRS = lf_ot;
lf_t.Canvas = lf_Fi;
lf_t.Circle = lf_vi;
lf_t.CircleMarker = lf_gi;
lf_t.Class = lf_et;
lf_t.Control = lf_B;
lf_t.DivIcon = lf_Ri;
lf_t.DivOverlay = lf_Ai;
lf_t.DomEvent = lf_mt;
lf_t.DomUtil = lf_pt;
lf_t.Draggable = lf_Xe;
lf_t.Evented = lf_it;
lf_t.FeatureGroup = lf_ci;
lf_t.GeoJSON = lf_wi;
lf_t.GridLayer = lf_Ni;
lf_t.Handler = lf_n;
lf_t.Icon = lf_di;
lf_t.ImageOverlay = lf_Ei;
lf_t.LatLng = lf_v;
lf_t.LatLngBounds = lf_s;
lf_t.Layer = lf_o;
lf_t.LayerGroup = lf_ui;
lf_t.LineUtil = lf_vt;
lf_t.Map = lf_A;
lf_t.Marker = lf_mi;
lf_t.Mixin = lf_ft;
lf_t.Path = lf_fi;
lf_t.Point = lf_p;
lf_t.PolyUtil = lf_gt;
lf_t.Polygon = lf_xi;
lf_t.Polyline = lf_yi;
lf_t.Popup = lf_Bi;
lf_t.PosAnimation = lf_Fe;
lf_t.Projection = lf_wt;
lf_t.Rectangle = lf_Yi;
lf_t.Renderer = lf_Wi;
lf_t.SVG = lf_Gi;
lf_t.SVGOverlay = lf_Oi;
lf_t.TileLayer = lf_Di;
lf_t.Tooltip = lf_Ii;
lf_t.Transformation = lf_at;
lf_t.Util = lf_tt;
lf_t.VideoOverlay = lf_ki;
lf_t.bind = lf_a;
lf_t.bounds = lf__;
lf_t.canvas = lf_Ui;
lf_t.circle = function (t, e, i) {
  return new lf_vi(t, e, i);
};
lf_t.circleMarker = function (t, e) {
  return new lf_gi(t, e);
};
lf_t.control = lf_Ue;
lf_t.divIcon = function (t) {
  return new lf_Ri(t);
};
lf_t.extend = lf_l;
lf_t.featureGroup = function (t, e) {
  return new lf_ci(t, e);
};
lf_t.geoJSON = lf_Si;
lf_t.geoJson = lf_Mt;
lf_t.gridLayer = function (t) {
  return new lf_Ni(t);
};
lf_t.icon = function (t) {
  return new lf_di(t);
};
lf_t.imageOverlay = function (t, e, i) {
  return new lf_Ei(t, e, i);
};
lf_t.latLng = lf_w;
lf_t.latLngBounds = lf_g;
lf_t.layerGroup = function (t, e) {
  return new lf_ui(t, e);
};
lf_t.map = function (t, e) {
  return new lf_A(t, e);
};
lf_t.marker = function (t, e) {
  return new lf_mi(t, e);
};
lf_t.point = lf_m;
lf_t.polygon = function (t, e) {
  return new lf_xi(t, e);
};
lf_t.polyline = function (t, e) {
  return new lf_yi(t, e);
};
lf_t.popup = function (t, e) {
  return new lf_Bi(t, e);
};
lf_t.rectangle = function (t, e) {
  return new lf_Yi(t, e);
};
lf_t.setOptions = lf_c;
lf_t.stamp = lf_h;
lf_t.svg = lf_Ki;
lf_t.svgOverlay = function (t, e, i) {
  return new lf_Oi(t, e, i);
};
lf_t.tileLayer = lf_ji;
lf_t.tooltip = function (t, e) {
  return new lf_Ii(t, e);
};
lf_t.transformation = lf_ht;
lf_t.version = "1.9.4";
lf_t.videoOverlay = function (t, e, i) {
  return new lf_ki(t, e, i);
};
var lf_Xi = window.L;
lf_t.noConflict = function () {
  return (window.L = lf_Xi), this;
};
window.L = lf_t;
