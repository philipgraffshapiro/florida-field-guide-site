/*! Leaflet 1.9.4; locally maintained modular distribution. See vendor/README.md and license notice. */
"use strict";
var lf_wi = lf_ci.extend({
  initialize: function (t, e) {
    lf_c(this, e), (this._layers = {}), t && this.addData(t);
  },
  addData: function (t) {
    var e,
      i,
      n,
      o = lf_d(t) ? t : t.features;
    if (o) {
      for (e = 0, i = o.length; e < i; e++)
        ((n = o[e]).geometries || n.geometry || n.features || n.coordinates) &&
          this.addData(n);
      return this;
    }
    var s,
      r = this.options;
    return (!r.filter || r.filter(t)) && (s = lf_bi(t, r))
      ? ((s.feature = lf_Zi(t)),
        (s.defaultOptions = s.options),
        this.resetStyle(s),
        r.onEachFeature && r.onEachFeature(t, s),
        this.addLayer(s))
      : this;
  },
  resetStyle: function (t) {
    return void 0 === t
      ? this.eachLayer(this.resetStyle, this)
      : ((t.options = lf_l({}, t.defaultOptions)),
        this._setLayerStyle(t, this.options.style),
        this);
  },
  setStyle: function (e) {
    return this.eachLayer(function (t) {
      this._setLayerStyle(t, e);
    }, this);
  },
  _setLayerStyle: function (t, e) {
    t.setStyle && ("function" == typeof e && (e = e(t.feature)), t.setStyle(e));
  },
});
function lf_bi(t, e) {
  var i,
    n,
    o,
    s,
    r = "Feature" === t.type ? t.geometry : t,
    a = r ? r.coordinates : null,
    h = [],
    l = e && e.pointToLayer,
    u = (e && e.coordsToLatLng) || lf_Li;
  if (!a && !r) return null;
  switch (r.type) {
    case "Point":
      return lf_Pi(l, t, (i = u(a)), e);
    case "MultiPoint":
      for (o = 0, s = a.length; o < s; o++)
        (i = u(a[o])), h.push(lf_Pi(l, t, i, e));
      return new lf_ci(h);
    case "LineString":
    case "MultiLineString":
      return (
        (n = lf_Ti(a, "LineString" === r.type ? 0 : 1, u)), new lf_yi(n, e)
      );
    case "Polygon":
    case "MultiPolygon":
      return (n = lf_Ti(a, "Polygon" === r.type ? 1 : 2, u)), new lf_xi(n, e);
    case "GeometryCollection":
      for (o = 0, s = r.geometries.length; o < s; o++) {
        var c = lf_bi(
          {
            geometry: r.geometries[o],
            type: "Feature",
            properties: t.properties,
          },
          e,
        );
        c && h.push(c);
      }
      return new lf_ci(h);
    case "FeatureCollection":
      for (o = 0, s = r.features.length; o < s; o++) {
        var d = lf_bi(r.features[o], e);
        d && h.push(d);
      }
      return new lf_ci(h);
    default:
      throw new Error("Invalid GeoJSON object.");
  }
}
function lf_Pi(t, e, i, n) {
  return t ? t(e, i) : new lf_mi(i, n && n.markersInheritOptions && n);
}
function lf_Li(t) {
  return new lf_v(t[1], t[0], t[2]);
}
function lf_Ti(t, e, i) {
  for (var n, o = [], s = 0, r = t.length; s < r; s++)
    (n = e ? lf_Ti(t[s], e - 1, i) : (i || lf_Li)(t[s])), o.push(n);
  return o;
}
function lf_Mi(t, e) {
  return void 0 !== (t = lf_w(t)).alt
    ? [lf_i(t.lng, e), lf_i(t.lat, e), lf_i(t.alt, e)]
    : [lf_i(t.lng, e), lf_i(t.lat, e)];
}
function lf_zi(t, e, i, n) {
  for (var o = [], s = 0, r = t.length; s < r; s++)
    o.push(e ? lf_zi(t[s], lf_I(t[s]) ? 0 : e - 1, i, n) : lf_Mi(t[s], n));
  return !e && i && 0 < o.length && o.push(o[0].slice()), o;
}
function lf_Ci(t, e) {
  return t.feature
    ? lf_l({}, t.feature, {
        geometry: e,
      })
    : lf_Zi(e);
}
function lf_Zi(t) {
  return "Feature" === t.type || "FeatureCollection" === t.type
    ? t
    : {
        type: "Feature",
        properties: {},
        geometry: t,
      };
}
lf_Tt = {
  toGeoJSON: function (t) {
    return lf_Ci(this, {
      type: "Point",
      coordinates: lf_Mi(this.getLatLng(), t),
    });
  },
};
function lf_Si(t, e) {
  return new lf_wi(t, e);
}
lf_mi.include(lf_Tt);
lf_vi.include(lf_Tt);
lf_gi.include(lf_Tt);
lf_yi.include({
  toGeoJSON: function (t) {
    var e = !lf_I(this._latlngs);
    return lf_Ci(this, {
      type: (e ? "Multi" : "") + "LineString",
      coordinates: lf_zi(this._latlngs, e ? 1 : 0, !1, t),
    });
  },
});
lf_xi.include({
  toGeoJSON: function (t) {
    var e = !lf_I(this._latlngs),
      i = e && !lf_I(this._latlngs[0]),
      t = lf_zi(this._latlngs, i ? 2 : e ? 1 : 0, !0, t);
    return lf_Ci(this, {
      type: (i ? "Multi" : "") + "Polygon",
      coordinates: (t = e ? t : [t]),
    });
  },
});
lf_ui.include({
  toMultiPoint: function (e) {
    var i = [];
    return (
      this.eachLayer(function (t) {
        i.push(t.toGeoJSON(e).geometry.coordinates);
      }),
      lf_Ci(this, {
        type: "MultiPoint",
        coordinates: i,
      })
    );
  },
  toGeoJSON: function (e) {
    var i,
      n,
      t = this.feature && this.feature.geometry && this.feature.geometry.type;
    return "MultiPoint" === t
      ? this.toMultiPoint(e)
      : ((i = "GeometryCollection" === t),
        (n = []),
        this.eachLayer(function (t) {
          t.toGeoJSON &&
            ((t = t.toGeoJSON(e)),
            i
              ? n.push(t.geometry)
              : "FeatureCollection" === (t = lf_Zi(t)).type
                ? n.push.apply(n, t.features)
                : n.push(t));
        }),
        i
          ? lf_Ci(this, {
              geometries: n,
              type: "GeometryCollection",
            })
          : {
              type: "FeatureCollection",
              features: n,
            });
  },
});
var lf_Mt = lf_Si;
var lf_Ei = lf_o.extend({
  options: {
    opacity: 1,
    alt: "",
    interactive: !1,
    crossOrigin: !1,
    errorOverlayUrl: "",
    zIndex: 1,
    className: "",
  },
  initialize: function (t, e, i) {
    (this._url = t), (this._bounds = lf_g(e)), lf_c(this, i);
  },
  onAdd: function () {
    this._image ||
      (this._initImage(), this.options.opacity < 1 && this._updateOpacity()),
      this.options.interactive &&
        (lf_M(this._image, "leaflet-interactive"),
        this.addInteractiveTarget(this._image)),
      this.getPane().appendChild(this._image),
      this._reset();
  },
  onRemove: function () {
    lf_T(this._image),
      this.options.interactive && this.removeInteractiveTarget(this._image);
  },
  setOpacity: function (t) {
    return (
      (this.options.opacity = t), this._image && this._updateOpacity(), this
    );
  },
  setStyle: function (t) {
    return t.opacity && this.setOpacity(t.opacity), this;
  },
  bringToFront: function () {
    return this._map && lf_fe(this._image), this;
  },
  bringToBack: function () {
    return this._map && lf_ge(this._image), this;
  },
  setUrl: function (t) {
    return (this._url = t), this._image && (this._image.src = t), this;
  },
  setBounds: function (t) {
    return (this._bounds = lf_g(t)), this._map && this._reset(), this;
  },
  getEvents: function () {
    var t = {
      zoom: this._reset,
      viewreset: this._reset,
    };
    return this._zoomAnimated && (t.zoomanim = this._animateZoom), t;
  },
  setZIndex: function (t) {
    return (this.options.zIndex = t), this._updateZIndex(), this;
  },
  getBounds: function () {
    return this._bounds;
  },
  getElement: function () {
    return this._image;
  },
  _initImage: function () {
    var t = "IMG" === this._url.tagName,
      e = (this._image = t ? this._url : lf_P("img"));
    lf_M(e, "leaflet-image-layer"),
      this._zoomAnimated && lf_M(e, "leaflet-zoom-animated"),
      this.options.className && lf_M(e, this.options.className),
      (e.onselectstart = lf_u),
      (e.onmousemove = lf_u),
      (e.onload = lf_a(this.fire, this, "load")),
      (e.onerror = lf_a(this._overlayOnError, this, "error")),
      (!this.options.crossOrigin && "" !== this.options.crossOrigin) ||
        (e.crossOrigin =
          !0 === this.options.crossOrigin ? "" : this.options.crossOrigin),
      this.options.zIndex && this._updateZIndex(),
      t
        ? (this._url = e.src)
        : ((e.src = this._url), (e.alt = this.options.alt));
  },
  _animateZoom: function (t) {
    var e = this._map.getZoomScale(t.zoom),
      t = this._map._latLngBoundsToNewLayerBounds(
        this._bounds,
        t.zoom,
        t.center,
      ).min;
    lf_be(this._image, t, e);
  },
  _reset: function () {
    var t = this._image,
      e = new lf_f(
        this._map.latLngToLayerPoint(this._bounds.getNorthWest()),
        this._map.latLngToLayerPoint(this._bounds.getSouthEast()),
      ),
      i = e.getSize();
    lf_Z(t, e.min), (t.style.width = i.x + "px"), (t.style.height = i.y + "px");
  },
  _updateOpacity: function () {
    lf_C(this._image, this.options.opacity);
  },
  _updateZIndex: function () {
    this._image &&
      void 0 !== this.options.zIndex &&
      null !== this.options.zIndex &&
      (this._image.style.zIndex = this.options.zIndex);
  },
  _overlayOnError: function () {
    this.fire("error");
    var t = this.options.errorOverlayUrl;
    t && this._url !== t && ((this._url = t), (this._image.src = t));
  },
  getCenter: function () {
    return this._bounds.getCenter();
  },
});
var lf_ki = lf_Ei.extend({
  options: {
    autoplay: !0,
    loop: !0,
    keepAspectRatio: !0,
    muted: !1,
    playsInline: !0,
  },
  _initImage: function () {
    var t = "VIDEO" === this._url.tagName,
      e = (this._image = t ? this._url : lf_P("video"));
    if (
      (lf_M(e, "leaflet-image-layer"),
      this._zoomAnimated && lf_M(e, "leaflet-zoom-animated"),
      this.options.className && lf_M(e, this.options.className),
      (e.onselectstart = lf_u),
      (e.onmousemove = lf_u),
      (e.onloadeddata = lf_a(this.fire, this, "load")),
      t)
    ) {
      for (
        var i = e.getElementsByTagName("source"), n = [], o = 0;
        o < i.length;
        o++
      )
        n.push(i[o].src);
      this._url = 0 < i.length ? n : [e.src];
    } else {
      lf_d(this._url) || (this._url = [this._url]),
        !this.options.keepAspectRatio &&
          Object.prototype.hasOwnProperty.call(e.style, "objectFit") &&
          (e.style.objectFit = "fill"),
        (e.autoplay = !!this.options.autoplay),
        (e.loop = !!this.options.loop),
        (e.muted = !!this.options.muted),
        (e.playsInline = !!this.options.playsInline);
      for (var s = 0; s < this._url.length; s++) {
        var r = lf_P("source");
        (r.src = this._url[s]), e.appendChild(r);
      }
    }
  },
});
var lf_Oi = lf_Ei.extend({
  _initImage: function () {
    var t = (this._image = this._url);
    lf_M(t, "leaflet-image-layer"),
      this._zoomAnimated && lf_M(t, "leaflet-zoom-animated"),
      this.options.className && lf_M(t, this.options.className),
      (t.onselectstart = lf_u),
      (t.onmousemove = lf_u);
  },
});
