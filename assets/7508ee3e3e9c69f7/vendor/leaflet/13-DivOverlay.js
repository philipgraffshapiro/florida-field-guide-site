/*! Leaflet 1.9.4; locally maintained modular distribution. See vendor/README.md and license notice. */
"use strict";
var lf_Ai = lf_o.extend({
  options: {
    interactive: !1,
    offset: [0, 0],
    className: "",
    pane: void 0,
    content: "",
  },
  initialize: function (t, e) {
    t && (t instanceof lf_v || lf_d(t))
      ? ((this._latlng = lf_w(t)), lf_c(this, e))
      : (lf_c(this, t), (this._source = e)),
      this.options.content && (this._content = this.options.content);
  },
  openOn: function (t) {
    return (
      (t = arguments.length ? t : this._source._map).hasLayer(this) ||
        t.addLayer(this),
      this
    );
  },
  close: function () {
    return this._map && this._map.removeLayer(this), this;
  },
  toggle: function (t) {
    return (
      this._map
        ? this.close()
        : (arguments.length ? (this._source = t) : (t = this._source),
          this._prepareOpen(),
          this.openOn(t._map)),
      this
    );
  },
  onAdd: function (t) {
    (this._zoomAnimated = t._zoomAnimated),
      this._container || this._initLayout(),
      t._fadeAnimated && lf_C(this._container, 0),
      clearTimeout(this._removeTimeout),
      this.getPane().appendChild(this._container),
      this.update(),
      t._fadeAnimated && lf_C(this._container, 1),
      this.bringToFront(),
      this.options.interactive &&
        (lf_M(this._container, "leaflet-interactive"),
        this.addInteractiveTarget(this._container));
  },
  onRemove: function (t) {
    t._fadeAnimated
      ? (lf_C(this._container, 0),
        (this._removeTimeout = setTimeout(
          lf_a(lf_T, void 0, this._container),
          200,
        )))
      : lf_T(this._container),
      this.options.interactive &&
        (lf_z(this._container, "leaflet-interactive"),
        this.removeInteractiveTarget(this._container));
  },
  getLatLng: function () {
    return this._latlng;
  },
  setLatLng: function (t) {
    return (
      (this._latlng = lf_w(t)),
      this._map && (this._updatePosition(), this._adjustPan()),
      this
    );
  },
  getContent: function () {
    return this._content;
  },
  setContent: function (t) {
    return (this._content = t), this.update(), this;
  },
  getElement: function () {
    return this._container;
  },
  update: function () {
    this._map &&
      ((this._container.style.visibility = "hidden"),
      this._updateContent(),
      this._updateLayout(),
      this._updatePosition(),
      (this._container.style.visibility = ""),
      this._adjustPan());
  },
  getEvents: function () {
    var t = {
      zoom: this._updatePosition,
      viewreset: this._updatePosition,
    };
    return this._zoomAnimated && (t.zoomanim = this._animateZoom), t;
  },
  isOpen: function () {
    return !!this._map && this._map.hasLayer(this);
  },
  bringToFront: function () {
    return this._map && lf_fe(this._container), this;
  },
  bringToBack: function () {
    return this._map && lf_ge(this._container), this;
  },
  _prepareOpen: function (t) {
    if (!(i = this._source)._map) return !1;
    if (i instanceof lf_ci) {
      var e,
        i = null,
        n = this._source._layers;
      for (e in n)
        if (n[e]._map) {
          i = n[e];
          break;
        }
      if (!i) return !1;
      this._source = i;
    }
    if (!t)
      if (i.getCenter) t = i.getCenter();
      else if (i.getLatLng) t = i.getLatLng();
      else {
        if (!i.getBounds) throw new Error("Unable to get source layer LatLng.");
        t = i.getBounds().getCenter();
      }
    return this.setLatLng(t), this._map && this.update(), !0;
  },
  _updateContent: function () {
    if (this._content) {
      var t = this._contentNode,
        e =
          "function" == typeof this._content
            ? this._content(this._source || this)
            : this._content;
      if ("string" == typeof e) t.innerHTML = e;
      else {
        for (; t.hasChildNodes(); ) t.removeChild(t.firstChild);
        t.appendChild(e);
      }
      this.fire("contentupdate");
    }
  },
  _updatePosition: function () {
    var t, e, i;
    this._map &&
      ((e = this._map.latLngToLayerPoint(this._latlng)),
      (t = lf_m(this.options.offset)),
      (i = this._getAnchor()),
      this._zoomAnimated
        ? lf_Z(this._container, e.add(i))
        : (t = t.add(e).add(i)),
      (e = this._containerBottom = -t.y),
      (i = this._containerLeft = -Math.round(this._containerWidth / 2) + t.x),
      (this._container.style.bottom = e + "px"),
      (this._container.style.left = i + "px"));
  },
  _getAnchor: function () {
    return [0, 0];
  },
});
lf_A.include({
  _initOverlay: function (t, e, i, n) {
    var o = e;
    return (
      o instanceof t || (o = new t(n).setContent(e)), i && o.setLatLng(i), o
    );
  },
});
lf_o.include({
  _initOverlay: function (t, e, i, n) {
    var o = i;
    return (
      o instanceof t
        ? (lf_c(o, n), (o._source = this))
        : (o = e && !n ? e : new t(n, this)).setContent(i),
      o
    );
  },
});
var lf_Bi = lf_Ai.extend({
  options: {
    pane: "popupPane",
    offset: [0, 7],
    maxWidth: 300,
    minWidth: 50,
    maxHeight: null,
    autoPan: !0,
    autoPanPaddingTopLeft: null,
    autoPanPaddingBottomRight: null,
    autoPanPadding: [5, 5],
    keepInView: !1,
    closeButton: !0,
    autoClose: !0,
    closeOnEscapeKey: !0,
    className: "",
  },
  openOn: function (t) {
    return (
      !(t = arguments.length ? t : this._source._map).hasLayer(this) &&
        t._popup &&
        t._popup.options.autoClose &&
        t.removeLayer(t._popup),
      (t._popup = this),
      lf_Ai.prototype.openOn.call(this, t)
    );
  },
  onAdd: function (t) {
    lf_Ai.prototype.onAdd.call(this, t),
      t.fire("popupopen", {
        popup: this,
      }),
      this._source &&
        (this._source.fire(
          "popupopen",
          {
            popup: this,
          },
          !0,
        ),
        this._source instanceof lf_fi || this._source.on("preclick", lf_Ae));
  },
  onRemove: function (t) {
    lf_Ai.prototype.onRemove.call(this, t),
      t.fire("popupclose", {
        popup: this,
      }),
      this._source &&
        (this._source.fire(
          "popupclose",
          {
            popup: this,
          },
          !0,
        ),
        this._source instanceof lf_fi || this._source.off("preclick", lf_Ae));
  },
  getEvents: function () {
    var t = lf_Ai.prototype.getEvents.call(this);
    return (
      (void 0 !== this.options.closeOnClick
        ? this.options.closeOnClick
        : this._map.options.closePopupOnClick) && (t.preclick = this.close),
      this.options.keepInView && (t.moveend = this._adjustPan),
      t
    );
  },
  _initLayout: function () {
    var t = "leaflet-popup",
      e = (this._container = lf_P(
        "div",
        t + " " + (this.options.className || "") + " leaflet-zoom-animated",
      )),
      i = (this._wrapper = lf_P("div", t + "-content-wrapper", e));
    (this._contentNode = lf_P("div", t + "-content", i)),
      lf_Ie(e),
      lf_Be(this._contentNode),
      lf_S(e, "contextmenu", lf_Ae),
      (this._tipContainer = lf_P("div", t + "-tip-container", e)),
      (this._tip = lf_P("div", t + "-tip", this._tipContainer)),
      this.options.closeButton &&
        ((i = this._closeButton =
          lf_P("a", t + "-close-button", e)).setAttribute("role", "button"),
        i.setAttribute("aria-label", "Close popup"),
        (i.href = "#close"),
        (i.innerHTML = '<span aria-hidden="true">&#215;</span>'),
        lf_S(
          i,
          "click",
          function (t) {
            lf_O(t), this.close();
          },
          this,
        ));
  },
  _updateLayout: function () {
    var t = this._contentNode,
      e = t.style,
      i = ((e.width = ""), (e.whiteSpace = "nowrap"), t.offsetWidth),
      i = Math.min(i, this.options.maxWidth),
      i =
        ((i = Math.max(i, this.options.minWidth)),
        (e.width = i + 1 + "px"),
        (e.whiteSpace = ""),
        (e.height = ""),
        t.offsetHeight),
      n = this.options.maxHeight,
      o = "leaflet-popup-scrolled";
    (n && n < i ? ((e.height = n + "px"), lf_M) : lf_z)(t, o),
      (this._containerWidth = this._container.offsetWidth);
  },
  _animateZoom: function (t) {
    var t = this._map._latLngToNewLayerPoint(this._latlng, t.zoom, t.center),
      e = this._getAnchor();
    lf_Z(this._container, t.add(e));
  },
  _adjustPan: function () {
    var t, e, i, n, o, s, r, a;
    this.options.autoPan &&
      (this._map._panAnim && this._map._panAnim.stop(),
      this._autopanning
        ? (this._autopanning = !1)
        : ((t = this._map),
          (e = parseInt(lf_pe(this._container, "marginBottom"), 10) || 0),
          (e = this._container.offsetHeight + e),
          (a = this._containerWidth),
          (i = new lf_p(this._containerLeft, -e - this._containerBottom))._add(
            lf_Pe(this._container),
          ),
          (i = t.layerPointToContainerPoint(i)),
          (o = lf_m(this.options.autoPanPadding)),
          (n = lf_m(this.options.autoPanPaddingTopLeft || o)),
          (o = lf_m(this.options.autoPanPaddingBottomRight || o)),
          (s = t.getSize()),
          (r = 0),
          i.x + a + o.x > s.x && (r = i.x + a - s.x + o.x),
          i.x - r - n.x < (a = 0) && (r = i.x - n.x),
          i.y + e + o.y > s.y && (a = i.y + e - s.y + o.y),
          i.y - a - n.y < 0 && (a = i.y - n.y),
          (r || a) &&
            (this.options.keepInView && (this._autopanning = !0),
            t.fire("autopanstart").panBy([r, a]))));
  },
  _getAnchor: function () {
    return lf_m(
      this._source && this._source._getPopupAnchor
        ? this._source._getPopupAnchor()
        : [0, 0],
    );
  },
});
lf_A.mergeOptions({
  closePopupOnClick: !0,
});
lf_A.include({
  openPopup: function (t, e, i) {
    return this._initOverlay(lf_Bi, t, e, i).openOn(this), this;
  },
  closePopup: function (t) {
    return (t = arguments.length ? t : this._popup) && t.close(), this;
  },
});
lf_o.include({
  bindPopup: function (t, e) {
    return (
      (this._popup = this._initOverlay(lf_Bi, this._popup, t, e)),
      this._popupHandlersAdded ||
        (this.on({
          click: this._openPopup,
          keypress: this._onKeyPress,
          remove: this.closePopup,
          move: this._movePopup,
        }),
        (this._popupHandlersAdded = !0)),
      this
    );
  },
  unbindPopup: function () {
    return (
      this._popup &&
        (this.off({
          click: this._openPopup,
          keypress: this._onKeyPress,
          remove: this.closePopup,
          move: this._movePopup,
        }),
        (this._popupHandlersAdded = !1),
        (this._popup = null)),
      this
    );
  },
  openPopup: function (t) {
    return (
      this._popup &&
        (this instanceof lf_ci || (this._popup._source = this),
        this._popup._prepareOpen(t || this._latlng) &&
          this._popup.openOn(this._map)),
      this
    );
  },
  closePopup: function () {
    return this._popup && this._popup.close(), this;
  },
  togglePopup: function () {
    return this._popup && this._popup.toggle(this), this;
  },
  isPopupOpen: function () {
    return !!this._popup && this._popup.isOpen();
  },
  setPopupContent: function (t) {
    return this._popup && this._popup.setContent(t), this;
  },
  getPopup: function () {
    return this._popup;
  },
  _openPopup: function (t) {
    var e;
    this._popup &&
      this._map &&
      (lf_Re(t),
      (e = t.layer || t.target),
      this._popup._source !== e || e instanceof lf_fi
        ? ((this._popup._source = e), this.openPopup(t.latlng))
        : this._map.hasLayer(this._popup)
          ? this.closePopup()
          : this.openPopup(t.latlng));
  },
  _movePopup: function (t) {
    this._popup.setLatLng(t.latlng);
  },
  _onKeyPress: function (t) {
    13 === t.originalEvent.keyCode && this._openPopup(t);
  },
});
