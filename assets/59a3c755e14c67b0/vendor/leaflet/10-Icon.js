/*! Leaflet 1.9.4; locally maintained modular distribution. See vendor/README.md and license notice. */
"use strict";
var lf_di = lf_et.extend({
  options: {
    popupAnchor: [0, 0],
    tooltipAnchor: [0, 0],
    crossOrigin: !1,
  },
  initialize: function (t) {
    lf_c(this, t);
  },
  createIcon: function (t) {
    return this._createIcon("icon", t);
  },
  createShadow: function (t) {
    return this._createIcon("shadow", t);
  },
  _createIcon: function (t, e) {
    var i = this._getIconUrl(t);
    if (i)
      return (
        (i = this._createImg(i, e && "IMG" === e.tagName ? e : null)),
        this._setIconStyles(i, t),
        (!this.options.crossOrigin && "" !== this.options.crossOrigin) ||
          (i.crossOrigin =
            !0 === this.options.crossOrigin ? "" : this.options.crossOrigin),
        i
      );
    if ("icon" === t)
      throw new Error("iconUrl not set in Icon options (see the docs).");
    return null;
  },
  _setIconStyles: function (t, e) {
    var i = this.options,
      n = i[e + "Size"],
      n = lf_m((n = "number" == typeof n ? [n, n] : n)),
      o = lf_m(
        ("shadow" === e && i.shadowAnchor) ||
          i.iconAnchor ||
          (n && n.divideBy(2, !0)),
      );
    (t.className = "leaflet-marker-" + e + " " + (i.className || "")),
      o &&
        ((t.style.marginLeft = -o.x + "px"), (t.style.marginTop = -o.y + "px")),
      n && ((t.style.width = n.x + "px"), (t.style.height = n.y + "px"));
  },
  _createImg: function (t, e) {
    return ((e = e || document.createElement("img")).src = t), e;
  },
  _getIconUrl: function (t) {
    return (
      (lf_b.retina && this.options[t + "RetinaUrl"]) || this.options[t + "Url"]
    );
  },
});
var lf__i = lf_di.extend({
  options: {
    iconUrl: "marker-icon.png",
    iconRetinaUrl: "marker-icon-2x.png",
    shadowUrl: "marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41],
  },
  _getIconUrl: function (t) {
    return (
      "string" != typeof lf__i.imagePath &&
        (lf__i.imagePath = this._detectIconPath()),
      (this.options.imagePath || lf__i.imagePath) +
        lf_di.prototype._getIconUrl.call(this, t)
    );
  },
  _stripUrl: function (t) {
    function e(t, e, i) {
      return (e = e.exec(t)) && e[i];
    }
    return (
      (t = e(t, /^url\((['"])?(.+)\1\)$/, 2)) &&
      e(t, /^(.*)marker-icon\.png$/, 1)
    );
  },
  _detectIconPath: function () {
    var t = lf_P("div", "leaflet-default-icon-path", document.body),
      e = lf_pe(t, "background-image") || lf_pe(t, "backgroundImage");
    return (
      document.body.removeChild(t),
      (e = this._stripUrl(e))
        ? e
        : (t = document.querySelector('link[href$="leaflet.css"]'))
          ? t.href.substring(0, t.href.length - "leaflet.css".length - 1)
          : ""
    );
  },
});
var lf_pi = lf_n.extend({
  initialize: function (t) {
    this._marker = t;
  },
  addHooks: function () {
    var t = this._marker._icon;
    this._draggable || (this._draggable = new lf_Xe(t, t, !0)),
      this._draggable
        .on(
          {
            dragstart: this._onDragStart,
            predrag: this._onPreDrag,
            drag: this._onDrag,
            dragend: this._onDragEnd,
          },
          this,
        )
        .enable(),
      lf_M(t, "leaflet-marker-draggable");
  },
  removeHooks: function () {
    this._draggable
      .off(
        {
          dragstart: this._onDragStart,
          predrag: this._onPreDrag,
          drag: this._onDrag,
          dragend: this._onDragEnd,
        },
        this,
      )
      .disable(),
      this._marker._icon &&
        lf_z(this._marker._icon, "leaflet-marker-draggable");
  },
  moved: function () {
    return this._draggable && this._draggable._moved;
  },
  _adjustPan: function (t) {
    var e = this._marker,
      i = e._map,
      n = this._marker.options.autoPanSpeed,
      o = this._marker.options.autoPanPadding,
      s = lf_Pe(e._icon),
      r = i.getPixelBounds(),
      a = i.getPixelOrigin(),
      a = lf__(r.min._subtract(a).add(o), r.max._subtract(a).subtract(o));
    a.contains(s) ||
      ((o = lf_m(
        (Math.max(a.max.x, s.x) - a.max.x) / (r.max.x - a.max.x) -
          (Math.min(a.min.x, s.x) - a.min.x) / (r.min.x - a.min.x),
        (Math.max(a.max.y, s.y) - a.max.y) / (r.max.y - a.max.y) -
          (Math.min(a.min.y, s.y) - a.min.y) / (r.min.y - a.min.y),
      ).multiplyBy(n)),
      i.panBy(o, {
        animate: !1,
      }),
      this._draggable._newPos._add(o),
      this._draggable._startPos._add(o),
      lf_Z(e._icon, this._draggable._newPos),
      this._onDrag(t),
      (this._panRequest = lf_x(this._adjustPan.bind(this, t))));
  },
  _onDragStart: function () {
    (this._oldLatLng = this._marker.getLatLng()),
      this._marker.closePopup && this._marker.closePopup(),
      this._marker.fire("movestart").fire("dragstart");
  },
  _onPreDrag: function (t) {
    this._marker.options.autoPan &&
      (lf_r(this._panRequest),
      (this._panRequest = lf_x(this._adjustPan.bind(this, t))));
  },
  _onDrag: function (t) {
    var e = this._marker,
      i = e._shadow,
      n = lf_Pe(e._icon),
      o = e._map.layerPointToLatLng(n);
    i && lf_Z(i, n),
      (e._latlng = o),
      (t.latlng = o),
      (t.oldLatLng = this._oldLatLng),
      e.fire("move", t).fire("drag", t);
  },
  _onDragEnd: function (t) {
    lf_r(this._panRequest),
      delete this._oldLatLng,
      this._marker.fire("moveend").fire("dragend", t);
  },
});
var lf_mi = lf_o.extend({
  options: {
    icon: new lf__i(),
    interactive: !0,
    keyboard: !0,
    title: "",
    alt: "Marker",
    zIndexOffset: 0,
    opacity: 1,
    riseOnHover: !1,
    riseOffset: 250,
    pane: "markerPane",
    shadowPane: "shadowPane",
    bubblingMouseEvents: !1,
    autoPanOnFocus: !0,
    draggable: !1,
    autoPan: !1,
    autoPanPadding: [50, 50],
    autoPanSpeed: 10,
  },
  initialize: function (t, e) {
    lf_c(this, e), (this._latlng = lf_w(t));
  },
  onAdd: function (t) {
    (this._zoomAnimated = this._zoomAnimated && t.options.markerZoomAnimation),
      this._zoomAnimated && t.on("zoomanim", this._animateZoom, this),
      this._initIcon(),
      this.update();
  },
  onRemove: function (t) {
    this.dragging &&
      this.dragging.enabled() &&
      ((this.options.draggable = !0), this.dragging.removeHooks()),
      delete this.dragging,
      this._zoomAnimated && t.off("zoomanim", this._animateZoom, this),
      this._removeIcon(),
      this._removeShadow();
  },
  getEvents: function () {
    return {
      zoom: this.update,
      viewreset: this.update,
    };
  },
  getLatLng: function () {
    return this._latlng;
  },
  setLatLng: function (t) {
    var e = this._latlng;
    return (
      (this._latlng = lf_w(t)),
      this.update(),
      this.fire("move", {
        oldLatLng: e,
        latlng: this._latlng,
      })
    );
  },
  setZIndexOffset: function (t) {
    return (this.options.zIndexOffset = t), this.update();
  },
  getIcon: function () {
    return this.options.icon;
  },
  setIcon: function (t) {
    return (
      (this.options.icon = t),
      this._map && (this._initIcon(), this.update()),
      this._popup && this.bindPopup(this._popup, this._popup.options),
      this
    );
  },
  getElement: function () {
    return this._icon;
  },
  update: function () {
    var t;
    return (
      this._icon &&
        this._map &&
        ((t = this._map.latLngToLayerPoint(this._latlng).round()),
        this._setPos(t)),
      this
    );
  },
  _initIcon: function () {
    var t = this.options,
      e = "leaflet-zoom-" + (this._zoomAnimated ? "animated" : "hide"),
      i = t.icon.createIcon(this._icon),
      n = !1,
      i =
        (i !== this._icon &&
          (this._icon && this._removeIcon(),
          (n = !0),
          t.title && (i.title = t.title),
          "IMG" === i.tagName && (i.alt = t.alt || "")),
        lf_M(i, e),
        t.keyboard && ((i.tabIndex = "0"), i.setAttribute("role", "button")),
        (this._icon = i),
        t.riseOnHover &&
          this.on({
            mouseover: this._bringToFront,
            mouseout: this._resetZIndex,
          }),
        this.options.autoPanOnFocus && lf_S(i, "focus", this._panOnFocus, this),
        t.icon.createShadow(this._shadow)),
      o = !1;
    i !== this._shadow && (this._removeShadow(), (o = !0)),
      i && (lf_M(i, e), (i.alt = "")),
      (this._shadow = i),
      t.opacity < 1 && this._updateOpacity(),
      n && this.getPane().appendChild(this._icon),
      this._initInteraction(),
      i && o && this.getPane(t.shadowPane).appendChild(this._shadow);
  },
  _removeIcon: function () {
    this.options.riseOnHover &&
      this.off({
        mouseover: this._bringToFront,
        mouseout: this._resetZIndex,
      }),
      this.options.autoPanOnFocus &&
        lf_k(this._icon, "focus", this._panOnFocus, this),
      lf_T(this._icon),
      this.removeInteractiveTarget(this._icon),
      (this._icon = null);
  },
  _removeShadow: function () {
    this._shadow && lf_T(this._shadow), (this._shadow = null);
  },
  _setPos: function (t) {
    this._icon && lf_Z(this._icon, t),
      this._shadow && lf_Z(this._shadow, t),
      (this._zIndex = t.y + this.options.zIndexOffset),
      this._resetZIndex();
  },
  _updateZIndex: function (t) {
    this._icon && (this._icon.style.zIndex = this._zIndex + t);
  },
  _animateZoom: function (t) {
    t = this._map
      ._latLngToNewLayerPoint(this._latlng, t.zoom, t.center)
      .round();
    this._setPos(t);
  },
  _initInteraction: function () {
    var t;
    this.options.interactive &&
      (lf_M(this._icon, "leaflet-interactive"),
      this.addInteractiveTarget(this._icon),
      lf_pi &&
        ((t = this.options.draggable),
        this.dragging &&
          ((t = this.dragging.enabled()), this.dragging.disable()),
        (this.dragging = new lf_pi(this)),
        t && this.dragging.enable()));
  },
  setOpacity: function (t) {
    return (this.options.opacity = t), this._map && this._updateOpacity(), this;
  },
  _updateOpacity: function () {
    var t = this.options.opacity;
    this._icon && lf_C(this._icon, t), this._shadow && lf_C(this._shadow, t);
  },
  _bringToFront: function () {
    this._updateZIndex(this.options.riseOffset);
  },
  _resetZIndex: function () {
    this._updateZIndex(0);
  },
  _panOnFocus: function () {
    var t,
      e,
      i = this._map;
    i &&
      ((t = (e = this.options.icon.options).iconSize
        ? lf_m(e.iconSize)
        : lf_m(0, 0)),
      (e = e.iconAnchor ? lf_m(e.iconAnchor) : lf_m(0, 0)),
      i.panInside(this._latlng, {
        paddingTopLeft: e,
        paddingBottomRight: t.subtract(e),
      }));
  },
  _getPopupAnchor: function () {
    return this.options.icon.options.popupAnchor;
  },
  _getTooltipAnchor: function () {
    return this.options.icon.options.tooltipAnchor;
  },
});
